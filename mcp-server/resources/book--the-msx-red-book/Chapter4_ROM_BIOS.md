# 4. ROM BIOS

The design of the MSX ROM is of importance if machine code programs are to be developed efficiently and Operate reliably. Almost every program, including the BASIC Interpreter itself, will require a certain set of primitive functions to operate. These include screen and printer drivers, a keyboard decoder and other hardware related functions. By separating these routines from the BASIC Interpreter they can be made available to any application program. The section of ROM from 0000H to 268BH is largely devoted to such routines and is called the ROM BIOS (Basic Input Output System).

This chapter gives a functional description of every recognizably separate routine in the ROM BIOS. Special attention is given to the "standard" routines. These are documented by Microsoft and guaranteed to remain consistent through possible hardware and software changes. The first few hundred bytes of the ROM consists of Z80 JP instructions which provide fixed position entry points to these routines. For maximum compatibility with future software an application program should restrict its dependence on the ROM to these locations only. The description of the ROM begins with this list of entry points to the standard routines. A brief comment is placed with each entry point, the full description is given with the routine itself.

<a name="data_areas"></a>
## Data Areas

It is expected that most users will wish to disassemble the ROM to some extent (the full listing runs to nearly four hundred pages). In order to ease this process the data areas, which do not contain executable Z80 code, are shown below:

```
0004H-0007H     185DH-1863H     4B3AH-4B4CH     73E4H-73E4H
002BH-002FH     1B97H-1BAAH     4C2FH-4C3FH     752EH-7585H
0508H-050DH     1BBFH-23BEH     555AH-5569H     7754H-7757H
092FH-097FH     2439H-2459H     5D83H-5DB0H     7BA3H-7BCAH
0DA5H-0EC4H     2CF1H-2E70H     6F76H-6F8EH     7ED8H-7F26H
1033H-105AH     3030H-3039H     70FFH-710CH     7F41H-7FB6H
1061H-10C1H     3710H-3719H     7182H-7195H     7FBEH-7FFFH
1233H-1252H     392EH-3FE1H     71A2H-71B5H
13A9H-1448H     43B5H-43C3H     71C7H-71DAH
160BH-1612H     46E6H-46E7H     72A6H-72B9H
```

Note that these data areas are for the UK ROM, there are slight differences in the Japanese ROM relating to the keyboard decoder and the video character set. Disparities between the ROMs are restricted to these regions with the bulk of the code being identical in both cases.

<a name="terminology"></a>
## Terminology

Reference is frequently made in this chapter to the standard routines and to Workspace Area variables. Whenever this is done the Microsoft-recommended name is used in upper case letters, for example "the [FILVRM](#filvrm) standard routine" and "[SCRMOD](#scrmod) is set". Subroutines which are not named are referred to by a parenthesized address, "the screen is cleared ([0777H](#0777h))" for example. When reference is made to the Z80 status flags assembly language conventions are used, for example "Flag C" would mean that the carry flag is set while "Flag NZ" means that the zero flag is reset. The terms "EI" and "DI" mean enabled interrupts and disabled interrupts respectively.

|ADDRESS    |NAME               |TO                 |FUNCTION
|:---------:|:-----------------:|:-----------------:|--------------------------------------
|0000H      |[CHKRAM](#chkram)  |[02D7H](#02d7h)    |Power-up, check RAM
|0004H      |......             |.....              |Two bytes, address of ROM character set
|0006H      |......             |.....              |One byte, VDP [Data Port](#data_port) number
|0007H      |......             |.....              |One byte, VDP [Data Port](#data_port) number
|0008H      |[SYNCHR](#synchr)  |[2683H](#2683h)    |Check BASIC program character
|000BH      |......             |.....              |NOP
|000CH      |[RDSLT](#rdslt)    |[01B6H](#01b6h)    |Read RAM in any slot
|000FH      |......             |.....              |NOP
|0010H      |[CHRGTR](#chrgtr)  |[2686H](#2686h)    |Get next BASIC program character
|0013H      |......             |.....              |NOP
|0014H      |[WRSLT](#wrslt)    |[01D1H](#01d1h)    |Write to RAM in any slot
|0017H      |......             |.....              |NOP
|0018H      |[OUTDO](#outdo)    |[1B45H](#1b45h)    |Output to current device
|001BH      |......             |.....              |NOP
|001CH      |[CALSLT](#calslt)  |[0217H](#0217h)    |Call routine in any slot
|001FH      |......             |.....              |NOP
|0020H      |[DCOMPR](#dcompr)  |[146AH](#146ah)    |Compare register pairs HL and DE
|0023H      |......             |.....              |NOP
|0024H      |[ENASLT](#enaslt)  |[025EH](#025eh)    |Enable any slot permanently
|0027H      |......             |.....              |NOP
|0028H      |[GETYPR](#getypr)  |[2689H](#2689h)    |Get BASIC operand type
|002BH      |......             |.....              |Five bytes Version Number
|0030H      |[CALLF](#callf)    |[0205H](#0205h)    |Call routine in any slot
|0033H      |......             |.....              |Five NOPs
|0038H      |[KEYINT](#keyint)  |[0C3CH](#0c3ch)    |Interrupt handler, keyboard scan
|003BH      |[INITIO](#initio)  |[049DH](#049dh)    |Initialize I/O devices
|003EH      |[INIFNK](#inifnk)  |[139DH](#139dh)    |Initialize function key strings
|0041H      |[DISSCR](#disscr)  |[0577H](#0577h)    |Disable screen
|0044H      |[ENASCR](#enascr)  |[0570H](#0570h)    |Enable screen
|0047H      |[WRTVDP](#wrtvdp)  |[057FH](#057fh)    |Write to any VDP register
|004AH      |[RDVRM](#rdvrm)    |[07D7H](#07d7h)    |Read byte from VRAM
|004DH      |[WRTVRM](#wrtvrm)  |[07CDH](#07cdh)    |Write byte to VRAM
|0050H      |[SETRD](#setrd)    |[07ECH](#07ech)    |Set up VDP for read
|0053H      |[SETWRT](#setwrt)  |[07DFH](#07dfh)    |Set up VDP for write
|0056H      |[FILVRM](#filvrm)  |[0815H](#0815h)    |Fill block of VRAM with data byte
|0059H      |[LDIRMV](#ldirmv)  |[070FH](#070fh)    |Copy block to memory from VRAM
|005CH      |[LDIRVM](#ldirvm)  |[0744H](#0744h)    |Copy block to VRAM, from memory
|005FH      |[CHGMOD](#chgmod)  |[084FH](#084fh)    |Change VDP mode
|0062H      |[CHGCLR](#chgclr)  |[07F7H](#07f7h)    |Change VDP colours
|0065H      |......             |.....              |NOP
|0066H      |[NMI](#nmi)        |[1398H](#1398h)    |Non Maskable Interrupt handler
|0069H      |[CLRSPR](#clrspr)  |[06A8H](#06a8h)    |Clear all sprites
|006CH      |[INITXT](#initxt)  |[050EH](#050eh)    |Initialize VDP to [40x24 Text Mode](#40x24_text_mode)
|006FH      |[INIT32](#init32)  |[0538H](#0538h)    |Initialize VDP to [32x24 Text Mode](#32x24_text_mode)
|0072H      |[INIGRP](#inigrp)  |[05D2H](#05d2h)    |Initialize VDP to [Graphics Mode](#graphics_mode)
|0075H      |[INIMLT](#inimlt)  |[061FH](#061fh)    |Initialize VDP to [Multicolour Mode](#multicolor_mode)
|0078H      |[SETTXT](#settxt)  |[0594H](#0594h)    |Set VDP to [40x24 Text Mode](#40x24_text_mode)
|007BH      |[SETT32](#sett32)  |[05B4H](#05b4h)    |Set VDP to [32x24 Text Mode](#32x24_text_mode)
|007EH      |[SETGRP](#setgrp)  |[0602H](#0602h)    |Set VDP to [Graphics Mode](#graphics_mode)
|0081H      |[SETMLT](#setmlt)  |[0659H](#0659h)    |Set VDP to [Multicolour Mode](#multicolour_mode)
|0084H      |[CALPAT](#calpat)  |[06E4H](#06e4h)    |Calculate address of sprite pattern
|0087H      |[CALATR](#calatr)  |[06F9H](#06f9h)    |Calculate address of sprite attribute
|008AH      |[GSPSIZ](#gspsiz)  |[0704H](#0704h)    |Get sprite size
|008DH      |[GRPPRT](#grpprt)  |[1510H](#1510h)    |Print character on graphic screen
|0090H      |[GICINI](#gicini)  |[04BDH](#04bdh)    |Initialize PSG (GI Chip)
|0093H      |[WRTPSG](#wrtpsg)  |[1102H](#1102h)    |Write to any PSG register
|0096H      |[RDPSG](#rdpsg)    |[110EH](#110eh)    |Read from any PSG register
|0099H      |[STRTMS](#strtms)  |[11C4H](#11c4h)    |Start music dequeueing
|009CH      |[CHSNS](#chsns)    |[0D6AH](#0d6ah)    |Sense keyboard buffer for character
|009FH      |[CHGET](#chget)    |[10CBH](#10cbh)    |Get character from keyboard buffer (wait)
|00A2H      |[CHPUT](#chput)    |[08BCH](#08bch)    |Screen character output
|00A5H      |[LPTOUT](#lptout)  |[085DH](#085dh)    |Line printer character output
|00A8H      |[LPTSTT](#lptstt)  |[0884H](#0884h)    |Line printer status test
|00ABH      |[CNVCHR](#cnvchr)  |[089DH](#089dh)    |Convert character with graphic header
|00AEH      |[PINLIN](#pinlin)  |[23BFH](#23bfh)    |Get line from console (editor)
|00B1H      |[INLIN](#inlin)    |[23D5H](#23d5h)    |Get line from console (editor)
|00B4H      |[QINLIN](#qinlin)  |[23CCH](#23cch)    |Display "`?`", get line from console (editor)
|00B7H      |[BREAKX](#breakx)  |[046FH](#046fh)    |Check CTRL-STOP key directly
|00BAH      |[ISCNTC](#iscntc)  |[03FBH](#03fbh)    |Check CRTL-STOP key
|00BDH      |[CKCNTC](#ckcntc)  |[10F9H](#10f9h)    |Check CTRL-STOP key
|00C0H      |[BEEP](#beep)      |[1113H](#1113h)    |Go beep
|00C3H      |[CLS](#cls)        |[0848H](#0848h)    |Clear screen
|00C6H      |[POSIT](#posit)    |[088EH](#088eh)    |Set cursor position
|00C9H      |[FNKSB](#fnksb)    |[0B26H](#0b26h)    |Check if function key display on
|00CCH      |[ERAFNK](#erafnk)  |[0B15H](#0b15h)    |Erase function key display
|00CFH      |[DSPFNK](#dspfnk)  |[0B2BH](#0b2bh)    |Display function keys
|00D2H      |[TOTEXT](#totext)  |[083BH](#083bh)    |Return VDP to text mode
|00D5H      |[GTSTCK](#gtstck)  |[11EEH](#11eeh)    |Get joystick status
|00D8H      |[GTTRIG](#gttrig)  |[1253H](#1253h)    |Get trigger status
|00DBH      |[GTPAD](#gtpad)    |[12ACH](#12ach)    |Get touch pad status
|00DEH      |[GTPDL](#gtpdl)    |[1273H](#1273h)    |Get paddle status
|00E1H      |[TAPION](#tapion)  |[1A63H](#1a63h)    |Tape input ON
|00E4H      |[TAPIN](#tapin)    |[1ABCH](#1abch)    |Tape input
|00E7H      |[TAPIOF](#tapiof)  |[19E9H](#19e9h)    |Tape input OFF
|00EAH      |[TAPOON](#tapoon)  |[19F1H](#19f1h)    |Tape output ON
|00EDH      |[TAPOUT](#tapout)  |[1A19H](#1a19h)    |Tape output
|00F0H      |[TAPOOF](#tapoof)  |[19DDH](#19ddh)    |Tape output OFF
|00F3H      |[STMOTR](#stmotr)  |[1384H](#1384h)    |Turn motor ON/OFF
|00F6H      |[LFTQ](#lftq)      |[14EBH](#14ebh)    |Space left in music queue
|00F9H      |[PUTQ](#putq)      |[1492H](#1492h)    |Put byte in music queue
|00FCH      |[RIGHTC](#rightc)  |[16C5H](#16c5h)    |Move current pixel physical address right
|00FFH      |[LEFTC](#leftc)    |[16EEH](#16eeh)    |Move current pixel physical address left
|0102H      |[UPC](#upc)        |[175DH](#175dh)    |Move current pixel physical address up
|0105H      |[TUPC](#tupc)      |[173CH](#173ch)    |Test then [UPC](#upc) if legal
|0108H      |[DOWNC](#downc)    |[172AH](#172ah)    |Move current pixel physical address down
|010BH      |[TDOWNC](#tdownc)  |[170AH](#170ah)    |Test then [DOWNC](#downc) if legal
|010EH      |[SCALXY](#scalxy)  |[1599H](#1599h)    |Scale graphics coordinates
|0111H      |[MAPXYC](#mapxyc)  |[15DFH](#15dfh)    |Map graphic coordinates to physical address
|0114H      |[FETCHC](#fetchc)  |[1639H](#1639h)    |Fetch current pixel physical address
|0117H      |[STOREC](#storec)  |[1640H](#1640h)    |Store current pixel physical address
|011AH      |[SETATR](#setatr)  |[1676H](#1676h)    |Set attribute byte
|011DH      |[READC](#readc)    |[1647H](#1647h)    |Read attribute of current pixel
|0120H      |[SETC](#setc)      |[167EH](#167eh)    |Set attribute of current pixel
|0123H      |[NSETCX](#nsetcx)  |[1809H](#1809h)    |Set attribute of number of pixels
|0126H      |[GTASPC](#gtaspc)  |[18C7H](#18c7h)    |Get aspect ratio
|0129H      |[PNTINI](#pntini)  |[18CFH](#18cfh)    |Paint initialize
|012CH      |[SCANR](#scanr)    |[18E4H](#18e4h)    |Scan pixels to right
|012FH      |[SCANL](#scanl)    |[197AH](#197ah)    |Scan pixels to left
|0132H      |[CHGCAP](#chgcap)  |[0F3DH](#0f3dh)    |Change Caps Lock LED
|0135H      |[CHGSND](#chgsnd)  |[0F7AH](#0f7ah)    |Change Key Click sound output
|0138H      |[RSLREG](#rslreg)  |[144CH](#144ch)    |Read Primary Slot Register
|013BH      |[WSLREG](#wslreg)  |[144FH](#144fh)    |Write to Primary Slot Register
|013EH      |[RDVDP](#rdvdp)    |[1449H](#1449h)    |Read VDP Status Register
|0141H      |[SNSMAT](#snsmat)  |[1452H](#1452h)    |Read row of keyboard matrix
|0144H      |[PHYDIO](#phydio)  |[148AH](#148ah)    |Disk, no action
|0147H      |[FORMAT](#format)  |[148EH](#148eh)    |Disk, no action
|014AH      |[ISFLIO](#isflio)  |[145FH](#145fh)    |Check for file I/O
|014DH      |[OUTDLP](#outdlp)  |[1B63H](#1b63h)    |Formatted output to line printer
|0150H      |[GETVCP](#getvcp)  |[1470H](#1470h)    |Get music voice pointer
|0153H      |[GETVC2](#getvc2)  |[1474H](#1474h)    |Get music voice pointer
|0156H      |[KILBUF](#kilbuf)  |[0468H](#0468h)    |Clear keyboard buffer
|0159H      |[CALBAS](#calbas)  |[01FFH](#01ffh)    |Call to BASIC from any slot
|015CH      |......             |.....              |NOPs to 01B5H for expansion

<a name="01b6h"></a><a name="rdslt"></a>

```
Address... 01B6H
Name...... RDSLT
Entry..... A=Slot ID, HL=Address
Exit...... A=Byte read
Modifies.. AF, BC, DE, DI
```

Standard routine to read a single byte from memory in any slot. The Slot Identifier is composed of a Primary Slot number a Secondary Slot number and a flag:

<a name="figure34"></a>![][CH04F34]

**Figure 34:** Slot ID

The flag is normally 0 but must be 1 if a Secondary Slot number is included in the Slot ID. The memory address and Slot ID are first processed ([027EH](#027eh)) to yield a set of bit masks to apply to the relevant slot register. If a Secondary Slot number is specified then the Secondary Slot Register is first modified to select the relevant page from that Secondary Slot ([02A3H](#02a3h)). The Primary Slot is then switched in to the Z80 address space, the byte read and the Primary Slot restored to its original setting via the [RDPRIM](#rdprim) routine in the Workspace Area. Finally, if a Secondary Slot number is included in the Slot ID, the original Secondary Slot Register setting is restored (01ECH).

Note that, unless it is the slot containing the Workspace Area, any attempt to access page 3 (C000H to FFFFH) will cause the system to crash as [RDPRIM](#rdprim) will switch itself out. Note also that interrupts are left disabled by all the memory switching routines.

<a name="01d1h"></a><a name="wrslt"></a>

```
Address... 01D1H
Name...... WRSLT
Entry..... A=Slot ID, HL=Address, E=Byte to write
Exit...... None
Modifies.. AF, BC, D, DI
```

Standard routine to write a single byte to memory in any slot. Its operation is fundamentally the same as that of the [RDSLT](#rdslt) standard routine except that the Workspace Area routine [WRPRIM](#wrprim) is used rather than [RDPRIM](#rdprim).

<a name="01ffh"></a><a name="calbas"></a>

```
Address... 01FFH
Name...... CALBAS
Entry..... IX=Address
Exit...... None
Modifies.. AF', BC', DE', HL', IY, DI
```

Standard routine to call an address in the BASIC Interpreter from any slot. Usually this will be from a machine code program running in an extension ROM in page 1 (4000H to 7FFFH). The high byte of register pair IY is loaded with the MSX ROM Slot ID (00H) and control transfers to the [CALSLT](#calslt) standard routine.

<a name="0205h"></a><a name="callf"></a>

```
Address... 0205H
Name...... CALLF
Entry..... None
Exit...... None
Modifies.. AF', BC', DE', HL', IX, IY, DI
```

Standard routine to call an address in any slot. The Slot ID and address are supplied as inline parameters rather than in registers to fit inside a hook ([Chapter 6](chapter_6)), for example:

```
RST 30H
DEFB Slot ID
DEFW Address
RET
```

The Slot ID is first collected and placed in the high byte of register pair IY. The address is then placed in register pair IX and control drops into the [CALSLT](#calslt) standard routine.

<a name="0217h"></a><a name="calslt"></a>

```
Address... 0217H
Name...... CALSLT
Entry..... IY(High byte)=Slot ID, IX=Address
Exit...... None
Modifies.. AF', BC', DE', HL', DI
```

Standard routine to call an address in any slot. Its operation is fundamentally the same as that of the [RDSLT](#rdslt) standard routine except that the Workspace Area routine [CLPRIM](#clprim) is used rather than [RDPRIM](#rdprim). Note that [CALBAS](#calbas) and [CALLF](#callf) are just specialized entry points to this standard routine which offer a reduction in the amount of code required.

<a name="025eh"></a><a name="enaslt"></a>

```
Address... 025EH
Name...... ENASLT
Entry..... A=Slot ID, HL=Address
Exit...... None
Modifies.. AF, BC, DE, DI
```

Standard routine to switch in a page permanently from any slot. Unlike the [RDSLT](#rdslt), [WRSLT](#wrslt) and [CALSLT](#calslt) standard routines the Primary Slot switching is performed directly and not by a Workspace Area routine. Consequently addresses in page 0 (0000H to 3FFFH) will cause an immediate system crash.

<a name="027eh"></a>

    Address... 027EH

This routine is used by the memory switching standard routines to turn an address, in register pair HL, and a Slot ID, in register A, into a set of bit masks. As an example a Slot ID of FxxxSSPP and an address in Page 1 (4000H to 7FFFH) would return the following:

```
Register B=00 00 PP 00 (OR mask)
Register C=11 11 00 11 (AND mask)
Register D=PP PP PP PP (Replicated)
Register E=00 00 11 00 (Page mask)
```

Registers B and C are derived from the Primary Slot number and the page mask. They are later used to mix the new Primary Slot number into the existing contents of the Primary Slot Register. Register D contains the Primary Slot number replicated four times and register E the page mask. This is produced by examining the two most significant bits of the address, to determine the page number, and then shifting the mask along to the relevant position. These registers are later used during Secondary Slot switching.

As the routine terminates bit 7 of the Slot ID is tested, to determine whether a Secondary Slot has been specified, and Flag M returned if this is so.

<a name="02a3h"></a>

    Address... 02A3H

This routine is used by the memory switching standard routines to modify a Secondary Slot Register. The Slot ID is supplied in register A while registers D and E contain the bit masks shown in the previous routine.

Bits 6 and 7 of register D are first copied into the Primary Slot register. This switches in page 3 from the Primary Slot specified by the Slot ID and makes the required Secondary Slot Register available. This is then read from memory location FFFFH and the page mask, inverted, used to clear the required two bits. The Secondary Slot number is shifted to the relevant position and mixed in. Finally the new setting is placed in the Secondary Slot Register and the Primary Slot Register restored to its original setting.

<a name="02d7h"></a><a name="chkram"></a>

```
Address... 02D7H
Name...... CHKRAM
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, SP
```

Standard routine to perform memory initialization at power- up. It non-destructively tests for RAM in pages 2 and 3 in all sixteen possible slots then sets the Primary and Secondary Slot registers to switch in the largest area found. The entire Workspace Area (F380H to FFC9H) is zeroed and [EXPTBL](#exptbl) and [SLTTBL](#slttbl) filled in to map any expansion interfaces in existence Interrupt Mode 1 is set and control transfers to the remainder of the power-up initialization routine ([7C76H](#7c76h)).

<a name="03fbh"></a><a name="iscntc"></a>

```
Address... 03FBH
Name...... ISCNTC
Entry..... None
Exit...... None
Modifies.. AF, EI
```

Standard routine to check whether the CTRL-STOP or STOP keys have been pressed. It is used by the BASIC Interpreter at the end of each statement to check for program termination. [BASROM](#basrom) is first examined to see if it contains a non-zero value, if so the routine terminates immediately. This is to prevent users breaking into any extension ROM containing a BASIC program.

[INTFLG](#intflg) is then checked to determine whether the interrupt handler has placed the CTRL-STOP or STOP key codes (03H or 04H) there. If STOP has been detected then the cursor is turned on ([09DAH](#09dah)) and [INTFLG](#intflg) continually checked until one of the two key codes reappears. The cursor is then turned off ([0A27H](#0a27h)) and, if the key is STOP, the routine terminates.

If CTRL-STOP has been detected then the keyboard buffer is first cleared via the [KILBUF](#kilbuf) standard routine and [TRPTBL](#trptbl) is checked to see whether an "`ON STOP GOSUB`" statement is active. If so the relevant entry in [TRPTBL](#trptbl) is updated ([0EF1H](#0ef1h)) and the routine terminates as the event will be handled by the Interpreter Runloop. Otherwise the [ENASLT](#enaslt) standard routine is used to switch in page 1 from the MSX ROM, in case an extension ROM is using the routine, and control transfers to the "`STOP`" statement handler (63E6H).

<a name="0468h"></a><a name="kilbuf"></a>

```
Address... 0468H
Name...... KILBUF
Entry..... None
Exit...... None
Modifies.. HL
```

Standard Routine to clear the forty character type-ahead keyboard buffer [KEYBUF](#keybuf). There are two pointers into this buffer, [PUTPNT](#putpnt) where the interrupt handler places characters, and [GETPNT](#getpnt) where application programs fetch them from. As the number of characters in the buffer is indicated by the difference between these two pointers [KEYBUF](#keybuf) is emptied simply by making them both equal.

<a name="046fh"></a><a name="breakx"></a>

```
Address... 046FH
Name...... BREAKX
Entry..... None
Exit...... Flag C if CTRL-STOP key pressed
Modifies.. AF
```

Standard routine which directly tests rows 6 and 7 of the keyboard to determine whether the CTRL and STOP keys are both pressed. If they are then [KEYBUF](#keybuf) is cleared and row 7 of [OLDKEY](#oldkey) modified to prevent the interrupt handler picking the keys up as well. This routine may often be more suitable for use by an application program, in preference to [ISCNTC](#iscntc), as it will work when interrupts are disabled, during cassette I/O for example, and does not exit to the Interpreter.

<a name="049dh"></a><a name="initio"></a>

```
Address... 049DH
Name...... INITIO
Entry..... None
Exit...... None
Modifies.. AF, E, EI
```

Standard routine to initialize the PSG and the Centronics Status Port. [PSG Register 7](#register_7) is first set to 80H making PSG Port B=Output and PSG Port A=Input. [PSG Register 15](#register_15) is set to CFH to initialize the Joystick connector control hardware. [PSG Register 14](#register_14) is then read and the Keyboard Mode bit placed in [KANAMD](#kanamd), this has no relevance for UK machines.

Finally a value of FFH is output to the Centronics Status Port (I/O port 90H) to set the [STROBE](#strobe) signal high. Control then drops into the [GICINI](#gicini) standard routine to complete initialization.

<a name="04bdh"></a><a name="gicini"></a>

```
Address... 04BDH
Name...... GICINI
Entry..... None
Exit...... None
Modifies.. EI
```

Standard routine to initialize the PSG and the Workspace Area variables associated with the "`PLAY`" statement. [QUETAB](#quetab), [VCBA](#vcba), [VCBB](#vcbb) and [VCBC](#vcbc) are first initialized with the values shown in Chapter 6. PSG Registers [8](#register_8), [9](#register_9) and [10](#register_10) are then set to zero amplitude and [PSG Register 7](#register_7) to B8H. This enables the Tone Generator and disables the Noise Generator on each channel.

<a name="0508h"></a>

    Address... 0508H

This six byte table contains the "`PLAY`" statement parameters initially placed in [VCBA](#vcba), [VCBB](#vcbb) and [VCBC](#vcbc) by the [GICINI](#gicini) standard routine: Octave=4, Length=4, Tempo=120, Volume=88H, Envelope=00FFH.

<a name="050eh"></a><a name="initxt"></a>

```
Address... 050EH
Name...... INITXT
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to initialize the VDP to [40x24 Text Mode](#40x24_text_mode). The screen is temporarily disabled via the [DISSCR](#disscr) standard routine and [SCRMOD](#scrmod) and [OLDSCR](#oldscr) set to 00H. The parameters required by the [CHPUT](#chput) standard routine are set up by copying [LINL40](#linl40) to [LINLEN](#linlen), [TXTNAM](#txtnam) to [NAMBAS](#nambas) and [TXTCGP](#txtcgp) to [CGPBAS](#cgpbas). The VDP colours are then set by the [CHGCLR](#chgclr) standard routine and the screen is cleared (077EH). The current character set is copied into the VRAM Character Pattern Table ([071EH](#071eh)). Finally the VDP mode and base addresses are set via the [SETTXT](#settxt) standard routine and the screen is enabled.

<a name="0538h"></a><a name="init32"></a>

```
Address... 0538H
Name...... INIT32
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to initialize the VDP to [32x24 Text Mode](#32x24_text_mode). The screen is temporarily disabled via the [DISSCR](#disscr) standard routine and [SCRMOD](#scrmod) and [OLDSCR](#oldscr) set to 01H. The parameters required by the [CHPUT](#chput) standard routine are set up by copying [LINL32](#linl32) to [LINLEN](#linlen), [T32NAM](#t32nam) to [NAMBAS](#nambas), [T32CGP](#t32cgp) to [CGPBAS](#cgpbas), [T32PAT](#t32pat) to [PATBAS](#patbas) and [T32ATR](#t32atr) to [ATRBAS](#atrbas). The VDP colours are then set via the [CHGCLR](#chgclr) standard routine and the screen is cleared (077EH). The current character set is copied into the VRAM Character Pattern Table ([071EH](#071eh)) and all sprites cleared (06BBH). Finally the VDP mode and base addresses are set via the [SETT32](#sett32) standard routine and the screen is enabled.

<a name="0570h"></a><a name="enascr"></a>

```
Address... 0570H
Name...... ENASCR
Entry..... None
Exit...... None
Modifies.. AF, BC, EI
```

Standard routine to enable the screen. This simply involves setting bit 6 of VDP [Mode Register 1](#mode_register_1).

<a name="0577h"></a><a name="disscr"></a>

```
Address... 0577H
Name...... DISSCR
Entry..... None
Exit...... None
Modifies.. AF, BC, EI
```

Standard routine to disable the screen. This simply involves resetting bit 6 of VDP [Mode Register 1](#mode_register_1).

<a name="057fh"></a><a name="wrtvdp"></a>

```
Address... 057FH
Name...... WRTVDP
Entry..... B=Data byte, C=VDP Mode Register number
Exit...... None
Modifies.. AF, B, EI
```

Standard routine to write a data byte to any VDP [Mode Register](#vdp_mode_registers). The register selection byte is first written to the VDP [Command Port](#commandpport), followed by the data byte. This is then copied to the relevant register image, [RG0SAV](#rg0sav) to [RG7SAV](#rg7sav), in the Workspace Area

<a name="0594h"></a><a name="settxt"></a>

```
Address... 0594H
Name...... SETTXT
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to partially set the VDP to [40x24 Text Mode](#40x24_text_mode). The mode bits M1, M2 and M3 are first set in VDP Mode Registers [0](#mode_register_0) and [1](#mode_register_1). The five VRAM table base addresses, beginning with [TXTNAM](#txtnam), are then copied from the Workspace Area into VDP Mode Registers [2](#mode_register_2), [3](#mode_register_3), [4](#mode_register_4), [5](#mode_register_5) and [6](#mode_register_6) ([0677H](#0677h)).

<a name="05b4h"></a><a name="sett32"></a>

```
Address... 05B4H
Name...... SETT32
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to partially set the VDP to [32x24 Text Mode](#32x24_text_mode). The mode bits M1, M2 and M3 are first set in VDP Mode Registers [0](#mode_register_0) and [1](#mode_register_1). The five VRAM table base addresses, beginning with [T32NAM](#t32nam), are then copied from the Workspace Area into VDP Mode Registers [2](#mode_register_2), [3](#mode_register_3), [4](#mode_register_4), [5](#mode_register_5) and [6](#mode_register_6) ([0677H](#0677h)).

<a name="05d2h"></a><a name="inigrp"></a>

```
Address... 05D2H
Name...... INIGRP
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to initialize the VDP to [Graphics Mode](#graphics_mode). The screen is temporarily disabled via the [DISSCR](#disscr) standard routine and [SCRMOD](#scrmod) set to 02H. The parameters required by the [GRPPRT](#grpprt) standard routine are set up by copying [GRPPAT](#grppat) to [PATBAS](#patbas) and [GRPATR](#grpatr) to [ATRBAS](#atrbas). The character code driver pattern is then copied into the VDP Name Table, the screen cleared (07A1H) and all sprites cleared (06BBH). Finally the VDP mode and base addresses are set via the [SETGRP](#setgrp) standard routine and the screen is enabled.

<a name="0602h"></a><a name="setgrp"></a>

```
Address... 0602H
Name...... SETGRP
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to partially set the VDP to [Graphics Mode](#graphics_mode). The mode bits M1, M2 and M3 are first set in VDP Mode Registers [0](#mode_register_0) and [1](#mode_register_1). The five VRAM table base addresses, beginning with [GRPNAM](#grpnam), are then copied from the Workspace Area into VDP Mode Registers [2](#mode_register_2), [3](#mode_register_3), [4](#mode_register_4), [5](#mode_register_5) and [6](#mode_register_6) ([0677H](#0677h)).

<a name="061fh"></a><a name="inimlt"></a>

```
Address... 061FH
Name...... INIMLT
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to initialize the VDP to [Multicolour Mode](#multicolour_mode). The screen is temporarily disabled via the [DISSCR](#disscr) standard routine and [SCRMOD](#scrmod) set to 03H. The parameters required by the [GRPPRT](#grpprt) standard routine are set up by copying [MLTPAT](#mltpat) to [PATBAS](#patbas) and [MLTATR](#mltatr) to [ATRBAS](#atrbas). The character code driver pattern is then copied into the VDP Name Table, the screen cleared (07B9H) and all sprites cleared (06BBH). Finally the VDP mode and base addresses are set via the [SETMLT](#setmlt) standard routine and the screen is enabled.

<a name="0659h"></a><a name="setmlt"></a>

```
Address... 0659H
Name...... SETMLT
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to partially set the VDP to [Multicolour Mode](#multicolour_mode). The mode bits M1, M2 and M3 are first set in VDP Mode Registers [0](#mode_register_0) and [1](#mode_register_1). The five VRAM table base addresses, beginning with [MLTNAM](#mltnam), are then copied from the Workspace Area to VDP Mode Registers [2](#mode_register_2), [3](#mode_register_3), [4](#mode_register_4), [5](#mode_register_5) and [6](#mode_register_6).

<a name="0677h"></a>

    Address... 0677H

This routine is used by the [SETTXT](#settxt), [SETT32](#sett32), [SETGRP](#setgrp) and [SETMLT](#setmlt) standard routines to copy a block of five table base addresses from the Workspace Area into VDP Mode Registers [2](#mode_register_2), [3](#mode_register_3), [4](#mode_register_4), [5](#mode_register_5) and [6](#mode_register_6). On entry register pair HL points to the relevant group of addresses. Each base address is collected in turn shifted the required number of places and then written to the relevant Mode Register via the [WRTVDP](#wrtvdp) standard routine.

<a name="06a8h"></a><a name="clrspr"></a>

```
Address... 06A8H
Name...... CLRSPR
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to clear all sprites. The entire 2 KB Sprite Pattern Table is first filled with zeros via the [FILVRM](#filvrm) standard routine. The vertical coordinate of each of the thirty-two sprite attribute blocks is then set to -47 (D1H) to place the sprite above the top of the screen, the horizontal coordinate is left unchanged.

The pattern numbers in the Sprite Attribute Table are initialized with the series 0, 1, 2, 3, 4,... 31 for 8x8 sprites or the series 0, 4, 8, 12, 16,... 124 for 16x16 sprites. The series to be generated is determined by the Size bit in VDP [Mode Register 1](#mode_register_1). Finally the colour byte of each sprite attribute block is filled in with the colour code contained in [FORCLR](#forclr), this is initially white.

Note that the Size and Mag bits in VDP [Mode Register 1](#mode_register_1) are not affected by this routine. Note also that the [INIT32](#init32), [INIGRP](#inigrp) and [INIMLT](#inimlt) standard routines use this routine with an entry point at 06BBH, leaving the Sprite Pattern Table undisturbed.

<a name="06e4h"></a><a name="calpat"></a>

```
Address... 06E4H
Name...... CALPAT
Entry..... A=Sprite pattern number
Exit...... HL=Sprite pattern address
Modifies.. AF, DE, HL
```

Standard routine to calculate the address of a sprite pattern. The pattern number is first multiplied by eight then, if 16x16 sprites are selected, multiplied by a further factor of four. This is then added to the Sprite Pattern Table base address, taken from [PATBAS](#patbas), to produce the final address.

This numbering system is in line with the BASIC Interpreter's usage of pattern numbers rather than the VDP's when 16x16 sprites are selected. As an example while the Interpreter calls the second pattern number one, it is actually VDP pattern number four. This usage means that the maximum pattern number this routine should allow, when 16x16 sprites are selected, is sixty-three. There is no actual check on this limit so large pattern numbers will produce addresses greater than 3FFFH. Such addresses, when passed to the other VDP routines, will wrap around past zero and corrupt the Character Pattern Table in VRAM.

<a name="06f9h"></a><a name="calatr"></a>

```
Address... 06F9H
Name...... CALATR
Entry..... A=Sprite number
Exit...... HL=Sprite attribute address
Modifies.. AF, DE, HL
```

Standard routine to calculate the address of a sprite attribute block. The sprite number, from zero to thirty-one, is multiplied by four and added to the Sprite Attribute Table base address taken from [ATRBAS](#atrbas).

<a name="0704h"></a><a name="gspsiz"></a>

```
Address... 0704H
Name...... GSPSIZ
Entry..... None
Exit...... A=Bytes in sprite pattern (8 or 32)
Modifies.. AF
```

Standard routine to return the number of bytes occupied by each sprite pattern in the Sprite Pattern Table. The result is determined simply by examining the Size bit in VDP [Mode Register 1](#mode_register_1).

<a name="070fh"></a><a name="ldirmv"></a>

```
Address... 070FH
Name...... LDIRMV
Entry..... BC=Length, DE=RAM address, HL=VRAM address
Exit...... None
Modifies.. AF, BC, DE, EI
```

Standard routine to copy a block into main memory from the VDP VRAM. The VRAM starting address is set via the [SETRD](#setrd) standard routine and then sequential bytes read from the VDP [Data Port](#data_port) and placed in main memory.

<a name="071eh"></a>

    Address... 071EH

This routine is used to copy a 2 KB character set into the VDP Character Pattern Table in any mode. The base address of the Character Pattern Table in VRAM is taken from [CGPBAS](#cgpbas). The starting address of the character set is taken from [CGPNT](#cgpnt). The [RDSLT](#rdslt) standard routine is used to read the character data so this may be situated in an extension ROM.

At power-up [CGPNT](#cgpnt) is initialized with the address contained at ROM location 0004H, which is [1BBFH](#1bbfh). [CGPNT](#cgpnt) is easily altered to produce some interesting results, `POKE &HF920,&HC7:SCREEN 0` provides a thoroughly confusing example.

<a name="0744h"></a><a name="ldirvm"></a>

```
Address... 0744H
Name...... LDIRVM
Entry..... BC=Length, DE=VRAM address, HL=RAM address
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to copy a block to VRAM from main memory. The VRAM starting address is set via the [SETWRT](#setwrt) standard routine and then sequential bytes taken from main memory and written to the VDP [Data Port](#data_port).

<a name="0777h"></a>

    Address... 0777H

This routine will clear the screen in any VDP mode. In [40x24 Text Mode](#40x24_text_mode) and [32x24 Text Mode](#32x24_text_mode) the Name Table, whose base address is taken from [NAMBAS](#nambas), is first filled with ASCII spaces. The cursor is then set to the home position ([0A7FH](#0a7fh)) and [LINTTB](#linttb), the line termination table, re-initialized. Finally the function key display is restored, if it is enabled, via the [FNKSB](#fnksb) standard routine.

In [Graphics Mode](#graphics_mode) the border colour is first set via VDP [Mode Register 7](#mode_register_7) (0832H). The Colour Table is then filled with the background colour code, taken from [BAKCLR](#bakclr), for both 0 and 1 pixels. Finally the Character Pattern Table is filled with zeroes.

In [Multicolour Mode](#multicolour_mode) the border colour is first set via VDP [Mode Register 7](#mode_register_7) (0832H). The Character Pattern Table is then filled with the background colour taken from [BAKCLR](#bakclr).

<a name="07cdh"></a><a name="wrtvrm"></a>

```
Address... 07CDH
Name...... WRTVRM
Entry..... A=Data byte, HL=VRAM address
Exit...... None
Modifies.. EI
```

Standard routine to write a single byte to the VDP VRAM. The VRAM address is first set up via the [SETWRT](#setwrt) standard routine and then the data byte written to the VDP [Data Port](#data_port). Note that the two seemingly spurious `EX(SP),HL` instructions in this routine, and several others, are required to meet the VDP's timing constraints.

<a name="07d7h"></a><a name="rdvrm"></a>

```
Address... 07D7H
Name...... RDVRM
Entry..... HL=VRAM address
Exit...... A=Byte read
Modifies.. AF, EI
```

Standard routine to read a single byte from the VDP VRAM. The VRAM address is first set up via the [SETRD](#setrd) standard routine and then the byte read from the VDP [Data Port](#data_port).

<a name="07dfh"></a><a name="setwrt"></a>

```
Address... 07DFH
Name...... SETWRT
Entry..... HL=VRAM address
Exit...... None
Modifies.. AF, EI
```

Standard routine to set up the VDP for subsequent writes to VRAM via the [Data Port](#data_port). The address contained in register pair HL is written to the VDP [Command Port](#command_port) LSB first, MSB second as shown in [Figure 7](#figure7). Addresses greater than 3FFFH will wrap around past zero as the two most significant bits of the address are ignored.

<a name="07ech"></a><a name="setrd"></a>

```
Address... 07ECH
Name...... SETRD
Entry..... HL=VRAM address
Exit...... None
Modifies.. AF, EI
```

Standard routine to set up the VDP for subsequent reads from VRAM via the [Data Port](#data_port). The address contained in register pair HL is written to the VDP [Command Port](#command_port) LSB first, MSB second as shown in [Figure 7](#figure7). Addresses greater than 3FFFH will wrap around past zero as the two most significant bits of the address are ignored.

<a name="07f7h"></a><a name="chgclr"></a>

```
Address... 07F7H
Name...... CHGCLR
Entry..... None
Exit...... None
Modifies.. AF, BC, HL, EI
```

Standard routine to set the VDP colours. [SCRMOD](#scrmod) is first examined to determine the appropriate course of action. In [40x24 Text Mode](#40x24_text_mode) the contents of [BAKCLR](#bakclr) and [FORCLR](#forclr) are written to VDP [Mode Register 7](#mode_register_7) to set the colour of the 0 and 1 pixels, these are initially blue and white. Note that in this mode there is no way of specifying the border colour, this will be the same as the 0 pixel colour. In [32x24 Text Mode](#32x24_text_mode), [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode) the contents of [BDRCLR](#bdrclr) are written to VDP [Mode Register 7](#mode_register_7) to set the colour of the border, this is initially blue. Also in [32x24 Text Mode](#32x24_text_mode) the contents of [BAKCLR](#bakclr) and [FORCLR](#forclr) are copied to the whole of the Colour Table to determine the 0 and 1 pixel colours.

<a name="0815h"></a><a name="filvrm"></a>

```
Address... 0815H
Name...... FILVRM
Entry..... A=Data byte, BC=Length, HL=VRAM address
Exit...... None
Modifies.. AF, BC, EI
```

Standard routine to fill a block of the VDP VRAM with a single data byte. The VRAM starting address, contained in register pair HL, is first set up via the [SETWRT](#setwrt) standard routine. The data byte is then repeatedly written to the VDP [Data Port](#data_port) to fill successive VRAM locations.

<a name="083bh"></a><a name="totext"></a>

```
Address... 083BH
Name...... TOTEXT
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to return the VDP to either [40x24 Text Mode](#40x24_text_mode) or [32x24 Text Mode](#32x24_text_mode) if it is currently in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode). It is used by the BASIC Interpreter Mainloop and by the "[INPUT](#input)" statement handler. Whenever the [INITXT](#initxt) or [INIT32](#init32) standard routines are used the mode byte, 00H or 01H, is copied into [OLDSCR](#oldscr). If the mode is subsequently changed to [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode), and then has to be returned to one of the two text modes for keyboard input, this routine ensures that it returns to the same one.

[SCRMOD](#scrmod) is first examined and, if the screen is already in either text mode, the routine simply terminates with no action. Otherwise the previous text mode is taken from [OLDSCR](#oldscr) and passed to the [CHGMOD](#chgmod) standard routine.

<a name="0848h"></a><a name="cls"></a>

```
Address... 0848H
Name...... CLS
Entry..... Flag Z
Exit...... None
Modifies.. AF, BC, DE, EI
```

Standard routine to clear the screen in any mode, it does nothing but call the routine at 0777H. This is actually the "`CLS`" statement handler and, because this indicates that there is illegal text after the statement, it will simply return if entered with Flag NZ.

<a name="084fh"></a><a name="chgmod"></a>

```
Address... 084FH
Name...... CHGMOD
Entry..... A=Screen mode required (0, 1, 2, 3)
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to set a new screen mode. Register A, containing the required screen mode, is tested and control transferred to [INITXT](#initxt), [INIT32](#init32), [INIGRP](#inigrp) or [INIMLT](#inimlt).

<a name="085dh"></a><a name="lptout"></a>

```
Address... 085DH
Name...... LPTOUT
Entry..... A=Character to print
Exit...... Flag C if CTRL-STOP termination
Modifies.. AF
```

Standard routine to output a character to the line printer via the Centronics Port. The printer status is continually tested, via the [LPTSTT](#lptstt) standard routine, until the printer becomes free. The character is then written to the Centronics Data Port (I/O port 91H) and the [STROBE](#strobe) signal of the Centronics Status Port (I/O port 90H) briefly pulsed low. Note that the [BREAKX](#breakx) standard routine is used to test for the CTRL-STOP key if the printer is busy. If CTRL-STOP is detected a CR code is written to the Centronics Data Port, to flush the printer's line buffer, and the routine terminates with Flag C.

<a name="0884h"></a><a name="lptstt"></a>

```
Address... 0884H
Name...... LPTSTT
Entry..... None
Exit...... A=0 and Flag Z if printer busy
Modifies.. AF
```

Standard routine to test the Centronics Status Port BUSY signal. This just involves reading I/O port 90H and examining the state of bit 1: 0=Ready, 1=Busy.

<a name="088eh"></a><a name="posit"></a>

```
Address... 088EH
Name...... POSIT
Entry..... H=Column, L=Row
Exit...... None
Modifies.. AF, EI
```

Standard routine to set the cursor coordinates. The row and column coordinates are sent to the [OUTDO](#outdo) standard routine as the parameters in an ESC,"Y",Row+1FH, Column+1FH sequence. Note that the BIOS home position has coordinates of 1,1 rather than the 0,0 used by the BASIC Interpreter.

<a name="089dh"></a><a name="cnvchr"></a>

```
Address... 089DH
Name...... CNVCHR
Entry..... A=Character
Exit...... Flag Z,NC=Header; Flag NZ,C=Graphic; Flag Z,C=Normal
Modifies.. AF
```

Standard routine to test for, and convert if necessary, characters with graphic headers. Characters less than 20H are normally interpreted by the output device drivers as control characters. A character code in this range can be treated as a displayable character by preceding it with a graphic header control code (01H) and adding 40H to its value. For example to directly display character code 0DH, rather than have it interpreted as a carriage return, it is necessary to output the two bytes 01H,4DH. This routine is used by the output device drivers, such as the [CHPUT](#chput) standard routine, to check for such sequences.

If the character is a graphic header [GRPHED](#grphed) is set to 01H and the routine terminates, otherwise [GRPHED](#grphed) is zeroed. If the character is outside the range 40H to 5FH it is left unchanged. If it is inside this range, and [GRPHED](#grphed) contains 01H indicating a previous graphic header, it is converted by subtracting 40H.

<a name="08bch"></a><a name="chput"></a>

```
Address... 08BCH
Name...... CHPUT
Entry..... A=Character
Exit...... None
Modifies.. EI
```

Standard routine to output a character to the screen in [40x24 Text Mode](#40x24_text_mode) or [32x24 Text Mode](#32x24_text_mode). [SCRMOD](#scrmod) is first checked and, if the VDP is in either [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode), the routine terminates with no action. Otherwise the cursor is removed ([0A2EH](#0a2eh)), the character decoded ([08DFH](#08dfh)) and then the cursor replaced ([09E1H](#09e1h)). Finally the cursor column position is placed in [TTYPOS](#ttypos), for use by the "`PRINT`" statement, and the routine terminates.

<a name="08dfh"></a>

    Address... 08DFH

This routine is used by the [CHPUT](#chput) standard routine to decode a character and take the appropriate action. The [CNVCHR](#cnvchr) standard routine is first used to check for a graphic character, if the character is a header code (01H) then the routine terminates with no action. If the character is a converted graphic one then the control code decoding section is skipped. Otherwise [ESCCNT](#esccnt) is checked to see if a previous ESC character (1BH) has been received, if so control transfers to the ESC sequence processor ([098FH](#098fh)). Otherwise the character is checked to see if it is smaller than 20H, if so control transfers to the control code processor ([0914H](#0914h)). The character is then checked to see if it is DEL (7FH), if so control transfers to the delete routine (0AE3H).

Assuming the character is displayable the cursor coordinates are taken from [CSRY](#csry) and [CSRX](#csrx) and placed in register pair HL, H=Column, L=Row. These are then converted to a physical address in the VDP Name Table and the character placed there ([0BE6H](#0be6h)). The cursor column position is then incremented ([0A44H](#0a44h)) and, assuming the rightmost column has not been exceeded, the routine terminates. Otherwise the row's entry in [LINTTB](#linttb), the line termination table, is zeroed to indicate an extended logical line, the column number is set to 01H and a LF is performed.

<a name="0908h"></a>

    Address... 0908H

This routine performs the LF operation for the [CHPUT](#chput) standard routine control code processor. The cursor row is incremented ([0A61H](#0a61h)) and, assuming the lowest row has not been exceeded, the routine terminates. Otherwise the screen is scrolled upwards and the lowest row erased (0A88H).

<a name="0914h"></a>

    Address... 0914H

This is the control code processor for the [CHPUT](#chput) standard routine. The table at [092FH](#092fh) is searched for a match with the code and control transferred to the associated address.

<a name="092fh"></a>

    Address... 092FH

This table contains the control codes, each with an associated address, recognized by the [CHPUT](#chput) standard routine:

|CODE |TO     |FUNCTION
|:---:|:-----:|--------------------------------
|07H  |1113H  |BELL, go beep
|08H  |0A4CH  |BS, cursor left
|09H  |0A71H  |TAB, cursor to next tab position
|0AH  |0908H  |LF, cursor down a row
|0BH  |0A7FH  |HOME, cursor to home
|0CH  |077EH  |FORMFEED, clear screen and home
|0DH  |0A81H  |CR, cursor to leftmost column
|1BH  |0989H  |ESC, enter escape sequence
|1CH  |0A5BH  |RIGHT, cursor right
|1DH  |0A4CH  |LEFT, cursor left
|1EH  |0A57H  |UP, cursor up
|1FH  |0A61H  |DOWN, cursor down.

</a>

<a name="0953h"></a>

    Address... 0953H

This table contains the ESC control codes, each with an associated address, recognized by the [CHPUT](#chput) standard routine:

|CODE |TO     |FUNCTION
|:---:|:-----:|-------------------------------
|6AH  |077EH  |ESC,"j", clear screen and home
|45H  |077EH  |ESC,"E", clear screen and home
|4BH  |0AEEH  |ESC,"K", clear to end of line
|4AH  |0B05H  |ESC,"J", clear to end of screen
|6CH  |0AECH  |ESC,"l", clear line
|4CH  |0AB4H  |ESC,"L", insert line
|4DH  |0A85H  |ESC,"M", delete line
|59H  |0986H  |ESC,"Y", set cursor coordinates
|41H  |0A57H  |ESC,"A", cursor up
|42H  |0A61H  |ESC,"B", cursor down
|43H  |0A44H  |ESC,"C", cursor right
|44H  |0A55H  |ESC,"D", cursor left
|48H  |0A7FH  |ESC,"H", cursor home
|78H  |0980H  |ESC,"x", change cursor
|79H  |0983H  |ESC,"y", change cursor

</a>

<a name="0980h"></a>

    Address... 0980H

This routine performs the ESC,"x" operation for the [CHPUT](#chput) standard routine control code processor. [ESCCNT](#esccnt) is set to 01H to indicate that the next character received is a parameter.

<a name="0983h"></a>

    Address... 0983H

This routine performs the ESC,"y" operation for the [CHPUT](#chput) standard routine control code decoder. [ESCCNT](#esccnt) is set to 02H to indicate that the next character received is a parameter.

<a name="0986h"></a>

    Address... 0986H

This routine performs the ESC",Y" operation for the [CHPUT](#chput) standard routine control code processor. [ESCCNT](#esccnt) is set to 04H to indicate that the next character received is a parameter.

<a name="0989h"></a>

    Address... 0989H

This routine performs the ESC operation for the [CHPUT](#chput) standard routine control code processor. [ESCCNT](#esccnt) is set to FFH to indicate that the next character received is the second control character.

<a name="098fh"></a>

    Address... 098FH

This is the [CHPUT](#chput) standard routine ESC sequence processor. If [ESCCNT](#esccnt) contains FFH then the character is the second control character and control transfers to the control code processor (0919H) to search the ESC code table at [0953H](#0953h).

If [ESCCNT](#esccnt) contains 01H then the character is the single parameter of the ESC,"x" sequence. If the parameter is "4" (34H) then [CSTYLE](#cstyle) is set to 00H resulting in a block cursor. If the parameter is "5" (35H) then [CSRSW](#csrsw) is set to 00H making the cursor normally disabled.

If [ESCCNT](#esccnt) contains 02H then the character is the single parameter in the ESC,"y" sequence. If the parameter is "4" (34H) then [CSTYLE](#cstyle) is set to 01H resulting in an underline cursor. If the parameter is "5" (35H) then [CSRSW](#csrsw) is set to 01H making the cursor normally enabled.

If [ESCCNT](#esccnt) contains 04H then the character is the first parameter of the ESC,"Y" sequence and is the row coordinate. The parameter has 1FH subtracted and is placed in [CSRY](#csry), [ESCCNT](#esccnt) is then decremented to 03H.

If [ESCCNT](#esccnt) contains 03H then the character is the second parameter of the ESC,"Y" sequence and is the column coordinate. The parameter has 1FH subtracted and is placed in [CSRX](#csrx).

<a name="09dah"></a>

    Address... 09DAH

This routine is used, by the [CHGET](#chget) standard routine for example, to display the cursor character when it is normally disabled. If [CSRSW](#csrsw) is non-zero the routine simply terminates with no action, otherwise the cursor is displayed (09E6H).

<a name="09e1h"></a>

    Address... 09E1H

This routine is used, by the [CHPUT](#chput) standard routine for example, to display the cursor character when it is normally enabled. If [CSRSW](#csrsw) is zero the routine simply terminates with no action. [SCRMOD](#scrmod) is checked and, if the screen is in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode), the routine terminates with no action. Otherwise the cursor coordinates are converted to a physical address in the VDP Name Table and the character read from that location ([0BD8H](#0bd8h)) and saved in [CURSAV](#cursav).

The character's eight byte pixel pattern is read from the VDP Character Pattern Table into the [LINWRK](#linwrk) buffer ([0BA5H](#0ba5h)). The pixel pattern is then inverted, all eight bytes if [CSTYLE](#cstyle) indicates a block cursor, only the bottom three if [CSTYLE](#cstyle) indicates an underline cursor. The pixel pattern is copied back to the position for character code 255 in the VDP Character Pattern Table ([0BBEH](#0bbeh)). The character code 255 is then placed at the current cursor location in the VDP Name Table ([0BE6H](#0be6h)) and the routine terminates.

This method of generating the cursor character, by using character code 255, can produce curious effects under certain conditions. These can be demonstrated by executing the BASIC statement `FOR N=1 TO 100: PRINT CHR$(255);:NEXT` and then pressing the cursor up key.

<a name="0a27h"></a>

    Address... 0A27H

This routine is used, by the [CHGET](#chget) standard routine for example, to remove the cursor character when it is normally disabled. If [CSRSW](#csrsw) is non-zero the routine simply terminates with no action, otherwise the cursor is removed (0A33H).

<a name="0a2eh"></a>

    Address... 0A2EH

This routine is used, by the [CHPUT](#chput) standard routine for example, .to remove the cursor character when it is normally enabled. If [CSRSW](#csrsw) is zero the routine simply terminates with no action. [SCRMOD](#scrmod) is checked and, if the screen is in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode), the routine terminates with no action. Otherwise the cursor coordinates are converted to a physical address in the VDP Name Table and the character held in [CURSAV](#cursav) written to that location ([0BE6H](#0be6h)).

<a name="0a44h"></a>

    Address... 0A44H

This routine performs the ESC,"C" operation for the [CHPUT](#chput) standard routine control code processor. If the cursor column coordinate is already at the rightmost column, determined by [LINLEN](#linlen), then the routine terminates with no action. Otherwise the column coordinate is incremented and [CSRX](#csrx) updated.

<a name="0a4ch"></a>

    Address... 0A4CH

This routine performs the BS/LEFT operation for the [CHPUT](#chput) standard routine control code processor. The cursor column coordinate is decremented and [CSRX](#csrx) updated. If the column coordinate has moved beyond the leftmost position it is set to the rightmost position, from [LINLEN](#linlen), and an UP operation performed.

<a name="0a55h"></a>

    Address... 0A55H

This routine performs the ESC,"D" operation for the [CHPUT](#chput) standard routine control code processor. If the cursor column coordinate is already at the leftmost position then the routine terminates with no action. Otherwise the column coordinate is decremented and [CSRX](#csrx) updated.

<a name="0a57h"></a>

    Address... 0A57H

This routine performs the ESC,"A" (UP) operation for the [CHPUT](#chput) standard routine control code processor. If the cursor row coordinate is already at the topmost position the routine terminates with no action. Otherwise the row coordinate is decremented and [CSRY](#csry) updated.

<a name="0a5bh"></a>

    Address... 0A5BH

This routine performs the RIGHT operation for the [CHPUT](#chput) standard routine control code processor. The cursor column coordinate is incremented and [CSRX](#csrx) updated. If the column coordinate has moved beyond the rightmost position, determined by [LINLEN](#linlen), it is set to the leftmost position (01H) and a DOWN operation performed.

<a name="0a61h"></a>

    Address... 0A61H

This routine performs the ESC,"B" (DOWN) operation for the [CHPUT](#chput) standard routine control code processor. If the cursor row coordinate is already at the lowest position, determined by [CRTCNT](#crtcnt) and [CNSDFG](#cnsdfg) ([0C32H](#0c32h)), then the routine terminates with no action. Otherwise the row coordinate is incremented and [CSRY](#csry) updated.

<a name="0a71h"></a>

    Address... 0A71H

This routine performs the TAB operation for the [CHPUT](#chput) standard routine control code processor. ASCII spaces are output ([08DFH](#08dfh)) until [CSRX](#csrx) is a multiple of eight plus one (BIOS columns 1, 9, 17, 25, 33).

<a name="0a7fh"></a>

    Address... 0A7FH

This routine performs the ESC,"H" (HOME) operation for the [CHPUT](#chput) standard routine control code processor, [CSRX](#csrx) and [CSRY](#csry) are simply set to 1,1. The ROM BIOS cursor coordinate system, while functionally identical to that used by the BASIC Interpreter, numbers the screen rows from 1 to 24 and the columns from 1 to 32/40.

<a name="0a81h"></a>

    Address... 0A81H

This routine performs the CR operation for the [CHPUT](#chput) standard routine control code processor, [CSRX](#csrx) is simply set to 01H .

<a name="0a85h"></a>

    Address... 0A85H

This routine performs the ESC,"M" function for the [CHPUT](#chput) standard routine control code processor. A CR operation is first performed to set the cursor column coordinate to the leftmost position. The number of rows from the current row to the bottom of the screen is then determined, if this is zero the current row is simply erased ([0AECH](#0aech)). The row count is first used to scroll up the relevant section of [LINTTB](#linttb), the line termination table, by one byte. It is then used to scroll up the relevant section of the screen a row at a time. Starting at the row below the current row, each line is copied from the VDP Name Table into the [LINWRK](#linwrk) buffer ([0BAAH](#0baah)) then copied back to the Name Table one row higher ([0BC3H](#0bc3h)). Finally the lowest row on the screen is erased ([0AECH](#0aech)).

<a name="0ab4h"></a>

    Address... 0AB4H

This routine performs the ESC,"L" operation for the [CHPUT](#chput) standard routine control code processor. A CR operation is first performed to set the cursor column coordinate to the leftmost position. The number of rows from the current row to the bottom of the screen is then determined, if this is zero the current row is simply erased ([0AECH](#0aech)). The row count is first used to scroll down the relevant section of [LINTTB](#linttb), the line termination table, by one byte. It is then used to scroll down the relevant section of the screen a row at a time. Starting at the next to last row of the screen, each line is copied from the VDP Name Table into the [LINWRK](#linwrk) buffer ([0BAAH](#0baah)), then copied back to the Name Table one row lower ([0BC3H](#0bc3h)). Finally the current row is erased ([0AECH](#0aech)).

    Address... 0AE3H

This routine is used to perform the DEL operation for the [CHPUT](#chput) standard routine control code processor. A LEFT operation is first performed. If this cannot be completed, because the cursor is already at the home position, then the routine terminates with no action. Otherwise a space is written to the VDP Name Table at the cursor's physical location ([0BE6H](#0be6h)).

<a name="0aech"></a>

    Address... 0AECH

This routine performs the ESC,"l" operation for the [CHPUT](#chput) standard routine control code processor. The cursor column coordinate is set to 01H and control drops into the ESC,"K" routine.

<a name="0aeeh"></a>

    Address... 0AEEH

This routine performs the ESC,"K" operation for the [CHPUT](#chput) standard routine control code processor. The row's entry in [LINTTB](#linttb), the line termination table, is first made non-zero to indicate that the logical line is not extended ([0C29H](#0c29h)). The cursor coordinates are converted to a physical address (0BF2H) in the VDP Name Table and the VDP set up for writes via the [SETWRT](#setwrt) standard routine. Spaces are then written directly to the VDP [Data Port](#data_port) until the rightmost column, determined by [LINLEN](#linlen), is reached.

    Address... 0B05H

This routine performs the ESC,"J" operation for the [CHPUT](#chput) standard routine control code processor. An ESC,"K" operation is performed on successive rows, starting with the current one, until the bottom of the screen is reached.

<a name="0b15h"></a><a name="erafnk"></a>

```
Address... 0B15H
Name...... ERAFNK
Entry..... None
Exit...... None
Modifies.. AF, DE, EI
```

Standard routine to turn the function key display off. [CNSDFG](#cnsdfg) is first zeroed and, if the VDP is in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode), the routine terminates with no further action. If the VDP is in [40x24 Text Mode](#40x24_text_mode) or [32x24 Text Mode](#32x24_text_mode) the last row on the screen is then erased ([0AECH](#0aech)).

<a name="0b26h"></a><a name="fnksb"></a>

```
Address... 0B26H
Name...... FNKSB
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, EI
```

Standard routine to show the function key display if it is enabled. If [CNSDFG](#cnsdfg) is zero the routine terminates with no action, otherwise control drops into the [DSPFNK](#dspfnk) standard routine..

<a name="0b2bh"></a><a name="dspfnk"></a>

```
Address... 0B2BH
Name...... DSPFNK
Entry..... None
Exit...... None
Modifies.. AF, BC, DE, EI
```

Standard routine to turn the function key display on. [CNSDFG](#cnsdfg) is set to FFH and, if the VDP is in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode), the routine terminates with no further action. Otherwise the cursor row coordinate is checked and, if the cursor is on the last row of the screen, a LF code (0AH) issued to the [OUTDO](#outdo) standard routine to scroll the screen up.

Register pair HL is then set to point to either the unshifted or shifted function strings in the Workspace Area depending upon whether the SHIFT key is pressed. [LINLEN](#linlen) has four subtracted, to allow a minimum of one space between fields, and is divided by five to determine the field size for each string. Successive characters are then taken from each function string, checked for graphic headers via the [CNVCHR](#cnvchr) standard routine and placed in the [LINWRK](#linwrk) buffer until the string is exhausted or the zone is filled. When all five strings are completed the [LINWRK](#linwrk) buffer is written to the last row in the VDP Name Table ([0BC3H](#0bc3h)).

<a name="0b9ch"></a>

    Address... 0B9CH

This routine is used by the function key display related standard routines. The contents of register A are placed in [CNSDFG](#cnsdfg) then [SCRMOD](#scrmod) tested and Flag NC returned if the screen is in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode).

<a name="0ba5h"></a>

    Address... 0BA5H

This routine copies eight bytes from the VDP VRAM into the [LINWRK](#linwrk) buffer, the VRAM physical address is supplied in register pair HL.

<a name="0baah"></a>

    Address... 0BAAH

This routine copies a complete row of characters, with the length determined by [LINLEN](#linlen), from the VDP VRAM into the [LINWRK](#linwrk) buffer. The cursor row coordinate is supplied in register L.

<a name="0bbeh"></a>

    Address... 0BBEH

This routine copies eight bytes from the [LINWRK](#linwrk) buffer into the VDP VRAM, the VRAM physical address is supplied in register pair HL.

<a name="0bc3h"></a>

    Address... 0BC3H

This routine copies a complete row of characters, with the length determined by [LINLEN](#linlen), from the [LINWRK](#linwrk) buffer into the VDP VRAM. The cursor row coordinate is supplied in register L.

<a name="0bd8h"></a>

    Address... 0BD8H

This routine reads a single byte from the VDP VRAM into register C. The column coordinate is supplied in register H, the row coordinate in register L.

<a name="0be6h"></a>

    Address... 0BE6H

This routine converts a pair of screen coordinates, the column in register H and the row in register L, into a physical address in the VDP Name Table. This address is returned in register pair HL.

The row coordinate is first multiplied by thirty-two or forty, depending upon the screen mode, and added to the column coordinate. This is then added to the Name Table base address, taken from [NAMBAS](#nambas), to produce an initial address.

Because of the variable screen width, as contained in [LINLEN](#linlen), an additional offset has to be added to the initial address to keep the active region roughly centered within the screen. The difference between the "true" number of characters per row, thirty-two or forty, and the current width is halved and then rounded up to produce the left hand offset. For a UK machine, with a thirty-seven character width in [40x24 Text Mode](#40x24_text_mode), this will result in two unused characters on the left hand side and one on the right. The statement `PRINT (41-WID)\2`, where `WID` is any screen width, will display the left hand column offset in [40x24 Text Mode](#40x24_text_mode).

A complete BASIC program which emulates this routine is given below:

```
10 CPR=40:NAM=BASE(0):WID=PEEK(&HF3AE)
20 SCRMD=PEEK(&HFCAF):IF SCRMD=0 THEN 40
30 CPR=32:NAM=BASE(5):WID=PEEK(&HF3AF)
40 LH=(CPR+1-WID)\2
50 ADDR=NAM+(ROW-1)*CPR+(COL-1)+LH
```

This program is designed for the `ROW` and `COL` coordinate system used by the ROM BIOS where home is 1,1. Line 50 may be simplified, by removing the "-1" factors, if the BASIC Interpreter's coordinate system is to be used.

<a name="0c1dh"></a>

    Address... 0C1DH

This routine calculates the address of a row's entry in [LINTTB](#linttb), the line termination table. The row coordinate is supplied in register L and the address returned in register pair DE.

<a name="0c29h"></a>

    Address... 0C29H

This routine makes a row's entry in [LINTTB](#linttb) non-zero when entered at [0C29H](#0c29h) and zero when entered at 0C2AH. The row coordinate is supplied in register L.

<a name="0c32h"></a>

    Address... 0C32H

This routine returns the number of rows on the screen in register A. It will normally return twenty-four if the function key display is disabled and twenty-three if it is enabled. Note that the screen size is determined by [CRTCNT](#crtcnt) and may be modified with a BASIC statement, `POKE &HF3B1H,14:SCREEN 0` for example.

<a name="0c3ch"></a><a name="keyint"></a>

```
Address... 0C3CH
Name...... KEYINT
Entry..... None
Exit...... None
Modifies.. EI
```

Standard routine to process Z80 interrupts, these are generated by the VDP once every 20 ms on a UK machine. The [VDP Status Register](#vdp_status_register) is first read and bit 7 checked to ensure that this is a frame rate interrupt, if not the routine terminates with no action. The contents of the [Status Register](#vdp_status_register) are saved in [STATFL](#statfl) and bit 5 checked for sprite coincidence. If the Coincidence Flag is active then the relevant entry in [TRPTBL](#trptbl) is updated ([0EF1H](#0ef1h)).

[INTCNT](#intcnt), the "`INTERVAL`" counter, is then decremented. If this has reached zero the relevant entry in [TRPTBL](#trptbl) is updated ([0EF1H](#0ef1h)) and the counter reset with the contents of [INTVAL](#intval).

[JIFFY](#jiffy), the "`TIME`" counter, is then incremented. This counter just wraps around to zero when it overflows.

[MUSICF](#musicf) is examined to determine whether any of the three music queues generated by the "`PLAY`" statement are active. For each active queue the dequeueing routine ([113BH](#113bh)) is called to fetch the next music packet and write it to the PSG.

[SCNCNT](#scncnt) is then decremented to determine if a joystick and keyboard scan is required, if not the interrupt handler terminates with no further action. This counter is used to increase throughput and to minimize keybounce problems by ensuring that a scan is only carried out every three interrupts. Assuming a scan is required joystick connector 1 is selected and the two Trigger bits read ([120CH](#120ch)), followed by the two Trigger bits from joystick connector 2 ([120CH](#120ch)) and the SPACE key from row 8 of the keyboard ([1226H](#1226h)). These five inputs, which are all related to the "`STRIG`" statement, are combined into a single byte where 0=Pressed, 1=Not pressed:

<a name="figure35"></a>![][CH04F35]

**Figure 35:** "`STRIG`" Inputs

This reading is compared with the previous one, held in [TRGFLG](#trgflg), to produce an active transition byte and [TRGFLG](#trgflg) is updated with the new reading. The active transition byte is normally zero but contains a 1 in each position where a transition from unpressed to pressed has occurred. This active transition byte is shifted out bit by bit and the relevant entry in [TRPTBL](#trptbl) updated ([0EF1H](#0ef1h)) for each active device.

A complete scan of the keyboard matrix is then performed to identify new key depressions, any found are translated into key codes and placed in [KEYBUF](#keybuf) ([0D12H](#0d12h)). If [KEYBUF](#keybuf) is found to be empty at the end of this process [REPCNT](#repcnt) is decremented to see whether the auto-repeat delay has expired, if not the routine terminates. If the delay period has expired [REPCNT](#repcnt) is reset with the fast repeat value (60 ms), the [OLDKEY](#oldkey) keyboard map is reinitialized and the keyboard scanned again (0D4EH). Any keys which are continuously pressed will show up as new transitions during this scan. Note that keys will only auto-repeat while an application program keeps [KEYBUF](#keybuf) empty by reading characters. The interrupt handler then terminates.

<a name="0d12h"></a>

    Address... 0D12H

This routine performs a complete scan of all eleven rows of the keyboard matrix for the interrupt handler. Each of the eleven rows is read in via the PPI and placed in ascending order in [NEWKEY](#newkey). [ENSTOP](#enstop) is then checked to see if warm starts are enabled. If its contents are non-zero and the keys CODE, GRAPH, CTRL and SHIFT are pressed control transfers to the BASIC Interpreter (409BH) via the [CALBAS](#calbas) standard routine. This facility is useful as even a machine code program can be terminated as long as the interrupt handler is running. The contents of [NEWKEY](#newkey) are compared with the previous scan contained in [OLDKEY](#oldkey). If any change at all has occurred [REPCNT](#repcnt) is loaded with the initial auto-repeat delay (780 ms). Each row 1, reading from [NEWKEY](#newkey) is then compared with the previous one, held in [OLDKEY](#oldkey), to produce an active transition byte and [OLDKEY](#oldkey) is updated with the new reading. The active transition byte is normally zero but contains a 1 in each position where a transition from unpressed to pressed has occurred. If the row contains any transitions these are decoded and placed in [KEYBUF](#keybuf) as key codes ([0D89H](#0d89h)). When all eleven rows have been completed the routine checks whether there are any characters in [KEYBUF](#keybuf), by subtracting [GETPNT](#getpnt) from [PUTPNT](#putpnt), and terminates.

<a name="0d6ah"></a><a name="chsns"></a>

```
Address... 0D6AH
Name...... CHSNS
Entry..... None
Exit...... Flag NZ if characters in KEYBUF
Modifies.. AF, EI
```

Standard routine to check if any keyboard characters are ready. If the screen is in [Graphics Mode](#graphincsmode) or [Multicolour Mode](#multicolour_mode) then [GETPNT](#getpnt) is subtracted from [PUTPNT](#putpnt) (0D62H) and the routine terminates. If the screen is in [40x24 Text Mode](#40x24_text_mode) or [32x24 Text Mode](#32x24_text_mode) the state of the SHIFT key is also examined and the function key display updated, via the [DSPFNK](#dspfnk) standard routine, if it has changed.

<a name="0d89h"></a>

    Address... 0D89H

This routine converts each active bit in a keyboard row transition byte into a key code. A bit is first converted into a key number determined by its position in the keyboard matrix:

<a name="figure36"></a>![][CH04F36]

**Figure 36:** Key Numbers

The key number is then converted into a key code and placed in [KEYBUF](#keybuf) ([1021H](#1021h)). When all eight possible bits have been processed the routine terminates.

<a name="0da5h"></a>

    Address... 0DA5H

This table contains the key codes of key numbers 00H to 2FH for various combinations of the control keys. A zero entry in the table means that no key code will be produced when that key is pressed:

```
       37H  36H  35H  34H  33H  32H  31H  30H   Row  0
       3BH  5DH  5BH  5CH  3DH  2DH  39H  38H   Row  1
NORMAL 62H  61H  9CH  2FH  2EH  2CH  60H  27H   Row  2
       6AH  69H  68H  67H  66H  65H  64H  63H   Row  3
       72H  71H  70H  6FH  6EH  6DH  6CH  6BH   Row  4
       7AH  79H  78H  77H  76H  75H  74H  73H   Row  5

       26H  5EH  25H  24H  23H  40H  21H  29H   Row  0
       3AH  7DH  7BH  7CH  2BH  5FH  28H  2AH   Row  1
SHIFT  42H  41H  9CH  3FH  3EH  3CH  7EH  22H   Row  2
       4AH  49H  48H  47H  46H  45H  44H  43H   Row  3
       52H  51H  50H  4FH  4EH  4DH  4CH  4BH   Row  4
       5AH  59H  58H  57H  56H  55H  54H  53H   Row  5

       FBH  F4H  BDH  EFH  BAH  ABH  ACH  09H   Row  0
       06H  0DH  01H  1EH  F1H  17H  07H  ECH   Row  1
GRAPH  11H  C4H  9CH  1DH  F2H  F3H  BBH  05H   Row  2
       C6H  DCH  13H  15H  14H  CDH  C7H  BCH   Row  3
       18H  CCH  DBH  C2H  1BH  0BH  C8H  DDH   Row  4
       0FH  19H  1CH  CFH  1AH  C0H  12H  D2H   Row  5

       00H  F5H  00H  00H  FCH  FDH  00H  0AH   Row  0
       04H  0EH  02H  16H  F0H  1FH  08H  00H   Row  1
SHIFT  00H  FEH  9CH  F6H  AFH  AEH  F7H  03H   Row  2
GRAPH  CAH  DFH  D6H  10H  D4H  CEH  C1H  FAH   Row  3
       A9H  CBH  D7H  C3H  D3H  0CH  C9H  DEH   Row  4
       F8H  AAH  F9H  D0H  D5H  C5H  00H  D1H   Row  5

       E1H  E0H  98H  9BH  BFH  D9H  9FH  EBH   Row  0
       B7H  DAH  EDH  9CH  E9H  EEH  87H  E7H   Row  1
CODE   97H  84H  9CH  A7H  A6H  86H  E5H  B9H   Row  2
       91H  A1H  B1H  81H  94H  8CH  8BH  8DH   Row  3
       93H  83H  A3H  A2H  A4H  E6H  B5H  B3H   Row  4
       85H  A0H  8AH  88H  95H  82H  96H  89H   Row  5

       00H  00H  9DH  9CH  BEH  9EH  ADH  D8H   Row  0
       B6H  EAH  E8H  00H  00H  00H  80H  E2H   Row  1
SHIFT  00H  8EH  9CH  A8H  00H  8FH  E4H  B8H   Row  2
CODE   92H  00H  B0H  9AH  99H  00H  00H  00H   Row  3
       00H  00H  E3H  00H  A5H  00H  B4H  B2H   Row  4
       00H  00H  00H  00H  00H  90H  00H  00H   Row  5

        7    6    5    4    3    2    1    0    Column
```

</a>

<a name="0ec5h"></a>

    Address... 0EC5H

Control transfers to this routine, from [0FC3H](#0fc3h), to complete decoding of the five function keys. The relevant entry in [FNKFLG](#fnkflg) is first checked to determine whether the key is associated with an "`ON KEY GOSUB`" statement. If so, and provided that [CURLIN](#curlin) shows the BASIC Interpreter to be in program mode, the relevant entry in [TRPTBL](#trptbl) is updated ([0EF1H](#0ef1h)) and the routine terminates. If the key is not tied to an "`ON KEY GOSUB`" statement, or if the Interpreter is in direct mode, the string of characters associated with the function key is returned instead. The key number is multiplied by sixteen, as each string is sixteen characters long, and added to the starting address of the function key strings in the Workspace Area. Sequential characters are then taken from the string and placed in [KEYBUF](#keybuf) ([0F55H](#0f55h)) until the zero byte terminator is reached.

<a name="0ef1h"></a>

    Address... 0EF1H

This routine is used to update a device's entry in [TRPTBL](#trptbl) when it has produced a BASIC program interrupt. On entry register pair HL points to the device's status byte in the table. Bit 0 of the status byte is checked first, if the device is not "`ON`" then the routine terminates with no action. Bit 2, the event flag, is then checked. If this is already set then the routine terminates, otherwise it is set to indicate that an event has occurred. Bit 1, the "`STOP`" flag, is then checked. If the device is stopped then the routine terminates with no further action. Otherwise [ONGSBF](#ongsbf) is incremented to signal to the Interpreter Runloop that the event should now be processed.

<a name="0f06h"></a>

    Address... 0F06H

This section of the key decoder processes the HOME key only. The state of the SHIFT key is determined via row 6 of [NEWKEY](#newkey) and the key code for HOME (0BH) or CLS (0CH) placed in [KEYBUF](#keybuf) ([0F55H](#0f55h)) accordingly.

<a name="0f10h"></a>

    Address... 0F10H

This section of the keyboard decoder processes key numbers 30H to 57H apart from the CAP, F1 to F5, STOP and HOME keys. The key number is simply used to look up the key code in the table at [1033H](#1033h) and this is then placed in [KEYBUF](#keybuf) ([0F55H](#0f55h)).

<a name="0f1fh"></a>

    Address... 0F1FH

This section of the keyboard decoder processes the DEAD key found on European MSX machines. On UK machines the key in row 2, column 5 always generates the pound key code (9CH) shown in the table at 0DA5H. On European machines this table will have the key code FFH in the same locations. This key code only serves as a flag to indicate that the next key pressed, if it is a vowel, should be modified to produce an accented graphics character.

The state of the SHIFT and CODE keys is determined via row 6 of [NEWKEY](#newkey) and one of the following placed in [KANAST](#kanast): 01H=DEAD, 02H=DEAD+SHIFT, 03H=DEAD+CODE, 04H=DEAD+SHIFT+CODE.

<a name="0f36h"></a>

    Address... 0F36H

This section of the keyboard decoder processes the CAP key. The current state of [CAPST](#capst) is inverted and control drops into the [CHGCAP](#chgcap) standard routine.

<a name="0f3dh"></a><a name="chgcap"></a>

```
Address... 0F3DH
Name...... CHGCAP
Entry..... A=ON/OFF Switch
Exit...... None
Modifies.. AF
```

Standard routine to turn the Caps Lock LED on or off as determined by the contents of register A: 00H=On, NZ=Off. The LED is modified using the bit set/reset facility of the PPI Mode Port. As [CAPST](#capst) is not changed this routine does not affect the characters produced by the keyboard.

<a name="0f46h"></a>

    Address... 0F46H

This section of the keyboard decoder processes the STOP key. The state of the CTRL key is determined via row 6 of [NEWKEY](#newkey) and the key code for STOP (04H) or CTRL/STOP (03H) produced as appropriate. If the CTRL/STOP code is produced it is copied to [INTFLG](#intflg), for use by the [ISCNTC](#iscntc) standard routine, and then placed in [KEYBUF](#keybuf) ([0F55H](#0f55h)). If the STOP code is produced it is also copied to [INTFLG](#intflg) but is not placed in [KEYBUF](#keybuf), instead only a click is generated (0F64H). This means that an application program cannot read the STOP key code via the ROM BIOS standard routines.

<a name="0f55h"></a>

    Address... 0F55H

This section of the keyboard decoder places a key code in [KEYBUF](#keybuf) and generates an audible click. The correct address in the keyboard buffer is first taken from [PUTPNT](#putpnt) and the code placed there. The address is then incremented ([105BH](#105bh)). If it has wrapped round and caught up with [GETPNT](#getpnt) then the routine terminates with no further action as the keyboard buffer is full. Otherwise [PUTPNT](#putpnt) is updated with the new address.

[CLIKSW](#cliksw) and [CLIKFL](#clikfl) are then both checked to determine whether a click is required. [CLIKSW](#cliksw) is a general enable/disable switch while [CLIKFL](#clikfl) is used to prevent multiple clicks when the function keys are pressed. Assuming a click is required the Key Click output is set via the [PPI Mode Port](#ppi_mode_port) and, after a delay of 50 µs, control drops into the [CHGSND](#chgsnd) standard routine.

<a name="0f7ah"></a><a name="chgsnd"></a>

```
Address... 0F7AH
Name...... CHGSND
Entry..... A=ON/OFF Switch
Exit...... None
Modifies.. AF
```

Standard routine to set or reset the Key Click output via the [PPI Mode Port](#ppi_mode_port): 00H=Reset, NZ=Set. This audio output is AC coupled so absolute polarities should not be taken too seriously.

<a name="0f83h"></a>

    Address... 0F83H

This section of the keyboard decoder processes key numbers 00H to 2FH. The state of the SHIFT, GRAPH and CODE keys is determined via row 6 of [NEWKEY](#newkey) and combined with the key number to form a look-up address into the table at [0DA5H](#0da5h). The key code is then taken from the table. If it is zero the routine terminates with no further action, if it is FFH control transfers to the DEAD key processor ([0F1FH](#0f1fh)). If the code is in the range 40H to 5FH or 60H to 7FH and the CTRL key is pressed then the corresponding control code is placed in [KEYBUF](#keybuf) ([0F55H](#0f55h)). If the code is in the range 01H to 1FH then a graphic header code (01H) is first placed in [KEYBUF](#keybuf) ([0F55H](#0f55h)) followed by the code with 40H added. If the code is in the range 61H to 7BH and [CAPST](#capst) indicates that caps lock is on then it is converted to upper case by subtracting 20H. Assuming that [KANAST](#kanast) contains zero, as it always will on UK machines, then the key code is placed in [KEYBUF](#keybuf) ([0F55H](#0f55h)) and the routine terminates. On European MSX machines, with a DEAD key instead of a pound key, then the key codes corresponding to the vowels a, e, i, o, u may be further modified into graphics codes.

<a name="0fc3h"></a>

    Address... 0FC3H

This section of the keyboard decoder processes the five function keys. The state of the SHIFT key is examined via row 6 of [NEWKEY](#newkey) and five added to the key number if it is pressed. Control then transfers to [0EC5H](#0ec5h) to complete processing.

<a name="1021h"></a>

    Address... 1021H

This routine searches the table at [1B97H](#1b97h) to determine which group of keys the key number supplied in register C belongs to. The associated address is then taken from the table and control transferred to that section of the keyboard decoder. Note that the table itself is actually patched into the middle of the [OUTDO](#outdo) standard routine as a result of the modifications made to the Japanese ROM.

<a name="1033h"></a>

    Address... 1033H

This table contains the key codes of key numbers 30H to 57H other than the special keys CAP, F1 to F5, STOP and HOME. A zero entry in the table means that no key code will be produced when that key is pressed:

```
00H 00H 00H 00H 00H 00H 00H 00H Row 6
0DH 18H 08H 00H 09H 1BH 00H 00H Row 7
1CH 1FH 1EH 1DH 7FH 12H 0CH 20H Row 8
34H 33H 32H 31H 30H 00H 00H 00H Row 9
2EH 2CH 2DH 39H 38H 37H 36H 35H Row 10

 7   6   5   4   3   2   1   0  Column
```

</a>

<a name="105bh"></a>

    Address... 105BH

This routine simply zeroes [KANAST](#kanast) and then transfers control to [10C2H](#10c2h).

<a name="1061h"></a>

    Address... 1061H

This table contains the graphics characters which replace the vowels a, e, i, o, u on European machines.

<a name="10c2h"></a>

    Address... 10C2H

This routine increments the keyboard buffer pointer, either [PUTPNT](#putpnt) or [GETPNT](#getpnt), supplied in register pair HL. If the pointer then exceeds the end of the keyboard buffer it is wrapped back to the beginning.

<a name="10cbh"></a><a name="chget"></a>

```
Address... 10CBH
Name...... CHGET
Entry..... None
Exit...... A=Character from keyboard
Modifies.. AF, EI
```

Standard routine to fetch a character from the keyboard buffer. The buffer is first checked to see if already contains a character ([0D6AH](#0d6ah)). If not the cursor is turned on ([09DAH](#09dah)), the buffer checked repeatedly until a character appears ([0D6AH](#0d6ah)) and then the cursor turned off ([0A27H](#0a27h)). The character is taken from the buffer using [GETPNT](#getpnt) which is then incremented ([10C2H](#10c2h)).

<a name="10f9h"></a><a name="ckcntc"></a>

```
Address... 10F9H
Name...... CKCNTC
Entry..... None
Exit...... None
Modifies.. AF, EI
```

Standard routine to check whether the CTRL-STOP or STOP keys have been pressed. It is used by the BASIC Interpreter inside processor-intensive statements, such as "`WAIT`" and "`CIRCLE`", to check for program termination. Register pair HL is first zeroed and then control transferred to the [ISCNTC](#iscntc) standard routine. When the Interpreter is running register pair HL normally contains the address of the current character in the BASIC program text. If [ISCNTC](#iscntc) is CTRL-STOP terminated this address will be placed in [OLDTXT](#oldtxt) by the "`STOP`" statement handler (63E6H) for use by a later "`CONT`" statement. Zeroing register pair HL beforehand signals to the "`CONT`" handler that termination occurred inside a statement and it will issue a "`Can't CONTINUE`" error if continuation is attempted.

<a name="1102h"></a><a name="wrtpsg"></a>

```
Address... 1102H
Name...... WRTPSG
Entry..... A=Register number, E=Data byte
Exit...... None
Modifies.. EI
```

Standard routine to write a data byte to any of the sixteen [PSG registers](#registers_0_and_1). The register selection number is written to the PSG [Address Port](#address_port) and the data byte written to the PSG [Data Write Port](#data_write_port).

<a name="110eh"></a><a name="rdpsg"></a>

```
Address... 110EH
Name...... RDPSG
Entry..... A=Register number
Exit...... A=Data byte read from PSG
Modifies.. A
```

Standard routine to read a data byte from any of the sixteen [PSG registers](#registers_0_and_1). The register selection number is written to the PSG [Address Port](#address_port) and the data byte read from the PSG [Data Read Port](#data_read_port).

<a name="1113h"></a><a name="beep"></a>

```
Address... 1113H
Name...... BEEP
Entry..... None
Exit...... None
Modifies.. AF, BC, E, EI
```

Standard routine to produce a beep via the PSG. Channel A is set to produce a tone of 1316Hz then enabled with an amplitude of seven. After a delay of 40 ms control transfers to the [GICINI](#gicini) standard routine to reinitialize the PSG.

<a name="113bh"></a>

    Address... 113BH

This routine is used by the interrupt handler to service a music queue. As there are three of these, each feeding a PSG channel, the queue to be serviced is specified by supplying its number in register A: 0=[VOICAQ](#voicaq), 1=[VOICBQ](#voicbq) and 2=[VOICCQ](#voiccq).

Each string in a "`PLAY`" statement is translated into a series of data packets by the BASIC Interpreter. These are placed in the appropriate queue followed by an end of data byte (FFH). The task of dequeueing the packets, decoding them and setting the PSG is left to the interrupt handler. The Interpreter is thus free to proceed immediately to the next statement without having to wait for notes to finish.

The first two bytes of any packet specify its byte count and duration. The three most significant bits of the first byte specify the number of bytes following the header in the packet. The remainder of the header specifies the event duration in 20 ms units. This duration count determines how long it will be before the next packet is read from the queue.

<a name="figure37"></a>![][CH04F37]

**Figure 37:** Packet Header

The packet header may be followed by zero or more blocks, in any order, containing frequency or amplitude information:

<a name="figure38"></a>![][CH04F38]

**Figure 38:** Packet Block Types

The routine first locates the current duration counter in the relevant voice buffer ([VCBA](#vcba), [VCBB](#vcbb) or [VCBC](#vcbc)) via the [GETVCP](#getvcp) standard routine and decrements it. If the counter has reached zero then the next packet must be read from the queue, otherwise the routine terminates.

The queue number is placed in [QUEUEN](#queuen) and a byte read from the queue ([11E2H](#11e2h)). This is then checked to see if it is the end of data mark (FFH), if so the queue terminates ([11B0H](#11b0h)). Otherwise the byte count is placed in register C and the duration MSB in the relevant voice buffer. The second byte is read ([11E2H](#11e2h)) and the duration LSB placed in the relevant voice buffer. The byte count is then examined, if there are no bytes to follow the packet header the routine terminates. Otherwise successive bytes are read from the queue, and the appropriate action taken, until the byte count is exhausted.

If a frequency block is found then a second byte is read and both bytes written to PSG Registers [0](#registers_0_and_1) and [1](#registers_0_and_1), [2](#registers_2_and_3) and [3](#registers_2_and_3) or [4](#registers_4_and_5) and [5](#registers_4_and_5) depending on the queue number.

If an amplitude block is found the Amplitude and Mode bits are written to PSG Registers [8](#register_8), [9](#register_9) or [10](#register_10) depending on the queue number. If the Mode bit is 1, selecting modulated rather than fixed amplitude, then the byte is also written to PSG [Register 13](#register_13) to set the envelope shape.

If an envelope block is found, or if bit 6 of an amplitude block is set, then a further two bytes are read from the queue and written to PSG Registers [11](#registers_11_and_12) and [12](#registers_11_and_12).

<a name="11b0h"></a>

    Address... 11B0H

This routine is used when an end of data mark (FFH) is found in one of the three music queues. An amplitude value of zero is written to PSG Register [8](#register_8) [9](#register_9) or [10](#register_10), depending on the queue number, to shut the channel down. The channel's bit in [MUSICF](#musicf) is then reset and control drops into the [STRTMS](#strtms) standard routine.

<a name="11c4h"></a><a name="strtms"></a>

```
Address... 11C4H
Name...... STRTMS
Entry..... None
Exit...... None
Modifies.. AF, HL
```

Standard routine used by the "`PLAY`" statement handler to initiate music dequeueing by the interrupt handler. [MUSICF](#musicf) is first examined, if any channels are already running the routine terminates with no action. [PLYCNT](#plycnt) is then decremented, if there are no more "`PLAY`" strings queued up the routine terminates. Otherwise the three duration counters, in [VCBA](#vcba), [VCBB](#vcbb) and [VCBC](#vcbc), are set to 0001H, so that the first packet of the new group will be dequeued at the next interrupt, and [MUSICF](#musicf) is set to 07H to enable all three channels.

<a name="11e2h"></a>

    Address... 11E2H

This routine loads register A with the current queue number, from [QUEUEN](#queuen), and then reads a byte from that queue ([14ADH](#14adh)).

<a name="11eeh"></a><a name="gtstck"></a>

```
Address... 11EEH
Name...... GTSTCK
Entry..... A=Joystick ID (0, 1 or 2)
Exit...... A=Joystick position code
Modifies.. AF, B, DE, HL, EI
```

Standard routine to read the position of a joystick or the four cursor keys. If the supplied ID is zero the state of the cursor keys is read via [PPI Port B](ppi_port_b) ([1226H](#1226h)) and converted to a position code using the look-up table at 1243H. Otherwise joystick connector 1 or 2 is read ([120CH](#120ch)) and the four direction bits converted to a position code using the look-up table at 1233H. The returned position codes are:

<a name="figure39a"></a>![][CH04F39a]

<a name="120ch"></a>

    Address... 120CH

This routine reads the joystick connector specified by the contents of register A: 0=Connector 1, 1=Connector 2. The current contents of PSG [Register 15](#register_15) are read in then written back with the Joystick Select bit appropriately set. PSG [Register 14](#register_14) is then read into register A (110CH) and the routine terminates.

<a name="1226h"></a>

    Address... 1226H

This routine reads row 8 of the keyboard matrix. The current contents of [PPI Port C](ppi_port_c) are read in then written back with the four Keyboard Row Select bits set for row 8. The column inputs are then read into register A from [PPI Port B](ppi_port_b).

<a name="1253h"></a><a name="gttrig"></a>

```
Address... 1253H
Name...... GTTRIG
Entry..... A=Trigger ID (0, 1, 2, 3 or 4)
Exit...... A=Status code
Modifies.. AF, BC, EI
```

Standard routine to check the joystick trigger or space key status. If the supplied ID is zero row 8 of the keyboard matrix is read ([1226H](#1226h)) and converted to a status code. Otherwise joystick connector 1 or 2 is read ([120CH](#120ch)) and converted to a status code. The selection IDs are:

```
0=SPACE KEY
1=JOY 1, TRIGGER A
2=JOY 2, TRIGGER A
3=JOY 1, TRIGGER B
4=JOY 2, TRIGGER B
```

The value returned is FFH if the relevant trigger is pressed and zero otherwise.

<a name="1273h"></a><a name="gtpdl"></a>

```
Address... 1273H
Name...... GTPDL
Entry..... A=Paddle ID (1 to 12)
Exit...... A=Paddle value (0 to 255)
Modifies.. AF, BC, DE, EI
```

Standard routine to read the value of any paddle attached to a joystick connector. Each of the six input lines (four direction plus two triggers) per connector can support a paddle so twelve are possible altogether. The paddles attached to joystick connector 1 have entry identifiers 1, 3, 5, 7, 9 and 11. Those attached to joystick connector 2 have entry identifiers 2, 4, 6, 8, 10 and 12. Each paddle is basically a one-shot pulse generator, the length of the pulse being controlled by a variable resistor. A start pulse is issued to the specified joystick connector via PSG [Register 15](#register_15). A count is then kept of how many times PSG [Register 14](#register_14) has to be read until the relevant input times out. Each unit increment represents an approximate period of 12 µs on an MSX machine with one wait state.

<a name="12ach"></a><a name="gtpad"></a>

```
Address... 12ACH
Name...... GTPAD
Entry..... A=Function code (0 to 7)
Exit...... A=Status or value
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to access a touchpad attached to either of the joystick connectors. Available functions codes for joystick connector 1 are:

```
0=Return Activity Status
1=Return "X" coordinate
2=Return "Y" coordinate
3=Return Switch Status
```

Function codes 4 to 7 have the same effect with respect to joystick connector 2. The Activity Status function returns FFH if the Touchpad is being touched and zero otherwise. The Switch Status function returns FFH if the switch is being pressed and zero otherwise. The two coordinate request functions return the coordinates of the last location touched. These coordinates are actually stored in the Workspace Area variables [PADX](#padx) and [PADY](#pady) when a call with function code 0 or 4 detects activity. Note that these variables are shared by both joystick connectors.

<a name="1384h"></a><a name="stmotr"></a>

```
Address... 1384H
Name...... STMOTR
Entry..... A=Motor ON/OFF code
Exit...... None
Modifies.. AF
```

Standard routine to turn the cassette motor relay on or off via [PPI Port C](ppi_port_c): 00H=Off, 01H=On, FFH=Reverse current state.

<a name="1398h"></a><a name="nmi"></a>

```
Address... 1398H
Name...... NMI
Entry..... None
Exit...... None
Modifies.. None
```

Standard routine to process a Z80 Non Maskable Interrupt, simply returns on a standard MSX machine.

<a name="139dh"></a><a name="inifnk"></a>

```
Address... 139DH
Name...... INIFNK
Entry..... None
Exit...... None
Modifies.. BC, DE, HL
```

Standard routine to initialize the ten function key strings to their power-up values. The one hundred and sixty bytes of data commencing at [13A9H](#13a9h) are copied to the [FNKSTR](#fnkstr) buffer in the Workspace Area.

<a name="13a9h"></a>

    Address... 13A9H

This area contains the power-up strings for the ten function keys. Each string is sixteen characters long, unused positions contain zeroes:

```
F1 to F5  F6 to F10
color     color 15,4,4 CR
auto      cload"
goto      cont CR
list      list. CR UP UP
run CR    run CLS CR
```

<a name="1449h"></a><a name="rdvdp"></a>

```
Address... 1449H
Name...... RDVDP
Entry..... None
Exit...... A=VDP Status Register contents
Modifies.. A
```

Standard routine to input the contents of the [VDP Status Register](#vdp_status_register) by reading the [Command Port](#command_port). Note that reading the [VDP Status Register](#vdp_status_register) will clear the associated flags and may affect the interrupt handler.

<a name="144ch"></a><a name="rslreg"></a>

```
Address... 144CH
Name...... RSLREG
Entry..... None
Exit...... A=Primary Slot Register contents
Modifies.. A
```

Standard routine to input the contents of the Primary slot Register by reading [PPI Port A](ppi_port_a).

<a name="144fh"></a><a name="wslreg"></a>

```
Address... 144FH
Name...... WSLREG
Entry..... A=Value to write
Exit...... None
Modifies.. None
```

Standard routine to set the Primary Slot Register by writing to [PPI Port A](ppi_port_a).

<a name="1452h"></a><a name="snsmat"></a>

```
Address... 1452H
Name...... SNSMAT
Entry..... A=Keyboard row number
Exit...... A=Column data of keyboard row
Modifies.. AF, C, EI
```

Standard routine to read a complete row of the keyboard matrix. [PPI Port C](ppi_port_c) is read in then written back with the row number occupying the four Keyboard Row Select bits. [PPI Port B](ppi_port_b) is then read into register A to return the eight column inputs. The four miscellaneous control outputs of [PPI Port C](ppi_port_c) are unaffected by this routine.

<a name="145fh"></a><a name="isflio"></a>

```
Address... 145FH
Name...... ISFLIO
Entry..... None
Exit...... Flag NZ if file I/O active
Modifies.. AF
```

Standard routine to check whether the BASIC Interpreter is currently directing its input or output via an I/O buffer. This is determined by examining [PTRFIL](#ptrfil). It is normally zero but will contain a buffer FCB (File Control Block) address while statements such as "`PRINT#1`", "`INPUT#1`", etc. are being executed by the Interpreter.

<a name="146ah"></a><a name="dcompr"></a>

```
Address... 146AH
Name...... DCOMPR
Entry..... HL, DE
Exit...... Flag NC if HL>DE, Flag Z if HL=DE, Flag C if HL<DE
Modifies.. AF
```

Standard routine used by the BASIC Interpreter to check the relative values of register pairs HL and DE.

<a name="1470h"></a><a name="getvcp"></a>

```
Address... 1470H
Name...... GETVCP
Entry..... A=Voice number (0, 1, 2)
Exit...... HL=Address in voice buffer
Modifies.. AF, HL
```

Standard routine to return the address of byte 2 in the specified voice buffer ([VCBA](#vcba), [VCBB](#vcbb) or [VCBC](#vcbc)).

<a name="1474h"></a><a name="getvc2"></a>

```
Address... 1474H
Name...... GETVC2
Entry..... L=Byte number (0 to 36)
Exit...... HL=Address in voice buffer
Modifies.. AF, HL
```

Standard routine to return the address of any byte in the voice buffer ([VCBA](#vcba), [VCBB](#vcbb) or [VCBC](#vcbc)) specified by the voice number in [VOICEN](#voicen).

<a name="148ah"></a><a name="phydio"></a>

```
Address... 148AH
Name...... PHYDIO
Entry..... None
Exit...... None
Modifies.. None
```

Standard routine for use by Disk BASIC, simply returns on standard MSX machines.

<a name="148eh"></a><a name="format"></a>

```
Address... 148EH
Name...... FORMAT
Entry..... None
Exit...... None
Modifies.. None
```

Standard routine for use by Disk BASIC, simply returns on standard MSX machines.

<a name="1492h"></a><a name="putq"></a>

```
Address... 1492H
Name...... PUTQ
Entry..... A=Queue number, E=Data byte
Exit...... Flag Z if queue full
Modifies.. AF, BC, HL
```

Standard routine to place a data byte in one of the three music queues. The queue's get and put positions are first taken from [QUETAB](#quetab) ([14FAH](#14fah)). The put position is temporarily incremented and compared with the get position, if they are equal the routine terminates as the queue is full. Otherwise the queue's address is taken from [QUETAB](#quetab) and the put position added to it. The data byte is placed at this location in the queue, the put position is incremented and the routine terminates. Note that the music queues are circular, if the get or put pointers reach the last position in the queue they wrap around back to the start.

<a name="14adh"></a>

    Address... 14ADH

This routine is used by the interrupt handler to read a byte from one of the three music queues. The queue number is supplied in register A, the data byte is returned in register A and the routine returns Flag Z if the queue is empty. The queue's get and put positions are first taken from [QUETAB](#quetab) ([14FAH](#14fah)). If the putback flag is active then the data byte is taken from [QUEBAK](#quebak) and the routine terminates (14D1H), this facility is unused in the current versions of the MSX ROM. The put position is then compared with the get position, if they are equal the routine terminates as the queue is empty. Otherwise the queue's address is taken from [QUETAB](#quetab) and the get position added to it. The data byte is read from this location in the queue, the get position is incremented and the routine terminates.

    Address... 14DAH

This routine is used by the [GICINI](#gicini) standard routine to initialize a queue's control block in [QUETAB](#quetab). The control block is first located in [QUETAB](#quetab) ([1504H](#1504h)) and the put, get and putback bytes zeroed. The size byte is set from register B and the queue address from register pair DE.

<a name="14ebh"></a><a name="lftq"></a>

```
Address... 14EBH
Name...... LFTQ
Entry..... A=Queue number
Exit...... HL=Free space left in queue
Modifies.. AF, BC, HL
```

Standard routine to return the number of free bytes left in a music queue. The queue's get and put positions are taken from [QUETAB](#quetab) ([14FAH](#14fah)) and the free space determined by subtracting put from get.

<a name="14fah"></a>

    Address... 14FAH

This routine returns a queue's control parameters from [QUETAB](#quetab), the queue number is supplied in register A. The control block is first located in [QUETAB](#quetab) ([1504H](#1504h)), the put position is then placed in register B, the get position in register C and the putback flag in register A.

<a name="1504h"></a>

    Address... 1504H

This routine locates a queue's control block in [QUETAB](#quetab). The queue number is supplied in register A and the control block address returned in register pair HL. The queue number is simply multiplied by six, as there are six bytes per block, and added to the address of [QUETAB](#quetab) as held in [QUEUES](#queues).

<a name="1510h"></a><a name="grpprt"></a>

```
Address... 1510H
Name...... GRPPRT
Entry..... A=Character
Exit...... None
Modifies.. EI
```

Standard routine to display a character on the screen in either [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode), it is functionally equivalent to the [CHPUT](#chput) standard routine.

The [CNVCHR](#cnvchr) standard routine is first used to check for a graphic character, if the character is a header code (01H) then the routine terminates with no action. If the character is a converted graphic one then the control code decoding section is skipped. Otherwise the character is checked to see if it is a control code. Only the CR code (0DH) is recognized ([157EH](#157eh)), all other characters smaller than 20H are ignored.

Assuming the character is displayable its eight byte pixel pattern is copied from the ROM character set into the [PATWRK](#patwrk) buffer (0752H) and [FORCLR](#forclr) copied to [ATRBYT](#atrbyt) to set its colour. The current graphics coordinates are then taken from [GRPACX](#grpacx) and [GRPACY](#grpacy) and used to set the current pixel physical address via the [SCALXY](#scalxy) and [MAPXYC](#mapxyc) standard routines.

The eight byte pattern in [PATWRK](#patwrk) is processed a byte at a time. At the start of each byte the current pixel physical address is obtained via the [FETCHC](#fetchc) standard routine and saved. The eight bits are then examined in turn. If the bit is a 1 the associated pixel is set by the [SETC](#setc) standard routine, if it is a 0 no action is taken. After each bit the current pixel physical address is moved right ([16ACH](#16ach)). When the byte is finished, or the right hand edge of the screen is reached, the initial current pixel physical address is restored and moved down one position by the [TDOWNC](#tdownc) standard routine.

When the pattern is complete, or the bottom of the screen has been reached, [GRPACX](#grpacx) is updated. In [Graphics Mode](#graphics_mode) its value is increased by eight, in [Multicolour Mode](#multicolour_mode) by thirty-two. If [GRPACX](#grpacx) then exceeds 255, the right hand edge of the screen, a CR operation is performed ([157EH](#157eh)).

<a name="157eh"></a>

    Address... 157EH

This routine performs the CR operation for the [GRPPRT](#grpprt) standard routine, this code functions as a combined CR,LF. [GRPACX](#grpacx) is zeroed and eight or thirty-two, depending on the screen mode, added to [GRPACY](#grpacy). If [GRPACY](#grpacy) then exceeds 191, the bottom of the screen, it is set to zero.

[GRPACX](#grpacx) and [GRPACY](#grpacy) may be manipulated directly by an application program to compensate for the limited number of control functions available.

<a name="1599h"></a><a name="scalxy"></a>

```
Address... 1599H
Name...... SCALXY
Entry..... BC=X coordinate, DE=Y coordinate
Exit...... Flag NC if clipped
Modifies.. AF
```

Standard routine to clip a pair of graphics coordinates if necessary. The BASIC Interpreter can produce coordinates in the range -32768 to +32767 even though this far exceeds the actual screen size. This routine modifies excessive coordinate values to fit within the physically realizable range. If the X coordinate is greater than 255 it is set to 255, if the Y coordinate is greater than 191 it is set to 191. If either coordinate is negative (greater than 7FFFH) it is set to zero. Finally if the screen is in [Multicolour Mode](#multicolour_mode) both coordinates are divided by four as required by the [MAPXYC](#mapxyc) standard routine.

    Address... 15D9H

This routine is used to check the current screen mode, it returns Flag Z if the screen is in [Graphics Mode](#graphics_mode).

<a name="15dfh"></a><a name="mapxyc"></a>

```
Address... 15DFH
Name...... MAPXYC
Entry..... BC=X coordinate, DE=Y coordinate
Exit...... None
Modifies.. AF, D, HL
```

Standard routine to convert a graphics coordinate pair into the current pixel physical address. The location in the Character Pattern Table of the byte containing the pixel is placed in [CLOC](#cloc). The bit mask identifying the pixel within that byte is placed in [CMASK](#cmask). Slightly different conversion methods are used for [Graphics Mode](#graphics_mode) and [Multicolour Mode](#multicolour_mode), equivalent programs in BASIC are:

```
Graphics Mode

10 INPUT"X,Y Coordinates";X,Y
20 A=(Y\8)*256+(Y AND 7)+(X AND &HF8)
30 PRINT"ADDR=";HEX$(Base(12)+A);"H ";
40 RESTORE 100
50 FOR N=0 TO (X AND 7):READ M$: NEXT N
60 PRINT"MASK=";M$
70 GOTO 10
100 DATA 10000000
110 DATA 01000000
120 DATA 00100000
130 DATA 00010000
140 DATA 00001000
150 DATA 00000100
160 DATA 00000010
170 DATA 00000001
```

</a>

```
Multicolour Mode

10 INPUT"X,Y Coordinates";X,Y
20 X=X\4:Y-Y\4
30 A=(Y\8)*256+(Y AND 7)+(X*4 AND &HF8)
40 PRINT"ADDR=";HEX$(BASE(17)+A);"H ";
50 IF X MOD 2=0 THEN MS="11110000" ELSE MS="00001111"
60 PRINT"MASK=";M$
70 GOTO 10
```

The allowable input range for both programs is X=0 to 255 and Y=0 to 191. The data statements in the [Graphics Mode](#graphics_mode) program correspond to the eight byte mask table commencing at 160BH in the MSX ROM. Line 20 in the [Multicolour Mode](#multicolour_mode) program actually corresponds to the division by four in the [SCALXY](#scalxy) standard routine. It is included to make the coordinate system consistent for both programs.

<a name="1639h"></a><a name="fetchc"></a>

```
Address... 1639H
Name...... FETCHC
Entry..... None
Exit...... A=CMASK, HL=CLOC
Modifies.. A, HL
```

Standard routine to return the current pixel physical address, register pair HL is loaded from [CLOC](#cloc) and register A from [CMASK](#cmask).

<a name="1640h"></a><a name="storec"></a>

```
Address... 1640H
Name...... STOREC
Entry..... A=CMASK, HL=CLOC
Exit...... None
Modifies.. None
```

Standard routine to set the current pixel physical address, register pair HL is copied to [CLOC](#cloc) and register A is copied to [CMASK](#cmask).

<a name="1647h"></a><a name="readc"></a>

```
Address... 1647H
Name...... READC
Entry..... None
Exit...... A=Colour code of current pixel
Modifies.. AF, EI
```

Standard routine to return the colour of the current pixel. The VRAM physical address is first obtained via the [FETCHC](#fetchc) standard routine. If the screen is in [Graphics Mode](#graphics_mode) the byte pointed to by [CLOC](#cloc) is read from the Character Pattern Table via the [RDVRM](#rdvrm) standard routine. The required bit is then isolated by [CMASK](#cmask) and used to select either the upper or lower four bits of the corresponding entry in the Colour Table.

If the screen is in [Multicolour Mode](#multicolour_mode) the byte pointed to by [CLOC](#cloc) is read from the Character Pattern Table via the [RDVRM](#rdvrm) standard routine. [CMASK](#cmask) is then used to select either the upper or lower four bits of this byte. The value returned in either case will be a normal VDP colour code from zero to fifteen.

<a name="1676h"></a><a name="setatr"></a>

```
Address... 1676H
Name...... SETATR
Entry..... A=Colour code
Exit...... Flag C if illegal code
Modifies.. Flags
```

Standard routine to set the graphics ink colour used by the [SETC](#setc) and [NSETCX](#nsetcx) standard routines. The colour code, from zero to fifteen, is simply placed in [ATRBYT](#atrbyt).

<a name="167eh"></a><a name="setc"></a>

```
Address... 167EH
Name...... SETC
Entry..... None
Exit...... None
Modifies.. AF, EI
```

Standard routine to set the current pixel to any colour, the colour code is taken from [ATRBYT](#atrbyt). The pixel's VRAM physical address is first obtained via the [FETCHC](#fetchc) standard routine. In [Graphics Mode](#graphics_mode) both the Character Pattern Table and Colour Table are then modified ([186CH](#186ch)).

In [Multicolour Mode](#multicolour_mode) the byte pointed to by [CLOC](#cloc) is read from the Character Pattern Table by the [RDVRM](#rdvrm) standard routine. The contents of [ATRBYT](#atrbyt) are then placed in the upper or lower four bits, as determined by [CMASK](#cmask), and the byte written back via the [WRTVRM](#wrtvrm) standard routine

<a name="16ach"></a>

    Address... 16ACH

This routine moves the current pixel physical address one position right. If the right hand edge of the screen is exceeded it returns with Flag C and the physical address is unchanged. In [Graphics Mode](#graphics_mode) [CMASK](#cmask) is first shifted one bit right, if the pixel still remains within the byte the routine terminates. If [CLOC](#cloc) is at the rightmost character cell (LSB=F8H to FFH) then the routine terminates with Flag C (175AH). Otherwise [CMASK](#cmask) is set to 80H, the leftmost pixel, and 0008H added to [CLOC](#cloc).

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([1779H](#1779h)).

<a name="16c5h"></a><a name="rightc"></a>

```
Address... 16C5H
Name...... RIGHTC
Entry..... None
Exit...... None
Modifies.. AF
```

Standard routine to move the current pixel physical address one position right. In [Graphics Mode](#graphics_mode) [CMASK](#cmask) is first shifted one bit right, if the pixel still remains within the byte the routine terminates. Otherwise [CMASK](#cmask) is set to 80H, the leftmost pixel, and 0008H added to [CLOC](#cloc). Note that incorrect addresses will be produced if the right hand edge of the screen is exceeded.

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([178BH](#178bh)).

<a name="16d8h"></a>

    Address... 16D8H

This routine moves the current pixel physical address one position left. If the left hand edge of the screen is exceeded it returns Flag C and the physical address is unchanged. In [Graphics Mode](#graphics_mode) [CMASK](#cmask) is first shifted one bit left, if the pixel still remains within the byte the routine terminates. If [CLOC](#cloc) is at the leftmost character cell (LSB=00H to 07H) then the routine terminates with Flag C (175AH). Otherwise [CMASK](#cmask) is set to 01H, the rightmost pixel, and 0008H subtracted from [CLOC](#cloc).

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([179CH](#179ch)).

<a name="16eeh"></a><a name="leftc"></a>

```
Address... 16EEH
Name...... LEFTC
Entry..... None
Exit...... None
Modifies.. AF
```

Standard routine to move the current pixel physical address one position left. In [Graphics Mode](#graphics_mode) [CMASK](#cmask) is first shifted one bit left, if the pixel still remains within the byte the routine terminates. Otherwise [CMASK](#cmask) is set to 01H, the leftmost pixel, and 0008H subtracted from [CLOC](#cloc). Note that incorrect addresses will be produced if the left hand edge of the screen is exceeded.

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([17ACH](#17ach)).

<a name="170ah"></a><a name="tdownc"></a>

```
Address... 170AH
Name...... TDOWNC
Entry..... None
Exit...... Flag C if off screen
Modifies.. AF
```

Standard routine to move the current pixel physical address one position down. If the bottom edge of the screen is exceeded it returns Flag C and the physical address is unchanged. In [Graphics Mode](#graphics_mode) [CLOC](#cloc) is first incremented, if it still remains within an eight byte boundary the routine terminates. If [CLOC](#cloc) was in the bottom character row ([CLOC](#cloc)>=1700H) then the routine terminates with Flag C (1759H). Otherwise 00F8H is added to [CLOC](#cloc).

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([17C6H](#17c6h)).

<a name="172ah"></a><a name="downc"></a>

```
Address... 172AH
Name...... DOWNC
Entry..... None
Exit...... None
Modifies.. AF
```

Standard routine to move the current pixel physical address one position down. In [Graphics Mode](#graphics_mode) [CLOC](#cloc) is first incremented, if it still remains within an eight byte boundary the routine terminates. Otherwise 00F8H is added to [CLOC](#cloc). Note that incorrect addresses will be produced if the bottom edge of the screen is exceeded.

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([17DCH](#17dch)).

<a name="173ch"></a><a name="tupc"></a>

```
Address... 173CH
Name...... TUPC
Entry..... None
Exit...... Flag C if off screen
Modifies.. AF
```

Standard routine to move the current pixel physical address one position up. If the top edge of the screen is exceeded it returns with Flag C and the physical address is unchanged. In [Graphics Mode](#graphics_mode) [CLOC](#cloc) is first decremented, if it still remains within an eight byte boundary the routine terminates. If [CLOC](#cloc) was in the top character row ([CLOC](#cloc)<0100H) then the routine terminates with Flag C. Otherwise 00F8H is subtracted from [CLOC](#cloc).

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([17E3H](#17e3h)).

<a name="175dh"></a><a name="upc"></a>

```
Address... 175DH
Name...... UPC
Entry..... None
Exit...... None
Modifies.. AF
```

Standard routine to move the current pixel physical address one position up. In [Graphics Mode](#graphics_mode) [CLOC](#cloc) is first decremented, if it still remains within an eight byte boundary the routine terminates. Otherwise 00F8H is subtracted from [CLOC](#cloc). Note that incorrect addresses will be produced if the top edge of the screen is exceeded.

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([17F8H](#17f8h)).

<a name="1779h"></a>

    Address... 1779H

This is the [Multicolour Mode](#multicolour_mode) version of the routine at [16ACH](#16ach). It is identical to the [Graphics Mode](#graphics_mode) version except that [CMASK](#cmask) is shifted four bit positions right and becomes F0H if a cell boundary is crossed.

<a name="178bh"></a>

    Address... 178BH

This is the [Multicolour Mode](#multicolour_mode) version of the [RIGHTC](#rightc) standard routine. It is identical to the [Graphics Mode](#graphics_mode) version except that [CMASK](#cmask) is shifted four bit positions right and becomes F0H if a cell boundary is crossed.

<a name="179ch"></a>

    Address... 179CH

This is the [Multicolour Mode](#multicolour_mode) version of the routine at [16D8H](#16d8h). It is identical to the [Graphics Mode](#graphics_mode) version except that [CMASK](#cmask) is shifted four bit positions left and becomes 0FH if a cell boundary is crossed.

<a name="17ach"></a>

    Address... 17ACH

This is the [Multicolour Mode](#multicolour_mode) version of the [LEFTC](#leftc) standard routine. It is identical to the [Graphics Mode](#graphics_mode) version except that [CMASK](#cmask) is shifted four bit positions left and becomes 0FH if a cell boundary is crossed.

<a name="17c6h"></a>

    Address... 17C6H

This is the [Multicolour Mode](#multicolour_mode) version of the [TDOWNC](#tdownc) standard routine. It is identical to the [Graphics Mode](#graphics_mode) version except that the bottom boundary address is 0500H instead of 1700H. There is a bug in this routine which will cause it to behave unpredictably if [MLTCGP](#mltcgp), the Character Pattern Table base address, is changed from its normal value of zero. There should be an `EX DE,HL` instruction inserted at address 17CEH.

If the Character Pattern Table base is increased the routine will think it has reached the bottom of the screen when it actually has not. This routine is used by the "`PAINT`" statement so the following demonstrates the fault:

```
10 BASE(17)=&H1000
20 SCREEN 3
30 PSET(200,0)
40 DRAW"D180L100U180R100"
50 PAINT(150,90)
60 GOTO 60
```

</a>

<a name="17dch"></a>

    Address... 17DCH

This is the [Multicolour Mode](#multicolour_mode) version of the [DOWNC](#downc) standard routine, it is identical to the [Graphics Mode](#graphics_mode) version.

<a name="17e3h"></a>

    Address... 17E3H

This is the [Multicolour Mode](#multicolour_mode) version of the [TUPC](#tupc) standard routine. It is identical to the [Graphics Mode](#graphics_mode) version except that is has a bug as above, this time there should be an `EX DE,HL` instruction at address 17EBH.

If the Character Pattern Table base address is increased the routine will think it is within the table when it has actually exceeded the top edge of the screen. This may be demonstrated by removing the "`R100`" part of Line 40 in the previous program.

<a name="17f8h"></a>

    Address... 17F8H

This is the [Multicolour Mode](#multicolour_mode) version of the [UPC](#upc) standard routine, it is identical to the [Graphics Mode](#graphics_mode) version.

<a name="1809h"></a><a name="nsetcx"></a>

```
Address... 1809H
Name...... NSETCX
Entry..... HL=Pixel fill count
Exit...... None
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to set the colour of multiple pixels horizontally rightwards from the current pixel physical address. Although its function can be duplicated by the [SETC](#setc) and [RIGHTC](#rightc) standard routines this would result in significantly slower operation. The supplied pixel count should be chosen so that the right-hand edge of the screen is not passed as this will produce anomalous behaviour. The current pixel physical address is unchanged by this routine.

In [Graphics Mode](#graphics_mode) [CMASK](#cmask) is first examined to determine the number of pixels to the right within the current character cell. Assuming the fill count is large enough these are then set ([186CH](#186ch)). The remaining fill count is divided by eight to determine the number of whole character cells. Successive bytes in the Character Pattern Table are then zeroed and the corresponding bytes in the Colour Table set from [ATRBYT](#atrbyt) to fill these whole cells. The remaining fill count is then converted to a bit mask, using the seven byte table at 185DH, and these pixels are set ([186CH](#186ch)).

In [Multicolour Mode](#multicolour_mode) control transfers to a separate routine ([18BBH](#18bbh)).

<a name="186ch"></a>

    Address... 186CH

This routine sets up to eight pixels within a cell to a specified colour in [Graphics Mode](#graphicsmod). [ATRBYT](#atrbyt) contains the colour code, register pair HL the address of the relevant byte in the Character Pattern Table and register A a bit mask, 11100000 for example, where every 1 specifies a bit to be set.

If [ATRBYT](#atrbyt) matches the existing 1 pixel colour in the corresponding Colour Table byte then each specified bit is set to 1 in the Character Pattern Table byte. If [ATRBYT](#atrbyt) matches the existing 0 pixel colour in the corresponding Colour Table byte then each specified bit is set to 0 in the Character Pattern Table byte.

If [ATRBYT](#atrbyt) does not match either of the existing colours in the Colour Table Byte then normally each specified bit is set to 1 in the Character Pattern Table byte and the 1 pixel colour changed in the Colour Table byte. However if this would result in all bits being set to 1 in the Character Pattern Table byte then each specified bit is set to 0 and the 0 pixel colour changed in the Colour Table byte.

<a name="18bbh"></a>

    Address... 18BBH

This is the [Multicolour Mode](#multicolour_mode) version of the [NSETCX](#nsetcx) standard routine. The [SETC](#setc) and [RIGHTC](#rightc) standard routines are called until the fill count is exhausted. Speed of operation is not so important in [Multicolour Mode](#multicolour_mode) because of the lower screen resolution and the consequent reduction in the number of operations required.

<a name="18c7h"></a><a name="gtaspc"></a>

```
Address... 18C7H
Name...... GTASPC
Entry..... None
Exit...... DE=ASPCT1, HL=ASPCT2
Modifies.. DE, HL
```

Standard routine to return the "`CIRCLE`" statement default aspect ratios.

<a name="18cfh"></a><a name="pntini"></a>

```
Address... 18CFH
Name...... PNTINI
Entry..... A=Boundary colour (0 to 15)
Exit...... Flag C if illegal colour
Modifies.. AF
```

Standard routine to set the boundary colour for the "`PAINT`" statement. In [Multicolour Mode](#multicolour_mode) the supplied colour code is placed in [BDRATR](#bdratr). In [Graphics Mode](#graphics_mode) [BDRATR](#bdratr) is copied from [ATRBYT](#atrbyt) as it is not possible to have separate paint and boundary colours.

<a name="18e4h"></a><a name="scanr"></a>

```
Address... 18E4H
Name...... SCANR
Entry..... B=Fill switch, DE=Skip count
Exit...... DE=Skip remainder, HL=Pixel count
Modifies.. AF, BC, DE, HL, EI
```

Standard routine used by the "`PAINT`" statement handler to search rightwards from the current pixel physical address until a colour code equal to [BDRATR](#bdratr) is found or the edge of the screen is reached. The terminating position becomes the current pixel physical address and the initial position is returned in [CSAVEA](#csavea) and [CSAVEM](#csavem). The size of the traversed region is returned in register pair HL and [FILNAM](#filnam)+1. The traversed region is normally filled in but this can be inhibited, in [Graphics Mode](#graphics_mode) only, by using an entry parameter of zero in register B. The skip count in register pair DE determines the maximum number of pixels of the required colour that may be ignored from the initial starting position. This facility is used by the "`PAINT`" statement handler to search for gaps in a horizontal boundary blocking its upward progress.

<a name="197ah"></a><a name="scanl"></a>

```
Address... 197AH
Name...... SCANL
Entry..... None
Exit...... HL=Pixel count
Modifies.. AF, BC, DE, HL, EI
```

Standard routine to search leftwards from the current pixel physical address until a colour code equal to [BDRATR](#bdratr) is found or the edge of the screen is reached. The terminating position becomes the current pixel physical address and the size of the traversed region is returned in register pair HL. The traversed region is always filled in.

<a name="19c7h"></a>

    Address... 19C7H

This routine is used by the [SCANL](#scanl) and [SCANR](#scanr) standard routines to check the current pixel's colour against the boundary colour in [BDRATR](#bdratr).

<a name="19ddh"></a><a name="tapoof"></a>

```
Address... 19DDH
Name...... TAPOOF
Entry..... None
Exit...... None
Modifies.. EI
```

Standard routine to stop the cassette motor after data has been written to the cassette. After a delay of 550 ms, on MSX machines with one wait state, control drops into the [TAPIOF](#tapiof) standard routine.

<a name="19e9h"></a><a name="tapiof"></a>

```
Address... 19E9H
Name...... TAPIOF
Entry..... None
Exit...... None
Modifies.. EI
```

Standard routine to stop the cassette motor after data has been read from the cassette. The motor relay is opened via the [PPI Mode Port](#ppi_mode_port). Note that interrupts, which must be disabled during cassette data transfers for timing reasons, are enabled as this routine terminates.

<a name="19f1h"></a><a name="tapoon"></a>

```
Address... 19F1H
Name...... TAPOON
Entry..... A=Header length switch
Exit...... Flag C if CTRL-STOP termination
Modifies.. AF, BC, HL, DI
```

Standard routine to turn the cassette motor on, wait 550 ms for the tape to come up to speed and then write a header to the cassette. A header is a burst of HI cycles written in front of every data block so the baud rate can be determined when the data is read back.

The length of the header is determined by the contents of register A: 00H=Short header, NZ=Long header. The BASIC cassette statements "`SAVE`", "`CSAVE`" and "`BSAVE`" all generate a long header at the start of the file, in front of the identification block, and thereafter use short headers between data blocks. The number of cycles in the header is also modified by the current baud rate so as to keep its duration constant:

```
1200 Baud SHORT ... 3840 Cycles ... 1.5 Seconds
1200 Baud LONG ... 15360 Cycles ... 6.1 Seconds
2400 Baud SHORT ... 7936 Cycles ... 1.6 Seconds
2400 Baud LONG ... 31744 Cycles ... 6.3 Seconds
```

After the motor has been turned on and the delay has expired the contents of [HEADER](#header) are multiplied by two hundred and fifty-six and, if register A is non-zero, by a further factor of four to produce the cycle count. HI cycles are then generated ([1A4DH](#1a4dh)) until the count is exhausted whereupon control transfers to the [BREAKX](#breakx) standard routine. Because the CTRL-STOP key is only examined at termination it is impossible to break out part way through this routine.

<a name="1a19h"></a><a name="tapout"></a>

```
Address... 1A19H
Name...... TAPOUT
Entry..... A=Data byte
Exit...... Flag C if CTRL-STOP termination
Modifies.. AF, B, HL
```

Standard routine to write a single byte of data to the cassette. The MSX ROM uses a software driven FSK (Frequency Shift Keyed) method for storing information on the cassette. At the 1200 baud rate this is identical to the Kansas City Standard used by the BBC for the distribution of BASICODE programs.

At 1200 baud each 0 bit is written as one complete 1200 Hz LO cycle and each 1 bit as two complete 2400 Hz HI cycles. The data rate is thus constant as 0 and 1 bits have the same duration. When the 2400 baud rate is selected the two frequencies change to 2400 Hz and 4800 Hz but the format is otherwise unchanged.

A byte of data is written with a 0 start bit ([1A50H](#1a50h)), eight data bits with the least significant bit first, and two 1 stop bits ([1A40H](#1a40h)). At the 1200 baud rate a single byte will have a nominal duration of 11 x 833 µs = 9.2 ms. After the stop bits have been written control transfers to the [BREAKX](#breakx) standard routine to check the CTRL-STOP key. The byte 43H is shown below as it would be written to cassette:

<a name="figure39b"></a>![][CH04F39b]

**Figure 39:** Cassette Data Byte

It is important not to leave too long an interval between bytes when writing data as this will increase the error rate. An inter-byte gap of 80 µs, for example, produces a read failure rate of approximately twelve percent. If a substantial amount of processing is required between each byte then buffering should be used to lump data into headered blocks. The BASIC "`SAVE`" format is of this type.

<a name="1a39h"></a>

    Address... 1A39H

This routine writes a single LO cycle with a length of approximately 816 µs to the cassette. The length of each half of the cycle is taken from [LOW](#low) and control transfers to the general cycle generator ([1A50H](#1a50h)).

<a name="1a40h"></a>

    Address... 1A40H

This routine writes two HI cycles to the cassette. The first cycle is generated ([1A4DH](#1a4dh)) followed by a 17 µs delay and then the second cycle ([1A4DH](#1a4dh)).

<a name="1a4dh"></a>

    Address... 1A4DH

This routine writes a single HI cycle with a length of approximately 396 µs to the cassette. The length of each half of the cycle is taken from [HIGH](#high) and control drops into the general cycle generator.

<a name="1a50h"></a>

    Address... 1A50H

This routine writes a single cycle to the cassette. The length of the cycle's first half is supplied in register L and its second half in register H. The first length is counted down and then the Cas Out bit set via the [PPI Mode Port](#ppi_mode_port). The second length is counted down and the Cas Out bit reset.

On all MSX machines the Z80 runs at a clock frequency of 3.579545 MHz (280 ns) with one wait state during the M1 cycle. As this routine counts every 16T states each unit increment in the length count represents a period of 4.47 µs. There is also a fixed overhead of 20.7 µs associated with the routine whatever the length count.

<a name="1a63h"></a><a name="tapion"></a>

```
Address... 1A63H
Name...... TAPION
Entry..... None
Exit...... Flag C if CTRL-STOP termination
Modifies.. AF, BC, DE, HL, DI
```

Standard routine to turn the cassette motor on, read the cassette until a header is found and then determine the baud rate. Successive cycles are read from the cassette and the length of each one measured ([1B34H](#1b34h)). When 1,111 cycles have been found with less than 35 µs variation in their lengths a header has been located.

The next 256 cycles are then read ([1B34H](#1b34h)) and averaged to determine the cassette HI cycle length. This figure is multiplied by 1.5 and placed in [LOWLIM](#lowlim) where it defines the minimum acceptable length of a 0 start bit. The HI cycle length is placed in [WINWID](#winwid) and will be used to discriminate between LO and HI cycles.

<a name="1abch"></a><a name="tapin"></a>

```
Address... 1ABCH
Name...... TAPIN
Entry..... None
Exit...... A=Byte read, Flag C if CTRL-STOP or I/O error
Modifies.. AF, BC, DE, L
```

Standard routine to read a byte of data from the cassette. The cassette is first read continuously until a start bit is found. This is done by locating a negative transition, measuring the following cycle length ([1B1FH](#1b1fh)) and comparing this to see if it is greater than [LOWLIM](#lowlim).

Each of the eight data bits is then read by counting the number of transitions within a fixed period of time ([1B03H](#1b03h)). If zero or one transitions are found it is a 0 bit, if two or three are found it is a 1 bit. If more than three transitions are found the routine terminates with Flag C as this is presumed to be a hardware error of some sort. After the value of each bit has been determined a further one or two transitions are read (1B23H) to retain synchronization. With an odd transition count one more will be read, with an even transition count two more.

<a name="1b03h"></a>

    Address... 1B03H

This routine is used by the [TAPIN](#tapin) standard routine to count the number of cassette transitions within a fixed period of time. The window duration is contained in [WINWID](#winwid) and is approximately 1.5 times the length of a HI cycle as shown below:

<a name="figure40"></a>![][CH04F40]

**Figure 40:** Cassette Window

The Cas Input bit is continuously sampled via PSG [Register 14](#register_14) and compared with the previous reading held in register E. Each time a change of state is found register C is incremented. The sampling rate is once every 17.3 µs so the value in [WINWID](#winwid), which was determined by the [TAPION](#tapion) standard routine with a count rate of 11.45 µs, is effectively multiplied one and a half times.

<a name="1b1fh"></a>

    Address... 1B1FH

This routine measures the time to the next cassette input transition. The Cassette Input bit is continuously sampled via PSG [Register 14](#register_14) until it changes from the state supplied in register E. The state flag is then inverted and the duration count returned in register C, each unit increment represents a period of 11.45 µs.

<a name="1b34h"></a>

    Address... 1B34H

This routine measures the length of a complete cassette cycle from negative transition to negative transition. The Cassette Input bit is sampled via PSG [Register 14](#register_14) until it goes to zero. The transition flag in register E is set to zero and the time to the positive transition measured (1B23H). The time to the negative transition is then measured (1B25H) and the total returned in register C.

<a name="1b45h"></a><a name="outdo"></a>

```
Address... 1B45H
Name...... OUTDO
Entry..... A=Character to output
Exit...... None
Modifies.. EI
```

Standard routine used by the BASIC Interpreter to output a character to the current device. The [ISFLIO](#isflio) standard routine is first used to check whether output is currently directed to an I/O buffer, if so control transfers to the sequential output driver ([6C48H](#6c48h)) via the [CALBAS](#calbas) standard routine. If [PRTFLG](#prtflg) is zero control transfers to the [CHPUT](#chput) standard routine to output the character to the screen. Assuming the printer is active [RAWPRT](#rawprt) is checked. If this is non-zero the character is passed directly to the printer ([1BABH](#1babh)), otherwise control drops into the [OUTDLP](#outdlp) standard routine.

<a name="1b63h"></a><a name="outdlp"></a>

```
Address... 1B63H
Name...... OUTDLP
Entry..... A=Character to output
Exit...... None
Modifies.. EI
```

Standard routine to output a character to the printer. If the character is a TAB code (09H) spaces are issued to the [OUTDLP](#outdlp) standard routine until [LPTPOS](#lptpos) is a multiple of eight (0, 8, 16 etc.). If the character is a CR code (0DH) [LPTPOS](#lptpos) is zeroed if it is any other control code [LPTPOS](#lptpos) is unaffected, if it is a displayable character [LPTPOS](#lptpos) is incremented.

If [NTMSXP](#ntmsxp) is zero, meaning an MSX-specific printer is connected, the character is passed directly to the printer ([1BABH](#1babh)). Assuming a normal printer is connected the [CNVCHR](#cnvchr) standard routine is used to check for graphic characters. If the character is a header code (01H) the routine terminates with no action. If it is a converted graphic character it is replaced by a space, all other characters are passed to the printer (1BACH).

<a name="1b97h"></a>

    Address... 1B97H

This twenty byte table is used by the keyboard decoder to find the correct routine for a given key number:

|KEY NUMBER  |TO     |FUNCTION
|------------|:-----:|------------------
|00H to 2FH  |0F83H  |Rows 0 to 5
|30H to 32H  |0F10H  |SHIFT, CTRL, GRAPH
|33H         |0F36H  |CAP
|34H         |0F10H  |CODE
|35H to 39H  |0FC3H  |F1 to F5
|3AH to 3BH  |0F10H  |ESC, TAB
|3CH         |0F46H  |STOP
|3DH to 40H  |0F10H  |BS, CR, SEL, SPACE
|41H         |0F06H  |HOME
|42H to 57H  |0F10H  |INS, DEL, CURSOR

</a>

<a name="1babh"></a>

    Address... 1BABH

This routine is used by the [OUTDLP](#outdlp) standard routine to pass a character to the printer. It is sent via the [LPTOUT](#lptout) standard routine, if this returns Flag C control transfers to the "`Device I/O error`" generator ([73B2H](#73b2h)) via the [CALBAS](#calbas) standard routine.

<a name="1bbfh"></a>

    Address... 1BBFH

The following 2 KB contains the power-up character set. The first eight bytes contain the pattern for character code 00H, the second eight bytes the pattern for character code 01H and so on to character code FFH.

<a name="23bfh"></a><a name="pinlin"></a>

```
Address... 23BFH
Name...... PINLIN
Entry..... None
Exit...... HL=Start of text, Flag C if CTRL-STOP termination
Modifies.. AF, BC, DE, HL, EI
```

Standard routine used by the BASIC Interpreter Mainloop to collect a logical line of text from the console. Control transfers to the [INLIN](#inlin) standard routine just after the point where the previous line has been cut (23E0H).

<a name="23cch"></a><a name="qinlin"></a>

```
Address... 23CCH
Name...... QINLIN
Entry..... None
Exit...... HL=Start of text, Flag C if CTRL-STOP termination
Modifies.. AF, BC, DE, HL, EI
```

Standard routine used by the "`INPUT`" statement handler to collect a logical line of text from the console. The characters "`? `" are displayed via the [OUTDO](#outdo) standard routine and control drops into the [INLIN](#inlin) standard routine.

<a name="23d5h"></a><a name="inlin"></a>

```
Address... 23D5H
Name...... INLIN
Entry..... None
Exit...... HL=Start of text, Flag C if CTRL-STOP termination
Modifies.. AF, BC, DE, HL, EI
```

Standard routine used by the "`LINE INPUT`" statement handler to collect a logical line of text from the console. Characters are read from the keyboard until either the CR or CTRL-STOP keys are pressed. The logical line is then read from the screen character by character and placed in the Workspace Area text buffer [BUF](#buf).

The current screen coordinates are first taken from [CSRX](#csrx) and [CSRY](#csry) and placed in [FSTPOS](#fstpos). The screen row immediately above the current one then has its entry in [LINTTB](#linttb) made non-zero ([0C29H](#0c29h)) to stop it extending logically into the current row.

Each keyboard character read via the [CHGET](#chget) standard routine is checked (0919H) against the editing key table at [2439H](#2439h). Control then transfers to one of the editing routines or to the default key handler ([23FFH](#23ffh)) as appropriate. This process continues until Flag C is returned by the CTRL-STOP or CR routines. Register pair HL is then set to point to the start of [BUF](#buf) and the routine terminates. Note that the carry, flag is cleared when Flag NZ is also returned to distinguish between a CR or protected CTRL-STOP termination and a normal CTRL-STOP termination.

<a name="23ffh"></a>

    Address... 23FFH

This routine processes all characters for the [INLIN](#inlin) standard routine except the special editing keys. If the character is a TAB code (09H) spaces are issued ([23FFH](#23ffh)) until [CSRX](#csrx) is a multiple of eight plus one (columns 1, 9, 17, 25, 33). If the character is a graphic header code (01H) it is simply echoed to the [OUTDO](#outdo) standard routine. All other control codes smaller than 20H are echoed to the [OUTDO](#outdo) standard routine after which [INSFLG](#insflg) and [CSTYLE](#cstyle) are zeroed. For the displayable characters [INSFLG](#insflg) is first checked and a space inserted ([24F2H](#24f2h)) if applicable before the character is echoed to the [OUTDO](#outdo) standard routine.

<a name="2439h"></a>

    Address... 2439H

This table contains the special editing keys recognized by the [INLIN](#inlin) standard routine together with the relevant addresses:

|CODE |TO    |FUNCTION
|:---:|:----:|----------------------------
|08H  |2561H |BS, backspace
|12H  |24E5H |INS, toggle insert mode
|1BH  |23FEH |ESC, no action
|02H  |260EH |CTRL-B, previous word
|06H  |25F8H |CTRL-F, next word
|0EH  |25D7H |CTRL-N, end of logical line
|05H  |25B9H |CTRL-E, clear to end of line
|03H  |24C5H |CTRL-STOP, terminate
|0DH  |245AH |CR, terminate
|15H  |25AEH |CTRL-U, clear line
|7FH  |2550H |DEL, delete character

</a>

<a name="245ah"></a>

    Address... 245AH

This routine performs the CR operation for the [INLIN](#inlin) standard routine. The starting coordinates of the logical line are found ([266CH](#266ch)) and the cursor removed from the screen ([0A2EH](#0a2eh)). Up to 254 characters are then read from the VDP VRAM ([0BD8H](#0bd8h)) and placed in [BUF](#buf). Any null codes (00H) are ignored, any characters smaller than 20H are replaced by a graphic header code (01H) and the character itself with 40H added. As the end of each physical row is reached [LINTTB](#linttb) is checked ([0C1DH](#0c1dh)) to see whether the logical line extends to the next physical row. Trailing spaces are then stripped from [BUF](#buf) and a zero byte added as an end of text marker. The cursor is restored to the screen ([09E1H](#09e1h)) and its coordinates set to the last physical row of the logical line via the [POSIT](#posit) standard routine. A LF code is issued to the [OUTDO](#outdo) standard routine, [INSFLG](#insflg) is zeroed and the routine terminates with a CR code (0DH) in register A and Flag NZ,C. This CR code will be echoed to the screen by the [INLIN](#inlin) standard routine mainloop just before it terminates.

<a name="24c5h"></a>

    Address... 24C5H

This routine performs the CTRL-STOP operation for the [INLIN](#inlin) standard routine. The last physical row of the logical line is found by examining [LINTTB](#linttb) ([0C1DH](#0c1dh)), [CSTYLE](#cstyle) is zeroed, a zero byte is placed at the start of [BUF](#buf) and all music variables are cleared via the [GICINI](#gicini) standard routine. [TRPTBL](#trptbl) is then examined (0454H) to see if an "`ON STOP`" statement is active, if so the cursor is reset (24AFH) and the routine terminates with Flag NZ,C. [BASROM](#basrom) is then checked to see whether a protected ROM is running, if so the cursor is reset (24AFH) and the routine terminates with Flag NZ,C. Otherwise the cursor is reset (24B2H) and the routine terminates with Flag Z,C.

<a name="24e5h"></a>

    Address... 24E5H

This routine performs the INS operation for the [INLIN](#inlin) standard routine. The current state of [INSFLG](#insflg) is inverted and control terminates via the [CSTYLE](#cstyle) setting routine (242CH).

<a name="24f2h"></a>

    Address... 24F2H

This routine inserts a space character for the default key section of the [INLIN](#inlin) standard routine. The cursor is removed ([0A2EH](#0a2eh)) and the current cursor coordinates taken from [CSRX](#csrx) and [CSRY](#csry). The character at this position is read from the VDP VRAM ([0BD8H](#0bd8h)) and replaced with a space ([0BE6H](#0be6h)). Successive characters are then copied one column position to the right until the end of the physical row is reached.

At this point [LINTTB](#linttb) is examined ([0C1DH](#0c1dh)) to determine whether the logical line is extended, if so the process continues on the next physical row. Otherwise the character taken from the last column position is examined, if this is a space the routine terminates by replacing the cursor ([09E1H](#09e1h)). Otherwise the physical row's entry in [LINTTB](#linttb) is zeroed to indicate an extended logical line. The number of the next physical row is compared with the number of rows on the screen ([0C32H](#0c32h)). If the next row is the last one the screen is scrolled up (0A88H), otherwise a blank row is inserted (0AB7H) and the copying process continues.

<a name="2550h"></a>

    Address... 2550H

This routine performs the DEL operation for the [INLIN](#inlin) standard routine. If the current cursor position is at the rightmost column and the logical line is not extended no action is taken other than to write a space to the VDP VRAM (2595H). Otherwise a RIGHT code (1CH) is issued to the [OUTDO](#outdo) standard routine and control drops into the BS routine.

<a name="2561h"></a>

    Address... 2561H

This routine performs the BS operation for the [INLIN](#inlin) standard routine. The cursor is first removed ([0A2EH](#0a2eh)) and the cursor column coordinate decremented unless it is at the leftmost position and the previous row is not extended. Characters are then read from the VDP VRAM ([0BD8H](#0bd8h)) and written back one position to the left ([0BE6H](#0be6h)) until the end of the logical line is reached. At this point a space is written to the VDP VRAM ([0BE6H](#0be6h)) and the cursor character is restored ([09E1H](#09e1h)).

<a name="25aeh"></a>

    Address... 25AEH

This routine performs the CTRL-U operation for the [INLIN](#inlin) standard routine. The cursor is removed ([0A2EH](#0a2eh)) and the start of the logical line located ([266CH](#266ch)) and placed in [CSRX](#csrx) and [CSRY](#csry). The entire logical line is then cleared (25BEH).

<a name="25b9h"></a>

    Address... 25B9H

This routine performs the CTRL-E operation for the [INLIN](#inlin) standard routine. The cursor is removed ([0A2EH](#0a2eh)) and the remainder of the physical row cleared ([0AEEH](#0aeeh)). This process is repeated for successive physical rows until the end of the logical line is found in [LINTBB](#lintbb) ([0C1DH](#0c1dh)). The cursor is then restored ([09E1H](#09e1h)), [INSFLG](#insflg) zeroed and [CSTLYE](#cstlye) reset to a block cursor (242DH).

<a name="25d7h"></a>

    Address... 25D7H

This routine performs the CTRL-N operation for the [INLIN](#inlin) standard routine. The cursor is removed ([0A2EH](#0a2eh)) and the last physical row of the logical line found by examination of [LINTTB](#linttb) ([0C1DH](#0c1dh)). Starting at the rightmost column of this physical row characters are read from the VDP VRAM ([0BD8H](#0bd8h)) until a non-space character is found. The cursor coordinates are then set one column to the right of this position ([0A5BH](#0a5bh)) and the routine terminates by restoring the cursor (25CDH).

<a name="25f8h"></a>

    Address... 25F8H

This routine performs the CTRL-F operation for the [INLIN](#inlin) standard routine. The cursor is removed ([0A2EH](#0a2eh)) and moved successively right ([2624H](#2624h)) until a non-alphanumeric character is found. The cursor is then moved successively right ([2624H](#2624h)) until an alphanumeric character is found. The routine terminates by restoring the cursor (25CDH).

<a name="260eh"></a>

    Address... 260EH

This routine performs the CTRL-B operation for the [INLIN](#inlin) standard routine. The cursor is removed ([0A2EH](#0a2eh)) and moved successively left ([2634H](#2634h)) until an alphanumeric character is found. The cursor is then moved successively left ([2634H](#2634h)) until a non-alphanumeric character is found and then moved one position right ([0A5BH](#0a5bh)). The routine terminates by restoring the cursor (25CDH).

<a name="2624h"></a>

    Address... 2624H

This routine moves the cursor one position right ([0A5BH](#0a5bh)), loads register D with the rightmost column number, register E with the bottom row number and then tests for an alphanumeric character at the cursor position (263DH).

<a name="2634h"></a>

    Address... 2634H

This routine moves the cursor one position left ([0A4CH](#0a4ch)), loads register D with the leftmost column number and register E with the top row number. The current cursor coordinates are compared with these values and the routine terminates Flag Z if the cursor is at this position. Otherwise the character at this position is read from the VDP VRAM ([0BD8H](#0bd8h)) and checked to see if it is alphanumeric. If so the routine terminates Flag NZ,C otherwise it terminates Flag NZ,NC.

The alphanumeric characters are the digits "0" to "9" and the letters "A" to "Z" and "a" to "z". Also included are the graphics characters 86H to 9FH and A6H to FFH, these were originally Japanese letters and should have been excluded during the conversion to the UK ROM.

<a name="266ch"></a>

    Address... 266CH

This routine finds the start of a logical line and returns its screen coordinates in register pair HL. Each physical row above the current one is checked via the [LINTTB](#linttb) table ([0C1DH](#0c1dh)) until a non-extended row is found. The row immediately below this on the screen is the start of the logical line and its row number is placed in register L. This is then compared with [FSTPOS](#fstpos), which contains the row number when the [INLIN](#inlin) standard routine was first entered, to see if the cursor is still on the same line. If so the column coordinate in register H is set to its initial position from [FSTPOS](#fstpos). Otherwise register H is set to the leftmost position to return the whole line.

<a name="2680h"></a>
<a name="2683h"></a>
<a name="2686h"></a>
<a name="2689h"></a>

```
Address...2680H, JP to power-up initialize routine (7C76H).
Address...2683H, JP to the SYNCHR standard routine (558CH).
Address...2686H, JP to the CHRGTR standard routine (4666H).
Address...2689H, JP to the GETYPR standard routine (5597H).
```
