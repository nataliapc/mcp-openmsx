# Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `OPENMSX_EXECUTABLE` | `openmsx` | Path to openMSX binary |
| `OPENMSX_SHARE_DIR` | Auto-detected | openMSX share directory (machines, extensions) |
| `OPENMSX_SCREENSHOT_DIR` | openMSX default | Screenshot output directory |
| `OPENMSX_SCREENDUMP_DIR` | openMSX default | Screen dump output directory |
| `OPENMSX_REPLAYS_DIR` | openMSX default | Replay file directory |
| `MCP_TRANSPORT` | `stdio` | Transport mode: `stdio` or `http` |
| `MCP_HTTP_PORT` | `3000` | HTTP server port (when using `http` transport) |
| `MCP_ALLOWED_ORIGINS` | Empty (all allowed) | Comma-separated list of allowed origins for HTTP transport (e.g. `http://localhost,http://mydomain.com`) |

- `OPENMSX_EXECUTABLE` should point to the openMSX binary if it's not in your system's PATH. For example, on Windows it might be `C:\Program Files\openMSX\openmsx.exe`, and on Linux/Mac it could be `/usr/local/bin/openmsx` or `~/bin/openmsx`.
- `OPENMSX_SHARE_DIR` is required if the MCP server cannot auto-detect the openMSX share directory. This directory contains essential resources like machine definitions and extensions. Set it to the path of your openMSX share folder (e.g. `C:\Program Files\openMSX\share` on Windows, `~/.openMSX/share` or `/usr/local/share/openmsx` on Linux/Mac).
- `OPENMSX_SCREENSHOT_DIR` and `OPENMSX_SCREENDUMP_DIR` can be set to specify where screenshots and screen dumps are saved. By default, they will be saved in the openMSX default directories but can be customized into a specific workspace project folder for easier access.
- `OPENMSX_REPLAYS_DIR` specifies where replay files are stored when using time-travel debugging features.
- `MCP_TRANSPORT` allows you to choose between `stdio` (default) and `http` transport modes. Use `http` if you want to interact with the MCP server over HTTP, which can be useful for remote access.
- `MCP_HTTP_PORT` sets the port for the HTTP server when using `http` transport. Ensure this port is open and not used by other applications.
- `MCP_ALLOWED_ORIGINS` is important for security when using `http` transport. It restricts which origins can access the MCP server. If left empty, all origins are allowed, which may not be secure in a production environment. Set it to a comma-separated list of allowed origins (e.g. `http://localhost,http://mydomain.com`) to restrict access.
