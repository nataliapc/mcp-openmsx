# BIN$()

## Effect

Returns a string with the binary representation of a value.

## Syntax

`BIN$(<Value>)`

## Parameter

`<Value>` must be an expression, a numeric variable or a value between -32768 and 65535. A single or double precision value can be used but digits after the decimal point will be ignored.

## Example

```basic
10 PRINT "The binary representation of 8 is ";BIN$(8)
20 PRINT "The binary representation of 127 is ";BIN$(127)

RUN
The binary representation of 8 is 1000
The binary representation of 127 is 11011
```

## Related to

`HEX$`, `OCT$`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/BIN$()"
