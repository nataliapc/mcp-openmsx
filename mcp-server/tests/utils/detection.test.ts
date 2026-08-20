import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for platform detection functions: detectOpenMSXShareDir and detectOpenMSXExecutable.
 *
 * These functions depend on process.platform, existsSync, os.homedir, and process.env.
 * We mock `fs.existsSync` at the module level and manipulate process.env/platform per test.
 */

// Mock fs (existsSync, readdirSync) before importing utils
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    existsSync: vi.fn(() => false),
    readdirSync: vi.fn(() => []),
  };
});

import { existsSync, readdirSync } from 'fs';
import { detectOpenMSXShareDir, detectOpenMSXExecutable } from '../../src/utils.js';
import os from 'os';
import path from 'path';

const mockExistsSync = vi.mocked(existsSync);
const mockReaddirSync = vi.mocked(readdirSync);

let originalPlatform: PropertyDescriptor | undefined;
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  vi.clearAllMocks();
  mockExistsSync.mockReturnValue(false);
  mockReaddirSync.mockReturnValue([]);
  originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
  originalEnv = { ...process.env };
});

afterEach(() => {
  // Restore process.platform
  if (originalPlatform) {
    Object.defineProperty(process, 'platform', originalPlatform);
  }
  // Restore env vars
  process.env = originalEnv;
});

function setPlatform(p: string) {
  Object.defineProperty(process, 'platform', { value: p, writable: true, configurable: true });
}

// ─── detectOpenMSXShareDir ───────────────────────────────────────────────────

describe('detectOpenMSXShareDir', () => {
  it('returns empty string when no paths exist', () => {
    expect(detectOpenMSXShareDir()).toBe('');
  });

  it('detects Linux ~/.openMSX/share', () => {
    const linuxPath = path.join(os.homedir(), '.openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === linuxPath || s === path.join(linuxPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(linuxPath);
  });

  it('detects /usr/share/openmsx', () => {
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === '/usr/share/openmsx' || s === '/usr/share/openmsx/machines';
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe('/usr/share/openmsx');
  });

  it('detects /usr/local/share/openmsx', () => {
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === '/usr/local/share/openmsx' || s === '/usr/local/share/openmsx/machines';
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe('/usr/local/share/openmsx');
  });

  it('requires machines subdirectory to exist', () => {
    const linuxPath = path.join(os.homedir(), '.openMSX', 'share');
    // Directory exists but 'machines' subfolder does not
    mockExistsSync.mockImplementation((p: any) => p.toString() === linuxPath);
    expect(detectOpenMSXShareDir()).toBe('');
  });

  it('skips share dir when machines has no XML files', () => {
    const homePath = path.join(os.homedir(), '.openMSX', 'share');
    const usrPath = '/usr/share/openmsx';
    // Home path exists with machines dir, but no XMLs; usr path has XMLs
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === homePath || s === path.join(homePath, 'machines')
          || s === usrPath || s === path.join(usrPath, 'machines');
    });
    mockReaddirSync.mockImplementation((p: any) => {
      const s = p.toString();
      if (s.endsWith('machines') && s.startsWith(homePath)) return ['README'] as any;
      return ['National_CF-3300.xml'] as any;
    });
    expect(detectOpenMSXShareDir()).toBe(usrPath);
  });

  it('returns first matching path (priority order)', () => {
    const homePath = path.join(os.homedir(), '.openMSX', 'share');
    const usrPath = '/usr/share/openmsx';
    // Both exist — should return home path (first in list)
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === homePath || s === path.join(homePath, 'machines')
          || s === usrPath || s === path.join(usrPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(homePath);
  });

  it('detects Windows Documents path', () => {
    const docsPath = path.join(os.homedir(), 'Documents', 'openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === docsPath || s === path.join(docsPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(docsPath);
  });

  it('detects Windows APPDATA path when env var is set', () => {
    process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming';
    const appDataPath = path.join('C:\\Users\\test\\AppData\\Roaming', 'openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === appDataPath || s === path.join(appDataPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(appDataPath);
  });

  it('detects Windows LOCALAPPDATA path when env var is set', () => {
    process.env.LOCALAPPDATA = 'C:\\Users\\test\\AppData\\Local';
    const localPath = path.join('C:\\Users\\test\\AppData\\Local', 'openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === localPath || s === path.join(localPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(localPath);
  });

  it('detects Windows portable install in home dir', () => {
    const portablePath = path.join(os.homedir(), 'openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === portablePath || s === path.join(portablePath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(portablePath);
  });

  it('detects Windows Program Files path', () => {
    process.env.PROGRAMFILES = 'C:\\Program Files';
    const progPath = path.join('C:\\Program Files', 'openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === progPath || s === path.join(progPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(progPath);
  });

  it('detects Windows Program Files (x86) path', () => {
    process.env['PROGRAMFILES(X86)'] = 'C:\\Program Files (x86)';
    const progPath = path.join('C:\\Program Files (x86)', 'openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === progPath || s === path.join(progPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(progPath);
  });

  it('skips APPDATA path when env var is not set', () => {
    delete process.env.APPDATA;
    // No paths exist
    expect(detectOpenMSXShareDir()).toBe('');
    // existsSync should NOT have been called with undefined-based paths
    const calledPaths = mockExistsSync.mock.calls.map(c => c[0]?.toString() ?? '');
    expect(calledPaths.every(p => !p.includes('undefined'))).toBe(true);
  });

  it('detects macOS Application Support path', () => {
    const macPath = path.join(os.homedir(), 'Library', 'Application Support', 'openMSX', 'share');
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === macPath || s === path.join(macPath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(macPath);
  });

  it('detects macOS app bundle Resources path', () => {
    const bundlePath = '/Applications/openMSX.app/Contents/Resources/share';
    mockExistsSync.mockImplementation((p: any) => {
      const s = p.toString();
      return s === bundlePath || s === path.join(bundlePath, 'machines');
    });
    mockReaddirSync.mockReturnValue(['National_CF-3300.xml'] as any);
    expect(detectOpenMSXShareDir()).toBe(bundlePath);
  });
});

// ─── detectOpenMSXExecutable ─────────────────────────────────────────────────

describe('detectOpenMSXExecutable', () => {
  it('returns openmsx.exe on Windows', () => {
    setPlatform('win32');
    expect(detectOpenMSXExecutable()).toBe('openmsx.exe');
  });

  it('returns app bundle path on macOS when it exists', () => {
    setPlatform('darwin');
    mockExistsSync.mockImplementation((p: any) =>
      p.toString() === '/Applications/openMSX.app/Contents/MacOS/openmsx'
    );
    expect(detectOpenMSXExecutable()).toBe('/Applications/openMSX.app/Contents/MacOS/openmsx');
  });

  it('returns openmsx fallback on macOS when bundle not found', () => {
    setPlatform('darwin');
    mockExistsSync.mockReturnValue(false);
    expect(detectOpenMSXExecutable()).toBe('openmsx');
  });

  it('returns openmsx on Linux', () => {
    setPlatform('linux');
    expect(detectOpenMSXExecutable()).toBe('openmsx');
  });

  it('returns openmsx on unknown platforms', () => {
    setPlatform('freebsd');
    expect(detectOpenMSXExecutable()).toBe('openmsx');
  });
});
