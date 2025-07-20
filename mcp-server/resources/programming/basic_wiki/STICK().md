# STICK()

## Effect

Returns the direction of the cursor keys or the joysticks.

## Syntax

`STICK(<ControllerNumber>)`

## Parameter

`<ControllerNumber>` is a value between 0 and 2 to define the controller used.

|Controller|Description|
|---|---|
|0|Cursor keys|
|1|Joystick 1|
|2|Joystick 2|

## Returned values 

|Value|Description|
|---|---|
|0|Inactive|
|1|Up|
|2|Up + Right|
|3|Right|
|4|Down + Right|
|5|Down|
|6|Down + Left|
|7|Left|
|8|Up + Left|

## Examples

```basic
10 PRINT "Press the cursor keys"
20 PRINT STICK(0)
30 FOR I=0 TO 300:NEXT I
40 GOTO 20
```

```basic
10 ' Move sprite to 8-directions by using cursor keys (by NYYRIKKI)
20 FORI=2TO8:XD(I)=SGN(5-I):YD(8-I)=XD(I):NEXT: SWAP YD(0),YD(8):SCREEN2,1:SPRITE$(0)="0HH0"
30 FORI=0TO1:S=STICK(J):I=-STRIG(J):X=X+XD(S):Y=Y+YD(S):PUTSPRITE0,(X,Y),8:NEXT
```

```basic
10 ' Move sprite to 8-directions by using cursor keys
20 SCREEN2,1: SPRITE$(0)="0HH0": FORS=1TO8: READ X(S),Y(S):NEXT
30 S=STICK(0): Y=Y+Y(S): X=X+X(S)
40 IF Y<0 THEN Y=0 ELSE IF Y>183 THEN Y=183
50 IF X<0 THEN X=0 ELSE IF X>246 THEN X=246
60 PUTSPRITE0,(X,Y),8: IF NOTSTRIG(0)GOTO30
70 DATA 0,-2,2,-2,2,0,2,2,0,2,-2,2,-2,0,-2,-2
```

## Related to

`INKEY$`, `ON...GOTO`, `ON...GOSUB`, `PAD()`, `PDL()`, `STRIG()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/STICK()"
