# ON SPRITE GOSUB

## Effect

Defines a subroutine to execute when two or more sprites have collided on screen.

This 'rule' is activated only when the handling is enabled with `SPRITE` instruction.

## Syntax

`ON SPRITE GOSUB <LineNumber>`

## Parameter

`<LineNumber>` is a program line number of your subroutine. The subroutine must be terminated with the `RETURN` or `END` instruction.

## Example

```basic
10 SCREEN5
15 ON SPRITE GOSUB 80: SPRITE ON 'Enable colision for all sprites
20 SPRITE$(0)=STRING$(8,255)
30 PUTSPRITE 0,(50,50),10,0
40 PUTSPRITE 1,(54,54),38,0 ' 38 is color 6 + &B0100000 to disable collision for sprite 1
50 IF NOT STRIG(0) GOTO 50 'Press Space to enable OR operator
60 COLOR SPRITE(1)=79 ' 79 is color 15 + &B1000000 to enable OR operation
70 GOTO 70
80 SCREEN 0: PRINT"Sprite collision OK": BEEP: END
```

## Related to

`END`, `PUT SPRITE`, `RETURN`, `SPRITE`, `SPRITE$()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ON_SPRITE_GOSUB"
