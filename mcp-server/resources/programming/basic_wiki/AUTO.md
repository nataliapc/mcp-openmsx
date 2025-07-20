# AUTO

## Effect

Starts automatic line numbering.

This instruction is useful when you program a game or application in MSX-BASIC. A `*` (asterisk) character will indicate that a line number is already in use.

You can stop this operation mode by pressing `CTRL`+`C`.

## Syntax

`AUTO <LineStart>,<Increment>`

_Note: Each parameter is optional except the last specified. Do not put a comma after this parameter._

## Parameters

`<LineStart>` is a line number between 0 and 65529. (10 by default)

`<Increment>` is a number between 0 and 65529. When it is not specified, the lines of your program will be incremented in steps of 10.

## Example

```basic
AUTO 100,20
```

## Related to

`DELETE`, `LIST`, `LLIST`, `RENUM`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/AUTO"
