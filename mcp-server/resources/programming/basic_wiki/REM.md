# REM

## Effect

Adds remarks to the source code. Everything after `REM` until end of line will be stored as text and will not affect the program execution.

_Notes:_
- There is also 1-letter short version of this instruction: `'`, but it takes more space in RAM (3 bytes) instead of `REM` (only one byte).
- `REM` can also be replaced by `ELSE` (in this case, the compressed BASIC instructions after `ELSE` will take less place in RAM than with `REM`).

## Syntaxes

`REM <TextString>`

`' <TextString>`

## Parameter

`<TextString>` can be any text. It is optional, so you can have lines with only `REM` or `'`, just to give more clarity to your program.

If short version is used ":" is generally not mandatory when used in same line with other instructions. However, you need to use it if you get an error message when executing your program (it can happen when your remark follows a `CALL` instruction).

Unlike with `?` and `PRINT` the short version is not expanded to long version when listing the MSX-BASIC program.

## Example

```basic
10 CLS:REM I will store this program with NAME "EXAMPLE.BAS"
20 PRINT "HELLO WORLD!" ' End of program.
```

## Related to

`ELSE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/REM"
