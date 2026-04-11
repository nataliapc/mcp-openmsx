import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenMSX } from '../../src/openmsx.js';
import { EventEmitter } from 'events';

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

  it('destroys TCP socket if present', () => {
    const instance = new OpenMSX();
    const priv = instance as any;
    const mockSocket = { destroy: vi.fn(), destroyed: false };
    priv.tcpSocket = mockSocket;
    priv.ioBuffer = 'data';
    priv.resetIO();
    expect(mockSocket.destroy).toHaveBeenCalled();
    expect(priv.tcpSocket).toBeNull();
  });

  it('is safe when no TCP socket exists', () => {
    const instance = new OpenMSX();
    const priv = instance as any;
    priv.tcpSocket = null;
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
});
