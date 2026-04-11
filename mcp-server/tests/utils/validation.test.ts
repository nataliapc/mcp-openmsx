import { describe, it, expect } from 'vitest';
import {
  is16bitRegister,
  isErrorResponse,
  getResponseContent,
} from '../../src/utils.js';

// ─── is16bitRegister ─────────────────────────────────────────────────────────

describe('is16bitRegister', () => {
  const VALID_16BIT = ['pc', 'sp', 'ix', 'iy', 'af', 'bc', 'de', 'hl'];

  for (const reg of VALID_16BIT) {
    it(`returns true for "${reg}"`, () => {
      expect(is16bitRegister(reg)).toBe(true);
    });
  }

  it('is case insensitive', () => {
    expect(is16bitRegister('PC')).toBe(true);
    expect(is16bitRegister('Sp')).toBe(true);
    expect(is16bitRegister('IX')).toBe(true);
  });

  it('returns false for 8-bit registers', () => {
    expect(is16bitRegister('a')).toBe(false);
    expect(is16bitRegister('b')).toBe(false);
    expect(is16bitRegister('c')).toBe(false);
    expect(is16bitRegister('d')).toBe(false);
    expect(is16bitRegister('e')).toBe(false);
    expect(is16bitRegister('h')).toBe(false);
    expect(is16bitRegister('l')).toBe(false);
    expect(is16bitRegister('f')).toBe(false);
  });

  it('returns false for special registers', () => {
    expect(is16bitRegister('i')).toBe(false);
    expect(is16bitRegister('r')).toBe(false);
    expect(is16bitRegister('im')).toBe(false);
    expect(is16bitRegister('iff')).toBe(false);
  });

  it('returns false for invalid names', () => {
    expect(is16bitRegister('xx')).toBe(false);
    expect(is16bitRegister('')).toBe(false);
  });
});

// ─── isErrorResponse ─────────────────────────────────────────────────────────

describe('isErrorResponse', () => {
  it('detects "Error:" prefix', () => {
    expect(isErrorResponse('Error: something went wrong')).toBe(true);
  });

  it('detects "error:" prefix (lowercase)', () => {
    expect(isErrorResponse('error: something went wrong')).toBe(true);
  });

  it('returns false for normal responses', () => {
    expect(isErrorResponse('Ok')).toBe(false);
    expect(isErrorResponse('0x4000')).toBe(false);
    expect(isErrorResponse('')).toBe(false);
  });

  it('returns false when "Error:" is not at the start', () => {
    expect(isErrorResponse('This is not an Error: message')).toBe(false);
  });
});

// ─── getResponseContent ──────────────────────────────────────────────────────

describe('getResponseContent', () => {
  it('formats single line response', () => {
    const result = getResponseContent(['Hello']);
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toEqual({ type: 'text', text: 'Hello' });
    expect(result.isError).toBe(false);
  });

  it('formats multiple lines', () => {
    const result = getResponseContent(['Line 1', 'Line 2', 'Line 3']);
    expect(result.content).toHaveLength(3);
    expect(result.content[0].text).toBe('Line 1');
    expect(result.content[2].text).toBe('Line 3');
  });

  it('replaces empty lines with "Ok"', () => {
    const result = getResponseContent(['']);
    expect(result.content[0].text).toBe('Ok');
  });

  it('respects explicit isError flag', () => {
    const result = getResponseContent(['Something'], true);
    expect(result.isError).toBe(true);
  });

  it('auto-detects error from response lines', () => {
    const result = getResponseContent(['Error: bad command']);
    expect(result.isError).toBe(true);
  });

  it('auto-detects error among multiple lines', () => {
    const result = getResponseContent(['Ok', 'Error: partial failure']);
    expect(result.isError).toBe(true);
  });

  it('does not flag non-error responses', () => {
    const result = getResponseContent(['Everything is fine']);
    expect(result.isError).toBe(false);
  });
});
