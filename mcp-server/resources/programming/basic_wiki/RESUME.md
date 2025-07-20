# RESUME

## Effect

Jumps to a specified line after execution of the error handling routine specified by `ON ERROR GOTO`.

## Syntaxes

`RESUME <LineNumber>`

`RESUME NEXT`

## Parameter

`<LineNumber>` is a the number of line on which the program will resume when the execution of the error handling routine is finished.

If you don't specify the line or use `RESUME 0`, the program will be continued on the location where the error was detected.

If you want that the program is resumed on the instruction immediately following the error location, then use `RESUME NEXT` instead of specifying a line.

## Example

```basic
10 ON ERROR GOTO 400
20 INPUT "X= ";A
30 IF A>100 THEN ERROR 210
40  IF A<10 THEN ERROR 211
50 END
400 IF ERR=210 THEN PRINT "MAXIMUM 100!"
410 IF ERR=211 THEN PRINT "MINIMUM 10!"
420 RESUME 20
430 ON ERROR GOTO 0
```

## Related to

`ERL`, `ERR`, `ERROR`, `ON ERROR GOTO`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/RESUME"
