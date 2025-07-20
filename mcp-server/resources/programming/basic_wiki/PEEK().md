# PEEK()

## Effect

Returns the value read from a byte of the memory (RAM).

## Syntax

`PEEK(<Address>)`

## Parameter

`<Address>` must be in the range -32768 to 65535. It's a decimal number in single precision, but you can also specify an address in hexadecimal form.

If `<Address>` is negative the binary complement is used. This means `PEEK(-1)`=`PEEK(65536-1)`=`PEEK(65535)`.

## Examples

```basic
10 POKE 60000!, 11
20 PRINT PEEK(60000!)
 
RUN
11
```
```basic
10 POKE &HEA60, 11
20 PRINT PEEK(&HEA60)
 
RUN
11
```

## Related to

`BLOAD`, `BSAVE`, `POKE`, `VARPTR()`, `VPEEK()`, `VPOKE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PEEK()"
