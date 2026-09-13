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

async function findHandler(): Promise<ToolHandler> {
	const registry = new ToolRegistry();
	await registerTools(registry as unknown as McpServer, dummyDirs);
	const entry = registry.registrations.find(registration => registration.name === 'emu_media');
	if (!entry) throw new Error('Tool "emu_media" not registered');
	return entry.handler;
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('emu_media command routing', () => {
	it.each([
		['tapeInsert', { tapefile: '/tmp/game.cas' }, 'cassetteplayer insert "/tmp/game.cas"'],
		['tapeRewind', {}, 'cassetteplayer rewind'],
		['tapeEject', {}, 'cassetteplayer eject'],
		['romInsert', { romfile: '/tmp/game.rom' }, 'carta insert "/tmp/game.rom"'],
		['romInsert', { romfile: '/tmp/game.rom', ips: ['/tmp/game.ips'] }, 'carta insert "/tmp/game.rom" -ips "/tmp/game.ips"'],
		['romInsert', { romfile: '/tmp/game.rom', ips: ['/tmp/patch1.ips', '/tmp/patch2.ips'] }, 'carta insert "/tmp/game.rom" -ips "/tmp/patch1.ips" -ips "/tmp/patch2.ips"'],
		['romEject', {}, 'carta eject'],
		['diskInsert', { diskfile: '/tmp/game.dsk' }, 'diska insert "/tmp/game.dsk"'],
		['diskInsert', { diskfile: '/tmp/game.dsk', ips: ['/tmp/game.ips'] }, 'diska insert "/tmp/game.dsk" -ips "/tmp/game.ips"'],
		['diskInsert', { diskfile: '/tmp/game.dsk', ips: ['/tmp/patch1.ips', '/tmp/patch2.ips'] }, 'diska insert "/tmp/game.dsk" -ips "/tmp/patch1.ips" -ips "/tmp/patch2.ips"'],
		['diskInsertFolder', { diskfolder: '/tmp/disk' }, 'diska insert "/tmp/disk"'],
		['diskEject', {}, 'diska eject'],
		['romInfo', {}, 'machine_info media carta'],
		['diskInfo', {}, 'machine_info media diska'],
	] as const)('sends the Tcl command for %s', async (command, args, expectedCommand) => {
		mockSendCommand.mockResolvedValue('');
		const response = await (await findHandler())({ command, ...args });

		expect(mockSendCommand).toHaveBeenCalledWith(expectedCommand);
		expect(response.content).toEqual([{ type: 'text', text: 'Ok' }]);
		expect(response.isError).toBe(false);
	});

	it('returns an openMSX error response', async () => {
		mockSendCommand.mockResolvedValue('Error: media not found');
		const response = await (await findHandler())({ command: 'romEject' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: media not found' }],
			isError: true,
		});
	});

	it('rejects an unknown media command', async () => {
		const response = await (await findHandler())({ command: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: Unknown emulator media command "unknown".' }],
			isError: true,
		});
		expect(mockSendCommand).not.toHaveBeenCalled();
	});

	it('romInfo returns the ROM cartridge info from openMSX', async () => {
		const romInfoDict =
			'type rom target /tmp/game.rom patches {/tmp/game.ips} mappertype Konami actualSHA1 22b3191d865010264001b9d896186a9818478a6b originalSHA1 11a1111d865010264001b9d896186a9818478a6b';
		mockSendCommand.mockResolvedValue(romInfoDict);
		const response = await (await findHandler())({ command: 'romInfo' });

		expect(mockSendCommand).toHaveBeenCalledWith('machine_info media carta');
		expect(response).toEqual({
			content: [{ type: 'text', text: romInfoDict }],
			isError: false,
		});
	});

	it('diskInfo returns the disk info from openMSX', async () => {
		const diskInfoDict = 'type file target /tmp/game.dsk readonly false doublesided true size 737280 patches {}';
		mockSendCommand.mockResolvedValue(diskInfoDict);
		const response = await (await findHandler())({ command: 'diskInfo' });

		expect(mockSendCommand).toHaveBeenCalledWith('machine_info media diska');
		expect(response).toEqual({
			content: [{ type: 'text', text: diskInfoDict }],
			isError: false,
		});
	});

	it('romInfo returns an error when no cartridge is inserted', async () => {
		mockSendCommand.mockResolvedValue('Error: no cartridge in slot');
		const response = await (await findHandler())({ command: 'romInfo' });

		expect(response).toEqual({
			content: [{ type: 'text', text: 'Error: no cartridge in slot' }],
			isError: true,
		});
	});
});