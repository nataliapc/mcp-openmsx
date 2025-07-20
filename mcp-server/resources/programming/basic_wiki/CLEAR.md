# CLEAR

## Effect

Clears the contents of all variables, including functions defined with `DEF FN`, and all dimensions of arrays, sets all numeric variables to zero, all strings to null, closes all open files, and frees up memory.

Optionally reserves a specified number of bytes for storing string variables in a program and/or defines the highest memory location that may be used by MSX-BASIC.

After execution, you can check the result of the first parameter with `PRINT FRE("")` and the new available free space memory for MSX-BASIC with `PRINT FRE(0)`.

## Syntax

`CLEAR <StringsArea>,<UpperAddress>`

_Note: Parameters can not end with a comma alone._

## Parameters

`<StringsArea>` is the amount of bytes to be reserved for storing string variables. (200 by default).

`<UpperAddress>` is the highest memory location that may be used by MSX-BASIC. This address can vary between 831Fh and F380h. It is stored into variable system `HIMEM` (FC4Ah).

## Example

`CLEAR 300, &HC000`

**PLEASE NOTE:** MSX1 has a bug that allows string space to be exceeded by a byte. This problem can be fixed by adding another `CLEAR` instruction without parameters after the actual `CLEAR` instruction.

## Related to

`DEF FN`, `DIM`, `END`, `ERASE`, `FN`, `FRE`, `MAXFILES`, `NEW`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CLEAR"
