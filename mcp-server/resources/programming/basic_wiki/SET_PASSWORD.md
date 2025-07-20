# SET PASSWORD

## Effect

Sets a system password and stores it in the SRAM of the  Real Time Clock (RTC).

## Syntax

`SET PASSWORD <Password>`

## Parameter

`<Password>` is a string (between quotes) or a string variable. The string can contain between 0 to 255  characters. You will need to enter this pasword in blind mode on the logo screen before being able to use your computer. The password needs to be followed by a pressing of the RETURN key.

_Remark: `SET PROMPT` and `SET TITLE` use also such a string of characters. Only the last entered instruction will be saved in the Real Time Clock (RTC)._

## Examples

```basic
SET PASSWORD "hello!"
```

```basic
SET PASSWORD "" ' Empty password, but you need to press the RETURN key to quit the logo screen
```

Here's a BASIC program to create and implement a 'simple' password of 255 characters:
```basic
10 CLEAR 1000
20 A$ = ""
30 FOR I = 1 TO 255
40 A$ = A$ + "1"
50 NEXT I
60 SET PASSWORD A$
```

## Tips
- To skip the password, you need to boot while pressing simultaneously the `GRAPH` and `STOP` keys.
- To remove the password, use `SET PROMPT` or `SET TITLE`, eventually with an empty string of characters.

## Storage in the RTC

The Real Time Clock (RTC) is a small storage of 53 bytes in blueMSX (52 bytes in openMSX). However, the Russian Yamaha computers with network have an additionnal byte that comes after #26 in blueMSX, so, for these machines, #27 to #34 are replaced by #28 to #35 in blueMSX.

The data saved with `SET PASSWORD` are stored as follows (hexadecimal locations in the files):

### #28 in blueMSX (#27 in openMSX)

This byte has always the value 01 when the string of characters X$ is used for `SET PASSWORD`.

### #29 to #2B in blueMSX (#28 to #2A in openMSX)

If a correct password has been entered, these bytes work as a security to avoid that a power failure introduces a wrong password. They need to have always respectively the values 01, 02 and 03.

### #2C to #2F in blueMSX (#2B to #2E in openMSX)

These bytes store the password in form of a 16bit CRC value.

### #30 in blueMSX (#2F in openMSX)

When the value is different from 00, the computer will read the optional 'key cartridge value' (a 16 bit password) via I/0 port 7F and compare it with the contents of the 4 previous bytes.

See also the Description of RTC SRAM's Block 3.

## Related to

`SET PROMPT`, `SET TITLE`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_PASSWORD"
