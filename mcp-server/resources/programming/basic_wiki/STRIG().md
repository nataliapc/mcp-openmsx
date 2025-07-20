# STRIG()

## Effect

Returns the state of the space key and the joystick/mouse/trackball buttons or enables/disables/stops the call to the subroutine when pressing of the space keys and the joystick/mouse/trackball buttons.

## Syntaxes

`STRIG(<ControllerNumber>)`

`STRIG(<ControllerNumber>) ON|OFF|STOP`

## Parameters

`<ControllerNumber>` is a number between 0 and 4 to define the controller used.

|Controller|Description|
|---|---|
|0|Space key|
|1|Button 1 of joystick/mouse/trackball in port 1|
|2|Button 1 of joystick/mouse/trackball in port 2|
|3|Button 2 of joystick/mouse/trackball in port 1|
|4|Button 2 of joystick/mouse/trackball in port 2|

`STRIG(<ControllerNumber>)` used alone returns -1 when the space key or the joystick/mouse button corresponding to the specified controller is pressed down. Otherwhise, the value is 0.

`STRIG(<ControllerNumber>)` used with `ON`, `OFF`, `STOP` is always combined with `ON STRIG GOSUB`.

With `ON`, the computer will check if the space key or the joystick/mouse button corresponding to the `<sticknumber>` is pressed down and the subroutine specified with `ON STRIG GOSUB` is executed immediately.

With `OFF`, this checking is disabled.

With `STOP`, the checking is made, but the execution of the subroutine specified with `ON STRIG GOSUB` will happen only when a `STRIG() ON` command is executed later in the program.

## Examples

```basic
10 PRINT "Hit the space key"
20 P=STRIG(0)
30 IF P=-1 THEN BEEP
40 GOTO 20
```

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
10 ON STRIG GOSUB 60, 90, 100, 110, 120
20 CLS
30 FOR I=0 TO 4: STRIG(I) ON: NEXT
40 PRINT"Press spacebar or a button joystick"
50 GOTO 50
60 PRINT"Spacebar";
70 PRINT" pressed"
80 RETURN
90 PRINT"Button 1 of joystick 1";:GOTO 70
100 PRINT"Button 1 of joystick 2";:GOTO 70
110 PRINT"Button 2 of joystick 1";:GOTO 70
120 PRINT"Button 2 of joystick 2";:GOTO 70
```

## Related to

`INKEY$`, `ON STRIG GOSUB`, `PAD()`, `PDL()`, `STICK()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/STRIG()"
