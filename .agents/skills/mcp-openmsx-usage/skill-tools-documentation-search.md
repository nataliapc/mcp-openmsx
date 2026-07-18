# Documentation & Search

The MCP provides **three ways** to access MSX documentation. Pick by use case:

| Use case | Tool | Why |
|----------|------|-----|
| Known BASIC instruction (`MID$`, `SCREEN`, `POKE`, `PRINT`...) | `read_mcp_resource` with `msxdocs://basic_wiki/{INSTRUCTION}` | Full instruction page, no chunking, zero noise |
| Known resource by name (BIOS call list, VDP register map) | `msxdocs_resource_get` | Direct fetch by enum name |
| Discover by topic / cross-cutting question | `vector_db_query` | Semantic search over 60+ resources |

## `read_mcp_resource` — Read a documentation resource by URI

Preferred for BASIC instructions. URIs follow the pattern `msxdocs://basic_wiki/{INSTRUCTION}` (case-sensitive in the instruction name; the ~136 standard instructions are all available).

Example:
`read_mcp_resource(server="mcp-openmsx", uri="msxdocs://basic_wiki/MID$()")`
`read_mcp_resource(server="mcp-openmsx", uri="msxdocs://basic_wiki/SCREEN")`
`read_mcp_resource(server="mcp-openmsx", uri="msxdocs://basic_wiki/POKE")`

**When to use**: Whenever the user asks or you need information about a specific named BASIC instruction, the `basic_wiki` resource gives the full Effect / Syntax / Parameters / Examples / Related / Compatibility page in one call — no search result ranking noise, no truncated chunks.

## `msxdocs_resource_get` — Retrieve a resource by enum name

Typed alternative for clients that don't expose `read_mcp_resource`. Param `resourceName` is a predefined enum (e.g. `msxdocs_bios_MSX_BIOS_calls`, `msxdocs_book--msx2-technical-handbook_chapter_2_basic`). Use when you know the exact resource name from `list_mcp_resources`.

You can obtain the exact resource name by calling `list_mcp_resources` or from the results of a `vector_db_query` (field `uri`).

## `vector_db_query` — Semantic search over 60+ resources

Param: `query` (2-100 chars, case-insensitive). Returns top 10 results with `score`, `title`, `uri`, and a content chunk.

**Reserved for discovery and cross-cutting questions** — NOT for retrieving a known BASIC instruction, which is faster and cleaner via `read_mcp_resource`.

When to use:
- Before answering general MSX questions you don't have a direct reference for.
- When looking for register maps, BIOS entry points, VDP behavior, memory layouts, I/O port assignments, audio hardware details, etc.
- When the user asks about a topic that spans multiple resources (e.g. "interlaced display in SCREEN 8 with sprites").
- Using `vector_db_query` in combination with the two above tools is the most effective way to answer questions about MSX hardware, software, and programming.