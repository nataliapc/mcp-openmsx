# STOP

## Effect

Stops the execution of a program.

Enables/Disables/Stops calling to a subroutine by simultaneous pressing of `CTRL`+`STOP`.

## Syntaxes

`STOP`

`STOP ON|OFF|STOP`

## Parameters

Used without parameter, `STOP` is not required if the last line of the program has been reached by the BASIC interpreter. If this is not the case, then `STOP` is used as a break in the program and you can enter the `CONT` instruction to continue the program execution on the next line.

`STOP` used with `ON`, `OFF`, `STOP` is always combined with `ON STOP GOSUB`.

With `STOP ON`, the computer will check if the `CTRL` and `STOP` keys are pressed simultaneously and the subroutine specified with `ON STOP GOSUB` is executed immediately.

With `STOP OFF`, this checking is disabled.

With `STOP STOP`, the checking is made, but the execution of the subroutine specified with `ON STOP GOSUB` will happen only when a `STOP ON` instruction is executed later in the program.

_Remark: With `ON STOP GOSUB`, `STOP ON` and `RETURN` (see the third example), it is possible to prevent the exit from the program with `CTRL`+`STOP`. However, if you have enabled a Debug warm start with `POKE &HFBB0,1` (for example in line 20), the user will be able to re-start MSX-BASIC by pressing simultaneously `CTRL`+`SHIFT`+`GRAPH`+`CODE`/`KANA`._

## Examples

```basic
10 PRINT "Test"
20 STOP
30 PRINT "CONT was used"
40 END
```

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

## Related to

`CONT`, `END`, `ON STOP GOSUB`, `RUN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/STOP"
