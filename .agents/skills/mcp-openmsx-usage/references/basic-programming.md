# Use Case: Programming in MSX BASIC

## Goal

Write, load, run, and manage MSX BASIC programs using dedicated BASIC programming tools.

## Index

- [Prerequisites](#prerequisites)
- [Tips](#tips)
- [Step-by-Step: Write and Run a Program](#step-by-step-write-and-run-a-program)
    1. [Verify BASIC is available](#1-verify-basic-is-available)
    2. [Clear any existing program](#2-clear-any-existing-program)
    3. [Enter a BASIC program](#3-enter-a-basic-program)
    4. [Verify the program](#4-verify-the-program)
    5. [Run the program](#5-run-the-program)
    6. [Verify output](#6-verify-output)
- [Managing Program Lines](#managing-program-lines)
    - [List specific lines](#list-specific-lines)
    - [Delete specific lines](#delete-specific-lines)
- [Interrupting a Running Program](#interrupting-a-running-program)
- [Alternative: Enter Program via Keyboard](#alternative-enter-program-via-keyboard)
- [Loading a Large Program (Example)](#loading-a-large-program-example)
- [Common MSX BASIC Commands Reference](#common-msx-basic-commands-reference)

## Prerequisites

- Launch a machine with BASIC support (branded machine like `Philips_NMS_8250` or `Toshiba_HX-10`, NOT C-BIOS machines).
- Wait for full boot (3+ seconds).

## Tips

- Always use `basic_programming` commands for program management — they are optimized for speed and reliability.
- Always consult [BASIC wiki from mcp-openmsx resources](references/documentation.md) for syntax and examples of every instruction you want to use.
- BASIC .BAS files are plain text with lines like `10 PRINT "HELLO"`. Use CRLF for line breaks when saving directly to a file, and ensure proper encoding (MSX or CP437) for special characters.

## Step-by-Step: Write and Run a Program

### 1. Verify BASIC is available

```
basic_programming { command: "isBasicAvailable" }
```

Returns `true` if the MSX is at the BASIC prompt (checks slot 0 at addresses 0x0000 and 0x4000). If `false`, wait longer or reset.

### 2. Clear any existing program

Use only if you want to start fresh. Otherwise, new lines will append to the existing program.

```
basic_programming { command: "newProgram" }
```

Sends `NEW` command (preceded by Ctrl+L to clear screen).

### 3. Enter a BASIC program

```
basic_programming { command: "setProgram", program: "10 SCREEN 2\n20 CIRCLE (128,96),50,15\n30 FOR I=1 TO 1000: NEXT I\n40 SCREEN 0\n50 PRINT \"Done!\"\n60 END" }
```

**How it works internally**:
- Boosts emulator speed to **10,000%** for fast input
- Types each line via emulated keyboard
- Restores original emulator speed when done
- `\n` is auto-converted to `\r` (MSX carriage return)
- `$` before `(` is escaped to avoid TCL variable substitution
- `[` and `]` are escaped to avoid TCL command substitution

### 4. Verify the program

Use this to get the full program listing in any context (BASIC or RUN mode).

```
basic_programming { command: "getFullProgram" }
```

Returns the full listing as plain text.

For more detail:

```
basic_programming { command: "getFullProgramAdvanced" }
```

Returns the listing with RAM addresses per line — useful for debugging.

### 5. Run the program

Use this in BASIC mode to execute the loaded program, so it sends the `RUN` command via emulated keyboard.
If in RUN mode, you need to interrupt it first (see [Interrupting a Running Program](#interrupting-a-running-program) below).

```
basic_programming { command: "runProgram" }
```

### 6. Verify output

```
emu_control { command: "wait", seconds: 5 }
screen_shot { command: "as_image" }
```

Or for text output:

```
emu_control { command: "wait", seconds: 5 }
emu_vdp { command: "screenGetFullText" }
```

## Managing Program Lines

### List specific lines

```
basic_programming { command: "listProgramLines", startLine: 10, endLine: 30 }
```

This example is equivalent to the BASIC command `LIST 10-30` and show lines 10 to 30 at the screen. If `endLine` is omitted, it lists from `startLine` to the end of the program.

### Delete specific lines

```
basic_programming { command: "deleteProgramLines", startLine: 20 }
basic_programming { command: "deleteProgramLines", startLine: 40, endLine: 60 }
```

This example is equivalent to the BASIC commands `DELETE 20` (deletes line 20) and `DELETE 40-60` (deletes lines 40 to 60).
You need to be in BASIC mode to delete lines. If `endLine` is omitted, it deletes from `startLine` to the end of the program.

## Interrupting a Running Program

Use `sendKeyCombo` to send CTRL+STOP:

```
emu_keyboard { command: "sendKeyCombo", keys: ["CTRL", "STOP"] }
```

**Important**: Use CTRL+STOP for a BASIC ROM environment. CTRL+C only works under MSX-DOS.

## Alternative: Enter Program via Keyboard

For very short programs, `emu_keyboard.sendText` works but is slower:

```
emu_keyboard { command: "sendText", text: "10 PRINT \"HELLO\"\r" }
emu_keyboard { command: "sendText", text: "RUN\r" }
```

**Prefer `basic_programming` tools** — they handle speed optimization and input encoding automatically.

## Loading a Large Program (Example)

For larger programs (100+ lines):

1. Read the `.BAS` file using media management tools if is available.
1. If not, Read the `.BAS` file content directly from the host filesystem.
2. Use `basic_programming { command: "newProgram" }` only if you want to clear existing program first.
3. `basic_programming { command: "setProgram", program: "<full program text>" }` — max 10,000 chars.
4. `basic_programming { command: "getFullProgram" }` — verify if the program was loaded correctly (returns full listing as text).
5. Use `basic_programming { command: "runProgram" }` if you want to execute it immediately.
6. `screen_shot { command: "as_image" }` — visual graphic verification or `emu_vdp { command: "screenGetFullText" }` for text output verification.

## Common MSX BASIC Commands Reference

| Command | Purpose |
|---------|---------|
| `SCREEN n` | Set screen mode (0=text40, 1=text32, 2=graphic256x192) |
| `COLOR fg,bg,border` | Set colors |
| `WIDTH n` | Set text width (40 or 80) |
| `LOCATE x,y` | Position cursor |
| `PRINT` | Output text |
| `INPUT` | Read user input |
| `POKE addr,val` | Write byte to memory |
| `PEEK(addr)` | Read byte from memory |
| `VPOKE addr,val` | Write byte to VRAM |
| `VPEEK(addr)` | Read byte from VRAM |
| `DEFINT A-Z` | Define all vars as integer (faster execution) |

For detailed BASIC instruction documentation, use the `basic` MCP prompt or `vector_db_query`.
