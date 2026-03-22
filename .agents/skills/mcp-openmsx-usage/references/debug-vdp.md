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
- [Common VRAM Layouts](#common-vram-layouts)
    - [SCREEN 1 (GRAPHIC1, 32x24 text mode)](#screen-1-graphic1-32x24-text-mode)
    - [SCREEN 2 (GRAPHIC2, 256x192 bitmap)](#screen-2-graphic2-256x192-bitmap)
- [Debugging Workflow: Verify Sprite Rendering](#debugging-workflow-verify-sprite-rendering)
- [Debugging Workflow: Analyze Screen Corruption](#debugging-workflow-analyze-screen-corruption)
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

## Common VRAM Layouts

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

## Useful Resources

Query the vector DB for VDP documentation:

```
vector_db_query { query: "V9938 register map" }
vector_db_query { query: "VDP sprite attributes MSX" }
vector_db_query { query: "VRAM memory map screen 2" }
```
