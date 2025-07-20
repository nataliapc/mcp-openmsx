# DEF FN

## Effect

Defines a function which returns user-specified output based on optional variables.

## Syntax

`DEF FN <FunctionName> (<Variable>,<Variable>...)=<Expression>`

## Parameters

`<FunctionName>` is the function name,  the length of the function name can be as long as you want, only the first two characters of the function name will actually be used. 
Furthermore, if a function is to return a string, the name of the function has to be suffixed by a `$`.

`<Variable>` is optional , it is a variable that will be used in the `<Expression>`. Several variables can be specified, they must be separated by a comma. It's only useful to define the function. The variables don't have any influence on the variables with the same name in the main program.

`<Expression>` is the function itself. It can use variables that are not specified in the `<Variable>` part, but have already a value in the main program.

## Examples

```basic
10 DEF FN SQUARE (X)=X^2
20 PRINT "The square of 2 is ";FN SQUARE(2)
30 PRINT "The square of 4 is ";FN SQUARE(4)
 
RUN
The square of 2 is  4
The square of 4 is  16
```
```basic
10 DEF FN F$(A$)=CHR$(ASC(A$) OR 32)
20 PRINT FN F$("A")
 
RUN
a
```

## Related to

`CLEAR`, `FN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DEF_FN"
