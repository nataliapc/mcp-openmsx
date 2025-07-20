# AND

## Effect

Performs a bitwise AND-operation (logical conjunction) between two expressions.  
The bit is set if both bits are set. For each bit, the results are:
```
0 AND 0  =  0 
0 AND 1  =  0  
1 AND 0  =  0  
1 AND 1  =  1 
```
The AND-operation is often used to "mask" one or more bits.

## Syntax
`<Value> AND <Value>`

## Parameter

`<Value>` is a value between -32768 and 32767. It can also be a numeric variable, an mathematical expression or expression from a condition.

Notes:
- If you use binary expressions, it is best to put the first expression in parenthesis to avoid the bug in interpreter that causes a syntax error. This problem does not happen with decimal, hexadecimal or octal expressions.
- When the expression is performed in a condition (`IF...THEN...ELSE` or `IF...GOTO...ELSE`), if the result of the whole expression is zero the value is taken as false, otherwise it's taken as true.

## Examples

```basic
PRINT 15 AND 11
11
```
Binary explanation:
```
1111 
1011  AND
----
1011
```

```basic
PRINT 6 AND 13
4
```
Binary explanation:
```
0110
1101 AND
----
0100
```

```basic
PRINT &B00001111 AND &B11110001
15
Syntax error
Ok
PRINT (&B00001111) AND &B11110001
1
```

## Related to

`EQV`, `IMP`, `MOD`, `NOT`, `OR`, `XOR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/AND"
