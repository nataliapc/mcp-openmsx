# Load graphic data into the VRAM

Here is an couple of routine which can load a screen from disk into the VRAM. The routines are oriented towards MSX-DOS 2, if you want it to use DOS 1 you will have to change the disk load routines, aswell as the error abort routine. Also, they are programmed in Compass, so it they probably won’t directly compile in another assembler because of certain differences like hex notation and label length and such, but it should be easy to adapt.

First, I’ll give an example of how the LoadScreen routine should be called:

```assembly
;
; Load screen FILENAME at #18000 (page 3 in screen 5)
;
Start:        ld      de,FILENAME
              ld      a,1
              ld      hl,#8000
              call    LoadScreen
              ret

FILENAME:     DB      "IMAGE.SC5",0
```

## Load a file into the VRAM

Following are the actual routines. I’ll explain a bit inbetween, but if you want to use them in your own routines, just copy and paste a little, and either delete or comment the inbetween explanation parts.

First of all, some definitions are made. I go by the book, and the book is called MSX-DOS 2 in this case. These are the official naming conventions, so ah, why not just use them. Also, the temporary area is defined here. You can place it anywhere you want, and change the size to whatever value you want (clearly, larger values give better results) by modifying the given constants.

```assembly
;
;=================================================================
;= Graphic loaders ===============================================
;=================================================================
;
;Definitions
;
Bdos:         equ     5
_TERM0:       equ     #00           ;. program terminate
_STROUT:      equ     #09           ;. string output
_OPEN:        equ     #43           ;. open file handle
_CLOSE:       equ     #45           ;. close file handle
_READ:        equ     #48           ;. read from file handle
_SEEK:        equ     #4A           ;. move file handle pointer
_TERM:        equ     #62           ;. terminate with error code
.EOF:         equ     #C7           ;. EOF error
              
TEMP1:        equ     #4000         ;start address temporary space
TEMP1_SIZE:   equ     #4000         ;size of temporary space
```

Following is the routine that loads the entire file into the VRAM. This means it keeps on reading bytes and sending it to the VRAM until DOS returns a .EOF ‘End Of File’ error. The first part is the initializer, which a. sets the VDP’s VRAM Write start address by calling the SetVDP_Write routine (for details about that, see below), b. opens the file, and c. (optionally) skips the first 7 bytes of the file. Here I say optionally, because I actually left that part commented out, since I myself don’t use files in the BSAVE format (I convert all files to the pure VRAM contents) (so I’ve also got a separate palette).

```assembly
;
;Load the entire file into the VRAM
;
;DE  = filenamenaam
;AHL = VRAM start address
;
Load_Screen:  call    SetVdp_Write
              ld      c,_OPEN
              xor     a              ;no flags
              call    Bdos
              jp      nz,Error
              ld      a,b            ;Put the file handle
              ld      (LS_FHANDLE),a ; into the ld b,0 instruction

;             ld      de,0           ;Move file handle pointer to 7th byte
;             ld      hl,7
;             xor     a
;             ld      c,_SEEK
;             call    Bdos
;             jp      nz,Error
```

This next part actually loads the file from disk. The file handle was put directly inside the LD B,n instruction register by the previous piece of code, which is a little faster. Note that in this case, when loading files from a physical medium, a few extra T-states don’t *really* matter, and it’s actually better to use a more ‘tidy’ solution. But, I like self-modifying code, so alas, I couldn’t resist.

```assembly
LoadScr_Loop: ld      hl,TEMP1_SIZE
              ld      de,TEMP1
              ld      b,0           ;self-modifying
LS_FHANDLE:   equ     $-1
              ld      c,_READ
              call    Bdos          ;Read temp1_size bytes
              cp      .EOF          ; check if end of file,
              jp      z,LoadScr_End ; if so, done!
              and     a
              jp      nz,Error
```

Now comes the (somewhat) neat part. This is the part that actually sends the data from the buffer to the VRAM. Now, in this case even single T-States *DO* matter, because this concerns a loop which is called numerous times. So, this part is highly optimized using techniques from my ‘Fast Loops’ article.

```assembly
              dec     hl            ;Use "Mystery Fast Loop Calculus"
              ld      b,l           ;(result: loop HL (=nr of bytes read) times)
              inc     b
              ld      a,h
              inc     a
              ld      c,#98
              ld      hl,TEMP1
LoadScr_LdLp: otir
              dec     a
              jp      nz,LoadScr_LdLp
              jp      LoadScr_Loop
```

And finally, the end of the routine. This part is jumped to when an .EOF is returned by the disk read routines, meaning the end of the file has been reached. Commented out is a part which also sets the stored palette (for BSAVE format files, see the separate palette file loader for more info on that), and after that the file is closed.

```assembly
LoadScr_End:
;             ld      de,0          ;Move file handle pointer
;             ld      hl,#7680 + 7  ; to palette start address
;             ld      a,(LS_FHANDLE)
;             ld      b,a
;             xor     a
;             ld      c,_SEEK
;             call    Bdos
;             jp      nz,Error
;             ld      hl,32
;             ld      de,TEMP1
;             ld      a,(LS_FHANDLE)
;             ld      b,a
;             ld      c,_READ       ;Read From File Handle
;             call    Bdos
;             jp      nz,Error
;             ld      hl,TEMP1
;             call    SetPalet

              ld      a,(LS_FHANDLE)
              ld      b,a
              ld      c,_CLOSE      ;Close File Handle
              call    Bdos
              jp      nz,Error
              ret
```

Last, there’s also the error handling routine, which exits to dos with the appropriate error message.

```assembly
;
;Handle an error...
;Returns to DOS 2 which will show the error.
;
Error:
    ld b,a
    ld c,_TERM
    jp Bdos
```

## Load and set a palette

This routine loads a file from disk, which should be 32 bytes in size, and contains the palette, stored in the same format as the VDP uses (also the same format Basic stores at address #7680). Basically it doesn’t do much interesting - just loads the data into the temporary buffer, then calls a function which sets that palette.

```assembly
;
;Load palette file
;
;DE = filename
;
Load_Palet:   ld      c,_OPEN   ;Open File Handle (no flags)
              xor     a
              call    Bdos
              jp      nz,Error
              push    bc
              ld      de,TEMP1
              ld      hl,32
              ld      c,_READ   ;Read From File Handle
              call    Bdos
              jp      nz,Error
              pop     bc
              ld      c,_CLOSE  ;Close File Handle
              call    Bdos
              jp      nz,Error
              ld      hl,TEMP1  ;Set palette
              jp      SetPalet
```

## The VDP routines

The following routines are the VDP routines which are called from the Load functions. The first sets the start address of the VDP VRAM I/O port (port #98) to the specified value in registers A:HL (where bit 0 of register A contains bit 17 of the address).

```assembly
;
;
;=================================================================
;= VDP-Routines ==================================================
;=================================================================
;
;
;Set VDP port #98 to start writing from address AHL (17-bit)
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

And second, there’s the routine which sends a new palette to the VDP, which is read from address HL. You might notice the huge lot of DW #A3EDs... Those are actually 32 OUTI instructions. I use this notition because it is much more compact than writing 32 lines with OUTIs. Ofcouse you could also use an OTIR instruction, however OUTI is about 25% faster than OTIR.

```assembly
;
;Set the VDP's palette to the palette HL points to
;Changes: AF, BC, HL (=updated)
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

Well, we’re done. I hope it’s been of any use to you! Greetings, earthling!

~~Grauw

## Source

https://map.grauw.nl/sources/load_screen.php