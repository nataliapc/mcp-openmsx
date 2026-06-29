import { describe, it, expect } from 'vitest';

/**
 * Tests for fuseRRF (Reciprocal Rank Fusion), the pure function that combines
 * the vector and full-text result lists in VectorDB.query().
 */
import { fuseRRF } from '../../src/vectordb.js';

const row = (id: string, extra: Record<string, unknown> = {}) => ({ id, ...extra });

describe('fuseRRF', () => {
	it('returns [] for two empty lists', () => {
		expect(fuseRRF([], [])).toEqual([]);
	});

	it('ranks a doc present in both lists above docs in only one', () => {
		// "b" appears in both branches; "a" and "c" appear in only one.
		const vec = [row('a'), row('b')];
		const fts = [row('b'), row('c')];
		const fused = fuseRRF(vec, fts);
		expect(fused[0].row.id).toBe('b');
		// b: 1/(60+2) + 1/(60+1); a: 1/(60+1); c: 1/(60+2)
		expect(fused[0].score).toBeGreaterThan(fused[1].score);
	});

	it('preserves single-list ranking order', () => {
		const vec = [row('a'), row('b'), row('c')];
		const fused = fuseRRF(vec, []);
		expect(fused.map((r) => r.row.id)).toEqual(['a', 'b', 'c']);
	});

	it('respects topK', () => {
		const vec = Array.from({ length: 20 }, (_, i) => row(`v${i}`));
		const fused = fuseRRF(vec, [], 60, 5);
		expect(fused).toHaveLength(5);
	});

	it('uses 0-based rank with +1: top item contributes 1/(k+1)', () => {
		const fused = fuseRRF([row('a')], [], 60);
		expect(fused[0].score).toBeCloseTo(1 / 61, 10);
	});

	it('a smaller k increases the weight of top ranks', () => {
		const big = fuseRRF([row('a')], [], 60)[0].score;
		const small = fuseRRF([row('a')], [], 10)[0].score;
		expect(small).toBeGreaterThan(big);
	});

	it('accumulates scores for the same id across branches', () => {
		const both = fuseRRF([row('x')], [row('x')], 60)[0].score;
		expect(both).toBeCloseTo(2 / 61, 10);
	});

	it('carries the row payload through', () => {
		const fused = fuseRRF([row('a', { uri: 'msxdocs://x', text: 'hi' })], []);
		expect(fused[0].row.uri).toBe('msxdocs://x');
		expect(fused[0].row.text).toBe('hi');
	});
});
