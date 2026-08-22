# Debugging

## `debug_run` — Control execution (break, continue, step)

| Command | Description |
|---------|-------------|
| `break` | Pause CPU execution at current position |
| `isBreaked` | Check if CPU is in break state (1) or not (0) |
| `continue` | Resume execution after break |
| `stepIn` | Execute one instruction, enter subroutines |
| `stepOver` | Execute one instruction, skip subroutines |
| `stepOut` | Step out of current subroutine |
| `stepBack` | Step one instruction back in time |
| `runTo` | Run until address is reached. Param: `address` (4 hex digits, e.g. `0x4000`) |

## `debug_cpu` — Read/write CPU registers, stack, and disassemble

| Command | Description |
|---------|-------------|
| `getCpuRegisters` | Get all CPU register values |
| `getRegister` | Read a specific register. Param: `register` |
| `setRegister` | Write a register. Params: `register`, `value` (2–4 hex digits) |
| `getStackPile` | Get CPU stack overview |
| `disassemble` | Disassemble from address (or PC if omitted). Params: `address`, `size` (8–50 bytes) |
| `getActiveCpu` | Get active CPU: `z80` or `r800` |

**Available registers**: `pc`, `sp`, `ix`, `iy`, `af`, `bc`, `de`, `hl`, `ixh`, `ixl`, `iyh`, `iyl`, `af'`, `bc'`, `de'`, `hl'`, `a`, `f`, `b`, `c`, `d`, `e`, `h`, `l`, `i`, `r`, `im`, `iff`.

## `debug_memory` — RAM memory operations

| Command | Description |
|---------|-------------|
| `selectedSlots` | Get currently selected slots |
| `getBlock` | Hex dump from address. Params: `address`, `lines` (1–50, default 8) |
| `readByte` | Read byte at address. Param: `address` |
| `readWord` | Read 16-bit word at address. Param: `address` |
| `writeByte` | Write byte. Params: `address`, `value8` (hex byte) |
| `writeWord` | Write word. Params: `address`, `value16` (hex word) |
| `writeBlock` | Write a sequence of bytes to consecutive addresses. Params: `address` (start), `values` (space-separated hex bytes, e.g. `0x3E 0x01 0xC3 0x4F 0x22`) |
| `searchBytes` | Search for a byte sequence in memory RAM. Params: `address` (start), `length` (number of bytes to scan, up to 65536), `values` (space-separated hex bytes, e.g. `0x00 0xFF 0x53`). Returns all the addresses that match or not found. |

## `debug_vram` — VRAM video memory operations

| Command | Description |
|---------|-------------|
| `getBlock` | Hex dump from VRAM address. Params: `address` (5 hex digits, 20-bit), `lines` (1–50, default 8) |
| `readByte` | Read byte at VRAM address. Param: `address` |
| `writeByte` | Write byte to VRAM. Params: `address`, `value8` |
| `searchBytes` | Search for a byte sequence in memory VRAM. Params: `address` (start), `length` (number of bytes to scan, up to 65536), `values` (space-separated hex bytes, e.g. `0x42 0x41`). Returns all the addresses that match or not found. |

**Note**: VRAM addresses use 5 hex digits (20-bit), e.g. `0x00000`.

## `debug_breakpoints` — Breakpoint management

| Command | Description |
|---------|-------------|
| `create` | Create breakpoint at address. Param: `address`. Returns breakpoint name (e.g. `bp#1`) |
| `remove` | Remove breakpoint by name. Param: `bpname` (e.g. `bp#1`) |
| `list` | List all active breakpoints |
| `deleteAll` | Remove all active breakpoints at once |

**Tip**: Obtain function/variable addresses from `.sym` or `.map` files before creating breakpoints.

**Note**: The raw Tcl one-liner to delete all breakpoints:
`foreach {bpname body} [debug breakpoint list] { debug breakpoint remove $bpname }`

## `debug_watchpoints` — Watchpoint management

| Command | Description |
|---------|-------------|
| `create` | Create watchpoint with address/port range. Params: `type` (`read_mem`, `write_mem`, `read_io`, `write_io`), `begin` (start of range), `end` (end of range, must be >= begin). Optional: `condition` (Tcl condition), `cmd` (Tcl command to execute), `once` (remove after first trigger). Returns watchpoint name (e.g. `wp#1`) |
| `remove` | Remove watchpoint by name. Param: `wpname` (e.g. `wp#1`) |
| `list` | List all active watchpoints |
| `deleteAll` | Remove all active watchpoints at once |

**Note**: The raw Tcl one-liner to delete all watchpoints:
`foreach {wpname body} [debug watchpoint list] { debug watchpoint remove $wpname }`
