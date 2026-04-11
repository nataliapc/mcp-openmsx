import { describe, it, expect } from 'vitest';
import {
  decodeHtmlEntities,
  encodeHtmlEntities,
  encodeTypeText,
  tclPath,
} from '../../src/utils.js';

// ─── decodeHtmlEntities ──────────────────────────────────────────────────────

describe('decodeHtmlEntities', () => {
  it('decodes standard XML entities', () => {
    expect(decodeHtmlEntities('&lt;')).toBe('<');
    expect(decodeHtmlEntities('&gt;')).toBe('>');
    expect(decodeHtmlEntities('&amp;')).toBe('&');
    expect(decodeHtmlEntities('&quot;')).toBe('"');
    expect(decodeHtmlEntities('&apos;')).toBe("'");
  });

  it('decodes numeric entities', () => {
    expect(decodeHtmlEntities('&#39;')).toBe("'");
    expect(decodeHtmlEntities('&#47;')).toBe('/');
    expect(decodeHtmlEntities('&#61;')).toBe('=');
    expect(decodeHtmlEntities('&#96;')).toBe('`');
  });

  it('decodes hex entities', () => {
    expect(decodeHtmlEntities('&#x27;')).toBe("'");
    expect(decodeHtmlEntities('&#x2F;')).toBe('/');
    expect(decodeHtmlEntities('&#x3D;')).toBe('=');
    expect(decodeHtmlEntities('&#x60;')).toBe('`');
  });

  it('decodes whitespace entities', () => {
    expect(decodeHtmlEntities('&nbsp;')).toBe(' ');
    expect(decodeHtmlEntities('&#x0a;')).toBe('\n');
    expect(decodeHtmlEntities('&#x0A;')).toBe('\n');
    expect(decodeHtmlEntities('&#10;')).toBe('\n');
    expect(decodeHtmlEntities('&#13;')).toBe('\r');
    expect(decodeHtmlEntities('&#9;')).toBe('\t');
  });

  it('passes through unknown entities unchanged', () => {
    expect(decodeHtmlEntities('&unknown;')).toBe('&unknown;');
    expect(decodeHtmlEntities('&#9999;')).toBe('&#9999;');
  });

  it('decodes multiple entities in a string', () => {
    expect(decodeHtmlEntities('set &quot;renderer&quot; &lt;SDLGL-PP&gt;'))
      .toBe('set "renderer" <SDLGL-PP>');
  });

  it('returns empty string unchanged', () => {
    expect(decodeHtmlEntities('')).toBe('');
  });

  it('returns string without entities unchanged', () => {
    expect(decodeHtmlEntities('hello world 123')).toBe('hello world 123');
  });
});

// ─── encodeHtmlEntities ──────────────────────────────────────────────────────

describe('encodeHtmlEntities', () => {
  it('encodes standard XML characters', () => {
    expect(encodeHtmlEntities('<')).toBe('&lt;');
    expect(encodeHtmlEntities('>')).toBe('&gt;');
    expect(encodeHtmlEntities('&')).toBe('&amp;');
    expect(encodeHtmlEntities('"')).toBe('&quot;');
    expect(encodeHtmlEntities("'")).toBe('&apos;');
  });

  it('encodes slash and equals', () => {
    expect(encodeHtmlEntities('/')).toBe('&#47;');
    expect(encodeHtmlEntities('=')).toBe('&#61;');
  });

  it('encodes non-ASCII characters (≥127) as numeric entities', () => {
    expect(encodeHtmlEntities('\u00A0')).toBe('&#160;');  // non-breaking space
    expect(encodeHtmlEntities('\u00E9')).toBe('&#233;');  // é
  });

  it('leaves normal text unchanged', () => {
    expect(encodeHtmlEntities('hello world 123')).toBe('hello world 123');
  });

  it('encodes a full TCL command', () => {
    const encoded = encodeHtmlEntities('set "renderer" <SDLGL-PP>');
    expect(encoded).toContain('&quot;');
    expect(encoded).toContain('&lt;');
    expect(encoded).toContain('&gt;');
    expect(encoded).not.toContain('"');
    expect(encoded).not.toContain('<');
    expect(encoded).not.toContain('>');
  });

  it('returns empty string unchanged', () => {
    expect(encodeHtmlEntities('')).toBe('');
  });
});

// ─── encode/decode roundtrip ─────────────────────────────────────────────────

describe('encode/decode roundtrip', () => {
  const testStrings = [
    'simple text',
    'set "renderer" <SDLGL-PP>',
    "it's a test",
    'path/to/file',
    'a = b & c < d > e',
    '',
  ];

  for (const original of testStrings) {
    it(`roundtrips: ${JSON.stringify(original)}`, () => {
      expect(decodeHtmlEntities(encodeHtmlEntities(original))).toBe(original);
    });
  }
});

// ─── encodeTypeText ──────────────────────────────────────────────────────────

describe('encodeTypeText', () => {
  it('escapes carriage return', () => {
    expect(encodeTypeText('\r')).toBe('\\r');
  });

  it('escapes tab', () => {
    expect(encodeTypeText('\t')).toBe('\\t');
  });

  it('escapes double quotes', () => {
    expect(encodeTypeText('"')).toBe('\\"');
  });

  it('leaves normal text unchanged', () => {
    expect(encodeTypeText('10 PRINT "HELLO"')).toBe('10 PRINT \\"HELLO\\"');
  });

  it('handles mixed special characters', () => {
    expect(encodeTypeText('LINE1\rLINE2\t"END"'))
      .toBe('LINE1\\rLINE2\\t\\"END\\"');
  });

  it('returns empty string unchanged', () => {
    expect(encodeTypeText('')).toBe('');
  });
});

// ─── tclPath ─────────────────────────────────────────────────────────────────

describe('tclPath', () => {
  it('converts Windows backslashes to forward slashes', () => {
    expect(tclPath('C:\\Users\\test\\screenshots\\mcp_'))
      .toBe('C:/Users/test/screenshots/mcp_');
  });

  it('leaves Linux/macOS paths unchanged', () => {
    expect(tclPath('/home/user/.openMSX/share/screenshots'))
      .toBe('/home/user/.openMSX/share/screenshots');
  });

  it('handles mixed separators', () => {
    expect(tclPath('C:\\Users/test\\file'))
      .toBe('C:/Users/test/file');
  });

  it('returns empty string unchanged', () => {
    expect(tclPath('')).toBe('');
  });
});
