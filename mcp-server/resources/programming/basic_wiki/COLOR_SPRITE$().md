# COLOR SPRITE$()

## Effect

Changes the color for an horizontal line of a sprite on screens 4 to 8 and 10 to 12 and optionally changes collision rules for this line + applies a shift effect to this line. Several lines can also be modified.

This handling line per line allows to create multi-colored sprites. In screen 6, it allows to have sprites with one color for the even lines and another color for the odd lines. The shift effect allows to create "mini-sprites".

_Note: In screen 8, the colors for the sprites are different from the 'standard' colors._

## Syntax

`COLOR SPRITE$(<SpriteNumber>)=<String>`

## Parameters

`<SpriteNumber>` is a number between 0 and 31 that specifies the sprite number.

`<String>` is a string of 8 or 16 characters according the sprites size (8x8 or 16x16). Each character number is the color value for the corresponding horizontal line of the sprite including extra bits functions described below.

Characters can be specified by the function `CHR$()` that converts a value to a MSX character (see the example for CHR$() use). Remember the bit 4 is unused.

Table below is the detail for the color value format in the 8-bit VDP Sprite Color Register, used only for the sprites type 2:

|Bits|Effect|
|:-:|---|
|7|1 to enable moving of the horizontal line of the sprite to left by 32 dots|
|6|1 to enable OR operation with bits pattern of linked sprites for the horizontal line of the sprite. The linked sprites are sprites displayed below with the bit 6 at 0. Four sprites can be linked.<br>Each bit at 1 in sprite patterns corresponds to the specified color of sprite. The OR operation is performed with the sprite colors on each bit superposed when displayed. The colors are taken into account for operation only when the bit is at 1. Thus the color of each pixel of the sprite at the top (with bit 6 to 1) will take the color resulting from each operation. (See `OR color` for more info).|
|5|1 to ignore collision of the horizontal line of the sprite with another sprite. (`ON SPRITE GOSUB` will have no effect).|
|4|Unused.|
|3-0|Color is used for the horizontal line of the sprite (0~15 in decimal). The used colors are different in screen 8.|

To get the value in decimal, you can input one of the following instructions:

|Bits|Instruction|
|5 set|`PRINT C+&B00100000`|
|5 and 6 set|`PRINT C+&B01100000`|
|6 set|`PRINT C+&B01000000`|
|5 and 7 set|`PRINT C+&B01100000`|
|7 set|`PRINT C+&B10000000`|
|6 and 7 set|`PRINT C+&B11000000`|
|5, 6 and 7 set|`PRINT C+&B11100000`|

`C` is the color number (0~15) that you want to use.

Here is the detail with the decimal values and the different effects:

|Line color|Effects|
|:-:|---|
|0-15|The corresponding color is used for the concerned horizontal line of the sprite.|
|32-47|- The color corresponding to (number - 32) is used for the concerned horizontal line of the sprite.<br>- Collision  of this part of the  sprite with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).|
|64-79|- The color corresponding to (number - 64) is used for the concerned horizontal line of the sprite.<br>- The logical operator `OR` is applied for this horizontal line between colors of previous sprite pattern and new sprite pattern.|
|96-111|- The color corresponding to (number - 96) is used for the concerned horizontal line of the sprite.<br>- Collision of this part of the  sprite with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).<br>- The logical operator `OR` is applied for this horizontal line between colors of previous sprite pattern and new sprite pattern.|
|128-143|- The color corresponding to (number - 128) is used for the concerned horizontal line of the sprite.<br>- This part of the sprite is moved to left by 32 dots.|
|160-175|- The color corresponding to (number - 160) is used for the concerned horizontal line of the sprite.<br>- This part of the sprite is moved to left by 32 dots.<br>- Collision of this part of the sprite with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).|
|192-207|- The color corresponding to (number - 192) is used for the concerned horizontal line of the sprite.<br>- This part of the sprite is moved to left by 32 dots.<br>- The logical operator `OR` is applied for this horizontal line between colors of previous sprite pattern and new sprite pattern.|
|224-239|- The palette color corresponding to (number - 224) is used for the concerned horizontal line of the sprite.<br>- This part of the sprite is moved to left by 32 dots.<br>- Collision  of this part of the  sprite with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).<br>- The logical operator `OR` is applied for this horizontal line between colors of previous sprite pattern and new sprite pattern.|

## Example

```basic
10 COLOR 15,1,7: SCREEN 5,0
20 B$=""
30 FOR I=0 TO 7: READ A: B$=B$+CHR$(A): NEXT
40 SPRITE$(0)=B$
50 PUT SPRITE 0, (100,100),15,0
60 FOR I=0 TO 2000: NEXT
70 COLOR SPRITE$(0)=CHR$(12)+CHR$(1)+CHR$(130)
80 FOR I=0 TO 2000: NEXT
90 DATA 24,60,126,255,36,36,66,129
```

## Related to

`COLOR SPRITE()`, `ON SPRITE GOSUB`, `PUT SPRITE`, `SPRITE`, `SPRITE$()`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/COLOR_SPRITE$()"
