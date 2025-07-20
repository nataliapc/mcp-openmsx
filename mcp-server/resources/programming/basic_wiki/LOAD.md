# LOAD

## Effect

Loads a BASIC program in the MSX memory and optionally executes it.

If you use a cassette, the program needs to be in ASCII text, saved with `SAVE`, not with `CSAVE`.

If you use a different device, the program can be either in ASCII text or in tokenized format.

## Syntax

`LOAD "<Device>:\<Path>\<Filename>",R`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.
- Parameters in quotes can be replaced by a alphanumeric variable containing the corresponding parameters.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.
- Parameters can not end with a comma alone.

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

By default, the loading will be made from tape on a system without any disk drive, from the current active drive (generally drive `A`) in the other cases.

`<Path>` is used to specify the location in folders of file to load. Each folder name in path are separate by a backslash `\`. This parameter is only available in version 2 of Disk BASIC.

`<Filename>` is the file name that contains the BASIC program to load. It needs to be specified if the file is on disk or memory disk. If you use a tape and don't indicate the file name, `LOAD` will load the first or next BASIC program in ASCII mode found on tape.

When the file is saved on tape the format of file name is case sensitive and limited to 6 characters without extension. If another device is used, then the format is 8 characters followed by a point and an extension with 3 characters (not case sensitive).

Parameter `R` forces the execution of BASIC program after load.

## Related to

`CALL MEMINI`, `CLOAD`, `CSAVE`, `MERGE`, `RUN`, `SAVE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LOAD"
