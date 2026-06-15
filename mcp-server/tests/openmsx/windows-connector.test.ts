import { describe, it, expect, vi, afterEach } from 'vitest';
import fsSync from 'fs';
import path from 'path';
import { OpenMsxWindowsConnector } from '../../src/openmsx_windows.js';

/**
 * Tests for OpenMsxWindowsConnector: control-mode resolution, proxy executable
 * resolution, and openMSX socket-file port polling. Pure logic + mocked fs —
 * no real process or network is involved.
 */

const PROXY_SUFFIX = path.join('bin', 'win-x64', 'mcp-openmsx-sspi-proxy.exe');

function newConnector(): OpenMsxWindowsConnector {
  return new OpenMsxWindowsConnector({ openmsxProcess: {} as any, diag: () => {} });
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── getControlMode ──────────────────────────────────────────────────────────

describe('OpenMsxWindowsConnector.getControlMode', () => {
  it('defaults to stdio-proxy when unset', () => {
    expect(OpenMsxWindowsConnector.getControlMode({})).toBe('stdio-proxy');
  });

  it('returns direct-sspi for OPENMSX_WINDOWS_CONTROL=direct-sspi', () => {
    expect(OpenMsxWindowsConnector.getControlMode({ OPENMSX_WINDOWS_CONTROL: 'direct-sspi' })).toBe('direct-sspi');
  });

  it('maps legacy alias socket → direct-sspi', () => {
    expect(OpenMsxWindowsConnector.getControlMode({ OPENMSX_WINDOWS_CONTROL: 'socket' })).toBe('direct-sspi');
  });

  it('returns pipe for OPENMSX_WINDOWS_CONTROL=pipe', () => {
    expect(OpenMsxWindowsConnector.getControlMode({ OPENMSX_WINDOWS_CONTROL: 'pipe' })).toBe('pipe');
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(OpenMsxWindowsConnector.getControlMode({ OPENMSX_WINDOWS_CONTROL: '  STDIO-PROXY  ' })).toBe('stdio-proxy');
  });

  it('throws a clear error on an invalid value', () => {
    expect(() => OpenMsxWindowsConnector.getControlMode({ OPENMSX_WINDOWS_CONTROL: 'bogus' }))
      .toThrow(/Invalid OPENMSX_WINDOWS_CONTROL="bogus"/);
  });
});

// ─── resolveProxyExecutable ──────────────────────────────────────────────────

describe('OpenMsxWindowsConnector.resolveProxyExecutable', () => {
  it('honours OPENMSX_WINDOWS_PROXY_EXECUTABLE override', () => {
    const custom = path.join('C:', 'tmp', 'my-proxy.exe');
    expect(OpenMsxWindowsConnector.resolveProxyExecutable({ OPENMSX_WINDOWS_PROXY_EXECUTABLE: custom })).toBe(custom);
  });

  it('falls back to the bundled bin/win-x64 path', () => {
    const resolved = OpenMsxWindowsConnector.resolveProxyExecutable({});
    expect(resolved.endsWith(PROXY_SUFFIX)).toBe(true);
    expect(path.isAbsolute(resolved)).toBe(true);
  });
});

// ─── waitForWindowsSocketPort ────────────────────────────────────────────────

describe('OpenMsxWindowsConnector.waitForWindowsSocketPort', () => {
  it('returns the port when the socket file exists with a valid value', async () => {
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(true);
    vi.spyOn(fsSync, 'readFileSync').mockReturnValue('9942\n' as any);

    const port = await newConnector().waitForWindowsSocketPort('/tmp/socket.123', 100, 10);
    expect(port).toBe(9942);
  });

  it('throws on invalid socket-file content', async () => {
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(true);
    vi.spyOn(fsSync, 'readFileSync').mockReturnValue('not-a-port' as any);

    await expect(newConnector().waitForWindowsSocketPort('/tmp/socket.123', 100, 10))
      .rejects.toThrow(/Invalid port/);
  });

  it('times out when the socket file never appears', async () => {
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(false);

    await expect(newConnector().waitForWindowsSocketPort('/tmp/socket.123', 40, 10))
      .rejects.toThrow(/not found after 40ms/);
  });
});
