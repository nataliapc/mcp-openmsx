# PLAY

## Effect

Executes the instructions of a Music Macro Language (MML) allowing to play notes on one or several PSG channels (and optionally on MSX-AUDIO/PCM, MSX-MUSIC or MSX-MIDI).

_Note: If you use `BEEP` all values of the MML instructions will be reset to their default values._

## Syntax

`PLAY #<Device>,"<MmlStringChannel1>","<MmlStringChannel2>",...,"<MmlStringChannel13>"`

_Note: Do not put a comma if no MML string is behind. If no parameter is required for one channel between two others, put only the two quotation marks._

## Parameters

`<Device>` is a number that defines the used sound chip. This parameter is available only after `CALL AUDIO` or `CALL MUSIC` has been executed:
- 0 = PSG (default value - can be omitted)
- 1 = MSX-MIDI (optional - requires MSX-MUSIC Basic and a MSX-MIDI hardware)
- 2 or 3 = MSX-AUDIO or MSX-MUSIC depending on the chip activated by `CALL AUDIO` or `CALL MUSIC`, optionally with PCM and PSG.

There is no any difference between modes 2 and 3.

`<MmlStringChannel>` for each music channel is a string of macro language instructions that describe the notes to play. Maximum length is 255 characters per string.

When using only PSG, the simplified syntax is therefore:

`PLAY ["<MML string - PSG Channel 1>"], ["<MML string - PSG Channel 2>"], ["<MML string - PSG Channel 3>"]`

When using MSX-MUSIC or MSX-MIDI, the maximum of FM or MIDI melody strings can't exceed the number of FM or MIDI melody channels enabled with `CALL MUSIC`. However, there's a special rule for the 7th and 8th strings when mode 1 is specified with `CALL MUSIC` on MSX turbo R with MSX-MIDI.

The first strings are for the FM or MIDI melody channels, the next one is for the FM or MIDI rhythm, the next 3 strings can be used for the PSG channels. If the selected mode does not have a FM or MIDI rhythm, you have to omit the corresponding string with a comma.

When using MSX-AUDIO, the maximum of FM melody strings can't exceed the number of FM melody channels enabled with `CALL AUDIO`.

The first strings are for the FM melody channels, the next one is for PCM, the next one is for the FM rhythm, the next 3 strings can be used for the PSG channels. If the selected mode does not have PCM and/or FM rhythm, you have to omit the corresponding strings with a comma.

## MML instructions

MML has the following instructions:

### Commin 

|Instruction|Effect|Values / Remarks|
|:-:|---|---|
|A to G [\<halftone>][\<octave>][\<period>]|Specifies a note from the scale, optionally with a specific increasing / decreasing halftone and/or octave and/or period|<li>\<halftone> = + or # for increasing halftone (sharp), - for decreasing halftone (flat)<li>\<octave>=1 to 8 (default value: 4)<li>\<period>=one or several . (dots), each . lengthens note by 1.5|
|L\<length>|Specifies the length of the notes after this instruction|<li>\<length>=1 to 64 (MIDI: 1 to 96)<li>(FM) 1=full note 2=half note 3=third note 4=quarter note (default value) etc...<li>(MIDI) 96=full note 48=half note 32=third note 24=quarter note (default value) etc...<li>If no length is specifed the length of the last played note is used|
|N\<number>[\<period>]|Specifies the note corresponding to the number (or pitch) - Beware! It's not a MIDI note number, but a number on a conventional scale.|<li>\<number>=0 to 96<li>If \<number>= 0 no sound is generated. In this case a short pause is played before the remaining part<li>\<period>=one or several . (dots), each . lengthens note by 1.5|
|O\<octave>|Specifies the octave of the notes after this instruction|\<octave>=1 to 8 (default value: 4)|
|R\<pause>[\<period>]|Specifies a pause (or rest)|<li>\<pause>=1 to 64 (MIDI: 1 to 96)<li>(FM) 1=full pause 2=half pause 3=third pause 4=quarter pause (default value) etc...<li>(MIDI) 96=full pause 48=half pause 32=third pause 24=quarter pause (default value) etc...<li>If no pause is specified the length specified by the last L instruction will be applied<li>\<period>=one or several . (dots), each . lengthens pause by 1.5|
|T\<tempo>|Specifies the tempo of the notes after this instruction|<li>\<tempo>=32 to 255 (default value: 120)<li>it indicates the number of quarter notes per minute<li>If no tempo is set the tempo of the last played note will be used|
|V\<volume>|Specifies the volume of the notes or the MIDI velocity after this instruction (when applied to FM rhythm, it's only for the non-accented voices)|<li>\<volume>=0 to 15 (default value: 8)<li>If no volume is set the volume of the last played note will be used<li>For MIDI instruments, the value is multiplied by 8 to modify the velocity of the note output|
|X\<string>;|Executes a sub-string A$ of instructions|<li>String-variables can be used within PLAY MML instructions<li>A X needs to be prefixed and all variables must be closed by a ';'<li>Adding other MML instructions after the last ';' will result in error|
|=\<variable>;|Puts a parameter in a integer-variable after one of several sub-strings of instructions (see X instruction)|<li>Variables can be used within PLAY MML instructions<li>The value range is determined by the preceding MML but it cannot exceed the value 32767<li>Adding other MML instructions after the last ';' will result in error|
|\<|Decreases one octave|Can be used after `CALL AUDIO` or `CALL MUSIC`, also with PSG|
|\>|Increases one octave|Can be used after `CALL AUDIO` or `CALL MUSIC`, also with PSG|
|\&|Connects two notes (Tie)|<li>Can be used after `CALL AUDIO` or `CALL MUSIC`, also with PSG<li>When placed between two notes with the same pitch, it extends the length of the notes to the equivalent of two notes<li>When the notes on both sides of this instruction have a different pitch, only the note in front will be played for 100% of its value.|

### Only for PSG

|Instruction|Effect|Values / Remarks|
|:-:|---|---|
|M\<frequency>|Specifies the sound modulation (envelope frequency)|<li>\<frequency>=1 to 65536 (default value: 255)<li>If no frequency is specified the last set value will be used<li>See also `SOUND`, registers 11 and 12|
|S\<pattern>|Specifies an envelope pattern|<li>\<pattern>=0 to 15 (default value: 0)<li>If no envelope pattern is specified the last set value will be used<li>See also `SOUND`, register 13|

### Only for MSX-AUDIO/PCM and MSX-MUSIC

|Instruction|Effect|Values / Remarks|
|:-:|---|---|
|Y\<register>,\<value>|Writes value directly in a register of the sound generator|<li>\<value>=0 to 255<li>Useful for example to change the pitch of the FM rhythm sound<li>See also `CALL AUDREG`|

### Only for MSX-AUDIO/PCM and MSX-MUSIC/MIDI

|Instruction|Effect|Values / Remarks|
|:-:|---|---|
|Q\<division>|Divides the length of the sound|\<division>=1 to 8 (default value: 8)|
|{\<string>}\<tuplet length>|Defines a tuplet (duplet, triplet, quadruplet, quintuplet, etc..)|<li>\<tuplet length>=1 to 64 (FM) or 1 to 96 (MIDI) (default value= length value set with L<length>)<li>Generates even notes<li>Quantity of notes is equal to the quantity of pitches enclosed between { }<li>Each length is equal to the length of a nth note divided by the quantity of the pitches|
|@\<voice>|Changes used FM voice or tone color of MIDI equipment|<li>\<voice>=0 to 63 for FM, 0 to 127 for MIDI<li>See `CALL MK VOICE`, `CALL VOICE` or `CALL VOICE COPY` for FM table<li>Can also be used for the MIDI rhythm, it will be ignored by the built-in FM sound source|
|@V\<tuning>|Makes a fine tuning of the FM volume or the MIDI Control Change # 7 output|\<tuning>=0 to 127|
|@W\<state length>|Continues the state for a specified length|<li>\<state length>=1 to 64 (MIDI: 1 to 96)<li>default value= length value set with L\<length>|

### Only for MIDI

|Instruction|Effect|Values / Remarks|
|:-:|---|---|
|Z\<data>|Sends 1 byte data to MSX-MIDI|\<data>=0 to 255|
|@C\<control>,\<value>|Changes the value of a MIDI control|<li>\<control>=0 to 127<li>\<value>=0 to 127|
|@H\<channel>|Specifies the MIDI channel to be used|\<channel>=0 to 16|
|@S\<clock mode>|Specifies the mode of the MIDI real-time clock|<li>\<clock mode>=0 to 2<li>0=FCH (STOP) - stop the clock<li>1=FAH (START) - start the clock<li>2=FBH (CONTINUE) - start the clock with the tempo specified in the first PLAY string|

### Only for FM or MIDI rhythm

|Instruction|Effect|Values / Remarks|
|:-:|---|---|
|B|Generates bass drum|For MIDI, first specify note number with `CALL MDR`|
|C|Generates cymbals|For MIDI, first specify note number with `CALL MDR`|
|H|Generates hi-hat|For MIDI, first specify note number with `CALL MDR`|
|M|Generates tom-tom|For MIDI, first specify note number with `CALL MDR`|
|S|Generates snare drum|For MIDI, first specify note number with `CALL MDR`|
|\<number>|Generates the musical sounds written up to here, then waits for the length of a n<sup>th</sup> note|\<number>=1 to 64|
|!|Accents preceeding note||
|@A\<volume>|Sets the volume for FM accented voices or the MIDI velocity|<li>\<volume>=0 to 15<li>For MIDI instruments, the value is multiplied by 8 to modify the velocity of the note output|


_Notes:_
- Default Value: Initial value set when `CALL MUSIC` or `CALL AUDIO` is used.
- FM Rhythm: There are 5 different voices that are available for the rhythm (percussion) MML and up to 3 voices may be played simultaneously. For this reason the rhythm MML first lines up the instruments that are to be played simultaneously.

## Examples

```basic
10 PLAY "CDE","EFG"
```

---
```basic
PLAY#2,"","","","BSH8H8H8S!H!8H8"
```

Plays: Bass, snare, hi-hat and wait an 8th note, hi-hat and wait an 8th note, snare, hi-hat plays accented and waits an 8th note, hi-hat and wait an 8th note.

---
```basic
1 '----->IDENTIFICATION DIVISION
2 'BIZET:Carmen(Habanera)
3 'by JL2TBB for MSX-MUSIC on HB-F1XD
100 '----->ENVIRONMENT DIVISION
110 CALLMUSIC(1,0,1,1,1,1,1,1):CALLPITCH(440):CALLTRANSPOSE(0):POKE-1460,20:SOUND6,0:SOUND7,49
120 CLEAR3000:DEFSTRA-K:DEFINTL-Z:DIMA(12),B(12),C(12),D(12),E(12),F(12),G(12),H(12),I(12)
130 '----->RHYTHM PATTERN
140 J="M500C12M200C24":K="M4000C8"
150 H(0)="T100SL24"+J+J+K+J+J+J+K+"V10CV9CVDS"+J+J+K+J+J+J+K+J:I(0)="T100R2.R8L24O8VEV7EV6E"
160 G(0)="T100V15@A2Y40,5Y24,153BM!24M!24M!24M!12M!24S8R12B8B24B8S4B4S8R12B8B24B8S8Y24,15C8"
170 H(1)=LEFT$(H(0),151)+"M5000R12C8R24C4":I(1)=I(0)
180 G(1)=LEFT$(G(0),66)+"SCB8R24SCB4"
190 G(11)="BCS24BCS4"
200 H(10)="RS0M500R4L32CCCCM1000CCCCM1500CCCCM2000CCCC":H(11)="M3000C24C4"
210 '----->BASS PATTERN
220 A(0)="T100@13V13O3D1.":B(0)="T100@13V14O2D1."
230 B(1)="D2.>>@31L24C12DF12DF12GC12DFGA>C<A>CR12V15DR8D<V14"
240 B(2)="Q4D8RR12FG8G8A8>QD8Q4<D8RR12FG8G8A8>QE8Q4<":B(3)="D8RR12FG8A8>E8<QA8E8R12GAGA>C+12<AR12>DR8D<"
250 B(4)="Q4D8RR12F+G8G8A8>QD8Q4<D8RR12F+G8G8A8>QE8Q4<":B(5)="E8RR12F+G8A8>E8<QA8E8R12GAGA>C+12<AR12>DR8D<"
260 B(6)="Y19,0V5L2T150OD.<A.>DE-4E."
270 B(7)="<B.>D.C+.<A>C+4":B(8)="E.T130D.T120C+<A":B(10)="T150>V4D"
280 '----->MELODY
290 A(1)="R1R8OL24@6DCDFGA>C<A>CR@0V13O6Q4L8DD-"
300 J="Q6C12C12C12Q4<BB-AR12A24":A(2)=J+"A-GF24G24F24E12F24GF12QG48F48Q4E4>DD-"
310 A(3)=J+"GFQL24EFED12EQ4L8FED&D>DD-"
320 A(4)="R48"+J+"A-GF+24G24F+24E12F+24GF+12QG48F+48Q4E4>DD-16"
330 A(5)="R48"+J+"GF+E24F+24E24D12E24F+E12<A24>D12..R12@21VY0,40Y1,36Y2,26Y4,244<A24>DE"
340 C(4)="@0O5VQ4L8A12A12A12A-GF+R12F+24FED24E24D24C+12D24ED12E48D48C+4BB-"
350 C(5)="A12A12A12A-GF+R12F+24EDC+24D24C+24<B12>C+24D<A12G24F+12Y50,5R8A24>DE"
360 A(6)="V5T150L8F+4.AF+ED4.EF+GAAAABAG4.<B>EF+":A(7)="G4.BGF+E4.F+GABBBB>C+<BA4.<A>DE"
370 A(8)="T140G4.BGF+T130E4.F+GAT120>C+<BG+AL32>EF+L28EF+L24EF+L20EF+L16EF+L12EF+L8EF+L7EF+L6EF+L5EF+L4EF+L3EF+E"
380 A(10)="T150R8.D"
390 '----->OTHERS
400 J="@10D8R12A24>@16F8<@6A8":C(0)="T100Q2O4"+J+J+J+J:C(1)=J+J
410 D(0)="@14V13T100R1.RR12O5C24R12D24"
420 E(0)="@14V13T100R1.RR12OG24R12A24"
430 F(0)="@6V14T100L24O3"
440 J="R1RL24@6>FGA>C<A>CR12":D(1)=J+"V15DR8D8V10L64V9C<BVAGV7FEV6DC"
450 E(1)=J+"V15AR8A8V10L64V9GFVEDV7C<BV6AG":F(1)=J+">GR8G8V10L64V9FEVDC<V7BAGF"
460 F(1)=J+">GR8G8V10L64V9FEVDC<V7BAGF"
470 D(2)="@2L24V10O5D&Y19,120&Y19,130&Y19,140&D&Y19,150&D&Y19,160&D&Y19,170&D&Y19,178&D1&D4F2"
480 E(2)="@2L24V9OG&G&Y20,5&G&Y20,10&G&Y20,15&GY20,50&G&Y20,225Y20,30&G1&G4B-2"
490 F(2)="@2L24V9OE&Y21,160&E&Y21,170&E&Y21,180&E&Y21,190&E&Y21,200&E&E1&E4G2"
500 D(3)=LEFT$(D(2),77)+"2.R24C+2@6R12V13>DR8D"
510 E(3)="A&Y20,0&A&Y20,10&A&Y20,20&A&Y20,30&A&Y20,40&A&Y20,50&A2.A2V13@6>>>R12DR8D"
520 F(3)="E&E&Y21,215&E&Y21,225&E&Y21,235&E&Y21,245&E&Y21,255&E2.G2@6>>R12AR8A"
530 D(4)="@16LRVO5F+A2R>D<B2":E(4)="@16LRVO5DF+2RAG2":F(4)="@16LRVOA>D2RF+E2"
540 D(5)="RE>E2R<A>DY51,90":E(5)="R<B>B2RGF+":F(5)="R<G>G2RED"
550 D(6)="T150L8Q4OR64D4A>F+<A4DA>F+4<A4D4A>F+D+4E<EF+GAB16."
560 D(7)="E4B>G<B4EB>G4<B4A4>C+AG4F+<<AB>C+DE":D(8)="T140E4B>G<B4T130EB>G4D4E"
570 IJ="SM100T100O8L64CCCL48CCCL32CCCL24CCCR":I(9)=IJ+IJ+IJ
580 D(10)="Y51,5R16O5F+":E(10)="Y52,5R8O5A"
590 J="T100Q8L24V15A>D":A(11)="@6O5"+J:B(11)="@31O4"+J:C(11)="@6O6"+J:D(11)="@2O5"+J:E(11)="@2O3"+J:F(11)="@6O3"+J
600 E(6)="T150@3O6V5Q4L8RDEF+GL24QABABABABABABABABABA4"
610 '----->PROCEDURE DIVISION
620 FORX=0TO5:IFX=4ANDY=0THENX=2:Y=1
630 Z=XMOD2:PLAY#2,A(X),B(X),C(X),D(X),E(X),F(X),G(Z),H(Z),I(Z):NEXT
640 FORX=6TO11:IFX=8ANDY=1THENX=6:Y=0
650 X=X+(X=7)*(Y=0):PLAY#2,A(X),B(X),C(X),D(X),E(X),F(X),G(X),H(X),I(X):NEXT
660 END
```

## Related to

`BEEP`, `CALL AUDIO`, `CALL AUDREG`, `CALL MDR`, `CALL MUSIC`, `CALL PLAY`, `CALL MK VOICE`, `CALL VOICE`, `CALL VOICE COPY`, `PLAY()`, `SOUND`

## Compatibility

MSX-BASIC 1.0 or higher, MSX-AUDIO BASIC, MSX-MIDI BASIC, MSX-MUSIC BASIC

## Source

Retrieved from "https://www.msx.org/wiki/PLAY"
