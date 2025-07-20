# ON INTERVAL GOSUB

## Effect

Calls a subroutine after the specified timeout has been elapsed.

## Syntax

`ON INTERVAL=<TimeoutNumber> GOSUB<LineNumber>`

## Parameters

`<TimeoutNumber>` is a number to specify the timeout, which is equal to number*1/60 (or number*1/50) seconds.

`<LineNumber>` is a program line number of your subroutine. The subroutine must be terminated with the `RETURN` instruction.

## Examples

```basic
10 ' Interrupt once every second on all MSX models
15 ON INTERVAL=60-10*(PEEK(&H2B)\128) GOSUB 50
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

`INTERVAL`, `RETURN`, `TIME`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ON_INTERVAL_GOSUB"
