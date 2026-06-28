# FM-PAC / MSX-MUSIC (Yamaha YM-2413)

In this text, only the direct programming of the MSX-MUSIC will be discussed, not the FM-BASIC possibilities, because they finally use direct control.

The MSX-MUSIC or the FM-PAC uses two I/O ports for control. Unfortunately, these registers are only used to write from the computer to the FM-PAC, so reading registers from the FM-PAC/MSX-MUSIC is not possible.

```
  07Ch           - Address port.
  07Dh           - Data Port.
```

To control these ports correctly in machine language, it is useful to use the following program:

```
  ;Reg. D contains register number for FM-PAC.
  ;Reg. E contains data for selected register.

  SET_FM: LD   A,D
          OUT  (07CH),A
          LD   A,E
          OUT  (07DH),A
          EX   (SP),HL     ;These 2 commands only serve as a short
          EX   (SP),HL     ;pause for the PAC to process the data
          RET              ;before sending new data.
```

## Registers

The FM-PAC contains 43 programmable registers for setting frequency, volume, instruments, drums and possibly samples. The latter is rather difficult, since the FM-PAC has no built-in hardware to play this independently like the MUSIC MODULE, a routine must be written in ML code for this, which sends the sample data in the FM-PAC via the necessary registers. so that it puts this sample on the sound output.

```
  #0Fh            FM.TST

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │ - │ - │ - │ - │SND│ - │ - │SMP│
  └───┴───┴───┴───┴───┴───┴───┴───┘

SND  - 1=Sound output of the chip is out.
SAMP - 1=Sample mode on, a four bit sample can be written to register
         #10h, the 4 highest bit.
```

```
  #10h - #18h     LOWFRQ

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │FQ7│FQ6│FQ5│FQ4│FQ3│FQ2│FQ1│FQ0│
  └───┴───┴───┴───┴───┴───┴───┴───┘
```

```
  #20h - #28h     SELECT

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │ - │ - │SUS│KEY│OC2│OC1│OC0│FQ8│
  └───┴───┴───┴───┴───┴───┴───┴───┘

FQ 8/0  - Frequency from channel 1 to 9.
OC 2/0  - Octave from channel 1 to 9.
KEY     - If a new tone has to be  struck it must  first be set to 0.
          Then the new data can be  loaded (Frequency, Instrument and
          volume), then set this bit back to 1.
SUS     - If this bit is set to 1, the  tone  will slowly  fade after 
          the KEY bit is set to 0. If SUS is at 0, the tone will stop
          immediately when the KEY bit is turned off.
```

```
  #30h - #38h     VOLINS

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │IN3│IN2│IN1│IN0│VL3│VL2│VL1│VL0│
  └───┴───┴───┴───┴───┴───┴───┴───┘

VL 3/0  - Volume  from  channel 1 to 9. At  binary  0000  the  highest
          volume is reached.
IN 3/0  - Instruments from channels 1 to 9. There  are 16 instruments,
          instrument number 0 of which can be programmed via registers
          #00 to #07.

  NR:   Instrument:

  00    Software Instrument
  01    Violin
  02    Guitar
  03    Piano
  04    Flute
  05    Clarinet
  06    Oboe
  07    Trumpet
  08    Organ
  09    Tube
  10    Synthesizer
  11    Harpsicord
  12    Vibraphone
  13    Synthesizer Bass
  14    Electric Piano 1
  15    Electric Piano 2
```

```
  #03h            DRMSEL

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │ - │ - │SEL│BD │SD │TOM│CIM│HH │
  └───┴───┴───┴───┴───┴───┴───┴───┘

SEL   - If  this  is  bit 1, channels 7 to 9 will  be  used  for  drum
        settings, and bits 4 to 0 can be used to control a drum.
BD    - Bass Drum :1 = Activate, if SEL is set to 1.
SD    - Snare Drum.
TOM   - Tom-Tom.
CIM   - Cimbal.
HH    - Hi Hat.
```

The Drum's frequencies and volumes are divided as follows:

```
Reg:  Use:
#16h  Frequency bit 7 to 0 for the BassDrum.
#17h  Frequency bit 7 to 0 for the SnareDrum and the HiHat.
#18h  Frequency bit 7 to 0 for the TomTom and the Cimbal.
#26h  Octave bit 2 to 0 and Frequency bit 8 for BassDrum.
#27h  Octave bit 2 to 0 and Frequency bit 8 for SnareDrum & the HiHat.
#28h  Octave bit 2 to 0 and Frequency bit 8 for Tom-Tom & the Cimbal.
#36h  Low nibble is volume of Bass Drum (0 is the highest volume).
#37h  High nibble is volume from Hi Hat.
      Low nibble is volume from Snare Drum.
#38h  High nibble is volume from Cimbal.
      Low nibble is volume from Tom-Tom.
```

## Programming the Software Instrument.

The FM contains 2 operators for each instrument. The sound is generated via the FM synthesis, which stands for Frequency Modulation. The System works the same as that of the Music-module/MSX-Audio only the maximum values will not always match, but the theory is the same.

```
  #00h/01h        SET.B / SET.A.

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │ AM│VBR│S/D│RKS│MS3│MS2│MS1│MS0│
  └───┴───┴───┴───┴───┴───┴───┴───┘

  #00h for operator B and # 01h for operator A.

  AM      - Amplitude Modulation.
  VBR     - Vibrato.
  S/D     - 0 = Decay; 1 = Sustain.
  RKS     - Rate Key Scale.
  MS3/0   - Multi sample wave selection.
```

```
  #02h            KSCMOD

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │LK1│LK0│MD5│MD4│MD3│MD2│MD1│MD0│
  └───┴───┴───┴───┴───┴───┴───┴───┘

  LK1/0   - Level Key Scale.
  MD5/0   - Modulation Control.
```

```
  #03h            FEED

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │LK1│LK0│ - │DS2│DS1│FD2│FD1│FD0│
  └───┴───┴───┴───┴───┴───┴───┴───┘

  LK1/0   - Level Key Scale.
  DS2/1   - Distorted Wave Form.
  FD2/0   - FM-Feedback constant.
```

```
  #04h / #05h     CTRL.B / CTRL.A

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │AT3│AT2│AT1│AT0│DC3│DC2│DC1│DC0│
  └───┴───┴───┴───┴───┴───┴───┴───┘

  AT3/0   - Attack envelope rate.
  DC3/0   - Decay envelope rate.
```

```
  #06h / #07h     IND.B / IND.A

    7   6   5   4   3   2   1   0
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │IN3│IN2│IN1│IN0│RL3│RL2│RL1│RL0│
  └───┴───┴───┴───┴───┴───┴───┴───┘

  IN3/0   - Indication Decay / Sustain level.
  RL3/0   - Release envelope rate.
```

The FM synthesis is quite complicated, especially for the beginner it is just a matter of trying. Fortunately, there are quite a few music programs on the market that handle this themselves.
