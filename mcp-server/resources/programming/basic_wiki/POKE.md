# POKE

## Effect

Writes a value to a byte of the memory (RAM).

## Syntax

`POKE <Address>,<Value>`

## Parameters

`<Address>` must be in the range -32768 to 65535.  It's a decimal number in single precision, but you can also specify an address in hexadecimal form.

If `<Address>` is negative the binary complement is used. This means `POKE-1,0`=`POKE(65536-1),0`.

`<Value>` is a decimal number between 0 and 255. It can also be a numeric expression.

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

```basic
A=VDP(10)\8AND1:POKE&H430A,A*255
```

## Related to

`BLOAD`, `BSAVE`, `PEEK()`, `VARPTR()`, `VPEEK()`, `VPOKE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/POKE"
