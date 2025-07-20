# SET PROMPT

## Effect

Modifies the standark 'Ok' prompt and saves the new prompt in the SRAM of the  Real Time Clock (RTC).

## Syntax

`SET PROMPT <Prompt>`

## Parameter

`<Prompt>` is a string (between quotes) or a string variable. Only the 6 first characters will be displayed after each MSX-BASIC command in direct mode.

_Remark: `SET PASSWORD` and `SET TITLE` use also such a string of characters. Only the last entered instruction will be saved in the Real Time Clock (RTC)._

## Examples

```basic
SET PROMPT "hello!"
```

```basic
SET PROMPT "" ' to set an empty prompt
```

## Storage in the RTC 

The Real Time Clock (RTC) is a small storage of 53 bytes in blueMSX (52 bytes in openMSX). However, the Russian Yamaha computers with network have an additionnal byte that comes after #26 in blueMSX, so, for these machines, #27 to #34 are replaced by #28 to #35 in blueMSX.

The data saved with `SET PROMPT` are stored as follows (hexadecimal locations in the files):

### #28 in blueMSX (#27 in openMSX)

This byte has always the value 02 when the string of characters `X$` is used for `SET PROMPT`.

### #29 to #34 in blueMSX (#28 to #33 in openMSX)

These bytes store the 6 first characters of the string `X$`, by using 2 bytes for saving the ASCII code of each character.

Example with `SET PROMPT "hello!"`:
- #29: 08 - #2A: 06 - ASCII code of 'h' is 68
- #2B: 05 - #2C: 06 - ASCII code of 'e' is 65
- #2D: 0C - #2D: 06 - ASCII code of 'l' is 6C
- #2E: 0C - #30: 06 - ASCII code of 'l' is 6C
- #31: 0F - #32: 06 - ASCII code of 'o is 6F
- #33: 01 - #34: 02 - ASCII code of '!' is 21

See also the Description of RTC SRAM's Block 3.

## Related to

`SET PASSWORD`, `SET TITLE`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_PROMPT"
