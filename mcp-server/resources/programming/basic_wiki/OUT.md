# OUT

## Effect

Writes a value to an output port.

## Syntax

`OUT <PortNumber>,<Value>`

## Parameters

`<PortNumber>` is the I/O port number to write. It needs to be between 0 and 255.

`<Value>` is a value between 0 and 255 to write at port.

## Example

Example to modify color 7 on MSX2 and higher with the following RGB values: R=4, G=3, B=5. Binary value of R is 100, of G is 011 and of B is 101, first binary value for OUT is 01000101 = 69, second binary value for OUT is 00000011 = 3.

```basic
VDP(17)=7: OUT &H9A,69: OUT &H9A,3
```

## Related to

`INP()`, `SOUND`, `VDP()`, `WAIT`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/OUT"
