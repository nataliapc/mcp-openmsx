# SET PAGE

## Effect

Defines:
- the page containing the bitmap/YAE/YJK table used to display the foreground.
- the page containing the one on which the graphics instructions work.

`SET PAGE` only works in SCREEN 5 to 8 and 10 to 12 modes.

## Syntax

`SET PAGE <DisplayPage>,<ActivePage>`

A least one parameter needs to be used.

Do not put a comma if no parameters are behind.

## Parameters

`<DisplayPage>` is the number of the page containing the bitmap/YAE/YJK table used to display the foreground.

To perform interlacing (see `SCREEN`) or horizontal scrolling with two pages (see `SET SCROLL`), it is required to specify an odd page as `<DisplayPage>`.

`<ActivePage>` is the number of the page on which the graphics instructions work.

Number of possible pages depends of used graphic mode:

|SCREEN|VRAM|Pages|
|---|--:|---|
|5, 6|64kB|2 (pages 0 and 1)|
|5, 6|128kB|4 (pages 0 to 3)|
|7-8, 10-12|64kB|These screens are not available|
|7-8, 10-12|128kB|2 (pages 0 and 1)|

## Example

```basic
SET PAGE 0,1
```

## Related to

`SCREEN`, `SET SCROLL`

## Compatibility

MSX-BASIC 2.0 or higher 

## Source

Retrieved from "https://www.msx.org/wiki/SET_PAGE"
