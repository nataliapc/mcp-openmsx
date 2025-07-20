# PSET

## Effect

Puts a point of specified color on a graphic screen (2 to 8, 10 to 12). If not specified the current plot color is chosen.

## Syntax

`PSET STEP(<X>,<Y>),<Color>,<Operator>`

_Note: Parameters can not end with a comma alone._

## Parameters

`<Y>` is coordinate X (0-255/511) of the point to put on the screen.

`<Y>` is coordinate Y (0-191/211) of the point to put on the screen.

Coordinates cannot be omitted.

If `STEP` is used before these coordinates, they are interpreted relative to the current cursor position. In this case the values can also be negative.

`<Color>` is the color to be used = 0 to 15 (screens 2 to 5, 7 and 10), 0 to 3 (screen 6), 0 to 255 (screens 8, 11, and 12). If `<Color>` is not specified the current foreground color is used.

`<Operator>` is the logical operation to be performed between the color of the old pixel and the new color. This parameter can be used only on screens 5 to 8 and 10 to 12, it requires a MSX2 or higher computer.

The available operators are `AND`, `OR`, `PRESET`, `PSET` (default), `TAND`, `TOR`, `TPRESET`, `TPSET`, `TXOR`, `XOR`. Specifying a logical operation preceded by "T" causes nothing to be done when specified color is transparent (color 0).

The effect of the operators is done on each corresponding bit as shown in the following table.

|Current bit|Copied color bit|AND|OR|PRESET|PSET|XOR|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|0|0|0|0|1|0|0|
|0|1|0|1|0|1|1|
|1|0|0|1|1|0|1|
|1|1|1|1|0|1|0|

## Examples

```basic
10 COLOR 15,1,4: SCREEN 2
20 LINE (40,40)-(215,151),7,B
30 FOR I=0 TO 100
40 A=INT(RND(1)*173)+41
50 B=INT(RND(1)*109)+41
60 C=INT(RND(1)*14)+1
70 PSET(A,B), C
80 NEXT I
90 GOTO 90
```

```basic
10 SCREEN5: BC=12: C=0: OC=2: DIM C(10)
20 COLOR OC,BC,6:CLS
30 PSET(110,96),C,AND: PSET(114,96),C,TAND
40 PSET(118,96),C,OR: PSET(122,96),C,TOR
50 PSET(126,96),C,PRESET: PSET(130,96),C,TPRESET
60 PSET(134,96),C,PSET: PSET(138,96),C,TPSET
70 PSET(142,96),C,XOR: PSET(146,96),C,TXOR
80 IF NOT STRIG(0) GOTO 80
90 FOR I=1 TO 10: C(I)=POINT(106+(I*4),96): NEXT
100 COLOR 15,4,7: SCREEN0
110 PRINT RIGHT$("000"+BIN$(BC),4);" Old color =";BC
120 PRINT RIGHT$("000"+BIN$(C),4);" Specified color =";C
130 PRINT "===="
140 FOR I=1 TO 10: READ A$
150 PRINT RIGHT$("000"+BIN$(C(I)),4);" Plotted color is ";C(I);"with ";A$
160 NEXT: END
170 DATA "AND","TAND","OR","TOR","PRESET","TPRESET","PSET","TPSET","XOR","TXOR"
```

## Related to

`CIRCLE`, `COLOR`, `DRAW`, `LINE`, `PAINT`, `POINT`, `PRESET`, `SCREEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PSET"
