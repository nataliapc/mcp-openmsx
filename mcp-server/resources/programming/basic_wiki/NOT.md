# NOT

## Effect

Performs a bitwise NOT-operation (logical complement) on an expression.

All bits are inverted. For each bit, the results are:
```
NOT 0  =  1 
NOT 1  =  0
```

## Syntax

`NOT <Value>`

## Parameter

`<Value>` is a value between -32768 and 32767. It can also be a numeric variable, an mathematical expression or expression from a condition.

_Note: When `NOT` is performed before an expression in a condition (`IF...THEN...ELSE` or `IF...GOTO...ELSE`), the result becomes false if true and vice versa._

## Examples

```basic
PRINT NOT 15
-16
```

Binary explanation:
```
0000000000001111 NOT
----------------
1111111111110000
```
-16 is actually the number 65520

---
```basic
PRINT NOT &B11001100
-205
```
Binary explanation:
```
0000000011001100 NOT
----------------
1111111100110011
```
-205 is actually the number 65331

## Related to

`AND`, `EQV`, `IMP`, `MOD`, `OR`, `XOR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/NOT"
