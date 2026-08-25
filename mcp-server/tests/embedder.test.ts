import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import os from 'os';
import path from 'path';

interface Encoding {
	getIds: () => number[];
	getAttentionMask: () => number[];
}

interface FakeSession {
	inputNames: string[];
	outputNames: string[];
	run: ReturnType<typeof vi.fn>;
	release?: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted(() => {
	class FakeTensor {
		constructor(
			readonly type: string,
			readonly data: unknown,
			readonly dims: number[],
		) {}
	}

	return {
		FakeTensor,
		createSession: vi.fn(),
		fromFile: vi.fn(),
		existsSync: vi.fn(),
		statSync: vi.fn(),
		mkdir: vi.fn(),
		writeFile: vi.fn(),
		rename: vi.fn(),
		fetch: vi.fn(),
	};
});

vi.mock('onnxruntime-node', () => ({
	InferenceSession: { create: mocks.createSession },
	Tensor: mocks.FakeTensor,
}));

vi.mock('@anush008/tokenizers', () => ({
	Tokenizer: { fromFile: mocks.fromFile },
}));

vi.mock('fs', () => ({
	existsSync: mocks.existsSync,
	statSync: mocks.statSync,
	promises: {
		mkdir: mocks.mkdir,
		writeFile: mocks.writeFile,
		rename: mocks.rename,
	},
}));

const mockCreateSession = mocks.createSession;
const mockFromFile = mocks.fromFile;
const mockExistsSync = mocks.existsSync;
const mockStatSync = mocks.statSync;
const mockMkdir = mocks.mkdir;
const mockWriteFile = mocks.writeFile;
const mockRename = mocks.rename;
const mockFetch = mocks.fetch;

let originalEnv: NodeJS.ProcessEnv;

function makeEncoding(ids: number[], mask: number[] = ids.map(() => 1)): Encoding {
	return {
		getIds: () => ids,
		getAttentionMask: () => mask,
	};
}

function makeHidden(data: number[], dims: number[]) {
	return { data: new Float32Array(data), dims };
}

function makeSession(
	inputNames: string[] = ['input_ids', 'attention_mask'],
	outputNames: string[] = ['last_hidden_state'],
): FakeSession {
	return {
		inputNames,
		outputNames,
		run: vi.fn(),
	};
}

function makeTokenizer(encodingFor: (text: string) => Encoding = () => makeEncoding([1])) {
	const tokenizer = {
		setTruncation: vi.fn(),
		encode: vi.fn(async (text: string) => encodingFor(text)),
	};
	mockFromFile.mockReturnValue(tokenizer);
	return tokenizer;
}

function configureCachedFiles(): void {
	mockExistsSync.mockReturnValue(true);
	mockStatSync.mockReturnValue({ size: 1 });
}

function configureDownloadResponse(
	response: { ok: boolean; body: unknown; status: number; statusText: string; arrayBuffer: () => Promise<ArrayBuffer> },
): void {
	mockFetch.mockResolvedValue(response);
}

async function loadEmbedder(): Promise<typeof import('../src/embedder.js')> {
	vi.resetModules();
	return import('../src/embedder.js');
}

beforeEach(() => {
	originalEnv = { ...process.env };
	vi.clearAllMocks();
	mockCreateSession.mockReset();
	mockFromFile.mockReset();
	mockExistsSync.mockReset();
	mockStatSync.mockReset();
	mockMkdir.mockReset();
	mockWriteFile.mockReset();
	mockRename.mockReset();
	mockFetch.mockReset();
	mockExistsSync.mockReturnValue(false);
	mockStatSync.mockReturnValue({ size: 0 });
	mockMkdir.mockResolvedValue(undefined);
	mockWriteFile.mockResolvedValue(undefined);
	mockRename.mockResolvedValue(undefined);
	vi.stubGlobal('fetch', mockFetch);
	delete process.env.OPENMSX_MODELS_CACHE;
	delete process.env.HF_HOME;
	delete process.env.TRANSFORMERS_CACHE;
});

afterEach(() => {
	process.env = originalEnv;
	vi.unstubAllGlobals();
});

describe('embedder provider selection', () => {
	it('rejects changing provider after the engine has initialized', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockResolvedValue({ last_hidden_state: makeHidden([1], [1, 1, 1]) });
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer();

		await embedder.embedQuery('ready');

		expect(() => embedder.setEmbedProvider('cuda')).toThrow(
			'setEmbedProvider must be called before the first embedding',
		);
	});

	it('falls back to the CPU engine when CUDA is unavailable', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockResolvedValue({ last_hidden_state: makeHidden([1], [1, 1, 1]) });
		mockCreateSession
			.mockRejectedValueOnce(new Error('CUDA unavailable'))
			.mockResolvedValueOnce(session);
		makeTokenizer();
		embedder.setEmbedProvider('cuda');

		await embedder.embedQuery('fallback');

		expect(mockCreateSession).toHaveBeenNthCalledWith(
		1,
		 expect.stringContaining('model_quantized.onnx'),
		 expect.objectContaining({ executionProviders: ['cuda'] }),
		);
		expect(mockCreateSession).toHaveBeenNthCalledWith(
		2,
		 expect.stringContaining('model_quantized.onnx'),
		 expect.not.objectContaining({ executionProviders: ['cuda'] }),
		);
	});

	it('loads the fp32 model after a successful CUDA probe', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const probe = makeSession();
		probe.release = vi.fn().mockResolvedValue(undefined);
		const gpuSession = makeSession();
		gpuSession.run.mockResolvedValue({ last_hidden_state: makeHidden([1], [1, 1, 1]) });
		mockCreateSession.mockResolvedValueOnce(probe).mockResolvedValueOnce(gpuSession);
		makeTokenizer();
		embedder.setEmbedProvider('cuda');

		await embedder.embedQuery('gpu');

		expect(probe.release).toHaveBeenCalledOnce();
		expect(mockCreateSession).toHaveBeenNthCalledWith(
		2,
		 expect.stringContaining('model.onnx'),
		 expect.objectContaining({ executionProviders: ['cuda'] }),
		);
	});
});

describe('embedder model cache and downloads', () => {
	it.each([
		['OPENMSX_MODELS_CACHE', 'OPENMSX_MODELS_CACHE', '/tmp/openmsx-cache'],
		['HF_HOME', 'HF_HOME', '/tmp/hf-cache'],
		['TRANSFORMERS_CACHE', 'TRANSFORMERS_CACHE', '/tmp/transformers-cache'],
		['default cache', undefined, path.join(os.homedir(), '.cache', 'mcp-openmsx')],
	] as const)('resolves the %s cache directory', async (_label, variable, base) => {
		if (variable) process.env[variable] = base;
		const embedder = await loadEmbedder();
		const session = makeSession();
		session.run.mockResolvedValue({ last_hidden_state: makeHidden([1], [1, 1, 1]) });
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer();
		configureDownloadResponse({
			ok: true,
			body: {},
			status: 200,
			statusText: 'OK',
			arrayBuffer: async () => new Uint8Array([1]).buffer,
		});

		await embedder.embedQuery('cache');

		expect(mockMkdir).toHaveBeenCalledWith(
			path.join(base, 'models', 'Xenova__multilingual-e5-small', 'onnx'),
			{ recursive: true },
		);
	});

	it('uses non-empty cached files without fetching them', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockResolvedValue({ last_hidden_state: makeHidden([1], [1, 1, 1]) });
		mockCreateSession.mockResolvedValue(session);
		const tokenizer = makeTokenizer();

		await embedder.embedQuery('cached');

		expect(mockFetch).not.toHaveBeenCalled();
		expect(mockMkdir).not.toHaveBeenCalled();
		expect(tokenizer.setTruncation).toHaveBeenCalledWith(512);
	});

	it('downloads zero-length files and writes them atomically', async () => {
		const embedder = await loadEmbedder();
		mockExistsSync.mockReturnValue(true);
		mockStatSync.mockReturnValue({ size: 0 });
		const session = makeSession();
		session.run.mockResolvedValue({ last_hidden_state: makeHidden([1], [1, 1, 1]) });
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer();
		configureDownloadResponse({
			ok: true,
			body: {},
			status: 200,
			statusText: 'OK',
			arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
		});

		await embedder.embedQuery('download');

		expect(mockFetch).toHaveBeenCalledTimes(2);
		expect(mockWriteFile).toHaveBeenCalledTimes(2);
		expect(mockRename).toHaveBeenCalledTimes(2);
		expect(mockWriteFile.mock.calls[0][0]).toContain('.download');
	});

	it.each([
		[{ ok: false, body: {}, status: 404, statusText: 'Not Found' }, '404 Not Found'],
		[{ ok: true, body: null, status: 200, statusText: 'OK' }, '200 OK'],
	] as const)('reports failed model downloads', async (response, expected) => {
		const embedder = await loadEmbedder();
		configureDownloadResponse({ ...response, arrayBuffer: async () => new ArrayBuffer(0) });
		makeTokenizer();

		await expect(embedder.embedQuery('download failure')).rejects.toThrow(expected);
	});

	it('resets the engine promise after initialization failure so a retry works', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockResolvedValue({ last_hidden_state: makeHidden([1], [1, 1, 1]) });
		mockCreateSession.mockRejectedValueOnce(new Error('session failed')).mockResolvedValueOnce(session);
		makeTokenizer();

		await expect(embedder.embedQuery('first attempt')).rejects.toThrow('session failed');
		await expect(embedder.embedQuery('retry')).resolves.toEqual([1]);
		expect(mockCreateSession).toHaveBeenCalledTimes(2);
	});
});

describe('embedder inference', () => {
	it('returns immediately for an empty batch', async () => {
		const embedder = await loadEmbedder();

		expect(await embedder.embedPassageBatch([])).toEqual([]);
		expect(mockCreateSession).not.toHaveBeenCalled();
	});

	it('uses query and passage prefixes and keeps the embed alias', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockImplementation(async (feeds: Record<string, { dims: number[] }>) => {
			const [batch, maxLen] = feeds.input_ids.dims;
			return { last_hidden_state: makeHidden(new Array(batch * maxLen).fill(1), [batch, maxLen, 1]) };
		});
		mockCreateSession.mockResolvedValue(session);
		const tokenizer = makeTokenizer();

		await embedder.embedQuery('query text');
		await embedder.embedPassage('passage text');
		await embedder.embedPassageBatch(['one', 'two']);

		expect(embedder.embed).toBe(embedder.embedQuery);
		expect(tokenizer.encode.mock.calls.map(call => call[0])).toEqual([
			'query: query text',
			'passage: passage text',
			'passage: one',
			'passage: two',
		]);
	});

	it('batches more than 32 passages into multiple ONNX runs', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockImplementation(async (feeds: Record<string, { dims: number[] }>) => {
			const [batch, maxLen] = feeds.input_ids.dims;
			return { last_hidden_state: makeHidden(new Array(batch * maxLen).fill(1), [batch, maxLen, 1]) };
		});
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer();

		const result = await embedder.embedPassageBatch(
			Array.from({ length: 33 }, (_, index) => `passage-${index}`),
		);

		expect(result).toHaveLength(33);
		expect(session.run).toHaveBeenCalledTimes(2);
		expect(session.run.mock.calls[0][0].input_ids.dims).toEqual([32, 1]);
		expect(session.run.mock.calls[1][0].input_ids.dims).toEqual([1, 1]);
	});

	it('mean-pools masked tokens, pads batches, and adds token type IDs when needed', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession(['input_ids', 'attention_mask', 'token_type_ids']);
		session.run.mockResolvedValue({
			last_hidden_state: makeHidden(
				[3, 4, 1, 2, 0, 2, 99, 99],
				[2, 2, 2],
			),
		});
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer(text => text.endsWith('short')
			? makeEncoding([20])
			: makeEncoding([10, 11]));

		const result = await embedder.embedPassageBatch(['long', 'short']);
		const feeds = session.run.mock.calls[0][0];

		expect(feeds.token_type_ids).toBeInstanceOf(mocks.FakeTensor);
		expect(feeds.input_ids.dims).toEqual([2, 2]);
		expect(Array.from(feeds.attention_mask.data as BigInt64Array)).toEqual([1n, 1n, 1n, 0n]);
		expect(result[0][0]).toBeCloseTo(2 / Math.sqrt(13), 6);
		expect(result[0][1]).toBeCloseTo(3 / Math.sqrt(13), 6);
		expect(result[1]).toEqual([0, 1]);
	});

	it('uses the first named output when last_hidden_state is absent', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession(['input_ids', 'attention_mask'], ['hidden']);
		session.run.mockResolvedValue({ hidden: makeHidden([3, 4], [1, 1, 2]) });
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer(() => makeEncoding([1]));

		const result = await embedder.embedQuery('fallback output');

		expect(result).toEqual([3 / 5, 4 / 5]);
	});

	it('truncates sequences at the model maximum length', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockImplementation(async (feeds: Record<string, { dims: number[] }>) => {
			const [batch, maxLen] = feeds.input_ids.dims;
			return { last_hidden_state: makeHidden(new Array(batch * maxLen).fill(1), [batch, maxLen, 1]) };
		});
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer(() => makeEncoding(
			Array.from({ length: 513 }, (_, index) => index + 1),
		));

		const result = await embedder.embedQuery('long input');
		const ids = session.run.mock.calls[0][0].input_ids.data as BigInt64Array;

		expect(ids.length).toBe(512);
		expect(ids[0]).toBe(1n);
		expect(ids[511]).toBe(512n);
		expect(result).toEqual([1]);
	});

	it('returns a finite zero vector when every token is masked', async () => {
		const embedder = await loadEmbedder();
		configureCachedFiles();
		const session = makeSession();
		session.run.mockResolvedValue({ last_hidden_state: makeHidden([4, 5], [1, 2, 1]) });
		mockCreateSession.mockResolvedValue(session);
		makeTokenizer(() => makeEncoding([1, 2], [0, 0]));

		const result = await embedder.embedQuery('masked');

		expect(result).toEqual([0]);
		expect(result.every(Number.isFinite)).toBe(true);
	});
});