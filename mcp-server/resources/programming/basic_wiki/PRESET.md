# PRESET

## Effect

Puts a point of specified color on a graphic screen (2 to 8, 10 to 12). If not specified the current background color is chosen.

## Syntax

`PRESET STEP(<X>,<Y>),<Color>,<Operator>`

_Note: Do not put a comma if no parameters are behind._

## Parameters

`<X>` is coordinate X (0-255/511) of the point to put or remove on the screen.

`<Y>` is coordinate Y (0-191/211) of the point to put or remove on the screen.

Coordinates cannot be omitted.

If `STEP` is used before these coordinates, they are interpreted relative to the current cursor position. In this case the values can also be negative.

`<Color>` is the color to be used = 0 to 15 (screens 2 to 5, 7 and 10), 0 to 3 (screen 6), 0 to 255 (screens 8, 11, and 12). When this parameter is specified, `PRESET` works like PSET. If `<Color>` is not specified the current background color will be used instead the draw color for PSET, what implies that the point is not displayed or can even be removed.

`<Operator>` is the logical operation to be performed between the color of the old pixel and the new color. This parameter can be used only on screens 5 to 8 and 10 to 12, it requires a MSX2 or higher computer.

The available operators are `AND`, `OR`, `PRESET`, `PSET` (default), `TAND`, `TOR`, `TPRESET`, `TPSET`, `TXOR`, `XOR`. Specifying a logical operation preceded by "T" causes nothing to be done when specified color is transparent (color 0).

The effect of the operators is done on each corresponding bit as shown in the following table.

|Current bit|Copied color bit|AND|OR|PRESET|PSET|XOR|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|0|0|0|0|1|0|0|
|0|1|0|1|0|1|1|
|1|0|0|1|1|0|1|
|1|1|1|1|0|1|0|

## Example

```basic
10 COLOR 15,1,4: SCREEN 2
20 LINE (40,40)-(215,151),7,B
30 FOR I=0 TO 100
40 A=INT(RND(1)*173)+41
50 B=INT(RND(1)*109)+41
60 PRESET(A,B)
80 NEXT I
90 GOTO 90
```

## Related to

`CIRCLE`, `COLOR`, `DRAW`, `LINE`, `PAINT`, `POINT`, `PSET`, `SCREEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PRESET"
