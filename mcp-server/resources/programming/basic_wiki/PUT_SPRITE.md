# PUT SPRITE

## Effect

Displays a sprite.

Known bugs:
- The coordinate Y is shifted +1 relative to other graphical instructions.
- Using the `OR operator` no longer works correctly on sprites above 26.

## Syntax

`PUT SPRITE <SpriteNumber>,STEP(<X>,<Y>),<Color>,<PatternNumber>`

_Note: Do not put a comma if no parameters are behind._

## Parameters

`<SpriteNumber>` is a number between 0 and 31 that specifies the display priority number of sprite. When the number is bigger, the sprite is displayed under the others. 0 is the highest priority, 31 the lowest priority.

`<X>` is abscissa coordinate. The value is between -32 and 255. In screens 6 and 7 the sprites are displayed like if the resolution was 256x212.

`<Y>` is ordinate coordinate. The value is between -32 and 191 in screens 1 to 3, between -32 and 211 in screens 4 to 8 and 10 to 12.

The special coordinates 208 and 216 on respectively mode 1 (screens 1 to 3) and mode 2 (screens 4 to 8 and 10 to 12) disable all subsequent sprites on the SAT (Sprite Attribute Table). MSX-BASIC also has the special coordinates 209 and 217, meant to take a single sprite off the screen.

If `STEP` is specified before these coordinates, they are interpreted relative to the current cursor position. In this case the values can also be negative.

If `<X>` and `<Y>` are not specified the current coordinates remain unchanged. Note that the maximum of sprites on the same horizontal line is limited to 4 on screens 1 to 3, to 8 on screens 4 to 8 and 10 to 12.

`<Color>` is a number:
- between 0 and 15 in screen 1 to 3 (sprites type 1).
- between 0 and 127 in screens 4 to 8 and 10 to 12 (sprites type 2). It is the result of values 0 or 1 in the 8-bit VDP Sprite Color Register, used only for this type of sprites. As bit 4 is unused, some values between 16 and 127 are useless.

_Note: In screen 8, the colors for the sprites are different from the colors of other screen modes._

Table below is the detail for the color value format of sprites type 2:

|Bits|Effect|
|:-:|---|
|7|Remember to set this bit to 0 otherwise an error "Illegal function call" occurs.|
|6|1 to enable OR operation with bits pattern of linked sprites. The linked sprites are sprites displayed below with the bit 6 at 0. Four sprites can be linked.<br>Each bit at 1 in sprite patterns corresponds to the specified color of sprite. The `OR operation` is performed with the sprite colors on each bit superposed when displayed. The colors are taken into account for operation only when the bit is at 1. Thus the color of each pixel of the sprite at the top (with bit 6 to 1) will take the color resulting from each operation. (See `OR operation` for more info).|
|5|1 to ignore the sprite collision with another sprite. (`ON SPRITE GOSUB` will have no effect)|
|4|Unused.|
|3-0|Color is used for the sprite (0~15 in decimal). The used colors are different in screen 8.|

To get the decimal value, you can input one of the following instructions:

|Bit|Instruction|
|:-:|---|
|5 set|`PRINT C+&B0100000`|
|6 set|`PRINT C+&B1000000`|
|5 and 6 set|`PRINT C+&B1100000`|

`C` is the color number (0~15) that you want to use.

Here is the detail with the decimal values and the different effects:

|Color|Effects|
|:-:|---|
|0-15|The corresponding color is used for the sprite.|
|32-47|<li>The color corresponding to (number - 32) is used for the sprite.<br><li>Collision with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).|
|64-79|<li>The color corresponding to (number - 64) is used for the sprite.<br><li>The logical `operator OR` is applied between colors of previous sprite pattern and new sprite pattern.|
|96-111|<li>The color corresponding to (number - 96) is used for the sprite.<br><li> Collision with another sprite is ignored (`ON SPRITE GOSUB` will have no effect).<br><li>The logical `operator OR` is applied between colors of previous sprite pattern and new sprite pattern.|

If `<Color>` is not set the last foreground color will be used. The default value is 15. However, in screens 4 to 8 and 10 to 12, the color(s) previously specified with `COLOR SPRITE()` or `COLOR SPRITE$()` will be used.

`<PatternNumber>` is the pattern number in the sprites table. This number is between 0 and 255 for a 8x8 sprite, between 0 and 63 for a 16x16 sprite.

If `<PatternNumber>` is not specified it is equal to `<SpriteNumber>`.

## Examples

```basic
10 SCREEN5
15 ON SPRITE GOSUB 80: SPRITE ON 'Enable colision for all sprites
20 SPRITE$(0)=STRING$(8,255)
30 PUTSPRITE 0,(50,50),10,0
40 PUTSPRITE 1,(54,54),38,0 ' 38 is color 6 + &B0100000 to disable collision for sprite 1
50 IF NOT STRIG(0) GOTO 50 'Press Space to enable OR operator
60 COLOR SPRITE(1)=79 ' 79 is color 15 + &B1000000 to enable OR operation
70 GOTO 70
80 SCREEN 0: PRINT"Sprite collision OK": BEEP: END
```

```basic
5 ' Program to show all colors in screen 8
10 SCREEN 8,0:COLOR 255,0: CLS
20 SPRITE$(0)=STRING$(8,CHR$(255)) ' Defines pattern
30 FOR C=0 TO 15
40 PUTSPRITE C,(16,C*8),C,0 ' The sprites at left
50 NEXT:C=0
60 FOR X=32 TO 152 STEP 8
70 FOR Y=1 TO 128 STEP 8
80 LINE(X,Y)-STEP(7,7),C,BF: C=C+1 ' The squares at right
90 NEXT: NEXT
100 IF NOT STRIG(0) GOTO100
```

```basic
10 ' Program like the drawing toy Etch A Sketch
20 COLOR 11,11,6: SCREEN 5,1
30 FOR I=1 TO 8
40 READ L: A$=A$+CHR$(L): READ L: B$=B$+CHR$(L)
50 NEXT
60 SPRITE$(0)=A$: SPRITE$(1)=B$
70 COLOR SPRITE(0)=1 ' Black
80 COLOR SPRITE(1)=78 ' 14 (Gray)+&B100000 for set bit 6
90 PUTSPRITE 0,(X,Y): PUTSPRITE 1,STEP(0,0): PSET STEP(0,1)
100 IF STRIG(0) THEN COLOR 1: VDP(1)=VDP(1) AND 254 ' Sprite size normal
110 IF NOT PEEK(&HFBED) AND 32 THEN Y=Y+(Y>-1)
120 IF NOT PEEK(&HFBED) AND 128 THEN X=X-(X<255)
130 IF NOT PEEK(&HFBED) AND 64 THEN Y=Y-(Y<210)
140 IF NOT PEEK(&HFBED) AND 16 THEN X=X+(X>0)
150 IF NOT PEEK(&HFBED) AND 2 THEN CLS: COLOR 11: VDP(1)=VDP(1)OR 1 ' Sprite size doubled
160 GOTO 90
170 ' Sprite patterns
180 DATA &B01111100,&B00000000 ' in decimal: 124,0
190 DATA &B11111100,&B01111000 ' in decimal: 252,120
200 DATA &B10111000,&B01110000 ' in decimal: 184,112
210 DATA &B10011100,&B01111000 ' in decimal: 156,120
220 DATA &B10101110,&B01011100 ' in decimal: 174,92
230 DATA &B11010111,&B00001110 ' in decimal: 215,14
240 DATA &B00001010,&B00000100 ' in decimal: 10,4
250 DATA &B00000100,&B00000000 ' in decimal: 4,0
260 ' Notes:
270 ' Only two sprites are used to make three colors! (1 or 14 = 15)
280 ' PEEK(&HFBED) is to read the keyboard matrix (See system variables)
290 ' Press Space key to switch to tracing mode, and CLS key to erase the screen
300 ' The sprites are badly displayed on some emulators
```

## Related to

`COLOR SPRITE()`, `COLOR SPRITE$()`, `ON SPRITE GOSUB`, `SPRITE`, `SPRITE$()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PUT_SPRITE"
