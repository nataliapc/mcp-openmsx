# MSX-MIDI

From MSX Datapack Vol. 3  
Translated by Laurens Holst

## Chapter 1: About MSX-MIDI

With MSX-MIDI, MIDI functionality and BASIC extensions were added to MSX-MUSIC to enable it to use MIDI. Unlike MSX-MUSIC, there is no BIOS. Non-BASIC MSX-MIDI programs directly access the hardware from the I/O ports.

MSX-MIDI can be both built into the machine body, or an external cartridge. MSX MIDI is only available to MSX turbo R and later.

It can not be used on MSX, MSX2 and MSX2+. It can also be used on FPGA OCM-PLD machines through the joystick port, or on any MSX machine with a MIDI interface cartridge.

MSX-MIDI is organized as follows:

#### MIDI interface

|||
|:--|:--|
|8251|MIDI data communication IC|
|8253 or 8254|Baud rate generator and timer IC|

These ICs can be accessed through the I/O ports.

#### MSX-MIDI ROM (16K bytes)

In case it is built-in, it is placed in the same slot as the MSX-Music (slot 0-2, page 1).

In case it is an external cartridge, it is included on the cartridge.

When the BASIC extensions are used, it is initialized to use external cartridge's MSX-MIDI instead of the built-in MSX-MUSIC.

## Chapter 2: Hardware

Between internal or external MSX-MIDI, the hardware configuration and access methods and such is different.

What follows is a description of the MSX MIDI hardware configuration.

Additionally, regardless of whether timer IC 8253 or 8254 is used, it will henceforth be referred to as "8253".

### 2.1 Block Diagram

The MSX-MIDI hardware is organised as follows:

```
            8251
MIDI IN  +--------+                           +-----+
    ---->|     RTS|-------------------------->| AND |-----+
         |   RXRDY|-------------------------->|     |     |
MIDI OUT |     DSR|<----------------+         +-----+     |
    <----|     DTR|-----------+     +------------------+  +-->+----+
         +--------+<------+   |                        |      | OR |--> INT
                          |   +-------+                |  +-->+----+
               8253       |           |       +-----+  |  |
            +--------+    |500KHz     +------>| AND |--+--+
4 MHz --+-->| TIMER0 |----+              +--->|     |
        |   +--------+          +-----+  |    +-----+
        |   | TIMER1 |<---+---->|S  FF|--+
        |   +--------+    |  +->|R    |
        +-->| TIMER2 |----+  |  +-----+
            +--------+       |
                         0EAh Write
```
Figure 4.1 MSX-MIDI block diagram


### 2.2 Internal MIDI interface

The I/O ports of the built-in MSX-MIDI interface are assigned as follows:

#### 8251 interface (address 0E8H, 0E9H)

||b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
|**0E8H** (Read)|RXD7|RXD6|RXD5|RXD4|RXD3|RXD2|RXD1|RXD0|
|**0E8H** (Write)|TXD7|TXD6|TXD5|TXD4|TXD3|TXD2|TXD1|TXD0|

|||
|:--|:--|
|RXD7-RXD0|8251 receive data|
|TXD7-TXD0|8251 transmit data|

||b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
|**0E9H** (Read)|DSR|BRK|FE|OE|PE|EMPT|RRDY|TRDY|

||||
|:--|:--|:--|
|DSR|8253 timer interrupt flag|(1=interrupt occurs)|
|BRK|8251 break code detection|(1=detected)|
|FE|8251 frame error flag|(1=error occurs)|
|OE|8251 overrun error flag|(1=error occurs)|
|PE|8251 parity error flag|(1=parity error occurs)|
|EMPT|8251 transmit buffer status|(1=transmit buffer empty)|
|RRDY|8251 receive buffer status|(1=data available)|
|TRDY|8251 transmit status|(1=transmission possible)|

|**0E9H** (Write)|b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
|Mode|S2|S1|EP|PEN|L2|L1|B2|B1|
|Command|EH|IR|RIE|ER|SBRK|RE|TIE|TEN|

|||
|:--|:--|
|EH|Normally set to 0|
|IR|Normally set to 0|
|RIE|MIDI IN interrupt enable|(1=enable, 0=disable)
|ER|Error reset|(1=reset error flag, 0=no operation)|
|SBRK|Normally set to 0|
|RE|MIDI IN receive enable|(1=enable, 0=disable)|
|TIE|8253 timer (counter #2) interrupt enable|(1=enable, 0=disable)|
|TEN|MIDI OUT transmit enable|(1=enable, 0=disable)|

For 8251 command / mode register writes, a recovery time of at most 16 clock ticks (at 3.579545MHz) is necessary. When writing to the command / mode register continuously, please insert a wait to allow the 8251 to reinitialise.

By writing 00H, 00H, 00H, 40H to I/O port 0E9H, the 8251 is reset. It will no longer function as MIDI if an incorrect mode value is configured, so after a reset always set it to a specific value.

For more information, please see the [sample program](#42-sample-program).

#### 8253 OUT2 latch pin signal (address 0EAH, 0EBH)

||b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|**0EAH** (Write)|-|-|-|-|-|-|-|-|

- Reading address 0EAH is invalid
- Address 0EBH is an image of 0EAH

The interrupt from counter #2 is released by writing any data to address 0EAH.

#### 8253 Interface (address 0ECH-0EFH)

||b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|**0ECH** (R/W)|CT07|CT06|CT05|CT04|CT03|CT02|CT01|CT00|
|**0EDH** (R/W)|CT17|CT16|CT15|CT14|CT13|CT12|CT11|CT10|
|**0EEH** (R/W)|CT27|CT26|CT25|CT24|CT23|CT22|CT21|CT20|
|**0EFH** (Read)|-|-|-|-|-|-|-|-|
|**0EFH** (Write)|SC1|SC0|RW1|RW0|M2|M1|M0|BCD|

|||
|:--|:--|
|CT07-CT00|Counter #0|
|CT17-CT10|Counter #1|
|CT27-CT20|Counter #2|
|SC1, SC0|Counter select, command select|
|RW1, RW0|Counter read-write mode|
|M2, M1, M0|Counter mode|
|BCD|Binary / BCD count select|

The function of each counter is as follows:
- **Counter #0:** Is used as the 8251's baud rate generator. A 4 MHz clock signal is input to the CLK pin. For the 8251, it must be configured to transmit a baud rate clock of 500 KHz (divided by 8). Use mode 3 (square wave divide-by-N mode).
- **Counter #1:** Can be used as general-purpose counter. The output of counter #2 is input to the CLK pin.
- **Counter #2:** Used as a periodic interrupt to the CPU (used by BASIC for 5 ms interval interrupts). Normally, mode 2 (divide-by-N mode) is used. OUT2 pin goes low, and through the latch circuit a CPU interrupt is generated. A 4 MHz clock is input to the CLK pin.

### 2.3 External MIDI Interface

The external MSX-MIDI interface's I/O port address can be changed by setting a value to I/O port 0E2H.

#### MIDI interface configuration (address 0E2H, 0EAH)

||b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|**0E2H** (Write)|EN|-|-|-|-|-|-|E8|

|||
|:--|:--|
|EN|MIDI interface usage allow / denyInitial value is 1 (0=allow, 1=deny)|
|E8|8251 address configurationInitial value is 1 (1=address 0E0H,0E1H 0=address 0E8H,0E9H)

Set bit E8 to 0, and the external cartridge MIDI interface's I/O ports change from 0E2H to 0EAH, becoming compatible with the internal MIDI interface. Also, the 8251's I/O address becomes 0E8H and 0E9H.

Set bit E8 to 1 and the 8251 interface addresses will be 0E0H and 0E1H, and access to the cartridge's I/O ports 0ECH-0EFH will be prohibited. Additionally, the 8253's timer interrupt is also inhibited.

#### 8251 interface (address 0E0H, 0E1H)

(in case E8 bit is 1)

||b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|**0E0H** (Read)|RXD7|RXD6|RXD5|RXD4|RXD3|RXD2|RXD1|RXD0|
|**0E0H** (Write)|TXD7|TXD6|TXD5|TXD4|TXD3|TXD2|TXD1|TXD0|

|||
|:--|:--|
|RXD7-RXD0|8251 receive data|
|TXD7-TXD0|8251 transmit data|

||b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|**0E1H** (Read)|DSR|BRK|FE|OE|PE|EMPT|RRDY|TRDY|

||||
|:--|:--|:--|
|DSR|8253 timer interrupt flag|(1=interrupt occurs)|
|BRK|8251 break code detection|(1=detected)|
|FE|8251 frame error flag|(1=error occurs)|
|OE|8251 overrun error flag|(1=error occurs)|
|PE|8251 parity error flag|(1=parity error occurs)|
|EMPT|8251 transmit buffer status|(1=transmit buffer empty)|
|RRDY|8251 receive buffer status|(1=data available)|
|TRDY|8251 transmit status|(1=transmission possible)|

|**0E1H** (Write)|b7|b6|b5|b4|b3|b2|b1|b0|
|:--|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|Mode|S2|S1|EP|PEN|L2|L1|B2|B1|
|Command|EH|IR|RIE|ER|SBRK|RE|TIE|TEN|

||||
|:--|:--|:--|
|EH|Normally set to 0||
|IR|Normally set to 0||
|RIE|MIDI IN interrupt enable|(1=enable, 0=disable)|
|ER|Error reset|(1=reset error flag, 0=no operation)|
|SBRK|Normally set to 0||
|RE|MIDI IN receive enable|(1=enable, 0=disable)|
|TIE|8253 timer (counter #2) interrupt enable|(1=enable, 0=disable)|
|TEN|MIDI OUT transmit enable|(1=enable, 0=disable)|

### 2.4 Method to distinguish internal from external type

In case bit 0 of MAIN ROM address 002EH is 1, the MSX-MIDI is internal.

In models whose MAIN ROM version number (002DH) is 03H or more, the features of the MSX-MIDI can be used with an external cartridge.

In the internal type and the external type, the hook is different.

This distinction is important in order to create an application. For hooks, please see 3.2 "Hooks" and chapter 4 "Application development".

To make the distinction between internal type and external type, examine the string starting at MSX MIDI ROM address 4018H.

Table 4.1 String to distinguish MSX-MIDI

|Address|Internal|External|
|:--|:-:|:-:|
|4018H|41H (A)|??H (?)|
|4019H|50H (P)|??H (?)|
|401AH|52H (R)|??H (?)|
|401BH|4CH (L)|??H (?)|
|401CH|4FH (O)|4DH (M)|
|401DH|50H (P)|49H (I)|
|401EH|4CH (L)|44H (D)|
|401FH|4CH (L)|49H (I)|

In external cartridges, the 4 unspecified bytes at 4018H are different for each manufacturer. The data at 401CH consists of "MIDI".

### 2.5 Method to detect presence of MIDI interface

The presence or absence of the MIDI interface can be determined in the following manner:

1. In case MAIN ROM address 002EH bit 0 is 1, the MIDI interface is internal.
2. In case the MAIN ROM version number (002DH) is 03H or more, look for a slot which contains the following in 401CH-401FH: `DB "MIDI"`. If it exists, the external cartridge is inserted.
3. When the above cases do not apply, since there is no MIDI interface, the MIDI function can not be used.
4. In case the ROM version number is 02H or less, the MIDI interface can not be used.

## Chapter 3: Interrupts

### 3.1 Interrupts in BASIC

1/60 sec (NTSC) or 1/50 sec (PAL) interrupts have been used for the MSX-MUSIC, but in the MSX-MIDI BASIC extensions 5 ms interrupts from the 8253 are used.

### 3.2 Hooks

The MSX turbo R built-in MSX-MIDI's hooks are as follows:

Table 4.2 Internal MSX-MIDI hooks

|Address|Name|Former name|Content|
|:-:|:--|:--|:--|
|0FF75H|H.MDIN|H.OKNORM|MIDI IN interrupt|
|0FF93H|H.MDTM|H.FRQINT|8253 timer interrupt|

In case of external cartridge, because these hooks can not be used, please use H.KEYI. Usage details are described in chapter 4 "Application Development".

Table 4.3 External MSX-MIDI hooks

|Address|Name|
|0FD9AH|H.KEYI|

## Chapter 4: Application Development

### 4.1 Notes regarding application development

When creating an application program that supports MSX-MIDI, please note the following points:

1. The hooks are different depending on whether MIDI is built-in or external. When setting up a hook, please check if the type is internal or external.
2. When enabling interrupts, such as after MIDI interface initialization, because there is a possibility that the interrupt flag has already been set, the interrupt flag must be reset. Interrupt flags are as follows:

    - Table 4.4 MIDI interface interrupt flags

|Interrupt type|Interrupt distinction|Interrupt clear method|
|:--|:--|:--|
|Timer|Bit 7 (DSR) of 0E9H or 0E1H|Write any value to 0EAH|
|MIDI IN|Bit 0 (RRDY) of 0E9H or 0E1H|Read 0E8H with IN instruction|

3. With the external cartridge, other interrupts besides MIDI IN and 8253 timer also come from H.KEYI. Therefore, the interrupt handling routine must detect what kind of interrupt the current interrupt is.
    - Whether or not it is a MIDI IN interrupt can be checked in bit 1 of I/O port address 0E9H.
    - Whether or not it is an interrupt from the 8253 timer can be checked in bit 7 of I/O port address 0E9H.
4. At the shortest, the MIDI IN receive interrupt occurs at 320 µs intervals. When calling an interrupt handling routine from the hook with the RST 30H instruction, the inter-slot call takes time to process and will not complete in time for 320 µs interval reception. For that reason, set up interrupts as follows:
    - Place the interrupt handling routine in page 3
    - Jump from the hook to the interrupt handling routine with the JP instruction

### 4.2 Sample program

For MIDI interface and hook set up / tear down, please refer to the next sample program (THRU.MAC):

```
;
;	thru.mac
;
;
;	thru.com gets data from MIDI IN port
;	and send them out to MIDI OUT port.
;
	.z80
	cseg
;
;	BIOS entry
;
rdslt		equ	000ch		;read slot
calslt		equ	001ch		;call slot
doscal		equ	0005h		;dos call
;
;	character code
;
lf		equ	0ah		;line feed
cr		equ	0dh		;carrige return
esc		equ	1bh		;escape sequence
;
;	MIDI interface I/O
;
setcart		equ	0e2h	;MIDI cartridge setting
UARTsend	equ	0e8h	;8251 data transmit
UARTrecv	equ	0e8h	;8251 data receive
UARTcmd		equ	0e9h	;8251 command/mode register
UARTstat	equ	0e9h	;8251 status
tm_int		equ	0eah	;timer interrupt flag off
timer0		equ	0ech	;8253 counter #0
timer2		equ	0eeh	;8253 counter #2
tm_cmd		equ	0efh	;8253 command
;
;	hooks
;
h.oknorm	equ	0ff75h
h.mdin		equ	h.oknorm	;Hook for MIDI IN
h.frqint	equ	0ff93h
h.mdtm		equ	h.frqint	;Hook for 8253 timer
h.keyi		equ	0fd9ah		;Hook for 8253 timer

;
;	Set hooks
;
setmidi:
	call	chkmidi		;Have I MIDI interface ?
	jp	c,nomidi	; No
	di
	jr	z,setho2	;MIDI interface is not built in
;
;	Setting for built-in MIDI interface
;
	ld	hl,h.mdtm	;save hook (8253 timer)
	ld	de,hoksvt	;set address to save area
	push	hl		;save hook address
	call	copy5		;copy old hook
	ld	hl,hokmdt	;set address to new hook data
	pop	de		;get hook address
	call	copy5		;set new hook
;
	ld	hl,h.mdin       ;save hook (MIDI IN)
	ld	de,hoksvt+5	;set address to save area
	push	hl		;save hook address
	call	copy5		;copy old hook
	ld	hl,hokmdi	;set address to new hook data
	pop	de		;get hook address
	call	copy5		;set new hook
	jr	inimdp
;
;	Setting for MIDI cartridge
;
setho2:
	xor	a
	out	(setcart),a	;set cartridge as same as built-in I/F
	ld	hl,h.keyi	;save hook
	ld	de,hoksvt	;set address to save area
	push	hl		;save hook address
	call	copy5		;copy old hook
	ld	hl,hokmdc	;set address to new hook data
	pop	de		;get hook address
	call	copy5		;set new hook
	xor	a
	out	(setcart),a	;set MIDI cartridge I/O
	jr	inimdp
;
;	Here when no MIDI interface.
;	Print message and return to DOS.
;
nomidi:
	ld	de,msg0
	ld	c,9
	call	doscal
	ret
msg0:	db	cr,lf,'MIDI interface is not found.$'

copy5:
	ld	bc,5
	ldir
	ret
;
;	Hook Definition
;
hokmdi:				;hook for MIDI IN
	jp	midiin
	ret
	ret
hokmdt:				;hook for 8253timer
	jp	mdtmin
	ret
	ret
hokmdc:				;hook for MIDI cartridge
	jp	mdintr
	ret
	ret

;
;	Initialize MIDI Interface
;
inimdp:
;
;	MIDI baud rate generater
;
	ld	a,00010110b	;8253 Control Word
;		  |||||||+-----   Binary Count
;		  ||||+++------   Mode 3 :Rate Generater (Square Wave)
;		  ||++---------   LSB Read/Load
;		  ++-----------   Counter #0 for Baud Rate Generater of 8251
;
	out	(tm_cmd),a
	ld	a,8		; Set Counter.   4MHz / 8 = 500KHz
	out	(timer0),a	; Set 8253 Counter (LSB)
;
;	5msec timer
;
	ld	a,10110100b	;8253 Control Word
;		  |||||||+-----   Binary Count
;		  ||||+++------   Mode 2 :Rate Generater
;		  ||++---------   2bytes Read/Load
;		  ++-----------   Counter #2 for 5msec timer
;	
	out	(tm_cmd),a
	ld	hl,20000
	ld	a,l		;
	out	(timer2),a	; Set 8253 Counter (LSB)
	ld	a,h
	out	(timer2),a	; Set 8253 Counter (MSB)
;
;	Initialize 8251
;
	xor	a		; Reset 8251
	out	(UARTcmd),a	; Set 0
	call	waits
	out	(UARTcmd),a	; Set 0
	call	waits
	out	(UARTcmd),a	; Set 0
	call	waits
	ld	a,40h
	out	(UARTcmd),a	; Set 40h
	call	waits
;
;	Set 8251
;
	ld	a,01001110b	;8251 MODE Instruction
;		  ||||||++-----   Baud Rate :*16  ( 500KHz/16 = 31.25KHz )
;		  ||||++-------   Character Length : 8bits
;		  ||++---------   Parity Disable
;		  ++-----------   Stop Bit : 1bit
;
	out	(UARTcmd),a
	call	waits
	ld	a,00100111b	;8251 COMMAND Instruction
;		  |||||||+-----   Transmit : Enable
;		  ||||||+------   ~DTR = LOW : 8253timer enable
;		  |||||+-------   Receive  : Enable
;		  ||||+--------   Send Break Character : Normal
;		  |||+---------   Error Reset : No Operation
;		  ||+----------   ~RTS = LOW : MIDI IN enable
;		  |+-----------   No Operation
;		  +------------   No Operation
;
	ld	(cmdsv),a	;save command
	out	(UARTcmd),a
	in	a,(UARTrecv)	;interrupt flag reset
	xor	a
	out	(tm_int),a
	ld	de,msg1		;print message
	ld	c,9
	call	doscal
	ei
	jp	main

msg1:	db	cr,lf,'MIDI interface and hooks are set',cr,lf,'$'

;
;	main routine
;
;	Get data from buffer and print it.
;	If overrun error, then print '*'.
;
main:
	ld	hl,mdbuf	;set pointer
	ld	(putp),hl
	ld	(getp),hl
main1:
	call	getdat		;get MIDI IN data
	in	a,(UARTstat)
	and	00010000b	;overrun error ?
	jr	z,main2		;no
	ld	de,msg2
	ld	c,9
	call	doscal		;print '*'
	ld	a,(cmdsv)	;8251 command
	or	00010000b	;reset 8251
	out	(UARTcmd),a	;reset 8251 error flag
main2:
	ld	c,0bh		;console check
	call	doscal
	or	0		;is there any input ?
	jr	z,main1		;no , loop again
	jp	rstmidi

msg2:	db	cr,lf,'*',cr,lf,'$'
;
;	Get data from buffer
;
getdat:
	ld	hl,(getp)
	ld	de,(putp)
	scf
	ccf
	sbc	hl,de		;no data in buffer ?
	ret	z		;no data , then ret
	ld	hl,(getp)
	ld	a,(hl)		;get data from buffer
	ld	c,a
getda0:
	in	a,(UARTstat)	;get 8251 status
	and	1		;can I transmit ?
	jr	z,getda0	;no , check again
	ld	a,c
	out	(UARTsend),a	;MIDI OUT
	cp	0f8h		;if it is 'f8'(MIDI sync timing clock)
	jr	z,getda2	; then not print it
	cp	0feh		;if it is 'fe'(active sensing)
	jr	z,getda2	; then not print it
	cp	80h		;is it data-byte ?
	jr	c,getda1	;yes , skip
	push	af		;if it is status-byte ,...
	ld	de,msg3
	ld	c,9
	call	doscal		; then delete a line
	pop	af
getda1:
	call	prnbyt		;print it
getda2:
	ld	hl,(getp)
	inc	hl		;increment 'getp' pointer
	ld	de,bufend
	push	hl
	scf
	ccf
	sbc	hl,de		;end of buffer ?
	pop	hl
	jr	nz,getda3	;no 
	ld	hl,mdbuf
getda3:
	ld	(getp),hl	;save pointer
	ret
msg3:	db	esc,'M$'

;
;	Print 1byte data (hex)
;
prnbyt:
	push	af
	srl	a
	srl	a
	srl	a
	srl	a		;shift 4 bits
	call	prnby2		;print HIGH
	pop	af
	and	0fh
	call	prnby2		;print LOW
	ld	e,' '		;print out space
	ld	c,2
	call	doscal		;dos call 02h = console print out
	ret
prnby2:
	cp	10		; [a] < 10 ?
	jr	c,prnby3	; yes , jump
	add	a,'A'-10-'0'	; adjust data ('A'~'F')
prnby3:
	add	a,'0'
	ld	e,a		;[e] = character code
	ld	c,2
	call	doscal		;dos call 02h = console print out
	ret

;
;	Reset MIDI interface and reset hooks
;
rstmidi:
	di
;		Reset 8251
;				 RTS = HIGH : MIDI IN disable
;				 DTR = HIGH : 8253timer disable
	ld	a,00000001b	;8251 COMMAND Instruction
;		  |||||||+-----   Transmit : Enable
;		  ||||||+------   ~DTR = High
;		  |||||+-------   Receive  : Disable
;		  ||||+--------   Send Break Character : Normal
;		  |||+---------   Error Reset : No Operation
;		  ||+----------   ~RTS = High
;		  |+-----------   No Operation
;		  +------------   No Operation
;
	out	(UARTcmd),a

	call	chkmd2
	jr	z,rstmd1	;if not built-in , then jump
;
;	Reset built-in MIDI interface
;
	ld	de,h.mdtm	;restore hook
	ld	hl,hoksvt	;save area
	call	copy5
	ld	de,h.mdin
	ld	hl,hoksvt+5	;save area
	call	copy5
	jr	rstmd2
;
;	Reset MIDI cartridge
;
rstmd1:
	ld	de,h.keyi	;restore hook
	ld	hl,hoksvt	;save area
	call	copy5
rstmd2:
	ei
	ld	de,msg4		;print message
	ld	c,9
	call	doscal
	ret

msg4:	db	cr,lf,'MIDI interface and hooks are reset$'

;
;	Interrupt routin
;

;
;	For MIDI cartridge
;
mdintr:
	in	a,(UARTstat)	;MIDI IN ?
	and	00000010B
	jr	z,mdint1	;no
	call	intr_in		;yes
	jr	mdintr		;MIDI IN check again
mdint1:
	in	a,(UARTstat)	;8253 timer ?
	and	10000000B
	call	nz,intr_time	;yes
	jp	hoksvt

;
;	For built-in MIDI interface
;
;	MIDI IN
midiin:
	in	a,(UARTstat)	;MIDI IN ?
	and	00000010B
	jr	z,midin1	;no
	call	intr_in		;yes
	jr	midiin		;MIDI IN check again
midin1:
	ei
	jp	hoksvt+5

;	5msec timer
mdtmin:
	in	a,(UARTstat)	;8253 timer ?
	and	10000000B
	call	nz,intr_time	;yes
	jp	hoksvt

;
;	MIDI IN interrupt
;
intr_in:
	in	a,(UARTrecv)	;read MIDI IN data and reset interrupt flag
	ld	hl,(putp)
	ld	(hl),a		;save to buffer
	inc	hl		;increment 'putp'
	ld	de,bufend	;
	push	hl
	sbc	hl,de		;buffer end ?
	pop	hl
	jr	nz,mdin2	;no, jump
	ld	hl,mdbuf
mdin2:
	ld	(putp),hl	;set 'putp'
	ret
;
;	timer interrupt
;
intr_time:
	ld	a,(cmdsv)	;check timer interrupt enable or not.
	and	00000010b	;enable ?
	ret	z		;no
	xor	a
	out	(tm_int),a	;reset interrupt flag
	ret

;
;	Check MIDI interface
;	Return : [CF]=1			no MIDI interface
;	       : [CF]=0 , [ZF]=1        found MIDI cartridge
;	       : [CF]=0 , [ZF]=0        MIDI interface is built in
;
ver_id1		equ	002dh		;MAIN ROM Version ID
ver_id2		equ	002eh		;MIDI interface ID
exptbl		equ	0fcc1h		;slot expanded table
chkmidi:
	ld	a,(exptbl)
	ld	hl,ver_id1
	call	rdslt		;read Main ROM version ID
	cp	3
	ret	c		;MSX1,MSX2,MSX2+	return
	call	chkmd2		;read MIDI interface ID
	ret	nz		;MIDI interface is built in
	ld	b,4
chkro1:
	push	bc		;save counter
	ld	a,4
	sub	b		;primary slot number
	ld	c,a		;save
	ld	hl,exptbl
	ld	a,c
	add	a,l		;set exptbl
	ld	l,a
	ld	a,(hl)
	and	10000000B	;expanded ?
	jr	z,chkro3	;no
	ld	b,4		;number of expanded slots
chkro2:				;search expanded slot
	push	bc
	ld	a,00100100B
	sub	b		;001000nnB
	rlc	a
	rlc	a		;1000nn00B
	or	c		;1000nnmmB = slot address
	call	chkid		;check MIDI ID
	pop	bc
	jr	z,chkroy	;found MIDI ID
	djnz	chkro2		;next expanded slot
	pop	bc
	jr	chkro4		;next slot
chkro3:				;search primary slot
	ld	a,c		;set slot address
	call	chkid		;check MIDI ID
	pop	bc
	jr	z,chkroz	;found MIDI ID
chkro4:
	djnz	chkro1		;search next slot
	scf			;no MIDI ID
	ret
chkroy:
	pop	bc
chkroz:
	xor	a		;set Z flag, reset Cy flag
	ret

;
;	Is MIDI interface built in ?
;	Return : [ZF]=1		built in
;	       : [ZF]=0		not built in
;
chkmd2:
	ld	a,(exptbl)
	ld	hl,ver_id2
	call	rdslt		;read MIDI interface ID
	and	1		;set Zflag
	ret

;
;	Check MIDI ID
;
;	Entry :[A]=slot address
;	Return:Z flag is set if MIDI ID is found
;
id_string:	db	'MIDI'
id_address	equ	401ch	;MIDI ID address
chkid:
	push	bc
	ld	de,id_string
	ld	hl,id_address
	ld	b,4		;length of id_string
chkid1:
	push	af
	push	bc
	push	de
	call	rdslt		;read data
	pop	de
	pop	bc
	ld	c,a		;save data
	ld	a,(de)		;get char
	cp	c		;same ?
	jr	nz,chkid2	;no
	pop	af		;restore slot address
	inc	de		;next char
	inc	hl
	djnz	chkid1		;check next char
	pop	bc		;restore environment
	xor	a		;I found ID
	ret
chkid2:
	pop	af		;restore slot address
	pop	bc		;restore environment
	xor	a
	inc	a		;worng ID
	ret

;
;	Wait routine
;
stimec	equ	0e6h		;system timer clear
stimeh	equ	0e7h		;system timer High
waits:
	push	af
	push	bc
	ld	c,1
	out	(stimec),a	;clear timer
waitlp:
	in	a,(stimeh)	; get counter
	cp	c
	jr	c,waitlp	; loop
	pop	bc
	pop	af
	ret

;
;	Workarea definition
;
hoksvt:	ds	10		;hook save area
cmdsv:	ds	1		;8251 command save area
getp:	ds	2		;pointer for getting MIDI data
putp:	ds	2		;pointer for putting MIDI data
mdbuf:	ds	128		;buffer for MIDI IN
bufend	equ	$		;end of buffer

;	end
```

## Chapter 5: BASIC Extensions

_[TODO]_


~Grauw
© 2025 MSX Assembly Page. MSX is a trademark of MSX Licensing Corporation.



