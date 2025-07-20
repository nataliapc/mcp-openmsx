# STRING$()

## Effect

Returns a string with a variable length, all containing either the same character, which is defined as an ASCII code or the first character of a string.

## Syntaxes

`STRING$(<Length>,<CodeNumber>)`

`STRING$(<Length>,"<String>")`

## Parameters

`<Length>` It is the length of the string and must be an integer in range between 0 and 255.

`<CodeNumber>` must be an ASCII code between 32 and 255.

`<String>` is a string of characters between double quotes `"`. It can be replaced by a string variable (also named as alphanumeric variable).

## Example

```basic
10 PRINT STRING$(8,65)
20 PRINT STRING$(8,"MSX")
 
RUN
AAAAAAAA
MMMMMMMM
```

## Related to

`ASC()`, `CHR$()`, `SPACE$()`, `SPC()`, `TAB()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/STRING$()"
