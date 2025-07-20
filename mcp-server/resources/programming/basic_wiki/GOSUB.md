# GOSUB

## Effect

Calls a subroutine located on the specified line number.

The subroutine must be terminated with the `RETURN` instruction, to resume program execution with the instruction specified directly after `GOSUB` (on the same line or the next line), except if `RETURN` is followed by a line number.

## Syntax

`GOSUB <LineNumber>`

## Parameter

`<LineNumber>` is a program line number of your subroutine.

## Example

```basic
10 GOSUB 100
20 PRINT "Now it's my turn!"
30 END
100 PRINT "Me first!"
110 RETURN
 
RUN
Me first!
Now it's my turn!
```

## Related to

`GOTO`, `ON...GOSUB`, `ON INTERVAL GOSUB`, `ON KEY GOSUB`, `ON SPRITE GOSUB`, `ON STOP GOSUB`, `ON STRIG GOSUB`, `RETURN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/GOSUB"
