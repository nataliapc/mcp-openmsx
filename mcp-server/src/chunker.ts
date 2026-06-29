/**
 * Local text chunkers (no external API).
 *
 * Two strategies:
 *  - `chunkText`: deterministic, markdown-aware, fixed-size with overlap.
 *    Used as a fallback and to hard-split oversized units.
 *  - `semanticChunk`: groups consecutive sentences by embedding similarity
 *    (cosine), so each chunk stays topically coherent, up to a size bound.
 *    Requires an embedding function (injected) — the model runs locally.
 *
 * Sizing targets the embedding model's context window. With multilingual-e5
 * (max 512 tokens) we aim for ~1600 characters (~400 tokens), leaving room for
 * the "passage: " prefix.
 *
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */

export interface ChunkOptions {
	/** Target maximum characters per chunk. */
	maxChars?: number;
	/** Characters of overlap carried between consecutive chunks. */
	overlap?: number;
}

export const DEFAULT_MAX_CHARS = 1600;
export const DEFAULT_OVERLAP = 100;

/** Hard-split a single oversized block into overlapping windows. */
function splitLong(s: string, maxChars: number, overlap: number): string[] {
	const out: string[] = [];
	const step = Math.max(1, maxChars - overlap);
	let start = 0;
	while (start < s.length) {
		const end = Math.min(start + maxChars, s.length);
		const piece = s.slice(start, end).trim();
		if (piece) {
			out.push(piece);
		}
		if (end >= s.length) {
			break;
		}
		start += step;
	}
	return out;
}

/**
 * Split `text` into overlapping, markdown-aware fixed-size chunks.
 * Returns [] for empty/whitespace input.
 */
export function chunkText(text: string, opts: ChunkOptions = {}): string[] {
	const maxChars = opts.maxChars ?? DEFAULT_MAX_CHARS;
	const overlap = opts.overlap ?? DEFAULT_OVERLAP;

	const clean = text.replace(/\r\n/g, '\n').trim();
	if (!clean) {
		return [];
	}
	if (clean.length <= maxChars) {
		return [clean];
	}

	const blocks = clean
		.split(/\n{2,}/)
		.map((b) => b.trim())
		.filter(Boolean);

	const chunks: string[] = [];
	let buf = '';
	const flush = () => {
		if (buf.trim()) {
			chunks.push(buf.trim());
		}
	};

	for (const block of blocks) {
		if (block.length > maxChars) {
			flush();
			buf = '';
			chunks.push(...splitLong(block, maxChars, overlap));
			continue;
		}
		if (buf && buf.length + block.length + 1 > maxChars) {
			flush();
			const tail = buf.slice(-overlap);
			buf = `${tail}\n${block}`;
		} else {
			buf = buf ? `${buf}\n${block}` : block;
		}
	}
	flush();
	return chunks;
}

// ---------------------------------------------------------------------------
// Semantic chunking
// ---------------------------------------------------------------------------

export interface SemanticChunkOptions {
	/** Target maximum characters per chunk (≈400 tokens for e5). */
	maxChars?: number;
	/** Below this, merge a finished chunk into the next one if it fits. */
	minChars?: number;
	/**
	 * Cosine-similarity threshold to keep a sentence in the current group.
	 * Lower → larger, looser chunks; higher → smaller, tighter chunks.
	 */
	similarityThreshold?: number;
}

export const SEMANTIC_DEFAULTS: Required<SemanticChunkOptions> = {
	maxChars: 1800,
	minChars: 250,
	similarityThreshold: 0.90,
};

/** Batch embedding function: maps N texts to N vectors in one call. */
type EmbedBatchFn = (texts: string[]) => Promise<number[][]>;

/** Split text into sentence-ish units (sentence punctuation or line breaks). */
export function splitSentences(text: string): string[] {
	return text
		.replace(/\r\n/g, '\n')
		.split(/(?<=[.!?:;])\s+|\n+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/** Dot product of two equal-length, L2-normalized vectors (= cosine). */
function dot(a: number[], b: number[]): number {
	let s = 0;
	for (let i = 0; i < a.length; i++) {
		s += a[i] * b[i];
	}
	return s;
}

/**
 * Group consecutive sentences by embedding similarity into coherent chunks.
 * All sentences are embedded in one batched call (`embedFn`); a running
 * (re-normalized) centroid represents the current group. A sentence starts a
 * new chunk when it is too dissimilar from the centroid or would overflow
 * `maxChars`.
 */
export async function semanticChunk(
	text: string,
	embedFn: EmbedBatchFn,
	opts: SemanticChunkOptions = {},
): Promise<string[]> {
	const maxChars = opts.maxChars ?? SEMANTIC_DEFAULTS.maxChars;
	const minChars = opts.minChars ?? SEMANTIC_DEFAULTS.minChars;
	const threshold = opts.similarityThreshold ?? SEMANTIC_DEFAULTS.similarityThreshold;

	const clean = text.replace(/\r\n/g, '\n').trim();
	if (!clean) {
		return [];
	}

	// Units = paragraphs (split on blank lines). Oversized paragraphs are split
	// into sentences, and oversized sentences hard-split. Paragraph granularity
	// keeps the embedding count tractable on CPU while staying semantically
	// meaningful (a paragraph is a natural topical unit).
	const units: string[] = [];
	for (const para of clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)) {
		if (para.length <= maxChars) {
			units.push(para);
			continue;
		}
		for (const s of splitSentences(para)) {
			if (s.length > maxChars) {
				units.push(...splitLong(s, maxChars, 0));
			} else {
				units.push(s);
			}
		}
	}
	if (units.length === 0) {
		return [];
	}
	if (units.length === 1) {
		return [units[0]];
	}

	const embeddings = await embedFn(units);
	const dim = embeddings[0].length;

	const chunks: string[] = [];
	let groupText = units[0];
	let sum = embeddings[0].slice();        // running sum of member vectors
	let centroid = embeddings[0];           // normalized centroid

	const renormalize = (v: number[]): number[] => {
		let n = 0;
		for (let i = 0; i < dim; i++) {
			n += v[i] * v[i];
		}
		n = Math.max(Math.sqrt(n), 1e-12);
		return v.map((x) => x / n);
	};

	for (let i = 1; i < units.length; i++) {
		const sim = dot(centroid, embeddings[i]);
		const wouldOverflow = groupText.length + 1 + units[i].length > maxChars;

		if (sim >= threshold && !wouldOverflow) {
			groupText += `\n${units[i]}`;
			for (let d = 0; d < dim; d++) {
				sum[d] += embeddings[i][d];
			}
			centroid = renormalize(sum);
		} else {
			chunks.push(groupText);
			groupText = units[i];
			sum = embeddings[i].slice();
			centroid = embeddings[i];
		}
	}
	chunks.push(groupText);

	// Merge tiny trailing fragments into the previous chunk when they fit.
	const merged: string[] = [];
	for (const c of chunks) {
		const prev = merged[merged.length - 1];
		if (prev && c.length < minChars && prev.length + 1 + c.length <= maxChars) {
			merged[merged.length - 1] = `${prev}\n${c}`;
		} else {
			merged.push(c);
		}
	}
	return merged;
}
