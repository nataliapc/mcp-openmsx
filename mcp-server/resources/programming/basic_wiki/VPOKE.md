# VPOKE

## Effect

Writes a value to a byte of the video memory (VRAM).

## Syntax

`VPOKE <Address>,<Value>`

## Parameters

`<Address>` must be in the range -32768 to 65535 (&H0000 to &HFFFF).

On MSX1 the usable VRAM area is 0-16383.

On MSX2 and up the usable VRAM area is 0-65535. In order to address all of the 128kB VRAM, `SET PAGE` instruction must be used. Please note that VRAM addressing is different (interleaved) in `SCREEN` modes 7, 8, 10, 11 and 12. However this is important to notice only if you switch between these two addressing modes between reading / writing.

`<Value>` is a decimal number between 0 and 255.

## Example

```basic
10 SC=PEEK(&HFCAF) ' Current screen mode (= 0/1 for text)
11 A=ASC("!")*8+BASE(SC*5+2) ' VRAM address for "!"-font outlook
12 FOR I=0 TO 7: READ D$: VPOKEA+I,VAL("&B"+D$): NEXT I
13 'New look (Note: Two last columns are not in use in screen 0)
14 DATA 00110000
15 DATA 01111000
16 DATA 01111000
17 DATA 00110000
18 DATA 00000000
19 DATA 00110000
20 DATA 00110000
21 DATA 00000000
```

## Related to

`BASE()`, `SCREEN`, `SET PAGE`, `VDP()`, `VPEEK()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/VPOKE"
