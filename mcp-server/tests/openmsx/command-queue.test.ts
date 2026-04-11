import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenMSX } from '../../src/openmsx.js';

/**
 * Tests for sendCommand() — the core command serialization mechanism.
 *
 * Strategy: bypass emu_launch by injecting state directly into private fields
 * (process, isConnected, ioBuffer) via `as any`. This isolates the command
 * queue, writeData, and readData logic from the launch/connection complexity.
 */

// Minimal mock process with stdin writable stream
function createMockProcess() {
  const written: string[] = [];
  return {
    pid: 12345,
    killed: false,
    stdin: {
      write: vi.fn((data: string) => { written.push(data); }),
    },
    stdout: { on: vi.fn(), removeListener: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn(),
    kill: vi.fn(),
    _written: written,
  };
}

function setupInstance(): { instance: OpenMSX; mockProcess: ReturnType<typeof createMockProcess> } {
  const instance = new OpenMSX();
  const mockProcess = createMockProcess();
  const priv = instance as any;
  priv.process = mockProcess;
  priv.isConnected = true;
  priv.ioBuffer = '';
  priv.ioNotify = null;
  priv.commandQueue = Promise.resolve('');
  return { instance, mockProcess };
}

/** Simulate openMSX replying by injecting data into ioBuffer and triggering notify */
function simulateReply(instance: OpenMSX, xml: string) {
  const priv = instance as any;
  priv.ioBuffer += xml;
  if (priv.ioNotify) {
    const notify = priv.ioNotify;
    priv.ioNotify = null;
    notify();
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Reply parsing ───────────────────────────────────────────────────────────

describe('sendCommand — reply parsing', () => {
  it('parses successful reply and returns content', async () => {
    const { instance } = setupInstance();
    const promise = instance.sendCommand('set power on');
    // Let writeData execute (microtask), then simulate reply
    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="ok">on</reply>');
    const result = await promise;
    expect(result).toBe('on');
  });

  it('parses error reply and prefixes with "Error:"', async () => {
    const { instance } = setupInstance();
    const promise = instance.sendCommand('bad_command');
    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="nok">invalid command name</reply>');
    const result = await promise;
    expect(result).toBe('Error: invalid command name');
  });

  it('parses reply with empty content', async () => {
    const { instance } = setupInstance();
    const promise = instance.sendCommand('screenshot');
    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="ok"></reply>');
    const result = await promise;
    expect(result).toBe('');
  });

  it('decodes HTML entities in reply content', async () => {
    const { instance } = setupInstance();
    const promise = instance.sendCommand('some_command');
    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="ok">a &lt; b &amp; c &gt; d</reply>');
    const result = await promise;
    expect(result).toBe('a < b & c > d');
  });

  it('returns raw output when no <reply> tags present', async () => {
    const { instance } = setupInstance();
    const promise = instance.sendCommand('some_command');
    await vi.advanceTimersByTimeAsync(0);
    // Simulate non-standard response that still ends with </reply> for readData to extract
    // Actually readData waits for </reply>, so we need it. But sendCommand regex may not match.
    // Let's simulate a malformed reply:
    simulateReply(instance, '<something>raw data</something></reply>');
    const result = await promise;
    // No <reply result="..."> match — returns decoded raw output
    expect(result).toContain('raw data');
  });
});

// ─── HTML encoding of commands ───────────────────────────────────────────────

describe('sendCommand — command encoding', () => {
  it('encodes special characters in the command', async () => {
    const { instance, mockProcess } = setupInstance();
    const promise = instance.sendCommand('set "renderer" <SDLGL-PP>');
    await vi.advanceTimersByTimeAsync(0);

    // Verify what was written to stdin
    const written = mockProcess._written.join('');
    expect(written).toContain('<command>');
    expect(written).toContain('&quot;');
    expect(written).toContain('&lt;');
    expect(written).toContain('&gt;');
    expect(written).not.toContain('"renderer"');
    expect(written).toContain('</command>');

    simulateReply(instance, '<reply result="ok"></reply>');
    await promise;
  });
});

// ─── Command serialization (queue) ───────────────────────────────────────────

describe('sendCommand — serialization', () => {
  it('serializes concurrent commands (second waits for first)', async () => {
    const { instance } = setupInstance();
    const order: string[] = [];

    const p1 = instance.sendCommand('cmd1').then(r => { order.push('r1:' + r); return r; });
    const p2 = instance.sendCommand('cmd2').then(r => { order.push('r2:' + r); return r; });

    // First command gets to execute, second is queued
    await vi.advanceTimersByTimeAsync(0);
    // Only cmd1's writeData has run; cmd2 is blocked on commandQueue
    simulateReply(instance, '<reply result="ok">result1</reply>');
    await vi.advanceTimersByTimeAsync(0);

    // Now cmd2 executes
    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="ok">result2</reply>');

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe('result1');
    expect(r2).toBe('result2');
    expect(order).toEqual(['r1:result1', 'r2:result2']);
  });

  it('queue continues after a command error', async () => {
    const { instance } = setupInstance();

    const p1 = instance.sendCommand('failing_cmd');
    const p2 = instance.sendCommand('good_cmd');

    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="nok">fail</reply>');
    await vi.advanceTimersByTimeAsync(0);

    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="ok">success</reply>');

    const r1 = await p1;
    const r2 = await p2;
    expect(r1).toBe('Error: fail');
    expect(r2).toBe('success');
  });
});

// ─── Timeout handling ────────────────────────────────────────────────────────

describe('sendCommand — timeout', () => {
  it('returns error after 10s timeout when no reply arrives', async () => {
    const { instance } = setupInstance();
    const promise = instance.sendCommand('hanging_command');

    // Advance past the 10s timeout
    await vi.advanceTimersByTimeAsync(10000);

    const result = await promise;
    expect(result).toBe('Error: Timeout waiting for openMSX response');
  });

  it('clears ioBuffer on timeout to prevent desync', async () => {
    const { instance } = setupInstance();
    const priv = instance as any;

    // Put stale data in buffer
    priv.ioBuffer = 'partial data without closing tag';

    const promise = instance.sendCommand('cmd');
    await vi.advanceTimersByTimeAsync(10000);
    await promise;

    expect(priv.ioBuffer).toBe('');
  });

  it('queue continues after timeout', async () => {
    const { instance } = setupInstance();

    const p1 = instance.sendCommand('timeout_cmd');
    const p2 = instance.sendCommand('next_cmd');

    // First command times out
    await vi.advanceTimersByTimeAsync(10000);
    const r1 = await p1;
    expect(r1).toContain('Timeout');

    // Second command now executes
    await vi.advanceTimersByTimeAsync(0);
    simulateReply(instance, '<reply result="ok">ok</reply>');
    const r2 = await p2;
    expect(r2).toBe('ok');
  });
});

// ─── Error handling ──────────────────────────────────────────────────────────

describe('sendCommand — error handling', () => {
  it('returns error when not connected', async () => {
    const instance = new OpenMSX();
    (instance as any).process = createMockProcess();
    (instance as any).isConnected = false;

    const result = await instance.sendCommand('test');
    expect(result).toContain('Error:');
    expect(result).toContain('not running or not connected');
  });

  it('returns error when process is null', async () => {
    const instance = new OpenMSX();
    const result = await instance.sendCommand('test');
    expect(result).toContain('Error:');
  });
});

// ─── ioBuffer management ─────────────────────────────────────────────────────

describe('sendCommand — ioBuffer handling', () => {
  it('extracts reply and preserves trailing data in buffer', async () => {
    const { instance } = setupInstance();
    const priv = instance as any;

    const promise = instance.sendCommand('cmd');
    await vi.advanceTimersByTimeAsync(0);

    // Reply arrives with extra data after it
    simulateReply(instance, '<reply result="ok">data</reply>trailing garbage');

    const result = await promise;
    expect(result).toBe('data');
    expect(priv.ioBuffer).toBe('trailing garbage');
  });

  it('handles reply arriving in multiple fragments', async () => {
    const { instance } = setupInstance();

    const promise = instance.sendCommand('cmd');
    await vi.advanceTimersByTimeAsync(0);

    // First fragment — no </reply> yet
    simulateReply(instance, '<reply result="ok">');
    // readData should be waiting for more
    await vi.advanceTimersByTimeAsync(0);

    // Second fragment completes the reply
    simulateReply(instance, 'fragmented data</reply>');

    const result = await promise;
    expect(result).toBe('fragmented data');
  });
});
