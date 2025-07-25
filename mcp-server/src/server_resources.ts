/**
 * @package @nataliapc/mcp-openmsx
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import { McpServer, RegisteredResource, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fetchCleanWebpage, addFileExtension, listResourcesDirectory, getResponseContent } from "./utils.js";


// Source: https://www.msx.org/wiki/Category:MSX-BASIC_Instructions
export const basicInstructions: string[] = [
	"ABS()", "AND", "ASC()", "ATN()", "AUTO", "BASE()", "BEEP", "BIN$()", "BLOAD", "BSAVE", "CALL", "CALL ADJUST",
	"CALL IMPOSE", "CALL OPTIONS", "CALL PAUSE", "CALL PCMPLAY", "CALL PCMREC", "CDBL()", "CHR$()", "CINT()", "CIRCLE",
	"CLEAR", "CLOAD", "CLOAD?", "CLOSE", "CLS", "COLOR", "COLOR=", "COLOR SPRITE()", "COLOR SPRITE$()", "CONT", "COPY",
	"COPY SCREEN", "COS()", "CSAVE", "CSNG()", "CSRLIN", "DATA", "DEFDBL", "DEF FN", "DEFINT", "DEFSNG", "DEFSTR",
	"DEF USR", "DELETE", "DIM", "DRAW", "ELSE", "END", "EOF()", "EQV", "ERASE", "ERL", "ERR", "ERROR", "EXP()", "FIELD",
	"FIX()", "FN", "FOR...NEXT", "FRE()", "GET DATE", "GET TIME", "GOSUB", "GOTO", "HEX$()", "IF...GOTO...ELSE",
	"IF...THEN...ELSE", "IMP", "INKEY$", "INP()", "INPUT", "INPUT$()", "INSTR()", "INT()", "INTERVAL", "KEY", "KEY()",
	"LEFT$()", "LEN()", "LET", "LINE", "LINE INPUT", "LIST", "LLIST", "LOAD", "LOCATE", "LOG()", "LPOS()", "LPRINT",
	"MAXFILES", "MERGE", "MID$()", "MOD", "MOTOR", "NEW", "NOT", "OCT$()", "ON...GOSUB", "ON...GOTO", "ON ERROR GOTO",
	"ON INTERVAL GOSUB", "ON KEY GOSUB", "ON SPRITE GOSUB", "ON STOP GOSUB", "ON STRIG GOSUB", "OPEN", "OR", "OUT",
	"PAD()", "PAINT", "PDL()", "PEEK()", "PLAY", "PLAY()", "POINT", "POKE", "POS()", "PRESET", "PRINT", "PSET",
	"PUT KANJI", "PUT SPRITE", "READ", "REM", "RENUM", "RESTORE", "RESUME", "RETURN", "RIGHT$()", "RND()", "RUN",
	"SAVE", "SCREEN", "SET ADJUST", "SET BEEP", "SET DATE", "SET PAGE", "SET PASSWORD", "SET PROMPT", "SET SCREEN",
	"SET SCROLL", "SET TIME", "SET TITLE", "SET VIDEO", "SGN()", "SIN()", "SOUND", "SPACE$()", "SPC()", "SPRITE",
	"SPRITE$()", "SQR()", "STICK()", "STOP", "STR$()", "STRIG()", "STRING$()", "SWAP", "TAB()", "TAN()", "TIME",
	"TROFF", "TRON", "USR()", "VAL()", "VARPTR()", "VDP()", "VPEEK()", "VPOKE", "WAIT", "WIDTH", "XOR"
];

// Registered resources in the MCP server
export interface RegResource {
	resource: RegisteredResource;
	uri: string;
}
const regResources:RegResource[] = [];

export function getRegisteredResourcesList(): RegResource[] {
	return regResources;
}

// ============================================================================
// Resources available in the MCP server
// https://modelcontextprotocol.io/docs/concepts/resources

export async function registerResources(server: McpServer, resourcesDir: string)
{
	// ============================================================================
	// MSX Documentation resources

	const resdocs: string[] = (await listResourcesDirectory(resourcesDir)).sort();

	for (let index = 0; index < resdocs.length; index++) {
		// Read the toc.json file if exists, otherwise skip this section
		const sectionName = resdocs[index];
		const tocFile = path.join(resourcesDir, `${sectionName}/toc.json`);
		let tocContent = { toc: [] };
		try {
			tocContent = JSON.parse(await fs.readFile(tocFile, 'utf8'));
		} catch (error) {
			// The toc.json file does not exist or is invalid, skip this section
			continue;
		}
		// Register each item in the toc.json as a resource
		tocContent.toc.forEach((item: any, itemIndex: number) => {
			const itemName = path.parse(item.uri.split('/').pop()).base || '';
			let resource = {
				uri: item.uri,
				filename: '',
				resource: server.registerResource(
				// Name of the resource (used to call it)
				`msxdocs_${sectionName}_${item.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`,
				// Resource URI template
				item.uri,
				// Metadata for the resource
				{
					title: item.title || `MSX Documentation '${sectionName}': ${itemName}`,
					description: item.description || `Documentation for MSX resource '${sectionName}': ${itemName}`,
					mimeType: item.mimeType || 'text/markdown',
				},
				// Handler for the resource (function to be executed when the resource is called)
				async (uri: URL) => {
					let resourceContent: string;
					let mimeType: string | undefined;
					if (uri.href.startsWith('http://') || uri.href.startsWith('https://')) {
						// Fetch the resource from the URL
						try {
							[resourceContent, mimeType] = await fetchCleanWebpage(uri.href);
						} catch (error) {
							// Throw exception (MCP protocol requirement)
							throw error;
						}
					} else {
						// Read the resource from the local MCP server resources directory
						try {
							let resourceFile: string | undefined;
							[mimeType, resourceFile] = await addFileExtension(path.join(resourcesDir, `${sectionName}/${itemName}`));
							resourceContent = await fs.readFile(resourceFile, 'utf8');
						} catch (error) {
							// Throw exception (MCP protocol requirement)
							throw new Error(`Error reading resource ${sectionName}/${item.uri}: ${error instanceof Error ? error.message : String(error)}`);
						}
					}
					return {
						contents: [{
							uri: uri.href,
							text: resourceContent,
							mimeType: mimeType || 'text/plain',
						}],
					};
				}
			)};
			regResources.push(resource);
		});
	};

	// Source: https://www.msx.org/wiki/Category:MSX-BASIC_Instructions
	server.resource(
		"msxdocs_basic_wiki",
		new ResourceTemplate(
			"msxdocs://basic_wiki/{instruction}",
			{
				list: undefined,
				complete: {
					instruction: (value: string) => basicInstructions,
				},
			}
		),
		{
			title: "MSX BASIC Instructions Documentation",
			description: "Documentation about all the standard MSX BASIC instructions from www.msx.org/wiki/Category:MSX-BASIC_Instructions",
			mimeType: "text/html",
		},
		async (uri: URL, variables: any) => {
			let instruction = (variables.instruction as string);
			let resourceContent: string;
			let mimeType: string | undefined;

			// urldecode the instruction to avoid issues with special characters
			instruction = decodeURIComponent(instruction).replaceAll(' ','_');
			try {
				let resourceFile: string | undefined;
				[mimeType, resourceFile] = await addFileExtension(path.join(resourcesDir, 'programming', 'basic_wiki', instruction));
				resourceContent = await fs.readFile(resourceFile, 'utf8');
			} catch (error) {
				// Throw exception (MCP protocol requirement)
				throw new Error(`Error reading resource programming/basic_wiki/${instruction}: ${error instanceof Error ? error.message : String(error)}`);
			}
			return {
				contents: [{
					uri: uri.href,
					text: resourceContent,
					mimeType: mimeType || 'text/plain',
				}],
			};
		}
	);

}