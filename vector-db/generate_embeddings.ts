// generate_embeddings.ts
// ===============================================================
// Generates a portable **Vectra** embedded vector database from .md, .txt, .html files
// Vectra stores everything locally in files, perfect for MCP server embedding
// ---------------------------------------------------------------
//  npm install vectra openai dotenv fast-glob remove-markdown cheerio gray-matter sanitize-html
// ---------------------------------------------------------------
//  Usage:
//    npx tsx generate_embeddings.ts --src ./docs --collection openmsx-docs --chunk 300 --overlap 50
//  Options:
//    --src <path>        Source directory to scan (default: ./mcp-server/resources/)
//    --collection <name> Collection name (default: msxdocs)
//    --chunk <size>      Chunk size in characters (default: 400)
//    --overlap <size>    Overlap size between chunks (default: 50)
// ---------------------------------------------------------------
//  Required environment variables:
//    OPENAI_API_KEY   → your API key
//    EMBED_MODEL      → optional (default text-embedding-3-small)
// ===============================================================

import { LocalIndex } from 'vectra';
import OpenAI from 'openai';
import embeddings from '@themaximalist/embeddings.js';
import fg from 'fast-glob';
import * as fs from 'fs/promises';
import * as fssync from 'fs';
import * as path from 'path';
import removeMd from 'remove-markdown';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import sanitizeHtml from 'sanitize-html';
import 'dotenv/config';
import { OpenAIEmbedding, chunkit } from '@elpassion/semantic-chunking';
import { encoding_for_model } from 'tiktoken';


// ---------- CLI args ----------
const args = Object.fromEntries(
	process.argv.slice(2).map((arg) => {
		if (arg.startsWith('--')) {
			const [k, v] = arg.replace(/^--/, '').split('=');
			return [k, v ?? true];
		}
		return [arg, true];
	})
);

// Handle --src argument properly
let SRC_DIR = '../mcp-server/resources/';
let COLLECTION_NAME = 'msxdocs';
let CHUNK_LEN = 400;
let OVERLAP_LEN = 50; // Default overlap of 50 characters

// Parse arguments manually for better handling
for (let i = 0; i < process.argv.length; i++) {
	if (process.argv[i] === '--src' && i + 1 < process.argv.length) {
		SRC_DIR = process.argv[i + 1];
	} else if (process.argv[i] === '--collection' && i + 1 < process.argv.length) {
		COLLECTION_NAME = process.argv[i + 1];
	} else if (process.argv[i] === '--chunk' && i + 1 < process.argv.length) {
		CHUNK_LEN = Number(process.argv[i + 1]);
	} else if (process.argv[i] === '--overlap' && i + 1 < process.argv.length) {
		OVERLAP_LEN = Number(process.argv[i + 1]);
	}
}

const DB_DIR = path.resolve('./');

// ---------- OpenAI & Vectra ----------
const openai = new OpenAI({ 
	apiKey: process.env.OPENAI_API_KEY 
});

// Create vector database directory
if (!fssync.existsSync(DB_DIR)) {
	fssync.mkdirSync(DB_DIR, { recursive: true });
}
// Initialize Vectra index (embedded vector database)
const index = new LocalIndex(DB_DIR);

// ---------- Utilities ----------
function calculateTokens(text: string): number {
	// Calculate exact tokens count with tiktoken
	const encoding = encoding_for_model('text-embedding-3-small');
	const tokens = encoding.encode(text);
	encoding.free(); // Important: free the encoding to prevent memory leaks
	return tokens.length;
}

async function getEmbedding(text: string): Promise<number[]> {
	const tokensCount = calculateTokens(text);
	
	if (tokensCount > 8000) { // Conservative limit
		console.warn(`⚠️  Chunk too long (${tokensCount} estimated tokens). Truncating...`);
		text = text.substring(0, 8000 * 4); // Truncate to ~8000 tokens
	}
	const response = await embeddings(text);
	return response;
}

function stripHtml(html: string): string {
	const clean = sanitizeHtml(html, {
		allowedTags: [],
		allowedAttributes: {},
	});
	return cheerio.load(clean).text();
}

async function fileToPlainText(filePath: string): Promise<string> {
	const raw = await fs.readFile(filePath, 'utf-8');
	const ext = path.extname(filePath).toLowerCase();
	
	switch (ext) {
		case '.md':
		case '.markdown': {
			const { content } = matter(raw); // Remove front-matter YAML
			return removeMd(content);
		}
		case '.html':
		case '.htm':
			return stripHtml(raw);
		default:
			return raw;
	}
}

async function splitText(text: string, maxLen = CHUNK_LEN, overlapLen = OVERLAP_LEN): Promise<string[]> {
	const model = new OpenAIEmbedding(openai);
	await model.initialize('text-embedding-3-small');

	const myChunks = await chunkit(
		[{document_text: text}], model, {
			maxTokenSize: 400,
			similarityThreshold: 0.5,
			combineChunks: true,
			combineChunksSimilarityThreshold: 0.5
		}
	);
	return myChunks.map((chunk: { text: string }) => chunk.text);
}


// ---------- Main Indexer ----------
async function indexFiles() {
	try {
		// Initialize the vector index
		if (!await index.isIndexCreated()) {
			console.log('🔧 Creating new vector index...');
			await index.createIndex();
			console.log('✅ Vector index created successfully');
		} else {
			console.log('📦 Using existing vector index');
		}
	} catch (error) {
		console.error('💥 Failed to initialize vector index:', error);
		console.log('🧹 Cleaning up and recreating index...');
		
		// Clean up any corrupted index files
		const indexFiles = await fg(['*.json', '*.bin'], { cwd: DB_DIR, absolute: true });
		for (const file of indexFiles) {
			try {
				await fs.unlink(file);
				console.log(`   Deleted: ${path.basename(file)}`);
			} catch (err) {
				console.warn(`   Failed to delete ${file}:`, err);
			}
		}
		
		// Recreate the index
		await index.createIndex();
		console.log('✅ Vector index recreated successfully');
	}

	console.log(`📂 Scanning "${SRC_DIR}" for toc.json files...`);
	const tocFiles = await fg(['**/toc.json'], { cwd: SRC_DIR, absolute: true });
	const vectorFiles = await fg(['**/_toc.json'], { cwd: SRC_DIR, absolute: true });
	tocFiles.push(...vectorFiles);
	console.log(`🔍 Found ${tocFiles.length} toc.json files`);

	// Get existing items and check for complete resources using lastChunk metadata
	const existingItems = new Map<string, any[]>();
	const processedResources = new Set<string>();
	
	try {
		const allItems = await index.listItems();

		// Group items by URI and check for completion
		for (const item of allItems) {
			if (item.metadata?.uri) {
				const uri = item.metadata.uri as string;
				if (!existingItems.has(uri)) {
					existingItems.set(uri, []);
				}
				existingItems.get(uri)!.push(item);
				
				// If this chunk has lastChunk=true, the resource is complete
				if (item.metadata.lastChunk === true) {
					processedResources.add(uri);
				}
			}
		}

		console.log(`📊 Found ${allItems.length} existing vectors for ${existingItems.size} resources`);
		console.log(`✅ Complete resources (with lastChunk): ${processedResources.size}`);
	} catch (error) {
		console.log('❌ No existing items found, starting fresh.');
	}

	// Parse all toc.json files and collect resources
	const allResources: Array<{uri: string, title: string, description: string, sectionName: string, filePath?: string}> = [];

	let tocCount = 0;
	for (const tocFile of tocFiles) {
		tocCount++;
		const sectionName = path.basename(path.dirname(tocFile));
		console.log(`📖 [${tocCount}] Reading ${path.parse(tocFile).base} from section: ${sectionName}`);

		try {
			const tocContent = JSON.parse(await fs.readFile(tocFile, 'utf8'));

			if (tocContent.toc && Array.isArray(tocContent.toc)) {
				for (const item of tocContent.toc) {
					// For local files, determine the file path
					const itemName = path.parse(item.uri.split('/').pop() || '').base;
					let filePath: string | undefined;
					if (item.uri.startsWith(`${COLLECTION_NAME}://`)) {
						// Local resource - extract the filename from the URI
						filePath = path.join(path.dirname(tocFile), itemName);
					}

					allResources.push({
						uri: item.uri,
						title: item.title,
						description: item.description || '',
						sectionName,
						filePath
					});
				}
			}
		} catch (error) {
			console.error(`❌ Failed to parse ${tocFile}:`, error);
			continue;
		}
	}

	console.log(`📋 Total resources found: ${allResources.length}`);
	
	// Determine which resources need processing
	const resourcesToProcess: Array<{uri: string, title: string, description: string, sectionName: string, filePath?: string, isIncomplete?: boolean}> = [];
	
	for (const resource of allResources) {
		const existingChunks = existingItems.get(resource.uri) || [];
		
		if (processedResources.has(resource.uri)) {
			// Resource is complete (has lastChunk=true)
			continue;
		} else if (existingChunks.length > 0) {
			// Resource has chunks but no lastChunk=true, so it's incomplete
			console.log(`⚠️  Incomplete resource detected: ${resource.uri} (${existingChunks.length} chunks, no lastChunk marker)`);
			console.log(`🧹 Cleaning up existing chunks for: ${resource.uri}`);
			
			// Delete existing chunks for this resource
			for (const chunk of existingChunks) {
				try {
					await index.deleteItem(chunk.id);
				} catch (error) {
					console.warn(`   Failed to delete chunk ${chunk.id}:`, error);
				}
			}
			
			resourcesToProcess.push({...resource, isIncomplete: true});
		} else {
			// New resource, no chunks exist
			resourcesToProcess.push(resource);
		}
	}
	
	const completeResources = processedResources.size;
	const incompleteResources = resourcesToProcess.filter(r => r.isIncomplete).length;
	const newResources = resourcesToProcess.filter(r => !r.isIncomplete).length;
	
	console.log(`📋 Resources status:`);
	console.log(`   ✅ Complete: ${completeResources}`);
	console.log(`   🔄 Incomplete (will reprocess): ${incompleteResources}`);
	console.log(`   🆕 New: ${newResources}`);
	console.log(`   📝 Total to process: ${resourcesToProcess.length}`);

	if (resourcesToProcess.length === 0) {
		console.log(`✨ All resources are complete and processed`);
		const totalItems = await index.listItems();
		console.log(`📊 Total vectors in the database: ${totalItems.length}`);
		return;
	}

	// Process each resource that needs processing
	for (const resource of resourcesToProcess) {
		let plainText = '';
		
		try {
			if (resource.uri.startsWith('http://') || resource.uri.startsWith('https://')) {
				// For HTTP URLs, we'll skip them for now as they need special handling
				console.log(`⏭️  Skipping HTTP resource: ${resource.uri}`);
				continue;
			} else if (resource.uri.startsWith(`${COLLECTION_NAME}://`) && resource.filePath) {
				// For local resources, try to find the file
				const extensions = ['.md', '.markdown', '.txt', '.html', '.htm'];
				let actualFilePath = resource.filePath;
				
				// Try to find the file with various extensions
				let fileFound = false;
				for (const ext of extensions) {
					const testPath = actualFilePath + ext;
					try {
						await fs.access(testPath);
						actualFilePath = testPath;
						fileFound = true;
						break;
					} catch (err) {
						// File doesn't exist with this extension, try next
					}
				}
				
				if (!fileFound) {
					console.log(`⚠️  File not found for resource: ${resource.uri} (tried: ${actualFilePath})`);
					continue;
				}
				
				plainText = await fileToPlainText(actualFilePath);
			} else {
				console.log(`⏭️  Skipping unsupported resource: ${resource.uri} (URI: ${resource.uri})`);
				continue;
			}
			
			const chunks = await splitText(plainText);
			
			const statusPrefix = resource.isIncomplete ? '🔄🔄 Reprocessing' : '🔄 Processing';
			console.log(`${statusPrefix}: ${resource.uri} (${chunks.length} chunks)`);

			for (let i = 0; i < chunks.length; i++) {
				const chunk = chunks[i];
				const embedding = await getEmbedding(chunk);
				
				// Mark the last chunk with lastChunk=true
				const isLastChunk = i === chunks.length - 1;
				
				try {
					await index.insertItem({
						vector: embedding,
						metadata: {
							id: `${resource.uri}--${i}`,
							document: chunk,
							uri: resource.uri, // Use the original URI from toc.json
							title: resource.title,
							index: i,
							lastChunk: isLastChunk // Mark the last chunk
						}
					});
					
					console.log(`   ✅ ${resource.uri} [chunk ${i + 1}/${chunks.length}] indexed ${calculateTokens(chunk)} tokens ${isLastChunk ? '(LAST)' : ''}`);
				} catch (error) {
					console.error(`   ❌ Failed to index chunk ${i + 1} of ${resource.uri}:`, error);
					// Continue with next chunk instead of failing completely
					continue;
				}
			}

			console.log(`   💾 Progress saved for ${resource.uri}`);
			
		} catch (error) {
			console.error(`   ❌ Failed to process resource ${resource.uri}:`, error);
			continue;
		}
	}

	const finalCount = await index.listItems();
	console.log(`🎉 Vector database completed. Saved at: ${DB_DIR}`);
	console.log(`📊 Total vectors processed: ${finalCount.length}`);
}

indexFiles().catch((err) => {
	console.error('💥 Error:', err);
	process.exit(1);
});
