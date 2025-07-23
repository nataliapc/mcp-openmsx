/**
 * Vector Database wrapper class
 * 
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import path from 'path';
import { LocalIndex, QueryResult } from 'vectra';
import embeddings from '@themaximalist/embeddings.js';


export class VectorDB {
	private static instance: VectorDB;
	private static vectorDbDir: string = path.join('..', 'vector-db');
	private index: LocalIndex;

	static getInstance(): VectorDB
	{
		if (!VectorDB.instance) {
			VectorDB.instance = new VectorDB();
		}
		return VectorDB.instance;
	}

	static setIndexDirectory(dbDir: string)
	{
		VectorDB.vectorDbDir = dbDir;
	}

	private constructor(dbDir: string = VectorDB.vectorDbDir)
	{
		this.index = new LocalIndex(dbDir);
		if (!this.initDatabase()) {
			throw new Error('Failed to initialize VectorDB: Index does not exist');
		}
	}

	private async initDatabase(): Promise<Boolean>
	{
		return await this.index.isIndexCreated();
	}

	private async getVector(text: string): Promise<number[]>
	{
		const response = await embeddings(text);
		if (!response || !Array.isArray(response) || response.length === 0) {
			throw new Error('Failed to generate embedding vector');
		}
		return response;
	}

	async query(text: string): Promise<object[]>
	{
		const vector = await this.getVector(text);
		let results: QueryResult[] = [];

		try {
			results = await this.index.queryItems(vector, text, 10);
			if (results.length > 0) {
				return results.map(result => {
					return {
						score: result.score.toFixed(4),
						uri: result.item.metadata?.uri || 'unknown',
						title: result.item.metadata?.title || 'unknown',
						document: String(result.item.metadata?.document || ''),
						id: result.item.metadata?.id || 'unknown',
					};
				});
			}
		} catch (error) {
			throw new Error(`Query failed: ${error}`);
		}
		return results;
	}
}