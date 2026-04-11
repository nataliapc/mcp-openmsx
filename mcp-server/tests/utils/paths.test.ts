import { describe, it, expect } from 'vitest';
import { detectOpenMSXExecutable } from '../../src/utils.js';

// ─── detectOpenMSXExecutable ─────────────────────────────────────────────────

describe('detectOpenMSXExecutable', () => {
  it('returns a non-empty string', () => {
    const result = detectOpenMSXExecutable();
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns platform-appropriate executable', () => {
    const result = detectOpenMSXExecutable();
    if (process.platform === 'win32') {
      expect(result).toBe('openmsx.exe');
    } else if (process.platform === 'darwin') {
      // Either the .app bundle path or 'openmsx' fallback
      expect(result).toMatch(/openmsx/);
    } else {
      expect(result).toBe('openmsx');
    }
  });
});
