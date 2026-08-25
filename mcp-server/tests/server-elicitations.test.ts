import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { EmuDirectories } from '../src/server.js';

vi.mock('../src/openmsx.js', () => ({
	openMSXInstance: {
		getMachineList: vi.fn(),
		getExtensionList: vi.fn(),
	},
}));

vi.mock('../src/server_sampling.js', () => ({
	samplingFindMatches: vi.fn(),
}));

import { openMSXInstance } from '../src/openmsx.js';
import { samplingFindMatches } from '../src/server_sampling.js';
import { resolveLaunchParams } from '../src/server_elicitations.js';

const mockGetMachineList = vi.mocked(openMSXInstance.getMachineList);
const mockGetExtensionList = vi.mocked(openMSXInstance.getExtensionList);
const mockSamplingFindMatches = vi.mocked(samplingFindMatches);
const mockElicitInput = vi.fn();

const directories = {
	MACHINES_DIR: '/share/machines',
	EXTENSIONS_DIR: '/share/extensions',
} as EmuDirectories;

const machines = [
	{ name: 'C-BIOS_MSX2', description: 'MSX2 machine' },
	{ name: 'Philips_NMS_8250', description: 'European MSX2 machine' },
];

const extensions = [
	{ name: 'video9000', description: 'Video extension' },
	{ name: 'msx_music', description: 'Music extension' },
];

function createServer(): McpServer {
	return { server: { elicitInput: mockElicitInput } } as unknown as McpServer;
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('resolveLaunchParams', () => {
	it('canonicalizes an exact machine match without elicitation', async () => {
		mockGetMachineList.mockResolvedValue(JSON.stringify(machines));

		const result = await resolveLaunchParams(createServer(), directories, 'philips_nms_8250');

		expect(result).toEqual({ machine: 'Philips_NMS_8250', extensions: [] });
		expect(mockGetMachineList).toHaveBeenCalledWith(directories.MACHINES_DIR);
		expect(mockElicitInput).not.toHaveBeenCalled();
		expect(mockSamplingFindMatches).not.toHaveBeenCalled();
	});

	it('uses elicitation when no machine is supplied', async () => {
		mockElicitInput.mockResolvedValue({
			action: 'accept',
			content: { machine: 'C-BIOS_MSX2' },
		});

		const result = await resolveLaunchParams(createServer(), directories);

		expect(result).toEqual({ machine: 'C-BIOS_MSX2', extensions: [] });
		expect(mockGetMachineList).not.toHaveBeenCalled();
		expect(mockElicitInput).toHaveBeenCalledWith(expect.objectContaining({
			message: 'No machine specified. Please select the MSX machine to emulate:',
		}));
	});

	it('reports cancellation when machine elicitation is not accepted', async () => {
		mockElicitInput.mockResolvedValue({ action: 'cancel' });

		const result = await resolveLaunchParams(createServer(), directories);

		expect(result).toEqual({ machine: '', extensions: [], cancelled: true });
	});

	it('falls back to the openMSX default when elicitation is unavailable', async () => {
		mockElicitInput.mockRejectedValue(new Error('elicitation unsupported'));

		const result = await resolveLaunchParams(createServer(), directories);

		expect(result).toEqual({ machine: '', extensions: [] });
	});

	it('canonicalizes exact extension matches', async () => {
		mockGetMachineList.mockResolvedValue(JSON.stringify(machines));
		mockGetExtensionList.mockResolvedValue(JSON.stringify(extensions));

		const result = await resolveLaunchParams(
			createServer(), directories, 'c-bios_msx2', ['VIDEO9000'],
		);

		expect(result).toEqual({ machine: 'C-BIOS_MSX2', extensions: ['video9000'] });
		expect(mockGetExtensionList).toHaveBeenCalledWith(directories.EXTENSIONS_DIR);
		expect(mockSamplingFindMatches).not.toHaveBeenCalled();
	});

	it('uses sampling and elicitation for an ambiguous machine', async () => {
		mockGetMachineList.mockResolvedValue(JSON.stringify(machines));
		mockSamplingFindMatches.mockResolvedValue([
			{ const: 'Philips_NMS_8250', title: 'Philips_NMS_8250: European MSX2 machine' },
		]);
		mockElicitInput.mockResolvedValue({
			action: 'accept',
			content: { machine: 'Philips_NMS_8250' },
		});
		const server = createServer();

		const result = await resolveLaunchParams(server, directories, 'nms 8250');

		expect(mockSamplingFindMatches).toHaveBeenCalledWith(server, 'nms 8250', machines, 'machine');
		expect(result).toEqual({ machine: 'Philips_NMS_8250', extensions: [] });
	});

	it('returns the original machine when sampling finds no match', async () => {
		mockGetMachineList.mockResolvedValue(JSON.stringify(machines));
		mockSamplingFindMatches.mockResolvedValue([]);

		const result = await resolveLaunchParams(createServer(), directories, 'unknown machine');

		expect(result).toEqual({ machine: 'unknown machine', extensions: [] });
		expect(mockElicitInput).not.toHaveBeenCalled();
	});

	it('combines exact and sampled extension matches', async () => {
		mockGetMachineList.mockResolvedValue(JSON.stringify(machines));
		mockGetExtensionList.mockResolvedValue(JSON.stringify(extensions));
		mockSamplingFindMatches.mockResolvedValue([
			{ const: 'msx_music', title: 'msx_music: Music extension' },
		]);
		mockElicitInput.mockResolvedValue({
			action: 'accept',
			content: { extensions: ['msx_music'] },
		});
		const server = createServer();

		const result = await resolveLaunchParams(
			server, directories, 'C-BIOS_MSX2', ['VIDEO9000', 'music'],
		);

		expect(mockSamplingFindMatches).toHaveBeenCalledWith(
			server,
			'music',
			extensions,
			'extension',
			6,
		);
		expect(result).toEqual({ machine: 'C-BIOS_MSX2', extensions: ['video9000', 'msx_music'] });
	});

	it('cancels when ambiguous extensions are not accepted', async () => {
		mockGetMachineList.mockResolvedValue(JSON.stringify(machines));
		mockGetExtensionList.mockResolvedValue(JSON.stringify(extensions));
		mockSamplingFindMatches.mockResolvedValue([
			{ const: 'msx_music', title: 'msx_music: Music extension' },
		]);
		mockElicitInput.mockResolvedValue({ action: 'cancel' });

		const result = await resolveLaunchParams(
			createServer(), directories, 'C-BIOS_MSX2', ['music'],
		);

		expect(result).toEqual({ machine: 'C-BIOS_MSX2', extensions: [], cancelled: true });
	});

	it('keeps original extensions when extension matching fails', async () => {
		mockGetMachineList.mockResolvedValue(JSON.stringify(machines));
		mockGetExtensionList.mockResolvedValue(JSON.stringify(extensions));
		mockSamplingFindMatches.mockRejectedValue(new Error('sampling unavailable'));

		const result = await resolveLaunchParams(
			createServer(), directories, 'C-BIOS_MSX2', ['music'],
		);

		expect(result).toEqual({ machine: 'C-BIOS_MSX2', extensions: ['music'] });
	});

	it('propagates machine-list errors before launch resolution', async () => {
		mockGetMachineList.mockResolvedValue('Error: machine list unavailable');

		await expect(resolveLaunchParams(createServer(), directories, 'C-BIOS_MSX2'))
			.rejects.toThrow('Error: machine list unavailable');
	});
});