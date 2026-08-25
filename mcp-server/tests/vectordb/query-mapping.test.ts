import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Tests for VectorDB.query() result mapping, with embed() and @lancedb/lancedb
 * mocked so no model download or real index is needed.
 */

// Configurable per-test result rows.
let vecRows: Record<string, any>[] = [];
let ftsRows: Record<string, any>[] = [];
let ftsThrows = false;

// A chainable query builder mock: nearestTo → vector branch, nearestToText → fts branch.
function makeBuilder() {
	let mode = '';
	const b: any = {
		nearestTo: vi.fn(() => { mode = 'vec'; return b; }),
		nearestToText: vi.fn(() => {
			if (ftsThrows) { throw new Error('no FTS index'); }
			mode = 'fts';
			return b;
		}),
		select: vi.fn(() => b),
		limit: vi.fn(() => b),
		toArray: vi.fn(async () => (mode === 'vec' ? vecRows : ftsRows)),
	};
	return b;
}

const mockTable = { query: vi.fn(() => makeBuilder()) };

vi.mock('@lancedb/lancedb', () => ({
	connect: vi.fn(async () => ({ openTable: vi.fn(async () => mockTable) })),
}));

vi.mock('../../src/embedder.js', () => ({
	embed: vi.fn(async () => new Array(384).fill(0.1)),
	embedQuery: vi.fn(async () => new Array(384).fill(0.1)),
	embedPassage: vi.fn(async () => new Array(384).fill(0.1)),
	EMBEDDING_DIM: 384,
}));

import { VectorDB } from '../../src/vectordb.js';
import { connect } from '@lancedb/lancedb';

const r = (id: string, n: number) => ({
	id,
	text: `text-${n}`,
	uri: `msxdocs://doc/${n}`,
	title: `Title ${n}`,
	index: n,
});

const mockConnect = vi.mocked(connect);
const DEFAULT_INDEX_DIR = path.join('..', 'vector-db');

beforeEach(() => {
	vecRows = [];
	ftsRows = [];
	ftsThrows = false;
	// Reset the singleton so each test re-opens the (mocked) table.
	(VectorDB as any).instance = null;
	VectorDB.setIndexDirectory(DEFAULT_INDEX_DIR);
});

describe('VectorDB.query mapping', () => {
	it('maps text→document and formats score to 4 decimals', async () => {
		vecRows = [r('a', 1)];
		ftsRows = [];
		const results = (await VectorDB.getInstance().query('z80')) as any[];
		expect(results).toHaveLength(1);
		expect(results[0]).toMatchObject({
			id: 'a',
			uri: 'msxdocs://doc/1',
			title: 'Title 1',
			document: 'text-1',
		});
		expect(results[0].score).toMatch(/^\d+\.\d{4}$/);
	});

	it('fuses both branches and ranks the shared doc first', async () => {
		vecRows = [r('a', 1), r('b', 2)];
		ftsRows = [r('b', 2), r('c', 3)];
		const results = (await VectorDB.getInstance().query('ldir')) as any[];
		expect(results[0].id).toBe('b');
		expect(results.map((x) => x.id).sort()).toEqual(['a', 'b', 'c']);
	});

	it('returns [] for an empty table', async () => {
		vecRows = [];
		ftsRows = [];
		const results = (await VectorDB.getInstance().query('nothing')) as any[];
		expect(results).toEqual([]);
	});

	it('degrades to vector-only when FTS branch throws', async () => {
		vecRows = [r('a', 1)];
		ftsThrows = true;
		const results = (await VectorDB.getInstance().query('vdp')) as any[];
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe('a');
	});

	it('falls back to "unknown" for missing metadata', async () => {
		vecRows = [{}];
		const results = (await VectorDB.getInstance().query('x')) as any[];
		expect(results[0].uri).toBe('unknown');
		expect(results[0].title).toBe('unknown');
		expect(results[0].document).toBe('');
		expect(results[0].id).toBe('unknown');
	});

	it('reuses the singleton and cached table connection', async () => {
		const connectCallsBefore = mockConnect.mock.calls.length;
		const first = VectorDB.getInstance();
		const second = VectorDB.getInstance();

		expect(second).toBe(first);
		await first.query('first');
		await second.query('second');

		expect(mockConnect.mock.calls.length - connectCallsBefore).toBe(1);
	});

	it('uses a file URI when resolving a Windows index directory', async () => {
		const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
		const indexDirectory = 'vector-db-test';
		try {
			Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
			VectorDB.setIndexDirectory(indexDirectory);

			await VectorDB.getInstance().query('windows');

			expect(mockConnect).toHaveBeenCalledWith(pathToFileURL(path.resolve(indexDirectory)).href);
		} finally {
			if (originalPlatform) Object.defineProperty(process, 'platform', originalPlatform);
			VectorDB.setIndexDirectory(DEFAULT_INDEX_DIR);
		}
	});

	it('wraps LanceDB Error failures and retries after clearing the cached promise', async () => {
		const connectCallsBefore = mockConnect.mock.calls.length;
		mockConnect.mockRejectedValueOnce(new Error('disk missing'));

		await expect(VectorDB.getInstance().query('broken'))
			.rejects.toThrow("Failed to open LanceDB table 'msxdocs' at '../vector-db'. Has the index been generated? (disk missing)");
		await expect(VectorDB.getInstance().query('retry')).resolves.toEqual([]);

		expect(mockConnect.mock.calls.length - connectCallsBefore).toBe(2);
	});

	it('formats non-Error LanceDB failures', async () => {
		mockConnect.mockRejectedValueOnce('disk missing');

		await expect(VectorDB.getInstance().query('broken'))
			.rejects.toThrow("Failed to open LanceDB table 'msxdocs' at '../vector-db'. Has the index been generated? (disk missing)");
	});
});
