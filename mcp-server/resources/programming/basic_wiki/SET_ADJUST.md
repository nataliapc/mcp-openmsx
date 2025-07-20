# SET ADJUST

## Effect

Sets the top left point of the MSX screen (without the borders) and stores the coordinates in the SRAM of the  Real Time Clock (RTC).

This instruction is useful on some monitors or televisions to reframe the picture on the screen. It can also create special effects in some demos.

## Syntax

`SET ADJUST (<OffsetX>,<OffsetY>)`

## Parameters

`<OffsetX>` is the offset on the abscisse from the top left point of the screen. The value is between -7 and 8.

`<OffsetY>` is the offset on the ordinate from the top left point of the screen. The value is between -7 and 8.

## Example

```basic
SET ADJUST (4,-2)
```

## Storage in the RTC

The Real Time Clock (RTC) is a small storage of 53 bytes in blueMSX (52 bytes in openMSX). It is a little different in blueMSX because this emulator stores an extra setting in #1A, that probably checks if the computer is normally working.

The data saved with `SET SCREEN` are stored as follows (hexadecimal locations in the files):

- #1C and #1D in blueMSX (#1B and #1C in openMSX).

The first byte stores the `<x>` coordinate, the second byte stores the `<y>` coordinate.

|Value|x or y|
|:--|:-:|
|00|0|
|01|-1|
|02|-2|
|03|-3|
|04|-4|
|05|-5|
|06|-6|
|07|-7|
|08|8|
|09|7|
|0A|6|
|0B|5|
|0C|4|
|0D|3|
|0E|2|
|0F|1|

See also the Description of RTC SRAM's Block 2.

## Related to

`SET SCROLL`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_ADJUST"
