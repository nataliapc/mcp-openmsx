import { describe, it, expect } from 'vitest';
import { buildIpsPatch, bytesToHexList } from '../../src/utils.js';

function applyIps(original: Buffer, ips: Buffer): Buffer {
	const result = Buffer.from(original);
	// magic
	expect(ips.subarray(0, 5).toString('ascii')).toBe('PATCH');
	let pos = 5;
	while (pos + 3 < ips.length) {
		const eof = ips.subarray(pos, pos + 3).toString('ascii');
		if (eof === 'EOF') break;
		const offset = (ips[pos] << 16) | (ips[pos + 1] << 8) | ips[pos + 2];
		const size = ips.readUInt16BE(pos + 3);
		pos += 5;
		if (size === 0) {
			const rleLen = ips.readUInt16BE(pos);
			const value = ips[pos + 2];
			pos += 3;
			for (let i = 0; i < rleLen; i++) {
				result[offset + i] = value;
			}
		} else {
			for (let i = 0; i < size; i++) {
				result[offset + i] = ips[pos + i];
			}
			pos += size;
		}
	}
	return result;
}

describe('buildIpsPatch', () => {
	it('produces no records when the bytes are identical', () => {
		const original = Buffer.from([0x00, 0x11, 0x22, 0x33]);
		const ips = buildIpsPatch(original, Buffer.from(original));
		expect(ips.toString('ascii', 0, 5)).toBe('PATCH');
		expect(ips.subarray(5).toString('ascii')).toBe('EOF');
	});

	it('builds a patch that round-trips a single differing run', () => {
		const original = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44, 0x55]);
		const patched = Buffer.from([0x00, 0xAA, 0xBB, 0x33, 0x44, 0x55]);
		const ips = buildIpsPatch(original, patched);
		expect(applyIps(original, ips)).toEqual(patched);
	});

	it('round-trips multiple separated differing runs', () => {
		const original = Buffer.alloc(0x100);
		const patched = Buffer.from(original);
		patched[0x10] = 0xFF;
		patched[0x20] = 0x7F;
		patched[0xFE] = 0x01;
		const ips = buildIpsPatch(original, patched);
		expect(applyIps(original, ips)).toEqual(patched);
	});

	it('round-trips an all-differing buffer', () => {
		const original = Buffer.alloc(64);
		const patched = Buffer.alloc(64, 0x5A);
		const ips = buildIpsPatch(original, patched);
		expect(applyIps(original, ips)).toEqual(patched);
	});

	it('rejects mismatched lengths', () => {
		expect(() => buildIpsPatch(Buffer.alloc(2), Buffer.alloc(3))).toThrow(/equal length/);
	});
});

describe('bytesToHexList', () => {
	it('formats bytes as space-separated 0xNN', () => {
		const buf = Buffer.from([0x3E, 0x01, 0xC3, 0x00, 0x10]);
		expect(bytesToHexList(buf)).toBe('0x3E 0x01 0xC3 0x00 0x10');
	});

	it('pads single hex digits with a leading zero and uppercases', () => {
		const buf = Buffer.from([0x0A, 0xF5]);
		expect(bytesToHexList(buf)).toBe('0x0A 0xF5');
	});

	it('returns an empty string for an empty buffer', () => {
		expect(bytesToHexList(Buffer.alloc(0))).toBe('');
	});
});
