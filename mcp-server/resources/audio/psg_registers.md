# PSG Registers

## Index

- [PSG Registers overview](#psg-registers-overview)
- [Frequency control registers](#)
- [White noise frequency control register](#)
- [PSG voice and I/O port control register](#)
- [Amplitude and volume control registers](#)
- [Envelope Form and Period Control Registers](#)
- [PSG I/O Parallel Port Registers](#)


## PSG Registers overview

The PSG has 16 registers in which the content can be read and written except for register 14 which can only be read. To access the PSG registers, Bios in Main-ROM has two routines. The first is WRTPSG (00093h) which allows you to configure the PSG. The second, RDPSG (00096h), is used to read contents of a register.

There is also a routine in Bios of the Main-ROM called GICINI (00090h), which is used to initialize the PSG and the data of the instruction PLAY. Once initialized, all registers from 0 to 13 will be set to zero except register 0 which will have the value 01010101b (55h), register 7 which will have 10111000b (B8h) and register 11 which will have 1011b (0BH) for the period of the envelope.

PSG registers are also directly accessible through the I/O ports: 0A0h, 0A1h and 0A2h.
To write in a register directly via the I/O ports, you must write the register number to port 0A0h then the value to be written to port 0A1h. Take care to cut interrupts while writing register number and value. To read a register via the I/O ports, write the register number to read to port 0A0h then read the value from port 0A2h.

## Frequency control registers

The first six registers are used to set the frequency to be generated to produce a sound.

```
             bit 7   bit 6   bit 5   bit 4   bit 3   bit 2   bit 1   bit 0
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 0 |         8 least significant bits of voice frequency 1         |
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 1 |   -   |   -   |   -   |   -   |  4 MSB of voice frequency 1   |
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 2 |         8 least significant bits of voice frequency 2         |
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 3 |   -   |   -   |   -   |   -   |  4 MSB of voice frequency 2   |
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 4 |         8 least significant bits of voice frequency 3         |
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 5 |   -   |   -   |   -   |   -   |  4 MSB of voice frequency 3   |
           +-------+-------+-------+-------+-------+-------+-------+-------+
```

Value indicating the frequency of the white noise generator is 5 bits. The value to be written is obtained using the following formula:
```
Value = Fi / (16 x Fb)
```

- Fi = Internal frequency of PSG (1789772.5 Hz on MSX)
- Fb = Tone frequency master to be produced (varies between between 27 and 111.860 Hz)

For simplicity, here is a table of musical notes by octave obtained according to the value indicated in registers 0-1, 2-3 or 4-5.

| Note | Octave 1 | Octave 2 | Octave 3 | Octave 4 | Octave 5 | Octave 6 | Octave 7 | Octave 8 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
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
For example, to produce the note Do in octave 4 by voice 1, we would write 1h in register 1 and ACh in register 0. In practice, this looks like below.
In assembler:

```
WRTPSG	equ	00093h

; --&gt; File header
    db	0feh	; Binary code file
    dw	START	; Program destination address
    dw	END	; Program end address
    dw	START	; Program execution address
; ---
    org	0c000h
START:	
    ld	b,13
PSGini:	ld	a,b	; 
    ld	e,0	; 8 least significant bits
    cp	7
    jr	nz,NoR7	; Jump if register different from 7
    ld	e,10111111b	; Bit 7 to 1 and bit 6 to 0
NoR7:	call	WRTPSG
    djnz	PSGini	; Loop to initialize registers 

    ld	a,0	; Register 0
    ld	e,0ach	; 8 least significant bits
    call	WRTPSG
    ld	a,1	; Register 1
    ld	e,1	; 4 most signifiant bits
    call	WRTPSG
    ld	a,8	; Register 8
    ld	e,1100b	; Voice volume 1 to 12
    call	WRTPSG
    ld	a,7	; Register 7
    ld	e,10111110b	; Enable voice 1 
    call	WRTPSG
    ret
END:
```

Once assembled and saved as "V15O1C.BIN", run the routine with the following instruction.
```
BLOAD"V15O1C.BIN",R
```
In BASIC:
```
5 ' Initializes the sound registers of the PSG
10 FOR R=0 TO 13
20 IF R=7 THEN SOUND R,&amp;B10111111 ELSE SOUND R,0
30 NEXT
40 ' Play the note C on voice 1 with a volume of 12
50 SOUND 0,&amp;hAC ' 8 least significant bits in register 0
60 SOUND 1,1 ' 4 most significant bits in register 1
70 SOUND 8,&amp;b1100 ' Adjusting the volume of voice 1 to 12
80 SOUND 7,&amp;b10111110 ' Enables the sound generator on voice 1
```

## White noise frequency control register

This register is used to enable or disable the sound generator as well as the noise generator.

```
             bit 7   bit 6   bit 5   bit 4   bit 3   bit 2   bit 1   bit 0
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 6 |   -       -       -   |    White noise generator frequency    |
           +-------+-------+-------+-------+-------+-------+-------+-------+
```

Value indicating the frequency of the white noise generator takes up 5 bits. The value to be written is obtained using the following formula. Only the 5 bits of the value are to be written in register 6.
```
Value = Fi / 16 x Fb
```
- Fi = PSG internal frequency (1789772.5 Hz)
- Fb = Base frequency of the noise to be produced (varies between 3.608 and 111.860 Hz)

## PSG voice and I/O port control register

This register is used to enable or disable the sound generator as well as the noise generator. It is also used to adjust the direction of the PSG I/O ports.

```
             bit 7   bit 6   bit 5   bit 4   bit 3   bit 2   bit 1   bit 0
           | PSG I/O Ports |  Make the noise mute  |  Make the tone mute   |
           +-------+-------+-------+-------+-------+-------+-------+-------+
Register 7 |  B=1  :  A=0  |voice3 :voice2 :voice1 |voice3 :voice2 :voice1 |
           +-------+-------+-------+-------+-------+-------+-------+-------+
```

Notes:
- To make mute the sound on a voice, you can set the volume of the voice to 0 (registers 8 to 10) or deactivate the tone and noise generator of this voice by setting the corresponding bits of register 7 to 1.
- In order to guarantee the proper functioning of the PSG I/O ports, bit 7 of register 7 must always remain at 1 (port B in output mode) and bit 6 at 0 (port A in input mode).
- It is therefore possible to enable the sound generator and the noise generator at the same time on each voice. That is to say, mix the two.

## Amplitude and volume control registers

```
              bit 7   bit 6   bit 5   bit 4   bit 3   bit 2   bit 1   bit 0
            +-------+-------+-------+-------+-------+-------+-------+-------+
Register 8  |   -       -       -   |  V/A  |  Voice Volume / Amplitude 1   |
            +-------+-------+-------+-------+-------+-------+-------+-------+
Register 9  |   -       -       -   |  V/A  |  Voice Volume / Amplitude 2   |
            +-------+-------+-------+-------+-------+-------+-------+-------+
Register 10 |   -       -       -   |  V/A  |  Voice Volume / Amplitude 3   |
            +-------+-------+-------+-------+-------+-------+-------+-------+
```

Reset bit 4 (V/A) to adjust the sound volume of the corresponding voice.
When bit 4 (V/A) is set, the volume will vary in proportion to the shape of the envelope defined by register 13.

## Envelope Form and Period Control Registers

```
              bit 7   bit 6   bit 5   bit 4   bit 3   bit 2   bit 1   bit 0
            +-------+-------+-------+-------+-------+-------+-------+-------+
Register 11 |  8 LSB of the value that determines the envelope period (T)   |
            +-------+-------+-------+-------+-------+-------+-------+-------+
Register 12 |  8 MSB of the value that determines the envelope period (T)   |
            +-------+-------+-------+-------+-------+-------+-------+-------+
Register 13 |   -       -       -       -   |        Envelope shape         |
            +-------+-------+-------+-------+-------+-------+-------+-------+
```

Registers 11 and 12 control the envelope period. The value is on 16 bits (0~65535). It is calculated with the following expression: 
```
Value = Fi / (256 x T)
```
- Fi = Internal frequency of PSG (1789772.5 Hz on MSX)
- T = Period of the envelope (in μs)

The register 13 defines the envelope shape. Here are the possible shapes:
```
00xx = _|\______    01xx = _/|_____

1000 = _|\|\|\|\    1001 = _|\_____
                               ____
1010 = _|\/\/\/\    1011 = _|\|
                             ______
1100 = _/|/|/|/|    1101 = _/

1110 = _/\/\/\/\    1111 = _/|_____
        T                   T
```

Bits detail:
- Bit 0 (Hold) specifies whether the period should be repetitive or not.
- Bit 1 (Alternate) specifies whether or not the shape of the envelope should be inverted on each repetition.
- Bit 2 (Attack) specifies whether or not to invert the shape of the envelope.
- Bit 3 (Continue) specifies that the shape of the envelope should remain at the same level at the end of the period.

## PSG I/O Parallel Port Registers

Registers 14 and 15 are used to access and control the parallel ports of the PSG. On MSX, Port A is connected as an entry and B at the output to read general ports 1 or 2 (joystick ports) as well as two other signals to know the type of Japanese keyboard used, as well as the signal read by the cassette interface. Register 15 is used to control the general ports, as well as the LED of the "Code" or "Kana" keys.

```
               bit 7    bit 6    bit 5    bit 4   bit 3   bit 2   bit 1   bit 0
            +--------+--------+--------+--------+-------+-------+-------+-------+
Register 14 | Port parallel A of E/S of PSG (Always set as input with R#7 bit6) |
            +--------+--------+--------+--------+-------+-------+-------+-------+
```

This register allows to read the state of the pins for the selected general port, the Japanese keyboard type (JIS or JP50on), and the signal read from the cassette interface.

- Bit 0 = Pin 1 state of the selected general port (Up if joystick)
- Bit 1 = Pin 2 state of the selected general port (Down if joystick)
- Bit 2 = Pin 3 state of the selected general port (Left if joystick)
- Bit 3 = Pin 4 state of the selected general port (Right if joystick)
- Bit 4 = Pin 6 state of the selected general port (Trigger A if joystick)
- Bit 5 = Pin 7 state of the selected general port (Trigger B if joystick)
- Bit 6 = 1 for JIS keyboard, 0 for JP50on (only valid for Japanese MSX)
- Bit 7 = CASRD (signal read from the cassette interface)

```
               bit 7    bit 6    bit 5    bit 4    bit 3   bit 2   bit 1   bit 0
            +--------+--------+--------+--------+--------+-------+-------+-------+
Register 15 | Port parallel B of E/S of PSG (Always set as output with R#7 bit7) |
            +--------+--------+--------+--------+--------+-------+-------+-------+
```

This register allows to control the direction of the signals  of the general port, which can be read via register 14. It allows also to set or read the state of the LED of the "code" or "kana" keys, depending on the keyboard.

- Bit 0 = pin control 6 of the general port 1<sup>*</sup>
- Bit 1 = pin control 7 of the general port 1<sup>*</sup>
- Bit 2 = pin control 6 of the general port 2<sup>*</sup>
- Bit 3 = pin control 7 of the general port 2<sup>*</sup>
- Bit 4 = pin control 8 of the general port 1 (0 for standard joystick mode)
- Bit 5 = pin control 8 of the general port 2 (0 for standard joystick mode)
- Bit 6 = selection of the general port readable via register 14 (1 for port 2)
- Bit 7 = LED control of the "Code" or "Kana" key. (1 to turn off)

<sup>(*)</sup> Put to 1 if the general port is used as a starter (reading).

The general port pins are connected as follows.

```
     General port 1                   General port 2
  ┌───────────────────┐            ┌───────────────────┐
  │ 1   2   3   4   5 ──── +5V     │ 1   2   3   4   5 ──── +5V
   \                 /              \                 /
    \ 6   7   8   9 ────── GND       \ 6   7   8   9 ────── GND
    └───────────────┘                └───────────────┘
   1│6│2│7│3│8│4│                   1│6│2│7│3│8│4│
    │ │ │ │ │ │ │                    │ │ │ │ │ │ │
    └─└─└─└─└─|─│1-4,6-7      1-4,6-7│─┘─┘─┘─┘─│─┘
             8| ▼                    ▼        8│
To bit 4 of <─┘ ┌────────────────────┐        └─> To bit 5 of
PSG port B      │Commutation circuit │            PSG port B
                │                    ┼──────┐
                └──┼──┼──┼──┼──┼──┼──┘      ▼
                  1│ 2│ 3│ 4│ 6│ 7│        To bit 6 of PSG port B
                   ▼  ▼  ▼  ▼  ▼  ▼        (General port select signal)
               To bits 0-5 of PSG port A
```

© 1996-2025  Microcomputer & Related Culture Foundation. MSX is a trademark of MSX Licensing Corporation. 
