# Keyboard matrices

The key matrix is a matrix of 11x8 bits in which the currently pressed keys on the keyboard are indicated. This document contains an overview of all the available keymatrices, since they can be slightly to very different for different types of MSX computers. Also it discusses several oddities about using the keyboard matrix on MSX, and how to read it.

## The keyboard version value

There is a keyboard version information value at bits 0-3 of address #002C in the BIOS, of which the values can be:

|Value|Keyboard version|
|:-:|---|
|0|Japanese|
|1|International (QWERTY/other)|
|2|French (AZERTY)|
|3|English|
|4|German (DIN)|
|6|Spanish / Argentinian|

However, this value isn't really useful to determine which key matrix layout you have to use. Daniel Caetano reported having encountered several MSX computers where this was the case:

- The problem resides in the fact the relation line/column -> ASCII is NOT default. It seems to be different on several machines, even if they are from the same country and have similar keyboard. The result is: in some computers, the keys act as expected (when you press the "A" key, the A appears on the screen). But on other computers, when you press the "A" key, something different appears (say, an "8" is shown).
- Before someone asks me, I know the byte 0x002C of ROM tells me the keyboard type. But this means nothing. On computers with the same value for this byte, the answer of the key matrix was different one from another. )^=

Anyways, I think – and Daniel agreed with me on this – that at least rows 6-10 are pretty much equal on all MSX models (though many have no num pads), since they are used very often in games and people would notice immediately that certain games had their keyboard layout all mixed up. But the other rows are not. Anyways, take care, and if you're not sure you can always just use the BIOS routines for it.

So what is the keyboard version byte useful for then?? It doesn't indicate the matrix layout, but it does indicate the layout as it is presented to the user. So it might be somewhat useful if you need to determine where which keys are located on the keyboard. For example if you want to use the AWSD keys as a secondary set of 'cursor keys' for a 2nd player, it would be interesting to know whether the player used a standard QWERTY keyboard or an AZERTY one (in which case the game should respond to the QZSD keys instead). But, in practice this isn't all there is to the story either. As you can see on the picture of the Russian keyboard below, the key layout isn't at all like QWERTY, but still that particular MSX's BIOS indicates the layout as '1' (international). Grmbl, they should have defined a 5th (Russian JCUKEN) layout! Or at least an 'Other' setting, instead of putting it under International.

## Japanese layouts

Similar to the QWERY vs. AZERTY layouts on roman keyboards, Japanese computers also have two kinds of kana key mappings, where the characters are located at different places. One is called the JIS-layout, the other the ANSI-layout. In JIS, the Japanese kana characters are ordered like our QWERTY keyboards – all mixed up, presumably ordered to make the most freqently used characters easily accessible (or was it to prevent typing errors... well, never mind that). The ANSI layout in the contrary is ordered very logically, like a hypothetical roman ABCDEF keyboard.

I find it easiest to visually distinguish between the two by looking at the location of the very recognizable 'no' (の) character. On a JIS keyboard, it is among the letters, at the K. On an ANSI keyboard, it's on the numbers row, at the 0. Note by the way that some keyboards show katakana characters instead of hiragana (such as the Sanyo Wavy 70FD), so there you need to look for a 'no' written as ノ. Must be very uncomfortable by the way, having two majorly different keyboard layouts. Ahwell.

It seems the most common computers use JIS, the turboR computers for example, but there are also quite a few which use ANSI. Fortunately, you do not have to guess about this. Bit 6 of PSG port A (register 14, read-only) indicates which of the layouts you should use. A 1 means the keyboard is JIS, a 0 means it is ANSI.

|PSG Register|Description|
|---|---|
|14|bit 6: Keyboard layout (1=JIS, 0=ANSI)|

## Key Ghosting

There is a limitation in most if not all MSX keyboards, which causes the effect known as 'key ghosting'. This means that sometimes the matrix indicates a key you didn't actually press as being pressed. If you for example try pressing SHIFT+S+X, there is a good chance that it will cause F1 to get 'pressed' aswell. Likewise, C+D+SPACE will also cause HOME to be pressed. The cause for this does not lay in a flaw in the MSX hardware, but rather in the keyboard itself. One could strongly reduce the happening of key ghosting by adding a series of diodes to the keyboard, however for some reason most, if not all, MSX manufacturers decided not to do so. Probably because it would require a fair number of added diodes :).

I'll now try to explain why this effect occurs. Let's start off with presenting you the following part of the (international) keyboard matrix layout, and please note that the highlighted keys are in the same two columns:

||bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|---|---|---|---|---|---|---|---|
|**row 5**|Z|Y|X|W|V|U|T|S|
|**row 6**|F3|F2|F1|CODE|CAPS|GRAPH|CTRL|SHIFT|

First off, some explanation about how a common MSX keyboard works. The keyboard has 11 row wires inside, and depending on the value in the row select register it will put power on one of the ten wires. To each of these ten wires, their 8 corresponding keys are connected. Furthermore, there are also 8 column wires in the keyboard, these connect all keys in the same column. Now, if for example row 6 is selected, and SHIFT is pressed, the switch below it will connect row wire 6 with column wire 0, and power will start to flow, which is detected and is put into the row read register as a 0.

So far, all is fine. However part of the problem starts to occur if you press the S key aswell (or any key connected to the same column wire). In that case, power flows from the row 6 wire through the SHIFT key into the column 0 wire, but then it will also flow from the column 0 wire through the S key into the row 5 wire! So far no real problems yet, as setting row 6 will still result in a 11111110 value in the row read register (meaning SHIFT is pressed), and setting row 5 will do so likewise (meaning S is pressed).

Now imagine that you press the X key aswell. Remember that power is also flowing through row wire number 5, even though row 6 is selected, through the SHIFT and the S keys. If the X key is pressed, it connects the row 5 wire with the column 5 wire, resulting in both column wires 0 and 5 having power on them, and the value 11011110 will be put into the row read register. With the row select register set to 6, this will show up as both SHIFT and F1 being pressed, even though F1 is actually not.

Had there been diodes on the column wires between X / F1 and S / SHIFT then this would not have happened, because then power cannot flow from the SHIFT key to the F1 key through the row 5 wire like that. So if you'd add diodes between all keys on the column wires (that'll be 80 of them, to be precise :)), you would have partial protection against this. The most annoying cases of key ghosting (being typing MSX in capitals and typing CD<space>) would not occur anymore. However it is not complete protection, consider the SHIFT+F1+S scenario for example, it would still ghost the X key. This can be prevented by adding diodes between all keys on the row wires aswell (total diode count is now 157), however even then key ghosting can still occur (try SHIFT+F1+X). So complete protection against this can only be achieved by giving each key a separate wire, which means a much more complex board and controller.

The effect can also be countered in software. By not updating the key matrix in the system area when there are ghosted keys in it, the 'flawed' key combination resulting in a key being ghosted will not be passed through to the underlying program. As key ghosting will only occur if 3 or more keys are being pressed, a fairly simple approach would be to skip the key matrix update if that is the case. However, it is not a very user-friendly approach. The current version of Meridian (at the time of writing) does this, and when typing text in capitals the delay between the actual key press and the key being detected is very annoying. A better approach would be to detect a 'critical' key combination, where a 1st key lies in the same row as a 2nd key, and at the same time that 2nd key is in the same column as a 3rd key. Only in that case key ghosting will occur, and then you can skip the matrix update. If the key matrix is read out into the system memory like that, the nasty effects will be gone, and the only effect it will show is that in some cases a key press is detected a little later than usual.

This still won't allow the SHIFT+S+X combination to be pressed (for that you'd really need a hardware solution), however if you type the phrase 'MSX' a bit fast, and haven't released the S key before you press the X key (which happens to me all the time), at least it will properly write down MSX and not add color 15,4,4' because the F1 key is ghosted.

## Reading the key matrix

The key matrix can be read out through the PPI (part of the MSX engine):

|Port range|Description|
|---|---|
|#AA|bits 0-3: Row select|
|#A9 (read)|Row read (inverted)|

```assembler
    in a,(#AA)
    and #F0         ; only change bits 0-3
    or b            ; take row number from B
    out (#AA),a
    in a,(#A9)      ; read row into A
```

However in general it is much easier to just read out the NEWKEY memory area at #FBE5-#FBEF which the BIOS interrupt routine (or your own interrupt routine) updates. Personally I like to refer to NEWKEY with "keys". Please note that the keyboard matrix is inverted – a 0 means the key is pressed, while a 1 means it isn't. Remember that a lot of keyboards haven't got a numpad, so don't use them for vital controls, or create an alternative (like Konami did in the headhunter game in SD Snatcher).

In the following example I will show you how to read out the space key its status. The space key is located in bit 0 of row 8:

```assembler
keys: EQU #FBE5

;
; Check whether space is pressed
;
Main_ReadKeys:
    ld a,(keys+8)   ; space
    bit 0,a
    jp z,spacepressed

    ...

    ret
```

The key readout itself is pretty trivial, however as you can see, I have put the key readout routines in a subroutine. It is good practice to do this because then the key handlers will in effect be called as subroutines so they can quite with a RET instead of having to manually JP back to the mainloop afterwards... [Go To Statement Considered Harmful](http://www.acm.org/classics/oct95/), eh ;). Actually the real objection against it in this case is that it introduces redundant code (being the "JP main" at the end of each keyhandler), which is bad; if you change something like for example the spot of the main routine which has to be jumped to, all those keyhandler exit jumps need to be changed and it is easy to forget one.

Finally, a small Basic program which you can use for keyboard matrix testing purposes:

```basic
10 DEFINT A-Z:K=&HFBE5:CLS
20 FOR I=0 TO 10:PRINT RIGHT$("0000000"+BIN$(PEEK(K+I)),8):NEXT
30 PRINT CHR$(11):GOTO 20
```

## The key matrix layouts

(this list is still incomplete)

Two things: first of all, to display some key matrices you might need some fonts supporting Japanese characters and symbols, if you don't have them already. Such as MS Gothic (in Japanese Language support) or Arial Unicode MS (comes with MS Office). The other thing is that if there are two characters in a cell, the first is the basic character, and the second is with SHIFT pressed.

### International key matrix

||bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 0|7 &|6 ^|5 %|4 $|3 #|2 @|1 !|0 )|
|row 1|; :|] }|[ {|\ ¦|= +|- _|9 (|8 *|
|row 2|B|A|DEAD|/ ?|. >|, <|` ~|' "|
|row 3|J|I|H|G|F|E|D|C|
|row 4|R|Q|P|O|N|M|L|K|
|row 5|Z|Y|X|W|V|U|T|S|
|row 6|F3|F2|F1|CODE|CAPS|GRAPH|CTRL|SHIFT|
|row 7|RET|SELECT|BS|STOP|TAB|ESC|F5|F4|
|row 8|→|↓|↑|←|DEL|INS|HOME|SPACE|
|row 9|NUM4|NUM3|NUM2|NUM1|NUM0|NUM/|NUM+|NUM*|
|row 10|NUM.|NUM,|NUM-|NUM9|NUM8|NUM7|NUM6|NUM5|

Note: DEAD is the dead key with the accents \`, ´, ^ and ¨. If you press it nothing will happen, but if you press a vowel next, it will put the selected accent above it (example: àáâä). You can pick one of the accents by pressing the dead key alone or in combination with SHIFT, CODE and CODE+SHIFT.

### Japanese key matrix

||bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 0|7 '|6 &|5 %|4 $|3 #|2 "|1 !|0|
|row 1|; +|[ {|@ `|¥ ||^ ~|- =|9 )|8 (|
|row 2|B|A|  _|/ ?|. >|, <|] }|: *|
|row 3|J|I|H|G|F|E|D|C|
|row 4|R|Q|P|O|N|M|L|K|
|row 5|Z|Y|X|W|V|U|T|S|
|row 6|F3|F2|F1|かな¹|CAPS|GRAPH|CTRL|SHIFT|
|row 7|RET|SELECT|BS|STOP|TAB|ESC|F5|F4|
|row 8|→|↓|↑|←|DEL|INS|HOME|SPACE|
|row 9|NUM4|NUM3|NUM2|NUM1|NUM0|NUM/|NUM+|NUM*|
|row 10|NUM.|NUM,|NUM-|NUM9|NUM8|NUM7|NUM6|NUM5|
|row 11²|||||No||Yes||
Notes:

¹ かな is Japanese writing for KANA. Unlike CODE, it is a toggle.  
² Used by Panasonic turboR, FS-A1WX and FS-A1WSX.

As said, Japanese computers have two kinds of kana key layouts, JIS and ANSI. Amongst others the Panasonic FS-A1FX and Sanyo Wavy 70FD have the JIS-layout:

|JIS-layout|bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 0|や ゃ|お ぉ|え ぇ|う ぅ|あ ぁ|ふ|め|わ を|
|row 1|れ|゜ ｢|゛|ー|へ|ほ|よ ょ|ゆ ゅ|
|row 2|こ|ち|ろ|め ･|る ｡|ね ､|む ｣|け|
|row 3|ま|に|く|き|は|い ぃ|し|そ|
|row 4|す|た|せ|ら|み|も|り|の|
|row 5|つ っ|ん|さ|て|ひ|な|か|と|

The ANSI-layout is used by for example Panasonic FS-A1 computers:

|ANSI-layout|bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 0|に|な|お ぉ|え ぇ|う ぅ|い ぃ|あ ぁ|の|
|row 1|も|ろ ｢|れ|る|り|ら|ね|ぬ|
|row 2|と|さ|ん ･|を ｡|わ ､|よ ょ|゜ ｣|゛ ー|
|row 3|み|ふ|ま|そ|せ|く|す|つ っ|
|row 4|け|か|ほ|へ|や ゃ|ゆ ゅ|め|む|
|row 5|た|は|ち|き|て|ひ|こ|し|

These are the mappings for the key combinations with GRAPH:

|GRAPH|bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 0|土|金|木|水|火|月|日|万|
|row 1|♣|○||円||─|千|百|
|row 2|┘||♦|♠|大|小|●|♥|
|row 3||│|時|┤|┼|┌|├|└|
|row 4|┬||π|||分|中||
|row 5||年|╳||┴||┐|秒|

Note: with GRAPH you can enter a couple of common Japanese characters; GRAPH-Y for 'year', GRAPH-S for 'second', and similarly 'hour' and 'minute'. The characters at GRAPH-1 to 7 are the days of the week, and GRAPH-8, 9 and 0 have the characters for 100, 1000 and 10000. GRAPH-\< has the character for 'small', \> has 'big' and GRAPH-L which is physically more or less inbetween \< and \> has the kanji for 'middle'. And finally, GRAPH-¥ is the Yen kanji, and GRAPH-P is Pi.

### Pioneer PX-7 key matrix

The Pioneer MSX with laser-disc player has no num-pad, but does have some extra special-purpose keys. Thanks to Sean Young and Manuel Bilderbeek for the info.

||bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 9||||||super-impose|video|computer|

### UK key matrix

||bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 2|B|A|£|/|.|,|`|'|

All other rows and the CODE- and GRAPH- matrices are equal to the International layout.

### Spanish / Argentinian key matrix

As found in the Talent TPC 310. Thanks go to Flyguille!

||bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 1|ñ Ñ|] }|[ {|\ ¦|= +|- _|9 (|8 *|
|row 2|B|A|DEAD|/ ?|. >|, <|; :|' "|

All other rows are equal to the International layout.

Note: On the Talent TPC 310 you can also enter characters by holding the CTRL key while entering a character number, similar to the ALT + num pad numbers functionality on Windows PCs.

### Russian key matrix

As found in the Yamaha YIS805R and YIS503R. Thanks go to Stanislav Borutsky!

||bit 7|bit 6|bit 5|bit 4|bit 3|bit 2|bit 1|bit 0|
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|row 0|& 6|% 5|¤ 4|# 3|" 2|! 1|+ ;|) 9|
|row 1|V Ж|* :|H Х|- ^ Ъ|= _|$ 0|( 8|' 7|
|row 2|I И|F Ф|? /|< ,|@ Ю|B Б|> .|\ Э|
|row 3|O О|[ { Ш|R Р|P П|A А|U У|W В|S С|
|row 4|K К|J Й|Z З|] } Щ|T Т|X Ь|D Д|L Л|
|row 5|Q Я|N Н|| ~ Ч|C Ц|M М|G Г|E Е|Y Ы|
|row 6|F3|F2|F1|РУС|CAPS|GRAPH|CTRL|SHIFT|
|row 7|RET|SELECT|BS|STOP|TAB|ESC|F5|F4|
|row 8|→|↓|↑|←|DEL|INS|HOME|SPACE|
|row 9|NUM4|NUM3|NUM2|NUM1|NUM0|NUM/|NUM+|NUM*|
|row 10|NUM.|NUM,|NUM-|NUM9|NUM8|NUM7|NUM6|NUM5|

Note: РУС works like the Japanese かな (KANA) key, it is a toggle.

And here is a photograph of the Russian keyboard:
![MSX Russian keyboard](https://map.grauw.nl/articles/keymatrix/yamaha_russian_keyboard.jpg)

## Source

https://map.grauw.nl/articles/keymatrix.php
