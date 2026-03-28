# Installation

Example of installation, may vary based on your MCP client and operating system. The key is to ensure the MCP server is launched with the correct command, arguments, and environment variables to locate openMSX.:

## MCP Configuration

### Visual Studio Code

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

For MacOS or Linux simply adjust the [`OPENMSX_SHARE_DIR`](skill-environment-variables.md) path format accordingly, and ensure `npx` and `openMSX` are installed and accessible in your environment.

### Other MCP Clients

Search your MCP client's documentation for how to configure servers, and use the above example as a reference for the command, arguments, and environment variables needed to launch the `mcp-openmsx` server.

## Environment Variables

See [Environment Variables](skill-environment-variables.md) for details on configuring environment variables to ensure the MCP server can locate the openMSX executable and share directory, as well as other optional settings for transport selection and logging.
