import { describe, it, expect, vi } from 'vitest';
import { sleep, sleepWithAbort } from '../../src/utils.js';

// ─── sleep ───────────────────────────────────────────────────────────────────

describe('sleep', () => {
  it('resolves after the specified time', async () => {
    vi.useFakeTimers();
    const promise = sleep(100);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('does not resolve before the specified time', async () => {
    vi.useFakeTimers();
    let resolved = false;
    sleep(200).then(() => { resolved = true; });
    vi.advanceTimersByTime(100);
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);
    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(resolved).toBe(true);
    vi.useRealTimers();
  });
});

// ─── sleepWithAbort ──────────────────────────────────────────────────────────

describe('sleepWithAbort', () => {
  it('resolves after the specified time when not aborted', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const promise = sleepWithAbort(100, controller.signal);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('rejects immediately if signal already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(sleepWithAbort(1000, controller.signal)).rejects.toThrow();
  });

  it('rejects when signal is aborted during sleep', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const promise = sleepWithAbort(1000, controller.signal);
    vi.advanceTimersByTime(200);
    controller.abort();
    await expect(promise).rejects.toThrow();
    vi.useRealTimers();
  });

  it('cleans up event listener after normal completion', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const spy = vi.spyOn(controller.signal, 'removeEventListener');
    const promise = sleepWithAbort(50, controller.signal);
    vi.advanceTimersByTime(50);
    await promise;
    expect(spy).toHaveBeenCalledWith('abort', expect.any(Function));
    vi.useRealTimers();
  });
});
