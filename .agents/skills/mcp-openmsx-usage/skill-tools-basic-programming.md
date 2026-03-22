# BASIC Programming

## `basic_programming` — Helper for developing MSX BASIC programs

| Command | Description |
|---------|-------------|
| `isBasicAvailable` | Check if machine is ready for BASIC (true/false). Call this first if errors occur. |
| `newProgram` | Clear current BASIC program |
| `setProgram` | Set or update BASIC program text. Param: `program` (max 10000 chars). Auto-boosts emulator speed while typing. |
| `runProgram` | Run current BASIC program |
| `getFullProgram` | Retrieve current program as plain text (best for text screen modes) |
| `getFullProgramAdvanced` | Retrieve program with RAM addresses per line |
| `listProgramLines` | List range of lines on emulator screen. Params: `startLine`, `endLine` (0–9999) |
| `deleteProgramLines` | Delete range of lines. Params: `startLine`, `endLine` (optional, deletes single line if omitted) |

**Important notes**:
- Prefer these tools over `emu_keyboard.sendText` for BASIC development — they are more efficient.
- If error "not in BASIC mode", call `isBasicAvailable` and wait for ready state, or get screenshot to know how to proceed.
- `setProgram` temporarily sets emulator speed to 10000% for fast input, then restores previous speed.
