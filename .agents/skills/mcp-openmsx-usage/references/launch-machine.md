# Use Case: Launch and Configure an MSX Machine

## Goal

Start an openMSX emulator with a specific MSX machine model and optional hardware extensions, then verify it is ready for interaction.

## Index

- [Step-by-Step](#step-by-step)
    1. [Discover available machines and extensions](#1-discover-available-machines-and-extensions)
    2. [Launch the emulator](#2-launch-the-emulator)
    3. [Wait for boot](#3-wait-for-boot)
    4. [Verify machine status](#4-verify-machine-status)
    5. [Inspect slot configuration](#5-inspect-slot-configuration)
- [Speed Control](#speed-control)
- [Power and Reset](#power-and-reset)
- [Closing](#closing)
- [Common Machine Choices](#common-machine-choices)
- [Common Extensions](#common-extensions)

## Step-by-Step

### 1. Discover available machines and extensions

```
emu_control { command: "machineList" }
emu_control { command: "extensionList" }
```

Returns lists of all installed machine definitions (e.g. `Toshiba_HX-10`, `Panasonic_FS-A1GT`, `C-BIOS_MSX2+`) and extensions (e.g. `fmpac`, `ide`, `Sunrise_IDE`).

### 2. Launch the emulator

```
emu_control { command: "launch", machine: "C-BIOS_MSX2+", extensions: ["fmpac"] }
```

- If `machine` is omitted, an elicitation form presents 6 default machines.
- If the machine name is ambiguous, sampling finds best matches and presents an elicitation form.
- On launch, the server automatically: spawns openMSX, sets `save_settings_on_exit off`, enables renderer `SDLGL-PP`, powers on, starts reverse replay mode.
- Only **one** emulator instance can run at a time.

### 3. Wait for boot

```
emu_control { command: "wait", seconds: 3 }
```

Thew waiting time depends on the machine and extensions, usually:
- MSX1: 5 seconds
- MSX2: 10 seconds
- MSX2+: 12 seconds
- turboR: 15 seconds

If a machine or extension has a MSX-DOS ROM, it may require additional interactions: press `ENTER` to bypass the `Enter date` question, then wait for BASIC or MSX-DOS prompt.

**Critical**: The MSX needs time to complete its BIOS boot sequence. Without waiting, subsequent commands may fail or interact with an incomplete boot state.

### 4. Verify machine status

```
emu_info { command: "getStatus" }
```

Returns machine info: type (MSX1/MSX2/MSX2+/turboR), manufacturer, year, region, and connected devices. Use this to confirm the correct machine and extensions are active before proceeding with interactions or programming.

### 5. Inspect slot configuration

```
emu_info { command: "getSlotsMap" }
```

Shows what ROM/RAM/cartridge is mapped to each memory slot (0–3, with subslots).

### 6. Verify BASIC availability (if needed)

```
basic_programming { command: "isBasicAvailable" }
```

## Speed Control

Adjust emulator speed for automation tasks:

```
emu_control { command: "setEmulatorSpeed", emuspeed: 10000 }   # 100x normal speed
# ... perform automated operations ...
emu_control { command: "setEmulatorSpeed", emuspeed: 100 }     # restore normal speed
```

## Power and Reset

```
emu_control { command: "reset" }      # soft reset (keeps loaded media)
emu_control { command: "powerOff" }   # power off
emu_control { command: "powerOn" }    # power on
```

## Closing

Use this only if needed by your workflow. Otherwise, keep the emulator running for faster interactions and to preserve state between commands for user convenience.

```
emu_control { command: "close" }
```

After closing, all operations will fail with "No emulator process running."

## Common Machine Choices

| Machine | Type | Notes |
|---------|------|-------|
| `C-BIOS_MSX1` | MSX1 | Free BIOS, no BASIC |
| `C-BIOS_MSX2` | MSX2 | Free BIOS, no BASIC |
| `C-BIOS_MSX2+` | MSX2+ | Free BIOS, no BASIC |
| `msx` | MSX1 | Default japanese MSX1 machine |
| `msx_eu` | MSX1 | Default european MSX1 machine |
| `msx2` | MSX2 | Default japanese MSX2 machine |
| `msx2_eu` | MSX2 | Default european MSX2 machine |
| `msx2plus` | MSX2+ | Default japanese MSX2+ machine |
| `turbor` | turboR | Default japanese turboR machine |
| `Toshiba_HX-10` | MSX1 | Full BASIC, simple |
| `Philips_NMS_8250` | MSX2 | Full BASIC, European |
| `Panasonic_FS-A1GT` | turboR | Full features, Japanese |

**Note**: C-BIOS machines do not include MSX BASIC — use a branded machine (Philips, Toshiba, Panasonic, etc.) if BASIC programming is needed.

## Common Extensions

| Extension | Purpose |
|-----------|---------|
| `fmpac` | FM-PAC sound cartridge (OPLL) |
| `ide` | IDE hard disk interface |
| `Sunrise_IDE` | Sunrise ATA-IDE interface |
| `scc` | SCC sound cartridge |
| `moonsound` | MoonSound (OPL4) |
