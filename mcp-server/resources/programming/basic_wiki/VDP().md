# VDP()

## Effect

Reads the content of a VDP register, or writes a value in a VDP register. Reading or writing depends on the use of the instruction in program. Used alone followed by an equal sign (=) and a value implies a write. Otherwise, the instruction will read.
Note: Some registers can also be combined with `OUT` and/or `INP()` for more possibilities (advanced use).

## Syntaxes

`VDP(<Number>)`

`VDP(<Number>)=<Value>`

The first syntax is used to read, and the next is used to write (except in a condition of course).

## Parameter

`<Number>` specifies a VDP register. The number of registers that are directly accessible varies according the MSX generation. 

|Number|Corresponding VDP register|Modes|Machines|
|---|---|---|---|
|0 to 7|Control registers 0 to 7|Read / Write|MSX1 and higher|
|8|Status register 0|Read|MSX1 and higher|
|9 to 24|Control registers 8 to 23|Read / Write|MSX2 and higher|
|26 to 28|Control registers 25 to 27|Read / Write|MSX2+ and higher|
|33 to 47|Control registers 32 to 46 for graphic commands|Write|MSX2 and higher|
|-1 to -9|Status registers 1 to 9|Read|MSX2 and higher|

_Notes:_
- Status registers are only readable.
- Most control register are readable but in fact it is the corresponding value from the system variables that is read. The corresponding system variables are refreshed at each writing with the `VDP()` instruction or when a Bios routine is called.
- The command registers (32 to 46) can only be written with the `VDP()` instruction. Reading them leads to an _"Illegal function call"_ error message.
- The Sprite Color register is not numbered, the values are stocked in VRAM in sprite color table whose base address is  base address of sprite attribute table minus 512 (200 in hexadecimal). Only `VPEEK()` and `VPOKE` can be useful with this register, similar to the Table Base Address Registers (control registers 2 to 6, 10, 11).

`<Value>` can vary between 0 and 255. See `VDP Registers` for detail.

## Combinations

The following combinations extend the possibilities of the `VDP()` instruction on MSX2 and higher:

|VDP()|OUT|OUT|OUT|INP()|VDP()|Description|
|---|---|---|---|---|---|---|
|VDP(15) = three senior bits of VRAM address|OUT &H99, 8 low-bits of VRAM address| OUT &H99, type operation 1 + 6 remaining bits of VRAM address|OUT &H98,value|||Indirect access to write a specific VRAM address|
|VDP(15) = three senior bits of VRAM address|OUT &H99, 8 low-bits of VRAM address|OUT &H99, type operation 0 + 6 remaining bits of VRAM address||PRINT INP(&H98)||Indirect access to read a specific VRAM address|
|VDP(16) = number of status register (0-9)||||A = INP(&H99)|VDP(16) = 0: PRINT A|Indirect access to read a status register|
|VDP(17) = number of color palette register (0-15)|OUT &H9A, red and blue data separated by a 0 bit|OUT &H9A, green data||||Indirect access to write a color palette register|
|VDP(18) = number of control register (0-23, 25-27, 32-46)|OUT &H9B,value|||||Indirect access to write a control register|

## Examples

```basic
10 FOR I=0 TO 8
20 A=VDP(I)
30 B$="00000000"+BIN$(A)
40 PRINT RIGHT$(B$,8)
50 NEXT I
```

Example to modify color 7 on MSX2 and higher with the following RGB values: R=4, G=3, B=5. Binary value of R is 100, of G is 011 and of B is 101, first binary value for `OUT` is 01000101 = 69, second binary value for `OUT` is 00000011 = 3.

```basic
VDP(17)=7: OUT &H9A,69: OUT &H9A,3
```

```basic
5 ' Make a fast copy VRAM to VRAM (HMMC) with VDP instruction
10 SCREEN 5
20 CIRCLE(63,105),127,7,,,2
30 PAINT(0,211),6,7: PAINT(0,0),10,7
40 IF VDP(-2) AND 1 THEN 40 ' Wait the end of a graphical command
50 VDP(33)=0: VDP(34)=0 ' X coordinate of source (two bytes)
60 VDP(35)=0 ' Y coordinate of source
70 VDP(40)=0 ' Source page
80 VDP(37)=128: VDP(38)=0 ' X coordinate of destination (two bytes)
90 VDP(39)=0 ' Y coordinate of destination
100 VDP(40)=0 ' Destination page
110 VDP(41)=128: VDP(42)=0 ' Width (two bytes)
120 VDP(43)=212: VDP(44)=0 ' Height (two bytes)
130 VDP(46)=0 ' Directions
140 VDP(47)=&HD0 ' value to execute the HMMC command
150 IF NOT STRIG(0) THEN 150
160 ' Notes:
170 ' The line 40 is only required to wait the end of precedent graphic command
180 ' The advantage of making a copy with VDP() instructions
190 ' is that there is no limit imposed by the Basic on the ordinate
```

## References

- `VDP Ports`
- `VDP Registers`

## Related to

`BASE()`, `COLOR=`, `INP()`, `OUT`, `SCREEN`, `VPEEK()`, `VPOKE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/VDP()"
