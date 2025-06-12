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


/**
 * OpenMSX class for controlling the openMSX emulator via TCL commands over TCP socket
 */
export class OpenMSX {
    private lastMachine: string | null = null;
    private process: ChildProcess | null = null;
    private isConnected: boolean = false;

    /**
     * Launch the openMSX emulator in stdio control mode
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

                // Build command line arguments
                const args: string[] = ['-control', 'stdio'];
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

                // Launch openMSX with stdio control
                this.process = spawn(executable, args, {
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                if (!this.process.stdin || !this.process.stdout || !this.process.stderr) {
                    safeResolve('Error: Failed to create stdio pipes');
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
                this.process.on('error', (error) => {
                    console.error('openMSX process error:', error);
                    safeResolve(`Error: ${error.message}`);
                });
                this.process.on('exit', (code, signal) => {
                    this.isConnected = false;
                    this.process = null;
                });

                // Wait for the opening XML tag to confirm connection
                this.process.stdout.on('data', (data) => {
                    const output = data.toString();
                    if (output.includes('<openmsx-output>')) {
                        this.isConnected = true;
                        connectionTime = Date.now();
                        
                        // Don't resolve immediately, wait for potential fatal errors
                        setTimeout(() => {
                            // Only resolve if no fatal error occurred during grace period
                            if (!resolved) {
                                try {
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
                    // If writing fails, force kill
                    this.process.kill('SIGTERM');
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
     * Write data to the openMSX process stdin
     * @param data - XML command or data to send
     */
    writeData(data: string): void {
        if (!this.process || !this.process.stdin || !this.isConnected) {
            throw new Error('openMSX process not running or not connected');
        }
        this.process.stdin.write(data);
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
                this.process.kill('SIGKILL');
            } catch (error) {
                // Ignore errors during force close
            }
            this.process = null;
            this.isConnected = false;
        }
    }

}

/**
 * Global instance of OpenMSX for emulator control
 */
export const openMSXInstance = new OpenMSX();
