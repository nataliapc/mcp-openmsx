/**
 * Local text embedding engine.
 *
 * Uses onnxruntime-node + @anush008/tokenizers (both prebuilt napi, no `sharp`)
 * to run the multilingual model `multilingual-e5-small` fully offline.
 *
 * The ONNX weights + tokenizer are downloaded on first use from the
 * HuggingFace Hub and cached on disk. The same module is the single source of
 * truth for embeddings in both generation (vector-db) and query (server).
 *
 * Model notes (e5):
 *  - MEAN pooling over masked token embeddings + L2 normalization. Do NOT
 *    switch to CLS pooling — it would silently degrade retrieval quality.
 *  - e5 is trained with asymmetric prefixes: queries must be prefixed with
 *    "query: " and documents/passages with "passage: ". Use `embedQuery` for
 *    search input and `embedPassage` for indexed text. The prefix is only used
 *    to compute the vector; it is never stored.
 *  - max_seq_length = 512 (enough for ~400-token semantic chunks).
 *
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import * as ort from 'onnxruntime-node';
import { Tokenizer } from '@anush008/tokenizers';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const MODEL_REPO = 'Xenova/multilingual-e5-small';
// int8 ONNX is fastest on CPU; the GPU uses the fp32 ONNX (CUDA has no
// efficient kernels for dynamic-quantized ops, so the int8 model falls back to
// CPU even under the CUDA provider). fp32 (not fp16) is used on GPU so the
// output stays Float32Array — the fp16 model emits float16 output that the
// pooling code cannot read directly. The file is chosen per provider.
const ONNX_FILE_CPU = 'onnx/model_quantized.onnx';
const ONNX_FILE_GPU = 'onnx/model.onnx';
const TOKENIZER_FILE = 'tokenizer.json';
const HF_BASE = `https://huggingface.co/${MODEL_REPO}/resolve/main`;

/** Embedding dimensionality of the model. */
export const EMBEDDING_DIM = 384;
/** Model max sequence length (e5 max_seq_length). */
const MAX_LENGTH = 512;

interface Engine {
	session: ort.InferenceSession;
	tokenizer: Tokenizer;
}

export type EmbedProvider = 'cpu' | 'cuda';

let enginePromise: Promise<Engine> | null = null;

// Server-safe default: the MCP server NEVER downloads or runs the large fp32
// model. Only an explicit setEmbedProvider('cuda') — used by the offline index
// generator — can opt into the GPU. The server never calls it, so it stays int8.
let requestedProvider: EmbedProvider = 'cpu';

/**
 * Select the embedding execution provider. Must be called before the first
 * embedding. Only the index generator should request 'cuda'; the MCP server
 * leaves the default ('cpu' / int8) so end users only ever download the 118 MB
 * quantized model.
 */
export function setEmbedProvider(provider: EmbedProvider): void {
	if (enginePromise) {
		throw new Error('setEmbedProvider must be called before the first embedding');
	}
	requestedProvider = provider;
}

/** Resolve the on-disk cache directory for the model files. */
function getCacheDir(): string {
	const base =
		process.env.OPENMSX_MODELS_CACHE ||
		process.env.HF_HOME ||
		process.env.TRANSFORMERS_CACHE ||
		path.join(os.homedir(), '.cache', 'mcp-openmsx');
	return path.join(base, 'models', MODEL_REPO.replace('/', '__'));
}

/** Download a single file from the HF Hub to dest if not already present. */
async function downloadFile(remote: string, dest: string): Promise<void> {
	if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
		return;
	}
	await fs.promises.mkdir(path.dirname(dest), { recursive: true });
	const url = `${HF_BASE}/${remote}`;
	const res = await fetch(url);
	if (!res.ok || !res.body) {
		throw new Error(`Failed to download model file ${url}: ${res.status} ${res.statusText}`);
	}
	const buffer = Buffer.from(await res.arrayBuffer());
	// Write atomically: tmp file + rename, so a crash mid-download cannot leave
	// a truncated file that later looks "present".
	const tmp = `${dest}.download`;
	await fs.promises.writeFile(tmp, buffer);
	await fs.promises.rename(tmp, dest);
}

/** Download a specific ONNX file + tokenizer if missing; returns the onnx path. */
async function ensureFiles(onnxFile: string): Promise<{ onnxPath: string; tokenizerPath: string }> {
	const dir = getCacheDir();
	const onnxPath = path.join(dir, onnxFile);
	const tokenizerPath = path.join(dir, TOKENIZER_FILE);
	await Promise.all([
		downloadFile(onnxFile, onnxPath),
		downloadFile(TOKENIZER_FILE, tokenizerPath),
	]);
	return { onnxPath, tokenizerPath };
}

const baseSessionOptions = {
	graphOptimizationLevel: 'all' as const,
	intraOpNumThreads: Math.max(1, os.cpus().length),
	interOpNumThreads: 1,
	executionMode: 'sequential' as const,
};

/** Probe whether the CUDA provider can actually be created, using the small
 *  int8 model already on disk (avoids downloading the 470 MB fp32 model just to
 *  find out CUDA is unavailable). Returns true only if a CUDA session loads. */
async function cudaAvailable(probeOnnxPath: string): Promise<boolean> {
	try {
		const probe = await ort.InferenceSession.create(probeOnnxPath, {
			...baseSessionOptions,
			executionProviders: ['cuda'],
		});
		await (probe as unknown as { release?: () => Promise<void> }).release?.();
		return true;
	} catch {
		return false;
	}
}

/**
 * Lazily initialize the ONNX session + tokenizer (singleton).
 *
 * The int8 model is always fetched first: it is the server default, the
 * fallback, and the cheap CUDA probe. The large fp32 model is downloaded ONLY
 * when 'cuda' was explicitly requested AND CUDA is confirmed available — so the
 * server (which never requests 'cuda') can never pull the fp32 model.
 */
function getEngine(): Promise<Engine> {
	if (!enginePromise) {
		enginePromise = (async () => {
			const { onnxPath: int8Path, tokenizerPath } = await ensureFiles(ONNX_FILE_CPU);
			const tokenizer = Tokenizer.fromFile(tokenizerPath);
			tokenizer.setTruncation(MAX_LENGTH);

			if (requestedProvider === 'cuda') {
				if (await cudaAvailable(int8Path)) {
					// CUDA confirmed → only now download + load the fp32 model.
					const { onnxPath: fp32Path } = await ensureFiles(ONNX_FILE_GPU);
					const session = await ort.InferenceSession.create(fp32Path, {
						...baseSessionOptions,
						executionProviders: ['cuda'],
					});
					process.stderr.write('[embedder] using CUDA execution provider (fp32)\n');
					return { session, tokenizer };
				}
				process.stderr.write('[embedder] CUDA requested but unavailable; using CPU (int8)\n');
			}

			const session = await ort.InferenceSession.create(int8Path, baseSessionOptions);
			return { session, tokenizer };
		})().catch((err) => {
			// Reset so a transient failure (e.g. network) can be retried.
			enginePromise = null;
			throw err;
		});
	}
	return enginePromise;
}

/**
 * Default batch size for batched inference.
 */
const BATCH_SIZE = 32;
// XLM-RoBERTa / e5 pad token id. Padded positions get attention_mask 0, so the
// exact id is irrelevant to the pooled result; it only fills the tensor.
const PAD_ID = 1n;

/**
 * Embed a list of already-prefixed inputs in batches (one ONNX run per batch,
 * dynamic padding to the longest sequence in the batch). Returns one
 * 384-dimension, L2-normalized vector per input (mean pooling over masked
 * tokens). Batching is essential for throughput when embedding many sentences.
 */
async function embedRawBatch(inputs: string[], batchSize: number = BATCH_SIZE): Promise<number[][]> {
	if (inputs.length === 0) {
		return [];
	}
	const { session, tokenizer } = await getEngine();
	const hasTokenTypes = session.inputNames.includes('token_type_ids');
	const results: number[][] = [];

	for (let start = 0; start < inputs.length; start += batchSize) {
		const batch = inputs.slice(start, start + batchSize);
		const encodings = await Promise.all(batch.map((t) => tokenizer.encode(t)));
		const idsArr = encodings.map((e) => e.getIds());
		const maskArr = encodings.map((e) => e.getAttentionMask());

		const B = batch.length;
		const maxLen = Math.min(MAX_LENGTH, Math.max(...idsArr.map((a) => a.length)));

		const flatIds = new BigInt64Array(B * maxLen);
		const flatMask = new BigInt64Array(B * maxLen);
		for (let r = 0; r < B; r++) {
			const ids = idsArr[r];
			const mask = maskArr[r];
			const len = Math.min(ids.length, maxLen);
			const rowBase = r * maxLen;
			for (let c = 0; c < len; c++) {
				flatIds[rowBase + c] = BigInt(ids[c]);
				flatMask[rowBase + c] = BigInt(mask[c]);
			}
			for (let c = len; c < maxLen; c++) {
				flatIds[rowBase + c] = PAD_ID;
				flatMask[rowBase + c] = 0n;
			}
		}

		const feeds: Record<string, ort.Tensor> = {
			input_ids: new ort.Tensor('int64', flatIds, [B, maxLen]),
			attention_mask: new ort.Tensor('int64', flatMask, [B, maxLen]),
		};
		if (hasTokenTypes) {
			feeds.token_type_ids = new ort.Tensor('int64', new BigInt64Array(B * maxLen), [B, maxLen]);
		}

		const output = await session.run(feeds);
		const hidden = output['last_hidden_state'] ?? output[session.outputNames[0]];
		const data = hidden.data as Float32Array;
		const dim = hidden.dims[hidden.dims.length - 1] as number;

		for (let r = 0; r < B; r++) {
			const pooled = new Array<number>(dim).fill(0);
			let count = 0;
			for (let t = 0; t < maxLen; t++) {
				if (flatMask[r * maxLen + t] === 0n) {
					continue;
				}
				count++;
				const base = (r * maxLen + t) * dim;
				for (let d = 0; d < dim; d++) {
					pooled[d] += data[base + d];
				}
			}
			const denom = Math.max(count, 1);
			let norm = 0;
			for (let d = 0; d < dim; d++) {
				pooled[d] /= denom;
				norm += pooled[d] * pooled[d];
			}
			norm = Math.max(Math.sqrt(norm), 1e-12);
			for (let d = 0; d < dim; d++) {
				pooled[d] /= norm;
			}
			results.push(pooled);
		}
	}
	return results;
}

/** Embed a search query (e5 "query: " prefix). */
export async function embedQuery(text: string): Promise<number[]> {
	return (await embedRawBatch([`query: ${text}`]))[0];
}

/** Embed a document/passage to be indexed (e5 "passage: " prefix). */
export async function embedPassage(text: string): Promise<number[]> {
	return (await embedRawBatch([`passage: ${text}`]))[0];
}

/** Batch-embed passages (e5 "passage: " prefix). One ONNX run per batch. */
export function embedPassageBatch(texts: string[]): Promise<number[][]> {
	return embedRawBatch(texts.map((t) => `passage: ${t}`));
}

/** Default embedding = query side (kept for backward compatibility). */
export const embed = embedQuery;
