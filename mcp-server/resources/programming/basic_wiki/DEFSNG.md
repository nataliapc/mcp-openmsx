# DEFSNG

## Effect

Defines a variable or a range of variables as single precision.

As an alternative, a single variable can be declared as single precision by appending the `!` sign to its name.

## Syntax

`DEFSNG <StartVariable>-<EndVariable>,<StartVariable>-<EndVariable>...`

_Note: Parameters can not end with a comma or hyphen alone._

## Parameters

`<StartVariable>` and `<EndVariable>` are letters put in alphabetic order. If `<EndVariable>` is not specified, all the variables beginning with the specified letter will be defined as single precision.

## Example

```basic
10 DEFSNG A-Z
20 A=7/6
30 PRINT "7 divided by 6 (in single precision) is ";A
 
RUN
7 divided by 6 (in single precision) is 1.16667
```

## Related to

`DEFDBL`, `DEFINT`, `DEFSTR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DEFSNG"
