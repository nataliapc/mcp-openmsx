# ON STRIG GOSUB

## Effect

Defines a subroutine to execute when the space key or a joystick/mouse button is pressed down.

This 'rule' is activated only when the checking of the space key or the joystick/mouse button is enabled.

## Syntax

`ON STRIG GOSUB <LineNumber>,<LineNumber>,<LineNumber>...`

Each parameter is optional.

## Parameters

`<LineNumber>` is a program line number of your subroutine. Each line number after `ON STRIG GOSUB` refers to a number according the triggers status. Triggers can be the space key or a joystick button/mouse (see table below).

|STRIG number|Description|
|---|---|
|0|Space key|
|1|Button 1 of joystick/mouse in port 1|
|2|Button 1 of joystick/mouse in port 2|
|3|Button 2 of joystick/mouse in port 1|
|4|Button 2 of joystick/mouse 2 in port 2|

The subroutines must be terminated with the `RETURN` instruction.

## Examples

```basic
10 ON STRIG GOSUB 80 : STRIG(0) ON
20 CLS: PRINT "SPACEBAR ROUTINE ENABLED"
30 FOR I = 1 TO 2000 : NEXT
40 STRIG(0) OFF
50 PRINT: PRINT "SPACEBAR ROUTINE DISABLED"
60 FOR I = 1 TO 2000 : NEXT
70 STRIG(0) ON : GOTO 20
80 PRINT: PRINT "SPACEBAR PRESSED DOWN"
90 FOR I = 1 TO 2000 : NEXT
100 RETURN 70
```

```basic
10 FOR I = 0 TO 4: STRIG(I) ON: NEXT
20 ON STRIG GOSUB 90, 100, 110, 120, 130
30 CLS
40 PRINT"Press spacebar or a button joystick"
50 PRINT
60 GOTO 80
70 PRINT " pressed"
80 GOTO 80
90 PRINT "Spacebar";:RETURN 70
100 PRINT "Button 1 of joystick 1";:RETURN 70
110 PRINT "Button 1 of joystick 2";:RETURN 70
120 PRINT "Button 2 of joystick 1";:RETURN 70
130 PRINT "Button 2 of joystick 2";:RETURN 70
```

## Related to

`PAD()`, `RETURN`, `STRIG()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ON_STRIG_GOSUB"
