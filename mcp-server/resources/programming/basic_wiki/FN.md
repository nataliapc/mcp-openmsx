# FN

## Effect

Performs the functions defined by `DEF FN`. It is used as expression.

## Syntax

`FN <FunctionName> (<Value>,<Value>...)`

## Parameters

`<FunctionName>` is the function name,  the length of the function name can be as long as you want, only the first two characters of the function name will actually be used. 
Furthermore, if a function is to return a string, the name of the function has to be suffixed by a `$`.

`<Value>` is optional, it is a value that will be used in the `<Expression>` defined by `DEF FN`. Several values can be specified, they must be separated by a comma.

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
10 DEF FN PER(X,P)=X/(100/P)
20 INPUT"Value";X
30 INPUT"Percentage";P
40 PRINT P;"% of";X;"="; FN PER(X,P)
 
RUN
Value? 30
Percentage? 50
50% of 30 = 15
```
```basic
10 ' Limit mouse movement to screen using limit function
20 DEF FNL(N,MI,MA)=((N&lt;MI)AND(MI-N))+N+((N&gt;MA)AND(MA-N))
30 SCREEN 5
40 SPRITE$(0)=" P "
50 R=PAD(12) ' Read mouse from port 1
60 X=FNL(X+PAD(13),0,255) : Y=FNL(Y+PAD(14),0,211)
70 PUT SPRITE 0,(X-2,Y-2)
80 IF NOT STRIG(1) THEN 50
```

## Related to

`CLEAR`, `DEF FN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/FN"
