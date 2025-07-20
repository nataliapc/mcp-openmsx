# CALL PCMREC

## Effect

Records a PCM audio file by using the built-in microphone of the _MSX turbo R_ computers. It can be done to computer RAM, computer VRAM or an array.

If the computer mode is _Z80_ mode, the mode is automatically switched to the _R800_ mode before the execution, and after finishing the _Z80_ mode is restored.

If the _STOP_ key is pushed during the recording, the program execution is quit and returns to BASIC.

## Syntaxes

`CALL PCMREC(@<StartAddress>, <EndAddress>, <SamplingFrequency>,<TriggerLevel>,<CompressionSwitch>,S)`

The three last parameters are optional. Parameters can not end with a comma alone.

`CALL PCMREC(<Array>,<Length>,<SamplingFrequency>,<TriggerLevel>,<CompressionSwitch>])`

`<Length>` and the two last parameters are optional. Parameters can not end with a comma alone.

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

`<TriggerLevel>` is a number between 0 and 127 to specify the required input level to start the recording.  If this is omitted or is 0, the recording is started immediately.

`<CompressionSwitch>` allows to enable or disable the silent data compression: data format is absolutely binary and 1 to 255 is normal data. When two or more data near the 0 level (126 to 128) are consecutive, the data can be compressed by recording a 0 and count of the consecutive data.

```
 0 (default value) = no silent data compression
 1 = silent data compression
```

The parameter `S` is used to record to VRAM instead of RAM -  This can be done in any screen mode but only the active pages are valid when the screen mode is higher than 4.

`<Array>` must be a numeric type variable array.

`<Length>` can generally be omitted. When specified, the recording to an array will be stopped when this length is reached.

_Note: To save the PCM audio file to disk, you need to use `BSAVE` when you have recorded it to computer RAM or VRAM, or COPY when you have recorded it to an array._

## Example

```basic
10 CLEAR 300,&HB000
20 CALL PCMREC(@&HB000,&HDFFF,1,32,1)
30 BSAVE"PCMTEST.BIN",&HB000,&HDFFF
```

## Related to

`BSAVE`, `CALL PCMPLAY`, `COPY`

## Compatibility

MSX-BASIC 4.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CALL_PCMREC"
