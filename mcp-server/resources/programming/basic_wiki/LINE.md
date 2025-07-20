# LINE

## Effect

Draws a line or a rectangle between absolute or relative coordinates on a graphic screen (2 to 8, 10 to 12).

## Syntaxes

`LINE STEP(<X1>,<Y1>)-STEP(<X2>,<Y2>),<Color>,<Shape>,<Operator>`

`LINE -STEP(<X2>,<Y2>),<Color>,<Shape>,<Operator>`

_Notes:_
- Parameters can not end with a comma alone.
- Current cursor coordinates are used as starting coordinates with the second syntax.

## Parameters

`STEP` can be put before coordinates, to specify relative coordinates to the current cursor position. In this case the values can also be negative.

`<X1>` is coordinate X of the starting point of the line (0-255/511).

`<Y1>` is coordinate Y of the starting point of the line (0-191/211).

When `<X1>` and `<Y1>` are omitted, the coordinates of the last drawn point are used as starting point.

`<X2>` is coordinate X of the end point of the line (0-255/511).

`<Y2>` is coordinate Y of the end point of the line (0-191/211).

`<Color>` is the color to be used for drawing the line = 0 to 15 (screens 2 to 5, 7 and 10), 0 to 3 (screen 6), 0 to 255 (screens 8, 11, 12). If `<Color>` is not specified the current foreground color is used.

`<Shape>` define the shape to draw. It can be `B` to draw an empty rectangle or `BF` for filled rectangle. A line is drawn when this parameter is omited.

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
10 SCREEN 2
20 FOR I=0 TO 95 STEP 2
30 LINE (128-I,95-I)-(128+I,95+I),1,B
40 NEXT
50 GOTO 50
```

```basic
10 SCREEN 7
20 LINE (10,10)-(500,200),13,BF
30 GOTO 30
```

## Related to

`CIRCLE`, `COLOR`, `DRAW`, `PAINT`, `POINT`, `PRESET`, `PSET`, `SCREEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LINE"
