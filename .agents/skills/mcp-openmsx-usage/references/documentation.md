# Use Case: Querying MSX Documentation

## Goal

Search and retrieve MSX technical documentation from the embedded vector database and resource library to support development tasks.

## Index

- [Vector DB Search](#vector-db-search)
    - [When to use](#when-to-use)
    - [Example queries](#example-queries)
    - [Tips](#tips)
- [Direct Resource Access](#direct-resource-access)
    - [When to use](#when-to-use-1)
. [Direct BASIC wiki access (preferred for named instructions)](#direct-basic-wiki-access-preferred-for-named-instructions)
- [Available Resource Categories](#available-resource-categories)
- [BASIC Wiki Resource Template](#basic-wiki-resource-template)
- [Workflow: Research Before Coding](#workflow-research-before-coding)

## Vector DB Search

```
vector_db_query { query: "VDP sprite attributes table format" }
```

Searches across 60+ embedded resources. Returns top 10 results sorted by proximity score, each with:
- `score` — relevance (lower is closer)
- `title` — resource title
- `uri` — resource identifier
- `document` — content chunk
- `id` — unique chunk ID

### When to use

- **Before answering general MSX questions** — always search first rather than relying on general knowledge.
- When looking for: register maps, BIOS entry points, VDP behavior, memory layouts, I/O port assignments, instruction sets, MSX-DOS functions, audio hardware details.

### Example queries

```
vector_db_query { query: "Z80 instruction set reference" }
vector_db_query { query: "MSX BIOS CHPUT character output" }
vector_db_query { query: "V9938 palette registers" }
vector_db_query { query: "MSX-DOS 2 function calls" }
vector_db_query { query: "PSG sound registers AY-3-8910" }
vector_db_query { query: "SCC sound cartridge waveform" }
vector_db_query { query: "SDCC compiler MSX compilation" }
vector_db_query { query: "MSX memory map slot system" }
vector_db_query { query: "screen 5 bitmap mode VRAM layout" }
vector_db_query { query: "interrupt handler IM1 IM2" }
```

### Tips

- **Broad queries** return more diverse results. **Specific queries** return more relevant results.
- Query primarily in English for best results (resources are primarily in English), but there are also resources in Japanese and Dutch.
- Use `vector_db_query` for discovery, `msxdocs_resource_get` for full document retrieval.
- The vector DB is local and fast — don't hesitate to make multiple queries to refine your search.

## Direct Resource Access

```
msxdocs_resource_get { resourceName: "msxdocs_bios_MSX_BIOS_calls" }
```

Retrieves a complete named resource. Use when you know exactly which document you need. The `resourceName` parameter is a predefined enum populated from all registered resources.

**When to use**: As a fallback for MCP clients that don't support native MCP resources, or when you need the full document rather than search-matched chunks.

### Direct BASIC wiki access (preferred for named instructions)

For any of the ~136 standard MSX BASIC instructions, the `basic_wiki` resource gives a complete manual page (Effect, Syntax, Parameters, Examples, Related, Compatibility) in one call: no chunking, no relevance scoring.

```
Examples:

read_mcp_resource(server="mcp-openmsx", uri="msxdocs://basic_wiki/MID$()")
read_mcp_resource(server="mcp-openmsx", uri="msxdocs://basic_wiki/SCREEN")
read_mcp_resource(server="mcp-openmsx", uri="msxdocs://basic_wiki/POKE")
```

> The instruction name in the URI must match the wiki page name (case-sensitive). Common ones: MID$(), LEFT$(), RIGHT$(), SCREEN, PRINT, FOR, NEXT, POKE, PEEK, VPOKE, VPEEK, SPRITE, CIRCLE, LINE, PAINT, BLOAD, BSAVE, DEFUSR, USR, PUT, GET.

## Main Available Resource Categories

| Category | Example Topics |
|----------|---------------|
| **Processors** | Z80 full instruction set, R800 instructions, undocumented Z80 opcodes |
| **BIOS** | MSX BIOS calls (0x0000-0x01B5), MSX2 SUBROM BIOS, calling BIOS from MSX-DOS |
| **System** | I/O port map (0x00-0xFF), system work area variables |
| **Audio** | PSG (AY-3-8910) registers, SCC/SCC-I waveform RAM, MIDI interface, MoonSound (OPL4), MGSDRV MML syntax |
| **Video** | TMS9918A datasheet, V9938 programmer guide, V9958 extensions, V9990 programmer manual |
| **Programming** | VDP command tutorial, scrolling techniques, ASM library routines, VRAM timing constraints, screen mode guides |
| **MSX-DOS** | DOS 2 function calls (0x40-0x7F), program interface spec, environment variables |
| **MSX-UNAPI** | UNAPI specification, Ethernet UNAPI, TCP/IP UNAPI |
| **SDCC** | Compiler user guide, release notes, MSX-specific compilation flags |
| **Books** | MSX2 Technical Handbook (Chapters 1-5, Appendices 1-10), The MSX Red Book |
| **Others** | MemMan 2.4 TSR kit, keyboard matrix maps |

## Workflow: Research Before Coding

1. **Known instruction?** `read_mcp_resource(server="mcp-openmsx", uri="msxdocs://basic_wiki/{INSTRUCTION}")`: get the full manual page.
2. **Unknown topic?** `vector_db_query { query: "how to set up sprites in screen 2" }`: find relevant docs and read top results.
3. Write the code based on accurate documentation.
4. **Need more?** `vector_db_query { query: "sprite collision detection" }` for follow-up.
