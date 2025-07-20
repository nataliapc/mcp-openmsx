# COLOR SPRITE()

## Effect

Changes entirely the color of a sprite on screens 4 to 8 and 10 to 12 and optionally changes collision rules.

_Notes:_
- In screen 8, the colors for the sprites are different from the 'standard' colors.
- When you use this instruction, don't specify the sprite color with PUT SPRITE.

## Syntax

`COLOR SPRITE(<SpriteDisplayNumber>)=<Color>`

## Parameters

`<SpriteDisplayNumber>` is a number between 0 and 31 that specifies the display priority number of sprite. When the number is bigger, the sprite is displayed over the others.

`<Color>` is a number between 0 and 127 that specifies the color number + possibly some modifications. It is the result of values 0 or 1 in the 8-bit VDP Sprite Color Register, used only for the sprites type 2. As bit 4 is not used, some values are useless.

Table below is the detail for the color value format:

|Bits|Effect|
|:-:|---|
|7|Remember to set this bit to 0 otherwise an error _"Illegal function call"_ occurs.|
|6|1 to enable OR operation with bits pattern of linked sprites. The linked sprites are sprites displayed below with the bit 6 at 0. Four sprites can be linked.<br>Each bit at 1 in sprite patterns corresponds to the specified color of sprite. The OR operation is performed with the sprite colors on each bit superposed when displayed. The colors are taken into account for operation only when the bit is at 1. Thus the color of each pixel of the sprite at the top (with bit 6 to 1) will take the color resulting from each operation. (See "OR Color" for more info).|
|5|1 to ignore the sprite collision with another sprite. (ON SPRITE GOSUB## will have no effect).|
|4|Unused.|
|3-0|Color is used for the sprite (0~15 in decimal). The used colors are different in screen 8.|

To get the decimal value, you can input one of the following instructions:

|Bit|Instruction|
|:-:|---|
|5 set|`PRINT C+&B0100000`|
|5 and 6 set|`PRINT C+&B1100000`|
|6 set|`PRINT C+&B1000000`|

`C` is the color number (0~15) that you want to use.

Here is the detail with the decimal values and the different effects:

|Color|Effects|
|---|---|
|0-15|The corresponding color is used for the sprite.|
|32-47|- The color corresponding to (number - 32) is used for the sprite.<br>- Collision with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).|
|64-79|- The color corresponding to (number - 64) is used for the sprite.<br>- The logical operator `OR` is applied between colors of previous sprite pattern and new sprite pattern.|
|96-111|- The color corresponding to (number - 96) is used for the sprite.<br>- Collision with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).<br>- The logical operator `OR` is applied between colors of previous sprite pattern and new sprite pattern.|

## Examples

```basic
10 COLOR 15,1,7: SCREEN 5,0
20 B$=""
30 FOR I=0 TO 7: READ A: B$=B$+CHR$(A): NEXT
40 SPRITE$(0)=B$
50 COLOR SPRITE(0)=12
60 FOR I=0 TO 212: PUT SPRITE 0,(I,I),,0:NEXT
70 DATA 24,60,126,255,36,36,66,129
```

```basic
10 SCREEN5
15 ON SPRITE GOSUB 90: SPRITE ON 'Enable collision for all sprites
20 SPRITE$(0)=STRING$(8,255)
30 COLOR SPRITE(1)=38 'is color 6 + &amp;B0100000 to disable collision for sprite 1
40 PUTSPRITE 0,(50,50),10,0
50 PUTSPRITE 1,(54,54),,0 ' The color parameter must be omitted
60 IF NOT STRIG(0) GOTO 60 'Press Space to enable OR operator
70 COLOR SPRITE(1)=79 'color 15 + &amp;B1000000 to enable OR operation
80 GOTO 80
90 SCREEN 0: PRINT"Sprite collision OK": BEEP: END
```

## Related to

`COLOR SPRITE$()`, `ON SPRITE GOSUB`, `PUT SPRITE`, `SPRITE`, `SPRITE$()`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/COLOR_SPRITE()"
