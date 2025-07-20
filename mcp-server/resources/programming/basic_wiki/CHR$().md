# CHR$()

## Effect

Converts a value to the corresponding MSX character.

## Syntax

`CHR$(<CodeNumber>)`

_Notes:_
- Used in instruction `PRINT` you can display 32 extended graphic characters by adding `CHR$(1)` before the character with a code number between 64 and 95. (see example below for use and see this page for details of codes).
- It can be combined with `INKEY$` to detect if a specific key has been pressed; it's useful not only for the alphanumeric keys, but also the special keys.

## Parameter

`<CodeNumber>` is the code number of a character between 0 and 255. (See this page about codes description).

According the localisation of the used MSX computer or the used mode on Arabic machines, the results can vary.

_Note: In Kanji modes, this instruction is limited to the characters 33 to 128, 161 to 223, 253 and 254, and the character displayed for `CHR$(128)`, `CHR$(253)` and `CHR$(254)` is not correct in Kanji modes 0 and 2 (bug in Kanji BASIC?)_

## Examples

```basic
10 PRINT "The character with ASCII code 67 is ";CHR$(67)
20 PRINT "I like ";CHR$(77);CHR$(83);CHR$(88)
 
RUN
The character with ASCII code 67 is B
I like MSX
```
```basic
5 'How to print an extended graphic character
10 PRINT CHR$(1);CHR$(65);
20 PRINT CHR$(1)+CHR$(66)
```

The printed character will be a smiling face on European machines and a kana on Japanese machines.

## Related to

`ASC()`, `INKEY$`, `PRINT`, `STRING$()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CHR$()"
