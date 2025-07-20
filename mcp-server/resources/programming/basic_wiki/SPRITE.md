# SPRITE

## Effect

Changes the way BASIC sprite collision interrupts are handled.

## Syntax

`SPRITE ON|OFF|STOP`

## Parameters

This instruction is always combined with `ON SPRITE GOSUB`.

With `SPRITE ON`, the computer will check if two sprites have collided during the last screen draw and if a collision is detected the subroutine specified with `ON SPRITE GOSUB` is executed immediately.

With `SPRITE OFF`, this checking is disabled.

With `SPRITE STOP`, the checks are done, but the execution of the subroutine specified with `ON SPRITE GOSUB` will be postponed until the `SPRITE ON` instruction is executed later in the program.

## Related to

`ON SPRITE GOSUB`, `PUT SPRITE`, `SPRITE$()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SPRITE"
