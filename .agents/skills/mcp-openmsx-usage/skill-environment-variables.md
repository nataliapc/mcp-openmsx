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
