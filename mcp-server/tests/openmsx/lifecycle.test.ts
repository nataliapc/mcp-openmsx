import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenMSX } from '../../src/openmsx.js';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    readdir: vi.fn(),
    mkdir: vi.fn(),
  },
}));

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

import fs from 'fs/promises';

const mockSpawn = vi.mocked(spawn);
const mockReadFile = vi.mocked(fs.readFile);
const mockReaddir = vi.mocked(fs.readdir);

/**
 * Tests for OpenMSX lifecycle methods: emu_close, forceClose, resetIO, destroy.
 *
 * Uses mock process objects that extend EventEmitter so we can emit
 * 'exit' and 'error' events to simulate process lifecycle.
 */

function createMockProcess() {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    pid: 99999,
    killed: false,
    stdin: { write: vi.fn() },
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn(function (this: any) { this.killed = true; }),
  });
}

function setupConnected(): { instance: OpenMSX; mockProcess: ReturnType<typeof createMockProcess> } {
  const instance = new OpenMSX();
  const mockProcess = createMockProcess();
  const priv = instance as any;
  priv.process = mockProcess;
  priv.isConnected = true;
  priv.ioBuffer = 'leftover data';
  priv.ioNotify = () => {};
  priv.commandQueue = Promise.resolve('');
  return { instance, mockProcess };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── forceClose ──────────────────────────────────────────────────────────────

describe('forceClose', () => {
  it('kills the process with SIGKILL', () => {
    const { instance, mockProcess } = setupConnected();
    instance.forceClose();
    expect(mockProcess.kill).toHaveBeenCalledWith('SIGKILL');
  });

  it('resets all state', () => {
    const { instance } = setupConnected();
    instance.forceClose();
    const priv = instance as any;
    expect(priv.process).toBeNull();
    expect(priv.isConnected).toBe(false);
    expect(priv.ioBuffer).toBe('');
    expect(priv.ioNotify).toBeNull();
  });

  it('is safe to call when no process exists', () => {
    const instance = new OpenMSX();
    expect(() => instance.forceClose()).not.toThrow();
  });

  it('is safe to call when process already killed', () => {
    const { instance, mockProcess } = setupConnected();
    mockProcess.killed = true;
    instance.forceClose();
    expect(mockProcess.kill).not.toHaveBeenCalled();
  });

  it('kills the emulator and force-closes the Windows control connection', () => {
    const { instance, mockProcess } = setupConnected();
    const forceClose = vi.fn();
    const priv = instance as any;
    priv.controlConnection = { mode: 'stdio-proxy', forceClose };

    instance.forceClose();

    expect(mockProcess.kill).toHaveBeenCalledWith('SIGKILL');
    expect(forceClose).toHaveBeenCalled();
    expect(priv.controlConnection).toBeNull();
  });
});

// ─── resetIO ─────────────────────────────────────────────────────────────────

describe('resetIO', () => {
  it('clears ioBuffer and ioNotify', () => {
    const { instance } = setupConnected();
    const priv = instance as any;
    priv.resetIO();
    expect(priv.ioBuffer).toBe('');
    expect(priv.ioNotify).toBeNull();
  });

  it('force-closes the Windows control connection if present', () => {
    const instance = new OpenMSX();
    const priv = instance as any;
    const forceClose = vi.fn();
    priv.controlConnection = { mode: 'direct-sspi', forceClose };
    priv.ioBuffer = 'data';
    priv.resetIO();
    expect(forceClose).toHaveBeenCalled();
    expect(priv.controlConnection).toBeNull();
  });

  it('is safe when no control connection exists', () => {
    const instance = new OpenMSX();
    const priv = instance as any;
    priv.controlConnection = null;
    expect(() => priv.resetIO()).not.toThrow();
  });
});

// ─── emu_close ───────────────────────────────────────────────────────────────

describe('emu_close', () => {
  it('returns error when no process is running', async () => {
    const instance = new OpenMSX();
    const result = await instance.emu_close();
    expect(result).toBe('Error: No emulator process running');
  });

  it('resolves successfully when process exits after exit command', async () => {
    const { instance, mockProcess } = setupConnected();

    const promise = instance.emu_close();
    await vi.advanceTimersByTimeAsync(0);

    // Simulate process exiting gracefully
    mockProcess.emit('exit', 0, null);

    const result = await promise;
    expect(result).toBe('Ok: Emulator process closed successfully');
  });

  it('cleans up state after successful close', async () => {
    const { instance, mockProcess } = setupConnected();

    const promise = instance.emu_close();
    await vi.advanceTimersByTimeAsync(0);
    mockProcess.emit('exit', 0, null);
    await promise;

    const priv = instance as any;
    expect(priv.lastMachine).toBeNull();
    expect(priv.isConnected).toBe(false);
    expect(priv.process).toBeNull();
  });

  it('force kills on timeout if process does not exit', async () => {
    const { instance, mockProcess } = setupConnected();
    // Need to mock sendCommand to prevent it from trying to write
    vi.spyOn(instance, 'sendCommand').mockResolvedValue('');

    const promise = instance.emu_close();

    // Advance past the 1s timeout
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toContain('Timeout');
    expect(result).toContain('force killed');
  });

  it('force kills when not connected', async () => {
    const { instance, mockProcess } = setupConnected();
    (instance as any).isConnected = false;

    const result = await instance.emu_close();
    expect(result).toContain('force killed');
    expect(mockProcess.kill).toHaveBeenCalledWith('SIGKILL');
  });

  it('only resolves once (safeResolve)', async () => {
    const { instance, mockProcess } = setupConnected();
    vi.spyOn(instance, 'sendCommand').mockResolvedValue('');

    const promise = instance.emu_close();
    await vi.advanceTimersByTimeAsync(0);

    // Emit exit AND let timeout fire — only first should win
    mockProcess.emit('exit', 0, null);
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toBe('Ok: Emulator process closed successfully');
  });

  it('tears down the Windows control connection when the emulator exits', async () => {
    const { instance, mockProcess } = setupConnected();
    const forceClose = vi.fn();
    const priv = instance as any;
    priv.controlConnection = { mode: 'stdio-proxy', forceClose };
    vi.spyOn(instance, 'sendCommand').mockResolvedValue('');

    const promise = instance.emu_close();
    await vi.advanceTimersByTimeAsync(0);
    mockProcess.emit('exit', 0, null);
    await promise;

    expect(forceClose).toHaveBeenCalled();
    expect(priv.controlConnection).toBeNull();
  });

  it('handles process error event', async () => {
    const { instance, mockProcess } = setupConnected();
    vi.spyOn(instance, 'sendCommand').mockResolvedValue('');

    const promise = instance.emu_close();
    await vi.advanceTimersByTimeAsync(0);

    mockProcess.emit('error', new Error('process crashed'));

    const result = await promise;
    expect(result).toContain('error closing emulator');
    expect(result).toContain('process crashed');
  });
});

// ─── destroy ─────────────────────────────────────────────────────────────────

describe('destroy', () => {
  it('calls emu_close when process is running', async () => {
    const { instance, mockProcess } = setupConnected();
    const closeSpy = vi.spyOn(instance, 'emu_close').mockResolvedValue('Ok');

    await instance.destroy();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('does nothing when no process is running', async () => {
    const instance = new OpenMSX();
    const closeSpy = vi.spyOn(instance, 'emu_close');
    await instance.destroy();
    expect(closeSpy).not.toHaveBeenCalled();
  });
});

// ─── emu_isInBasic ───────────────────────────────────────────────────────────

describe('emu_isInBasic', () => {
  it('returns true when slots 0 and 1 are in slot 0', async () => {
    const instance = new OpenMSX();
    vi.spyOn(instance, 'sendCommand').mockResolvedValue(
      '0000: slot 0.0\n4000: slot 0.0\n8000: slot 3.0\nC000: slot 3.0'
    );
    expect(await instance.emu_isInBasic()).toBe(true);
  });

  it('returns false when not in BASIC', async () => {
    const instance = new OpenMSX();
    vi.spyOn(instance, 'sendCommand').mockResolvedValue(
      '0000: slot 3.1\n4000: slot 3.1\n8000: slot 3.0\nC000: slot 3.0'
    );
    expect(await instance.emu_isInBasic()).toBe(false);
  });

  it('returns false on error', async () => {
    const instance = new OpenMSX();
    vi.spyOn(instance, 'sendCommand').mockRejectedValue(new Error('disconnected'));
    expect(await instance.emu_isInBasic()).toBe(false);
  });
});

// ─── emu_status ──────────────────────────────────────────────────────────────

describe('emu_status', () => {
  it('returns JSON with machine info', async () => {
    const instance = new OpenMSX();
    vi.spyOn(instance, 'sendCommand').mockImplementation(async (cmd: string) => {
      if (cmd === 'machine_info') return 'type manufacturer';
      if (cmd === 'machine_info type') return 'MSX2+';
      if (cmd === 'machine_info manufacturer') return 'Panasonic';
      return '';
    });

    const result = await instance.emu_status();
    const parsed = JSON.parse(result);
    expect(parsed.type).toBe('MSX2+');
    expect(parsed.manufacturer).toBe('Panasonic');
  });

  it('skips filtered parameters (issubslotted, slot, etc.)', async () => {
    const instance = new OpenMSX();
    vi.spyOn(instance, 'sendCommand').mockImplementation(async (cmd: string) => {
      if (cmd === 'machine_info') return 'type issubslotted slot';
      if (cmd === 'machine_info type') return 'MSX2+';
      return '';
    });

    const result = await instance.emu_status();
    const parsed = JSON.parse(result);
    expect(parsed.type).toBe('MSX2+');
    expect(parsed.issubslotted).toBeUndefined();
    expect(parsed.slot).toBeUndefined();
  });

  it('returns error when sendCommand fails', async () => {
    const instance = new OpenMSX();
    vi.spyOn(instance, 'sendCommand').mockResolvedValue('Error: not connected');

    const result = await instance.emu_status();
    expect(result).toBe('Error: not connected');
  });

  it('returns a formatted error for a non-Error failure', async () => {
    const instance = new OpenMSX();
    vi.spyOn(instance, 'sendCommand').mockRejectedValue('connection lost');

    const result = await instance.emu_status();

    expect(result).toBe('Error: Failed to get machine status - Unknown error');
  });
});

describe('getMachineList and getExtensionList', () => {
  it('returns XML entries with descriptions', async () => {
    const instance = new OpenMSX();
    mockReaddir.mockResolvedValue(['MSX2.xml', 'README.txt'] as any);
    mockReadFile.mockResolvedValue('<machine><description>MSX2 test machine</description></machine>');

    const machines = await instance.getMachineList('/share/machines');

    expect(mockReaddir).toHaveBeenCalledWith('/share/machines');
    expect(mockReadFile).toHaveBeenCalledWith('/share/machines/MSX2.xml', 'utf-8');
    expect(JSON.parse(machines)).toEqual([
      { name: 'MSX2', description: 'MSX2 test machine' },
    ]);
  });

  it('returns an error when no XML entries exist', async () => {
    const instance = new OpenMSX();
    mockReaddir.mockResolvedValue(['README.txt'] as any);

    await expect(instance.getExtensionList('/share/extensions'))
      .resolves.toBe('Error: No extensions found.');
  });

  it('returns a directory error for non-Error failures', async () => {
    const instance = new OpenMSX();
    mockReaddir.mockRejectedValue('permission denied');

    await expect(instance.getMachineList('/share/machines'))
      .resolves.toBe('Error: error reading machines directory - permission denied');
  });
});

// ─── emu_launch — renderer ──────────────────────────────────────────────────

function createLaunchMockProcess() {
  const proc = Object.assign(new EventEmitter(), {
    pid: 12345,
    killed: false,
    stdin: { write: vi.fn() },
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn(function (this: any) { this.killed = true; }),
  });
  return proc;
}

interface RendererInfo {
  cliRenderer: string | null;    // from -command arg in spawn args
  cmdRenderer: string | null;    // from sendCommand('set renderer ...')
}

async function launchAndCaptureRenderer(headless: string | undefined): Promise<RendererInfo> {
  const saved = process.env.OPENMSX_LAUNCH_HEADLESS;
  if (headless === undefined) {
    delete process.env.OPENMSX_LAUNCH_HEADLESS;
  } else {
    process.env.OPENMSX_LAUNCH_HEADLESS = headless;
  }

  vi.useFakeTimers();

  const mockProc = createLaunchMockProcess();
  mockSpawn.mockReturnValue(mockProc as any);

  const instance = new OpenMSX();
  const sendCmdSpy = vi.spyOn(instance, 'sendCommand').mockResolvedValue('');

  const launchPromise = instance.emu_launch(process.env.OPENMSX_EXECUTABLE || 'openmsx', '', []);

  // Simulate openMSX stdout output triggering Linux connection
  mockProc.stdout.emit('data', Buffer.from('<openmsx-output>\n'));
  await vi.advanceTimersByTimeAsync(500);

  // Send replies for each sendCommand call
  for (let i = 0; i < sendCmdSpy.mock.calls.length; i++) {
    mockProc.stdout.emit('data', Buffer.from('<reply></reply>\n'));
    await vi.advanceTimersByTimeAsync(0);
  }

  await launchPromise;

  vi.useRealTimers();

  // Restore env
  if (saved === undefined) {
    delete process.env.OPENMSX_LAUNCH_HEADLESS;
  } else {
    process.env.OPENMSX_LAUNCH_HEADLESS = saved;
  }

  // Check spawn args for -command set renderer <value>
  const spawnArgs = mockSpawn.mock.calls[0]?.[1] as string[] | undefined;
  const cmdIdx = spawnArgs?.indexOf('-command') ?? -1;
  const cliRenderer = (cmdIdx !== -1 && spawnArgs?.[cmdIdx + 1]?.startsWith('set renderer '))
    ? spawnArgs[cmdIdx + 1].replace('set renderer ', '')
    : null;

  // Check sendCommand calls for 'set renderer ...'
  const rendererCall = sendCmdSpy.mock.calls.find(
    ([cmd]) => typeof cmd === 'string' && cmd.startsWith('set renderer ')
  );
  const cmdRenderer = rendererCall ? (rendererCall[0] as string).replace('set renderer ', '') : null;

  return { cliRenderer, cmdRenderer };
}

describe('emu_launch — renderer selection', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  it('passes -command set renderer none via CLI when OPENMSX_LAUNCH_HEADLESS=true', async () => {
    const info = await launchAndCaptureRenderer('true');
    expect(info.cliRenderer).toBe('none');
    expect(info.cmdRenderer).toBeNull();
  });

  it('sets renderer to SDLGL-PP via sendCommand when OPENMSX_LAUNCH_HEADLESS is not set', async () => {
    const info = await launchAndCaptureRenderer(undefined);
    expect(info.cliRenderer).toBeNull();
    expect(info.cmdRenderer).toBe('SDLGL-PP');
  });

  it('sets renderer to SDLGL-PP via sendCommand when OPENMSX_LAUNCH_HEADLESS=false', async () => {
    const info = await launchAndCaptureRenderer('false');
    expect(info.cliRenderer).toBeNull();
    expect(info.cmdRenderer).toBe('SDLGL-PP');
  });

  it('is case-insensitive for OPENMSX_LAUNCH_HEADLESS', async () => {
    const info = await launchAndCaptureRenderer('TRUE');
    expect(info.cliRenderer).toBe('none');
    expect(info.cmdRenderer).toBeNull();
  });
});

describe('emu_launch — Linux preflight and process failures', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  it('rejects a second launch while an emulator is running', async () => {
    const instance = new OpenMSX();
    const priv = instance as any;
    priv.process = createLaunchMockProcess();
    priv.lastMachine = 'C-BIOS_MSX2';

    const result = await instance.emu_launch('openmsx', '', []);

    expect(result).toBe(
      'Error: openMSX emulator instance is already running (current machine: C-BIOS_MSX2). Close it first.',
    );
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('reports a process with no pid', async () => {
    const processWithoutPid = createLaunchMockProcess();
    processWithoutPid.pid = 0;
    mockSpawn.mockReturnValue(processWithoutPid as any);

    const result = await new OpenMSX().emu_launch('openmsx', '', []);

    expect(result).toBe('Error: Failed to launch openMSX process');
  });

  it('reports missing stdio pipes', async () => {
    const processWithoutStdout = createLaunchMockProcess();
    processWithoutStdout.stdout = null as any;
    mockSpawn.mockReturnValue(processWithoutStdout as any);

    const result = await new OpenMSX().emu_launch('openmsx', '', []);

    expect(result).toBe('Error: Failed to create stdio pipes');
  });

  it('returns an actionable error for ENOENT', async () => {
    const mockProc = createLaunchMockProcess();
    mockSpawn.mockReturnValue(mockProc as any);
    const launchPromise = new OpenMSX().emu_launch('/missing/openmsx', '', []);

    mockProc.emit('error', Object.assign(new Error('spawn failed'), { code: 'ENOENT' }));

    const result = await launchPromise;
    expect(result).toContain('Error: openMSX executable not found: "/missing/openmsx".');
    expect(result).toContain('Set OPENMSX_EXECUTABLE to the full path.');
  });

  it('reports an unexpected process exit with diagnostics', async () => {
    const mockProc = createLaunchMockProcess();
    mockSpawn.mockReturnValue(mockProc as any);
    const launchPromise = new OpenMSX().emu_launch('openmsx', '', []);

    mockProc.emit('exit', 2, 'SIGTERM');

    const result = await launchPromise;
    expect(result).toContain('Error: openMSX process exited unexpectedly (code=2, signal=SIGTERM).');
    expect(result).toContain('platform=linux IS_WINDOWS=false');
  });

  it('force closes on a fatal stderr error during the connection grace period', async () => {
    const mockProc = createLaunchMockProcess();
    mockSpawn.mockReturnValue(mockProc as any);
    const instance = new OpenMSX();
    const launchPromise = instance.emu_launch('openmsx', '', []);

    mockProc.stdout.emit('data', Buffer.from('<openmsx-output>\n'));
    mockProc.stderr.emit('data', Buffer.from('Fatal error: renderer failed\n'));

    const result = await launchPromise;
    expect(result).toBe('Error: Fatal error: renderer failed');
    expect(mockProc.kill).toHaveBeenCalledWith('SIGKILL');
  });
});
