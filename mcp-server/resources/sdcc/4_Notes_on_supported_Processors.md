# SDCC Compiler User Guide

## Notes on supported Processors

### MCS51 variants range none pageformat default MCS51 variants

MCS51 processors are available from many vendors and come in many different flavours. While they might differ considerably in respect to Special Function Registers the core MCS51 is usually not modified or is kept compatible.

#### pdata access by SFR

With the upcome of devices with internal xdata and flash memory devices using port P2 range none pageformat default P2 (mcs51 sfr) as dedicated I/O port is becoming more popular. Switching the high byte for __pdata range none pageformat default pdata (mcs51, ds390 named address space) access which was formerly done by port P2 is then achieved by a Special Function Register range none pageformat default sfr. In well-established MCS51 tradition the address of this *sfr* is where the chip designers decided to put it. Needless to say that they didn't agree on a common name either. So that the startup code can correctly initialize xdata variables, you should define an sfr with the name _XPAGE range none pageformat default XPAGE (mcs51) at the appropriate location if the default, port P2, is not used for this. Some examples are:
```c
__sfr __at (0x85) _XPAGE; /* Ramtron VRS51 family a.k.a. MPAGE */

__sfr __at (0x92) _XPAGE; /* Cypress EZ-USB family, Texas Instruments (Chipcon) a.k.a. MPAGE */

__sfr __at (0x91) _XPAGE; /* Infineon (Siemens) C500 family a.k.a. XPAGE */

__sfr __at (0xaf) _XPAGE; /* some Silicon Labs (Cygnal) chips a.k.a. EMI0CN */

__sfr __at (0xaa) _XPAGE; /* some Silicon Labs (Cygnal) chips a.k.a. EMI0CN */
```
There are also devices without anything resembling _XPAGE, but luckily they usually have dual data-pointers. For these devices a different method can be used to correctly initialize xdata variables. A default implementation is already in crtxinit.asm but it needs to be assembled manually with DUAL_DPTR set to 1.

For more exotic implementations further customizations may be needed. See section MCS51/DS390 Startup Code for other possibilities.

#### Other Features available by SFR

Some MCS51 variants offer features like Dual DPTR range none pageformat default DPTR, multiple DPTR, decrementing DPTR, 16x16 Multiply. These are currently not used for the MCS51 port. If you absolutely need them you can fall back to inline assembly or submit a patch to SDCC.

#### Bankswitching

Bankswitching range none pageformat default Bankswitching (a.k.a. code banking range none pageformat default code banking) is a technique to increase the code space above the 64k limit of the 8051.

##### Hardware

| 8000-FFFF | bank1 | bank2 | bank3 |
| --- | --- | --- | --- |
| 0000-7FFF | common | | |
| SiLabs C8051F120 example | | | |
| SiLabs C8051F120 example | | | |

Usually the hardware uses some sfr (an output port or an internal sfr) to select a bank and put it in the banked area of the memory map. The selected bank usually becomes active immediately upon assignment to this sfr and when running inside a bank it will switch out this code it is currently running. Therefor you cannot jump or call directly from one bank to another and need to use a so-called trampoline in the common area. For SDCC an example trampoline is in crtbank.asm and you may need to change it to your 8051 derivative or schematic. The presented code is written for the C8051F120.

When calling a banked function SDCC will put the LSB of the functions address in register R0, the MSB in R1 and the bank in R2 and then call this trampoline *__sdcc_banked_call*. The current selected bank is saved on the stack, the new bank is selected and an indirect jump is made. When the banked function returns it jumps to *__sdcc_banked_ret* which restores the previous bank and returns to the caller.

##### Software

When writing banked software using SDCC you need to use some special keywords and options. You also need to take over a bit of work from the linker.

To create a function that can be called from another bank it requires the keyword *__banked* range none pageformat default banked. The caller must see this in the prototype of the callee and the callee needs it for a proper return. Called functions within the same bank as the caller do not need the *__banked* keyword nor do functions in the common area. Beware: SDCC does not know or check if functions are in the same bank. This is your responsibility!

Normally all functions you write end up in the segment CSEG. If you want a function explicitly to reside in the common area put it in segment HOME. This applies for instance to interrupt service routines as they should not be banked.

Functions that need to be in a switched bank must be put in a named segment. The name can be mostly anything up to eight characters (e.g. BANK1). To do this you either use --codeseg BANK1 (See Other Options) on the command line when compiling or #pragma codeseg BANK1 (See Pragmas) at the top of the C source file. The segment name always applies to the whole source file and generated object so functions for different banks need to be defined in different source files.

When linking your objects you need to tell the linker where to put your segments. To do this you use the following command line option to SDCC:-Wl-b BANK1=0x18000 (See Linker Options). This sets the virtual start address of this segment. It sets the banknumber to 0x01 and maps the bank to 0x8000 and up. The linker will not check for overflows, again this is your responsibility.

#### MCS51/DS390 Startup Code

The compiler triggers the linker to link certain initialization modules from the runtime library range none pageformat default Runtime library called crt<something>. Only the necessary ones are linked, for instance crtxstack.asm (GSINIT1, GSINIT5) is not linked unless the - -xstack option is used. These modules are highly entangled by the use of special segments/areas, but a common layout is shown below:

**(main.asm)**
```asm
.area HOME (CODE)
  __interrupt_vect:
    ljmp __sdcc_gsinit_startup
```
**(crtstart.asm)**
```asm
.area GSINIT0 (CODE)
  __sdcc_gsinit_startup::
    mov sp,#__start__stack - 1
```
**(crtxstack.asm)**
```asm
.area GSINIT1 (CODE)
__sdcc_init_xstack::
  ; Need to initialize in GSINIT1 in case the user's __sdcc_external_startup uses the xstack.
  mov __XPAGE,#(__start__xstack >> 8)
  mov _spx,#__start__xstack
```

**(crtstart.asm)**
```asm
.area GSINIT2 (CODE)
  lcall ___sdcc_external_startup
  mov a,dpl
  jz __sdcc_init_data
  ljmp __sdcc_program_startup
__sdcc_init_data:
```

**(crtxinit.asm)**
```asm
.area GSINIT3 (CODE)
  __mcs51_genXINIT::
    mov r1,#l_XINIT
    mov a,r1
    orl a,#(l_XINIT >> 8)
    jz 00003$
    mov r2,#((l_XINIT+255) >> 8)
    mov dptr,#s_XINIT
    mov r0,#s_XISEG
    mov __XPAGE,#(s_XISEG >> 8)
  00001$: clr a
    movc a,@a+dptr
    movx @r0,a
    inc dptr
    inc r0
    cjne r0,#0,00002$
    inc __XPAGE
  00002$: djnz r1,00001$
    djnz r2,00001$
    mov __XPAGE,#0xFF
  00003$:
```

**(crtclear.asm)**
```asm
.area GSINIT4 (CODE)
  __mcs51_genRAMCLEAR::
    clr a
    mov r0,#(l_IRAM-1)
  00004$: mov @r0,a
    djnz r0,00004$
    ; _mcs51_genRAMCLEAR() end
```

**(crtxclear.asm)**

```asm
.area GSINIT4 (CODE)
  __mcs51_genXRAMCLEAR::
    mov r0,#l_PSEG
    mov a,r0
    orl a,#(l_PSEG >> 8)
    jz 00006$
    mov r1,#s_PSEG
    mov __XPAGE,#(s_PSEG >> 8)
    clr a
  00005$: movx @r1,a
    inc r1
    djnz r0,00005$
  00006$:
    mov r0,#l_XSEG
    mov a,r0
    orl a,#(l_XSEG >> 8)
    jz 00008$
    mov r1,#((l_XSEG + 255) >> 8)
    mov dptr,#s_XSEG
    clr a
  00007$: movx @dptr,a
    inc dptr
    djnz r0,00007$
    djnz r1,00007$
  00008$:
```

**(crtxstack.asm)**
```asm
.area GSINIT5 (CODE)
; Need to initialize in GSINIT5 because __mcs51_genXINIT modifies __XPAGE
; and __mcs51_genRAMCLEAR modifies _spx.
mov __XPAGE,#(__start__xstack >> 8)
mov _spx,#__start__xstack
```

**(application modules)**
```asm
.area GSINIT (CODE)
```

**(main.asm)**
```asm
.area GSFINAL (CODE)
    ljmp __sdcc_program_startup
    ;--------------------------------------------------------
    ; Home
    ;--------------------------------------------------------
.area HOME (CODE)
.area CSEG (CODE)
  __sdcc_program_startup:
    lcall _main
    ; return from main will lock up
    sjmp.
```

On some mcs51 variants __xdata range none pageformat default xdata (mcs51, ds390 named address space memory has to be explicitly enabled before it can be accessed or if the watchdog range none pageformat default watchdog needs to be disabled, this is the place to do it. The startup code clears all internal data memory, 256 bytes by default, but from 0 to n-1 if *--iram-size range none pageformat default --iram-size <Value>* is used. (recommended for Chipcon CC1010).

See also the compiler option *--no-xinit*- *opt* range none pageformat default --no-xinit-opt and section MCS51 variants about MCS51-variants.

While these initialization modules are meant as generic startup code there might be the need for customization. Let's assume the return value of *__sdcc_external_startup()* in *crtstart.asm* should not be checked (or *__sdcc_external_startup()* should not be called at all). The recommended way would be to copy *crtstart.asm* (f.e. from http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/device/lib/mcs51/crtstart.asm) into the source directory, adapt it there, then assemble it with *sdas8051 -plosgff "-plosgff" are the assembler options used in http://sdcc.svn.sourceforge.net/viewvc/sdcc/trunk/sdcc/device/lib/mcs51/Makefile.in?view=markup crtstart.asm* and when linking your project explicitly specify *crtstart.rel*. As a bonus a listing of the relocated object file *crtstart.rst* is generated.

#### Interfacing with Assembler Code range none pageformat default Assembler routines

##### Global Registers used for Parameter Passing range none pageformat default Parameter passing

The compiler always uses the global registers *DPL, DPH range none pageformat default DPTR, DPH, DPL range none pageformat default DPTR, B range none pageformat default B (mcs51, ds390 register)* and *ACC range none pageformat default ACC (mcs51, ds390 register)* to pass the first (non-bit, non-struct) parameter to a function, and also to pass the return value range none pageformat default return value of function; according to the following scheme: one byte return value in *DPL*, two byte value in *DPL* (LSB) and *DPH* (MSB). three byte values (generic pointers) in *DPH*, *DPL* and *B*, and four byte values in *DPH*, *DPL*, *B* and *ACC*. Generic pointers range none pageformat default generic pointer contain type of accessed memory in *B*: **0x00** --xdata/far, **0x40** --idata/near --, **0x60** --pdata, **0x80** -- code This might not be the case of certain memory models (medium???).

Further such parameters (and all struct parameters, as well as the bit parameters from the 9th onwards) are either allocated on the stack (for reentrant routines or if --stack-auto is used) or in data/xdata memory (depending on the memory model).

The first 8 bit parameters are passed in a virtual register called 'bits' in bit-addressable space for reentrant functions or allocated directly in bit memory otherwise.

Functions (with two or more parameters or bit parameters) that are called through function pointers range none pageformat default function pointers must therefor be reentrant so the compiler knows how to pass the parameters.

##### Register usage

Unless the called function is declared as _naked range none pageformat default naked, or the --callee-saves range none pageformat default --callee-saves /--all-callee-saves command line option or the corresponding callee_saves pragma are used, the caller will save the registers (*R0-R7*) around the call, so the called function can destroy they content freely.

If the called function is not declared as _naked, the caller will swap register banks around the call, if caller and callee use different register banks (having them defined by the __using modifier).

The called function can also use *DPL*, *DPH*, *B* and *ACC* observing that they are used for parameter/return value passing.

##### Assembler Routine (non-reentrant)

In the following example range none pageformat default reentrant range none pageformat default Assembler routines (non-reentrant) the function c_func calls an assembler routine asm_func, which takes two parameters range none pageformat default function parameter.
```c
extern int asm_func(unsigned char, unsigned char);

int c_func (unsigned char i, unsigned char j)
{
  return asm_func(i,j);
}

int main()
{
  return c_func(10,9);
}
```
The corresponding assembler function is:
```asm
.globl _asm_func_PARM_2
.globl _asm_func
.area OSEG
  _asm_func_PARM_2:
    .ds 1
.area CSEG
  _asm_func:
    mov a,dpl
    add a,_asm_func_PARM_2
    mov dpl,a
    mov dph range none pageformat default DPTR, DPH, DPL,#0x00
    ret
```
The parameter naming convention is _<function_name>_PARM_<n>, where n is the parameter number starting from 1, and counting from the left. The first parameter is passed in *DPH*, *DPL*, *B* and *ACC* according to the description above. The variable name for the second parameter will be _<function_name>_PARM_2.

Assemble the assembler routine with the following command:

**sdas8051 -losg asmfunc.asm

** Then compile and link the assembler routine to the C source file with the following command:

**sdcc cfunc.c asmfunc.rel

##### Assembler Routine (reentrant)

In this case range none pageformat default reentrant range none pageformat default Assembler routines (reentrant) the second parameter range none pageformat default function parameter onwards will be passed on the stack, the parameters are pushed from right to left i.e. before the call the second leftmost parameter will be on the top of the stack (the leftmost parameter is passed in registers). Here is an example:
```c
extern int asm_func(unsigned char, unsigned char, unsigned char) reentrant;

int c_func (unsigned char i, unsigned char j, unsigned char k) reentrant
{
  return asm_func(i,j,k);
}

int main()
{
  return c_func(10,9,8);
}
```

The corresponding (unoptimized) assembler routine is:
```asm
.globl _asm_func
  _asm_func:
    push _bp
    mov _bp,sp;stack contains: _bp, return address, second parameter, third parameter
    mov r2,dpl
    mov a,_bp
    add a,#0xfd;calculate pointer to the second parameter
    mov r0,a
    mov a,_bp
    add a,#0xfc;calculate pointer to the rightmost parameter
    mov r1,a
    mov a,@r0
    add a,@r1
    add a,r2;calculate the result (= sum of all three parameters)
    mov dpl,a;return value goes into dptr (cast into int)
    mov dph,#0x00
    mov sp,_bp
    pop _bp
    ret
```
The compiling and linking procedure remains the same, however note the extra entry & exit linkage required for the assembler code, _bp is the stack frame pointer and is used to compute the offset into the stack for parameters and local variables.

### DS400 port

The DS80C400 range none pageformat default DS80C400 range none pageformat default DS400 microcontroller has a rich set of peripherals. In its built-in ROM library it includes functions to access some of the features, among them is a TCP stack with IP4 and IP6 support. Library headers (currently in beta status) and other files are provided at ftp://ftp.dalsemi.com/pub/tini/ds80c400/c_libraries/sdcc/index.html.

### The Z80, Z180, Rabbit 2000, Rabbit 2000A, Rabbit 3000A, SM83 (GameBoy), eZ80, TLCS-90 and R800 ports

SDCC can target the Z80 range none pageformat default Z80, Z180, eZ80 in Z80 mode, Rabbit 2000, Rabbit 2000A, Rabbit 3000A and LR35902, the Sharp SM83 (used.e.g in the Nintendo GameBoy) sm83 range none pageformat default sm83 (GameBoy Z80).

When a frame pointer is used, it resides in IX. Register A, B, C, D, E, H, L and IY are used as a temporary registers for holding variables.

When enabling optimizations using --opt-code size and a sufficiently high value for --max-allocs-per-node SDCC typically generates much better code for these architectures than many other compilers. A comparison of compilers for these architecture can be found at http://sdcc.sourceforge.net/wiki/index.php/Z80_code_size.

#### Startup Code

On the Z80 range none pageformat default Z80 the startup code is inserted by linking with crt0.rel which is generated from sdcc/device/lib/z80/crt0.s. If you need a different startup code you can use the compiler option *- -no-std-crt0* range none pageformat default --no-std-crt0 and provide your own crt0.rel. When using a custom crt0.rel it needs to be listed first when linking.

#### Rabbit ports

SDCC has three Rabbit-supporting ports: r2k for the Rabbit 2000, r2ka for the Rabbit 2000A, 2000B, 2000C and 3000, r3ka for the Rabbit 3000A, 4000 and 6000. Some Rabbits support different memory types (Rabbit 4000 and later), different memory access modes (Rabbit 5000 and later), different instruction modes (Rabbit 4000 and later). All SDCC ports assume 8-bit memories, 8-bit memory access mode, 00/default instruction set mode (the code generated is also compatible with 10 and 01 instruction set mode, but not 11/enhanced instruction set mode).

##### Port choice

| Ports vs. Device | R2K | R2KA | R2KB | R2KC | R3K | R3KA | R4K | R5K | R6K |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| r2k | Y | y | y | y | y | y | y | N | N |
| r2ka | n | Y | Y | Y | y | y | y | N | N |
| r3ka | N | N | N | N | N | Y | Y | N | N |
| r3ka | N | N | N | N | N | Y | Y | N | N |

Legend:

Y - The code this port generates is the best for this CPU.

y - The code this port generates will work on this CPU.

N - The code this port generates will not work on this CPU.

n - The code this port generates will typically not work on this CPU.

There are multiple wait state bugs present in some of the the Rabbits. The difference between the r2k and r2ka port is additional wait state bug workarounds. If all memory used has zero wait states, code from the r2ka backend can be safely run on the original Rabbit 2000.

The r2k and r2ka port assume that the whole stack has the same number of wait states (code from the r2k and r2ka ports can fail is the stack spans memories with a different amount of wait states).

The Rabbit 2000 has some wait state bugs that SDCC does not work around. These bugs result in the number of wait states used being one less than configured for some instructions. The workaround has to be supplied by the user, by configuring all memories that do use wait states to use on additional wait state.

For all Rabbit ports, SDCC assumes that all data memory is at least as fast (i.e. does not need more wait states) as all code memory. Code where this is not the case (e.g. code in fast Flash writing into slow battery-backed SRAM) will have to be written in assembler by hand.

##### Rabbit hardware bugs

| Bug | R2K | R2KA | R2KB | R2KC | R3K | R3KA | R4K | R5K | R6K |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ioi / ioe prefix bug | x | | | | | | | | |
| ddcb / fdcb wait state bug | U | | | | | | | | |
| conditional jump wait state bug | U | | | | | | | | |
| ldir / lddr wait state bug | U | | | | | | | | |
| mul wait state bug | w | | | | | | | | |
| ldir / lddr split bug | | S | | | | | | | |
| new ldir / lddr wait state bug | w | w | w | w | w | | | | |
| 16-bit mode alignment bug | | | | | | | | X | |
| ioi / ioe bit bug | | | | | | | | x | x |
| ret cc bug | | | | | | | | X | X |
| rmw wait state bug | W | W | W | W | W | W | W | W | |
| 16-bit vs. 8-bit wait state bug | | | | | | | W | | |
| dma vs stack prot. bug | | | | | | | X | | |
| 16-bit dma vs. ldir / lddr / etc. bug | | | | | | | X | | |
| cplx bug | | | | | | | | | x |
| dma match bug | | | | | | | | | X |
| ex jkhl, bcde alt reg bug | | | | | | | | | x |
| ldbyte bug | | | | | | | | | x |
| puma bug | | | | | | | | | x |
| puma bug | | | | | | | | | x |

Legend:

x s w u - bug present, worked around by SDCC.

X S W U - bug present, not worked around by SDCC.

w W u U - wait state bug, only relevant when the Rabbit is configured to have wait states for some memory.

s S - instruction / data split bug, only relevant when instruction / data split is enabled, which is currently not supported by SDCC.

u U - bug can be worked around by the user by configuring memory that needs wait states to use one additional wait state.

The 16-bit mode alignment bug only affects 16-bit mode, which is not currently supported by SDCC.

The rmw wait state bug is only relevant when executing fast code writing to slow memory, such as code in fast RAM writing to slow battery-backed SRAM.

The 16-bit vs. 8-bit wait state bug is only relevant when the target system uses both 16-bit and 8-bit memories for code, and the 8-bit memory requires wait states.

The 16-bit dma vs. ldir / lddr / etc. bug is only relevant when using DMA and the target system uses 16-bit memory for code. Since SDCC uses the block move instructions like ldir, lddr, etc. without applying a workaround, this means that code execution and DMA may then not happen at the same time. A possible user workaround is to not use DMA when using 16-bit memory for code. Among all Rabbit 4000-based RCM and BL modules, only the RCM4000 and the RCM4010 use 16-bit memories.

The dma match bug is only relevant when a DMA termination mask register is set to a nonzero value.

#### Z80, Z180, Z80N and R800 calling conventions

The current default is the SDCC calling convention, version 1. Using the command-line option --sdcccall 0, the default can be changed to version 0. There are three other calling conventions supported, which can be specified using the keywords __smallc, __z88dk_fastcall and __z88dk_callee. They are primarily intended for compatibility with libraries written for other compilers. For __z88dk_fastcall, there may be only one parameter of at most 32 bits, which is passed the same way as the return value of __sdcccall(0). For __z88dk_callee, the stack is not adjusted for stack parameters the parameters after the call (thus the callee has to do this instead). __z88dk_callee can be combined with __smallc, __sdcccall(0) or __sdcccall(1).

##### Z80 SDCC calling convention, version 1

This calling convention can be chosen per function via __sdcccall(1). 8-bit return values are passed in a, 16-bit values in de, 24-bit values in lde, 32-bit values in hlde. Larger return values (as well as struct and union independent of their size) are passed in memory in a location specified by the caller through a hidden pointer argument.

For functions that have variable arguments: All parameters are passed on the stack. The stack is not adjusted for the parameters by the callee (thus the caller has to do this instead).

![z80-arguments.svg](z80-arguments.svg)

For Functions that do not have variable arguments: the first parameter is passed in a if it has 8 bits. If it has 16 bits it is passed in hl. If it has 32 bits, it is passed in hlde. If the first parameter is in a, and the second has 8 bits, it is passed in l; if the first is passed in a or hl, and the second has 16 bits, it is passed in de; all other parameters are passed on the stack, right-to-left. Independent of their size, struct / union parameters and all following parameters are always passed on the stack.

![z80-stack-cleanup.svg](z80-stack-cleanup.svg)

If __z88dk_callee is not used, after the call, the stack parameters are cleaned up by the caller, with the following exceptions: functions that do not have variable arguments and return void or a type of at most 16 bits, or have both a first parameter of type float and a return value of type float.

##### Z80 SDCC calling convention, version 0

This calling convention can be chosen per function via __sdcccall(0). All parameters are passed on the stack, right-to-left. 8-bit return values are passed in l, 16-bit values in hl, 24-bit values in ehl, 32-bit values in dehl. Except for the SM83, where 8-bit values are passed in e, 16-bit values in de, 32-bit values in hlde. Larger return values (as well as struct and union independent of their size) are passed in a memory in a location specified by the caller through a hidden pointer argument. Unless __z88dk_callee is used, all stack parameters are cleaned up by the caller.

#### Rabbit 2000, Rabbit 2000A, Rabbit 3000A, eZ80 and TLCS-90 calling conventions

The current default is the Rabbit calling convetion desribed here, version 1. Using the command-line option --sdcccall 8, the default can be changed to version 0 of the Z80 calling convention, described above. There are four other calling conventions supported, which can be specified using the keywords __smallc, __z88dk_fastcall and __z88dk_callee. They are primarily intended for compatibility with libraries written for other compilers. For __z88dk_fastcall, there may be only one parameter of at most 32 bits, which is passed the same way as the return value. For __z88dk_callee, the stack is not adjusted for stack parameters the parameters after the call (thus the callee has to do this instead). __z88dk_callee can be combined with __smallc, __sdcccall(0) or __sdcccall(1).

##### Rabbit SDCC calling convention, version 1

This calling convention can be chosen per function via __sdcccall(1). 8-bit return values are passed in a, 16-bit values in hl, 24-bit values in lde, 32-bit values in hlde. Larger return values (as well as struct and union independent of their size) are passed in memory in a location specified by the caller through a hidden pointer argument.

For functions that have variable arguments: All parameters are passed on the stack. The stack is not adjusted for the parameters by the callee (thus the caller has to do this instead).

![r3ka-arguments.svg](r3ka-arguments.svg)

For Functions that do not have variable arguments: the first parameter is passed in a if it has 8 bits. If it has 16 bits it is passed in hl. If it has 32 bits, it is passed in hlde. If the first parameter is in a, and the second has 8 bits, it is passed in l; if the first is in hl or hlde, and the second has 8 bits, it is passed in a; if the first is in a, and the second has 16 bits, it is passed in hl; all other parameters are passed on the stack, right-to-left. Independent of their size, struct / union parameters and all following parameters are always passed on the stack.

![z80-stack-cleanup.svg](z80-stack-cleanup.svg)

If __z88dk_callee is not used, after the call, the stack parameters are cleaned up by the caller, with the following exceptions: functions that do not have variable arguments and return void or a type of at most 16 bits, or have both a first parameter of type float and a return value of type float.

#### SM83 calling conventions

The current default is the SDCC calling convention, version 1. Using the command-line option --sdcccall 0, the default can be changed to version 0.

##### SM83 SDCC calling convention, version 1

This calling convention can be chosen per function via __sdcccall(1).

8-bit return values are passed in a, 16-bit values in bc, 32-bit values in debc. Larger return values (as well as struct and union independent of their size) are passed in memory in a location specified by the caller through a hidden pointer argument.

For functions that have variable arguments: All parameters are passed on the stack. The stack is not adjusted for the parameters by the callee (thus the caller has to do this instead).

![sm83-arguments.svg](sm83-arguments.svg)

For Functions that do not have variable arguments: the first parameter is passed in a if it has 8 bits. If it has 16 bits it is passed in de. If it has 32 bits, it is passed in debc. If the first parameter is in a, and the second has 8 bits, it is passed in e; if the first is in bc or debc, and the second has 8 bits, it is passed in a; if the first is passed in a, and the second has 16 bits, it is passed in bc; if the first is passed in de, and the second has 16 bits, it is passed in bc; all other parameters are passed on the stack, right-to-left. Independent of their size, struct / union parameters and all following parameters are always passed on the stack. The stack is adjusted by the callee (thus explicitly specifying __z88dk_callee does not make a difference), unless the functionhas variable arguments.

##### SM83 SDCC calling convention, version 0

This calling convention can be chosen per function via __sdcccall(0). 8-bit return values are passed in e, 16-bit values in de, 32-bit values in hlde. Larger return values (as well as struct and union independent of their size) are passed in memory in a location specified by the caller through a hidden pointer argument. All parameters are passed on the stack. The stack is not adjusted for the parameters by the callee (thus the caller has to do this instead), unless __z88dk_callee is specified. __sdcccall(0) can be combined with __z88dk_callee.

#### Small-C calling convention

Functions declared as __smallc are called using the Small-C calling convention (passing arguments on-stack left-to-right, 1 byte arguments are passed as 2 bytes, with the value in the lower byte). 8-bit return values are passed in a, 16-bit values in de, 32-bit values in hlde. Larger return values (as well as struct and union independent of their size) are passed in memory in a location specified by the caller through a hidden pointer argument. This way assembler routines originally written for Small-C or code generated by Small-C can be called from SDCC. Currently variable arguments are not yet supported (neither on the caller nor on the callee side).

#### Complex instructions

The Z80 and some derivatives support complex instructions, such as ldir, cpir,.... SDCC only emits these instructions for functions in the standard library. Thus, e.g. copying one array into another is more efficient when using memcpy() than by using a a user-written loop.

Depending on the target, code generation options and the parameters to the call, SDCC emits ldir for memcpy(), ldir or lsidr for memset(), ldi for strcpy(), ldi for strncpy(). Other library functions use the complex instructions as well, but for those, function calls are generated.

#### Unsafe reads

Usually, Z80-based systems (except for the SM83 and TLCS-90) have separate I/O and memory spaces, and any normal memory location can be read without side-effects. For such systems, the option --allow-unsafe-reads can be used to enable some extra optimizations that rely on this.

#### Z80 banked calls

Banked calls are supported via __banked. Banked calls are done via a trampoline (__sdcc_bcall if --legacy-banking is specified, __sdcc_bcall_abc for z88dk_fastcall, __sdcc_bcall_ehl for other calls). Default trampolines are provided in the library. The default trampolines calls user supplied helper functions set_bank and get_bank that set the current bank to the value in register a, or return the current bank in register a.

For banked functions, the calling convention is slightly different: the stack is always cleared up by the caller. Unless __z88dk_fastcall is used, all parameters are passed on the stack.

### The HC08 and S08 ports

The port to the Freescale/Motorola HC08 range none pageformat default HC08 and S08 does not yet generate code as compact as that generated by some non-free compilers. A comparison of compilers for these architecture can be found at http://sdcc.sourceforge.net/wiki/index.php/Hc08_code_size.

#### Startup Code

The HC08 range none pageformat default HC08 startup code follows the same scheme as the MCS51 startup code.

### The STM8 port

#### Calling conventions

By default, the SDCC calling convention, version 1 is used. Using the option --sdcccall 0, the default can be changed to version 0.

Arguments are passed on the stack right-to-left. Return values are in a (8 bit), x (16 bit), xyl (24 bit), xy (32 bit) or use a hidden extra pointer parameter pointing to the location (anything wider than 32 bit, and all struct / union).

##### SDCC calling convention, version 1

![stm8-arguments.svg](stm8-arguments.svg)

For functions that have variable arguments, all parameters are passed on the stack. For other functions, if the first parameter has 8 or 16 bits, it is passed in a or x. If the first parameter is passed in a, and the second has 16 bits, the second is passed in x. If the first parameter is passed in x, and the second has 8 bits, the second is passed in a. All other parameters are passed on the stack. Independent of their size, struct / union parameters and all following parameters are always passed on the stack. If __z88dk_callee is specified, the stack is always adjusted by the callee. Otherwise, for the large memory model, the stack is always adjusted by the caller. For the medium memory model the stack is adjusted by the caller, with the following exceptions: functions that do not have variable arguments and return void or a type of at most 16 bits, or have both a first parameter of type float and a return value of type float.

##### SDCC calling convention, version 0

This calling convention can be chosen per function via __sdcccall(0) (e.g. for compatibility with functions written in assembler for use with older versions of SDCC). All parameters are passed on the stack. The stack is not adjusted for the parameters by the callee (thus the caller has to do this instead), unless __z88dk_callee is specified.

##### Raisonance calling convention

For compatibility with the Raisonance STM8 compiler, the __raisonance calling convention is supported. If the first parameter is 8 or 16 bits, it is passed in a or x. If the first parameter is 8 bits, and the second 16 bits, the second is passed in x. If the first parameter is 16 bits, and the second is 8 bits, the second is passed in a. All other parameters are passed on the stack. If the return value is 8 bits, it is passed in a. If it is 16 bits, it is passed in x. Raisonance passes larger return values in pseudoregisters, which is not supported by SDCC.

##### IAR calling convention

For compatibility with the IAR STM8 compiler, the __iar calling convention is supported. The first 8-bit parameter is passed in a, the first 16-bit parameter in x, the second 16-bit parameter in y. Further parameters of up to 32 bits are passed in pseudoregisters, which is not supported by SDCC. All other parameters are passed on the stack. If the return value is 8 bits, it is passed in a. If it is 16 bits, it is passed in x. IAR passes larger return values in pseudoregisters, which is not supported by SDCC.

##### Cosmic calling convention

For compatibility with the Cosmic STM8 compiler, the __cosmic calling convention is supported. If the first parameter is 8 or 16 bits, it is passed in a or x. If the return value is 8 bits, it is passed in a. If it is 16 bits, it is passed in x. Cosmic passes larger return values in pseudoregisters, which is not supported by SDCC. Even for the medium memory model, __cosmic functions use a 24-bit return address in their stack frame, and are called using callf.

### The f8 port

#### Calling convention

If the the function does not have variable arguments, and the first argument is not a struct or union and has 8 or 16 bits, it is passed in xl (8 bits) or y (16 bits). All other arguments are passed on the stack right-to-left. Return values are in xl (8 bit), x (16 bit), xxl (24 bit), yx (32 bit) or use a hidden extra pointer parameter pointing to the location (anything wider than 32 bit, and all struct / union). The stack is not adjusted for the parameters by the callee (thus the caller has to do this instead).

### The MOS6502 and WDC65C02 ports

The mos6502 range none pageformat default MOS6502 port can target the original MOS Technology NMOS 6502, and the CMOS Rockwell/WDC 65C02 with enhanched instruction set.

#### Startup Code

On the MOS6502 range none pageformat default MOS6502 the startup code is inserted by linking with crt0.rel which is generated from sdcc/device/lib/mos6502/crt0.s. If you need a different startup code you can use the compiler option *- -no-std-crt0* range none pageformat default --no-std-crt0 and provide your own crt0.rel. When using a custom crt0.rel it needs to be listed first when linking.

#### Hooking up interrupts

ISR can be written in C using SDCC. However, to hook interrupts is necessary to customize crt0.asm and have the interrupt vectors point to the C functions.

#### Reentrancy

Due to the very limited stack space, the MOS6502 port by default generates non-reentrant code. Re-entrant functions should be declared using the __reentrant keyword. Alternatively the entire program can be compiled using --stack-auto. On the MOS6502 re-entrant code is, in general, much less efficient.

#### Code and Data placement

The compiler can pass segment location to the linker. On the MOS6502 the following switches are supported:

--code-loc: start address of the code segment

--data-loc: start address of the zero page

--xram-loc: start address of the data segment

### The PIC14 range none pageformat default PIC14 port

The PIC14 port adds support for Microchip range none pageformat default Microchip $^{\text{TM}}$ PIC range none pageformat default PIC14 $^{\text{TM}}$ MCUs with 14 bit wide instructions. This port is not yet mature and still lacks many features. However, it can work for simple code.

Currently supported devices include:

10F320, 10F322, 10LF320, 10LF322

12F609, 12F615, 12F617, 12F629, 12F635, 12F675, 12F683

12F752

12HV752

16C62, 16C63A, 16C65B

16C71, 16C72, 16C73B, 16C74B

16C432, 16C433

16C554, 16C557, 16C558

16C620, 16C620A, 16C621, 16C621A, 16C622, 16C622A

16C710, 16C711, 16C715, 16C717, 16C745, 16C765, 16C770, 16C771, 16C773, 16C774, 16C781, 16C782

16C925, 16C926

16CR73, 16CR74, 16CR76, 16CR77

16CR620A

16F72,16F73, 16F74, 16F76, 16F77

16F84, 16F84A, 16F87, 16F88

16F610, 16F616, 16F627, 16F627A, 16F628, 16F628A, 16F630, 16F631, 16F636, 16F639, 16F648A

16F676, 16F677, 16F684, 16F685, 16F687, 16F688, 16F689, 16F690

16F707, 16F716, 16F720, 16F721, 16F722, 16F722A, 16F723, 16F723A, 16F724, 16F726, 16F727

16F737, 16F747, 16F753, 16F767, 16F777, 16F785

16F818, 16F819, 16F870, 16F871, 16F872, 16F873, 16F873A, 16F874, 16F874A, 16F876, 16F876A

16F877, 16F877A, 16F882, 16F883, 16F884, 16F886, 16F887

16F913, 16F914, 16F916, 16F917, 16F946

16LF74, 16LF76, 16LF77

16LF84, 16LF84A, 16LF87, 16LF88

16LF627, 16LF627A, 16LF628, 16LF628A, 16LF648A

16LF707, 16LF720, 16LF721, 16LF722, 16LF722A, 16LF723, 16LF723A, 16LF724, 16LF726, 16LF727

16LF747, 16LF767, 16LF777

16LF818, 16LF819, 16LF870, 16LF871, 16LF872, 16LF873, 16LF873A, 16LF874, 16LF874A

16LF876, 16LF876A, 16LF877, 16LF877A

16HV610, 16HV616, 16HV753, 16HV785

Supported devices with enhanced cores:

12F1501, 12F1571, 12F1572, 12F1612, 12F1822, 12F1840

12LF1501, 12LF1552, 12LF1571, 12LF1572, 12LF1612, 12LF1822, 12LF1840, 12LF1840T39A, 12LF1840T48A

16F1454, 16F1455, 16F1458, 16F1459

16F1503, 16F1507, 16F1508, 16F1509, 16F1512, 16F1513, 16F1516, 16F1517, 16F1518, 16F1519

16F1526, 16F1527, 16F1574, 16F1575, 16F1578, 16F1579

16F1613, 16F1614, 16F1615, 16F1618, 16F1619

16F1703, 16F1704, 16F1705, 16F1707, 16F1708, 16F1709, 16F1713, 16F1716, 16F1717, 16F1718, 16F1719

16F1764, 16F1765, 16F1768, 16F1769, 16F1773, 16F1776, 16F1777, 16F1778, 16F1779

16F1782, 16F1783, 16F1784, 16F1786, 16F1787, 16F1788, 16F1789

16F1823, 16F1824, 16F1825, 16F1826, 16F1827, 16F1828, 16F1829, 16F1829LIN, 16F1847

16F1933, 16F1934, 16F1936, 16F1937, 16F1938, 16F1939, 16F1946, 16F1947

16F18313, 16F18323, 16F18324, 16F18325, 16F18344, 16F18345,

16F18855, 16F18875

16LF1454, 16LF1455, 16LF1458, 16LF1459

16LF1503, 16LF1507, 16LF1508, 16LF1509, 16LF1512, 16LF1513, 16LF1516, 16LF1517, 16LF1518, 16LF1519,

16LF1526, 16LF1527

16LF1554, 16LF1559, 16LF1566, 16LF1567, 16LF1574, 16LF1575, 16LF1578, 16LF1579

16LF1613, 16LF1614, 16LF1615, 16LF1618, 16LF1619

16LF1703, 16LF1704, 16LF1705, 16LF1707, 16LF1708, 16LF1709, 16LF1713, 16LF1716, 16LF1717, 16LF1718, 16LF1719

16LF1764, 16LF1765, 16LF1768, 16LF1769, 16LF1773, 16LF1776, 16LF1777, 16LF1778, 16LF1779

16LF1782, 16LF1783, 16LF1784, 16LF1786, 16LF1787, 16LF1788, 16LF1789,

16LF1823, 16LF1824, 16LF1824T39A

16LF1825, 16LF1826, 16LF1827, 16LF1828, 16LF1829, 16LF1847

16LF1902, 16LF1903, 16LF1904, 16LF1906, 16LF1907

16LF1933, 16LF1934, 16LF1936, 16LF1937, 16LF1938, 16LF1939, 16LF1946, 16LF1947

16LF18313, 16LF18323, 16LF18324, 16LF18325, 16LF18344, 16LF18345

16LF18855, 16LF18875

An up-to-date list of currently supported devices can be obtained via sdcc -mpic14 -phelp foo.c (foo.c must exist...).

#### PIC Code Pages range none pageformat default code page (pic14) and Memory Banks range none pageformat default Memory bank (pic14)

The linker organizes allocation for the code page and RAM banks. It does not have intimate knowledge of the code flow. It will put all the code section of a single.asm file into a single code page. In order to make use of multiple code pages, separate asm files must be used. The compiler assigns all *static* functions of a single.c file into the same code page.

To get the best results, follow these guidelines:

1. Make local functions static, as non static functions require code page selection overhead.
Due to the way SDCC handles functions, place called functions prior to calling functions in the file wherever possible: Otherwise SDCC will insert unnecessary pagesel directives around the call, believing that the called function is externally defined.
2. For devices that have multiple code pages it is more efficient to use the same number of files as pages: Use up to 4 separate.c files for the 16F877, but only 2 files for the 16F874. This way the linker can put the code for each file into different code pages and there will be less page selection overhead.
3. And as for any 8 bit micro (especially for PIC14 as they have a very simple instruction set), use `unsigned char' wherever possible instead of `int'.

#### Adding New Devices to the Port

Adding support for a new 14 bit PIC MCU requires the following steps:

1. Create a new device description.
Each device is described in two files: pic16f*.h and pic16f*.c. These files primarily define SFRs, structs to access their bits, and symbolic configuration options. Both files can be generated from gputils'.inc files using the perl script support/scripts/inc2h.pl. This file also contains further instructions on how to proceed.
2. Copy the.h file into SDCC's include path and either add the.c file to your project or copy it to device/lib/pic/libdev. Afterwards, rebuild and install the libraries.
3. Edit pic14devices.txt in SDCC's include path (device/include/pic/ in the source tree or /usr/local/share/sdcc/include/pic after installation).
You need to add a device specification here to make the memory layout (code banks, RAM, aliased memory regions,...) known to the compiler. Probably you can copy and modify an existing entry. The file format is documented at the top of the file.

#### Interrupt Code

For the interrupt function, use the keyword *__interrupt* range none pageformat default PIC14!interrupt with level number of 0 (PIC14 only has 1 interrupt so this number is only there to avoid a syntax error - it ought to be fixed). E.g.:
```c
void Intr(void) __interrupt (0)
{
  T0IF = 0; /* Clear timer interrupt */
}
```
#### Configuration Bits

Configuration bits (also known as fuses) can be configured using ` __code ' and ` __at ' modifiers. Possible options should be ANDed and can be found in your processor header file. Example for PIC16F88:
```c
#include <pic16f88.h> //Contains config addresses and options
#include <stdint.h> //Needed for uint16_t

static __code uint16_t __at (_CONFIG1) configword1 = _INTRC_IO &
  _CP_ALL & _WDT_OFF & [...];
static __code uint16_t __at (_CONFIG2) configword2 = [...];
```
Although data type is ignored if the address (__at()) refers to a config word location, using a type large enough for the configuration word (uint16_t in this case) is recommended to prevent changes in the compiler (implicit, early range check and enforcement) from breaking the definition.

If your processor header file doesn't contain config addresses you can declare it manually or use a literal address:
```c
static __code uint16_t __at (0x2007) configword1 = _INTRC_IO &
  _CP_ALL & _WDT_OFF & [...];
```
#### Linking and Assembling

For assembling you can use either GPUTILS' range none pageformat default gputils (pic tools) gpasm.exe or MPLAB's mpasmwin.exe. GPUTILS are available from http://sourceforge.net/projects/gputils. For linking you can use either GPUTILS' gplink or MPLAB's mplink.exe. If you use MPLAB and an interrupt function then the linker script file vectors section will need to be enlarged to link with mplink.

Pic device specific header and c source files are automatically generated from MPLAB include files, which are published by Microchip with a special requirement that they are only to be used with authentic Microchip devices. This reqirement prevents to publish generated header and c source files under the GPL compatible license, so they are located in non-free directory (see section Search Paths). In order to include them in include and library search paths, the **--use-non-free range none pageformat default --use-non-free** command line option should be defined.

NOTE: the compiled code, which use non-free pic device specific libraries, is not GPL compatible!

Here is a Makefile using GPUTILS:

.c.o:
sdcc -V --use-non-free -mpic14 -p16f877 -c $<

$(PRJ).hex: $(OBJS)
gplink -m -s $(PRJ).lkr -o $(PRJ).hex $(OBJS) libsdcc.lib

Here is a Makefile using MPLAB:

.c.o:
sdcc -S -V --use-non-free -mpic14 -p16f877 $<
mpasmwin /q /o $*.asm

$(PRJ).hex: $(OBJS)
mplink /v $(PRJ).lkr /m $(PRJ).map /o $(PRJ).hex $(OBJS) libsdcc.lib

Please note that indentations within a Makefile have to be done with a tabulator character.

#### Command-Line Options

Besides the switches common to all SDCC backends, the PIC14 port accepts the following options (for an updated list see sdcc --help):

--debug-xtra range none pageformat default PIC14!Options!--debug-extra emit debug info in assembly output

--no-pcode-opt range none pageformat default PIC14!Options!--no-pcode-opt disable (slightly faulty) optimization on pCode

--stack-loc range none pageformat default PIC14!Options!--stack-loc sets the lowest address of the argument passing stack (defaults to a suitably large shared databank to reduce BANKSEL overhead)

--stack-size range none pageformat default PIC14!Options!--stack-size sets the size if the argument passing stack (default: 16, minimum: 4)

--use-non-free range none pageformat default PIC14!Options!--use-non-free make non-free device headers and libraries available in the compiler's search paths (implicit -I and -L options)

--no-extended-instructions forbid use of the extended instruction set (e.g., ADDFSR)

#### Environment Variables

The PIC14 port recognizes the following environment variables:

SDCC_PIC14_SPLIT_LOCALS range none pageformat default PIC14!Environment variables!SDCC PIC14 SPLIT LOCALS range none pageformat default SDCC!Environment variables!SDCC PIC14 SPLIT LOCALS If set and not empty, sdcc will allocate each temporary register (the ones called r0xNNNN) in a section of its own. By default (if this variable is unset), sdcc tries to cluster registers in sections in order to reduce the BANKSEL overhead when accessing them.

#### The Library

The PIC14 library currently only contains support routines required by the compiler to implement multiplication, division, and floating point support. No libc-like replacement is available at the moment, though many of the common sdcc library sources (in device/lib) should also compile with the PIC14 port.

##### Enhanced cores

SDCC/PIC14 has experimental support for devices with the enhanced 14-bit cores (such as pic12f1822). Due to differences in required code, the libraries provided with SDCC (libm.lib and libsdcc.lib) are now provided in two variants: libm.lib and libsdcc.lib are compiled for the regular, non-enhanced devices. libme.lib and libsdcce.lib (note the trailing ' e ') are compiled for enhanced devices. When linking manually, make sure to select the proper variant!

When SDCC is used to invoke the linker, SDCC will automatically select the libsdcc.lib-variant suitable for the target device. However, no such magic has been conjured up for libm.lib!

##### Accessing bits of special function registers

Individual bits within SFRs can be accessed either using or using a shorthand, which is defined in the respective device header for all s. In order to avoid polluting the global namespace with the names of all the bits, you can #define NO_BIT_DEFINES before inclusion of the device header file.

##### Naming of special function registers

If NO_BIT_DEFINES is used, individual bits of the SFRs can be accessed as. With the 3.1.0 release, the previously used (note the underscore) is deprecated. This was done to align the naming conventions with the PIC16 port and competing compiler vendors. To avoid polluting the global namespace with the legacy names, you can prevent their definition using #define NO_LEGACY_NAMES prior to the inclusion of the device header.

You **must** also #define NO_BIT_DEFINES in order to access SFRs as, otherwise will expand to, yielding the undefined expression.

##### error: missing definition for symbol ``__gptrget1''

The PIC14 port uses library routines to provide more complex operations like multiplication, division/modulus and (generic) pointer dereferencing. In order to add these routines to your project, you must link with PIC14's libsdcc.lib. For single source file projects this is done automatically, more complex projects must add libsdcc.lib to the linker's arguments. Make sure you also add an include path for the library (using the -I switch to the linker)!

##### Processor mismatch in file ``XXX''.

This warning can usually be ignored due to the very good compatibility amongst 14 bit PIC range none pageformat default PIC14 devices.

You might also consider recompiling the library for your specific device by changing the ARCH=p16f877 (default target) entry in device/lib/pic/Makefile.in and device/lib/pic/Makefile to reflect your device. This might even improve performance for smaller devices as unnecessary BANKSELs might be removed.

#### Known Bugs

##### Function arguments

Functions with variable argument lists (like printf) are not yet supported. Similarly, taking the address of the first argument passed into a function does not work: It is currently passed in WREG and has no address...

##### Regression tests fail

Though the small subset of regression tests in src/regression passes, SDCC regression test suite does not, indicating that there are still major bugs in the port. However, many smaller projects have successfully used SDCC in the past...

### The PIC16 range none pageformat default PIC16 port

The PIC16 port adds support for Microchip range none pageformat default Microchip $^{\text{TM}}$ PIC range none pageformat default PIC $^{\text{TM}}$ MCUs with 16 bit wide instructions. This port is not yet mature and still lacks many features. However, it can work for simple code. Currently this family of microcontrollers contains the PIC18Fxxx and PIC18Fxxxx; devices supported by the port include:

18F13K22 18F13K50

18F14K22 18F14K50

18F23K20 18F23K22

18F24J10 18F24J11 18F24J50 18F24K20 18F24K22 18F24K50

18F25J10 18F25J11 18F25J50 18F25K20 18F25K22 18F25K50 18F25K80

18F26J11 18F26J13 18F26J50 18F26J53 18F26K20 18F26K22 18F26K80

18F27J13 18F27J53

18F43K20 18F43K22

18F44J10 18F44J11 18F44J50 18F44K20 18F44K22

18F45J10 18F45J11 18F45J50 18F45K20 18F45K22 18F45K50 18F45K80

18F46J11 18F46J13 18F46J50 18F46J53 18F46K20 18F46K22 18F46K80

18F47J13 18F47J53

18F63J11 18F63J90

18F64J11 18F64J90

18F65J10 18F65J11 18F65J15 18F65J50 18F65J90 18F65J94 18F65K22 18F65K80 18F65K90

18F66J10 18F66J11 18F66J15 18F66J16 18F66J50 18F66J55 18F66J60 18F66J65

18F66J90 18F66J93 18F66J94 18F66J99 18F66K22 18F66K80 18F66K90

18F67J10 18F67J11 18F67J50 18F67J60 18F67J90 18F67J93 18F67J94 18F67K22 18F67K90

18F83J11 18F83J90

18F84J11 18F84J90

18F85J10 18F85J11 18F85J15 18F85J50 18F85J90 18F85J94 18F85K22 18F85K90

18F86J10 18F86J11 18F86J15 18F86J16 18F86J50 18F86J55 18F86J60 18F86J65

18F86J72 18F86J90 18F86J93 18F86J94 18F86J99 18F86K22 18F86K90

18F87J10 18F87J11 18F87J50 18F87J60 18F87J72 18F87J90 18F87J93 18F87J94 18F87K22 18F87K90

18F95J94 18F96J60 18F96J65 18F96J94 18F96J99

18F97J60 18F97J94

18F242 18F248 18F252 18F258

18F442 18F448 18F452 18F458

18F1220 18F1230

18F1320 18F1330

18F2220 18F2221

18F2320 18F2321 18F2331

18F2410 18F2420 18F2423 18F2431 18F2439 18F2450 18F2455 18F2458 18F2480

18F2510 18F2515 18F2520 18F2523 18F2525 18F2539 18F2550 18F2553 18F2580 18F2585

18F2610 18F2620 18F2680 18F2682 18F2685

18F4220 18F4221

18F4320 18F4321 18F4331

18F4410 18F4420 18F4423 18F4431 18F4439 18F4450 18F4455 18F4458 18F4480

18F4510 18F4515 18F4520 18F4523 18F4525 18F4539 18F4550 18F4553 18F4580 18F4585

18F4610 18F4620 18F4680 18F4682 18F4685

18F6310 18F6390 18F6393

18F6410 18F6490 18F6493

18F6520 18F6525 18F6527 18F6585

18F6620 18F6621 18F6622 18F6627 18F6628 18F6680

18F6720 18F6722 18F6723

18F8310 18F8390 18F8393

18F8410 18F8490 18F8493

18F8520 18F8525 18F8527 18F8585

18F8620 18F8621 18F8622 18F8627 18F8628 18F8680

18F8720 18F8722 18F8723

18LF13K22 18LF13K50

18LF14K22 18LF14K50

18LF23K22 18LF24J10 18LF24J11 18LF24J50 18LF24K22 18LF24K50

18LF25J10 18LF25J11 18LF25J50 18LF25K22 18LF25K50 18LF25K80

18LF26J11 18LF26J13 18LF26J50 18LF26J53 18LF26K22 18LF26K80

18LF27J13 18LF27J53

18LF43K22

18LF44J10 18LF44J11 18LF44J50 18LF44K22

18LF45J10 18LF45J11 18LF45J50 18LF45K22 18LF45K50 18LF45K80

18LF46J11 18LF46J13 18LF46J50 18LF46J53 18LF46K22 18LF46K80

18LF47J13 18LF47J53

18LF65K80

18LF66K80

18LF242 18LF248 18LF252 18LF258

18LF442 18LF448 18LF452 18LF458

18LF1220 18LF1230

18LF1320 18LF1330

18LF2220 18LF2221

18LF2320 18LF2321 18LF2331

18LF2410 18LF2420 18LF2423 18LF2431 18LF2439 18LF2450 18LF2455 18LF2458 18LF2480

18LF2510 18LF2515 18LF2520 18LF2523 18LF2525 18LF2539 18LF2550 18LF2553 18LF2580 18LF2585

18LF2610 18LF2620 18LF2680 18LF2682 18LF2685

18LF4220 18LF4221

18LF4320 18LF4321 18LF4331

18LF4410 18LF4420 18LF4423 18LF4431 18LF4439 18LF4450 18LF4455 18LF4458 18LF4480

18LF4510 18LF4515 18LF4520 18LF4523 18LF4525 18LF4539 18LF4550 18LF4553 18LF4580 18LF4585

18LF4610 18LF4620 18LF4680 18LF4682 18LF4685

18LF6310 18LF6390 18LF6393

18LF6410 18LF6490 18LF6493

18LF6520 18LF6525 18LF6527 18LF6585

18LF6620 18LF6621 18LF6622 18LF6627 18LF6628 18LF6680

18LF6720 18LF6722 18LF6723

18LF8310 18LF8390 18LF8393

18LF8410 18LF8490 18LF8493

18LF8520 18LF8525 18LF8527 18LF8585

18LF8620 18LF8621 18LF8622 18LF8627 18LF8628 18LF8680

18LF8720 18LF8722 18LF8723

An up-to-date list of supported devices is also available via ' sdcc -mpic16 -plist '.

#### Global Options

PIC16 port supports the standard command line arguments as supposed, with the exception of certain cases that will be mentioned in the following list:

--callee-saves range none pageformat default PIC16!Options!--callee-saves See --all-callee-saves

--use-non-free range none pageformat default PIC16!Options!--use-non-free Make non-free device headers and libraries available in the compiler's search paths (implicit -I and -L options).

#### Port Specific Options range none pageformat default Options PIC16

The port specific options appear after the global options in the sdcc --help output.

##### Code Generation Options

These options influence the generated assembler code.

--pstack-model=[model] Used in conjunction with the command above. Defines the stack model to be used, valid stack models are:

*small* Selects small stack model. 8 bit stack and frame pointers. Supports 256 bytes stack size.

*large* Selects large stack model. 16 bit stack and frame pointers. Supports 65536 bytes stack size.

--pno-banksel Do not generate BANKSEL assembler directives.

--extended Enable extended instruction set/literal offset addressing mode. Use with care!

##### Optimization Options

--obanksel=n Set optimization level for inserting BANKSELs.

0 no optimization

1 checks previous used register and if it is the same then does not emit BANKSEL, accounts only for labels.

2 tries to check the location of (even different) symbols and removes BANKSELs if they are in the same bank.
*Important: There might be problems if the linker script has data sections across bank borders!

--denable-peeps Force the usage of peepholes. Use with care.

--no-optimize-goto Do not use (conditional) BRA instead of GOTO.

--optimize-cmp Try to optimize some compares.

--optimize-df Analyze the dataflow of the generated code and improve it.

##### Assembling Options

--asm= Sets the full path and name of an external assembler to call.

--mplab-comp MPLAB range none pageformat default PIC16!MPLAB compatibility option. Currently only suppresses special gpasm directives.

##### Linking Options

--link= Sets the full path and name of an external linker to call.

--preplace-udata-with=[kword] Replaces the default udata keyword for allocating unitialized data variables with [kword]. Valid keywords are: "udata_acs", "udata_shr", "udata_ovr".

--ivt-loc=n Place the interrupt vector table at address *n*. Useful for bootloaders.

--nodefaultlibs Do not link default libraries when linking.

--use-crt= Use a custom run-time module instead of the default (crt0i).

--no-crt Don't link the default run-time modules

##### Debugging Options

Debugging options enable extra debugging information in the output files.

--debug-xtra Similar to --debug range none pageformat default --debug, but dumps more information.

--debug-ralloc Force register allocator to dump <source>.d file with debugging information.

--pcode-verbose Enable pcode debugging information in translation.

--calltree Dump call tree in.calltree file.

--gstack Trace push/pops for stack pointer overflow.

#### Environment Variables

There is a number of environmental variables that can be used when running SDCC to enable certain optimizations or force a specific program behaviour. these variables are primarily for debugging purposes so they can be enabled/disabled at will.

Currently there is only two such variables available:

OPTIMIZE_BITFIELD_POINTER_GET range none pageformat default PIC16!Environment variables!OPTIMIZE BITFIELD POINTER GET range none pageformat default SDCC!Environment variables!OPTIMIZE BITFIELD POINTER GET (PIC16) When this variable exists, reading of structure bit-fields is optimized by directly loading FSR0 with the address of the bit-field structure. Normally SDCC will cast the bit-field structure to a bit-field pointer and then load FSR0. This step saves data ram and code space for functions that make heavy use of bit-fields. (i.e., 80 bytes of code space are saved when compiling malloc.c with this option).

NO_REG_OPT range none pageformat default PIC16!Environment variables!NO REG OPT range none pageformat default SDCC!Environment variables!NO REG OPT Do not perform pCode registers optimization. This should be used for debugging purposes. If bugs in the pcode optimizer are found, users can benefit from temporarily disabling the optimizer until the bug is fixed.

#### Preprocessor Macros range none pageformat default Preprocessor!PIC16 Macros

PIC16 range none pageformat default PIC16 port defines the following preprocessor macros while translating a source.

| Macro | Description |
| --- | --- |
| __SDCC_pic16 range none pageformat default status collapsed SDCC!Defines!__SDCC pic16 | Port identification |
| pic18fxxxx range none pageformat default status collapsed PIC16!Defines!pic18fxxxx | MCU Identification. xxxx is the microcontrol identification number, i.e. 452, 6620, etc |
| _ _18Fxxxx range none pageformat default status collapsed PIC16!Defines! pic18fxxxx | MCU Identification (same as above) |
| STACK_MODEL_nnn range none pageformat default status collapsed PIC16!Defines!STACK MODEL nnn | nnn = SMALL or LARGE respectively according to the stack model used |
| STACK_MODEL_nnn range none pageformat default status collapsed PIC16!Defines!STACK MODEL nnn | nnn = SMALL or LARGE respectively according to the stack model used |

In addition the following macros are defined when calling assembler:

| Macro | Description |
| --- | --- |
| __18Fxxxx | MCU Identification. xxxx is the microcontrol identification number, i.e. 452, 6620, etc |
| __SDCC_MODEL_nnn | nnn = SMALL or LARGE respectively according to the memory model used for SDCC |
| STACK_MODEL_nnn | nnn = SMALL or LARGE respectively according to the stack model used |
| STACK_MODEL_nnn | nnn = SMALL or LARGE respectively according to the stack model used |

#### Directories

PIC16 range none pageformat default PIC16 port uses the following directories for searching header files and libraries.

| Directory | Description | Target | Command prefix |
| --- | --- | --- | --- |
| PREFIX/sdcc/include/pic16 | PIC16 specific headers | Compiler | -I |
| PREFIX/sdcc/lib/pic16 | PIC16 specific libraries | Linker | -L |
| PREFIX/sdcc/lib/pic16 | PIC16 specific libraries | Linker | -L |

If the **--use-non-free range none pageformat default --use-non-free** command line option is specified, non-free directories are searched:

| Directory | Description | Target | Command prefix |
| --- | --- | --- | --- |
| PREFIX/sdcc/non-free/include/pic16 | PIC16 specific non-free headers | Compiler | -I |
| PREFIX/sdcc/non-free/lib/pic16 | PIC16 specific non-free libraries | Linker | -L |
| PREFIX/sdcc/non-free/lib/pic16 | PIC16 specific non-free libraries | Linker | -L |

#### Pragmas

The PIC16 range none pageformat default PIC16 port currently supports the following pragmas:

stack range none pageformat default PIC16!Pragmas! pragma stack This forces the code generator to initialize the stack & frame pointers at a specific address. This is an ad hoc solution for cases where no STACK directive is available in the linker script or gplink is not instructed to create a stack section.
The stack pragma should be used only once in a project. Multiple pragmas may result in indeterminate behaviour of the program. The old format (ie. #pragma stack 0x5ff) is deprecated and will cause the stack pointer to cross page boundaries (or even exceed the available data RAM) and crash the program. Make sure that stack does not cross page boundaries when using the SMALL stack model.
The format is as follows:

#pragma stack bottom_address [stack_size]

*bottom_address* is the lower bound of the stack section. The stack pointer initially will point at address (bottom_address+stack_size-1).

Example:

/* initializes stack of 100 bytes at RAM address 0x200 */

#pragma stack 0x200 100

If the stack_size field is omitted then a stack is created with the default size of 64. This size might be enough for most programs, but its not enough for operations with deep function nesting or excessive stack usage.

code range none pageformat default PIC16!Pragmas! pragma code Force a function to a static FLASH address.

Example:

/* place function test_func at 0x4000 */

#pragma code test_func 0x4000

library range none pageformat default PIC16!Pragmas! pragma library instructs the linker to use a library module.
Usage:

#pragma library module_name

*module_name* can be any library or object file (including its path). Note that there are four reserved keywords which have special meaning. These are:

| Keyword | Description | Module to link |
| --- | --- | --- |
| ignore | ignore all library pragmas | (none) |
| c | link the C library | libc18f.lib |
| math | link the Math libarary | libm18f.lib |
| io | link the I/O library | libio18f*.lib |
| debug | link the debug library | libdebug.lib |
| debug | link the debug library | libdebug.lib |

* is the device number, i.e. 452 for PIC18F452 MCU.

This feature allows for linking with specific libraries without having to explicit name them in the command line. Note that the ignore keyword will reject all modules specified by the library pragma.

udata range none pageformat default PIC16!Pragmas! pragma udata The pragma udata instructs the compiler to emit code so that linker will place a variable at a specific memory bank.

Example:

/* places variable foo at bank2 */

#pragma udata bank2 foo

char foo;

In order for this pragma to work extra SECTION directives should be added in the.lkr script. In the following example a sample.lkr file is shown:

// Sample linker script for the PIC18F452 processor

LIBPATH.

CODEPAGE NAME=vectors START=0x0 END=0x29 PROTECTED

CODEPAGE NAME=page START=0x2A END=0x7FFF

CODEPAGE NAME=idlocs START=0x200000 END=0x200007 PROTECTED

CODEPAGE NAME=config START=0x300000 END=0x30000D PROTECTED

CODEPAGE NAME=devid START=0x3FFFFE END=0x3FFFFF PROTECTED

CODEPAGE NAME=eedata START=0xF00000 END=0xF000FF PROTECTED

ACCESSBANK NAME=accessram START=0x0 END=0x7F

DATABANK NAME=gpr0 START=0x80 END=0xFF

DATABANK NAME=gpr1 START=0x100 END=0x1FF

DATABANK NAME=gpr2 START=0x200 END=0x2FF

DATABANK NAME=gpr3 START=0x300 END=0x3FF

DATABANK NAME=gpr4 START=0x400 END=0x4FF

DATABANK NAME=gpr5 START=0x500 END=0x5FF

ACCESSBANK NAME=accesssfr START=0xF80 END=0xFFF PROTECTED

SECTION NAME=CONFIG ROM=config

SECTION NAME=bank0 RAM=gpr0 # these SECTION directives

SECTION NAME=bank1 RAM=gpr1 # should be added to link

SECTION NAME=bank2 RAM=gpr2 # section name 'bank?' with

SECTION NAME=bank3 RAM=gpr3 # a specific DATABANK name

SECTION NAME=bank4 RAM=gpr4

SECTION NAME=bank5 RAM=gpr5

The linker will recognise the section name set in the pragma statement and will position the variable at the memory bank set with the RAM field at the SECTION line in the linker script file.

config range none pageformat default PIC16!Pragmas! pragma config The pragma config instructs the compiler to emit config directive.
The format is as follows:

#pragma config setting=value [, setting=value]

Multiple settings may be defined on a single line, separated by commas. Settings for a single configuration byte may also be defined on separate lines.

Example:

#pragma config CP0=OFF,OSCS=ON,OSC=LP,BOR=ON,BORV=25,WDT=ON,WDTPS=128,CCP2MUX=ON

#pragma config STVR=ON

#### Header Files and Libraries

Pic device specific header and c source files are automatically generated from MPLAB include files, which are published by Microchip with a special requirement that they are only to be used with authentic Microchip devices. This requirement prevents to publish generated header and c source files under the GPL compatible license, so they are located in the non-free directory (see section Search Paths). In order to include them in include and library search paths, the **--use-non-free range none pageformat default --use-non-free** command line option should be defined.

NOTE: the compiled code, which use non-free pic device specific libraries, is not GPL compatible!

#### Header Files

There is one main header file range none pageformat default PIC16!Header files that can be included to the source files using the pic16 range none pageformat default PIC16 port. That file is the **pic18fregs.h**. This header file contains the definitions for the processor special registers, so it is necessary if the source accesses them. It can be included by adding the following line in the beginning of the file:

#include <pic18fregs.h>

The specific microcontroller is selected within the pic18fregs.h automatically, so the same source can be used with a variety of devices.

#### Libraries

The libraries range none pageformat default PIC16!Libraries that PIC16 range none pageformat default PIC16 port depends on are the microcontroller device libraries which contain the symbol definitions for the microcontroller special function registers. These libraries have the format pic18fxxxx.lib, where *xxxx* is the microcontroller identification number. The specific library is selected automatically by the compiler at link stage according to the selected device.

Libraries are created with gplib which is part of the gputils package http://sourceforge.net/projects/gputils.

Building the libraries

Before using SDCC/pic16 there are some libraries that need to be compiled. This process is done automatically if gputils are found at SDCC's compile time. Should you require to rebuild the pic16 libraries manually (e.g. in order to enable output of float values range none pageformat default printf()!PIC16 Floating point support via printf(), see below), these are the steps required to do so under Linux or Mac OS X (cygwin might work as well, but is untested):

cd device/lib/pic16

./configure.gnu

cd..

make model-pic16

su -c 'make install' # install the libraries, you need the root password

cd../..

If you need to install the headers too, do:

cd device/include

su -c 'make install' # install the headers, you need the root password

Output of float values via printf()

The library is normally built without support for displaying float values, only <NO FLOAT> range none pageformat default range none pageformat default printf()!PIC16 floating point support will appear instead of the value. To change this, rebuild the library as stated above, but call./configure.gnu --enable-floats instead of just./configure.gnu. Also make sure that at least libc/stdio/vfprintf.c is actually recompiled, e.g. by touch ing it after the configure run or deleting its.o file.

The more common approach of compiling vfprintf.c manually with-DUSE_FLOATS=1 should also work, but is untested.

#### Adding New Devices to the Port

Adding support for a new 16 bit PIC MCU requires the following steps:

1. Create picDEVICE.c and picDEVICE.h from pDEVICE.inc using
perl /path/to/sdcc/support/scripts/inc2h-pic16.pl\
/path/to/gputils/header/pDEVICE.inc
2. mv picDEVICE.h /path/to/sdcc/device/non-free/include/pic16
3. mv picDEVICE.c /path/to/sdcc/device/non-free/lib/pic16/libdev
4. Either
5. add the new device to /path/to/sdcc/device/lib/pic16/libio/*.ignore to suppress building any of the I/O libraries for the new device In fact, the.ignore files are only used when auto-generating Makefile.am using the.../libio/mkmk.sh script., or
6. add the device (family) to /path/to/sdcc/support/scripts/pic18fam-h-gen.pl to assign I/O styles, run the pic18fam-h-gen.pl script to generate pic18fam.h.gen, replace your existing pic18fam.h with the generated file, and (if required) implement new I/O styles in /path/to/sdcc/device/include/pic16/{adc,i2c,usart}.h and /path/to/sdcc/device/lib/pic16/libio/*/*.
7. Edit /path/to/sdcc/device/include/pic16/pic18fregs.h
The file format is self-explanatory, just add
#elif defined(picDEVICE)
# include <picDEVICE.h>
at the right place (keep the file sorted, please).
8. Edit /path/to/sdcc/device/include/pic16devices.txt
Copy and modify an existing entry or create a new one and insert it at the correct place (keep the file sorted, please).
9. (cd /path/to/sdcc/device/non-free/lib/pic16 && sh update.sh)
10. Recompile the pic16 libraries as described in Libraries or just configure and build sdcc again from scratch (recommended).

#### Memory Models

The following memory models are supported by the PIC16 port:

- small model
- large model
Memory model affects the default size of pointers within the source. The sizes are shown in the next table:

| Pointer sizes according to memory model | small model | large model |
| --- | --- | --- |
| code pointers | 16-bits | 24-bits |
| data pointers | 16-bits | 16-bits |
| data pointers | 16-bits | 16-bits |

It is advisable that all sources within a project are compiled with the same memory model. If one wants to override the default memory model, this can be done by declaring a pointer as **far** or **near**. Far selects large memory model's pointers, while near selects small memory model's pointers.

The standard device libraries (see Header Files) contain no reference to pointers, so they can be used with both memory models.

#### Stack

The stack range none pageformat default PIC16!stack implementation for the PIC16 port uses two indirect registers, FSR1 and FSR2.

FSR1 is assigned as stack pointer

FSR2 is assigned as frame pointer

The following stack models are supported by the PIC16 port

- small model
- large model
Small model means that only the FSRxL byte is used to access stack and frame, while *large* uses both FSRxL and FSRxH registers. The following table shows the stack/frame pointers sizes according to stack model and the maximum space they can address:

| Stack & Frame pointer sizes according to stack model | small | large |
| --- | --- | --- |
| Stack pointer FSR1 | 8-bits | 16-bits |
| Frame pointer FSR2 | 8-bits | 16-bits |
| Frame pointer FSR2 | 8-bits | 16-bits |

Large stack model is currently not working properly throughout the code generator. So its use is not advised. Also there are some other points that need special care:

1. Do not create stack sections with size more than one physical bank (that is 256 bytes)
2. Stack sections should no cross physical bank limits (i.e. #pragma stack 0x50 0x100)
These limitations are caused by the fact that only FSRxL is modified when using SMALL stack model, so no more than 256 bytes of stack can be used. This problem will disappear after LARGE model is fully implemented.

#### Functions

In addition to the standard SDCC function keywords, PIC16 range none pageformat default PIC16 port makes available two more:

__wparam range none pageformat default PIC16!wparam Use the WREG to pass one byte of the first function argument. This improves speed but you may not use this for functions with arguments that are called via function pointers, otherwise the first byte of the first parameter will get lost. Usage:

void func_wparam(int a) __wparam

{

/* WREG hold the lower part of a */

/* the high part of a is stored in FSR2+2 (or +3 for large stack model) */

...

}

__shadowregs range none pageformat default PIC16!shadowregs When entering/exiting an ISR, it is possible to take advantage of the PIC18F hardware shadow registers which hold the values of WREG, STATUS and BSR registers. This can be done by adding the keyword *__shadowregs* before the *__interrupt* keyword in the function's header.

void isr_shadow(void) __shadowregs __interrupt (1)

{

...

}

*__shadowregs* instructs the code generator not to store/restore WREG, STATUS, BSR when entering/exiting the ISR.

#### Function return values

Return values from functions are placed to the appropriate registers following a modified Microchip policy optimized for SDCC. The following table shows these registers:

| size | destination register |
| --- | --- |
| 8 bits | WREG |
| 16 bits | PRODL:WREG |
| 24 bits | PRODH:PRODL:WREG |
| 32 bits | FSR0L:PRODH:PRODL:WREG |
| >32 bits | on stack, FSR0 points to the beginning |
| >32 bits | on stack, FSR0 points to the beginning |

#### Interrupts

An interrupt range none pageformat default PIC16!interrupt service routine (ISR) is declared using the *__interrupt* keyword.

void isr(void) __interrupt *(n)

{

...

}

*n* is the interrupt number, which for PIC18F devices can be:

| n | Interrupt Vector | Interrupt Vector Address |
| --- | --- | --- |
| 0 | RESET vector | 0x000000 |
| 1 | HIGH priority interrupts | 0x000008 |
| 2 | LOW priority interrupts | 0x000018 |
| 2 | LOW priority interrupts | 0x000018 |

1. this is a HIGH interrupt ISR and LOW interrupts are *disabled* or not used.
2. when the ISR is small enough not to reach the next interrupt's vector address.
When generating assembly code for ISR the code generator places a goto instruction at the *Interrupt Vector Address* which points at the generated ISR. This single GOTO instruction is part of an automatically generated *interrupt entry point* function. The actual ISR code is placed as normally would in the code space. Upon interrupt request, the GOTO instruction is executed which jumps to the ISR code. When declaring interrupt functions as _naked this GOTO instruction is **not** generated. The whole interrupt functions is therefore placed at the Interrupt Vector Address of the specific interrupt. This is not a problem for the LOW priority interrupts, but it is a problem for the RESET and the HIGH priority interrupts because code may be written at the next interrupt's vector address and cause indeterminate program behaviour if that interrupt is raised. This is not a problem when

*n* may be omitted. This way a function is generated similar to an ISR, but it is not assigned to any interrupt.

When entering an interrupt, currently the PIC16 range none pageformat default PIC16 port automatically saves the following registers:

- WREG
- STATUS
- BSR
- PROD (PRODL and PRODH)
- FSR0 (FSR0L and FSR0H)
These registers are restored upon return from the interrupt routine. NOTE that when the _naked attribute is specified for an interrupt routine, then NO registers are stored or restored.

#### Generic Pointers

Generic pointers are implemented in PIC16 port as 3-byte (24-bit) types. There are 3 types of generic pointers currently implemented data, code and eeprom pointers. They are differentiated by the value of the 7th and 6th bits of the upper byte:

| pointer type | 7th bit | 6th bit | rest of the pointer | description |
| --- | --- | --- | --- | --- |
| data | 1 | 0 | uuuuuu uuuuxxxx xxxxxxxx | a 12-bit data pointer in data RAM memory |
| code | 0 | 0 | uxxxxx xxxxxxxx xxxxxxxx | a 21-bit code pointer in FLASH memory |
| eeprom | 0 | 1 | uuuuuu uuuuuuxx xxxxxxxx | a 10-bit eeprom pointer in EEPROM memory |
| (unimplemented) | 1 | 1 | xxxxxx xxxxxxxx xxxxxxxx | unimplemented pointer type |
| (unimplemented) | 1 | 1 | xxxxxx xxxxxxxx xxxxxxxx | unimplemented pointer type |

Generic pointer are read and written with a set of library functions which read/write 1, 2, 3, 4 bytes.

#### Configuration Bits

Configuration bits (also known as fuses) can be configured using one of two methods:

- using #pragma config (see section Pragmas), which is a preferred method for the new code. Example:
#pragma config CP0=OFF,OSCS=ON,OSC=LP,BOR=ON,BORV=25,WDT=ON,WDTPS=128,CCP2MUX=ON

#pragma config STVR=ON

- using ` __code ' and ` __at ' modifiers. This method is deprecated. Possible options should be ANDed and can be found in your processor header file. Example for PIC18F2550:
#include <pic18fregs.h> //Contains config addresses and options

static __code char __at(__CONFIG1L) configword1l =
_USBPLL_CLOCK_SRC_FROM_96MHZ_PLL_2_1L &

_PLLDIV_NO_DIVIDE__4MHZ_INPUT__1L & [...];
static __code char __at(__CONFIG1H) configword1h = [...];
static __code char __at(__CONFIG2L) configword2l = [...];
//More configuration words

Mixing both methods is not allowed and throws an error message" mixing __CONFIG and CONFIG directives".

#### PIC16 C Libraries

##### Standard I/O Streams

In the *stdio.h* the type FILE is defined as:

typedef char * FILE;

This type is the stream type implemented I/O in the PIC18F devices. Also the standard input and output streams are declared in stdio.h:

extern FILE * stdin;

extern FILE * stdout;

The FILE type is actually a generic pointer which defines one more type of generic pointers, the *stream* pointer. This new type has the format:

| pointer type | | | | | rest of the pointer | descrption |
| --- | --- | --- | --- | --- | --- | --- |
| stream | 00 | 1 | 0 | nnnn | uuuuuuuu uuuuuuuu | upper byte high nubble is 0x2n, the rest are zeroes |
| stream | 00 | 1 | 0 | nnnn | uuuuuuuu uuuuuuuu | upper byte high nubble is 0x2n, the rest are zeroes |

Currently implemented there are 3 types of streams defined:

| stream type | value | module | description |
| --- | --- | --- | --- |
| STREAM_USART | 0x200000UL | USART | Writes/Reads characters via the USART peripheral |
| STREAM_MSSP | 0x210000UL | MSSP | Writes/Reads characters via the MSSP peripheral |
| STREAM_USER | 0x2f0000UL | (none) | Writes/Reads characters via used defined functions |
| STREAM_USER | 0x2f0000UL | (none) | Writes/Reads characters via used defined functions |

The stream identifiers are declared as macros in the stdio.h header.

In the libc library there exist the functions that are used to write to each of the above streams. These are

_ _stream_usart_putchar writes a character at the USART stream

_ _stream_mssp_putchar writes a character at the MSSP stream

putchar dummy function. This writes a character to a user specified manner.

In order to increase performance *putchar* is declared in stdio.h as having its parameter in WREG (it has the *__wparam* keyword). In stdio.h exists the macro PUTCHAR(arg) that defines the putchar function in a user-friendly way. *arg* is the name of the variable that holds the character to print. An example follows:
```c
#include <pic18fregs.h>
#include <stdio.h>

PUTCHAR(c)
{
  PORTA = c; /* dump character c to PORTA */
}

void main(void)
{
  stdout = STREAM_USER; /* this is not necessary, since stdout points by default to STREAM_USER */
  printf (" This is a printf test\ n");
}
```

##### Printing functions

PIC16 contains an implementation of the printf-family range none pageformat default printf()!PIC16 of functions. There exist the following functions:

extern unsigned int sprintf(char *buf, char *fmt,...);

extern unsigned int vsprintf(char *buf, char *fmt, va_list ap);

extern unsigned int printf(char *fmt,...);

extern unsigned int vprintf(char *fmt, va_lista ap);

extern unsigned int fprintf(FILE *fp, char *fmt,...);

extern unsigned int vfprintf(FILE *fp, char *fmt, va_list ap);

For sprintf and vsprintf *buf* should normally be a data pointer where the resulting string will be placed. No range checking is done so the user should allocate the necessary buffer. For fprintf and vfprintf *fp* should be a stream pointer (i.e. stdout, STREAM_MSSP, etc...).

##### Signals

The PIC18F family of microcontrollers supports a number of interrupt sources. A list of these interrupts is shown in the following table:

| signal name | description | signal name | description |
| --- | --- | --- | --- |
| SIG_RB | PORTB change interrupt | SIG_EE | EEPROM/FLASH write complete interrupt |
| SIG_INT0 | INT0 external interrupt | SIG_BCOL | Bus collision interrupt |
| SIG_INT1 | INT1 external interrupt | SIG_LVD | Low voltage detect interrupt |
| SIG_INT2 | INT2 external interrupt | SIG_PSP | Parallel slave port interrupt |
| SIG_CCP1 | CCP1 module interrupt | SIG_AD | AD convertion complete interrupt |
| SIG_CCP2 | CCP2 module interrupt | SIG_RC | USART receive interrupt |
| SIG_TMR0 | TMR0 overflow interrupt | SIG_TX | USART transmit interrupt |
| SIG_TMR1 | TMR1 overflow interrupt | SIG_MSSP | SSP receive/transmit interrupt |
| SIG_TMR2 | TMR2 matches PR2 interrupt | | |
| SIG_TMR3 | TMR3 overflow interrupt | | |
| SIG_TMR3 | TMR3 overflow interrupt | | |

The prototypes for these names are defined in the header file *signal.h*.

In order to simplify signal handling, a number of macros is provided:

DEF_INTHIGH(name) begin the definition of the interrupt dispatch table for high priority interrupts. *name* is the function name to use.

DEF_INTLOW(name) begin the definition of the interrupt dispatch table for low priority interrupt. *name* is the function name to use.

DEF_HANDLER(sig,handler) define a handler for signal *sig.

END_DEF end the declaration of the dispatch table.

Additionally there are two more macros to simplify the declaration of the signal handler:

** SIGHANDLER(handler)** this declares the function prototype for the *handler* function.

SIGHANDLERNAKED(handler) same as SIGHANDLER() but declares a naked function.

An example of using the macros above is shown below:

#include <pic18fregs.h>

#include <signal.h>

DEF_INTHIGH(high_int)

DEF_HANDLER(SIG_TMR0, _tmr0_handler)

DEF_HANDLER(SIG_BCOL, _bcol_handler)

END_DEF

SIGHANDLER(_tmr0_handler)

{

/* action to be taken when timer 0 overflows */

}

SIGHANDLERNAKED(_bcol_handler)

{

__asm

/* action to be taken when bus collision occurs */

retfie

__endasm;

}

**NOTES:** Special care should be taken when using the above scheme:

- do not place a colon (;) at the end of the DEF_* and END_DEF macros.
- when declaring SIGHANDLERNAKED handler never forget to use *retfie* for proper returning.

#### PIC16 Port - Tips

Here you can find some general tips for compiling programs with SDCC/pic16.

##### Stack size

The default stack range none pageformat default PIC16!stack size (that is 64 bytes) probably is enough for many programs. One must take care that when there are many levels of function nesting, or there is excessive usage of stack, its size should be extended. An example of such a case is the printf/sprintf family of functions. If you encounter problems like not being able to print integers, then you need to set the stack size around the maximum (256 for small stack model). The following diagram shows what happens when calling printf to print an integer:

printf () --> ltoa () --> ultoa () --> divschar ()

It is should be understood that stack is easily consumed when calling complicated functions. Using command line arguments like --fomit-frame-pointer might reduce stack usage by not creating unnecessary stack frames. Other ways to reduce stack usage may exist.

#### Known Bugs

##### Extended Instruction Set

The PIC16 port emits code which is incompatible with the extended instruction set available with many newer devices. Make sure to always explicitly disable it, usually using:

- #pragma config XINST=OFF
or deprecated:

- static __code char __at(__CONFIG4L) conf4l = /* more flags & */ _XINST_OFF_4L;
Some devices (namely 18f2455, 18f2550, 18f4455, and 18f4550) use _ENHCPU_OFF_4L instead of _XINST_OFF_4L.

##### Regression Tests

The PIC16 port currently passes most but not all of the tests in SDCC's regression test range none pageformat default Regression test (PIC16) suite (see section Quality control), thus no automatic regression tests are currently performed for the PIC16 target.
