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
 * List all folders in the resources directory
 * @param resourcesDir - Path to the resources directory
 * @returns Promise<string[]> - List of folder names in the resources directory
 */
export async function listResourcesDirectory(resourcesDir: string): Promise<string[]>
{
    try {
        const directories = await fs.readdir(resourcesDir, { withFileTypes: true });
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
            
            // Detect if the content is actually compressed or just mislabeled
            const contentType = response.headers.get('content-type') || '';
            
            // Specifically handle the case of application/x-gzip without content-encoding
            if (contentType.includes('x-gzip') || contentType.includes('gzip')) {
                // The server claims it's gzip, verify if it actually is
                const arrayBuffer = await response.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                
                // Check if it is actually compressed with gzip (magic number 0x1f 0x8b)
                if (uint8Array[0] === 0x1f && uint8Array[1] === 0x8b) {
                    // It is actually compressed, use gunzipSync to decompress
                    try {
                        const decompressed = gunzipSync(Buffer.from(uint8Array));
                        resourceContent = decompressed.toString('utf8');
                        mimeType = 'text/html'; // Correct the MIME type
                    } catch (error) {
                        // If decompression fails, treat as plain text
                        resourceContent = new TextDecoder().decode(uint8Array);
                        mimeType = 'text/html';
                    }
                } else {
                    // Not compressed, mislabeled plain text
                    resourceContent = new TextDecoder().decode(uint8Array);
                    mimeType = 'text/html'; // Correct the MIME type
                }
            } else {
                // Normal case, use response.text() which automatically handles decompression
                resourceContent = await response.text();
            }
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // Remove script, style, and link tags from the content if it's HTML
        if (mimeType.startsWith('text/html')) {
            resourceContent = resourceContent
                // Remove <script>, <style>, and <link> tags
                .replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<form\b[^>]*>[\s\S]*?<\/form>|<link\b[^>]*\/?>/gi, '')
                // Remove empty lines (including lines with only whitespace)
                .replace(/^[ \t\n\r]*[\r\n]+/gm, '');
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
