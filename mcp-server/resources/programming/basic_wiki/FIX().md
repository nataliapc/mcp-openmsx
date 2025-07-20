# FIX()

## Effect

Returns the integer part of a variable by truncating the numbers after the decimal point. 

## Syntax

`FIX (<Expression>)`

## Parameter

`<Expression>` can be a value, a numeric variable or an mathematical expression.

## Example

```basic
10 PRINT "FIX(1.23) results in ";FIX(1.23)
20 PRINT "FIX(-1.99) results in ";FIX(-1.99)
30 PRINT "FIX(-1.01) results in ";FIX(-1.01)
 
RUN
FIX(1.23) results in 1
FIX(-1.99) results in -1
FIX(-1.01) results in -1
```

## Difference between FIX, INT and CINT

When the variable is negative, `INT` gives the next lower number, whereas `FIX` merely truncates the numbers after the decimal point. `FIX(x)` is equivalent to `INT(ABS(x))*SGN(x)`.

`CINT` is similar to `FIX`, but the integer part is limited between -32768 and 32767.

## Related to

`ABS()`, `CINT()`, `INT()`, `SGN()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/FIX()"
