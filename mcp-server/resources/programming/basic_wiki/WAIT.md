# WAIT

## Effect

Reads the specified I/O port and suspends the BASIC program execution until the result of value read at `<PortNumber> XOR <Value2> AND <Value1>` equals zero.

## Syntax

`WAIT <PortNumber>,<Value1>,<Value2>`

_Note: Parameters can not end with a comma alone._

## Parameters

`<PortNumber>` is the I/O port to read until the operation equals 0.

`<Value1>` is a value between 0 and 255. It can be a variable or an expression.

`<Value2>` is a optional value between 0 and 255. It can be a variable or an expression. By default it is 0.

## Example

```basic
10 ' Wait until user toggles CAPS LOCK on.
20 WAIT 170,64,64
```

## Related to

`AND`, `INP()`, `OUT`, `SOUND`, `VDP()`, `XOR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/WAIT"
