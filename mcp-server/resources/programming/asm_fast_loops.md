# Z80 programming techniques - Loops

Here I will discuss two methods to drastically increase the execution speed of different kinds of loops in assembly.

- [Fast 16-bit loops](#fast-16-bit-loops)
  - [Variable length loops](#variable-length-loops)
- [Unrolling OTIRs and such](#unrolling-otirs-and-such)
  - [Making LDIR 21% faster](#making-ldir-21-faster)

## Fast 16-bit loops

Often 16-bit loops are done like this:

```assembler
    ld de,nnnn
Loop:
    ; ... do something here
    dec de
    ld a,d
    or e
    jp nz,Loop
```

Here DE counts down and D and E are OR-ed to check if the loop has completed. However there’s a much faster way to loop. In fact, looping with 16 bit counters can be as fast as with 8 bit counters. Surprised? Let me explain.

When you use a standard Z80 8-bit loop command like DJNZ, or OTIR, etc. the value of B is decreased until it reaches 0. If you want to loop 256 times, you can set the value of B to 0. So what happens if you loop 24 times, and then loop again? You’ll have looped 280 times!

This is the core of the technique. Given a 16-bit number with an MSB (the higher 8 bits) and an LSB (the lower 8 bits), you start off by looping the amount of times given by the LSB, and when B reaches 0 you do it again MSB times, each of which will loop it 256 more times. An example:

```assembler
    ld b,10         ; The LSB of the loop is 10
    ld d,3          ; The MSB of the loop + the first loop is 3
Loop:
    ; ... do something here
    djnz Loop
    dec d
    jp nz,Loop
```

This will loop 522 times (50AH).

Now the real story is a little more complex than described above. As you can see the outer loop counter is the MSB + 1. However this is not always the case. Consider this: to loop 511 times (1FFH) you have to use B = 255 and D = 2, one loop of 255 iterations and then another of 256. However to loop 512 times (200H) you have to use B = 0, but D = 2 still! In general, the rule is as follows: B is the LSB, and D is the MSB increased by 1 unless B equals zero. Without this exception for a zero LSB, you will loop 256 times too often.

Let’s compare the speed of this loop with a ‘common’ 16-bit loop. Speed on the Z80 is measured in T-states, also known as clock ticks or cycles. For an overview of T-states for each instruction, check the “Timing Z80+M1” column in the instruction set overview.

The common loop in the first example uses 4 instructions to loop, which add up to a total of 28 T-states per iteration. Looking at the fast loop however, the inner loop uses only a DJNZ instruction which takes 14 T-states, just like a normal 8-bit loop. Once every 256 iterations it also executes the outer loop which takes a little longer but still less than the common loop: 25 T-states. Because the outer loop is executed so infrequently, its cost is negligible and overall we can say the fast loop is twice as fast as the common one.

The biggest downside of the fast loop is that it is no longer easy to see at a glance how many iterations the loop performs. You should probably add a comment next to the counter values to mention the total number of loops.

### Variable length loops

If you want to have fast loops with a variable counter value, you can calculate the correct values for B and D. This could be done using a conditional increase of the MSB, however that requires a compare and a jump which isn’t the fastest way to do go about it. In stead, you can use the following calculation which takes the counter value in DE and puts the resulting separated counters in D and B:

```assembler
    ld b,e          ; Mystery fast loop calculus
    dec de
    inc d
```

That’ll take just 17 T-states to precalculate the values, and compared to the slow 16-bit loop you’ll regain those after a loop or two.

So, to summarize, a full-fledged fast 16-bit loop looks like this:

```assembler
    ld b,e          ; Number of loops is in DE
    dec de          ; Calculate DB value (destroys B, D and E)
    inc d
Loop:
    ; ... do something here
    djnz Loop
    dec d
    jp nz,Loop
```

## Unrolling OTIRs and such

When you want to send a block from your memory to a certain port, you can use the OTIR instruction. With this instruction you can specify the number of bytes to output. This is for example used in routines which execute VDP commands, where the part which sends the command usually looks like this:

```assembler
    ld hl,command   ; the address where the VDP command is stored
    ld c,9BH        ; the VDP port to write to
    ld b,15         ; the number of loops (yes, ld bc,0F9BH is faster)
    otir
```

However, if you know in advance how many loops the otir will go through, and if you don’t care too much about wasting a little space, you can also use the OUTI instruction instead of the OTIR instruction. OUTI doesn’t loop automatically, but it does its work in 18 T-states, 5 cycles faster than OTIR which needs 23 T-states per loop. So if you just unroll the OTIR in the example above using 15 OUTIs, it saves you 5 T-states per loop (except for the last one). That adds up to a grand total of 70 T-states out of 340, about 21% faster. Here’s how that looks:

```assembler
    ld hl,command
    ld c,9BH
    outi            ; 15x OUTI
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
    outi
```

To make this look a little more compact, many assemblers supports a repeat directive, something like:

```assembler
    REPEAT 15
    outi
    ENDR
```

Check your assembler’s manual for the precise syntax, it varies and as such this directive is not portable across assemblers.

See this article for a more complete example to execute VDP commands.

### Making LDIR 21% faster

Now, on with the lesson. Aside from OTIR you can also unroll other things. INIR, LDIR and LDDR will also greatly benefit from this method, and sometimes it is also beneficial to unroll normal loops which use DJNZ, JR or JP.

In the case of LDIR however, the number of loops is often too large to simply use an LDI that number of times. That would take up too much space. So what we can do instead is to unroll only part of the loop. Say, we need to LDIR something 256 (100H) times. Instead of LDIR we could write:

```assembler
    ld bc,256
Loop:
    ldi  ; 16x LDI
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    jp pe,Loop  ; Loop until bc = zero
```

This method is almost 19% faster than an LDIR. Quit a significant performance gain! Note that LDI sets the parity flag to even as long as BC != 0. The jump at the end adds a little extra overhead, you can increase the number of LDIs to gain an additional few percents of speed up to almost 22%, however 16 is a nice compromise between speed and code size.

However, as you might already have noticed, this will only work if the number of loops is a multiple of 16. If it’s not, BC will never be 0 at the end of a series of 16 LDIs and we’ll end up in an endless loop followed by a reset or crash because eventually it’ll overwrite itself or system memory. That’s not what we want. If the number of loops is known in advance, it’s easiest to just put some additional LDIs before the loop.

However if the number of loops is unknown, or you simply want a faster but generic alternative for LDIR, you could try and detect when the last loop is started, and in that case let a ‘normal’ LDIR handle the last few loops. Well, that isn’t too hard, it can be handled using a few compares.

A faster and slightly trickier method is to jump inside the series of LDIs based on the count modulo the number of unrolled instructions. This is put into practice in the following example:

```assembler
;
; Up to 19% faster alternative for large LDIRs (break-even at 21 loops)
; hl = source (“home location”)
; de = destination
; bc = byte count
;
FastLDIR:
    xor a
    sub c
    and 16 - 1
    add a,a
    di
    ld (FastLDIR_jumpOffset),a
    ei
    jr nz,$  ; self modifying code
FastLDIR_jumpOffset: equ $ - 1
FastLDIR_Loop:
    ldi  ; 16x LDI
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    ldi
    jp pe,FastLDIR_Loop
    ret
```

It first calculates the number of loops modulo the LDI series size, then uses a self modifying relative jump to start at the appropriate position in the LDI series. The set-up does add some overhead, the break-even point compared to a normal OTIR is at 21 loops. Over a large number of iterations the performance gain is 19%, quite a lot I think so I hope it’ll be of some use.

~Grauw

## Source

https://map.grauw.nl/articles/fast_loops.php