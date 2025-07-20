# NEW

## Effect

Erases the MSX-BASIC program in memory, clears all variables and closes all open files.

This instruction is usually used to delete the program in computer memory before starting with a new MSX-BASIC program.

It can also disable the tracing of program execution, started with `TRON`.

_Note: If previous started MSX-BASIC program has executed instructions such as `CLEAR` or `MAXFILES`, the available memory is affected and will not be restored back to boot up defaults even if you execute `NEW`. If you get a 'No enough memory' error message, the best solution is to reboot the computer before launching another program._

## Syntax

`NEW`

## Related to

`CLEAR`, `CLOSE`, `DELETE`, `MAXFILES`, `TROFF`, `TRON`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/NEW"
