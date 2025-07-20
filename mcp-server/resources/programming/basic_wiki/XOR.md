# XOR

## Effect

Performs a bitwise XOR-operation (logical exclusive or) between two expressions.

The bit is set if one bit is set and the other one isn't:
```
0 XOR 0  =  0 
0 XOR 1  =  1 
1 XOR 0  =  1 
1 XOR 1  =  0 
```

## Syntax

`<Value> XOR <Value>`

## Parameter

`<Value>` is a value between -32768 and 32767. It can also be a a numeric variable, a mathematical expression or expression from a condition.

_Notes:_
- If you use binary expressions, it is best to put the first expression in parenthesis to avoid the bug in interpreter that causes a syntax error. This problem does not happen with decimal, hexadecimal or octal expressions.
- When the expression performed in a condition (`IF...THEN...ELSE` or `IF...GOTO...ELSE`) if the result of the whole expression is zero the value is taken as false, otherwise it's taken as true.

## Examples

```basic
PRINT 15 XOR 11
4
```
Binary explanation:
```
1111 
1011  XOR
----
0100
```
---
```basic
PRINT 5 XOR 13
8
```
Binary explanation:
```
0101 
1101  XOR
----
1000
```
---
```basic
PRINT &B00001111 XOR &B11110001
15
Syntax error
Ok
PRINT (&B00001111) XOR &B11110001
254
```

## Related to

`AND`, `EQV`, `IMP`, `MOD`, `NOT`, `OR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/XOR"
