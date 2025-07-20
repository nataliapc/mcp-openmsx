# TAB()

## Effect

Inserts the amount of spaces needed to reach a variable position in a `PRINT` or `LPRINT` instruction.

## Syntax

`TAB(<Number>)`

## Syntax

`<Number>` is the position defined by a number between 0 and 255.

If the cursor has already reached the specified position on the same line, the function is ignored.

## Example

```basic
10 PRINT "MSX";TAB(10);"Forever!"
20 PRINT TAB(10);"www.msx.org"
 
RUN
MSX       Forever!
          www.msx.org
```

## Related to

`LPRINT`, `PRINT`, `SPACE$()`, `SPC()`, `STRING$()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/TAB()"
