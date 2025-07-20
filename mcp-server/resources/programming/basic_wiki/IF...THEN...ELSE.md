# IF...THEN...ELSE

## Effect

Checks if a condition has been met and executes the instruction(s) specified after `THEN`. Optionally, if the condition has not been met the instruction(s) after `ELSE` will be run.

_Note: If you use the Exprif BASIC extension, no need to use this instruction!_

## Syntaxes

`IF <ConditionExpression> THEN <LineNumber> ELSE <LineNumber>`

`IF <ConditionExpression> THEN <LineNumber> ELSE <BASICinstruction>:<BASICinstruction>:...`

`IF <ConditionExpression> THEN <BASICinstruction>:<BASICinstruction>:... ELSE <LineNumber>`

`IF <ConditionExpression> THEN <BASICinstruction>:<BASICinstruction>:... ELSE <BASICinstruction>:<BASICinstruction>:...`

## Parameters

`<ConditionExpression>` is an expression false (whose result is zero) or true (whose result is non-zero). For example, the expression `A>5` is equal to 0 if `A` is less than 6 otherwise the result is -1.

`<LineNumber>` is a line number of the program in memory.

`<BASICinstruction>` can be any MSX-BASIC instruction. When there are several BASIC instructions, they must be separated by the character colon.

`ELSE` can be omitted when it is not followed by one or more BASIC instructions or a program line number, that will be executed when the condition is false.

## Example

```basic
10 INPUT "What is your age";A
20 IF A < 18 THEN PRINT "You are way too young to be playing Starship Rendezvous":END ELSE PRINT "Good for you!"
 
RUN
What is you age?
Good for you!
```

## Related to

`IF...GOTO...ELSE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/IF...THEN...ELSE"
