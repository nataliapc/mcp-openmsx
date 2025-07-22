# Detecting VDP version

Here’s a routine to help you detect the VDP version. It takes about a frame to complete, so it is recommended to do it once at the start of the program.

```assembly
;
; Detect VDP version
;
; a <- 0: TMS9918A, 1: V9938, 2: V9958, x: VDP ID
; f <- z: TMS9918A, nz: other
;
VDP_GetVersion:
    call VDP_IsTMS9918A  ; use a different way to detect TMS9918A
    ret z
    ld a,1               ; select s#1
    di
    out (99H),a
    ld a,15 + 128
    out (99H),a
    in a,(99H)           ; read s#1
    and 00111110B        ; get VDP ID
    rrca
    ex af,af'
    xor a                ; select s#0 as required by BIOS
    out (99H),a
    ld a,15 + 128
    ei
    out (99H),a
    ex af,af'
    ret nz               ; return VDP ID for V9958 or higher
    inc a                ; return 1 for V9938
    ret

;
; Test if the VDP is a TMS9918A.
;
; The VDP ID number was only introduced in the V9938, so we have to use a
; different method to detect the TMS9918A. We wait for the vertical blanking
; interrupt flag, and then quickly read status register 2 and expect bit 6
; (VR, vertical retrace flag) to be set as well. The TMS9918A has only one
; status register, so bit 6 (5S, 5th sprite flag) will return 0 in stead.
;
; f <- z: TMS9918A, nz: V99X8
;
VDP_IsTMS9918A:
    in a,(99H)           ; read s#0, make sure interrupt flag (F) is reset
    di
VDP_IsTMS9918A_Wait:
    in a,(99H)           ; read s#0
    and a                ; wait until interrupt flag (F) is set
    jp p,VDP_IsTMS9918A_Wait
    ld a,2               ; select s#2 on V9938
    out (99H),a
    ld a,15 + 128        ; (this mirrors to r#7 on TMS9918 VDPs)
    out (99H),a
    in a,(99H)           ; read s#2 / s#0
    ex af,af'
    xor a                ; select s#0 as required by BIOS
    out (99H),a
    ld a,15 + 128
    out (99H),a
    ld a,(0F3E6H)        ; RG7SAV
    out (99H),a          ; restore r#7 if it mirrored (small flash visible)
    ld a,7 + 128
    ei
    out (99H),a
    ex af,af'
    and 01000000B        ; check if bit 6 was 0 (s#0 5S) or 1 (s#2 VR)
    ret
```

_Note: As you may know, the MSX VDPs have a race condition in the design of the F, FH and FL interrupt flags, which makes polling unreliable since the flag can be missed occasionally. If that situation occurs the detection will take a frame longer to complete, but still provide the correct result._

~~Grauw

## Source

https://map.grauw.nl/sources/vdp_detection.php