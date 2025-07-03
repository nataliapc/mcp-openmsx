# Z80 detailed instruction set

Source: [Z80 Heaven](http://z80-heaven.wikidot.com/instructions-set)

---
## ADC
The sum of the two operands plus the carry flag (0 or 1) is calculated, and the result is written back into the first operand.

### Syntax
    adc a,op8        ;8 bit
    adc hl,op16        ;16 bit

#### Allowed instructions
    adc a,a
    adc a,b
    adc a,c
    adc a,d
    adc a,e
    adc a,h
    adc a,l
    adc a,ixh
    adc a,ixl
    adc a,iyh
    adc a,iyl
    adc a,(hl)
    adc a,(ix+n)
    adc a,(iy+n)
    adc a,n        ;(8-bit number)
    
    adc hl,bc
    adc hl,de
    adc hl,hl
    adc hl,sp

### Effects
The `N` flag is reset, `P/V` is interpreted as overflow. The rest of the flags is modified by definition. In the case of 16-bit addition the `H` flag is undefined.

### Uses
Multiple precision adding

### T-States
`r` denotes 8-bit register.  
`rr` represents a two byte register pair: `BC`, `DE`, `HL`, `SP`

    a, r            4
    a, X            7
    a, (hl)         7
    a, (ix+X)       19
    a, (iy+X)       19
    hl, rr          15

### See also
[ADD](#add), [DAA](#daa), [DEC](#dec), [INC](#inc), [SBC](#sbc), [SUB](#sub)

---
## ADD
The values of the two operands are added together, and the result is written back to the first one.

### Syntax
    add a,op8        ;8 bits
    add op16,op16    ;16 bits

#### Allowed instructions
    add a,a
    add a,b
    add a,c
    add a,d
    add a,e
    add a,h
    add a,l
    add a,ixh
    add a,ixl
    add a,iyh
    add a,ixl
    add a,(hl)
    add a,(ix+n)
    add a,(iy+n)
    add a,n        ;8-bit constant

    add hl,bc
    add hl,de
    add hl,hl
    add hl,sp

    add ix,bc
    add ix,de
    add ix,ix
    add ix,sp

    add iy,bc
    add iy,de
    add iy,iy
    add iy,sp

### Effects
#### 8-bit arithmetic
`N` flag is reset, `P/V` is interpreted as overflow.  
Rest of flags modified by definition.

#### 16-bit arithmetic
preserves the `S`, `Z` and `P/V` flags, and `H` is undefined.  
Rest of flags modified by definition.

### Uses
Obviously used to add two numbers together. However, you can add 16-bit numbers to sp, giving you control of where the stack pointer is pointing to.

### T-States
`r` denotes 8-bit register.  
`rr` represents a two byte register pair: BC, DE, HL, SP

    r           4
    X           7
    (hl)        7
    (ix+X)      19
    (iy+X)      19
    hl, rr      11
    ix, rr      15
    iy, rr      15

### See Also
[ADC](#adc), [DAA](#daa), [DEC](#dec), [INC](#inc), [SBC](#sbc), [SUB](#sub)

---
## AND
`AND` is an instruction that takes an 8-bit input an compares it with the accumulator. It checks to see if both are set. If either one is reset, the resulting bit in the accumulator is zero.

    0 and 0 result: 0
    0 and 1 result: 0
    1 and 0 result: 0
    1 and 1 result: 1

### Syntax
    and op8

#### Allowed Instructions
    and a
    and b
    and c
    and d
    and e
    and h
    and l
    and ixh
    and ixl
    and iyh
    and iyl
    and (hl)
    and (ix+n)
    and (iy+n)
    and n        ;8 bit constant

### Effects
`C` and `N` flags cleared, `P/V` is parity, rest are altered by definition.

### Uses
The most important use of `AND` is in bit-masking. For more information on bit-masking, see here.

### T-States
`r` denotes 8-bit register.

    r           4
    X           7
    (l)         7
    (x+X)       19
    (y+X)       19

### See Also
[BIT](#bit), [CCF](#ccf), [CPL](#cpl), [OR](#or), [RES](#res), [SCF](#scf), [SET](#set) ,[XOR](#xor)

---
## BIT
Tests if the specified bit is set.

### Syntax
    bit n,op8

#### Allowed Instructions
`n` can be any integer from [0,7]. It must be defined on compile time.

    bit n,a
    bit n,b
    bit n,c
    bit n,d
    bit n,e
    bit n,h
    bit n,l
    bit n,(hl)
    bit n,(ix+n)
    bit n,(iy+n)

### Effects
Opposite of the n<sup>th</sup> bit is written into the `Z` flag. `C` is preserved, `N` is reset, `H` is set, and `S` and `P/V` are undefined.

    ld a,%00000001
    bit 0,a        ;would reset Z
    bit 1,a        ;would set Z

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        12
    (ix+X)      20
    (iy+X)      20

### See Also
[AND](#and), [CCF](#ccf), [CP](#cp), [CPD](#cpd), [CPDR](#cpdr), [CPI](#cpi), [CPIR](#cpir), [CPL](#cpl), [OR](#or), [RES](#res), [SCF](#scf), [SET](#set), [XOR](#xor)

---
## CALL
Pushes the address after the `CALL` instruction (`PC`+3) onto the stack and jumps to the label. Can also take conditions.

### Syntax
    call label          ;unconditional call
    call cond.,label    ;conditional call

#### Allowed Instructions
    call label          ;always calls

    call c,label        ;calls if C flag is set
    call nc,label       ;calls if C flag is reset

    call z,label        ;calls if Z flag is set
    call nz,label       ;calls if Z flag is reset

    call m,label        ;calls if S flag is set
    call p,label        ;calls if S flag is reset

    call pe,label       ;calls if P/V is set
    call po,label       ;calls if P/V is reset

### Effects
Flags are preserved.

### Uses
The most common use of `CALL` is to create routines that can be used multiple times.

### T-States
`cc` is condition: `NZ`, `Z`, `NC`, `C`, `PO`, `PE`, `P`, `M`

    XX          17
          condition-true  condition-false
    cc,XX       17              10

### See Also
[BIT](#bit), [CP](#cp), [CPD](#cpd), [CPDR](#cpdr), [CPI](#cpi), [CPIR](#cpir), [DJNZ](#djnz), [JP](#jp), [JR](#jr), [RET](#ret)

---
## CCF
Inverts the carry flag.

### Syntax
    ccf

### Effects
Carry flag inverted. Also inverts `H` and clears `N`. Rest of the flags are preserved.

### T-States
4 t-states

### See Also
[SCF](#scf)

---
## CP
CP is a subtraction from A that doesn't update A, only the flags it would have set/reset if it really was subtracted.

### Syntax
    cp op8

`op8` is any one of the allowed inputs.

#### Allowed instructions
    cp a
    cp b
    cp c
    cp d
    cp e
    cp h
    cp l
    cp ixh
    cp ixl
    cp iyh
    cp iyl
    cp (hl)
    cp (ix+n)
    cp (iy+n)
    cp n        ;8 bit constant

### Effects
`C`, `S`, and `Z` flags modified by definition  
`P/V` detects overflow

### Uses
Here are some general rules on using `CP`:

#### Unsigned
If A == N, then `Z` flag is set.  
If A != N, then `Z` flag is reset.  
If A < N, then `C` flag is set.  
If A >= N, then `C` flag is reset.  

#### Signed
If A == N, then `Z` flag is set.  
If A != N, then `Z` flag is reset.  
If A < N, then `S` and `P/V` are different.  
If A >= N, then `S` and `P/V` are the same.  

### T-States
`r` denotes 8-bit register.

    r           4
    X           7
    (hl)        7
    (ix+X)      19
    (iy+X)      19

### See also
[BIT](#bit), [CALL](#call), [CPD](#cpd), [CPDR](#cpdr), [CPI](#cpi), [CPIR](#cpir), [JP](#jp), [JR](#jr), [RET](#ret)

---
## CPD
Multiple instructions combined into one. `CPD` does these things in this order:

    CP (HL)
    DEC HL
    DEC BC

### Syntax
No operands.

    cpd

### Effects
The carry is preserved, `N` is set and all the other flags are affected as defined. `P/V` denotes the overflowing of `BC`, while the `Z` flag is set if `A`=`(HL)` before `HL` is decreased.

### Uses
See [`CPDR`](#cpdr) for potential uses.

### See Also
[BIT](#bit), [CALL](#call), [CP](#cp), [CPDR](#cpdr), [CPI](#cpi), [CPIR](#cpir), [JP](#jp), [JR](#jr)

---
## CPDR
Repeats `CPD` until either:

    BC=0
    A=(HL)

### Syntax
No operands.

    cpdr

### Effects
The carry is preserved, `N` is set and all the other flags are affected as defined. `P/V` denotes the overflowing of `BC`, while the `Z` flag is set if `A`=`(HL)` before `HL` is decreased.

### Uses
Say you want to find the last occurrence of 124 in the valid memory space:

    LD HL,0000h
    LD BC,0000h
    LD A,124
    CPDR

_Note: if you used CPIR it would find the first occurrence of 124 in the valid memory space._

### T-States
    BC ≠ 0 and A ≠ (HL)     21
    BC = 0 or A = (HL)      16

### See Also
[BIT](#bit), [CALL](#call), [CP](#cp), [CPD](#cpd), [CPI](#cpi), [CPIR](#cpir), [JP](#jp), [JR](#jr)

---
## CPI
Multiple instructions combined into one. `CPI` does these things in this order:

    CP (HL)
    INC HL
    DEC BC

### Syntax
No operands.

    cpi

### Effects
The carry is preserved, `N` is set and all the other flags are affected as defined. `P/V` denotes the overflowing of `BC`, while the `Z` flag is set if `A`=`(HL)` before `HL` is decreased.

### Uses
See [`CPIR`](#cpir) for one example use.

### T-States
16 t-states

### See Also
[BIT](#bit), [CALL](#call), [CP](#cp), [CPD](#cpd), [CPDR](#cpdr), [CPIR](#cpir), [JP](#jp), [JR](#jr)

---
## CPIR
Repeats `CPI` until either:

    BC=0
    A=(HL)

### Syntax
No operands.

    cpir

### Effects
The carry is preserved, `N` is set and all the other flags are affected as defined. `P/V` denotes the overflowing of `BC`, while the `Z` flag is set if `A`=`(HL)` before `HL` is decreased.

### Uses
If you want to find the first occurrence of 124 in the valid memory space:

    LD HL,0000h
    LD BC,0000h
    LD A,124
    CPIR

_Note: if you used CPDR it would find the last occurrence of 124 in the valid memory space._

### T-States
    BC ≠ 0 and A ≠ (HL)     21
    BC = 0 or A = (HL)      16

### See Also
[BIT](#bit), [CALL](#call), [CP](#cp), [CPD](#cpd), [CPDR](#cpdr), [CPI](#cpi), [JP](#jp), [JR](#jr)

---
## CPL
CPL inverts all bits of A.

### Syntax
    cpl

### Effects
Sets `H` and `N`, other flags are unmodified.

### Uses
This instruction returns the same value as XORing A with $FF or subtracting A from $FF.
Also, `CPL` \ `INC A` returns the same value that `NEG` does.

### T-States
4 t-states

### See Also
[NEG](#neg), [XOR](#xor)

---
## DAA
When this instruction is executed, the `A` register is BCD corrected using the contents of the flags. The exact process is the following: if the least significant four bits of `A` contain a non-BCD digit (i. e. it is greater than 9) or the `H` flag is set, then $06 is added to the register. Then the four most significant bits are checked. If this more significant digit also happens to be greater than 9 or the `C` flag is set, then $60 is added.

### Syntax
    dda

### Effects
If the second addition was needed, the `C` flag is set after execution, otherwise it is reset. The `N` flag is preserved, `P/V` is parity and the others are altered by definition.

### T-States
4 t-states

### See Also
[ADC](#adc), [ADD](#add), [DEC](#dec), [INC](#inc), [SBC](#sbc), [SUB](#sub)

---
## DEC
Decreases operand by one.

### Syntax
    dec op8        ;8 bits
    dec op16       ;16 bits

#### Allowed Instructions
    dec a
    dec b
    dec c
    dec d
    dec e
    dec h
    dec l
    dec ixh
    dec ixl
    dec iyh
    dec iyl
    dec (hl)
    dec (ix+n)
    dec (iy+n)

    dec bc
    dec de
    dec hl
    dec ix
    dec iy
    dec sp

### Effects
#### 8 Bits
`C` flag preserved, `P/V` detects overflow and rest modified by definition.

#### 16 Bits
No flags altered.

### T-States
`r` denotes 8-bit register.  
`rr` represents a two byte register pair: `BC`, `DE`, `HL`, `SP`

    r           4
    (hl)        11
    (ix+X)      23
    (iy+X)      23
    rr          6
    ix          10
    iy          10

### See Also
[ADC](#adc), [ADD](#add), [DAA](#daa), [INC](#inc), [SBC](#sbc), [SUB](#sub)

---
## DI
Disables the interrupts (both mode 1 and mode 2).

### Syntax
    di

### Effects
Flags preserved.

### Uses
Useful if you want to use the `IY` register or shadow registers, which are modified by the OS's interrupts. Be sure to reset `IY` to flags before returning to the OS.

    ld iy,flags

### T-States
4 t-states

### See Also
[EI](#ei), [HALT](#halt), [IM](#im), [RETI](#reti), [RETN](#retn), [RST](#rst)

---
## DJNZ
Decreases `B` and jumps to a label if not zero. Note that `DJNZ` does a relative jump, so it can only jump between 128 bytes back/ahead.

### Syntax
    djnz label

### Effects
Preserves all flags.

### Uses
`DJNZ` is a very useful instruction when it comes to creating loops. See Control Structures to find out more about loops.

### T-States
    B ≠ 0       13
    B = 0       8

### See Also
[CALL](#call), [JP](#jp), [JR](#jr)

---
## EI
Enables the interrupts.

### Syntax
    ei

### Effects
Flags preserved.

### Uses
Can either be set to interrupt mode 1 (OS interrupts) or interrupt mode 2 using `IM`. Be sure to re-enable interrupt mode 1 before returning to the OS.

### T-States
4 t-states

### See Also
[DI](#di), [HALT](#halt), [IM](#im), [RETI](#reti), [RETN](#retn), [RST](#rst)

---
## EX
## EX
Exchanges two 16-bit values.

### Syntax
    ex op16,op16

#### Allowed Instructions
    ex af,af'
    ex de,hl
    ex (sp),hl
    ex (sp),ix
    ex (sp),iy

### Effects
Flags are preserved.

### Uses
`EX DE,HL` exchanges `HL` with `DE`. Note that `IX` and `IY` do not work with this command.  
`EX (SP),HL` exchanges `HL` with the last pushed value on the stack.  
`EX AF,AF'` exchanges `AF` with its shadow register. This is mostly used as an alternative to pushing `AF` to the stack during interrupts. Note that the flags will most likely not be the same after this command.

### T-States
    de, hl      4
    af, af'     4
    (sp),hl     19
    (sp),ix     19
    (sp),iy     19

### See Also
[EXX](#exx)

---
## EXX
Exchanges `BC`, `DE`, and `HL` with shadow registers `BC'`, `DE'`, and `HL'`.

### Syntax
    exx

### Effects
All flags preserved.

### Uses
Most useful in interrupts as an alternative to saving those registers on the stack. If you want to use this command outside an interrupt, make sure interrupts are disabled first.

### T-States
4 t-states

### See Also
[DI](#di), [EI](#ei), [EX](#ex), [HALT](#halt), [IM](#im), [RETI](#reti), [RETN](#retn)

---
## HALT
Suspends all actions until the next interrupt.

_Note: Since halt does wait for the next interrupt, if you disable interrupts halt will run forever, resulting in a crash. Make sure that you always either know the interrupts will be on, or turn it on right before you use the halt instruction._

### Syntax
    halt

### Effects
All flags preserved.

### Uses
Exactly what it says: if you need a delay, halt will provide a split second delay. You can chain halts

### T-States
4 t-states

### See Also
[DI](#di), [EI](#ei), [NOP](#nop)

---
## IM
Sets the interrupt mode.

### Modes
#### Mode 0
Not used by TI calculators, but means that an external device plugged into a z80 device generates the interrupt.

#### Mode 1
Interrupts are generated by the internal circuitry of the processor (aka the OS). The frequency of these interrupts is 200 per second on a ZX Spectrum, and 50(PAL)/60(NTSC) on a MSX, but it depends on the state of the batteries in the case of TI calculators (probably varies between 100 and 150). Every time an interrupt is encountered, the OS performs an RST $28.

#### Mode 2
Allows user to determine when an interrupt happens, and what the interrupt does. For more information on interrupts, see this page.

### Syntax
    im 0        ;will compile, but could result in a crash
    im 1
    im 2

### Effects
All flags are preserved.

### Uses
The most important use of `IM` is to allow for the programmer to create their own interrupts that can do whatever they want them to, when they want the interrupts to occur. For more information on how interrupts work, see this page.

### T-States
8 t-states for each mode

### See Also
[DI](#di), [EI](#ei), [RETI](#reti), [RETN](#retn), [RST](#rst)

---
## IN
Reads a value from a hardware port.

### Syntax
    in op8,(op8)

#### Allowed Instructions
    in a,(n)        ;8-bit constant
    in a,(c)
    in b,(c)
    in c,(c)
    in d,(c)
    in e,(c)
    in h,(c)
    in l,(c)
    in (c)          ;undocumented command

### Effects
#### IN A,(N)
This command alters no flags.

#### Others
`N` flag reset, `P/V` represents parity, `C` flag preserved, all other flags affected by definition.

### Uses
This command, along with `OUT`, is used for hardware interfacing.  
The undocumented command `IN (C)` reads from the port and affects flags, but does not store the value to a register.

### T-States
`r` denotes 8-bit register.

    A, X        11
    r, (C)      12

### See Also
[IND](#ind), [INDR](#indr), [INI](#ini), [INIR](#inir), [OUT](#out), [OUTD](#outd), [OTDR](#otdr), [OUTI](#outi), [OTIR](#otir)

---
## INC
Increases operand by 1.

### Syntax
    inc op8        ;8 bits
    inc op16       ;16 bits

#### Allowed Instructions
    inc a
    inc b
    inc c
    inc d
    inc e
    inc h
    inc l
    inc ixh
    inc ixl
    inc iyh
    inc iyl
    inc (hl)
    inc (ix+n)
    inc (iy+n)

    inc bc
    inc de
    inc hl
    inc ix
    inc iy
    inc sp

### Effects
#### 8 Bits
Preserves `C` flag, `N` flag is reset, `P/V` detects overflow and rest are modified by definition.

#### 16 Bits
No flags altered.

### T-States
`r` denotes 8-bit register.  
`rr` represents a two byte register pair: `BC`, `DE`, `HL`, `SP`

    r           4
    (hl)        11
    (ix+X)      23
    (iy+X)      23
    rr          6
    ix          10
    iy          10

### See Also
[ADC](#adc), [ADD](#add), [DAA](#daa), [DEC](#dec), [SBC](#sbc), [SUB](#sub)

---
## IND
Reads the `(C)` port and writes the result to `(HL)`, then decrements `HL` and decrements `B`.

### Syntax
    ind

### Effects
`C` is preserved, the `N` flag is set. `S`, `H` and `P/V` are undefined. `Z` is set if `B` becomes zero after decrementing, otherwise it is reset.

### T-States
16 t-states

### See Also
[IN](#in), [INI](#ini), [INDR](#indr), [INIR](#inir), [OTDR](#otdr), [OTIR](#otir), [OUT](#out), [OUTD](#outd), [OUTI](#outi)

---
## INDR
Reads the `(C)` port and writes the result to `(HL)`. `HL` and `B` are decremented. Repeats until `B` = 0.

### Syntax
    indr

### Effects
`Z` is set, carry is preserved, `N` is set, `S`, `H`, and `P/V` are undefined.

### Uses

### T-States
    B = 0       16
    B ≠ 0       21

### See Also
[IN](#in), [IND](#ind), [INI](#ini), [INIR](#inir), [OUT](#out), [OUTD](#outd), [OTDR](#otdr), [OUTI](#outi), [OTIR](#otir)

---
## INI
Reads the `(C)` port and writes the result to `(HL)`, then increments `HL` and decrements `B`.

### Syntax
    ini

### Effects
`C` is preserved, the `N` flag is reset. `S`, `H` and `P/V` are undefined. `Z` is set if `B` becomes zero after decrementing, otherwise it is reset.

### T-States
16 t-states

### See Also
[IN](#in), [IND](#ind), [INDR](#indr), [INIR](#inir), [OTDR](#otdr), [OTIR](#otir), [OUT](#out), [OUTD](#outd), [OUTI](#outi)

---
## INIR
Reads from the `(C)` port, then writes to `(HL)`. `HL` is incremented and `B` is decremented. Repeats until `B` = 0.

### Syntax
    inir

### Effects
`Z` is set, `C` is reset, `N` is reset, `S`, `H`, and `P/V` are undefined.

### T-States
    B = 0       16
    B ≠ 0       21

### See Also
[IN](#in), [IND](#ind), [INDR](#indr), [INI](#ini), [OUT](#out), [OUTD](#outd), [OTDR](#otdr), [OUTI](#outi), [OTIR](#otir)

---
## JP
Absolute jumps to the address. Can be conditional or unconditional. `JP` takes one more byte than `JR`, but is also slightly faster, so decide whether speed or size is more important before choosing `JP` or `JR`. `JP (HL)`, `JP (IX)`, and `JP (IY)` are unconditional and are the fastest jumps, and do not take more bytes than other jumps.

### Syntax
    jp nn               ;unconditional jump
    jp cond.,nn         ;conditional jump
    jp (reg16)          ;HL, IX and IY only

#### Allowed Instructions
    ;Constants
    jp nn               ;no condition
    jp c,nn             ;jumps if C is set
    jp nc,nn            ;jumps if C is reset
    jp z,nn             ;jumps if Z is set
    jp nz,nn            ;jumps if Z is reset
    jp m,nn             ;jumps if S is set
    jp p,nn             ;jumps if S is reset
    jp pe,nn            ;jumps if P/V is set
    jp po,nn            ;jumps if P/V is reset

    ;HL points to address
    jp (hl)

    ;IX points to address
    jp (ix)

    ;IY points to address
    jp (iy)

### Effects
All flags preserved.

### T-States
`cc` is condition: `NZ`, `Z`, `NC`, `C`, `PO`, `PE`, `P`, `M`

    XX          10
    cc,XX       10
    (hl)        4
    (ix)        8
    (iy)        8

### See Also
[BIT](#bit), [CALL](#call), [CP](#cp), [CPD](#cpd), [CPDR](#cpdr), [CPI](#cpi), [CPIR](#cpir), [DJNZ](#djnz), [JR](#jr)

---
## JR
Relative jumps to the address. This means that it can only jump between 128 bytes ahead or behind. Can be conditional or unconditional. `JR` takes up one less byte than `JP`, but is also slower. Weigh the needs of the code at the time before choosing one over the other (speed vs. size).

### Syntax
    jr nn               ;unconditional jump
    jr cond.,nn         ;conditional jump

#### Allowed Instructions
    ;Constants
    jr nn               ;no condition
    jr c,nn             ;jumps if C is set
    jr nc,nn            ;jumps if C is reset
    jr z,nn             ;jumps if Z is set
    jr nz,nn            ;jumps if Z is reset

### Effects
All flags preserved.

### T-States
`cc` is condition: `NZ`, `Z`, `NC`, `C`

    XX          12
          condition-true  condition-false
    cc,XX       12              7

### See Also
[BIT](#bit), [CALL](#call), [CP](#cp), [CPD](#cpd), [CPDR](#cpdr), [CPI](#cpi), [CPIR](#cpir), [DJNZ](#djnz), [JP](#jp)

---
## LD
The `LD` instruction is used to put the value from one place into another place.

### Syntax
    ld N,M

puts `M` into `N`.

#### Allowed instructions
(across: `M` Down: `N`)

If x, it means allowed. If empty, it means not allowed.

|       | A | B | C | D | E | H | L | I | R | IXH | IXL | IYH | IYL | BC | DE | HL | SP | IX | IY | (BC) | (DE) | (HL) | (IX+N) | (IY+N) | N | NN | (NN) |
|-------|---|---|---|---|---|---|---|---|---|-----|-----|-----|-----|----|----|----|----|----|----|------|------|------|--------|--------|---|----|----- |
| A     | x | x | x | x | x | x | x | x | x | x   | x   | x   | x   |    |    |    |    |    |    | x    | x    | x    | x      | x      | x |    | x    |
| B     | x | x | x | x | x | x | x |   |   | x   | x   | x   | x   |    |    |    |    |    |    |      |      | x    | x      | x      | x |    |      |
| C     | x | x | x | x | x | x | x |   |   | x   | x   | x   | x   |    |    |    |    |    |    |      |      | x    | x      | x      | x |    |      |
| D     | x | x | x | x | x | x | x |   |   | x   | x   | x   | x   |    |    |    |    |    |    |      |      | x    | x      | x      | x |    |      |
| E     | x | x | x | x | x | x | x |   |   | x   | x   | x   | x   |    |    |    |    |    |    |      |      | x    | x      | x      | x |    |      |
| H     | x | x | x | x | x | x | x |   |   |     |     |     |     |    |    |    |    |    |    |      |      | x    | x      | x      | x |    |      |
| L     | x | x | x | x | x | x | x |   |   |     |     |     |     |    |    |    |    |    |    |      |      | x    | x      | x      | x |    |      |
| I     | x |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   |    |      |
| R     | x |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   |    |      |
| IXH   | x | x | x | x | x |   |   |   |   | x   | x   |     |     |    |    |    |    |    |    |      |      |      |        |        | x |    |      |
| IXL   | x | x | x | x | x |   |   |   |   | x   | x   |     |     |    |    |    |    |    |    |      |      |      |        |        | x |    |      |
| IYH   | x | x | x | x | x |   |   |   |   |     |     | x   | x   |    |    |    |    |    |    |      |      |      |        |        | x |    |      |
| IYL   | x | x | x | x | x |   |   |   |   |     |     | x   | x   |    |    |    |    |    |    |      |      |      |        |        | x |    |      |
| BC    |   |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   | x  | x    |
| DE    |   |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   | x  | x    |
| HL    |   |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   | x  | x    |
| SP    |   |   |   |   |   |   |   |   |   |     |     |     |     |    |    | x  |    | x  | x  |      |      |      |        |        |   | x  | x    |
| IX    |   |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   | x  | x    |
| IY    |   |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   | x  | x    |
| (BC)  | x |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   |    |      |
| (DE)  | x |   |   |   |   |   |   |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        |   |    |      |
| (HL)  | x | x | x | x | x | x | x |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        | x |    |      |
| (IX+N)| x | x | x | x | x | x | x |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        | x |    |      |
| (IY+N)| x | x | x | x | x | x | x |   |   |     |     |     |     |    |    |    |    |    |    |      |      |      |        |        | x |    |      |
| (NN)  | x |   |   |   |   |   |   |   |   |     |     |     |     | x  | x  | x  | x  | x  | x  |      |      |      |        |        |   |    |      |

### Effects
No flags are altered except in the cases of the `I` or `R` registers.

In those cases, `C` is preserved, `H` and `N` are reset, and alters `Z` and `S`. `P/V` is set if interrupts are enabled, reset otherwise.

### Uses
Use to load numbers into operands. They can either be numbers used in the code (usually 8-bits), or labels (usually 16-bits).

    ld b,$05        ;Counter

    ld hl,var       ;Variable label
    ld a,(var)      ;Write data to var

### T-States
`r` denotes 8-bit register.  
`rr` represents a two byte register pair: `BC`, `DE`, `HL`, `SP`

    r, r'           4
    r,X             7
    r,(hl)          7
    r,(ix+X)        19
    r,(iy+X)        19
    a, (bc)         7
    a, (de)         7
    a, (XX)         13
    (bc),a          7
    (de),a          7
    (XX),a          13
    a, i            9
    a, r            9
    i, a            9
    r, a            9
    a, (BC)         7
    (XX), a         13
    rr,XX           10
    ix, XX          14
    iy, XX          14
    hl, (XX)        20
    ix, (XX)        20
    iy, (XX)        20
    (XX), hl        20
    (XX), rr        20
    (XX), ix        20
    (XX), iy        20
    sp, hl          6
    sp, ix          10
    sp, iy          10

### See Also
[LDD](#ldd), [LDDR](#lddr), [LDI](#ldi), [LDIR](#ldir)

---
## LDD
Does a sort of `LD (DE),(HL)`, then decrements `DE`, `HL`, and `BC`.

### Syntax
    ldd

### Effects
`P/V` is reset in case of overflow (if `BC`=0 after calling `LDD`).

### Uses
Used when you want to copy over the data pointed to by `HL` to the location pointed to by `DE`.

### T-States
16 t-states

### See Also
[LD](#ld), [LDDR](#lddr), [LDI](#ldi), [LDIR](#ldir)

## LDDR
Repeats the instruction `LDD` (Does a `LD (DE),(HL)` and decrements each of `DE`, `HL`, and `BC`) until `BC`=0. Note that if `BC`=0 before the start of the routine, it will try loop around until `BC`=0 again.

### Syntax
    lddr

### Effects
`P/V` is reset.

### Uses
Copying over sections of data.

### T-States
    BC ≠ 0       21
    BC = 0       16

### See Also
[LD](#ld), [LDD](#ldd), [LDI](#ldi), [LDIR](#ldir)

---
## LDI
Performs a `LD (DE),(HL)`, then increments `DE` and `HL`, and decrements `BC`.

### Syntax
    ldi

### Effects
`P/V` is reset in case of overflow (if `BC`=0 after calling `LDI`).

### Uses
Copying data.

### T-States
16 t-states

### See Also
[LD](#ld), [LDD](#ldd), [LDDR](#lddr), [LDIR](#ldir)

---
## LDIR
Repeats `LDI` (`LD (DE),(HL)`, then increments `DE`, `HL`, and decrements `BC`) until `BC`=0. Note that if `BC`=0 before this instruction is called, it will loop around until `BC`=0 again.

### Syntax
    ldir

### Effects
`P/V` is reset.

### Uses
Copying sections of data.

### T-States
    BC ≠ 0       21
    BC = 0       16

### See Also
[LD](#ld), [LDD](#ldd), [LDDR](#lddr), [LDI](#ldi)

---
## NEG
`NEG` negates the accumulator.

### Syntax
    neg

### Effects
`N` flag is set, all other flags modified by definition.

### Uses
This command literally subtracts `A` from 0. This explains what "modified by definition" means in the _Effects_ section above.

### T-States
8 t-states

### See Also
[CPL](#cpl), [SUB](#sub)

---
## NOP
`NOP` does nothing for 4 clock cycles.

### Syntax
    nop

### Effects
All flags preserved.

### Uses
Useful for a short time waster (for example, it's common to put clock cycles between output and input ports).

### T-States
4 t-states

### See Also
[HALT](#halt)

---
## OR
`OR` is an instruction that takes an 8-bit input an compare sit with the accumulator. It checks to see if anything is set, and if neither are set, it results in a zero.

    0 or 0 result: 0
    0 or 1 result: 1
    1 or 0 result: 1
    1 or 1 result: 1

### Syntax
    or op8

#### Allowed Instructions
    or a
    or b
    or c
    or d
    or e
    or h
    or l
    or ixh
    or ixl
    or iyh
    or iyl
    or (hl)
    or (ix+n)
    or (iy+n)
    or n        ;8 bit constant

### Effects
`C` and `N` flags cleared, `P/V` detects parity, and rest are modified by definition.

### Uses
Used in bit-masking. For more information see here.

### T-States
`r` denotes 8-bit register.

    r           4
    X           7
    (hl)        7
    (ix+X)      19
    (iy+X)      19

### See Also
[AND](#and), [BIT](#bit), [CCF](#ccf), [CPL](#cpl), [RES](#res), [SCF](#scf), [SET](#set), [XOR](#xor)

---
## OTDR
Reads from `(HL)` and writes to the `(C)` port. `HL` and `B` are then decremented. Repeats until `B` = 0.

### Syntax
    otdr

### Effects
`C` is preserved, `Z` is set, `N` is set, `S`, `H`, and `P/V` are undefined.

### T-States
    B = 0       16
    B ≠ 0       21

### See Also
[IN](#in), [IND](#ind), [INDR](#indr), [INI](#ini), [INIR](#inir), [OUT](#out), [OUTD](#outd), [OUTI](#outi), [OTIR](#otir)

---
## OTIR
Reads from `(HL)` and writes to the `(C)` port. `HL` is incremented and `B` is decremented. Repeats until `B` = 0.

### Syntax
    otir

### Effects
`Z` is set, `C` is preserved, `N` is reset, `H`, `S`, and `P/V` are undefined.

### T-States
    B = 0       16
    B ≠ 0       21

### See Also
[IN](#in), [IND](#ind), [INDR](#indr), [INI](#ini), [INIR](#inir), [OUT](#out), [OUTD](#outd), [OTDR](#otdr), [OUTI](#outi)

---
## OUT
Writes the value of the second operand into the port given by the first operand.

### Syntax
    out (imm8),a
    out (c),reg8

#### Allowed Instructions
    out (imm8),a
    out (c),a
    out (c),b
    out (c),c
    out (c),d
    out (c),e
    out (c),h
    out (c),l

    out (c),0       ;Zero. Note: Undocumented

### Effects
All flags preserved

### T-States
`r` denotes 8-bit register.

    A, X        11
    r, (C)      12

### See Also
[IN](#in), [IND](#ind), [INDR](#indr), [INI](#ini), [INIR](#inir), [OUTD](#outd), [OTDR](#otdr), [OUTI](#outi), [OTIR](#otir)

---
## OUTD
Writes the value from `(HL)` to the `(C)` port, then decrements `B` and `HL`.

### Syntax
    outd

### Effects
`C` is preserved, `N` is set, `H`, `S`, and `P/V` are undefined. `Z` is set only if `B` becomes zero after decrement, otherwise it is reset.

### T-States
16 t-states

### See Also
[IN](#in), [IND](#ind), [INDR](#indr), [INI](#ini), [INIR](#inir), [OUT](#out), [OTDR](#otdr), [OUTI](#outi), [OTIR](#otir)

---
## OUTI
Reads from `(HL)` and writes to the `(C)` port. `HL` is then incremented, and `B` is decremented.

### Syntax
    outi

### Effects
`C` is preserved, `N` is reset, `H`, `S`, and `P/V` are undefined. `Z` is set only if `B` becomes zero after decrement, otherwise it's reset.

### Uses

### T-States
16 t-states

### See Also
[IN](#in), [IND](#ind), [INDR](#indr), [INI](#ini), [INIR](#inir), [OUT](#out), [OUTD](#outd), [OTDR](#otdr), [OTIR](#otir)

---
## POP
Copies the two bytes from `(SP)` into the operand, then increases `SP` by 2.

### Syntax
    pop reg16

#### Allowed Instructions
    pop af
    pop bc
    pop de
    pop hl
    pop ix
    pop iy

### Effects
Flags are unaffected except when popping `AF`.

### Uses
Used for retrieving values saved on the stack. Also used when you want to load a 16-bit register into another 16-bit register (the `LD` instruction won't work for this).

### T-States
`rr` represents a two byte register pair: `BC`, `DE`, `HL`, `SP`

    rr          10
    ix          14
    iy          14

### See Also
[PUSH](#push)

---
## PUSH
Copies the operand into `(SP)`, then decrements `SP` by 2.

### Syntax
    push reg16

#### Allowed Instructions
    push af
    push bc
    push de
    push hl
    push ix
    push iy

### Effects
Flags are unaffected.

### Uses
Used for saving register values onto the stack. Also used when you want to load a 16-bit register into another 16-bit register (the `LD` instruction won't work for this).

### T-States
`rr` represents a two byte register pair: `BC`, `DE`, `HL`, `SP`

    rr          11
    ix          15
    iy          15

### See Also
[POP](#pop)

---
## RES
Resets the specified bit to zero.

### Syntax
    res n,op8

#### Allowed Instructions
`n` can be any integer from [0,7]. It must be defined on compile time.

    res n,a
    res n,b
    res n,c
    res n,d
    res n,e
    res n,h
    res n,l
    res n,(hl)
    res n,(ix+n)
    res n,(iy+n)

### Effects
Flags are preserved.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[AND](#and), [BIT](#bit), [CCF](#ccf), [CPL](#cpl), [OR](#or), [SCF](#scf), [SET](#set), [XOR](#xor)

---
## RET
Pops the top of the stack into the program counter. Note that `RET` can be either conditional or unconditional.

### Syntax
    ret             ;no conditions
    ret cond.       ;conditional

#### Allowed Instructions
    ret z           ; Z flag is set
    ret nz          ; Z flag is reset
    ret c           ; Carry flag is set
    ret nc          ; Carry flag is reset
    ret m           ; S flag is set
    ret p           ; S flag is reset
    ret pe          ; P/V is set
    ret po          ; P/V is reset

### Effects
Preserves all flags.

### Uses
`RET` is used mostly for exiting an assembly program or returning from a routine.

### T-States
`cc` is condition: `NZ`, `Z`, `NC`, `C`, `PO`, `PE`, `P`, `M`

    ret             10
          condition-true  condition-false
    ret cc          11              5

### See Also
[BIT](#bit), [CALL](#call), [CP](#cp), [CPD](#cpd), [CPDR](#cpdr), [CPI](#cpi), [CPIR](#cpir), [RETI](#reti), [RETN](#retn)

---
## RETI
Returns from an interrupt routine. Note: `RETI` cannot use return conditions.

### Syntax
    reti

### Effects
All flags unaffected.

### T-States
14 t-states

### See Also
[DI](#di), [EI](#ei), [IM](#im), [RET](#ret), [RETN](#retn), [RST](#rst)

---
## RETN
Returns from the non-maskable interrupt (NMI). Cannot take return conditions.

### Syntax
    retn

### Effects
All flags unaffected.

### T-States
14 t-states

### See Also
[DI](#di), [EI](#ei), [IM](#im), [RET](#ret), [RETI](#reti), [RST](#rst)

---
## RL
9-bit rotation to the left. The register's bits are shifted left. The carry value is put into 0<sup>th</sup> bit of the register, and the leaving 7th bit is put into the carry.

### Syntax
    rl op8

#### Allowed Instructions
    rl a
    rl b
    rl c
    rl d
    rl e
    rl h
    rl l
    rl (hl)
    rl (ix+n)
    rl (iy+n)

### Effects
`C` is changed to the leaving 7th bit, `H` and `N` are reset, `P/V` is parity, `S` and `Z` are modified by definition.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RLA
Performs an `RL A`, but is much faster and `S`, `Z`, and `P/V` flags are preserved.

### Syntax
    rla

### Effects
`C` is changed to the leaving 7th bit, `H` and `N` are reset, `P/V`, `S` and `Z` are preserved.

### T-States
4 t-states

### See Also
[RL](#rl), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RLC
8-bit rotation to the left. The bit leaving on the left is copied into the carry, and to bit 0.

### Syntax
    rlc op8

#### Allowed Instructions
    rlc a
    rlc b
    rlc c
    rlc d
    rlc e
    rlc h
    rlc l
    rlc (hl)
    rlc (ix+n)
    rlc (iy+n)

### Effects
`H` and `N` flags are reset, `P/V` is parity, `S` and `Z` are modified by definition.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RL](#rl), [RLA](#rla), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RLCA
Performs `RLC A` much quicker, and modifies the flags differently.

### Syntax
    rlca

### Effects
`S`, `Z`, and `P/V` are preserved, `H` and `N` flags are reset.

### T-States
4 t-states

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RLD
Performs a 4-bit leftward rotation of the 12-bit number whose 4 most significant bits are the 4 least significant bits of A, and its 8 least significant bits are in (HL).

    ; assume W,X,Y,Z are the set of all possible hex values 0-F
    ld a,$WX
    ld (hl),$YZ
    rld
    ; A = $WY
    ; (HL) = $ZX

### Syntax
    rld

### Effects
The `H` and `N` flags are reset, `P/V` is parity, `C` is preserved, and `S` and `Z` are modified by definition.

### T-States
18 t-states

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RR
9-bit rotation to the right. The carry is copied into bit 7, and the bit leaving on the right is copied into the carry.

### Syntax
    rr op8

#### Allowed Instructions
    rr a
    rr b
    rr c
    rr d
    rr e
    rr h
    rr l
    rr (hl)
    rr (ix+n)
    rr (iy+n)

### Effects
Carry becomes the bit leaving on the right, `H` and `N` flags are reset, `P/V` is parity, `S` and `Z` are modified by definition.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RRA
Performs an `RR A`, but is much faster and `P/V`, `S`, and `Z` flags are preserved.

### Syntax
    rra

### Effects
The carry becomes the bit leaving on the right, `H` and `N` flags are reset, `P/V`, `S`, and `Z` are preserved.

### T-States
4 t-states

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RRC
8-bit rotation to the right. The bit leaving on the right is copied into the carry, and into bit 7.

### Syntax
    rrc op8

#### Allowed Instructions
    rrc a
    rrc b
    rrc c
    rrc d
    rrc e
    rrc h
    rrc l
    rrc (hl)
    rrc (ix+n)
    rrc (iy+n)

### Effects
The carry becomes the value leaving on the right, `H` and `N` are reset, `P/V` is parity, and `S` and `Z` are modified by definition.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

## RRCA
Performs `RRC A` faster and modifies the flags differently.

### Syntax
    rrca

### Effects
The carry becomes the value leaving on the right, `H` and `N` are reset, `P/V`, `S`, and `Z` are preserved.

### Uses

### T-States
4 t-states

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RRD
Performs a 4-bit rightward rotation of the 12-bit number whose 4 most significant bits are the 4 least significant bits of `A`, and its 8 least significant bits are in `(HL)`.

    ; assume W,X,Y,Z are the set of all possible hex values 0-F
    ld a,$WX
    ld (hl),$YZ
    rrd
    ; A = $WZ
    ; (HL) = $XY

### Syntax
    rrd

### Effects
The `H` and `N` flags are reset, `P/V` is parity, `C` is preserved, and `S` and `Z` are modified by definition.

### T-States
18 t-states

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## RST
The current `PC` value plus three is pushed onto the stack. The MSB is loaded with $00 and the LSB is loaded with `imm8`.

### Syntax
    rst imm8

#### Allowed Instructions
    rst $00
    rst $08
    rst $10
    rst $18
    rst $20
    rst $28
    rst $30
    rst $38

### Effects
All flags unaffected.

### T-States
11 t-states

### See Also
[DI](#di), [EI](#ei), [IM](#im), [RET](#ret), [RETI](#reti), [RETN](#retn)

---
## SBC
Sum of second operand and carry flag is subtracted from the first operand. Results are written into the first operand.

### Syntax
    sbc a,op8        ;8 bits
    sbc hl,op16      ;16 bits

#### Allowed Instructions
    sbc a,a
    sbc a,b
    sbc a,c
    sbc a,d
    sbc a,e
    sbc a,h
    sbc a,l
    sbc a,ixh
    sbc a,ixl
    sbc a,iyh
    sbc a,iyl
    sbc a,(hl)
    sbc a,(ix+n)
    sbc a,(iy+n)
    sbc a,n        ;8 bits

    sbc hl,bc
    sbc hl,de
    sbc hl,hl
    sbc hl,sp

### Effects
`N` flag is set, `P/V` detects overflow, rest modified by definition.  
In the case of 16-bit registers, `H` flag is undefined.

### Uses
Multiple precision subtraction

### T-States
`r` denotes 8-bit register.  
`rr` represents a two byte register pair: `BC`, `DE`, `HL`, `SP`

    r           4
    X           7
    (hl)        7
    (ix+X)      19
    (iy+X)      19
    hl, rr      15

### See Also
[ADC](#adc), [ADD](#add), [DAA](#daa), [DEC](#dec), [INC](#inc), [SUB](#sub)

---
## SCF
Sets carry flag.

### Syntax
    scf

### Effects
Carry flag set, `H` and `N` cleared, rest are preserved.

### T-States
4 t-states

### See Also
[CCF](#ccf)

---
## SET
Sets the specified bit.

### Syntax
    set n,op8

#### Allowed Instructions
`n` can be any integer from [0,7]. It must be defined on compile time.

    set n,a
    set n,b
    set n,c
    set n,d
    set n,e
    set n,h
    set n,l
    set n,(hl)
    set n,(ix+n)
    set n,(iy+n)

### Effects
All flags preserved.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[AND](#and), [BIT](#bit), [CCF](#ccf), [CPL](#cpl), [OR](#or), [RES](#res), [SCF](#scf), [XOR](#xor)

---
## SLA
An arithmetic shift left 1 bit position is performed on the contents of register `r`. The contents of bit 7 are copied to the carry flag. Bit 0 is the least-significant bit.

### Syntax
    sla op8

#### Allowed Instructions
    sla a
    sla b
    sla c
    sla d
    sla e
    sla h
    sla l
    sla (hl)
    sla (ix+n)
    sla (iy+n)

### Effects
`S` and `Z` by definition, `H` and `N` reset, `C` from bit 7, `P/V` set if result is even.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLL/SL1](#sllsl1), [SRA](#sra), [SRL](#srl)

---
## SLL/SL1
An "undocumented" instruction. Functions like `SLA`, except a 1 is inserted into the low bit.

### Syntax
    sll op8

#### Allowed Instructions
    sll a
    sll b
    sll c
    sll d
    sll e
    sll h
    sll l
    sll (hl)
    sll (ix+n)
    sll (iy+n)

### Effects
`S` and `Z` by definition, `H` and `N` reset, `C` from bit 7, `P/V` set if result is even.

### T-States
`r` denotes 8-bit register. `IX` and `IY` values assumed from `SLA`. Needs confirmation.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SRA](#sra), [SRL](#srl)

---
## SRA
Arithmetic shift right 1 bit, bit 0 goes to carry flag, bit 7 remains unchanged.

### Syntax
    sra op8

#### Allowed Instructions
    sra a
    sra b
    sra c
    sra d
    sra e
    sra h
    sra l
    sra (hl)
    sra (ix+n)
    sra (iy+n)

### Effects
`S` and `Z` set according to definition, `H` and `N` reset, `C` from bit 0, `P/V` if parity is 0.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRL](#srl)

---
## SRL
Like `SRA`, except a 0 is put into bit 7. The bits are all shifted right, with bit 0 put into the carry flag.

### Syntax
    srl op8

#### Allowed Instructions
    srl a
    srl b
    srl c
    srl d
    srl e
    srl h
    srl l
    srl (hl)
    srl (ix+n)
    srl (iy+n)

### Effects
`S`, `H`, and `N` flags reset, `Z` if result is zero, `P/V` set if parity is even, `C` from bit 0.

### T-States
`r` denotes 8-bit register.

    r           8
    (hl)        15
    (ix+X)      23
    (iy+X)      23

### See Also
[RL](#rl), [RLA](#rla), [RLC](#rlc), [RLCA](#rlca), [RLD](#rld), [RR](#rr), [RRA](#rra), [RRC](#rrc), [RRCA](#rrca), [RRD](#rrd), [SLA](#sla), [SLL/SL1](#sllsl1), [SRA](#sra)

---
## SUB
`SUB` stands for subtract but only takes one input. It subtracts the input from the accumulator and writes back to it.

### Syntax
    sub op8        ;8 bit

#### Allowed Instructions
    sub a
    sub b
    sub c
    sub d
    sub e
    sub h
    sub l
    sub n        ;8 bit constant

    sub (hl)
    sub (ix+n)
    sub (iy+n)

### Effects
`N` flag set, `P/V` is overflow, rest modified by definition.

### Uses
Allows you to subtract two 8 bit integers. Useful in if you have an offset and want to eliminate certain items.

### T-States
`r` denotes 8-bit register.

    r           4
    X           7
    (hl)        7
    (ix+X)      19
    (iy+X)      19

### See Also
[ADC](#adc), [ADD](#add), [DAA](#daa), [DEC](#dec), [INC](#inc), [SBC](#sbc)

---
## XOR
`XOR` is an instruction that takes one 8-bit input and compares it with the accumulator. `XOR` is similar to `OR`, except for one thing: only 1 of the 2 test bits can be set or else it will result in a zero. The final answer is stored to the accumulator.

    0 and 0 result: 0
    0 and 1 result: 1
    1 and 0 result: 1
    1 and 1 result: 0

### Syntax
    xor op8

#### Allowed Instructions
    xor a
    xor b
    xor c
    xor d
    xor e
    xor h
    xor l
    xor ixh
    xor ixl
    xor iyh
    xor iyl
    xor (hl)
    xor (ix+n)
    xor (iy+n)
    xor n        ;8 bit constant

### Effects
`C` and `N` flags cleared. `P/V` is parity, and rest are modified by definition.

### Uses
XORing numbers is used a lot to invert sprites and such. It is also very useful in bit-masking. See here for more information about bit-masking.

### T-States
`r` denotes 8-bit register.

    r           4
    X           7
    (hl)        7
    (ix+X)      19
    (iy+X)      19

### See Also
[AND](#and), [BIT](#bit), [CCF](#ccf), [CPL](#cpl), [OR](#or), [RES](#res), [SCF](#scf), [SET](#set)

---