# SAVE

## Effect

Saves the BASIC program present in the MSX memory to a device.

If you use cassette, the program will be saved in ASCII mode.

If you use another device, the program can be saved in ASCII text or in tokenized format.

## Syntax

`SAVE "<Device>:\<Path>\<Filename>",A`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.
- Parameters in quotes can be replaced by a alphanumeric variable containing the corresponding parameters.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.
- Parameters can not end with a comma alone.

## Parameters

`<Device>` is the name for used device (see table below):

|Device type|Device name|Remark|
|:--|:-:|---|
|Disk drive|A, B, C, D, E, F, G, H|A floppy disk interface can control until 2 drives.|
|Data recorder|CAS|Not available on MSX turbo R|
|Data cartridge (Sony)|CAT|Requires Sony HBI-55|
|Linked computer|COM[n]|Requires RS-232C interface|
|Data cartridge (Yamaha)|DC|Requires Yamaha UDC-01 + YRM-104 or YRM-504|
|Memory disk|MEM|Created with CALL MEMINI|
|Device controlled by Pioneer UC-V102|RS[n]|Requires Pioneer UK-V104 RS-232C board|
|Stringy Floppy Drive(special data recorder)|S|Requires Spectravideo SVI-777Not available on MSX turbo R|

By default, the saving will be made to tape on a system without any disk drive, to the current active drive (generally drive A) in the other cases.

`<Path>` is used to specify the location in folders where you want save the file. Each folder name in path are separate by a backslash `\`. This parameter is only available in version 2 of Disk BASIC.

`<Filename>` is a string that contains the file name of Basic program to save.

When the file is saved on tape the format of file name is case sensitive and limited to 6 characters without extension. If another device is used, then the format is 8 characters followed by a point and an extension with 3 characters (not case sensitive).

if you use `CAT`, `DC` or `MEM` as device, the saving will always be made in ASCII text mode (not tokenized).

On other devices, when the parameter `A` is indicated, the BASIC program will be saved to ASCII codes otherwise it will be saved as it is (tokenized format).

Parameter `A` is only useful if you save on disk or another computer and want to get the program in ASCII mode.

## ASCII text and Tokenized format

The tokenized format allows a faster loading than the loading of the same BASIC program in ASCII text and the loaded program takes less space in the MSX memory.
However, contrary to the ASCII text, the listing of the program can't be directly displayed and read. Besides, `RUN` needs to be used after loading with `CLOAD` instead of using `RUN` as unique instruction.

## Related to

`CALL MEMINI`, `CLOAD`, `CSAVE`, `LOAD`, `MERGE`, `RUN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/SAVE"
