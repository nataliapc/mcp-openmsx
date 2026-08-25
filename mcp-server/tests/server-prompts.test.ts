import { describe, expect, it } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPrompts } from '../src/server_prompts.js';

interface PromptResult {
	messages: Array<{
		role: string;
		content: { type: string; text: string };
	}>;
}

type PromptHandler = (args: { instruction: string }) => PromptResult;

interface PromptRegistration {
	name: string;
	config: unknown;
	handler: PromptHandler;
}

class PromptRegistry {
	readonly registrations: PromptRegistration[] = [];

	registerPrompt(name: string, config: unknown, handler: PromptHandler): void {
		this.registrations.push({ name, config, handler });
	}
}

interface InstructionSchema {
	safeParse(value: unknown):
		| { success: true; data: string }
		| { success: false };
}

function getInstructionSchema(config: unknown): InstructionSchema {
	return (config as { argsSchema: { instruction: InstructionSchema } }).argsSchema.instruction;
}

async function getPrompt(): Promise<PromptRegistration> {
	const registry = new PromptRegistry();
	await registerPrompts(registry as unknown as McpServer);
	const registration = registry.registrations.find(item => item.name === 'basic');
	if (!registration) throw new Error('Prompt "basic" not registered');
	return registration;
}

describe('registerPrompts', () => {
	it('registers the BASIC prompt and normalizes its argument schema', async () => {
		const registration = await getPrompt();
		const schema = getInstructionSchema(registration.config);
		const parsed = schema.safeParse('  print()  ');

		expect(registration.name).toBe('basic');
		expect(parsed).toEqual({ success: true, data: 'PRINT()' });
	});

	it('creates a resource-focused prompt for a known instruction', async () => {
		const registration = await getPrompt();
		const result = registration.handler({ instruction: 'PRINT()' });
		const text = result.messages[0].content.text;

		expect(result.messages[0].role).toBe('assistant');
		expect(result.messages[0].content.type).toBe('text');
		expect(text).toContain("MSX BASIC instruction 'PRINT()'");
		expect(text).toContain('Description');
		expect(text).toContain('msxdocs:');
	});

	it('suggests matching instructions for an unknown partial name', async () => {
		const registration = await getPrompt();
		const text = registration.handler({ instruction: 'PRI' }).messages[0].content.text;

		expect(text).toContain('does not appear to be a standard MSX BASIC instruction');
		expect(text).toContain('Suggest one of these:');
		expect(text).toContain('PRINT');
	});

	it('uses the generic search guidance when there are no suggestions', async () => {
		const registration = await getPrompt();
		const text = registration.handler({ instruction: 'ZZZ' }).messages[0].content.text;

		expect(text).toContain('does not appear to be a standard MSX BASIC instruction');
		expect(text).toContain('Use #vector_db_query to search for similar instructions.');
	});

	it('rejects empty and overlong instruction arguments', async () => {
		const schema = getInstructionSchema((await getPrompt()).config);

		expect(schema.safeParse('').success).toBe(false);
		expect(schema.safeParse('x'.repeat(51)).success).toBe(false);
	});
});