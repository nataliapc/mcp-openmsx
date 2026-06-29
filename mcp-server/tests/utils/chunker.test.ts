import { describe, it, expect } from 'vitest';

import { chunkText, DEFAULT_MAX_CHARS, DEFAULT_OVERLAP, semanticChunk, splitSentences } from '../../src/chunker.js';

describe('chunkText', () => {
	it('returns [] for empty or whitespace-only input', () => {
		expect(chunkText('')).toEqual([]);
		expect(chunkText('   \n\n  ')).toEqual([]);
	});

	it('returns a single chunk for short text', () => {
		expect(chunkText('short text')).toEqual(['short text']);
	});

	it('normalizes CRLF to LF', () => {
		expect(chunkText('a\r\nb')).toEqual(['a\nb']);
	});

	it('splits long text into multiple chunks within size bound', () => {
		const text = Array.from({ length: 40 }, (_, i) => `Paragraph number ${i} with some filler words.`).join('\n\n');
		const chunks = chunkText(text);
		expect(chunks.length).toBeGreaterThan(1);
		for (const c of chunks) {
			// Packing may add an overlap tail, so allow maxChars + overlap.
			expect(c.length).toBeLessThanOrEqual(DEFAULT_MAX_CHARS + DEFAULT_OVERLAP);
		}
	});

	it('hard-splits a single oversized block with overlap', () => {
		const block = 'x'.repeat(1500);
		const chunks = chunkText(block, { maxChars: 450, overlap: 80 });
		expect(chunks.length).toBeGreaterThan(1);
		for (const c of chunks) {
			expect(c.length).toBeLessThanOrEqual(450);
		}
		// Reconstructing with the step size must cover the whole input.
		const step = 450 - 80;
		expect(chunks.length).toBe(Math.ceil((1500 - 450) / step) + 1);
	});

	it('produces overlapping windows for oversized blocks', () => {
		const block = Array.from({ length: 600 }, (_, i) => String.fromCharCode(97 + (i % 26))).join('');
		const chunks = chunkText(block, { maxChars: 200, overlap: 50 });
		// End of chunk[0] should reappear at the start of chunk[1].
		const tail = chunks[0].slice(-50);
		expect(chunks[1].startsWith(tail)).toBe(true);
	});

	it('never emits empty chunks', () => {
		const text = 'a\n\n\n\nb\n\n\n\nc';
		const chunks = chunkText(text, { maxChars: 3, overlap: 1 });
		expect(chunks.every((c) => c.trim().length > 0)).toBe(true);
	});
});

describe('splitSentences', () => {
	it('splits on sentence punctuation and line breaks', () => {
		expect(splitSentences('One. Two! Three?\nFour')).toEqual(['One.', 'Two!', 'Three?', 'Four']);
	});
	it('drops empty fragments', () => {
		expect(splitSentences('  \n\n A. \n')).toEqual(['A.']);
	});
});

describe('semanticChunk', () => {
	// Fake batch embedder: sentences containing "B" map to one direction, others to another.
	const fakeEmbed = async (texts: string[]): Promise<number[][]> =>
		texts.map((t) => (t.includes('B') ? [0, 1] : [1, 0]));

	it('returns [] for empty input', async () => {
		expect(await semanticChunk('', fakeEmbed)).toEqual([]);
	});

	it('returns the single sentence unchanged', async () => {
		expect(await semanticChunk('Just one sentence.', fakeEmbed)).toEqual(['Just one sentence.']);
	});

	it('groups similar consecutive paragraphs and cuts on topic change', async () => {
		const text = 'Apple one.\n\nApple two.\n\nBanana B one.\n\nBanana B two.';
		const chunks = await semanticChunk(text, fakeEmbed, { minChars: 0, similarityThreshold: 0.9, maxChars: 1000 });
		expect(chunks).toHaveLength(2);
		expect(chunks[0]).toContain('Apple one.');
		expect(chunks[0]).toContain('Apple two.');
		expect(chunks[1]).toContain('Banana B one.');
		expect(chunks[1]).toContain('Banana B two.');
	});

	it('forces a cut when maxChars would overflow even if similar', async () => {
		const s = Array.from({ length: 6 }, () => 'x'.repeat(60)).join('\n\n'); // 6 similar paragraphs
		const chunks = await semanticChunk(s, fakeEmbed, { minChars: 0, similarityThreshold: 0.5, maxChars: 130 });
		expect(chunks.length).toBeGreaterThan(1);
		for (const c of chunks) {
			expect(c.length).toBeLessThanOrEqual(130);
		}
	});

	it('merges a tiny fragment into the previous chunk when it fits', async () => {
		// Two topics, but the second is tiny → merged back.
		const text = 'Apple one is a longer paragraph here.\n\nApple two is also fairly long.\n\nB.';
		const chunks = await semanticChunk(text, fakeEmbed, { minChars: 10, similarityThreshold: 0.9, maxChars: 1000 });
		expect(chunks).toHaveLength(1);
		expect(chunks[0]).toContain('B.');
	});
});
