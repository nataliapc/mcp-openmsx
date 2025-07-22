# A whole shitload of VDP routines

These routines are just provided as-is, since I don’t really feel like explaining them all. Most of them are either:
- a. already explained somewhere else
- b. obvious
- c. may give you a little challenge to try and understand them.

They are designed for use from a DOS environment, but most of them can also be used from Basic...

```assembly
;
;==============================================================================
;= VDP-Routines ===============================================================
;==============================================================================
;
;Definitions...
;
CallSlot:     equ     #1c
EXP_TABLE:    equ     #fcc1
INITXT:       equ     #6C

;
VDP_SetReg:   MACRO   @register        ;Set value A in the specified register
              out     (#99),a
              ld      a,@register+128
              out     (#99),a
              ENDM
```

```assembly
;
; Fast DoCopy, by Grauw
; Out: BC = 0, HL = updated
;
DoCopy:       ld      a,32
              di
              out     (#99),a
              ld      a,17+128
              out     (#99),a
              ld      c,#9B
VDPready:     ld      a,2
              di
              out     (#99),a          ;select s#2
              ld      a,15+128
              out     (#99),a
              in      a,(#99)
              rra
              ld      a,0
              out     (#99),a
              ld      a,15+128
              ei
              out     (#99),a
              jp      c,VDPready
              DW      #A3ED,#A3ED,#A3ED,#A3ED   ;15x OUTI
              DW      #A3ED,#A3ED,#A3ED,#A3ED   ; (faster than OTIR)
              DW      #A3ED,#A3ED,#A3ED,#A3ED
              DW      #A3ED,#A3ED,#A3ED
              ret
```

```assembly
;
; This lil' routine waits until the VDP is done copying.
;
VDP_Ready:    ld      a,2
              di
              out     (#99),a          ;select s#2
              ld      a,15+128
              out     (#99),a
              in      a,(#99)
              rra
              ld      a,0              ;select s#0
              out     (#99),a
              ld      a,15+128
              ei
              out     (#99),a
              jp      c,VDPready
              ret
```

```assembly
;
; Copy the VDP-registers' settings to array VDP.
; Afterwards, read the VDP-registers with LD A,(VDP + r)
; (this should be placed at the start of a program)
;
Copy_VdpRegs: ld      hl,VDP_0
              ld      de,VDP
              ld      bc,8
              ldir
              ld      hl,VDP_8
              ld      de,VDP+8
              ld      bc,17
              ldir
              ret
```

```assembly
;
; Restore the VDP-registers' settings.
; (this should be placed at the end of a program)
;
Rest_VdpRegs: ld      bc,#0800
              ld      hl,VDP_0
              call    Rest_VdpSub
              ld      bc,#1008
              ld      hl,VDP_8
              call    Rest_VdpSub
              ld      bc,#0319
              ld      hl,TRIPLE_ZERO     ;a jp Restore_Vdp_Sub is implied
Rest_VdpSub:  ld      a,(hl)
              inc     hl
              di
              out     (#99),a
              ld      a,c
              or      128
              ei
              out     (#99),a
              inc     c
              djnz    Rest_VdpSub
              ret

;
TRIPLE_ZERO:  DB      0,0,0
```

```assembly
;
; Selecteer screen 5...
;
Screen5:      ld      a,(VDP)            ;Select screen 5 (0)
              and     %11110001
              or      %00000110
              ld      (VDP),a
              di
              VDP_SetReg 0
              ld      a,(VDP+1)          ;select screen 5 + Sprite size 16/16 (1)
              and     %11100100
              or      %00000010
              ld      (VDP+1),a
              VDP_SetReg 1
              xor     a                  ;black achtergrond (7)
              ld      (VDP+7),a
              VDP_SetReg 7
              ld      a,(VDP+8)          ;sprites on & color 0 not transparent (8)
              and     %11011101
              or      2                  ;sprites off (faster!)
              ld      (VDP+8),a
              VDP_SetReg 8
              ld      a,(VDP+9)
              set     7,a                ;192 lines
              res     1,a                ;60 Hz
              ld      (VDP+9),a
              VDP_SetReg 9
              ei
              ret

;
Screen0:      ld      iy,(EXP_TABLE-1)
              ld      ix,INITXT          ;BIOS-call from DOS
              jp      CallSlot
```

```assembly
;
; Check if a v9958 is available (if so, return nz)
; Initialize address (v9958)
;
v9958_Check:  di                         ;Test for v9958
              ld      a,1                ;Set s#1
              VDP_SetReg 15
              ld      a,(de)             ;Waste some time...
              in      a,(#99)
              push    af
              ld      a,0
              VDP_SetReg 15              ;Set s#0
              ei
              pop     af
              and     %00111100          ;v9938? RET with Z
              ld      (v9958),a
              ret
```

```assembly
;
; Enable the sprites.
;
Sprites_On:   ld      a,(VDP+8)
              and     %11111101
              ld      (VDP+8),a
              di
              out     (#99),a
              ld      a,8+128
              ei
              out     (#99),a
              ret
```

```assembly
;
; Disable the sprites.
;
Sprites_Off:  ld      a,(VDP+8)
              or      %00000010
              ld      (VDP+8),a
              di
              out     (#99),a
              ld      a,8+128
              ei
              out     (#99),a
              ret
```

```assembly
;
; Disable the screen.
;
Disable_Scr:  ld      a,(VDP+1)
              and     %10111111
              ld      (VDP+1),a
              di
              out     (#99),a
              ld      a,1+128
              ei
              out     (#99),a
              ret
```

```assembly
;
; Enable the screen.
;
Enable_Scr:   ld      a,(VDP+1)
              or      %01000000
              ld      (VDP+1),a
              di
              out     (#99),a
              ld      a,1+128
              ei
              out     (#99),a
              ret
```

```assembly
;
; Set page A (in screen 5).
;
SetPage:      add     a,a              ;x32
              add     a,a
              add     a,a
              add     a,a
              add     a,a
              add     a,31
              ld      (VDP+2),a
              di
              out     (#99),a
              ld      a,2+128
              ei
              out     (#99),a
              ret
```

```assembly
;
; Set VDP port #98 to start writing at address AHL (17-bit)
;
SetVdp_Write: rlc     h
              rla
              rlc     h
              rla
              srl     h
              srl     h
              di
              out     (#99),a       ;set bits 15-17
              ld      a,14+128
              out     (#99),a
              ld      a,l           ;set bits 0-7
              nop
              out     (#99),a
              ld      a,h           ;set bits 8-14
              or      64            ; + write access
              ei
              out     (#99),a       
              ret
```

```assembly
;
; Set VDP port #98 to start reading at address AHL (17-bit)
;
SetVdp_Read:  rlc     h
              rla
              rlc     h
              rla
              srl     h
              srl     h
              di
              out     (#99),a       ;set bits 15-17
              ld      a,14+128
              out     (#99),a
              ld      a,l           ;set bits 0-7
              nop
              out     (#99),a
              ld      a,h           ;set bits 8-14
              ei                    ; + read access
              out     (#99),a
              ret
```

```assembly
;
; Set the VDP's palette to the palette HL points to
; Changes: AF, BC, HL (=updated)
;
SetPalet:     xor     a             ;Set p#pointer to zero.
              di
              out     (#99),a
              ld      a,16+128
              ei
              out     (#99),a
              ld      c,#9A
              DW      #A3ED,#A3ED,#A3ED,#A3ED   ;32x OUTI instruction
              DW      #A3ED,#A3ED,#A3ED,#A3ED   ; (faster than OTIR)
              DW      #A3ED,#A3ED,#A3ED,#A3ED
              DW      #A3ED,#A3ED,#A3ED,#A3ED
              DW      #A3ED,#A3ED,#A3ED,#A3ED
              DW      #A3ED,#A3ED,#A3ED,#A3ED
              DW      #A3ED,#A3ED,#A3ED,#A3ED
              DW      #A3ED,#A3ED,#A3ED,#A3ED
              ret
```

```assembly
;
; Data
;
VDP:          DS      28,0
v9958:        DB      0              ;>1 = v9958 present
```

## Source

https://map.grauw.nl/sources/vdp_rout.php