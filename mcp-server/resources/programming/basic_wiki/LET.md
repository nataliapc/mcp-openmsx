# LET

## Effect

Assigns a value to a specified variable. 

_Note: Only the first two letters are taken into account as variable name, but different variable types and tables are considered different even if they have same name (please see the examples)._

## Syntax

`LET <Variable> = <Value>`

The `LET` instruction itself is optional and can be skipped except if you use the _Exprif BASIC_ extension.

## Parameters

`<Variable>` is a numeric  or alphanumeric variable.

`<Value>` is a numeric value or a character string (between quotation mark). It can be also an expression.

## Examples

```basic
10 LET A=10
20 LET B$="Hello"
30 C=20
40 D$="World!"
50 CLS
60 PRINT A;C
70 PRINT
80 PRINT B$;" "; D$

RUN
 10 20

Hello World!
Ok
```

```basic
10 SIZE=1:SIDE=2:SI=6
20 PRINT SIZE

RUN
 6
Ok
```

```basic
10 XY$="Values:":XY#=1:XY!=2:XY%=3:XY#(0)=4:XY!(0)=5:XY%(0)=6
20 PRINT XY$;XY#;XY!;XY%;XY#(0);XY!(0);XY%(0)

RUN
Values: 1 2 3 4 5 6
Ok
```

## Related to

`DEFDBL`, `DEFINT`, `DEFSNG`, `DEFSTR`, `DIM`, `SWAP`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LET"
