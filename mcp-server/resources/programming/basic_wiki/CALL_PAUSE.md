# CALL PAUSE

`CALL PAUSE` is a standard instruction for _MSX turbo R_, but it is also an extended instruction available in _ChakkariCopy Basic_, _DM-System2 Basic_ and _Hitachi Basic_.

# CALL PAUSE as standard MSX-BASIC instruction

## Effect

Stops execution of a BASIC program for the specified time.

## Syntax

`CALL PAUSE (<Time>)`

## Parameter

`<Time>` is waiting time exprimed in milliseconds. The value can be between 0 and 65535.

_Note: You can interrupt the execution during the waiting period by pressing `CTRL`+`STOP`._

## Example

```basic
CALL PAUSE(1000)
```

## Using

When `CALL PAUSE` is being executed, interrupt is enabled. Even when `CALL PAUSE` is being executed, you can quit the program by the `CTRL` + `STOP` keys.

This instruction is used when you want to take a timing without being affected by the CPU execution speed.

## Related to

`TIME`, `WAIT`

## Compatibility

MSX-BASIC 4.0 or higher

# CALL PAUSE in ChakkariCopy Basic

## Effect

Puts the cartridge into `PAUSE` mode.

_Note: the paused program can only be resumed by pressing the `PAUSE` button. It cannot be resumed by software._

## Syntax

`CALL PAUSE`

## Related to

`CALL SCHANGE`

## Using

In the `PAUSE` mode it's only possible to print a hardcopy by pressing the `COPY` button or to resume execution by pressing the `PAUSE` button. It's the same operation as pressing the `PAUSE` button on the cartridge.

## Compatibility

ChakkariCopy BASIC

# CALL PAUSE in DM-System2 Basic

## Effect

Stops execution  of a BASIC program for the specified time.

_Note: You can interrupt the execution during the waiting period by pressing `CTRL`+`STOP`._

## Syntax

`CALL PAUSE (<Time>)`

## Parameter

`<Time>` is waiting time exprimed in milliseconds. The value can be between 0 and 65535.

## Example

`CALL PAUSE(1000)`

## Using

When the `CALL PAUSE` is being executed, interrupt is enabled. Even when the `CALL PAUSE` is being executed, you can quit the program by the `CTRL` + `STOP` keys.

This instruction is used when you want to take a timing without being affected by the CPU execution speed. It's exactly the same instruction as the standard `CALL PAUSE` for _MSX Turbo R_, but can be used also on _MSX2_ and _MSX2+_.

## Related to

`CALL INTWAIT`, `CALL VDPWAIT`, `CALL WAIT`

## Compatibility

DM-System2 BASIC

# CALL PAUSE in Hitachi Basic

## Effect

Puts the built-in data reader of the _Hitachi MB-H2_ computer in pause mode.

## Syntax

`CALL PAUSE`

## Related to

`CALL FF`, `CALL PLAY`, `CALL REC`, `CALL REW`, `CALL STOP`

## Compatibility

Hitachi BASIC version 1

## Source

Retrieved from "https://www.msx.org/wiki/CALL_PAUSE"
