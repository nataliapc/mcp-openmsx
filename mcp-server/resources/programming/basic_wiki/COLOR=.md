# COLOR=

## Effect

Alters MSX color palette, loads default color palette or restores color palette from VRAM. It can be used in all screen modes, but has no visual effect in `SCREEN 8`.

_Remark: To alter MSX color palette in KANJI text modes, you need to use `CALL PALETTE`._

## Syntaxes

`COLOR = (<Color>,<RedLuminance>,<GreenLuminance>,<BlueLuminance>)`  
`COLOR = NEW`  
`COLOR = RESTORE`

_Note: No parameter can be omitted._

## Parameters

`<Color>` is a number between 0 and 15. It can be a numerical constant variable, an array variable or an expression.

_Note that color 0 is a transparent color, it means that border space is seen transparently - to handle it as a 'normal' color, you need to use `VDP(9)=VDP(9) OR &H20` (back to transparent feature with `VDP(9)=VDP(9) AND &HDF`)._

`<RedLuminance>`, `<GreenLuminance>` and `<BlueLuminance>` are numbers between 0 and 7.

`NEW` allows to load the default MSX color palette, as it was when you turn on the computer. It can be a good idea to place this statement at the beginning and the end of your program.

`RESTORE` allows to restore the color palette from VRAM, for example when it has been stored by a graphic program.

If you `BSAVE` with `,S` option, you can save the contents of VRAM to the disk along with color palette infos. If you `BLOAD` with `,S` option, you can load such palette data to VRAM, but there are not yet any changes to the actually displayed colors. If you execute `COLOR=RESTORE`, you can display the picture in the same colors at the time you saved with `BSAVE` `,S`.

## Examples

```basic
COLOR=(7,4,3,5)
```
```basic
10 SCREEN 2
20 BLOAD "BOX",S
30 COLOR=RESTORE
40 GOTO 40
```

## Default palette

|Color|R|G|B|
|-----|:-:|:-:|:-:|
|0|0|0|0|
|1|0|0|0|
|2|1|6|1|
|3|3|7|3|
|4|1|1|7|
|5|2|3|7|
|6|5|1|1|
|7|2|6|7|
|8|7|1|1|
|9|7|3|3|
|10|6|6|1|
|11|6|6|4|
|12|1|4|1|
|13|6|2|5|
|14|5|5|5|
|15|7|7|7|

## Storage of palette in VRAM

MSX-BASIC stores/restores palette to/from VRAM, but the address is different for each screen mode. The palette is stored in VDP native format: `(R*16+B, G)`.

Here is list of addresses for each mode:

|SCREEN|Decimal|Hexadecimal|
|---|:-:|:-:|
|0, WIDTH 40|1024|0400|
|0, WIDTH 80|3840|0F00|
|1|8224|2020|
|2|7040|1B80|
|3|8224|2020|
|4|7808|1E80|
|5-6|30336|7680|
|7-8|64128|FA80|
|9|30336|7680|
|10-12|64128|FA80|

## Related to

`CALL PALETTE`, `COLOR`, `SCREEN`, `SET PAGE`, `WIDTH`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/COLOR%3D"
