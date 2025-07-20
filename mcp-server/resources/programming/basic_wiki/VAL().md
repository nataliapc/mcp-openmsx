# VAL()

## Effect

Returns the numerical value of the contents of a string, omitting leading spaces, line feeds and tabs

## Syntax

`VAL(<String>)`

## Parameter

`<String>` is alphanumeric variable or a string that contents a numerical value coded in ASCII code.

## Example

```basic
10 X=VAL("  1.23")
20 X=X+1
30 PRINT X
 
RUN
2.23
```

## Related to

`STR$()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/VAL()"
