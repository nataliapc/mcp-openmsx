#!/usr/bin/env node
/**
 * MCP openMSX Server
 * 
 * Model Context Protocol server that manages openMSX emulator instances
 * through TCL commands via stdio.
 * 
 * @package @nataliapc/mcp-openmsx
 * @version 1.1.8
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import express, { Request, Response } from "express";
import fs from "fs/promises";
import mime from "mime-types";
import path from "path";
import { openMSXInstance } from "./openmsx.js";
import { encodeTypeText, isErrorResponse, getResponseContent } from "./utils.js";
import { file } from "zod/v4";


// Version info for CLI
const PACKAGE_VERSION = "1.1.8";

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
	server.tool(
		// Name of the tool (used to call it)
		"emu_control",
		// Description of the tool (what it does)
		`Controls an openMSX emulator.
		Commands:
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
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["launch", "close", "powerOn", "powerOff", "reset", "getEmulatorSpeed", "setEmulatorSpeed", "machineList", "extensionList", "wait"]).describe("Command to execute"),
			machine: z.string().min(1).max(100).optional().describe("Machine name to launch; valid names can be obtained using [machineList]. Used by [launch]."),
			extensions: z.array(z.string().min(1).max(100)).optional().describe("List of extensions to use; valid extensions can be obtained using [extensionList]. Used by [launch]."),
			emuspeed: z.number().min(1).max(10000).optional().default(100).describe("Emulator speed as a percentage (1-10000); default is 100. Used by [setEmulatorSpeed]."),
			seconds: z.number().min(1).max(10).optional().default(3).describe("Number of seconds to wait; default is 3. Used by [wait]."),
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

	server.tool(
		// Name of the tool (used to call it)
		"emu_media",
		// Description of the tool (what it does)
		`Manage tapes, rom cartridges, and floppy disks.
		Commands:
			'tapeInsert <tapefile>': insert a valid tape file (*.cas, *.wav, *.tsx).
			'tapeRewind': rewind the current tape.
			'tapeEject': remove tape from virtual cassette player.
			'romInsert <romfile>': insert a valid ROM cartridge file (*.rom) at cartridge slot A.
			'romEject': remove the current ROM cartridge from cartridge slot A.
			'diskInsert <diskfile>': insert a valid disk file (*.dsk) in floppy disk A.
			'diskInsertFolder <diskfolder>': use a host folder as a floppy disk A root directory.
			'diskEject': remove the current disk from floppy disk A.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["tapeInsert", "tapeRewind", "tapeEject", "romInsert", "romEject", "diskInsert", "diskInsertFolder", "diskEject"]).describe("Command to execute"),
			tapefile: z.string().min(1).max(200).optional().describe("Absolute Tape filename to insert. Used by [tapeInsert]"),
			romfile: z.string().min(1).max(200).optional().describe("Absolute ROM filename to insert. Used by [romInsert]"),
			diskfile: z.string().min(1).max(200).optional().describe("Absolute Disk filename to insert. Used by [diskInsert]"),
			diskfolder: z.string().min(1).max(200).optional().describe("Absolute Disk folder filename to insert. Used by [diskInsertFolder]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"emu_info",
		// Description of the tool (what it does)
		`Obtain informacion about the current emulated machine.
		Commands:
			'getStatus': returns the status of the openMSX emulator.
			'getSlotsMap': shows what devices/ROM/RAM are inserted into which slots.
			'getIOPortsMap': shows an overview about the I/O mapped devices.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["getStatus", "getSlotsMap", "getIOPortsMap"]).describe("Command to execute"),
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

	server.tool(
		// Name of the tool (used to call it)
		"emu_vdp",
		// Description of the tool (what it does)
		`Manage the VDP (Video Display Processor).
		Commands:
			'getPalette': returns the current V9938/V9958 color palette in RGB333 format.
			'getRegisters': returns all VDP register values.
			'getRegisterValue <register>': returns the value of a specific VDP register (0-31) in decimal format.
			'setRegisterValue <register> <value>': sets a hexadecimal value to a specific VDP register (0-31).
			'screenGetMode': returns the current screen mode (0-12) as a number, which matches the BASIC SCREEN command.
			'screenGetFullText': returns the full content of an MSX text screen (screen 0 or 1) as a string; PRIORITIZE this command to view screen content in text modes.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["getPalette", "getRegisters", "getRegisterValue", "setRegisterValue", "screenGetMode", "screenGetFullText"]).describe("Command to execute"),
			register: z.number().min(0).max(31).optional().describe("VDP register number (0-31) to read/write. Used by [getRegisterValue, setRegisterValue]"),
			value: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional().describe("2 hexadecimal digits for a VDP register value (e.g. 0x1f). Used by [setRegisterValue]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"debug_run",
		// Description of the tool (what it does)
		`Control execution (break, continue, step).
		Commands:
			'break': to break CPU at current execution position.
			'isBreaked': to check if the CPU is currently in break state (1) or not (0).
			'continue': to continue execution after break.
			'stepIn': to execute one CPU instruction, go into subroutines.
			'stepOver': to execute one CPU instruction, but don't go into subroutines.
			'stepOut': to step out of the current subroutine.
			'stepBack': to step one instruction back in time.
			'runTo <address>': to run the CPU until it reaches the specified address.
		**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x0000).
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["break", "isBreaked", "continue", "stepIn", "stepOut", "stepOver", "stepBack", "runTo"]).describe("Command to execute"),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [runTo]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"debug_cpu",
		// Description of the tool (what it does)
		`Read/write CPU registers, CPU info, Stack pile, and Disassemble code from memory.
		Commands:
			'getCpuRegisters': to get an overview of all the CPU registers.
			'getRegister <register>': to get the decimal value of a specific CPU register (pc, sp, ix, iy, af, bc, de, hl, ixh, ixl, iyh, iyl, a, f, b, c, d, e, h, l, i, r, im, iff).
			'setRegister <register> <value>': to set the value of a specific CPU register (pc, sp, ix, iy, af, bc, de, hl, ixh, ixl, iyh, iyl, a, f, b, c, d, e, h, l, i, r, im, iff).
			'getStackPile': to get an overview of the CPU stack.
			'disassemble [address] [size]': to print disassembled instructions at the address parameter location or PC register if empty.
			'getActiveCpu': to return the active cpu: z80 or r800.
		"**Important Note**: Addresses and values are in hexadecimal format (e.g. 0xd2 0x3af2)."
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["getCpuRegisters", "getRegister", "setRegister", "getStackPile", "disassemble", "getActiveCpu"]).describe("Command to execute"),
			register: z.enum(["pc", "sp", "ix", "iy", "af", "bc", "de", "hl", "ixh", "ixl", "iyh", "iyl", "a", "f", "b", "c", "d", "e", "h", "l", "i", "r", "im", "iff"]).optional()
				.describe("CPU register to read/write. Used by [getRegister, setRegister]"),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [disassemble]"),
			value: z.string().regex(/^0x[0-9a-fA-F]{2,4}$/).optional().describe("2-4 hexadecimal digits for a byte value (e.g. 0xa5 or 0xa5b1). Used by [setRegister]"),
			size: z.number().min(8).max(50).optional().describe("Number of bytes to disassemble. Used by [disassemble]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"debug_memory",
		// Description of the tool (what it does)
		`Slots info, and Read/write from/to memory in the openMSX emulator.
		Commands:
			'selectedSlots': to get a list of the currently selected memory slots.
			'getBlock <address> [lines]': to read a block of memory from the specified address.
			'readByte <address>': to read a BYTE from the specified address.
			'readWord <address>': to read a WORD from the specified address.
			'writeByte <address> <value8>': to write a BYTE to the specified address.
			'writeWord <address> <value16>': to write a WORD to the specified address.
		**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x0000).
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["selectedSlots", "getBlock", "readByte", "readWord", "writeByte", "writeWord"]).describe("Command to execute"),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [getBlock, readByte, writeByte, readWord, writeWord]"),
			lines: z.number().min(1).max(50).optional().default(8).describe("Number of lines to obtain. Used by [getBlock]"),
			value8: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional().describe("2 hexadecimal digits for a byte value (e.g. 0xa5). Used by [writeByte]"),
			value16: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a word value (e.g. 0xa5b1). Used by [writeWord]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"debug_vram",
		// Description of the tool (what it does)
		`Read or write from/to VRAM video memory in the openMSX emulator.
		Commands:
			'getBlock <address> [lines]': to read a block of VRAM memory from the specified address.
			'readByte <address>': to read a BYTE from the specified VRAM address.
			'writeByte <address> <value8>': to write a BYTE to the specified VRAM address.
		**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x0000).
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["getBlock", "readByte", "writeByte"]).describe("Command to execute"),
			address: z.string().regex(/^0x[0-9a-fA-F]{5}$/).optional().describe("5 hexadecimal digits for a VRAM address (e.g. 0x04af3). Used by [getBlock, readByte, writeByte]"),
			lines: z.number().min(1).max(50).optional().default(8).describe("Number of lines to obtain. Used by [getBlock]"),
			value8: z.string().regex(/^0x[0-9a-fA-F]{2}$/).optional().describe("2 hexadecimal digits for a byte value (e.g. 0xa5). Used by [writeByte]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"debug_breakpoints",
		// Description of the tool (what it does)
		`Create, remove, and list breakpoints.
		Commands:
			'create <address>': create a breakpoint at a specified address, and returns its name.
			'remove <bpname>': remove a breakpoint by name (e.g. bp#1).
			'list': enumerate the active breakpoints.
		"**Important Note**: Addresses and values are in hexadecimal format (e.g. 0x4af3).
		"**Important Note**: The memory addresses of functions and variables can be previously obtained from *.sym or *.map files.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["create", "remove", "list"]).describe("Command to execute"),
			address: z.string().regex(/^0x[0-9a-fA-F]{4}$/).optional().describe("4 hexadecimal digits for a memory address (e.g. 0x4af3). Used by [create]"),
			bpname: z.string().min(3).max(10).optional().describe("Breakpoint name (e.g. bp#1). Used by [remove]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"emu_savestates",
		// Description of the tool (what it does)
		`Load, save, and list savestates.
		Commands:
			'load <name>': restores a previously created savestate.
			'save <name>': creates a snapshot of the currently emulated MSX machine specifying a name for the savestate.
			'list': returns the names of all previously created savestates, separated by spaces.
		**Important Note**: names with spaces are enclosed in {}.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["load", "save", "list"]).describe("Command to execute"),
			name: z.string().min(1).max(20).optional().describe("Name of the savestate to load/save. Used by [load, save]"),
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

	server.tool(
		// Name of the tool (used to call it)
		"emu_replay",
		// Description of the tool (what it does)
		`When replay is enabled (the default) the emulator collect data while emulating,
		which enables you to go back and forward in MSX time.
		Commands:
			'start': starts the replay mode (enabled by default when emulator is launched).
			'stop': stops the replay mode.
			'status': gives information about the replay feature and the data that is collected.
			'goBack <seconds>': go back specified seconds (1-60) in the timeline, you cannot go back to a time before the time the replay started.
			'absoluteGoto <time>': go to the indicated absolute time in seconds in the MSX timeline, if time is before replay started it will jump to the time when is started.
			'truncate': stop replaying and wipe all the future replay data after now.
			'saveReplay [filename]': saves the current replay data to a file (extension .omr), filename is returned in the response.
			'loadReplay <filename>': loads a previously saved replay file (extension .omr), starts replaying from the begin, and starts replay mode.
		**Important Note**: consider do a #debug_run 'break' to maintain the timeline before a 'goBack' or 'absoluteGoto'.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["start", "stop", "status", "goBack", "absoluteGoto", "truncate", "saveReplay", "loadReplay"]).describe("Command to execute"),
			seconds: z.number().min(1).max(60).optional().describe("Seconds to go back. Used by [goBack]"),
			time: z.string().regex(/^\d+$/).optional().describe("Absolute time in seconds to go to. Used by [absoluteGoto]"),
			filename: z.string().min(1).max(200).optional().describe("Filename to save/load replay. Used by [saveReplay, loadReplay]"),
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, seconds, time, filename }: { command: string; seconds?: number; time?: string; filename?: string }) => {
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

	server.tool(
		// Name of the tool (used to call it)
		"emu_keyboard",
		// Description of the tool (what it does)
		`Send a text to the openMSX emulator.
		Commands:
			'sendText <text>': type a string in the emulated MSX, this command automatically press and release keys in the MSX keyboard matrix.
		**Important Note**: each 'text' sent is limited to 200 characters, and the 'text' is sent as if it was typed in the MSX keyboard.
		**Important Note**: escape keys that needs it as Return key (use \\r), double quotes (use \\\"), etc...
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["sendText"]).describe("Command to execute"),
			text: z.string().min(1).max(200).optional().default('').describe("Text to send to the emulator via emulated keyboard"),
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

	server.tool(
		// Name of the tool (used to call it)
		"screen_shot",
		// Description of the tool (what it does)
		`Take a screenshot of the openMSX emulator screen.
		Commands:
			'as_image': take a screenshot and the image is returned in the response.
			'to_file': take a screenshot and save it to a file, the file name is returned in the response.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["as_image", "to_file"]).describe("Command to execute"),
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

	server.tool(
		// Name of the tool (used to call it)
		"screen_dump",
		// Description of the tool (what it does)
		`Take a screendump of the openMSX emulator screen as SC?.
		The parameter scrbasename is the name of the filename (without path) to save the screendump, default is 'screendump'.
		`,
		// Schema for the tool (input validation)
		{
			scrbasename: z.string().min(1).max(100).default("screendump"),
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

	server.tool(
		// Name of the tool (used to call it)
		"basic_programming",
		// Description of the tool (what it does)
		`Tool helper to develop BASIC programs.
		Commands:
			'newProgram': clears the current BASIC program.
			'setProgram <program>': sets/updates the current BASIC program to the specified string.
			'runProgram': runs the current BASIC program.
			'getFullProgram': returns the current BASIC program as a plain text string.
			'getFullProgramAdvanced': returns the current BASIC program with the ram address where each line is coded.
			'listProgramLines <startLine> [endLine]': lists at the emulator screen the selected range lines of the current BASIC program.
			'deleteProgramLines <startLine> [endline]': deletes a specific line range from the current BASIC program, if endline is not specified, only the startLine is deleted.
		**Important Note**: priorize this tools to develop BASIC programs, it's more efficient than using the 'sendText' tool.
		**Important Note**: all the program lines must be ended with a carriage return (\\r) to be correctly processed, even the last one.
		**Important Note**: if you have doubts about MSX BASIC, use the resources provided by this MCP.
		`,
		// Schema for the tool (input validation)
		{
			command: z.enum(["newProgram", "runProgram", "setProgram", "getFullProgram", "getFullProgramAdvanced", "listProgramLines", "deleteProgramLines"]).describe("Command to execute"),
			program: z.string().min(1).max(10000).optional().describe("Basic program to set; every line must be ended with \\r, even the last one. Used by [setProgram]"),
			startLine: z.number().min(0).max(9999).optional().describe("Start line number to list/delete BASIC program lines. Used by [listProgramLines, deleteProgramLines]"),
			endLine: z.number().min(0).max(9999).optional().describe("End line number to list/delete BASIC program lines. Used by [listProgramLines, deleteProgramLines]"),
		},
		// Handler for the tool (function to be executed when the tool is called)
		async ({ command, program, startLine, endLine }: { command: string; program?: string; startLine?: number, endLine?: number }) => {
			const CTRL_L_TEMPLATE = 'keymatrixdown 6 2 ; keymatrixdown 4 2 ; after time 0.1 { keymatrixup 6 2 ; keymatrixup 4 2 ; type_via_keybuf "%s" }';
			let tclCommand: string | undefined = undefined;
			let response: string | undefined = undefined;
			switch (command) {
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
						response = 'Error: No BASIC program provided to set.'
						break;
					}
					// Get current speed to restore it later
					let speed = '100';
					if (isErrorResponse(speed = await openMSXInstance.sendCommand('set speed'))) {
						response = speed;
						break;
					}
					// Set speed to fast for program input
					if (isErrorResponse(response = await openMSXInstance.sendCommand('set speed 10000')))
						break;
					// Clear the screen and type the program
					if (isErrorResponse(response = await openMSXInstance.sendCommand(`type_via_keybuf "${encodeTypeText(program)}"`)))
						break;
					// Restore the original speed
					if (isErrorResponse(response = await openMSXInstance.sendCommand(`set speed ${speed}`)))
						break;
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

	const resdocs: string[] = (await listResourcesDirectory()).sort();

	for (let index = 0; index < resdocs.length; index++) {
		const sectionName = resdocs[index];
		const tocFile = path.join(resourcesDir, `${sectionName}/toc.json`);
		const tocContent = JSON.parse(await fs.readFile(tocFile, 'utf8'));
		tocContent.toc.forEach((item: any, itemIndex: number) => {
			const itemName = item.uri.split('/').pop() || '';
			server.resource(
				// Name of the resource (used to call it)
				`msxdocs_${sectionName}_${itemName}`,
				// Resource URI template
				item.uri,
				// Metadata for the resource
				{
					title: item.title || `MSX Documentation '${sectionName}' - ${itemName}`,
					description: item.description || `Documentation for MSX resource '${sectionName}' - ${itemName}`,
					mimeType: item.mimeType || 'text/markdown',
				},
				// Handler for the resource (function to be executed when the resource is called)
				async (uri: URL) => {
					let resourceContent: string;
					let mimeType: string | undefined;
					if (uri.href.startsWith('http://') || uri.href.startsWith('https://')) {
						// Fetch the resource from the URL
						try {
							resourceContent = await fetch(uri.href).then(response => {
								mimeType = response.headers.get('content-type') || 'text/plain';
								return response.text();
							}) || 'Error downloading resource content';
						} catch (error) {
							// Throw exception (MCP protocol requirement)
							throw new Error(`Error fetching resource from ${uri.href}: ${error instanceof Error ? error.message : String(error)}`);
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
			);
		});
	};
}

async function addFileExtension(filePath: string): Promise<string[]>
{
	// Get directory and filename
	const directory = path.dirname(filePath);
	const filename = path.basename(filePath);
	
	try {
		// Get all files in directory that start with our filename
		const files = await fs.readdir(directory);
		const matchingFiles = files.filter(file => file.startsWith(filename));
		
		if (matchingFiles.length > 0) {
			const fileFound = path.join(directory, matchingFiles[0]);
			return [
				mime.lookup(fileFound) || 'text/plain',
				fileFound
			];
		}
	} catch (error) {
		console.error('Error reading directory:', error);
	}
	
	// Return original if no matches found
	return [ 'text/plain', filePath ];
}

async function listResourcesDirectory(): Promise<string[]>
{
	try {
		const directories = await fs.readdir(resourcesDir, { withFileTypes: true });
		const folderNames = directories
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
		return folderNames;
	} catch (error) {
		console.error("Error reading resources directory:", error);
		return [];
	}
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

async function createServerInstance()
{
	// Create a new server instance (you might want to extract server creation logic)
	const newServer = new McpServer({
		name: "mcp-openmsx",
		version: PACKAGE_VERSION,
	});
	
	// Re-register all tools (you might want to extract this to a separate function)
	await registerAllTools(newServer);
	
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
