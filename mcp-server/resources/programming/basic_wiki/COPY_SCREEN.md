# COPY SCREEN

## Effect

Digitizes picture from video input and copies it to VRAM. It can be used in screens 5 to 8 and 10 to 12 and requires to first set the computer in digitize mode with `SET VIDEO`.

## Syntax

`COPY SCREEN <Mode>,<InputColor>`

## Parameters

`<Mode>` is a value to set or not interlaced mode:
- If the value equals 0 (default value), the digitized picture is stored in the current page.
- If the value equals 1, two images are stored: one in the active page -1, and the second in the active page. These two images then create one (interlaced) image.

`<InputColor>` is optional to specify the RGB color of the input to the computer, in binary or decimal format. This color will be used as mask to alter the digitized picture.

The binary format is &B11111111 where:
- the highest three bits are for R (red)
- the next three bits are for G (green)
- the lowest two bits are for B (blue)

This format is actually the one used for the fixed colors of Screen 8. Use this formula for the color code in decimal format:
```
Color code = 32 x (Green intensity) + 4 x (Red intensity) + (Blue intensity)
```
with:
- Green intensity: an integer from 0 to 7
- Red intensity: an integer from 0 to 7
- Blue intensity: an integer from 0 to 3

## Example

```basic
110 ON STOP GOSUB 210
120 STOP ON
130 SCREEN 8
140 COLOR,,255
150 SET VIDEO 1
160 COPY SCREEN
170 TIME=0
180 IF INKEY$="" GOTO 180
190 IF TIME&lt;4 GOTO 190
200 IF INKEY$="" GOTO 200 ELSE 140
210 'REM STOP
220 SET VIDEO 0,0
230 END
```

## Related to

`SCREEN`, `SET PAGE`, `SET VIDEO`

## Compatibility 

MSX-BASIC 2.0 or higher - Requires a computer with digitizing/superimposing unit

## Source

Retrieved from "https://www.msx.org/wiki/COPY_SCREEN"
