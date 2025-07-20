# WIDTH

## Effect

Sets the number of columns on current or last used text mode.

## Syntax

`WIDTH <Columns>`

## Parameter

`<Columns>` is a value between 1 and 32/40/80. The highest value depends on the mode set with `SCREEN` or `CALL KANJI`, and the type of MSX used. Kanji modes don't accept a value lower than 26.

|SCREEN|MSX type|Columns|
|:--|:--|:-:|
|0|MSX1 <sup>(*)</sup>|1-40|
|0|MSX2 and higher <sup>(*)</sup>|1-80|
|1|MSX1 and higher|1-32|
|9|Korean MSX2|1-80|
|KANJI0|Japanese MSX2+ and higher|26-64|
|KANJI1|Japanese MSX2+ and higher|26-80|
|KANJI2|Japanese MSX2+ and higher|26-64|
|KANJI3|Japanese MSX2+ and higher|26-80|


<sup>(*)</sup> Special case: the Yamaha CX5MII and CX5MII/128 are MSX1 computers with an additional ROM allowing to use the 80 column text mode.

### Default values

The default values according the MSX.

|SCREEN|Machines|Default width|
|:-:|:--|:--|
|0|Ascii One Chip MSX (improved)|80|
|0|Ascii One Chip MSX (original)|40|
|0|Brazilian Ciel and Sharp machines|39|
|0|Most Brazilian Gradiente machines|40|
|0|Most European machines|37|
|0|Japanese, Korean and Russian machines|39|
|1|All machines|29|
|9|Korean MSX2 computers|80|
|9|Korean MSX2 consoles|29 (takes the width of previous text mode)|
|KANJI0|Japanese MSX2+ and higher|29 (takes the width of previous text mode until the limit possible)|
|KANJI1|Japanese MSX2+ and higher|39 (takes the width of previous text mode until the limit possible)|
|KANJI2|Japanese MSX2+ and higher|29 (takes the width of previous text mode until the limit possible)|
|KANJI3|Japanese MSX2+ and higher|39 (takes the width of previous text mode until the limit possible)|

_Note: On MSX2 and higher machines, the instruction `SET SCREEN` saves the current parameter for screen 0 and 1; it's not possible to save this parameter for the Kanji modes.  When you restart the MSX the saved parameter is used as default value. On Korean MSX2 the Hangul mode is kept only if `SET SCREEN` is executed in this mode._

## Examples

```basic
10 SCREEN 0: SCREEN 2
20 WIDTH 39: END
```
```basic
10 SCREEN 1: SCREEN 2
20 WIDTH 39: END
```

_Note: The second example causes an "Illegal function call" error._

## Related to

`CALL KANJI`, `SCREEN`, `SET SCREEN`

## Compatibility

MSX-BASIC 1.x

MSX-BASIC 2.0 or higher according the parameter.

## Source

Retrieved from "https://www.msx.org/wiki/WIDTH"
