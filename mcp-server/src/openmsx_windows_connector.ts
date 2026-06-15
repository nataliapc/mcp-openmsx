/**
 * Windows control-channel connector for openMSX.
 *
 * On Windows, openMSX is a /SUBSYSTEM:WINDOWS GUI app whose stdin/stdout cannot
 * be piped, and its TCP control socket requires SSPI (Negotiate/NTLM) auth since
 * openMSX 0.7.1. This module owns the Windows-specific transport details so that
 * `openmsx.ts` keeps only high-level orchestration.
 *
 * Modes (env var `OPENMSX_WINDOWS_CONTROL`):
 *   - `stdio-proxy` (default): launch the bundled .NET helper
 *     `bin/win-x64/mcp-openmsx-sspi-proxy.exe <port>` which does SSPI and exposes
 *     a clean XML stdio channel, exactly like `openmsx -control stdio` on Linux.
 *   - `direct-sspi`: legacy path — Node opens the TCP socket and authenticates
 *     with `node-expose-sspi`. Handled inline by `OpenMSX` (kept as fallback).
 *   - `socket`: alias of `direct-sspi`.
 *   - `pipe`: reserved/not implemented.
 *
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import fsSync from 'fs';
import net from 'net';
import os from 'os';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { sleep } from './utils.js';

/** Directory of this module (works under both `src/` (tsx) and `dist/`). */
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

export type WindowsControlMode = 'stdio-proxy' | 'direct-sspi' | 'pipe';

/** Uniform control connection handed back to `openmsx.ts`. */
export interface WindowsControlConnection {
    mode: WindowsControlMode;
    /** Proxy child process (stdio-proxy mode) or null (direct-sspi). */
    controlProcess: ChildProcess | null;
    /** Stream to write XML commands towards openMSX. */
    input: NodeJS.WritableStream;
    /** Stream of XML output coming back from openMSX. */
    output: NodeJS.ReadableStream;
    /** Optional diagnostics stream (proxy stderr). */
    errorOutput?: NodeJS.ReadableStream;
    /** Direct TCP socket (direct-sspi mode) — unused for stdio-proxy. */
    tcpSocket?: net.Socket;
    /** Graceful close of the control channel. */
    close(): void;
    /** Hard close of the control channel. */
    forceClose(): void;
}

export interface WindowsConnectorOptions {
    /** The already-spawned openMSX GUI process (its pid locates the socket file). */
    openmsxProcess: ChildProcess;
    /** Diagnostic logger. */
    diag: (msg: string) => void;
    /** Environment (injectable for tests). */
    env?: NodeJS.ProcessEnv;
}

/** Resolve the Windows temp directory openMSX writes its socket file into. */
function windowsTempDir(env: NodeJS.ProcessEnv): string {
    return env.TEMP ?? env.TMP ?? path.join(os.homedir(), 'AppData', 'Local', 'Temp');
}

export class OpenMsxWindowsConnector {
    constructor(private readonly options: WindowsConnectorOptions) {}

    private get env(): NodeJS.ProcessEnv {
        return this.options.env ?? process.env;
    }

    /**
     * Resolve the requested Windows control mode from `OPENMSX_WINDOWS_CONTROL`.
     * Defaults to `stdio-proxy`. `socket` is a legacy alias of `direct-sspi`.
     * Throws on an unrecognised value.
     */
    static getControlMode(env: NodeJS.ProcessEnv = process.env): WindowsControlMode {
        const raw = env.OPENMSX_WINDOWS_CONTROL?.trim().toLowerCase() || 'stdio-proxy';
        if (raw === 'socket') return 'direct-sspi';
        if (raw === 'stdio-proxy' || raw === 'direct-sspi' || raw === 'pipe') return raw;
        throw new Error(
            `Invalid OPENMSX_WINDOWS_CONTROL="${raw}". ` +
            `Supported values: stdio-proxy, direct-sspi, socket, pipe.`
        );
    }

    /**
     * Resolve the path to the SSPI proxy executable.
     * Honours `OPENMSX_WINDOWS_PROXY_EXECUTABLE` for development overrides,
     * otherwise points at the bundled `bin/win-x64/mcp-openmsx-sspi-proxy.exe`
     * relative to this module (i.e. `../bin/win-x64/...` from `dist/`).
     */
    static resolveProxyExecutable(env: NodeJS.ProcessEnv = process.env): string {
        const override = env.OPENMSX_WINDOWS_PROXY_EXECUTABLE?.trim();
        if (override) return override;
        return path.resolve(MODULE_DIR, '..', 'bin', 'win-x64', 'mcp-openmsx-sspi-proxy.exe');
    }

    /**
     * Poll for openMSX's socket file and return the TCP control port it contains.
     * The file appears at `%TEMP%\openmsx-default\socket.<pid>` and holds a port
     * number (9938-9958).
     */
    async waitForWindowsSocketPort(socketFile: string, maxWaitMs = 8000, pollMs = 200): Promise<number> {
        let elapsed = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (fsSync.existsSync(socketFile)) {
                let raw: string;
                try {
                    raw = fsSync.readFileSync(socketFile, 'utf8').trim();
                } catch (e) {
                    throw new Error(`Cannot read openMSX socket file: ${e instanceof Error ? e.message : e}`);
                }
                const port = parseInt(raw, 10);
                if (!port || isNaN(port)) {
                    throw new Error(`Invalid port in openMSX socket file: "${raw}"`);
                }
                return port;
            }
            elapsed += pollMs;
            if (elapsed >= maxWaitMs) {
                throw new Error(`openMSX socket file not found after ${maxWaitMs}ms: ${socketFile}`);
            }
            await sleep(pollMs);
        }
    }

    /**
     * Connect via the `stdio-proxy` mode: wait for openMSX's control port, launch
     * the .NET SSPI proxy and return a uniform control connection backed by the
     * proxy's stdio. SSPI is handled entirely inside the proxy.
     */
    async connect(): Promise<WindowsControlConnection> {
        const mode = OpenMsxWindowsConnector.getControlMode(this.env);
        if (mode !== 'stdio-proxy') {
            throw new Error(`OpenMsxWindowsConnector.connect() only handles stdio-proxy mode (got "${mode}")`);
        }

        const pid = this.options.openmsxProcess.pid;
        if (!pid) throw new Error('openMSX process has no pid');

        const socketFile = path.join(windowsTempDir(this.env), 'openmsx-default', `socket.${pid}`);
        this.options.diag(`waiting for openMSX socket file: ${socketFile}`);
        const port = await this.waitForWindowsSocketPort(socketFile);
        this.options.diag(`openMSX control port: ${port}`);

        const proxyExe = OpenMsxWindowsConnector.resolveProxyExecutable(this.env);
        if (!fsSync.existsSync(proxyExe)) {
            throw new Error(
                `SSPI proxy executable not found: ${proxyExe}. ` +
                `Build it with: pnpm build:proxy:win-x64:docker ` +
                `(or set OPENMSX_WINDOWS_PROXY_EXECUTABLE to a built proxy).`
            );
        }

        this.options.diag(`launching SSPI proxy: "${proxyExe}" ${port}`);
        const proxy = spawn(proxyExe, [String(port)], {
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
        });
        if (!proxy.stdin || !proxy.stdout || !proxy.stderr) {
            throw new Error('Failed to create SSPI proxy stdio pipes');
        }

        return {
            mode,
            controlProcess: proxy,
            input: proxy.stdin,
            output: proxy.stdout,
            errorOutput: proxy.stderr,
            close: () => { try { proxy.stdin?.end(); } catch { /* ignore */ } },
            forceClose: () => { try { if (!proxy.killed) proxy.kill('SIGKILL'); } catch { /* ignore */ } },
        };
    }
}
