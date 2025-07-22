# Z80 Bits

Milos "baze" Bazelides, baze_at_baze_au_com  
last updated 29.03.2006

I decided to create this collection of Z80 routines for one simple reason - I like magic. And of course, I was fed up with bad code one can find in many embedded devices, web pages, tutorials and such. The routines presented here is what I believe to be the best of its kind or at least very close to it.

However, if you find a bug or optimisation please let me know. My objective is to know and share the best stuff out there. Also, if you feel you've got something that should be posted here drop me a mail. Keep in mind though that any code you submit should be machine independent and of general use. Of course, you'll be guaranteed a honourable mention in the Credits :)

Please don't complain about lack of comments. This is not a coding tutorial but rather a collection of tricks for (more or less) experienced coders. I'm sure it's not that hard to figure out what's going on.

_Note: This document is by far not finished yet. I'll continue to add new code in near future. I also think of providing binary images of look-up tables in cases where table generator is not trivial. Also, I'd be glad if some native English speaker would help me to correct numerous grammar and spelling mistakes :)_

## Table of Contents

- 1 [Integer Multiplication](#integer-multiplication)
  - 1.1 Restoring 8-bit * 8-bit Unsigned
  - 1.2 Restoring 16-bit * 8-bit Unsigned
  - 1.3 Restoring 16-bit * 16-bit Unsigned
  - 1.4 Square Table Driven 8-bit * 8-bit Signed
  - 1.5 Square Table Driven 6-bit * 6-bit Signed
  - 1.6 Logarithmic Table Driven 8-bit * 8-bit Signed](#
- [2 Integer Division](#integer-division)
  - 2.1 Restoring 8-bit / 8-bit Unsigned
  - 2.2 Restoring 16-bit / 8-bit Unsigned
  - 2.3 Restoring 16-bit / 16-bit Unsigned
  - 2.4 Restoring 24-bit / 8-bit Unsigned
  - 2.5 Restoring 24-bit / 16-bit Unsigned
  - 2.6 Restoring 32-bit / 8-bit Unsigned
- 3 [Integer Square Root](#integer-square-root)
  - 3.1 Basic 8-bit Square Root
  - 3.2 Basic 16-bit Square Root
  - 3.3 Restoring 16-bit Square Root
  - 3.4 16-bit Square Table Bisection
- 4 [Random Number Generators](#random-number-generators)
  - 4.1 8-bit Random Number Generator
  - 4.2 16-bit Random Number Generator
- 5 [Conversions Between Numbers and Strings](#conversions-between-numbers-and-strings)
  - 5.1 16-bit Integer to ASCII (decimal)
  - 5.2 16-bit Integer to ASCII (hexadecimal)
  - 5.3 Memory dump (hexadecimal)
- 6 [Cyclic Redundancy Checks (CRC)](#cyclic-redundancy-checks-crc)
  - 6.1 16-bit CRC-CCITT
  - 6.2 Table Driven 16-bit CRC-CCITT
  - 6.3 32-bit CRC-32
  - 6.4 Table Driven 32-bit CRC-32
- [Credits](#credits)

## Integer Multiplication

### Restoring 8-bit * 8-bit Unsigned

Input: H = Multiplier, E = Multiplicand, L = 0, D = 0  
Output: HL = Product
```assembly
	sla	h		; optimised 1st iteration
	jr	nc,$+3
	ld	l,e

	add	hl,hl		; unroll 7 times
	jr	nc,$+3		; ...
	add	hl,de		; ...
```

### Restoring 16-bit * 8-bit Unsigned

Input: A = Multiplier, DE = Multiplicand, HL = 0, C = 0  
Output: A:HL = Product
```assembly
	add	a,a		; optimised 1st iteration
	jr	nc,$+4
	ld	h,d
	ld	l,e

	add	hl,hl	; unroll 7 times
	rla			; ...
	jr	nc,$+4	; ...
	add	hl,de	; ...
	adc	a,c		; ...
```

### Restoring 16-bit * 16-bit Unsigned

Input: DE = Multiplier, BC = Multiplicand, HL = 0  
Output: DE:HL = Product
```assembly
	sla	e		; optimised 1st iteration
	rl	d
	jr	nc,$+4
	ld	h,b
	ld	l,c

	add	hl,hl		; unroll 15 times
	rl	e		; ...
	rl	d		; ...
	jr	nc,$+6		; ...
	add	hl,bc		; ...
	jr	nc,$+3		; ...
	inc	de		; ...
```

### Square Table 8-bit * 8-bit Signed

Input: B = Multiplier, C = Multiplicand (both in range -128..127)  
Output: HL = Product

_Note: Routine uses one of these two formulas: 2ab = (a + b)^2 - a^2 - b^2 or 2ab = a^2 + b^2 - (a - b)^2, depends if (a + b) overflows or not. Powering by 2 is done by table lookup. 512 bytes long table is aligned to 256 byte boundary and contains entries of form SqrTab[x] = x^2. If we treat one of the operands as fractional number -1..1 premultiplied by 128, 2ab performs native shift of the result into register H. That's especially useful e.g. for x * sin(y). Otherwise we have to shift HL right (divide it by 2). We could divide table entries by 2 instead but that causes loss of precision._

```assembly
Mul8x8
    ld	h,SqrTab/256
	ld	l,b
	ld	a,b
	ld	e,(hl)
	inc	h
	ld	d,(hl)		; DE = a^2
	ld	l,c
	ld	b,(hl)
	dec	h
	ld	c,(hl)		; BC = b^2
	add	a,l		; let's try (a + b)
	jp	pe,Plus		; jump if no overflow

	sub	l
	sub	l
	ld	l,a
	ld	a,(hl)
	inc	h
	ld	h,(hl)
	ld	l,a		; HL = (a - b)^2
	ex	de,hl
	add	hl,bc
	sbc	hl,de		; HL = a^2 + b^2 - (a - b)^2

;	sra	h		; uncomment to get real product
;	rr	l
	ret

Plus
	ld	l,a
	ld	a,(hl)
	inc	h
	ld	h,(hl)
	ld	l,a		; HL = (a + b)^2
	or	a
	sbc	hl,bc
	or	a
	sbc	hl,de		; HL = (a + b)^2 - a^2 - b^2

;	sra	h		; uncomment to get real product
;	rr	l
	ret
```

Square table generator is based on observation that differences between consecutive squares (0, 1, 4, 9, 16, 25, ...) form a sequence of odd numbers. (1, 3, 5, 7, 9, ...). Thus, by adding successive odd numbers iteratively we generate integer squares.

```assembly
	ld	hl,SqrTab	; must be a multiple of 256
	ld	b,l
	ld	c,l		; BC holds odd numbers
	ld	d,l
	ld	e,l		; DE holds squares

SqrGen
	ld	(hl),e
	inc	h
	ld	(hl),d		; store x^2
	ld	a,l
	neg
	ld	l,a
	ld	(hl),d
	dec	h
	ld	(hl),e		; store -x^2
	ex	de,hl
	inc	c
	add	hl,bc		; add next odd number
	inc	c
	ex	de,hl

	cpl			; one byte replacement for NEG, DEC A
	ld	l,a
	rla
	jr	c,SqrGen
```

### Square Table Driven 6-bit * 6-bit Signed

The first thing that should be pointed out here is that the topic is not particularly correct. Actually, the routine is able to multiply any pair of numbers x, y as long as (x + y) <= 127 and (x - y) >= -128. But if x, y are signed 6-bit values these rules are never violated, no overflows occur and no specific checking is needed.

The routine is based on a formula 4xy = (x + y)^2 - (x - y)^2 and uses the same lookup table (see previous chapter) except all table entries are pre-divided by 4 to avoid division (shifting) at the end. An explanation why it works can be found here. In case we leave the table as is, routine nicely handles fixed point multiplications. That means, if we treat one of the operands as fractional number in range (-1, 1) pre-multiplied by 64, integer part of the result gets shifted handily into register H.

_Note: SqrTab must be aligned to 256 byte boundary._

Input: B = Multiplier, C = Multiplicand  
Output: BC = Product

```assembly
Mul6x6
	ld	h,SqrTab/256
	ld	d,h
	ld	a,b
	add	a,c		; A = x + y
	ld	l,a
	ld	a,b
	sub	c		; A = x - y
	ld	e,a
	ld	a,(de)		; subtract lower byte
	sub	(hl)		; lower byte of (x + y)^2 - (x - y)^2
	ld	c,a
	inc	h
	inc	d
	ld	a,(de)
	sbc	a,(hl)		; higher byte of (x + y)^2 - (x - y)^2
	ld	b,a
```

This is the fastest version I could come up with but there's also slightly slower one which preserves one register pair:

Input: B = Multiplier, C = Multiplicand  
Output: HL = Product

```assembly
Mul6x6
	ld	h,SqrTab/256
	ld	a,b
	sub	c		; A = x - y
	ld	l,a
	ld	a,b
	add	a,c		; A = x + y
	ld	c,(hl)
	inc	h
	ld	b,(hl)		; BC = (x - y)^2
	ld	l,a
	ld	a,(hl)
	dec	h
	ld	l,(hl)
	ld	h,a		; HL = (x + y)^2
	or	a
	sbc	hl,bc		; HL = (x + y)^2 - (x - y)^2
```

It's also possible to speed up this routine by having two consecutive look-up tables where first table is negated. Question is, however, if 4 cycles are worth wasting another 512 bytes.

```assembly
Mul6x6
	ld	h,SqrTab/256
	ld	a,b
	sub	c		; A = x - y
	ld	l,a
	ld	a,b
	add	a,c		; A = x + y
	ld	c,(hl)
	inc	h
	ld	b,(hl)		; BC = -(x - y)^2, that's the trick
	inc	h
	ld	l,a
	ld	a,(hl)
	inc	h
	ld	h,(hl)
	ld	l,a		; HL = (x + y)^2
	add	hl,bc		; HL = (x + y)^2 - (x - y)^2
```

### Logarithmic Table Driven 8-bit * 8-bit Signed
(to do)

## Integer Division

Division is an awkward arithmetic operation even if it's directly supported by hardware. Thus, we can't expect blazing speed even from well written code. Before you attempt to use any of these routines, please consider these hints:
- If the divisor is a power of two, don't bother with division. Use shifts.
- If you divide by a constant, use lookup table indexed by dividend. As this is not always possible, try to "unroll" division so that it only contains terms with powers of two. For example, X / 10 = (X + X / 2 + X / 8 - X / 64 + ...) / 16. However, this approach often limits the range of numbers we can use (because of precision) and is only suitable for divisors that are close to powers of two.
- If you divide numbers from a limited range (i.e. only 6-bit numbers), use lookup table as well. Table can be organised several ways, depends on memory limitations and range of numbers. Typically, dividend/divisor would form higher/lower byte of address at which you pick up the result.
- Sometimes it's worth multiplying by reciprocal number (fixed point multiplication). Be careful though as you might lose precision.
- In some cases (especially for small numbers) it might be actually faster to subtract divisor from dividend in loop. However, in general this is the slowest and most naive method.

The routines presented here are mostly based on so-called restoring division algorithm. Although more sophisticated methods exist, implemetation of this algorithm (particularly its left-rotating version) on Z80 is very efficient and straightforward.

Some routines use "undocumented" instruction SLIA (Shift Left Inverted Arithmetic), sometimes also denoted as SLL (Shift Left Logical). SLIA shifts register left and sets the least significant bit to 1 (operation code is CBh 30h..37h). It is used in routines which subtract 16-bit divisor from the 16-bit remainder. As there is no simple way to test whether such subtraction will be successful without actually performing it, it's better to assume it will be successful (hence 1 in the LSB) and possibly make a correction to 0. Doing it the opposite way introduces the overhead of Carry complement (see bellow).

_Note: Most division routines leave register B untouched. It enables you to create loops using DJNZ in case you prefer compact code and couple of additional cycles is not an issue._

### Restoring 8-bit / 8-bit Unsigned

Input: D = Dividend, E = Divisor, A = 0  
Output: D = Quotient, A = Remainder

```assembly
	sla	d		; unroll 8 times
	rla			; ...
	cp	e		; ...
	jr	c,$+4	; ...
	sub	e		; ...
	inc	d		; ...
```

The most awkward "feature" of this algorithm is the relation between Carry and the newly determined bit of the result. Successful subtraction (Carry = 0) means that we should set the bit to 1 and vice versa. One possible workaround is to leave Carry as is and complement whole result at the end. This introduces a little overhead but also saves one instruction in the main loop.

Input: D = Dividend, E = Divisor, A = 0, Carry = 0  
Output: A = Quotient, E = Remainder
```assembly
	rl	d		; unroll 8 times
	rla			; ...
	sub	e		; ...
	jr	nc,$+3	; ...
	add	a,e		; ...

	...

;	ld	e,a		; save remainder (if needed)
	ld	a,d		; complement all bits of the result
	cpl
```

### Restoring 16-bit / 8-bit Unsigned

Input: HL = Dividend, C = Divisor, A = 0  
Output: HL = Quotient, A = Remainder
```assembly
	add	hl,hl		; unroll 16 times
	rla			; ...
	cp	c		; ...
	jr	c,$+4		; ...
	sub	c		; ...
	inc	l		; ...
```

### Restoring 16-bit / 16-bit Unsigned

Input: A:C = Dividend, DE = Divisor, HL = 0  
Output: A:C = Quotient, HL = Remainder
```assembly
	slia	c		; unroll 16 times
	rla			; ...
	adc	hl,hl		; ...
	sbc	hl,de		; ...
	jr	nc,$+4		; ...
	add	hl,de		; ...
	dec	c		; ...
```

We can use the forementioned trick with complementing the result also here but it's not that obvious how removed DEC C balances against additional overhead. In any case, this routine doesn't contain any "undocumented" instructions and might be preferable (?) for that reason.

Input: A:C = Dividend, DE = Divisor, HL = 0  
Output: BC = Quotient, HL = Remainder

```assembly
	rl	c		; unroll 16 times
	rla			; ...
	adc	hl,hl		; ...
	sbc	hl,de		; ...
	jr	nc,$+3		; ...
	add	hl,de		; ...

	...

	rl	c
	rla
	cpl
	ld	b,a
	ld	a,c
	cpl
	ld	c,a
```

### Restoring 24-bit / 8-bit Unsigned

Input: E:HL = Dividend, D = Divisor, A = 0  
Output: E:HL = Quotient, A = Remainder
```assembly
	add	hl,hl	; unroll 24 times
	rl	e		; ...
	rla			; ...
	cp	d		; ...
	jr	c,$+4	; ...
	sub	d		; ...
	inc	l		; ...
```

### Restoring 24-bit / 16-bit Unsigned

Input: A:BC = Dividend, DE = Divisor, HL = 0  
Output: A:BC = Quotient, HL = Remainder
```assembly
	slia	c	; unroll 24 times
	rl	b		; ...
	rla			; ...
	adc	hl,hl	; ...
	sbc	hl,de	; ...
	jr	nc,$+4	; ...
	add	hl,de	; ...
	dec	c		; ...
```

### Restoring 32-bit / 8-bit Unsigned

Input: DE:HL = Dividend, C = Divisor, A = 0  
Output: DE:HL = Quotient, A = Remainder
```assembly
	add	hl,hl	; unroll 32 times
	rl	e		; ...
	rl	d		; ...
	rla			; ...
	cp	c		; ...
	jr	c,$+4	; ...
	sub	c		; ...
	inc	l		; ...
```

## Integer Square Root

Although square roots don't appear in the code as often as multiplication or division, they represent a challenging problem when there's actual need for such calculation. From a coder's point of view it's interesting to explore the set of different approaches one can take and evaluate their pros and cons. Talking about integer square root, let's be specific what it means: given radicant N, the square root of N is the largest integer X that satisfies the condition X * X <= N.

### Basic 8-bit Square Root

As mentioned earlier in the chapter Integer Multiplication, integer squares can be generated iteratively by adding consecutive odd numbers. The simplest way to calculate square root is then just a reverse of this process; take a number and subtract successive odd integers from it. Number of iterations it takes until the result is negative is the radix.

Input: A = Radicand  
Output: B = Radix
```assembly
	ld	b,-1
Sqrt8
	inc	b
	inc	b
	sub	b
	jr	nc,Sqrt8	; use JP to save 2 T
	srl	b		    ; translate (2X + 1) to X
```

### Basic 16-bit Square Root

This routine is based exactly on the same method, except in 16-bits it's more effective to add negative number rather than to subtract it. The simplicity and virtually no memory requirements are the main advantages of this algorithm. The obvious shortcoming is running time; the time used is proportional to the magnitude of radix.

Input: HL = Radicand  
Output: A = Radix
```assembly
	ld	a,-1
	ld	d,a
	ld	e,a
Sqrt16
	add	hl,de
	inc	a
	dec	e
	dec	de
	jr	c,Sqrt16	; use JP to save 2 T
```

### Restoring 16-bit Square Root

This elegant algorithm is similar to restoring division. One root digit is generated per iteration such that the partial root converges to the correct answer. Unlike in division, the "divisor" changes as solution progresses and two new digits are shifted into the partial remainder at a time.

Let R be the current remainder and X be the square root approximation found so far. The area that remains is then (R - X^2) and our new remainder becomes R' = 4 * (R - X^2) + AB, where AB are the next two radicand digits. We want to find a better root approximation by adding the largest new digit D such that (2X + D)^2 <= R' + 4X^2 (note that 2X represents shift one digit left in binary and 4X^2 is the area we subtracted in the previous step). This is identical to 4X^2 + 4XD + D^2 <= R' + 4X^2, or even better (4X + D) * D <= R'. In binary, the largest D we can try is 1 so our formula reduces to (4X + 1) <= R' and the trial step becomes R' - (4X + 1). If the result is non-negative, a "1" is generated. Otherwise a "0" is generated and the remainder is restored. Another simplification introduced by binary is that (4X + 1) is nothing else but "01" appended to the partial root.

I recommend searching the web for "integer square root algorithm" if you want to gain more thorough understanding of the math behind it. I created a figure that might help you to understand the basic idea from a geometric point of view.

Input: L:A = Radicand, Carry = 0  
Output: D = Radix
```assembly
	ld	de,0040h	; 40h appends "01" to D
	ld	h,d

	sbc	hl,de		; unroll 7 times
	jr	nc,$+3		; ...
	add	hl,de		; ...
	ccf				; ...
	rl	d			; ...
	rla				; ...
	adc	hl,hl		; ...
	rla				; ...
	adc	hl,hl		; ...

	...

	sbc	hl,de		; optimised last iteration
	ccf
	rl	d
```

### 16-bit Square Table Bisection

Although this method works best on processors with native multiply instruction, it's applicable to Z80 too. The algorithm is a trial and error process: starting with the most significant bit of the intermediate result X, we set the bit to "1" and check whether X * X <= radicand; if the test fails, we correct the bit to "0". Then we progress to the next lower bit (if any) and repeat the procedure. On a Z80, squaring is done best with 512 byte long lookup table (the algorithm in fact performs bisection search on it). This method should be marginally faster than the restoring algorithm but requires more memory.

_Note: We can achieve better code optimisation if the table entries are negative (ADD HL,DE is faster than SBC HL,DE). This requires only a minor modification to the square table generator presented in the chapter Integer Multiplication. Table must be aligned to 256 byte boundary._

```assembly
	ld	hl,NegSqrTab	; must be a multiple of 256
	ld	b,l
	ld	c,l		; BC holds odd numbers
	ld	d,l
	ld	e,l		; DE holds squares

SqrGen
	ld	(hl),e
	inc	h
	ld	(hl),d		; store x^2
	dec	h
	ex	de,hl
	dec	bc
	add	hl,bc		; add next odd number
	dec	c
	ex	de,hl
	inc	l
	jr	nz,SqrGen
```

Now for the actual square root code. First, we will take a look at compact (but slower) version:

Input: DE = Radicand  
Output: A = Radix
```assembly
	xor	a
	ld	b,128

BiSqrt
	xor	b		; set the trial bit
	ld	h,NegSqrTab/256
	ld	l,a
	ld	c,(hl)
	inc	h
	ld	h,(hl)
	ld	l,c		; HL = A * A
	add	hl,de		; HL < DE ?
	jr	c,BitOK
	xor	b		; reset bit if the test fails
BitOK
	srl	b
	jr	nc,BiSqrt	; use JP to save 2 T
```

And here's the full-blown unrolled version. The immediate operands in each iteration are 128, 64, 32, 16, 8, 4, 2 and 1.

```assembly
	ld	b,NegSqrTab/256

	ld	a,128		; optimised 1st iteration
	ld	h,b
	ld	l,a
	ld	c,(hl)
	inc	h
	ld	h,(hl)
	ld	l,c
	add	hl,de
	jr	c,$+3
	xor	a

	xor	64		; unroll 7x (but change immediate operands!)
	ld	h,b		; ...
	ld	l,a		; ...
	ld	c,(hl)		; ...
	inc	h		; ...
	ld	h,(hl)		; ...
	ld	l,c		; ...
	add	hl,de		; ...
	jr	c,$+4		; ...
	xor	64		; ...
```

## Random Number Generators

### 8-bit Random Number Generator

This is a very simple linear congruential generator. The formula is x[i + 1] = (5 * x[i] + 1) mod 256. Its only advantage is small size and simplicity. Due to nature of such generators only a couple of higher bits should be considered random.

Input: none  
Output: A = pseudo-random number, period 256

```assembly
Rand8
	ld	a,Seed		; Seed is usually 0
	ld	b,a
	add	a,a
	add	a,a
	add	a,b
	inc	a		; another possibility is ADD A,7
	ld	(Rand8+1),a
	ret
```

### 16-bit Random Number Generator

This generator is based on similar method but gives much better results. It was taken from an old ZX Spectrum game and slightly optimised.

Input: none  
Output: HL = pseudo-random number, period 65536

```assembly
Rand16
	ld	de,Seed		; Seed is usually 0
	ld	a,d
	ld	h,e
	ld	l,253
	or	a
	sbc	hl,de
	sbc	a,0
	sbc	hl,de
	ld	d,0
	sbc	a,d
	ld	e,a
	sbc	hl,de
	jr	nc,Rand
	inc	hl
Rand
	ld	(Rand16+1),hl
	ret
```

## Conversions Between Numbers and Strings

### 16-bit Integer to ASCII (decimal)

Input: HL = number to convert, DE = location of ASCII string  
Output: ASCII string at (DE)
```assembly
Num2Dec
	ld	bc,-10000
	call	Num1
	ld	bc,-1000
	call	Num1
	ld	bc,-100
	call	Num1
	ld	c,-10
	call	Num1
	ld	c,b

Num1
	ld	a,'0'-1
Num2
	inc	a
	add	hl,bc
	jr	c,Num2
	sbc	hl,bc

	ld	(de),a
	inc	de
	ret
```

### 16-bit Integer to ASCII (hexadecimal)

Hexadecimal conversion operates directly on nibbles and takes advantage of nifty DAA trick.

Input: HL = number to convert, DE = location of ASCII string  
Output: ASCII string at (DE)
```assembly
Num2Hex
	ld	a,h
	call	Num1
	ld	a,h
	call	Num2
	ld	a,l
	call	Num1
	ld	a,l
	jr	Num2

Num1
	rra
	rra
	rra
	rra
Num2
	or	F0h
	daa
	add	a,A0h
	adc	a,40h

	ld	(de),a
	inc	de
	ret
```

### Memory dump (hexadecimal)

As this is one of the most typical tasks, why not to do it tricky way? The code snippet here takes a byte from (HL) and prints it. Note that it uses another (shorter) DAA trick as we know that Half Carry is cleared before DAA.

Input: HL = address of data  
Output: memory dump

_Note: You'll have to replace the PRINT_CHAR macro by actual platform-specific code. Don't forget to preserve the contents of HL!_
```assembly
	xor	a
	rld
	call	Nibble

Nibble
	push	af
	daa
	add	a,F0h
	adc	a,40h

	PRINT_CHAR		; prints ASCII character in A

	pop	af
	rld
	ret
```

## Cyclic Redundancy Checks (CRC)

### 16-bit CRC-CCITT

The following routine calculates standard CRC-CCITT bit-by-bit using polynomial 1021h. Another common scheme CRC-16 uses polynomial A001h and starts with value 0 (so it's likely that you misinterpret bunch of zeros as valid data). It might be useful to extend the code to use 16-bit byte counter.

Input: DE = address of input data, C = number of bytes to process  
Output: HL = CRC
```assembly
Crc16
	ld	hl,FFFFh
Read
	ld	a,(de)
	inc	de
	xor	h
	ld	h,a
	ld	b,8
CrcByte
	add	hl,hl
	jr	nc,Next
	ld	a,h
	xor	10h
	ld	h,a
	ld	a,l
	xor	21h
	ld	l,a
Next
	djnz	CrcByte
	dec	c
	jr	nz,Read
	ret
```

### Table Driven 16-bit CRC-CCITT

_Note: I haven't tested the results yet so there might be a bug somewhere (most likely wrong polynomial producing bad results)._

This is a much faster equivalent of the previous routine. It processes one byte at a time using 512 byte long table. There is a change in algorithm though. Intermediate results are shifted right and polynomial is reversed. It means that even results are reversed (the most significant bit is actually the least significant one and vice versa). Depending on actual use this might be a problem or not (for example, it's suitable if you interoperate with hardware as UARTs send least significant bit first). Even if you decide to adjust result back to correct value, you should still gain more than you loss.

Input: HL = address of input data, BC = number of bytes to process  
Output: DE = CRC

_Note: CrcTab must be aligned to 256 byte boundary. Table generator uses reverse of 1021h, that is 8408h._
```assembly
Crc16
	ld	d,FFh
	ld	a,e
Read
	xor	(hl)
	ex	de,hl
	ld	l,a
	ld	a,h
	ld	h,CrcTab/256
	xor	(hl)
	inc	h
	ld	h,(hl)
	ex	de,hl
	cpi
	jp	pe,Read
	ld	e,a
	ret
```

CRC table generator:
```assembly
	ld	hl,CrcTab
CrcGen
	ld	d,0
	ld	e,l
	ld	b,8
CrcByte
	srl	d
	rr	e
	jr	nc,Next
	ld	a,d
	xor	84h
	ld	d,a
	ld	a,e
	xor	08h
	ld	e,a
Next
	djnz	CrcByte
	ld	(hl),e
	inc	h
	ld	(hl),d
	dec	h
	inc	l
	jr	nz,CrcGen
	ret
```

### 32-bit CRC-32
(to do)

### Table Driven 32-bit CRC-32
(to do)

## Credits

My thanks goes to the following people who contributed to this document:

- Slavomir "Busy" Labsky
- Pavel "Zilogator" Cimbal
- Norbert "Noro" Grellneth
- Tomas "Universum" Vilim
- Patai "CoBB" Gergely
- Lawrence Chitty
- Petr "Poke" Petyovsky
- David Revelj
- Dan Englender
- Ricardo Bittencourt

## Source

https://map.grauw.nl/sources/external/z80bits.html
