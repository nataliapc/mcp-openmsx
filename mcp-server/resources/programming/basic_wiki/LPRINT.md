# LPRINT

## Effect

Prints and formats text and numbers to a printer connected to the standard MSX parallel port.

_Notes:_
- Contrary to `PRINT`, you can't shorten `LPRINT` to "L?" Doing this will cause a very hard to find problem. The listing will look fine, but it will still cause a _"Syntax error"_.
- In case you have done that you can list the lines to the screen and push the `RETURN` key on top of the lines to fix these errors.

## Syntax

`LPRINT USING <ItemFormat>; <Item>;<Item>...`

## Parameters

`<Item>` can be a character string, an expression, a variable or a value to print. All four items types can be mixed freely.

Items must be separated by `;`. If the last item does not end to `;` then `CR`+`LF` combination is printed.

A comma can replace a `;` to separate the items. In case of `,` they are separated by tabulator instead of a space.

`<Item>` can be omitted to print an empty line.

`USING <ItemFormat>;` is optional. `<ItemFormat>` is a string that defines how the next items to be printed must be formatted. When `USING` is used the type of following usable items depends on the specified format.

`<Item>` and `<ItemFormat>` are exactly same as with `PRINT` instruction. Please see documentation there.

## Example

```basic
10 ' Initialize Epson compatible printer and select NLQ Sans Serif font:
20 SCREEN ,,,,1:LPRINT CHR$(27);"@";CHR$(27);"k1";
```

## Related to

`LFILES`, `LLIST`, `LPOS()`, `PRINT`, `SCREEN`, `SPC()`, `TAB()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LPRINT"
