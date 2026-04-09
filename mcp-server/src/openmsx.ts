/**
 * openMSX wrapper class
 * 
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import fs from "fs/promises";
import { extractDescriptionFromXML, decodeHtmlEntities, encodeHtmlEntities } from "./utils.js";
import { spawn, ChildProcess } from 'child_process';
import { createWriteStream, WriteStream } from 'fs';
import path from 'path';

/** True when running on Windows. Evaluated once at module load. */
const IS_WINDOWS = process.platform === 'win32';


/**
 * OpenMSX class for controlling the openMSX emulator via TCL commands over stdio (Linux/macOS)
 * or a Windows named pipe (Windows).
 *
 * Protocol summary (same XML protocol on all platforms):
 *   openMSX → stdout  : XML output including <openmsx-output>, <reply>, <log>, <update>
 *   controller → openMSX : XML commands via stdin (stdio mode) or named pipe (pipe mode)
 *
 * On Linux/macOS: openmsx -control stdio
 *   Commands are sent via the child process stdin; replies come on stdout.
 *
 * On Windows: openmsx -control pipe:<pipename>
 *   openMSX reads commands from \\.\pipe\<pipename> (a Windows named pipe).
 *   Replies/output are still written to stdout (captured by Node's stdio pipes).
 *   We write commands to the named pipe using a WriteStream opened on the pipe path.
 *
 * Reference: https://openmsx.org/manual/openmsx-control.html
 */
export class OpenMSX {
    private lastMachine: string | null = null;
    private process: ChildProcess | null = null;
    private isConnected: boolean = false;

    // Windows named pipe write stream (only used on Windows with -control pipe)
    private pipeWriter: WriteStream | null = null;

    /**
     * Launch the openMSX emulator in stdio control mode (Linux/macOS)
     * or pipe control mode (Windows).
     * @param machine - MSX machine to emulate (e.g., 'Panasonic_FS-A1GT', 'C-BIOS_MSX2+')
     * @param extensions - Array of extensions to load (e.g., ['fmpac', 'ide'])
     * @returns Promise that resolves when the emulator is ready
     */
    async emu_launch(executable: string, machine: string, extensions: string[]): Promise<string> {
        return new Promise((resolve) => {
            let resolved = false;
            let connectionTime: number | null = null;
            const FATAL_ERROR_GRACE_PERIOD = 500; // 1/2 second grace period after connection

            const safeResolve = (message: string) => {
                if (!resolved) {
                    resolved = true;
                    resolve(message);
                }
            };

            try {
                // Check if emulator is already running
                if (this.process && !this.process.killed) {
                    safeResolve(`Error: openMSX emulator instance is already running (currrent machine: ${this.lastMachine}). Close it first before launching a new one.`);
                    return;
                }

                // Clean up any leftover pipe writer from a previous session
                // (e.g. if the process crashed and the exit handler didn't run)
                this.closePipeWriter();

                // Build command line arguments.
                // On Windows, openMSX -control stdio has a known issue: the stdin reader
                // thread blocks on read() and never unblocks cleanly when the pipe closes,
                // causing openMSX to hang on exit. The correct mode for Windows is
                // -control pipe:<name>, which uses a Windows named pipe for input and
                // still writes replies/output to stdout.
                // On Linux/macOS, -control stdio is correct and uses stdin/stdout directly.
                // On Windows, use a unique pipe name based on PID to avoid collisions
                // when multiple MCP server instances run simultaneously.
                const pipeName = IS_WINDOWS ? `openmsx-mcp-${process.pid}` : '';
                const controlArg = IS_WINDOWS ? `pipe:${pipeName}` : 'stdio';

                const args: string[] = ['-control', controlArg];
                // Add machine parameter if specified
                if (machine) {
                    this.lastMachine = machine; // Store last machine for future reference
                    args.push('-machine', machine);
                }
                // Add extensions if specified
                if (extensions && extensions.length > 0) {
                    extensions.forEach(ext => {
                        args.push('-ext', ext);
                    });
                }

                // Launch openMSX.
                // On both modes, stdout/stderr are piped so we can read replies and errors.
                // On stdio mode, stdin is also piped (we write commands there).
                // On pipe mode, stdin is ignored ('ignore') — openMSX reads from the named pipe.
                this.process = spawn(executable, args, {
                    stdio: IS_WINDOWS ? ['ignore', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe']
                });
                if (!this.process.stdout || !this.process.stderr) {
                    safeResolve('Error: Failed to create stdio pipes');
                    return;
                }
                if (!IS_WINDOWS && !this.process.stdin) {
                    safeResolve('Error: Failed to create stdin pipe');
                    return;
                }
                // Check if process was launched successfully
                if (!this.process.pid || this.process.killed) {
                    const stderrMessage = this.process.stderr.read()?.toString() || 'Failed to launch openMSX process';
                    this.process = null; // Reset process to null on failure
                    this.isConnected = false;
                    safeResolve(`Error: ${stderrMessage}`);
                    return;
                }

                // Handle process events
                this.process.on('error', (error: NodeJS.ErrnoException) => {
                    console.error('openMSX process error:', error);
                    if (error.code === 'ENOENT') {
                        safeResolve(
                            `Error: openMSX executable not found: "${executable}". ` +
                            `Set the OPENMSX_EXECUTABLE environment variable to the full path of the openMSX binary. ` +
                            `On macOS the standard path is /Applications/openMSX.app/Contents/MacOS/openmsx; ` +
                            `on Windows it is typically C:\\Program Files\\openMSX\\openmsx.exe; ` +
                            `on Linux it is usually 'openmsx' (in PATH after package install).`
                        );
                    } else {
                        safeResolve(`Error: ${error.message}`);
                    }
                });
                this.process.on('exit', (code, signal) => {
                    this.isConnected = false;
                    this.process = null;
                    this.closePipeWriter();
                });

                // Wait for the opening XML tag to confirm connection
                this.process.stdout.on('data', (data) => {
                    const output = data.toString();
                    if (output.includes('<openmsx-output>')) {
                        this.isConnected = true;
                        connectionTime = Date.now();
                        
                        // Don't resolve immediately, wait for potential fatal errors
                        setTimeout(async () => {
                            // Only resolve if no fatal error occurred during grace period
                            if (!resolved) {
                                try {
                                    // On Windows, open the named pipe for writing commands.
                                    // openMSX has already created the pipe server side by now.
                                    if (IS_WINDOWS) {
                                        const pipePath = `\\\\.\\pipe\\${pipeName}`;
                                        await this.openWindowsPipe(pipePath);
                                    }

                                    this.writeData('<openmsx-control>\n');
                                    // Set save settings on exit off
                                    this.sendCommand('set save_settings_on_exit off');
                                    // Set renderer to SDL
                                    this.sendCommand('set renderer SDLGL-PP');
                                    // set machine on
                                    this.sendCommand('set power on');
                                    // start reverse replay mode
                                    this.sendCommand('reverse start');
                                    // Return success message
                                    let result = 'Ok: openMSX emulator launched successfully';
                                    if (machine) {
                                        result += ` with machine "${machine}"`;
                                    }
                                    if (extensions && extensions.length > 0) {
                                        if (machine) {
                                            result += ' and';
                                        }
                                        result += ` with extensions: "${extensions.join('", "')}"`;
                                    }
                                    result += ', is powered on, and replay mode is started.';
                                    safeResolve(result);
                                } catch (error) {
                                    safeResolve(`Error: Failed to send control commands - ${error instanceof Error ? error.message : 'Unknown error'}`);
                                }
                            }
                        }, FATAL_ERROR_GRACE_PERIOD);
                    }
                });

                // Handle stderr - check for fatal errors during grace period
                this.process.stderr.on('data', (data) => {
                    const errorOutput = data.toString();
                    
                    // Check for fatal errors before connection or during grace period
                    const isInGracePeriod = connectionTime && (Date.now() - connectionTime) < FATAL_ERROR_GRACE_PERIOD;
                    if (errorOutput.includes('Fatal error:') && (!this.isConnected || isInGracePeriod)) {
                        this.forceClose();
                        safeResolve(`Error: ${errorOutput.trim()}`);
                        return;
                    }
                });

                // Set timeout for connection
                setTimeout(() => {
                    if (!this.isConnected) {
                        this.emu_close();
                        safeResolve('Error: Timeout waiting for openMSX to start');
                    }
                }, 5000); // 5 second timeout

            } catch (error) {
                safeResolve(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }

    /**
     * Open a Windows named pipe for writing commands to openMSX.
     * openMSX creates the pipe server when launched with -control pipe:<name>.
     * We connect as a client (write-only) after openMSX signals it's ready.
     * @param pipePath - Full Windows named pipe path, e.g. \\.\pipe\openmsx-mcp-1234
     */
    private openWindowsPipe(pipePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Node.js fs.createWriteStream supports Windows named pipe paths.
                // The pipe must already exist (created by openMSX) at this point.
                const writer = createWriteStream(pipePath, { flags: 'r+' });
                writer.on('open', () => {
                    this.pipeWriter = writer;
                    resolve();
                });
                writer.on('error', (err) => {
                    reject(new Error(`Failed to open Windows named pipe "${pipePath}": ${err.message}`));
                });
            } catch (err) {
                reject(new Error(`Failed to create Windows named pipe writer: ${err instanceof Error ? err.message : err}`));
            }
        });
    }

    /**
     * Close and destroy the Windows named pipe writer if open.
     */
    private closePipeWriter(): void {
        if (this.pipeWriter) {
            try { this.pipeWriter.destroy(); } catch (_) { /* ignore */ }
            this.pipeWriter = null;
        }
    }

    /**
     * Close the openMSX emulator process
     * @returns Promise that resolves when the process is closed
     */
    async emu_close(): Promise<string> {
        return new Promise((resolve) => {
            if (!this.process) {
                resolve("Error: No emulator process running");
                return;
            }

            this.process.on('exit', () => {
                this.lastMachine = null; // Clear last machine on exit
                this.isConnected = false;
                this.process = null;
                this.closePipeWriter();
                resolve("Ok: Emulator process closed successfully");
            });

            this.process.on('error', (error: Error) => {
                resolve(`Error: error closing emulator: ${error.message}`);
            });

            // Try graceful shutdown first
            if (this.isConnected) {
                try {
                    this.sendCommand('exit');
                } catch (error) {
                    // If writing fails, force kill.
                    // Use no-argument kill() for cross-platform safety:
                    // on POSIX it sends SIGTERM; on Windows it calls TerminateProcess().
                    try { this.process.kill(); } catch (_) { /* ignore */ }
                }
            } else {
                this.forceClose();
                resolve("Error: Emulator process had to be force killed");
            }

            // Force kill after timeout
            setTimeout(() => {
                this.forceClose();
                resolve("Error: Timeout. Emulator process had to be force killed");
            }, 1000);
        });
    }

    /**
     * Get the status of the openMSX emulator using machine_info command
     * @returns Promise<string> - JSON string with machine information or error message
     */
    async emu_status(): Promise<string> {
        try {
            const response = await this.sendCommand('machine_info');
            if (response.startsWith('Error:')) {
                return response;
            }
            // Parse machine_info output into key-value pairs
            const skipInfo = ['issubslotted', 'input_port', 'slot', 'isexternalslot', 'output_port'];
            const parameters = response.trim().split(' ');
            const machineInfo: Record<string, string> = {};
            for (const param of parameters) {
                const trimmedLine = param.trim();
                // Skip certain parameters that are not useful
                if (skipInfo.includes(trimmedLine)) {
                    continue;
                }
                if (trimmedLine) {
                    const value = await this.sendCommand(`machine_info ${trimmedLine}`);
                    machineInfo[trimmedLine] = value.trim();
                }
            }
            return JSON.stringify(machineInfo, null, 2);
        } catch (error) {
            return `Error: Failed to get machine status - ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }

    async emu_isInBasic(): Promise<boolean> {
        try {
            const response = await this.sendCommand('slotselect');
            return response.includes('0000: slot 0') && response.includes('4000: slot 0')
        } catch (error) {
            return false;
        }
    }

    /**
     * Get the list of machines available in the openMSX emulator
     * @returns Promise<object> - object with machine names and descriptions or error message
     */
    async getMachineList(machinesDirectory: string): Promise<string> {
        // Read the machines directory
        let machines: { name: string; description: string }[] = [];
        let machinesList = "Error: No machines found.";
        try {
            const allFiles = await fs.readdir(machinesDirectory);
            machines = await Promise.all(
                allFiles
                    .filter((file: string) => file.endsWith('.xml'))
                    .map(async (file: string) => {
                        return {
                            name: file.replace('.xml', ''),
                            description: await extractDescriptionFromXML(path.join(machinesDirectory, file))
                        };
                    })
            );
            if (machines.length !== 0) {
                machinesList = JSON.stringify(machines, null, 2);
            }
            return machinesList;
        } catch (error) {
            return `Error: error reading machines directory - ${error instanceof Error ? error.message : error}`;
        }
    }

    /**
     * Get the list of extensions available in the openMSX emulator
     * @returns Promise<object> - object with extension names and descriptions or error message
     */
    async getExtensionList(extensionDirectory: string): Promise<string> {
        // Read the extensions directory
        let extensions: { name: string; description: string }[] = [];
        let extensionsList = "Error: No extensions found.";
        try {
            const allFiles = await fs.readdir(extensionDirectory);
            extensions = await Promise.all(
                allFiles
                    .filter((file: string) => file.endsWith('.xml'))
                    .map(async (file: string) => {
                        return {
                            name: file.replace('.xml', ''),
                            description: await extractDescriptionFromXML(path.join(extensionDirectory, file))
                        };
                    })
            );
            if (extensions.length !== 0) {
                extensionsList = JSON.stringify(extensions, null, 2);
            }
            return extensionsList;
        } catch (error) {
            return `Error: error reading extensions directory - ${error instanceof Error ? error.message : error}`;
        }
    };

    /**
     * Send a command to the openMSX emulator and return the response
     * @param command - XML command to send to the emulator
     * @returns string - resulting response from the emulator or an error message
     */
    async sendCommand(command: string): Promise<string> {
        try {
            // Send command
            this.writeData(`<command>${encodeHtmlEntities(command)}</command>\n`);
            // Read response using readData()
            const output = (await this.readData()).trim();
            // Look for reply tags in the output
            const replyMatch = output.match(/<reply result="(ok|nok)"[^>]*>(.*?)<\/reply>/s);
            if (replyMatch) {
                const outputContent = decodeHtmlEntities(replyMatch[2].trim());
                if (replyMatch[1] === 'ok') {
                    return outputContent;
                } else {
                    return `Error: ${outputContent}`;
                }
            }
            // Return raw output with HTML entities decoded
            return decodeHtmlEntities(output.trim());
        } catch (error) {
            return `Error: ${error instanceof Error ? error.message : error}`;
        }
    }

    /**
     * Write data to openMSX.
     * On Linux/macOS: writes to the child process stdin.
     * On Windows: writes to the named pipe (pipeWriter).
     * @param data - XML command or data to send
     */
    writeData(data: string): void {
        if (!this.process || !this.isConnected) {
            throw new Error('openMSX process not running or not connected');
        }
        if (IS_WINDOWS) {
            // Windows: send via named pipe
            if (!this.pipeWriter || this.pipeWriter.destroyed) {
                throw new Error('Windows named pipe not open');
            }
            this.pipeWriter.write(data);
        } else {
            // Linux/macOS: send via child process stdin
            if (!this.process.stdin) {
                throw new Error('openMSX stdin not available');
            }
            this.process.stdin.write(data);
        }
    }

    /**
     * Read data from openMSX process stdout
     * @returns Promise<string> - The data received from stdout
     */
    private readData(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.process || !this.process.stdout || !this.isConnected) {
                reject(new Error('openMSX process not running or not connected'));
                return;
            }
            const onData = (data: Buffer) => {
                this.process!.stdout!.removeListener('data', onData);
                resolve(data.toString());
            };
            this.process.stdout.on('data', onData);
        });
    }

    /**
     * Destructor - Clean up resources and close emulator if running
     * This method should be called when the instance is no longer needed
     */
    async destroy(): Promise<void> {
        if (this.process && !this.process.killed) {
            await this.emu_close();
        }
    }

    /**
     * Force close the emulator immediately (synchronous)
     * Used for emergency shutdown when async methods may not work
     */
    forceClose(): void {
        if (this.process && !this.process.killed) {
            try {
                // 'SIGKILL' is accepted on Windows too (maps to TerminateProcess).
                // No-argument kill() is also acceptable here, but SIGKILL makes
                // the intent explicit: we want unconditional termination.
                this.process.kill('SIGKILL');
            } catch (error) {
                // Ignore errors during force close
            }
            this.process = null;
            this.isConnected = false;
        }
        this.closePipeWriter();
    }

}

/**
 * Global instance of OpenMSX for emulator control
 */
export const openMSXInstance = new OpenMSX();
