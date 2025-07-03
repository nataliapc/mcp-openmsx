# Calling the BIOS from MSX-DOS  

In the MSX-DOS environment there is no special entry for calling the MSX BIOS, however you can simply use an interslot call to reach it.

You can use this method to call the BIOS:
```
CALSLT:      EQU    #001C
EXPTBL:      EQU    #FCC1

Call\_Slot:   ld     iy,(EXPTBL-1)       ;BIOS slot in iyh
             ld     ix,nnnn             ;address of BIOS routine
             call   CALSLT              ;interslot call
```

## The SUBROM

You can’t call the SUBROM from MSX-DOS as you would normally, the reason for this is that both `EXTROM` and `CALSLT` use the `IX` register to pass parameters. Calling directly to the SUBROM doesn’t work either, because using an interslot call to call the SUBROM is not allowed per the MSX2 standard. The reason for this, according to _Alex Wulms_ in _MCM 48_, is that some DiskROMs couldn’t handle the the SUBROM being in page 0.

The official means to call the SUBROM from MSX-DOS is by using the following routine, provided by ASCII:
```
; CALSUB
;
; In: IX = address of routine in MSX2 SUBROM
;     AF, HL, DE, BC = parameters for the routine
;
; Out: AF, HL, DE, BC = depending on the routine
;
; Changes: IX, IY, AF', BC', DE', HL'
;
; Call MSX2 subrom from MSXDOS. Should work with all versions of MSXDOS.
;
; Notice: NMI hook will be changed. This should pose no problem as NMI is
; not supported on the MSX at all.
;
CALSLT:  EQU    #001C
NMI:     EQU    #0066
EXTROM:  EQU    #015f
EXPTBL:  EQU    #fcc1
H\_NMI:   EQU    #fdd6
;
CALSUB:  exx
         ex     af,af'       ; store all registers
         ld     hl,EXTROM
         push   hl
         ld     hl,#C300
         push   hl           ; push NOP ; JP EXTROM
         push   ix
         ld     hl,#21DD
         push   hl           ; push LD IX,<entry>
         ld     hl,#3333
         push   hl           ; push INC SP; INC SP
         ld     hl,0
         add    hl,sp        ; HL = offset of routine
         ld     a,#C3
         ld     (H\_NMI),a
         ld     (H\_NMI+1),hl ; JP <routine> in NMI hook
         ex     af,af'
         exx                 ; restore all registers
         ld     ix,NMI
         ld     iy,(EXPTBL-1)
         call   CALLSLT      ; call NMI-hook via NMI entry in ROMBIOS
                             ; NMI-hook will call SUBROM
         exx
         ex     af,af'       ; store all returned registers
         ld     hl,10
         add    hl,sp
         ld     sp,hl        ; remove routine from stack
         ex     af,af'
         exx                 ; restore all returned registers
         ret
```

~Grauw

© 2025 MSX Assembly Page. MSX is a trademark of MSX Licensing Corporation.