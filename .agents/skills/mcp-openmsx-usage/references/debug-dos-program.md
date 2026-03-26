# Use Case: Debugging MSX-DOS Programs

## Goal

Debug a program that loads and runs under MSX-DOS (`.com` file), avoiding the pitfall of breakpoints firing during BIOS/DOS boot before the app has started.

## The Core Problem: Boot Contamination

Unlike ROM programs that start executing almost immediately, **MSX-DOS programs load from disk**. Between reset and the moment your `.com` file executes, the machine runs thousands of instructions:

1. BIOS cold boot (RAM test, hardware init)
2. MSX-DOS kernel loads from disk (`MSXDOS.SYS`)
3. Command interpreter loads (`COMMAND.COM`)
4. `AUTOEXEC.BAT` executes (if present)
5. Your program runs

**Any breakpoint set before step 5 will fire multiple times** in code that has nothing to do with your app. Register values, stack, and memory state at those false breaks are meaningless for debugging your program.

## Correct Workflow for MSX-DOS Programs

### Step 1: Boot completely without breakpoints

```
emu_control { command: "reset" }
emu_control { command: "wait", seconds: 10 }
```

> **Important:** 10 seconds may not be enough for slow machines or large `AUTOEXEC.BAT` files. If unsure, wait more and visually verify.

### Step 2: Visually confirm the app is running

```
screen_shot { command: "as_image" }
```

Check that the screenshot shows your application's screen — not the MSX-DOS prompt or a loading screen. If the machine is still booting, wait more:

```
emu_control { command: "wait", seconds: 10 }
screen_shot { command: "as_image" }
```

### Step 3: Confirm the app is truly running (not hung during boot)

```
debug_run { command: "break" }
debug_cpu { command: "getCpuRegisters" }
```

**Interpreting the result:**

| PC value | Meaning |
|----------|---------|
| `0x0000` and all regs `0xFFFF` | Still in reset/boot — wait longer |
| `0x0000`–`0x3FFF` | Executing BIOS/DOS — not at app yet |
| Within your program's range (e.g. `0x0100`–`0x7FFF` for MSX-DOS) | App is running |
| Far outside program range (e.g. `0xC000`+) | Executing system code or crashed |

Resume after checking:

```
debug_run { command: "continue" }
```

### Step 4: Set breakpoints only after app is confirmed running

**Only now** create breakpoints at addresses inside your program:

```
debug_breakpoints { command: "create", address: "0x1234" }
debug_run { command: "continue" }
```

Then trigger the relevant code path (e.g. send a keypress, wait for an event).

### Step 5: Verify the breakpoint hit belongs to your app

When the breakpoint fires, always confirm PC is in the expected range before interpreting registers:

```
debug_cpu { command: "getCpuRegisters" }
```

If PC is not where expected, the breakpoint may have fired on a system call that happens to pass through the same address. Continue and wait for the real hit.

---

## Common Mistake: Breakpoint Before Boot Completes

This pattern from the general ASM debug guide **does NOT work reliably for MSX-DOS programs**:

```
# WRONG for MSX-DOS — breakpoint fires during BIOS boot, not at your code
debug_breakpoints { command: "create", address: "0x1234" }
emu_control { command: "reset" }
emu_control { command: "wait", seconds: 3 }
debug_run { command: "continue" }   # fires in BIOS, not in app
```

**Why it fails:** Address `0x1234` (or any other) may be used by the BIOS or DOS before your program loads. The breakpoint fires with irrelevant state and can fire many times before your app runs.

---

## Workflow: Debug a Specific Function in an MSX-DOS App

1. Build the program and identify the target function address (from `.map`/`.sym`, or by pattern search — see [Debugging an ASM Program](debug-asm.md#locating-functions-without-sym-files))
2. Reset and wait for full boot (steps 1–3 above)
3. Confirm app is on screen and waiting for user input (if a menu, prompt, or idle screen exists)
4. Set breakpoint at the function address
5. Trigger the code path that calls the function (keypress, command, etc.)
6. The breakpoint fires inside your app — inspect state

```
# Full correct sequence:
emu_control  { command: "reset" }
emu_control  { command: "wait", seconds: 10 }
screen_shot  { command: "as_image" }             # verify app is on screen
# -- only now --
debug_breakpoints { command: "create", address: "0x141C" }
debug_run    { command: "continue" }
emu_keyboard { command: "sendText", text: "\r" } # trigger the code path if needed
emu_control  { command: "wait", seconds: 3 }
debug_run    { command: "isBreaked" }            # should return 1
debug_cpu    { command: "getCpuRegisters" }
```

---

## Workflow: Detect a Hang After a Specific Operation

If the program hangs after performing an operation (e.g. a VDP command, a network call, a file access):

1. Boot completely and confirm app is on screen
2. **Do not set any breakpoints yet**
3. Trigger the operation that causes the hang
4. Wait a moment, then break:

```
emu_control { command: "wait", seconds: 3 }
debug_run   { command: "break" }
debug_cpu   { command: "getCpuRegisters" }
debug_cpu   { command: "disassemble" }
debug_cpu   { command: "getStackPile" }
```

5. Diagnose using the signals in [Debugging an ASM Program — Hang Diagnostics](debug-asm.md#debugging-workflow-find-a-crash-or-hang)

---

## MSX-DOS Memory Map (Common Configuration)

MSX-DOS programs load at `0x0100`. The typical RAM layout:

| Address Range | Content |
|---------------|---------|
| `0x0000`–`0x00FF` | Zero page (system vectors, BIOS hooks) |
| `0x0100`–`0x7FFF` | Program code + data (`.com` file loads here) |
| `0x8000`–`0xBFFF` | RAM (heap, extra data, or TPA extension) |
| `0xC000`–`0xF3FF` | MSX-DOS system area |
| `0xF380`–`0xFFFF` | BIOS work area, system variables, stack |

> Use `debug_memory { command: "selectedSlots" }` to see actual slot mapping.

---

## Tips

- **Always use `screen_shot` to visually confirm boot state** before setting breakpoints — it is the most reliable check.
- **Two `wait` calls of 10s** are sometimes needed (one for BIOS, one for DOS + AUTOEXEC).
- **Remove breakpoints before reset** if you need to retest from scratch, to avoid them firing during the next boot.
- **`emu_savestates`** — save a state right after the app appears on screen, so you can reload it instantly without waiting for the full boot cycle every time.
