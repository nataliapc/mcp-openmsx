# MERGE

## Effect

Merges a BASIC program saved in ASCII text to the program currently in the MSX memory.
It implies that it has been saved with `SAVE` and that parameter `A` has been used for saving on disk or another computer.

_Notes:_
- If both programs have same program lines, the lines of the program in the MSX memory are replaced by the lines of the loaded program.
- The new program created by this merging stays in the MSX memory and can be handled as another BASIC program (especially, you can run it, save it, modify it).

## Syntax

`MERGE "<Device>:\<Path>\<Filename>"`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.
- Parameters can be replaced by a alphanumeric variable containing the corresponding parameters.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.

## Parameters

`<Device>` is the name for used device (see table below).

|Device type|Device name|Remark|
|---|---|---|
|Disk drive|A, B, C, D, E, F, G, H|A floppy disk interface can control up to 2 drives.|
|Data recorder|CAS|Not available on MSX turbo R|
|Data cartridge (Sony)|CAT|Requires Sony HBI-55|
|Linked computer|COM[n]|Requires RS-232C interface|
|Data cartridge (Yamaha)|DC|Requires Yamaha UDC-01 + YRM-104 or YRM-504|
|Memory disk|MEM|Created with CALL MEMINI|
|Device controlled by Pioneer UC-V102|RS[n]|Requires Pioneer UK-V104 RS-232C board|
|Stringy Floppy Drive(special data recorder)|S|Requires Spectravideo SVI-777<br>Not available on MSX turbo R|

By default, the loading will be made from tape on a system without any disk drive, from the current active drive (generally drive A) in the other cases.

`<Path>` is used to specify the location in folders of file to merge. Each folder name in path are separate by a backslash `\`. This parameter is only available in version 2 of Disk BASIC.

`<Filename>` is the BASIC program name saved in ASCII text to merge with the program in the MSX memory. The device name needs to be specified if the file is on disk or memory disk. If you use a tape and don't indicate the file name, `MERGE` will load the first BASIC program in ASCII text found on tape.

The size of file name is limited to 6 characters without extension, when the device is a _Data recorder_. If another device is used, then the size is 8 characters followed by a point and an extension with 3 characters.

## Related to

`CALL MEMINI`, `LOAD`, `RUN`, `SAVE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/MERGE"
