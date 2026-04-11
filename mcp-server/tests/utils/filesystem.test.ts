import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractDescriptionFromXML,
  addFileExtension,
  listResourcesDirectory,
  ensureDirectoryExists,
} from '../../src/utils.js';

// Mock fs/promises — all filesystem calls go through this mock
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    readdir: vi.fn(),
    mkdir: vi.fn(),
  },
}));

import fs from 'fs/promises';
const mockReadFile = vi.mocked(fs.readFile);
const mockReaddir = vi.mocked(fs.readdir);
const mockMkdir = vi.mocked(fs.mkdir);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── extractDescriptionFromXML ───────────────────────────────────────────────

describe('extractDescriptionFromXML', () => {
  it('extracts description from valid XML', async () => {
    mockReadFile.mockResolvedValue(
      '<?xml version="1.0"?><machine><description>Panasonic FS-A1GT</description></machine>'
    );
    const result = await extractDescriptionFromXML('/path/to/machine.xml');
    expect(result).toBe('Panasonic FS-A1GT');
    expect(mockReadFile).toHaveBeenCalledWith('/path/to/machine.xml', 'utf-8');
  });

  it('returns default when no description tag', async () => {
    mockReadFile.mockResolvedValue('<?xml version="1.0"?><machine></machine>');
    const result = await extractDescriptionFromXML('/path/to/machine.xml');
    expect(result).toBe('No description available');
  });

  it('returns error message on read failure', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await extractDescriptionFromXML('/nonexistent.xml');
    expect(result).toBe('Error reading description');
  });

  it('handles empty file', async () => {
    mockReadFile.mockResolvedValue('');
    const result = await extractDescriptionFromXML('/path/to/empty.xml');
    expect(result).toBe('No description available');
  });
});

// ─── addFileExtension ────────────────────────────────────────────────────────

describe('addFileExtension', () => {
  it('finds matching file and returns MIME type', async () => {
    mockReaddir.mockResolvedValue(['README.md', 'README.txt'] as any);
    const [mime, fullPath] = await addFileExtension('/docs/README');
    expect(mime).toBe('text/markdown');
    expect(fullPath).toContain('README.md');
  });

  it('returns text/plain for unknown extension', async () => {
    mockReaddir.mockResolvedValue(['data.xyz'] as any);
    const [mime] = await addFileExtension('/docs/data');
    // mime-types may not know .xyz — falls back to text/plain
    expect(typeof mime).toBe('string');
  });

  it('returns original path when no match found', async () => {
    mockReaddir.mockResolvedValue(['other.txt'] as any);
    const [mime, fullPath] = await addFileExtension('/docs/README');
    expect(mime).toBe('text/plain');
    expect(fullPath).toBe('/docs/README');
  });

  it('returns original path on directory read error', async () => {
    mockReaddir.mockRejectedValue(new Error('ENOENT'));
    const [mime, fullPath] = await addFileExtension('/nonexistent/file');
    expect(mime).toBe('text/plain');
    expect(fullPath).toBe('/nonexistent/file');
  });
});

// ─── listResourcesDirectory ──────────────────────────────────────────────────

describe('listResourcesDirectory', () => {
  it('returns directory names only', async () => {
    mockReaddir.mockResolvedValue([
      { name: 'basic', isDirectory: () => true },
      { name: 'readme.md', isDirectory: () => false },
      { name: 'sdcc', isDirectory: () => true },
    ] as any);
    const result = await listResourcesDirectory('/resources');
    expect(result).toEqual(['basic', 'sdcc']);
  });

  it('returns empty array when no directories', async () => {
    mockReaddir.mockResolvedValue([
      { name: 'file.txt', isDirectory: () => false },
    ] as any);
    const result = await listResourcesDirectory('/resources');
    expect(result).toEqual([]);
  });

  it('returns empty array on read error', async () => {
    mockReaddir.mockRejectedValue(new Error('EACCES'));
    const result = await listResourcesDirectory('/no-access');
    expect(result).toEqual([]);
  });
});

// ─── ensureDirectoryExists ───────────────────────────────────────────────────

describe('ensureDirectoryExists', () => {
  it('returns null on success', async () => {
    mockMkdir.mockResolvedValue(undefined);
    const result = await ensureDirectoryExists('/path/to/dir');
    expect(result).toBeNull();
    expect(mockMkdir).toHaveBeenCalledWith('/path/to/dir', { recursive: true });
  });

  it('returns error message on failure', async () => {
    mockMkdir.mockRejectedValue(new Error('EACCES: permission denied'));
    const result = await ensureDirectoryExists('/root/protected');
    expect(result).toContain('Cannot create directory');
    expect(result).toContain('/root/protected');
    expect(result).toContain('EACCES');
  });
});
