# MCP-openMSX

*"Orchestrating a binary opera where AI conducts, MCP interprets, and openMSX acts as the 8-bit diva."*

A [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) server for automating [openMSX emulator](https://github.com/openMSX/openMSX) instances.

This server provides comprehensive tools for MSX software development, testing, and automation through standardized MCP protocols.

## 🎯 Project Overview

This project creates a bridge between modern AI-assisted development (e.g. GitHub Copilot, Claude Desktop) and retro computing (MSX systems) by providing:

- **Emulator Control**: Launch, configure, manage openMSX instances, and replay timelines.
- **Media Management**: Handle ROM cartridges, floppy disks, and cassette tapes.
- **BASIC Programming Support**: Tools to facilitate BASIC language programming and development.
- **Debugging Tools**: Full CPU debugging with breakpoints, memory inspection, and step execution.
- **Video Control**: VDP register manipulation and screen capture.
- **Memory Operations**: Read/write RAM, VRAM, and I/O port access.
- **Automation**: Keyboard input simulation and savestate management.
- **Dual Transport**: Support for both stdio and HTTP transports.

## 🏗️ Architecture

```mermaid
flowchart TB
  subgraph subGraph0["Your computer for develop"]
    HOST["Your AI dev companion<br>(mcp client support)"]
    MCP(["mcp-openmsx<br>(mcp server)"])
    EMU["openMSX emulator<br>(local instance)"]
    HOST <--&nbsp;MCP&nbsp;<br>&nbsp;protocol&nbsp;--> MCP
    MCP <--&nbsp;stdio&nbsp;--> EMU
  end
    HOST@{ shape: rounded}
    EMU@{ shape: rounded}
    style subGraph0 color:#fff,fill:#5555
    style HOST color:#000000,fill:#BBDEFB,stroke-width:4px,stroke-dasharray:0
    style MCP color:#000000,fill:#FFF9C4
    style EMU color:#FFFFFF,fill:#0000FF,stroke-width:4px,stroke-dasharray:0
```

The MCP server translates high-level commands from your Copilot AI into `TCL` commands to control `openMSX`, enabling automated MSX software _testing_ and _debugging_.

## 🛠️ Available MCP Tools

### Emulator Control Tools
- `emu_control`: Controls an openMSX emulator: _`launch`, `close`, `powerOn`, `powerOff`, `reset`, `getEmulatorSpeed`, `setEmulatorSpeed`, `machineList`, `extensionList`, `wait`_.
- `emu_replay`: Controls emulation timeline: _`start`, `stop`, `status`, `goBack`, `absoluteGoto`, `truncate`, `saveReplay`, `loadReplay`_.
- `emu_info`: Obtain informacion about the current emulated machine: _`getStatus`, `getSlotsMap`, `getIOPortsMap`_.
- `emu_media`: Manage ROM, disk, and tape media: _`tapeInsert`, `tapeRewind`, `tapeEject`, `romInsert`, `romEject`, `diskInsert`, `diskInsertFolder`, `diskEject`_.
- `emu_vdp`: Manage VDP (Video Display Processor): _`getPalette`, `getRegisters`, `getRegisterValue`, `setRegisterValue`, `screenGetMode`, `screenGetFullText`_.

### Programming Tools
- `basic_programming`: BASIC tools: _`newProgram`, `runProgram`, `setProgram`, `getFullProgram`, `getFullProgramAdvanced`, `listProgramLines`, `deleteProgramLines`_.

### Debugging Tools
- `debug_run`: Control execution: _`break`, `isBreaked`, `continue`, `stepIn`, `stepOut`, `stepOver`, `stepBack`, `runTo`_.
- `debug_cpu`: Read/write CPU registers, CPU info, Stack pile, and Disassemble code: _`getCpuRegisters`, `getRegister`, `setRegister`, `getStackPile`, `disassemble`, `getActiveCpu`_.
- `debug_memory`: RAM memory operations: _`selectedSlots`, `getBlock`, `readByte`, `readWord`, `writeByte`, `writeWord`, `advanced_basic_listing`_.
- `debug_vram`: VRAM operations: _`getBlock`, `readByte`, `writeByte`_.
- `debug_breakpoints`: Breakpoint management: _`create`, `remove`, `list`_.

### Automation Tools
- `emu_keyboard`: Send text input to emulator: _`sendText`_.
- `emu_savestates`: Save and restore machine states: _`load`, `save`, `list`_.
- `screen_shot`: Capture emulator screen: _`as_image`, `to_file`_.
- `screen_dump`: Export screen data as BASIC BSAVE instruction.

## 📚 Available MCP Resources

### What are MCP Resources?

MCP resources are structured data sets, documentation, and helper files that extend the capabilities of the MCP server. They provide essential information such as machine definitions, extension lists, media templates, and programming examples, enabling more powerful automation, testing, and development workflows for MSX software within the MCP-openMSX environment.

### Available Resources

There are more than 60 resources available, some included directly in the MCP and others accessible via download when queried. They are organized into the following categories:

- `Processors` (Z80, R800)
- `Bios` (Bios ROM, DOS ROM, SUBROM, ...)
- `System`
- `Audio`
- `Video`
- `Programming` (ASM, BASIC, ...)
- `MSX-DOS`
- `MSX-UNAPI`

And two books:

- `MSX2 Technical Handbook`
- `The MSX Red Book`

### Resources from:

- [Grauw MSX Assembly Page](https://map.grauw.nl/)
- [Z80 Heaven Wiki](http://z80-heaven.wikidot.com/)
- [The MSX Red Book](https://github.com/gseidler/The-MSX-Red-Book)
- [MSX2 Technical Handbook](https://github.com/Konamiman/MSX2-Technical-Handbook)
- [Konamiman MSX-UNAPI-specification](https://github.com/Konamiman/MSX-UNAPI-specification)
- [BiFi MSX Net](http://bifi.msxnet.org/msxnet/)
- [MSX Wiki](https://www.msx.org/wiki/Main_Page)
- [MSX Banzai!](http://msxbanzai.tni.nl/)

Thanks to the authors of these resources, who have made them available under various licenses. This MCP server includes some of these resources to enhance the development experience.

The rights to these resources belong to their respective authors and are distributed under the licenses they have defined.

## 🚀 Quick Start

You can use this MCP server in this basic way with the [precompiled NPM package](https://www.npmjs.com/package/@nataliapc/mcp-openmsx). You may need to have `nodejs` installed for this to work.

### 🟢 Basic Usage with VSCode

* Install [Github Copilot extension](https://code.visualstudio.com/docs/copilot/overview)
* Add to your workspace a file `.vscode/mcp.json` with:

### STDIO mode (recommended)

```json
{
  "servers": {
    "mcp-openmsx": {
      "command": "npx",
      "args": ["@nataliapc/mcp-openmsx"],
      "env": {
        "OPENMSX_SHARE_DIR": "/usr/share/openmsx"
      }
    }
  }
}
```

**Note:** Environment variables are optional. Customize them as you need.

### Streamed HTTP mode (more advanced)

```json
{
  "servers": {
    "mcp-openmsx": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": { }
    }
  }
}
```

**Note:** The MCP HTTP Server must be running standalone in the same computer or in another (`make run_http`).

### 🟢 Basic Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-openmsx": {
      "command": "npx",
      "args": ["@nataliapc/mcp-openmsx"],
      "env": {
        "OPENMSX_SHARE_DIR": "/usr/share/openmsx"
      }
    }
  }
}
```

### 🟢 Environment Variables

| Variable | Description | Default Value | Example |
|----------|-------------|---------------|---------|
| `OPENMSX_EXECUTABLE` | Path or command to the openMSX executable | `openmsx` | `/usr/local/bin/openmsx` |
| `OPENMSX_SHARE_DIR` | Directory containing openMSX data files (machines, extensions, etc.) | System dependent | `/home/myuser/.openmsx/share` |
| `OPENMSX_SCREENSHOT_DIR` | Directory where screenshots will be saved | Default for openmsx | `/myproject/screenshots` |
| `OPENMSX_SCREENDUMP_DIR` | Directory where screen dumps will be saved | Default for openmsx | `/myproject/screendumps` |
| `OPENMSX_REPLAYS_DIR` | Directory where replay files will be saved | Default for openmsx | `/myproject/replays` |
| `MCP_TRANSPORT` | Transport mode (`stdio` or `http`) | `stdio` | `http` |
| `MCP_HTTP_PORT` | Port number for HTTP transport mode | `3000` | `8080` |


## 🧑‍💻 Advanced Manual Usage

Currently, the MCP server requires Linux to be compiled. It has not been tested on Windows or macOS, although it will likely work on the latter as well.

### Manual installation

```bash
npm install -g @nataliapc/mcp-openmsx
```

### Manual set of Environment Variables

Set optional environment variables to customize the server:

```bash
export OPENMSX_EXECUTABLE="openmsx"
export OPENMSX_SHARE_DIR="/usr/share/openmsx"
export OPENMSX_SCREENSHOT_DIR="/my_project/screenshots"
export OPENMSX_SCREENDUMP_DIR="/my_project/screendumps"
export OPENMSX_REPLAYS_DIR="/my_project/replays"
export MCP_HTTP_PORT=3000
```

### As MCP Server (stdio)

```bash
mcp-openmsx
```

### As HTTP Server

```bash
MCP_TRANSPORT=http mcp-openmsx
# or
mcp-openmsx http
```


## 💡 Development

### Prerequisites

- Node.js >= 18.0.0
- TypeScript
- openMSX emulator installed

### Building

```bash
git clone https://github.com/nataliapc/mcp-openmsx.git
cd mcp-openmsx/mcp-server
npm install
npm run build
```

### Running in Development

```bash
npm run dev
```


## 🪪 License

GPL2 License - see [LICENSE](LICENSE) file for details.


## 🆘 Support

If you need help, or have questions or suggestions, please open an issue on the [GitHub Issues](https://github.com/nataliapc/mcp-openmsx/issues) page or check the project discussions.


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
