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
			'bp#1 0x4000 {} {}',
			'bp#2 0x4af3 {[reg A] == 0} {}',
			'bp#3 0x8000 {} {}',
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
