import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";



// ============================================================================
// Helper: Use sampling (LLM) to pick the best matches from a list
// ============================================================================
export async function samplingFindMatches(
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
