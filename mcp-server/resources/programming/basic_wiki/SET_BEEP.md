# SET BEEP

## Effect

Modifies the timbre and the volume of the 'beep' sound produced by the PSG with the `BEEP` instruction, a BASIC error situation, the boot sequence or printing of 'bell'-character (07h).

This selected sound and volume will be stored to the SRAM of the  Real Time Clock (RTC) to prevent settings being lost when machine is powered off.

## Syntax

`SET BEEP <Timbre>,<Volume>`

A least one parameter needs to be used.

Do not put a comma if no parameters are behind.

## Parameters

`<Timbre>` is a number to specify the type of `BEEP`:
- 1: High tone beep (same as on MSX1 machines).
- 2: Low tone beep.
- 3: 2-tone beep.
- 4: 3-tone beep.

`<Volume>` is a number to specify the volume of the `BEEP`:
- 1: Very low.
- 2: Low.
- 3: Medium.
- 4: High.

## Example

```basic
SET BEEP 3,2
```

## Storage in the RTC

The Real Time Clock (RTC) is a small storage of 53 bytes in blueMSX (52 bytes in openMSX).

The data saved with `SET BEEP` are stored as following (hexadecimal locations in the files):

- #25 in blueMSX (#24 in openMSX).

|Value|Timbre|Volume|
|:-:|---|---|
|00|1, High tone|1, Very low|
|01|1, High tone|2, Low|
|02|1, High tone|3, Medium|
|03|1, High tone|4, High|
|04|2, Low tone|1, Very low|
|05|2, Low tone|2, Low|
|06|2, Low tone|3, Medium|
|07|2, Low tone|4, High|
|08|3, 2-tone|1, Very low|
|09|3, 2-tone|2, Low|
|0A|3, 2-tone|3, Medium|
|0B|3, 2-tone|4, High|
|0C|4, 3-tone|1, Very low|
|0D|4, 3-tone|2, Low|
|0E|4, 3-tone|3, Medium|
|0F|4, 3-tone|4, High|

See also the Description of RTC SRAM's Block 2.

## Related to

`BEEP`

## Compatibility

MSX-BASIC 2.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SET_BEEP"
