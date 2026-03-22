# VDP (Video Display Processor)

## `emu_vdp` — Manage the VDP

| Command | Description |
|---------|-------------|
| `getPalette` | Get current VDP palette |
| `getRegisters` | Get all VDP register values |
| `getRegisterValue` | Read single VDP register (0–31). Param: `register` |
| `setRegisterValue` | Write VDP register. Params: `register` (0–31), `value` (hex byte) |
| `screenGetMode` | Get current screen mode |
| `screenGetFullText` | Get full text content of screen (text modes only) |
