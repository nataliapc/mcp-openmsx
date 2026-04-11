# Agent Instructions — mcp-openmsx

## Project Overview

MCP (Model Context Protocol) server for controlling the openMSX emulator. Enables AI agents to launch, operate, debug, and capture MSX emulation sessions via 17 registered tools.

- **Language**: TypeScript (strict, ES2022, ESM)
- **Runtime**: Node.js ≥ 18
- **Platforms**: Linux, macOS, Windows
- **Package**: `@nataliapc/mcp-openmsx` on npm

---

## Project Structure

```
mcp-openmsx/
├── mcp-server/
│   ├── src/
│   │   ├── server.ts              # MCP server init, env vars, shutdown handlers
│   │   ├── server_tools.ts        # 17 tool registrations (emulator, debug, media, VDP, etc.)
│   │   ├── server_resources.ts    # MCP resource registration (MSX docs, BASIC instructions)
│   │   ├── server_prompts.ts      # Prompt management
│   │   ├── server_elicitations.ts # Interactive machine/extension resolution
│   │   ├── server_sampling.ts     # LLM-based matching for machine names
│   │   ├── openmsx.ts             # OpenMSX wrapper (spawn, TCP/SSPI, stdio, command queue)
│   │   ├── utils.ts               # Pure utilities (parsers, encoding, path helpers)
│   │   └── vectordb.ts            # Vector DB wrapper for documentation search
│   ├── tests/                     # Vitest unit tests
│   │   ├── utils/                 # Pure function tests (parsing, encoding, validation, etc.)
│   │   ├── openmsx/               # OpenMSX class tests (command queue, lifecycle)
│   │   └── tools/                 # Tool handler logic tests (screenshot, replay, keyboard)
│   ├── resources/                 # MSX documentation (BASIC, audio, VDP, SDCC, etc.)
│   ├── vitest.config.ts           # Test configuration
│   ├── tsconfig.json              # TypeScript config (ES2022, Node16 modules, strict)
│   └── package.json
├── vector-db/                     # Embedding generation for documentation RAG
├── .agents/skills/                # Agent skills for MCP usage guidance
└── AGENTS.md                      # This file
```

---

## Communication with openMSX

The `OpenMSX` class (`openmsx.ts`) handles platform-specific emulator communication:

- **Linux/macOS**: `openmsx -control stdio` — commands via stdin, responses via stdout
- **Windows**: TCP socket with SSPI (Negotiate/NTLM) authentication

All commands are serialized via a promise queue (`commandQueue`) to prevent overlap. Responses are accumulated in a persistent `ioBuffer` and extracted when `</reply>` is found.

### Windows launch protocol

openMSX on Windows is compiled as `/SUBSYSTEM:WINDOWS` (GUI app). Piping stdin/stdout breaks the renderer, so a different approach is required:

1. **Spawn** with `stdio: ['ignore', 'ignore', 'pipe']` — only stderr is piped (for error detection). No `-control stdio` flag.
2. **Poll** for the TCP socket file at `%TEMP%\openmsx-default\socket.<pid>` (200ms interval, up to 8s). The file contains a port number (range 9938–9958).
3. **TCP connect** to `127.0.0.1:<port>`.
4. **SSPI authentication** — required since openMSX 0.7.1. Uses `node-expose-sspi` (optional dependency). Protocol: loop until `SEC_E_OK`, each round exchanges `[4-byte BE length][SSPI token]` with the server. No final read after `SEC_E_OK`.
5. **XML session** — send `<openmsx-control>\n`, wait for `<openmsx-output>` in the TCP stream.
6. **Ready** — send initial configuration commands (`set renderer`, `set power on`, `reverse start`).

The main TCP data handler is registered **before** SSPI auth to avoid missing data. During SSPI, binary tokens accumulate harmlessly in `ioBuffer` and are cleared before the XML session starts.

Reference implementations: openMSX debugger `SspiNegotiateClient.cpp`, DeZog `openmsxremote.ts`.

---

## Key Source Files

| File | Purpose |
|------|---------|
| `openmsx.ts` | Process lifecycle, platform-specific I/O, command queue, SSPI auth |
| `utils.ts` | Pure functions: parsers (`parseCpuRegs`, `parseVdpRegs`, `parsePalette`, `parseBreakpoints`, `parseReplayStatus`), encoding (`encodeHtmlEntities`, `decodeHtmlEntities`, `encodeTypeText`), helpers (`tclPath`, `buildKeyComboCommand`, `isErrorResponse`, `ensureDirectoryExists`) |
| `server_tools.ts` | 17 tools: `emu_control`, `emu_info`, `emu_media`, `emu_vdp`, `emu_keyboard`, `emu_savestates`, `emu_replay`, `screen_shot`, `screen_dump`, `debug_run`, `debug_cpu`, `debug_memory`, `debug_vram`, `debug_breakpoints`, `basic_programming`, `msxdocs_resource_get`, `vector_db_query` |
| `server.ts` | MCP server bootstrap, environment variable handling, directory auto-detection |

---

## Build & Run

```bash
cd mcp-server
npm install
npm run build          # TypeScript → dist/
npm start              # Run the MCP server
npm run dev            # Run with tsx (no build needed)
```

---

## Tests

Test framework: **Vitest** (ESM-native, no extra configuration needed).

```bash
cd mcp-server
npm test               # Run all tests once
npm run test:watch     # Watch mode (re-run on changes)
npm run test:coverage  # Run with coverage report
```

### Test structure

```
tests/
├── utils/
│   ├── parsing.test.ts      # parseCpuRegs, parseVdpRegs, parsePalette, parseBreakpoints, parseReplayStatus
│   ├── encoding.test.ts     # decodeHtmlEntities, encodeHtmlEntities, encodeTypeText, tclPath, roundtrips
│   ├── validation.test.ts   # is16bitRegister, isErrorResponse, getResponseContent
│   ├── keyboard.test.ts     # MSX_KEY_MATRIX data, buildKeyComboCommand
│   ├── paths.test.ts        # detectOpenMSXExecutable
│   ├── filesystem.test.ts   # extractDescriptionFromXML, addFileExtension, listResourcesDirectory, ensureDirectoryExists (mocked fs)
│   ├── network.test.ts      # fetchCleanWebpage (mocked fetch, gzip)
│   └── async.test.ts        # sleep, sleepWithAbort (fake timers, AbortController)
├── openmsx/
│   ├── command-queue.test.ts # sendCommand serialization, reply parsing, timeout, ioBuffer handling
│   └── lifecycle.test.ts     # emu_close, forceClose, resetIO, destroy, emu_isInBasic, emu_status
└── tools/
    ├── screenshot.test.ts    # Path resolution, directory scan fallback, as_image, TCL command construction
    ├── replay.test.ts        # Command construction, .omr extension, path normalization, status parsing
    └── keyboard.test.ts      # sendText encoding, sendKeyCombo matrix, error handling
```

### Writing new tests

- Pure functions in `utils.ts` → add to `tests/utils/`, no mocking needed
- Functions using `fs` or `fetch` → mock with `vi.mock('fs/promises')` or `vi.stubGlobal('fetch', ...)`
- OpenMSX class methods → inject state via `(instance as any).ioBuffer = ...` to bypass `emu_launch`
- Tool handler logic → reproduce the handler pattern inline, mock `openMSXInstance.sendCommand`

---

## Cross-Platform Notes

- Paths in TCL commands must use forward slashes on all platforms. Use `tclPath()` from `utils.ts` to normalize.
- `sharp` is an optional dependency (transitive from `@xenova/transformers`). It may fail to compile on Windows without C++ build tools — this is safe to ignore.
- `node-expose-sspi` is optional — only needed on Windows for SSPI authentication.

---

## Code Style

- ESM modules (`"type": "module"` in package.json)
- Strict TypeScript (`strict: true` in tsconfig)
- No trailing summaries or emojis in responses
- Prefer minimal changes; do not refactor unrelated code
- Test runner: Vitest with `globals: true` (no need to import `describe`/`it`/`expect` in test files)
