# CALL ADJUST

## Effect

Enables the internal lightpen interface.

It is required to use `CALL ADJUST` before using `PAD()` with the values 20 to 23.

This instruction enables the lightpen interface (bit6 of the VDP R#8) but not the lightpen interrupts (bit5 of the VDP R#0), and sets the system variables XOFFS=23 and YOFFS=0.

Since it doesn't enable the light pen interrupts, this command is not enough to make `GTPAD`/`PAD()` functional. The lightpen interrupts will have to be enabled via VDP register write.

This instruction is available **only** with the MSX2 computers manufactured by _Daewoo_:
- AVT CPC-300
- Bawareth Perfect MSX2
- Daewoo CPC-300
- Daewoo CPC-400
- Daewoo CPC-400S
- Talent DPC-300
- Wandy CPC-300

It is also maybe available with the _Sanyo MPC-X Graphic Expander Unit_ and the _Sanyo MPC-27_ computer.

## Syntax

`CALL ADJUST`

# Related to

`PAD()`

## Compatibility

Only MSX2 computers manufactured by _Daewoo_.

This instruction is part of Hangul BASIC on the Korean MSX2 computers.

## Source

Retrieved from "https://www.msx.org/wiki/CALL_ADJUST"
