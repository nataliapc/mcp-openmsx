# MCP Resources

Over 60 documentation resources organized by category:

| Category | Topics |
|----------|--------|
| **Processors** | Z80 instruction set, R800 instructions, undocumented Z80 |
| **BIOS** | MSX BIOS calls, MSX2 SUBROM BIOS, calling BIOS from DOS |
| **System** | I/O ports, system variables |
| **Audio** | PSG registers, SCC/SCC-I, MIDI, MoonSound, MGSDRV MML |
| **Video** | TMS9918A, V9938, V9958, V9990 programmer manuals |
| **Programming** | VDP tutorials, scrolling engines, ASM routines, VRAM timings, screen modes |
| **MSX-DOS** | DOS 2 function specs, program interface, environment variables |
| **MSX-UNAPI** | UNAPI spec, Ethernet, TCP/IP |
| **SDCC** | SDCC compiler user guide and release notes |
| **Books** | MSX2 Technical Handbook (all chapters + appendices), The MSX Red Book |
| **Others** | MemMan TSR kit, keyboard matrices |

Additionally, a **resource template** `msxdocs_basic_wiki` provides documentation for 136 MSX BASIC instructions (e.g. `PRINT`, `FOR`, `POKE`, `SCREEN`).

# MCP Prompts

- **`basic`**: Generate an MSX BASIC instruction manual page. Param: `instruction` (e.g. `PRINT`). Produces a structured reference with syntax, parameters, examples, and related instructions sourced exclusively from MCP resources.

