# DRAW

## Effect

Executes the instructions of a Graphics Macro Language (GML) allowing to draw complex figures to screen (graphic modes only).

## Syntaxes

`DRAW "<GMLstring>"`

  Parameters 
`"<GMLstring>"` is a string or an alphanumeric variable that contains macro language instructions to describe the figures to draw. Maximum length is 255 characters per string.

## GML instructions

GML has the following instructions:

|Tracing Instruction|Meaning|Effect|Values / Remarks|
|:--|:--|:--|:--|
|`D<length>`|Down|Moves the cursor of `<length>` pixels to the downward direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|
|`E<length>`|Up-Right|Moves the cursor diagonally of `<length>` pixels to the up-right direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|
|`F<length>`|Down-Right|Moves the cursor diagonally of `<length>` pixels to the down-right direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|
|`G<length>`|Down-Left|Moves the cursor diagonally of `<length>` pixels to the down-left direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|
|`H<length>`|Up-Left|Moves the cursor diagonally of `<length>` pixels to the up-left direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|
|`L<length>`|Left|Moves the cursor of `<length>` pixels to the left direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|
|`M<x>,<y>`|Move|Moves the cursor from the current position to specified coordinates `x`,`y` tracing a line.|`<x>` and `<y> `can be positive or negative values|
|`R<length>`|Right|Moves the cursor of `<length>` pixels to the right direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|
|`U<length>`|Up|Moves the cursor of `<length>` pixels to the upward direction tracing a line.|`<length>` = 0~255 (The cursor stays in the same place if 0)|

|Other instructions|Meaning|Effect|Values / Remarks|
|:--|:--|:--|:--|
|`A<orientation>`|Rotation Axe|Changes the orientation of the following tracing instructions.|`<orientation>` = `0` (normal), `1` (90 degrees clockwise), `2` (180 degrees clockwise) or `3` (270 degrees clockwise)|
|`B<tracing instruction>`|Blank Move|Place `B` before a tracing command to move the cursor without drawing.||
|`C<color>`|Color|Changes the foreground (drawing) color to the specified color| `<color>` = 0 to 15 (screens 2 to 5, 7 and 10), 0 to 3 (screen 6), 0 to 255 (screens 8, 11 and 12)|
|`N<tracing instruction>`|New Line|Place N before a tracing command to trace without moving the cursor (cursor stays at the previous position)||
|`S<scale>`|Scale|Scales every length specified after this command by `<scale>`/4 pixels.|if `S`=0, it is the same as `S`=4 (default) and it means each step = 1 pixel.|
|`X<alphanumeric variable>;`|Execute sub-instruction|Executes a sub-string of GML placed in a alphanumeric variable.|- String-variables can be used within DRAW GML instructions.<br>- A `X` needs to be prefixed and all variables must be closed by a `;`.<br>- Adding other GML instructions after the last `;` will result in error.|
|`=<variable>;`|Equal|Puts a parameter in a integer-variable after one of several sub-strings of GML (see `X` instruction)|- The value range is determined by the preceding GML but it cannot exceed the value 32767.<br>- To start cursor on positon given by `X` and `Y` variables, you can use: `DRAW "BM=X;,=Y;"`|

_Please note: Things like orientation, color, scale or current graphics coordinates do not reset to default values when program is `RUN` again or other program is loaded._

## Examples

```basic
10 REM This program draws a little heart
20 SCREEN 2
30 PRESET(124,91): A$="A0S4C6 R1BR2R1 F1L6 D1R6 D1L6 D1R6 G1L4 F1R2G1"
40 DRAW A$
50 A$=INPUT$(1)
```
```basic
10 SCREEN 5
20 A$="A0S4C15BM50,50"
30 S=50
40 DRAW "XA$;D=S;R=S;U=S;L=S;"
50 A$=INPUT$(1)
```

_Note: Line 40 is same as `DRAW A$+"D=S;R=S;U=S;L=S;"`_

```basic
10 ' One line drawing program done using DRAW-command (by NYYRIKKI)
20 ' Cursors = Move, Space = Draw, ESC = Exit
30 COLOR15,0,0:SCREEN2,0,0:SPRITE$(0)=" P ":DRAW "A0S4BM128,96":FOR I=0 TO 0:PUTSPRITE 0,STEP(-2,-2),8:S$=MID$("B",1-STRIG(0))+MID$(" UERFDGLH",1+STICK(0),1):I=CHR$(27)<>INKEY$:DRAW"BF2XS$;":DRAW MID$("A2XS$;A0",9+(PEEK(-839)>191 OR PEEK(-840)>0)*8):NEXT
```

## Related to

`CIRCLE`, `CLS`, `COLOR`, `LINE`, `PAINT`, `POINT`, `PRESET`, `PSET`, `SCREEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DRAW"
