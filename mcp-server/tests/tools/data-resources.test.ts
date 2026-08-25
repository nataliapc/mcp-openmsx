import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/openmsx.js', () => ({
	openMSXInstance: {
		sendCommand: vi.fn(),
		emu_close: vi.fn(),
		emu_launch: vi.fn(),
		getMachineList: vi.fn(),
		getExtensionList: vi.fn(),
		emu_isInBasic: vi.fn(),
	},
}));

vi.mock('../../src/vectordb.js', () => ({
	VectorDB: {
		getInstance: vi.fn(),
	},
}));

vi.mock('../../src/server_resources.js', () => ({
	getRegisteredResourcesList: vi.fn(),
}));

import { VectorDB } from '../../src/vectordb.js';
import { getRegisteredResourcesList } from '../../src/server_resources.js';
import { registerTools } from '../../src/server_tools.js';
import type { RegResource } from '../../src/server_resources.js';
import type { EmuDirectories } from '../../src/server.js';

interface ToolResponse {
	content: Array<{ type: string; text?: string; mimeType?: string }>;
	structuredContent?: Record<string, unknown>;
	isError?: boolean;
}

type ToolHandler = (args: Record<string, unknown>, extra?: unknown) => Promise<ToolResponse>;

class ToolRegistry {
	readonly registrations: Array<{ name: string; handler: ToolHandler }> = [];

	registerTool(name: string, _config: unknown, handler: ToolHandler): void {
		this.registrations.push({ name, handler });
	}
}

const mockGetInstance = vi.mocked(VectorDB.getInstance);
const mockGetRegisteredResourcesList = vi.mocked(getRegisteredResourcesList);
const mockQuery = vi.fn();
const mockReadCallback = vi.fn();
const fakeResource = {
	name: 'msxdocs_test_guide',
	metadata: { mimeType: 'text/markdown' },
	readCallback: mockReadCallback,
};
const registeredResources = [{
	resource: fakeResource,
	uri: 'msxdocs://test/guide',
}] as unknown as RegResource[];
const dummyDirs = {} as EmuDirectories;

beforeEach(() => {
	vi.clearAllMocks();
	mockGetRegisteredResourcesList.mockReturnValue(registeredResources);
	mockReadCallback.mockReset();
});

async function findHandler(name: string): Promise<ToolHandler> {
	const registry = new ToolRegistry();
	await registerTools(registry as unknown as McpServer, dummyDirs);
	const entry = registry.registrations.find(registration => registration.name === name);
	if (!entry) throw new Error(`Tool "${name}" not registered`);
	return entry.handler;
}

describe('vector_db_query — registered handler', () => {
	beforeEach(() => {
		mockGetInstance.mockReturnValue({ query: mockQuery } as never);
	});

	it('forwards the query and returns JSON and structured results', async () => {
		const results = [{
			score: '0.0250',
			title: 'MSX BASIC',
			uri: 'msxdocs://basic',
			document: 'PRINT syntax',
			id: 'basic-1',
		}];
		mockQuery.mockResolvedValue(results);

		const response = await (await findHandler('vector_db_query'))({ query: 'PRINT syntax' });

		expect(mockGetInstance).toHaveBeenCalledOnce();
		expect(mockQuery).toHaveBeenCalledWith('PRINT syntax');
		expect(response).toEqual({
			content: [{ type: 'text', text: JSON.stringify(results) }],
			structuredContent: { results },
			isError: false,
		});
	});

	it('returns an empty result list without changing its shape', async () => {
		mockQuery.mockResolvedValue([]);

		const response = await (await findHandler('vector_db_query'))({ query: 'unknown' });

		expect(response).toEqual({
			content: [{ type: 'text', text: '[]' }],
			structuredContent: { results: [] },
			isError: false,
		});
	});
});

describe('msxdocs_resource_get — registered handler', () => {
	it('reads a named resource and returns its MIME type', async () => {
		const extra = { requestId: 'test-request' };
		mockReadCallback.mockResolvedValue({
			contents: [{ uri: 'msxdocs://test/guide', text: 'Guide content' }],
		});

		const response = await (await findHandler('msxdocs_resource_get'))(
			{ resourceName: 'msxdocs_test_guide' },
			extra,
		);

		expect(mockReadCallback).toHaveBeenCalledWith(new URL('msxdocs://test/guide'), extra);
		expect(response).toEqual({
			content: [
				{ type: 'text', text: "Content from resource: 'msxdocs_test_guide'" },
				{ type: 'text', text: 'Guide content', mimeType: 'text/markdown' },
			],
		});
	});

	it('returns an error when the resource is not registered', async () => {
		const response = await (await findHandler('msxdocs_resource_get'))({
			resourceName: 'msxdocs_missing',
		});

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: Resource 'msxdocs_missing' not found." }],
			isError: true,
		});
		expect(mockReadCallback).not.toHaveBeenCalled();
	});

	it('returns an error when the resource has no content', async () => {
		mockReadCallback.mockResolvedValue({ contents: [] });

		const response = await (await findHandler('msxdocs_resource_get'))({
			resourceName: 'msxdocs_test_guide',
		});

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: Resource 'msxdocs_test_guide' has no content available." }],
			isError: true,
		});
	});

	it('returns an error when the resource content is not text', async () => {
		mockReadCallback.mockResolvedValue({
			contents: [{ uri: 'msxdocs://test/guide', blob: 'binary-data' }],
		});

		const response = await (await findHandler('msxdocs_resource_get'))({
			resourceName: 'msxdocs_test_guide',
		});

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: Resource 'msxdocs_test_guide' has no content available." }],
			isError: true,
		});
	});

	it('wraps resource read errors', async () => {
		mockReadCallback.mockRejectedValue(new Error('disk failure'));

		const response = await (await findHandler('msxdocs_resource_get'))({
			resourceName: 'msxdocs_test_guide',
		});

		expect(response).toEqual({
			content: [{ type: 'text', text: "Error: error reading resource 'msxdocs_test_guide': disk failure" }],
			isError: true,
		});
	});
});