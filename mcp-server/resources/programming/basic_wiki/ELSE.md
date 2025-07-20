# ELSE

## Effect

This instruction is officially part of `IF...THEN...ELSE` or `IF...GOTO...ELSE` but can be used as a standalone instruction as well.

When used alone the rest of the line is skipped. When compared to `REM` this has the benefit that the BASIC instructions will keep stored in compressed form taking less memory and ie. `RENUM` will still handle the line numbers correctly.

## Syntax

`ELSE <BASICinstruction>:<BASICinstruction>...`

## Parameter

`<BASICinstruction>` can be any MSX-BASIC instruction.

## Example

```basic
4 REM CLS:GOTO 7
5 ELSE CLS:GOTO 7
6 END
7 PRINT "We don't execute this line"

renum
Ok

list
10 REM CLS:GOTO 7
20 ELSE CLS:GOTO 40
30 END
40 PRINT "We don't execute this line"
```

## Related to

`IF...GOTO...ELSE`, `IF...THEN...ELSE`, `REM`, `RENUM`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ELSE"
