# GET TIME

## Effect

Reads the time in the SRAM of the Real Time Clock (RTC) on MSX2 and higher machines.

## Syntax

`GET TIME <StringVariable>,A`

## Parameters

`<StringVariable>` is a string variable that will contain the time in the format "HH:MM:SS". HH for the hour digits, MM for the minutes digits and SS for the seconds digits.

When `A` is specified, the alarm time that you have  entered with `SET TIME` will be read. SS value is "00". If no any alarm time has been entered, HH and MM values are also "00" (no effect on almost all MSXs).

## Example

```basic
GET TIME A$:PRINT A$
 20:27:43
```

## Related to

`GET DATE`, `SET DATE`, `SET TIME`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/GET_TIME"
