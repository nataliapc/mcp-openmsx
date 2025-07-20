# MOD

## Effect

Divides two expressions as integers and returns the remainder as a result.

_Note: It's the unique BASIC instruction made of alphabetical characters and corresponding to an arithmetical operator, but MSX-BASIC provides also 6 other arithmetical operators (without using of alphabetical characters) and 6 instructions corresponding to logical operators._

## Syntax

`<Number1> MOD <Number2>`

## Parameters

`<Number1>` and `<Number2>` can be numbers, numeric variables, or mathematical expressions. But because `MOD` converts them to integers before the division, any input outside of the integer range will result in an overflow error.

## Examples

```basic
PRINT 5 MOD 3
2
```

```basic
A=31:B=13:C=A MOD B:PRINT C
5
```

## Related to

Arithmetical Operators, `AND`, `EQV`, `IMP`, `NOT`, `OR`, `XOR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/MOD"
