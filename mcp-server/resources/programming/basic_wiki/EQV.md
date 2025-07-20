# EQV

## Effect

Performs a bitwise `EQV`-operation (logical equivalence) between two expressions.

The bit is set if both bits are equal. For each bit, the results are:
```
0 EQV 0  =  1 
0 EQV 1  =  0 
1 EQV 0  =  0 
1 EQV 1  =  1 
```

## Syntax

`<Value> EQV <Value>`

## Parameter

`<Value>` is a value between -32768 and 32767. It can also be a numeric variable or an mathematical expression.

_Notes:_
- If you use binary expressions, it is best to put the first expression in parenthesis to avoid the bug in interpreter that causes a syntax error. This problem does not happen with decimal, hexadecimal or octal expressions.
- When the expression is performed in a condition (`IF...THEN...ELSE` or `IF...GOTO...ELSE`), if the result of the whole expression is zero the value is taken as false, otherwise it's taken as true.

## Examples

```basic
PRINT 15 EQV 11
-5
```
Binary explanation:
```
0000000000001111 
0000000000001011  EQV
----------------
1111111111111011
```
-5 is actually the number 65531

---
```basic
PRINT 5 EQV 13
-9
```
Binary explanation:
```
0000000000000101 
0000000000001101  EQV
----------------
1111111111110111
```
-9 is actually the number 65527

---
```basic
PRINT &B00001111 EQV &B11110001
Syntax error
ok
PRINT (&B00001111) EQV &B11110001
-255
```
-255 is actually the number 65281

## Related to

`AND`, `IMP`, `MOD`, `NOT`, `OR`, `XOR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/EQV"
