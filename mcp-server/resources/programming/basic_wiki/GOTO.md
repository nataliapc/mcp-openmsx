# GOTO

## Effect

Jumps to the specified line number and executes the instructions from there.

## Syntaxes

`GOTO <LineNumber>`

`GO TO <LineNumber>`

## Parameter

`<LineNumber>` is a line number of your MSX program.

## Example

```basic
10 GOTO 100
20 PRINT "Now it's my turn!"
30 END
100 PRINT "Me first!"
110 GOTO 20
 
RUN
Me first!
Now it's my turn!
```

## Related to 

`GOSUB`, `ON...GOTO`, `ON ERROR GOTO`

## Compatibility 

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/GOTO"
