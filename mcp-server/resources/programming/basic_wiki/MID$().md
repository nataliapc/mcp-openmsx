# MID$()

## Effect

`MID$` is kind of special as it can be used both as function or as instruction: 

As function, it returns a string corresponding to a specified number of characters from an original string, this from a specified position.

As instruction, it can replace a substring by another string.

_Note: For strings with Japanese or Korean characters, you need to use `CALL KMID`._

## Syntaxes

### Function Syntax

`MID$("<String1>",<Start>,<Length>)`

### Instruction Syntax

`MID$("<String1>",<Start>,<Length>)="<String2>"`

## Parameters

`<String1>` and `<String2>` are strings of characters between double quotes `"`. They can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

`<String2>` will be used as replacement substring when `MID$` is used as instruction.

`<Start>` is the starting position in the string to extract or replace the substring. The first character in the string is numbered 1. The highest possible position is 255.

When `<Start>` = 1, `MID$` function replaces the `LEFT$` function - Example: `MID$(A$,1,3)` is equivalent to `LEFT$(A$,3)`.

When `<Start>` = `LEN(A$)-<Length>+1`, `MID$` function replaces the `RIGHT$` function - Example: If `LEN(A$)=5` then `MID$(A$,4,2)` is equivalent to `RIGHT$(A$,2)`.

`<Length>` is a number between 0 and 255. When is omitted, it will default to the remainder of the string to return a result or make the replacement.

## Examples

### MID$ as function
```basic
10 A$="www.msx.org"
20 PRINT MID$(A$,5,3)
30 PRINT MID$(A$,5)
 
RUN
msx
msx.org
```

### MID$ as instruction
```basic
10 A$="ABCDEFG"
20 PRINT A$
30 MID$(A$,4)="XYZ"
40 PRINT A$
 
RUN
ABCDEFG
ABCXYZG
```

## Related to

`CALL KMID`, `LEN`, `LEFT$`, `RIGHT$`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/MID$()"
