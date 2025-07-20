# DATA

## Effect

Stores data in a program (e.g. graphics), to be read with the `READ` instruction.

_Note: Unlike the other BASIC instructions, `DATA` doesn't need to be executed by the interpreter. Data is stored at the same time as the program is entered. You can therefore group the `DATA` at the end of the program._

## Syntax

`DATA <Data>,<Data>...`

_Note: Parameters can not end with a comma alone._

## Parameter

`<Data>` is a value or a character string. We can put several `<Data>` separated by a comma.

All data types are allowed. Strings only have to be enclosed in double quotes `"` if they contain commas, colons or leading or trailing spaces.

## Example

```basic
10 READ A$
20 PRINT A$
30 READ A,B
40 PRINT A
50 PRINT B
60 DATA "TEST",10,20
 
RUN
TEST
 10
 20
```

## Related to

`READ`, `RESTORE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DATA"
