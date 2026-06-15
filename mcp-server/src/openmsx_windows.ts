/**
 * Windows control-channel connector for openMSX.
 *
 * On Windows, openMSX is a /SUBSYSTEM:WINDOWS GUI app whose stdin/stdout cannot
 * be piped, and its TCP control socket requires SSPI (Negotiate/NTLM) auth since
 * openMSX 0.7.1. This module owns ALL Windows-specific transport details (mode
 * selection, socket-file polling, TCP connect, SSPI handshake, proxy launch) so
 * that `openmsx.ts` keeps only platform-agnostic orchestration: it consumes the
 * returned {@link WindowsControlConnection} and attaches the same generic XML
 * stream handlers it uses on Linux/macOS.
 *
 * Modes (env var `OPENMSX_WINDOWS_CONTROL`):
 *   - `stdio-proxy` (default): launch the bundled .NET helper
 *     `bin/win-x64/mcp-openmsx-sspi-proxy.exe <port>` which does SSPI and exposes
 *     a clean XML stdio channel, exactly like `openmsx -control stdio` on Linux.
 *   - `direct-sspi`: Node opens the TCP socket and authenticates with
 *     `node-expose-sspi`. Fallback path.
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
     * Establish the Windows control channel for the configured mode and return a
     * uniform connection. SSPI is fully completed before returning: for
     * `direct-sspi` here in Node; for `stdio-proxy` inside the .NET helper. The
     * caller only has to attach generic XML stream handlers and send
     * `<openmsx-control>`.
     */
    async connect(): Promise<WindowsControlConnection> {
        const mode = OpenMsxWindowsConnector.getControlMode(this.env);
        if (mode === 'pipe') {
            throw new Error('OPENMSX_WINDOWS_CONTROL=pipe is reserved but not implemented yet');
        }

        const pid = this.options.openmsxProcess.pid;
        if (!pid) throw new Error('openMSX process has no pid');

        const socketFile = path.join(windowsTempDir(this.env), 'openmsx-default', `socket.${pid}`);
        this.options.diag(`waiting for openMSX socket file: ${socketFile}`);
        const port = await this.waitForWindowsSocketPort(socketFile);
        this.options.diag(`openMSX control port: ${port}`);

        return mode === 'stdio-proxy'
            ? this.connectStdioProxy(port)
            : this.connectDirectSspi(port);
    }

    /**
     * `stdio-proxy`: launch the bundled .NET helper (it connects to openMSX, does
     * SSPI and pipes raw XML over its stdio). SSPI never touches Node.
     */
    private connectStdioProxy(port: number): WindowsControlConnection {
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
            mode: 'stdio-proxy',
            controlProcess: proxy,
            input: proxy.stdin,
            output: proxy.stdout,
            errorOutput: proxy.stderr,
            close: () => { try { proxy.stdin?.end(); } catch { /* ignore */ } },
            forceClose: () => { try { if (!proxy.killed) proxy.kill('SIGKILL'); } catch { /* ignore */ } },
        };
    }

    /**
     * `direct-sspi`: open the TCP socket and authenticate from Node with
     * `node-expose-sspi`. The returned socket is a Duplex used for both XML
     * directions.
     */
    private async connectDirectSspi(port: number): Promise<WindowsControlConnection> {
        const socket = await this.tcpConnect(port);
        this.options.diag('starting SSPI authentication...');
        await this.performSspiAuth(socket);
        this.options.diag('SSPI authentication successful');

        return {
            mode: 'direct-sspi',
            controlProcess: null,
            tcpSocket: socket,
            input: socket,
            output: socket,
            close: () => { try { socket.end(); } catch { /* ignore */ } },
            forceClose: () => { try { socket.destroy(); } catch { /* ignore */ } },
        };
    }

    /** Open a TCP connection to openMSX's loopback control port. */
    private tcpConnect(port: number): Promise<net.Socket> {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection(port, '127.0.0.1');
            socket.once('connect', () => resolve(socket));
            socket.once('error', err => {
                socket.destroy();
                reject(new Error(`TCP connect to ${port} failed: ${err.message}`));
            });
        });
    }

    /**
     * SSPI (Negotiate/NTLM) authentication handshake — Windows only.
     * Required since openMSX 0.7.1 for TCP socket connections.
     * Uses the optional `node-expose-sspi` v0.1.x package.
     *
     * Reference C++ implementation: openMSX debugger SspiNegotiateClient.cpp
     * Protocol: loop until SEC_E_OK — each round:
     *   client → [4-byte BE length][SSPI token]
     *   server → [4-byte BE length][SSPI response]  (if SEC_I_CONTINUE_NEEDED)
     * After SEC_E_OK: no server read — the XML protocol begins.
     *
     * The socket is paused before returning so any data openMSX sends after auth
     * buffers until the caller attaches its own `data` handler (no data is lost).
     */
    private async performSspiAuth(socket: net.Socket): Promise<void> {
        let nes: any;
        try {
            const { createRequire } = await import('module');
            const req = createRequire(import.meta.url);
            nes = req('node-expose-sspi');
        } catch (e) {
            throw new Error(
                `node-expose-sspi not available (${e instanceof Error ? e.message : e}). ` +
                `Install with: npm install node-expose-sspi`
            );
        }

        // Accumulate TCP data for length-prefixed reads during SSPI phase.
        // Pattern: onSspiData appends to buffer and NOTIFIES (does not clear).
        // readLengthPrefixed checks the buffer size after each notification.
        let sspiBuffer = Buffer.alloc(0);
        let sspiNotify: (() => void) | null = null;
        const onSspiData = (chunk: Buffer) => {
            sspiBuffer = Buffer.concat([sspiBuffer, chunk]);
            if (sspiNotify) {
                const notify = sspiNotify;
                sspiNotify = null;
                notify();  // just signal — buffer stays intact
            }
        };
        socket.on('data', onSspiData);

        // Wait until new data arrives (doesn't clear the buffer)
        const waitMore = (): Promise<void> => new Promise(resolve => {
            sspiNotify = resolve;
        });

        const readLengthPrefixed = async (): Promise<Buffer> => {
            // Wait until we have at least the 4-byte length prefix
            while (sspiBuffer.length < 4) await waitMore();
            const len = sspiBuffer.readUInt32BE(0);
            const total = 4 + len;
            // Wait until the full payload has arrived
            while (sspiBuffer.length < total) await waitMore();
            const result = sspiBuffer.subarray(4, total);
            sspiBuffer = sspiBuffer.subarray(total);  // consume only what we read
            return result;
        };

        const sendToken = (token: ArrayBuffer): void => {
            const buf = Buffer.from(token);
            const lenBuf = Buffer.alloc(4);
            lenBuf.writeUInt32BE(buf.length, 0);
            socket.write(lenBuf);
            socket.write(buf);
        };

        try {
            // node-expose-sspi v0.1.x API:
            //   AcquireCredentialsHandle → CredentialWithExpiry { credential, tsExpiry }
            //   InitializeSecurityContextInput.credential = CredHandle (the .credential property)
            //   InitializeSecurityContextInput.SecBufferDesc = server's token (NOT serverSecurityContext)
            //   InitializeSecurityContextInput.contextReq = string[] of ISC_REQ_* flags
            //   Flags from openMSX C++ ref: ISC_REQ_ALLOCATE_MEMORY | ISC_REQ_CONNECTION | ISC_REQ_STREAM
            const credWithExpiry = nes.sspi.AcquireCredentialsHandle({
                packageName: 'Negotiate',
                credentialUse: 'SECPKG_CRED_OUTBOUND',
            });
            const credential = credWithExpiry.credential;
            const packageInfo = nes.sspi.QuerySecurityPackageInfo('Negotiate');
            const ISC_FLAGS = ['ISC_REQ_ALLOCATE_MEMORY', 'ISC_REQ_CONNECTION', 'ISC_REQ_STREAM'];

            let contextHandle: any = undefined;
            let serverSecBufDesc: any = undefined;

            // Loop until SEC_E_OK (mirrors C++ reference implementation)
            while (true) {
                const ctxInput: any = {
                    credential,
                    targetName: '',
                    cbMaxToken: packageInfo.cbMaxToken,
                    contextReq: ISC_FLAGS,
                    targetDataRep: 'SECURITY_NETWORK_DREP',
                };
                if (contextHandle !== undefined) ctxInput.contextHandle = contextHandle;
                if (serverSecBufDesc !== undefined) ctxInput.SecBufferDesc = serverSecBufDesc;

                const clientCtx = nes.sspi.InitializeSecurityContext(ctxInput);
                contextHandle = clientCtx.contextHandle;

                // Send our token to the server (if non-empty)
                const tokenBuf = clientCtx.SecBufferDesc?.buffers?.[0];
                if (tokenBuf && (tokenBuf as ArrayBuffer).byteLength > 0) {
                    sendToken(tokenBuf as ArrayBuffer);
                }

                if (clientCtx.SECURITY_STATUS === 'SEC_E_OK') {
                    // Auth complete — no final read from server, proceed to XML
                    break;
                }
                if (clientCtx.SECURITY_STATUS !== 'SEC_I_CONTINUE_NEEDED') {
                    throw new Error(`SSPI error: ${clientCtx.SECURITY_STATUS}`);
                }

                // Read server's response token
                const response = await readLengthPrefixed();
                const responseAB = response.buffer.slice(
                    response.byteOffset,
                    response.byteOffset + response.byteLength
                );
                serverSecBufDesc = { ulVersion: 0, buffers: [responseAB] };
            }
        } finally {
            // Remove the SSPI data listener and pause the socket so any post-auth
            // bytes buffer until the caller attaches its own 'data' handler.
            socket.removeListener('data', onSspiData);
            socket.pause();
        }
    }
}
