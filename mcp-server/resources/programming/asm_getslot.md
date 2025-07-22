# GETSLT: Get slot ID of any page

The BIOS slot routines RDSLT, ENASLT, etc. all take a slot ID. Sometimes you construct this yourself, but often you need to know the slot ID of a page that was already selected before. The initialisation code of ROM cartridges for example typically wants to enable the slot of page 1 in page 2 as well.

You can determine the slot ID of a currently paged address with a GETSLT routine. There is no BIOS routine for this, but the process is described in the MSX2 Technical Handbook and several other references, along with code examples.

This is an assembly implementation which works for all pages (followed by an explanation):

```assembly
RSLREG: equ 138H
EXPTBL: equ 0FCC1H
SLTTBL: equ 0FCC5H

; h = memory address high byte (bits 6-7: page)
; a <- slot ID formatted F000SSPP
; Modifies: f, bc, de
Memory_GetSlot:
    call RSLREG
    bit 7,h
    jr z,PrimaryShiftContinue
    rrca
    rrca
    rrca
    rrca
PrimaryShiftContinue:
    bit 6,h
    jr z,PrimaryShiftDone
    rrca
    rrca
PrimaryShiftDone:
    and 00000011B
    ld c,a
    ld b,0
    ex de,hl
    ld hl,EXPTBL
    add hl,bc
    ex de,hl
    ld a,(de)
    and 80H
    or c
    ret p
    ld c,a
    inc de  ; move to SLTTBL
    inc de
    inc de
    inc de
    ld a,(de)
    bit 7,h
    jr z,SecondaryShiftContinue
    rrca
    rrca
    rrca
    rrca
SecondaryShiftContinue:
    bit 6,h
    jr nz,SecondaryShiftDone
    rlca
    rlca
SecondaryShiftDone:
    and 00001100B
    or c
    ret
```

## Explanation

The MSX slot selection system divides the 64K CPU memory address space into 4 pages, from page 0 (0000H-3FFFH) to page 3 (C000H-FFFFH). In each of these pages you can select a different slot. Some of these slots are internal, others are for the external cartridge slots. The BIOS routines idenfity a slot with a slot ID, using the bit-format FxxxSSPP. The two P bits indicate the primary slot, the F bit indicates whether the primary slot is expanded, and if so the S bits indicate the secondary slot.

```assembly
; h = memory address high byte (bits 6-7: page)
; a <- slot ID formatted F000SSPP
; Modifies: f, bc, de
Memory_GetSlot:
    call RSLREG
    bit 7,h
    jr z,PrimaryShiftContinue
    rrca
    rrca
    rrca
    rrca
PrimaryShiftContinue:
    bit 6,h
    jr z,PrimaryShiftDone
    rrca
    rrca
PrimaryShiftDone:
    and 00000011B
```

This first part determines the value for the primary slot number (PP bits) by reading the primary slot register through the RSLREG BIOS routine. The returned byte has two bits to indicate the primary slot for each of the pages, in the bit-format 33221100. Because the slot ID specifies the primary slot number (PP) in bits 0-1, we shift until the appropriate bits are in the correct position.

Note that if you need a shorter version hardcoded for a specific page, you can eliminate the conditional code here.

```assembly
    ld c,a
    ld b,0
    ex de,hl
    ld hl,EXPTBL
    add hl,bc
    ex de,hl
    ld a,(de)
    and 80H
    or c
    ret p
```

In this second part we determine the value for the expanded flag (F bit) by inspecting the EXPTBL table in system memory. This table consists of 4 bytes, one for each slot, where bit 7 indicates whether the slot is expanded. Because in rare cases bits 0-6 can contain a non-zero value, we and the value with 80H to mask out the unwanted bits before we insert it into the slot ID. If the slot is not expanded, we stop here.

```assembly
    ld c,a
    inc de  ; move to SLTTBL
    inc de
    inc de
    inc de
    ld a,(de)
    bit 7,h
    jr z,SecondaryShiftContinue
    rrca
    rrca
    rrca
    rrca
SecondaryShiftContinue:
    bit 6,h
    jr nz,SecondaryShiftDone
    rlca
    rlca
SecondaryShiftDone:
    and 00001100B
    or c
    ret
```

Lastly we determine the value for the secondary slot number (SS bits). Instead of reading from the secondary slot registers directly, which is a rather complicated affair, we advance the pointer to the SLTTBL table, which is a mirror of the four secondary slot registers. These have two bits to indicate the secondary slot for each memory page, in the same bit-format 33221100 as the primary slot register. Because the slot ID specifies the secondary slot number (SS) in bits 2-3, we shift until the appropriate bits are in the correct position.

Again note that if you need a shorter version hardcoded for a specific page, you can eliminate the conditional code here.

Now we have fully determined the slot ID for a page.

~~Grauw

## Source

https://map.grauw.nl/sources/getslot.php