---
name: mcp-openmsx-usage
description: Control and automate the openMSX emulator for MSX / MSX2 retro development. Covers Z80 and R800 assembly debugging, Z80 CPU inspection, VDP (V9938/V9958) programming, PSG sound, MSX-BASIC development, ROM/disk/tape media management, screen capture, breakpoints, memory inspection, and SDCC C development workflows. Use when direct openMSX emulator interaction is required or MSX technical information is needed.
metadata:
  authors: https://github.com/nataliapc
  version: "1.2.3"
---

# MCP-OpenMSX Usage Guide

## Skill usage

- Read this file completely.
- Read the linked files if topic/description is relevant to your task. Always load reference files if there is even a small chance the content may be required. It's better to have the context than to miss a pattern or make a mistake.

## Overview

`mcp-openmsx` is an MCP server that bridges AI assistants with the openMSX MSX emulator. It spawns openMSX, sending TCL commands via STDIO or HTTP transports.

**Typical workflow**: launch emulator → insert media → interact (keyboard/BASIC/debug) → capture screen → close.

## Prerequisites

- **Node.js >= 18** with `npx`:
  - Windows: install via [nodejs.org](https://nodejs.org/) or `winget install OpenJS.NodeJS`
  - macOS: `brew install node` or the official installer
  - Linux: use your distro package manager or [nvm](https://github.com/nvm-sh/nvm)
- **openMSX emulator** installed and accessible (see [MCP Configuration](skill-mcp-configuration.md) for per-OS paths).
  Set `OPENMSX_EXECUTABLE` [env](skill-environment-variables.md) if not in PATH.
- [`mcp-openmsx` configured](skill-mcp-configuration.md) in your MCP client.
- Set `OPENMSX_SHARE_DIR` [env](skill-environment-variables.md) if auto-detection fails or a custom folder is needed.

## Skill Index

- [MCP Configuration](skill-mcp-configuration.md): How to configure the MCP server, including transport selection (stdio vs HTTP), emulator executable path, and share directory settings.
- [Environment Variables](skill-environment-variables.md)
- MCP tools reference:
    1. [Emulator Control](skill-tools-emulator-control.md): Manage emulator state (launch, power, reset), media (tapes, ROMs, disks), machine info, keyboard input, savestates, and time-travel replay.
    2. [VDP (Video Display Processor)](skill-tools-vdp-video-display-processor.md): Inspect and modify VDP state, including registers, palette, screen mode, and text content.
    3. [Screen Capture](skill-tools-screen-capture.md): Capture screenshots, and screen memory dumps from the emulator.
    4. [Debugging](skill-tools-debugging.md): Control execution (break, continue, step), inspect CPU registers, RAM, and VRAM, manage breakpoints.
    5. [BASIC Programming](skill-tools-basic-programming.md): Write, load, run, and manage BASIC programs on the emulator.
    6. [Documentation & Search](skill-tools-documentation-search.md): Search and retrieve MSX technical documentation from the embedded vector database and resource library to support development tasks.
- [MCP Resources](skill-mcp-resources-prompts.md): Extensive collection of MSX documentation resources and reference materials embedded in the MCP vector database, organized by category and topic for easy retrieval.
- [MCP Prompts](skill-mcp-resources-prompts.md): Custom MCP prompts for generating structured reference materials based on the embedded documentation resources, such as an MSX BASIC instruction manual page.
- [Tips & Best Practices](#tips--best-practices)

## Workflows reference files and guides

Detailed step-by-step guides for common workflows. ALWAYS load reference files if there is even a small chance the content may be required. It's better to have the context than to miss a pattern or make a mistake. Read the relevant file when needed:

- **[MSX documentation search workflow](references/documentation.md)** — Search and retrieve MSX technical documentation from the embedded vector database and resource library to support development tasks.
- **[Launch and configure an MSX machine](references/launch-machine.md)** — Discover machines/extensions, launch, wait for boot, verify status, speed control, power cycle.
- **[Programming in MSX BASIC](references/basic-programming.md)** — Write, load, run, verify, and manage BASIC programs. Includes line management, interrupting, and loading large programs.
- **[Debugging the VDP](references/debug-vdp.md)** — Inspect/modify VDP registers, palette, VRAM, screen modes. Includes sprite debugging and screen corruption analysis workflows.
- **[Debugging a BASIC program](references/debug-basic.md)** — Interrupt execution, inspect state, edit lines, low-level interpreter debugging, time-travel, infinite loop detection, variable inspection.
- **[Debugging an ASM program](references/debug-asm.md)** — Breakpoints, stepping, register/memory inspection, disassembly, BIOS call verification, crash/hang analysis, locating functions without .sym files.
- **[Debugging MSX-DOS programs](references/debug-dos-program.md)** — Correct breakpoint workflow for MSX-DOS disk-loaded programs. Avoids boot contamination (BIOS/DOS firing breakpoints before app starts). Includes hang detection and savestate checkpointing.
- **[Working with media (ROM, disk, tape)](references/media-management.md)** — Insert/eject ROMs, disks, tapes. Development workflows for each media type.
- **[Time-travel debugging with replay and savestates](references/replay-savestates.md)** — Timeline navigation, frame-by-frame stepping, checkpointing, comparing execution paths.
- **[Screen capture and visual verification](references/screen-capture.md)** — Screenshots (inline/file), screen dumps (MSX format), text reading, before/after comparison.

## Tips & Best Practices

- Use always `\r` (CR) as line terminators in BASIC programs. Avoid `\n` (LF) or `\r\n` (CRLF) to prevent parsing issues.
- Always fetch the documentation of every BASIC command you use with the BASIC Wiki resource or `vector_db_query` to ensure correct syntax, parameters, and behaviors.
- All addresses and values use hexadecimal format (e.g. `0x4000`, `0xA5`).
- Always `emu_control.wait` a few seconds after `launch` to let the machine fully boot before interacting.
- Use `screen_shot.as_image` to visually verify emulator state at any point.
- Use `debug_run.break` before `emu_replay.goBack` or `absoluteGoto` to keep the timeline stable.
- Use `vector_db_query` to search MSX documentation before relying on general knowledge.
- Use `basic_programming` tools instead of `emu_keyboard.sendText` for BASIC development — they handle speed optimization and input encoding automatically.
- Use `emu_savestates` to checkpoint progress during complex debugging sessions.
- Addresses from `.sym`/`.map` files can be used directly with `debug_breakpoints.create` and `debug_run.runTo`.
- **MSX-DOS programs**: never set breakpoints before confirming the app is on screen — the BIOS/DOS boot fires them first. See [Debugging MSX-DOS Programs](references/debug-dos-program.md).
- CP437 character encoding is the nearest encoding for MSX international charmap, use it for text input/output. Be mindful of special characters.
