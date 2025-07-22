# A guide to scrolling game engines on MSX

Scrolling is a feature that is an essential part of many games, however due to hardware limitations it is not a trivial thing to do on MSX. Even for experienced programmers, it may grow into quite a complex problem.

This article describes different scenarios, problems that you may encounter and possible solutions. It addresses scenarios on the Texas Instruments TMS9918 (MSX1 VDP), the Yamaha v9938 (MSX2 VDP), the Yamaha v9958 (MSX2+/TurboR VDP) and the Yamaha v9990 (Sunrise Graphics9000).

- [An introduction to tiles](#an-introduction-to-tiles)
- [Hardware scrolling capabilities](#hardware-scrolling-capabilities)
  - [TMS9918 - MSX2](#tms9918---msx1)
  - [v9938 - MSX2](#v9938---msx2)
  - [v9958 - MSX2+ / turboR](#v9958---msx2--turbor)
  - [v9990 - Graphics9000](#v9990--graphics9000)
- [Software scrolling](#software-scrolling)
  - [Optimising software scrolling](#optimising-software-scrolling)
  - [Combining software and hardware scrolling](#combining-software-and-hardware-scrolling)
- [Closing thoughts](#closing-thoughts)

## An introduction to tiles

![](https://map.grauw.nl/articles/scrolling/tiles.png)

Illustrating tiles conceptYou will usually want to scroll through multiple screens worth of images. Storing all that data as bitmaps uses a lot of memory, and in practice you will want to use tiles instead. In essence, tiles are a compression technique to reduce the amount of data that has to be stored.

Tiles, also known as patterns, are rectangular building blocks for a display area we’ll call field. They are taken from a tile set (pattern generator table) which is a collection of all tiles used in the field. The position of the tiles in the field is described in a tile map (pattern name table).

Common sizes for such tiles are 8×8 and 16×16, and tilesets usually contain 256 of them so that a tile number fits in one byte. A tile map can be relatively small, such as 768 bytes covering an area or 32×24 tiles; with 8×8 tiles that is 256×192 pixels, the size of screen mode 2. A bigger tile map of for example 16 kB would let you store a field of 128×128 tiles (1024×1024 pixels) or 32×512 tiles (256×4096 pixels).

The v9938’s screen 1, 2, 3 and 4, and the v9990’s P1 and P2 modes are 8×8 tile/pattern-based screenmodes. Using these simplifies working with tiles. But even when you are not using those modes, you will often still want to use tiles.

## Hardware scrolling capabilities

The available scrolling methods can be divided into two categories: ‘hardware scrolling’ and ‘software scrolling’, and a combination of them is also possible. Hardware scrolling means that you use scroll-registers provided by the hardware to move the contents of the screen around. Software scrolling means that you manually copy the contents of the screen.

Usually, hardware scrolling is the best solution for scrolling because it’s very fast, and gives good-looking results. However, there are limitations as well. Each MSX VDP has different capabilities, and hardware scrolling is also always full-screen. This can be worked around by means of screensplits, or overlapping part of the screen with sprites or a secondary layer, but sometimes software scrolling may be the right solution even on the v9990.

Let’s go over the scrolling capabilities of the different hardware:

### TMS9918 - MSX1

The MSX1 VDP does not really have hardware support for scrolling, but you can still scroll very efficiently because of the tile-based screen modes (screen 1, 2, 3 and on the v9938, screen 4). The screen’s entire tile-map is only 768 bytes in size, so scrolling an entire screen to any direction by multitudes of 8 pixels only involves moving 768 bytes around, something which the CPU can easily do inside the span of 1 interrupt. This is technically software-scrolling, but making good use of the VDP’s tile modes.

Additionally, you can scroll individual tiles, or groups of tiles, making it relatively easy to create for example a screen-wide ‘flowing water’-effect, where you just animate the tiles you use for water, and the entire screen will be updated accordingly.

### v9938 - MSX2

The MSX2 has a vertical scrolling register (r#23). With this register you can do smooth per-pixel scrolling in the bitmap modes. Examples of games which use the vertical scrolling register are Aleste, Quarth and Shrines of Enigma. These are all vertically-oriented games; MSX2 games which scroll horizontally usually use either the pattern-based screen mode 4, or software scrolling.

There is however a method to smoothly scroll horizontally on MSX2 using some hardware acceleration: the adjust register (r#18). With the adjust register, you can horizontally (and vertically) adjust the screen in 16 steps of 1 pixel. This has some limitations however, let’s sum up a few of them:
- You can only scroll 16 pixels and need to perform additional software scrolling to be able to scroll more than that.
- The left and the right borders of the screen move along with the adjust register, causing the borders to ‘flip’. This can be masked with sprites though.
- The adjust register is there for the user to center the screen on his display. By using this register for scrolling, you are ignoring the user’s settings.
- Changing the adjust register while performing a copy command causes VRAM corruption, see the _VDP Programming FAQ_.

Examples of games which use the adjust register are Space Manbow (in screen 4) and Pentaro Odyssey.

### v9958 - MSX2+ / turboR

The v9958 can also do horizontal scrolling in addition to the v9938’s vertical scrolling, using registers r#26 and r#27. The horizontal scrolling can span both a single page or two pages. The scrolling is smooth on the left border of the screen, however the right border flips for every 8th pixel. There is a setting to mask this, although this will reduce the horizontal resolution to 248 pixels.

Examples of games which use the v9958 scrolling capabilities are Sea Sardine, Sonyc, Space Manbow (where the border doesn’t flip like it does on MSX2) and F1 Spirit 3D (to achieve the 3D-effect).

### v9990 – Graphics9000

The v9990 has the best hardware support for scrolling. It has registers to scroll both horizontally and vertical accross multiple pages (r#17 to r#24), and in P1 mode even provides multilayer scrolling with 2 layers. Also, the P1 and P2 modes are tile-based modes, which will likely also be useful. In case your requirements are even higher, e.g. you want to scroll using more layers, software scrolling with the v9990’s copy commands is very fast as well.

## Software scrolling

When software scrolling, you are not using the hardware scroll capabilities of the VDP, but instead scroll by plainly copying data on the screen. Due to the limitations that imposes, it will probably not look as smooth as hardware scrolling. However, it will allow you to do certain things that would otherwise not be possible on the VDP of your choice.

Software scrolling is usually done in 8 pixel steps. In pattern modes this is because the patterns are 8×8 pixels and can only be moved in those units. And in bitmap modes the copy command is not fast enough to scroll one pixel at a time, but it can reach a decent speed scrolling 8 pixels at a time, while not looking too badly.

Software scrolling can be combined with hardware scrolling to achieve better performance or looks, e.g. the software scrolling could scroll in 8 pixel units, while the hardware scrolling deals with scrolling the one-pixel units inbetween.

### Optimising software scrolling

To improve the performance of software scrolling, there are various techniques you can use.

![](https://map.grauw.nl/articles/scrolling/swscroll-opt1.png)

Illustrating selective copy optimisationThe most important technique to optimise a software scroll, is to do a selective copy — that is, only copy things that have actually changed. Instead of copying the whole screen 8 pixels at once, if you divide up the screen in 8×8 tiles and only copy the tiles where the new tile differs from the old one, you can reduce the amount of data that has to be copied greatly. This technique especially performs great when there are areas with lots of contiguous identical tiles, which is often the case with roofs and grass.

Using this technique it is also relatively easy to create high-performance multilayer scrolling where the background layer doesn’t move, or moves at a slower pace, which does not only look good but also improves rendering performance.

Optimisation can also be found in performing larger copies, because smaller copies are slower. A simple means to get bigger copies is to base your scroll routine on 16×16 tiles instead of 8×8 ones. More advanced techniques could involve caching of groups of tiles, or detection of sequences of tiles so they can be drawn with a single auto-repeating copy-command.

Another performance win is to draw tiles that are a solid colour with a faster block fill command instead of a copy command. In a sci-fi environment these kind of blocks may occur frequently (black space, metal plates, etc.).

If you use sprites, you could turn them off temporarily while scrolling, which significantly improves VDP copy speed. If you only use a sprite for e.g. a mouse cursor, this should be an acceptable trade-off.

Note however that with most of the above tricks, because the amount of work varies depending on the layout of the field, the direction you move in, etc., the scrolling will often not go at a very constant speed. When this gets too bad, you could consider to simply do nothing and wait for a while, in order to improve the fluency of the scrolling. Or rather, to already start doing preparative work for the next step in the scroll, under the assumption that the player does not change direction.

Examples of some effective applications of these optimisation methods are Falcom’s Ys games, and Cas Cremer’s Akin and the never-completed Core Dump (of which there is a demo). They are excellent examples of what kinds of performance can be achieved, even on a plain MSX2 without hardware-accelerated horizontal scrolling capability.

### Combining software and hardware scrolling

Other possible performance opportunities arise from combining software scrolling with using certain hardware capabilities.

For scrolling vertically, you could simply use the v9938’s vertical scrolling register, while for per-8-pixel horizontal scrolling you could use the horizontal adjust to speed up every other step. For the horizontal scrolling you would have to be careful to balance the amount of copying work between the two steps, and you would have to slow down the vertical scrolling speed to balance the two, but it could give decent results.

When you are using multi-layer scrolling, you could count the tiles that would change in a scenario with and without additional full-screen hardware scroll, and use the hardware scroll only if it improves performance (that is, there are more tiles moving than standing still). Or, if you have a lot of alternating tiles, also alternate screen pages that you render on.

Some time ago I constructed a test for full-screen smooth horizontal (and vertical) scrolling on the v9938 in screen 5, using the adjust register for horizontal scrolling support. For every 1-pixel scrolling step I copied 1/16th of the screen 16 pixels to the left or right on an alternate screen page. Every 16 pixels I toggled the visible page and reset the scroll register to the opposite side, and I masked the flipping of the borders with sprites.

Using this method I was able to scroll smoothly at 50 frames per second, but with only just enough time left to draw 1 software sprite. At 60 frames/second, I had to turn off the sprites to be able to achieve that. So generally spoken, I would say this method of horizontal scrolling is only useful when you just need to scroll a plain image, draw at 25 or 30 frames/second, or when you make the screen area smaller than 256×212.

## Closing thoughts

I’d say the key to high-performance scrolling on MSX is to either use a fast pattern mode such as screen 4, only use vertical scrolling, or to thoroughly apply optimisation techniques.

Even though they have colour limitations, MSX pattern mode graphics can still look pretty good and have an impressive amount of things going on. Look at Space Manbow, where a lot of full-screen animation is going on. And of course, if you are making something for the v9990, you can go all-out with all its patterns and layers and sprites.

When software scrolling, the performance difference between good optimisation and little to no optimisation can be huge, e.g. if you consider the speed of Falcom’s Ys, which is very well optimized, to the speed of Konami’s SD Snatcher or Metal Gear 2 (which does not even scroll!), you can see the big impact optimisation can have. With Konami’s games, for repetetive bits I often turn on the 7MHz mode of my MSX to speed it up a little, even though that makes the sound go bad. For Ys, not so, and doing that has little effect anyway.

As a rule of thumb, I always assert that, if you turn on the 7MHz (if you have it) and it is noticeably faster, then there is probably still opportunity for optimisation. Ideally, the VDP should be the bottleneck. You should try to do as much of your calculation work as possible while the VDP is continuously running copy commands.

Let me finish with a concept that I always found interesting: multi-VDP game engines. Imagine a screen-5 based RPG, that scrolls 8-pixels at a time on the v9938, scrolls smoothly on v9958, and has multilayer scrolling on the v9990. This way, you can reach a larger audience, while still having good-looking scrolling on post-MSX2 hardware. It would take more effort to create, though.

Well, that’s it. I hope this article has provided you with some useful insights.

~Grauw

## Source

https://map.grauw.nl/articles/scrolling.php
