# OPEN

## Effect

Opens a file for a specific direction in a specified device.

## Syntax

`OPEN "<Device>:\<Path>\<Filename>" FOR <Direction> AS #<FileNumber> LEN=<RecordLength>`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.
- Parameters can not end with a comma alone.

## Parameters

`<Device>` specifies the used device. By default, the device will be the standard data recorder on a system without any disk drive, the current active drive (generally drive A) in the other cases.

Here are the useful devices for OPEN and the different types of access for these devices:

|Device type|Device name<br>followed by:|Remark|Sequential<br>OUTPUT|Sequential<br>INPUT|Sequential<br>APPEND|Random|
|---|---|---|:-:|:-:|:-:|:-:|
|Disk drive|A:, B:, C:, D:, E:, F:, G:, H:||X|X|X|X|
|Data recorder|CAS:|Not available on MSX turbo R|X|X|-|-|
|Serial device|COM[n]:|Requires RS-232C interface|X|X|-|-|
|Text screen|CRT:|Filename and direction not required|X|-|-|-|
|Data cartridge (Yamaha)|DC:|Requires Yamaha UDC-01 + YRM-104 or YRM-504|X|X|-|-|
|Graphic screen|GRP:|Filename and direction not required|X|-|-|-|
|High Graphic screen<sup>(*)</sup>|HIGRP:<sup>(**)</sup>|Filename and direction not required|X|-|-|-|
|Printer|LPT:|Filename and direction not required|X|-|-|-|
|Memory disk|MEM:|Created with CALL MEMINI|X|X|X|-|
|Quick Disk drive|QD[n]:|n=0 by default Can vary between 0 and 7|X|X|-|-|
|Device controlled by Pioneer UC-V102|RS[n]:|Requires Pioneer UK-V104 RS-232C board|X|X|-|-|
|Stringy Floppy Drive (special data recorder)|S:|Requires Spectravideo SVI-777 Not available on MSX turbo R|X|X|-|-|

|Device type|Device name<br>not followed by:|Remark|Sequential<br>OUTPUT|Sequential<br>INPUT|Sequential<br>APPEND|Random|
|---|---|---|:-:|:-:|:-:|:-:|
|Auxiliary device|AUX||X|X|X|X|
|Console|CON|Filename and direction not required|X|X|X|X|
|Printer|LST|Filename and direction not required|X|X|X|X|
|Bit heaven|NUL|Filename and direction not required|X|X|X|X|
|Printer|PRN|Filename and direction not required|X|X|X|X|

<sup>(\*)</sup> only on screen 6, after installation of HI-GRAPhics, written by Arjen Schrijvers (see Interlacing Demo).  
<sup>(\*\*)</sup> it must be `OPEN "HIGRP:NTSC"` or `OPEN "HIGRP:PAL"`.

`<Path>` is used to specify the location in folders of file to load. Each folder name in path are separate by a backslash `\`. This parameter is only available in version 2 of Disk BASIC.

`<Filename>` is the name of the file to be opened. This parameter is not required for text screen, graphic screen and printer.

The format of file name is limited to 6 characters without extension, when using cassette. If another device is used, then the format is 8 characters followed by a point and an extension with 3 characters.

`<Direction>` must be preceded by `FOR` to be used. It is one of the 3 types of sequential access:
- OUTPUT = sequential write.
- INPUT = sequential read.
- APPEND = sequential write to the end of an existing file.

This parameter is not required for text screen, graphic screen and printer, but the listing is more easy to read when you use it. To open a file with random access on disk, you need to skip the `FOR <direction>` parameter.

`<FileNumber>` is a number that you must assign to open the file. It can vary between 1 and 15, but can't exceed the maximum number of files eventually defined with `MAXFILES`. The `#` in front can be omitted.

`<RecordLength>` must be preceded by `LEN` to be used. It is an optional parameter to use only if you choose to open a file in random access on disk. It must be an integer. The default value is 256. In case `FIELD` definitions exceed record length _"Field overflow"_ error is generated. Reading/writing is always done whole record at a time.

## Examples

```basic
10 SCREEN 2:COLOR 15,4,7
20 OPEN "GRP:" FOR OUTPUT AS #1
30 LINE (32,32)-(120,120),6,B
40 CIRCLE (120,120),56,1
50 PRESET (40,8)
60 PRINT #1,"Text in graphic screen"
70 FOR I=1 TO 2000: NEXT I
80 END
```

```basic
5 'Open a random file on disk with 512 as length
10 OPEN "A:RECORD.DAT" AS #1 LEN 512
10 ' Create a text file
20 OPEN"hello!.txt" FOR OUTPUT AS #1
30 PRINT#1,"Hello world!"+CHR$(10)+CHR$(13)+"I'm the saved text from"
40 PRINT#1,"the file HELLO!.TXT"
50 CLOSE
60 ' Print a text file
70 OPEN"hello!.txt" FOR INPUT AS #1
80 INPUT#1,A$:PRINT A$
90 IF NOT EOF(1) THEN 80
100 CLOSE
```

## Related to

`CALL MEMINI`, `CLOSE`, `EOF()`, `FIELD`, `INPUT`, `MAXFILES`, `PRINT`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/OPEN"
