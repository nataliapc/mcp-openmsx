# LLIST

## Effect

Sends the program, or a part of it, in memory to the printer.

## Syntaxes

`LLIST <LineNumber>`

`LLIST <StartLineNumber>-<EndLineNumber>`

## Parameters

`<LineNumber>` specifies the number of the line that you want to print.

`<StartLineNumber>` specifies the number of the first line that you want to print. First line of the program by default.

`<EndLineNumber>` specifies the number of the last line that you want to print.

Without any parameter, the entire program will be printed.

A dot `.` can replace one of the parameters. In this case it takes the last executed line number. It is useful especially after an error message.

If you specify line numbers that don't exist, the computer will not display an error message, it will print the eventually existing lines between the specified start line and end line.

## Example

```basic
LLIST 10-30
```

## Related to

`AUTO`, `DELETE`, `LIST`, `RENUM`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LLIST"
