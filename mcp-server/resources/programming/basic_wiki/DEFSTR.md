# DEFSTR

## Effect

Defines a variable or a range of variables as string.

As an alternative, a single variable can be declared as a string by appending the `$` sign to its name.

## Syntax

`DEFSTR <StartVariable>-<EndVariable>,<StartVariable>-<EndVariable>...`

_Note: Parameters can not end with a comma or hyphen alone._

## Parameters

`<StartVariable>` and `<EndVariable>` are letters put in alphabetic order. If `<EndVariable>` is not specified, all the variables beginning with the specified letter will be defined as string.

## Example

```basic
10 DEFSTR A-Z
20 A="Yay!"
30 PRINT "Variable A contains the text ";A
 
RUN
Variable A contains the text Yay!
```

## Related to

`DEFDBL`, `DEFINT`, `DEFSNG`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DEFSTR"
