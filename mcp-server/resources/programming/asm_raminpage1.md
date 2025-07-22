# How to switch RAM/ROM in page 1

One of the problems when programming in a Basic environment is that it hasn’t exactly got a very large amount of RAM space available. One of the possible solutions for this problem is to switch away the Basic ROM in page 1 (the area from #4000-#7FFF), which isn’t used while executing machine code anyway, and replace it with RAM. This results in 16 kilobytes of additional addressing space.

First of all, this routine makes use of one of the System RAM variables which are initialized by the Disk BIOS, RAMAD1 to be specific. If this Disk BIOS is not available (for example on MSX computers without diskdrive), the variable will not be initialized. Therefor, one should officially always check on beforehand whether a Disk BIOS is present by comparing the byte at address H.PHYD (#FFA7) with #C9. If that value is there, the Disk BIOS is NOT present, so these routines can not be used. Ofcourse when you are a 100% certain a Disk BIOS is present, the check is not necessary, which is pretty much the case for every non-MSX1 program.

You can use this method to switch RAM:

```assembly
ENASLT: EQU #0024
RAMAD1: EQU #F342
EXPTBL: EQU #FCC1

Enable_RAM:  ld     a,(RAMAD1)
             ld     h,#40
             call   ENASLT
```

There is a slightly better method to switch RAM, by selecting the same slot in page 1 as you have in page 3, which will always be the system RAM. This will work on any MSX, even without DiskROM, provided there is at least 48kB of RAM available ofcourse.

It can be done as follows:

```assembly
Enable_RAM2: ld     a,(EXPTBL+3)
             ld     b,a                 ;check if slot is expanded
             and    a
             jp     z,Ena_RAM2_jp
             ld     a,(#FFFF)           ;if so, read subslot value first
             cpl                        ;complement value
             and    %11000000
             rrca                       ;shift subslot bits to bits 2-3
             rrca
             rrca
             rrca
             or     b
             ld     b,a
Ena_RAM2_jp: in     a,(#A8)             ;read slot value
             and    %11000000           ;shift slot bits to bits 0-1
             rlca
             rlca
             or     b
             ld     h,#40               ;select slot
             call   ENASLT
And, before returning to Basic, don’t forget to switch back the Basic ROM:

Enable_ROM:  ld     a,(EXPTBL)
             ld     h,#40
             call   ENASLT
```

~Grauw


## Source

https://map.grauw.nl/sources/raminpage1.php