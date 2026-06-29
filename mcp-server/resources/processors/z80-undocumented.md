# Z80 - undocumented opcodes

The Z80 CPU contains several undocumented opcodes, which can be quite helpful sometimes. The most useful undocumented opcodes are probably these ones, which split up the 16bit index registers IX and IY in 8bit registers called IXL,IXH,IYL and IYH. 

Please note, that many Z80 successors like the Z180 are NOT able to execute some of the following opcodes properly. 

This is just an overview. Parts of this article have been copied from the ["The Undocumented Z80 Documented"](http://www.myquest.nl/z80undocumented/) originally by Sean Young and currently maintained by Jan Wilmans, which is one of the most comprehensive descriptions around. 

## CB prefix

Of the 247 opcodes that use the prefix &CB, the block &CB &30 to &CB &37 is undocumented officially. These commands shift the operand register left and set its lowest bit to 1.

This is in contrast to `SRL` (Shift Right Logical), which shifts right and clears the highest bit. Some believe these opcodes were supposed to be Shift Left Logical but that the setting of the lowest bit represents a bug in the Z80, claiming this is why the opcodes are undocumented. Others call the opcodes `SLIA`, for Shift Left Inverted Arithmetic.

Regardless of the story behind this operation, its effective result is `register = (register * 2) + 1`, something that does have its uses and has been employed in various programming contexts for that reason.

```
CB30 SLL B
CB31 SLL C
CB32 SLL D
CB33 SLL E
CB34 SLL H
CB35 SLL L
CB36 SLL (HL)
CB37 SLL A
```

## DD and FD prefixes

The &DD or &FD prefixes are documented as causing operations using the 16-bit register HL to instead work with either of the 16-bit indexing registers IX or IY; if the operations access a memory location (i.e. normally `LD A,(HL)`, etc.), the opcodes must additionally include an extra byte that specifies a signed displacement (-128 to +127) from IX/IY.

However, Zilog have not documented the fact that these prefixes also affect opcodes that usually refer to the 8-bit components of HL, i.e. H and L. Thus, one gains access to the additional registers IXH, IXL, IYH, and IYL, for almost all commands that normally use H or L. It is even possible to do things like `LD IXH,IXL` (although you cannot combine IX and IY in the same instruction, for obvious reasons). These registers can be useful in routines that must process and/or store a lot of numbers. Thankfully, they are not as slow as their 16-bit counterparts: whereas access to (IX+d) is usually slower by 3 NOPs than the equivalent operation upon (HL), using the 8-bit components is (like `PUSH IX`, etc.) only 1 `NOP` slower, and this is only due to the need to parse the prefixing byte.

```
DB #DD:LD H,A --> LD IXH,A
DB #FD:LD B,L --> LD B,IYL
```

> **Note:** These registers are called LX, LY, HX, and HY by WinAPE's debugger, although its assembler uses the names given above.

## ED prefix

There are a number of undocumented EDxx instructions, of which most are duplicates of documented instructions. Any instruction not listed has no effect (same behaviour as 2 `NOP` instructions). 

The complete list except for the block instructions:

```
ED40 IN B,(C)       ED60 IN H,(C)
ED41 OUT (C),B      ED61 OUT (C),H
ED42 SBC HL,BC      ED62 SBC HL,HL
ED43 LD (nn),BC     ED63 LD (nn),HL
ED44 NEG            ED64 NEG *
ED45 RETN           ED65 RETN *
ED46 IM 0           ED66 IM 0 *
ED47 LD I,A         ED67 RRD
ED48 IN C,(C)       ED68 IN L,(C)
ED49 OUT (C),C      ED69 OUT (C),L
ED4A ADC HL,BC      ED6A ADC HL,HL
ED4B LD BC,(nn)     ED6B LD HL,(nn)
ED4C NEG *          ED6C NEG *
ED4D RETI           ED6D RETN *
ED4E IM 0 *         ED6E IM 0 *
ED4F LD R,A         ED6F RLD
ED50 IN D,(C)       ED70 IN (C) / IN F,(C) *
ED51 OUT (C),D      ED71 OUT (C),0 *
ED52 SBC HL,DE      ED72 SBC HL,SP
ED53 LD (nn),DE     ED73 LD (nn),SP
ED54 NEG *          ED74 NEG *
ED55 RETN *         ED75 RETN *
ED56 IM 1           ED76 IM 1 *
ED57 LD A,I         ED77 NOP *
ED58 IN E,(C)       ED78 IN A,(C)
ED59 OUT (C),E      ED79 OUT (C),A
ED5A ADC HL,DE      ED7A ADC HL,SP
ED5B LD DE,(nn)     ED7B LD SP,(nn)
ED5C NEG *          ED7C NEG *
ED5D RETN *         ED7D RETN *
ED5E IM 2           ED7E IM 2 *
ED5F LD A,R         ED7F NOP *
* = undocumented opcodes
```

## DDCB prefix

The undocumented DDCB instructions store the result (if any) of the operation in one of the seven all-purpose registers, which one depends on the lower 3 bits of the last byte of the opcode (not operand, so not the offset). 
```
000 B
001 C
010 D
011 E
100 H
101 L
110 (none: documented opcode)
111 A
```
The documented DDCB0106 is `RLC (IX+01h)`. So, clear the lower three bits (DDCB0100) and something is done to register B. The result of the `RLC` (which is stored in (IX+01h)) is now also stored in register B. Effectively, it does the following:
```
LD B,(IX+01h)
RLC B
LD (IX+01h),B
```
So you get double value for money. The result is stored in B and (IX+01h). The most common notation is: `RLC (IX+01h),B`

I’ve once seen this notation: 
```
RLC (IX+01h)
LD B,(IX+01h)
```
That’s not correct: B contains the rotated value, even if (IX+01h) points to ROM. The DDCB `SET` and `RES` instructions do the same thing as the shift/rotate instructions:
```
DDCB10C0    SET 0,(IX+10h),B
DDCB10C1    SET 0,(IX+10h),C
DDCB10C2    SET 0,(IX+10h),D
DDCB10C3    SET 0,(IX+10h),E
DDCB10C4    SET 0,(IX+10h),H
DDCB10C5    SET 0,(IX+10h),L
DDCB10C6    SET 0,(IX+10h) - documented instruction
DDCB10C7    SET 0,(IX+10h),A
```
So for example with the last instruction, the value of (IX+10h) with bit 0 set is also stored in register A. 

The DDCB `BIT` instructions do not store any value; they merely test a bit. That’s why the undocumented DDCB `BIT` instructions are no different from the official ones:
```
DDCB d 78   BIT 7,(IX+d)
DDCB d 79   BIT 7,(IX+d)
DDCB d 7A   BIT 7,(IX+d)
DDCB d 7B   BIT 7,(IX+d)
DDCB d 7C   BIT 7,(IX+d)
DDCB d 7D   BIT 7,(IX+d)
DDCB d 7E   BIT 7,(IX+d) - documented instruction
DDCB d 7F   BIT 7,(IX+d)
```

## FDCB prefix

Same as for the DDCB prefix, though IY is used instead of IX. 

## Web links

* ["The Undocumented Z80 Documented" by Sean Young Version 0.91, 18th September, 2005](http://www.myquest.nl/z80undocumented/z80-documented-v0.91.pdf) at [Jan Wilmans' Website](http://www.myquest.nl/z80undocumented/)
* [Short information about the internal "MEMPTR" 16bit register of the Z80 and its influence on the F-Register)](http://www.grimware.org/lib/exe/fetch.php/documentations/devices/z80/z80.memptr.eng.txt)
