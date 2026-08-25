import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/openmsx.js', () => ({
  openMSXInstance: {
    sendCommand: vi.fn(),
    emu_close: vi.fn(),
    emu_launch: vi.fn(),
    getMachineList: vi.fn(),
    getExtensionList: vi.fn(),
  },
}));

vi.mock('../../src/server_elicitations.js', () => ({
  resolveLaunchParams: vi.fn(),
}));

vi.mock('../../src/utils.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils.js')>();
  return {
    ...actual,
    sleepWithAbort: vi.fn(),
  };
});

import { openMSXInstance } from '../../src/openmsx.js';
import { registerTools } from '../../src/server_tools.js';
import { resolveLaunchParams } from '../../src/server_elicitations.js';
import { sleepWithAbort } from '../../src/utils.js';
import type { EmuDirectories } from '../../src/server.js';

interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  structuredContent: Record<string, unknown>;
  isError: boolean;
}

interface WaitExtra {
  signal: AbortSignal;
  _meta?: { progressToken?: string | number };
  sendNotification: (notification: unknown) => Promise<void>;
}

type ToolHandler = (args: Record<string, unknown>, extra?: WaitExtra) => Promise<ToolResponse>;

class ToolRegistry {
  readonly registrations: Array<{ name: string; handler: ToolHandler }> = [];

  registerTool(name: string, _config: unknown, handler: ToolHandler): void {
    this.registrations.push({ name, handler });
  }
}

const mockSendCommand = vi.mocked(openMSXInstance.sendCommand);
const mockEmuClose = vi.mocked(openMSXInstance.emu_close);
const mockEmuLaunch = vi.mocked(openMSXInstance.emu_launch);
const mockGetMachineList = vi.mocked(openMSXInstance.getMachineList);
const mockGetExtensionList = vi.mocked(openMSXInstance.getExtensionList);
const mockResolveLaunchParams = vi.mocked(resolveLaunchParams);
const mockSleepWithAbort = vi.mocked(sleepWithAbort);
const testDirs = {
  OPENMSX_EXECUTABLE: '/usr/bin/openmsx',
  MACHINES_DIR: '/usr/share/openmsx/machines',
  EXTENSIONS_DIR: '/usr/share/openmsx/extensions',
} as EmuDirectories;

async function findHandler(name: string, directories: EmuDirectories = testDirs): Promise<ToolHandler> {
  const reg = new ToolRegistry();
  await registerTools(reg as unknown as McpServer, directories);
  const entry = reg.registrations.find(r => r.name === name);
  if (!entry) throw new Error(`Tool "${name}" not registered`);
  return entry.handler;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSleepWithAbort.mockResolvedValue(undefined);
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

describe('emu_control power and lifecycle', () => {
  it('closes the emulator', async () => {
    mockEmuClose.mockResolvedValue('closed');
    const response = await (await findHandler('emu_control'))({ command: 'close' });

    expect(mockEmuClose).toHaveBeenCalledOnce();
    expect(response.structuredContent).toEqual({ command: 'close', result: 'closed' });
    expect(response.isError).toBe(false);
  });

  it.each([
    ['powerOn', 'true', 'set power on', 'openMSX emulator powered on'],
    ['powerOff', 'false', 'set power off', 'openMSX emulator powered off'],
  ] as const)('handles %s success', async (command, rawResponse, expectedCommand, result) => {
    mockSendCommand.mockResolvedValue(rawResponse);
    const response = await (await findHandler('emu_control'))({ command });

    expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
    expect(response.structuredContent).toEqual({ command, result });
    expect(response.content[0].text).toBe(result);
    expect(response.isError).toBe(false);
  });

  it('reports a failed power-on command', async () => {
    mockSendCommand.mockResolvedValue('false');
    const response = await (await findHandler('emu_control'))({ command: 'powerOn' });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toBe('Error: false');
  });

  it('resets the emulator when openMSX returns an empty response', async () => {
    mockSendCommand.mockResolvedValue('');
    const response = await (await findHandler('emu_control'))({ command: 'reset' });

    expect(mockSendCommand).toHaveBeenCalledWith('reset');
    expect(response.structuredContent).toEqual({ command: 'reset', result: 'openMSX emulator reset successful' });
    expect(response.isError).toBe(false);
  });
});

describe('emu_control speed', () => {
  it('returns the current emulator speed as a number', async () => {
    mockSendCommand.mockResolvedValue('250');
    const response = await (await findHandler('emu_control'))({ command: 'getEmulatorSpeed' });

    expect(mockSendCommand).toHaveBeenCalledWith('set speed');
    expect(response.structuredContent).toEqual({
      command: 'getEmulatorSpeed',
      speed: 250,
      result: 'Current emulator speed is 250%',
    });
  });

  it('sets the emulator speed and returns the requested value', async () => {
    mockSendCommand.mockResolvedValue('10000');
    const response = await (await findHandler('emu_control'))({ command: 'setEmulatorSpeed', emuspeed: 10000 });

    expect(mockSendCommand).toHaveBeenCalledWith('set speed 10000');
    expect(response.structuredContent).toEqual({
      command: 'setEmulatorSpeed',
      speed: 10000,
      result: 'Emulator speed set to 10000%',
    });
  });

  it('returns an error when setting the speed fails', async () => {
    mockSendCommand.mockResolvedValue('Error: invalid speed');
    const response = await (await findHandler('emu_control'))({ command: 'setEmulatorSpeed', emuspeed: 0 });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('Error: invalid speed');
  });
});

describe('emu_control machine and extension lists', () => {
  it('parses the machine list JSON', async () => {
    const machines = [{ name: 'C-BIOS_MSX2', description: 'C-BIOS MSX2' }];
    mockGetMachineList.mockResolvedValue(JSON.stringify(machines));
    const response = await (await findHandler('emu_control'))({ command: 'machineList' });

    expect(mockGetMachineList).toHaveBeenCalledWith(testDirs.MACHINES_DIR);
    expect(response.structuredContent).toEqual({ command: 'machineList', machines });
  });

  it('returns raw machine list text when JSON parsing fails', async () => {
    mockGetMachineList.mockResolvedValue('machine list unavailable');
    const response = await (await findHandler('emu_control'))({ command: 'machineList' });

    expect(response.structuredContent).toEqual({ command: 'machineList', result: 'machine list unavailable' });
  });

  it('parses the extension list JSON', async () => {
    const extensions = [{ name: 'video9000', description: 'Video extension' }];
    mockGetExtensionList.mockResolvedValue(JSON.stringify(extensions));
    const response = await (await findHandler('emu_control'))({ command: 'extensionList' });

    expect(mockGetExtensionList).toHaveBeenCalledWith(testDirs.EXTENSIONS_DIR);
    expect(response.structuredContent).toEqual({ command: 'extensionList', extensions });
  });

  it('returns raw extension list text when JSON parsing fails', async () => {
    mockGetExtensionList.mockResolvedValue('extension list unavailable');
    const response = await (await findHandler('emu_control'))({ command: 'extensionList' });

    expect(response.structuredContent).toEqual({ command: 'extensionList', result: 'extension list unavailable' });
  });
});

describe('emu_control wait', () => {
  it('waits and reports progress notifications', async () => {
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const signal = new AbortController().signal;
    const response = await (await findHandler('emu_control'))(
      { command: 'wait', seconds: 2 },
      { signal, _meta: { progressToken: 'wait-1' }, sendNotification },
    );

    expect(mockSleepWithAbort).toHaveBeenNthCalledWith(1, 1000, signal);
    expect(mockSleepWithAbort).toHaveBeenNthCalledWith(2, 1000, signal);
    expect(sendNotification).toHaveBeenNthCalledWith(1, {
      method: 'notifications/progress',
      params: { progressToken: 'wait-1', progress: 1, total: 2, message: 'Waited 1 of 2 seconds' },
    });
    expect(sendNotification).toHaveBeenNthCalledWith(2, {
      method: 'notifications/progress',
      params: { progressToken: 'wait-1', progress: 2, total: 2, message: 'Waited 2 of 2 seconds' },
    });
    expect(response.structuredContent).toEqual({ command: 'wait', result: 'Waited for 2 seconds.' });
    expect(response.isError).toBe(false);
  });

  it('waits without sending notifications when no progress token is provided', async () => {
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const response = await (await findHandler('emu_control'))(
      { command: 'wait', seconds: 1 },
      { signal: new AbortController().signal, sendNotification },
    );

    expect(sendNotification).not.toHaveBeenCalled();
    expect(response.content[0].text).toBe('Waited for 1 seconds.');
    expect(response.isError).toBe(false);
  });

  it('reports cancellation after the elapsed seconds', async () => {
    mockSleepWithAbort.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('aborted'));
    const sendNotification = vi.fn().mockResolvedValue(undefined);
    const response = await (await findHandler('emu_control'))(
      { command: 'wait', seconds: 3 },
      { signal: new AbortController().signal, _meta: { progressToken: 'wait-2' }, sendNotification },
    );

    expect(mockSleepWithAbort).toHaveBeenCalledTimes(2);
    expect(response).toEqual({
      content: [{ type: 'text', text: 'Wait cancelled after 1 of 3 seconds.' }],
      isError: true,
    });
  });
});

describe('emu_control launch', () => {
  it('resolves launch parameters and starts openMSX', async () => {
    mockResolveLaunchParams.mockResolvedValue({
      machine: 'C-BIOS_MSX2',
      extensions: ['video9000'],
    });
    mockEmuLaunch.mockResolvedValue('openMSX launched');
    const response = await (await findHandler('emu_control'))({
      command: 'launch',
      machine: 'C-BIOS_MSX2',
      extensions: ['video9000'],
    });

    expect(mockResolveLaunchParams).toHaveBeenCalledWith(
      expect.anything(), testDirs, 'C-BIOS_MSX2', ['video9000'],
    );
    expect(mockEmuLaunch).toHaveBeenCalledWith(
      testDirs.OPENMSX_EXECUTABLE, 'C-BIOS_MSX2', ['video9000'],
    );
    expect(response.structuredContent).toEqual({ command: 'launch', result: 'openMSX launched' });
    expect(response.isError).toBe(false);
  });

  it('returns an error when launch is cancelled', async () => {
    mockResolveLaunchParams.mockResolvedValue({ machine: '', extensions: [], cancelled: true });
    const response = await (await findHandler('emu_control'))({ command: 'launch' });

    expect(response).toEqual({
      content: [{ type: 'text', text: 'Launch cancelled by user.' }],
      isError: true,
    });
    expect(mockEmuLaunch).not.toHaveBeenCalled();
  });

  it('returns a launch resolution error', async () => {
    mockResolveLaunchParams.mockResolvedValue({
      machine: '',
      extensions: [],
      error: 'Error: cannot resolve machine',
    });
    const response = await (await findHandler('emu_control'))({ command: 'launch', machine: 'unknown' });

    expect(response).toEqual({
      content: [{ type: 'text', text: 'Error: cannot resolve machine' }],
      isError: true,
    });
    expect(mockEmuLaunch).not.toHaveBeenCalled();
  });
});

describe('emu_control unknown command', () => {
  it('rejects unknown commands', async () => {
    const response = await (await findHandler('emu_control'))({ command: 'unknown' });

    expect(response).toEqual({
      content: [{ type: 'text', text: 'Error: Unknown command "unknown".' }],
      isError: true,
    });
  });
});
