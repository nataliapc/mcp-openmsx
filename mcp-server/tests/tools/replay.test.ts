import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import path from 'path';
import { tclPath, parseReplayStatus } from '../../src/utils.js';

/**
 * Tests for the emu_replay tool handler logic.
 *
 * Mirrors server_tools.ts replay handler: TCL command construction,
 * .omr extension handling, path normalization, and response parsing.
 */

vi.mock('../../src/openmsx.js', () => ({
  openMSXInstance: {
    sendCommand: vi.fn(),
  },
}));

import { openMSXInstance } from '../../src/openmsx.js';
import { registerTools } from '../../src/server_tools.js';
import type { EmuDirectories } from '../../src/server.js';

const mockSendCommand = vi.mocked(openMSXInstance.sendCommand);
const REPLAYS_DIR = '/home/user/.openMSX/share/replays';
const replayDirs = { OPENMSX_REPLAYS_DIR: REPLAYS_DIR } as EmuDirectories;

interface RegisteredToolResponse {
  content: Array<Record<string, unknown>>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

type RegisteredToolHandler = (args: Record<string, unknown>) => Promise<RegisteredToolResponse>;

class ToolRegistry {
  readonly registrations: Array<{ name: string; handler: RegisteredToolHandler }> = [];

  registerTool(name: string, _config: unknown, handler: RegisteredToolHandler): void {
    this.registrations.push({ name, handler });
  }
}

async function findRegisteredHandler(name: string): Promise<RegisteredToolHandler> {
  const registry = new ToolRegistry();
  await registerTools(registry as unknown as McpServer, replayDirs);
  const entry = registry.registrations.find(registration => registration.name === name);
  if (!entry) throw new Error(`Tool "${name}" not registered`);
  return entry.handler;
}

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Reproduce the replay handler's command construction logic.
 * Mirrors server_tools.ts lines 1261-1301.
 */
function buildReplayCommand(
  command: string,
  opts: { seconds?: number; time?: string; frames?: number; filename?: string } = {}
): string | { error: string } {
  let { filename } = opts;
  const { seconds, time, frames } = opts;

  switch (command) {
    case 'start':         return 'reverse start';
    case 'stop':          return 'reverse stop';
    case 'status':        return 'reverse status';
    case 'goBack':        return `reverse goback ${seconds}`;
    case 'absoluteGoto':  return `reverse goto ${time}`;
    case 'truncate':      return 'reverse truncatereplay';
    case 'advanceFrame':  return `advance_frame ${frames}`;
    case 'reverseFrame':  return `reverse_frame ${frames}`;
    case 'saveReplay':
      if (filename) {
        if (!filename.endsWith('.omr')) filename += '.omr';
        filename = tclPath(path.join(REPLAYS_DIR, filename));
      }
      return `reverse savereplay ${filename || ''}`;
    case 'loadReplay':
      if (filename) {
        if (!filename.endsWith('.omr')) filename += '.omr';
        filename = tclPath(path.join(REPLAYS_DIR, filename));
      }
      return `reverse loadreplay ${filename}`;
    default:
      return { error: `Error: Unknown replay command "${command}".` };
  }
}

// ─── TCL command construction ────────────────────────────────────────────────

describe('replay — command construction', () => {
  it('builds start command', () => {
    expect(buildReplayCommand('start')).toBe('reverse start');
  });

  it('builds stop command', () => {
    expect(buildReplayCommand('stop')).toBe('reverse stop');
  });

  it('builds status command', () => {
    expect(buildReplayCommand('status')).toBe('reverse status');
  });

  it('builds goBack with seconds', () => {
    expect(buildReplayCommand('goBack', { seconds: 5 })).toBe('reverse goback 5');
  });

  it('builds absoluteGoto with time', () => {
    expect(buildReplayCommand('absoluteGoto', { time: '10.5' })).toBe('reverse goto 10.5');
  });

  it('builds truncate command', () => {
    expect(buildReplayCommand('truncate')).toBe('reverse truncatereplay');
  });

  it('builds advanceFrame with count', () => {
    expect(buildReplayCommand('advanceFrame', { frames: 3 })).toBe('advance_frame 3');
  });

  it('builds reverseFrame with count', () => {
    expect(buildReplayCommand('reverseFrame', { frames: 1 })).toBe('reverse_frame 1');
  });

  it('returns error for unknown command', () => {
    const result = buildReplayCommand('nonexistent');
    expect(result).toEqual({ error: 'Error: Unknown replay command "nonexistent".' });
  });
});

// ─── .omr extension handling ─────────────────────────────────────────────────

describe('replay — .omr extension', () => {
  it('saveReplay appends .omr when missing', () => {
    const cmd = buildReplayCommand('saveReplay', { filename: 'test' });
    expect(cmd).toContain('test.omr');
  });

  it('saveReplay keeps .omr when already present', () => {
    const cmd = buildReplayCommand('saveReplay', { filename: 'test.omr' });
    expect(cmd).toContain('test.omr');
    expect(cmd).not.toContain('test.omr.omr');
  });

  it('loadReplay appends .omr when missing', () => {
    const cmd = buildReplayCommand('loadReplay', { filename: 'game' });
    expect(cmd).toContain('game.omr');
  });

  it('loadReplay keeps .omr when already present', () => {
    const cmd = buildReplayCommand('loadReplay', { filename: 'game.omr' });
    expect(cmd).toContain('game.omr');
    expect(cmd).not.toContain('game.omr.omr');
  });
});

// ─── Path normalization ──────────────────────────────────────────────────────

describe('replay — path normalization', () => {
  it('saveReplay uses full path with replays directory', () => {
    const cmd = buildReplayCommand('saveReplay', { filename: 'mysave' }) as string;
    expect(cmd).toContain(REPLAYS_DIR.replace(/\\/g, '/'));
    expect(cmd).toContain('mysave.omr');
  });

  it('loadReplay uses full path with replays directory', () => {
    const cmd = buildReplayCommand('loadReplay', { filename: 'mysave' }) as string;
    expect(cmd).toContain(REPLAYS_DIR.replace(/\\/g, '/'));
  });

  it('saveReplay without filename sends empty', () => {
    const cmd = buildReplayCommand('saveReplay', {});
    expect(cmd).toBe('reverse savereplay ');
  });

  it('paths use forward slashes (tclPath)', () => {
    // Simulate Windows-like REPLAYS_DIR
    const winDir = 'C:\\Users\\test\\openMSX\\replays';
    const filename = 'test';
    const normalized = tclPath(path.join(winDir, filename + '.omr'));
    expect(normalized).not.toContain('\\');
    expect(normalized).toContain('/');
  });
});

// ─── Status response parsing ─────────────────────────────────────────────────

describe('replay — status response integration', () => {
  it('parses status response into structured content', async () => {
    const rawStatus = 'status enabled begin 0.0 end 120.5 current 60.2 snapshots {0.0 30.0 60.0 90.0} last_event 0.0';
    mockSendCommand.mockResolvedValue(rawStatus);

    const response = await openMSXInstance.sendCommand('reverse status');
    const status = parseReplayStatus(response);

    expect(status).toEqual({
      enabled: true,
      begin: 0.0,
      end: 120.5,
      current: 60.2,
      snapshotCount: 4,
    });
  });
});

describe('emu_replay — registered handler', () => {
  it('returns structured replay status through the real tool handler', async () => {
    const rawStatus = 'status enabled begin 0.0 end 120.5 current 60.2 snapshots {0.0 30.0 60.0 90.0} last_event 0.0';
    mockSendCommand.mockResolvedValue(rawStatus);

    const response = await (await findRegisteredHandler('emu_replay'))({ command: 'status' });

    expect(mockSendCommand).toHaveBeenCalledWith('reverse status');
    expect(response).toEqual({
      content: [{ type: 'text', text: rawStatus }],
      structuredContent: {
        command: 'status',
        enabled: true,
        beginTime: 0,
        endTime: 120.5,
        currentTime: 60.2,
        snapshotCount: 4,
      },
      isError: false,
    });
  });

  it('adds the extension and replay directory through the real tool handler', async () => {
    mockSendCommand.mockResolvedValue('saved');

    const response = await (await findRegisteredHandler('emu_replay'))({
      command: 'saveReplay',
      filename: 'checkpoint',
    });

    const expectedPath = `${REPLAYS_DIR}/checkpoint.omr`;
    expect(mockSendCommand).toHaveBeenCalledWith(`reverse savereplay ${expectedPath}`);
    expect(response.structuredContent).toEqual({
      command: 'saveReplay',
      filename: expectedPath,
      result: 'saved',
    });
  });

  it('returns replay command errors through the real tool handler', async () => {
    mockSendCommand.mockResolvedValue('Error: replay is disabled');

    const response = await (await findRegisteredHandler('emu_replay'))({ command: 'start' });

    expect(response).toEqual({
      content: [{ type: 'text', text: 'Error: replay is disabled' }],
      isError: true,
    });
  });
});
