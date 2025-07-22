# Screensplit programming guide

Programming screensplits can be tricky, even more so if you want them to work on the different types of MSX computers and CPU speeds. Therefore this article was compiled, so that programmers can easily find detailed information about all ups and downs, buts, and possibilities and impossibilities of screensplits. If you have a suggestion, please mail us about it!

About the measurements, those of HR in particular: I have been pointed to some errors and accuracy improvements (some bordering the obvious, argh -_-;;). So don't take them for granted yet, I'll create new measurements. The rest still stands, ofcourse ;p. Update coming (somewhat) soon!

- [What is a screensplit?](#what-is-a-screensplit)
- [What are HBLANK and VBLANK?](#what-are-hblank-and-vblank)
- [How accurate is this article?](#how-accurate-is-this-article)
- [How accurate is the HBLANK (HR) bit in s#2?](#how-accurate-is-the-hblank-hr-bit-in-s2)
- [When does the VDP line interrupt (FH) start?](#when-does-the-vdp-line-interrupt-fh-start)
- [Which splits are 'seamless'?](#which-splits-are-seamless)
- [How to make a tidy screen split with a blank line?](#how-to-make-a-tidy-screen-split-with-a-blank-line)

- [Tip: Split timing](#tip-split-timing)
- [Tip: Screensplit on MSX1](#tip-screensplit-on-msx1)
- [Tip: Spritesplit](#tip-spritesplit)
- [Tip: Scrollsplit (using r#23)](#tip-scrollsplit-using-r23)

## What is a screensplit?

A screensplit can be made by changing certain attributes of the VDP while it is still displaying. The VDP will immediately reflect the changes on what it's displaying, and with that you can achieve some marvellous things you otherwise won't be able to do with the v9938. For example, it is possible to let the VDP show page 0 on the first half of the screen, and page 1 on the second half. This is called a pagesplit. There are also other kinds of splits, for example a palettesplit (so you can use 32+ colors in screen 5), a modesplit (screen 4 for the play area, screen 5 for the score), a spritesplit (show more than 32 sprites), a scrollsplit, etc.

The v9938 has a feature which can set a flag when it arrives at a specified line, or even generate an interrupt. This is done by setting the split line in r#19, and then checking the FH flag in s#1. If you enable the E1 bit in r#0 the VDP will generate an interrupt.

## What are HBLANK and VBLANK?

The screen as it displays on your screen has borders around it, which are rendered in 1 single border color. During this border rendering the VDP is either in Vertical Blanking or Horizontal Blanking state. The borders on the left and right are rendered during HBLANK, which only lasts a short while, and the borders on the bottom and top are rendered during the VBLANK period, which lasts relatively long. For details on how long they take exactly, refer to appendix 7 of the v9938 application manual.

Whether the VDP is in VBLANK or HBLANK state can be found out by checking the VR and HR bits in status register 2 (bits 6 and 5). For screen split programming, the HBLANK period is particularly important. The bits are set to 1 during the blanking period.

## How accurate is this article?

I tested the statements made in this article with a number of carefully programmed and optimized programs on an NMS8245 with a v9958 videochip, at aswell 7MHz as 3.5MHz (logically, 7MHz gave me the most exact readings). If you want to verify my findings, download the [split accuracy tests](https://map.grauw.nl/downloads/articles/splittests.lzh).

## How accurate is the HBLANK (HR) bit in s#2?

I have been pointed to some errors and accuracy improvements (some bordering the obvious, argh -_-;;). So don't take them for granted, I'll create new tests. It seems that HR is pretty accurate after all. It is 1 during HBLANK. I commented out the incorrect part of the original text for the time being. If you must read it, you can check the source of this page.

Example code to poll for the end of HBLANK, assumes disabled interrupts and s#2 to be set:

```assembler
Poll_1:
    in a,(#99)      ; wait until start of HBLANK
    and %00100000
    jp nz,Poll_1
Poll_2:
    in a,(#99)      ; wait until end of HBLANK
    and %00100000
    jp z,Poll_2
```

## When does the VDP line interrupt (FH) start?

The VDP lineinterrupt is linked to the FH bit, and the interrupt occurs when the FH bit is set. The FH bit will be set at the exact beginning of the line in r#19 + 1, so that's the line after the line set. If register 19 contains the value 99, the lineinterrupt will occur at the utter left of line 100, inside the left border (which is about halfway the horizontal blanking period).

Note about the v9958: if you scroll the screen horizontally, the split will occur a few pixels later. However this is really negligible, it is probably the VDP starting displaying the line a couple of pixels later, depending on the H0-H2 bits of the scroll register.

When using interrupts the interrupt initialization will also take some time, and in practice the VDP will already be displaying the line by the time the actual split code is executed. Even a the minimal setup, a JP at address #38 and starting with a PUSH AF, already takes a rough ten pixels extra. Also, in order to make the actual split occur as fast as possible, you will probably have a little code which sets up the needed data, perhaps using some self-modifying code or a memory area in combination with indirect register access and OUTI's. This code does not take the same amount of time on each processor, on a 3.5MHz MSX it may take 3 lines, but on a 7MHz one only 2, and on a R800 even 1. In other words, unless an MSX at 3.5MHz (worst case) only needs 1 line for its initialization you can't really expect the VDP to have arrived at line 103 at the end of the CPU's initialization. Because of that it is often a good idea to poll for a new linesplit at line 103, to make sure the split executes on the same line with every CPU.

Example code for polling FH, assumes disabled interrupts and s#1 to be set:

```assembler
    ld a,(VDP+23)   ; set split line
    add a,SPLITLINE
    out (#99),a
    ld a,19+128
    out (#99),a
    nop             ; don't access too fast
Poll:
    in a,(#99)      ; poll until line reached, also clears FH bit
    rra
    jp nc,Poll
```

Ofcourse, when not using this code in an interrupt routine you shouldn't keep the interrupts disabled in the polling loop all the time.

## Which splits are 'seamless'?

First of all, what is seamless? With seamless I am referring to the screen splits whose effect gets delayed by the VDP until the end of the current line, and therefore they always look pretty. As far as I can tell, there are two kinds of splits which are 'seamless', those are screen mode splits (does not include setting new table values) and screen blank splits using bit 6 of r#1. Although the screen mode splits themself are 'seamless', because the table base address registers aren't you still need to put a little effort in it. Often you'll only have to update r#0, r#1 (the mode registers) and r#2 (the pattern name table, the only one used in splits with screens 5 and up), which by the way makes it particularly fit for indirect register access. Might come in handy when you just need that one touch of extra speed.

Anyways, as I said before, the mode bits themselves are seamless, but r#2 is not, so you still need to find a means to update r#2 in an invisible manner. The first option you should consider is arranging your data so, that you don't need to change the r#2 value at all. When splitting between mode 4 and mode 5 for example, use %00011111 as the r#2 value. In screen 5 this means base address #0000 (page 0), while in screen 4 this means base address #7C00. In screen 5 the #7C00 area is located in the VBLANK area past line 212, so it won't be visible there.

If that doesn't work out there are still a number of other options. It is easiest to insert a clean blanked line (depending on your background color, usually black) as described below. Then there is the option of adapting the images on screen to the split instead of the other way around. In other words, add a line which looks the same in both screen modes, or in case of for example a palette split, a line which hasn't got any of the palette colors which you're changing in it.

Only if you are really out of luck and there's no other acceptable option there's the last option: using the HR bit. Again, because it's requires processor-dependant timing this is absolutely not my favorite solution. Anyways, if you wait for HR to indicate HBLANK, then execute the mode split, which requires 2 VDP register updates - should be enough to get you in the *real* HBLANK period (and because of speed limiters in the current faster MSX models register updates use about the same processor time). After that you should be able to update one or two table entries before HBLANK ends again.

## How to make a tidy screen split with a blank line?

This is in my opinion the best way to have a screensplit. It looks very tidy, it is easy to program and doesn't require any 'special' (read: difficult or processor-dependant) timing. Basically, there will just be a black line at the spot of the split, but you won't have to put that line in your images, although you ofcourse have to keep it into account when drawing them and designing your screen's layout.

During the split you can basically do everything without it becoming visible, per line there is the time to set values in 4 VDP registers, or 8, if you're able to use indirect register access, update 8 palette entries, etc. If you do more register updates a 2nd line will be added... it might be that on a 7MHz MSX it only needs 1 line while it needs 2 on a 3.5MHz MSX - you'll have to take that into account in your design, although consecutive OUT instructions to the VDP execute at pretty much the same speed on all existing MSX CPU's. If you are updating the palette but only the first couple of colours are used on the line after the split, you can make the blank line end before you're done, and update the rest of the palette colors on the next 'normal' line.

The 'blank split' can be made by first selecting status register 2, then polling for HBLANK (!HR) and after that for HR. This ensures you you are not in a HBLANK period. Now you can disable your screen with bit 6 of r#1 and now you'll have to wait for the end of the next HBLANK first before the black line takes effect. So, poll !HR and then HR again (or perhaps use FH?). From now on the screen is disabled, and you can execute the necessary split instructions. End the split sequence by enabling the screen again. The screen will enable at the end of the current line, you won't need to do any more polling.

Some example code, which assumes the interrupts are disabled, and doesn't switch back the status register afterwards:

```assembler
;
; A macro definition which waits until the end of the next/current HBLANK...
;
Wait_HBLANK:
    MACRO           ; (this macro is Compass-formatted)
WHL1_@sym:
    in a,(#99)      ; wait until start of HBLANK
    and %00100000
    jp nz,WHL1_@sym
WHL2_@sym:
    in a,(#99)      ; wait until end of HBLANK
    and %00100000
    jp z,WHL2_@sym
    ENDM
```

```assembler
;
; The routine performing the screensplit
;
Split:
    ld a,2
    out (#99),a
    ld a,15+128
    out (#99),a
    nop
    Wait_HBLANK
    ld a,(VDP+1)    ; disable screen (reset bit 6)
    and %10111111
    out (#99),a
    ld a,1+128
    out (#99),a
    nop
    Wait_HBLANK

    ...             ; do your split stuff

    ld a,(VDP+1)
    out (#99),a
    ld a,1+128
    out (#99),a
```

## Tip: Split timing

One should take the fact that an MSX doesn't necessarily run at 3.5MHz in consideration as much as possible. A lot of people have 7MHz builtin, a turboR in R800 mode runs even faster, and who knows there are people using even faster processors in their MSX-es in the future. In other words, test at 3.5MHz (worst case), but if possible also on a higher speed, and whenever possible, don't let your timing depend on the processor's instruction execution speed. Synchronize your split on the FH (in s#1) and HR (in s#2) bits, and if possible use a split's 'seamless' properties. This is quite possible and although there may be some extra work in it, you are ensured that your program works correctly on all current and future MSX computers. Granted, the horizontal screensplit in the scope part of Unknown Reality would be really hard to code without processor-dependant timing (although they might/could have used the deviation of the HR bit)... But I doubt you will ever use a split like that.

## Tip: Screensplit on MSX1

Another method of linesplits, which can even be used on MSX1 (!), is to use sprites and the 5th sprite/collision bits. The basic idea is that you can put 5 sprites on 1 line, or 2 overlapping sprites at the spot where you want the split to occur, and then poll the appropriate bit in the status register. As soon as the line where the 5th sprite is on is encountered, this bit is set, so you can time quite precisely with this. The collision bit is even set at the spot where the sprites collide, although apparantly it is a bit unstable, it might just be precise enough to achieve horizontal splits!! (being splits which run vertically but are timed horizontally :)). You will then need to respond very fast though, which you might be able to do by using in f,(c) instructions and then checking the parity. Will require some clever coding ^_^. The 5th sprite and collision bits are reset after they're read. Thanks to Eli-Jean Leyssens aka Kanima for the tip. The trick will be used in his -at the time of writing- upcoming demo for MSX1...

## Tip: Spritesplit

If you are creating a spritesplit, you should keep the entries of the sprites which are displayed on the line of the split unchanged in both the pattern and the attribute table (or duplicate them if you change table addresses). This MUST be done, making a spritesplit will otherwise be a hard if not impossible job, which will certainly not work on every type of MSX. Oh, and remember, the spritedata is read one line BEFORE the actual display line. So if you change sprite tables on the split line, the first line with sprites will be one line lower.Thanks to Patriek Lesparre for the info.

## Tip: Scrollsplit (using r#23)

If you have a split and are changing the vertical scrollregister (r#23) on it, then you should always re-set the splitline (r#19). This because the splitline is calculated from line 0 in the VRAM, and not from line 0 of the screen. In order to set the splitline to the 'screenline' it's easiest to simply add the value of r#23 to it.

Next you should also consider the possibility that the VDP coincidentally arrives at the 'wrong' line right between setting the r#23 and r#19 registers. Sure, the change is small, somewhat processor-dependant, and can depending on the case be ruled out entirely, but it's best to keep it into account anyways. Therefore, read out the value of s#1 before you enable the interrupts again, which will reset the linesplit bit in FH. You should only leave it out if you are absolutely sure a lineinterrupt won't occur inbetween.

In case you don't want to re-set the splitline, for example because it will be set back at a later time during the building of the screen, that's also possible, but then you should disable the splitinterrupt E1 during that period (reset bit 4 of r#0), and when r#23 is set back, read out s#1, and only then enable E1 again. This will prevent the occurrance of an additional lineinterrupt which will otherwise be reasonably likely to occur.

~Grauw

## Source

https://map.grauw.nl/articles/split_guide.php
