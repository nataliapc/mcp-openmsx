# INT()

## Effect

Returns the largest integer equal to or smaller than a variable.

## Syntax

`INT (<Expression>)`

## Parameter

`<Expression>` can be a value, a numeric variable or an mathematical expression.

## Example

```basic
10 PRINT "INT(1.23) results in ";INT(1.23)
20 PRINT "INT(-1.99) results in ";INT(-1.99)
30 PRINT "INT(-1.01) results in ";INT(-1.01)
 
RUN
INT(1.23) results in 1
INT(-1.99) results in -2
INT(-1.01) results in -2
```

## Difference between FIX, INT and CINT 

When the variable is negative, `INT` gives the next lower number, whereas `FIX` merely truncates the numbers after the decimal point. `FIX(x)` is equivalent to `INT(ABS(x))*SGN(x)`.

`CINT` is similar to `FIX`, but the integer part is limited between -32768 and 32767.

## Related to

`ABS()`, `CINT()`, `FIX()`, `SGN()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/INT()"
