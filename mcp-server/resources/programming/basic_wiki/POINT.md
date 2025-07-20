# POINT

##  Effect

Returns the color number of the specified point in graphic screen.

## Syntax

`POINT STEP(<X>,<Y>)`

## Parameters

`<X>` is coordinate X (0-255/511) of the point whose the color will be checked. It cannot be omitted.

`<Y>` is coordinate Y (0-191/211) of the point whose the color will be checked. It cannot be omitted.

If `STEP` is used before these starting coordinates, they are interpreted relative to the current cursor position. In this case the values can also be negative.

## Example

```basic
10 SCREEN 2:COLOR 15,1,7
20 OPEN "GRP:" FOR OUTPUT AS #1
30 FOR I=1 TO 10
40 PRESET(I*16,8)
50 C=INT(RND(1)*13)+2
60 COLOR C
70 PRINT #1,CHR$(1)+CHR$(66)
80 NEXT I
90 COLOR 15
100 PRESET (40,24)
110 PRINT #1,"Color numbers"
120 FOR I=1 TO 20
130 C=POINT(I*16+4,12)
140 PRESET(I*16,I*8+56),4
150 PRINT#1,USING "##";C
160 NEXT I
170 FOR I=1 TO 2000:NEXT I
180 COLOR 15,4,7
```

## Related to

`CIRCLE`, `COLOR`, `DRAW`, `LINE`, `PAINT`, `PRESET`, `PSET`, `SCREEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/POINT"
