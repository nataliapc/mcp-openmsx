# CALL

## Effect

`CALL` is an instruction reserved to extend the existing BASIC instructions.

_Notes:_
- If you have more then one extension providing an extended instruction with the same name, only the instruction provided by the ROM in a lower numbered slot will be taken into account by the BASIC interpreter.
- See the existing extended instructions for MSX-BASIC.

## Syntax

`CALL <Instruction> (<Parameter>,<Parameter>...)`

_Note: `CALL` can be replaced by the character underscore `_`. A space is not required after this character._

## Parameters

`<Instruction>` is the name of extended instruction.

`<Parameter>` can take different forms (numeric variable, value, string, etc) and several parameters can follow. Do not put parentheses if there is no parameter.

## Example of CALL-instruction implementation in ROM programs

When ROM cartridge has standard "AB"-header, the slot attributes will be automatically filled during boot time.

```assembly
; Example of String handling in BASIC CALL-instructions
; Made By: NYYRIKKI 16.11.2011
; Edit by: zPasi 13.3.2014: added a call to FRESTR, to free the temporary string in 
;       routine EVALTXTPARAM

	OUTPUT "PRINT.ROM"
	ORG     #4000
 
;---------------------------
; External variables & routines
CHPUT   EQU     #A2
CALBAS	EQU	#159
ERRHAND EQU     #406F
FRMEVL  EQU     #4C64
FRESTR	EQU	#67D0
CHRGTR  EQU     #4666
VALTYP  EQU     #F663
USR     EQU     #F7F8
PROCNM	EQU	#FD89
 
;---------------------------
; ROM-file header
	DEFW    #4241,0,CALLHAND,0,0,0,0,0
 
;---------------------------
; General BASIC CALL-instruction handler
CALLHAND:
	PUSH    HL
	LD	HL,CMDS	        ; Table with "_" instructions
.CHKCMD:
	LD	DE,PROCNM
.LOOP:	LD	A,(DE)
	CP	(HL)
	JR	NZ,.TONEXTCMD	; Not equal
	INC	DE
	INC	HL
	AND	A
	JR	NZ,.LOOP	; No end of instruction name, go checking
	LD	E,(HL)
	INC	HL
	LD	D,(HL)
	POP	HL		; routine address
	CALL	GETPREVCHAR
	CALL	.CALLDE		; Call routine
	AND	A
	RET
 
.TONEXTCMD:
	LD	C,0FFH
	XOR	A
	CPIR			; Skip to end of instruction name
	INC	HL
	INC	HL		; Skip address
	CP	(HL)
	JR	NZ,.CHKCMD	; Not end of table, go checking
	POP	HL
	SCF
	RET
 
.CALLDE:
	PUSH	DE
	RET
 
;---------------------------
CMDS:
; List of available instructions (as ASCIIZ) and execute address (as word)
	DEFB	"UPRINT",0      ; Print upper case string
	DEFW	_UPRINT
 
	DEFB	"LPRINT",0      ; Print lower case string
	DEFW	_LPRINT
 
	DEFB	0               ; No more instructions
 
;---------------------------
_UPRINT:
	CALL	EVALTXTPARAM	; Evaluate text parameter
	PUSH	HL
	CALL    GETSTRPNT
.LOOP
	LD      A,(HL)
	CALL    .UCASE
	CALL    CHPUT  ;Print
	INC     HL
	DJNZ    .LOOP
 
	POP	HL
	OR      A
	RET
 
.UCASE:
	CP      "a"
	RET     C
	CP      "z"+1
	RET     NC
	AND     %11011111
	RET

;---------------------------
_LPRINT:
	CALL	EVALTXTPARAM	; Evaluate text parameter
	PUSH	HL
	CALL    GETSTRPNT
.LOOP
	LD      A,(HL)
	CALL    .LCASE
	CALL    CHPUT  ;Print
	INC     HL
	DJNZ    .LOOP
 
	POP	HL
	OR      A
	RET
 
.LCASE:
	CP      "A"
	RET     C
	CP      "Z"+1
	RET     NC
	OR      %00100000
	RET

;---------------------------
GETSTRPNT:
; OUT:
; HL = String Address
; B  = Lenght
 
	LD      HL,(#F7F8)
	LD      B,(HL)
	INC     HL
	LD      E,(HL)
	INC     HL
	LD      D,(HL)
	EX      DE,HL
	RET
 
EVALTXTPARAM:
	CALL	CHKCHAR
	DEFB	"("             ; Check for (
	LD	IX,FRMEVL
	CALL	CALBAS		; Evaluate expression
	LD      A,(VALTYP)
	CP      3               ; Text type?
	JP      NZ,TYPE_MISMATCH
	PUSH	HL
	LD	IX,FRESTR         ; Free the temporary string
	CALL	CALBAS
	POP	HL
	CALL	CHKCHAR
	DEFB	")"             ; Check for )
	RET
 
CHKCHAR:
	CALL	GETPREVCHAR	; Get previous basic char
	EX	(SP),HL
	CP	(HL) 	        ; Check if good char
	JR	NZ,SYNTAX_ERROR	; No, Syntax error
	INC	HL
	EX	(SP),HL
	INC	HL		; Get next basic char
 
GETPREVCHAR:
	DEC	HL
	LD	IX,CHRGTR
	JP      CALBAS
 
TYPE_MISMATCH:
	LD      E,13
	DB      1
 
SYNTAX_ERROR:
	LD      E,2
	LD	IX,ERRHAND	; Call the Basic error handler
	JP	CALBAS
 
;---------------------------
	DS      #8000-$
```

## Example of CALL-instruction implementation in BIN-file

When a `CALL-instruction` extension is loaded after boot, user must put the address of `CALL` instruction handler to 4th & 5th byte of memory bank and mark that the extension is available (bit 5) to the slot attribute table manually.

Please note that if the program is erased from memory the next `CALL` instruction execution may crash the computer if the bit from table is not manually cleared.

The correct address inside slot attribute table can be calculated using formula:  
`ADDRESS = Main slot * 16 + Sub slot * 4 + Memory Bank + #FCC9`

```assembly
	OUTPUT "X.BIN"
 
	; USAGE:
	; BLOAD "X.BIN",R
	; CALL X == CLS
 
SLTATR  EQU #FCC9
PROCNM	EQU #FD89
CLS     EQU #C3
 
	; BASIC header:
 
	DB #FE
	DW BEGIN,END,START
 
	ORG #C004
BEGIN:
	; Call handler pointer in Bank 3 fixed offset 4
	DW CALLHAND
START:
	LD A,(#F344) ; SlotID of RAM in Bank 3 (#C000-#FFFF)
	             ; This variable is ready available only when disk drive is present.
	AND A
	JP M,.SKIP   ; SlotID has SubSlot information
	AND 3
.SKIP
	AND 15
	LD E,A
	RLCA
	RLCA
	RLCA
	RLCA
	OR E
	AND 60
	LD D,0
	LD E,A
	LD HL,SLTATR+3 ; +3 for Bank 3
	ADD HL,DE
	SET 5,(HL)     ; Set bit 5 to enable CALL handler
	RET
 
CALLHAND:
 
	PUSH HL
	LD HL,PROCNM
	LD A,(HL)
	CP "X"
	JR NZ,.NOT_FOR_ME
	INC HL
	LD A,(HL)
	AND A           ; Commands are zero terminated
	JR NZ,.NOT_FOR_ME
	CALL CLS
	POP HL
	AND A           ; Clear carry to inform CALL is handled.
	RET
 
.NOT_FOR_ME:
 
	POP HL
	SCF
	RET
END:
```

## List of MSX tR default CALL instructions sorted by slots

### Slot #0-2 (MSX-Music)

|||
|---|:-:|
|AUDREG||
|APPEND MK|*|
|APEEK|*|
|APOKE|*|
|BGM||
|CONT MK|*|
|COPY PCM|*|
|CONVP|*|
|CONVA|*|
|INMK|*|
|KEY ON|*|
|KEY OFF|*|
|LOAD PCM|*|
|MDR||
|MK VOICE|*|
|MK VEL|*|
|MK VOL|*|
|MK TEMPO|*|
|MK STAT|*|
|MK PCM|*|
|MUSIC||
|REC PCM|*|
|STOPM||
|SET PCM|*|
|SAVE PCM|*|
|SYNTHE|*|
|TRANSPOSE||
|TEMPER||
|VOICE||
|VOICE COPY||
|PAUSE||
|PLAY||
|PLAY PCM|*|
|PCM PLAY||
|PCM REC||
|PCM FREQ|*|
|PCM VOL|*|
|PLAY MK|*|
|PITCH||

(*) Detected, but not supported (causes _illegal function call_).


### Slot #3-1 (Kanji ROM)

||
|---|
|PALETTE|
|CLS|
|AKCNV|
|JIS|
|SJIS|
|KACNV|
|KEXT|
|KINSTR|
|KLEN|
|KMID|
|KNJ|
|KTYPE|
|KANJI|
|KANJI0|
|KANJI1|
|KANJI2|
|KANJI3|
|ANK|

### Slot #3-2 (Disk ROM)

|||
|---|:-:|
|SYSTEM||
|FORMAT||
|CHDRV|*|
|CHDIR|*|
|MKDIR|*|
|RMDIR|*|
|RAMDISK|*|

(*) Only when DOS2 is active.

### Slot #3-3 (Panasonic Mapper)

|||
|---|:-:|
|MWP|*|
|HIRO|**|

(*) Only in Panasonic `FS-A1GT`  
(**) Only in Panasonic `FS-A1ST`

`CALL MENU` in Panasonic 2+ machines.

## Related to

`ATTR$()`, `CMD`, `IPL`, `USR`

# Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/CALL"
