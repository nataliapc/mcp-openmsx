# STR$()

## Effect

Returns a string representation of a numeric variable.

## Syntax

`STR$(<Value>)`

## Parameter

`<Value>` must be an expression, a numeric variable or a value.

## Example

```basic
10 A$=STR$(1.23)
20 PRINT A$
30 PRINT LEFT$(A$,2)
 
RUN
 1.23
 1
```

## Related to

`VAL`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/STR$()"
