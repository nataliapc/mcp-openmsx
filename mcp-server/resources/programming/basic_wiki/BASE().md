# BASE()

## Effect

This instruction can be used in:

- reading mode for all supported screen modes : it returns then the first VRAM address for a specific purpose. In SCREEN 5 to 8 and 10 to 12, you'll get  the offset value from the starting address of the active page (see SET PAGE).
- writing mode, which works only for table numbers from 0 to 19, corresponding to SCREEN 0 to 3 : it allows then to change the first VRAM address for a specific purpose. VDP registers will be updated automatically. The value should be possible for VDP to implement and must be less than `&H4000` otherwise Illegal function call-error will be generated.

_Notes: A change in table numbers from 10 to 14 for `SCREEN 2` will also change the corresponding VRAM address for `SCREEN 4`._

## Syntax

`BASE(<TableNumber>)`

## Parameter

`<TableNumber>` that returns corresponding VRAM address can be calculated with formula 5 * SCREEN MODE + PURPOSE. All the practically usable values are listed in a table below (for most screens, the type column contains the names of these screens for the VDP).

|MSX|SCREEN|Type|Name Table|Color Table|Pattern Table|Sprite Attribute Table|Sprite Pattern Table|
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|MSX|0|Text 1/2|0|-|2|-|-|
|MSX|1|Text <sup>(*)</sup>Graphic 1|5|6|7|8|9|
|MSX|2|Graphic 2|10|11|12|13|14|
|MSX|3|Graphic<br>Multicolor|15|-|17|18|19|
|MSX2|4|Graphic 3|20|21|22|23|24|
|MSX2|5|Graphic 4|25|-|-|28|29|
|MSX2|6|Graphic 5|30|-|-|33|34|
|MSX2|7|Graphic 6|35|-|-|38|39|
|MSX2|8|Graphic 7|40|-|-|43|44|
|MSX2|9|Text <sup>(**)</sup>|-|-|-|-|-|
|MSX2+|10|Graphic 7|50|-|-|53|54|
|MSX2+|11|Graphic 7|55|-|-|58|59|
|MSX2+|12|Graphic 7|60|-|-|63|64|


_<sup>(*)</sup> SCREEN 1 is a text screen, but the charset can be filled with game graphics and sprites can also be used._  
_<sup>(**)</sup> SCREEN 9 is a text screen, initially conceived for Korean characters, and using graphic mode SCREEN 5 or SCREEN 6._

The Sprite Color Table, available only on MSX2 and higher and used for the sprites type 2 on screens 4 to 8 and 10 to 12 is located "strictly above" the sprite attribute table, having base address of sprite attribute table minus 512 (200 in hexadecimal).

## Examples

```basic
PRINT BASE(2)
2048
```

```basic
10 SC=PEEK(&amp;HFCAF) ' Current screen mode (= 0/1 for text)
11 A=ASC("!")*8+BASE(SC*5+2) ' VRAM address for "!"-font outlook
12 FOR I=0 TO 7:READ D$:VPOKEA+I,VAL("&amp;B"+D$):NEXT I
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

```basic
10 COLOR 15,4,7: KEYOFF
20 BASE(5)=BASE(6)
30 SCREEN 1
40 FOR I = 0 TO 38
50 PRINT"A TEST OF THE BASE COMMAND"
60 FOR J = 0 TO 100
70 NEXT J
80 NEXT I
90 LIST
100 END
```

## Returned default values (after boot)

### Name Table

|SCREEN|Decimal|Hexadecimal|
|:-:|--:|:-:|
|0|0|0000|
|1-2|6144|1800|
|3|2048|0800|
|4|6144|1800|
|5-8|0|0000|
|10-12|0|0000|

### Color Table

|SCREEN|Decimal|Hexadecimal|
|:-:|--:|:-:|
|1-2|8192|2000|
|4|8192|2000|

### Pattern Table

|SCREEN|Decimal|Hexadecimal|
|:-:|--:|:-:|
|0|2048|0800|
|1-4|0|0000|

### Sprite Attribute Table

|SCREEN|Decimal|Hexadecimal|
|:-:|--:|:-:|
|1-3|6912|1B00|
|4|7680|1E00|
|5-6|30208|7600|
|7-8|64000|FA00|
|10-12|64000|FA00|

### Sprite Pattern Table

|SCREEN|Decimal|Hexadecimal|
|:-:|--:|:-:|
|1-4|14336|3800|
|5-6|30720|7800|
|7-8|61440|F000|
|10-12|61440|F000|

### Sprite Color Table

|SCREEN|Decimal|Hexadecimal|
|:-:|--:|:-:|
|4|7168|1C00|
|5-6|29696|7400|
|7-8|63488|F800|
|10-12|63488|F800|

## References

- VDP Ports
- VDP Registers

## Related to

`SCREEN`, `SET PAGE`, `VDP()`, `VPOKE`, `VPEEK`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/BASE()"
