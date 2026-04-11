import { describe, it, expect } from 'vitest';
import {
  buildKeyComboCommand,
  MSX_KEY_MATRIX,
} from '../../src/utils.js';

// ─── MSX_KEY_MATRIX ──────────────────────────────────────────────────────────

describe('MSX_KEY_MATRIX', () => {
  it('contains 25 key definitions', () => {
    expect(Object.keys(MSX_KEY_MATRIX).length).toBe(25);
  });

  it('all keys use rows 6, 7, or 8', () => {
    for (const [key, [row]] of Object.entries(MSX_KEY_MATRIX)) {
      expect(row, `key "${key}" has invalid row ${row}`).toBeGreaterThanOrEqual(6);
      expect(row, `key "${key}" has invalid row ${row}`).toBeLessThanOrEqual(8);
    }
  });

  it('all masks are valid single-bit or power-of-2 values (0x01..0x80)', () => {
    const validMasks = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];
    for (const [key, [, mask]] of Object.entries(MSX_KEY_MATRIX)) {
      expect(validMasks, `key "${key}" has invalid mask 0x${mask.toString(16)}`).toContain(mask);
    }
  });

  it('ENTER is an alias for RETURN (same row and mask)', () => {
    expect(MSX_KEY_MATRIX['ENTER']).toEqual(MSX_KEY_MATRIX['RETURN']);
  });

  it('modifier keys are on row 6', () => {
    expect(MSX_KEY_MATRIX['SHIFT'][0]).toBe(6);
    expect(MSX_KEY_MATRIX['CTRL'][0]).toBe(6);
    expect(MSX_KEY_MATRIX['GRAPH'][0]).toBe(6);
    expect(MSX_KEY_MATRIX['CAPS'][0]).toBe(6);
    expect(MSX_KEY_MATRIX['CODE'][0]).toBe(6);
  });

  it('navigation keys are on row 8', () => {
    expect(MSX_KEY_MATRIX['LEFT'][0]).toBe(8);
    expect(MSX_KEY_MATRIX['RIGHT'][0]).toBe(8);
    expect(MSX_KEY_MATRIX['UP'][0]).toBe(8);
    expect(MSX_KEY_MATRIX['DOWN'][0]).toBe(8);
    expect(MSX_KEY_MATRIX['SPACE'][0]).toBe(8);
  });
});

// ─── buildKeyComboCommand ────────────────────────────────────────────────────

describe('buildKeyComboCommand', () => {
  it('builds a single key press command', () => {
    const cmd = buildKeyComboCommand(['CTRL']);
    // CTRL is row 6, mask 0x02 = 2
    expect(cmd).toBe('keymatrixdown 6 2 ; after time 0.1 { keymatrixup 6 2 }');
  });

  it('builds CTRL+STOP combo', () => {
    const cmd = buildKeyComboCommand(['CTRL', 'STOP']);
    // CTRL: row 6, mask 2; STOP: row 7, mask 16
    expect(cmd).toBe(
      'keymatrixdown 6 2 ; keymatrixdown 7 16 ; after time 0.1 { keymatrixup 6 2 ; keymatrixup 7 16 }'
    );
  });

  it('uses custom hold time', () => {
    const cmd = buildKeyComboCommand(['ESC'], 500);
    expect(cmd).toContain('after time 0.5');
  });

  it('defaults to 100ms hold time', () => {
    const cmd = buildKeyComboCommand(['F1']);
    expect(cmd).toContain('after time 0.1');
  });

  it('is case insensitive for key names', () => {
    const cmdLower = buildKeyComboCommand(['ctrl']);
    const cmdUpper = buildKeyComboCommand(['CTRL']);
    expect(cmdLower).toBe(cmdUpper);
  });

  it('throws for empty key array', () => {
    expect(() => buildKeyComboCommand([])).toThrow('No keys provided');
  });

  it('throws for unknown key name', () => {
    expect(() => buildKeyComboCommand(['NONEXISTENT'])).toThrow('Unknown key "NONEXISTENT"');
  });

  it('throws listing valid keys in error message', () => {
    try {
      buildKeyComboCommand(['BAD']);
    } catch (e: any) {
      expect(e.message).toContain('SHIFT');
      expect(e.message).toContain('CTRL');
      expect(e.message).toContain('SPACE');
    }
  });

  it('handles three-key combo', () => {
    const cmd = buildKeyComboCommand(['SHIFT', 'CTRL', 'F1']);
    // SHIFT: row 6, mask 1; CTRL: row 6, mask 2; F1: row 6, mask 32
    expect(cmd).toContain('keymatrixdown 6 1');
    expect(cmd).toContain('keymatrixdown 6 2');
    expect(cmd).toContain('keymatrixdown 6 32');
    expect(cmd).toContain('keymatrixup 6 1');
    expect(cmd).toContain('keymatrixup 6 2');
    expect(cmd).toContain('keymatrixup 6 32');
  });
});
