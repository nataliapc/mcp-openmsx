# SPACE$()

## Effect

Generates a string with a specified number of spaces.

This instruction is equivalent to `STRING$` used with the ASCII code 32.

## Syntax

`SPACE$(<Number>)`

## Parameter

`<Number>` is the number of spaces, it must be between 0 and 255.

## Example

```basic
10 PRINT "A";SPACE$(5);"B"
20 PRINT SPACE$(5);"AB"
 
RUN
A     B
     AB
```

## Related to

`SPC()`, `STRING$()`, `TAB()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SPACE$()"
