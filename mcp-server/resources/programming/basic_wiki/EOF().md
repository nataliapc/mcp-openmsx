# EOF()

## Effect

Returns whether or not the end of a file has been reached.

Value of `EOF` is zero while the end of the open file is not reached.

## Syntax

`EOF(<Number>)`

## Parameter

`<Number>` corresponds to the number assigned to the file opened with the `OPEN` instruction.

## Example

```basic
10 OPEN "CAS:DATA" FOR INPUT AS #1
20 IF EOF(1) THEN 40
30 INPUT#1,X$,Y$,Z$ : PRINT X$,Y$,Z$ : GOTO 20
40 CLOSE#1 : END
```

## Related to

`CLOSE`, `INPUT`, `OPEN`, `PRINT`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/EOF()"
