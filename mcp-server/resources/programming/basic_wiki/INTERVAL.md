# INTERVAL

## Effect

Changes the way BASIC timer interrupts are handled.

## Syntax

`INTERVAL ON|OFF|STOP`

## Parameters

This instruction is always combined with `ON INTERVAL GOSUB`.

With `INTERVAL ON`, the computer will check if a specified time interval has been elapsed and the subroutine specified with `ON INTERVAL GOSUB` is executed immediately.

With `INTERVAL OFF`, this checking is disabled.

With `INTERVAL STOP`, the checking is made, but the execution of the subroutine specified with `ON INTERVAL GOSUB` will happen only when an `INTERVAL ON` instruction is executed later in the program.

## Example

```basic
10 ON INTERVAL=60 GOSUB 50
20 INTERVAL ON
30 X=X+1:IF INKEY$="" THEN 30
40 END
50 PRINT X:RETURN
```

```basic
10 ON INTERVAL=300 GOSUB 60
20 INTERVAL ON
30 FOR I=1 TO 10000:NEXT I
40 INTERVAL OFF
50 END
60 K=K+6:PRINT K;"seconds"
70 RETURN
 
RUN
 6 seconds
 12 seconds
 18 seconds
 24 seconds
```

## Related to

`ON INTERVAL GOSUB`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/INTERVAL"
