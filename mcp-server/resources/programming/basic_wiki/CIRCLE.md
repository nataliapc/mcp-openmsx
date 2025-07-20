# CIRCLE

## Effect

Draws a circle, arc or ellipse on a graphic screen (2 to 8, 10 to 12).

## Syntax

`CIRCLE STEP(<X>,<Y>),<Radius>,<Color>,<TracingStart>,<TracingEnd>,<Aspect>`

_Note: Do not put a comma if no parameters are behind._

## Parameters

`<X>` is coordinate X of the centre of the circle (0-255/511).

`<Y>` is coordinate Y of the centre of the circle (0-191/211).

Coordinates cannot be omitted.

If `STEP` is used before these coordinates, they are interpreted relative to the current cursor position. In this case the values can also be negative.

`<Radius>` is the radius of the biggest main axis.

`<Color>` is the color to be used = 0 to 15 (screens 2 to 5, 7 and 10), 0 to 3 (screen 6), 0 to 255 (screens 8, 11, 12). If `<Color>` is not specified the current foreground color is used.

`<TracingStart>` and `<TracingEnd>` are used to draw a partial circle. These values must be between 0 and 2π. By default, the tracing starts at 0 (the point at the extreme left of the circle) and the tracing ends at 2π (by turning clockwise). Using negative value will cause line to be drawn from end of arch to midpoint.

`<Aspect>` is used to define the ratio between the horizontal and vertical radius. The results of "aspect ratio" will be different depending on your screens refresh frequency, 50 Hz (PAL) or 60 Hz (NTSC). This difference is generally not supported in the emulators.

## Example

```basic
10 SCREEN 2
20 CIRCLE (127,95),50,,,,1.4
30 GOTO 30
```

It will draw a circle on a 50 Hz computer and an ellipse on a 60 Hz computer.

## Related to

`CLS`, `COLOR`, `DRAW`, `LINE`, `PAINT`, `POINT`, `PRESET`, `PSET`, `SCREEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CIRCLE"
