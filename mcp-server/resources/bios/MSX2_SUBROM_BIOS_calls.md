# MSX 2 SUBROM BIOS Entries  

## MSX 2 SUBROM BIOS Entries

These are additional BIOS routines which are available in the MSX 2 standard. No new subrom calls were introduced on the MSX 2+ / turbo R. They are located in the so-called SUBROM, which is an alternate BIOS page, switched when necessary. You can call the SUBROM by putting the jump address in register IX and then calling the BIOS routine `EXTROM` (#15F) or `SUBROM` (#15C). Please note that officially it is illegal to call the SUBROM using `CALSLT` because this will cause trouble with some DiskROMs. Therefore, it cannot be called directly from MSX-DOS environment. There is a workaround for that though, which is described in [this article](#msxdocs://bios/Calling_BIOS_from_MSX-DOS).

* [Basic calls](#basic-calls)
* [Double BIOS calls](#double-bios-calls)
* [MSX 2 specific calls](#msx-2-specific-calls)
* [Palette-functions](#palette-functions)
* [BIT-BLIT routines](#bit-blit-routines)

### BASIC calls

#### PAINT (Basic!)
```
Address  : #0069
Function : Paints graphical screen
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### PSET (Basic!)
```
Address  : #006D
Function : Sets a point
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### ATRSCN (Basic!)
```
Address  : #0071
Function : Scans color attribute
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### GLINE (Basic!)
```
Address  : #0075
Function : Draws a line
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### DOBOXF (Basic!)
```
Address  : #0079
Function : Draws a filled box
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### DOLINE (Basic!)
```
Address  : #007D
Function : Draws a line
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### BOXLIN (Basic!)
```
Address  : #0081
Function : Draws a box
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### DOGRPH
```
Address  : #0085
Function : Draws a line
Input    : BC, HL are start coordinates
           GXPOS, GYPOS are end-coordinates
           ATRBYT for attribute
           LOGOPR for logical operator
Registers: AF
```
#### GRPPRT
```
Address  : #0089
Function : Places a character on graphic screen
Input    : A  - Character
           ATRBYT for attribute
           LOGOPR for logical operator
```
#### SCALXY
```
Address  : #008D
Function : Clip coordinates (till border of screen)
Input    : BC - X-position
           DE - Y-position
Output   : BC - X-position bordered
           DE - Y-position bordered
Registers: AF
```
#### MAPXYC
```
Address  : #0091
Function : Converts an X,Y position to an address: and mask in CLOC and CMASK
Input    : BC - X-position
           DE - Y-position
Output   : HL - VRAM address: In SCREEN 3    (in CLOC too)
           A  - Mask          In SCREEN 3    (in CMASK too)
           HL - X-position In SCREEN 5->8 (in CLOC too)
           A  - Y-position In SCREEN 5->8 (in CMASK too)
Registers: F
```
#### READC
```
Address  : #0095
Function : Reads attribute of pixel
Input    : X-position in CLOC
           Y-position in CMASK
Output   : A  - the attribute
Registers: AF
```
#### SETATR
```
Address  : #0099
Function : Set attribute in ATRBYT
Input    : A  - attribute
Output   : C-flag set if attribute is wrong
Registers: F
```
#### SETC
```
Address  : #009D
Function : Set attribute of pixel
Input    : X-position in CLOC
           Y-position in CMASK
           Attribute-byte in ATRBYT
Registers: AF
```
#### TRIGHT
```
Address  : #00A1
Function : Moves pixel to the right
Input    : X-position in CLOC
           Yposition in CMASK
Output   : New X-position in CLOC
           New Y-position in CMASK
           C-flag set if border of screen is reached
Registers: AF
Remark   : SCREEN 3 only
```
#### RIGHTC
```
Address  : #00A5
Function : Moves pixel to the right
Input    : See TRIGHT
Output   : See TRIGHT (except for the C-flag remark)
Registers: AF
Remark   : SCREEN 3 only
```
#### TLEFTC
```
Address  : #00A9
Function : Moves pixel to the left
Input    : See TRIGHT
Output   : See TRIGHT
Registers: AF
```
#### LEFTC
```
Address  : #00AD
Function : Moves pixel to the left
Input    : See RIGHTC
Output   : See RIGHTC
Registers: AF
Remark   : SCREEN 3 only
```
#### TDOWNC
```
Address  : #00B1
Function : Moves pixel down
Input    : See TRIGHT
Output   : See TRIGHT
Registers: AF
```
#### DOWNC
```
Address  : #00B5
Function : Moves pixel down
Input    : See RIGHTC
Output   : See RIGHTC
Registers: AF
Remark   : SCREEN 3 only
```
#### TUPC
```
Address  : #00B9
Function : Moves pixel up
Input    : See TRIGHT
Output   : See TRIGHT
Registers: AF
```
#### UPC
```
Address  : #00BD
Function : Moves pixel up
Input    : See RIGHTC
Output   : See RIGHTC
Registers: AF
Remark   : SCREEN 3 only
```
#### SCANR
```
Address  : #00C1
Function : Scans pixels to the right
Input    : B  - 'Suspend'-flag
           C  - Border-counting
Output   : DE - Border-counting
           C  - 'Pixel-changed'-flag
Registers: All
```
#### SCANL
```
Address  : #00C5
Function : Scans pixels to the left
Input    : DE - Border-counting
Output   : DE - Border-counting
           C  - 'Pixel-changed'-flag
Registers: All
```
#### NVBXLN
```
Address  : #00C9
Function : Draws a box
Input    : BC - X start-position
           DE - Y-start-position
           X end-position in GXPOS
           Y-end-position in GYPOS
           Attribute in ATRBYT
           Logical operator in LOGOPR
Registers: All
```
#### NVBXFL
```
Address  : #00CD
Function : Draws a filled box
Input    : See NVBXLN
Registers: All
```

### Double BIOS calls

The following routines are called from the equally named calls in the MAIN ROM, and therefor the input and results will not be shown, nor will the register changes. For that, refer to the corresponding call in the MSX1-BIOS.

#### CHGMOD
```
Address  : #00D1
Function : Switches to given screenmode
```
#### INITXT
```
Address  : #00D5
Function : Switches to SCREEN 0
```
#### INIT32
```
Address  : #00D9
Function : Switches to SCREEN 1
```
#### INIGRP
```
Address  : #00DD
Function : Switches to SCREEN 2
```
#### INIMLT
```
Address  : #00E1
Function : Switches to SCREEN 3
```
#### SETTXT
```
Address  : #00E5
Function : Switches VDP in SCREEN 0
```
#### SETT32
```
Address  : #00E9
Function : Switches VDP in SCREEN 1
```
#### SETGRP
```
Address  : #00ED
Function : Switches VDP in SCREEN 2
```
#### SETMLT
```
Address  : #00F1
Function : Switches VDP in SCREEN 3
```
#### CLRSPR
```
Address  : #00F5
Function : Initialises sprite tables
```
#### CALPAT
```
Address  : #00F9
Function : Returns address of sprite pattern-table
```
#### CALATR
```
Address  : #00FD
Function : Returns address of sprite attribute-table
```
#### GSPSIZ
```
Address  : #0101
Function : Returns current sprite-size
```

### MSX 2 specific calls

#### GETPAT
```
Address  : #0105
Function : Returns current pattern of a character
Input    : A  - ASCII code of character
Output   : Pattern in PATWRK starting from address #FC40
Registers: All
Remark   : Same as routine in MSX1-BIOS, but there is doesn't exist as
           a BIOS-call
```
#### WTRVRM
```
Address  : #0109
Function : Writes data in VRAM (#0000 - #ffff)
Input    : HL - Address
           A  - Value
Registers: AF
```
#### RDVRM
```
Address  : #010D
Function : Reads content in VRAM (#0000 - #ffff)
Input    : HL - Address
Output   : A  - Read value
Registers: AF
```
#### CHGCLR
```
Address  : #0111
Function : Changes screen colors
Input    : A  - Screenmode
           See MSX1BIOS.HTM (CHGCLR)  
Registers: All
```
#### CLS
```
Address  : #0115
Function : Clear screen
Registers: All
```
#### CLRTXT
```
Address  : #0119
Function : Clear Text-screen
Registers: All
```
#### DSPFNK
```
Address  : #011D
Function : Display the function keys
Registers: All
```
#### DELLNO
```
Address  : #0121
Function : Remove line in text screen
Input    : L  - Line Number
Registers: All
```
#### INSLNO
```
Address  : #0125
Function : Add line to text screen
Input    : L  - Line Number
Registers: All
```
#### PUTVRM
```
Address  : #0129
Function : Put character on text screen
Input    : H  - Y-position
           L  - X-position
Registers: AF
```
#### WRTVDP
```
Address  : #012D
Function : Write to VDP-register
Input    : B  - Value to write
           C  - Register number
Registers: AF, BC
```
#### VDPSTA
```
Address  : #0131
Function : Read VDP-status
Input    : A  - Status register
Output   : A  - Read value
Registers: F
```
#### KYKLOK
```
Address  : #0135
Function : Control KANA-key and KANA-lamp (Japan)
Registers: AF
```
#### PUTCHR
```
Address  : #0139
Function : Gets a key-code of keyboard, conversion to KANA and in
           buffer (Japan)
Input    : Z-flag set if not in conversion mode
Registers: All
```
#### SETPAG
```
Address  : #013D
Function : Switches the page
Input    : ACPAGE - Active page
           DPPAGE - display page number
Registers: AF
```

### Palette-functions

#### INIPLT
```
Address  : #0141
Function : Initialises the palette (current palet is save in VRAM)
Registers: AF, BC, DE
```
#### RSTPLT
```
Address  : #0145
Function : Restores palette from VRAM
Registers: AF, BC, DE
```
#### GETPLT
```
Address  : #0149
Function : Obtains the colorcodes from the palette
Input    : A  - Colorcode
Output   : B  - RRRRBBBB
           C  - xxxxGGGG
Registers: AF, DE
```
#### SETPLT
```
Address  : #014D
Function : Sets the color code to the palette
Input    : D  - Colorcode
           E  - xxxxGGGG
           A  - RRRRBBBB
Registers: AF
```
#### PUTSPRT (Basic!)
```
Address  : #0151
Function : Set sprites
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### COLOR (Basic!)
```
Address  : #0155
Function : Changes Screen- or spritecolor, or palettevalues
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### SCREEN (Basic!)
```
Address  : #0159
Function : Changes screenmode
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### WIDTHS (Basic!)
```
Address  : #015D
Function : Changes textscreen-width
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### VDP (Basic!)
```
Address  : #0161
Function : Sets VDP-register
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### VDPF (Basic!)
```
Address  : #0165
Function : Reads VDP-register
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### BASE (Basic!)
```
Address  : #0169
Function : Sets VDP base-register
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### BASEF (Basic!)
```
Address  : #016D
Function : Reads VDP base-register
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### VPOKE (Basic!)
```
Address  : #0171
Function : Writes a byte to VRAM
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### VPEEK (Basic!)
```
Address  : #0175
Function : Reads a byte from VRAM
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### SETS (Basic!)
```
Address  : #0179
Function : Sets BEEP, ADJUST, TIME and DATE
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### BEEP
```
Address  : #017D
Function : Generates beep
Registers: All
```
#### PROMPT
```
Address  : #0181
Function : Shows prompt (default: “Ok”)
Registers: All
```
#### SDFSCR
```
Address  : #0185
Function : Recovers screen-parameters of clock-chip. When C-flag is set
           function-key text will be displayd
Input    : C-flag reset after MSX-DOS call
Registers: All
```
#### SETSCR
```
Address  : #0189
Function : Recovers screen-parameter and prints Welcome message
Registers: All
```
#### SCOPY (Basic!)
```
Address  : #018D
Function : Copy's VRAM, array and disk-file
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```

### BIT-BLIT routines

From here on the so-called BIT-BLIT routines are listed, which are mostly executed by the VDP. The parameters must be passed through the system RAM at #F562. See the MSX 2 system variables documentation for more details. HL must always contain the value #F562 when calling.

#### BLTVV
```
Address  : #0191
Function : Copy VRAM to VRAM
Input    : SX, SY, DX, DY, NX, NY, ARG, L\_OP
Registers: All
```
#### BLTVM
```
Address  : #0195
Function : Copy Main-RAM to VRAM
Input    : SX - Address of screendata in RAM
           DX, DY, ARG, L\_OP. NX and NY must be in screendata
Output   : C-flag set if data failure in RAM
Registers: All
```
#### BLTMV
```
Address  : #0199
Function : Copy VRAM to Main-RAM
Input    : DX - Address of screendata in RAM
           SX, SY, ARG, L\_OP. NX and NY must be in screendata
Registers: All
```
#### BLTVD
```
Address  : #019D
Function : Copy Diskfile to VRAM
Input    : SX -Address of filename.
           SX, SY, ARG, L\_OP. NX and NY must be in diskfile
Registers: All
```
#### BLTDV
```
Address  : #01A1
Function : Copy VRAM to Diskfile
Input    : DX - Address of filenaam.
           SX, SY, NX, NY,ARG
Registers: All
```
#### BLTMD
```
Address  : #01A5
Function : Copy Diskfile to Main-RAM
Input    : SX - Address of filenaam.
           DX - start-address
           DY - end-address (in Main-RAM)
Registers: All
```
#### BLTDM
```
Address  : #01A9
Function : Copy Main-RAM to Diskfile
Input    : DX - Address of filenaam.
           SX - start-address
           SY - end-address  (in Main-RAM)
Registers: All
```
#### NEWPAD
```
Address  : #01AD
Function : Read light pen, mouse and trackball
Input    : A  - Function call number. Fetch device data first, then read.

           [ 8]   Fetch light pen (#FF if available; touching screen)
           [ 9]   Read X-position
           [10]   Read Y-position
           [11]   Read lightpen-status (#FF if pressed)

           [12]   Fetch mouse/trackball in port 1
           [13]   Read X-offset
           [14]   Read Y-offset
           [15]   No function (always #00)

           [16]   Fetch mouse/trackball in port 2
           [17]   Read X-offset
           [18]   Read Y-offset
           [19]   No function (always #00)

           [20]   Fetch 2nd light pen (#FF if available; touching screen)
           [21]   Read X-position
           [22]   Read Y-position
           [23]   Read light-pen status (#FF if pressed)

Output   : A  - Read value
Registers: All
Remark   : Access via [GTPAD](msxbios.php#GTPAD) in the main BIOS, function call numbers 8 and up
           will be forwarded to this call.
```
#### GETPUT (Basic!)
```
Address  : #01B1
Function : GET TIME, GET DATE and PUT KANJI
Input    : HL - Basic textpointer
Output   : HL - Adapted Basic textpointer
Registers: All
```
#### CHGMDP
```
Address  : #01B5
Function : sets SCREEN-mode
Input    : A  - SCREEN-mode
Registers: All
```
#### RESVI
```
Address  : #01B9
Function : Not used... Reserve entry
```
#### KNJPRT
```
Address  : #01BD
Function : Puts Kanji-character on graphical screen (5-8)
Input    : BC - JIS Kanji-character code
           A  - Display-mode (0=full, 1=even, 2=odd)
Registers: AF
```
#### REDCLK
```
Address  : #01F5
Function : Read clock-RAM
Input    : C  - clock-RAM address
                xxBBAAAA
                  ||++++-- address
                  ++------ Block-number
Output   : A  - Read value in lowest four bits
Registers: F
```
#### WRTCLK
```
Address  : #01F9
Function : Write clock-RAM
Input    : C  - clock-RAM address
                xxBBAAAA
                  ||++++-- address  :
                  ++------ Block-number
           A  - Value to write
Registers: F
```

~BiFi

© 2025 MSX Assembly Page. MSX is a trademark of MSX Licensing Corporation.