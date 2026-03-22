# Use Case: Time-Travel Debugging with Replay and Savestates

## Goal

Use openMSX's replay timeline and savestate features to go back and forward in emulated time, enabling time-travel debugging and state checkpointing.

## Index

- [Replay (Timeline Navigation)](#replay-timeline-navigation)
    - [Check replay status](#check-replay-status)
    - [Go back in time](#go-back-in-time)
    - [Jump to absolute time](#jump-to-absolute-time)
    - [Frame-by-frame navigation](#frame-by-frame-navigation)
    - [Truncate future timeline](#truncate-future-timeline)
    - [Save/load replay files](#saveload-replay-files)
    - [Start/stop replay recording](#startstop-replay-recording)
- [Savestates (Instant Snapshots)](#savestates-instant-snapshots)
    - [Save a state](#save-a-state)
    - [Load a state](#load-a-state)
    - [List saved states](#list-saved-states)
- [Workflow: Time-Travel Debugging a Bug](#workflow-time-travel-debugging-a-bug)
- [Workflow: Safe Experimentation](#workflow-safe-experimentation)
- [Workflow: Comparing Two Execution Paths](#workflow-comparing-two-execution-paths)
- [Key Differences: Replay vs Savestates](#key-differences-replay-vs-savestates)
- [Key Difference: stepBack vs reverseFrame](#key-difference-stepBack-vs-reverseFrame)

## Replay (Timeline Navigation)

Replay mode records the entire emulation timeline, allowing navigation back and forward in time. It is **enabled by default** on emulator launch.

### Check replay status

```
emu_replay { command: "status" }
```

Returns: `enabled`, `beginTime`, `endTime`, `currentTime`, `snapshotCount`.

### Go back in time

```
debug_run { command: "break" }                         # CRITICAL: break first!
emu_replay { command: "goBack", seconds: 5 }           # go back 5 seconds
```

**Always break execution before time-traveling.** Failure to break can cause timeline inconsistencies.

### Jump to absolute time

```
debug_run { command: "break" }
emu_replay { command: "absoluteGoto", time: "120" }    # jump to second 120
```

### Frame-by-frame navigation

```
emu_replay { command: "advanceFrame", frames: 1 }      # advance 1 frame
emu_replay { command: "reverseFrame", frames: 1 }      # reverse 1 frame
```

One frame = ~20ms at 50fps (PAL) or ~16.7ms at 60fps (NTSC).

### Truncate future timeline

```
emu_replay { command: "truncate" }
```

Wipes all recorded data after the current position. Use before re-recording from a specific point.

### Save/load replay files

```
emu_replay { command: "saveReplay", filename: "debug_session.omr" }
emu_replay { command: "loadReplay", filename: "debug_session.omr" }
```

Files saved to `OPENMSX_REPLAYS_DIR` with `.omr` extension.

### Start/stop replay recording

```
emu_replay { command: "stop" }     # stop recording (not usually needed)
emu_replay { command: "start" }    # restart recording
```

## Savestates (Instant Snapshots)

Savestates capture the complete machine state at a single point in time.

### Save a state

```
emu_savestates { command: "save", name: "checkpoint_1" }
```

### Load a state

```
emu_savestates { command: "load", name: "checkpoint_1" }
```

Instantly restores the exact machine state — CPU registers, memory, VRAM, VDP, audio, media positions — everything.

### List saved states

```
emu_savestates { command: "list" }
```

## Workflow: Time-Travel Debugging a Bug

1. **Run program normally** until the bug manifests
2. **Break**: `debug_run { command: "break" }`
3. **Check timeline**: `emu_replay { command: "status" }`
4. **Go back**: `emu_replay { command: "goBack", seconds: 10 }`
5. **Set breakpoint** near suspected cause: `debug_breakpoints { command: "create", address: "0x4100" }`
6. **Continue**: `debug_run { command: "continue" }`
7. **Inspect at breakpoint**: `debug_cpu { command: "getCpuRegisters" }`, `debug_memory { command: "getBlock", ... }`
8. **Step through**: `debug_run { command: "stepOver" }` — watch for the moment the bug occurs
9. **Frame-by-frame** if needed: `emu_replay { command: "advanceFrame", frames: 1 }`
10. **Screenshot**: `screen_shot { command: "as_image" }` — verify visual state

## Workflow: Safe Experimentation

1. **Save checkpoint**: `emu_savestates { command: "save", name: "safe_point" }`
2. **Experiment** with memory writes, register changes, code patches
3. **If something breaks**: `emu_savestates { command: "load", name: "safe_point" }`
4. **Try a different approach** and repeat

## Workflow: Comparing Two Execution Paths

1. Run to a decision point
2. `emu_savestates { command: "save", name: "decision_point" }`
3. Take path A -> observe results -> `screen_shot { command: "as_image" }`
4. `emu_savestates { command: "load", name: "decision_point" }`
5. Take path B -> observe results -> `screen_shot { command: "as_image" }`
6. Compare screenshots

## Key Differences: Replay vs Savestates

| Feature | Replay | Savestates |
|---------|--------|------------|
| Granularity | Frame-by-frame timeline | Single point snapshot |
| Navigation | Forward/backward in time | Jump to saved point |
| Storage | Continuous recording | Named snapshots |
| Use case | Tracing sequence of events | Checkpointing |
| `stepBack` | Yes (1 CPU instruction) | No |
| `goBack` | Yes (N seconds) | No |

## Key Difference: stepBack vs reverseFrame

- **`debug_run.stepBack`**: Goes back exactly **one CPU instruction** — surgical precision for code tracing.
- **`emu_replay.reverseFrame`**: Goes back **one video frame** (~20ms) — many CPU instructions, useful for visual debugging.
