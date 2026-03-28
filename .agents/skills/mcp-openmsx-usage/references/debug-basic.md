# Use Case: Debugging a BASIC Program

## Goal

Debug an MSX BASIC program by inspecting its state, stepping through execution at the interpreter level, reading program memory, and using time-travel features.

## Index

- [Prerequisites](#prerequisites)
- [Resources](#resources)
- [Step-by-Step: Debug a Running BASIC Program](#step-by-step-debug-a-running-basic-program)
    1. [Run the program](#1-run-the-program)
    2. [Interrupt execution](#2-interrupt-execution)
    3. [Inspect program state](#3-inspect-program-state)
    4. [Read screen output](#4-read-screen-output)
    5. [Inspect BASIC tokens program in memory](#5-inspect-basic-tokens-program-in-memory)
    6. [Resume or modify the program](#6-resume-or-modify-the-program)
- [Low-Level Debug (CPU/Interpreter Level)](#low-level-debug-cpuinterpreter-level)
- [Using Breakpoints with BASIC](#using-breakpoints-with-basic)
- [Time-Travel Debugging for BASIC](#time-travel-debugging-for-basic)
- [Debugging Pattern: Find an Infinite Loop](#debugging-pattern-find-an-infinite-loop)
- [Debugging Pattern: Variable Inspection via PRINT](#debugging-pattern-variable-inspection-via-print)

## Prerequisites

- Machine launched with BASIC support (branded machine, NOT C-BIOS).
- BASIC program already loaded via [`basic_programming.setProgram`](../skill-tools-basic-programming.md).

## Resources

Use the [resources](../skill-mcp-resources-prompts.md) and [tools](../skill-tools-documentation-search.md) for reference materials on MSX BASIC language features, commands, error messages, and the structure of the BASIC interpreter.

## Step-by-Step: Debug a Running BASIC Program

### 1. Run the program

```
basic_programming { command: "runProgram" }
```

### 2. Interrupt execution

```
emu_keyboard { command: "sendKeyCombo", keys: ["CTRL", "STOP"] }
```

This triggers a `Break in <line>` message in BASIC. The emulator continues running the BASIC interpreter (now at the prompt), but the BASIC program is stopped.

You can algo try to use `STOP` key alone to toggle stop/start program execution without breaking it.

At emulator level, you can also use:

```
debug_run { command: "break" }
debug_run { command: "continue" }
```

### 3. Inspect program state

Get the full program listing with RAM addresses:

```
basic_programming { command: "getFullProgramAdvanced" }
```

This shows each BASIC line number and its RAM address — useful for setting breakpoints in the BASIC interpreter.

### 4. Read screen output

```
emu_vdp { command: "screenGetFullText" }
```

Shows what the user would see on screen, including any error messages or program output.

See the "Screen Capture" use case for detailed visual verification of graphics output or reading text from the screen.

### 5. Inspect BASIC tokens program in memory

BASIC programs typically start at address 0x8000. Read the tokens program area:

```
debug_memory { command: "getBlock", address: "0x8000", lines: 16 }
```

### 6. Resume or modify the program

Edit specific lines:

```
basic_programming { command: "deleteProgramLines", startLine: 30 }
basic_programming { command: "setProgram", program: "30 PRINT X*2" }
```

Then re-run:

```
basic_programming { command: "runProgram" }
```

## Low-Level Debug (CPU/Interpreter Level)

For deeper debugging at the Z80/interpreter level:

### 1. Break CPU execution

```
debug_run { command: "break" }
```

### 2. Inspect CPU registers

```
debug_cpu { command: "getCpuRegisters" }
```

When in BASIC, the PC will be inside the BASIC interpreter ROM (typically in slot 0, addresses 0x0000-0x7FFF).

### 3. Disassemble current position

```
debug_cpu { command: "disassemble", size: 20 }
```

This shows the BASIC interpreter's Z80 code at the current execution point.

### 4. Inspect the stack

```
debug_cpu { command: "getStackPile" }
```

Shows the call stack — useful for understanding which BASIC interpreter routine is executing.

### 5. Check slot configuration

```
debug_memory { command: "selectedSlots" }
```

Reveals which ROM/RAM is active in each memory page — confirms BASIC ROM is in slot 0.

### 6. Step through interpreter

```
debug_run { command: "stepOver" }
debug_cpu { command: "getCpuRegisters" }
debug_cpu { command: "disassemble", size: 20 }
```

Repeat to trace the interpreter's execution path.

### 7. Continue execution

```
debug_run { command: "continue" }
```

## Using Breakpoints with BASIC

Set a breakpoint at a known BASIC interpreter entry point:

```
debug_breakpoints { command: "create", address: "0x4601" }
```

Common BASIC interpreter addresses vary by machine BIOS — consult `vector_db_query { query: "MSX BIOS BASIC interpreter addresses" }` for specific maps.

Then continue execution:

```
debug_run { command: "continue" }
```

Execution will pause when the breakpoint address is hit.

## Time-Travel Debugging for BASIC

### Go back in time to re-inspect

```
debug_run { command: "break" }
emu_replay { command: "goBack", seconds: 5 }
```

This returns the entire MSX state to 5 seconds ago — including the BASIC program counter, variables, and screen.

### Frame-by-frame analysis

```
emu_replay { command: "advanceFrame", frames: 1 }
screen_shot { command: "as_image" }
```

Step frame-by-frame to see exactly when a visual bug appears.

### Save checkpoint before risky changes

```
emu_savestates { command: "save", name: "before_edit" }
# ... modify program ...
# If something goes wrong:
emu_savestates { command: "load", name: "before_edit" }
```

## Debugging Pattern: Find an Infinite Loop

1. `basic_programming { command: "runProgram" }` — Run the program
2. Wait a few seconds
3. `emu_keyboard { command: "sendKeyCombo", keys: ["CTRL", "STOP"] }` — Break
4. `emu_vdp { command: "screenGetFullText" }` — Check which line BASIC reports (`Break in <line>`)
5. `basic_programming { command: "listProgramLines", startLine: <line-5>, endLine: <line+5> }` — Inspect surrounding code
6. Identify the loop condition that never becomes false

## Debugging Pattern: Variable Inspection via PRINT

Since MSX BASIC doesn't have a watch facility, use the BASIC prompt after a break:

1. `emu_keyboard { command: "sendKeyCombo", keys: ["CTRL", "STOP"] }` — Break
2. `emu_keyboard { command: "sendText", text: "PRINT X,Y,Z\r" }` — Print variable values
3. `emu_vdp { command: "screenGetFullText" }` — Read the output
4. `emu_keyboard { command: "sendText", text: "CONT\r" }` — Continue BASIC execution
