# LIST

## Effect

Displays the program, or a part of it, in memory on screen. 

## Syntaxes

`LIST <LineNumber>`

`LIST <StartLineNumber>-<EndLineNumber>`

## Parameters

`<LineNumber>` specifies the number of the line that you want to display.

`<StartLineNumber>` specifies the number of the first line that you want to display. First line of the program by default.

`<EndLineNumber>` specifies the number of the last line that you want to display.
Without any parameter, the entire program will be displayed.

A dot `.` can replace one of the parameters. In this case it takes the last executed line number. It is useful especially after an error message.

If you specify line numbers that don't exist, the computer will not display an error message, it will display the eventually existing lines between the specified start line and end line.

## Example

```basic
LIST 10-30
10 FOR I=1 TO 5
20 PRINT I
30 NEXT I
```

```basic
RUN
Syntax error in 20
Ok

LIST .
20 PRIINT I

LIST .-
20 PRIINT I
30 NEXT I
```

## Related to

`AUTO`, `DELETE`, `LLIST`, `RENUM`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LIST"
