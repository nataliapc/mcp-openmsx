# Installation

Example of installation, may vary based on your MCP client and operating system. The key is to ensure the MCP server is launched with the correct command, arguments, and environment variables to locate openMSX.

## MCP Configuration

### Visual Studio Code

Example of `mcp.json` for launching with `stdio` transport in a VS Code workspace:

**Windows:**
```json
{
  "servers": {
    "mcp-openmsx": {
      "command": "npx",
      "args": ["-y", "@nataliapc/mcp-openmsx"],
      "env": {
        "OPENMSX_SHARE_DIR": "C:\\the\\location\\of\\your\\openmsx\\share"
      }
    }
  }
}
```

**macOS / Linux:** adjust the [`OPENMSX_SHARE_DIR`](skill-environment-variables.md) path format accordingly (forward slashes, no drive letter). Ensure `npx` and `openMSX` are installed and accessible in your environment.

### Codex (OpenAI CLI)

Codex does not automatically detect VS Code workspace MCP configurations. You must register the server globally:

```bash
# Windows (PowerShell)
codex mcp add --name mcp-openmsx `
  --command npx `
  --args "-y @nataliapc/mcp-openmsx" `
  --env "OPENMSX_SHARE_DIR=C:\\the\\location\\of\\your\\openmsx\\share"

# macOS / Linux
codex mcp add --name mcp-openmsx \
  --command npx \
  --args "-y @nataliapc/mcp-openmsx" \
  --env "OPENMSX_SHARE_DIR=/path/to/openmsx/share"
```

### Other MCP Clients

Search your MCP client's documentation for how to configure servers, and use the above examples as reference for the command, arguments, and environment variables needed to launch the `mcp-openmsx` server.

---

## HTTP Transport (fallback / alternative)

If stdio is unreliable in your MCP client (common in Codex or remote setups), use HTTP mode:

**Start the server manually in a terminal:**

```bash
# macOS / Linux
MCP_TRANSPORT=http MCP_HTTP_PORT=3000 npx -y @nataliapc/mcp-openmsx

# Windows (PowerShell)
$env:MCP_TRANSPORT="http"; $env:MCP_HTTP_PORT="3000"; npx -y @nataliapc/mcp-openmsx

# Windows (cmd)
set MCP_TRANSPORT=http && set MCP_HTTP_PORT=3000 && npx -y @nataliapc/mcp-openmsx
```

**Configure your MCP client to connect to:**
```
http://localhost:3000/mcp
```

> **Note:** The HTTP server must be started before the MCP client connects. Keep the terminal open for the duration of the session — the server stays alive until the process is killed.

> **Security note:** HTTP mode is not recommended for production or multi-user environments without setting `MCP_ALLOWED_ORIGINS`.

---

## Windows-specific Notes

- openMSX installs by default to `C:\Program Files\openMSX\`. The executable is `openmsx.exe`.
- If openMSX is **not** in your system PATH, set `OPENMSX_EXECUTABLE` to the full path:
  ```json
  "OPENMSX_EXECUTABLE": "C:\\Program Files\\openMSX\\openmsx.exe"
  ```
- All backslashes in JSON values must be escaped as `\\`.
- If `OPENMSX_SHARE_DIR` auto-detection fails, point it explicitly:
  ```json
  "OPENMSX_SHARE_DIR": "C:\\Program Files\\openMSX\\share"
  ```

## Environment Variables

See [Environment Variables](skill-environment-variables.md) for details on configuring environment variables to ensure the MCP server can locate the openMSX executable and share directory, as well as other optional settings for transport selection and logging.
