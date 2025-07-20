# ON STOP GOSUB

## Effect

Defines a subroutine to execute when CTRL+STOP is pressed down.

This 'rule' is activated only when the checking of the simultaneous pressing of `CTRL`+`STOP` is enabled.

## Syntax

`ON STOP GOSUB <LineNumber>`

## Parameter

`<LineNumber>` is a program line number of your subroutine. The subroutine must be terminated with the `RETURN` instruction.

## Examples

```basic
10 ON STOP GOSUB 100 : STOP ON
20 CLS: PRINT "ON STOP ENABLED"
30 FOR I = 1 TO 2000 : NEXT
40 STOP OFF
50 PRINT: PRINT "ON STOP DISABLED"
60 FOR I = 1 TO 2000 : NEXT
70 STOP ON : GOTO 20
80 PRINT: INPUT A$
90 IF A$="END" THEN STOP OFF:END ELSE 80
100 PRINT "Enter END and press Return":RETURN 80
```
```basic
10 ON STOP GOSUB 100 : STOP ON
…
30 CLS
…
90 GOTO 30
100 RETURN
```

## Using

This instruction can be useful for inserting surprises in a program or for testing when developing the program.

With `ON STOP GOSUB`, `STOP ON` and `RETURN`, as in the second example, it is possible to prevent the exit from the program with `CTRL`+`STOP`. However, if you have enabled a Debug warm start with `POKE &HFBB0,1` (using system variable ENSTOP for example in line 20), the user will be able to re-start MSX-BASIC by pressing simultaneously `CTRL`+`SHIFT`+`GRAPH`+`CODE`/`KANA`.

## Related to

`RETURN`, `STOP`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ON_STOP_GOSUB"
