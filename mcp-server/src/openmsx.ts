/**
 * openMSX wrapper class
 * 
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import fs from "fs/promises";
import fsSync from "fs";
import { extractDescriptionFromXML, decodeHtmlEntities, encodeHtmlEntities } from "./utils.js";
import { spawn, ChildProcess } from 'child_process';
import net from 'net';
import os from 'os';
import path from 'path';

/** True when running on Windows. Evaluated once at module load. */
const IS_WINDOWS = process.platform === 'win32';

/**
 * OpenMSX class for controlling the openMSX emulator via TCL commands.
 *
 * ## Protocol
 *
 * ### Linux/macOS
 *   `openmsx -control stdio` — commands via stdin, responses via stdout.
 *
 * ### Windows
 *   openMSX is compiled as /SUBSYSTEM:WINDOWS. Passing `stdio:'pipe'` to
 *   Node.js spawn breaks the renderer (GUI subsystem app ignores pipe handles).
 *   We spawn with `stdio: ['ignore', 'ignore', 'pipe']` so openMSX starts
 *   normally with its own window.
 *
 *   openMSX always creates a TCP socket file at:
 *     %TEMP%\openmsx-default\socket.<pid>
 *   containing a port number (9938-9958). However, since openMSX 0.7.1 the
 *   TCP socket requires **SSPI (Negotiate/NTLM) authentication** before it
 *   accepts any XML commands. Without authentication, openMSX closes the
 *   connection immediately (ECONNRESET).
 *
 *   SSPI handshake (variable rounds, loop until SEC_E_OK — typically 3):
 *     each round: client → [4-byte BE length][SSPI token]
 *                 server → [4-byte BE length][SSPI response]  (if SEC_I_CONTINUE_NEEDED)
 *   Then XML protocol (no server read after SEC_E_OK):
 *     client → `<openmsx-control>\n`
 *     server → `<openmsx-output>\n`   (confirms session open)
 *     client ↔ server: `<command>…</command>` / `<reply …>…</reply>`
 *
 *   npm package: node-expose-sspi (optional, Windows-only)
 *   Reference: openMSX debugger ConnectDialog.cpp + DeZog openmsxremote.ts
 *              https://openmsx.org/manual/openmsx-control.html
 */
/** Callbacks shared between emu_launch and platform-specific connection methods. */
interface LaunchCallbacks {
    diag: (msg: string) => void;
    safeResolve: (msg: string) => void;
    isResolved: () => boolean;
    onReady: (sendControlTag: boolean) => Promise<void>;
}

export class OpenMSX {
    private lastMachine: string | null = null;
    private process: ChildProcess | null = null;
    private isConnected: boolean = false;

    // Windows TCP socket — bidirectional after SSPI auth
    private tcpSocket: net.Socket | null = null;
    // Accumulated I/O data for readData() — shared by both platforms (never coexist)
    private ioBuffer: string = '';
    // Notify callback: fired when new I/O data arrives — shared by both platforms
    private ioNotify: (() => void) | null = null;
    // Serial command queue — ensures sendCommand calls never overlap on any platform
    private commandQueue: Promise<string> = Promise.resolve('');

    /**
     * Launch the openMSX emulator.
     * Linux/macOS: -control stdio via stdin/stdout pipes.
     * Windows: spawn with ignore+ignore+pipe, TCP socket + SSPI auth.
     */
    async emu_launch(executable: string, machine: string, extensions: string[]): Promise<string> {
        return new Promise((resolve) => {
            let resolved = false;
            const diagLog: string[] = [];
            const diag = (msg: string) => {
                console.error(`[mcp-openmsx] ${msg}`);
                diagLog.push(msg);
            };

            const safeResolve = (message: string) => {
                if (!resolved) {
                    resolved = true;
                    resolve(message);
                }
            };

            try {
                if (this.process && !this.process.killed) {
                    safeResolve(`Error: openMSX emulator instance is already running (current machine: ${this.lastMachine}). Close it first.`);
                    return;
                }
                this.resetIO();
                this.commandQueue = Promise.resolve(''); // reset queue for new session

                // Build args
                const args: string[] = [];
                if (!IS_WINDOWS) {
                    args.push('-control', 'stdio');
                }
                if (machine) {
                    this.lastMachine = machine;
                    args.push('-machine', machine);
                }
                if (extensions?.length > 0) {
                    extensions.forEach(ext => args.push('-ext', ext));
                }

                diag(`platform=${process.platform} IS_WINDOWS=${IS_WINDOWS}`);
                diag(`spawn: "${executable}" ${args.join(' ')}`);

                // Windows: stdin+stdout ignored (GUI subsystem — pipes don't work).
                // Linux/macOS: all three streams piped.
                this.process = spawn(executable, args, {
                    stdio: IS_WINDOWS ? ['ignore', 'ignore', 'pipe'] : ['pipe', 'pipe', 'pipe'],
                    windowsHide: false
                });

                if (IS_WINDOWS && !this.process.stderr) {
                    safeResolve('Error: Failed to create stderr pipe');
                    return;
                }
                if (!IS_WINDOWS && (!this.process.stdout || !this.process.stderr || !this.process.stdin)) {
                    safeResolve('Error: Failed to create stdio pipes');
                    return;
                }
                if (!this.process.pid || this.process.killed) {
                    this.process = null;
                    safeResolve('Error: Failed to launch openMSX process');
                    return;
                }
                diag(`process spawned PID=${this.process.pid}`);

                this.process.on('error', (error: NodeJS.ErrnoException) => {
                    diag(`process error: code=${error.code} ${error.message}`);
                    if (error.code === 'ENOENT') {
                        safeResolve(
                            `Error: openMSX executable not found: "${executable}". ` +
                            `Set OPENMSX_EXECUTABLE to the full path. ` +
                            `On Windows: C:\\Users\\<user>\\openMSX\\openmsx.exe or ` +
                            `C:\\Program Files\\openMSX\\openmsx.exe; ` +
                            `on macOS: /Applications/openMSX.app/Contents/MacOS/openmsx; ` +
                            `on Linux: openmsx (in PATH).`
                        );
                    } else {
                        safeResolve(`Error: ${error.message}`);
                    }
                });

                this.process.on('exit', (code, signal) => {
                    diag(`process exit: code=${code} signal=${signal} isConnected=${this.isConnected}`);
                    if (!resolved) {
                        safeResolve(
                            `Error: openMSX process exited unexpectedly (code=${code}, signal=${signal}). ` +
                            `Diagnostics: ${diagLog.join(' | ')}`
                        );
                    }
                    this.isConnected = false;
                    this.process = null;
                    this.resetIO();
                });

                this.process.stderr!.on('data', (data: Buffer) => {
                    const msg = data.toString().trim();
                    if (!this.isConnected) diag(`stderr: ${msg.substring(0, 300)}`);
                    if (msg.includes('Fatal error:') && !this.isConnected) {
                        this.forceClose();
                        safeResolve(`Error: ${msg}`);
                    }
                });

                const onOpenMSXReady = async (sendControlTag: boolean) => {
                    diag('onOpenMSXReady: sending initial commands');
                    // On Linux/macOS: we receive <openmsx-output> first unprompted,
                    // then we must send <openmsx-control> to start the session.
                    // On Windows: we already sent <openmsx-control> to trigger <openmsx-output>,
                    // so we must NOT send it again.
                    if (sendControlTag) {
                        this.writeData('<openmsx-control>\n');
                    }
                    // await each command so replies are consumed in order and don't
                    // contaminate ioBuffer for subsequent user commands
                    await this.sendCommand('set save_settings_on_exit off');
                    await this.sendCommand('set renderer SDLGL-PP');
                    await this.sendCommand('set power on');
                    await this.sendCommand('reverse start');
                    let result = 'Ok: openMSX emulator launched successfully';
                    if (machine) result += ` with machine "${machine}"`;
                    if (extensions?.length > 0) {
                        if (machine) result += ' and';
                        result += ` with extensions: "${extensions.join('", "')}"`;
                    }
                    result += ', is powered on, and replay mode is started.';
                    safeResolve(result);
                };

                const ctx: LaunchCallbacks = {
                    diag, safeResolve,
                    isResolved: () => resolved,
                    onReady: onOpenMSXReady,
                };
                if (IS_WINDOWS) {
                    this.launchConnectWindows(ctx);
                } else {
                    this.launchConnectLinux(ctx);
                }

                // Global timeout — 20s to allow for SSPI auth + slow VMs
                setTimeout(() => {
                    if (!this.isConnected) {
                        this.emu_close();
                        safeResolve(`Error: Timeout waiting for openMSX to start. Diagnostics: ${diagLog.join(' | ')}`);
                    }
                }, 20000);

            } catch (error) {
                safeResolve(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }

    /**
     * Windows connection: TCP socket + SSPI authentication.
     * Polls for the socket file, connects, authenticates, and starts the XML session.
     */
    private launchConnectWindows(ctx: LaunchCallbacks): void {
        const tmpDir = process.env.TEMP ?? process.env.TMP ??
                       path.join(os.homedir(), 'AppData', 'Local', 'Temp');
        const socketFile = path.join(tmpDir, 'openmsx-default', `socket.${this.process!.pid}`);
        ctx.diag(`waiting for socket file: ${socketFile}`);

        this.connectWindowsTCP(socketFile).then(async ({ socket, port }) => {
            ctx.diag(`TCP connected on port ${port}`);
            this.tcpSocket = socket;
            this.ioBuffer = '';

            socket.on('error', e => {
                ctx.diag(`TCP socket error: ${e.message}`);
                if (!ctx.isResolved()) ctx.safeResolve(`Error: TCP socket error: ${e.message}`);
            });
            socket.on('close', () => {
                ctx.diag('TCP socket closed');
                this.tcpSocket = null;
                this.isConnected = false;
            });

            // Register the main data handler BEFORE performSspiAuth.
            // This prevents any gap where data could be discarded:
            // performSspiAuth adds its own 'data' listener that runs in
            // parallel — both handlers receive data, but:
            //  - during SSPI: ioBuffer accumulates binary SSPI tokens
            //    (harmless, won't contain '<openmsx-output>')
            //  - after SSPI: ioBuffer is cleared, then <openmsx-control>
            //    is sent, and <openmsx-output> is detected normally.
            socket.on('data', (data: Buffer) => {
                const chunk = data.toString();

                // Accumulate all incoming data
                this.ioBuffer += chunk;

                // Signal readData() that new data arrived (notify pattern)
                if (this.ioNotify) {
                    const notify = this.ioNotify;
                    this.ioNotify = null;
                    notify();
                }

                // During launch: detect <openmsx-output> in the accumulated stream
                if (!this.isConnected && this.ioBuffer.includes('<openmsx-output>')) {
                    this.isConnected = true;
                    // Discard everything up to and including <openmsx-output>
                    this.ioBuffer = this.ioBuffer.substring(
                        this.ioBuffer.indexOf('<openmsx-output>') + '<openmsx-output>'.length
                    );
                    setTimeout(async () => {
                        if (!ctx.isResolved()) {
                            try { await ctx.onReady(false); }  // Windows: don't resend <openmsx-control>
                            catch (e) { ctx.safeResolve(`Error: Failed to send control commands - ${e instanceof Error ? e.message : e}`); }
                        }
                    }, 300);
                }
            });

            // SSPI authentication (adds its own parallel 'data' listener internally)
            try {
                ctx.diag('starting SSPI authentication...');
                await this.performSspiAuth(socket);
                ctx.diag('SSPI authentication successful');
            } catch (e) {
                ctx.safeResolve(
                    `Error: SSPI authentication failed: ${e instanceof Error ? e.message : e}. ` +
                    `Make sure 'node-expose-sspi' is installed: npm install node-expose-sspi`
                );
                return;
            }

            // Clear SSPI binary garbage from ioBuffer before XML session
            this.ioBuffer = '';

            // Send <openmsx-control> to initiate the XML session.
            // On Windows/TCP, openMSX sends <openmsx-output> in response.
            ctx.diag('sending <openmsx-control> to start XML session');
            socket.write('<openmsx-control>\n');

        }).catch(err => {
            ctx.diag(`connectWindowsTCP failed: ${err.message}`);
            ctx.safeResolve(`Error: ${err.message}`);
        });
    }

    /**
     * Linux/macOS connection: stdio pipes.
     * Registers stdout handler for ioBuffer accumulation and <openmsx-output> detection.
     */
    private launchConnectLinux(ctx: LaunchCallbacks): void {
        const FATAL_ERROR_GRACE_PERIOD = 500;
        let connectionTime: number | null = null;

        this.process!.stdout!.on('data', (data: Buffer) => {
            const output = data.toString();
            if (!this.isConnected) {
                if (output.includes('<openmsx-output>')) {
                    ctx.diag('<openmsx-output> detected on stdout');
                    this.isConnected = true;
                    this.ioBuffer = '';
                    connectionTime = Date.now();
                    setTimeout(async () => {
                        if (!ctx.isResolved()) {
                            try { await ctx.onReady(true); }  // Linux/macOS: must send <openmsx-control>
                            catch (e) { ctx.safeResolve(`Error: Failed to send control commands - ${e instanceof Error ? e.message : e}`); }
                        }
                    }, FATAL_ERROR_GRACE_PERIOD);
                }
            } else {
                // Accumulate for readData() — persistent shared ioBuffer
                this.ioBuffer += output;
                if (this.ioNotify) {
                    const notify = this.ioNotify;
                    this.ioNotify = null;
                    notify();
                }
            }
        });

        this.process!.stderr!.on('data', (data: Buffer) => {
            const msg = data.toString().trim();
            const isInGracePeriod = connectionTime && (Date.now() - connectionTime) < FATAL_ERROR_GRACE_PERIOD;
            if (msg.includes('Fatal error:') && (!this.isConnected || isInGracePeriod)) {
                this.forceClose();
                ctx.safeResolve(`Error: ${msg}`);
            }
        });
    }

    /**
     * SSPI (Negotiate/NTLM) authentication handshake — Windows only.
     * Required since openMSX 0.7.1 for TCP socket connections.
     * Uses `node-expose-sspi` v0.1.x optional npm package.
     *
     * Reference C++ implementation: openMSX debugger SspiNegotiateClient.cpp
     * Protocol: loop until SEC_E_OK — each round:
     *   client → [4-byte BE length][SSPI token]
     *   server → [4-byte BE length][SSPI response]  (if SEC_I_CONTINUE_NEEDED)
     * After SEC_E_OK: no server read — proceed directly with XML protocol.
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
            const result = sspiBuffer.slice(4, total);
            sspiBuffer = sspiBuffer.slice(total);  // consume only what we read
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
            // Remove SSPI data handler — main handler will be added after this returns
            socket.removeListener('data', onSspiData);
        }
    }

    /**
     * Poll for the TCP socket file, read the port, connect.
     */
    private connectWindowsTCP(socketFile: string): Promise<{ socket: net.Socket; port: number }> {
        return new Promise((resolve, reject) => {
            const maxWaitMs = 8000;
            const pollMs = 200;
            let elapsed = 0;
            const poll = () => {
                if (fsSync.existsSync(socketFile)) {
                    let port: number;
                    try { port = parseInt(fsSync.readFileSync(socketFile, 'utf8').trim(), 10); }
                    catch (e) { return reject(new Error(`Cannot read socket file: ${e}`)); }
                    if (!port || isNaN(port)) return reject(new Error(`Invalid port in socket file`));
                    const sock = net.createConnection(port, '127.0.0.1');
                    sock.once('connect', () => resolve({ socket: sock, port }));
                    sock.once('error', err => { sock.destroy(); reject(new Error(`TCP connect to ${port} failed: ${err.message}`)); });
                } else {
                    elapsed += pollMs;
                    if (elapsed >= maxWaitMs) {
                        reject(new Error(`openMSX socket file not found after ${maxWaitMs}ms: ${socketFile}`));
                    } else {
                        setTimeout(poll, pollMs);
                    }
                }
            };
            poll();
        });
    }

    private resetIO(): void {
        if (this.tcpSocket) {
            try { this.tcpSocket.destroy(); } catch (_) { /* ignore */ }
            this.tcpSocket = null;
        }
        this.ioBuffer = '';
        this.ioNotify = null;
    }

    async emu_close(): Promise<string> {
        return new Promise((resolve) => {
            let resolved = false;
            const safeResolve = (message: string) => {
                if (!resolved) {
                    resolved = true;
                    resolve(message);
                }
            };
            if (!this.process) { safeResolve("Error: No emulator process running"); return; }
            this.process.on('exit', () => {
                this.lastMachine = null;
                this.isConnected = false;
                this.process = null;
                this.resetIO();
                safeResolve("Ok: Emulator process closed successfully");
            });
            this.process.on('error', (error: Error) => safeResolve(`Error: error closing emulator: ${error.message}`));
            if (this.isConnected) {
                this.sendCommand('exit').catch(() => {
                    try { this.process?.kill(); } catch (_) { /* ignore */ }
                });
            } else {
                this.forceClose();
                safeResolve("Error: Emulator process had to be force killed");
            }
            setTimeout(() => { this.forceClose(); safeResolve("Error: Timeout. Emulator process had to be force killed"); }, 1000);
        });
    }

    async emu_status(): Promise<string> {
        try {
            const response = await this.sendCommand('machine_info');
            if (response.startsWith('Error:')) return response;
            const skipInfo = ['issubslotted', 'input_port', 'slot', 'isexternalslot', 'output_port'];
            const parameters = response.trim().split(' ');
            const machineInfo: Record<string, string> = {};
            for (const param of parameters) {
                const trimmed = param.trim();
                if (skipInfo.includes(trimmed) || !trimmed) continue;
                machineInfo[trimmed] = (await this.sendCommand(`machine_info ${trimmed}`)).trim();
            }
            return JSON.stringify(machineInfo, null, 2);
        } catch (error) {
            return `Error: Failed to get machine status - ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    async emu_isInBasic(): Promise<boolean> {
        try {
            const response = await this.sendCommand('slotselect');
            return response.includes('0000: slot 0') && response.includes('4000: slot 0');
        } catch (_) { return false; }
    }

    async getMachineList(machinesDirectory: string): Promise<string> {
        return this.getXMLList(machinesDirectory, 'machines');
    }

    async getExtensionList(extensionDirectory: string): Promise<string> {
        return this.getXMLList(extensionDirectory, 'extensions');
    }

    private async getXMLList(directory: string, entityName: string): Promise<string> {
        try {
            const allFiles = await fs.readdir(directory);
            const items = await Promise.all(
                allFiles.filter(f => f.endsWith('.xml')).map(async f => ({
                    name: f.replace('.xml', ''),
                    description: await extractDescriptionFromXML(path.join(directory, f))
                }))
            );
            return items.length ? JSON.stringify(items, null, 2) : `Error: No ${entityName} found.`;
        } catch (error) {
            return `Error: error reading ${entityName} directory - ${error instanceof Error ? error.message : error}`;
        }
    }

    /**
     * Send a TCL command to openMSX and return the response.
     *
     * Internally serialized via a promise queue so concurrent callers (with or
     * without `await`) never overlap — each command waits for the previous one
     * to complete before writing to the channel and reading the reply.
     * This is safe on all platforms (Linux/macOS stdio and Windows TCP).
     */
    async sendCommand(command: string): Promise<string> {
        const execute = async (): Promise<string> => {
            try {
                this.writeData(`<command>${encodeHtmlEntities(command)}</command>\n`);
                const output = (await this.readData()).trim();
                const replyMatch = output.match(/<reply result="(ok|nok)"[^>]*>(.*?)<\/reply>/s);
                if (replyMatch) {
                    const content = decodeHtmlEntities(replyMatch[2].trim());
                    return replyMatch[1] === 'ok' ? content : `Error: ${content}`;
                }
                return decodeHtmlEntities(output);
            } catch (error) {
                return `Error: ${error instanceof Error ? error.message : error}`;
            }
        };
        // Chain onto the queue: wait for the previous command to finish, then run
        const result = this.commandQueue.then(execute, execute);
        // Update the queue tail — swallow errors so the chain never breaks
        this.commandQueue = result.then(() => '', () => '');
        return result;
    }

    private writeData(data: string): void {
        if (!this.process || !this.isConnected) throw new Error('openMSX process not running or not connected');
        if (IS_WINDOWS) {
            if (!this.tcpSocket || this.tcpSocket.destroyed) throw new Error('Windows TCP socket not open');
            this.tcpSocket.write(data);
        } else {
            if (!this.process.stdin) throw new Error('openMSX stdin not available');
            this.process.stdin.write(data);
        }
    }

    private readData(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) { reject(new Error('openMSX process not running or not connected')); return; }
            if (IS_WINDOWS) {
                if (!this.tcpSocket || this.tcpSocket.destroyed) { reject(new Error('Windows TCP socket not open')); return; }
            } else {
                if (!this.process?.stdout) { reject(new Error('openMSX stdout not available')); return; }
            }
            // Unified for both platforms: accumulate in ioBuffer until a complete
            // <reply>…</reply> block, then extract and return it.
            const RESPONSE_TIMEOUT = 10000;
            const timer = setTimeout(() => {
                this.ioNotify = null;
                this.ioBuffer = '';
                reject(new Error('Timeout waiting for openMSX response'));
            }, RESPONSE_TIMEOUT);
            const tryExtractReply = () => {
                const end = this.ioBuffer.indexOf('</reply>');
                if (end !== -1) {
                    clearTimeout(timer);
                    const full = this.ioBuffer.substring(0, end + '</reply>'.length);
                    this.ioBuffer = this.ioBuffer.substring(end + '</reply>'.length);
                    resolve(full);
                } else {
                    this.ioNotify = tryExtractReply;
                }
            };
            tryExtractReply();
        });
    }

    async destroy(): Promise<void> {
        if (this.process && !this.process.killed) await this.emu_close();
    }

    forceClose(): void {
        if (this.process && !this.process.killed) {
            try { this.process.kill('SIGKILL'); } catch (_) { /* ignore */ }
            this.process = null;
            this.isConnected = false;
        }
        this.resetIO();
    }
}

export const openMSXInstance = new OpenMSX();
