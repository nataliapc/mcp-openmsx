# SPC()

## Effect

Inserts a variable amount of spaces in a `PRINT` or `LPRINT` instruction.

## Syntax

`SPC(<Number>)`

## Parameter

`<Number>` is the number of spaces, it  must be between 0 and 255.

## Example

```basic
10 PRINT "MSX";SPC(3);"Forever!"
 
RUN
MSX   Forever!
```

## Related to

`LPRINT`, `PRINT`, `SPACE$()`, `STRING$()`, `TAB()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SPC()"
