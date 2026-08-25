import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/openmsx.js', () => ({
	openMSXInstance: {
		sendCommand: vi.fn(),
		emu_status: vi.fn(),
	},
}));

vi.mock('fs/promises', () => ({
	default: {
		mkdir: vi.fn(),
	},
}));

import { openMSXInstance } from '../../src/openmsx.js';
import fs from 'fs/promises';
import { registerTools } from '../../src/server_tools.js';
import type { EmuDirectories } from '../../src/server.js';

interface ToolResponse {
	content: Array<{ type: string; text: string }>;
	structuredContent?: Record<string, unknown>;
	isError?: boolean;
}

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResponse>;

class ToolRegistry {
	readonly registrations: Array<{ name: string; handler: ToolHandler }> = [];

	registerTool(name: string, _config: unknown, handler: ToolHandler): void {
		this.registrations.push({ name, handler });
	}
}

const mockSendCommand = vi.mocked(openMSXInstance.sendCommand);
const mockEmuStatus = vi.mocked(openMSXInstance.emu_status);
const mockMkdir = vi.mocked(fs.mkdir);
const dummyDirs = {} as EmuDirectories;
const screenDumpDir = '/tmp/openmsx/screendumps';
const screenDumpDirs = { OPENMSX_SCREENDUMP_DIR: screenDumpDir } as EmuDirectories;

async function findHandler(name: string, directories: EmuDirectories = dummyDirs): Promise<ToolHandler> {
	const registry = new ToolRegistry();
	await registerTools(registry as unknown as McpServer, directories);
	const entry = registry.registrations.find(registration => registration.name === name);
	if (!entry) throw new Error(`Tool "${name}" not registered`);
	return entry.handler;
}

beforeEach(() => {
	vi.clearAllMocks();
	mockMkdir.mockResolvedValue(undefined);
});

describe('emu_info', () => {
	it('parses a JSON machine status', async () => {
		const rawStatus = JSON.stringify({ machine: 'Philips NMS 8250', year: '1986' });
		mockEmuStatus.mockResolvedValue(rawStatus);
		const response = await (await findHandler('emu_info'))({ command: 'getStatus' });

		expect(mockEmuStatus).toHaveBeenCalledOnce();
		expect(response).toEqual({
			content: [{ type: 'text', text: rawStatus }],
			structuredContent: {
				command: 'getStatus',
				status: { machine: 'Philips NMS 8250', year: '1986' },
			},
			isError: false,
		});
	});

	it('returns plain status text when the response is not JSON', async () => {
		mockEmuStatus.mockResolvedValue('machine status unavailable');
		const response = await (await findHandler('emu_info'))({ command: 'getStatus' });

		expect(response.structuredContent).toEqual({
			command: 'getStatus',
			result: 'machine status unavailable',
		});
		expect(response.isError).toBe(false);
	});

	it.each([
		['getSlotsMap', 'slotmap', 'slot map'],
		['getIOPortsMap', 'iomap', 'I/O map'],
	] as const)('routes %s to openMSX', async (command, expectedCommand, result) => {
		mockSendCommand.mockResolvedValue(result);
		const response = await (await findHandler('emu_info'))({ command });

		expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
		expect(response.structuredContent).toEqual({ command, result });
		expect(response.isError).toBe(false);
	});

	it('returns an error response from openMSX', async () => {
		mockSendCommand.mockResolvedValue('Error: emulator is not connected');
		const response = await (await findHandler('emu_info'))({ command: 'getSlotsMap' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: emulator is not connected' }],
			isError: true,
		});
	});

	it('rejects unknown info commands', async () => {
		const response = await (await findHandler('emu_info'))({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown emulator info command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('emu_vdp', () => {
	it('parses palette output', async () => {
		mockSendCommand.mockResolvedValue([
			' 0:000  4:117  8:711  c:141',
			' 1:000  5:237  9:733  d:625',
			' 2:611  6:171  a:771  e:666',
			' 3:272  7:567  b:773  f:777',
		].join('\n'));
		const response = await (await findHandler('emu_vdp'))({ command: 'getPalette' });

		expect(mockSendCommand).toHaveBeenCalledWith('palette');
		expect(response.structuredContent).toMatchObject({ command: 'getPalette' });
		expect(response.structuredContent?.palette).toHaveLength(16);
	});

	it('parses VDP register output', async () => {
		mockSendCommand.mockResolvedValue(' 0 : 0x04   7 : 0xF4');
		const response = await (await findHandler('emu_vdp'))({ command: 'getRegisters' });

		expect(mockSendCommand).toHaveBeenCalledWith('vdpregs');
		expect(response.structuredContent).toEqual({
			command: 'getRegisters',
			registers: { '0': '0x04', '7': '0xF4' },
		});
	});

	it('formats a VDP register value', async () => {
		mockSendCommand.mockResolvedValue('31\n');
		const response = await (await findHandler('emu_vdp'))({ command: 'getRegisterValue', register: 7 });

		expect(mockSendCommand).toHaveBeenCalledWith('vdpreg 7');
		expect(response.structuredContent).toEqual({
			command: 'getRegisterValue', register: 7, decimalValue: 31, hexValue: '0x1F',
		});
	});

	it('sets a VDP register and treats an empty response as success', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler('emu_vdp'))({
			command: 'setRegisterValue', register: 7, value: '0x1F',
		});

		expect(mockSendCommand).toHaveBeenCalledWith('vdpreg 7 0x1F');
		expect(response.structuredContent).toEqual({
			command: 'setRegisterValue', register: 7, newValue: '0x1F', result: 'Ok',
		});
	});

	it('trims the screen mode response', async () => {
		mockSendCommand.mockResolvedValue(' TEXT80 \n');
		const response = await (await findHandler('emu_vdp'))({ command: 'screenGetMode' });

		expect(mockSendCommand).toHaveBeenCalledWith('get_screen_mode');
		expect(response.structuredContent).toEqual({ command: 'screenGetMode', screenMode: 'TEXT80' });
	});

	it('returns full screen text', async () => {
		mockSendCommand.mockResolvedValue('HELLO\nWORLD');
		const response = await (await findHandler('emu_vdp'))({ command: 'screenGetFullText' });

		expect(mockSendCommand).toHaveBeenCalledWith('get_screen');
		expect(response).toEqual({
			content: [{ type: 'text', text: 'The screen text is:\nHELLO\nWORLD' }],
			structuredContent: { command: 'screenGetFullText', screenText: 'HELLO\nWORLD' },
			isError: false,
		});
	});

	it('returns screen text errors without structured content', async () => {
		mockSendCommand.mockResolvedValue('Error: screen unavailable');
		const response = await (await findHandler('emu_vdp'))({ command: 'screenGetFullText' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: screen unavailable' }],
			isError: true,
		});
	});

	it('rejects unknown VDP commands', async () => {
		const response = await (await findHandler('emu_vdp'))({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown emulator vdp command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('emu_savestates', () => {
	it.each([
		['load', { name: 'boot' }, 'loadstate boot', 'Loaded savestate: '],
		['save', { name: 'checkpoint' }, 'savestate checkpoint', 'Saved savestate: '],
		['list', {}, 'list_savestates', 'Savestate names: '],
	] as const)('routes %s and formats the response', async (command, args, expectedCommand, label) => {
		mockSendCommand.mockResolvedValue('state-ok');
		const response = await (await findHandler('emu_savestates'))({ command, ...args });

		expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
		expect(response).toEqual({
			content: [
				{ type: 'text', text: label },
				{ type: 'text', text: 'state-ok' },
			],
			isError: false,
		});
	});

	it('preserves savestate errors in the response', async () => {
		mockSendCommand.mockResolvedValue('Error: state not found');
		const response = await (await findHandler('emu_savestates'))({ command: 'load', name: 'missing' });

		expect(response).toEqual({
			content: [
				{ type: 'text', text: 'Loaded savestate: ' },
				{ type: 'text', text: 'Error: state not found' },
			],
			isError: true,
		});
	});

	it('rejects unknown savestate commands', async () => {
		const response = await (await findHandler('emu_savestates'))({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown savestate command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('screen_dump', () => {
	it('creates the directory and sends a normalized save command', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler('screen_dump', screenDumpDirs))({ scrbasename: 'screen1' });

		expect(mockMkdir).toHaveBeenCalledWith(screenDumpDir, { recursive: true });
		expect(mockSendCommand).toHaveBeenCalledWith(`save_msx_screen "${screenDumpDir}/screen1"`);
		expect(response).toEqual({
			content: [
				{ type: 'text', text: 'Screendump file saved as:' },
				{ type: 'text', text: 'Ok' },
			],
			isError: false,
		});
	});

	it('normalizes Windows-style screendump paths for Tcl', async () => {
		const windowsDir = 'C:\\Users\\test\\dumps';
		mockSendCommand.mockResolvedValue('');
		await (await findHandler('screen_dump', { OPENMSX_SCREENDUMP_DIR: windowsDir } as EmuDirectories))({
			scrbasename: 'screen1',
		});

		expect(mockSendCommand).toHaveBeenCalledWith('save_msx_screen "C:/Users/test/dumps/screen1"');
	});

	it('reports openMSX errors as failed screendumps', async () => {
		mockSendCommand.mockResolvedValue('Error: unsupported screen mode');
		const response = await (await findHandler('screen_dump', screenDumpDirs))({ scrbasename: 'screen1' });

		expect(response).toEqual({
			content: [
				{ type: 'text', text: 'Fail:' },
				{ type: 'text', text: 'Error: unsupported screen mode' },
			],
			isError: true,
		});
	});

	it('reports directory creation errors without sending a command', async () => {
		mockMkdir.mockRejectedValue(new Error('EACCES'));
		const response = await (await findHandler('screen_dump', screenDumpDirs))({ scrbasename: 'screen1' });

		expect(response).toEqual({
			content: [{ type: 'text', text: `Error: Cannot create directory "${screenDumpDir}": EACCES` }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});