# ON ERROR GOTO

## Effect

Jumps to a specified line of an error handling routine, whenever an eror occurs.

It's useful in the following situations:
- for defined errors in MSX-BASIC and Disk Basic, you want to avoid the display of the error messages.
- for non-defined errors, you decide to define them and to handle them directly in your program.

## Syntax

`ON ERROR GOTO <LineNumber>`

## Parameter

`<LineNumber>`  is a program line number of your error handling routine. The subroutine must be terminated with the `RESUME` instruction.

If you execute `ON ERROR GOTO` with 0 as line number, it cancels the effect of the `ON ERROR GOTO` executed previously, stops the execution of the program and displays the error in progress. Placed alone in the last line of your program, this will have the effect of disabling the error handling routine of your program when execution is interrupted.

_Note:_  
Take care to handle errors properly otherwise your program will behave weirdly. Error handling is not disabled when the program execution is ended or stopped except if you put `ON ERROR GOTO 0` alone in the last line of your program. `CLEAR`, `NEW` and `RUN` also disables the effect of the `ON ERROR GOTO` executed previously.

## Examples

If you create the file named "MYDISK" for example with `BSAVE"MYDISK",0,0,S` the following program will be able to detect if this is your disk that is inserted or not.

```basic
10 ON ERROR GOTO 1000
20 BLOAD"MYDISK",S
30 PRINT"This is the right disk. :)"
40 END
1000 IF ERL<>20 THEN ON ERROR GOTO 0
1010 IF ERR=70 THEN PRINT"Insert a disk!"
1020 IF ERR=53 THEN PRINT"This disk is not the right one!"
1030 RESUME 40
```
Alternate code with the same effect:
```basic
10 ON ERROR GOTO 1000
20 BLOAD"MYDISK",S
30 PRINT"This is the right disk. :)"
40 END
1000 IF ERL<>20 THEN 1040
1010 IF ERR=70 THEN PRINT"Insert a disk!"
1020 IF ERR=53 THEN PRINT"This disk is not the right one!"
1030 RESUME 40
1040 ON ERROR GOTO 0
```

## Related to

`ERL`, `ERR`, `ERROR`, `RESUME`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ON_ERROR_GOTO"
