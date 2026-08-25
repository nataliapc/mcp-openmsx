import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('fs/promises', () => ({
	default: {
		readFile: vi.fn(),
	},
}));

vi.mock('../src/utils.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../src/utils.js')>();
	return {
		...actual,
		addFileExtension: vi.fn(),
		fetchCleanWebpage: vi.fn(),
		listResourcesDirectory: vi.fn(),
	};
});

import fs from 'fs/promises';
import { basicInstructions, getRegisteredResourcesList, registerResources } from '../src/server_resources.js';
import { addFileExtension, fetchCleanWebpage, listResourcesDirectory } from '../src/utils.js';

interface ResourceContent {
	contents: Array<{ uri: string; text: string; mimeType?: string }>;
}

type ResourceHandler = (uri: URL, variables?: Record<string, unknown>) => Promise<ResourceContent>;

interface ResourceRegistration {
	name: string;
	template: unknown;
	metadata: Record<string, unknown>;
	handler: ResourceHandler;
}

class ResourceRegistry {
	readonly registrations: ResourceRegistration[] = [];

	registerResource(name: string, template: unknown, metadata: unknown, handler: ResourceHandler): unknown {
		this.registrations.push({
			name,
			template,
			metadata: metadata as Record<string, unknown>,
			handler,
		});
		return { name, metadata };
	}
}

const mockReadFile = vi.mocked(fs.readFile);
const mockAddFileExtension = vi.mocked(addFileExtension);
const mockFetchCleanWebpage = vi.mocked(fetchCleanWebpage);
const mockListResourcesDirectory = vi.mocked(listResourcesDirectory);
const resourcesDir = '/resources';

beforeEach(() => {
	vi.clearAllMocks();
	getRegisteredResourcesList().length = 0;
});

async function register(): Promise<ResourceRegistry> {
	const registry = new ResourceRegistry();
	await registerResources(registry as unknown as McpServer, resourcesDir);
	return registry;
}

describe('registerResources', () => {
	it('registers the BASIC resource when no documentation directories exist', async () => {
		mockListResourcesDirectory.mockResolvedValue([]);

		const registry = await register();
		const basic = registry.registrations.find(resource => resource.name === 'msxdocs_basic_wiki');

		expect(registry.registrations).toHaveLength(1);
		expect(basic).toBeDefined();
		const complete = (basic!.template as ResourceTemplate).completeCallback('instruction');
		expect(complete?.('PRI')).toEqual(basicInstructions);
	});

	it('skips sections with missing or invalid TOC files', async () => {
		mockListResourcesDirectory.mockResolvedValue(['invalid', 'missing']);
		mockReadFile.mockRejectedValue(new Error('ENOENT'));

		const registry = await register();

		expect(registry.registrations.map(resource => resource.name)).toEqual(['msxdocs_basic_wiki']);
		expect(mockReadFile).toHaveBeenCalledTimes(2);
	});

	it('registers a local resource with default metadata and reads its callback', async () => {
		mockListResourcesDirectory.mockResolvedValue(['guide']);
		mockReadFile
			.mockResolvedValueOnce(JSON.stringify({
				toc: [{ uri: 'msxdocs://guide/topic', title: 'Topic: Intro' }],
			}))
			.mockResolvedValueOnce('Guide text');
		mockAddFileExtension.mockResolvedValue(['text/markdown', '/resources/guide/topic.md']);

		const registry = await register();
		const resource = registry.registrations.find(item => item.name === 'msxdocs_guide_topic_intro');
		if (!resource) throw new Error('Local resource was not registered');

		expect(resource.metadata).toMatchObject({
			title: 'Topic: Intro',
			description: "Documentation for MSX resource 'guide': topic",
			mimeType: 'text/markdown',
		});
		const result = await resource.handler(new URL('msxdocs://guide/topic'));

		expect(mockAddFileExtension).toHaveBeenCalledWith('/resources/guide/topic');
		expect(mockReadFile).toHaveBeenLastCalledWith('/resources/guide/topic.md', 'utf8');
		expect(result).toEqual({
			contents: [{
				uri: 'msxdocs://guide/topic',
				text: 'Guide text',
				mimeType: 'text/markdown',
			}],
		});
	});

	it('uses metadata and MIME fallbacks for empty resource fields', async () => {
		mockListResourcesDirectory.mockResolvedValue(['guide']);
		mockReadFile
			.mockResolvedValueOnce(JSON.stringify({
				toc: [{ uri: 'msxdocs://guide/', title: '', description: '', mimeType: '' }],
			}))
			.mockResolvedValueOnce('Guide text');
		mockAddFileExtension.mockResolvedValue([
			undefined,
			'/resources/guide/index.md',
		] as unknown as string[]);

		const registry = await register();
		const resource = registry.registrations.find(item => item.name === 'msxdocs_guide_');
		if (!resource) throw new Error('Fallback resource was not registered');

		expect(resource.metadata).toMatchObject({
			title: "MSX Documentation 'guide': ",
			description: "Documentation for MSX resource 'guide': ",
			mimeType: 'text/markdown',
		});
		const result = await resource.handler(new URL('msxdocs://guide/'));

		expect(result.contents[0]).toEqual({
			uri: 'msxdocs://guide/',
			text: 'Guide text',
			mimeType: 'text/plain',
		});
	});

	it('fetches an HTTP resource through fetchCleanWebpage', async () => {
		mockListResourcesDirectory.mockResolvedValue(['remote']);
		mockReadFile.mockResolvedValue(JSON.stringify({
			toc: [{ uri: 'https://example.test/guide', title: 'Remote Guide' }],
		}));
		mockFetchCleanWebpage.mockResolvedValue(['Remote text', 'text/html']);

		const registry = await register();
		const resource = registry.registrations.find(item => item.name === 'msxdocs_remote_remote_guide');
		if (!resource) throw new Error('Remote resource was not registered');

		const result = await resource.handler(new URL('https://example.test/guide'));

		expect(mockFetchCleanWebpage).toHaveBeenCalledWith('https://example.test/guide');
		expect(result.contents[0]).toEqual({
			uri: 'https://example.test/guide',
			text: 'Remote text',
			mimeType: 'text/html',
		});
	});

	it('propagates HTTP resource errors', async () => {
		mockListResourcesDirectory.mockResolvedValue(['remote']);
		mockReadFile.mockResolvedValue(JSON.stringify({
			toc: [{ uri: 'https://example.test/guide', title: 'Remote Guide' }],
		}));
		mockFetchCleanWebpage.mockRejectedValue(new Error('offline'));

		const registry = await register();
		const resource = registry.registrations.find(item => item.name === 'msxdocs_remote_remote_guide');
		if (!resource) throw new Error('Remote resource was not registered');

		await expect(resource.handler(new URL('https://example.test/guide')))
			.rejects.toThrow('offline');
	});

	it('wraps local resource read errors', async () => {
		mockListResourcesDirectory.mockResolvedValue(['guide']);
		mockReadFile.mockResolvedValue(JSON.stringify({
			toc: [{ uri: 'msxdocs://guide/topic', title: 'Topic' }],
		}));
		mockAddFileExtension.mockRejectedValue(new Error('ENOENT'));

		const registry = await register();
		const resource = registry.registrations.find(item => item.name === 'msxdocs_guide_topic');
		if (!resource) throw new Error('Local resource was not registered');

		await expect(resource.handler(new URL('msxdocs://guide/topic')))
			.rejects.toThrow('Error reading resource guide/msxdocs://guide/topic: ENOENT');
	});

	it('formats non-Error local resource failures', async () => {
		mockListResourcesDirectory.mockResolvedValue(['guide']);
		mockReadFile.mockResolvedValue(JSON.stringify({
			toc: [{ uri: 'msxdocs://guide/topic', title: 'Topic' }],
		}));
		mockAddFileExtension.mockRejectedValue('ENOENT');

		const registry = await register();
		const resource = registry.registrations.find(item => item.name === 'msxdocs_guide_topic');
		if (!resource) throw new Error('Local resource was not registered');

		await expect(resource.handler(new URL('msxdocs://guide/topic')))
			.rejects.toThrow('Error reading resource guide/msxdocs://guide/topic: ENOENT');
	});

	it('decodes BASIC instruction URIs and maps question marks to safe filenames', async () => {
		mockListResourcesDirectory.mockResolvedValue([]);
		mockAddFileExtension.mockResolvedValue([
			'text/markdown',
			'/resources/programming/basic_wiki/CLOAD_Q.md',
		]);
		mockReadFile.mockResolvedValue('CLOAD? documentation');

		const registry = await register();
		const basic = registry.registrations.find(resource => resource.name === 'msxdocs_basic_wiki');
		if (!basic) throw new Error('BASIC resource was not registered');

		const result = await basic.handler(
			new URL('msxdocs://basic_wiki/CLOAD%3F'),
			{ instruction: 'CLOAD%3F' },
		);

		expect(mockAddFileExtension).toHaveBeenCalledWith('/resources/programming/basic_wiki/CLOAD_Q');
		expect(result.contents[0]).toEqual({
			uri: 'msxdocs://basic_wiki/CLOAD%3F',
			text: 'CLOAD? documentation',
			mimeType: 'text/markdown',
		});
	});

	it('uses text/plain when BASIC resource MIME is unavailable', async () => {
		mockListResourcesDirectory.mockResolvedValue([]);
		mockAddFileExtension.mockResolvedValue([
			undefined,
			'/resources/programming/basic_wiki/PRINT.md',
		] as unknown as string[]);
		mockReadFile.mockResolvedValue('PRINT documentation');

		const registry = await register();
		const basic = registry.registrations.find(resource => resource.name === 'msxdocs_basic_wiki');
		if (!basic) throw new Error('BASIC resource was not registered');

		const result = await basic.handler(
			new URL('msxdocs://basic_wiki/PRINT'),
			{ instruction: 'PRINT' },
		);

		expect(result.contents[0].mimeType).toBe('text/plain');
	});

	it('wraps BASIC resource read errors', async () => {
		mockListResourcesDirectory.mockResolvedValue([]);
		mockAddFileExtension.mockResolvedValue(['text/markdown', '/resources/missing.md']);
		mockReadFile.mockRejectedValue('missing');

		const registry = await register();
		const basic = registry.registrations.find(resource => resource.name === 'msxdocs_basic_wiki');
		if (!basic) throw new Error('BASIC resource was not registered');

		await expect(basic.handler(
			new URL('msxdocs://basic_wiki/MISSING'),
			{ instruction: 'MISSING' },
		)).rejects.toThrow('Error reading resource programming/basic_wiki/MISSING (file: MISSING): missing');
	});

	it('preserves Error messages from BASIC resource reads', async () => {
		mockListResourcesDirectory.mockResolvedValue([]);
		mockAddFileExtension.mockResolvedValue(['text/markdown', '/resources/programming/basic_wiki/PRINT.md']);
		mockReadFile.mockRejectedValue(new Error('ENOENT'));

		const registry = await register();
		const basic = registry.registrations.find(resource => resource.name === 'msxdocs_basic_wiki');
		if (!basic) throw new Error('BASIC resource was not registered');

		await expect(basic.handler(
			new URL('msxdocs://basic_wiki/PRINT'),
			{ instruction: 'PRINT' },
		)).rejects.toThrow('Error reading resource programming/basic_wiki/PRINT (file: PRINT): ENOENT');
	});
});