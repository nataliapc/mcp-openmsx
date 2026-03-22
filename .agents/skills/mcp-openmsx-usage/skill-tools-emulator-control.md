# Emulator Control

## `emu_control` — Control the openMSX emulator

| Command | Description |
|---------|-------------|
| `launch` | Open a powered-on emulator. Optional `machine` and `extensions` params. Uses elicitation if ambiguous. Wait for full boot after launch. |
| `close` | Close the emulator |
| `powerOn` / `powerOff` | Toggle power |
| `reset` | Reset the current machine |
| `getEmulatorSpeed` | Get current speed (%) |
| `setEmulatorSpeed` | Set speed (1–10000%, default 100). Param: `emuspeed` |
| `machineList` | List all available MSX machines |
| `extensionList` | List all available extensions |
| `wait` | Wait N seconds (1–10, default 3). Param: `seconds`. Supports abort. |

**Key params**: `machine` (string), `extensions` (string[]), `emuspeed` (number), `seconds` (number).

## `emu_media` — Manage tapes, ROM cartridges, and floppy disks

| Command | Description |
|---------|-------------|
| `tapeInsert` | Insert tape file (`.cas`/`.wav`/`.tsx`). Param: `tapefile` |
| `tapeRewind` | Rewind current tape |
| `tapeEject` | Eject tape |
| `romInsert` | Insert ROM cartridge (`.rom`). Param: `romfile` |
| `romEject` | Eject ROM cartridge |
| `diskInsert` | Insert disk image (`.dsk`). Param: `diskfile` |
| `diskInsertFolder` | Use host folder as floppy root. Param: `diskfolder` |
| `diskEject` | Eject floppy disk |

## `emu_info` — Get information about the current emulated machine

| Command | Description |
|---------|-------------|
| `getStatus` | Machine info (type, manufacturer, year, etc.) |
| `getSlotsMap` | Current slot map |
| `getIOPortsMap` | I/O ports map |

## `emu_keyboard` — Send text to the emulator

| Command | Description |
|---------|-------------|
| `sendText` | Type text via emulated keyboard. Param: `text` (1–200 chars). Escapes `\r`, `\t`, `"` automatically. |
| `sendKeyCombo` | Press a combination of keys simultaneously. Params: `keys` (array of key names), `holdTime` (optional, 10–5000ms, default 100). Example: `["CTRL", "STOP"]` to break a running program. |

**Valid key names**: SHIFT, CTRL, GRAPH, CAPS, CODE, F1, F2, F3, F4, F5, ESC, TAB, STOP, BS, SELECT, RETURN, ENTER, SPACE, HOME, INS, DEL, LEFT, UP, DOWN, RIGHT.

**Note**: MSX keyboards can experience key ghosting with 3+ simultaneous keys due to hardware limitations. If keys don't register as expected, try pressing fewer keys at once.

**Common combinations**:
- `["CTRL", "STOP"]` - Break/interrupt running BASIC program
- `["CTRL", "C"]` - Use only under MSX-DOS environment (use CTRL+STOP for BASIC mode)
- `["SHIFT", "F1"]` - Function key with modifier

## `emu_savestates` — Save and restore machine states

| Command | Description |
|---------|-------------|
| `save` | Create savestate snapshot. Param: `name` (1–50 chars) |
| `load` | Restore a savestate. Param: `name` |
| `list` | List all savestates |

## `emu_replay` — Go back and forward in emulated MSX time

| Command | Description |
|---------|-------------|
| `start` | Start replay mode (enabled by default on launch) |
| `stop` | Stop replay mode |
| `status` | Get replay info (begin/end/current time, snapshot count) |
| `goBack` | Go back N seconds (1–60). Param: `seconds` |
| `absoluteGoto` | Jump to absolute time in seconds. Param: `time` (string of digits) |
| `truncate` | Wipe future replay data after current position |
| `advanceFrame` | Advance N frames (1–1000, default 1). Param: `frames` |
| `reverseFrame` | Reverse N frames (1–1000, default 1). Param: `frames` |
| `saveReplay` | Save replay to `.omr` file. Param: `filename` |
| `loadReplay` | Load replay from `.omr` file. Param: `filename` |

**Important**: Break execution (`debug_run.break`) before `goBack` or `absoluteGoto` to maintain timeline consistency.
