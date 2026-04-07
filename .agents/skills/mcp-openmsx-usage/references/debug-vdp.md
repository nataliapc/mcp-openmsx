# Use Case: Debugging the VDP (Video Display Processor)

## Goal

Inspect and manipulate the VDP registers, palette, VRAM content, and screen modes of the MSX video processor.

## Index

- [Background](#background)
- [Step-by-Step: Inspect VDP State](#step-by-step-inspect-vdp-state)
    1. [Get current screen mode](#1-get-current-screen-mode)
    2. [Read all VDP registers](#2-read-all-vdp-registers)
    3. [Read a specific register](#3-read-a-specific-register)
    4. [Get palette (MSX2/MSX2+ only)](#4-get-palette-msx2msx2-only)
    5. [Read screen text content](#5-read-screen-text-content)
- [Modifying VDP Registers](#modifying-vdp-registers)
    - [Set a register value](#set-a-register-value)
- [Inspecting VRAM](#inspecting-vram)
    - [Hex dump of VRAM](#hex-dump-of-vram)
    - [Read single VRAM byte](#read-single-vram-byte)
    - [Write VRAM byte](#write-vram-byte)
    - [Search for a byte pattern in VRAM](#search-for-a-byte-pattern-in-vram)
- [Common VRAM Layouts](#common-vram-layouts)
    - [SCREEN 0 WIDTH 40 (TEXT1, 40x24 text mode)](#screen-0-width-40-text1-40x24-text-mode)
    - [SCREEN 0 WIDTH 80 (TEXT2, 80x24 text mode, V9938)](#screen-0-width-80-text2-80x24-text-mode-v9938)
    - [SCREEN 1 (GRAPHIC1, 32x24 text mode)](#screen-1-graphic1-32x24-text-mode)
    - [SCREEN 2 (GRAPHIC2, 256x192 bitmap)](#screen-2-graphic2-256x192-bitmap)
    - [SCREEN 3 (MULTICOLOR, 64x48 blocks)](#screen-3-multicolor-64x48-blocks)
    - [SCREEN 4 (GRAPHIC3, V9938, sprites mode 2)](#screen-4-graphic3-v9938-sprites-mode-2)
    - [SCREEN 5 (GRAPHIC4, V9938, 256x212 4bpp)](#screen-5-graphic4-v9938-256x212-4bpp)
    - [SCREEN 6 (GRAPHIC5, V9938, 512x212 2bpp)](#screen-6-graphic5-v9938-512x212-2bpp)
    - [SCREEN 7 (GRAPHIC6, V9938, 512x212 4bpp)](#screen-7-graphic6-v9938-512x212-4bpp)
    - [SCREEN 8 (GRAPHIC7, V9938, 256x212 8bpp)](#screen-8-graphic7-v9938-256x212-8bpp)
    - [SCREEN 10/11 (GRAPHIC7+YAE, V9958, YJK+palette)](#screen-1011-graphic7yae-v9958-yjkpalette)
    - [SCREEN 12 (GRAPHIC7+YJK, V9958, full YJK)](#screen-12-graphic7yjk-v9958-full-yjk)
- [Debugging Workflow: Verify Sprite Rendering](#debugging-workflow-verify-sprite-rendering)
- [Debugging Workflow: Analyze Screen Corruption](#debugging-workflow-analyze-screen-corruption)
- [Debugging Workflow: VDP Command Hang (YMMM/HMMM/HMMC)](#debugging-workflow-vdp-command-hang-ymmmhmmm-hmmc)
- [Debugging Workflow: Find a Tile / Character Pattern in VRAM](#debugging-workflow-find-a-tile--character-pattern-in-vram)
- [Debugging Workflow: Locate a Sprite Pattern in VRAM](#debugging-workflow-locate-a-sprite-pattern-in-vram)
- [Useful Resources](#useful-resources)

## Background

The MSX uses TMS9918A (MSX1), V9938 (MSX2), or V9958 (MSX2+) VDP chips. The VDP has:
- **32 control registers** (R#0-R#31, MSX2/2+ only; MSX1 has R#0-R#7)
- **Up to 128KB VRAM** (20-bit address space, 0x00000-0x1FFFF)
- **16 configurable palette colors** (V9938/V9958 only, RGB333 format)

## Step-by-Step: Inspect VDP State

### 1. Get current screen mode

```
emu_vdp { command: "screenGetMode" }
```

Returns the current mode: TEXT40, TEXT80, GRAPHIC1, GRAPHIC2, GRAPHIC3, GRAPHIC4, GRAPHIC5, GRAPHIC6, GRAPHIC7, etc.

### 2. Read all VDP registers

```
emu_vdp { command: "getRegisters" }
```

Returns all 32 register values as hex strings keyed by register number.

### 3. Read a specific register

```
emu_vdp { command: "getRegisterValue", register: 7 }
```

Key registers:

| Register | Purpose |
|----------|---------|
| R#0 | Mode register 0 (M3, M4, M5 bits) |
| R#1 | Mode register 1 (screen on/off, VBLANK IE, sprite size, M1, M2 bits) |
| R#2 | Name table base address |
| R#3 | Color table base address (low) |
| R#4 | Pattern generator base address |
| R#5 | Sprite attribute table base address (low) |
| R#6 | Sprite pattern generator base address |
| R#7 | Text/backdrop color (high nibble=text color, low nibble=backdrop) |
| R#8-R#23 | V9938/V9958 extended registers |

### 4. Get palette (MSX2/MSX2+ only)

```
emu_vdp { command: "getPalette" }
```

Returns 16 palette entries with `{index, r, g, b, rgb}` in RGB333 format (3 bits per channel = 512 possible colors).

### 5. Read screen text content

```
emu_vdp { command: "screenGetFullText" }
```

Works in text modes (SCREEN 0 / SCREEN 1) only.

## Modifying VDP Registers

### Set a register value

```
emu_vdp { command: "setRegisterValue", register: 7, value: "0x1F" }
```

**Caution**: Changing VDP registers at runtime can alter the display immediately. Incorrect values can corrupt the screen or produce unstable video output.

## Inspecting VRAM

VRAM addresses are **20-bit** (5 hex digits, e.g. `0x00000`).

### Hex dump of VRAM

```
debug_vram { command: "getBlock", address: "0x00000", lines: 8 }
```

16 bytes per line x N lines. Useful for viewing pattern tables, name tables, sprite data.

### Read single VRAM byte

```
debug_vram { command: "readByte", address: "0x01800" }
```

### Write VRAM byte

```
debug_vram { command: "writeByte", address: "0x01800", value8: "0x41" }
```

### Search for a byte pattern in VRAM

Scan a VRAM region for a specific sequence of bytes. Up to 65536 bytes per call; for MSX2 (128KB VRAM) scan both halves:

```
# First 64KB (0x00000–0x0FFFF)
debug_vram { command: "searchBytes", address: "0x00000", length: 65536, values: "0x42 0x41" }

# Second 64KB — MSX2 only (0x10000–0x1FFFF)
debug_vram { command: "searchBytes", address: "0x10000", length: 65536, values: "0x42 0x41" }
```

Returns all matching addresses, or a not-found message. Narrow the range with `address` + `length` when you know roughly where to look.

## Common VRAM Layouts

### SCREEN 0 WIDTH 40 (TEXT1, 40x24 text mode)

Standard 40-column text mode. Available on MSX1 and above (TMS9918A / V9938 / V9958). The MSX boot screen uses this mode. `screenGetFullText` works in this mode.

**Key parameters:**
- **40 columns × 24 rows** of 6×8 pixel characters
- Name table: 40×24 = 960 bytes
- No sprites in TEXT1 mode
- Colors: single foreground + backdrop color via R#7 (no per-character color)

| Address Range | Content |
|---------------|---------|
| 0x00000–0x003BF | Pattern name table (40×24 = 960 bytes) |
| 0x00400–0x0042F | Palette table (MSX2 only; `0x00400`–`0x0042F`, 48 bytes) |
| 0x00800–0x00FFF | Pattern generator table (256 chars × 8 bytes = 2KB) |

> **Reading text content:** use `emu_vdp { command: "screenGetFullText" }` — faster and more reliable than reading VRAM manually.
> **R#7** controls foreground (high nibble) and backdrop (low nibble) colors.
> **MSX1:** palette not configurable; uses fixed TMS9918A colors.

### SCREEN 0 WIDTH 80 (TEXT2, 80x24 text mode, V9938)

80-column text mode. V9938 (MSX2) required. Used by MSX-DOS 2 command line and many MSX2 applications. `screenGetFullText` works in this mode.

**Key parameters:**
- **80 columns × 24 rows** of 6×8 pixel characters (some implementations use 26.5 rows)
- Name table: 80×24 = 1920 bytes + optional blink table
- No sprites in TEXT2 mode
- Supports **blinking** per character via blink table + R#13

| Address Range | Content |
|---------------|---------|
| 0x00000–0x0077F | Pattern name table (80×24 = 1920 bytes) |
| 0x00800–0x008EF | Blink table (24 lines mode, 1 bit per char, 240 bytes) |
| 0x00800–0x0090D | Blink table (26.5 lines mode, 270 bytes) |
| 0x00F00–0x00F2F | Palette table (48 bytes) |
| 0x01000–0x017FF | Pattern generator table (256 chars × 8 bytes = 2KB) |

> **Reading text content:** use `emu_vdp { command: "screenGetFullText" }`.
> **Blink control:** R#13 — high nibble = ON period (×1/10s), low nibble = OFF period. A blink table bit=1 means the character blinks.
> **Switching 40↔80:** WIDTH command in BASIC or direct VDP register manipulation. The pattern generator address changes — verify R#4.

### SCREEN 1 (GRAPHIC1, 32x24 text mode)

| Address Range | Content |
|---------------|---------|
| 0x00000-0x007FF | Pattern generator table (256 chars x 8 bytes) |
| 0x01800-0x019FF | Name table (32x24 = 768 bytes) |
| 0x02000-0x0201F | Color table (32 entries, 1 per 8 chars) |
| 0x01B00-0x01B7F | Sprite attribute table |
| 0x03800-0x03FFF | Sprite pattern generator |

### SCREEN 2 (GRAPHIC2, 256x192 bitmap)

| Address Range | Content |
|---------------|---------|
| 0x00000-0x017FF | Pattern generator table (3 banks x 2KB) |
| 0x01800-0x019FF | Name table |
| 0x02000-0x037FF | Color table (3 banks x 2KB) |
| 0x01B00-0x01B7F | Sprite attribute table |
| 0x03800-0x03FFF | Sprite pattern generator |

### SCREEN 3 (MULTICOLOR, 64x48 blocks)

Low-resolution color block mode. The screen is divided into a 64×48 grid of blocks, each 4×4 pixels. Each block has a single color from the 16-color fixed palette (same palette as SCREEN 1, not configurable on TMS9918A). Available on MSX1 and above.

**Key parameters:**
- Logical resolution: **64×48 color blocks** (each block = 4×4 pixels → 256×192 physical)
- Each block = 1 byte (low nibble = color, high nibble = color of adjacent block in some implementations)
- In practice: the pattern generator table stores the block colors; the name table maps 32×24 characters referencing those patterns
- No sprite mode 2 (uses mode 1 sprites like SCREEN 1)

| Address Range | Content |
|---------------|---------|
| 0x00000–0x007FF | Pattern generator table (block color data) |
| 0x00800–0x00AFF | Pattern name table (32×24 = 768 bytes) |
| 0x01B00–0x01B7F | Sprite attribute table |
| 0x02020–0x0204F | Palette table (MSX2 only; ignored on TMS9918A) |
| 0x03800–0x03FFF | Sprite generator table |

> **Block color encoding:** the name table maps each 8×8 character cell to a pattern. Each byte in the pattern generator encodes the color of two 4-pixel rows: high nibble = top row color, low nibble = bottom row color. The MSX BASIC `COLOR= ` sets the border/background; individual block colors are set via VPOKE.
> **MSX1 note:** The TMS9918A uses a fixed 15-color palette; colors are not configurable via R#16/R#17 palette registers (which don't exist on MSX1).

### SCREEN 4 (GRAPHIC3, V9938, sprites mode 2)

Same pixel resolution as SCREEN 2 (256×192/212) but uses **sprite mode 2** (multi-color sprites with per-line color). V9938 required.

| Address Range | Content |
|---------------|---------|
| 0x00000–0x07FF | Pattern generator table 1 |
| 0x00800–0x0FFF | Pattern generator table 2 |
| 0x01000–0x17FF | Pattern generator table 3 |
| 0x01800–0x18FF | Pattern name table 1 |
| 0x01900–0x19FF | Pattern name table 2 |
| 0x01A00–0x1AFF | Pattern name table 3 |
| 0x01B80–0x1BAF | Palette table |
| 0x01C00–0x1DFF | Sprite color table (mode 2, 512 bytes) |
| 0x01E00–0x1E7F | Sprite attribute table (mode 2) |
| 0x02000–0x27FF | Color table 1 |
| 0x02800–0x2FFF | Color table 2 |
| 0x03000–0x37FF | Color table 3 |
| 0x03800–0x3FFF | Sprite generator table |

> **Key difference from SCREEN 2**: sprite color table at `0x01C00` and sprite attribute table at `0x01E00` (sprite mode 2 format).

### SCREEN 5 (GRAPHIC4, V9938, 256x212 4bpp)

Bitmap mode, 256 pixels wide, 4 bits per pixel (16 colors from palette). Most common MSX2 graphics mode.

**Key parameters:**
- 4bpp → **128 bytes per line** (256px / 2)
- 192 lines mode: pixel data `0x00000`–`0x05FFF` (24KB)
- 212 lines mode: pixel data `0x00000`–`0x069FF` (27.2KB)
- Bytes per line: 128 — address of line N = `N * 128`

| Address Range | Content |
|---------------|---------|
| 0x00000–0x05FFF | Pixel data (192 lines) |
| 0x00000–0x069FF | Pixel data (212 lines) |
| 0x07400–0x75FF | Sprite color table |
| 0x07600–0x767F | Sprite attribute table |
| 0x07680–0x76AF | Palette table |
| 0x07A00–0x7FFF | Sprite generator table |

> **Sprite color table format (mode 2):** 512 bytes, 2 bytes per sprite per line.
> **Note:** Pages are 32KB (`0x00000`–`0x07FFF` and `0x08000`–`0x0FFFF`). Some programs use page 1 as a back buffer.

### SCREEN 6 (GRAPHIC5, V9938, 512x212 2bpp)

High horizontal resolution mode, 512 pixels wide, 2 bits per pixel (4 colors per pixel from a set of 16 palette colors). Used for sharp text or thin graphics.

**Key parameters:**
- 2bpp → **128 bytes per line** (512px / 4)
- Same bytes-per-line as SCREEN 5, but double the horizontal resolution
- Address of line N = `N * 128`
- Colors: 4 simultaneous from the 16-color palette, selectable per pixel

| Address Range | Content |
|---------------|---------|
| 0x00000–0x05FFF | Pixel data (192 lines) |
| 0x00000–0x069FF | Pixel data (212 lines) |
| 0x07400–0x75FF | Sprite color table |
| 0x07600–0x767F | Sprite attribute table |
| 0x07680–0x76AF | Palette table |
| 0x07A00–0x7FFF | Sprite generator table |

> **Pixel encoding:** each byte holds 4 pixels, 2 bits each (bits 7-6 = leftmost pixel). Color index 0-3 maps to palette entries via R#3 (color 0/1) and R#7 (color 2/3).

### SCREEN 7 (GRAPHIC6, V9938, 512x212 4bpp)

Used by the `msx2ansi` library for its 80-column terminal mode.

**Key parameters:**
- 4 bits per pixel → **256 bytes per line** (512px / 2)
- 212 visible lines → page 0 pixel data: `0x00000`–`0x0D3FF`
- **Page 1** (backup/offscreen buffer) starts at line Y=256 → VRAM offset `0x10000`
- Active display page controlled by **R#14** (display page register)

**Important caveats:**
- The visible content may **not** be at `0x00000` — check R#14 first
- Screen dump (`.SC7`) only captures ~250 lines from `0x00000` and **does not reach page 1**
- To verify a YMMM copy from page 0 to page 1, compare the same line offset in both pages:

```
# Line 32 of page 0:
debug_vram { command: "getBlock", address: "0x02000", lines: 4 }

# Same line in page 1 (32 * 256 + 0x10000 = 0x12000):
debug_vram { command: "getBlock", address: "0x12000", lines: 4 }
```

If both blocks are identical, the YMMM copy succeeded.

**VRAM layout summary:**

| Address Range | Content |
|---------------|---------|
| 0x00000–0x0BFFF | Pixel data (192 lines × 256 bytes) |
| 0x00000–0x0D3FF | Pixel data (212 lines × 256 bytes) |
| 0x0F000–0x0F7FF | Sprite generator table |
| 0x0F800–0x0F9FF | Sprite color table |
| 0x0FA00–0x0FA7F | Sprite attribute table |
| 0x0FA80–0x0FAAF | Palette table |
| 0x10000–0x1D3FF | Page 1 pixel data (backup buffer, 212 lines × 256 bytes) |

### SCREEN 8 (GRAPHIC7, V9938, 256x212 8bpp)

Full 256-color bitmap mode. No palette — colors are encoded directly as RGB332 (3 bits red, 3 bits green, 2 bits blue) per byte.

**Key parameters:**
- 8bpp → **256 bytes per line** (1 byte per pixel)
- 192 lines mode: pixel data `0x00000`–`0x0BFFF`
- 212 lines mode: pixel data `0x00000`–`0x0D3FF`
- Address of line N = `N * 256`
- **No palette** — R#14 can select display page (0 or 1)

| Address Range | Content |
|---------------|---------|
| 0x00000–0x0BFFF | Pixel data (192 lines × 256 bytes) |
| 0x00000–0x0D3FF | Pixel data (212 lines × 256 bytes) |
| 0x0F000–0x0F7FF | Sprite generator table |
| 0x0F800–0x0F9FF | Sprite color table |
| 0x0FA00–0x0FA7F | Sprite attribute table |
| 0x0FA80–0x0FAAF | Palette table (still present but ignored for pixels) |
| 0x10000–0x1D3FF | Page 1 pixel data (backup buffer) |

> **Color encoding (RGB332):** bits 7-5 = red (0-7), bits 4-2 = green (0-7), bits 1-0 = blue (0-3). To read pixel at (X, Y): address = `Y * 256 + X`.

### SCREEN 10/11 (GRAPHIC7+YAE, V9958, YJK+palette)

V9958 (MSX2+/TurboR) exclusive. Extends SCREEN 8 with YJK color encoding + per-pixel palette attribute (YAE). Up to 12499 YJK colors + 16 palette colors simultaneously. SCREEN 10 and 11 share the same VRAM layout — switching between them does not clear the screen.

**Key parameters:**
- Same VRAM layout as SCREEN 8 (256×212, 256 bytes/line)
- Activated by setting R#25 bits: `YJK=1, YAE=1` on top of SCREEN 8 mode
- Each pixel byte: bits 7-4 = Y luma (even values only), bit 3 = A (attribute), bits 2-0 = JK chroma fragment
- If A=1: bits 7-4 select a **palette color** (ignoring YJK)
- If A=0: pixel is rendered as YJK color
- 4 consecutive pixels share the same J and K chroma values

| Address Range | Content |
|---------------|---------|
| 0x00000–0x0D3FF | Pixel data (212 lines × 256 bytes, YJK+YAE encoded) |
| 0x0F000–0x0F7FF | Sprite generator table |
| 0x0F800–0x0F9FF | Sprite color table |
| 0x0FA00–0x0FA7F | Sprite attribute table |
| 0x0FA80–0x0FAAF | Palette table (used for A=1 pixels) |

> **Activating from code:** select SCREEN 8 via BIOS/VDP registers, then set bits in R#25: `YJK=1 (bit 3), YAE=1 (bit 4)`.
> **Sprites** in SCREEN 10/11 use the palette (not fixed colors like SCREEN 8).
> **SCREEN 10 vs 11:** SCREEN 10 gives a palette-color view useful for editing; SCREEN 11 shows full YJK rendering.

### SCREEN 12 (GRAPHIC7+YJK, V9958, full YJK)

V9958 exclusive. Full YJK mode with up to 19268 colors, no palette attribute per pixel. Best suited for photographic images and smooth gradients.

**Key parameters:**
- Same VRAM layout as SCREEN 8 (256×212, 256 bytes/line)
- Activated by setting R#25 bits: `YJK=1, YAE=0`
- Each pixel byte: bits 7-3 = Y luma (5 bits, 0-31), bits 2-0 = JK chroma fragment
- 4 consecutive pixels share the same J and K (6-bit signed, -32 to 31)
- **No per-pixel palette** — all pixels rendered as YJK color

| Address Range | Content |
|---------------|---------|
| 0x00000–0x0D3FF | Pixel data (212 lines × 256 bytes, YJK encoded) |
| 0x0F000–0x0F7FF | Sprite generator table |
| 0x0F800–0x0F9FF | Sprite color table |
| 0x0FA00–0x0FA7F | Sprite attribute table |
| 0x0FA80–0x0FAAF | Palette table (used by sprites only) |

> **YJK pixel group (4 bytes):** byte 0 = Y1 + K[2:0], byte 1 = Y2 + K[5:3], byte 2 = Y3 + J[2:0], byte 3 = Y4 + J[5:3].
> **Color formulas:** R = clamp(Y+J, 0,31), G = clamp(Y+K, 0,31), B = clamp((5Y-2J-K)/4, 0,31).
> **Sprites** in SCREEN 12 use the palette.

## Debugging Workflow: Verify Sprite Rendering

1. **Break execution**: `debug_run { command: "break" }`
2. **Check screen mode**: `emu_vdp { command: "screenGetMode" }`
3. **Read sprite attribute table**: `debug_vram { command: "getBlock", address: "0x01B00", lines: 8 }`
   - Each sprite: 4 bytes (Y, X, pattern#, color/EC)
4. **Read sprite pattern data**: `debug_vram { command: "getBlock", address: "0x03800", lines: 4 }`
5. **Check VDP R#1** for sprite size/magnification: `emu_vdp { command: "getRegisterValue", register: 1 }`
   - Bit 1: sprite size (0=8x8, 1=16x16), Bit 0: magnification
6. **Take screenshot**: `screen_shot { command: "as_image" }`
7. **Continue**: `debug_run { command: "continue" }`

## Debugging Workflow: Analyze Screen Corruption

1. `debug_run { command: "break" }`
2. `emu_vdp { command: "getRegisters" }` — Check all register values for unexpected changes
3. `emu_vdp { command: "screenGetMode" }` — Confirm expected screen mode
4. `debug_vram { command: "getBlock", address: "0x01800", lines: 32 }` — Dump name table for unexpected patterns
5. `emu_vdp { command: "getPalette" }` — Check palette for wrong colors
6. `screen_shot { command: "as_image" }` — Visual verification
7. Compare VRAM content with expected values from program documentation

## Debugging Workflow: VDP Command Hang (YMMM/HMMM/HMMC)

VDP block commands (YMMM, HMMM, HMMC, HMMV) are executed asynchronously. Code that calls them waits for the CE (Command Executing) bit in VDP status register S#2 to clear. If the command never finishes, the program hangs in this polling loop.

**Identifying a VDP command hang:**

Break at any point and disassemble:

```
debug_run { command: "break" }
debug_cpu { command: "disassemble" }
```

A hang in `V9938_WaitCmd` looks like:

```asm
xxxx  ld   a,#02
xxxx  di
xxxx  out  (#99),a    ; select S#2
xxxx  ld   a,#8f
xxxx  out  (#99),a
xxxx  in   a,(#99)    ; read status
xxxx  rra             ; CE bit → carry
xxxx  ...
xxxx  ret  nc         ; if CE=0, done
xxxx  jp   xxxx       ; else loop
```

**Checking the CE bit directly:**

```
emu_vdp { command: "getRegisterValue", register: 2 }
```

Bit 0 of the result = CE. If it stays `1`, the VDP command is stuck.

**Common causes:**

| Cause | Description |
|-------|-------------|
| Invalid command parameters | NX/NY=0, out-of-range coordinates, or DX/DY that exceed VRAM |
| Wrong CMD byte | Incorrect value in the CMD register of the command block |
| Bad exit path from command handler | Code jumped into a routine designed for a different call context (e.g. `JP ANSI_SGR.UNK` instead of `JP ANSI_SGR.RET`), corrupting the stack before the VDP command executes |
| VDP not in correct screen mode | Some commands are mode-specific |

**Fix approach:**

1. Break during the hang and note the PC (should be in the WaitCmd loop)
2. Use `emu_replay { command: "goBack", seconds: 1 }` to rewind to just before the hang
3. Set breakpoint at the start of the VDP command function and inspect the command parameters in RAM before `DO_YMMM`/`DO_HMMM` is called

## Debugging Workflow: Find a Tile / Character Pattern in VRAM

Use this when you want to verify that a specific tile (character graphic) was loaded correctly into the pattern generator table.

1. **Break execution**: `debug_run { command: "break" }`
2. **Check screen mode and name/pattern table addresses**: `emu_vdp { command: "getRegisters" }`
3. **Identify the expected byte pattern** for the tile (8 bytes per row for an 8×8 tile)
4. **Search in the pattern generator table** — e.g. for SCREEN 1 (`0x00000`–`0x007FF`):

```
debug_vram { command: "searchBytes", address: "0x00000", length: 2048, values: "0x3C 0x42 0x81 0x81" }
```

5. Divide the found address by 8 → character index. Confirm it matches the name table entry:

```
debug_vram { command: "readByte", address: "0x01800" }  # name table cell (0,0) in SCREEN 1
```

6. **Take screenshot for visual confirmation**: `screen_shot { command: "as_image" }`

> **Tip:** For SCREEN 2 (GRAPHIC2) the pattern generator spans `0x00000`–`0x017FF` (3 banks × 2KB). Search each bank separately with `length: 2048`.

## Debugging Workflow: Locate a Sprite Pattern in VRAM

Use this to verify a specific sprite bitmap was loaded into the sprite generator table.

1. **Break execution**: `debug_run { command: "break" }`
2. **Check screen mode**: `emu_vdp { command: "screenGetMode" }`
3. **Identify the sprite generator base address** from the current screen mode's VRAM layout (e.g. `0x03800` for SCREEN 1/2)
4. **Search for the sprite's first bytes** — an 8×8 sprite is 8 bytes; a 16×16 sprite is 32 bytes:

```
# Example: search for a specific sprite pattern near 0x03800 (SCREEN 1/2)
debug_vram { command: "searchBytes", address: "0x03800", length: 2048, values: "0xFF 0x81 0x81 0xFF" }
```

5. Divide the found offset from the generator base by 8 (8×8) or 32 (16×16) → sprite pattern number
6. Cross-check with the sprite attribute table to confirm it is the active sprite:

```
debug_vram { command: "getBlock", address: "0x01B00", lines: 4 }  # sprite attributes SCREEN 1/2
```

7. **Take screenshot**: `screen_shot { command: "as_image" }`

> **Note:** For SCREEN 5–8 / SCREEN 4 sprites, the generator table is at different addresses — check the [Common VRAM Layouts](#common-vram-layouts) section for the correct base.

## Useful Resources

Query the vector DB for VDP documentation:

```
vector_db_query { query: "V9938 register map" }
vector_db_query { query: "VDP sprite attributes MSX" }
vector_db_query { query: "VRAM memory map screen 2" }
```
