# Installation

Example of installation, may vary based on your MCP client and operating system. The key is to ensure the MCP server is launched with the correct command, arguments, and environment variables to locate openMSX.:

Example of `mcp.json` for launching with `stdio` transport in a VSCode-based Windows environment:

```json
{
  "servers": {
    "mcp-openmsx": {
      "command": "npx",
      "args": ["-y", "@nataliapc/mcp-openmsx"],
      "env": {
        "OPENMSX_SHARE_DIR": "C:\\the\\location\\of\\your\\openmsx\\share\\folder"
      }
    }
  }
}
```

For MacOS or Linux simply adjust the `OPENMSX_SHARE_DIR` path format accordingly, and ensure `npx` and `openMSX` are installed and accessible in your environment.
