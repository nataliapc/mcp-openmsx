/**
 * Utils functions for mcp-openmsx
 * 
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import fs from 'fs/promises';
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";


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
