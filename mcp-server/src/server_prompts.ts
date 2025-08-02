/**
 * @package @nataliapc/mcp-openmsx
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { basicInstructions } from "./server_resources.js";


// ============================================================================
// Prompts available in the MCP server
// https://modelcontextprotocol.io/docs/concepts/prompts

export async function registerPrompts(server: McpServer)
{
	server.registerPrompt(
		// Name of the prompt (used to call it)
		"basic",
		{
			title: "MSX BASIC Instruction Manual",
			// Description of the prompt (what it does)
			description: "MSX BASIC instructions manual",
			// Schema for the prompt (input validation)
			argsSchema: {
				instruction: z.string()
					.min(1, "Instruction name cannot be empty")
					.max(50, "Instruction name too long")
					.describe("Name of the MSX BASIC instruction to get information about (e.g. 'PRINT', 'FOR', 'POKE'). Case insensitive.")
					.transform(val => val.trim().toUpperCase()),
			},
		},
		// Handler for the prompt (function to be executed when the prompt is called)
		({ instruction }: { instruction: string }) => {
			// Normalize instruction name for better matching
			const normalizedInstruction = instruction.replace(/[()]/g, '').trim();

			let prompt = '';
			// Check if instruction is in the known list
			const isKnownInstruction = basicInstructions.some(basic => 
				basic.replace(/[()]/g, '').toUpperCase() === normalizedInstruction
			);
			if (isKnownInstruction) {
				prompt = `Provide comprehensive information about the MSX BASIC instruction '${instruction}'.
STRICT REQUIREMENTS: 
- NEVER invent or assume any information not explicitly found in the MCP resources
- ONLY use information from 'msxdocs:' resources and tools #msxdocs_resource_get and #vector_db_query
- If specific details (ranges, values, behaviors) are not in the resources, state "Not specified in available documentation"
- Do NOT use general knowledge about MSX systems - stick ONLY to what the resources contain
- When citing parameters or ranges, quote them EXACTLY as written in the source documentation
MANDATORY SECTIONS:
- Include these sections if information is available in resources: 'Description', 'Syntax', 'Parameters', 'Notes', 'Usage examples', 'Related instructions', and 'Availability'.
- You MUST respond in the user language, unless otherwise specified.
SOURCES:
- Always cite the specific MCP resources used at the end in section 'Sources' with exact resource uri.
- For each resource, add a markdown link to the resource if external url is available.`;
			} else {
				const suggestions = basicInstructions
					.filter(basic => basic.toUpperCase().includes(normalizedInstruction) || 
						normalizedInstruction.includes(basic.replace(/[()]/g, '').toUpperCase()))
					.slice(0, 5);
				// If the instruction is not known, suggest alternatives
				prompt = `Explain that '${instruction}' does not appear to be a standard MSX BASIC instruction.
STRICT REQUIREMENTS:
- ONLY use information found in MCP resources via #vector_db_query tool
- Do NOT assume or invent any information about MSX BASIC instructions
- If suggesting alternatives, provide ONLY what is found in the search results
${suggestions.length > 0 ? `Suggest one of these: ${suggestions.join(', ')} instructions as a correct search string. List them with a brief description using ONLY information found in the resources 'msxdocs://basic_wiki/{instruction}'` : 'Use #vector_db_query to search for similar instructions.'}
IMPORTANT: Review the available MSX BASIC instructions using the available MCP resources. You may still try to find information using the available resources, as it could be documented under a different name or as part of another instruction. Base your response EXCLUSIVELY on what the resources and tools return.
You MUST respond in the user language, unless otherwise specified.`;
			}

			return {
				messages: [{
					role: "assistant",
					content: {
						type: "text",
						text: prompt,
					},
				}]
			};
		}
	);

}