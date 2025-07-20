# GET DATE

## Effect

Reads the date in the SRAM of the Real Time Clock (RTC) on MSX2 and higher machines.

## Syntax

`GET DATE <StringVariable>,A`

## Parameters

`<StringVariable>` is a string variable that will contain the date in one of formats showed in table below.

When `A` is specified, the alarm date that you have entered with `SET DATE` will be read (no effect on almost all MSXs).

## Date format

The date is made of three elements: the day (DD), the month (MM) and the year (YY). It can be displayed in 3 different formats, the used format depends from the country for which the computer was released.

When `A` is specified, MM and YY values are "00". If no any alarm date has been entered, DD value is also "00".

|Date format|Countries|
|:-:|---|
|DD/MM/YY|Brazil, Egypt, France, Germany, Kuwait|
|MM/DD/YY|Argentina, Saudi Arabia, Soviet countries, USA and Spain|
|YY/MM/DD|Japan and Korea|

## Example

```basic
GET DATE A$:PRINT A$
 09/26/15
```

If you want to convert this format to Y/M/D (which would be closest to ISO8601 format) based on the system's date format as reported in &H002B, you can use the following snippet, it will print the original date in the system's date format, followed by the date in Y/M/D format:

```basic
1 GET DATE A$:PRINT A$:ON ((PEEK(&H2B) AND &B01110000)/16+1) GOSUB 3,4,5
2 PRINT A$:END
3 RETURN ' Y/M/D is already the right format, nothing to change here
4 A$=MID$(A$,7,2)+"/"+MID$(A$,1,2)+"/"+MID$(A$,4,2):RETURN ' Convert from M/D/Y format
5 A$=MID$(A$,7,2)+"/"+MID$(A$,4,2)+"/"+MID$(A$,1,2):RETURN ' Convert from D/M/Y format

RUN
31/05/21
21/05/31
```

## Related to

`GET TIME`, `SET DATE`, `SET TIME`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/GET_DATE"
