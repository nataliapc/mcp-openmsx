# PDL()

## Effect

Returns the position of asked paddle, connected to a joystick port. The returned position value can vary between 0 and 255.

_Notes:_
- Paddle controllers support is removed on MSX turbo R and these devices are unused on MSXPLAYer.
- See also MSX Paddle Controller for more information.

## Syntax

`PDL(<PaddleNumber>)`

## Parameter

`<PaddleNumber>` is a value between 1 and 12 to select the paddle controller to read. 

|Paddle controller number|Used general port|
|:--|:-:|
|1, 3, 5, 7, 9 or 11|1|
|2, 4, 6, 8, 10 or 12|2|

## Example

```basic
5 ' Sample program to use Paddle controllers 1 & 2 in port 1 & 2  
10 COLOR 15,1,1:SCREEN2,2
20 SPRITE$(0)=STRING$(6,CHR$(255))+STRING$(10,CHR$(0))+STRING$(6,CHR$(255))+STRING$(10,CHR$(0))
30 SPRITE$(1)=STRING$(16,CHR$(252))+STRING$(16,CHR$(0))
40 LINE(0,0)-(37,5),15,BF: LINE(218,0)-(255,5),15,BF
50 LINE(0,186)-(37,191),15,BF: LINE(218,186)-(255,191),15,BF
60 X=PDL(1):X2=PDL(3):Y=PDL(2):Y2=PDL(4)
70 IF X>162 THEN X=162
80 IF X2>162 THEN X2=162
90 IF Y>162 THEN Y=162
100 IF Y2>162 THEN Y2=162
110 PUTSPRITE 0,(X+39,-1): PUTSPRITE 2,(X2+39,185),,0
120 PUTSPRITE 1,(0,Y+6): PUTSPRITE 3,(250,Y2+6),,1
130 GOTO 60
```

## Related to

`INKEY$`, `PAD()`, `STICK()`, `STRIG()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PDL()"
