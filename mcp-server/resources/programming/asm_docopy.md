# DoCopy

The first time I wrote a routine to send a command to the VDP, it was the routine DoCopy, by Stefan Boer, published in Sunrise Special. Later on, as my programming skills improved I step by step improved the routine. Now, this is pretty much the end result, as fast as I could think of. Well, actually, when I really want to do a lot of copies, I usually use an even faster variant, with a faster response time. More about that after the first docopy routine.

```assembly
;
; Fast DoCopy, by Grauw
; In:  HL = pointer to 15-byte VDP command data
; Out: HL = updated
;
DoCopy:
    ld a,32
    di
    out (#99),a
    ld a,17+128
    out (#99),a
    ld c,#9B
VDPready:
    ld a,2
    di
    out (#99),a     ; select s#2
    ld a,15+128
    out (#99),a
    in a,(#99)
    rra
    ld  a,0         ; back to s#0, enable ints
    out (#99),a
    ld a,15+128
    ei
    out (#99),a     ; loop if vdp not ready (CE)
    jp c,VDPready
    outi            ; 15x OUTI
    outi            ; (faster than OTIR)
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    ret
```

I sometimes find this useful too, a separate routine to wait for the VDP to finish its current command.

```assembly
;
; This lil' routine waits until the VDP is done copying.
;
VDP_Ready:
    ld a,2
    di
    out (#99),a     ; select s#2
    ld a,15+128
    out (#99),a
    in a,(#99)
    rra
    ld a,0          ; back to s#0, enable ints
    out (#99),a
    ld a,15+128
    ei
    out (#99),a     ; loop if vdp not ready (CE)
    jp c,VDPready
    ret
```

And now, the faster variant of this routine. This one doesn’t switch between status register 0 and status register 2 anymore, which greatly improves the response time, very useful when you need to execute lots and lots of VDP commands consecutively. I believe Cas Cremer’s Core Dump w.i.p. gave me the idea. In any case, this one does not switch status registers anymore, however that will require status register 2 to be set all the time. Fortunately this is not much of a problem when you have your own interrupt handler set-up.

```assembly
;
; Faster again!!! DoCopy, by Grauw
; In:  HL = pointer to 15-byte VDP command data
; Out: HL = updated
;
DoCopy:
    ld a,32
    di
    out (#99),a
    ld a,17+128
    ei
    out (#99),a
    ld c,#9B
VDPready:
    in a,(#99)      ; loop if vdp not ready (CE)
    rra
    jp c,VDPready
    outi            ; 15x OUTI
    outi            ; (faster than OTIR)
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    outi
    ret
```

~Grauw

## Source

https://map.grauw.nl/sources/docopy.php