# IMP

## Effect

Performs a bitwise `IMP`-operation (logical implication) between two expressions.

The logical implication can be read as the condition _"if p is true, q is also true"_. On the other hand, if p is false, the  condtion still holds and thus the value of `p IMP q` is true.

The truth table of p IMP q is:
```
0 IMP 0  =  1 
0 IMP 1  =  1 
1 IMP 0  =  0 
1 IMP 1  =  1
```

This operation is equivalent to: `((NOT first_operand) OR second_operand)`

## Syntax

`<Value> IMP <Value>`

## Parameter

`<Value>` is a value between -32768 and 32767. It can also be a numeric variable, an mathematical expression or expression from a condition.

_Notes:_
- If you use binary expressions, it is best to put the first expression in parenthesis to avoid the bug in interpreter that causes a syntax error. This problem does not happen with decimal, hexadecimal or octal expressions.
- When the expression is performed in a condition (`IF...THEN...ELSE` or `IF...GOTO...ELSE`), if the result of the whole expression is zero the value is taken as false, otherwise it's taken as true.

## Examples

```basic
10 ' Continue only after user has (pressed and) released SPACE-key:
20 S=LE:LE=STRIG(0):IF SIMPLE GOTO 20
```

```basic
PRINT 15 IMP 11
-5
```
Binary explanation:
```
0000000000001111 
0000000000001011  IMP
----------------
1111111111111011
```
-5 is actually the number 65531

```basic
PRINT 5 IMP 13
-1
```
Binary explanation:
```
0000000000000101 
0000000000001101  IMP
----------------
1111111111111111
```
-1 is actually the number 65535

```basic
PRINT &B00001111 IMP &B11110001
Syntax error
Ok
PRINT (&B00001111) IMP &B11110001
-15
```
-15 is actually the number 65521

## Related to

`AND`, `EQV`, `MOD`, `NOT`, `OR`, `XOR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/IMP"
