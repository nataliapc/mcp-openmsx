# RENUM

## Effect

Renumbers the lines of a program in memory, including all references to these lines by `GOSUB`, `GOTO`, etc.

The renumbered value is based on the new line number which has been changed due to the re-ordering. If a non-existing line number is recognized the error _"Undefined line XX in YY"_ is raised. So, it can be a way to find errors in your program.

## Syntax

`RENUM <NewLineNumber>,<CurrentLineNumber>,<Increment>`

Parameters can not end with a comma alone.

## Parameters

`<NewLineNumber>` specifies the line number that will be used as first number in the renumbered part of your program.  it is a number between 0 and 65529. (10 by default).

`<CurrentLineNumber>` specifies the current line number from which renumbering should start.

When this parameter is not specified, the default line number corrresponds to the first line of your program.

If you specify a current line number than the new line number must be greater than any of the line numbers that will not be renumbered. In other words, `RENUM` cannot be used to change the order of the program.

If you specify an old line number that does not exist, `RENUM` will be executed from the first line number that he will find after the non-existing line number.

`<Increment>` is a number between 0 and 65529. When it is not specified, the lines of your program will be incremented in steps of 10.

## Examples

Assuming the following program for all of the examples:

```basic
12 PRINT "HELLO"
34 PRINT "WORLD"
56 GOTO 12
```

```basic
RENUM
LIST
10 PRINT "HELLO"
20 PRINT "WORLD"
30 GOTO 10
```
```basic
RENUM 100
LIST
100 PRINT "HELLO"
110 PRINT "WORLD"
120 GOTO 100
```
```basic
RENUM 0,,1
LIST
0 PRINT "HELLO"
1 PRINT "WORLD"
2 GOTO 0
```
```basic
RENUM 20,34
LIST
12 PRINT "HELLO"
20 PRINT "WORLD"
30 GOTO 12
```

## Related to

`AUTO`, `DELETE`, `ELSE`, `LIST`, `LLIST`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/RENUM"
