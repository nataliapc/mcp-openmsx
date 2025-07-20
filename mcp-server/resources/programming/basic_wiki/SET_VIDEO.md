# SET VIDEO

## Effect

Sets superimposition and digitization modes.

## Syntax

`SET VIDEO <Mode>,<ScreenLuminance>,<ColorBus>,<Synchro>,<AudioSource>,<VideoOutput>,<A/V>`

_Note: Each parameter is optional except the last specified. Do not put a comma after this parameter._

## Parameters

`<Mode>` is a value between 0 and 3 to set video mode.
- 0 for computer screen (internal synchronization).
- 1 for computer screen - digitize mode (external synchronization).
- 2 for superimpose (external synchronization).
- 3 for external video (external synchronization).

`<ScreenLuminance>` is 0/1 for normal/half tone.

`<ColorBus>` is to set the direction for VDP's color bus. 0 for IN, 1 for OUT.

`<Synchro>` is to set the type of synchronisation, 0 for internal,  1 for external.

`<AudioSource>` is to set the type of audio source.
- 0 = only computer.
- 1 = mix computer + external source only on right side.
- 2 = mix computer + external source only on left side.
- 3 = mix computer + external source on both sides.

`<VideoOutput>` is to set the type of video output, 0 for RGB, 1 for composite.

`<A/V>` is to select or not the RGB output for audio and video, 0 is not selected, 1 is selected.

## Related to

`CALL IMPOSE`, `COPY SCREEN`, `SCREEN`

## Compatibility

MSX-BASIC 2.0 or higher

_Note: This instruction is available on all MSX2 and higher computers. The parameters will be ignored on machines without corresponding option (digitizing unit, superimposition capacity, etc). All parameters are effective with the Panasonic FS-UV1 cartridge._

## Source

Retrieved from "https://www.msx.org/wiki/SET_VIDEO"
