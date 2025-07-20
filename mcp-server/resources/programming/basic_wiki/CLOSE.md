# CLOSE

## Effect

Closes one or more opened files and frees corresponding I/O buffer(s). 

## Syntax

`CLOSE #<Number1>,#<Number2>...`

_Note: Parameters can not end with a comma alone._

## Parameters

`#` is optional and can be omitted.

`<Number1>`, `<Number2>`... correspond to the numbers assigned to the files opened with the `OPEN` instruction.

Without using parameters, all opened files are closed.

If it concerns a file opened on a linked computer, the `EOF` character is sent.

## Example

```basic
10 MAXFILES=2
20 OPEN "CAS:DEMO" FOR INPUT AS #1
30 OPEN "LPT:" FOR OUTPUT AS #2
40 INPUT #1,A$
50 PRINT #2,A$
60 CLOSE #1,#2
```

## Related to

`CLEAR`, `END`, `EOF`, `MAXFILES`, `OPEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CLOSE"
