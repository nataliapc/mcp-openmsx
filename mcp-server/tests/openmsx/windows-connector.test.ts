import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fsSync from 'fs';
import { EventEmitter } from 'events';
import net from 'net';
import { spawn } from 'child_process';
import path from 'path';
import { OpenMsxWindowsConnector } from '../../src/openmsx_windows.js';

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('net', () => ({
  default: {
    createConnection: vi.fn(),
  },
}));

/**
 * Tests for OpenMsxWindowsConnector: control-mode resolution, proxy executable
 * resolution, and openMSX socket-file port polling. Pure logic + mocked fs —
 * no real process or network is involved.
 */

const PROXY_SUFFIX = path.join('bin', 'win-x64', 'mcp-openmsx-sspi-proxy.exe');
const mockSpawn = vi.mocked(spawn);
const mockCreateConnection = vi.mocked(net.createConnection);

function newConnector(): OpenMsxWindowsConnector {
  return new OpenMsxWindowsConnector({ openmsxProcess: {} as any, diag: () => {} });
}

function createProxyProcess() {
  return Object.assign(new EventEmitter(), {
    killed: false,
    stdin: { write: vi.fn(), end: vi.fn() },
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn(function (this: { killed: boolean }) { this.killed = true; }),
  });
}

function createTcpSocket() {
  return Object.assign(new EventEmitter(), {
    destroy: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    pause: vi.fn(),
  });
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

  it('throws when the socket file cannot be read', async () => {
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(true);
    vi.spyOn(fsSync, 'readFileSync').mockImplementation(() => {
      throw new Error('EACCES');
    });

    await expect(newConnector().waitForWindowsSocketPort('/tmp/socket.123', 100, 10))
      .rejects.toThrow('Cannot read openMSX socket file: EACCES');
  });

  it('rejects port zero as invalid', async () => {
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(true);
    vi.spyOn(fsSync, 'readFileSync').mockReturnValue('0' as any);

    await expect(newConnector().waitForWindowsSocketPort('/tmp/socket.123', 100, 10))
      .rejects.toThrow('Invalid port in openMSX socket file: "0"');
  });

  it('returns the port when the socket file appears after polling', async () => {
    vi.spyOn(fsSync, 'existsSync')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    vi.spyOn(fsSync, 'readFileSync').mockReturnValue('9950' as any);

    await expect(newConnector().waitForWindowsSocketPort('/tmp/socket.123', 100, 1))
      .resolves.toBe(9950);
  });

  it('times out when the socket file never appears', async () => {
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(false);

    await expect(newConnector().waitForWindowsSocketPort('/tmp/socket.123', 40, 10))
      .rejects.toThrow(/not found after 40ms/);
  });
});

describe('OpenMsxWindowsConnector.connect', () => {
  beforeEach(() => {
    mockSpawn.mockReset();
  });

  it('rejects the reserved pipe mode before checking the process', async () => {
    const connector = new OpenMsxWindowsConnector({
      openmsxProcess: {} as any,
      diag: () => {},
      env: { OPENMSX_WINDOWS_CONTROL: 'pipe' },
    });

    await expect(connector.connect())
      .rejects.toThrow('OPENMSX_WINDOWS_CONTROL=pipe is reserved but not implemented yet');
  });

  it('rejects a process without a pid', async () => {
    const connector = new OpenMsxWindowsConnector({
      openmsxProcess: { pid: 0 } as any,
      diag: () => {},
      env: {},
    });

    await expect(connector.connect()).rejects.toThrow('openMSX process has no pid');
  });

  it('connects through the stdio proxy and exposes lifecycle controls', async () => {
    const proxy = createProxyProcess();
    mockSpawn.mockReturnValue(proxy as any);
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(true);
    vi.spyOn(fsSync, 'readFileSync').mockReturnValue('9942\n' as any);
    const diag = vi.fn();
    const connector = new OpenMsxWindowsConnector({
      openmsxProcess: { pid: 123 } as any,
      diag,
      env: { TEMP: 'C:\\Temp' },
    });

    const connection = await connector.connect();

    expect(connection.mode).toBe('stdio-proxy');
    expect(connection.controlProcess).toBe(proxy);
    expect(mockSpawn).toHaveBeenCalledWith(
      expect.stringContaining('mcp-openmsx-sspi-proxy.exe'),
      ['9942'],
      { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true },
    );
    expect(diag).toHaveBeenCalledWith(
      'waiting for openMSX socket file: C:\\Temp/openmsx-default/socket.123',
    );

    connection.input.write('test');
    expect(proxy.stdin.write).toHaveBeenCalledWith('test');
    connection.close();
    expect(proxy.stdin.end).toHaveBeenCalledOnce();
    connection.forceClose();
    expect(proxy.kill).toHaveBeenCalledWith('SIGKILL');
  });

  it('reports a missing proxy executable', async () => {
    vi.spyOn(fsSync, 'existsSync').mockImplementation((filePath: fsSync.PathLike) =>
      !filePath.toString().includes('mcp-openmsx-sspi-proxy.exe'));
    vi.spyOn(fsSync, 'readFileSync').mockReturnValue('9942' as any);
    const connector = new OpenMsxWindowsConnector({
      openmsxProcess: { pid: 123 } as any,
      diag: () => {},
      env: { TEMP: '/tmp' },
    });

    await expect(connector.connect()).rejects.toThrow('SSPI proxy executable not found');
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('reports incomplete proxy pipes', async () => {
    const proxy = createProxyProcess();
    proxy.stderr = null as any;
    mockSpawn.mockReturnValue(proxy as any);
    vi.spyOn(fsSync, 'existsSync').mockReturnValue(true);
    vi.spyOn(fsSync, 'readFileSync').mockReturnValue('9942' as any);
    const connector = new OpenMsxWindowsConnector({
      openmsxProcess: { pid: 123 } as any,
      diag: () => {},
      env: { TEMP: '/tmp' },
    });

    await expect(connector.connect()).rejects.toThrow('Failed to create SSPI proxy stdio pipes');
  });
});

describe('OpenMsxWindowsConnector TCP connection', () => {
  it('resolves when the TCP socket connects', async () => {
    const socket = createTcpSocket();
    mockCreateConnection.mockReturnValue(socket as any);
    const connector = newConnector();

    const connectionPromise = (connector as any).tcpConnect(9942) as Promise<unknown>;
    socket.emit('connect');

    await expect(connectionPromise).resolves.toBe(socket);
    expect(mockCreateConnection).toHaveBeenCalledWith(9942, '127.0.0.1');
  });

  it('destroys the socket and reports TCP errors', async () => {
    const socket = createTcpSocket();
    mockCreateConnection.mockReturnValue(socket as any);
    const connector = newConnector();

    const connectionPromise = (connector as any).tcpConnect(9942) as Promise<unknown>;
    socket.emit('error', new Error('connection refused'));

    await expect(connectionPromise).rejects.toThrow('TCP connect to 9942 failed: connection refused');
    expect(socket.destroy).toHaveBeenCalledOnce();
  });
});
