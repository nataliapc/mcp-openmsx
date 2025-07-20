# PAD()

## Effect

Returns several infos about different input devices: graphic tablet or touchpad, light pen, mouse or trackball.  With exception of the light pen that has its specific connector, all the mentioned devices can be connected to a joystick port.

_Notes:_
- infos about light pen are only available on MSX2 and MSX2+ (the support has been removed on MSX turbo R).
- infos about mouse or trackball are only available on MSX2 and higher.
- the button state of the mouse must be retrieved with the STRIG() instruction
 check also the following pages for more info: Touchpad, Light pen, Mouse/Trackball.

## Syntax

`PAD(<Number>)`

## Parameter

`<Number>` is a value:
- between 0 and 7 on MSX1 computers.
- between 0 and 19 on most MSX2 computers, all MSX2+ and MSX turbo R machines.
- between 0 and  23 on MSX2 computers manufactured by Daewoo (+ probably Sanyo MPC-X and Sanyo MPC-27).

You must always check the state of the graphic tablet, touchpad or light pen before trying to get the coordinates. Besides, the internal lightpen interface, present in some MSX2 computers, needs first to be enabled with `CALL ADJUST`. Another preliminary step is required for the mouse or the trackball.

|Number|Device|Joystick port|Returned info|
|:-:|---|:-:|---|
|0|Graphic Tablet / Touchpad|1|State of the device: -1 if the device is touched and 0 if not|
|1|´´|1|X-coordinate|
|2|´´|1|Y-coordinate|
|3|´´|1|State of the button: -1 if the button is pressed and 0 if not|
|4|´´|2|State of the device: -1 if the device is touched and 0 if not|
|5|´´|2|X-coordinate|
|6|´´|2|Y-coordinate|
|7|´´|2|State of the button: -1 if the button is pressed and 0 if not|
|8|Light Pen (external or built-in MSX1 interface)|-|State of the light pen: -1 if the light pen is ready and 0 if not (always 0 on MSX Turbo R)|
|9|´´|-|X-coordinate (always 0 on MSX Turbo R)|
|10|´´|-|Y-coordinate (always 0 on MSX Turbo R)|
|11|´´|-|State of the button: -1 if the button is pressed and 0 if not (always 0 on MSX Turbo R)|
|12|Mouse / Trackball|1|The X/Y-offset of the device is retrieved and can be queried by using `PAD(13)` and `PAD(14)`. The returned value of `PAD(12)` is always -1.|
|13|´´|1|X-offset (-128 to +127)|
|14|´´|1|Y-offset (-128 to +127)|
|15|´´|1|Always 0 (is reserved for mouse/trackball in joystick port 1, but has never been used)|
|16|´´|2|The X/Y-offset of the device is retrieved and can be queried by using `PAD(17)` and `PAD(18)`. The returned value of `PAD(16)` is always -1.|
|17|´´|2|X-offset (-128 to +127)|
|18|´´|2|Y-offset (-128 to +127)|
|19|´´|2|Always 0 (is reserved for mouse/trackball in joystick port 2, but has never been used)|
|20|Light Pen (internal MSX2 interface)<sup>(*)</sup>|1|State of the light pen: -1 if the light pen is ready and 0 if not|
|21|´´|1|X-coordinate|
|22|´´|1|Y-coordinate|
|23|´´|1|State of the button: -1 if the button is pressed and 0 if not|

<sup>(\*)</sup> Only with MSX2 computers manufactured by Daewoo:
- AVT CPC-300
- Bawareth Perfect MSX2
- Daewoo CPC-300
- Daewoo CPC-400
- Daewoo CPC-400S
- Talent DPC-300
- Wandy CPC-300

Maybe also with the Sanyo MPC-X Graphic Expander Unit and the Sanyo MPC-27 computer.

## Examples

```basic
10 SCREEN 2
20 A=0
30 IF PAD(0)=0 THEN 20
40 X=PAD(1):Y=PAD(2)
50 IF A=0 THEN PSET(X,Y) ELSE LINE-(X,Y)
60 A=1
70 GOTO 30
```
```basic
10 SCREEN 1
20 LOCATE 2, 4 : PRINT "MOUSE ON PORT 1: "; PAD(12);
30 LOCATE 2, 5 : PRINT "MOUSE 1 X: "; PAD(13); 
40 LOCATE 2, 6 : PRINT "MOUSE 1 Y: "; PAD(14);
50 LOCATE 2, 8 : PRINT "MOUSE ON PORT 2: "; PAD(16);
60 LOCATE 2, 9 : PRINT "MOUSE 2 X: "; PAD(17); 
70 LOCATE 2, 10 : PRINT "MOUSE 2 Y: "; PAD(18);
80 LOCATE 2, 12 : PRINT "MOUSE 1 BUTTON ";
90 IF STRIG(1) <> 0 THEN PRINT "PRESSED " ELSE PRINT "RELEASED"
100 IF STRIG(0) <> 0 THEN END
110 GOTO 20
```
```basic
10 SCREEN 1
20 A$=STRING$(8,255)
30 SPRITE$(0) = A$
40 PUT SPRITE 0,(100, 100),15,0
50 IF PAD(12) <> 0 THEN PUT SPRITE 0, STEP(PAD(13), PAD(14))
60 LOCATE 5, 12 : PRINT "MOUSE BUTTON ";
70 IF STRIG(1) <> 0 THEN PRINT "PRESSED " ELSE PRINT "RELEASED"
80 IF STRIG(0) <> 0 THEN END
90 GOTO 50
```

## Related to

`CALL ADJUST`, `INKEY$`, `PDL()`, `STICK()`, `STRIG()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PAD()"
