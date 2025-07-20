# ON...GOSUB

## Effect

Calls a subroutine located on the specified line number, that varies according the value of a variable, used as condition.

## Syntax

`ON <ConditionExpression> GOSUB <LineNumber>,<LineNumber>,...`

_Note: Parameters can not end with a comma alone._

## Parameters

`<ConditionExpression>` is an expression that can result to value between 0-255.

`<LineNumber>` is a program line number of a subroutine. Each number needs to be separated by a comma. If `<ConditionExpression>` equals 1 the program execution will go to the first specified line number, if it equals 2 the execution will go to the 2nd specified line number, and so on up to 255. If there is no matching line number no `GOSUB` will be made.

The subroutine must be terminated with the `RETURN` instruction.

## Example

```basic
10 CLS
20 LOCATE 0,0
30 ON STICK(0) GOSUB 60,50,90,50,70,50,80
40 GOSUB 50:GOTO 20
50 PRINT "     ":RETURN
60 PRINT "UP   ":RETURN
70 PRINT "DOWN ":RETURN
80 PRINT "LEFT ":RETURN
90 PRINT "RIGHT":RETURN
```

## Related to

`GOSUB`, `IF...GOTO...ELSE`, `IF...THEN...ELSE`, `ON...GOTO`, `RETURN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ON...GOSUB"
