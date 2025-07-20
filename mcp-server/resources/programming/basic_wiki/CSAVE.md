# CSAVE

## Effect

Saves a BASIC program to cassette in tokenized mode. 

## Syntax

`CSAVE "<Filename>",<BaudRate>`

## Parameters

`<Filename>` is the specific name of the BASIC program to be saved in tokenized mode.

The format of file name is case sensitive and limited to 6 characters without extension. "`<Filename>`" can be replaced by a alphanumeric variable containing the name.

`<BaudRate>` specifies the baud rate at which the program should be saved, which can be either 1 (1200 baud) or 2 (2400 baud). Default value is 1. Do not put the comma if this parameter is omitted.

## ASCII text and Tokenized format

The tokenized format allows a faster loading than the loading of the same BASIC program in ASCII text and the loaded program takes less space in the MSX memory.

However, contrary to the ASCII text, the listing of the program can't be directly displayed and read. Besides, `RUN` needs to be used after loading with `CLOAD` instead of using `RUN` as unique instruction.

## Related to

`CLOAD`, `CLOAD?`, `LOAD`, `RUN`, `SAVE`

## Compatibility

MSX-BASIC versions before 4.0

## Source

Retrieved from "https://www.msx.org/wiki/CSAVE"
