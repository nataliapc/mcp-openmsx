# The YJK screen modes

An exploration of the YJK screen modes of the MSX2+.

- [Introduction](#introduction)
- [Selecting the YJK modes](#selecting-the-yjk-modes)
- [The encoding of YJK](#the-encoding-of-yjk)
- [Conversion between YJK and RGB](#conversion-between-yjk-and-rgb)
- [Drawing techniques](#drawing-techniques)
- [Comparison to Y′UV](#comparison-to-yuv)
- [Relevant links](#relevant-links)

## Introduction

The Yamaha V9958 VDP used in the MSX2+ and MSX turbo R adds two high colour display modes which use a different colour encoding than traditional RGB, called YJK and YJK+YAE. These modes expand the colour count to 19268 and 12499 + 16 respectively, at the cost of colour attribute clash between groups of 4×1 pixels.

The YJK mode is MSX-BASIC’s SCREEN 12. It can show up to 19268 colours, and is particularly suited for photographic images because these are generally fairly unaffected by colour attribute clash. See art gallery.

The YJK+YAE mode is MSX-BASIC’s SCREEN 10 and 11. It can show up to 12499 YJK colours, and 16 palette colours (out of 512). Since the palette colours are set per-pixel they can be used to hide colour bleeding, while the YJK colours can be used to make the picture more colourful. Due to this YJK+YAE is more versatile in situations when you also want to display a user interface, like in a game. See art gallery.

An additional benefit of these new screen modes have compared to SCREEN 8 is that their sprites make use of the palette, rather than a limited set of predefined colours.

## Selecting the YJK modes

On the VDP the YJK mode is selected by following the procedure to select SCREEN 8 (G7), and then setting the YJK bit of register 25. To select the YJK+YAE mode, additionally set the YAE bit.

VDP register 25:
```
        b7    b6    b5    b4    b3    b2    b1    b0
      +-----+-----+-----+-----+-----+-----+-----+-----+
R#25  |  0  | CMD | VDS | YAE | YJK | WTE | MSK | SP2 |
      +-----+-----+-----+-----+-----+-----+-----+-----+
```

Combination of YJK and YAE data:

|YJK|YAE|VRAM data|
|:-:|:-:|---|
|0|0|Via the conventional colour palette|
|0|1|Via the conventional colour palette|
|1|0|A=0: Via the RGB → YJK conversion table|
|1|1|A=1: Via the colour palette|

Use the CHGMOD BIOS call to switch to SCREEN 8 and then read the r#25 mirror RG25SA, set the YJK and YAE bits in r#25 appropriately and write the register back with WRTVDP.

Since a number of MSX2 computers exist that do have a V9958 but no BIOS support, as well modded MSX2 computers with their VDP replaced, consider setting r#25 directly rather than through the BIOS if the MSX version number is 1 (MSX2) and the VDP ID in s#1 bits 1-5 is 2 (V9958). In this case the other r#25 bits can be assumed 0.

In MSX-BASIC, SCREEN 12 and 11 have no special support for drawing in YJK other than using 8-bit colour operations. However SCREEN 10 is special, it gives a palette-colour view of YJK+YAE and allows you to draw on it like in SCREEN 5. Switching between SCREEN 10 and 11 will not clear the screen.

## The encoding of YJK

Pure red and pure black is a difficult combination for YJK.
![Artwork: Gulliver by Teruchan](https://map.grauw.nl/articles/yjk/colorbleed.png)

YJK breaks down into three components. The Y component specifies brightness (luma) and a little bit of blue. The J and K components contain most of the colour information (chroma), expressed as a difference between Y and red and green, respectively. The concept behind this encoding is that the human eye is more sensitive to brightness than colour, and the colour resolution can therefore be reduced with relatively limited impact on the perceived result.

Use the visualisation widget above to get a feel of the YJK colour space. You can interact with this widget to view the various colour ramps available. The horizontal axis is the J value, the vertical axis is K. The column on the right controls the Y amount. All colours in the Y column can be used in the same four-pixel group. As you increase Y the colour becomes brighter, but notice that it becomes slightly more blue as well. This can be seen well in the grayish hue when both J and K are zero.

In YJK mode the VDP stores the J and K components in 6 bits as a two’s complement signed value (-32 to 31). These are shared between 4 adjacent pixels. The Y component is a 5-bit unsigned value (0 to 31). This one can be specified per-pixel.

#### YJK (SCREEN 12)

||C7 C6 C5 C4 C3 |C2 C1 C0|
|---|:-:|:-:|
|1 dot|Y1|K low|
|1 dot|Y2|K high|
|1 dot|Y3|J low|
|1 dot|Y4|J high|

In YJK+YAE mode the VDP still stores the J and K components in 6 bits as a two’s complement signed value (-32 to 31). However the Y component can now only specify even values (0, 2, 4 .. 30), as its least significant bit is used for the attribute bit A. If the A bit is set, the top four bits of the Y component specify a palette colour to use instead.

#### YJK+YAE (SCREEN 10-11)

||C7 C6 C5 C4|C3|C2 C1 C0|
|---|:-:|:-:|:-:|
|1 dot|Y1|A|K low|
|1 dot|Y2|A|K high|
|1 dot|Y3|A|J low|
|1 dot|Y4|A|J high|

The palette is still specified as 9 bits, with 3 bits per component. However the V9958’s DAC is 15-bit, so there must be some kind of mapping in place. Indeed, the 3-bit RGB palette component values map to 5 bits as follows:

#### 3-bit to 5-bit conversion

|V9938|V9958|
|:-:|:-:|
|0|0|
|1|4|
|2|9|
|3|13|
|4|18|
|5|22|
|6|27|
|7|31|

#### 3-bit to 5-bit conversion

$`c_{out} = \lfloor 4.5 c_{in} \rfloor`$

$`c_{out} = c_{in} << 2 \text{ OR } c_{in} >> 1`$

This applies to all screen modes, by the way.

## Conversion between YJK and RGB

The Y, J and K values specify 17 bits of information in total. The V9958 converts these to 15-bit RGB with 5 bits per colour component. The V9958 manual describes the following conversion formulas for YJK. The formulas for YJK+YAE are the same, but the least significant bit of Y is always zero so all its values are even.

#### YJK to RGB

$`r=y+j`$

$`g=y+k`$

$`b={{5y-2j-k} \over 4}`$

#### RGB to YJK

$`y={{4b+2r+g} \over 8}`$

$`j=r-y`$

$`k=g-y`$

Indeed those are fine formulas and perfect mathematical inverses of each other. However they do not take into account that the VDP both rounds and clips the result of the YJK to RGB conversion.

### Rounding

Let’s consider the rounding first. The y, j, k and r, g, b values are all integers, so when the blue value is calculated, it is rounded down to the nearest integer value ("floor"). To compensate for this in the RGB to YJK formula, you need to round up ("ceil") the value resulting from the y.

#### YJK to RGB (rounded)

$`r=y+j`$

$`g=y+k`$

$`b=\lfloor{5y-2j-k \over 4}\rfloor`$

#### RGB to YJK (rounded)

$`y=\lceil{4b+2r+g \over 8}\rceil`$

$`j=r-y`$

$`k=g-y`$

#### RGB to YJK+YAE (rounded)

$`y=2\lceil{4b+2r+g \over 16}\rceil`$

Using these formula you can express exactly half of what 15-bit RGB allows; 16384 out of 32768 colours (50%), and 8192 for YJK+YAE (25%). Each representable RGB value maps to one unique YJK value and vice versa. If you want to keep things simple, stop here and stick to these 16384 colours.

### Clipping

As we know though YJK mode can generate 19268 colours. Where did the remaining 2884 colours go? YJK’s 17 bits allow for 131072 different values, but most of these fall outside the range of 15-bit RGB. This is called "out of gamut". Values that are out of range are clipped to [0, 31].

#### YJK to RGB (clipped)

$`r = \text{clamp}(y + j, 0, 31)`$

$`g = \text{clamp}(y + k, 0, 31)`$

$`b = \text{clamp}\left(\left\lfloor{5y - 2j - k \over 4}\right\rfloor, 0, 31\right)`$

As a side effect of this clipping, 2884 colours which could not be represented by the previous YJK formulas become available. For example, take the colour (0, 24, 31). Without clipping this could not be expressed, since applying the previous RGB to YJK to RGB formula will yield (0, 24, 32). Due to the clipping of the blue component though, this colour is available to us after all.

If we calculate the number of colours affected by clipping, those which have one component of either 0 or 31, there are 32^3 - 30^3 = 5768 of them. Half of them are already covered by unclipped colours, 5768 / 2 = 2884, meaning that all of the colours where any RGB component is 0 or 31 can be represented. Some of these have only one YJK representation, others up to 3463.

You may notice no RGB to YJK formula is specified. This is because although colours whose components all fall within the [1, 30] range have a unique YJK representation which can be determined with the earlier formula, colours with one or more components of either 0 or 31 have multiple solutions.

In order to deal with this, consider that an RGB value is a point in a 3-dimensional (colour) space. For each potentially clipped component (0 or 31) a ray in the clip direction extends from the point, where two rays form a bounded plane, and three rays a volume. This colour space can be transformed to YJK with a matrix, and all YJK values overlapping this point, ray, plane or volume represent the same RGB colour.

More on this in part 2, which will be a deep dive into the topic of image conversion.

## Drawing techniques

I like grandpa’s dusty books by 京典, rearranged by FRS (SC12)
![House by windship, rearranged by FRS (SC12)](https://map.grauw.nl/articles/yjk/house.png)

The YJK modes can be very nice for pixel art because of the wider range of colours that you an express with 15-bit RGB. Ever wanted that particular pastel colour that the V9938’s 9-bit RGB palette could not express? Or a smoother gradient? The V9958 can do in YJK. Additionally the high colour count allows you to create very colourful artwork.

However on the flipside the colour restrictions of YJK make it a difficult mode to work with. Below you will find some tips on how to work with the constraints of the YJK modes.

For pixel art I recommend to use the YJK+YAE mode. The availability of palette colours greatly increases your flexibility to work around the colour clash restrictions. The YJK mode is more suited for photographic material with smoother gradients and lower contrast.

The simplest technique is to approach the art like you would a SCREEN 5 image. Draw the majority of the image using the 16 palette colours. Consider it a layer on top of the YJK layer. Then "punch holes" through this layer by introducing YJK colours in select places, adhering to the 4×1 pixel group restrictions. The easiest way to do this is by simply using only a single colour per pixel group. This already allows you to introduce many more colour details without needing extra palette colours for them, while avoiding the complexities of YJK.

If you want to use multiple YJK colours within those 4 pixels, you need to pay attention to the colours available in the specific J, K combination for that quad. This requires a bit of planning, you’ll want to start by establishing a few useful colour ramps to reuse them througout the art piece. Choose colours from an Y ramp you like, for example using the tool at the top of this page, and then note them in a little scratch area for easy colour picking. Then whenever you need to draw e.g. some grassy bits, you can pick from the green ramp you’ve noted, while being mindful of the 4×1 grid.

For a more cartoony drawing style in YJK mode, you could draw the artwork in grayscale, and then paint the colour on a separate colour modifier layer with a blurry brush, so that there are no hard colour transitions. This will convert to YJK well.

Some additional tips:
- Align the vertical edges in your graphics to the 4×1 grid to minimise the effect of colour bleed.
- Use the out of gamut colours of the Y ramps to your advantage, their hue changes more than usual so they give some extra flexibility.
- In situations where you can’t use the colour you want, try to match its brightness so that the colour difference is harder to spot.
- The eye is sensitive to edges, so de-block visible edges of colour bleeding by adding detail or dithering in them.

In the end to which degree you want to apply these techniques depends on how much time you want to invest. Please share your experiences and tips and tricks in the [msx.org pixel art thread](https://www.msx.org/forum/msx-talk/development/creating-pixel-art)!

## Comparison to Y′UV

The YJK colour space is similar to the more common Y′UV colour space, with 4×1 chroma subsampling like the Y′UV411 encoding. However they differ in the weights applied to the different colour components. Where Y′UV assigns weights to make the Y component express luma (brightness), YJK has swapped the weights for green and blue, meaning that Y does not only affect luma but also the amount of blue.

This trait can be a bit unfortunate, as in natural scenes the amount of blue decreases under (sun)light, and increases in shade. Y′UV would work better in those situations. YJK is perhaps better suited for metallic, fluorescent and pastel colours.

In an interesting article ["Issues on YJK colour model implemented in Yamaha V9958 VDP chip"](http://rs.gr8bit.ru/Documentation/Issues-on-YJK-colour-model-implemented-in-Yamaha-V9958-VDP-chip.pdf), Ricardo Cancho Niemietz elaborates why this is not ideal from the perspective of the luminance-chrominance colour model, and suggests that it must be an unintentional mistake of the Yamaha engineers. Assuming though that Yamaha’s engineers were smart people, and wouldn’t make a colour model inspired by YUV but deviate in such a detail without reason, let’s try to find that reason.

In YJK’s 4-byte encoding there are six bits for J and K, but only five for Y. Due to this it can only represent half of the RGB colours, 21^4 instead of the 21^5 that 15-bit RGB can produce. Ideally Y would have 6 bits as well to get the full range, but this doesn’t fit in the byte encoding (and certainly not in YJK+YAE). So which RGB colour component’s resolution do we reduce by one bit?

The most logical answer here is blue, just like in SCREEN 8. Because our eyes are the least perceptive of blue, we won’t notice it as much. And indeed in YJK blue is effectively only 4-bit, in YJK+YAE effectively 3-bit. Had Yamaha gone for YUV, green would have gotten the least resolution, while it is the most visible colour, causing more banding in it. From this perspective, YJK spends its bits more effectively on the colours our eye perceive best.

A final note on this; the Yamaha V9990 VDP has both an YJK and an YUV mode, so on that VDP you can use the mode of your choosing. The YUV mode works identical to YJK on the V9958 but with the weights for the G and B components swapped. The weights do not perfectly match the real Y’UV but it’s pretty close.

## Relevant links:

- [Yamaha V9958 application manual](https://map.grauw.nl/resources/video/yamaha_v9958.pdf)
- [msx.org forum: Enhanced decoding of YJK images](https://www.msx.org/forum/msx-talk/software/enhanced-decoding-yjk-images)
- [msx.org forum: Creating pixel art](https://www.msx.org/forum/msx-talk/development/creating-pixel-art)
- [Issues on YJK colour model implemented in Yamaha V9958 VDP chip by Ricardo Cancho Niemietz.](http://rs.gr8bit.ru/Documentation/Issues-on-YJK-colour-model-implemented-in-Yamaha-V9958-VDP-chip.pdf)
- [The MSX2+ Screens by Alex Wulms (mirror), published in MCCM 72 (original Dutch).](http://www.msx-plaza.eu/home.php?page=mccm/mccm72/schermen_eng)
- [Screen 10-11 art gallery on Retro Gallery](http://tomseditor.com/gallery/browse?platform=msx&format=screen10)
- [Screen 12 art gallery on Retro Gallery](http://tomseditor.com/gallery/browse?platform=msx&format=screen12)

~Grauw

## Source

https://map.grauw.nl/articles/yjk/
