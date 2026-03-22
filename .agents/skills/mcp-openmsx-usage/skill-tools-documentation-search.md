# Documentation & Search

## `vector_db_query` — Query the embedded Vector DB for MSX documentation

Search the local vector database for MSX-related documentation. Param: `query` (2–100 chars, case-insensitive). Returns top 10 results sorted by proximity score with title, URI, and content.

**Use this tool** before answering general MSX questions — it searches semantically across 60+ embedded resources covering processors, BIOS, VDP, MSX-DOS, audio, programming guides, and more.

## `msxdocs_resource_get` — Retrieve a specific MSX documentation resource

Get a named documentation resource directly. Param: `resourceName` (from a predefined enum of all registered resources). Use as fallback for MCP clients that don't support native MCP resources or when a full resource is needed instead of a search snippet.
