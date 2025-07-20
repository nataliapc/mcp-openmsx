# COLOR

# Effect

Changes the color(s) to be used for the foreground, background and border.

_Notes:_
- If you use `COLOR` after `SCREEN`, you need to use `CLS` after `COLOR` on a graphic screen to initialize it with the new colors.
- For screens 0 to 5, 7, 9 and 10, it's useful to use `COLOR` before switching to the desired screen with `SCREEN`.
- For the Kanji text modes, it's useful to use `COLOR` before switching to the desired screen with `CALL KANJI`.
- For screen 6, using of the border colors 16 to 31 is only possible after the `SCREEN 6` instruction.
- For screens 8, 11, and 12, `COLOR` must be used after `SCREEN` when you want to use colors higher than 15.
- When all parameters are omitted on MSX2 or higher, the effect will be the same as `COLOR=NEW`, except in Kanji text mode. The color palette will be initialized.

## Syntax

`COLOR <ForegroundColor>,<BackgroundColor>,<BorderColor>`

_Notes:_
- It's possible to 'skip' a color by using just a comma. Each parameter is optional except the last specified. Do not put a comma after this parameter.
- `COLOR` without any parameter on MSX1 results to _"Missing parameter"_ error. On MSX2 and up it has same functionality as `COLOR=NEW` (see `COLOR=`).

## Parameters

`<ForegroundColor>` is the color used for the text or the drawing in graphic modes. This parameter can be omitted on MSX1 only if another parameter is placed behind it.

`<BackgroundColor>` is the color used for the background.  By default in text screen modes, background of all screen changes. In graphic modes, the parameter seems to have not effect but it will be taken in account when returning to another screen mode. 

`<BorderColor>` is the color used for the borders (top, bottom, left, right) of the screen. There are no borders in screen 0, so if you use this parameter in screen 0, it seems to have not effect but il will be taken in account when going to another screen mode.

Remarks about using of `COLOR` when you are in a Kanji text mode:
- the text displayed before the execution of `COLOR` does not switch to the new color specified as `<ForegroundColor>`.
- the background color displayed before the execution of `COLOR` does not change when specifying a new `<BackgroundColor>`, only the background of the new texts are changed, but the new color is also applied to he border color and the keylist (check it by pressing SHIFT!). Besides, the cursor will be displayed in another color, different from the foreground color, and that will vary depending on the general background color.
- if you specify a new `<BorderColor>`, it seems to have not effect but the new color will be taken in account when returning to another screen mode.
- to change the general background color, you need to enter `COLOR ,<BackgroundColor>: CALL CLS`.

Value of each color can vary and depends from the mode set with `SCREEN` or `CALL KANJI`/`CALL ANK`.

|SCREEN|COLOR|
|---|---|
|0-5|0 - 15|
|6<sup>(*)</sup>|0 - 31|
|7|0 - 15|
|8|0 - 255|
|9-10|0 - 15|
|11-12|0 - 255|
|KANJI0-3|0 - 15|

<sup>(*)</sup> See below for the specific working of `COLOR` in this screen.

The palette of colors 0 to 15 can be altered with the `COLOR=` instruction in all screen modes except screens 8, 11, 12. To alter MSX color palette in `KANJI` text modes, you need to use `CALL PALETTE`.

## Examples

```basic
COLOR 1, 13, 5
```
```basic
COLOR 10
```
```basic
COLOR ,,13
```
```basic
10 SCREEN 8: COLOR 100,150,200
20 GOTO 20
```

## Specific working of COLOR in SCREEN 6

`SCREEN 6` uses only 4 colors (0-3). The default MSX palette for these colors is used if other palette is not defined. (See `COLOR=` command).

In case color number 0-15 is used, only bits 0 and 1 of VDP Control Register 7 will have effect, what implies these correspondances:
- color 0 = color 4 = color 8 = color 12
- color 1 = color 5 = color 9 = color 13
- color 2 = color 6 = color 10 = color 14
- color 3 = color 7 = color 11 = color 15

Border color in `SCREEN 6` has colors defined for odd and even pixels independently. This color encoding method is generated in order to implement high resolution sprites. When using `COLOR` command in `SCREEN 6` BASIC expects that you want to define both colors at a same time and uses bits 0 and 1 for color number.

This can be prevented by setting bit 4 of VDP Control Register 7 to 1 (using color values 16-31). In this case bits 0 and 1 will set color for odd pixels and bits 2 and 3 will set color for even pixels. Note also that bit 4 status is not stored and when screen mode changes the border color is not converted, but native 4 bit border color representation is always used as is.

## Specific working of COLOR in SCREEN 8

The colors in SCREEN 8 are fixed in a binary format &B11111111 where:
- the highest three bits are for R (red)
- the next three bits are for G (green)
- the lowest two bits are for B (blue)

Use this formula for the color code in decimal format:  
```
Color code = 32 x (Green intensity) + 4 x (Red intensity) + (Blue intensity)
```

with :
- Green intensity: an integer from 0 to 7
- Red intensity: an integer from 0 to 7
- Blue intensity: an integer from 0 to 3

## Default values

### SCREEN 0 to 5 and 7 

|Machines|Foreground|Background|Border|
|---|:-:|:-:|:-:|
|Arabic MSX1 <sup>(*)</sup> booting in Arabic mode|15 - white|4 - dark blue|7 - sky blue|
|Arabic MSX1/2 booting in European mode|15 - white|4 - dark blue|4 - dark blue|
|Arabic Sakhr MSX2|15 - white|4 - dark blue|4 - dark blue <sup>(**)</sup>|
|Brazilian Ciel MSX2+|15 - white|4 - dark blue|7 - sky blue|
|Brazilian Gradiente MSX|15 - white|1 - black|1 - black|
|Brazilian Sharp MSX|15 - white|4 - dark blue|4 - dark blue|
|Daewoo CPC-300/300E MSX2|15 - white|4 - dark blue|7 - sky blue|
|Daewoo CPC-400/400S MSX2|15 - white|4 - dark blue|4 - dark blue|
|European and Russian MSX/MSX2|15 - white|4 - dark blue|4 - dark blue|
|Frael Bruc MSX|1 - black|13 - magenta|13 - magenta|
|Japanese MSX/MSX2/MSX2+/MSXturboR|15 - white|4 - dark blue|7 - sky blue|
|Korean MSX computers and MSX2 consoles|15 - white|4 - dark blue|7 - sky blue|
|Korean MSX consoles|15 - white|1 - black|1 - black|

<sup>(*)</sup> also Bawareth Perfect MSX2.  
<sup>(**)</sup> "forced" to 7 when using `CALL DCOLOR`.

### KANJI text modes

When using the command `CALL KANJI`, the foreground and background colors of previously used mode (especially `SCREEN 0`, `SCREEN 1` and `SCREEN 9`) are directly transferred to the KANJI text mode and the background color is also used for the border.

### How to change the default values

On MSX2 and higher machines, you can change these default values by using first `COLOR`, then `SET SCREEN` to save the new parameters in the Real Time Clock (RTC). It is not possible to change the default values for the Japanese KANJI text modes.

If you use `SET SCREEN` when you are on `SCREEN 9`, the computer will display the MSX-BASIC screen after booting in `SCREEN 9` instead of `SCREEN 0` or `1`; the parameters of the other screens, especially `SCREEN 0` and `SCREEN 1`, will also be modified.

## Related to

`CALL CLS`, `CALL DCOLOR`, `CALL KANJI`, `CALL PALETTE`, `CLS`, `COLOR=`, `SCREEN`, `SET SCREEN`

# Compatibility 

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/COLOR"
