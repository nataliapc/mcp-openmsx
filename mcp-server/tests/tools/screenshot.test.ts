import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the screen_shot tool handler logic.
 *
 * The handler is deeply coupled to registerTools() and McpServer, so we test
 * the core logic by extracting the same patterns: unique prefix generation,
 * directory scan fallback, path normalization, and error handling.
 *
 * We mock openMSXInstance.sendCommand and fs to isolate the handler logic.
 */

// Mock dependencies before importing
vi.mock('../../src/openmsx.js', () => ({
  openMSXInstance: {
    sendCommand: vi.fn(),
  },
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    readdir: vi.fn(),
    unlink: vi.fn(),
    mkdir: vi.fn(),
  },
}));

import { openMSXInstance } from '../../src/openmsx.js';
import fs from 'fs/promises';
import path from 'path';
import { isErrorResponse, tclPath, ensureDirectoryExists } from '../../src/utils.js';

const mockSendCommand = vi.mocked(openMSXInstance.sendCommand);
const mockReadFile = vi.mocked(fs.readFile);
const mockReaddir = vi.mocked(fs.readdir);
const mockUnlink = vi.mocked(fs.unlink);
const mockMkdir = vi.mocked(fs.mkdir);

const SCREENSHOT_DIR = '/home/user/.openMSX/share/screenshots';

beforeEach(() => {
  vi.clearAllMocks();
  mockMkdir.mockResolvedValue(undefined);
});

/**
 * Reproduce the screenshot handler logic inline.
 * This mirrors server_tools.ts lines 1446-1513 without needing McpServer.
 */
async function screenshotHandler(command: 'as_image' | 'to_file') {
  const screenshotDirError = await ensureDirectoryExists(SCREENSHOT_DIR);
  if (screenshotDirError) {
    return { error: screenshotDirError };
  }
  const uniqueId = `mcp_${Date.now()}_`;
  const screenshotPrefix = tclPath(path.join(SCREENSHOT_DIR, uniqueId));
  const openmsxCommand = `screenshot -raw -doublesize -prefix "${screenshotPrefix}"`;
  const response = await openMSXInstance.sendCommand(openmsxCommand);
  if (isErrorResponse(response)) {
    return { error: response };
  }
  let screenshotPath = response;
  if (!screenshotPath || !screenshotPath.endsWith('.png')) {
    try {
      const files = await fs.readdir(SCREENSHOT_DIR);
      const match = (files as string[]).find((f: string) => f.startsWith(uniqueId) && f.endsWith('.png'));
      if (match) {
        screenshotPath = path.join(SCREENSHOT_DIR, match);
      }
    } catch (_) { /* directory read failed */ }
  }
  if (!screenshotPath || !screenshotPath.endsWith('.png')) {
    return { error: `Screenshot command succeeded but no file was found (prefix: "${uniqueId}")` };
  }
  if (command === 'as_image') {
    const imageBuffer = await fs.readFile(screenshotPath);
    const base64image = (imageBuffer as Buffer).toString('base64');
    await fs.unlink(screenshotPath);
    return { base64image, screenshotPath };
  }
  return { screenshotPath };
}

// ─── Screenshot path resolution ──────────────────────────────────────────────

describe('screenshot — path resolution', () => {
  it('uses response path when openMSX returns filename', async () => {
    const expectedPath = '/home/user/.openMSX/share/screenshots/mcp_1234_0001.png';
    mockSendCommand.mockResolvedValue(expectedPath);

    const result = await screenshotHandler('to_file');
    expect(result.screenshotPath).toBe(expectedPath);
    expect(mockReaddir).not.toHaveBeenCalled(); // no fallback needed
  });

  it('scans directory when openMSX returns empty string', async () => {
    const fixedTime = 1700000000000;
    vi.spyOn(Date, 'now').mockReturnValue(fixedTime);

    mockSendCommand.mockResolvedValue('');
    mockReaddir.mockResolvedValue([
      'mcp_old_0001.png',
      `mcp_${fixedTime}_0001.png`,
    ] as any);

    const result = await screenshotHandler('to_file');
    expect(result.screenshotPath).toBeTruthy();
    expect(result.screenshotPath!.endsWith('.png')).toBe(true);
    expect(mockReaddir).toHaveBeenCalledWith(SCREENSHOT_DIR);

    vi.restoreAllMocks();
  });

  it('returns error when no file found after scan', async () => {
    mockSendCommand.mockResolvedValue('');
    mockReaddir.mockResolvedValue(['unrelated_file.txt'] as any);

    const result = await screenshotHandler('to_file');
    expect(result.error).toContain('no file was found');
  });

  it('returns error when directory scan fails', async () => {
    mockSendCommand.mockResolvedValue('');
    mockReaddir.mockRejectedValue(new Error('ENOENT'));

    const result = await screenshotHandler('to_file');
    expect(result.error).toContain('no file was found');
  });
});

// ─── Screenshot as_image ─────────────────────────────────────────────────────

describe('screenshot — as_image', () => {
  it('reads file, converts to base64, and deletes file', async () => {
    const screenshotFile = '/home/user/.openMSX/share/screenshots/mcp_test_0001.png';
    mockSendCommand.mockResolvedValue(screenshotFile);
    mockReadFile.mockResolvedValue(Buffer.from('PNG fake data'));
    mockUnlink.mockResolvedValue(undefined);

    const result = await screenshotHandler('as_image');
    expect(result.base64image).toBe(Buffer.from('PNG fake data').toString('base64'));
    expect(mockReadFile).toHaveBeenCalledWith(screenshotFile);
    expect(mockUnlink).toHaveBeenCalledWith(screenshotFile);
  });
});

// ─── Screenshot error handling ───────────────────────────────────────────────

describe('screenshot — error handling', () => {
  it('returns error when openMSX returns error response', async () => {
    mockSendCommand.mockResolvedValue('Error: renderer not initialized');
    const result = await screenshotHandler('as_image');
    expect(result.error).toBe('Error: renderer not initialized');
  });

  it('returns error when directory cannot be created', async () => {
    mockMkdir.mockRejectedValue(new Error('EACCES'));
    const result = await screenshotHandler('as_image');
    expect(result.error).toContain('Cannot create directory');
  });
});

// ─── TCL command construction ────────────────────────────────────────────────

describe('screenshot — TCL command', () => {
  it('sends correct TCL command with normalized path', async () => {
    mockSendCommand.mockResolvedValue('');
    mockReaddir.mockResolvedValue([] as any);

    await screenshotHandler('to_file');

    const sentCommand = mockSendCommand.mock.calls[0][0];
    expect(sentCommand).toMatch(/^screenshot -raw -doublesize -prefix "/);
    expect(sentCommand).not.toContain('\\'); // no backslashes
    expect(sentCommand).toContain(SCREENSHOT_DIR.replace(/\\/g, '/'));
  });

  it('uses unique prefix with timestamp', async () => {
    const before = Date.now();
    mockSendCommand.mockResolvedValue('');
    mockReaddir.mockResolvedValue([] as any);

    await screenshotHandler('to_file');
    const after = Date.now();

    const sentCommand = mockSendCommand.mock.calls[0][0];
    const prefixMatch = sentCommand.match(/mcp_(\d+)_/);
    expect(prefixMatch).toBeTruthy();
    const timestamp = parseInt(prefixMatch![1]);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});
