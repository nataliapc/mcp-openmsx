# SCREEN

## Effect

Sets display mode, sprite size, keyboard click, cassette speed, printer type and interlace mode.

## Syntax

`SCREEN <DisplayMode>,<SpriteSize>,<Keyclick>,<BaudRate>,<PrinterType>,<InterlaceMode>`

_Note: Each parameter is optional except the last specified. Do not put a comma after this parameter._

## Parameters

### `<DisplayMode>`

#### MSX1

|SCREEN|Type|Screen resolution|Colors per block|Max colors at screen|
|:-:|---|---|---|:-:|
|0|Text, characters of 6 x 8|40 x 24 characters||2|
|1|Text, characters of 8 x 8|32 x 24 characters|2 per 8 characters|16|
|2|Graphic, blocks of 8 x 8|32 x 8 blocks x 3|2 for each 8 x 1 line of block|16|
|3|Graphic, bitmap|64 × 48 pixels||16|

These screen mode are also present on MSX2 or newer with a color palette of 512 by color in extra.

`SCREEN 1` is a text screen, but the charset can be filled with game graphics and sprites can also be used.

#### MSX2

|SCREEN|Type|Screen resolution|Colors per block|Max colors at screen|
|:-:|---|---|---|:-:|
|0 (WIDTH>40)|Text, characters of 6 x 8|80 x 24 characters||2+2 of 512 RGB|
|4|Graphic, blocks of 8 x 8|32 x 8 blocks x 3|2 for each 8 x 1 line of block|16 of 512 RGB|
|5|Graphic, Bitmap|256 x 212 pixel||16 of 512 RGB|
|6|Graphic, Bitmap|512 x 212 pixel||4 of 512 RGB|
|7|Graphic, Bitmap|512 x 212  pixel||16 of 512 RGB|
|8|Graphic, Bitmap|256 x 212 pixel||256|

MSX2 and MSX2+ modes have better sprite possibilities compared to MSX1 modes. On MSX2 and higher you can change between 40x24 and 80x24 `SCREEN 0` mode by using `WIDTH` command.

#### Korean MSX2

|SCREEN|Type|Screen resolution|Colors per block|Max colors at screen|
|:-:|---|---|---|:-:|
|9 (WIDTH<41)|Text, characters of 6 x 16|40 x 24 characters|2 per character|16 of 512 RGB|
|9 (WIDTH>40)|Text, characters of 6 x 16|80 x 24 characters|2 per character|4 of 512 RGB|

`SCREEN 9` is a text mode using a graphic screen (5 or 6). It is A-available only on Korean MSX2 computers and consoles, but version 4 of Hangul BASIC developed by Korean MSX fan Plaire extends `SCREEN 9` to non-Korean MSX2, MSX2+ and MSX turbo R machines, and its working is the same as in the Korean MSX2 consoles.

The mode 9 (WIDTH<41) is used on Zemmix consoles only, not on computers. `SCREEN 5` mode is used for this mode instead of `SCREEN 6` used on computers, no matter the width parameter.

#### MSX2+

|SCREEN|Type|Screen resolution|Colors per block|Max colors at screen|
|:-:|---|---|---|:-:|
|10|Graphic, bitmap|256 x 212|16 RGB (or YJK)|16 of 512 RGB (+12499)|
|11|Graphic, blocks of 4 x 1|64 x 212 blocks|4 YJK (or bitmap)|12499 (+16 of 512 RGB)|
|12|Graphic, blocks of 4 x 1|64 x 212 blocks|4 YJK|19268|

SCREEN10` and `11` are in fact the same mixed RGB/YJK mode with the difference that the graphic instructions from BASIC/BIOS operate
- in `SCREEN 10` as in `SCREEN 5`.
- in `SCREEN 11` with direct VRAM values similar to `SCREEN 8` but in YJK mode.

Screen is not cleared when `SCREEN 10`/`11` is used to switch from one mode to another. When mode is changed from `SCREEN 12`, the YJK colors are automatically reduced from 19268 colors to 12499 colors.

KANJI screens: Besides `SCREEN 0` to `8`, `10` to `12`, the Japanese MSX2+ and MSX turbo R computers have 4 Kanji text modes, that can be activated with `CALL KANJI`.

By default, without using of `SET SCREEN` on MSX2 and higher, the MSX-BASIC screen after booting is displayed in `SCREEN 1` on Korean and Arabic MSX1 machines, Bawareth Perfect MSX2, Daewoo CPC-300, Korean MSX2 consoles, Brazilian MSX2+ Ciel machines and all Japanese machines, in `SCREEN 0` on all other machines.

### `<SpriteSize>`

- 0: Sprite size is 8 by 8 pixels (default value).
- 1: Sprite size is 8 by 8 pixels, magnified to 16 by 16 pixels.
- 2: Sprite size is 16 by 16 pixels.
- 3: Sprite size is 16 by 16 pixels, magnified to 32 by 32 pixels.

### `<Keyclick>`

- 0: Keyclick off.
- 1: Keyclick on (default value).

### `<BaudRate>`

- 1: Cassette writing speed is 1200 baud (default value).
- 2: Cassette writing speed is 2400 baud.

This parameter is ignored on MSX turbo R.

### `<PrinterType>`

- 0: MSX printer (default value).
- 1: No MSX printer.

When Arabic BASIC is enabled, this parameter is extended as follows:

- 0: Standard MSX printer (default value).
- 1: Arabic MSX printer.
- 2: Arabic non-MSX printer.
- 3: Other printer (or for hard copy without any modification).

These 4 options are also available with the `CALL OPTIONS` instruction on Sakhr MSX2 computers.

### `<InterlaceMode>`

- 0: Off (default value for SCREEN 0 to 8, 10 to 12).
- 1: On, displays odd & even pages (default value for SCREEN 9).
- 2: Off, displays odd / even page alternating.
- 3: On, displays odd / even page alternating.

This parameter requires a MSX2 or higher machine (don't use it on MSX1, it will lead to a _"Syntax error"_ message). Modes 2 and 3 are only possible when uneven pagenumbers are used (see `SET PAGE`).

## Examples

```basic
5 ' Example for MSX1
10 SCREEN 0: PRINT"You are in SCREEN 0 - Press a key"
20 A$=INKEY$
30 IF A$="" THEN 20
40 ' Baud and printertype are not changed
50 SCREEN 2,3,0
60 OPEN"GRP:"AS 1:PRINT #1,"You are in SCREEN 2 - Press a key"
70 A$=INKEY$
80 IF A$="" THEN 70
90 ' Back to default values in SCREEN 0
100 SCREEN 0,0,1
```

```basic
5 ' Example for MSX2 and higher
10 SCREEN 0: PRINT"You are in SCREEN 0 - Press a key"
20 A$=INKEY$
30 IF A$="" THEN 20
40 ' Baud and printertype are not changed
50 SCREEN 2,3,0,,,1
60 OPEN"GRP:"AS 1:PRINT #1,"You are in SCREEN 2 - Press a key"
70 A$=INKEY$
80 IF A$="" THEN 70
90 ' Back to default values in SCREEN 0
100 SCREEN 0,0,1,,,0
```

## How to change the default values

With exception for the spritesize, all parameters of `SCREEN` that will be used each time that you boot the computer are stored in the Real Time Clock (RTC) with the `SET SCREEN` command on the MSX2, MSX2+ and MSX turbo R machines.

The parameters related to the displaymode are generally limited to screen 0 or screen 1, as these screens are used for the BASIC screen after booting, it implies that the 'alternating even/uneven' parameter is not saved in the RTC.

On the mentioned machines, you can change the default values by using first `SCREEN`, then `SET SCREEN` to save the new parameters in the RTC.

If you use `SET SCREEN` when you are on `SCREEN 9`, the computer will display the MSX-BASIC screen after booting in `SCREEN 9` instead of `SCREEN 0` or `1`; some parameters of the other screens, especially `SCREEN 0` and `SCREEN 1`, will also be modified.

## Related to

`BASE()`, `CALL EDIT`, `CALL KANJI`, `CALL OPTIONS`, `COLOR`, `CSAVE`, `LPRINT`, `LLIST`, `SET PAGE`, `SET SCREEN`, `WIDTH`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SCREEN"
