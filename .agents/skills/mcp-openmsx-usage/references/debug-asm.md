# Use Case: Debugging an ASM/Machine Code Program

## Goal

Debug a Z80 or R800 assembly program running on the MSX using breakpoints, stepping, register inspection, memory examination, and disassembly.

## Prerequisites

- Emulator launched with the target program loaded (ROM cartridge, disk, or tape).
- Optionally: `.sym` or `.map` files from the assembler/linker for symbol-to-address mapping.

## Index

- [Loading the Program](#loading-the-program)
    - [From ROM cartridge](#from-rom-cartridge)
    - [From disk](#from-disk)
- [Basic ASM Debug Session](#basic-debug-session)
    1. [Break execution](#1-break-execution)
    2. [Check active CPU](#2-check-active-cpu)
    3. [Full register dump](#3-full-register-dump)
    4. [Read a specific register](#4-read-a-specific-register)
    5. [Disassemble at current PC](#5-disassemble-at-current-pc)
    6. [Inspect stack](#6-inspect-stack)
    7. [Inspect memory slot configuration](#7-inspect-memory-slot-configuration)
- [Stepping Through Code](#stepping-through-code)
    - [Step into](#step-into-follows-call-jp-jr)
    - [Step over](#step-over-executes-call-as-single-step)
    - [Step out](#step-out-run-until-ret-from-current-subroutine)
    - [Step back](#step-back-requires-replay-mode)
    - [Run to a specific address](#run-to-a-specific-address)
- [Breakpoints](#breakpoints)
    - [Create a breakpoint](#create-a-breakpoint)
    - [List all breakpoints](#list-all-breakpoints)
    - [Remove a breakpoint](#remove-a-breakpoint)
    - [Resume execution (stops at next breakpoint)](#resume-execution-stops-at-next-breakpoint)
- [Memory Operations](#memory-operations)
    - [Hex dump](#hex-dump)
    - [Read byte / word](#read-byte--word)
    - [Write byte / word](#write-byte--word)
    - [Verify a write](#verify-a-write)
- [Modify Registers at Runtime](#modify-registers-at-runtime)
- [VRAM Inspection (for graphics debugging)](#vram-inspection-for-graphics-debugging)
- [Debugging Workflow: Find a Crash](#debugging-workflow-find-a-crash)
- [Debugging Workflow: Verify BIOS Calls](#debugging-workflow-verify-bios-calls)
- [MSX Memory Map Reference](#msx-memory-map-reference)

## Loading the Program

### From ROM cartridge

```
emu_media { command: "romInsert", romfile: "/path/to/program.rom" }
emu_control { command: "reset" }
emu_control { command: "wait", seconds: 3 }
```

### From disk

```
emu_media { command: "diskInsert", diskfile: "/path/to/disk.dsk" }
```

Or use a host folder directly:

```
emu_media { command: "diskInsertFolder", diskfolder: "/path/to/build/output" }
```

Then load from MSX-DOS or BASIC as needed.

## Basic Debug Session

### 1. Break execution

```
debug_run { command: "break" }
debug_run { command: "isBreaked" }    # confirm: returns "1"
```

### 2. Check active CPU

```
debug_cpu { command: "getActiveCpu" }
```

Returns `z80` or `r800` (turboR machines only).

### 3. Full register dump

```
debug_cpu { command: "getCpuRegisters" }
```

Returns all registers: AF, BC, DE, HL, IX, IY, SP, PC, AF', BC', DE', HL', I, R, IM, IFF.

### 4. Read a specific register

```
debug_cpu { command: "getRegister", register: "pc" }
```

Available registers: `pc`, `sp`, `ix`, `iy`, `af`, `bc`, `de`, `hl`, `ixh`, `ixl`, `iyh`, `iyl`, `af'`, `bc'`, `de'`, `hl'`, `a`, `f`, `b`, `c`, `d`, `e`, `h`, `l`, `i`, `r`, `im`, `iff`.

### 5. Disassemble at current PC

```
debug_cpu { command: "disassemble", size: 30 }
```

Or from a specific address:

```
debug_cpu { command: "disassemble", address: "0x4000", size: 50 }
```

Size is in bytes (8-50). Shows Z80 mnemonics with addresses.

### 6. Inspect stack

```
debug_cpu { command: "getStackPile" }
```

Shows return addresses on the stack — the call chain.

### 7. Inspect memory slot configuration

```
debug_memory { command: "selectedSlots" }
```

Shows which ROM/RAM/cartridge is mapped in each 16KB page:
- Page 0: 0x0000-0x3FFF (typically BIOS ROM)
- Page 1: 0x4000-0x7FFF (typically cartridge or BASIC ROM)
- Page 2: 0x8000-0xBFFF (typically RAM)
- Page 3: 0xC000-0xFFFF (typically RAM)

## Stepping Through Code

### Step into (follows CALL, JP, JR)

```
debug_run { command: "stepIn" }
debug_cpu { command: "getCpuRegisters" }
debug_cpu { command: "disassemble", size: 10 }
```

### Step over (executes CALL as single step)

```
debug_run { command: "stepOver" }
```

### Step out (run until RET from current subroutine)

```
debug_run { command: "stepOut" }
```

### Step back (requires replay mode)

```
debug_run { command: "stepBack" }
```

Goes back one instruction in time. Replay mode is enabled by default on launch.

### Run to a specific address

```
debug_run { command: "runTo", address: "0x4050" }
```

Execution pauses when PC reaches the specified address.

## Breakpoints

### Create a breakpoint

```
debug_breakpoints { command: "create", address: "0x4000" }
```

Returns a name like `bp#1`. Use addresses from your `.sym`/`.map` files.

### List all breakpoints

```
debug_breakpoints { command: "list" }
```

Returns array of `{name, address, condition, command}`.

### Remove a breakpoint

```
debug_breakpoints { command: "remove", bpname: "bp#1" }
```

### Resume execution (stops at next breakpoint)

```
debug_run { command: "continue" }
```

## Memory Operations

### Hex dump

```
debug_memory { command: "getBlock", address: "0x8000", lines: 8 }
```

16 bytes per line x N lines.

### Read byte / word

```
debug_memory { command: "readByte", address: "0x8000" }
debug_memory { command: "readWord", address: "0x8000" }   # little-endian
```

### Write byte / word

```
debug_memory { command: "writeByte", address: "0x8000", value8: "0xFF" }
debug_memory { command: "writeWord", address: "0x8000", value16: "0x1234" }
```

### Verify a write

```
debug_memory { command: "writeByte", address: "0xE000", value8: "0x42" }
debug_memory { command: "readByte", address: "0xE000" }   # should contain 0x42
```

## Modify Registers at Runtime

```
debug_cpu { command: "setRegister", register: "a", value: "0xFF" }
debug_cpu { command: "setRegister", register: "hl", value: "0x8000" }
debug_cpu { command: "setRegister", register: "pc", value: "0x4000" }   # redirect execution
```

## VRAM Inspection (for graphics debugging)

```
debug_vram { command: "getBlock", address: "0x00000", lines: 8 }
debug_vram { command: "readByte", address: "0x01800" }
debug_vram { command: "writeByte", address: "0x01800", value8: "0x41" }
```

VRAM uses 20-bit addresses (5 hex digits) for MSX2 and later machines. MSX1 machines uses 14-bit addresses (4 hex digits). Check your machine's VRAM size and mapping.

## Debugging Workflow: Find a Crash

1. Set breakpoint at program entry: `debug_breakpoints { command: "create", address: "0x4000" }`
2. Reset and wait: `emu_control { command: "reset" }`, `emu_control { command: "wait", seconds: 3 }`
3. Continue: `debug_run { command: "continue" }` — stops at breakpoint
4. Step through: `debug_run { command: "stepOver" }` repeated with register + disassembly checks
5. When crash happens: `debug_run { command: "break" }`
6. Inspect registers and stack to identify the cause
7. Use `debug_run { command: "stepBack" }` to go back one instruction before the crash
8. Use `emu_replay { command: "goBack", seconds: 1 }` to rewind further

## Debugging Workflow: Verify BIOS Calls

1. Set breakpoint at BIOS entry (e.g. CHPUT at 0x00A2): `debug_breakpoints { command: "create", address: "0x00A2" }`
2. Continue: `debug_run { command: "continue" }`
3. When break occurs, inspect register A for the character being output
4. Step out to return to caller: `debug_run { command: "stepOut" }`
5. Disassemble caller code to verify correct BIOS usage

## MSX Memory Map Reference

| Address Range | Typical Content |
|---------------|----------------|
| 0x0000-0x3FFF | BIOS ROM (slot 0) |
| 0x4000-0x7FFF | Cartridge ROM or BASIC ROM |
| 0x8000-0xBFFF | RAM (user programs) |
| 0xC000-0xFFFF | RAM (system area, stack at top) |

This is the most common configuration, but actual mapping can vary based on the machine and cartridges.

Use `debug_memory { command: "selectedSlots" }` to see the current mapping in your session.

Use `vector_db_query { query: "MSX memory map slots" }` for detailed documentation.
