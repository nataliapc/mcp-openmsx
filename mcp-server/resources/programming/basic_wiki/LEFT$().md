# LEFT$()

## Effect

Returns a string corresponding to a specified number of the leftmost characters from an original string.

_Note: For strings with Japanese or Korean characters, you need to use `CALL KMID`._

## Syntax

`LEFT$("<String>",<Length>)`

## Parameters

`<String>` is a string of characters between double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

`<Length>` is a number between 0 and 255.

## Example

```basic
10 A$=LEFT$("MSX Forever!",3)
20 PRINT A$
 
RUN
MSX
```

## Related to

`CALL KMID`, `MID$`, `RIGHT$`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LEFT$()"
