# CDBL()

## Effect

Converts a integer or single precision value to a double precision value. Double precision numbers have an accuracy of 14 digits. This function exists for compatibility reasons only and has no practical benefits in MSX environment.

## Syntax

`CDBL(<Value>)`

## Parameter

`<Value>` can be a value, a numeric variable or an mathematical expression.

## Example

```basic
10 PRINT "7 divided by 6 is ";CDBL(7/6)
20 PRINT "10 divided by 11 ";CDBL(10/11)
 
RUN
7 divided by 6 is 1.1666666666667
10 divided by 11 is .90909090909091
```

## Related to

`CINT`, `CSNG`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CDBL()"
