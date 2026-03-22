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
- [BASIC Instruction Reference (MCP Prompt)](#basic-instruction-reference-mcp-prompt)
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

## BASIC Instruction Reference (MCP Prompt)

You can query the BASIC wiki resources from mcp-openmsx:

```
# msxdocs_basic_wiki resource
msxdocs://basic_wiki/{instruction}
```

You can also use the `basic` MCP prompt generates comprehensive instruction manual pages:

- Input: `{ instruction: "PRINT" }`
- Output: Structured reference with Description, Syntax, Parameters, Notes, Usage examples, Related instructions, Availability, and Sources.

Sources exclusively from MCP resources (not general knowledge). If the instruction is unknown, suggests up to 5 similar instructions.

Covers all 136 standard MSX BASIC instructions.

## Available Resource Categories

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

## BASIC Wiki Resource Template

```
msxdocs_basic_wiki/{instruction}
```

Provides documentation for 136 MSX BASIC instructions. Example instructions: `PRINT`, `FOR`, `NEXT`, `POKE`, `PEEK`, `SCREEN`, `CIRCLE`, `LINE`, `PAINT`, `SPRITE`, `VPOKE`, `VPEEK`, `DEFUSR`, `USR`, `BLOAD`, `BSAVE`, `COPY`, `PUT`, `GET`, etc.

## Workflow: Research Before Coding

1. `vector_db_query { query: "how to set up sprites in screen 2" }` — find relevant docs
2. Read the top results to understand sprite attribute format, pattern definitions, and VDP register settings
3. Write the code based on accurate documentation
4. `vector_db_query { query: "sprite collision detection" }` — find additional info if needed
