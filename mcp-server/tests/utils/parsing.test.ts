import { describe, it, expect } from 'vitest';
import {
  parseCpuRegs,
  parseVdpRegs,
  parsePalette,
  parseBreakpoints,
  parseReplayStatus,
} from '../../src/utils.js';

// ─── parseCpuRegs ────────────────────────────────────────────────────────────

describe('parseCpuRegs', () => {
  const FULL_OUTPUT = [
    'AF =0044  BC =0000  DE =0000  HL =F380',
    "AF'=0000  BC'=0000  DE'=0000  HL'=0000",
    'IX =0000  IY =0000  PC =632F  SP =F37E',
    'I  =00    R  =5D    IM =01    IFF=01',
  ].join('\n');

  it('parses all 16 registers from standard cpuregs output', () => {
    const regs = parseCpuRegs(FULL_OUTPUT);
    expect(Object.keys(regs)).toHaveLength(16);
    expect(regs['AF']).toBe('0044');
    expect(regs['PC']).toBe('632F');
    expect(regs['SP']).toBe('F37E');
    expect(regs['I']).toBe('00');
    expect(regs['R']).toBe('5D');
    expect(regs['IFF']).toBe('01');
  });

  it('parses alternate register set (AF\', BC\', etc.)', () => {
    const regs = parseCpuRegs(FULL_OUTPUT);
    expect(regs["AF'"]).toBe('0000');
    expect(regs["BC'"]).toBe('0000');
    expect(regs["DE'"]).toBe('0000');
    expect(regs["HL'"]).toBe('0000');
  });

  it('returns empty object for empty input', () => {
    expect(parseCpuRegs('')).toEqual({});
  });

  it('handles partial output', () => {
    const regs = parseCpuRegs('AF =1234  BC =5678');
    expect(regs).toEqual({ AF: '1234', BC: '5678' });
  });

  it('handles lowercase hex values', () => {
    const regs = parseCpuRegs('AF =abcd');
    expect(regs['AF']).toBe('abcd');
  });
});

// ─── parseVdpRegs ────────────────────────────────────────────────────────────

describe('parseVdpRegs', () => {
  const FULL_OUTPUT = [
    ' 0 : 0x04    8 : 0x08   16 : 0x00   24 : 0x00',
    ' 1 : 0x70    9 : 0x02   17 : 0x18   25 : 0x00',
    ' 2 : 0x06   10 : 0x00   18 : 0x00   26 : 0x00',
    ' 3 : 0x80   11 : 0x00   19 : 0x00   27 : 0x00',
    ' 4 : 0x00   12 : 0x00   20 : 0x00',
    ' 5 : 0x36   13 : 0x00   21 : 0x00',
    ' 6 : 0x07   14 : 0x00   22 : 0x00',
    ' 7 : 0xF4   15 : 0x00   23 : 0x00',
  ].join('\n');

  it('parses all 28 VDP registers', () => {
    const regs = parseVdpRegs(FULL_OUTPUT);
    expect(Object.keys(regs).length).toBeGreaterThanOrEqual(28);
    expect(regs['0']).toBe('0x04');
    expect(regs['7']).toBe('0xF4');
    expect(regs['16']).toBe('0x00');
    expect(regs['27']).toBe('0x00');
  });

  it('returns empty object for empty input', () => {
    expect(parseVdpRegs('')).toEqual({});
  });

  it('handles single register line', () => {
    const regs = parseVdpRegs(' 5 : 0xFF');
    expect(regs).toEqual({ '5': '0xFF' });
  });
});

// ─── parsePalette ────────────────────────────────────────────────────────────

describe('parsePalette', () => {
  const FULL_OUTPUT = [
    ' 0:000  4:117  8:711  c:141',
    ' 1:000  5:237  9:733  d:625',
    ' 2:611  6:171  a:771  e:666',
    ' 3:272  7:567  b:773  f:777',
  ].join('\n');

  it('parses all 16 palette entries', () => {
    const palette = parsePalette(FULL_OUTPUT);
    expect(palette).toHaveLength(16);
  });

  it('returns entries sorted by index', () => {
    const palette = parsePalette(FULL_OUTPUT);
    for (let i = 0; i < palette.length - 1; i++) {
      expect(palette[i].index).toBeLessThan(palette[i + 1].index);
    }
  });

  it('parses RGB components correctly', () => {
    const palette = parsePalette(FULL_OUTPUT);
    const color0 = palette.find(p => p.index === 0)!;
    expect(color0).toEqual({ index: 0, r: 0, g: 0, b: 0, rgb: '000' });
    const color4 = palette.find(p => p.index === 4)!;
    expect(color4).toEqual({ index: 4, r: 1, g: 1, b: 7, rgb: '117' });
    const colorF = palette.find(p => p.index === 15)!;
    expect(colorF).toEqual({ index: 15, r: 7, g: 7, b: 7, rgb: '777' });
  });

  it('handles hex indices (a-f)', () => {
    const palette = parsePalette(' a:321');
    expect(palette[0].index).toBe(10);
    expect(palette[0].rgb).toBe('321');
  });

  it('returns empty array for empty input', () => {
    expect(parsePalette('')).toEqual([]);
  });
});

// ─── parseBreakpoints ────────────────────────────────────────────────────────

describe('parseBreakpoints', () => {
  it('parses multiple breakpoints', () => {
    const input = 'bp#1 0x4000 {} {debug break}\nbp#2 0x8000 {} {debug break}';
    const bps = parseBreakpoints(input);
    expect(bps).toHaveLength(2);
    expect(bps[0]).toEqual({ name: 'bp#1', address: '0x4000', condition: '', command: 'debug break' });
    expect(bps[1]).toEqual({ name: 'bp#2', address: '0x8000', condition: '', command: 'debug break' });
  });

  it('parses breakpoint with condition', () => {
    const input = 'bp#3 0xC000 {[reg A] == 0x42} {debug break}';
    const bps = parseBreakpoints(input);
    expect(bps).toHaveLength(1);
    expect(bps[0].condition).toBe('[reg A] == 0x42');
  });

  it('returns empty array for empty input', () => {
    expect(parseBreakpoints('')).toEqual([]);
    expect(parseBreakpoints('   ')).toEqual([]);
  });

  it('skips malformed lines', () => {
    const input = 'bp#1 0x4000 {} {debug break}\ngarbage line\nbp#2 0x8000 {} {debug break}';
    const bps = parseBreakpoints(input);
    expect(bps).toHaveLength(2);
  });
});

// ─── parseReplayStatus ───────────────────────────────────────────────────────

describe('parseReplayStatus', () => {
  it('parses enabled replay status with snapshots', () => {
    const input = 'status enabled begin 0.0 end 294.08 current 294.08 snapshots {0.0 10.5 20.3} last_event 0.0';
    const status = parseReplayStatus(input);
    expect(status).toEqual({
      enabled: true,
      begin: 0.0,
      end: 294.08,
      current: 294.08,
      snapshotCount: 3,
    });
  });

  it('parses disabled replay status', () => {
    const input = 'status disabled begin 0.0 end 0.0 current 0.0 snapshots {} last_event 0.0';
    const status = parseReplayStatus(input);
    expect(status.enabled).toBe(false);
    expect(status.snapshotCount).toBe(0);
  });

  it('returns defaults for empty/invalid input', () => {
    const status = parseReplayStatus('');
    expect(status).toEqual({
      enabled: false,
      begin: 0,
      end: 0,
      current: 0,
      snapshotCount: 0,
    });
  });

  it('handles empty snapshots block', () => {
    const input = 'status enabled begin 1.0 end 5.0 current 3.0 snapshots {} last_event 0.0';
    expect(parseReplayStatus(input).snapshotCount).toBe(0);
  });
});
