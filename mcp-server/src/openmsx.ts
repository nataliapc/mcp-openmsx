/**
 * openMSX wrapper class
 * 
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import fs from "fs/promises";
import { extractDescriptionFromXML, decodeHtmlEntities, encodeHtmlEntities } from "./utils.js";
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { OpenMsxWindowsConnector, WindowsControlConnection, WindowsControlMode } from "./openmsx_windows.js";

/** True when running on Windows. Evaluated once at module load. */
const IS_WINDOWS = process.platform === 'win32';

/**
 * OpenMSX class for controlling the openMSX emulator via TCL commands.
 *
 * ## Protocol
 *
 * The XML control protocol is platform-agnostic: the client opens its command
 * stream with `<openmsx-control>`, openMSX replies with `<openmsx-output>`, then
 * `<command>…</command>` / `<reply …>…</reply>` exchanges follow. This class owns
 * that protocol, the serial command queue and the shared I/O buffer.
 *
 * The transport differs per platform:
 *   - **Linux/macOS**: `openmsx -control stdio` — commands via stdin, responses
 *     via stdout (see {@link launchConnectLinux}).
 *   - **Windows**: openMSX is a /SUBSYSTEM:WINDOWS GUI app whose TCP control
 *     socket needs SSPI auth. All of that (mode selection, socket-file polling,
 *     TCP+SSPI, or the stdio proxy) lives in `openmsx_windows.ts`; this class
 *     just consumes the {@link WindowsControlConnection} it returns.
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

    // Active writable control channel: process.stdin (Linux/macOS) or the
    // Windows connection's input (TCP socket / SSPI proxy stdin).
    private controlWritable: NodeJS.WritableStream | null = null;
    // Windows-only control connection (TCP+SSPI or stdio proxy). Owns the
    // transport and its teardown; null on Linux/macOS. See openmsx_windows.ts.
    private controlConnection: WindowsControlConnection | null = null;
    // Accumulated I/O data for readData() — shared by all transports (never coexist)
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

                // Resolve the Windows control mode up front so an invalid value
                // fails before we spawn openMSX (avoids orphaned GUI processes).
                let windowsMode: WindowsControlMode | null = null;
                if (IS_WINDOWS) {
                    try {
                        windowsMode = OpenMsxWindowsConnector.getControlMode();
                    } catch (e) {
                        safeResolve(`Error: ${e instanceof Error ? e.message : e}`);
                        return;
                    }
                    if (windowsMode === 'pipe') {
                        safeResolve('Error: OPENMSX_WINDOWS_CONTROL=pipe is reserved but not implemented yet');
                        return;
                    }
                    diag(`Windows control mode: ${windowsMode}`);
                }

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
     * Windows connection (both modes). All transport — socket-file polling, TCP
     * connect, SSPI, or proxy launch — is delegated to {@link OpenMsxWindowsConnector},
     * which returns a uniform connection with SSPI already done. Here we only
     * attach the generic XML stream handlers and open the session. Both Windows
     * modes use the TCP semantics: we send `<openmsx-control>` and openMSX replies
     * with `<openmsx-output>`.
     */
    private launchConnectWindows(ctx: LaunchCallbacks): void {
        const connector = new OpenMsxWindowsConnector({
            openmsxProcess: this.process!,
            diag: ctx.diag,
        });

        connector.connect().then((connection) => {
            this.controlConnection = connection;
            this.controlWritable = connection.input;
            this.ioBuffer = '';

            // Diagnostics from the SSPI proxy (stderr only — never stdout).
            connection.errorOutput?.on('data', (data: Buffer) => {
                const msg = data.toString().trim();
                if (msg && !this.isConnected) ctx.diag(`control stderr: ${msg.substring(0, 300)}`);
            });
            // stdio-proxy: proxy exiting before we connect means SSPI/connect failed.
            connection.controlProcess?.on('exit', (code, signal) => {
                ctx.diag(`control process exit: code=${code} signal=${signal} isConnected=${this.isConnected}`);
                if (!this.isConnected && !ctx.isResolved()) {
                    ctx.safeResolve(`Error: control process exited before connecting (code=${code}, signal=${signal}).`);
                }
            });
            // direct-sspi: TCP socket errors / close.
            connection.tcpSocket?.on('error', e => {
                ctx.diag(`TCP socket error: ${e.message}`);
                if (!ctx.isResolved()) ctx.safeResolve(`Error: TCP socket error: ${e.message}`);
            });
            connection.tcpSocket?.on('close', () => {
                ctx.diag('TCP socket closed');
                this.isConnected = false;
            });
            connection.output.on('error', (e: Error) => ctx.diag(`control stream error: ${e.message}`));

            this.attachOutputHandler(connection.output, ctx);

            // Open the XML session: we send <openmsx-control>; openMSX replies with
            // <openmsx-output>. (In stdio-proxy the proxy forwards it after SSPI.)
            ctx.diag('sending <openmsx-control> to start XML session');
            connection.input.write('<openmsx-control>\n');
        }).catch((err: Error) => {
            ctx.diag(`windows connect failed: ${err.message}`);
            ctx.safeResolve(`Error: ${err.message}`);
        });
    }

    /**
     * Shared output handler for both Windows modes (proxy stdout or TCP socket):
     * accumulate into `ioBuffer`, wake any pending `readData()`, and on the first
     * `<openmsx-output>` mark connected and trigger the initial command sequence
     * with `onReady(false)` (we already sent `<openmsx-control>`). Linux/macOS uses
     * its own variant in {@link launchConnectLinux} (openMSX emits the tag unprompted).
     */
    private attachOutputHandler(output: NodeJS.ReadableStream, ctx: LaunchCallbacks): void {
        output.on('data', (data: Buffer) => {
            const chunk = data.toString();
            this.ioBuffer += chunk;
            if (this.ioNotify) {
                const notify = this.ioNotify;
                this.ioNotify = null;
                notify();
            }
            if (!this.isConnected && this.ioBuffer.includes('<openmsx-output>')) {
                this.isConnected = true;
                this.ioBuffer = this.ioBuffer.substring(
                    this.ioBuffer.indexOf('<openmsx-output>') + '<openmsx-output>'.length
                );
                setTimeout(async () => {
                    if (!ctx.isResolved()) {
                        try { await ctx.onReady(false); }  // <openmsx-control> already sent
                        catch (e) { ctx.safeResolve(`Error: Failed to send control commands - ${e instanceof Error ? e.message : e}`); }
                    }
                }, 300);
            }
        });
    }

    /**
     * Linux/macOS connection: stdio pipes.
     * Registers stdout handler for ioBuffer accumulation and <openmsx-output> detection.
     */
    private launchConnectLinux(ctx: LaunchCallbacks): void {
        const FATAL_ERROR_GRACE_PERIOD = 500;
        let connectionTime: number | null = null;

        this.controlWritable = this.process!.stdin;

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

    private resetIO(): void {
        // Tear down the Windows control connection (TCP socket / SSPI proxy).
        // No-op on Linux/macOS where controlConnection is null.
        if (this.controlConnection) {
            try { this.controlConnection.forceClose(); } catch (_) { /* ignore */ }
            this.controlConnection = null;
        }
        this.controlWritable = null;
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
                // resetIO() also tears down the Windows control connection (proxy/socket).
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
        const channel = this.controlWritable as (NodeJS.WritableStream & { destroyed?: boolean }) | null;
        if (!channel || channel.destroyed) throw new Error('openMSX control channel not available');
        channel.write(data);
    }

    private readData(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) { reject(new Error('openMSX process not running or not connected')); return; }
            if (!this.controlWritable) { reject(new Error('openMSX control channel not available')); return; }
            // Unified for all transports: accumulate in ioBuffer until a complete
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
        // Kill the openMSX emulator; resetIO() force-closes the control connection
        // (TCP socket / SSPI proxy) on Windows.
        if (this.process && !this.process.killed) {
            try { this.process.kill('SIGKILL'); } catch (_) { /* ignore */ }
        }
        this.process = null;
        this.isConnected = false;
        this.resetIO();
    }
}

export const openMSXInstance = new OpenMSX();
