# ASC()

## Effect

Returns the ASCII value of a character.

_Remark: It will always return the value 1 for the characters 0 to 31 without giving the second value associated to these characters._

## Syntax

`ASC(<Character>)`

# Parameter

`<Character>` is a character between quotation mark. It can also be a string or an alphanumeric variable but only the 1st character will be taken into account.

## Example

```basic
10 PRINT "The ASCII value of B is ";ASC("B")
20 PRINT "The ASCII value of MSX is ";ASC("MSX")
 
RUN
The ASCII value of B is 66
The ASCII value of MSX is 77
```

## Related to

`CHR$()`, `STRING$()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ASC()"
