/**
 * Utils functions for mcp-openmsx
 * 
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import fs from 'fs/promises';

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
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '=',
        '&#39;': "'",
        '&#47;': '/',
        '&#96;': '`',
        '&#61;': '=',
        '&apos;': "'",
        '&nbsp;': ' ',
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