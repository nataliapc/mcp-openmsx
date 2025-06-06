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