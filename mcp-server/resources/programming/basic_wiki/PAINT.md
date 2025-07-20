# PAINT

## Effect

Fills the zone of a drawing in graphic screen (2 to 8, 10 to 12) with the specified color.

## Syntax

`PAINT STEP(<X>,<Y>),<FillingColor>,<BorderColor>`

_Note: Parameters can not end with a comma alone._

## Parameters

`<X>` is coordinate X (0-255/511) of the starting point to paint a zone of the drawing.

`<Y>` is coordinate Y (0-191/211) of the starting point to paint a zone of the drawing.

Coordinates cannot be omitted.

If `STEP` is used before these starting coordinates, they are interpreted relative to the current cursor position. In this case the values can also be negative.

`<FillingColor>` is the color to be used for painting a zone of the drawing. If `<FillingColor>` is not specified the current foreground color is used.

`<BorderColor>` is the color to be used as limit of the zone to paint. If `<BorderColor>` is not specified the current draw color is used. If the border line is not fully uninterrupted, the entire screen will be painted. It implies that it is recommended to specify a `<BorderColor>` corresponding to the border line of the zone to paint.

Both colors can receive different values according the used screen: 0 to 15 (screens 2 to 5, 7 and 10), 0 to 3 (screen 6), 0 to 255 (screens 8, 11, and 12). However, in screens 2 and 4, `<FillingColor>`  needs to be the same color as the border line of the part to paint; in this case, you can omit the `<BorderColor>`.

## Examples

```basic
10 COLOR 15,4,7:SCREEN 2
20 CIRCLE (80,80),20,8
30 PAINT (80,80),8
40 GOTO 40
```
```basic
10 COLOR 15,4,7:SCREEN 3
20 LINE (10,10)-(100,100),8,B
30 PAINT (45,45),2,8
40 GOTO 40
```
```basic
10 COLOR 15,4,7:SCREEN 7
20 CIRCLE (100,100),40,8
30 PAINT (100,100),2,8
40 GOTO 40
```
```basic
10 SCREEN 8:COLOR 30,60,90
20 CIRCLE (100,100),100,150
30 PAINT (100,100),56,150
40 GOTO 40
```

## Related to

`CIRCLE`, `COLOR`, `DRAW`, `LINE`, `PRESET`, `PSET`, `SCREEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PAINT"
