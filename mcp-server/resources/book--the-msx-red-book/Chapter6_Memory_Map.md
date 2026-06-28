# 6. Memory Map

A maximum of 32 KB of RAM is available to the BASIC Interpreter to hold the program text, the BASIC Variables, the Z80 stack, the I/O buffers and the internal workspace. A memory map of these areas in the power-up state is shown below:

```
                   ┌─────────────────────────┐
                   │      Workspace Area     │
HIMEM=F380H ─────> ├─────────────────────────┤
                   │      I/O Buffer 1       │
                   ├─────────────────────────┤
                   │         FCB 1           │
                   ├─────────────────────────┤
                   │      I/O Buffer 0       │
NULBUF=F177H ────> ├─────────────────────────┤
                   │         FCB 0           │
                   ├─────────────────────────┤
                   │    F277H  (FCB 1)       │
                   │    F16EH  (FCB 0)       │
FILTAB=F16AH ────> ├─────────────────────────┤
                   │          00H            │
                   ├─────────────────────────┤
MEMSIZ=F168H ──┬─> │                         │
FRETOP=F168H ──┘   │   String Storage Area   │
                   │                         │
STKTOP=F0A0H ────> ├─────────────────────────┤
                   │        Z80 Stack        │
                   └─────────────────────────┘
STREND=8003H ────>
                   ┌─────────────────────────┐
                   │   Array Storage Area    │
ARYTAB=8003H ────> ├─────────────────────────┤
                   │   Variable Storage Area │
VARTAB=8003H ────> ├─────────────────────────┤
                   │   Program Text Area     │
TXTTAB=8001H ────> ├─────────────────────────┤
                   │          00H            │
                   └─────────────────────────┘
```
**Figure 50:** Memory Map 8000H to FFFFH

The Program Text Area is composed of tokenized program lines stored in line number order and terminated by a zero end link, when in the "`NEW`" state only the end link is present. The zero byte at 8000H is a dummy end of line character needed to synchronize the Runloop at the start of a program.

The Variable and Array Storage Areas are composed of string or numeric Variables and Arrays stored in the order in which they are found in the program text. Execution speed improves marginally if Variables are declared before Arrays in a program as this reduces the amount of memory to be moved upwards.

The Z80 stack is positioned immediately below the String Storage Area, the structure of the stack top is shown below:

```
STKTOP ────────> ├───────┤
                 │  00H  │
                 │  00H  │
Mainloop SP ───> ├───────┤
                 │  46H  │
                 │  01H  │
Statement SP ──> └───────┘
```
**Figure 51:** Z80 Stack Top

Whenever the position of the stack is altered, as a result of a "`CLEAR`" or "`MAXFILES`" statement, two zero bytes are first pushed to function as a terminator during "`FOR`" or "`GOSUB`" parameter block searches. Assuming no parameter blocks are present the Z80 SP will therefore be at [STKTOP](#stktop)-2 within the Interpreter Mainloop and at [STKTOP](#stktop)-4 when control transfers from the Runloop to a statement handler.

The String Storage Area is composed of the string bodies assigned to Variables or Arrays. During expression evaluation a number of intermediate string results may also be temporarily present under the permanent string heap. The zero byte following the String Storage Area is a temporary delimiter for the "`VAL`" function.

The region between the String Storage Area and [HIMEM](#himem) is used for I/O buffer storage. I/O buffer 0, the "`SAVE`" and "`LOAD`" buffer, is always present but the number of user buffers is determined by the "`MAXFILES`" statement. Each I/O buffer consists of a 9 byte FCB, whose address is contained in the table under FCB 0, followed by a 256 byte data buffer. The FCB contains the status of the I/O buffer as below:

|0|1|2|3|4|5|6|7|8|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|Mod|00H|00H|00H|DEV|00H|POS|00H|PPS|

**Figure 52:** File Control Block

The MOD byte holds the buffer mode, the DEV byte the device code, the POS byte the current position in the buffer (0 to 255) and the PPS byte the "`PRINT`" position. The remainder of the FCB is unused on a standard MSX machine.

<a name="workspace_area"></a>
## Workspace Area

The section of the Workspace Area from F380H to FD99H holds the BIOS/Interpreter variables. These are listed on the following pages in standard assembly language form:

<a name="f380h"></a><a name="rdprim"></a>
<a name="f382h"></a>
<a name="f383h"></a>

```
F380H RDPRIM: OUT (0A8H),A ; Set new Primary Slot
F382H         LD E,(HL)    ; Read memory
F383H         JR WRPRM1    ; Restore old Primary Slot
```

This routine is used by the [RDSLT](#rdslt) standard routine to switch Primary Slots and read a byte from memory. The new Primary Slot Register setting is supplied in register A, the old setting in register D and the byte read returned in register E.

<a name="f385h"></a><a name="wrprim"></a>
<a name="f387h"></a>
<a name="f388h"></a><a name="wrprm1"></a>
<a name="f389h"></a>
<a name="f38bh"></a>

```
F385H WRPRIM: OUT (0A8H),A ; Set new Primary Slot
F387H         LD (HL),E    ; Write to memory
F388H WRPRM1: LD A,D       ; Get old setting
F389H         OUT (0A8H),A ; Restore old Primary Slot
F38BH         RET
```

This routine is used by the [WRSLT](#wrslt) standard routine to switch Primary Slots and write a byte to memory. The new Primary Slot Register setting is supplied in register A, the old setting in register D and the byte to write in register E.

<a name="f38ch"></a><a name="clprim"></a>
<a name="f38eh"></a>
<a name="f38fh"></a>
<a name="f392h"></a>
<a name="f393h"></a>
<a name="f394h"></a>
<a name="f396h"></a>
<a name="f397h"></a>
<a name="f398h"></a><a name="clprm1"></a>

```
F38CH CLPRIM: OUT (0A8H),A ; Set new Primary Slot
F38EH         EX AF,AF'    ; Swap to AF for call
F38FH         CALL CLPRM1  ; Do it
F392H         EX AF,AF'    ; Swap to AF
F393H         POP AF       ; Get old setting
F394H         OUT (0A8H),A ; Restore old Primary Slot
F396H         EX AF,AF'    ; Swap to AF
F397H         RET
F398H CLPRM1: JP (IX)
```

This routine is used by the [CALSLT](#calslt) standard routine to switch Primary Slots and call an address. The new Primary Slot Register setting is supplied in register A, the old setting on the Z80 stack and the address to call in register pair IX.

<a name="f39ah"></a><a name="usrtab"></a>
<a name="f39ch"></a>
<a name="f39eh"></a>
<a name="f3a0h"></a>
<a name="f3a2h"></a>
<a name="f3a4h"></a>
<a name="f3a6h"></a>
<a name="f3a8h"></a>
<a name="f3aah"></a>
<a name="f3ach"></a>

```
F39AH USRTAB: DEFW 475AH   ; USR 0
F39CH         DEFW 475AH   ; USR 1
F39EH         DEFW 475AH   ; USR 2
F3A0H         DEFW 475AH   ; USR 3
F3A2H         DEFW 475AH   ; USR 4
F3A4H         DEFW 475AH   ; USR 5
F3A6H         DEFW 475AH   ; USR 6
F3A8H         DEFW 475AH   ; USR 7
F3AAH         DEFW 475AH   ; USR 8
F3ACH         DEFW 475AH   ; USR 9
```

These ten variables contain the "`USR`" function addresses. Their values are set to the Interpreter "`Illegal function call`" error generator at power-up and thereafter only altered by the "`DEFUSR`" statement.

<a name="f3aeh"></a><a name="linl40"></a>

    F3AEH LINL40: DEFB 37

This variable contains the [40x24 Text Mode](#40x24_text_mode) screen width. Its value is set at power-up and thereafter only altered by the "`WIDTH`" statement.

<a name="f3afh"></a><a name="linl32"></a>

    F3AFH LINL32: DEFB 29

This variable contains the [32x24 Text Mode](#32x24_text_mode) screen width. Its value is set at power-up and thereafter only altered by the "`WIDTH`" statement.

<a name="f3b0h"></a><a name="linlen"></a>

    F3B0H LINLEN: DEFB 37

This variable contains the current text mode screen width. Its value is set from [LINL40](#linl40) or [LINL32](#linl32) whenever the VDP is initialized to a text mode via the [INITXT](#initxt) or [INIT32](#init32) standard routines.

<a name="f3b1h"></a><a name="crtcnt"></a>

    F3B1H CRTCNT: DEFB 24

This variable contains the number of rows on the screen. Its value is set at power-up and thereafter unaltered.

<a name="f3b2h"></a><a name="clmlst"></a>

    F3B2H CLMLST: DEFB 14

This variable contains the minimum number of columns that must still be available on a line for a data item to be "`PRINT`"ed, if less space is available a CR,LF is issued first. Its value is set at power-up and thereafter only altered by the "`WIDTH`" and "`SCREEN`" statements.

<a name="f3b3h"></a><a name="txtnam"></a>
<a name="f3b5h"></a><a name="txtcol"></a>
<a name="f3b7h"></a><a name="txtcgp"></a>
<a name="f3b9h"></a><a name="txtatr"></a>
<a name="f3bbh"></a><a name="txtpat"></a>

```
F3B3H TXTNAM: DEFW 0000H   ; Name Table Base
F3B5H TXTCOL: DEFW 0000H   ; Colour Table Base
F3B7H TXTCGP: DEFW 0800H   ; Character Pattern Base
F3B9H TXTATR: DEFW 0000H   ; Sprite Attribute Base
F3BBH TXTPAT: DEFW 0000H   ; Sprite Pattern Base
```

These five variables contain the [40x24 Text Mode](#40x24_text_mode) VDP base addresses. Their values are set at power-up and thereafter only altered by the "`BASE`" statement.

<a name="f3bdh"></a><a name="t32nam"></a>
<a name="f3bfh"></a><a name="t32col"></a>
<a name="f3c1h"></a><a name="t32cgp"></a>
<a name="f3c3h"></a><a name="t32atr"></a>
<a name="f3c5h"></a><a name="t32pat"></a>

```
F3BDH T32NAM: DEFW 1800H   ; Name Table Base
F3BFH T32COL: DEFW 2000H   ; Colour Table Base
F3C1H T32CGP: DEFW 0000H   ; Character Pattern Base
F3C3H T32ATR: DEFW 1B00H   ; Sprite Attribute Base
F3C5H T32PAT: DEFW 3800H   ; Sprite Pattern Base
```

These five variables contain the [32x24 Text Mode](#32x24_text_mode) VDP base addresses. Their values are set at power-up and thereafter only altered by the "`BASE`" statement.

<a name="f3c7h"></a><a name="grpnam"></a>
<a name="f3c9h"></a><a name="grpcol"></a>
<a name="f3cbh"></a><a name="grpcgp"></a>
<a name="f3cdh"></a><a name="grpatr"></a>
<a name="f3cfh"></a><a name="grppat"></a>

```
F3C7H GRPNAM: DEFW 1800H   ; Name Table Base
F3C9H GRPCOL: DEFW 2000H   ; Colour Table Base
F3CBH GRPCGP: DEFW 0000H   ; Character Pattern Base
F3CDH GRPATR: DEFW 1B00H   ; Sprite Attribute Base
F3CFH GRPPAT: DEFW 3800H   ; Sprite Pattern Base
```

These five variables contain the [Graphics Mode](#graphics_mode) VDP base addresses. Their values are set at power-up and thereafter only altered by the "`BASE`" statement.

<a name="f3d1h"></a><a name="mltnam"></a>
<a name="f3d3h"></a><a name="mltcol"></a>
<a name="f3d5h"></a><a name="mltcgp"></a>
<a name="f3d7h"></a><a name="mltatr"></a>
<a name="f3d9h"></a><a name="mltpat"></a>

```
F3D1H MLTNAM: DEFW 0800H   ; Name Table Base
F3D3H MLTCOL: DEFW 0000H   ; Colour Table Base
F3D5H MLTCGP: DEFW 0000H   ; Character Pattern Base
F3D7H MLTATR: DEFW 1B00H   ; Sprite Attribute Base
F3D9H MLTPAT: DEFW 3800H   ; Sprite Pattern Base
```

These five variables contain the [Multicolour Mode](#multicolour_mode) VDP base addresses. Their values are set at power-up and thereafter only altered by the "`BASE`" statement.

<a name="f3dbh"></a><a name="cliksw"></a>

    F3DBH CLIKSW: DEFB 01H

This variable controls the interrupt handler key click: 00H=Off, NZ=On. Its value is set at power-up and thereafter only altered by the "`SCREEN`" statement.

<a name="f3dch"></a><a name="csry"></a>

    F3DCH CSRY:   DEFB 01H

This variable contains the row coordinate (from 1 to [CTRCNT](#ctrcnt)) of the text mode cursor.

<a name="f3ddh"></a><a name="csrx"></a>

    F3DDH CSRX:   DEFB 01H

This variable contains the column coordinate (from 1 to [LINLEN](#linlen)) of the text mode cursor. Note that the BIOS cursor coordinates for the home position are 1,1 whatever the screen width.

<a name="f3deh"></a><a name="cnsdfg"></a>

    F3DEH CNSDFG: DEFB FFH

This variable contains the current state of the function key display: 00H=Off, NZ=On.

<a name="f3dfh"></a><a name="rg0sav"></a>
<a name="f3e0h"></a><a name="rg1sav"></a>
<a name="f3e1h"></a><a name="rg2sav"></a>
<a name="f3e2h"></a><a name="rg3sav"></a>
<a name="f3e3h"></a><a name="rg4sav"></a>
<a name="f3e4h"></a><a name="rg5sav"></a>
<a name="f3e5h"></a><a name="rg6sav"></a>
<a name="f3e6h"></a><a name="rg7sav"></a>

```
F3DFH RG0SAV: DEFB 00H
F3E0H RG1SAV: DEFB F0H
F3E1H RG2SAV: DEFB 00H
F3E2H RG3SAV: DEFB 00H
F3E3H RG4SAV: DEFB 01H
F3E4H RG5SAV: DEFB 00H
F3E5H RG6SAV: DEFB 00H
F3E6H RG7SAV: DEFB F4H
```

These eight variables mimic the state of the eight write-only [VDP Mode Registers](#vdp_mode_registers). The values shown are for [40x24 Text Mode](#40x24_text_mode).

<a name="f3e7h"></a><a name="statfl"></a>

    F3E7H STATFL: DEFB CAH

This variable is continuously updated by the interrupt handler with the contents of the [VDP Status Register](#vdp_status_register).

<a name="f3e8h"></a><a name="trgflg"></a>

    F3E8H TRGFLG: DEFB F1H

This variable is continuously updated by the interrupt handler with the state of the four joystick trigger inputs and the space key.

<a name="f3e9h"></a><a name="forclr"></a>

    F3E9H FORCLR: DEFB 0FH     ; White

This variable contains the current foreground colour. Its value is set at power-up and thereafter only altered by the "`COLOR`" statement. The foreground colour is used by the [CLRSPR](#clrspr) standard routine to set the sprite colour and by the [CHGCLR](#chgclr) standard routine to set the 1 pixel colour in the text modes. It also functions as the graphics ink colour as it is copied to [ATRBYT](#atrbyt) by the [GRPPRT](#grpprt) standard routine and used throughout the Interpreter as the default value for any optional colour operand.

<a name="f3eah"></a><a name="bakclr"></a>

    F3EAH BAKCLR: DEFB 04H     ; Dark blue

This variable contains the current background colour. Its value is set at power-up and thereafter only altered by the "`COLOR`" statement. The background colour is used by the [CLS](#cls) standard routine to clear the screen in the graphics modes and by the [CHGCLR](#chgclr) standard routine to set the 0 pixel colour in the text modes.

<a name="f3ebh"></a><a name="bdrclr"></a>

    F3EBH BDRCLR: DEFB 04H     ; Dark blue

This variable contains the current border colour. Its value is set at power-up and thereafter only altered by the "`COLOR`" statement. The border colour is used by the [CHGCLR](#chgclr) standard routine in [32x24 Text Mode](#32x24_text_mode), [Graphics Mode](#graphics_mode) and [Multicolour Mode](#multicolour_mode) to set the border colour.

<a name="f3ech"></a><a name="maxupd"></a>
<a name="f3edh"></a>

```
F3ECH MAXUPD: DEFB C3H
F3EDH         DEFW 0000H
```

These two bytes are filled in by the "`LINE`" statement handler to form a Z80 JP to the [RIGHTC](#rightc), [LEFTC](#leftc), [UPC](#upc) or [DOWNC](#downc) standard routines.

<a name="f3efh"></a><a name="minupd"></a>
<a name="f3f0h"></a>

```
F3EFH MINUPD: DEFB C3H
F3F0H         DEFW 0000H
```

These two bytes are filled in by the "`LINE`" statement handler to form a Z80 JP to the [RIGHTC](#rightc), [LEFTC](#leftc), [UPC](#upc) or [DOWNC](#downc) standard routines.

<a name="f3f2h"></a><a name="atrbyt"></a>

    F3F2H ATRBYT: DEFB 0FH

This variable contains the graphics ink colour used by the [SETC](#setc) and [NSETCX](#nsetcx) standard routines.

<a name="f3f3h"></a><a name="queues"></a>

    F3F3H QUEUES: DEFW F959H

This variable contains the address of the control blocks for the three music queues. Its value is set at power-up and thereafter unaltered.

<a name="f3f5h"></a><a name="frcnew"></a>

    F3F5H FRCNEW: DEFB FFH

This variable contains a flag to distinguish the two statements in the "`CLOAD/CLOAD?`" statement handler: 00H=CLOAD, FFH=CLOAD?.

<a name="f3f6h"></a><a name="scncnt"></a>

    F3F6H SCNCNT: DEFB 01H

This variable is used as a counter by the interrupt handler to control the rate at which keyboard scans are performed.

<a name="f3f7h"></a><a name="repcnt"></a>

    F3F7H REPCNT: DEFB 01H

This variable is used as a counter by the interrupt handler to control the key repeat rate.

<a name="f3f8h"></a><a name="putpnt"></a>

    F3F8H PUTPNT: DEFW FBF0H

This variable contains the address of the put position in [KEYBUF](#keybuf).

<a name="f3fah"></a><a name="getpnt"></a>

    F3FAH GETPNT: DEFW FBF0H

This variable contains the address of the get position in [KEYBUF](#keybuf).

<a name="f3fch"></a><a name="cs1200"></a>
<a name="f3fdh"></a>
<a name="f3feh"></a>
<a name="f3ffh"></a>
<a name="f400h"></a>

```
F3FCH CS1200: DEFB 53H     ; LO cycle 1st half
F3FDH         DEFB 5CH     ; LO cycle 2nd half
F3FEH         DEFB 26H     ; HI cycle 1st half
F3FFH         DEFB 2DH     ; HI cycle 2nd half
F400H         DEFB 0FH     ; Header cycle count
```

These five variables contain the 1200 baud cassette parameters. Their values are set at power-up and thereafter unaltered.

<a name="f401h"></a><a name="cs2400"></a>
<a name="f402h"></a>
<a name="f403h"></a>
<a name="f404h"></a>
<a name="f405h"></a>

```
F401H CS2400: DEFB 25H     ; LO cycle 1st half
F402H         DEFB 2DH     ; LO cycle 2nd half
F403H         DEFB 0EH     ; HI cycle 1st half
F404H         DEFB 16H     ; HI cycle 2nd half
F405H         DEFB 1FH     ; Header cycle count
```

These five variables contain the 2400 baud cassette parameters. Their values are set at power-up and thereafter unaltered.

<a name="f406h"></a><a name="low"></a>
<a name="f407h"></a>
<a name="f408h"></a><a name="high"></a>
<a name="f409h"></a>
<a name="f40ah"></a><a name="header"></a>

```
F406H LOW:    DEFB 53H     ; LO cycle 1st half
F407H         DEFB 5CH     ; LO cycle 2nd half
F408H HIGH:   DEFB 26H     ; HI cycle 1st half
F409H         DEFB 2DH     ; HI cycle 2nd half
F40AH HEADER: DEFB 0FH     ; Header cycle count
```

These five variables contain the current cassette parameters. Their values are set to 1200 baud at power-up and thereafter only altered by the "`CSAVE`" and "`SCREEN`" statements.

<a name="f40bh"></a><a name="aspct1"></a>

    F40BH ASPCT1: DEFW 0100H

This variable contains the reciprocal of the default "`CIRCLE`" aspect ratio multiplied by 256. Its value is set at power-up and thereafter unaltered.

<a name="f40dh"></a><a name="aspct2"></a>

    F40DH ASPCT2: DEFW 01C0H

This variable contains the default "`CIRCLE`" aspect ratio multiplied by 256. Its value is set at power-up and thereafter unaltered. The aspect ratio is present in two forms so that the "`CIRCLE`" statement handler can select the appropriate one immediately rather than needing to examine and possibly reciprocate it as is the case with an operand in the program text.

<a name="f40fh"></a><a name="endprg"></a>
<a name="f410h"></a>
<a name="f411h"></a>
<a name="f412h"></a>
<a name="f413h"></a>

```
F40FH ENDPRG: DEFB ":"
F410H         DEFB 00H
F411H         DEFB 00H
FE12H         DEFB 00H
F413H         DEFB 00H
```

These five bytes form a dummy program line. Their values are set at power-up and thereafter unaltered. The line exists in case an error occurs in the Interpreter Mainloop before any tokenized text is available in [KBUF](#kbuf). If an "`ON ERROR GOTO`" is active at this time then it provides some text for the "`RESUME`" statement to terminate on.

<a name="f414h"></a><a name="errflg"></a>

    F414H ERRFLG: DEFB 00H

This variable is used by the Interpreter error handler to save the error number.

<a name="f415h"></a><a name="lptpos"></a>

    F415H LPTPOS: DEFB 00H

This variable is used by the "`LPRINT`" statement handler to hold the current position of the printer head.

<a name="f416h"></a><a name="prtflg"></a>

    F416H PRTFLG: DEFB 00H

This variable determines whether the [OUTDO](#outdo) standard routine directs its output to the screen or to the printer: 00H=Screen, 01H=Printer.

<a name="f417h"></a><a name="ntmsxp"></a>

    F417H NTMSXP: DEFB 00H

This variable determines whether the [OUTDO](#outdo) standard routine will replace headered graphics characters directed to the printer with spaces: 00H=Graphics, NZ=Spaces. Its value is set at power-up and thereafter only altered by the "`SCREEN`" statement.

<a name="f418h"></a><a name="rawprt"></a>

    F418H RAWPRT: DEFB 00H

This variable determines whether the [OUTDO](#outdo) standard routine will modify control and headered graphics characters directed to the printer: 00H=Modify, NZ=Raw. Its value is set at power-up and thereafter unaltered.

<a name="f419h"></a><a name="vlzadr"></a>
<a name="f41bh"></a><a name="vlzdat"></a>

```
F419H VLZADR: DEFW 0000H
F41BH VLZDAT: DEFB 00H
```

These variables contain the address and value of any character temporarily removed by the "`VAL`" function.

<a name="f41ch"></a><a name="curlin"></a>

    F41CH CURLIN: DEFW FFFFH

This variable contains the current Interpreter line number. A value of FFFFH denotes direct mode.

<a name="f41eh"></a><a name="kbfmin"></a>

    F41EH KBFMIN: DEFB ":"

This byte provides a dummy prefix to the tokenized text contained in [KBUF](#kbuf). Its function is similar to that of [ENDPRG](#endprg) but is used for the situation where an error occurs within a direct statement.

<a name="f41fh"></a><a name="kbuf"></a>

    F41FH KBUF:   DEFS 318

This buffer contains the tokenized form of the input line collected by the Interpreter Mainloop. When a direct statement is executed the contents of this buffer form the program text.

<a name="f55dh"></a><a name="bufmin"></a>

    F55DH BUFMIN: DEFB ","

This byte provides a dummy prefix to the text contained in [BUF](#buf). It is used to synchronize the "`INPUT`" statement handler as it starts to analyze the input text.

<a name="f55eh"></a><a name="buf"></a>

    F55EH BUF:    DEFS 259

This buffer contains the text collected from the console by the [INLIN](#inlin) standard routine.

<a name="f661h"></a><a name="ttypos"></a>

    F661H TTYPOS: DEFB 00H

This variable is used by the "`PRINT`" statement handler to hold the current screen position (Teletype!).

<a name="f662h"></a><a name="dimflg"></a>

    F662H DIMFLG: DEFB 00H

This variable is normally zero but is set by the "`DIM`" statement handler to control the operation of the variable search routine.

<a name="f663h"></a><a name="valtyp"></a>

    F663H VALTYP: DEFB 02H

This variable contains the type code of the operand currently contained in [DAC](#dac): integer, 3=String, 4=Single Precision, 8=Double Precision.

<a name="f664h"></a><a name="dores"></a>

    F664H DORES:  DEFB 00H

This variable is normally zero but is set to prevent the tokenization of unquoted keywords following a "`DATA`" token.

<a name="f665h"></a><a name="donum"></a>

    F665H DONUM:  DEFB 00H

This variable is normally zero but is set when a numeric constant follows one of the keywords `GOTO`, `GOSUB`, `THEN`, etc., and must be tokenized to the special line number operand form.

<a name="f666h"></a><a name="contxt"></a>

    F666H CONTXT: DEFW 0000H

This variable is used by the [CHRGTR](#chrgtr) standard routine to save the address of the character following a numeric constant in the program text.

<a name="f668h"></a><a name="consav"></a>

    F668H CONSAV: DEFB 00H

This variable is used by the [CHRGTR](#chrgtr) standard routine to save the token of a numeric constant found in the program text.

<a name="f669h"></a><a name="contyp"></a>

    F669H CONTYP: DEFB 00H

This variable is used by the [CHRGTR](#chrgtr) standard routine to save the type of a numeric constant found in the program text.

<a name="f66ah"></a><a name="conlo"></a>

    F66AH CONLO:  DEFS 8

This buffer is used by the [CHRGTR](#chrgtr) standard routine to save the value of a numeric constant found in the program text.

<a name="f672h"></a><a name="memsiz"></a>

    F672H MEMSIZ: DEFW F168H

This variable contains the address of the top of the String Storage Area. Its value is set at power-up and thereafter only altered by the "`CLEAR`" and "`MAXFILES`" statements.

<a name="f674h"></a><a name="stktop"></a>

    F674H STKTOP: DEFW F0A0H

This variable contains the address of the top of the Z80 stack. Its value is set at power-up to [MEMSIZ](#memsiz)-200 and thereafter only altered by the "`CLEAR`" and "`MAXFILES`" statements.

<a name="f676h"></a><a name="txttab"></a>

    F676H TXTTAB: DEFW 8001H

This variable contains the address of the first byte of the Program Text Area. Its value is set at power-up and thereafter unaltered.

<a name="f678h"></a><a name="temppt"></a>

    F678H TEMPPT: DEFW F67AH

This variable contains the address of the next free location in [TEMPST](#tempst).

<a name="f67ah"></a><a name="tempst"></a>

    F67AH TEMPST: DEFS 30

This buffer is used to store string descriptors. It functions as a stack with string producers pushing their results and string consumers popping them.

<a name="f698h"></a><a name="dsctmp"></a>

    F698H DSCTMP: DEFS 3

This buffer is used by the string functions to hold a result descriptor while it is being constructed.

<a name="f69bh"></a><a name="fretop"></a>

    F69BH FRETOP: DEFW F168H

This variable contains the address of the next free location in the String Storage Area. When the area is empty [FRETOP](#fretop) is equal to [MEMSIZ](#memsiz).

<a name="f69dh"></a><a name="temp3"></a>

    F69DH TEMP3: DEFW 0000H

This variable is used for temporary storage by various parts of the Interpreter.

<a name="f69fh"></a><a name="temp8"></a>

    F69FH TEMP8:  DEFW 0000H

This variable is used for temporary storage by various parts of the Interpreter.

<a name="f6a1h"></a><a name="endfor"></a>

    F6A1H ENDFOR: DEFW 0000H

This variable is used by the "`FOR`" statement handler to hold the end of statement address during construction of a parameter block.

<a name="f6a3h"></a><a name="datlin"></a>

    F6A3H DATLIN: DEFW 0000H

This variable contains the line number of the current "`DATA`" item in the program text.

<a name="f6a5h"></a><a name="subflg"></a>

    F6A5H SUBFLG: DEFB 00H

This variable is normally zero but is set by the "`ERASE`", "`FOR`", "`FN`" and "`DEF FN`" handlers to control the processing of subscripts by the variable search routine.

<a name="f6a6h"></a><a name="flginp"></a>

    F6A6H FLGINP: DEFB 00H

This variable contains a flag to distinguish the two statements in the "`READ/INPUT`" statement handler: 00H=INPUT, NZ=READ.

<a name="f6a7h"></a><a name="temp"></a>

    F6A7H TEMP:   DEFW 0000H

This variable is used for temporary storage by various parts of the Interpreter.

<a name="f6a9h"></a><a name="ptrflg"></a>

    F6A9H PTRFLG: DEFB 00H

This variable is normally zero but is set if any line number operands in the Program Text Area have been converted to pointers.

<a name="f6aah"></a><a name="autflg"></a>

    F6AAH AUTFLG: DEFB 00H

This variable is normally zero but is set when "`AUTO`" mode is turned on.

<a name="f6abh"></a><a name="autlin"></a>

    F6ABH AUTLIN: DEFW 0000H

This variable contains the current "`AUTO`" line number.

<a name="f6adh"></a><a name="autinc"></a>

    F6ADH AUTINC: DEFW 0000H

This variable contains the current "`AUTO`" line number increment.

<a name="f6afh"></a><a name="savtxt"></a>

    F6AFH SAVTXT: DEFW 0000H

This variable is updated by the Runloop at the start of every statement with the current location in the program text. It is used during error recovery to set [ERRTXT](#errtxt) for the "`RESUME`" statement handler and [OLDTXT](#oldtxt) for the "`CONT`" statement handler.

<a name="f6b1h"></a><a name="savstk"></a>

    F6B1H SAVSTK: DEFW F09EH

This variable is updated by the Runloop at the start of every statement with the current Z80 SP for error recovery purposes.

<a name="f6b3h"></a><a name="errlin"></a>

    F6B3H ERRLIN: DEFW 0000H

This variable is used by the error handler to hold the line number of the program line generating an error.

<a name="f6b5h"></a><a name="dot"></a>

    F6B5H DOT:    DEFW 0000H

This variable is updated by the Mainloop and the error handler with the current line number for use with the "." parameter.

<a name="f6b7h"></a><a name="errtxt"></a>

    F6B7H ERRTXT: DEFW 0000H

This variable is updated from [SAVTXT](#savtxt) by the error handler for use by the "`RESUME`" statement handler.

<a name="f6b9h"></a><a name="onelin"></a>

    F6B9H ONELIN: DEFW 0000H

This variable is set by the "`ON ERROR GOTO`" statement handler with the address of the program line to execute when an error occurs.

<a name="f6bbh"></a><a name="oneflg"></a>

    F6BBH ONEFLG: DEFB 00H

This variable is normally zero but is set by the error handler when control transfers to an "`ON ERROR GOTO`" statement. This is to prevent a loop developing if an error occurs inside the error recovery statements.

<a name="f6bch"></a><a name="temp2"></a>

    F6BCH TEMP2:  DEFW 0000H

This variable is used for temporary storage by various parts of the Interpreter.

<a name="f6beh"></a><a name="oldlin"></a>

    F6BEH OLDLIN: DEFW 0000H

This variable contains the line number of the terminating program line. It is set by the "`END`" and "`STOP`" statement handlers for use with the "`CONT`" statement.

<a name="f6c0h"></a><a name="oldtxt"></a>

    F6C0H OLDTXT: DEFW 0000H

This variable contains the address of the terminating program statement.

<a name="f6c2h"></a><a name="vartab"></a>

    F6C2H VARTAB: DEFW 8003H

This variable contains the address of the first byte of the Variable Storage Area.

<a name="f6c4h"></a><a name="arytab"></a>

    F6C4H ARYTAB: DEFW 8003H

This variable contains the address of the first byte of the Array Storage Area.

<a name="f6c6h"></a><a name="strend"></a>

    F6C6H STREND: DEFW 8003H

This variable contains the address of the byte following the Array Storage Area.

<a name="f6c8h"></a><a name="datptr"></a>

    F6C8H DATPTR: DEFW 8000H

This variable contains the address of the current "`DATA`" item in the program text.

<a name="f6cah"></a><a name="deftbl"></a>
<a name="f6cbh"></a>
<a name="f6cch"></a>
<a name="f6cdh"></a>
<a name="f6ceh"></a>
<a name="f6cfh"></a>
<a name="f6d0h"></a>
<a name="f6d1h"></a>
<a name="f6d2h"></a>
<a name="f6d3h"></a>
<a name="f6d4h"></a>
<a name="f6d5h"></a>
<a name="f6d6h"></a>
<a name="f6d7h"></a>
<a name="f6d8h"></a>
<a name="f6d9h"></a>
<a name="f6dah"></a>
<a name="f6dbh"></a>
<a name="f6dch"></a>
<a name="f6ddh"></a>
<a name="f6deh"></a>
<a name="f6dfh"></a>
<a name="f6e0h"></a>
<a name="f6e1h"></a>
<a name="f6e2h"></a>
<a name="f6e3h"></a>

```
F6CAH DEFTBL: DEFB 08H     ; A
F6CBH         DEFB 08H     ; B
F6CCH         DEFB 08H     ; C
F6CDH         DEFB 08H     ; D
F6CEH         DEFB 08H     ; E
F6CFH         DEFB 08H     ; F
F6D0H         DEFB 08H     ; G
F6D1H         DEFB 08H     ; H
F6D2H         DEFB 08H     ; I
F6D3H         DEFB 08H     ; J
F6D4H         DEFB 08H     ; K
F6D5H         DEFB 08H     ; L
F6D6H         DEFB 08H     ; M
F6D7H         DEFB 08H     ; N
F6D8H         DEFB 08H     ; O
F6D9H         DEFB 08H     ; P
F6DAH         DEFB 08H     ; Q
F6DBH         DEFB 08H     ; R
F6DCH         DEFB 08H     ; S
F6DDH         DEFB 08H     ; T
F6DEH         DEFB 08H     ; U
F6DFH         DEFB 08H     ; V
F6E0H         DEFB 08H     ; W
F6E1H         DEFB 08H     ; X
F6E2H         DEFB 08H     ; Y
F6E3H         DEFB 08H     ; Z
```

These twenty-six variables contain the default type for each group of BASIC Variables. Their values are set to double precision at power-up, "`NEW`" and "`CLEAR`" and thereafter altered only by the "`DEF`" group of statements.

<a name="f6e4h"></a><a name="prmstk"></a>

    F6E4H PRMSTK: DEFW 0000H

This variable contains the base address of the previous "`FN`" parameter block on the Z80 stack. It is used during string garbage collection to travel from block to block on the stack.

<a name="f6e6h"></a><a name="prmlen"></a>

    F6E6H PRMLEN: DEFW 0000H

This variable contains the length of the current "`FN`" parameter block in [PARM1](#parm1).

<a name="f6e8h"></a><a name="parm1"></a>

    F6E8H PARM1 : DEFS 100

This buffer contains the local Variables belonging to the "`FN`" function currently being evaluated.

<a name="f74ch"></a><a name="prmprv"></a>

    F74CH PRMPRV: DEFW F6E4H

This variable contains the address of the previous "`FN`" parameter block. It is actually a constant used to ensure that string garbage collection commences with the current parameter block before proceeding to those on the stack.

<a name="f74eh"></a><a name="prmln2"></a>

    F74EH PRMLN2: DEFW 0000H

This variable contains the length of the "`FN`" parameter block being constructed in [PARM2](#parm2)

<a name="f750h"></a><a name="parm2"></a>

    F750H PARM2:  DEFS 100

This buffer is used to construct the local Variables owned by the current "`FN`" function.

<a name="f7b4h"></a><a name="prmflg"></a>

    F7B4H PRMFLG: DEFB 00H

This variable is used during a Variable search to indicate whether local or global Variables are being examined.

<a name="f7b5h"></a><a name="aryta2"></a>

    F7B5H ARYTA2: DEFW 0000H

This variable is used during a Variable search to hold the termination address of the storage area being examined.

<a name="f7b7h"></a><a name="nofuns"></a>

    F7B7H NOFUNS: DEFB 00H

This variable is normally zero but is set by the "`FN`" function handler to indicate to the variable search routine that local Variables are present.

<a name="f7b8h"></a><a name="temp9"></a>

    F7B8H TEMP9:  DEFW 0000H

This variable is used for temporary storage by various parts of the Interpreter.

<a name="f7bah"></a><a name="funact"></a>

    F7BAH FUNACT: DEFW 0000H

This variable contains the number of currently active "`FN`" functions.

<a name="f7bch"></a><a name="swptmp"></a>

    F7BCH SWPTMP: DEFS 8

This buffer is used to hold the first operand in a "`SWAP`" statement.

<a name="f7c4h"></a><a name="trcflg"></a>

    F7C4H TRCFLG: DEFB 00H

This variable is normally zero but is set by the "`TRON`" statement handler to turn on the trace facility.

<a name="f7c5h"></a><a name="fbuffr"></a>

    F7C5H FBUFFR: DEFS 43

This buffer is used to hold the text produced during numeric output conversion.

<a name="f7f0h"></a><a name="dectmp"></a>

    F7F0H DECTMP: DEFW 0000H

This variable is used for temporary storage by the double precision division routine.

<a name="f7f2h"></a><a name="dectm2"></a>

    F7F2H DECTM2: DEFW 0000H

This variable is used for temporary storage by the double precision division routine.

<a name="f7f4h"></a><a name="deccnt"></a>

    F7F4H DECCNT: DEFB 00H

This variable is used by the double precision division routine to hold the number of non-zero bytes in the mantissa of the second operand.

<a name="f7f6h"></a><a name="dac"></a>

    F7F6H DAC:    DEFS 16

This buffer functions as the Interpreter's primary accumulator during expression evaluation.

<a name="f806h"></a><a name="hold8"></a>

    F806H HOLD8:  DEFS 65

This buffer is used by the double precision multiplication routine to hold the multiples of the first operand.

<a name="f847h"></a><a name="arg"></a>

    F847H ARG:    DEFS 16

This buffer functions as the Interpreter's secondary accumulator during expression evaluation.

<a name="f857h"></a><a name="rndx"></a>

    F857H RNDX:   DEFS 8

This buffer contains the current double precision random number.

<a name="f85fh"></a><a name="maxfil"></a>

    F85FH MAXFIL: DEFB 01H

This variable contains the number of currently allocated user I/O buffers. Its value is set to 1 at power-up and thereafter only altered by the "`MAXFILES`" statement.

<a name="f860h"></a><a name="filtab"></a>

    F860H FILTAB: DEFW F16AH

This variable contains the address of the pointer table for the I/O buffer FCBs.

<a name="f862h"></a><a name="nulbuf"></a>

    F862H NULBUF: DEFW F177H

This variable contains the address of the first byte of the data buffer belonging to I/O buffer 0.

<a name="f864h"></a><a name="ptrfil"></a>

    F864H PTRFIL: DEFW 0000H

This variable contains the address of the currently active I/O buffer FCB.

<a name="f866h"></a><a name="filnam"></a>

    F866H FILNAM: DEFS 11

This buffer holds a user-specified filename. It is eleven characters long to allow for disc file specs such as "`FILENAME.BAS`".

<a name="f871h"></a><a name="filnm2"></a>

    F871H FILNM2: DEFS 11

This buffer holds a filename read from an I/O device for comparison with the contents of [FILNAM](#filnam).

<a name="f87ch"></a><a name="nlonly"></a>

    F87CH NLONLY: DEFB 00H

This variable is normally zero but is set during a program "`LOAD`". Bit 0 is used to prevent I/O buffer 0 being closed during loading and bit 7 to prevent the user I/O buffers being closed if auto-run is required.

<a name="f87dh"></a><a name="savend"></a>

    F87DH SAVEND: DEFW 0000H

This variable is used by the "`BSAVE`" statement handler to hold the end address of the memory block to be saved.

<a name="f87fh"></a><a name="fnkstr"></a>

    F87FH FNKSTR: DEFS 160

This buffer contains the ten sixteen-character function key strings. Their values are set at power-up and thereafter only altered by the "`KEY`" statement.

<a name="f91fh"></a><a name="cgpnt"></a>
<a name="f920h"></a>

```
F91FH CGPNT:  DEFB 00H     ; Slot ID
F920H         DEFW 1BBFH   ; Address
```

These variables contain the location of the character set copied to the VDP by the [INITXT](#initxt) and [INIT32](#init32) standard routines. Their values are set to the MSX ROM character set at power-up and thereafter unaltered.

<a name="f922h"></a><a name="nambas"></a>

    F922H NAMBAS: DEFW 0000H

This variable contains the current text mode VDP Name Table base address. Its value is set from [TXTNAM](#txtnam) or [T32NAM](#t32nam) whenever the VDP is initialized to a text mode via the [INITXT](#initxt) or [INIT32](#init32) standard routines.

<a name="f924h"></a><a name="cgpbas"></a>

    F924H CGPBAS: DEFW 0800H

This variable contains the current text mode VDP Character Pattern Table base address. Its value is set from [TXTCGP](#txtcgp) or [T32CGP](#t32cgp) whenever the VDP is initialized to a text mode via the [INITXT](#initxt) or [INIT32](#init32) standard routines.

<a name="f926h"></a><a name="patbas"></a>

    F926H PATBAS: DEFW 3800H

This variable contains the current VDP Sprite Pattern Table base address. Its value is set from [T32PAT](#t32pat), [GRPPAT](#grppat) or [MLTPAT](#mltpat) whenever the VDP is initialized via the [INIT32](#init32), [INIGRP](#inigrp) or [INIMLT](#inimlt) standard routines.

<a name="f928h"></a><a name="atrbas"></a>

    F928H ATRBAS: DEFW 1B00H

This variable contains the current VDP Sprite Attribute Table base address. Its value is set from [T32ATR](#t32atr), [GRPATR](#grpatr) or [MLTATR](#mltatr) whenever the VDP is initialized via the [INIT32](#init32), [INIGRP](#inigrp) or [INIMLT](#inimlt) standard routines.

<a name="f92ah"></a><a name="cloc"></a>
<a name="f92ch"></a><a name="cmask"></a>

```
F92AH CLOC:   DEFW 0000H   ; Pixel location
F92CH CMASK:  DEFB 80H     ; Pixel Mask
```

These variables contain the current pixel physical address used by the [RIGHTC](#rightc), [LEFTC](#leftc), [UPC](#upc), [TUPC](#tupc), [DOWNC](#downc), [TDOWNC](#tdownc), [FETCHC](#fetchc), [STOREC](#storec), [READC](#readc), [SETC](#setc), [NSETCX](#nsetcx), [SCANR](#scanr) and [SCANL](#scanl) standard routines. [CLOC](#cloc) holds the address of the byte containing the current pixel and [CMASK](#cmask) defines the pixel within that byte.

<a name="f92dh"></a><a name="mindel"></a>

    F92DH MINDEL: DEFW 0000H

This variable is used by the "`LINE`" statement handler to hold the minimum difference between the end points of the line.

<a name="f92fh"></a><a name="maxdel"></a>

    F92FH MAXDEL: DEFW 0000H

This variable is used by the "`LINE`" statement handler to hold the maximum difference between the end points of the line.

<a name="f931h"></a><a name="aspect"></a>

    F931H ASPECT: DEFW 0000H

This variable is used by the "`CIRCLE`" statement handler to hold the current aspect ratio. This is stored as a single byte binary fraction so an aspect ratio of 0.75 would become 00C0H. The MSB is only required if the aspect ratio is exactly 1.00, that is 0100H.

<a name="f933h"></a><a name="cencnt"></a>

    F933H CENCNT: DEFW 0000H

This variable is used by the "`CIRCLE`" statement handler to hold the point count of the end angle.

<a name="f935h"></a><a name="clinef"></a>

    F935H CLINEF: DEFB 00H

This variable is used by the "`CIRCLE`" statement handler to hold the two line flags. Bit 0 is set if a line is required from the start angle to the centre and bit 7 set if one is required from the end angle.

<a name="f936h"></a><a name="cnpnts"></a>

    F936H CNPNTS: DEFW 0000H

This variable is used by the "`CIRCLE`" statement handler to hold the number of points within a forty-five degree segment.

<a name="f938h"></a><a name="cplotf"></a>

    F938H CPLOTF: DEFB 00H

This variable is normally zero but is set by the "`CIRCLE`" statement handler if the end angle is smaller than the start angle. It is used to determine whether the pixels should be set "inside" the angles or "outside" them.

<a name="f939h"></a><a name="cpcnt"></a>

    F939H CPCNT:  DEFW 0000H

This variable is used by the "`CIRCLE`" statement handler to hold the point count within the current forty-five degree segment, this is in fact the Y coordinate.

<a name="f93bh"></a><a name="cpcnt8"></a>

    F93BH CPCNT8: DEFW 0000H

This variable is used by the "`CIRCLE`" statement handler to hold the total point count of the present position.

<a name="f93dh"></a><a name="crcsum"></a>

    F93DH CRCSUM: DEFW 0000H

This variable is used by the "`CIRCLE`" statement handler as the point computation counter.

<a name="f93fh"></a><a name="cstcnt"></a>

    F93FH CSTCNT: DEFW 0000H

This variable is used by the "`CIRCLE`" statement handler to hold the point count of the start angle.

<a name="f941h"></a><a name="csclxy"></a>

    F941H CSCLXY: DEFB 00H

This variable is used by the "`CIRCLE`" statement handler as a flag to determine in which direction the elliptic squash is to be applied: 00H=Y, 01H=X.

<a name="f942h"></a><a name="csavea"></a>

    F942H CSAVEA: DEFW 0000H

This variable is used for temporary storage by the [SCANR](#scanr) standard routine.

<a name="f944h"></a><a name="csavem"></a>

    F944H CSAVEM: DEFB 00h

This variable is used for temporary storage by the [SCANR](#scanr) standard routine.

<a name="f945h"></a><a name="cxoff"></a>

    F945H CXOFF:  DEFW 0000H

This variable is used for temporary storage by the "`CIRCLE`" statement handler.

<a name="f947h"></a><a name="cyoff"></a>

    F947H CYOFF:  DEFW 0000H

This variable is used for temporary storage by the "`CIRCLE`" statement handler.

<a name="f949h"></a><a name="lohmsk"></a>

    F949H LOHMSK: DEFB 00H

This variable is used by the "`PAINT`" statement handler to hold the leftmost position of a LH excursion.

<a name="f94ah"></a><a name="lohdir"></a>

    F94AH LOHDIR: DEFB 00H

This variable is used by the "`PAINT`" statement handler to hold the new paint direction required by a LH excursion.

<a name="f94bh"></a><a name="lohadr"></a>

    F94BH LOHADR: DEFW 0000H

This variable is used by the "`PAINT`" statement handler to hold the leftmost position of a LH excursion.

<a name="f94dh"></a><a name="lohcnt"></a>

    F94DH LOHCNT: DEFW 0000H

This variable is used by the "`PAINT`" statement handler to hold the size of a LH excursion.

<a name="f94fh"></a><a name="skpcnt"></a>

    F94FH SKPCNT: DEFW 0000H

This variable is used by the "`PAINT`" statement handler to hold the skip count returned by the [SCANR](#scanr) standard routine.

<a name="f951h"></a><a name="movcnt"></a>

    F951H MOVCNT: DEFW 0000H

This variable is used by the "`PAINT`" statement handler to hold the movement count returned by the [SCANR](#scanr) standard routine.

<a name="f953h"></a><a name="pdirec"></a>

    F953H PDIREC: DEFB 00H

This variable is used by the "`PAINT`" statement handler to hold the current paint direction: 40H=Down, C0H=Up, 00H=Terminate.

<a name="f954h"></a><a name="lfprog"></a>

    F954H LFPROG: DEFB 00H

This variable is normally zero but is set by the "`PAINT`" statement handler if there has been any leftwards progress.

<a name="f955h"></a><a name="rtprog"></a>

    F955H RTPROG: DEFB 00H

This variable is normally zero but is set by the "`PAINT`" statement handler if there has been any rightwards progress.

<a name="f956h"></a><a name="mcltab"></a>

    F956H MCLTAB: DEFW 0000H

This variable contains the address of the command table to be used by the macro language parser. The "`DRAW`" table is at 5D83H and the "`PLAY`" table at 752EH.

<a name="f958h"></a><a name="mclflg"></a>

    F958H MCLFLG: DEFB 00H

This variable is zero if the macro language parser is being used by the "`DRAW`", statement handler and non-zero if it is being used by "`PLAY`".

<a name="f959h"></a><a name="quetab"></a>
<a name="f95ah"></a>
<a name="f95bh"></a>
<a name="f95ch"></a>
<a name="f95dh"></a>
<a name="f95fh"></a>
<a name="f960h"></a>
<a name="f961h"></a>
<a name="f962h"></a>
<a name="f963h"></a>
<a name="f965h"></a>
<a name="f966h"></a>
<a name="f967h"></a>
<a name="f968h"></a>
<a name="f969h"></a>
<a name="f96bh"></a>
<a name="f96ch"></a>
<a name="f96dh"></a>
<a name="f96eh"></a>
<a name="f96fh"></a>

```
F959H QUETAB: DEFB 00H     ; AQ Put position
F95AH         DEFB 00H     ; AQ Get position
F95BH         DEFB 00H     ; AQ Putback flag
F95CH         DEFB 7FH     ; AQ Size
F95DH         DEFW F975H   ; AQ Address

F95FH         DEFB 00H     ; BQ Put position
F960H         DEFB 00H     ; BQ Get position
F961H         DEFB 00H     ; BQ Putback flag
F962H         DEFB 7FH     ; BQ Size
F963H         DEFW F9F5H   ; BQ Address

F965H         DEFB 00H     ; CQ Put position
F966H         DEFB 00H     ; CQ Get position
F967H         DEFB 00H     ; CQ Putback flag
F968H         DEFB 7FH     ; CQ Size
F969H         DEFW FA75H   ; CQ Address

F96BH         DEFB 00H     ; RQ Put position
F96CH         DEFB 00H     ; RQ Get position
F96DH         DEFB 00H     ; RQ Putback flag
F96EH         DEFB 00H     ; RQ Size
F96FH         DEFW 0000H   ; RQ Address
```

These twenty-four variables form the control blocks for the three music queues ([VOICAQ](#voicaq), [VOICBQ](#voicbq) and [VOICCQ](#voiccq)) and the RS232 queue. The three music control blocks are initialized by the [GICINI](#gicini) standard routine and thereafter maintained by the interrupt handler and the [PUTQ](#putq) standard routine. The RS232 control block is unused in the current MSX ROM.

<a name="f971h"></a><a name="quebak"></a>
<a name="f972h"></a>
<a name="f973h"></a>
<a name="f974h"></a>

```
F971H QUEBAK: DEFB 00H     ; AQ Putback character
F972H         DEFB 00H     ; BQ Putback character
F973H         DEFB 00H     ; CQ Putback character
F974H         DEFB 00H     ; RQ Putback character
```

These four variables are used to hold any unwanted character returned to the associated queue. Although the putback facility is implemented in the MSX ROM it is currently unused.

<a name="f975h"></a><a name="voicaq"></a>
<a name="f9f5h"></a><a name="voicbq"></a>
<a name="fa75h"></a><a name="voiccq"></a>
<a name="faf5h"></a><a name="rs2iq"></a>

```
F975H VOICAQ: DEFS 128     ; Voice A queue
F9F5H VOICBQ: DEFS 128     ; Voice B queue
FA75H VOICCQ: DEFS 128     ; Voice C queue
FAF5H RS2IQ:  DEFS 64      ; RS232 queue
```

These four buffers contain the three music queues and the RS232 queue, the latter is unused.

<a name="fb35h"></a><a name="prscnt"></a>

    FB35H PRSCNT: DEFB 00H

This variable is used by the "`PLAY`" statement handler to count the number of completed operand strings. Bit 7 is also set after each of the three operands has been parsed to prevent repeated activation of the [STRTMS](#strtms) standard routine.

<a name="fb36h"></a><a name="savsp"></a>

    FB36H SAVSP: DEFW 0000H

This variable is used by the "`PLAY`" statement handler to save the Z80 SP before control transfers to the macro language parser. Its value is compared with the SP on return to determine whether any data has been left on the stack because of a queue-full termination by the parser.

<a name="fb38h"></a><a name="voicen"></a>

    FB38H VOICEN: DEFB 00H

This variable contains the current voice number being processed by the "`PLAY`" statement handler. The values 0, 1 and 2 correspond to PSG channels A, B and C.

<a name="fb39h"></a><a name="savvol"></a>

    FB39H SAVVOL: DEFW 0000H

This variable is used by the "`PLAY`" statement "`R`" command handler to save the current volume setting while a zero-amplitude rest is generated.

<a name="fb3bh"></a><a name="mcllen"></a>

    FB3BH MCLLEN: DEFB 00H

This variable is used by the macro language parser to hold the length of the string operand being parsed.

<a name="fb3ch"></a><a name="mclptr"></a>

    FB3CH MCLPTR: DEFW 0000H

This variable is used by the macro language parser to hold the address of the string operand being parsed.

<a name="fb3eh"></a><a name="queuen"></a>

    FB3EH QUEUEN: DEFB 00H

This variable is used by the interrupt handler to hold the number of the music queue currently being processed. The values 0, 1 and 2 correspond to PSG channels A, B and C.

<a name="fb3fh"></a><a name="musicf"></a>

    FB3FH MUSICF: DEFB 00H

This variable contains three bit flags set by the [STRTMS](#strtms) standard routine to initiate processing of a music queue by the interrupt handler. Bits 0, 1 and 2 correspond to [VOICAQ](#voicaq), [VOICBQ](#voicbq) and [VOICCQ](#voiccq).

<a name="fb40h"></a><a name="plycnt"></a>

    FB40H PLYCNT: DEFB 00H

This variable is used by the [STRTMS](#strtms) standard routine to hold the number of "`PLAY`" statement sequences currently held in the music queues. It is examined when all three end of queue marks have been found for one sequence to determine whether dequeueing should be restarted.

<a name="fb41h"></a><a name="vcba"></a>
<a name="fb43h"></a>
<a name="fb44h"></a>
<a name="fb46h"></a>
<a name="fb48h"></a>
<a name="fb49h"></a>
<a name="fb50h"></a>
<a name="fb51h"></a>
<a name="fb52h"></a>
<a name="fb53h"></a>
<a name="fb54h"></a>
<a name="fb56h"></a>

```
FB41H VCBA:   DEFW 0000H   ; Duration counter
FB43H         DEFB 00H     ; String length
FB44H         DEFW 0000H   ; String address
FB46H         DEFW 0000H   ; Stack data address
FB48H         DEFB 00H     ; Music packet length
FB49H         DEFS 7       ; Music packet
FB50H         DEFB 04H     ; Octave
FB51H         DEFB 04H     ; Length
FB52H         DEFB 78H     ; Tempo
FB53H         DEFB 88H     ; Volume
FB54H         DEFW 00FFH   ; Envelope period
FB56H         DEFS 16      ; Space for stack data
```

This thirty-seven byte buffer is used by the "`PLAY`" statement handler to hold the current parameters for voice A.

<a name="fb66h"></a><a name="vcbb"></a>

    FB66H VCBB:   DEFS 37

This buffer is used by the "`PLAY`" statement handler to hold the current parameters for voice B, its structure is the same as [VCBA](#vcba).

<a name="fb8bh"></a><a name="vcbc"></a>

    FB8BH VCBC:   DEFS 37

This buffer is used by the "`PLAY`" statement handler to hold the current parameters for voice C, its structure is the same as [VCBA](#vcba).

<a name="fbb0h"></a><a name="enstop"></a>

    FBB0H ENSTOP: DEFB 00H

This variable determines whether the interrupt handler will execute a warm start to the Interpreter upon detecting the keys CODE, GRAPH, CTRL and SHIFT depressed together: 00H=Disable, NZ=Enable.

<a name="fbb1h"></a><a name="basrom"></a>

    FBB1H BASROM: DEFB 00H

This variable determines whether the [ISCNTC](#iscntc) and [INLIN](#inlin) standard routines will respond to the CTRL-STOP key: 00H=Enable, NZ=Disable. It is used to prevent termination of a BASIC ROM located during the power-up ROM search.

<a name="fbb2h"></a><a name="linttb"></a>

    FBB2H LINTTB: DEFS 24

Each of these twenty-four variables is normally non-zero but is zeroed if the contents of the corresponding screen row have overflowed onto the next row. They are maintained by the BIOS but only actually used by the [INLIN](#inlin) standard routine (the screen editor) to discriminate between logical and physical lines.

<a name="fbcah"></a><a name="fstpos"></a>

    FBCAH FSTPOS: DEFW 0000H

This variable is used to hold the cursor coordinates upon entry to the [INLIN](#inlin) standard routine. Its function is to restrict the extent of backtracking performed when the text is collected from the screen at termination.

<a name="fbcch"></a><a name="cursav"></a>

    FBCCH CURSAV: DEFB 00H

This variable is used to hold the screen character replaced by the text cursor.

<a name="fbcdh"></a><a name="fnkswi"></a>

    FBCDH FNKSWI: DEFB 00H

This variable is used by the [CHSNS](#chsns) standard routine to determine whether the shifted or unshifted function keys are currently displayed: 00H=Shifted, 01H=Unshifted.

<a name="fbceh"></a><a name="fnkflg"></a>

    FBCEH FNKFLG: DEFS 10

Each of these ten variables is normally zero but is set to 01H if the associated function key has been turned on by a "`KEY(n) ON`" statement. They are used by the interrupt handler to determine whether, in program mode only, it should return a character string or update the associated entry in [TRPTBL](#trptbl).

<a name="fbd8h"></a><a name="ongsbf"></a>

    FBD8H ONGSBF: DEFB 00H

This variable is normally zero but is incremented by the interrupt handler whenever a device has achieved the conditions necessary to generate a program interrupt. It is used by the Runloop to determine whether any program interrupts are pending without having to search [TRPTBL](#trptbl).

<a name="fbd9h"></a><a name="clikfl"></a>

    FBD9H CLIKFL: DEFB 00H

This variable is used internally by the interrupt handler to prevent spurious key clicks when returning multiple characters from a single key depression such as a function key.

<a name="fbdah"></a><a name="oldkey"></a>

    FBDAH OLDKEY: DEFS 11

This buffer is used by the interrupt handler to hold the previous state of the keyboard matrix, each byte contains one row of keys starting with row 0.

<a name="fbe5h"></a><a name="newkey"></a>

    FBE5H NEWKEY: DEFS 11

This buffer is used by the interrupt handler to hold the current state of the keyboard matrix. Key transitions are detected by comparison with the contents of [OLDKEY](#oldkey) after which [OLDKEY](#oldkey) is updated with the current state.

<a name="fbf0h"></a><a name="keybuf"></a>

    FBF0H KEYBUF: DEFS 40

This buffer contains the decoded keyboard characters produced by the interrupt handler. Note that the buffer is organized as a circular queue driven by [GETPNT](#getpnt) and [PUTPNT](#putpnt) and consequently has no fixed starting point.

<a name="fc18h"></a><a name="linwrk"></a>

    FC18H LINWRK: DEFS 40

This buffer is used by the BIOS to hold a complete line of screen characters.

<a name="fc40h"></a><a name="patwrk"></a>

    FC40H PATWRK: DEFS 8

This buffer is used by the BIOS to hold an 8x8 pixel pattern.

<a name="fc48h"></a><a name="bottom"></a>

    FC48H BOTTOM: DEFW 8000H

This variable contains the address of the lowest RAM location used by the Interpreter. Its value is set at power-up and thereafter unaltered.

<a name="fc4ah"></a><a name="himem"></a>

    FC4AH HIMEM:  DEFW F380H

This variable contains the address of the byte following the highest RAM location used by the Interpreter. Its value is set at power-up and thereafter only altered by the "`CLEAR`" statement.

<a name="fc4ch"></a><a name="trptbl"></a>
<a name="fc4fh"></a>
<a name="fc52h"></a>
<a name="fc55h"></a>
<a name="fc58h"></a>
<a name="fc5bh"></a>
<a name="fc5eh"></a>
<a name="fc61h"></a>
<a name="fc64h"></a>
<a name="fc67h"></a>
<a name="fc6ah"></a>
<a name="fc6dh"></a>
<a name="fc70h"></a>
<a name="fc73h"></a>
<a name="fc76h"></a>
<a name="fc79h"></a>
<a name="fc7ch"></a>
<a name="fc7fh"></a>
<a name="fc82h"></a>
<a name="fc85h"></a>
<a name="fc88h"></a>
<a name="fc8bh"></a>
<a name="fc8eh"></a>
<a name="fc91h"></a>
<a name="fc94h"></a>
<a name="fc97h"></a>

```
FC4CH TRPTBL: DEFS 3       ; KEY 1
FC4FH         DEFS 3       ; KEY 2
FC52H         DEFS 3       ; KEY 3
FC55H         DEFS 3       ; KEY 4
FC58H         DEFS 3       ; KEY 5
FC5BH         DEFS 3       ; KEY 6
FC5EH         DEFS 3       ; KEY 7
FC61H         DEFS 3       ; KEY 8
FC64H         DEFS 3       ; KEY 9
FC67H         DEFS 3       ; KEY 10
FC6AH         DEFS 3       ; STOP
FC6DH         DEFS 3       ; SPRITE
FC70H         DEFS 3       ; STRIG 0
FC73H         DEFS 3       ; STRIG 1
FC76H         DEFS 3       ; STRIG 2
FC79H         DEFS 3       ; STRIG 3
FC7CH         DEFS 3       ; STRIG 4
FC7FH         DEFS 3       ; INTERVAL
FC82H         DEFS 3       ; Unused
FC85H         DEFS 3       ; Unused
FC88H         DEFS 3       ; Unused
FC8BH         DEFS 3       ; Unused
FC8EH         DEFS 3       ; Unused
FC91H         DEFS 3       ; Unused
FC94H         DEFS 3       ; Unused
FC97H         DEFS 3       ; Unused
```

These twenty-six three byte variables hold the current state of the interrupt generating devices. The first byte of each entry contains the device status (bit 0=On, bit 1=Stop, bit 2=Event active) and is updated by the interrupt handler, the Runloop interrupt processor and the "`DEVICE 0=ON/OFF/STOP`" and "`RETURN`" statement handlers. The remaining two bytes of each entry are set by the "`ON DEVICE GOSUB`" statement handler and contain the address of the program line to execute upon a program interrupt.

<a name="fc9ah"></a><a name="rtycnt"></a>

    FC9AH RTYCNT: DEFB 00H

This variable is unused by the current MSX ROM.

<a name="fc9bh"></a><a name="intflg"></a>

    FC9BH INTFLG: DEFB 00H

This variable is normally zero but is set to 03H or 04H if the CTRL-STOP or STOP keys are detected by the interrupt handler.

<a name="fc9ch"></a><a name="pady"></a>

    FC9CH PADY:   DEFB 00H

This variable contains the Y coordinate of the last point detected by a touchpad.

<a name="fc9dh"></a><a name="padx"></a>

    FC9DH PADX:   DEFB 00H

This variable contains the X coordinate of the last point detected by a touchpad.

<a name="fc9eh"></a><a name="jiffy"></a>

    FC9EH JIFFY:  DEFW 0000H

This variable is continually incremented by the interrupt handler. Its value may be set or read by the "`TIME`" statement or function.

<a name="fca0h"></a><a name="intval"></a>

    FCA0H INTVAL: DEFW 0000H

This variable holds the interval duration set by the "`ON INTERVAL`" statement handler.

<a name="fca2h"></a><a name="intcnt"></a>

    FCA2H INTCNT: DEFW 0000H

This variable is continually decremented by the interrupt handler. When zero is reached its value is reset from [INTVAL](#intval) and, if applicable, a program interrupt generated. Note that this variable always counts irrespective of whether an "`INTERVAL ON`" statement is active.

<a name="fca4h"></a><a name="lowlim"></a>

    FCA4H LOWLIM: DEFB 31H

This variable is used to hold the minimum allowable start bit duration as determined by the [TAPION](#tapion) standard routine.

<a name="fca5h"></a><a name="winwid"></a>

    FCA5H WINWID: DEFB 22H

This variable is used to hold the LO/HI cycle discrimination duration as determined by the [TAPION](#tapion) standard routine.

<a name="fca6h"></a><a name="grphed"></a>

    FCA6H GRPHED: DEFB 00H

This variable is normally zero but is set to 01H by the [CNVCHR](#cnvchr) standard routine upon detection of a graphic header code.

<a name="fca7h"></a><a name="esccnt"></a>

    FCA7H ESCCNT: DEFB 00H

This variable is used by the [CHPUT](#chput) standard routine ESC sequence processor to count escape parameters.

<a name="fca8h"></a><a name="insflg"></a>

    FCA8H INSFLG: DEFB 00H

This variable is normally zero but is set to FFH by the [INLIN](#inlin) standard routine when insert mode is on.

<a name="fca9h"></a><a name="csrsw"></a>

    FCA9H CSRSW:  DEFB 00H

If this variable is zero the cursor is only displayed while the [CHGET](#chget) standard routine is waiting for a keyboard character. If it is non-zero the cursor is permanently displayed via the [CHPUT](#chput) standard routine.

<a name="fcaah"></a><a name="cstyle"></a>

    FCAAH CSTYLE: DEFB 00H

This variable determines the cursor style: 00H=Block, NZ=Underline.

<a name="fcabh"></a><a name="capst"></a>

    FCABH CAPST:  DEFB 00H

This variable is used by the interrupt handler to hold the current caps lock status: 00H=Off, NZ=On.

<a name="fcach"></a><a name="kanast"></a>

    FCACH KANAST: DEFB 00H

This variable is used to hold the keyboard Kana lock status on Japanese machines and the DEAD key status on European machines.

<a name="fcadh"></a><a name="kanamd"></a>

    FCADH KANAMD: DEFB 00H

This variable holds a keyboard mode on Japanese machines only.

<a name="fcaeh"></a><a name="flbmem"></a>

    FCAEH FLBMEM: DEFB 00H

This variable is set by the file I/O error generators but is otherwise unused.

<a name="fcafh"></a><a name="scrmod"></a>

    FCAFH SCRMOD: DEFB 00H

This variable contains the current screen mode: 0=[40x24 Text Mode](#40x24_text_mode), 1=[32x24 Text Mode](#32x24_text_mode), 2=[Graphics Mode](#graphics_mode), 3=[Multicolour Mode](#multicolour_mode).

<a name="fcb0h"></a><a name="oldscr"></a>

    FCB0H OLDSCR: DEFB 00H

This variable holds the screen mode of the last text mode set.

<a name="fcb1h"></a><a name="casprv"></a>

    FCB1H CASPRV: DEFB 00H

This variable is used to hold any character returned to an I/O buffer by the cassette putback function.

<a name="fcb2h"></a><a name="bdratr"></a>

    FCB2H BDRATR: DEFB 00H

This variable contains the boundary colour for the "`PAINT`" statement handler. Its value is set by the [PNTINI](#pntini) standard routine and used by the [SCANR](#scanr) and [SCANL](#scanl) standard routines.

<a name="fcb3h"></a><a name="gxpos"></a>

    FCB3H GXPOS:  DEFW 0000H

This variable is used for temporary storage of a graphics X coordinate.

<a name="fcb5h"></a><a name="gypos"></a>

    FCB5H GYPOS:  DEFW 0000H

This variable is used for temporary storage of a graphics Y coordinate.

<a name="fcb7h"></a><a name="grpacx"></a>

    FCB7H GRPACX: DEFW 0000H

This variable contains the current graphics X coordinate for the [GRPPRT](#grpprt) standard routine.

<a name="fcb9h"></a><a name="grpacy"></a>

    FCB9H GRPACY: DEFW 0000H

This variable contains the current graphics Y coordinate for the [GRPPRT](#grpprt) standard routine.

<a name="fcbbh"></a><a name="drwflg"></a>

    FCBBH DRWFLG: DEFB 00H

Bits 6 and 7 of this variable are set by the "`DRAW`" statement "`N`" and "`B`" command handlers to turn the associated mode on.

<a name="fcbch"></a><a name="drwscl"></a>

    FCBCH DRWSCL: DEFB 00H

This variable is used by the "`DRAW`" statement "`S`" command handler to hold the current scale factor.

<a name="fcbdh"></a><a name="drwang"></a>

    FCBDH DRWANG: DEFB 00H

This variable is used by the "`DRAW`" statement "`A`" command handler to hold the current angle.

<a name="fcbeh"></a><a name="runbnf"></a>

    FCBEH RUNBNF: DEFB 00H

This variable is normally zero but is set by the "`BLOAD`" statement handler when an auto-run "`R`" parameter is specified.

<a name="fcbfh"></a><a name="savent"></a>

    FCBFH SAVENT: DEFW 0000H

This variable contains the "`BSAVE`" and "`BLOAD`" entry address.

<a name="fcc1h"></a><a name="exptbl"></a>
<a name="fcc2h"></a>
<a name="fcc3h"></a>
<a name="fcc4h"></a>

```
FCC1H EXPTBL: DEFB 00H     ; Primary Slot 0
FCC2H         DEFB 00H     ; Primary Slot 1
FCC3H         DEFB 00H     ; Primary Slot 2
FCC4H         DEFB 00H     ; Primary Slot 3
```

Each of these four variables is normally zero but is set to 80H during the power-up RAM search if the associated Primary Slot is found to be expanded.

<a name="fcc5h"></a><a name="slttbl"></a>
<a name="fcc6h"></a>
<a name="fcc7h"></a>
<a name="fcc8h"></a>

```
FCC5H SLTTBL: DEFB 00H     ; Primary Slot 0
FCC6H         DEFB 00H     ; Primary Slot 1
FCC7H         DEFB 00H     ; Primary Slot 2
FCC8H         DEFB 00H     ; Primary Slot 3
```

These four variables duplicate the contents of the four possible Secondary Slot Registers. The contents of each variable should only be regarded as valid if [EXPTBL](#exptbl) shows the associated Primary Slot to be expanded.

<a name="fcc9h"></a><a name="sltatr"></a>
<a name="fccdh"></a>
<a name="fcd1h"></a>
<a name="fcd5h"></a>
<a name="fcd9h"></a>
<a name="fcddh"></a>
<a name="fce1h"></a>
<a name="fce5h"></a>
<a name="fce9h"></a>
<a name="fcedh"></a>
<a name="fcf1h"></a>
<a name="fcf5h"></a>
<a name="fcf9h"></a>
<a name="fcfdh"></a>
<a name="fd01h"></a>
<a name="fd05h"></a>

```
FCC9H SLTATR: DEFS 4       ; PS0, SS0
FCCDH         DEFS 4       ; PS0, SS1
FCD1H         DEFS 4       ; PS0, SS2
FCD5H         DEFS 4       ; PS0, SS3

FCD9H         DEFS 4       ; PS1, SS0
FCDDH         DEFS 4       ; PS1, SS1
FCE1H         DEFS 4       ; PS1, SS2
FCE5H         DEFS 4       ; PS1, SS3

FCE9H         DEFS 4       ; PS2, SS0
FCEDH         DEFS 4       ; PS2, SS1
FCF1H         DEFS 4       ; PS2, SS2
FCF5H         DEFS 4       ; PS2, SS3

FCF9H         DEFS 4       ; PS3, SS0
FCFDH         DEFS 4       ; PS3, SS1
FD01H         DEFS 4       ; PS3, SS2
FD05H         DEFS 4       ; PS3, SS3
```

These sixty-four variables contain the attributes of any extension ROMs found during the power-up ROM search. The characteristics of each 16 KB ROM are encoded into a single byte so four bytes are required for each possible slot. The encoding is:

```
Bit 7 set=BASIC program
Bit 6 set=Device handler
Bit 5 set=Statement handler
```

Note that the entries for page 0 (0000H to 3FFFH) and page 3 (C000H to FFFFH) will always be zero as only page 1 (4000H to 7FFFH) and page 2 (8000H to BFFFH) are actually examined. The MSX convention is that machine code extension ROMs are placed in page 1 and BASIC program ROMs in page 2.

<a name="fd09h"></a><a name="sltwrk"></a>

    FD09H SLTWRK: DEFS 128

This buffer provides two bytes of local workspace for each of the sixty-four possible extension ROMs.

<a name="fd89h"></a><a name="procnm"></a>

    FD89H PROCNM: DEFS 16

This buffer is used to hold a device or statement name for examination by an extension ROM.

<a name="fd99h"></a><a name="device"></a>

    FD99H DEVICE: DEFB 00H

This variable is used to pass a device code, from 0 to 3, to an extension ROM.

<a name="the_hooks"></a>
## The Hooks

The section of the Workspace Area from FD9AH to FFC9H contains one hundred and twelve hooks, each of which is filled with five Z80 RET opcodes at power-up. These are called from strategic locations within the BIOS/Interpreter so that the ROM can be extended, particularly so that it can be upgraded to Disk BASIC. Each hook has sufficient room to hold a far call to any slot:

```
RST 30H
DEFB Slot ID
DEFW Address
RET
```

The hooks are listed on the following pages together with the address they are called from and a brief note as to their function.

|ADDRESS                    |NAME   |SIZE   |FROM           |FUNCTION|
|---------------------------|-------|-------|---------------|---------------------------------|
|<a name="fd9ah"></a>FD9AH  |HKEYI: |DEFS 5 |0C4AH          |Interrupt handler|
|<a name="fd9fh"></a>FD9FH  |HTIMI: |DEFS 5 |0C53H          |Interrupt handler|
|<a name="fda4h"></a>FDA4H  |HCHPU: |DEFS 5 |08C0H          |[CHPUT](#chput) standard routine|
|<a name="fda9h"></a>FDA9H  |HDSPC: |DEFS 5 |09E6H          |Display cursor|
|<a name="fdaeh"></a>FDAEH  |HERAC: |DEFS 5 |0A33H          |Erase cursor|
|<a name="fdb3h"></a>FDB3H  |HDSPF: |DEFS 5 |0B2BH          |[DSPFNK](#dspfnk) standard routine|
|<a name="fdb8h"></a>FDB8H  |HERAF: |DEFS 5 |0B15H          |[ERAFNK](#erafnk) standard routine|
|<a name="fdbdh"></a>FDBDH  |HTOTE: |DEFS 5 |0842H          |[TOTEXT](#totext) standard routine|
|<a name="fdc2h"></a>FDC2H  |HCHGE: |DEFS 5 |10CEH          |[CHGET](#chget) standard routine|
|<a name="fdc7h"></a>FDC7H  |HINIP: |DEFS 5 |071EH          |Copy character set to VDP|
|<a name="fdcch"></a>FDCCH  |HKEYC: |DEFS 5 |1025H          |Keyboard decoder|
|<a name="fdd1h"></a>FDD1H  |HKYEA: |DEFS 5 |0F10H          |Keyboard decoder|
|<a name="fdd6h"></a>FDD6H  |HNMI:  |DEFS 5 |1398H          |[NMI](#nmi) standard routine|
|<a name="fddbh"></a>FDDBH  |HPINL: |DEFS 5 |23BFH          |[PINLIN](#pinlin) standard routine|
|<a name="fde0h"></a>FDE0H  |HQINL: |DEFS 5 |23CCH          |[QINLIN](#qinlin) standard routine|
|<a name="fde5h"></a>FDE5H  |HINLI: |DEFS 5 |23D5H          |[INLIN](#inlin) standard routine|
|<a name="fdeah"></a>FDEAH  |HONGO: |DEFS 5 |7810H          |"`ON DEVICE GOSUB`"|
|<a name="fdefh"></a>FDEFH  |HDSKO: |DEFS 5 |7C16H          |"`DSKO$`"|
|<a name="fdf4h"></a>FDF4H  |HSETS: |DEFS 5 |7C1BH          |"`SET`"|
|<a name="fdf9h"></a>FDF9H  |HNAME: |DEFS 5 |7C20H          |"`NAME`"|
|<a name="fdfeh"></a>FDFEH  |HKILL: |DEFS 5 |7C25H          |"`KILL`"|
|<a name="fe03h"></a>FE03H  |HIPL:  |DEFS 5 |7C2AH          |"`IPL`"|
|<a name="fe08h"></a>FE08H  |HCOPY: |DEFS 5 |7C2FH          |"`COPY`"|
|<a name="fe0dh"></a>FE0DH  |HCMD:  |DEFS 5 |7C34H          |"`CMD`"|
|<a name="fe12h"></a>FE12H  |HDSKF: |DEFS 5 |7C39H          |"`DSKF`"|
|<a name="fe17h"></a>FE17H  |HDSKI: |DEFS 5 |7C3EH          |"`DSKI$`"|
|<a name="fe1ch"></a>FE1CH  |HATTR: |DEFS 5 |7C43H          |"`ATTR$`"|
|<a name="fe21h"></a>FE21H  |HLSET: |DEFS 5 |7C48H          |"`LSET`"|
|<a name="fe26h"></a>FE26H  |HRSET: |DEFS 5 |7C4DH          |"`RSET`"|
|<a name="fe2bh"></a>FE2BH  |HFIEL: |DEFS 5 |7C52H          |"`FIELD`"|
|<a name="fe30h"></a>FE30H  |HMKI$: |DEFS 5 |7C57H          |"`MKI$`"|
|<a name="fe35h"></a>FE35H  |HMKS$: |DEFS 5 |7C5CH          |"`MKS$`"|
|<a name="fe3ah"></a>FE3AH  |HMKD$: |DEFS 5 |7C61H          |"`MKD$`"|
|<a name="fe3fh"></a>FE3FH  |HCVI:  |DEFS 5 |7C66H          |"`CVI`"|
|<a name="fe44h"></a>FE44H  |HCVS:  |DEFS 5 |7C6BH          |"`CVS`"|
|<a name="fe49h"></a>FE49H  |HCVD:  |DEFS 5 |7C70H          |"`CVD`"|
|<a name="fe4eh"></a>FE4EH  |HGETP: |DEFS 5 |6A93H          |Locate FCB|
|<a name="fe53h"></a>FE53H  |HSETF: |DEFS 5 |6AB3H          |Locate FCB|
|<a name="fe58h"></a>FE58H  |HNOFO: |DEFS 5 |6AF6H          |"`OPEN`"|
|<a name="fe5dh"></a>FE5DH  |HNULO: |DEFS 5 |6B0FH          |"`OPEN`"|
|<a name="fe62h"></a>FE62H  |HNTFL: |DEFS 5 |6B3BH          |Close I/O buffer 0|
|<a name="fe67h"></a>FE67H  |HMERG: |DEFS 5 |6B63H          |"`MERGE/LOAD`"|
|<a name="fe6ch"></a>FE6CH  |HSAVE: |DEFS 5 |6BA6H          |"`SAVE`"|
|<a name="fe71h"></a>FE71H  |HBINS: |DEFS 5 |6BCEH          |"`SAVE`"|
|<a name="fe76h"></a>FE76H  |HBINL: |DEFS 5 |6BD4H          |"`MERGE/LOAD`"|
|<a name="fe7bh"></a>FE7BH  |HFILE: |DEFS 5 |6C2FH          |"`FILES`"|
|<a name="fe80h"></a>FE80H  |HDGET: |DEFS 5 |6C3BH          |"`GET/PUT`"|
|<a name="fe85h"></a>FE85H  |HFILO: |DEFS 5 |6C51H          |Sequential output|
|<a name="fe8ah"></a>FE8AH  |HINDS: |DEFS 5 |6C79H          |Sequential input|
|<a name="fe8fh"></a>FE8FH  |HRSLF: |DEFS 5 |6CD8H          |"`INPUT$`"|
|<a name="fe94h"></a>FE94H  |HSAVD: |DEFS 5 |6D03H, 6D14H   |"`LOC`", "`LOF`",|
|                           |       |       |6D25H, 6D39H   |"`EOF`", "`FPOS`"|
|<a name="fe99h"></a>FE99H  |HLOC:  |DEFS 5 |6D0FH          |"`LOC`"|
|<a name="fe9eh"></a>FE9EH  |HLOF:  |DEFS 5 |6D20H          |"`LOF`"|
|<a name="fea3h"></a>FEA3H  |HEOF:  |DEFS 5 |6D33H          |"`EOF`"|
|<a name="fea8h"></a>FEA8H  |HFPOS: |DEFS 5 |6D43H          |"`FPOS`"|
|<a name="feadh"></a>FEADH  |HBAKU: |DEFS 5 |6E36H          |"`LINE INPUT#`"|
|<a name="feb2h"></a>FEB2H  |HPARD: |DEFS 5 |6F15H          |Parse device name|
|<a name="feb7h"></a>FEB7H  |HNODE: |DEFS 5 |6F33H          |Parse device name|
|<a name="febch"></a>FEBCH  |HPOSD: |DEFS 5 |6F37H          |Parse device name|
|<a name="fec1h"></a>FEC1H  |HDEVN: |DEFS 5 |               |This hook is not used.|
|<a name="fec6h"></a>FEC6H  |HGEND: |DEFS 5 |6F8FH          |I/O function dispatcher|
|<a name="fecbh"></a>FECBH  |HRUNC: |DEFS 5 |629AH          |Run-clear|
|<a name="fed0h"></a>FED0H  |HCLEA: |DEFS 5 |62A1H          |Run-clear|
|<a name="fed5h"></a>FED5H  |HLOPD: |DEFS 5 |62AFH          |Run-clear|
|<a name="fedah"></a>FEDAH  |HSTKE: |DEFS 5 |62F0H          |Reset stack|
|<a name="fedfh"></a>FEDFH  |HISFL: |DEFS 5 |145FH          |[ISFLIO](#isflio) standard routine |
|<a name="fee4h"></a>FEE4H  |HOUTD: |DEFS 5 |1B46H          |[OUTDO](#outdo) standard routine|
|<a name="fee9h"></a>FEE9H  |HCRDO: |DEFS 5 |7328H          |CR,LF to [OUTDO](#outdo)|
|<a name="feeeh"></a>FEEEH  |HDSKC: |DEFS 5 |7374H          |Mainloop line input|
|<a name="fef3h"></a>FEF3H  |HDOGR: |DEFS 5 |593CH          |Line draw|
|<a name="fef8h"></a>FEF8H  |HPRGE: |DEFS 5 |4039H          |Program end|
|<a name="fefdh"></a>FEFDH  |HERRP: |DEFS 5 |40DCH          |Error handler|
|<a name="ff02h"></a>FF02H  |HERRF: |DEFS 5 |40FDH          |Error handler|
|<a name="ff07h"></a>FF07H  |HREAD: |DEFS 5 |4128H          |Mainloop "`OK`"|
|<a name="ff0ch"></a>FF0CH  |HMAIN: |DEFS 5 |4134H          |Mainloop|
|<a name="ff11h"></a>FF11H  |HDIRD: |DEFS 5 |41A8H          |Mainloop direct statement|
|<a name="ff16h"></a>FF16H  |HFINI: |DEFS 5 |4237H          |Mainloop finished|
|<a name="ff1bh"></a>FF1BH  |HFINE: |DEFS 5 |4247H          |Mainloop finished|
|<a name="ff20h"></a>FF20H  |HCRUN: |DEFS 5 |42B9H          |Tokenize|
|<a name="ff25h"></a>FF25H  |HCRUS: |DEFS 5 |4353H          |Tokenize|
|<a name="ff2ah"></a>FF2AH  |HISRE: |DEFS 5 |437CH          |Tokenize|
|<a name="ff2fh"></a>FF2FH  |HNTFN: |DEFS 5 |43A4H          |Tokenize|
|<a name="ff34h"></a>FF34H  |HNOTR: |DEFS 5 |44EBH          |Tokenize|
|<a name="ff39h"></a>FF39H  |HSNGF: |DEFS 5 |45D1H          |"`FOR`"|
|<a name="ff3eh"></a>FF3EH  |HNEWS: |DEFS 5 |4601H          |Runloop new statement|
|<a name="ff43h"></a>FF43H  |HGONE: |DEFS 5 |4646H          |Runloop execute|
|<a name="ff48h"></a>FF48H  |HCHRG: |DEFS 5 |4666H          |[CHRGTR](#chrgtr) standard routine|
|<a name="ff4dh"></a>FF4DH  |HRETU: |DEFS 5 |4821H          |"`RETURN`"|
|<a name="ff52h"></a>FF52H  |HPRTF: |DEFS 5 |4A5EH          |"`PRINT`"|
|<a name="ff57h"></a>FF57H  |HCOMP: |DEFS 5 |4A54H          |"`PRINT`"|
|<a name="ff5ch"></a>FF5CH  |HFINP: |DEFS 5 |4AFFH          |"`PRINT`"|
|<a name="ff61h"></a>FF61H  |HTRMN: |DEFS 5 |4B4DH          |"`READ/INPUT`" error|
|<a name="ff66h"></a>FF66H  |HFRME: |DEFS 5 |4C6DH          |Expression Evaluator|
|<a name="ff6bh"></a>FF6BH  |HNTPL: |DEFS 5 |4CA6H          |Expression Evaluator|
|<a name="ff70h"></a>FF70H  |HEVAL: |DEFS 5 |4DD9H          |Factor Evaluator|
|<a name="ff75h"></a>FF75H  |HOKNO: |DEFS 5 |4F2CH          |Factor Evaluator|
|<a name="ff7ah"></a>FF7AH  |HFING: |DEFS 5 |4F3EH          |Factor Evaluator|
|<a name="ff7fh"></a>FF7FH  |HISMI: |DEFS 5 |51C3H          |Runloop execute|
|<a name="ff84h"></a>FF84H  |HWIDT: |DEFS 5 |51CCH          |"`WIDTH`"|
|<a name="ff89h"></a>FF89H  |HLIST: |DEFS 5 |522EH          |"`LIST`"|
|<a name="ff8eh"></a>FF8EH  |HBUFL: |DEFS 5 |532DH          |Detokenize|
|<a name="ff93h"></a>FF93H  |HFRQI: |DEFS 5 |543FH          |Convert to integer|
|<a name="ff98h"></a>FF98H  |HSCNE: |DEFS 5 |5514H          |Line number to pointer|
|<a name="ff9dh"></a>FF9DH  |HFRET: |DEFS 5 |67EEH          |Free descriptor|
|<a name="ffa2h"></a>FFA2H  |HPTRG: |DEFS 5 |5EA9H          |Variable search|
|<a name="ffa7h"></a>FFA7H  |HPHYD: |DEFS 5 |148AH          |[PHYDIO](#phydio) standard routine|
|<a name="ffach"></a>FFACH  |HFORM: |DEFS 5 |148EH          |[FORMAT](#format) standard routine|
|<a name="ffb1h"></a>FFB1H  |HERRO: |DEFS 5 |406FH          |Error handler|
|<a name="ffb6h"></a>FFB6H  |HLPTO: |DEFS 5 |085DH          |[LPTOUT](#lptout) standard routine|
|<a name="ffbbh"></a>FFBBH  |HLPTS: |DEFS 5 |0884H          |[LPTSTT](#lptstt) standard routine|
|<a name="ffc0h"></a>FFC0H  |HSCRE: |DEFS 5 |79CCH          |"`SCREEN`"|
|<a name="ffc5h"></a>FFC5H  |HPLAY: |DEFS 5 |73E5H          |"`PLAY`" statement|

</a>

The Workspace Area from FFCAH to FFFFH is unused. (on MSX 1)
