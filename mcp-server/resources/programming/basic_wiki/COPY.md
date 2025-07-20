# COPY

## Effect

Copies data between RAM, VRAM and disk.

## Syntaxes

`COPY (<XS>,<YS>)-STEP(<XS2>,<YS2>),<SourcePage> TO (<XD>,<YD>),<DestinationPage>,<Operator>`

`COPY (<XS>,<YS>)-STEP(<XS2>,<YS2>),<SourcePage> TO <Array>`

`COPY <Array>,<Direction> TO (<XD>,<YD>),<DestinationPage>,<Operator>`

`COPY (<XS>,<YS>)-STEP(<XS2>,<YS2>),<SourcePage> TO "<Device>:\<Path>\<Filename>"`

`COPY <Array> TO "<Device>:\<Path>\<Filename>"`

`COPY "<Device>:\<Path>\<Filename>",<Direction> TO (<XD>,<YD>),<DestinationPage>,<Operator>`

`COPY "<Device>:\<Path>\<Filename>",<Direction> TO "<Device>:\<Path>\<Filename>"`

`COPY "<Device>:\<Path>\<Filename>",<Direction> TO <Array>`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.
- Parameters can not end with a comma alone.

## Parameters

_Note: Coordinates, pages, operators, arrays and directions can be used only in screen modes 5 to 8 and 10 to 12. (MSX-BASIC 2.0 or newer)_

### Coordinates and pages

`<XS>` and `<YS>` are upper-left coordinates of transfer source (`X`=0-255/511, `Y`=0-211). If it is omited the current coordinates of cursor will be chosen.

`<XS2>` and `<YS2>` are lower-right coordinates of transfer source (`X2`=0-255/511, `Y2`=0-211).

`STEP` parameter changes `X2` and `Y2` coordinates to relative coordinates (and therefore allows the use of negative values) when specified.

`<SourcePage>` is the page number in VRAM of transfer source. The number can be 0/1 or 0~3 depending used screen mode (current page by default).

`<XD>` and `<YD>` are upper-left coordinates of transfer destination (`X`=0-255/511, `Y`=0-211).

`<DestinationPage>` is the page number in VRAM of transfer destination. The number can be 0/1 or 0~3 depending used screen mode (current page by default).

### Operators

`<Operator>` defines the logical operations to operate, how copied picture data is mixed with existing picture data. If logical operation is not defined, `PSET` (do not mix) is expected.

The available operators are `AND`, `OR`, `PRESET`, `PSET` (default), `TAND`, `TOR`, `TPRESET`, `TPSET`, `TXOR`, `XOR`. Specifying a logical operation preceded by "T" causes nothing to be done when copied color is transparent (color 0).

The effect of the operators is done on each corresponding bit as shown in the following table.

|Current bit|Copied color bit|AND|OR|PRESET|PSET|XOR|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|0|0|0|0|1|0|0|
|0|1|0|1|0|1|1|
|1|0|0|1|1|0|1|
|1|1|1|1|0|1|0|

### Arrays

`<Array>` must be an array variable with one or two parameters (to transfer line X and Y pixel data) (Parameter available since MSX-BASIC 2.0).

Array variables must be large enough to hold all the image data to be copied. The size can be determined using the following formula:  
`INT (((((ABS(XS2-XS) + 1)*(ABS(YS2-YS) + 1)*pixel_size +7)/8)+4)/data_size)+1`

The `pixel_size` (the number of bits in VRAM corresponding to a point on the screen) varies depending on the `SCREEN` mode:

|SCREEN|Pixel size|
|:-:|:-:|
|5|4|
|6|2|
|7|4|
|8|8|
|10-12|8|

The `data_size` is determined by the type of the array variable:

|Array type|Data size|
|:-:|:-:|
|Integer|2|
|Single precision|4|
|Double precision|8|

### Directions

`<Direction>` determines the rotation of the picture and must be an integer. This parameter can be used only if destination is graphics coordinate.

- Bit 0: Invert X-direction
- Bit 1: Invert Y-direction

|Direction|Picture rotation|
|:-:|:--|
|0|No rotation|
|1|Left - Right|
|2|Up - Down|
|3|Left - Right +  Up - Down|

### Devices and files

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will copy file(s) from or to the currently active drive (by default, it's drive `A:`).

|Device type|Device name|Remark|
|:-:|:-:|:-:|
|Disk drive|A, B, C, D, E, F, G, H|A floppy disk interface can control until 2 drives.|

_Note: the destination device can be the text screen with `CON` (without :) instead of CRT (followed by :)._

`<Path>` is used to specify the location in folders where you want display files. Each folder name in path are separate by a backslash `\` (parameter available with the Disk BASIC 2.0 or newer).

`<Filename>` is the file name in the format 8 characters followed by a point and an extension with 3 characters.

When copying from one diskdrive to another diskdrive:
- the source name will be used as destination name if you don't specify the destination name.
- several files can be handled together by COPY in a similar way as for other Disk BASIC commands.

Wildcards can replace some characters in source filename to copy several files. The asterisk `*` and question mark `?` are used as wildcard characters. The asterisk matches any sequence of characters, whereas the question mark matches any single character.

## Examples

```basic
COPY "README.TXT" TO "CON" ' Display file on text screen
```
```basic
COPY "M*.*" TO "B:"  'Copy all files with M as 1st character in the name from drive A to drive B
 
COPY "*.BAS" TO "B:"  'Copy all files with the extension ".BAS" from drive A to drive B
 
COPY "TEST.BAS" TO "B:GAME.BAS" 'Copy one file from drive A to drive B and rename it
 
COPY  "*.*" TO "B:"  'Copy all the files from drive A to drive B
```

Next examples are made by: NYYRIKKI - Please contact him in case of questions:

```basic
' Endless lives to Xyzolog
DEFINT D:DIM D(8191):COPY "XYZOLOG.ROM" TO D:D(3342)=2072:COPY D TO "XYZOLOGC.ROM"
```
```basic
10 ' Create 3 little programs to change display Hz rate under DOS
20 DEFINT A-Z:DIM D(7):FOR I=0 TO 7:READ D(I):NEXT
30 FOR I=0 TO 2:IF I THEN N$=OCT$(32+I*8):READ D(2)
40 COPY D TO N$+"Hz.COM":NEXT
50 DATA -6111,32511,750,-3209,-26157,-30402,-26157,201,758,-538
```
```basic
10 ' Fill screen with cute pattern
20 SCREEN 5
30 PSET (0,0):PSET(4,4):CIRCLE(4,4),3
40 COPY (0,0)-(247,7) TO (8,0)
50 COPY (0,0)-(255,199) TO (0,8)
60 A$=INPUT$(1)
```
```basic
10 ' Creating outline of an object using COPY-command
20 ' ------------------------------------------------
30 'Example object
40 COLOR 15,0,0:SCREEN 5
50 CIRCLE (32,32),28,8,,,.2:PAINT(32,32),8
60 CIRCLE (32,32),28,2,,,5:PAINT(32,32),2
70 CIRCLE (32,32),12,4:PAINT(32,32),4
80 CIRCLE (32,32),5,0:PAINT(32,32),0
90 'Example of object outline outside
100 FOR I=0 TO 3:COPY(-(I=0),-(I=1))-(63,63)TO(64-(I=2),-(I=3)),,TPSET:NEXT
110 COPY(64,0)-STEP(63,63) TO (128,0),,TPRESET
120 COPY(64,0)-STEP(63,63) TO (128,0),,TOR
130 COPY(0,0)-STEP(63,63) TO (128,0),,TPSET
140 COPY(0,0)-STEP(63,63) TO (128,0),,XOR
150 'Example of object outline inside
160 COPY(0,0)-STEP(63,63) TO (64,64),,TPRESET
170 COPY(0,0)-STEP(63,63) TO (64,64),,OR
180 COPY(64,64)-STEP(63,63) TO (128,64)
190 FOR I=0 TO 3:COPY(64-(I=0),64-(I=1))-(127,127)TO(128-(I=2),64-(I=3)),,AND:NEXT
200 COPY(64,64)-STEP(63,63) TO (128,64),,XOR
210 'Both together
220 COPY(128,0)-STEP(63,63) TO (128,128)
230 COPY(128,64)-STEP(63,63) TO (128,128),,OR
240 A$=INPUT$(1)
```
```basic
10 DIM D(16)
20 SCREEN 5
30 PSET (0,0):OPEN"GRP:" FOR OUTPUT AS #1:PRINT#1,"Copy":CLOSE
40 COPY (0,0)-(31,7) TO D ' Copy to array
50 COPY D,3 TO (255,211) ' Copy back to screen but upside down
60 A$=INPUT$(1)
10 ' Some Sierpinski-triangles
20 COLOR 15,0,0:SCREEN 5
30 FOR I=RND(-5048) TO 6:PSET(RND(1)*255,RND(1)*211),RND(1)*13+2:NEXT I
40 FOR I=0 TO 211:H=IAND254:L=(IAND1)*2
50 COPY (1,H)-STEP(253,0) TO (L,H+2),,XOR
60 COPY (1,211-H)-STEP(253,0) TO (L,209-H),,XOR
70 NEXT I
80 A$=INPUT$(1)
```

## Related to

`AND`, `DIM`, `KILL`, `NAME`, `OR`, `SET PAGE`, `SCREEN`, `XOR`

## Compatibility

Disk BASIC 1.0 or higher / both modes of Nextor OS

Array variable, graphical coordinates and logical operations require MSX-BASIC 2.0 or higher.

## Source

Retrieved from "https://www.msx.org/wiki/COPY"
