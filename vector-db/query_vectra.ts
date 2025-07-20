// test_vectra.ts
// Simple test to verify that the Vectra database is working correctly

import { LocalIndex } from 'vectra';
import * as path from 'path';
import OpenAI from 'openai';
import embeddings from '@themaximalist/embeddings.js';
import 'dotenv/config';


const DB_DIR = path.resolve('./');
const index = new LocalIndex(DB_DIR);

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

async function initDatabase(): Promise<Boolean> {
	// Check if index exists
	const exists = await index.isIndexCreated();
	console.log(`📦 Index exists: ${exists}`);

	if (!exists) {
		console.log('❌ No database found');
		return false;
	}
	return true;
}

async function testDatabase() {
  try {
	if (await initDatabase() === false) {
		return;
	}

	console.log('🔍 Testing Vectra database...');
	
	// Get all items
	const items = await index.listItems();
	console.log(`📊 Total items in database: ${items.length}`);
	
	// Show a sample of items
	if (items.length > 0) {
	  console.log('\n📋 Sample items:');
	  for (let i = 0; i < Math.min(5, items.length); i++) {
		const item = items[i];
		console.log(`  ${i + 1}. ID: ${item.metadata?.id}`);
		console.log(`     URI: ${item.metadata?.uri}`);
		console.log(`     Title: ${item.metadata?.title}`);
		console.log(`     Doc: ${String(item.metadata?.document).substring(0, 100)}...`);
		console.log('');
	  }
	}
	
	console.log('✅ Database test completed successfully');
	
  } catch (error) {
	console.error('💥 Database test failed:', error);
  }
}

async function getVector(text: string) {
/*	const model = process.env.EMBED_MODEL ?? 'text-embedding-3-small';
	const response = await openai.embeddings.create({
		'model': model,
		'input': text,
	});
	return response.data[0].embedding;
*/
	const response = await embeddings(text);
	if (!response || !Array.isArray(response) || response.length === 0) {
		throw new Error('Failed to generate embedding vector');
	}
	return response;
}

async function query(text: string) {
	if (await initDatabase() === false) {
		return;
	}
	
	const vector = await getVector(text);
	console.log(`🔍 Querying for: ${text}`);
	
	try {
		const results = await index.queryItems(vector, text, 5);
		if (results.length > 0) {
			console.log(`📊 Found ${results.length} results:\n`);
			for (let i = 0; i < results.length; i++) {
				const result = results[i];
				const score = result.score.toFixed(4);
				const id = result.item.metadata?.id || 'unknown';
				const uri = result.item.metadata?.uri || 'unknown';
				const title = result.item.metadata?.title || 'unknown';
				const document = String(result.item.metadata?.document || '');
				
				console.log(`${i + 1}. [Score: ${score}] ${id}`);
				console.log(`   File: ${title}`);
				console.log(`   URI:  ${uri}`);
				console.log(`   Text: ${document}...`);
				console.log('');
			}
		} else {
			console.log(`❌ No results found.`);
		}
	} catch (error) {
		console.error('💥 Query failed:', error);
	}
}

if (process.argv.length > 2) {
	// Join the arguments into a single string
	const testString = process.argv.slice(2).join(' ');
	query(testString).catch(error => {
		console.error('Error during query:', error);
	});
} else {
	testDatabase();
}
