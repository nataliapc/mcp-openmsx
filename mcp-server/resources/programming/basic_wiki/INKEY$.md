# INKEY$

## Effect

Returns either a single character read from the keyboard or (if no key is pressed) an empty string.

This instruction can be combined with `CHR$()` to check if a specific key has been pressed. It's useful not only for the alphanumeric keys, but also the cursor keys, the spacebar or another special key.

However, if you want to make your game or application compatible with joysticks, it's better to directly use the `STICK()` and `STRIG()` instructions.

## Syntax

`INKEY$`

## Special keys common to all MSX machines

|Code for CHRS()|Key|Alternative <sup>*</sup>|
|:-:|:-:|:--|
|8|BS||
|9|TAB||
|11|HOME||
|12|CLS||
|13|RETURN||
|18|INS||
|24|SELECT||
|27|ESC||
|28|→|`STICK(n) = 3`|
|29|←|`STICK(n) = 7`|
|30|↑|`STICK(n) = 1`|
|31|↓|`STICK(n) = 5`|
|32|SPACE|`STRIG(n) = -1`|
|127|DEL||

<sup>(*)</sup> n is a value between 0 and 2 for `STICK()`, 0 and 4 for `STRIG()`

## Examples

```basic
10 A$=INKEY$
20 IF A$="" THEN 10
30 PRINT "You pressed ";A$;" - CHR$(";ASC(A$);")"
 
RUN
You pressed M - CHR$( 77 )
```

_Note: The result will be an 'empty' character with some special keys._

```basic
10 A$=INKEY$
20 IF A$=CHR$(28) THEN 30 ELSE 10
30 PRINT "You pressed the key to move the cursor to the right"
```

## Related to

`CHR$()`, `INPUT$`, `STICK()`, `STRIG()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/INKEY$"
