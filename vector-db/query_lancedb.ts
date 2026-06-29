// query_lancedb.ts
// ===============================================================
// Manual smoke-test for the LanceDB hybrid index. Reuses the server's real
// VectorDB (vector + BM25 + RRF) so it exercises the exact query path.
// ---------------------------------------------------------------
//  Usage:
//    npx tsx query_lancedb.ts "Z80 LDIR instruction"
//    npx tsx query_lancedb.ts --out ../mcp-server/vector-db "VDP register 23"
// ===============================================================

import * as path from 'path';
import { VectorDB } from '../mcp-server/src/vectordb.js';

let OUT_DIR = '../mcp-server/vector-db';
const terms: string[] = [];
for (let i = 2; i < process.argv.length; i++) {
	if (process.argv[i] === '--out' && process.argv[i + 1]) {
		OUT_DIR = process.argv[++i];
	} else {
		terms.push(process.argv[i]);
	}
}

const query = terms.join(' ').trim();
if (!query) {
	console.error('Usage: npx tsx query_lancedb.ts [--out <dir>] "<query>"');
	process.exit(1);
}

async function main(): Promise<void> {
	VectorDB.setIndexDirectory(path.resolve(OUT_DIR));

	const results = (await VectorDB.getInstance().query(query)) as Array<{
		score: string; title: string; uri: string; document: string; id: string;
	}>;

	console.log(`🔍 Query: "${query}"  (index: ${path.resolve(OUT_DIR)})\n`);
	if (results.length === 0) {
		console.log('❌ No results.');
		return;
	}
	results.forEach((res, i) => {
		console.log(`${i + 1}. [RRF ${res.score}] ${res.title}`);
		console.log(`   URI:  ${res.uri}`);
		console.log(`   Text: ${res.document.slice(0, 120).replace(/\s+/g, ' ')}...\n`);
	});
}

main().catch((err) => {
	console.error('💥 Error:', err);
	process.exit(1);
});
