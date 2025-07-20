# LEN()

## Effect

Returns the length of a string, including all non-printable characters.

_Note: For strings with Japanese or Korean characters, you need to use `CALL KLEN`._

## Syntax

`LEN("<String>")`

## Parameter

`<String>` is a string of characters between double quotes `"`. It can include non-printable characters and be replaced by a string variable (also named as alphanumeric variable).

## Examples

```basic
PRINT LEN("MSX")
 3
A$="MSX":PRINT LEN(A$)
 3
```

## Related to

`CALL KLEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LEN()"
