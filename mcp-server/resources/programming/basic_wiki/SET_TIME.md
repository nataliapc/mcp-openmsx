# SET TIME

## Effect

Sets the time and saves it in the SRAM of the Real Time Clock (RTC) on MSX2 and higher machines.

## Syntax

`SET TIME <String>[,A]`

## Parameters

`<String>` is a string (between quotes) or a string variable that will contain the time in the format _"HH:MM:SS"_. HH for the hour digits, MM for the minutes digits and SS for the seconds digits.

When `A` is specified, an alarm time is entered and saved. Only the HH and MM values are saved in the RTC.

_Note: The parameter `A` has effect only on the MSX equipped with an alarm._

## Example

```basic
SET TIME "21:18:43"
```

## Storage in the RTC

The Real Time Clock (RTC) is a small storage of 53 bytes in blueMSX (52 bytes in openMSX).

The data saved with `SET TIME` are stored as follows (hexadecimal locations in the files):

### #00 and #01 

These bytes store the seconds of the current time by starting with the last digit and ending with the first digit of the seconds.

Example for 43 seconds: 03 in #00 and 04 in #01

### #02 and #03 

These bytes store the minutes of the current time by starting with the last digit and ending with the first digit of the minutes.

Example for 18 minutes: 08 in #02 and 01 in #03

### #04 and #05 

These bytes store the hours of the current time by starting with the last digit and ending with the first digit of the hours.

Example for 21 hours: 01 in #04 and 02 in #05

### #0F and #10 

These bytes store the minutes of the alarm time by starting with the last digit and ending with the first digit of the minutes.

### #11 and #12 

These bytes store the hours of the alarm time by starting with the last digit and ending with the first digit of the hours.

### #17 

This byte stores how the hours are counted:
- from 0 to 11 (AM), and then from 20 to 31 (PM) if stored value is 00.
- from 0 to 23 if stored value is 01.

On the MSX2 and higher computers, the 24 hour mode is used.

See also:
- Description of RTC SRAM's Block 0 for current data
- Description of RTC SRAM's Block 1 for alarm data

## Utility on emulators

Except for testing, it's not really useful to modify the current time with `SET TIME` on an emulator, because it will automatically synchronize the clock of the emulated MSX2 (and higher) machine to the clock of the host system (Windows, Mac OS, Linux, ...) when making some actions (which vary according to the emulator used).

## Related to

`GET DATE`, `GET TIME`, `SET DATE`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_TIME"
