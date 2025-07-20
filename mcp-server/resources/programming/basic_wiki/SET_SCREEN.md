# SET SCREEN

## Effect

Stores in the SRAM of the  Real Time Clock (RTC) the parameters corresponding to the `COLOR`, `KEY ON` / `OFF`, `SCREEN` and `WIDTH` instructions that will be used each time that you boot the computer.

## Syntax

`SET SCREEN`

## Saved parameters

- SCREEN mode: 0 or 1
- Interlace mode: 0 to 3
- WIDTH: 1 to 80
- Foreground color: 1 to 15
- Background color: 1 to 15
- Border color: 1 to 15
- Keylist display: ON or OFF
- Keyclick: ON or OFF
- Printertype: MSX or No MSX _(Note: When Arabic BASIC is enabled, this parameter is extended - see `SCREEN`)_
- Cassette writing speed: 1200 or 2400 baud

_Remark: If you use `SET SCREEN` when you are on `SCREEN 9`, the computer will display the MSX-BASIC screen after booting in `SCREEN 9` instead of `SCREEN 0` or `1`; the parameters of the other screens, especially `SCREEN 0` and `SCREEN 1`, will also be modified._

## Storage in the RTC

The Real Time Clock (RTC) is a small storage of 53 bytes in blueMSX  (52 bytes in openMSX). It is a little different in blueMSX because this emulator stores an extra setting in #1A, that probably checks if the computer is normally working.

The data saved with `SET SCREEN` are stored as follows (hexadecimal locations in the files):

### #1E in blueMSX (#1D in openMSX)

|Value|SCREEN|Displaymode|
|---|---|---|
|00|0|0, Normal|
|01|1|0, Normal|
|02|0|1, Interlaced|
|03|1|1, Interlaced|
|04|0|2, Normal, alternating even/uneven|
|05|1|2, Normal, alternating even/uneven|
|06|0|3, Interlaced, alternating even/uneven|
|07|1|3, Interlaced, alternating even/uneven|

### #1F and #20 in blueMSX (#1E and #1F in openMSX)

These bytes stores the WIDTH value with the formula (16 x value in #20) + value in #1F

Examples:
- Width 40 - value 08 in #1F and value 02 in #20 - (16 x 2) + 8 = 40 
- Width 80 - value 00 in #1F and value 05 in #20 - (16 x 5) + 0 = 80

### #21 in blueMSX (#20 in openMSX)

This byte stores the foreground color (00 to 0F).

### #22 in blueMSX (#21 in openMSX)

This byte stores the background color (00 to 0F).

### #23 in blueMSX (#22 in openMSX)

This byte stores the border color (00 to 0F).

### #24 in blueMSX (#23 in openMSX)

|Value|KEY|Keyclick|Printer|Cassette speed|
|---|---|---|---|---|
|00|OFF|No|MSX|1200 baud|
|01|ON|No|MSX|1200 baud|
|02|OFF|Yes|MSX|1200 baud|
|03|ON|Yes|MSX|1200 baud|
|04|OFF|No|No MSX|1200 baud|
|05|ON|No|No MSX|1200 baud|
|06|OFF|Yes|No MSX|1200 baud|
|07|ON|Yes|No MSX|1200 baud|
|08|OFF|No|MSX|2400 baud|
|09|ON|No|MSX|2400 baud|
|0A|OFF|Yes|MSX|2400 baud|
|0B|ON|Yes|MSX|2400 baud|
|0C|OFF|No|No MSX|2400 baud|
|0D|ON|No|No MSX|2400 baud|
|0E|OFF|Yes|No MSX|2400 baud|
|0F|ON|Yes|No MSX|2400 baud|

_Remark: In Korean Daewoo CPC-300, using a value corresponding to 'No MSX Printer" has as effect to skip the built-in software MSX-TUTOR when booting._

See also the Description of RTC SRAM's Block 2.

## Related to

`COLOR`, `KEY`, `SCREEN`, `WIDTH`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_SCREEN"
