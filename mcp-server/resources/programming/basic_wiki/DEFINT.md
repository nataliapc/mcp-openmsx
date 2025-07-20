# DEFINT

## Effect

Defines a variable or a range of variables as integer.

As an alternative, a single variable can be declared as integer by appending the `%` sign to its name.

## Syntax

`DEFINT <StartVariable>-<EndVariable>,<StartVariable>-<EndVariable>...`

_Note: Parameters can not end with a comma or hyphen alone._

## Parameters

`<StartVariable>` and `<EndVariable>` are letters put in alphabetic order. If `<EndVariable>` is not specified, all the variables beginning with the specified letter will be defined as integer.

## Example

```basic
10 DEFINT A-Z
20 A=7/6
30 PRINT "7 divided by 6 (in integer) is ";A
 
RUN
7 divided by 6 (in integer) is 1
```

## Related to

`DEFDBL`, `DEFSNG`, `DEFSTR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DEFINT"
