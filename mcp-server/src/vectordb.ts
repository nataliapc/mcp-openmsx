/**
 * Vector Database wrapper class.
 *
 * Hybrid search over the MSX documentation corpus:
 *   - dense vector search (cosine over 384-d embeddings, see embedder.ts)
 *   - full-text search (BM25, LanceDB native FTS index)
 *   - fused with Reciprocal Rank Fusion (RRF)
 *
 * Storage: LanceDB (columnar `.lance` table), replacing the previous Vectra
 * `index.json`.
 *
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import path from 'path';
import * as lancedb from '@lancedb/lancedb';
import { embedQuery } from './embedder.js';

const TABLE_NAME = 'msxdocs';
const TOP_K = 10;        // final results returned
const CANDIDATES = 30;   // candidates fetched per branch before fusion
const RRF_K = 60;        // RRF constant


/** A row produced by a LanceDB query branch (vector or FTS). */
type Row = Record<string, any>;

/** A fused result with its accumulated RRF score. */
export interface FusedResult {
	score: number;
	row: Row;
}

/**
 * Fuse two ranked result lists with Reciprocal Rank Fusion.
 * Each document scores Σ 1/(k + rank) over the lists it appears in
 * (rank is 0-based, so the +1 makes the top item contribute 1/(k+1)).
 */
export function fuseRRF(
	vecRows: Row[],
	ftsRows: Row[],
	k: number = RRF_K,
	topK: number = TOP_K,
): FusedResult[] {
	const acc = new Map<string, FusedResult>();
	const add = (rows: Row[]) => {
		rows.forEach((row, rank) => {
			const id = String(row.id);
			const inc = 1 / (k + rank + 1);
			const cur = acc.get(id);
			if (cur) {
				cur.score += inc;
			} else {
				acc.set(id, { score: inc, row });
			}
		});
	};
	add(vecRows);
	add(ftsRows);
	return [...acc.values()].sort((a, b) => b.score - a.score).slice(0, topK);
}


export class VectorDB {
	private static instance: VectorDB | null = null;
	private static vectorDbDir: string = path.join('..', 'vector-db');
	private tablePromise: Promise<lancedb.Table> | null = null;

	static getInstance(): VectorDB {
		if (!VectorDB.instance) {
			VectorDB.instance = new VectorDB();
		}
		return VectorDB.instance;
	}

	static setIndexDirectory(dbDir: string): void {
		VectorDB.vectorDbDir = dbDir;
	}

	private getTable(): Promise<lancedb.Table> {
		if (!this.tablePromise) {
			this.tablePromise = (async () => {
				const db = await lancedb.connect(VectorDB.vectorDbDir);
				return db.openTable(TABLE_NAME);
			})().catch((err) => {
				this.tablePromise = null;
				throw new Error(
					`Failed to open LanceDB table '${TABLE_NAME}' at '${VectorDB.vectorDbDir}'. ` +
					`Has the index been generated? (${err instanceof Error ? err.message : err})`,
				);
			});
		}
		return this.tablePromise;
	}

	async query(text: string): Promise<object[]> {
		const tbl = await this.getTable();
		const vector = await embedQuery(text);

		// Vector branch (always available). No `.select()`: scoring queries warn
		// when output columns are projected without `_distance`/`_score`, and the
		// candidate set is tiny so fetching full rows is negligible.
		const vecRows: Row[] = await tbl
			.query()
			.nearestTo(vector)
			.limit(CANDIDATES)
			.toArray();

		// Full-text (BM25) branch. Degrade gracefully to vector-only if the FTS
		// index is missing or the query cannot be parsed.
		let ftsRows: Row[] = [];
		try {
			ftsRows = await tbl
				.query()
				.nearestToText(text)
				.limit(CANDIDATES)
				.toArray();
		} catch {
			ftsRows = [];
		}

		return fuseRRF(vecRows, ftsRows).map((r) => ({
			score: r.score.toFixed(4),
			uri: r.row.uri ?? 'unknown',
			title: r.row.title ?? 'unknown',
			document: String(r.row.text ?? ''),
			id: r.row.id ?? 'unknown',
		}));
	}
}
