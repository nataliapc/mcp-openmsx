# MAXFILES

## Effect

Determines the maximum of files that can be opened simultaneously with the `OPEN` instruction.

When `MAXFILES` is executed, all variables are reseted, files opened are closed, and current info defined with `DEF` are lost.

## Syntax

`MAXFILES=<Maximum>`

## Parameter

`<Maximum>` is a number between 0 and 15.

_Note that the maximum of files that can be opened at the same time can't exceed 6 on a disk and 2 on a QuickDisk. When computer is started the default value is 1._

## Example

```basic
10 MAXFILES=2
20 OPEN "CAS:DEMO" FOR INPUT AS #1
30 OPEN "LPT:" FOR OUTPUT AS #2
40 INPUT #1,A$
50 PRINT #2,A$
```

## Related to

`CLEAR`, `CLOSE`, `OPEN`, `VARPTR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/MAXFILES"
