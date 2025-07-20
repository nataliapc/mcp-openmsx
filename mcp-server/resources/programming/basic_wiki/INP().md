# INP()

## Effect

Returns the value of an input port.

## Syntax

`INP(<PortNumber>)`

## Parameter

`<PortNumber>` is the I/O port number to read. It needs to be between 0 and 255.

## Example

```basic
10 A=INP(&HA8)
20 A$="00000000"+BIN$(A)
30 PRINT RIGHT$(A$,8)
```

## Related to

`OUT`, `SOUND`, `VDP()`, `WAIT`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/INP()"
