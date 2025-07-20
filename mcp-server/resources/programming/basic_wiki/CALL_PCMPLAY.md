# CALL PCMPLAY

## Effect

Plays a PCM audio file on a _MSX turbo R_ computer. It must be previously loaded in computer RAM or VRAM with `BLOAD` or in an array with `COPY`.

If the computer mode is `Z80` mode, the mode is automatically switched to the `R800` mode before the execution, and after finishing the `Z80` mode is restored.

If the `STOP` key is pushed during the playing, the program execution is quit and returns to BASIC.

## Syntaxes

`CALL PCMPLAY(@<StartAddress>,<EndAddress>,<SamplingFrequency>,S)`

`CALL PCMPLAY(<Array>,<length>,<SamplingFrequency>)`

The `S` and `<Length>` parameters are optional. Parameters can not end with a comma alone.

## Parameters

`<StartAddress>` and `<EndAddress>` are used to specify the area of the computer RAM (or VRAM). The `<start address>` needs always to be preceded by `@`.

`<SamplingFrequency>` is a number between 0 and 3 to choose one of the four available sampling frequencies:

```
 0 = 15.75 KHz
 1 = 7.875 KHz
 2 = 5.25 KHz
 3 = 3.9375 KHz
```

If you specify the sampling rate to 15.75 KHz under `Z80` mode or `R800` ROM mode, you get _"Illegal function call"_ error message.

The parameter `S` is used to play from VRAM instead of RAM. This can be done in any screen mode but only the active pages are valid when the screen mode is higher than 4.

`<Array>` must be a numeric type variable array.

`<Length>` can generally be omitted. When specified, the playing of an array will be stopped when this length is reached.

_Note: The format of the data is absolute binary and 1 to 255 is a normal data. 0 is a special data and causes 0 level (127) to be outputted by a number of the cycles specified by 1 byte proceeding the 0._

## Example

```basic
10 CLEAR 300,&HB000
20 BLOAD"PCMTEST.BIN"
30 CALL PCMPLAY(@&HB000,&HDFFF,1)
```

## Related to

`BLOAD`, `CALL PCMREC`, `COPY`

## Compatibility

MSX-BASIC 4.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CALL_PCMPLAY"
