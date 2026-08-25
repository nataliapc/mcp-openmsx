import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { encodeTypeText, buildKeyComboCommand, getResponseContent } from '../../src/utils.js';

/**
 * Tests for the emu_keyboard tool handler logic.
 *
 * Mirrors server_tools.ts keyboard handler: command construction for
 * sendText (type_via_keyboard encoding) and sendKeyCombo (matrix commands).
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
const dummyDirs = {} as EmuDirectories;

interface RegisteredToolResponse {
  content: Array<Record<string, unknown>>;
  isError?: boolean;
}

type RegisteredToolHandler = (args: Record<string, unknown>) => Promise<RegisteredToolResponse>;

class ToolRegistry {
  readonly registrations: Array<{ name: string; handler: RegisteredToolHandler }> = [];

  registerTool(name: string, _config: unknown, handler: RegisteredToolHandler): void {
    this.registrations.push({ name, handler });
  }
}

async function findRegisteredHandler(): Promise<RegisteredToolHandler> {
  const registry = new ToolRegistry();
  await registerTools(registry as unknown as McpServer, dummyDirs);
  const entry = registry.registrations.find(registration => registration.name === 'emu_keyboard');
  if (!entry) throw new Error('Tool "emu_keyboard" not registered');
  return entry.handler;
}

beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * Reproduce the keyboard handler logic.
 * Mirrors server_tools.ts lines 1384-1419.
 */
function buildKeyboardCommand(
  command: string,
  opts: { text?: string; keys?: string[]; holdTime?: number } = {}
): string | { error: string } {
  switch (command) {
    case 'sendText':
      if (!opts.text) return { error: 'Error: No text provided for sendText command.' };
      return `type "${encodeTypeText(opts.text)}"`;
    case 'sendKeyCombo':
      if (!opts.keys || opts.keys.length === 0) return { error: 'Error: No keys provided for sendKeyCombo command.' };
      try {
        return buildKeyComboCommand(opts.keys, opts.holdTime || 100);
      } catch (error) {
        return { error: `Error: ${error instanceof Error ? error.message : String(error)}` };
      }
    default:
      return { error: `Error: Unknown keyboard command "${command}".` };
  }
}

// ─── sendText command construction ───────────────────────────────────────────

describe('keyboard — sendText', () => {
  it('wraps text in type command with quotes', () => {
    const cmd = buildKeyboardCommand('sendText', { text: 'HELLO' });
    expect(cmd).toBe('type "HELLO"');
  });

  it('escapes double quotes in text', () => {
    const cmd = buildKeyboardCommand('sendText', { text: '10 PRINT "HI"' });
    expect(cmd).toBe('type "10 PRINT \\"HI\\""');
  });

  it('escapes carriage returns', () => {
    const cmd = buildKeyboardCommand('sendText', { text: 'LINE1\rLINE2' });
    expect(cmd).toBe('type "LINE1\\rLINE2"');
  });

  it('escapes tabs', () => {
    const cmd = buildKeyboardCommand('sendText', { text: 'A\tB' });
    expect(cmd).toBe('type "A\\tB"');
  });

  it('returns error when text is empty', () => {
    const result = buildKeyboardCommand('sendText', {});
    expect(result).toEqual({ error: 'Error: No text provided for sendText command.' });
  });
});

// ─── sendKeyCombo command construction ───────────────────────────────────────

describe('keyboard — sendKeyCombo', () => {
  it('builds matrix command for single key', () => {
    const cmd = buildKeyboardCommand('sendKeyCombo', { keys: ['SPACE'] });
    expect(cmd).toContain('keymatrixdown 8 1');
    expect(cmd).toContain('keymatrixup 8 1');
  });

  it('builds matrix command for CTRL+STOP', () => {
    const cmd = buildKeyboardCommand('sendKeyCombo', { keys: ['CTRL', 'STOP'] });
    expect(cmd).toContain('keymatrixdown 6 2');
    expect(cmd).toContain('keymatrixdown 7 16');
  });

  it('uses custom hold time', () => {
    const cmd = buildKeyboardCommand('sendKeyCombo', { keys: ['ESC'], holdTime: 500 });
    expect(cmd).toContain('after time 0.5');
  });

  it('returns error when no keys provided', () => {
    const result = buildKeyboardCommand('sendKeyCombo', {});
    expect(result).toEqual({ error: 'Error: No keys provided for sendKeyCombo command.' });
  });

  it('returns error for invalid key name', () => {
    const result = buildKeyboardCommand('sendKeyCombo', { keys: ['INVALID'] });
    expect(result).toHaveProperty('error');
    expect((result as any).error).toContain('Unknown key');
  });
});

// ─── Unknown command ─────────────────────────────────────────────────────────

describe('keyboard — unknown command', () => {
  it('returns error for unknown command', () => {
    const result = buildKeyboardCommand('badCommand');
    expect(result).toEqual({ error: 'Error: Unknown keyboard command "badCommand".' });
  });
});

// ─── Integration with sendCommand ────────────────────────────────────────────

describe('keyboard — sendCommand integration', () => {
  it('sendText sends correct TCL command to openMSX', async () => {
    mockSendCommand.mockResolvedValue('');
    const tclCommand = buildKeyboardCommand('sendText', { text: 'RUN\r' }) as string;
    await openMSXInstance.sendCommand(tclCommand);
    expect(mockSendCommand).toHaveBeenCalledWith('type "RUN\\r"');
  });

  it('formats response using getResponseContent', () => {
    const result = getResponseContent(['']);
    expect(result.content[0].text).toBe('Ok');
    expect(result.isError).toBe(false);
  });
});

describe('emu_keyboard — registered handler', () => {
  it('sends text through the real tool handler', async () => {
    mockSendCommand.mockResolvedValue('');
    const handler = await findRegisteredHandler();

    const response = await handler({ command: 'sendText', text: 'RUN\r' });

    expect(mockSendCommand).toHaveBeenCalledWith('type "RUN\\r"');
    expect(response).toEqual({
      content: [{ type: 'text', text: 'Ok' }],
      isError: false,
    });
  });

  it('sends a key combination through the real tool handler', async () => {
    mockSendCommand.mockResolvedValue('');
    const handler = await findRegisteredHandler();

    const response = await handler({ command: 'sendKeyCombo', keys: ['CTRL', 'STOP'], holdTime: 500 });

    expect(mockSendCommand).toHaveBeenCalledWith(
      'keymatrixdown 6 2 ; keymatrixdown 7 16 ; after time 0.5 { keymatrixup 6 2 ; keymatrixup 7 16 }',
    );
    expect(response).toEqual({
      content: [{ type: 'text', text: 'Ok' }],
      isError: false,
    });
  });

  it('returns invalid key errors without calling openMSX', async () => {
    const response = await (await findRegisteredHandler())({ command: 'sendKeyCombo', keys: ['INVALID'] });

    expect(response.isError).toBe(true);
    expect(response.content[0]).toEqual({
      type: 'text',
      text: expect.stringContaining('Unknown key "INVALID"'),
    });
    expect(mockSendCommand).not.toHaveBeenCalled();
  });
});
