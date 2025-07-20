# CLS

## Effect

Clears the screen in any 'standard' screen mode with the last background color specified and resets the cursor coordinates for text.

When used with _Delta BASIC_, it can also clear the content of a window.

_Notes:_
- In text mode, the text of function keys displayed by `KEY ON` stays on screen.
- The sprites stay on screen as is.
- To clear the screen in `KANJI` text modes, you need to use `CALL CLS`. This command can also be useful in `SCREEN 9` when the screen is not correctly cleared with `CLS`.

## Syntaxes

`CLS`

`CLS #<WindowNumber>` (only with _Delta BASIC_) - As alternative, you can also use `FILL#<WindowNumber>,32`

## Parameter (Delta BASIC)

`<WindowNumber>` is a number between 1 and 9. It must always be preceded by `#` and correspond to a window previously defined with the `WINDOW` instruction.

## Example (Delta BASIC)

```basic
10 SCREEN0:KEYOFF:WIDTH40
20 WINDOW#1,1,1,38,3
30 WBOX#1
40 FILL#1,78
50 FOR I=1 TO 100: NEXT I
60 CLS#1
```

`CLS#1` can be replaced by `FILL#1,32`

## Related to

Standard instruction: `CALL CLS`, `COLOR`, `KEY`, `SCREEN`

Delta BASIC: `FILL`, `WINDOW`

## Compatibility

MSX-BASIC 1.0 or higher

Delta BASIC

## Source

Retrieved from "https://www.msx.org/wiki/CLS"
