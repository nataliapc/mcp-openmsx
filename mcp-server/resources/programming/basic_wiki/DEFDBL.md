# DEFDBL

## Effect

Defines a variable or a range of variables as double precision.  

As an alternative, a single variable can be declared as double precision by appending the `#` sign to its name.

## Syntax

`DEFDBL <StartVariable>-<EndVariable>,<StartVariable>-<EndVariable>...`

_Note: Parameters can not end with a comma or hyphen alone._

## Parameters

`<StartVariable>` and `<EndVariable>` are letters put in alphabetic order. If `<EndVariable>` is not specified, all the variables beginning with the specified letter will be defined as double precision.

## Example

```basic
10 DEFDBL A-Z
20 A=7/6
30 PRINT "7 divided by 6 (in double precision) is ";A
 
RUN
7 divided by 6 (in double precision) is 1.1666666666667
```

## Related to

`DEFINT`, `DEFSNG`, `DEFSTR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DEFDBL"
