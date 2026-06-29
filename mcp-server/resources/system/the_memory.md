# The Memory

This page was last modified 09:04, 4 March 2024 by Gdx. Based on work by Mars2000you and Rolandve and others.

Source: https://www.msx.org/wiki/The_Memory

## The RAM without disk installed

Memory of an MSX computer is composed of RAM and ROM. Z80 can only handle up to 64kB because it has only 16 addressing pins (for 16 bits) but MSX computers use two systems that allow to switch 16kB on four fixed areas. These areas are called "pages". The first is the slots system. It has appeared since the first generation of MSX computers. The second system is the Memory Mapper. It has appeared since the MSX2 in option. This system was designed to extend the RAM.

When the MSX starts up, the CPU executes the initialization routine in the Main-ROM at address 0000h (slot 0 or 0-0) and scans the primary and secondary slots as shown in the figure below. In the example (0-0) the first 0 is the primary slot, the second 0 is the secundary slot)

So, the first page of RAM found in a slot will be selected as Main-RAM.

An MSX computer must have at least 8kB of RAM, this is the upper E000h ~ FFFFh. This area is scanned if no 16kB page is found in the slots.

> **Notes:**
> * On MSX1/2/2+ the main RAM is detected as described above. Memory mappers are not taken into account.
> * On MSX turbo R, the internal RAM is selected by default because it can be accessed at a much higher speed in R800 mode.

Next, the MSX2/MSX2+ system searches for the Sub-ROM (It searches for the characters "CD" at 0000h in each slot and makes an inter-slot call at 0102h when found). This step is not performed on MSX Turbo R because the Sub-ROM is directly called.

Then, the system searches for the executable ROMs (it searches for the characters "AB" at 4000h and 8000h in each slot and when found it makes an inter-slot call at the address specified in INIT). See "Develop a program in cartridge ROM" for details.)

## The RAM with disks installed

When disks are present, the reset routine of Disk-ROM stores current selected slots of page 0 and 1 at F341h and F342h, then scans the slots on 0000h~3FFFh and 4000h~7FFFh pages to find the remain 32kB in the same way as indicated above. Found slots of RAM for pages 2 and 3 are stored at F343h and F344h.

If Disk-ROM is the v2.20 or newer, the first bigger memory mapper is selected on each page, except on MSX turbo R that selects its internal memory.

With the Disk-ROM v2.30 or newer, if we force the DOS1 mode by holding the '1' key during start up or boot DOS1 then the main RAM is detected as described above on pages 0 and 1 (0000h~7FFFh). MSX turbo R selects the Z80 mode and internal RAM is selected on the two upper pages only.

When system starts in Basic, memory map is like below.

**Default memory map under BASIC environment:**

```
                 /  +----------------------------+ FFFFh
                |   |    Variables, hooks and    |
                |   |      system work area      |
                |   +----------------------------+ F380h \
                |   |   Variables and work area  |        | Fixed area of the
                |   | for MSX-DOS and Disk-BASIC |        | disks communication
                |   +----------------------------+ F1C9h /
                |   | Area for machine language  |
                |   |          routines          |
                |   +----------------------------+ HIMEM (FC4Ah)
       Main-RAM |   |    Work area for disks     |
                |   +----------------------------+ MEMSIZ (F672h)
                |   |     Character strings      |
                |   +----------------------------+ DSKTOP (F674h)
                |   |           Stack            |
                |   +----------------------------+ Register SP
                |   |   Free RAM available for   |
                |   |       BASIC programs       |
                 \  +----------------------------+ BOTTOM (FC48h)
                    | X X X X X X X X X X X X X  |
                 /  +----------------------------+ 7FFFh
                |   |   Main BIOS routines and   |
                |   |     BASIC interpreter      |
       Main-ROM |   +----------------------------+ 01B6h
                |   |   Table of jumps to main   |
                |   |            BIOS            |
                 \  +----------------------------+ 0000h
```

The memory map shows that the MSX only selects the upper part of the Main-Ram up to halfway. Available RAM for the users begins at address 0E000h on MSX computers with 8kB or 0C000h with 16kB. It begins at address 08000h on all other MSXs. This address is indicated by the BOTTOM (0FC48h) system variable. To find out the end of RAM available, read the MEMSIZ (0F672h) variable.

CLEAR instruction of the basic makes it possible to create a “protected” area above that of working disks in order to place our own routines in machine language there. HIMEM (0FC4Ah) is specified by the second parameter of the CLEAR statement and the size of the variable area between MEMSIZ (0F672h) and DSKTOP (0F674h) is defined by the first parameter. At initialization, the area for machine language routines has a size of 0 bytes.

On MSX with more than 32kB RAM, it is necessary to manipulate the Slots to access the rest of the RAM which is inaccessible to the Basic.

**Memory map under MSX-DOS environment:**

```
  +----------------------------+ FFFFh
  |    Variables, hooks and    |
  |      system work area      |
  +----------------------------+ F380h
  |   Variables and work area  |
  | for MSX-DOS and Disk-BASIC |
  +----------------------------+ F1C9h
  |   Dinamic disk work area   |
  +----------------------------+
  |Sector buffer to read/write |
  +----------------------------+
  |         Sector I/O         |
  +----------------------------+
  |        Files buffers       |
  +----------------------------+
  |         FAT buffers        |
  +----------------------------+
  |         MSX-DOS.SYS        |     Address specified at 0006h
  +----------------------------+ <-- during command execution
  |            Stack           |
  +----------------------------+ SP Register
  |                            |
  |       Free area (TPA)      |
  |                            |
  +----------------------------+ 0100h
  |    System scratch area     |
  +----------------------------+ 0000h
```

External commands are loaded and executed at 0100h. To use the prompt, when a command is not being executed, COMMAND.COM or COMMAND2.COM is loaded at 0100h.

## The ROMs

MSX computers have the following standard ROMs:

* Main-ROM that contains the BIOS and the MSX-BASIC interpreter. (MSX1~)
* Sub-ROM that contains new MSX-BASIC instructions and the BIOS for new devices added by MSX2. (MSX2~)
* Disk-ROM that contains the Disk-ROM BIOS and Disk BASIC. (MSX turbo R) (optional for previous generations)
* MSX-MUSIC that contains the FM-BIOS and MSX-MUSIC BASIC. (MSX turbo R) (optional for previous generations)

Even other ROM sizes can be 2K, 4k, 8K, etc. the slots system divides the memory into 16kB pages, and a page can be selected on four pages by writing the page number to the slot registers. A ROM is auto-executed at MSX start up if the characters "AB" are found at the address 4000h or 8000h. (See ROM header for details).

ROMs size can be expanded by a not standardised system called Megarom. There are also Megaram mappers available, which are similar but use a MegaROM mapper type. But these are mostly meant for playing cracked ROM games. (See ROM mappers)
