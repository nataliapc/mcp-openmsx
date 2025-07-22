# VDP programming tutorial

This article is meant to be a tutorial for beginning Assembly programmers who want to access the MSX VDP. Knownledge of Z80 assembly is expected. I’ll start out with explaining a little about the three main features of the VDP, then I will go into more detail on how to use them, giving some sample routines inbetween, then I will tell something about the palette, and finally I will give an small example using all addressing methods.

## Table of contents:

- [The VDP basics](#the-vdp-basics)
- [Writing and reading VDP registers](#writing-and-reading-vdp-registers)
  - [Direct register access](#direct-register-access)
  - [Indirect register access](#indirect-register-access)
  - [Status register access](#status-register-access)
- [Writing and reading the VRAM](#writing-and-reading-the-vram)
  - [VRAM access timing](#vram-access-timing)
- [Executing VDP commands](#executing-vdp-commands)
- [Setting the palette](#setting-the-palette)
- [Programming example](#programming-example)

## The VDP basics

There are basically three VDPs for when it concerns MSX computers, the MSX1 its TMS9918A (by Texas Instruments), the MSX2 its v9938, and the MSX2+ and turboR’s v9958 (both by Yamaha). There is also the Graphics9000 (v9990, also by Yamaha), which is pretty cool aswell, but we won’t talk about that one. This document is a guide to programming the v9938, with some remarks about the v9958 inbetween. Although the v9958 definitely has some great additional features like high-color screen modes and horizontal scrolling, the basics are the same.

The MSX v9938 VDP has three main features:

- It has VRAM. This is a special 128kb RAM area dedicated to the VDP, in which it stores its image data. The MSX CPU can only access it through the VDP.
- It has a set of registers. With these registers you can control the VDP’s behaviour, amongst others in which screenmode it operates, the refresh frequency, and much much more. Especially when used in combination with screensplits they enable you to achieve amazing things. In total there are 39 write-only registers, and 10 read-only (status) registers. On the v9958 VDP, used in amongst others all MSX 2+ and turboR computers, there are 3 additional write-only registers.
- It has a command unit which can perform VDP-based operations. These operations can vary from copying a specified area of an image in different speed modes to filling boxes and drawing lines. This is really one of the most useful features of the MSX VDP, because it can perform these operations independently of the Z80 CPU, and is also faster at it. Just give the VDP your 15-byte command and let it do the hard work.

The VDP has got 4 I/O ports through which communication with the CPU is done. They are referred to as VDP ports #0 - #3. On MSX2 computers, one officially needs to read the VDP ‘base’ port address (being the address of the first port) from addresses 6 and 7 in the BIOS. However, from the MSX2+ computer on this address has been standardized to #98. The only devices which actually used this feature are MSX2 expansion sets for MSX1 computers, and those are very rare due to amongst others the lack of software support, and because buying a new MSX2 computer would probably have been cheaper. So in practice, you can just assume them to be present in the #98-#9B range, which is much faster to program for. I’ll usually refer to the I/O port number (#98 for example) instead of the VDP’s port number (being #0 in this case).

## Writing and reading VDP registers

The VDP registers are pretty much the most important for controlling the VDP’s behaviour. As mentioned before, you can make them set a screen mode and lots of other display properties, and particularly when used on screensplits they can enable you to pull amazing visual effects. They can only be written to, and not read from, so if you’re smart you mirror them in the RAM everytime you write to them, especially when it concerns the mode registers. The MSX BIOS also does this, I will tell you the specific addresses later on. The VDP registers are generally referred to as r#number, number being the register number (duh :)), e.g. r#23, which is the display offset (vertical scroll) register.

If you have been a avid MSX-Basic programmer, you will probably notice something odd, because in Basic, VDP register 23 is referred to as VDP(24)! This is indeed true for Basic, and the reason for that is that on the MSX1, with the TMS9918A VDP, VDP(8) was used to read status register 0. However, on the MSX2 VDP suddenly an 8th register appeared. To fix this they decided to increase the register number with 1 (and use negative numbers for the new status registers). So VDP(9) in Basic is actually r#8 and VDP(10) is r#9.

The actual VDP register 24 is not present on the v9938 nor on the v9958. It was used on the v9948 – apparantly a VDP dedicated to the Korean market, which added another text mode specifically for use with the Korean character set. The v9958 added new registers to the v9938 registerset aswell, those are registers 25-27, but it hasn’t got a register 24.

Ah, I still need to list the promised MSX BIOS VDP register mirror addresses:

```
#F3DF - #F3E6: registers 0-7
#FFE7 - #FFF6: registers 8-23
#FFFA - #FFFC: registers 25-27
```

I myself often have the start addresses set as 3 labels, VDP_0, VDP_8 (-8) and VDP_25 (-25), and refer to for example register 23 with VDP_8 + 23. Another setup I use even more is my own VDP array of 28 bytes. At the start of my program I copy the values from the BIOS into my own array, and after that I simply load the value of a certain VDP register in A by using LD A,(VDP+9).

### Direct register access

Anyways, let’s talk about how to actually write to them registers ;). The VDP registers can be addressed in two ways, direct and indirect. Usually the direct way is used, but the indirect method is also practical in some situations. For direct register access, what you have to do is write the value to port #99 first, and then write the register number with bit 8 set (in other words, +128). Here is the method definition from the v9938 application manual:

```
                     MSB  7   6   5   4   3   2   1   0  LSB
                        +---+---+---+---+---+---+---+---+
   Port #1 First byte   |D7 |D6 |D5 |D4 |D3 |D2 |D1 |D0 | DATA
                        +===+===+===+===+===+===+===+===+
           Second byte  | 1 | 0 |R5 |R4 |R3 |R2 |R1 |R0 | REGISTER #
                        +---+---+---+---+---+---+---+---+
```

So the actual code with which you change a register’s value will look something like this:

```assembler
    ld a,value
    di
    out (#99),a
    ld a,regnr + 128
    ei
    out (#99),a
```

Note the DI and the EI instructions inbetween. It is VERY important that you disable the interrupts during the 2 OUTs. This is because the VDP registers are also changed on the interrupt, and if an interrupt were to occur right inbetween these two OUT instructions the results would be unpredictable. The EI is put before the OUT here since the EI has a delay of 1 instruction on the Z80 before it re-enables the interrupts, and if possible one should keep the interrupts disabled as shortly as possible (some interrupts like line interrupts for screensplits or RS232 interrupts need responses as fast as possible).

There is no speed limit on reading and writing VDP registers. Well, there is one obviously, but existing MSX CPUs don’t reach it. So feel free to have just a XOR A between two OUT instructions, or even use consecutive OUTI or OUT (C),r instructions.

Another thing, if you are going to make a macro for setting the VDP register, I strongly recommend you to not include the DI and EI instructions. If you do that the status of the interrupt is not clearly visible in the code anymore, which could result in puzzling bugs in situations where the interrupt must stay disabled (for example in case you want to select a status register - see below). The downside of this is that you can’t put the EI before the 2nd OUT anymore, only after the macro. But that’s not that bad either, while the bugs this could cause can be mind-sizzling.

### Indirect register access

There is also the other method of addressing the registers, which is, as said before, the indirect method. This means that you can specify the register to write to once, and then repeatedly write values, which is about twice as fast. However the register needs to be the same for all values, or it has to be a successive range of registers (indirect register writing supports auto incrementing). Indirect register writing is done by writing the register number to r#17, also specifying whether to auto-increment, and then writing the desired values to port #9B:

```
                  MSB  7   6   5   4   3   2   1   0  LSB
                     +---+---+---+---+---+---+---+---+
  Register #17       |AII| 0 |R5 |R4 |R3 |R2 |R1 |R0 | REGISTER #
                     +-+-+---+---+---+---+---+---+---+
                       |-- 1:  Auto increment inhibit
                       +-- 0:  Auto increment on

                     +---+---+---+---+---+---+---+---+
  Port #3            |D7 |D6 |D5 |D4 |D3 |D2 |D1 |D0 | DATA
                     +---+---+---+---+---+---+---+---+
```

Code example:

```assembler
    ld a,regnr      ; add +128 for no auto increment
    di
    out (#99),a
    ld a,17 + 128
    ei
    out (#99),a

    ld b,number_of_bytes
    ld c,#9B        ; you can also write ld bc,#nn9B, which is faster
    ld hl,address
    otir
```

Note that since VDP programming can be very tight, especially on screensplits, you often need the fastest solution possible. In that case, consider unrolling the OTIR to OUTIs as discussed in the Fast Loops article.

### Status register access

Aside from the normal registers there are also the status registers. Those can only be read, although in some cases status bits get reset when they’re read. The status registers are usually referred to as s#number, for example s#0 (being the default status register), and they contain information about interrupts, sprite status, and also the VDP ID number with which you can identify what type of VDP it is (the v9938 has ID 0, the v9958 has ID 2, and the mysterious v9948 probably had ID 1).

In order to read a status register one needs to write the number of the status register in r#15, and after that the status register’s value can be read from port #99:

```
                  MSB  7   6   5   4   3   2   1   0  LSB
                     +---+---+---+---+---+---+---+---+
  Register #15       | 0 | 0 | 0 | 0 |S3 |S2 |S1 |S0 | Status register
                     +===+===+===+===+===+===+===+===+
  Port #1 Read data  |D7 |D6 |D5 |D4 |D3 |D2 |D1 |D0 | DATA
                     +---+---+---+---+---+---+---+---+
```

An important thing to remember is that with the common BIOS interruptroutine enabled, s#0 must always be enabled. So if you select another status register, keep the interrupts disabled until after you’ve read it and selected back s#0. Also note that it is good practice to have the interrupts disabled for a time period as short as possible, in other words you shouldn’t poll for a certain status register while keeping the interrupts disabled. Switch back to s#0 and enable the ints regularly.

Some example code to read out a status register:

```assembler
    ld a,statusregnr
    di
    out (#99),a
    ld a,15 + 128
    out (#99),a
    in a,(#99)
    ex af,af'
    xor a           ; ld a,0
    out (#99),a
    ld a,15 + 128
    ei
    out (#99),a
    ex af,af'
    ret
```

## Writing and reading the VRAM

Now, for the VRAM... It is pretty obvious that the CPU needs a means to write data to it, otherwise it would be quite hard to load an image into the VRAM. Aside from that, the VRAM access is also used a lot to update tables within the VRAM, like for example the sprite tables, and in (tile-based) screen modes 1-4 the pattern and attribute tables aswell. Especially in those screen modes you can pull some really cool effects using this.

Since the VRAM is not directly connected to the CPU, communication with it needs to be done through the VDP. On the MSX, the process of writing bytes to the VRAM consists of two steps, first one needs to set the VDP’s ‘address counter’ and the mode (read or write access), and then the program can output (or input) a number of bytes to the VDP, which is interfaced with the VRAM. The setting of the address counter has to be done like this:

1. set the address counter bits 14-16 in register 14.
2. set the address counter bits 0-7.
3. set the address counter bits 8-13 and specify whether to read or to write.

The setting of the upper three bits in register 14 was added in the v9938 VDP (as opposed to the MSX1 TMS9918A) because of the larger amount of VRAM, 128kb instead of 16kb, and hence the larger addressing space. Anyways, those bits need to be set first, and then the bits 0-13 have to be written using two consecutive OUTs to port #99. To clarify a bit more:

```
                   MSB  7   6   5   4   3   2   1   0  LSB
                      +---+---+---+---+---+---+---+---+
  Register #14        | 0 | 0 | 0 | 0 | 0 |A16|A15|A14| VRAM access base
                      +---+---+---+---+---+---+---+---+ address register

                   MSB  7   6   5   4   3   2   1   0  LSB
                      +---+---+---+---+---+---+---+---+
  Port #1 First byte  |A7 |A6 |A5 |A4 |A3 |A2 |A1 |A0 | VRAM access base
                      +===+===+===+===+===+===+===+===+ address registers
         Second byte  | X | X |A13|A12|A11|A10|A9 |A8 |
                      +-+-+-+-+---+---+---+---+---+---+
                        0   0:  Read
                        0   1:  Write
```

After having done this, you can read or write the data from or to port #98. After each VRAM read/write access, the address counter is automatically increased, so if you use repeated reads/writes you don’t need to set the address counter again all the time. Note however that you can’t mix reads and writes – if you wish to change from reading to writing mode or vice versa you need to re-set the address with the read/write bit set appropriately.

On the TMS9918 the VRAM address pointer gets modified when you write to a register. Therefore, on MSX1 you must keep the interrupts disabled while writing to or reading from VRAM. Fortunately the V9938’s VRAM address pointer is not affected by register writes, so this restriction does not apply to MSX2.

### VRAM access timing

It is important to know that there is a speed limit when accessing the VRAM. How fast you can write exactly depends on the screen mode you’re in and whether you have sprites enabled, etc. The TMS9918 is the slowest, and in the worst case requires you to space your reads and writes 29 T-states apart. Notably, this is slower than the OTIR and INIR instructions (23 cycles), so use the following code in stead (exactly 29 cycles):

```assembler
OutiToVram:
    outi
    jp nz,OutiToVram
```

The V9938 is quite a bit faster, reads and writes only need to be 15 T-states apart. There is one exception: screen 0 requires a 20 T-states wait, both in width 40 and 80 modes. Note that the TMS9918 is actually faster in this screen mode, so make sure to test screen 0 programs on MSX2 hardware.

What this means is that in MSX2 software you can safely use the OTIR and INIR instructions to output bulk data to the VRAM. If you’re not in screen 0, you can also safely use OUTI and INI instructions, refer to the Fast Loops article for more details on how you can access the VRAM as quickly as possible by creating fast 16-bit loops and unrolling the OTIR / INIR instructions.

Finally, during vertical blanking or when the screen is disabled, there is no speed limit. This applies to both the TMS9918 and the V9938. When you intend to exploit this fact, please be aware that at 60Hz, the vertical blanking period is shorter than at 50Hz. Test your code on both European and Japanese machines.

For the exact details of TMS9918 VRAM access speeds, consult section 2.1.5 of the TMS9918 application manual. For details about the V9938 timing consult Wouter Vermaelen’s V9938 VRAM timings (part II) articles. Finally, note that all V9938 timings also apply to the V9958.

Minimum VRAM access timings in 3.58 MHz Z80 cycles

|Screen mode|VDP mode|TMS9918|V9938 / V9958|
|---|---|:-:|:-:|
|screen 0, width 40|TEXT 1|12|20|
|screen 0, width 80|TEXT 2||20|
|screen 1|GRAPHIC 1|29|15|
|screen 2|GRAPHIC 2|29|15|
|screen 3|MULTICOLOR|13|15|
|screen 4|GRAPHIC 3||15|
|screen 5|GRAPHIC 4||15|
|screen 6|GRAPHIC 5||15|
|screen 7|GRAPHIC 6||15|
|screen 8|GRAPHIC 7||15|

Here are example routines to set the VDP for reading/writing the VRAM:

```assembler
;
; Set VDP address counter to write from address AHL (17-bit)
; Enables the interrupts
;
SetVdp_Write:
    rlc h
    rla
    rlc h
    rla
    srl h
    srl h
    di
    out (#99),a
    ld a,14 + 128
    out (#99),a
    ld a,l
    out (#99),a
    ld a,h
    or 64
    ei
    out (#99),a
    ret
```

```assembler
;
; Set VDP address counter to read from address AHL (17-bit)
; Enables the interrupts
;
SetVdp_Read:
    rlc h
    rla
    rlc h
    rla
    srl h
    srl h
    di
    out (#99),a
    ld a,14 + 128
    out (#99),a
    ld a,l
    out (#99),a
    ld a,h
    ei
    out (#99),a
    ret
```

## Executing VDP commands

And finally, we arrived at the VDP commands. For screen modes 0-4 they are pretty useless, but for screen 5 and up they are definitely one of the coolest features of the VDP. They offer you the possibility to let the VDP perform a couple of actions ranging from copying an area of the screen to drawing a line. It also offers several variants of the same action, which offer more or less possibilities in exchange for speed. For example, the HMMM, LMMM and YMMM commands all copy an area of the screen, but HMMM is significantly faster than LMMM, and YMMM even more so, however the restrictions on YMMM make it only useful in a number of occasions. Refer to the article about VDP commands speed measurements for more details on the command speeds. Take a look at the COMMANDS section on page 54 and onwards of the v9938 application manual for detailed descriptions of the several commands.

The VDP expects its command parameters to be set in registers 32-45, and the final command code in register 46. The fastest and easiest way to do this is by using the indirect register access method. The parameter of a function which does that (DoCopy, given below) could then be a pointer to a 15-byte VDP command data block (illustrated in the programming example at the bottom). But before a new command is sent to r#32-r#46 the program should first check the CE bit in s#2 (bit 0). This bit indicates whether the previously given command has finished or not. If it hasn’t, you should wait with giving the next command, or the previous one will be aborted. If abortion is what you want, there is a special STOP command for that.

As you might already have guessed, the VDP executes the command independantly of the processor (on nowadays’ PC video cards this is called hardware accelleration... gah, we MSX-ers have had that for a long time already! ;)). In effect this means that the routine returns immediately after issueing the VDP command and in the meanwhile the CPU can do something else. Only if you immediately issue another command the CPU has to wait for the VDP to finish.

Note about the v9958: if you set bit 6 of r#25, using VDP commands in screen modes 0-4 actually is supported. I it kind of hard to think of a real good use for it, but maybe you’ll find one someday :). Er, lemme think, it could for example be used to speed up vertical scrolling in screens 0 and 1. Or actually any tile-based scrolling I guess.

Here is the DoCopy routine, read the small source code article about DoCopy on how to speed it up a little more.

```assembler
;
; Fast DoCopy, by Grauw
; In:  HL = pointer to 15-byte VDP command data
; Out: HL = updated
;
DoCopy:
    ld a,32
    di
    out (#99),a
    ld a,17 + 128
    out (#99),a
    ld c,#9B
VDPready:
    ld a,2
    di
    out (#99),a     ; select s#2
    ld a,15 + 128
    out (#99),a
    in a,(#99)
    rra
    ld a,0          ; back to s#0, enable ints
    out (#99),a
    ld a,15 + 128
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

## Setting the palette

Setting a new VDP palette is a rather easy thing to do. First you have to set the palette pointer in r#16, usually it is set to 0, and then you can write your palette values to port #9A. The palette pointer automatically increments, and loops to 0 again when it reaches the last palette entry. By the way, please note that in screen 8 the palette can’t be used for sprites.

Here is an example SetPalette routine. The OTIR could be unrolled to OUTIs if you really need the additional speed (for example on a screensplit).

```assembler
;
; Set the palette to the one HL points to...
; Modifies: AF, BC, HL (=updated)
; Enables the interrupts.
;
SetPalette:
    xor a           ; set p#pointer to zero.
    di
    out (#99),a
    ld a,16+128
    ei
    out (#99),a
    ld bc,#209A     ; out 32x to port #9A
    otir
    ret
```

## Programming example

This is a small example of a short program which combines most techniques. Do with it whatever you want, look at it, try it out, ignore it... ^_^. It isn’t exactly the summum of speed and optimized code, but ahwell... It will do.

```assembler
;
; Is supposed to run in screen 5, so you should make a small BASIC loader,
; or call the CHMOD BIOS routine.
;
DoExampleCopy:
    xor a           ; set vram write base address
    ld hl,#8000     ;  to 1st byte of page 1...
    call SetVDP_Write

    ld a,#88        ; use color 8 (red)
FillL1:
    ld c,8          ; fill 1st 8 lines of page 1
FillL2:
    ld b,128        ;
    out (#98),a     ; could also have been done with
    djnz FillL2     ; a vdp command (probably faster)
    dec c           ; (and could also use a fast loop)
    jp nz,FillL1

    ld hl,COPYBLOCK ; execute the copy
    call DoCopy
    ret

COPYBLOCK:
    db 0,0,0,1
    db 0,0,0,0
    db 8,0,8,0
    db 0,0,#D0        ; HMMM

; As an alternate notation, you might actually prefer the following:
;
;   dw    #0000,#0100
;   dw    #0000,#0000
;   dw    #0008,#0008
;   db    0,0,#D0
```

## Source

https://map.grauw.nl/articles/vdp_tut.php
