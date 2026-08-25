import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/openmsx.js', () => ({
	openMSXInstance: {
		sendCommand: vi.fn(),
	},
}));

import { openMSXInstance } from '../../src/openmsx.js';
import { registerTools } from '../../src/server_tools.js';
import type { EmuDirectories } from '../../src/server.js';

interface ToolResponse {
	content: Array<{ type: string; text: string }>;
	structuredContent: Record<string, unknown>;
	isError: boolean;
}

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResponse>;

class ToolRegistry {
	readonly registrations: Array<{ name: string; handler: ToolHandler }> = [];

	registerTool(name: string, _config: unknown, handler: ToolHandler): void {
		this.registrations.push({ name, handler });
	}
}

const mockSendCommand = vi.mocked(openMSXInstance.sendCommand);
const dummyDirs = {} as EmuDirectories;

function findHandler(name: string): ToolHandler {
	const reg = new ToolRegistry();
 registerTools(reg as unknown as McpServer, dummyDirs);
	const entry = reg.registrations.find(r => r.name === name);
	if (!entry) throw new Error(`Tool "${name}" not registered`);
	return entry.handler;
}

beforeEach(() => {
	vi.clearAllMocks();
});

const BP_DELETEALL_TCL = 'foreach {bpname body} [debug breakpoint list] { debug breakpoint remove $bpname }';
const WP_DELETEALL_TCL = 'foreach {wpname body} [debug watchpoint list] { debug watchpoint remove $wpname }';

describe('debug_breakpoints deleteAll', () => {
	it('sends the correct Tcl one-liner and reports success on empty list', async () => {
		mockSendCommand.mockResolvedValue('');
		const handler = findHandler('debug_breakpoints');

		const response = await handler({ command: 'deleteAll' });

		expect(mockSendCommand).toHaveBeenCalledWith(BP_DELETEALL_TCL);
		expect(response.isError).toBe(false);
		expect(response.structuredContent).toEqual({
			command: 'deleteAll',
			result: 'All breakpoints removed.',
		});
	});

	it('sends the same Tcl one-liner and reports success with multiple breakpoints', async () => {
		const listResponse = [
			'bp#1 {-address 0x4000 -condition {} -command {debug break} -enabled 1 -once 0}',
			'bp#2 {-address 0x4af3 -condition {[reg A] == 0} -command {debug break} -enabled 1 -once 0}',
			'bp#3 {-address 0x8000 -condition {} -command {debug break} -enabled 1 -once 1}',
		].join('\n');
		mockSendCommand.mockResolvedValue(listResponse);
		const handler = findHandler('debug_breakpoints');

		const response = await handler({ command: 'deleteAll' });

		expect(mockSendCommand).toHaveBeenCalledWith(BP_DELETEALL_TCL);
		expect(response.isError).toBe(false);
		expect(response.structuredContent).toEqual({
			command: 'deleteAll',
			result: 'All breakpoints removed.',
		});
	});
});

describe('debug_watchpoints deleteAll', () => {
	it('sends the correct Tcl one-liner and reports success on empty list', async () => {
		mockSendCommand.mockResolvedValue('');
		const handler = findHandler('debug_watchpoints');

		const response = await handler({ command: 'deleteAll' });

		expect(mockSendCommand).toHaveBeenCalledWith(WP_DELETEALL_TCL);
		expect(response.isError).toBe(false);
		expect(response.structuredContent).toEqual({
			command: 'deleteAll',
			result: 'All watchpoints removed.',
		});
	});

	it('sends the same Tcl one-liner and reports success with multiple watchpoints', async () => {
		const listResponse = [
			'wp#1 {-type write_mem -address {1 4567} -condition {} -command {} -enabled 1 -once 0}',
			'wp#2 {-type read_io -address {40 41} -condition {} -command {} -enabled 1 -once 0}',
		].join('\n');
		mockSendCommand.mockResolvedValue(listResponse);
		const handler = findHandler('debug_watchpoints');

		const response = await handler({ command: 'deleteAll' });

		expect(mockSendCommand).toHaveBeenCalledWith(WP_DELETEALL_TCL);
		expect(response.isError).toBe(false);
		expect(response.structuredContent).toEqual({
			command: 'deleteAll',
			result: 'All watchpoints removed.',
		});
	});
});

describe('debug_breakpoints commands', () => {
	it('creates a breakpoint with optional condition, command, and once flag', async () => {
		mockSendCommand.mockResolvedValue('bp#7\n');
		const response = await findHandler('debug_breakpoints')({
			command: 'create',
			address: '0x4000',
			condition: '[reg A] == 0x42',
			cmd: 'debug break',
			once: true,
		});

		expect(mockSendCommand).toHaveBeenCalledWith(
			'debug breakpoint create -address 0x4000 -condition {[reg A] == 0x42} -command {debug break} -once 1',
		);
		expect(response.structuredContent).toEqual({
			command: 'create',
			createdName: 'bp#7',
			createdAddress: '0x4000',
		});
		expect(response.isError).toBe(false);
	});

	it('creates an unconditional breakpoint without optional flags', async () => {
		mockSendCommand.mockResolvedValue('bp#1');
		const response = await findHandler('debug_breakpoints')({ command: 'create', address: '0x8000' });

		expect(mockSendCommand).toHaveBeenCalledWith('debug breakpoint create -address 0x8000');
		expect(response.structuredContent).toEqual({
			command: 'create',
			createdName: 'bp#1',
			createdAddress: '0x8000',
		});
	});

	it('rejects creation without an address', async () => {
		const response = await findHandler('debug_breakpoints')({ command: 'create' });

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: 'address' is required for create." }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('removes a named breakpoint', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await findHandler('debug_breakpoints')({ command: 'remove', bpname: 'bp#1' });

		expect(mockSendCommand).toHaveBeenCalledWith('debug breakpoint remove bp#1');
		expect(response.structuredContent).toEqual({
			command: 'remove',
			removedName: 'bp#1',
			result: 'Ok',
		});
	});

	it('parses the breakpoint list into structured content', async () => {
		const listResponse = 'bp#1 {-address 0x4000 -condition {[reg A] == 0x42} -command {debug break} -enabled 1 -once 0}';
		mockSendCommand.mockResolvedValue(listResponse);
		const response = await findHandler('debug_breakpoints')({ command: 'list' });

		expect(mockSendCommand).toHaveBeenCalledWith('debug breakpoint list');
		expect(response.structuredContent).toEqual({
			command: 'list',
			breakpoints: [{
				name: 'bp#1',
				address: '0x4000',
				condition: '[reg A] == 0x42',
				command: 'debug break',
				enabled: true,
				once: false,
			}],
		});
	});

	it('returns breakpoint command errors', async () => {
		mockSendCommand.mockResolvedValue('Error: invalid breakpoint');
		const response = await findHandler('debug_breakpoints')({ command: 'list' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: invalid breakpoint' }],
			isError: true,
		});
	});

	it('rejects unknown breakpoint commands', async () => {
		const response = await findHandler('debug_breakpoints')({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown breakpoint command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('debug_watchpoints commands', () => {
	it('creates a memory watchpoint with optional properties', async () => {
		mockSendCommand.mockResolvedValue('wp#7\n');
		const response = await findHandler('debug_watchpoints')({
			command: 'create',
			type: 'write_mem',
			begin: '0x4000',
			end: '0x4FFF',
			condition: '[reg A] < 128',
			cmd: 'debug break',
			once: true,
		});

		expect(mockSendCommand).toHaveBeenCalledWith(
			'debug set_watchpoint -once write_mem {0x4000 0x4FFF} {[reg A] < 128} {debug break}',
		);
		expect(response.structuredContent).toEqual({
			command: 'create',
			createdName: 'wp#7',
			createdBegin: '0x4000',
			createdEnd: '0x4FFF',
			createdType: 'write_mem',
		});
	});

	it('creates an I/O watchpoint with the two-digit port format', async () => {
		mockSendCommand.mockResolvedValue('wp#3');
		const response = await findHandler('debug_watchpoints')({
			command: 'create',
			type: 'read_io',
			begin: '0x98',
			end: '0x9A',
		});

		expect(mockSendCommand).toHaveBeenCalledWith('debug set_watchpoint read_io {0x98 0x9A}');
		expect(response.structuredContent).toEqual({
			command: 'create',
			createdName: 'wp#3',
			createdBegin: '0x98',
			createdEnd: '0x9A',
			createdType: 'read_io',
		});
	});

	it('rejects creation without all required fields', async () => {
		const response = await findHandler('debug_watchpoints')({
			command: 'create',
			type: 'read_mem',
			begin: '0x4000',
		});

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: 'type', 'begin', and 'end' are required for create." }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('validates memory address width', async () => {
		const response = await findHandler('debug_watchpoints')({
			command: 'create', type: 'read_mem', begin: '0x400', end: '0x4FFF',
		});

		expect(response.isError).toBe(true);
		expect(response.content[0].text).toContain("'begin' must be a 4-digit hex address");
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('validates I/O port width', async () => {
		const response = await findHandler('debug_watchpoints')({
			command: 'create', type: 'read_io', begin: '0x98', end: '0x0100',
		});

		expect(response.isError).toBe(true);
		expect(response.content[0].text).toContain("'end' must be a 4-digit hex address for memory or 2-digit hex port for I/O");
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('rejects a range whose begin is greater than its end', async () => {
		const response = await findHandler('debug_watchpoints')({
			command: 'create', type: 'write_mem', begin: '0x5000', end: '0x4FFF',
		});

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: 'begin' (0x5000) must be <= 'end' (0x4FFF)." }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('removes a named watchpoint', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await findHandler('debug_watchpoints')({ command: 'remove', wpname: 'wp#1' });

		expect(mockSendCommand).toHaveBeenCalledWith('debug watchpoint remove wp#1');
		expect(response.structuredContent).toEqual({
			command: 'remove',
			removedName: 'wp#1',
			result: 'Ok',
		});
	});

	it('parses the watchpoint list into structured content', async () => {
		const listResponse = 'wp#1 {-type write_mem -address {0x4000 0x4FFF} -condition {[reg A] < 128} -command {debug break} -enabled 1 -once 0}';
		mockSendCommand.mockResolvedValue(listResponse);
		const response = await findHandler('debug_watchpoints')({ command: 'list' });

		expect(mockSendCommand).toHaveBeenCalledWith('debug watchpoint list');
		expect(response.structuredContent).toEqual({
			command: 'list',
			watchpoints: [{
				name: 'wp#1',
				type: 'write_mem',
				address: '0x4000 0x4FFF',
				condition: '[reg A] < 128',
				command: 'debug break',
				enabled: true,
				once: false,
			}],
		});
	});

	it('returns watchpoint command errors', async () => {
		mockSendCommand.mockResolvedValue('Error: invalid watchpoint');
		const response = await findHandler('debug_watchpoints')({ command: 'list' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: invalid watchpoint' }],
			isError: true,
		});
	});

	it('rejects unknown watchpoint commands', async () => {
		const response = await findHandler('debug_watchpoints')({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown watchpoint command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});
