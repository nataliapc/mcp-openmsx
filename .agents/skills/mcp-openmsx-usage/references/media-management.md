# Use Case: Working with Media (ROM, Disk, Tape)

## Goal

Insert, manage, and eject ROM cartridges, floppy disks, and cassette tapes in the emulated MSX.

## Index

- [ROM Cartridges](#rom-cartridges)
    - [Insert a ROM](#insert-a-rom)
    - [Eject a ROM](#eject-a-rom)
    - [ROM Workflow: Test a compiled ROM](#rom-workflow-test-a-compiled-rom)
- [Floppy Disks](#floppy-disks)
    - [Insert a disk image](#insert-a-disk-image)
    - [Use a host folder as floppy](#use-a-host-folder-as-floppy)
    - [Eject a disk](#eject-a-disk)
    - [Disk Workflow: MSX-DOS Development](#disk-workflow-msx-dos-development)
- [Cassette Tapes](#cassette-tapes)
    - [Insert a tape](#insert-a-tape)
    - [Rewind a tape](#rewind-a-tape)
    - [Eject a tape](#eject-a-tape)
    - [Tape Workflow: Load a BASIC Program from Tape](#tape-workflow-load-a-basic-program-from-tape)
- [Quick Reference](#quick-reference)
- [Tips](#tips)

## ROM Cartridges

### Insert a ROM

```
emu_media { command: "romInsert", romfile: "/path/to/game.rom" }
emu_control { command: "reset" }
emu_control { command: "wait", seconds: 3 }
```

The ROM is inserted into cartridge slot A. Reset is needed for the MSX to detect and boot the ROM.

### Eject a ROM

```
emu_media { command: "romEject" }
```

### ROM Workflow: Test a compiled ROM

1. Compile your program -> output `program.rom`
2. `emu_media { command: "romInsert", romfile: "/path/to/program.rom" }`
3. `emu_control { command: "reset" }`
4. `emu_control { command: "wait", seconds: 3 }`
5. `screen_shot { command: "as_image" }` — verify it boots correctly
6. [Debug as needed](references/debug-asm.md) with `debug_run`, `debug_cpu`, `debug_memory`

## Floppy Disks

### Insert a disk image

```
emu_media { command: "diskInsert", diskfile: "/path/to/disk.dsk" }
```

Supported format: `.dsk` (raw sector images). Inserted into drive A.

### Use a host folder as floppy

```
emu_media { command: "diskInsertFolder", diskfolder: "/path/to/project/output" }
```

Maps a host directory directly as the disk root. Very useful during development — changes to files on the host are immediately visible in the emulator.

### Eject a disk

```
emu_media { command: "diskEject" }
```

### Disk Workflow: MSX-DOS Development

1. Launch MSX2 machine with disk support (e.g. `Philips_NMS_8250`)
2. `emu_media { command: "diskInsertFolder", diskfolder: "/path/to/build" }`
3. `emu_control { command: "reset" }` — only needed for autorun programs, not needed for subsequent disk changes
4. `emu_control { command: "wait", seconds: 5 }` — MSX-DOS takes longer to boot
5. `emu_keyboard { command: "sendText", text: "dir\r" }` — verify files are visible
6. `emu_keyboard { command: "sendText", text: "myapp.com\r" }` — run the program

## Cassette Tapes

### Insert a tape

```
emu_media { command: "tapeInsert", tapefile: "/path/to/program.cas" }
```

Supported formats: `.cas` (CAS image), `.wav` (audio), `.tsx` (TZX-like).

### Rewind a tape

```
emu_media { command: "tapeRewind" }
```

Always rewind before loading to ensure the tape is at the beginning.

### Eject a tape

```
emu_media { command: "tapeEject" }
```

### Tape Workflow: Load a BASIC Program from Tape

1. `emu_media { command: "tapeInsert", tapefile: "/path/to/program.cas" }`
2. `emu_media { command: "tapeRewind" }`
3. `emu_control { command: "setEmulatorSpeed", emuspeed: 10000 }` — speed up loading
4. `emu_keyboard { command: "sendText", text: "CLOAD\r" }` — load BASIC program from tape
5. `emu_control { command: "wait", seconds: 5 }` — wait for load
6. `screen_shot { command: "as_image" }` — check the screen for load success
6. `emu_control { command: "setEmulatorSpeed", emuspeed: 100 }` — restore speed
7. `emu_keyboard { command: "sendText", text: "RUN\r" }` — run the program

Alternative load commands:
- `RUN"CAS:"\r` — load and run directly (for BASIC programs)
- `BLOAD"CAS:",R\r` — load binary and run directly (for machine code programs)

## Quick Reference

| Operation | Command | Key Parameter |
|-----------|---------|---------------|
| Insert ROM | `romInsert` | `romfile` (path, `.rom`) |
| Eject ROM | `romEject` | — |
| Insert disk | `diskInsert` | `diskfile` (path, `.dsk`) |
| Insert folder as disk | `diskInsertFolder` | `diskfolder` (path) |
| Eject disk | `diskEject` | — |
| Insert tape | `tapeInsert` | `tapefile` (path, `.cas`/`.wav`/`.tsx`) |
| Rewind tape | `tapeRewind` | — |
| Eject tape | `tapeEject` | — |

## Tips

- **Development cycle**: Use `diskInsertFolder` to map your build output directory — no need to create `.dsk` images during development.
- **Speed up tape loading**: Set emulator speed to 10,000% during tape operations, then restore to 100% when done.
- **ROM testing**: After inserting a new ROM, always reset the machine for it to boot properly.
- **Only slot A**: All media operations use the primary slot (cartridge A, drive A). There is no support for slot B through these tools.
