# RUN

## Effect

Executes a BASIC program present in the MSX memory or after loading of this program in the MSX memory.

For the latter, if you use cassette (device `CAS`), the program to be loaded and run must be in ASCII text, what means that it must have been saved with `SAVE` (which uses ASCII format), not with `CSAVE` (which uses tokenized format).

However, to load and manually run for BASIC programs in tokenized format on tape, you can just use `RUN` after `CLOAD`.

If you use another device, the program can be in ASCII mode or in tokenized format.

## Syntax

`RUN <LineNumber>`

`RUN "<Device>:\<Path>\<Filename>"`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.
- Parameters in quotes can be replaced by a alphanumeric variable containing the corresponding parameters.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.
- Parameters can not end with a comma alone.

## Parameters

`<LineNumber>` specifies the line number where the BASIC program will start. This parameter is available only if the program is currently in the MSX memory (after having been loaded with `LOAD` or `CLOAD` or directly entered on the MSX-BASIC screen). By default, the program start at the first line.

`<Device>` is the name for used device (see table below).

|Device type|Device name|Remark|
|:--|:-:|---|
|Disk drive|A, B, C, D, E, F, G, H|A floppy disk interface can control until 2 drives.|
|Data recorder|CAS|Not available on MSX turbo R|
|Memory disk|MEM|Created with CALL MEMINI|
|Stringy Floppy Drive<br>(special data recorder)|S|Requires Spectravideo SVI-777Not available on MSX turbo R|

By default, the loading will be made from tape on a system without any disk drive, from the current active drive (generally drive A) in the other cases.

`<Path>` is used to specify the location in folders of file to execute. Each folder name in path are separate by a backslash `\`. This parameter is only available in version 2 of Disk BASIC.

`<Filename>` is the name of BASIC program to run. It needs to be specified if the file is on disk or memory disk. If you use a tape and don't indicate the file name, `RUN` will load and execute the first BASIC program in ASCII text found on tape. 

The size of file name is limited to 6 characters without extension, when the file is saved on tape. If another device is used, then the size is 8 characters followed by a point and an extension with 3 characters.

## Related to

`CALL MEMINI`, `CLOAD`, `CSAVE`, `LOAD`, `MERGE`, `SAVE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/RUN"
