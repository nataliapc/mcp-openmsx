import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCleanWebpage } from '../../src/utils.js';
import { gzipSync } from 'zlib';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function makeResponse(body: string, status = 200, contentType = 'text/html') {
  return {
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    headers: new Map([['content-type', contentType]]),
    text: () => Promise.resolve(body),
    arrayBuffer: () => Promise.resolve(Buffer.from(body).buffer),
  };
}

function makeGzipResponse(body: string) {
  const compressed = gzipSync(Buffer.from(body));
  return {
    status: 200,
    statusText: 'OK',
    headers: new Map([['content-type', 'application/x-gzip']]),
    text: () => Promise.resolve(body),
    arrayBuffer: () => Promise.resolve(compressed.buffer.slice(
      compressed.byteOffset, compressed.byteOffset + compressed.byteLength
    )),
  };
}

// ─── fetchCleanWebpage ───────────────────────────────────────────────────────

describe('fetchCleanWebpage', () => {
  it('fetches and returns plain HTML content', async () => {
    mockFetch.mockResolvedValue(makeResponse('<p>Hello World</p>'));
    const [content, mime] = await fetchCleanWebpage('https://example.com');
    expect(content).toContain('Hello World');
    expect(mime).toBe('text/html');
  });

  it('sanitizes HTML (removes scripts)', async () => {
    mockFetch.mockResolvedValue(
      makeResponse('<p>Safe</p><script>alert("xss")</script>')
    );
    const [content] = await fetchCleanWebpage('https://example.com');
    expect(content).toContain('Safe');
    expect(content).not.toContain('script');
    expect(content).not.toContain('alert');
  });

  it('returns non-HTML content as-is with correct MIME type', async () => {
    mockFetch.mockResolvedValue(makeResponse('plain text data', 200, 'text/plain'));
    const [content, mime] = await fetchCleanWebpage('https://example.com/data.txt');
    expect(content).toBe('plain text data');
    expect(mime).toBe('text/plain');
  });

  it('decompresses gzipped content', async () => {
    mockFetch.mockResolvedValue(makeGzipResponse('<p>Compressed</p>'));
    const [content, mime] = await fetchCleanWebpage('https://example.com/page.gz');
    expect(content).toContain('Compressed');
    expect(mime).toBe('text/html');
  });

  it('throws on non-200 HTTP status', async () => {
    mockFetch.mockResolvedValue(makeResponse('', 404, 'text/html'));
    await expect(fetchCleanWebpage('https://example.com/missing'))
      .rejects.toThrow('HTTP 404');
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(fetchCleanWebpage('https://unreachable.test'))
      .rejects.toThrow('Error fetching resource');
  });

  it('includes URL in error message', async () => {
    mockFetch.mockRejectedValue(new Error('timeout'));
    await expect(fetchCleanWebpage('https://slow.test/page'))
      .rejects.toThrow('https://slow.test/page');
  });
});
