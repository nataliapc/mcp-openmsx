# DELETE

## Effect

Erases part of an MSX-BASIC program from memory.

## Syntaxes

`DELETE <LineNumber>`

`DELETE <StartLineNumber>-<EndLineNumber>`

## Parameters

`<LineNumber>` specifies the number of the line that you want to delete.

`<StartLineNumber>` specifies the number of the first line that you want to delete in your program.

`<EndLineNumber>` is optional and specifies the number of the last line to be deleted.
A period `.` as a parameter specifies the last line `LIST`ed or `RUN`ed.

If you specify a line number that does not exist, an _"Illegal function call"_ error message will be displayed.

_Notes:_
- To delete only one line of your program, you can also enter the number of this line without any instruction. If you do that with a line number that does not exist, an _"Undefined line number"_ error message will be displayed.
- To delete all the lines of your program, it's easier and better to use `NEW` as it will simultaneously clear all variables and close all open files.

## Example

```basic
10 PRINT "Haha! I am here to stay!"
20 PRINT "Oh no! I will be sent to oblivion!"
 
DELETE 20
RUN
Haha! I am here to stay!
```

## Related to

`AUTO`, `LIST`, `LLIST`, `NEW`, `RENUM`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DELETE"
