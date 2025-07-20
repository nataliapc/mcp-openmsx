# BEEP

## Effect

Lets the PSG produce a simple 'beep' sound:
- On MSX1 this is plain note E on octave 6 (1316Hz) with volume 7. 
- On MSX2 and higher, different volumes and more complex 'beep' sounds can be selected with `SET BEEP`.

_Notes:_
- `BEEP` can be replaced by `PRINT CHR$(7);`
- If you're playing around with the `SOUND` instruction and have some very irritating sounds playing, the quickest and easiest way to silence all 3 PSG channels (without resetting your MSX) is to hit `CTRL`+`G` that produces the 'beep' sound.

## Syntax

`BEEP`

## Related to

`CHR$()`, `SET BEEP`, `SOUND`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/BEEP"
