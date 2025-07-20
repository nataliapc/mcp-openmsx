# ON...GOTO

## Effect

Jumps to a specified line number that varies according the value of a variable, used as condition, and executes the instructions from there.

## Syntax

`ON <ConditionExpression> GOTO <LineNumber>,<LineNumber>,...`

_Note: Parameters can not end with a comma alone._

## Parameters

`<ConditionExpression>` is an expression that can result to value between 0-255.

`<LineNumber>` is a program line number. Each number needs to be separated by a comma. If `<ConditionExpression>` equals 1 the program execution will go to the first specified line number, if it equals 2 the execution will go to the 2nd specified line number, and so on up to 255. The number of next line is taken by default.

## Example

```basic
10 CLS
20 LOCATE 1,1
30 ON STICK(0) GOTO 50,,80,,60,,70
40 PRINT "     ":GOTO 20
50 PRINT "UP   ":GOTO 20
60 PRINT "DOWN ":GOTO 20
70 PRINT "LEFT ":GOTO 20
80 PRINT "RIGHT":GOTO 20
```

## Related to

`GOTO`, `IF...GOTO...ELSE`, `IF...THEN...ELSE`, `ON...GOSUB`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ON...GOTO"
