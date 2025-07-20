# HEX$()

## Effect

Returns a string with the hexadecimal representation of a value.

## Syntax

`HEX$(<Value>)`

## Parameter

`<Value>` must be an expression, a numeric variable or a value between -32768 and 65535. A single or double precision value can be used but digits after the decimal point will be ignored.

## Example

```basic
10 PRINT "The hexadecimal representation of 8 is ";HEX$(8)
20 PRINT "The hexadecimal representation of 127 is ";HEX$(127)
 
RUN
The hexadecimal representation of 8 is 8
The hexadecimal representation of 127 is 7F
```

## Related to

`BIN$`, `OCT$`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/HEX$()"
