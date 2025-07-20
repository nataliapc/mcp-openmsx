# SOUND

## Effect

Writes a value in a specific PSG register.

Sound registers 14 and 15 and the two highest bits of register 7 are not accessible with this instruction.

## Syntax

`SOUND <PSGregister>,<Value>`

## Parameters

`<PSGregister>` is the register number (0-13) to write. It can be a variable or an expression.

`<Value>` is a value whose limits depend on the register to write (see Registers Description below). It can be a variable or an expression.

_Recommendation for maximum compatibility: when you write register 7 it is good habit to set bit 7 and reset bit 6 although these potentially harmful values should not end up to PSG in any case. That's why only the values 128 to 191 are mentioned below for this register._

## Registers Description

|Register|Description|Values|
|---|---|---|
|0|Least significant bits of channel A frequency|0~255|
|1|Most significant bits of channel A frequency|0~15|
|2|Least significant bits of channel B frequency|0~255|
|3|Most significant bits of channel B frequency|0~15|
|4|Least significant bits of channel C frequency|0~255|
|5|Most significant bits of channel C frequency|0~15|
|6|Noise generator frequency|0~31|
|7|Mixer setting|128~191|
|8|Volume of channel A|0~16|
|9|Volume of channel B|0~16|
|10|Volume of channel C|0~16|
|11|Least significant bits of envelope period|0~255|
|12|Most significant bits of envelope period|0~255|
|13|Envelope shape|0~15|

### About registers 0 to 5

- The value indicating the frequency to be produced on a channel is 12 bits. It is therefore divided into two registers. The value to be written is obtained using the following expression:

`Value = Fi / (16 x Fn)`

`Fi` = Internal frequency of PSG (1789772.5 Hz on MSX).  
`Fn` = Frequency of the sound to be produced (varies between 27 and 111.860 Hz).

Additional math:

`Note + Octave = Note/2`

`Note + HalfNote = Note/2^(1/12)`

For simplicity, here is ready table of musical notes by octave obtained according to the value indicated in the registers 0~1, 2~3 or 4~5:

|Note|O1|O2|O3|O4|O5|O6|O7|O8|
|---|---|---|---|---|---|---|---|---|
|C|D5Dh|6AFh|357h|1ACh|0D6h|06Bh|035h|01Bh|
|C#|C9Ch|64Eh|327h|194h|0CAh|065h|032h|019h|
|D|BE7h|5F4h|2FAh|17Dh|0BEh|05Fh|030h|018h|
|D#|B3Ch|59Eh|2CFh|168h|0B4h|05Ah|02Dh|016h|
|E|A9Bh|54Eh|2A7h|153h|0AAh|055h|02Ah|015h|
|F|A02h|501h|281h|140h|0A0h|050h|028h|014h|
|F#|973h|4BAh|25Dh|12Eh|097h|04Ch|026h|013h|
|G|8EBh|476h|23Bh|11Dh|08Fh|047h|024h|012h|
|G#|86Bh|436h|21Bh|10Dh|087h|043h|022h|011h|
|A|7F2h|3F9h|1FDh|0FEh<sup>*</sup>|07Fh|040h|020h|010h|
|A#|780h|3C0h|1E0h|0F0h|078h|03Ch|01Eh|00Fh|
|B|714h|38Ah|1C5h|0E3h|071h|039h|01Ch|00Eh|

<sup>(*)</sup> 0FEh is the note produced by a tuning fork.

### About register 6

The value indicating the frequency of the white noise generator is 5 bits. The value to be written is obtained using the following formula:

`Value = Fi / (16 x Fb)`

`Fi` = Internal frequency of PSG (1789772.5 Hz on MSX).  
`Fb` = Noise frequency master to be produced (varies between 3.608 and 111.860 Hz).

### About register 7

This register is used to activate or deactivate the tone generator as well as the noise generator. The format of the value is as follows:

|PSG I/O ports<br>Bit7 - Bit6|Disabling noise<br>Bit5 - Bit4 - Bit3|Disabling tone<br>Bit2 - Bit1 - Bit 0|
|:-:|:-:|:-:|
|B=1 - A=0|channelC - channelB - channelA |channelC - channelB - channelA|

Bits 7 and 6 serves to specify the direction of PSG I/O ports. Always set bit 7 and reset bit 6. Otherwise some devices connected to the joystick ports may malfunction.

### About register 8 to 10

The format of these registers is as follows:

|Bit 7|Bit 6|Bit 5|Bit 4|Bit 3 - Bit 2 - Bit 1 - Bit 0|
|:-:|:-:|:-:|:-:|:-:|
|-|-|-|V/A|Volume / Amplitude of the channel|

Reset bit 4 (V/A) to adjust the volume of the corresponding channel, if set the volume will vary in proportion to the envelope shape defined by register 13.

### About register 11 to 13

The registers 11 and 12 control the envelope period. The value is on 16 bits (0~65535). It is calculated with the following expression:

`Value = Fi / (256 x T)`

`Fi` = Internal frequency of PSG (1789772.5 Hz on MSX).  
`T` = Period of the envelope (in μs)

The register 13 defines the envelope shape. Here are the possible shapes:
- 0~3	＼＿＿＿＿＿＿＿
- 4~7	／＿＿＿＿＿＿＿
- 8	＼＼＼＼＼＼＼＼
- 9	＼＿＿＿＿＿＿＿
- 10	＼／＼／＼／＼／
- 11	＼￣￣￣￣￣￣￣
- 12	／／／／／／／／
- 13	／￣￣￣￣￣￣￣
- 14	／＼／＼／＼／＼
- 15	／＿＿＿＿＿＿＿

## Examples

```basic
5 ' Initializes the sound registers of the PSG
10 FOR R=0 TO 13
20 IF R=7 THEN SOUND R,&B10111111 ELSE SOUND R,0
30 NEXT
40 ' Plays the note C on channel A with a volume of 12
50 SOUND 0,&hAC ' 8 least significant bits of frequency on channel A
60 SOUND 1,1 ' 4 most significant bits of frequency on channel A
70 SOUND 8,&b1100 ' Sets the volume to 12 on channel A
80 SOUND 7,&b10111110 ' Activates the sound generator on channel A
```

Same example in decimal mode for the values:
```basic
5 ' Initializes the sound registers of the PSG
10 FOR R=0 TO 13
20 IF R=7 THEN SOUND R,191 ELSE SOUND R,0
30 NEXT
40 ' Plays the note C on channel A with a volume of 12
50 SOUND 0,172 ' 8 least significant bits of frequency on channel A
60 SOUND 1,1 ' 4 most significant bits of frequency on channel A
70 SOUND 8,12 ' Sets the volume to 12 on channel A
80 SOUND 7,190 ' Activates the sound generator on channel A
```

Legendary Finnish sauna-effect (_Source: MikroBitti 12/1987_):
```basic
10 REM SAUNONTA-TEHOSTE
20 SOUND 7,&B10110111
30 SOUND 8,16
40 SOUND 6,2
50 SOUND 12,160
60 SOUND 13,0
70 FOR T=1 TO 3500:NEXT
80 KO=INT(RND(1)*7)+2
90 SOUND 6,KO
100 M=INT(RND(1)*2)+3
110 SOUND 12,M
120 SOUND 13,4
130 AV=INT(RND(1)*50)+250
140 FOR T=1 TO AV:NEXT
150 N=N+1:IF N<LL THEN 80
160 N=0:LL=INT(RND(1)*15)+10
170 FOR T=1 TO 1000:NEXT
180 GOTO 40
```

## Related to

`BEEP`, `PLAY`, `PLAY()`

## Compatibility

MSX-BASIC 1.0 or higher

## Links

- [General Instrument AY-3-8910 application manual](http://map.grauw.nl/resources/sound/generalinstrument_ay-3-8910.pdf)
- [Yamaha YM2149 SSG application manual](http://map.grauw.nl/resources/sound/yamaha_ym2149.pdf)

## Source

Retrieved from "https://www.msx.org/wiki/SOUND"
