# OR - MSX Wiki


## Effect

Performs a bitwise `OR`-operation (logical inclusive or) between two expressions.

The bit is set if either one of the bits is set. For each bit, the results are:
```
0 OR 0  =  0 
0 OR 1  =  1 
1 OR 0  =  1 
1 OR 1  =  1
```

## Syntax

`<Value> OR <Value>`

## Parameter

`<Value>` is a value between -32768 and 32767. It can also be a numeric variable, a mathematical expression or expression from a condition.

_Notes:_
- If you use binary expressions, it is best to put the first expression in parenthesis to avoid the bug in interpreter that causes a syntax error. This problem does not happen with decimal, hexadecimal or octal expressions.
- When the expression is performed in a condition (`IF...THEN...ELSE` or `IF...GOTO...ELSE`), if the result of the whole expression is zero the value is taken as false, otherwise it's taken as true.

## Examples

```basic
PRINT 15 OR 11
15
```
Binary explanation:
```
1111 
1011  OR
----
1111
```

---
```basic
PRINT 5 OR 13
5
```
Binary explanation:
```
0101 
1101  OR
----
1101
```
---
```basic
PRINT &B00001111 OR &B11110001
Syntax error
Ok
```
```basic
PRINT (&B00001111) OR &B11110001
255
```

## Related to

`AND`, `EQV`, `IMP`, `MOD`, `NOT`, `XOR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/OR"
