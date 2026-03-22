# Use Case: Screen Capture and Visual Verification

## Goal

Capture the emulator screen as an image for visual verification, save screenshots to disk, export screen data in MSX format, or read text directly from the screen.

## Index

- [Screenshot as Image (AI Visual Analysis)](#screenshot-as-image-ai-visual-analysis)
- [Screenshot to File](#screenshot-to-file)
- [Screen Dump (MSX SC Format)](#screen-dump-msx-sc-format)
- [Read Screen Text](#read-screen-text)
- [Workflow: Visual Verification of a BASIC Program](#workflow-visual-verification-of-a-basic-program)
- [Workflow: Before/After Comparison](#workflow-beforeafter-comparison)
- [Workflow: Capture Graphics for Documentation](#workflow-capture-graphics-for-documentation)
- [Tips](#tips)

## Screenshot as Image (AI Visual Analysis)

```
screen_shot { command: "as_image" }
```

Returns a base64-encoded PNG image inline. The image is generated as a raw PNG, read into memory, encoded, and the temp file is deleted automatically.

The response contains both:
- `text` content: "Screenshot taken successfully: ..."
- `image` content: base64-encoded PNG (MIME type `image/png`)

**Best for**: AI-powered visual verification — the agent can analyze the image content to verify correct rendering, detect UI issues, or validate program output.

## Screenshot to File

```
screen_shot { command: "to_file" }
```

Saves the screenshot to `OPENMSX_SCREENSHOT_DIR` with an auto-incrementing filename (e.g., `mcp_0001.png`). Returns the file path.

**Best for**: Saving screenshots for later review or documentation.

## Screen Dump (MSX SC Format)

```
screen_dump { scrbasename: "my_screen" }
```

Exports the current screen data in MSX BASIC BSAVE format. The file extension matches the current screen mode (`.SC0`, `.SC2`, `.SC5`, etc.). Saved to `OPENMSX_SCREENDUMP_DIR`.

**Best for**: Extracting screen data for use in MSX programs (e.g., loading with `BLOAD"filename.SC2",S`).

## Read Screen Text

```
emu_vdp { command: "screenGetFullText" }
```

Returns the full text content of the screen as a string. Only works in text modes (SCREEN 0 and SCREEN 1).

**Best for**: Reading program output, error messages, directory listings, or BASIC prompts without taking a screenshot.

## Workflow: Visual Verification of a BASIC Program

1. `basic_programming { command: "setProgram", program: "10 SCREEN 2\n20 CIRCLE(128,96),50,15\n30 GOTO 30" }`
2. `basic_programming { command: "runProgram" }`
3. `emu_control { command: "wait", seconds: 2 }`
4. `screen_shot { command: "as_image" }` — verify the circle is drawn correctly
5. `emu_keyboard { command: "sendKeyCombo", keys: ["CTRL", "STOP"] }` — stop the program

## Workflow: Before/After Comparison

1. `screen_shot { command: "as_image" }` — capture "before" state
2. *(make changes: write memory, modify VDP registers, run code)*
3. `screen_shot { command: "as_image" }` — capture "after" state
4. Compare the two images

## Workflow: Capture Graphics for Documentation

1. Run the program until the desired visual state
2. `screen_shot { command: "to_file" }` — save PNG for documentation
3. `screen_dump { scrbasename: "screenshot" }` — save MSX-native format for the MSX program itself

## Tips

- Check de video mode with `emu_vdp { command: "screenGetMode" }` to decide whether to use `screenGetFullText` or `as_image`.
- Use `as_image` when the AI agent needs to analyze the visual output.
- Use `to_file` when you need the screenshot saved permanently.
- Use `screenGetFullText` for text-mode output — faster and more precise than image analysis.
- Use `screen_dump` when you need the raw MSX screen data for use within MSX programs or analize raw VRAM.
- Screenshots include the full emulator rendering including borders.
