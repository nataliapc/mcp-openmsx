# Interrupts

Many machine language programmers will have written a program that needed to be called from the interrupt routine. Sometimes such a program does not work well, or at all, for some vague reason. Time to shine some light on those shady interrupts.

Author: Ramon van der Winkel  
Published in: MSX Computer Magazine 51 / MemMan TDK  
Translated by: Laurens Holst

To extend the BIOS interrupt routine, the extension has to be attached to one of the two interrupt hooks. A choice has to be made between the hooks H.KEYI and H.TIMI. Both are invoked by the interrupt routine, however there are differences.

The H.KEYI hook is invoked every interrupt, while the H.TIMI hook is invoked at regular intervals. 50 or 60 times per second, to be precise. For example, a background song should be attached to H.TIMI, because the playback speed has to be regular.

An interrupt is — simply put — a notification from a device to the processor. With an interrupt the device tells the processor to take action. A modem can use an interrupt to notify the processor that a character has been received. Because a program that fetches the character from the modem has to be invoked every interrupt, it should be attached to H.KEYI.

## Set-up

Interrupt routines have to be written such that they can be invoked at every possible moment. They can not change anything that would negatively impact the functioning of the main program. All register values must be preserved for example, otherwise the main program could yield some very strange results if an interrupt routine would just change the contents of a couple of registers. Also they need to account for the current state of the primary and secondary slot registers and possibly the memory mapper setting.

The preservation of the register values is done by the interrupt handler in the BIOS. A program which is attached to these hooks does not need to preserve them as well. There is one exception to this: programs who attach themselves to the H.TIMI hook must preserve register A. This register is a copy of VDP status register S#0, which is read by the BIOS routine before H.TIMI is invoked. After the hook returns the BIOS uses the contents of this register.

One of the devices that generate interrupts in the MSX is the video processor. It generates and interrupt at the moment the last line of the active area of the screen — where the text and graphics can appear — is displayed. Because this happens 50 times per second, this means that each second there are 50 interrupts coming from the VDP. If the VDP is set to 60Hz, the interrupts will also be generated 60 times per second.

## Handling

The BIOS interrupt routine first invokes the H.KEYI hook. Next it checks whether the interrupt originates from the VDP. If not, the interrupt routine ends, otherwise the second part of the routine is executed.

This part invokes the H.TIMI hook and then performs a couple of standard activities, such as reading the keyboard, executing Basic’s ON INTERVAL GOSUB and ON STRIG GOSUB instructions, incrementing the Basic variable TIME, handling the PLAY statement, et cetera. See the overview that accompanies this article for more details about what tasks the interrupt routing performs exactly.

To determine whether an interrupt originates from the VDP, it looks at the contents of the afore mentioned VDP register S#0. Bit 7 of this register is set by the VDP the moment the last line of the screen has been displayed and the interrupt is generated. After the register is read, the bit is automatically reset to 0. While this bit is 1 the VDP will not generate new interrupts. At every VDP interrupt this bit needs to be read, otherwise the VDP will not generate any new interrupts.

When the H.TIMI hook is invoked, register A will contain the value of VDP register S#0 that was just read. After the hook returns this will be stored in the system variable STATFL. For this reason the contents of register A need to be preserved by programs that attach themselves to the H.TIMI hook.

### Global overview of the tasks performed by the MSX BIOS interrupt routine

#### Always
- Stack all registers
- Invoke H.KEYI hook
- Read VDP status register S#0
- Turbo R: Check PAUSE key
- Check VDP interrupt

#### At VDP interrupt
- Invoke H.TIMI hook
- Enable Interrupts (EI)
- Save S#0 in STATFL
- ON INTERVAL GOSUB
- Increase TIME variable (JIFFY)
- Handle PLAY

#### Every second VDP interrupt
- Keyboard scan
- Processing keys
- ON STRIG GOSUB
- Key repetition

#### Always
- Restore all registers
- Enable Interrupts (EI)
- RETurn from Interrupt (RETI)

## Types

The Z80 processor — and of course the compatible R800 — has three ways to handle interrupts, of which only two are really used on the MSX. These ways are called Interrupt Modes. They are numbered 0 through 2. The interrupt mode can be selected using one of the machine language instructions IM 0, IM 1 or IM 2.

IM 0 is not used on the MSX system. In this mode a device can provide the CPU with an instruction to execute. The most used interrupt mode on MSX is IM 1. In this mode the processor always calls a fixed address: 0038h. At this address every MSX BIOS has a jump to the interrupt routine.

The other interrupt mode in use is IM 2, on the MSX it is used by CP/M. In this mode the address that is called is determined by combining the I register and a byte from the device. The I register can be set by the program and contains the high part of the address. The low part is provided by the device. The combined address isn’t the address of the interrupt routine yet, but it specifies a memory location that contains the routine’s start address. Because the routine’s address always has to be in an even memory location, 128 different interrupt routines can be called. The device determines which.

In CP/M all 128 possible memory addresses are filled with the same value, so that all interrupts will end up at the same routine. Just to be sure, CP/M’s authors also had the interrupt routine start at an address where the high and low parts of the address are identical. In case an interrupt would occur where the device provides a value with bit 0 set, it will still end up at the correct address. An address with bit 0 set can occur if the device does not provide a specific value at all, because it expects interrupt mode 1 to be active.

The program can inhibit interrupts, preventing them from occurring. To do so the program needs to tell the CPU that interrupts generated by devices should not be handled. The CPU has two flags for this, named IFF1 and IFF2. IFF is an abbreviation of Interrupt Flip Flop. When the CPU detects an interrupt, it first checks IFF1. If this flag is set the interrupt is handled, otherwise it is ignored.

The machine language instructions to influence these flags are Disable Interrupts (DI) and Enable Interrupts (EI). A DI instruction will clear both flags and cause the CPU to ignore interrupts. After an EI instruction the flags will be set and interrupts will be accepted again.

Besides the above mentioned interrupts there is also a type of interrupt which can not be ignored by the CPU. This is the so-called Non Maskable Interrupt or NMI. An NMI is processed similar to an interrupt in interrupt mode 1, however in this case the CPU will call address 0066h. Even though these interrupts do not normally occur on MSX computers, the MSX BIOS does have a NMI interrupt handling routine at that address.

MSX-DOS only provides a handler for ‘normal’ interrupts. This routine enables the BIOS in page 0 and invokes its interrupt routine. Afterwards it re-enables RAM in page 0. Non Maskable Interrupts can not occur in MSX-DOS because there is no handling routine for it. Address 0066h is right in the middle of MSX-DOS’s first FCB — File Control Block — buffer, which starts at address 005Ch.

|Address|Description|
|:-:|:--|
|FD9Ah|H.KEYI hook|
|FD9Fh|H.TIMI hook|
|FDD6h|H.NMI hook|
|F3E7h|STATFL variable|
|FC9Eh|JIFFY variable|
|0038h|IM 1 interrupts entry point|
|0066h|NMI interrupts entry point|

## The call

Before the interrupt routine is executed, the program counter is saved to the stack. After the interrupt routine ends this address is retrieved and the main program continues. In other words, the interrupt routine is executed as if the main program executes a CALL to a subroutine, in this case the interrupt routine.

To prevent nesting the CPU automatically resets the IFF1 and IFF2 flags (DI). Before calling an NMI routine IFF1 is copied into IFF2 and only IFF1 is reset, so that the state of IFF1 can be restored at the end of the NMI routine.

Just like normal routines, interrupt routines can be terminated with a RET instruction. However, the CPU has two special instructions to end interrupt routines: RETurn from Interrupt (RETI) and RETurn from Non maskable interrupt (RETN).

The RETI instruction can be recognised by a device at the moment it is executed by the CPU, so that it can know that its interrupt has been handled. For this reason it’s better to use a RETI than a RET, although they are identical in function. Note that IFF1 is not set by the RETI instruction. This must be done with an EI instruction in the interrupt routine.

The RETN instruction at the end of an NMI-routine however **is needed** to restore IFF1. RETN copies the state of IFF2 into IFF1, so that it is restored to the value it had before the NMI occurred. Apart from this a RETN instruction behaves like a normal RET instruction.

## VDP interrupts again

Right after the VDP displayed the last line of the active display area, bit 7 of VDP register S#0 is set. At the same time the interrupt signal is activated and the CPU recognises the interrupt. At this moment the IFF1 and IFF2 flags are automatically reset, preventing the CPU from handling further interrupts.

However, the interrupt signal from the VDP stays active until the VDP status register S#0 is read. So if the interrupt routine executes an EI instruction to re-enable interrupts while S#0 has not been read yet, the CPU will immediately recognise the interrupt from the VDP again (it was still active after all) and proceed to execute the interrupt routine again, even though the previous call hadn’t ended yet.

The result is probably clear: an infinite loop where the CPU places a new return address on the stack at every new interrupt. This will in no-time cause the entire memory to fill up with return addresses, overwriting program code and most likely causing the computer to crash.

Besides the interrupt the VDP generates when the active area has been displayed, the VDP can also generate another interrupt. The moment that the VDP should do this can be set by the software in VDP register R#19. In this register a Y-coordinate can be specified. While the VDP is displaying the screen, the moment the it reaches this line an interrupt is generated.

## Programming tips

When writing a routine that needs to be called on an interrupt, a choice has to be made between the two available hooks. A routine attached to the H.KEYI hook can never execute an EI instruction, because the BIOS interrupt routine hasn’t read the VDP status register S#0 yet. A routine on the H.TIMI hook can enable interrupts, but has to preserve the contents of register A.

The BIOS interrupt routine reads the VDP status register S#0 by directly reading the VDP’s command port, rather than first selecting the appropriate status register via register R#15 before reading the port. For this reason programs must always keep register R#15 set to 0 when the interrupts are enabled. If the program needs to read another status register, it has to disable the interrupts before doing so.

It is possible to write a custom interrupt routine which replaces the existing BIOS routine entirely. If this is done, keep in mind that all registers must be preserved and don’t forget to read the VDP status register S#0. Based on this value different subroutines can be chosen within the custom interrupt routine.

To end a ‘normal’ interrupt routine interrupts have to be re-enabled with an EI instruction. To prevent nesting the CPU will ignore interrupts for one more instruction after the EI instruction. This allows a subsequent RETI to return to the main program and prevents the stack from overflowing from a quick succession of interrupts, as these will only be recognised after the RET. So, the last two instructions in an interrupt routine are always:

```assembly
EI
RETI
```

An NMI-routine should not use DI and EI instructions, because these also change the IFF2 flag. This flag needs to be preserved because IFF2 contains a copy of IFF1 while the NMI routine is executing, which needs to be restored when the NMI ends.

Interrupt routines — including all routines attached to the interrupt hooks — should not take too much time. If the VDP generates a new interrupt before the routine started by the previous interrupt has ended, it will immediately be recognised when the interrupts are re-enabled. If this happens, the main program will be starved and not be able to execute another instruction.

When having a custom interrupt routine in RAM, be aware when calling BIOS routines that during their execution page 0 will no longer contain the RAM with the new routine at address 0038h. In stead when an interrupt occurs the BIOS’s interrupt routine will become active. To prevent this, take care to always keep the IFF1 flag reset with a DI instruction. Also keep in mind that some BIOS routines re-enable interrupts. This is certainly done by the SUBROM, since every entry in the jump table contains an EI instruction!

_[Translator’s note: For this reason, it may be preferable to use IM 2 for custom interrupt routines. Note; I would recommend to use the hooks and avoid creating a custom interrupt routine unless there are strong reasons to do so. Issues with compatibility and ever-spinning disk drives are lying in wait.]_

Example program application of Interrupt Mode 2

```assembly
;
; im2.gen - RWi
;
; Example of how to use Interrupt Mode 2
;
intVecTabAd   equ 08000h             ;Put the Interrupt Vector Table here
intVecHalfAd  equ 080h               ;High memory address pointer
intRoutStart  equ 08181h             ;Let interrupt routine start here
intRoutHalfAd equ 081h               ;Address high and low

im2:          di                     ;No interrupts during switch

              ld hl,intVecTabAd      ;Generate IVT here
              ld (hl),intRoutHalfAd  ;Use this as high and low address part
              ld d,h                 ;Copy destination pointer from
              ld e,l                 ; the source pointer
              inc de                 ;Destination 1 byte further
              ld bc,128*2            ;128 vectors, 1 byte extra for 256th
              ldir                   ;Generate table

              ld hl,intRoutHere      ;Routine for IM 2
              ld de,intRoutStart     ;Put routine here
              ld bc,intRoutLen       ;Length of the routine
              ldir                   ;Copy the routine
              
              ld a,intVecHalfAd      ;Use this as high address part
              ld i,a                 ;Set high address part
              im 2                   ;Switch to IM 2

              ei                     ;Now interrupts are permitted again

loop:         jp loop                ;Endless loop

intRoutHere:  equ $                  ;Code is now here

              org intRoutStart

intRoutIM2:   push hl                ;Save registers that are modified
              push af

              ld hl,(counterIM2)     ;Nr. of interrupts counter
              inc hl                 ;Increase by one
              ld (counterIM2),hl     ;And save

              in a,(099h)            ;Read S#0
              and a                  ;Does INT originate from VDP (b7=1 - True)
              jp p,notFromVDP        ;No = Return

              ld a,l                 ;Lower counter part
              out (098h),a           ;Put it on the screen

notFromVDP:   pop af                 ;Restore modified registers
              pop hl
              ei                     ;Interrupts are permitted again
              reti                   ;Return to main program

counterIM2:   defw 1                 ;Nr. of interrupts counter

intRoutLen:   equ $-intRoutIM2       ;Length of routine code

              end                    ;im2.gen
```

## Source

https://map.grauw.nl/articles/interrupts.php
