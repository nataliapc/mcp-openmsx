#!/usr/bin/env node
/**
 * MCP openMSX Server
 * 
 * Model Context Protocol server that manages openMSX emulator instances
 * through TCL commands via stdio.
 * 
 * @package @nataliapc/mcp-openmsx
 * @version 1.0.1
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import express, { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { openMSXInstance } from "./openmsx.js";

// Version info for CLI
const PACKAGE_VERSION = "1.0.1";

// Defaults for openMSX paths
var OPENMSX_EXECUTABLE = 'openmsx';
var OPENMSX_SHARE_DIR = '/usr/share/openmsx';
var OPENMSX_SCREENSHOT_DIR = '';
var OPENMSX_SCREENDUMP_DIR = '';
var MACHINES_DIR = `${OPENMSX_SHARE_DIR}/machines`;
var EXTENSIONS_DIR = `${OPENMSX_SHARE_DIR}/extensions`;


// ============================================================================
// Tools available in the MCP server
// https://modelcontextprotocol.io/docs/concepts/tools#tool-definition-structure
//
function registerAllTools(server: McpServer)
{
	server.tool(
		// Name of the tool (used to call it)
		"emu_control",
		// Description of the tool (what it does)
		"Controls an openMSX emulator. Commands: " +
		"'launch [machine] [extensions]': opens a powered on openMSX emulator, machine and extensions parameters could be specified, always use 'machine_list' and 'extension_list' resources to obtain valid values. " +
		"'close': closes the openMSX emulator. " +
		"'powerOn': powers on the openMSX emulator. " +
		"'powerOff': powers off the openMSX emulator. " +
		"'reset': resets the current machine. " +
		"'getEmulatorSpeed': get current emulator speed in percentage, default is 100. " +
		"'setEmulatorSpeed <emuspeed>': set the emulator speed in percentage, valid values are 1-10000, default is 100. " +
		"'machineList': get a list of all available MSX machines that can be emulated with openMSX. " +
		"'extensionList': get a list of all available MSX extensions that can be used with openMSX. ",
		// Schema for the tool (input validation)
		{
			command: z.enum(["launch", "close", "powerOn", "powerOff", "reset", "getEmulatorSpeed", "setEmulatorSpeed", "machineList", "extensionList"]),
			machine: z.string().min(1).max(100).optional(),
			extensions: z.array(z.string().min(1).max(100)).optional(),
			emuspeed: z.number().min(1).max(10000).optional().default(100),
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, machine, extensions, emuspeed }: { command: string, machine?: string; extensions?: string[]; emuspeed?: number }) => {
			let result = "Error";
			switch (command) {
				case "launch":
					result = await openMSXInstance.emu_launch(
						OPENMSX_EXECUTABLE,
						machine || "", 
						extensions || []
					);
					// Check if launch was successful
					if (result === "Ok") {
						result = "openMSX emulator launched";
						if (machine) {
							result += ` with machine "${machine}"`;
						}
						if (extensions && extensions.length > 0) {
							if (machine) {
								result += ' and ';
							}
							result += ` with extensions: ${extensions.join(', ')}`;
						}
					}
					break;
				case "close":
					result = await openMSXInstance.emu_close();
					break;
				case "powerOn":
					result = await openMSXInstance.sendCommand('set power on');
					result += result === "Ok" ? ": openMSX emulator powered on" : "";
					break;
				case "powerOff":
					result = await openMSXInstance.sendCommand('set power off');
					result += result === "Ok" ? ": openMSX emulator powered off" : "";
					break;
				case "reset":
					result = await openMSXInstance.sendCommand('reset');
					result += result === "Ok" ? ": openMSX emulator reset" : "";
					break;
				case 'getEmulatorSpeed':
					result = await openMSXInstance.sendCommand('set speed');
					result = !isNaN(Number(result)) ? `Current emulator speed is ${result}%` : result;
					break;
				case 'setEmulatorSpeed':
					result = await openMSXInstance.sendCommand(`set speed ${emuspeed}`);
					result = !isNaN(Number(result)) ? `Emulator speed set to ${emuspeed}%` : result;
					break;
				case "machineList":
					result = await openMSXInstance.getMachineList(MACHINES_DIR);
					break;
				case "extensionList":
					result = await openMSXInstance.getExtensionList(EXTENSIONS_DIR);
					break;
				default:
					result = `Error: Unknown command "${command}".`;
					break;
			}
			// Return result with proper format for MCP
			return {
				content: [{
					type: "text",
					text: result === '' ? 'Ok' : result,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"emu_media",
		// Description of the tool (what it does)
		"Manage tapes, rom cartridges, and floppy disks. Commands: " +
		"'tapeInsert <tapefile>': insert a valid tape file (*.cas, *.wav, *.tsx). " +
		"'tapeRewind': rewind the current tape. " +
		"'tapeEject': remove tape from virtual cassette player. " +
		"'romInsert <romfile>': insert a valid ROM cartridge file (*.rom) at cartridge slot A. " +
		"'romEject': remove the current ROM cartridge from cartridge slot A. " +
		"'diskInsert <diskfile>': insert a valid disk file (*.dsk) in floppy disk A. " +
		"'diskInsertFolder <diskfolder>': use a host folder as a floppy disk A root directory. " +
		"'diskEject': remove the current disk from floppy disk A. ",
		// Schema for the tool (input validation)
		{
			command: z.enum(["tapeInsert", "tapeRewind", "tapeEject", "romInsert", "romEject", "diskInsert", "diskInsertFolder", "diskEject"]),
			tapefile: z.string().min(1).max(200).optional(),	// Tape file to insert
			romfile: z.string().min(1).max(200).optional(),	// ROM file to insert
			diskfile: z.string().min(1).max(200).optional(),	// Disk file to insert
			diskfolder: z.string().min(1).max(200).optional(),	// Disk folder to insert
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, tapefile, romfile, diskfile, diskfolder }: { command: string; tapefile?: string; romfile?: string; diskfile?: string; diskfolder?: string }) => {
			let tclCommand: string;
			switch (command) {
				case "tapeInsert":
					tclCommand = `cassetteplayer insert "${tapefile}"`;
					break;
				case "tapeRewind":
					tclCommand = "cassetteplayer rewind";
					break;
				case "tapeEject":
					tclCommand = "cassetteplayer eject";
					break;
				case "romInsert":
					tclCommand = `carta insert "${romfile}"`;
					break;
				case "romEject":
					tclCommand = "carta eject";
					break;
				case "diskInsert":
					tclCommand = `diska insert "${diskfile}"`;
					break;
				case "diskInsertFolder":
					tclCommand = `diska insert "${diskfolder}"`;
					break;
				case "diskEject":
					tclCommand = "diska eject";
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown emulator media command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			// Return the response from openMSX
			return {
				content: [{
					type: "text",
					text: response === '' ? 'Ok' : response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"emu_info",
		// Description of the tool (what it does)
		"Obtain informacion about the current emulated machine. Commands: " +
		"'getStatus': returns the status of the openMSX emulator. " +
		"'getSlotsMap': shows what devices/ROM/RAM are inserted into which slots. " +
		"'getIOPortsMap': shows an overview about the I/O mapped devices. ",
		// Schema for the tool (input validation)
		{
			command: z.enum(["getStatus", "getSlotsMap", "getIOPortsMap"]),
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command }: { command: string }) => {
			let tclCommand: string;
			switch (command) {
				case "getStatus":
					return {
						content: [{
							type: "text",
							text: await openMSXInstance.emu_status(),
						}],
					};
				case "getSlotsMap":
					tclCommand = "slotmap";
					break;
				case "getIOPortsMap":
					tclCommand = "iomap";
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown emulator info command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"emu_vdp",
		// Description of the tool (what it does)
		"Manage VDP (Video Display Processor). Commands: " +
		"'getPalette': return the current V9938/V9958 colors palette in format RGB333. " +
		"'getRegisters': return all the VDP register values. " +
		"'getRegisterValue <register>': return the value of a specific VDP register (0-31) in decimal format. " +
		"'setRegisterValue <register> <value>': set a hexadecimal value to a specific VDP register (0-31). " +
		"'screenGetMode': returns the current screen mode (0-12) as a number which would also be used for the basic command SCREEN. " +
		"'screenGetFullText': return the full content of an MSX text screen (screen 0 or 1) as a string, useful for debugging. ",
		// Schema for the tool (input validation)
		{
			command: z.enum(["getPalette", "getRegisters", "getRegisterValue", "setRegisterValue", "screenGetMode", "screenGetFullText"]),
			register: z.number().min(0).max(31).optional(),	// Register to read/write
			value: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional(),
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, register, value }: { command: string; register?: number; value?: string }) => {
			let tclCommand: string;
			switch (command) {
				case "getPalette":
					tclCommand = "palette";
					break;
				case "getRegisters":
					tclCommand = "vdpregs";
					break;
				case "getRegisterValue":
					tclCommand = `vdpreg ${register}`;
					break;
				case "setRegisterValue":
					tclCommand = `vdpreg ${register} ${value}`;
					break;
				case "screenGetMode":
					tclCommand = "get_screen_mode";
					break;
				case "screenGetFullText":
					const response = await openMSXInstance.sendCommand('get_screen');
					return response.startsWith('Error:') ? {
							content: [{
								type: "text",
								text: response,
						}]} : {
							content: [{
								type: "text",
								text: "The screen text is:",
							}, {
								type: "text",
								text: response,
							}],
					};
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown emulator vdp command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response === "" ? "Ok" : response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"debug_run",
		// Description of the tool (what it does)
		"Control execution (break, continue, step). Commands: " +
		"'break': to break CPU at current execution position. " +
		"'isBreaked': to check if the CPU is currently in break state (1) or not (0). " +
		"'continue': to continue execution after break. " +
		"'stepIn': to execute one CPU instruction, go into subroutines. " +
		"'stepOver': to execute one CPU instruction, but don't go into subroutines. " +
		"'stepOut': to step out of the current subroutine. " +
		"'stepBack': to step one instruction back in time. " +
		"'runTo <address>': to run the CPU until it reaches the specified address. " +
		"Note: Addresses and values are in hexadecimal format (e.g. 0x0000).",
		// Schema for the tool (input validation)
		{
			command: z.enum(["break", "isBreaked", "continue", "stepIn", "stepOut", "stepOver", "stepBack", "runTo"]),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional()
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, address }: { command: string; address?: string }) => {
			let tclCommand: string;
			switch (command) {
				case "break":
					tclCommand = "debug break";
					break;
				case "isBreaked":
					tclCommand = "debug breaked";
					break;
				case "continue":
					tclCommand = "debug cont";
					break;
				case "stepIn":
					tclCommand = "step_in";
					break;
				case "stepOver":
					tclCommand = "step_over";
					break;
				case "stepOut":
					tclCommand = "step_out";
					break;
				case "stepBack":
					tclCommand = "step_back";
					break;
				case "runTo":
					tclCommand = `run_to ${address}`;
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown debug command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response === '' ? 'Ok' : response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"debug_cpu",
		// Description of the tool (what it does)
		"Read/write CPU registers, CPU info, Stack pile, and Disassemble code from memory. Commands: " +
		"'getCpuRegisters': to get an overview of all the CPU registers. " +
		"'getRegister <register>': to get the decimal value of a specific CPU register (pc, sp, ix, iy, af, bc, de, hl, ixh, ixl, iyh, iyl, a, f, b, c, d, e, h, l, i, r, im, iff). " +
		"'setRegister <register> <value>': to set the value of a specific CPU register (pc, sp, ix, iy, af, bc, de, hl, ixh, ixl, iyh, iyl, a, f, b, c, d, e, h, l, i, r, im, iff). " +
		"'getStackPile': to get an overview of the CPU stack. " +
		"'disassemble [address] [size]': to print disassembled instructions at the address parameter location or PC register if empty. " +
		"'getActiveCpu': to return the active cpu: z80 or r800." +
		"Note: Addresses and values are in hexadecimal format (e.g. 0x0000).",
		// Schema for the tool (input validation)
		{
			command: z.enum(["getCpuRegisters", "getRegister", "setRegister", "getStackPile", "disassemble", "getActiveCpu"]),
			register: z.enum(["pc", "sp", "ix", "iy", "af", "bc", "de", "hl", "ixh", "ixl", "iyh", "iyl", "a", "f", "b", "c", "d", "e", "h", "l", "i", "r", "im", "iff"]).optional(),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/),			// 4 hex digits for MSX memory address
			value: z.string().regex(/^0x[0-9a-fA-F]{2-4}$/).optional(),	// 2-4 hex digits for byte value for writeByte command
			size: z.number().min(1).max(50).optional().default(8),		// Number of bytes for disassemble command
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, address, register, value, size }: { command: string; address?: string; register?: string; value?: string; size?: number }) => {
			let tclCommand: string;
			switch (command) {
				case "getCpuRegisters":
					tclCommand = "cpuregs";
					break;
				case "getRegister":
					tclCommand = "reg ${register}";
					break;
				case "setRegister":
					tclCommand = "reg ${register} ${value}";
					break;
				case "getStackPile":
					tclCommand = "stack";
					break;
				case "disassemble":
					tclCommand = `disasm ${address || ""} ${size || ""}`;
					break;
				case "getActiveCpu":
					tclCommand = "get_active_cpu";
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown memory command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response === '' ? 'Ok' : response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"debug_memory",
		// Description of the tool (what it does)
		"Slots info, and Read/write from/to memory in the openMSX emulator. Commands: " +
		"'selectedSlots': to get a list of the currently selected memory slots. " +
		"'getBlock <address> [lines]': to read a block of memory from the specified address. " +
		"'readByte <address>': to read a BYTE from the specified address. " +
		"'readWord <address>': to read a WORD from the specified address. " +
		"'writeByte <address> <value8>': to write a BYTE to the specified address. " +
		"'writeWord <address> <value16>': to write a WORD to the specified address. " +
		"'advanced_basic_listing': to list the current BASIC program, with the ram address of each line listed. " +
		"Note: Addresses and values are in hexadecimal format (e.g. 0x0000).",
		// Schema for the tool (input validation)
		{
			command: z.enum(["selectedSlots", "getBlock", "readByte", "readWord", "writeByte", "writeWord", "advanced_basic_listing"]),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional(),	// 4 hex digits for MSX memory address
			lines: z.number().min(1).max(50).optional().default(8),		// Number of lines for getBlock command
			value8: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional(),	// 2 hex digits for byte value for writeByte command
			value16: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional(),	// 4 hex digits for byte value for writeByte command
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, address, lines, value8, value16 }: { command: string; address?: string; lines?: number; value8?: string; value16?: string }) => {
			let tclCommand: string;
			switch (command) {
				case "selectedSlots":
					tclCommand = "slotselect";
					break;
				case "getBlock":
					tclCommand = `showmem ${address} ${lines}`;
					break;
				case "readByte":
					tclCommand = `peek ${address}`;
					break;
				case "readWord":
					tclCommand = `peek16 ${address}`;
					break;
				case "writeByte":
					tclCommand = `poke ${address} ${value8}`;
					break;
				case "writeWord":
					tclCommand = `poke16 ${address} ${value16}`;
					break;
				case "advanced_basic_listing":
					tclCommand = "listing";
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown memory command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response === '' ? 'Ok' : response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"debug_vram",
		// Description of the tool (what it does)
		"Read or write from/to VRAM video memory in the openMSX emulator. Commands: " +
		"'getBlock <address> [lines]': to read a block of VRAM memory from the specified address. " +
		"'readByte <address>': to read a BYTE from the specified VRAM address. " +
		"'writeByte <address> <value8>': to write a BYTE to the specified VRAM address. " +
		"Note: Addresses and values are in hexadecimal format (e.g. 0x0000).",
		// Schema for the tool (input validation)
		{
			command: z.enum(["getBlock", "readByte", "writeByte"]),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional(),	// 4 hex digits for MSX memory address
			lines: z.number().min(1).max(50).optional().default(8),		// Number of lines for getBlock command
			value8: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional(),	// 2 hex digits for byte value for writeByte command
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, address, lines, value8 }: { command: string; address?: string; lines?: number; value8?: string }) => {
			let tclCommand: string;
			switch (command) {
				case "getBlock":
					tclCommand = `showdebuggable VRAM ${address} ${lines}`;
					break;
				case "readByte":
					tclCommand = `vpeek ${address}`;
					break;
				case "writeByte":
					tclCommand = `vpoke ${address} ${value8}`;
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown video memory command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response === '' ? 'Ok' : response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"debug_breakpoints",
		// Description of the tool (what it does)
		"Create, remove, and list breakpoints. Commands: " +
		"'create <address>': create a breakpoint at a specified address, and returns its name. " +
		"'remove <bpname>': remove a breakpoint by name (e.g. bp#1). " +
		"'list': enumerate the active breakpoints. " +
		"Note: Addresses and values are in hexadecimal format (e.g. 0x0000). " +
		"Note: The memory addresses of functions and variables can be previously obtained from *.sym or *.map files.",
		// Schema for the tool (input validation)
		{
			command: z.enum(["create", "remove", "list"]),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional(),	// 4 hex digits for MSX memory address
			bpname: z.string().min(3).max(10).optional(),				// breakpoint name (e.g. bp#1)
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, address, bpname }: { command: string; address?: string; bpname?: string }) => {
			let tclCommand: string;
			switch (command) {
				case "create":
					tclCommand = `debug set_bp ${address}`;
					break;
				case "remove":
					tclCommand = `debug remove_bp ${bpname}`;
					break;
				case "list":
					tclCommand = 'debug list_bp';
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown breakpoint command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"emu_savestates",
		// Description of the tool (what it does)
		"Load, save, and list savestates. Commands: " +
		"'load <name>': restores a previously created savestate. " +
		"'save <name>': creates a snapshot of the currently emulated MSX machine specifying a name for the savestate. " +
		"'list': returns the names of all previously created savestates, separated by spaces. " +
		"Note: names with spaces are enclosed in {}.",
		// Schema for the tool (input validation)
		{
			command: z.enum(["load", "save", "list"]),
			name: z.string().min(1).max(20).optional(),				// breakpoint name (e.g. bp#1)
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, name }: { command: string; name?: string }) => {
			let tclCommand: string;
			let textResponse: string = "Error:";
			switch (command) {
				case "load":
					textResponse = "Loaded savestate: ";
					tclCommand = `loadstate ${name}`;
					break;
				case "save":
					textResponse = "Saved savestate: ";
					tclCommand = `savestate ${name}`;
					break;
				case "list":
					textResponse = "Savestate names: ";
					tclCommand = 'list_savestates';
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown savestate command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: textResponse,
				}, {
					type: "text",
					text: response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"emu_keyboard",
		// Description of the tool (what it does)
		"Send a text to the openMSX emulator. Commands: " +
		"'sendText <text>': type a string in the emulated MSX, this command automatically press and release keys in the MSX keyboard matrix, is useful for automating tasks in BASIC, use \\r for Return key. ",
		// Schema for the tool (input validation)
		{
			command: z.enum(["sendText"]),
			text: z.string().min(1).max(100).optional().default(''),	// Key to send to the emulator
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, text }: { command: string; text: string }) => {
			let tclCommand: string;
			switch (command) {
				case "sendText":
					tclCommand = `type "${text}"`;
					break;
				default:
					return {
						content: [{
							type: "text",
							text: `Error: Unknown keyboard command "${command}".`,
						}],
					};
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return {
				content: [{
					type: "text",
					text: response === '' ? 'Ok' : response,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"screen_shot",
		// Description of the tool (what it does)
		"Take a screenshot of the openMSX emulator screen. Commands: " +
		"'as_image': take a screenshot and the image is returned in the response. " +
		"'to_file': take a screenshot and save it to a file, the file name is returned in the response.",
		// Schema for the tool (input validation)
		{
			command: z.enum(["as_image", "to_file"]),
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command }: { command: string }) => {
			const openmsxCommand = `screenshot -raw -prefix "${OPENMSX_SCREENSHOT_DIR}mcp_"`;
			const response = await openMSXInstance.sendCommand(openmsxCommand);
			switch (command) {
				case "as_image":
					try {
						const imageBuffer = await fs.readFile(response);
						const base64image = imageBuffer.toString('base64');
						return {
							content: [{
								type: "text",
								text: "Screenshot taken successfully:",
							}, {
								type: "image",
								data: base64image,
								mimeType: "image/png",
							}],
						};
					} catch (error) {
						return {
							content: [{
								type: "text",
								text: 'Error creating screenshot: '+response,
							}, {
								type: "text",
								text: error instanceof Error ? error.message : String(error),
							}],
						};
					}
				case "to_file":
					return {
						content: [{
							type: "text",
							text: response.startsWith('Error:') ? response : 'Screenshot taken in file: '+response,
						}],
					};
			}
			return {
				content: [{
					type: "text",
					text: `Error: Unknown screen_shot command "${command}".`,
				}],
			};
		});

	server.tool(
		// Name of the tool (used to call it)
		"screen_dump",
		// Description of the tool (what it does)
		"Take a screendump of the openMSX emulator screen as SC?. The parameter scrbasename is the name of the filename (without path) to save the screendump, default is 'screendump'. ",
		// Schema for the tool (input validation)
		{
			scrbasename: z.string().min(1).max(100).default("screendump"),
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ scrbasename }: { scrbasename: string }) => {
			const openmsxCommand = `save_msx_screen "${OPENMSX_SCREENDUMP_DIR + scrbasename}"`;
			const response = await openMSXInstance.sendCommand(openmsxCommand);
			return {
				content: [{
					type: "text",
					text: response.startsWith('Error:') ? 'Fail:' : 'Screendump file saved as:',
				}, {
					type: "text",
					text: response,
				}],
			};
		});

}


// ============================================================================
// Cleanup handlers for graceful shutdown of MCP server
// Ensure openMSX emulator is closed when MCP server stops

let isShuttingDown = false;

async function gracefulShutdown(exitCode: number = 0)
{
	if (isShuttingDown) return;
	isShuttingDown = true;
	try {
		// Try async close first
		await Promise.race([
			openMSXInstance.emu_close(),
			new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
		]);
	} catch (error) {
		// If async close fails or times out, force close
		openMSXInstance.forceClose();
	}
	// Give a moment for cleanup to complete
	setTimeout(() => {
		process.exit(exitCode);
	}, 100);
}

// Handle process termination signals
process.on('SIGINT', () => gracefulShutdown(0));
process.on('SIGTERM', () => gracefulShutdown(0));

// Handle when the transport connection is closed (more reliable for MCP)
process.on('disconnect', () => gracefulShutdown(0));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', async (error) => {
	await gracefulShutdown(1);
});

process.on('unhandledRejection', async (reason, promise) => {
	await gracefulShutdown(1);
});

// Additional cleanup when the process is about to exit
process.on('exit', () => {
	// This is synchronous only - can't use async here
	// Force close as last resort
	openMSXInstance.forceClose();
});


// ============================================================================
// Help function to display usage information
//
function showHelp() {
	console.log(`
MCP-openMSX Server v${PACKAGE_VERSION}
Model Context Protocol server for openMSX emulator automation

Usage:
  mcp-openmsx [transport]

Transport options:
  stdio    Use stdio transport (default)
  http     Use HTTP transport

Environment variables:
  OPENMSX_EXECUTABLE      Path to openMSX executable
  OPENMSX_SHARE_DIR       openMSX share directory
  OPENMSX_SCREENSHOT_DIR  Screenshot output directory
  OPENMSX_SCREENDUMP_DIR  Screen dump output directory
  MCP_HTTP_PORT          HTTP server port (default: 3000)

Examples:
  mcp-openmsx                    # stdio transport
  mcp-openmsx http              # HTTP transport
  MCP_TRANSPORT=http mcp-openmsx # HTTP via environment
`);
}


// ============================================================================
// Start the server
//
async function startHttpServer()
{
	const app = express();
	app.use(express.json());
	
	const transports: { [sessionId: string]: InstanceType<typeof StreamableHTTPServerTransport> } = {};
	
	// Handle POST requests for client-to-server communication
	app.post('/mcp', async (req: Request, res: Response) => {
		const sessionId = req.headers['mcp-session-id'] as string | undefined;
		let transport: StreamableHTTPServerTransport;
		
		if (sessionId && transports[sessionId]) {
			transport = transports[sessionId];
		} else if (!sessionId && isInitializeRequest(req.body)) {
			transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
				onsessioninitialized: (sessionId) => {
					transports[sessionId] = transport;
				}
			});
			
			transport.onclose = () => {
				if (transport.sessionId) {
					delete transports[transport.sessionId];
				}
			};
			
			// Create a new server instance for this session
			const httpServer = createServerInstance();
			await httpServer.connect(transport);
		} else {
			res.status(400).json({
				jsonrpc: '2.0',
				error: { code: -32000, message: 'Bad Request: No valid session ID provided' },
				id: null,
			});
			return;
		}
		
		await transport.handleRequest(req, res, req.body);
	});
	
	// Handle GET requests for server-to-client notifications via SSE
	app.get('/mcp', async (req: Request, res: Response) => {
		const sessionId = req.headers['mcp-session-id'] as string | undefined;
		if (!sessionId || !transports[sessionId]) {
			res.status(400).send('Invalid or missing session ID');
			return;
		}
		
		const transport = transports[sessionId];
		await transport.handleRequest(req, res);
	});
	
	const port = process.env.MCP_HTTP_PORT || 3000;
	app.listen(port, () => {
		console.log(`MCP Server listening on port ${port}`);
	});
}

function createServerInstance()
{
	// Create a new server instance (you might want to extract server creation logic)
	const newServer = new McpServer({
		name: "mcp-openmsx",
		version: PACKAGE_VERSION,
	});
	
	// Re-register all tools (you might want to extract this to a separate function)
	registerAllTools(newServer);
	
	return newServer;
}


// ============================================================================
// Main function to start the MCP server
//
async function main()
{
	// Handle CLI arguments
	const args = process.argv.slice(2);
	if (args.includes('--help') || args.includes('-h')) {
		showHelp();
		return;
	}
	if (args.includes('--version') || args.includes('-v')) {
		console.log(PACKAGE_VERSION);
		return;
	}

	// Environment variables setup
	if (process.env.OPENMSX_EXECUTABLE) {
		OPENMSX_EXECUTABLE = process.env.OPENMSX_EXECUTABLE;
	}
	if (process.env.OPENMSX_SCREENSHOT_DIR && process.env.OPENMSX_SCREENSHOT_DIR !== '') {
		OPENMSX_SCREENSHOT_DIR = process.env.OPENMSX_SCREENSHOT_DIR + path.sep;
	}
	if (process.env.OPENMSX_SCREENDUMP_DIR && process.env.OPENMSX_SCREENDUMP_DIR !== '') {
		OPENMSX_SCREENDUMP_DIR = process.env.OPENMSX_SCREENDUMP_DIR + path.sep;
	}
	if (process.env.OPENMSX_SHARE_DIR) {
		OPENMSX_SHARE_DIR = process.env.OPENMSX_SHARE_DIR + path.sep;
		MACHINES_DIR = `${OPENMSX_SHARE_DIR}machines`;
		EXTENSIONS_DIR = `${OPENMSX_SHARE_DIR}extensions`;
	}

	// Detect transport type from environment or command line
	const transportType = process.env.MCP_TRANSPORT || process.argv[2] || 'stdio';
	
	if (transportType === 'http') {
		// Start Streamable HTTP server
		await startHttpServer();
	} else {
		// Default to stdio
		const transport = new StdioServerTransport();
		await createServerInstance().connect(transport);
	}
}

main().catch((error) => {
	gracefulShutdown(1);
	process.exit(1);
});