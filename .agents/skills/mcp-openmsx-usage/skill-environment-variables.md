# Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `OPENMSX_EXECUTABLE` | Auto-detected per platform | Path to openMSX binary |
| `OPENMSX_SHARE_DIR` | Auto-detected | openMSX share directory (machines, extensions) |
| `OPENMSX_SCREENSHOT_DIR` | openMSX default | Screenshot output directory |
| `OPENMSX_SCREENDUMP_DIR` | openMSX default | Screen dump output directory |
| `OPENMSX_REPLAYS_DIR` | openMSX default | Replay file directory |
| `OPENMSX_ENABLE_RAW_TCL` | `false` | Register the optional `openmsx_tcl_cmd` native Tcl tool when set to `true` |
| `MCP_TRANSPORT` | `stdio` | Transport mode: `stdio` or `http` |
| `MCP_HTTP_PORT` | `3000` | HTTP server port (when using `http` transport) |
| `MCP_ALLOWED_ORIGINS` | Empty (all allowed) | Comma-separated list of allowed origins for HTTP transport (e.g. `http://localhost,http://mydomain.com`) |

- `OPENMSX_EXECUTABLE` is auto-detected per platform and only needs to be set if the default does not work:
  - **Linux**: defaults to `openmsx` (expected in PATH after package install).
  - **macOS**: probes `/Applications/openMSX.app/Contents/MacOS/openmsx` first (standard .app bundle); falls back to `openmsx` in PATH (e.g. Homebrew). Override example: `/Applications/openMSX.app/Contents/MacOS/openmsx`.
  - **Windows**: defaults to `openmsx.exe` (expected in PATH). Override example: `C:\Program Files\openMSX\openmsx.exe`. In JSON config files backslashes must be escaped: `"C:\\Program Files\\openMSX\\openmsx.exe"`.
- `OPENMSX_SHARE_DIR` is required if the MCP server cannot auto-detect the openMSX share directory. This directory contains essential resources like machine definitions and extensions. Set it to the path of your openMSX share folder (e.g. `C:\Program Files\openMSX\share` on Windows, `~/.openMSX/share` or `/usr/local/share/openmsx` on Linux/Mac).
- `OPENMSX_SCREENSHOT_DIR` and `OPENMSX_SCREENDUMP_DIR` can be set to specify where screenshots and screen dumps are saved. By default, they will be saved in the openMSX default directories but can be customized into a specific workspace project folder for easier access.
- `OPENMSX_REPLAYS_DIR` specifies where replay files are stored when using time-travel debugging features.
- `OPENMSX_ENABLE_RAW_TCL=true` registers the unrestricted `openmsx_tcl_cmd` tool. It is disabled by default because Tcl can modify emulator state, access host files, load scripts, and terminate openMSX. **Only the user may enable this variable in the MCP configuration. An agent must never edit the configuration, set the variable, or restart the server to activate the tool.**
- `MCP_TRANSPORT` allows you to choose between `stdio` (default) and `http` transport modes. Use `http` if you want to interact with the MCP server over HTTP, which can be useful for remote access.
- `MCP_HTTP_PORT` sets the port for the HTTP server when using `http` transport. Ensure this port is open and not used by other applications.
- `MCP_ALLOWED_ORIGINS` is important for security when using `http` transport. It restricts which origins can access the MCP server. If left empty, all origins are allowed, which may not be secure in a production environment. Set it to a comma-separated list of allowed origins (e.g. `http://localhost,http://mydomain.com`) to restrict access.
