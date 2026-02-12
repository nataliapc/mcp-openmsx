/**
 * Utils functions for mcp-openmsx
 * 
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import { gunzipSync } from 'zlib';
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { PACKAGE_VERSION } from "./server.js";
import sanitizeHtml from 'sanitize-html';

import { existsSync } from "fs";
import os from "os";


/**
 * Detect the openMSX share directory by checking various methods
 * @returns string - The detected share directory or an empty string if not found
 */
export function detectOpenMSXShareDir(): string {
	try {
		// Check standard locations
		const possiblePaths = [
			// Linux paths
			path.join(os.homedir(), '.openMSX', 'share'),
			'/usr/local/share/openmsx',
			'/usr/share/openmsx',
			// Windows paths
			path.join(os.homedir(), 'Documents', 'openMSX', 'share'),
			path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'openMSX', 'share'),
			// macOS paths
			path.join(os.homedir(), 'Library', 'Application Support', 'openMSX', 'share'),
			'/Applications/openMSX.app/Contents/Resources/share',
		];

		for (const dirPath of possiblePaths) {
			if (existsSync(dirPath) && existsSync(path.join(dirPath, 'machines'))) {
				return dirPath;
			}
		}
	} catch (error) {
		console.error('Error detecting openMSX share directory:', error);
	}
	return '';
}

/**
 * Extract description from XML file
 * @param filePath - Full path to the XML file
 * @returns Promise<string> - The description found in the XML file, or a default message
 */
export async function extractDescriptionFromXML(filePath: string): Promise<string> {
	try {
		const xmlContent = await fs.readFile(filePath, 'utf-8');
		
		// Extract description from XML
		const descriptionMatch = xmlContent.match(/<description>(.*?)<\/description>/);
		return descriptionMatch ? descriptionMatch[1] : 'No description available';
	} catch (error) {
		return 'Error reading description';
	}
}

/**
 * Add file extension to a file path if it exists in the same directory and determine its MIME type
 * @param filePath - Full path to the file excluding extension
 * @returns Promise<string[]> - An array containing the MIME type and the full file path with extension
 */
export async function addFileExtension(filePath: string): Promise<string[]>
{
	// Get directory and filename
	const directory = path.dirname(filePath);
	const filename = path.basename(filePath);
	
	try {
		// Get all files in directory that start with our filename
		const files = await fs.readdir(directory);
		const matchingFiles = files.filter(file => file.startsWith(filename));
		
		if (matchingFiles.length > 0) {
			const fileFound = path.join(directory, matchingFiles[0]);
			return [
				mime.lookup(fileFound) || 'text/plain',
				fileFound
			];
		}
	} catch (error) {
		console.error('Error reading directory:', error);
	}
	
	// Return original if no matches found
	return [ 'text/plain', filePath ];
}

/**
 * List all folders and subfolders in the resources directory
 * @param resourcesDir - Path to the resources directory
 * @returns Promise<string[]> - List of folder names in the resources directory
 */
export async function listResourcesDirectory(resourcesDir: string): Promise<string[]>
{
	try {
		const directories = await fs.readdir(resourcesDir, { withFileTypes: true, recursive: true });
		const folderNames = directories
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
		return folderNames;
	} catch (error) {
		console.error("Error reading resources directory:", error);
		return [];
	}
}

/**
 * Fetch a webpage and return its content (without scripts, styles, or links) and its MIME type
 * @param url - URL of the webpage to fetch
 * @returns Promise<[string, string]> - A tuple containing the webpage content and its MIME type
 */
export async function fetchCleanWebpage(url: string): Promise<[string, string]> {
	let resourceContent: string;
	let mimeType = 'text/plain';

	try {
		const response = await fetch(url, {
			headers: {
				// Accept compressed content gzip/deflate
				'Accept-Encoding': 'gzip, deflate, br',
				// User agent to avoid blocking by some servers
				'User-Agent': `Mozilla/5.0 (compatible; MCP-openMSX/${PACKAGE_VERSION})`
			}
		});

		if (response.status === 200) {
			mimeType = response.headers.get('content-type') || 'text/plain';
			const contentType = response.headers.get('content-type') || '';
			if (contentType.includes('x-gzip') || contentType.includes('gzip')) {
				const arrayBuffer = await response.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);
				if (uint8Array[0] === 0x1f && uint8Array[1] === 0x8b) {
					try {
						const decompressed = gunzipSync(Buffer.from(uint8Array));
						resourceContent = decompressed.toString('utf8');
						mimeType = 'text/html';
					} catch (error) {
						resourceContent = new TextDecoder().decode(uint8Array);
						mimeType = 'text/html';
					}
				} else {
					resourceContent = new TextDecoder().decode(uint8Array);
					mimeType = 'text/html';
				}
			} else {
				// Normal case, use response.text() which automatically handles decompression
				resourceContent = await response.text();
			}
		} else {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		// Remove script, style, form, and link tags from the content if it's HTML
		if (mimeType.startsWith('text/html')) {
			resourceContent = sanitizeHtml(resourceContent);
		}
	} catch (error) {
		// Throw exception (MCP protocol requirement)
		throw new Error(`Error fetching resource from ${url}: ${error instanceof Error ? error.message : String(error)}`);
	}

	return [resourceContent, mimeType];
}

/**
 * Decode HTML entities in a string to plain text
 * @param text - String containing HTML entities
 * @returns string - String with HTML entities decoded
 */
export function decodeHtmlEntities(text: string): string {
	const htmlEntities: Record<string, string> = {
		'&lt;': '<',
		'&gt;': '>',
		'&amp;': '&',
		'&quot;': '"',
		'&nbsp;': ' ',
		'&#x27;': "'",
		'&#x2F;': '/',
		'&#x60;': '`',
		'&#x3D;': '=',
		'&apos;': "'",
		'&#39;': "'",
		'&#47;': '/',
		'&#96;': '`',
		'&#61;': '=',
		'&#x0a;': '\n',
		'&#x0A;': '\n',
		'&#10;': '\n',
		'&#13;': '\r',
		'&#9;': '\t'
	};
	return text.replace(/&[#\w]+;/g, (entity) => {
		return htmlEntities[entity] || entity;
	});
}

/**
 * Encode a plain text to HTML entities, also escaping characters with ASCII >= 127
 * @param text - String to encode
 * @returns string - String with HTML entities encoded
 */
export function encodeHtmlEntities(text: string): string {
	const htmlEntities: Record<string, string> = {
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;',
		'"': '&quot;',
		"'": '&apos;',
		'=': '&#61;',
		'/': '&#47;',
	};
	return text.replace(/[\u00A0-\uFFFF<>&"'`=\/]/g, (char) => {
		if (htmlEntities[char]) {
			return htmlEntities[char];
		}
		const code = char.charCodeAt(0);
		if (code >= 127) {
			return `&#${code};`;
		}
		return char;
	});
}

/**
 * Encode a string for BASIC program input, escaping special characters
 * @param text - String to encode
 * @returns string - Encoded string with special characters escaped
 */
export function encodeTypeText(text: string): string {
	const replacementMap: Record<string, string> = {
		'\r': '\\r',
		'\t': '\\t',
		'"':  '\\"',
	};
	return text.replace(/[\r\t"]/g, (char) => {
		if (replacementMap[char]) {
			return replacementMap[char];
		}
		return char;
	});
}

/**
 * Check if a response is an error response
 * @param response - The response string to check
 * @returns boolean - True if the response indicates an error, false otherwise
 */
export function isErrorResponse(response: string): boolean {
	return response.startsWith('Error:') || response.startsWith('error:');
}

/**
 * Get the content of a response, formatting it as a CallToolResult
 * @param response - Array of strings representing the response lines
 * @param isError - Optional boolean indicating if the response is an error
 * @returns CallToolResult - Formatted response content
 */
export function getResponseContent(response: string[], isError: boolean = false): CallToolResult
{
	// Check if any response line starts with "Error:" to automatically set isError to true
	const hasError = isError || response.some(line => isErrorResponse(line));
	return {
		content: response.map(line => ({
				type: "text",
				text: line == '' ? "Ok" : line,
			})
		),
		isError: hasError
	};
}

/**
 * Parse the output of the openMSX 'cpuregs' TCL command into a structured object.
 * The output format is:
 *   AF =0044  BC =0000  DE =0000  HL =F380
 *   AF'=0000  BC'=0000  DE'=0000  HL'=0000
 *   IX =0000  IY =0000  PC =632F  SP =F37E
 *   I  =00    R  =5D    IM =01    IFF=01
 * @param response - Raw text response from the cpuregs command
 * @returns Record mapping register names to hex values
 */
export function parseCpuRegs(response: string): Record<string, string> {
	const registers: Record<string, string> = {};
	const regex = /(\w+'?)\s*=\s*([0-9a-fA-F]+)/g;
	let match;
	while ((match = regex.exec(response)) !== null) {
		registers[match[1]] = match[2];
	}
	return registers;
}

/**
 * Check if a CPU register name corresponds to a 16-bit register.
 * @param register - Register name (e.g. 'pc', 'a', 'ix')
 * @returns true if the register is 16-bit
 */
export function is16bitRegister(register: string): boolean {
	return ["pc", "sp", "ix", "iy", "af", "bc", "de", "hl"].includes(register.toLowerCase());
}

/**
 * Parse the output of the openMSX 'vdpregs' TCL command into a structured object.
 * Output format:
 *  0 : 0x04    8 : 0x08   16 : 0x00   24 : 0x00
 *  1 : 0x70    9 : 0x02   17 : 0x18   25 : 0x00
 *  ...
 * @param response - Raw text response from the vdpregs command
 * @returns Record mapping register number (string) to hex value string
 */
export function parseVdpRegs(response: string): Record<string, string> {
	const registers: Record<string, string> = {};
	const regex = /(\d+)\s*:\s*(0x[0-9a-fA-F]{2})/g;
	let match;
	while ((match = regex.exec(response)) !== null) {
		registers[match[1]] = match[2];
	}
	return registers;
}

/**
 * Parse the output of the openMSX 'palette' TCL command into a structured object.
 * Output format:
 *  0:000  4:117  8:711  c:141
 *  1:000  5:237  9:733  d:625
 *  ...
 * @param response - Raw text response from the palette command
 * @returns Array of 16 palette entries with index, r, g, b values
 */
export function parsePalette(response: string): { index: number; r: number; g: number; b: number; rgb: string }[] {
	const palette: { index: number; r: number; g: number; b: number; rgb: string }[] = [];
	const regex = /([0-9a-fA-F]):([0-7])([0-7])([0-7])/g;
	let match;
	while ((match = regex.exec(response)) !== null) {
		palette.push({
			index: parseInt(match[1], 16),
			r: parseInt(match[2]),
			g: parseInt(match[3]),
			b: parseInt(match[4]),
			rgb: match[2] + match[3] + match[4],
		});
	}
	palette.sort((a, b) => a.index - b.index);
	return palette;
}

/**
 * Parse the output of the openMSX 'debug list_bp' TCL command into a structured array.
 * Output format:
 *  bp#1 0x4000 {} {debug break}
 *  bp#2 0x8000 {} {debug break}
 * @param response - Raw text response from the debug list_bp command
 * @returns Array of breakpoint objects
 */
export function parseBreakpoints(response: string): { name: string; address: string; condition: string; command: string }[] {
	if (!response.trim()) return [];
	const breakpoints: { name: string; address: string; condition: string; command: string }[] = [];
	const lines = response.trim().split('\n');
	for (const line of lines) {
		const match = line.match(/^(\S+)\s+(0x[0-9a-fA-F]{4})\s+\{([^}]*)\}\s+\{([^}]*)\}/);
		if (match) {
			breakpoints.push({
				name: match[1],
				address: match[2],
				condition: match[3],
				command: match[4],
			});
		}
	}
	return breakpoints;
}

/**
 * Parse the output of the openMSX 'reverse status' TCL command into a structured object.
 * Output format:
 *  status enabled begin 0.0 end 294.08 current 294.08 snapshots {...} last_event 0.0
 * @param response - Raw text response from the reverse status command
 * @returns Structured replay status object
 */
export function parseReplayStatus(response: string): { enabled: boolean; begin: number; end: number; current: number; snapshotCount: number } {
	const statusMatch = response.match(/status\s+(\w+)/);
	const beginMatch = response.match(/begin\s+([\d.]+)/);
	const endMatch = response.match(/end\s+([\d.]+)/);
	const currentMatch = response.match(/current\s+([\d.]+)/);
	const snapshotsMatch = response.match(/snapshots\s+\{([^}]*)\}/);
	const snapshotCount = snapshotsMatch ? snapshotsMatch[1].trim().split(/\s+/).filter(s => s).length : 0;
	return {
		enabled: statusMatch ? statusMatch[1] === 'enabled' : false,
		begin: beginMatch ? parseFloat(beginMatch[1]) : 0,
		end: endMatch ? parseFloat(endMatch[1]) : 0,
		current: currentMatch ? parseFloat(currentMatch[1]) : 0,
		snapshotCount,
	};
}

/*
 * Sleep for a specified number of milliseconds
 * @param ms - Number of milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sleep for a specified number of milliseconds, with support for cancellation via AbortSignal.
 * @param ms - Number of milliseconds to sleep
 * @param signal - AbortSignal to cancel the sleep early
 * @returns Promise that resolves after the specified time, or rejects if aborted
 * @throws {DOMException} If the signal is aborted (with name 'AbortError')
 */
export function sleepWithAbort(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
			return;
		}
		const timer = setTimeout(() => {
			signal.removeEventListener('abort', onAbort);
			resolve();
		}, ms);
		const onAbort = () => {
			clearTimeout(timer);
			reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
		};
		signal.addEventListener('abort', onAbort, { once: true });
	});
}
