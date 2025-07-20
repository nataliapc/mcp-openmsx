# USR()

## Effect

This function calls a subroutine in machine language, passing a value to it. The location of the subroutine has to be defined first, using the `DEF USR` instruction.

The value goes into the system variable `DAC` (&HF7F6, 8 bytes), and its type to `VALTYP` (&HF663, 1 byte). The return value of the function is taken from the same variable, so if it's not modified by the machine language subroutine, it returns the same value that it's passed.

## Syntax

`USR<Number>(<Value>)`

## Parameters

`<Number>` is optional and can range from 0 to 9. When omitted, 0 is assumed.

`<Value>` is a value, a variable or a string that can be retrieved by the machine subroutine.

## Example

```basic
10 ' Example of USR function usage by NYYRIKKI
11 ''''''''''''''''''''''''''''''''''''''''''''''''''''
12 ' ML-Program to read PSG (See SOUND-command)
13 ''''''''''''''''''''''''''''''''''''''''''''''''''''
14 DATA"1E 05      LD E,5        ;Illegal function call
15 DATA"3A 63 F6   LD A,(#F663)  ;VALTYP
16 DATA"FE 02      CP 2          ;Integer type
17 DATA"C2 6F 40   JP NZ,#406F   ;Error handler
18 DATA"2A F8 F7   LD HL,(#F7F8) ;Input integer
19 DATA"7C         LD A,H
20 DATA"A7         AND A
21 DATA"C2 6F 40   JP NZ,#406F   ;>256 = ERROR
22 DATA"7D         LD A,L
23 DATA"FE 10      CP 16
24 DATA"D2 6F 40   JP NC,#406F   ;>15 = Error
25 DATA"CD 96 00   CALL #96      ;Read PSG
26 DATA"32 F8 F7   LD (#F7F8),A  ;Return value
27 DATA"C9         RET
28 ''''''''''''''''''''''''''''''''''''''''''''''''''''
29 ' Put program to memory
30 ''''''''''''''''''''''''''''''''''''''''''''''''''''
31 DEFINT A-Z:AD=&HC000
32 READ A$:P=1
33 B$=MID$(A$,P,2):IF B$="  " THEN 32 ELSE P=P+3
34 POKE AD,VAL("&H"+B$):AD=AD+1:IF B$<>"C9" THEN 33
35 ''''''''''''''''''''''''''''''''''''''''''''''''''''
36 ' Example of how to use USR function
37 ''''''''''''''''''''''''''''''''''''''''''''''''''''
38 DEFUSR=&HC000 ' This defines USR() start address
39 PLAY"CDE"
40 X=USR(0)+USR(1)*256:IF OX<>X THEN PRINT X:OX=X
41 IF INKEY$="" THEN 40
```

## Related to

`DEF USR`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/USR()"
