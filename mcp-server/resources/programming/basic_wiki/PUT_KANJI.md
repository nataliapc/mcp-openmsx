# PUT KANJI

## Effect

Displays kanji on graphic screen (only screen modes 5 to 8 and 10 to 12).

## Syntax

`PUT KANJI STEP(<X>,<Y>),<JIScode>,<Color>,<Operator>,<Mode>`

## Parameters

`<X>` is coordinate X of destination. (0-255/511).

`<Y>` is coordinate Y of destination. (0-211).

The coordinates (with the parentheses) can be omitted only if there are parameters behind.

If `STEP` is used before these coordinates, they are interpreted relative to the current cursor position. In this case the values can also be negative.

`<JIScode>` is the JIS code corresponding to a character from the Kanji-ROM. (&H2120～&H4F53 for Level 1, and &H5020～&H7424 for Level 2).

`<Color>` is the color code = 0 to 15 (screens 5, 7 and 10), 0 to 3 (screen 6), 0 to 255 (screens 8, 11 and 12).

`<Operator>` is the logical operation to be performed between the color of the old pixel and the new color.

The available operators are `AND`, `OR`, `PRESET`, `PSET` (default), `TAND`, `TOR`, `TPRESET`, `TPSET`, `TXOR`, `XOR`. Specifying a logical operation preceded by "T" causes nothing to be done when specified color is transparent (color 0). 

The effect of the operators is done on each corresponding bit as shown in the following table.

|Current bit|Copied color bit|AND|OR|PRESET|PSET|XOR|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|0|0|0|0|1|0|0|
|0|1|0|1|0|1|1|
|1|0|0|1|1|0|1|
|1|1|1|1|0|1|0|

`<Mode>` is the character size. (0-2, 0 by default):
- 0 is 16x16 dot
- 1 is 16x8 dot (only odd lines are displayed)
- 2 is 16x8 dot (only even lines are displayed)

## Examples

```basic
10 SCREEN5
20 PUT KANJI (99,99),&H4267
30 GOTO 30
```
Result: Shows the JIS1 Kanji `大` at coordinate X=99, Y=99

---
```basic
10 SCREEN5
20 PUT KANJI (99,99),&H737E
30 GOTO 30
```
Result: Shows the JIS2 Kanji `龠` on those systems with JIS2 character sets, or nothing on those without.

---
```basic
5 ' ### JIS Code Table by KdL (2017.08.18)
10 COLOR 15,4,4: SCREEN 5: DEFINT A-Z
15 JIS=&H2120: OPEN "GRP:" FOR OUTPUT AS #1
20 W=16: N=N+1: PRESET(4,W+172)
25 PRINT#1,"[ BASE ADR ";HEX$(JIS);"H ]  [ PAGE ";
30 PRINT#1,RIGHT$(CHR$(N\10+48)+CHR$(NMOD10+48),2);" ]"
35 FOR Y=0 TO 5: FOR X=0 TO 15
40 PUT KANJI(X*16,W+Y*16),JIS,15
45 JIS=JIS+1: NEXT X: W=W+8: NEXT Y
50 IF JIS=&H7480 THEN CLOSE #1: K$=INPUT$(1): END
55 IF JIS=&H2780 THEN JIS=&H2F80: N=N+8
60 JIS=JIS+&HA0: K$=INPUT$(1): CLS: GOTO 20
```
Result: Shows the full JIS Code Table.

This [conversion table](http://www.asahi-net.or.jp/~ax2s-kmtn/ref/jisx0208.html) may help you to get the JIS code.

## Links

[MSX-Kanji revealed](http://www.msxcomputermagazine.nl/mccw/91/KANJI-stuff/en.html) for an in-depth article on this topic.

## Related to

`AND`, `CALL JIS`, `CALL SJIS`, `OR`, `XOR`

## Compatibility

MSX-BASIC 2.0 or higher - Requires a computer with Kanji-ROM

## Source

Retrieved from "https://www.msx.org/wiki/PUT_KANJI"
