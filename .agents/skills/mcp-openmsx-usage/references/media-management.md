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

### Apply an IPS patch on insert

`romInsert` and `diskInsert` accept an optional `ips` parameter (absolute path to a `.ips` file). openMSX applies the patch to the image in memory at insert time; the file on disk is never modified. The patch needs no special handling beyond the normal single `reset` after inserting media — a reboot is only required when adding/changing the `ips` of media the machine has already booted with.

**DSK + already-loaded programs**: the patch applies to the disk image in the drive, not to a program the machine already loaded into RAM. After re-inserting a patched disk on a booted machine, rerun the program from disk to reload it and pick up the patched content with **no reset**. When the program cannot be reloaded from disk (if auto-running from boot), a `reset` is likely the only option to run the patched content.

```
emu_media { command: "diskInsert", diskfile: "/path/to/disk.dsk", ips: "/path/to/disk.patch.ips" }
emu_media { command: "romInsert", romfile: "/path/to/game.rom", ips: "/path/to/game.patch.ips" }
```

e2e fixtures live in `mcp-server/tests/fixtures/` (`sample.dsk`/`sample.patch.ips`, `sample16k.rom`/`sample16k.patch.ips`); patched strings appear on screen after reset (verified on `National_CF-3300`). See [patch-rom-assembly.md](references/patch-rom-assembly.md) for generating IPS patches from assembled code.

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
| Insert ROM | `romInsert` | `romfile` (path, `.rom`), optional `ips` (path, `.ips`) |
| Eject ROM | `romEject` | — |
| Insert disk | `diskInsert` | `diskfile` (path, `.dsk`), optional `ips` (path, `.ips`) |
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
