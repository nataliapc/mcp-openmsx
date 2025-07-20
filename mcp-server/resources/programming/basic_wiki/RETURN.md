# RETURN

## Effect

Returns from a subroutine that was invoked by `GOSUB`.

## Syntax

`RETURN <LineNumber>`

## Parameter

`<LineNumber>` if the number of the line on which the program will return when the execution of the subroutine is finished.

If you don't specify the line number, the program will return to the instruction directly after `GOSUB`.

## Examples

```basic
90 ' RETURN without line
100 PRINT "Hello"
110 GOSUB 200
120 END
200 PRINT "Here am I"
210 RETURN
```

```basic
90 ' RETURN with line for infinite loop
100 PRINT "Hello"
110 GOSUB 200
120 END
200 PRINT "Here am I"
210 RETURN 100
```

## Related to

`GOSUB`, `ON...GOSUB`, `ON INTERVAL GOSUB`, `ON KEY GOSUB`, `ON SPRITE GOSUB`, `ON STOP GOSUB`, `ON STRIG GOSUB`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/RETURN"
