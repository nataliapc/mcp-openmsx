# TRON

## Effect

Debug instruction to start/enable tracing of MSX-BASIC program execution. Once executed the line number will be printed to screen each time execution moves to a new line.

## Syntax

`TRON`

## Example

```basic
10 FOR I=1 TO 3
20 PRINT I
30 NEXT
40 END
TRON
Ok

RUN
[10][20] 1
[30][20] 2
[30][20] 3
[30][40]
Ok
```

## Related to

`TROFF`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/TRON"
