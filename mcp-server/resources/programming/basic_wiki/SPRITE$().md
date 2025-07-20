# SPRITE$()

## Effect

Defines a sprite's outlook (also known as 'pattern') and works like a regular 1-dimensional string array.

It can also be used to return the sprite's pattern data in the form of a string.

## Syntaxes

`SPRITE$(<PatternNumber>)=<String>`

`SPRITE$(<PatternNumber>)`

## Parameters

`<PatternNumber>` is a number ranging from 0 to 63 (for sprite size 16x16) or to 255 (for sprite size 8x8) that specifies the sprite pattern number.

`<String>` is a string of 8 or 32 characters according the sprites size (8x8 or 16x16).

Each character represents an 8x1 area in the sprite where "1"-bits represent visible dots and "0"-bits represent invisible dots. 

The characters are given in order from up to down and left to right. Upper left corner in 16x16 sprite is therefore bit 7 of character 1, bottom right corner is bit 7 of character 16, upper right corner is bit 0 of character 17 and bottom right corner is bit 0 of character 32.

In case defined the string is shorter than required (8 or 32 characters) the rest of the sprite string is filled with 0.

## Example

```basic
10 COLOR 15,1,7: SCREEN 2,0
20 B$=""
30 FOR I=0 TO 7: READ A: B$=B$+CHR$(A): NEXT
40 SPRITE$(0)=B$
50 PUT SPRITE 0, (100,100),15,0
60 A$=INPUT$(1)
70 SCREEN 1: PRINT SPRITE$(0)
80 DATA 24,60,126,255,36,36,66,129
```

## Related to

`CHR$()`, `COLOR SPRITE()`, `COLOR SPRITE$()`, `ON SPRITE GOSUB`, `PUT SPRITE`, `SPRITE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SPRITE$()"
