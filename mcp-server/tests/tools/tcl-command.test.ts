import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

vi.mock('../../src/openmsx.js', () => ({
  openMSXInstance: {
    sendCommand: vi.fn(),
  },
}));

import { openMSXInstance } from '../../src/openmsx.js';
import { registerOpenMsxTclCommandTool } from '../../src/server_tools.js';

interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  structuredContent: {
    command: string;
    result: string;
    truncated: boolean;
  };
  isError: boolean;
}

type ToolHandler = (args: { command: string }) => Promise<ToolResponse>;
type CommandSchema = { safeParse: (value: unknown) => { success: boolean } };

class ToolRegistry {
  readonly registrations: Array<{ name: string; config: unknown; handler: ToolHandler }> = [];

  registerTool(name: string, config: unknown, handler: ToolHandler): void {
    this.registrations.push({ name, config, handler });
  }
}

const originalValue = process.env.OPENMSX_ENABLE_RAW_TCL;
const mockSendCommand = vi.mocked(openMSXInstance.sendCommand);

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.OPENMSX_ENABLE_RAW_TCL;
});

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env.OPENMSX_ENABLE_RAW_TCL;
  } else {
    process.env.OPENMSX_ENABLE_RAW_TCL = originalValue;
  }
});

function register(): ToolRegistry {
  const registry = new ToolRegistry();
  registerOpenMsxTclCommandTool(registry as unknown as McpServer);
  return registry;
}

describe('openmsx_tcl_cmd registration', () => {
  it('is not registered by default', () => {
    expect(register().registrations).toHaveLength(0);
  });

  it.each(['1', 'yes', 'false', 'enabled'])('is not registered for %j', (value) => {
    process.env.OPENMSX_ENABLE_RAW_TCL = value;
    expect(register().registrations).toHaveLength(0);
  });

  it.each(['true', 'TRUE', '  True  '])('is registered for %j', (value) => {
    process.env.OPENMSX_ENABLE_RAW_TCL = value;
    const registrations = register().registrations;

    expect(registrations).toHaveLength(1);
    expect(registrations[0].name).toBe('openmsx_tcl_cmd');
  });

  it('validates length and XML control characters', () => {
    process.env.OPENMSX_ENABLE_RAW_TCL = 'true';
    const config = register().registrations[0].config as {
      inputSchema: { command: CommandSchema };
    };
    const schema = config.inputSchema.command;

    expect(schema.safeParse('').success).toBe(false);
    expect(schema.safeParse('x'.repeat(16384)).success).toBe(true);
    expect(schema.safeParse('x'.repeat(16385)).success).toBe(false);
    expect(schema.safeParse('help\u0000').success).toBe(false);
    expect(schema.safeParse('set message "line 1\r\nline 2\t"').success).toBe(true);
  });
});

describe('openmsx_tcl_cmd handler', () => {
  function getHandler(): ToolHandler {
    process.env.OPENMSX_ENABLE_RAW_TCL = 'true';
    return register().registrations[0].handler;
  }

  it('forwards the exact Tcl command and returns structured content', async () => {
    mockSendCommand.mockResolvedValue('debug help text');
    const handler = getHandler();

    const response = await handler({ command: 'help debug watchpoint' });

    expect(mockSendCommand).toHaveBeenCalledWith('help debug watchpoint');
    expect(response).toEqual({
      content: [{ type: 'text', text: 'debug help text' }],
      structuredContent: {
        command: 'help debug watchpoint',
        result: 'debug help text',
        truncated: false,
      },
      isError: false,
    });
  });

  it('marks openMSX errors as tool errors', async () => {
    mockSendCommand.mockResolvedValue('Error: invalid command name "unknown"');

    const response = await getHandler()({ command: 'unknown' });

    expect(response.isError).toBe(true);
    expect(response.structuredContent.result).toContain('invalid command name');
  });

  it('truncates exceptionally large responses', async () => {
    mockSendCommand.mockResolvedValue('x'.repeat(65537));

    const response = await getHandler()({ command: 'help' });

    expect(response.structuredContent.result).toHaveLength(65536);
    expect(response.structuredContent.truncated).toBe(true);
    expect(response.content[0].text).toHaveLength(65536);
  });
});
