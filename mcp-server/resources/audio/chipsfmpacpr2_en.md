# MSX-MUSIC REGISTERS

## WRITE ONLY

The registers of the MSX-MUSIC system, as found in: FM-Pac, FM-Stereo-Pak, MSX2+ and TurboR computers, are controlled via ports &H7C and &H7D. The control works according to the same principle as with MSX-AUDIO and the PSG. The register is specified in 7C and the data in 7D. Unfortunately, these are Write Only ports, so they cannot be read.

## SOUND SETTINGS

The OPLL data (original instrument) is specified in registers 0-7. This data corresponds to the data you can retrieve in the SynthSaurus Sound Editor, so you can easily retrieve a homemade instrument and write those values to registers 0-7.

The following is the structure of registers 0-7 (OPLL instr)

```
Reg.nr.    Bit:    Function:
------------------------------------------------------------
0,1        0-3     Multi sample waves/harmonic relations
           4       Rate key scale
           5       Latching/sprouting (1=Latch 0=Latch)
           6       Vibration on/off (1=on 0=off)
           7       Amplitude modulation (1=on 0=off)

2          0-5     Modulation index
           6-7     Level key scale

3          0-2     FM recoil
           3-4     Load-bearing and modulated waveform
                   link (FM/AM)
           6-7     Level key scale

4,5        0-3     Decay change
           4-7     Attack change (swelling)

6,7        0-3     Opening the change control
           4-7     Major of Attack/Decay
------------------------------------------------------------
```

## INSTRUMENT CONTROL

The registers printed below are for the instrument selection/frequency/octave/volume and the so-called Sustain.

```
Reg.nr.    Bit:    Function:
------------------------------------------------------------
&H10-&H18  0-7     Note frequency LSB (8 bits)

&H20-&H28  0       Note frequency MSB (1 bit)
           1-3     Octave nr. (0-7, 0=octave 1, 7=octave 8)
           4       Key on/off (1=on, 0=off)
           5       Sustain (hold, 1=on, 0=off)

&H30-&H38  0-3     Volume (0=vol.15, F=vol.0 !)
           4-7     Instrument select (0=original, <>0=FM
                                       instrument)
------------------------------------------------------------
```

## FM INSTRUMENTS

The MSX-MUSIC system has 15 pre-programmed instruments that can be used independently of each other.

```
0 = Original (custom instrument, see SOUND SETTINGS)
1 = Violin                   9 = Horn
2 = Guitar                   A = Synthesizer
3 = Piano                    B = Harpsichord
4 = Flute                    C = Vibraphone
5 = Clarinet                 D = Synthesizer Bass
6 = Oboe                     E = ElectrPiano2/Acoust. Bass
7 = Trumpet                  F = ElectrPiano1/ElectrGuitar
8 = Organ
```

## RHYTHM

Register &H0E contains the drum selection, however bit 5 must be written before a drum can be heard. The drums can also be slightly changed, but rather limited and a bit chaotic. Below is a table of the drum values that can be written in register &H0E:

```
bit 0 = HiHat                bit 3 = Snare drum/Field drum
bit 1 = Cymbal               bit 4 = Bass drum
bit 2 = TomTom               bit 5 = selector (1 = Rhythm, 0 = Instrument)
```

Of course, multiple drums can be controlled simultaneously.
The rhythm sound is structured as follows:

```
Drum type:    Reg.   Bit:    Function:
------------------------------------------------------------
Bass drum     &H16   0-7     Frequency LSB (8 bits)
              &H26   0       Frequency MSB (1 bit)
                     1-3     Octave (0-7)
              &H36   0-3     Volume Bass drum

Snare &       &h17   0-7     Frequency LSB (8 bits)
HiHat         &H27   0       Frequency MSB (1 bit)
                     1-3     Octave (0-7)
              &H37   0-3     Volume Snare
                     4-7     Volume HiHat

Cymbal &      &H18   0-7     Frequency LSB (8 bits)
TomTom        &H28   0       Frequency MSB (1 bit)
                     1-3     Octave (0-7)
              &H38   0-3     Volume Cymbal
                     4-7     Volume TomTom
------------------------------------------------------------
```

## BASIC REGISTERS

The registers of the MSX-MUSIC system are, under BASIC!, maintained from address &HF9C0 to &HF9C0+&H38. The settings of these registers are filled with the following values after the command CALL MUSIC:

```
                                  Reg.nr.        Value:
------------------------------------------------------------
Register pair 1:   Instruments    &H10-&H15      &H56
                   Drums          &H16           &H20
                                  &H17           &H50
                                  &H18           &HC0

Register pair 2:   Instruments    &H20-&H25      &H00
                   Drums          &H26           &H05
                                  &H27           &H05
                                  &H28           &H01

Register pair 3:   Instruments    &H30-&H35      &H30
                   Drums          &H36           &H01
                                  &H37           &H11
                                  &H38           &H11
------------------------------------------------------------
```

## USAGE

When using this information in, for example, an interrupt-driven music piece, you must take the following things into account.

1) When a new frequency is specified for an instrument, bit 4 of the corresponding register must first be switched off. To clarify: if a new frequency needs to be entered in channel 1, bit 4 of register &H10 must be cleared. After that the frequency is written, and finally bit 4 is set again (reg. &H10). For other channels a different register is used accordingly.

2) When an instrument is played that 'fades out' (Release), a short delay is needed in machine code:

```z80
         LD   B,3    ;approximately 3!
   LOOP: DJNZ LOOP
```

3) The note frequencies are:

```
   Note:     LSB       MSB (bit 0 of reg &H20-&H28)
   ---------------------------------------------------------
   C         &HAD      0
   C#        &HB7      0
   D         &HC2      0
   D#        &HCD      0
   E         &HD9      0
   F         &HE6      0
   F#        &HF4      0
   G         &H03      1
   G#        &H12      1
   A         &H22      1
   A#        &H34      1
   B         &H46      1
   ---------------------------------------------------------
```

With this information you should now be able to control the MSX-MUSIC system through these registers. Good luck!

by R.M.

(Just to be clear: I don't know who R.M. is, but it's not me! - RM-FCS)
