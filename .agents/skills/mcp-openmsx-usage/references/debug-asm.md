# Use Case: Debugging an ASM/Machine Code Program

## Goal

Debug a Z80 or R800 assembly program running on the MSX using breakpoints, stepping, register inspection, memory examination, and disassembly.

## Prerequisites

- Emulator launched with the target program loaded (ROM cartridge, disk, or tape).
- Optionally: `.sym`/`.map`/`.lst` files from the assembler/linker for symbol-to-address mapping (usually in `obj` or `out` folder).

## Resources

Use the [resources](../skill-mcp-resources-prompts.md) and [tools](../skill-tools-documentation-search.md) for reference materials on Z80/R800 assembly language, MSX hardware architecture.

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
    - [Search for a byte pattern in RAM](#search-for-a-byte-pattern-in-ram)
- [Modify Registers at Runtime](#modify-registers-at-runtime)
- [VRAM Inspection (for graphics debugging)](#vram-inspection-for-graphics-debugging)
- [Debugging Workflow: Find a Crash or Hang](#debugging-workflow-find-a-crash-or-hang)
- [Debugging Workflow: Verify BIOS Calls](#debugging-workflow-verify-bios-calls)
- [Locating Functions Without .sym Files](#locating-functions-without-sym-files)
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

### Search for a byte pattern in RAM

Scan a memory region for a specific sequence of bytes:

```
debug_memory { command: "searchBytes", address: "0x0000", length: 65536, values: "0x00 0xFF 0x53" }
```

Returns the addresses that match, or a not-found message. Use a narrower range (`address` + `length`) to speed up the search when you know roughly where to look.

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

### Search for a byte pattern in VRAM

Scan up to 65536 bytes per call. For MSX2 (128KB VRAM) scan both halves:

```
# First 64KB (0x00000–0x0FFFF)
debug_vram { command: "searchBytes", address: "0x00000", length: 65536, values: "0x42 0x41" }

# Second 64KB — MSX2 only (0x10000–0x1FFFF)
debug_vram { command: "searchBytes", address: "0x10000", length: 65536, values: "0x42 0x41" }
```

Returns all matching addresses, or a not-found message.

VRAM uses 20-bit addresses (5 hex digits) for MSX2 and later machines. MSX1 machines uses 14-bit addresses (4 hex digits). Check your machine's VRAM size and mapping.

## Debugging Workflow: Find a Crash or Hang

### Crash (unexpected jump / stack corruption)

1. Set breakpoint at program entry: `debug_breakpoints { command: "create", address: "0x4000" }`
2. Reset and wait: `emu_control { command: "reset" }`, `emu_control { command: "wait", seconds: 3 }`
3. Continue: `debug_run { command: "continue" }` — stops at breakpoint
4. Step through: `debug_run { command: "stepOver" }` repeated with register + disassembly checks
5. When crash happens: `debug_run { command: "break" }`
6. Inspect registers and stack to identify the cause
7. Use `debug_run { command: "stepBack" }` to go back one instruction before the crash
8. Use `emu_replay { command: "goBack", seconds: 1 }` to rewind further

### Hang (program stops responding)

If the program stops responding but the emulator keeps running, break at any moment and inspect:

```
debug_run { command: "break" }
debug_cpu { command: "getCpuRegisters" }
debug_cpu { command: "getStackPile" }
debug_cpu { command: "disassemble" }
```

**Diagnostic signals:**

| Symptom | Likely cause |
|---------|-------------|
| `PC` outside program address range (e.g. in string/data area) | Stack corrupted — a `RET` or `JP` landed in data |
| Stack values look like ASCII text (e.g. `0x6174`, `0x696F`) | A `POP` consumed data as a return address |
| All registers are `0xFFFF`, `PC=0x0000` | Machine still booting — app has not started yet |
| Short loop with `OUT(0x99)` + `IN(0x99)` in disassembly | VDP command polling loop — CE bit never cleared (see [Debugging the VDP](debug-vdp.md)) |
| Short loop at fixed address, no I/O | Infinite software loop — use `emu_replay goBack` to find entry point |

> **MSX-DOS programs**: breakpoints fire during BIOS/DOS boot too — see [Debugging MSX-DOS Programs](debug-dos-program.md) for the correct workflow.

## Debugging Workflow: Verify BIOS Calls

1. Set breakpoint at BIOS entry (e.g. CHPUT at 0x00A2): `debug_breakpoints { command: "create", address: "0x00A2" }`
2. Continue: `debug_run { command: "continue" }`
3. When break occurs, inspect register A for the character being output
4. Step out to return to caller: `debug_run { command: "stepOut" }`
5. Disassemble caller code to verify correct BIOS usage

## Locating Functions Without .sym Files

When debugging pre-compiled libraries (`.lib`) or third-party code, internal function symbols are not exported — only public entry points appear in `.map`/`.sym` files. To find internal functions, search for characteristic byte patterns in the compiled `.com`/`.rom` binary.

**Approach: pattern search in the binary**

Identify a unique sequence of bytes near the target function — its prologue, a distinctive instruction, or bytes adjacent to a known data variable — and search directly in the running emulator's RAM:

```
# Example: find CP #0x3F (FE 3F) followed by JP NZ (C2) in the program area
debug_memory { command: "searchBytes", address: "0x0100", length: 4096, values: "0xFE 0x3F 0xC2" }
```

This is faster than running a Python script on the binary and works on the live memory image (including self-modifying code). Narrow the range with `address` + `length` if you know the approximate location.

Alternatively, search the binary file on the host:

```python
with open('program.com', 'rb') as f:
    data = f.read()
base = 0x0100  # MSX-DOS load address (ROM programs may use 0x4000)

# Example: find all CP #0x3F (FE 3F) followed by JP NZ (C2)
for i in range(len(data) - 3):
    if data[i] == 0xFE and data[i+1] == 0x3F and data[i+2] == 0xC2:
        print(f'Found at 0x{i+base:04X}: {data[i:i+6].hex()}')
```

**Finding a variable's address from code:**

If you know a variable's address (e.g. from a previous debug session), search for instructions that reference it directly in the emulator's RAM:

```
# LD A,(0x1E54) = 3A 54 1E  (little-endian address)
debug_memory { command: "searchBytes", address: "0x0100", length: 65535, values: "0x3A 0x54 0x1E" }
```

Or search the binary file on the host:

```python
target_lo, target_hi = 0x54, 0x1E  # address 0x1E54 in little-endian
# LD A,(0x1E54) = 3A 54 1E
for i in range(len(data) - 3):
    if data[i] == 0x3A and data[i+1] == target_lo and data[i+2] == target_hi:
        print(f'LD A,(0x1E54) at 0x{i+base:04X}')
```

**Tips:**
- Run the script on the host, then use the found addresses as breakpoint targets in the emulator
- After a code change and recompile, variable addresses may shift — always re-run the search on the new binary
- Combine multiple distinctive instructions to narrow down to a unique match

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
