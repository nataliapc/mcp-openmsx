# ERL

## Effect

Returns the line number in which an error occured.

## Syntax

`ERL`

## Example

```basic
10 ON ERROR GOTO 50
20 MSX ' Generates an error, as "MSX" is not a valid MSX-BASIC command
30 END
50 PRINT "An error occurred in line ";ERL
60 RESUME 30
 
run
An error occurred in line 20
```

## Related to

`ERR`, `ERROR`, `ON ERROR GOTO`, `RESUME`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ERL"
