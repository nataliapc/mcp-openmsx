import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { samplingFindMatches } from '../src/server_sampling.js';

const mockCreateMessage = vi.fn();

function createServer(): McpServer {
	return { server: { createMessage: mockCreateMessage } } as unknown as McpServer;
}

const items = [
	{ name: 'C-BIOS_MSX2', description: 'MSX2 machine' },
	{ name: 'Philips_VG_8020', description: 'European MSX1 machine' },
	{ name: 'video9000', description: 'Video extension' },
];

beforeEach(() => {
	vi.clearAllMocks();
});

describe('samplingFindMatches', () => {
	it('builds a constrained sampling request', async () => {
		mockCreateMessage.mockResolvedValue({
			content: { type: 'text', text: 'C-BIOS_MSX2' },
		});

		const matches = await samplingFindMatches(createServer(), 'msx 2', items, 'machine', 3);

		expect(mockCreateMessage).toHaveBeenCalledWith(expect.objectContaining({
			maxTokens: 300,
			temperature: 0,
			systemPrompt: expect.stringContaining('MSX machine'),
			messages: [{
				role: 'user',
				content: {
					type: 'text',
					text: expect.stringContaining('C-BIOS_MSX2: MSX2 machine'),
				},
			}],
		}));
		expect(matches).toHaveLength(1);
		expect(matches[0]).toMatchObject({ const: 'C-BIOS_MSX2' });
	});

	it('maps names case-insensitively, ignores unknown output, and enforces maxResults', async () => {
		mockCreateMessage.mockResolvedValue({
			content: {
				type: 'text',
				text: '\n philips_vg_8020 \n unknown\n C-BIOS_MSX2\n video9000\n',
			},
		});

		const matches = await samplingFindMatches(createServer(), 'msx', items, 'machine', 2);

		expect(matches.map(match => match.const)).toEqual(['Philips_VG_8020', 'C-BIOS_MSX2']);
		expect(matches[0].title).toContain('European MSX1 machine');
	});

	it('returns no matches for non-text sampling content', async () => {
		mockCreateMessage.mockResolvedValue({
			content: { type: 'image', data: 'not-used' },
		});

		await expect(samplingFindMatches(createServer(), 'msx', items, 'machine'))
			.resolves.toEqual([]);
	});

	it('returns no matches when the model names no known item', async () => {
		mockCreateMessage.mockResolvedValue({
			content: { type: 'text', text: 'unknown-item\n' },
		});

		const matches = await samplingFindMatches(createServer(), 'unknown', items, 'machine');

		expect(matches).toEqual([]);
	});
});