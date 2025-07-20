# ERASE

## Effect

Frees memory by erasing one or more arrays.

## Syntax

`ERASE <ArrayVariable>,<ArrayVariable>...`

_Note: Parameters can not end with a comma alone._

## Parameter

`<ArrayVariable>` is an array of numeric variables or string variables (also named as alphanumeric variables) that has been created with the DIM instruction.

## Example

```basic
10 DIM A(100),X$(60)
…
500 ERASE A,X$
```

## Related to

`CLEAR`, `DIM`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ERASE"
