# Screen Capture

## `screen_shot` — Take a screenshot of the emulator screen

| Command | Description |
|---------|-------------|
| `as_image` | Capture and return as base64-encoded PNG image (auto-deletes temp file) |
| `to_file` | Capture and return the file path |

## `screen_dump` — Take a screendump as SC? format

Single command. Param: `scrbasename` (output filename without path/extension, default `"screendump"`).

## Troubleshooting

`screen_shot` and `screen_dump` write into openMSX's screenshots directory (e.g. `/opt/openMSX/share/screenshots`) and fail with `EACCES` when it is not writable. Workaround: use the native Tcl command via `openmsx_openmsx_tcl_cmd`:

```
screenshot /abs/path.png
```

The command name is `screenshot`, not `save_screenshot`. For text-mode screens, `screenGetFullText` reads the screen content directly with no filesystem access.
