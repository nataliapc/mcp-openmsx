# SET DATE

## Effect

Sets the date and saves it in the SRAM of the Real Time Clock (RTC) on MSX2 and higher machines.

## Syntax

`SET DATE <String>[,A]`

## Parameters

`<String>` is a string (between quotes) or a string variable that must contain the date in one of formats shown in table below.

When `A` is specified, an alarm date is entered and saved. Only the `DD` value is saved in the RTC.

_Note: This parameter has effect only on the MSX equipped with an alarm._

## Date format

The date is made of three elements: the day `DD`, the month `MM` and the year `YY`. It can be displayed in 3 different formats, the used format depends from the country for which the computer was released.

|Date format|Countries|
|:--|:--|
|DD/MM/YY|Brazil, Egypt, France, Germany and Kuwait|
|MM/DD/YY|Argentina, Saudi Arabia, Soviet countries, USA and Spain|
|YY/MM/DD|Japan and Korea|

## Example

```basic
SET DATE "10/25/15"
```

## Storage in the RTC

The Real Time Clock (RTC) is a small storage of 53 bytes in blueMSX (52 bytes in openMSX).

The data saved with `SET DATE` are stored as follows (hexadecimal locations in the files):

### #06

This byte stores a value from 00 to 06 corresponding to the day of the week, but this feature is not used in the MSX2 (or higher) computers.

|Value|Day of the week|
|:--|:--|
|00|Sunday|
|01|Monday|
|02|Tuesday|
|03|Wednesday|
|04|Thursday|
|05|Friday|
|06|Saturday|

### #07 and #08

These bytes store the day of the current date by starting with the last digit and ending with the first digit of the date.

Example for 25: 05 in #07 and 02 in #08

### #09 and #0A

These bytes store the month of the current date by starting with the last digit and ending with the first digit of the month.

Example for 10: 00 in #09 and 01 in #0A

### #0B and #0C

These byte store the difference between the year of the current date and 1980, by starting with the last digit and ending with the first digit of the difference.

Example for 2015: 05 in #0B and 03 in #0C (2015 - 1980 = 35)

### #13

This byte is conceived to store a value from 00 to 06 corresponding to the alarm day of the week, but this feature is not used in the MSX2 (or higher) computers.

### #14 and #15

These bytes store the day of the alarm date by starting with the last digit and ending with the first digit of the date.

### #18

This byte stores a value from 00 to 06 corresponding to the formula `R = D MOD 4` with `D` = difference between year of the current date and 1980 and `R` = remainder after division of `D` by 4. When the value of `R` is 00, it's a leap year with an extra day (29 February).

See also:
- Description of RTC SRAM's Block 0 for current data.
- Description of RTC SRAM's Block 1 for alarm data.

## Utility on emulators

Except for testing, it's not really useful to modify the current date with `SET DATE` on an emulator, because it will automatically synchronize the clock of the emulated MSX2 (and higher) machine to the clock of the host system (Windows, Mac OS, Linux, ...) when making some actions (which vary according to the emulator used).

## Related to

`GET DATE`, `GET TIME`, `SET TIME`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_DATE"
