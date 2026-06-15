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
│   │   ├── openmsx.ts             # OpenMSX wrapper (spawn, stdio/TCP/SSPI, command queue)
│   │   ├── openmsx_windows_connector.ts # Windows control transport (stdio-proxy mode, socket port polling)
│   │   ├── utils.ts               # Pure utilities (parsers, encoding, path helpers)
│   │   └── vectordb.ts            # Vector DB wrapper for documentation search
│   ├── helpers/
│   │   └── openmsx-sspi-proxy/    # .NET SSPI stdio proxy (Windows) — C# source
│   ├── bin/win-x64/               # Built proxy executable (gitignored; published in npm package)
│   ├── tests/                     # Vitest unit tests
│   │   ├── utils/                 # Pure function tests (parsing, encoding, validation, etc.)
│   │   ├── openmsx/               # OpenMSX class tests (command queue, lifecycle, windows-connector)
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
- **Windows**: openMSX's TCP control socket needs SSPI (Negotiate/NTLM) auth. Two modes, selected by `OPENMSX_WINDOWS_CONTROL` (see below); `stdio-proxy` is the default.

All commands are serialized via a promise queue (`commandQueue`) to prevent overlap. Responses are accumulated in a persistent `ioBuffer` and extracted when `</reply>` is found. The active write channel is held in `controlWritable` (process stdin, TCP socket, or proxy stdin) so `writeData`/`readData` are transport-agnostic.

### Windows launch protocol

openMSX on Windows is compiled as `/SUBSYSTEM:WINDOWS` (GUI app). Piping stdin/stdout breaks the renderer, and its TCP control socket requires SSPI auth since openMSX 0.7.1. `OPENMSX_WINDOWS_CONTROL` selects the transport (resolved by `OpenMsxWindowsConnector.getControlMode`):

| Value | Description |
|-------|-------------|
| `stdio-proxy` | **Default.** Bundled .NET helper does SSPI and exposes clean XML stdio. |
| `direct-sspi` | Node does SSPI via `node-expose-sspi`. Fallback. |
| `socket` | Legacy alias of `direct-sspi`. |
| `pipe` | Reserved, not implemented (returns a clear error). |

**Default (`stdio-proxy`)** — handled by `OpenMsxWindowsConnector` (`openmsx_windows_connector.ts`):

1. **Spawn** openMSX GUI with `stdio: ['ignore', 'ignore', 'pipe']`. No `-control stdio` flag.
2. **Poll** `%TEMP%\openmsx-default\socket.<pid>` for the TCP port (`waitForWindowsSocketPort`).
3. **Launch** `bin/win-x64/mcp-openmsx-sspi-proxy.exe <port>` (the .NET helper). It connects to `127.0.0.1:<port>`, does the SSPI handshake (via `System.Net.Security.NegotiateAuthentication`, no external dependency), and pipes raw bytes between its stdin/stdout and openMSX.
4. **XML session** — the server sends `<openmsx-control>\n` through the proxy's stdin and waits for `<openmsx-output>` on its stdout, exactly like the Linux/macOS flow. The proxy never injects anything into stdout.
5. **Ready** — send initial configuration commands (`set renderer`, `set power on`, `reverse start`).

The openMSX GUI and the proxy are **separate processes** (`this.process` vs `this.controlProcess`); `emu_close`/`forceClose` tear down both.

**Fallback (`direct-sspi`)** — kept inline in `openmsx.ts` (`launchConnectWindows` + `performSspiAuth`): TCP connect + SSPI via `node-expose-sspi` (optional dependency). The main TCP data handler is registered **before** SSPI auth; binary tokens accumulate harmlessly in `ioBuffer` and are cleared before the XML session.

The proxy source lives in `helpers/openmsx-sspi-proxy/`; rebuild with `pnpm build:proxy:win-x64:docker`.

Reference implementations: openMSX debugger `SspiNegotiateClient.cpp`, DeZog `openmsxremote.ts`, and the reference C# proxy (`Program.cs`) the helper is adapted from.

---

## Key Source Files

| File | Purpose |
|------|---------|
| `openmsx.ts` | Process lifecycle, platform-agnostic I/O (`controlWritable`), command queue, Windows `direct-sspi` fallback |
| `openmsx_windows_connector.ts` | Windows `stdio-proxy` transport: control-mode resolution, proxy path resolution, socket-port polling, proxy launch |
| `helpers/openmsx-sspi-proxy/Program.cs` | .NET stdio↔TCP+SSPI proxy (`NegotiateAuthentication`); built to `bin/win-x64/` via `pnpm build:proxy:win-x64:docker` |
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

### Windows SSPI proxy (.NET helper)

The proxy is **not** built by the normal `build` (it needs Docker or a local .NET SDK). Build it explicitly with `pnpm`:

```bash
cd mcp-server
pnpm build:proxy:win-x64:docker   # reproducible cross-build from Linux via Docker
# or, with a local .NET 8 SDK:
pnpm build:proxy:win-x64
```

Output: `bin/win-x64/mcp-openmsx-sspi-proxy.exe` (self-contained, included in the published npm package via `package.json` `files`).

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
- `node-expose-sspi` is optional — only needed on Windows for the `direct-sspi` fallback. The default `stdio-proxy` mode does not use it.
- The bundled `bin/win-x64/mcp-openmsx-sspi-proxy.exe` is a self-contained .NET binary; it runs on Windows without a .NET runtime installed.

---

## Code Style

- ESM modules (`"type": "module"` in package.json)
- Strict TypeScript (`strict: true` in tsconfig)
- No trailing summaries or emojis in responses
- Prefer minimal changes; do not refactor unrelated code
- Test runner: Vitest with `globals: true` (no need to import `describe`/`it`/`expect` in test files)
