# CLOAD

## Effect 

Loads a BASIC program from cassette if this program has been saved in tokenized mode with `CSAVE`.

## Syntax

`CLOAD "<Filename>"`

## Parameter

`"<Filename>"` is the name of the BASIC program to be loaded. When not specified, `CLOAD` will load the first or next BASIC program in tokenized mode found on tape. `"<Filename>"` can be replaced by a alphanumeric variable containing the name.

The format of file name is case sensitive and limited to 6 characters without extension.

## Related to

`CLOAD?`, `CSAVE`, `LOAD`, `RUN`, `SAVE`

## Compatibility

MSX-BASIC versions before 4.0

## Source

Retrieved from "https://www.msx.org/wiki/CLOAD"
