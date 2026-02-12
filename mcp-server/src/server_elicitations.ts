/**
 * @package @nataliapc/mcp-openmsx
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { openMSXInstance } from "./openmsx.js";
import { EmuDirectories } from "./server.js";
import { isErrorResponse } from "./utils.js";



// ============================================================================
// Default machines offered when no machine is specified in launch command
// ============================================================================
const DEFAULT_MACHINES: { const: string; title: string }[] = [
    { const: 'C-BIOS_MSX1',          title: 'MSX1 (C-BIOS, no system ROMs needed)' },
    { const: 'Philips_VG_8020',       title: 'MSX1 European (Philips VG-8020)' },
    { const: 'C-BIOS_MSX2',           title: 'MSX2 (C-BIOS, no system ROMs needed)' },
    { const: 'Philips_NMS_8250',      title: 'MSX2 European (Philips NMS-8250)' },
    { const: 'C-BIOS_MSX2+',          title: 'MSX2+ (C-BIOS, openMSX default)' },
    { const: 'Panasonic_FS-A1GT',     title: 'MSX turboR (Panasonic FS-A1GT)' },
];

// ============================================================================
// Helper: Use sampling (LLM) to pick the best matches from a list
// ============================================================================
async function samplingFindMatches(
    server: McpServer,
    userQuery: string,
    items: { name: string; description: string }[],
    itemType: string,
    maxResults: number = 6
): Promise<{ const: string; title: string }[]> {
    // Build a compact list for the LLM
    const itemList = items.map(m => `${m.name}: ${m.description}`).join('\n');
    const samplingResult = await server.server.createMessage({
        messages: [{
            role: 'user',
            content: {
                type: 'text',
                text: `The user wants to launch an MSX emulator with ${itemType}: "${userQuery}".\n\nHere is the full list of available ${itemType}s:\n${itemList}\n\nReturn ONLY the top ${maxResults} best matching ${itemType} names (exact names from the list), one per line, no numbering, no descriptions, no extra text. Most relevant first.`
            }
        }],
        maxTokens: 300,
        systemPrompt: `You are a helpful assistant that matches user queries to MSX ${itemType} names. Return ONLY exact names from the provided list, one per line. No extra text.`,
        temperature: 0,
    });

    if (samplingResult.content.type !== 'text') return [];

    const suggestedNames = samplingResult.content.text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    // Map back to items with validation
    const nameMap = new Map(items.map(m => [m.name.toLowerCase(), m]));
    const matches: { const: string; title: string }[] = [];
    for (const name of suggestedNames) {
        const item = nameMap.get(name.toLowerCase());
        if (item && matches.length < maxResults) {
            matches.push({ const: item.name, title: `${item.name} — ${item.description}` });
        }
    }
    return matches;
}

// ============================================================================
// Helper: Resolve machine and extensions for launch using elicitation + sampling
// ============================================================================
export async function resolveLaunchParams(
    server: McpServer,
    emuDirectories: EmuDirectories,
    machine?: string,
    extensions?: string[]
): Promise<{ machine: string; extensions: string[]; cancelled?: boolean; error?: string }> {

    // Load lists lazily only when needed
    let machinesList: { name: string; description: string }[] | undefined;
    let extensionsList: { name: string; description: string }[] | undefined;

    const loadMachinesList = async () => {
        if (!machinesList) {
            const raw = await openMSXInstance.getMachineList(emuDirectories.MACHINES_DIR);
            if (isErrorResponse(raw)) throw new Error(raw);
            machinesList = JSON.parse(raw);
        }
        return machinesList!;
    };

    const loadExtensionsList = async () => {
        if (!extensionsList) {
            const raw = await openMSXInstance.getExtensionList(emuDirectories.EXTENSIONS_DIR);
            if (isErrorResponse(raw)) throw new Error(raw);
            extensionsList = JSON.parse(raw);
        }
        return extensionsList!;
    };

    // ── Resolve machine ──────────────────────────────────────────────────
    let resolvedMachine = machine || '';

    if (machine) {
        // Check for exact match
        const machines = await loadMachinesList();
        const exactMatch = machines.find(m => m.name.toLowerCase() === machine.toLowerCase());
        if (exactMatch) {
            resolvedMachine = exactMatch.name;
        } else {
            // Ambiguous machine name → use sampling to find suggestions, then elicit
            try {
                const suggestions = await samplingFindMatches(server, machine, machines, 'machine');
                if (suggestions.length > 0) {
                    const elicitResult = await server.server.elicitInput({
                        mode: 'form',
                        message: `No exact match found for machine "${machine}". Please select the MSX machine to emulate:`,
                        requestedSchema: {
                            type: 'object',
                            properties: {
                                machine: {
                                    type: 'string',
                                    title: 'MSX Machine',
                                    description: `Best matches for "${machine}"`,
                                    oneOf: suggestions,
                                },
                            },
                            required: ['machine'],
                        },
                    });
                    if (elicitResult.action !== 'accept' || !elicitResult.content) {
                        return { machine: '', extensions: [], cancelled: true };
                    }
                    resolvedMachine = elicitResult.content.machine as string;
                } else {
                    // Sampling found nothing → use the original value (let openMSX handle the error)
                    resolvedMachine = machine;
                }
            } catch {
                // Client doesn't support sampling/elicitation → fallback
                resolvedMachine = machine;
            }
        }
    } else {
        // No machine provided → elicit with common defaults
        try {
            const elicitResult = await server.server.elicitInput({
                mode: 'form',
                message: 'No machine specified. Please select the MSX machine to emulate:',
                requestedSchema: {
                    type: 'object',
                    properties: {
                        machine: {
                            type: 'string',
                            title: 'MSX Machine',
                            description: 'Select the type of MSX machine to launch',
                            oneOf: DEFAULT_MACHINES,
                        },
                    },
                    required: ['machine'],
                },
            });
            if (elicitResult.action !== 'accept' || !elicitResult.content) {
                return { machine: '', extensions: [], cancelled: true };
            }
            resolvedMachine = elicitResult.content.machine as string;
        } catch {
            // Client doesn't support elicitation → launch with openMSX default
            resolvedMachine = '';
        }
    }

    // ── Resolve extensions ───────────────────────────────────────────────
    let resolvedExtensions: string[] = extensions || [];

    if (extensions && extensions.length > 0) {
        try {
            const allExtensions = await loadExtensionsList();
            const extNameMap = new Map(allExtensions.map(e => [e.name.toLowerCase(), e]));

            const matched: string[] = [];
            const ambiguous: string[] = [];

            for (const ext of extensions) {
                const exact = extNameMap.get(ext.toLowerCase());
                if (exact) {
                    matched.push(exact.name);
                } else {
                    ambiguous.push(ext);
                }
            }

            if (ambiguous.length > 0) {
                // Use sampling to find best matches for ALL ambiguous extensions at once
                const ambiguousQuery = ambiguous.join(', ');
                const suggestions = await samplingFindMatches(
                    server, ambiguousQuery, allExtensions, 'extension', 6
                );

                if (suggestions.length > 0) {
                    // Pre-select the already matched extensions in the suggestions
                    const elicitResult = await server.server.elicitInput({
                        mode: 'form',
                        message: `No exact match found for extension(s): ${ambiguous.map(e => `"${e}"`).join(', ')}. Please select the extensions to use:`,
                        requestedSchema: {
                            type: 'object',
                            properties: {
                                extensions: {
                                    type: 'array',
                                    title: 'MSX Extensions',
                                    description: `Best matches for: ${ambiguousQuery}`,
                                    items: {
                                        anyOf: suggestions,
                                    },
                                },
                            },
                            required: ['extensions'],
                        },
                    });
                    if (elicitResult.action !== 'accept' || !elicitResult.content) {
                        return { machine: resolvedMachine, extensions: [], cancelled: true };
                    }
                    const selectedExtensions = elicitResult.content.extensions as string[];
                    resolvedExtensions = [...matched, ...selectedExtensions];
                } else {
                    // Sampling found nothing → use original values
                    resolvedExtensions = extensions;
                }
            } else {
                // All extensions matched exactly
                resolvedExtensions = matched;
            }
        } catch {
            // Client doesn't support sampling/elicitation → fallback
            resolvedExtensions = extensions;
        }
    }

    return { machine: resolvedMachine, extensions: resolvedExtensions };
}
