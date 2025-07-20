# SET SCROLL

## Effect

Waits until current screen refresh is done and performs horizontal and vertical scrolling of the screen contents on any text or graphic screen on MSX2+ and higher machines. It includes the Kanji text modes.

_Notes:_
- `SET SCROLL` can also be used on screen 9, but only if you add the version 4 of Hangul BASIC created by Korean MSX fan Plaire to an MSX2+ or turbo R machine.
- Scrolled positions of the screen return to their initial conditions if you reset the screen mode by using `SCREEN` or `CALL KANJI`.

## Syntax

`SET SCROLL <X>,<Y>,<MaskMode>,<PageMode>`

_Note: Each parameter is optional except the last specified. Do not put a comma after this parameter._

## Parameters

`<X>` is a value between 0 and 511 to specify the starting column of an horizontal scrolling.

`<Y>` is a value between 0 and 255 to specify the starting line of a vertical scrolling.

When not specified, the value of `<x>` and `<y>` is the last specified value (initial value is 0).

_Note: In screens 0 and 9 and Kanji text modes, all these values are also accepted, but it's recommended to use small values._

`<MaskMode>` allows to specify what happens with the left dots of Bitmap screens (8 dots in screens 5, 8, 10 to 12; 16 dots in screens 6 and 7) when making an horizontal scrolling:
- 0 = are displayed (default value).
- 1 = are hidden.

`<PageMode>` allows to specify the mode to be used in screens 5 to 8 and 10 to 12:
- 0 = only one page will be used for the horizontal scrolling (default value).
- 1 = two sequential pages are treated as a connected page for the horizontal scrolling.

To execute a two page sequential display, the displayed page must be an odd numbered page.

In screens 5 and 6, it will associate pages 0 and 1 OR 2 and 3. In screens 7, 8, 10 to 12, it will associate pages 0 and 1.

## Example

```basic
SET SCROLL 50, 100, 1, 1
```

## Related to

`CALL KANJI`, `SCREEN`, `SET ADJUST`, `SET PAGE`

## Compatibility

MSX-BASIC 3.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_SCROLL"
