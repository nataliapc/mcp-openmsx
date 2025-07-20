# VPEEK()

## Effect

Returns the value of a byte within the video memory (VRAM).

## Syntax

`VPEEK (<Address>)`

## Parameter

`<Address>` must be in the range -32768 to 65535.

On MSX1 the usable VRAM area is 0-16383.

On MSX2 and up the usable VRAM area is 0-65535. In order to address all of the 128kB VRAM, `SET PAGE` instruction must be used. Please note that VRAM addressing is different (interleaved) in `SCREEN` modes 7, 8, 10, 11 and 12. However this is important to notice only if you switch between these two addressing modes between reading / writing.

## Example

```basic
10 SC=PEEK(&HFCAF) ' Current screen mode (= 0/1 for text)
20 AD=ASC("0")*8+BASE(SC*5+2) '"0" Font address in VRAM
30 'Make empty & "ball"-font to "0" & "1"
40 FOR I=0 TO 7:VPOKE AD+I,0:VPOKEAD+I+8,248:NEXTI
50 VPOKE AD+8,112:VPOKEAD+14,112:VPOKEAD+15,0
60 A$=INPUT$(1):CLS
70 IF A$<" " THEN SCREEN SC:END
80 ' Display ball picture of font A$
90 AD=ASC(A$)*8+BASE(SC*5+2) 'A$ Font address in VRAM
100 FOR I=0 TO 7
110 PRINT RIGHT$("0000000"+BIN$(VPEEK(AD+I)),8)
120 NEXT I:GOTO 60
```

## Related to

`BASE()`, `SET PAGE`, `SCREEN`, `VDP()`, `VPOKE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/VPEEK()"
