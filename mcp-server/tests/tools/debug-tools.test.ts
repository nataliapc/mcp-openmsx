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
const dummyDirs = {} as EmuDirectories;

async function findHandler(name: string): Promise<ToolHandler> {
	const registry = new ToolRegistry();
	await registerTools(registry as unknown as McpServer, dummyDirs);
	const entry = registry.registrations.find(registration => registration.name === name);
	if (!entry) throw new Error(`Tool "${name}" not registered`);
	return entry.handler;
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('debug_run', () => {
	it.each([
		['break', 'debug break'],
		['isBreaked', 'debug breaked'],
		['continue', 'debug cont'],
		['stepIn', 'step_in'],
		['stepOver', 'step_over'],
		['stepOut', 'step_out'],
		['stepBack', 'step_back'],
		['runTo', 'run_to 0x4000'],
	] as const)('routes %s to openMSX', async (command, expectedCommand) => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler('debug_run'))({
			command,
			...(command === 'runTo' ? { address: '0x4000' } : {}),
		});

		expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
		expect(response).toEqual({
			content: [{ type: 'text', text: 'Ok' }],
			isError: false,
		});
	});

	it('returns openMSX errors', async () => {
		mockSendCommand.mockResolvedValue('Error: CPU is not running');
		const response = await (await findHandler('debug_run'))({ command: 'continue' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: CPU is not running' }],
			isError: true,
		});
	});

	it('rejects unknown commands', async () => {
		const response = await (await findHandler('debug_run'))({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown debug command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('debug_cpu', () => {
	it('parses the CPU register dump', async () => {
		mockSendCommand.mockResolvedValue('AF =0044  PC =632F\nI  =00');
		const response = await (await findHandler('debug_cpu'))({ command: 'getCpuRegisters' });

		expect(mockSendCommand).toHaveBeenCalledWith('cpuregs');
		expect(response.structuredContent).toEqual({
			command: 'getCpuRegisters',
			registers: { AF: '0044', PC: '632F', I: '00' },
		});
	});

	it.each([
		['a', '255', '0xFF'],
		['pc', '4660', '0x1234'],
	] as const)('formats %s using its register width', async (register, rawValue, hexValue) => {
		mockSendCommand.mockResolvedValue(rawValue);
		const response = await (await findHandler('debug_cpu'))({ command: 'getRegister', register });

		expect(mockSendCommand).toHaveBeenCalledWith(`reg ${register}`);
		expect(response.structuredContent).toEqual({
			command: 'getRegister',
			register,
			decimalValue: Number(rawValue),
			hexValue,
		});
	});

	it('writes a register and reports an empty response as success', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler('debug_cpu'))({
			command: 'setRegister',
			register: 'hl',
			value: '0x1234',
		});

		expect(mockSendCommand).toHaveBeenCalledWith('reg hl 0x1234');
		expect(response).toEqual({
			content: [{ type: 'text', text: 'Ok' }],
			structuredContent: { command: 'setRegister', register: 'hl', newValue: '0x1234', result: 'Ok' },
			isError: false,
		});
	});

	it('returns the stack response', async () => {
		mockSendCommand.mockResolvedValue('4000: 1234');
		const response = await (await findHandler('debug_cpu'))({ command: 'getStackPile' });

		expect(mockSendCommand).toHaveBeenCalledWith('stack');
		expect(response.structuredContent).toEqual({ command: 'getStackPile', stack: '4000: 1234' });
	});

	it('passes address and size to disassemble', async () => {
		mockSendCommand.mockResolvedValue('4000: LD A,B');
		const response = await (await findHandler('debug_cpu'))({
			command: 'disassemble',
			address: '0x4000',
			size: 16,
		});

		expect(mockSendCommand).toHaveBeenCalledWith('disasm 0x4000 16');
		expect(response.structuredContent).toEqual({
			command: 'disassemble',
			disassembly: '4000: LD A,B',
		});
	});

	it('trims the active CPU response', async () => {
		mockSendCommand.mockResolvedValue(' r800 \n');
		const response = await (await findHandler('debug_cpu'))({ command: 'getActiveCpu' });

		expect(mockSendCommand).toHaveBeenCalledWith('get_active_cpu');
		expect(response.structuredContent).toEqual({ command: 'getActiveCpu', activeCpu: 'r800' });
	});

	it('returns CPU command errors without structured content', async () => {
		mockSendCommand.mockResolvedValue('Error: invalid register');
		const response = await (await findHandler('debug_cpu'))({ command: 'getRegister', register: 'a' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: invalid register' }],
			isError: true,
		});
	});

	it('rejects unknown CPU commands', async () => {
		const response = await (await findHandler('debug_cpu'))({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('debug_memory', () => {
	it.each([
		['selectedSlots', { command: 'selectedSlots' }, 'slotselect'],
		['getBlock', { command: 'getBlock', address: '0x4000', lines: 2 }, 'showmem 0x4000 2'],
		['readByte', { command: 'readByte', address: '0x4000' }, 'peek 0x4000'],
		['readWord', { command: 'readWord', address: '0x4000' }, 'peek16 0x4000'],
		['writeByte', { command: 'writeByte', address: '0x4000', value8: '0xA5' }, 'poke 0x4000 0xA5'],
		['writeWord', { command: 'writeWord', address: '0x4000', value16: '0xA5B1' }, 'poke16 0x4000 0xA5B1'],
	] as const)('routes %s to openMSX', async (_name, args, expectedCommand) => {
		mockSendCommand.mockResolvedValue('0');
		const response = await (await findHandler('debug_memory'))(args);

		expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
		expect(response.isError).toBe(false);
	});

	it('formats byte and word reads', async () => {
		mockSendCommand.mockResolvedValueOnce('10').mockResolvedValueOnce('4660');
		const handler = await findHandler('debug_memory');

		const byteResponse = await handler({ command: 'readByte', address: '0x4000' });
		const wordResponse = await handler({ command: 'readWord', address: '0x4000' });

		expect(byteResponse.structuredContent).toEqual({
			command: 'readByte', address: '0x4000', decimalValue: 10, hexValue: '0x0A',
		});
		expect(wordResponse.structuredContent).toEqual({
			command: 'readWord', address: '0x4000', decimalValue: 4660, hexValue: '0x1234',
		});
	});

	it('writes a block and reports the number of bytes', async () => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler('debug_memory'))({
			command: 'writeBlock',
			address: '0x4000',
			values: '0x01 0xFF 0x00',
		});

		expect(mockSendCommand).toHaveBeenCalledWith(
			'set addr 0x4000; foreach v { 0x01 0xFF 0x00 } { poke $addr $v; incr addr }',
		);
		expect(response.structuredContent).toEqual({
			command: 'writeBlock', address: '0x4000', bytesWritten: 3, result: 'Ok',
		});
	});

	it.each([
		{},
		{ address: '0x4000' },
		{ values: '0x01' },
	] as const)('rejects writeBlock without both required values: %j', async args => {
		const response = await (await findHandler('debug_memory'))({ command: 'writeBlock', ...args });

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: 'writeBlock' requires both 'address' and 'values'." }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it.each([
		['0x1000', 32, 32],
		['0xFFF0', 32, 16],
	] as const)('keeps search length within RAM: %s', async (address, requestedLength, expectedLength) => {
		mockSendCommand.mockResolvedValue('No matches found');
		const response = await (await findHandler('debug_memory'))({
			command: 'searchBytes', address, length: requestedLength, values: '0xAA 0xBB',
		});

		const searchCommand = mockSendCommand.mock.calls[0][0];
		expect(searchCommand).toContain(`set pattern { 0xAA 0xBB }`);
		expect(searchCommand).toContain(`${address} + ${expectedLength} - $len`);
		expect(response.structuredContent).toEqual({
			command: 'searchBytes', address, length: expectedLength, values: '0xAA 0xBB', result: 'No matches found',
		});
	});

	it('returns memory command errors', async () => {
		mockSendCommand.mockResolvedValue('Error: memory unavailable');
		const response = await (await findHandler('debug_memory'))({ command: 'readByte', address: '0x4000' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: memory unavailable' }],
			isError: true,
		});
	});

	it('rejects unknown memory commands', async () => {
		const response = await (await findHandler('debug_memory'))({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown memory command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});

describe('debug_vram', () => {
	it.each([
		['getBlock', { command: 'getBlock', address: '0x04000', lines: 2 }, 'showdebuggable VRAM 0x04000 2'],
		['readByte', { command: 'readByte', address: '0x04000' }, 'vpeek 0x04000'],
		['writeByte', { command: 'writeByte', address: '0x04000', value8: '0xA5' }, 'vpoke 0x04000 0xA5'],
	] as const)('routes %s to openMSX', async (_name, args, expectedCommand) => {
		mockSendCommand.mockResolvedValue('0');
		const response = await (await findHandler('debug_vram'))(args);

		expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
		expect(response.isError).toBe(false);
	});

	it('formats a VRAM byte read', async () => {
		mockSendCommand.mockResolvedValue('10');
		const response = await (await findHandler('debug_vram'))({ command: 'readByte', address: '0x04000' });

		expect(response.structuredContent).toEqual({
			command: 'readByte', address: '0x04000', decimalValue: 10, hexValue: '0x0A',
		});
	});

	it('keeps VRAM searches within the address space', async () => {
		mockSendCommand.mockResolvedValue('No matches found');
		const response = await (await findHandler('debug_vram'))({
			command: 'searchBytes', address: '0x1FFF0', length: 32, values: '0xAA 0xBB',
		});

		const searchCommand = mockSendCommand.mock.calls[0][0];
		expect(searchCommand).toContain('set pattern { 0xAA 0xBB }');
		expect(searchCommand).toContain('0x1FFF0 + 16 - $len');
		expect(response.structuredContent).toEqual({
			command: 'searchBytes', address: '0x1FFF0', length: 16, values: '0xAA 0xBB', result: 'No matches found',
		});
	});

	it('returns VRAM command errors', async () => {
		mockSendCommand.mockResolvedValue('Error: VRAM unavailable');
		const response = await (await findHandler('debug_vram'))({ command: 'readByte', address: '0x04000' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: VRAM unavailable' }],
			isError: true,
		});
	});

	it('rejects unknown VRAM commands', async () => {
		const response = await (await findHandler('debug_vram'))({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown video memory command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});
});