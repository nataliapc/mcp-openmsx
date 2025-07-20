# SET TITLE

## Effect

Specifies the title and the colors of the initial logo screen at system startup, and saves these parameters in the SRAM of the Real Time Clock (RTC).

## Syntax

`SET TITLE <Title>,<LogoScreenColors>`

_Notes:_
- At least one parameter needs to be used.
- Parameters can not end with a comma alone.

## Parameters

`<Title>` is a string (between quotes) or a alphanumeric variable. Only the 6 first characters will be displayed below the logo screen and the computer will wait for the pressing on a key to quit this screen.

_Note: `SET PASSWORD` and `SET PROMPT` use also such a string of characters. Only the last entered instruction will be saved in the Real Time Clock (RTC).

`<LogoScreenColors>` is a number between 1 and 4 to specify the type of logo screen: 

|Logo screen|Background|MSX logo|Logo box|
|---|---|---|---|
|1|Blue|White|Black|
|2|Green|White|Medium Blue|
|3|Medium Red|White|Purple|
|4|Light Orange|White|Red|

_Note: If you change only the logo screen mode, you are free to use later `SET PASSWORD` or `SET PROMPT` without losing the new colors for the logo screen._

## Examples

```basic
SET TITLE "hello!" ' change only the title text
```

```basic
SET TITLE ,3 ' change only the logo screen mode
```

## Storage in the RTC

The Real Time Clock (RTC) is a small storage of generally 53 bytes in blueMSX (52 bytes in openMSX). However, the Russian Yamaha computers with network have an additionnal byte that comes after #26 in blueMSX, so, for these machines, #27 to #34 are replaced by #28 to #35 in blueMSX.

The data saved with SET TITLE are stored as follows (hexadecimal locations in the files):

### #26 in blueMSX (#25 in openMSX)

|Value|Logo screen|Background|MSX logo|Logo box|
|---|---|---|---|
|00|1|Blue|White|Black|
|01|2|Green|White|Medium Blue|
|02|3|Medium Red|White|Purple|
|03|4|Light Orange|White|Red|

### #28 in blueMSX (#27 in openMSX)

This byte has always the value 00 when the string of characters `X$` is used for `SET TITLE`.

### #29 to #34 in blueMSX (#28 to #33 in openMSX)

These bytes store the 6 first characters of the string X$, by using 2 bytes for saving the ASCII code of each character.

Example with SET TITLE "hello!":
- #29: 08 - #2A: 06 - ASCII code of 'h' is 68
- #2B: 05 - #2C: 06 - ASCII code of 'e' is 65
- #2D: 0C - #2D: 06 - ASCII code of 'l' is 6C
- #2E: 0C - #30: 06 - ASCII code of 'l' is 6C
- #31: 0F - #32: 06 - ASCII code of 'o is 6F
- #33: 01 - #34: 02 - ASCII code of '!' is 21

See also:
- Description of RTC SRAM's Block 2 for the startup logo screen colors.
- Description of RTC SRAM's Block 3 for the title.

## Related to

`SET PASSWORD`, `SET PROMPT`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_TITLE"
