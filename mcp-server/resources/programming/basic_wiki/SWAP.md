# SWAP

## Effect

Exchanges the contents of two variables.

## Syntax

`SWAP <Variable1>, <Variable2>`

## Parameters

`<Variable1>` and `<Variable2>` are numeric variables, array variables or string variables.

Every type of variable (integer, single precision, double precision, string) can be used. The only restriction is that both variables are of the same type.

## Examples

```basic
10 X=3:Y=7
20 A$="PIERRE":B$="JEAN"
30 CLS
40 GOSUB 90
50 SWAP X,Y
60 SWAP A$,B$
70 GOSUB 90
80 END
90 PRINT "X=";X;"Y=";Y
100 PRINT
110 PRINT "A$=";A$;"  B$=";B$
120 PRINT
130 RETURN
 
RUN
X= 3 Y= 7

A$=PIERRE  B$=JEAN

X= 7 Y= 3

A$=JEAN  B$=PIERRE
```

SWAP can be used to swap values inside an array as well...

```basic
10 ' Move sprite to 8-directions by using cursor keys (by NYYRIKKI)
20 FORI=2TO8:XD(I)=SGN(5-I):YD(8-I)=XD(I):NEXT: SWAP YD(0),YD(8):SCREEN2,1:SPRITE$(0)="0HH0"
30 FORI=0TO1:S=STICK(J):I=-STRIG(J):X=X+XD(S):Y=Y+YD(S):PUTSPRITE0,(X,Y),8:NEXT
```

## Related to

`LET`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SWAP"
