# LOCATE

## Effect

Controls text cursor position and visibility in text modes, just before using instructions such as `PRINT`, `INPUT` or `LINE INPUT`.

When used with _Delta BASIC_, it can also control text cursor position inside a window, just before using `WPRINT` or `WINPUT`. However, the working of this feature seems to be buggy when used with `WPRINT`.

## Syntaxes

`LOCATE <X>,<Y>,<Cursor>`

`LOCATE #<WindowNumber>,<X>,<Y>` (only with _Delta BASIC_)

_Note: Parameters can not end with a comma alone._

## Parameters

`<X>` is x-coordinate (column) of cursor (0-255). This parameter must always be specified when you don't specify the y-coordinate. By default, the x-coordinate is 0 when you specify only a y-coordinate.

When used inside a window with _Delta BASIC_, this parameter cannot be omitted  and must be an internal x-coordinate of the specified window.

`<Y>` is y-coordinate (row) of cursor (0-255).

When used inside a window with _Delta BASIC_, this parameter cannot be omitted  and must be an internal y-coordinate of the specified window.

`<Cursor>` is a numeric parameter. When this parameter is 0 the cursor will not be displayed (default) when computer is busy. Any other value (0-255) will keep the cursor visible all the time when computer is in text mode.

`<WindowNumber>` is a number between 1 and 9. It must always be preceded by `#` and correspond to a window previously defined with the `WINDOW` instruction of _Delta BASIC_.

## Examples

```basic
10 SCREEN0:KEYOFF:WIDTH40
20 LOCATE ,14
30 PRINT"HELLO"
```

```basic
10 SCREEN0:KEYOFF:WIDTH40
20 LOCATE 5,14
30 PRINT"HELLO"
```

With Delta BASIC:
```basic
10 SCREEN0:KEYOFF:WIDTH40
20 WINDOW#1,1,1,38,3
30 WBOX#1
40 LOCATE#1,5,0
50 WPRINT#1,"HELLO"
```

## Related to

- Standard instruction: `CSRLIN`, `INKEY$`, `INPUT`, `LINE INPUT`, `POS()`, `PRINT`, `SCREEN`, `WIDTH`
- Delta BASIC: `WINDOW`, `WINPUT`, `WPRINT`

## Compatibility

MSX-BASIC 1.0 or higher

Delta BASIC

## Source

Retrieved from "https://www.msx.org/wiki/LOCATE"
