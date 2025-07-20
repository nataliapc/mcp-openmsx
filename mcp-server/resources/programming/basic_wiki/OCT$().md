# OCT$()

## Effect

Returns a string with the octal representation of a value.

## Syntax

`OCT$(<Value>)`

## Parameter

`<Value>` must be an expression, a numeric variable or a value between -32768 and 65535. A single or double precision value can be used but digits after the decimal point will be ignored.

## Example

```basic
10 PRINT "The octal representation of 8 is ";OCT$(8)
20 PRINT "The octal representation of 127 is ";OCT$(127)
 
RUN
The octal representation of 8 is 10
The octal representation of 127 is 177
```

## Related to

`BIN$`, `HEX$`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/OCT$()"
