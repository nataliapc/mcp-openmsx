# RESTORE

## Effect

Sets the line number where the `READ` instruction can read next value.

## Syntax

`RESTORE [<LineNumber>]`

## Parameter

`<LineNumber>` is a line where next `DATA` instruction will be searched for. If line number is not set the next `READ` instruction will read fist value again.

## Example

```basic
10 GOSUB 60
20 PRINT"-----"
30 RESTORE 90
40 GOSUB 60
50 END
60 PRINT"Four MSX manufacturers:"
70 FOR I=1 TO 4:READ A$:PRINT A$:NEXT I:RETURN
80 DATA Philips, Pioneer
90 DATA Spectravideo, Casio, Goldstar, Panasonic
 
RUN
Four MSX manufacturers:
Philips
Pioneer
Spectravideo
Casio
-----
Four MSX manufacturers:
Spectravideo
Casio
Goldstar
Panasonic
```

## Related to

`DATA`, `READ`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/RESTORE"
