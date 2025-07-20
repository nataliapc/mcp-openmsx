# CLOAD?

## Effect

Verifies whether or not a BASIC file has been successfully saved to cassette with `CSAVE` in tokenized format. This instruction compares the program in memory with the program on tape and searches for differences.

## Syntax

`CLOAD?["<Filename>"]`

## Parameter

`"<Filename>"` is the specific name of the BASIC program to be verified. When not specified, `CLOAD?` will verify the first or next BASIC program in tokenized mode found on tape.

The format of file name is case sensitive and limited to 6 characters without extension.

## Example

`CLOAD?("test")`

## Related to

`CLOAD`, `CSAVE`

## Compatibility

MSX-BASIC versions before 4.0

## Source

Retrieved from "https://www.msx.org/wiki/CLOAD%3F"
