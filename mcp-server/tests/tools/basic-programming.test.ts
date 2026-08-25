import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/openmsx.js', () => ({
	openMSXInstance: {
		sendCommand: vi.fn(),
		emu_isInBasic: vi.fn(),
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
const mockIsBasic = vi.mocked(openMSXInstance.emu_isInBasic);
const dummyDirs = {} as EmuDirectories;

async function findHandler(): Promise<ToolHandler> {
	const registry = new ToolRegistry();
	await registerTools(registry as unknown as McpServer, dummyDirs);
	const entry = registry.registrations.find(registration => registration.name === 'basic_programming');
	if (!entry) throw new Error('Tool "basic_programming" not registered');
	return entry.handler;
}

beforeEach(() => {
	vi.clearAllMocks();
	mockIsBasic.mockResolvedValue(true);
});

describe('basic_programming availability and guards', () => {
	it.each([true, false])('reports whether BASIC is available: %s', async available => {
		mockIsBasic.mockResolvedValue(available);
		const response = await (await findHandler())({ command: 'isBasicAvailable' });

		expect(response).toEqual({
			content: [{ type: 'text', text: String(available) }],
			structuredContent: { command: 'isBasicAvailable', available },
			isError: false,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('rejects BASIC commands when the machine is not in BASIC mode', async () => {
		mockIsBasic.mockResolvedValue(false);
		const response = await (await findHandler())({ command: 'runProgram' });

		expect(response.isError).toBe(true);
		expect(response.content[0].text).toBe('Error: The current MSX machine is not in BASIC mode.');
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('reports missing program input', async () => {
		const response = await (await findHandler())({ command: 'setProgram' });

		expect(response.isError).toBe(true);
		expect(response.content[0].text).toBe('Error: no BASIC program provided to set.');
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('basic_programming keyboard commands', () => {
	it.each([
		['newProgram', 'new\r', 'after#123', 'Ok'],
		['runProgram', 'run\r', 'typed', 'typed'],
	] as const)('sends %s through the key matrix', async (command, text, rawResponse, result) => {
		mockSendCommand.mockResolvedValue(rawResponse);
		const response = await (await findHandler())({ command });

		expect(mockSendCommand).toHaveBeenCalledWith(
			`keymatrixdown 6 2 ; keymatrixdown 4 2 ; after time 0.1 { keymatrixup 6 2 ; keymatrixup 4 2 ; type_via_keybuf "${text.replace('\r', '\\r')}" }`,
		);
		expect(response.structuredContent).toEqual({ command, result });
		expect(response.isError).toBe(false);
	});

	it('deletes one line or a range through the key matrix', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler())({
			command: 'deleteProgramLines',
			startLine: 100,
			endLine: 120,
		});

		expect(mockSendCommand).toHaveBeenCalledWith(
			'keymatrixdown 6 2 ; keymatrixdown 4 2 ; after time 0.1 { keymatrixup 6 2 ; keymatrixup 4 2 ; type_via_keybuf "delete 100-120\\r" }',
		);
		expect(response.structuredContent).toEqual({ command: 'deleteProgramLines', result: 'Ok' });
	});

	it('rejects deleteProgramLines without a start line', async () => {
		const response = await (await findHandler())({ command: 'deleteProgramLines' });

		expect(response.isError).toBe(true);
		expect(response.content[0].text).toBe('Error: No startLine number provided to delete BASIC program lines.');
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('lists a selected line range', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler())({ command: 'listProgramLines', startLine: 10, endLine: 20 });

		expect(mockSendCommand).toHaveBeenCalledWith('type_via_keybuf "list 10-20\\r"');
		expect(response.structuredContent).toEqual({ command: 'listProgramLines', result: 'Ok' });
	});

	it('rejects listProgramLines without a start line', async () => {
		const response = await (await findHandler())({ command: 'listProgramLines' });

		expect(response.isError).toBe(true);
		expect(response.content[0].text).toBe('Error: No start line provided to list BASIC program lines.');
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('basic_programming program transfer', () => {
	it('normalizes and escapes a program before sending it at high speed', async () => {
		mockSendCommand.mockResolvedValueOnce('150').mockResolvedValueOnce('');
		const response = await (await findHandler())({
			command: 'setProgram',
			program: '10 PRINT "HI"\n\n20 PRINT $(A[0])',
		});

		expect(mockSendCommand).toHaveBeenNthCalledWith(1, 'set speed');
		const typingCommand = mockSendCommand.mock.calls[1][0];
		expect(typingCommand).toContain('set speed 10000 ; type_via_keybuf');
		expect(typingCommand).toContain('10 PRINT \\"HI\\"\\r20 PRINT \\$(A\\[0\\])\\r');
		expect(typingCommand).toContain('after idle 20 { set speed 150 }');
		expect(response).toEqual({
			content: [{ type: 'text', text: 'Ok' }],
			structuredContent: { command: 'setProgram', result: 'Ok' },
			isError: false,
		});
	});

	it('returns the speed query error without typing', async () => {
		mockSendCommand.mockResolvedValue('Error: speed unavailable');
		const response = await (await findHandler())({ command: 'setProgram', program: '10 PRINT 1' });

		expect(mockSendCommand).toHaveBeenCalledOnce();
		expect(response.isError).toBe(true);
		expect(response.content[0].text).toBe('Error: speed unavailable');
	});

	it('restores the previous speed when typing fails', async () => {
		mockSendCommand
			.mockResolvedValueOnce('200')
			.mockResolvedValueOnce('Error: keyboard unavailable')
			.mockResolvedValueOnce('');
		const response = await (await findHandler())({ command: 'setProgram', program: '10 PRINT 1' });

		expect(mockSendCommand).toHaveBeenNthCalledWith(1, 'set speed');
		expect(mockSendCommand).toHaveBeenNthCalledWith(3, 'set speed 200');
		expect(response.isError).toBe(true);
		expect(response.content[0].text).toBe('Error: keyboard unavailable');
	});
});

describe('basic_programming listing commands', () => {
	it.each([
		['getFullProgram', 'regsub -all -line {^[0-9a-f]x[0-9a-f]{4} > } [ listing ] ""'],
		['getFullProgramAdvanced', 'listing'],
	] as const)('returns the response from %s as program text', async (command, expectedCommand) => {
		mockSendCommand.mockResolvedValue('10 PRINT "HI"');
		const response = await (await findHandler())({ command });

		expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
		expect(response.structuredContent).toEqual({ command, program: '10 PRINT "HI"' });
		expect(response.isError).toBe(false);
	});

	it('propagates an openMSX error from a listing command', async () => {
		mockSendCommand.mockResolvedValue('Error: listing unavailable');
		const response = await (await findHandler())({ command: 'getFullProgram' });

		expect(response.isError).toBe(true);
		expect(response.content[0].text).toBe('Error: listing unavailable');
	});
});