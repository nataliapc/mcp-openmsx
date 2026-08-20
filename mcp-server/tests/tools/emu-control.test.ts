import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/openmsx.js', () => ({
  openMSXInstance: {
    sendCommand: vi.fn(),
  },
}));

import { openMSXInstance } from '../../src/openmsx.js';
import { registerTools } from '../../src/server_tools.js';
import type { EmuDirectories } from '../../src/server.js';

interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  structuredContent: Record<string, unknown>;
  isError: boolean;
}

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResponse>;

class ToolRegistry {
  readonly registrations: Array<{ name: string; handler: ToolHandler }> = [];

  registerTool(name: string, _config: unknown, handler: ToolHandler): void {
    this.registrations.push({ name, handler });
  }
}

const mockSendCommand = vi.mocked(openMSXInstance.sendCommand);
const dummyDirs = {} as EmuDirectories;

async function findHandler(name: string): Promise<ToolHandler> {
  const reg = new ToolRegistry();
  await registerTools(reg as unknown as McpServer, dummyDirs);
  const entry = reg.registrations.find(r => r.name === name);
  if (!entry) throw new Error(`Tool "${name}" not registered`);
  return entry.handler;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('emu_control userDataDir', () => {
  it('sends the correct Tcl command and returns the path', async () => {
    mockSendCommand.mockResolvedValue('/home/user/.openMSX');
    const handler = await findHandler('emu_control');

    const response = await handler({ command: 'userDataDir' });

    expect(mockSendCommand).toHaveBeenCalledWith('set $env(OPENMSX_USER_DATA)');
    expect(response.isError).toBe(false);
    expect(response.content[0].text).toBe('/home/user/.openMSX');
    expect(response.structuredContent).toEqual({
      command: 'userDataDir',
      result: '/home/user/.openMSX',
    });
  });

  it('returns error when sendCommand fails', async () => {
    mockSendCommand.mockResolvedValue('Error: no such variable');
    const handler = await findHandler('emu_control');

    const response = await handler({ command: 'userDataDir' });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('Error');
  });
});

describe('emu_control systemDataDir', () => {
  it('sends the correct Tcl command and returns the path', async () => {
    mockSendCommand.mockResolvedValue('/usr/share/openmsx');
    const handler = await findHandler('emu_control');

    const response = await handler({ command: 'systemDataDir' });

    expect(mockSendCommand).toHaveBeenCalledWith('set $env(OPENMSX_SYSTEM_DATA)');
    expect(response.isError).toBe(false);
    expect(response.content[0].text).toBe('/usr/share/openmsx');
    expect(response.structuredContent).toEqual({
      command: 'systemDataDir',
      result: '/usr/share/openmsx',
    });
  });

  it('returns error when sendCommand fails', async () => {
    mockSendCommand.mockResolvedValue('Error: no such variable');
    const handler = await findHandler('emu_control');

    const response = await handler({ command: 'systemDataDir' });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('Error');
  });
});
