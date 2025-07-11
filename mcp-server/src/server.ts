#!/usr/bin/env node
/**
 * MCP openMSX Server
 * 
 * Model Context Protocol server that manages openMSX emulator instances
 * through TCL commands via stdio.
 * 
 * @package @nataliapc/mcp-openmsx
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import { McpServer, RegisteredResource, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import express, { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { openMSXInstance } from "./openmsx.js";
import { fetchCleanWebpage, addFileExtension, listResourcesDirectory, encodeTypeText, isErrorResponse, getResponseContent } from "./utils.js";
import { createRequire } from 'module';


// Dynamically obtain PACKAGE_VERSION from package.json at runtime
const require = createRequire(import.meta.url);
export const PACKAGE_VERSION = require('../package.json').version;

const resourcesDir = path.join(path.dirname(new URL(import.meta.url).pathname), "../resources");

// Defaults for openMSX paths
var OPENMSX_EXECUTABLE = 'openmsx';
var OPENMSX_SHARE_DIR = '/usr/share/openmsx';
var OPENMSX_REPLAYS_DIR = '';
var OPENMSX_SCREENSHOT_DIR = '';
var OPENMSX_SCREENDUMP_DIR = '';
var MACHINES_DIR = `${OPENMSX_SHARE_DIR}/machines`;
var EXTENSIONS_DIR = `${OPENMSX_SHARE_DIR}/extensions`;


// ============================================================================
// Tools available in the MCP server
// https://modelcontextprotocol.io/docs/concepts/tools#tool-definition-structure
//
async function registerAllTools(server: McpServer)
{
	server.registerTool(
		// Name of the tool (used to call it)
		"emu_control",
		{
			title: "Emulator control tools",
			// Description of the tool (what it does)
			description: "Tools to control an openMSX emulator.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["launch", "close", "powerOn", "powerOff", "reset", "getEmulatorSpeed", "setEmulatorSpeed", "machineList", "extensionList", "wait"]).describe(`Available commands:
'launch [machine] [extensions]': opens a powered-on openMSX emulator; you must wait some time waiting the machine is fully booted; machine and extensions parameters can be specified so use 'machineList' and 'extensionList' commands to obtain valid values. " +
'close': closes the openMSX emulator.
'powerOn': powers on the openMSX emulator.
'powerOff': powers off the openMSX emulator.
'reset': resets the current machine.
'getEmulatorSpeed': gets the current emulator speed as a percentage, default is 100.
'setEmulatorSpeed <emuspeed>': sets the emulator speed as a percentage, valid values are 1-10000, default is 100.
'machineList': gets a list of all available MSX machines that can be emulated with openMSX.
'extensionList': gets a list of all available MSX extensions that can be used with openMSX.
'wait <seconds>': performs a wait for the specified number of seconds, default is 3.
`),
				machine: z.string().min(1).max(100).optional().describe("Machine name to launch; valid names can be obtained using [machineList]. Used by [launch]."),
				extensions: z.array(z.string().min(1).max(100)).optional().describe("List of extensions to use; valid extensions can be obtained using [extensionList]. Used by [launch]."),
				emuspeed: z.number().min(1).max(10000).optional().default(100).describe("Emulator speed as a percentage (1-10000); default is 100. Used by [setEmulatorSpeed]."),
				seconds: z.number().min(1).max(10).optional().default(3).describe("Number of seconds to wait; default is 3. Used by [wait]."),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, machine, extensions, emuspeed, seconds }: { command: string, machine?: string; extensions?: string[]; emuspeed?: number, seconds?: number }) => {
			let result = '';
			switch (command) {
				case "launch":
					result = await openMSXInstance.emu_launch(
						OPENMSX_EXECUTABLE,
						machine || "", 
						extensions || []
					);
					break;
				case "close":
					result = await openMSXInstance.emu_close();
					break;
				case "powerOn":
					result = await openMSXInstance.sendCommand('set power on');
					result = result === "true" ? "openMSX emulator powered on" : "Error: " + result;
					break;
				case "powerOff":
					result = await openMSXInstance.sendCommand('set power off');
					result = result === "false" ? "openMSX emulator powered off" : "Error: " + result;
					break;
				case "reset":
					result = await openMSXInstance.sendCommand('reset');
					result = result === "" ? "openMSX emulator reset successful" : "Error: " + result;
					break;
				case 'getEmulatorSpeed':
					result = await openMSXInstance.sendCommand('set speed');
					result = !isNaN(Number(result)) ? `Current emulator speed is ${result}%` : "Error: " + result;
					break;
				case 'setEmulatorSpeed':
					result = await openMSXInstance.sendCommand(`set speed ${emuspeed}`);
					result = !isNaN(Number(result)) ? `Emulator speed set to ${emuspeed}%` : "Error: " + result;
					break;
				case "machineList":
					result = await openMSXInstance.getMachineList(MACHINES_DIR);
					break;
				case "extensionList":
					result = await openMSXInstance.getExtensionList(EXTENSIONS_DIR);
					break;
				case "wait":
					await new Promise(resolve => setTimeout(resolve, seconds! * 1000));
					result = `Waited for ${seconds} seconds.`;
					break;
				default:
					result = `Error: Unknown command "${command}".`;
					break;
			}
			// Return result with proper format for MCP
			return getResponseContent([
				result
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"emu_media",
		{
			title: "Emulator media tools",
			// Description of the tool (what it does)
			description: "Manage tapes, rom cartridges, and floppy disks.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["tapeInsert", "tapeRewind", "tapeEject", "romInsert", "romEject", "diskInsert", "diskInsertFolder", "diskEject"]).describe(`Available commands:
	'tapeInsert <tapefile>': insert a valid tape file (*.cas, *.wav, *.tsx).
	'tapeRewind': rewind the current tape.
	'tapeEject': remove tape from virtual cassette player.
	'romInsert <romfile>': insert a valid ROM cartridge file (*.rom) at cartridge slot A.
	'romEject': remove the current ROM cartridge from cartridge slot A.
	'diskInsert <diskfile>': insert a valid disk file (*.dsk) in floppy disk A.
	'diskInsertFolder <diskfolder>': use a host folder as a floppy disk A root directory.
	'diskEject': remove the current disk from floppy disk A.
`),
				tapefile: z.string().min(1).max(200).optional().describe("Absolute Tape filename to insert. Used by [tapeInsert]"),
				romfile: z.string().min(1).max(200).optional().describe("Absolute ROM filename to insert. Used by [romInsert]"),
				diskfile: z.string().min(1).max(200).optional().describe("Absolute Disk filename to insert. Used by [diskInsert]"),
				diskfolder: z.string().min(1).max(200).optional().describe("Absolute Disk folder filename to insert. Used by [diskInsertFolder]"),
			},
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
					return getResponseContent([
						`Error: Unknown emulator media command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			// Return the response from openMSX
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"emu_info",
		{
			title: "Emulator info tools",
			// Description of the tool (what it does)
			description: "Obtain informacion about the current emulated machine.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["getStatus", "getSlotsMap", "getIOPortsMap"]).describe(`Available commands:
	'getStatus': returns the status of the openMSX emulator.
	'getSlotsMap': shows what devices/ROM/RAM are inserted into which slots.
	'getIOPortsMap': shows an overview about the I/O mapped devices.
`),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command }: { command: string }) => {
			let tclCommand: string;
			switch (command) {
				case "getStatus":
					return getResponseContent([
						await openMSXInstance.emu_status()
					]);
				case "getSlotsMap":
					tclCommand = "slotmap";
					break;
				case "getIOPortsMap":
					tclCommand = "iomap";
					break;
				default:
					return getResponseContent([
						`Error: Unknown emulator info command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"emu_vdp",
		{
			title: "VDP tools",
			// Description of the tool (what it does)
			description: "Manage the VDP (Video Display Processor).",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["getPalette", "getRegisters", "getRegisterValue", "setRegisterValue", "screenGetMode", "screenGetFullText"]).describe(`Available commands:
	'getPalette': returns the current V9938/V9958 color palette in RGB333 format.
	'getRegisters': returns all VDP register values.
	'getRegisterValue <register>': returns the value of a specific VDP register (0-31) in decimal format.
	'setRegisterValue <register> <value>': sets a hexadecimal value to a specific VDP register (0-31).
	'screenGetMode': returns the current screen mode (0-12) as a number, which matches the BASIC SCREEN command.
	'screenGetFullText': returns the full content of an MSX text screen (screen 0 or 1) as a string; PRIORITIZE this command to view screen content in text modes.
`),
				register: z.number().min(0).max(31).optional().describe("VDP register number (0-31) to read/write. Used by [getRegisterValue, setRegisterValue]"),
				value: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional().describe("2 hexadecimal digits for a VDP register value (e.g. 0x1f). Used by [setRegisterValue]"),
			},
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
					return isErrorResponse(response) ?
							getResponseContent([response]) :
							getResponseContent(["The screen text is:", response]);
				default:
					return getResponseContent([
						`Error: Unknown emulator vdp command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"debug_run",
		{
			title: "CPU Runtime Debugger tools",
			// Description of the tool (what it does)
			description: "Control execution (break, continue, step).",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["break", "isBreaked", "continue", "stepIn", "stepOut", "stepOver", "stepBack", "runTo"]).describe(`Available commands:
	'break': to break CPU (pause emulation) at current execution position.
	'isBreaked': to check if the CPU is currently in break state (1) or not (0).
	'continue': to continue execution after break.
	'stepIn': to execute one CPU instruction, go into subroutines.
	'stepOver': to execute one CPU instruction, but don't go into subroutines.
	'stepOut': to step out of the current subroutine.
	'stepBack': to step one instruction back in time.
	'runTo <address>': to run the CPU until it reaches the specified address.
**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x0000).
`),
				address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [runTo]"),
			},
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
					return getResponseContent([
						`Error: Unknown debug command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"debug_cpu",
		{
			title: "CPU tools",
			// Description of the tool (what it does)
			description: "Read/write CPU registers, CPU info, Stack pile, and Disassemble code from memory.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["getCpuRegisters", "getRegister", "setRegister", "getStackPile", "disassemble", "getActiveCpu"]).describe(`Available commands:
	'getCpuRegisters': to get an overview of all the CPU registers.
	'getRegister <register>': to get the decimal value of a specific CPU register (pc, sp, ix, iy, af, bc, de, hl, ixh, ixl, iyh, iyl, a, f, b, c, d, e, h, l, i, r, im, iff).
	'setRegister <register> <value>': to set the value of a specific CPU register (pc, sp, ix, iy, af, bc, de, hl, ixh, ixl, iyh, iyl, a, f, b, c, d, e, h, l, i, r, im, iff).
	'getStackPile': to get an overview of the CPU stack.
	'disassemble [address] [size]': to print disassembled instructions at the address parameter location or PC register if empty.
	'getActiveCpu': to return the active cpu: z80 or r800.
"**Important Note**: Addresses and values are in hexadecimal format (e.g. 0xd2 0x3af2)."
`),
				register: z.enum(["pc", "sp", "ix", "iy", "af", "bc", "de", "hl", "ixh", "ixl", "iyh", "iyl", "a", "f", "b", "c", "d", "e", "h", "l", "i", "r", "im", "iff"]).optional()
					.describe("CPU register to read/write. Used by [getRegister, setRegister]"),
				address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [disassemble]"),
				value: z.string().regex(/^0x[0-9a-fA-F]{2,4}$/).optional().describe("2-4 hexadecimal digits for a byte value (e.g. 0xa5 or 0xa5b1). Used by [setRegister]"),
				size: z.number().min(8).max(50).optional().describe("Number of bytes to disassemble. Used by [disassemble]"),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, address, register, value, size }: { command: string; address?: string; register?: string; value?: string; size?: number }) => {
			let tclCommand: string;
			switch (command) {
				case "getCpuRegisters":
					tclCommand = "cpuregs";
					break;
				case "getRegister":
					tclCommand = `reg ${register}`;
					break;
				case "setRegister":
					tclCommand = `reg ${register} ${value}`;
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
					return getResponseContent([
						`Error: Unknown memory command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"debug_memory",
		{
			title: "Memory tools",
			// Description of the tool (what it does)
			description: "Slots info, and Read/write from/to memory in the openMSX emulator.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["selectedSlots", "getBlock", "readByte", "readWord", "writeByte", "writeWord"]).describe(`Available commands:
	'selectedSlots': to get a list of the currently selected memory slots.
	'getBlock <address> [lines]': to read a block of memory from the specified address.
	'readByte <address>': to read a BYTE from the specified address.
	'readWord <address>': to read a WORD from the specified address.
	'writeByte <address> <value8>': to write a BYTE to the specified address.
	'writeWord <address> <value16>': to write a WORD to the specified address.
**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x0000).
`),
				address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [getBlock, readByte, writeByte, readWord, writeWord]"),
				lines: z.number().min(1).max(50).optional().default(8).describe("Number of lines to obtain. Used by [getBlock]"),
				value8: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional().describe("2 hexadecimal digits for a byte value (e.g. 0xa5). Used by [writeByte]"),
				value16: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a word value (e.g. 0xa5b1). Used by [writeWord]"),
			},
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
				default:
					return getResponseContent([
						`Error: Unknown memory command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"debug_vram",
		{
			title: "VRAM tools",
			// Description of the tool (what it does)
			description: "Read or write from/to VRAM video memory from the openMSX emulator.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["getBlock", "readByte", "writeByte"]).describe(`Available commands:
	'getBlock <address> [lines]': to read a block of VRAM memory from the specified address.
	'readByte <address>': to read a BYTE from the specified VRAM address.
	'writeByte <address> <value8>': to write a BYTE to the specified VRAM address.
**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x0000).
`),
				address: z.string().regex(/^0x[0-9a-fA-F]{5}$/).optional().describe("5 hexadecimal digits for a VRAM address (e.g. 0x04af3). Used by [getBlock, readByte, writeByte]"),
				lines: z.number().min(1).max(50).optional().default(8).describe("Number of lines to obtain. Used by [getBlock]"),
				value8: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional().describe("2 hexadecimal digits for a byte value (e.g. 0xa5). Used by [writeByte]"),
			},
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
					return getResponseContent([
						`Error: Unknown video memory command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"debug_breakpoints",
		{
			title: "Breakpoints tools",
			// Description of the tool (what it does)
			description: "Create, remove, and list breakpoints.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["create", "remove", "list"]).describe(`Available commands:
	'create <address>': create a breakpoint at a specified address, and returns its name.
	'remove <bpname>': remove a breakpoint by name (e.g. bp#1).
	'list': enumerate the active breakpoints.
"**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x4af3).
"**Important Note**: The memory addresses of functions and variables can be previously obtained from *.sym or *.map files.
`),
				address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [create]"),
				bpname: z.string().min(3).max(10).optional().describe("Breakpoint name (e.g. bp#1). Used by [remove]"),
			},
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
					return getResponseContent([
						`Error: Unknown breakpoint command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"emu_savestates",
		{
			title: "Save states tools",
			// Description of the tool (what it does)
			description: "Load, save, and list savestates.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["load", "save", "list"]).describe(`Available commands:
	'load <name>': restores a previously created savestate.
	'save <name>': creates a snapshot of the currently emulated MSX machine specifying a name for the savestate.
	'list': returns the names of all previously created savestates, separated by spaces.
**Important Note**: names with spaces are enclosed in {}.
`),
				name: z.string().min(1).max(20).optional().describe("Name of the savestate to load/save. Used by [load, save]"),
			},
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
					return getResponseContent([
						`Error: Unknown savestate command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				textResponse,
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"emu_replay",
		{
			title: "Replay tools",
			// Description of the tool (what it does)
			description: "When replay is enabled (the default) the emulator collect data while emulating, which enables you to go back and forward in the emulated MSX time.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["start", "stop", "status", "goBack", "absoluteGoto", "truncate", "advanceFrame", "reverseFrame", "saveReplay", "loadReplay"]).describe(`Available commands:
	'start': starts the replay mode (enabled by default when emulator is launched).
	'stop': stops the replay mode.
	'status': gives information about the replay feature and the data that is collected.
	'goBack <seconds>': go back specified seconds (1-60) in the timeline, you cannot go back to a time before the time the replay started.
	'absoluteGoto <time>': go to the indicated absolute time in seconds in the MSX timeline, if time is before replay started it will jump to the time when is started.
	'truncate': stop replaying and wipe all the future replay data after now.
	'advanceFrame' [frames]: advances a number of frames in the replay timeline, useful to advance the timeline while debugging.
	'reverseFrame' [frames]: reverses a number of frames in the replay timeline, useful to reverse the timeline while debugging.
	'saveReplay [filename]': saves the current replay data to a file (extension .omr), filename is returned in the response.
	'loadReplay <filename>': loads a previously saved replay file (extension .omr), starts replaying from the begin, and starts replay mode.
**Important Note**: consider do a #debug_run 'break' to maintain the timeline before a 'goBack' or 'absoluteGoto'.
`),
				seconds: z.number().min(1).max(60).optional().describe("Seconds to go back. Used by [goBack]"),
				time: z.string().regex(/^\d+$/).optional().describe("Absolute time in seconds to go to. Used by [absoluteGoto]"),
				frames: z.number().min(1).max(1000).optional().default(1).describe("Number of frames to advance/reverse. Used by [advanceFrame, reverseFrame]"),
				filename: z.string().min(1).max(200).optional().describe("Filename to save/load replay. Used by [saveReplay, loadReplay]"),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, seconds, time, frames, filename }: { command: string; seconds?: number; time?: string; frames?: number, filename?: string }) => {
			let tclCommand: string;
			switch (command) {
				case "start":
					tclCommand = "reverse start";
					break;
				case "stop":
					tclCommand = "reverse stop";
					break;
				case "status":
					tclCommand = "reverse status";
					break;
				case "goBack":
					tclCommand = `reverse goback ${seconds}`;
					break;
				case "absoluteGoto":
					tclCommand = `reverse goto ${time}`;
					break;
				case "truncate":
					tclCommand = "reverse truncatereplay";
					break;
				case "advanceFrame":
					tclCommand = `advance_frame ${frames}`;
					break;
				case "reverseFrame":
					tclCommand = `reverse_frame ${frames}`;
					break;
				case "saveReplay":
					if (filename) filename = `"${OPENMSX_REPLAYS_DIR}${filename}"`;
					tclCommand = `reverse savereplay ${filename || ''}`;
					break;
				case "loadReplay":
					if (filename) filename = `"${OPENMSX_REPLAYS_DIR}${filename}"`;
					tclCommand = `reverse loadreplay ${filename}`;
					break;
				default:
					return getResponseContent([
						`Error: Unknown replay command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"emu_keyboard",
		{
			title: "Keyboard tools",
			// Description of the tool (what it does)
			description: "Send a text to the openMSX emulator.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["sendText"]).describe(`Available commands:
	'sendText <text>': type a string in the emulated MSX, this command automatically press and release keys in the MSX keyboard matrix.
**Important Note**: each 'text' sent is limited to 200 characters, and the 'text' is sent as if it was typed in the MSX keyboard.
**Important Note**: escape keys that needs it as Return key (use \\r), double quotes (use \\\"), etc...
`),
				text: z.string().min(1).max(200).optional().default('').describe("Text to send to the emulator via emulated keyboard"),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, text }: { command: string; text: string }) => {
			let tclCommand: string;
			switch (command) {
				case "sendText":
					tclCommand = `type "${encodeTypeText(text)}"`;
					break;
				default:
					return getResponseContent([
						`Error: Unknown keyboard command "${command}".`
					]);
			}
			const response = await openMSXInstance.sendCommand(tclCommand);
			return getResponseContent([
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"screen_shot",
		{
			title: "Screenshot tools",
			// Description of the tool (what it does)
			description: "Take a screenshot of the openMSX emulator screen.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["as_image", "to_file"]).describe(`Available commands:
	'as_image': take a screenshot and the image is returned in the response.
	'to_file': take a screenshot and save it to a file, the file name is returned in the response.
`),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command }: { command: string }) => {
			const openmsxCommand = `screenshot -raw -prefix "${OPENMSX_SCREENSHOT_DIR}mcp_"`;
			const response = await openMSXInstance.sendCommand(openmsxCommand);
			switch (command) {
				case "as_image":
					try {
						// Check if the response is a file path
						if (!response || !response.startsWith(OPENMSX_SCREENSHOT_DIR) || !response.endsWith('.png')) {
							throw new Error(`Invalid screenshot "${response}"`);
						}
						// Read the screenshot file
						const imageBuffer = await fs.readFile(response);
						const base64image = imageBuffer.toString('base64');
						// Remove the file after reading it
						await fs.unlink(response);
						// Return the image in the response
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
						return getResponseContent([
								'Error creating screenshot: '+response,
								error instanceof Error ? error.message : String(error),
							],
							true
						);
					}
				case "to_file":
					return getResponseContent([
						isErrorResponse(response) ? response : 'Screenshot taken in file: '+response
					]);
			}
			return getResponseContent([
				`Error: Unknown screen_shot command "${command}".`
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"screen_dump",
		{
			title: "Screen dump tools",
			// Description of the tool (what it does)
			description: `Take a screendump of the openMSX emulator screen as SC?.
The parameter scrbasename is the name of the filename (without path) to save the screendump, default is 'screendump'.
`,
			// Schema for the tool (input validation)
			inputSchema: {
				scrbasename: z.string().min(1).max(100).default("screendump").describe("Screendump filename (without path or extension) to save the screendump; default is 'screendump'"),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ scrbasename }: { scrbasename: string }) => {
			const openmsxCommand = `save_msx_screen "${OPENMSX_SCREENDUMP_DIR + scrbasename}"`;
			const response = await openMSXInstance.sendCommand(openmsxCommand);
			return getResponseContent([
				isErrorResponse(response) ? 'Fail:' : 'Screendump file saved as:',
				response
			]);
		});

	server.registerTool(
		// Name of the tool (used to call it)
		"basic_programming",
		{
			title: "BASIC programming tools",
			// Description of the tool (what it does)
			description: "Helper tool for developing BASIC programs.",
			// Schema for the tool (input validation)
			inputSchema: {
				command: z.enum(["isBasicAvailable", "newProgram", "runProgram", "setProgram", "getFullProgram", "getFullProgramAdvanced", "listProgramLines", "deleteProgramLines"]).describe(`Available commands:
	'isBasicAvailable': checks if the current machine is ready to manage BASIC programs (true), or not (false).
	'newProgram': clears the current BASIC program.
	'setProgram <program>': sets a full BASIC program or updates part of the current BASIC program with the specified string.
	'runProgram': runs the current BASIC program.
	'getFullProgram': retrieves the current BASIC program as plain text; very useful in text screen modes.
	'getFullProgramAdvanced': retrieves the current BASIC program along with the RAM address where each line is stored.
	'listProgramLines <startLine> [endLine]': lists the selected range of lines from the current BASIC program on the emulator screen.
	'deleteProgramLines <startLine> [endLine]': deletes a specific range of lines from the current BASIC program; if endLine is not specified, only the startLine is deleted.
**Important Note**: if error 'not in BASIC mode' then use the command 'isBasicAvailable' to wait for a ready state.
**Important Note**: prioritize these tools for developing BASIC programs, as they are more efficient than using the 'sendText' tool.
**Important Note**: all program lines must end with a carriage return (\\r) to be processed correctly, including the last line.
**Important Note**: if you have questions about MSX BASIC, use the resources provided by this MCP server.
`),
				program: z.string().min(1).max(10000).optional().describe("Basic program to set; use only \\r for line endings, even the last one. Used by [setProgram]"),
				startLine: z.number().min(0).max(9999).optional().describe("Start line number to list/delete BASIC program lines. Used by [listProgramLines, deleteProgramLines]"),
				endLine: z.number().min(0).max(9999).optional().describe("End line number to list/delete BASIC program lines. Used by [listProgramLines, deleteProgramLines]"),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, program, startLine, endLine }: { command: string; program?: string; startLine?: number, endLine?: number }) => {
			const CTRL_L_TEMPLATE = 'keymatrixdown 6 2 ; keymatrixdown 4 2 ; after time 0.1 { keymatrixup 6 2 ; keymatrixup 4 2 ; type_via_keybuf "%s" }';
			let tclCommand: string | undefined = undefined;
			let response: string | undefined = undefined;

			const inBasic = await openMSXInstance.emu_isInBasic();
			if (command !== "isBasicAvailable" && !inBasic) {
				response = 'Error: The current MSX machine is not in BASIC mode.'
			} else
			switch (command) {
				case "isBasicAvailable":
					response = inBasic.toString();
					break;
				case "newProgram":
					response = await openMSXInstance.sendCommand(CTRL_L_TEMPLATE.replace('%s', encodeTypeText('new\r')));
					if (response.startsWith('after#')) response = '';
					break;
				case "runProgram":
					response = await openMSXInstance.sendCommand(CTRL_L_TEMPLATE.replace('%s', encodeTypeText('run\r')));
					if (response.startsWith('after#')) response = '';
					break;
				case "deleteProgramLines":
					if (startLine === undefined) {
						response = 'Error: No startLine number provided to delete BASIC program lines.';
						break;
					}
					response = await openMSXInstance.sendCommand(CTRL_L_TEMPLATE.replace('%s', encodeTypeText(`delete ${startLine}-${endLine || startLine}\r`)));
					break;
				case "setProgram":
					if (!program) {
						response = 'Error: no BASIC program provided to set.'
						break;
					}
					if (program.includes('\n') || program.includes('\\n')) {
						response = 'Error: you cannot use \\n for line endings, use only \\r instead.';
						break;
					}
					// Escape '$' characters if '(' is the next character and is not escaped yet (openMSX variable substitutions)
					program = program.replace(/([^\\])(\$\()/g, '$1\\$2');
					// Get current speed to restore it later
					let speed = '100';
					if (isErrorResponse(speed = await openMSXInstance.sendCommand('set speed'))) {
						response = speed;
						break;
					}
					// Set speed to fast, type de program, wait to end, and restore speed
					if (isErrorResponse(response = await openMSXInstance.sendCommand(
						`set speed 10000 ; type_via_keybuf "${encodeTypeText(program)}" ; after idle 20 { set speed ${speed} }`
					))) break;
					// Success response
					response = '';
					break;
				case "getFullProgram":
					// Source: https://www.msx.org/forum/msx-talk/openmsx/export-basic-listing#comment-407392
					tclCommand = 'regsub -all -line {^[0-9a-f]x[0-9a-f]{4} > } [ listing ] ""';
					break;
				case "getFullProgramAdvanced":
					tclCommand = "listing";
					break;
				case "listProgramLines":
					if (startLine === undefined) {
						response = 'Error: No start line provided to list BASIC program lines.';
						break;
					}
					tclCommand = `type_via_keybuf \"${encodeTypeText(`list ${startLine}-${endLine || startLine}\r`)}\"`;
					break;
				default:
					response = `Error: Unknown command "${command}".`;
					break;
			}
			if (response === undefined && tclCommand) {
				response = await openMSXInstance.sendCommand(tclCommand);
			}
			return getResponseContent([
				response !== undefined ? response : `Error: No response for command "${command}".`
			]);
		}
	);


	// ============================================================================
	// MSX Documentation resources

	const resdocs: string[] = (await listResourcesDirectory(resourcesDir)).sort();
	interface RegResource {
		resource: RegisteredResource;
		uri: string;
	}
	const regResources:RegResource[] = [];

	for (let index = 0; index < resdocs.length; index++) {
		const sectionName = resdocs[index];
		const tocFile = path.join(resourcesDir, `${sectionName}/toc.json`);
		const tocContent = JSON.parse(await fs.readFile(tocFile, 'utf8'));
		tocContent.toc.forEach((item: any, itemIndex: number) => {
			const itemName = path.parse(item.uri.split('/').pop()).name || '';
			let resource = {
				uri: item.uri,
				filename: '',
				resource: server.registerResource(
				// Name of the resource (used to call it)
				`msxdocs_${sectionName}_${item.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`,
				// Resource URI template
				item.uri,
				// Metadata for the resource
				{
					title: item.title || `MSX Documentation '${sectionName}': ${itemName}`,
					description: item.description || `Documentation for MSX resource '${sectionName}': ${itemName}`,
					mimeType: item.mimeType || 'text/markdown',
				},
				// Handler for the resource (function to be executed when the resource is called)
				async (uri: URL) => {
					let resourceContent: string;
					let mimeType: string | undefined;
					if (uri.href.startsWith('http://') || uri.href.startsWith('https://')) {
						// Fetch the resource from the URL
						try {
							[resourceContent, mimeType] = await fetchCleanWebpage(uri.href);
						} catch (error) {
							// Throw exception (MCP protocol requirement)
							throw error;
						}
					} else {
						// Read the resource from the local MCP server resources directory
						try {
							let resourceFile: string | undefined;
							[mimeType, resourceFile] = await addFileExtension(path.join(resourcesDir, `${sectionName}/${itemName}`));
							resourceContent = await fs.readFile(resourceFile, 'utf8');
						} catch (error) {
							// Throw exception (MCP protocol requirement)
							throw new Error(`Error reading resource ${sectionName}/${item.uri}: ${error instanceof Error ? error.message : String(error)}`);
						}
					}
					return {
						contents: [{
							uri: uri.href,
							text: resourceContent,
							mimeType: mimeType || 'text/plain',
						}],
					};
				}
			)};
			regResources.push(resource);
		});
	};


	// Source: https://www.msx.org/wiki/Category:MSX-BASIC_Instructions
	const basicInstructions: string[] = [
		"ABS()", "AND", "ASC()", "ATN()", "AUTO", "BASE()", "BEEP", "BIN$()", "BLOAD", "BSAVE", "CALL", "CALL ADJUST", "CALL PAUSE", "CALL PCMPLAY", "CALL PCMREC",
		"CDBL()", "CHR$()", "CINT()", "CIRCLE", "CLEAR", "CLOAD", "CLOAD?", "CLOSE", "CLS", "COLOR", "COLOR=", "COLOR SPRITE()", "COLOR SPRITE$()", "CONT", "COPY",
		"COPY SCREEN", "COS()", "CSAVE", "CSNG()", "CSRLIN", "DATA", "DEFDBL", "DEF FN", "DEFINT", "DEFSNG", "DEFSTR", "DEF USR", "DELETE", "DIM", "DRAW", "ELSE",
		"END", "EOF()", "EQV", "ERASE", "ERL", "ERR", "ERROR", "EXP()", "FIX()", "FN", "FOR...NEXT", "FRE()", "GET DATE", "GET TIME", "GOSUB", "GOTO", "HEX$()",
		"IF...GOTO...ELSE", "IF...THEN...ELSE", "IMP", "INKEY$", "INP()", "INPUT", "INPUT$()", "INSTR()", "INT()", "INTERVAL", "KEY", "KEY()", "LEFT$()", "LEN()",
		"LET", "LINE", "LINE INPUT", "LIST", "LLIST", "LOAD", "LOCATE", "LOG()", "LPOS()", "LPRINT", "MAXFILES", "MERGE", "MID$()", "MOD", "MOTOR", "NEW", "NOT",
		"OCT$()", "ON...GOSUB", "ON...GOTO", "ON ERROR GOTO", "ON INTERVAL GOSUB", "ON KEY GOSUB", "ON SPRITE GOSUB", "ON STOP GOSUB", "ON STRIG GOSUB", "OPEN",
		"OR", "OUT", "PAD()", "PAINT", "PDL()", "PEEK()", "PLAY", "PLAY()", "POINT", "POKE", "POS()", "PRESET", "PRINT", "PSET", "PUT KANJI", "PUT SPRITE", "READ",
		"REM", "RENUM", "RESTORE", "RESUME", "RETURN", "RIGHT$()", "RND()", "RUN", "SAVE", "SCREEN", "SET ADJUST", "SET BEEP", "SET DATE", "SET PAGE", "SET PASSWORD",
		"SET PROMPT", "SET SCREEN", "SET SCROLL", "SET TIME", "SET TITLE", "SET VIDEO", "SGN()", "SIN()", "SOUND", "SPACE$()", "SPC()", "SPRITE", "SPRITE$()",
		"SQR()", "STICK()", "STOP", "STR$()", "STRIG()", "STRING$()", "SWAP", "TAB()", "TAN()", "TIME", "TROFF", "TRON", "USR()", "VAL()", "VARPTR()", "VDP()",
		"VPEEK()", "VPOKE", "WAIT", "WIDTH", "XOR"
	];
	server.resource(
		"msxdocs_basic_wiki",
		new ResourceTemplate(
			"msxdocs://basic_wiki/{instruction}",
			{
				list: undefined,
				complete: {
					instruction: (value: string) => basicInstructions,
				},
			}
		),
		{
			title: "MSX BASIC Instructions Documentation",
			description: "Documentation about all the standard MSX BASIC instructions from www.msx.org",
			mimeType: "text/html",
		},
		async (uri: URL, variables: any) => {
			const instruction = (variables.instruction as string)
				.replace(/ /g, '_')
				.replace(/\?/g, '%3F')
				.replace(/=/g, '%3D');
			const url = `https://www.msx.org/wiki/${instruction}`;
			let resourceContent: string;
			let mimeType: string | undefined;
			try {
				[resourceContent, mimeType] = await fetchCleanWebpage(url);
			} catch (error) {
				// Throw exception (MCP protocol requirement)
				throw error;
			}
			return {
				contents: [{
					uri: uri.href,
					text: resourceContent,
					mimeType: mimeType || 'text/plain',
				}],
			};
		}
	);

	// Register the tool to get a specific MSX documentation resource
	server.registerTool(
		// Name of the tool (used to call it)
		"msxdocs_resource_get",
		{
			title: "Tool to get a resource",
			// Description of the tool (what it does)
			description: "Get a specific available MSX documentation resource from this MCP server resources.",
			// Schema for the tool (input validation)
			inputSchema: {
				resourceName: z.enum(regResources.map(res => res.resource.name) as [string, ...string[]]).describe("Name of the resource to obtain, e.g. 'msxdocs_programming_interrupts'"),
			},
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ resourceName }: { resourceName: string }, extra) => {
			const index: number = regResources.findIndex((res: RegResource) => res.resource.name === resourceName);
			const uriString = index !== -1 ? regResources[index].uri : undefined;
			const resource = index !== -1 ? regResources[index].resource : undefined;
			if (!resource || !uriString) {
				return getResponseContent([
					`Error: Resource '${resourceName}' not found.`
				]);
			}
			let documentationText = '';
			try {
				// If the resource is found, return its content
				let resourceContent = await resource.readCallback(
					new URL(uriString),
					extra
				);
				if (!resourceContent.contents?.length) {
					return getResponseContent([
						`Error: Resource '${resourceName}' has no content available.`
					]);
				}
				// Return the first content item (assuming it's the main content)
				const content = resourceContent.contents[0];
				if ('text' in content) {
					documentationText = content.text as string;
				} else {
					return getResponseContent([
						`Error: Resource '${resourceName}' has no content available.`
					]);
				}
			} catch (error) {
				return getResponseContent([
					`Error: error reading resource '${resourceName}': ${error instanceof Error ? error.message : String(error)}`
				]);
			}
			return {
				content: [{
					type: "text",
					text: `Content from resource: '${resourceName}'`,
				},{
					type: "text",
					text: documentationText || 'No content available for this resource.',
					mimeType: resource.metadata?.mimeType || 'text/plain',
				}/*, {
					type: "resource",
					resource: {
						uri: resource.metadata?.uri || resourceName,
						title: resource.metadata?.title || `Resource: ${resourceName}`,
						mimeType: resource.metadata?.mimeType || 'text/plain',
						text: documentationText || 'No content available for this resource.',
					}
				}*/],
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
  mcp-openmsx http               # HTTP transport
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
			const httpServer = await createServerInstance();
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

	// Reusable handle GET / DELETE requests
	const handleSessionRequest = async (req: express.Request, res: express.Response) => {
		const sessionId = req.headers['mcp-session-id'] as string | undefined;
		if (!sessionId || !transports[sessionId]) {
			res.status(400).send('Invalid or missing session ID');
			return;
		}
		const transport = transports[sessionId];
		await transport.handleRequest(req, res);
	};

	app.get('/mcp', handleSessionRequest);
	app.delete('/mcp', handleSessionRequest);

	const port = process.env.MCP_HTTP_PORT || 3000;
	app.listen(port, () => {
		console.log(`MCP Server listening on port ${port}`);
	});
}

async function createServerInstance()
{
	// Create a new server instance (you might want to extract server creation logic)
	const newServer = new McpServer({
		name: "mcp-openmsx",
		version: PACKAGE_VERSION,
	});

	// Re-register all tools (you might want to extract this to a separate function)
	try {
		await registerAllTools(newServer);
	} catch (error) {
		console.error("Error registering tools/resources:", error);
		throw error;
	}

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
	if (process.env.OPENMSX_REPLAYS_DIR && process.env.OPENMSX_REPLAYS_DIR !== '') {
		OPENMSX_REPLAYS_DIR = process.env.OPENMSX_REPLAYS_DIR + path.sep;
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
		(await createServerInstance()).connect(transport);
	}
}

main().catch((error) => {
	gracefulShutdown(1);
	process.exit(1);
});
