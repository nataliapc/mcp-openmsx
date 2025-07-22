# Disk I/O error handling in MSX-DOS 1

by Ramon van der Winkel, 22/02/1992  
by request of Matthijs Corpeleijn  
translated by Laurens Holst

When an error occurs during floppy disk I/O, for example because there’s no disk in the disk drive, it’s not nice when a DOS error message appears right in the middle of the execution of the program. Especially when the program is Dutch and the error shown is English.

The error can be captured and redirected to a custom handler in the program. This handler can then use a more fitting way to ask the user how to deal with the error. Regardless of whether this is done with a single-line message or a graphical window.

In MSX-DOS 1 the program has to deal with everything manually. Two addresses need to be diverted and any possible stack problems also need to be taken care of by the program itself. Fortunately MSX-DOS 2 has a better way of handling things; a couple of ready-made routines do most of the work.

## DOS 1

There are two relevant addresses for handling errors in MSX-DOS 1. First of all there’s the address which points to the error handling routine. Additionally there’s an address which is called when the “Abort” option is chosen.

For the error handling routine you need to use the address F323 in the system memory. The contents of this address point to another address which in turn contains the address of the routine. For example:

```
F323 -> D000
D000 -> D002
D002 Start routine
```

When the error handling routine chooses the Abort option, MSX-DOS jumps to a routine which ends with a jump instruction to return to the prompt. We can change this into a jump to our program by setting the address of our routine at address F1E6.

```
F1E6 -> Abort handler
```

The abort handler exists to intercept stack errors. When Ignore or Retry is chosen, a succesful attempt will return to the BDOS function’s call site, and when another error occurs the error handling routine is called again.

Next, the stack needs to be preserved. This can be done as follows, by introducing a universal wrapper routine for invoking the BDOS to the program:

```assembler
bdos:   ld (errStack),sp
        call 5
        ret
```

At this point the error handling routines should already have been set up, and when an abort occurs it should jump to the following routine:

```assembler
bdosAbort: ld sp,(errStack)
           ret
```

This will return to the routine that originally invoked the bdos. All that’s left is a mechanism that lets you check for errors. This can be done by setting a variable first before using the above method to return.

When the application diverts these two addresses, it’s important that the original values are preserved and restored when the program terminates.

All that remains is the description of the error codes that MSX-DOS 1 passes to the error handling routine. First of all the A register contains the drive number. This is the drive which produced the error. The C register will contain an indication of the error, see the following table:

```
b7=1 : Bad FAT
b0=0 : Read action
b0=1 : Write action

b3 b2 b1
0  0  0: Write Protected
0  0  1: Not Read (disk offline)
0  1  0: CRC error
0  1  1: Seek error
1  0  0: Record not found (sector not found)
1  0  1: Write error
1  1  0: Other
```

When returning from the error handler, register C should specify the action to take:

```
0 = Ignore
1 = Retry
2 = Abort
```

When option 2 (abort) is chosen, it will jump to the abort routine which we diverted earlier.

That’s all there is to it. One more thing: be careful where you put the error handling routine. This routine is called by the DiskROM and it may not be able to reach a routine in page 1 (4000..7FFF). However for the abort routine this is not an issue, as by this time the full TPA memory has been re-enabled.

For the MSX-DOS 2 error handling, please refer to the MSX-DOS application manual.

## Source

https://map.grauw.nl/articles/dos-error-handling.php
