# CINT()

## Effect

Converts a value to an integer number by truncating the numbers after the decimal point.

## Syntax

`CINT(<Value>)`

## Parameter

`<Value>` must be an expression, a numeric variable or a value between -32768 and 32767. Digits after the decimal point will be simply ignored.

## Example

```basic
10 PRINT "1.23 converted to integer is ";CINT(1.23)
20 PRINT "1.99 converted to integer is ";CINT(1.99)
 
RUN
1.23 converted to integer is 1
1.99 converted to integer is 1
```

## Related to

`CDBL`, `CSNG`, `FIX`, `INT`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CINT()"
