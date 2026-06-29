// generate_embeddings.ts
// ===============================================================
// Generates a portable LanceDB vector index from .md/.txt/.html resources
// for the mcp-openmsx server. 100% local: embeddings via
// ../mcp-server/src/embedder.ts (onnxruntime-node + tokenizer, mean pooling),
// chunking via ../mcp-server/src/chunker.ts. No external API.
// ---------------------------------------------------------------
//  Requires mcp-server deps installed (onnxruntime-node, @anush008/tokenizers):
//    cd ../mcp-server && pnpm install
//    cd ../vector-db   && pnpm install
//  Usage:
//    npx tsx generate_embeddings.ts --src ../mcp-server/resources/ --out ../mcp-server/vector-db
//  Options:
//    --src <path>        Source directory to scan (default: ../mcp-server/resources/)
//    --out <path>        LanceDB output directory (default: ../mcp-server/vector-db)
//    --collection <name> Table name (default: msxdocs)
//    --chunk <size>      Chunk size in characters (default: 450)
//    --overlap <size>    Overlap size between chunks (default: 80)
// ===============================================================

import * as lancedb from '@lancedb/lancedb';
import fg from 'fast-glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import removeMd from 'remove-markdown';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import sanitizeHtml from 'sanitize-html';

import { embedPassageBatch, setEmbedProvider } from '../mcp-server/src/embedder.js';
import { semanticChunk } from '../mcp-server/src/chunker.js';

// GPU is opt-in for the generator only (the server never touches this).
// OPENMSX_EMBED_PROVIDER=cuda uses the GPU (fp32) if available, else falls back
// to CPU (int8) without downloading the large model.
setEmbedProvider(process.env.OPENMSX_EMBED_PROVIDER === 'cuda' ? 'cuda' : 'cpu');

// ---------- CLI args ----------
let SRC_DIR = '../mcp-server/resources/';
let OUT_DIR = '../mcp-server/vector-db';
let COLLECTION_NAME = 'msxdocs';
let CHUNK_LEN = 1800;       // max chars per semantic chunk (~450 tokens)
let SIM_THRESHOLD = 0.90;   // cosine threshold to keep a paragraph in the group

for (let i = 0; i < process.argv.length; i++) {
	const next = process.argv[i + 1];
	switch (process.argv[i]) {
		case '--src': if (next) { SRC_DIR = next; } break;
		case '--out': if (next) { OUT_DIR = next; } break;
		case '--collection': if (next) { COLLECTION_NAME = next; } break;
		case '--chunk': if (next) { CHUNK_LEN = Number(next); } break;
		case '--threshold': if (next) { SIM_THRESHOLD = Number(next); } break;
	}
}

interface DocRow {
	id: string;
	vector: number[];
	text: string;
	uri: string;
	title: string;
	index: number;
}

// ---------- Utilities ----------
function stripHtml(html: string): string {
	const clean = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
	return cheerio.load(clean).text();
}

async function fileToPlainText(filePath: string): Promise<string> {
	const raw = await fs.readFile(filePath, 'utf-8');
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case '.md':
		case '.markdown': {
			const { content } = matter(raw); // strip YAML front-matter
			return removeMd(content);
		}
		case '.html':
		case '.htm':
			return stripHtml(raw);
		default:
			return raw;
	}
}

// ---------- Main Indexer ----------
async function indexFiles(): Promise<void> {
	console.log(`📂 Scanning "${SRC_DIR}" for toc.json files...`);
	const tocFiles = await fg(['**/toc.json', '**/_toc.json'], { cwd: SRC_DIR, absolute: true });
	console.log(`🔍 Found ${tocFiles.length} toc.json files`);

	// Collect resources from all toc.json files.
	const resources: Array<{ uri: string; title: string; filePath?: string }> = [];
	for (const tocFile of tocFiles) {
		const sectionName = path.basename(path.dirname(tocFile));
		try {
			const toc = JSON.parse(await fs.readFile(tocFile, 'utf8'));
			if (!Array.isArray(toc.toc)) { continue; }
			for (const item of toc.toc) {
				let filePath: string | undefined;
				if (typeof item.uri === 'string' && item.uri.startsWith(`${COLLECTION_NAME}://`)) {
					const itemName = path.parse(item.uri.split('/').pop() || '').base;
					filePath = path.join(path.dirname(tocFile), itemName);
				}
				resources.push({ uri: item.uri, title: item.title ?? '', filePath });
			}
		} catch (error) {
			console.error(`❌ Failed to parse ${tocFile} (${sectionName}):`, error);
		}
	}
	console.log(`📋 Total resources found: ${resources.length}`);

	// Build rows: chunk + embed each local resource.
	const rows: DocRow[] = [];
	const extensions = ['.md', '.markdown', '.txt', '.html', '.htm'];
	let processed = 0;

	for (const resource of resources) {
		if (resource.uri.startsWith('http://') || resource.uri.startsWith('https://')) {
			console.log(`⏭️  Skipping HTTP resource: ${resource.uri}`);
			continue;
		}
		if (!resource.filePath) {
			console.log(`⏭️  Skipping unsupported resource: ${resource.uri}`);
			continue;
		}

		// Resolve the actual file (try known extensions).
		let actualPath: string | undefined;
		for (const ext of extensions) {
			const candidate = resource.filePath + ext;
			try { await fs.access(candidate); actualPath = candidate; break; } catch { /* next */ }
		}
		if (!actualPath) {
			console.log(`⚠️  File not found for resource: ${resource.uri}`);
			continue;
		}

		const plainText = await fileToPlainText(actualPath);
		const chunks = await semanticChunk(plainText, embedPassageBatch, {
			maxChars: CHUNK_LEN,
			similarityThreshold: SIM_THRESHOLD,
		});
		processed++;
		console.log(`🔄 [${processed}] ${resource.uri} (${chunks.length} chunks)`);

		// Re-embed the final chunks (the chunk vector ≠ mean of its sentences).
		const vectors = await embedPassageBatch(chunks);
		for (let i = 0; i < chunks.length; i++) {
			rows.push({
				id: `${resource.uri}--${i}`,
				vector: vectors[i],
				text: chunks[i],
				uri: resource.uri,
				title: resource.title,
				index: i,
			});
		}
	}

	if (rows.length === 0) {
		console.error('💥 No rows produced; aborting (nothing to index).');
		process.exit(1);
	}
	console.log(`🧮 Total chunks embedded: ${rows.length}`);

	// Write the LanceDB table (overwrite) + FTS index for BM25.
	await fs.mkdir(OUT_DIR, { recursive: true });
	const db = await lancedb.connect(OUT_DIR);
	console.log(`💾 Writing table "${COLLECTION_NAME}" to ${OUT_DIR} ...`);
	const tbl = await db.createTable(COLLECTION_NAME, rows, { mode: 'overwrite' });
	console.log('🔤 Creating full-text (BM25) index on "text" ...');
	await tbl.createIndex('text', { config: lancedb.Index.fts() });

	const count = await tbl.countRows();
	console.log(`🎉 Done. ${count} rows indexed at ${path.resolve(OUT_DIR)}/${COLLECTION_NAME}.lance`);
}

indexFiles().catch((err) => {
	console.error('💥 Error:', err);
	process.exit(1);
});
