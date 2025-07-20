# IF...GOTO...ELSE

## Effect

Checks if a condition has been met and jumps to the number line specified after `GOTO`. Optionally, if the condition has not been met the instruction(s) after `ELSE` will be run.

_Note: If you use the Exprif BASIC extension, no need to use this instruction!_

## Syntaxes

`IF <ConditionExpression> GOTO <LineNumber> ELSE <LineNumber>`

`IF <ConditionExpression> GOTO <LineNumber> ELSE <BASICinstruction>:<BASICinstruction>:...`

## Parameters

`<ConditionExpression>` is an expression false (whose result is zero) or true (whose result is non-zero). For example, the expression A<>9 is equal to 0 if A is different from 9 otherwise the result is -1.

`<LineNumber>` is a line number of the program in memory.

`<BASICinstruction>` can be any MSX-BASIC instruction. When there are several BASIC instructions, they must be separated by the character colon.

`ELSE` can be omitted when it is not followed by one or more BASIC instructions or a program line number, that will be executed when the condition is false.

## Examples

```basic
10 A=1: IF A GOTO 30
20 PRINT "A=0":END
30 PRINT "A is different from 0":END
 
RUN
A is different from 0
```

```basic
10 CLS
20 PRINT "Hello!"
30 TIME = 0
40 IF INKEY$="" GOTO 40
50 IF TIME <4 GOTO 50
60 IF INKEY$="" GOTO 60 ELSE 20
```

## Related to

`IF...THEN...ELSE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/IF...GOTO...ELSE"
