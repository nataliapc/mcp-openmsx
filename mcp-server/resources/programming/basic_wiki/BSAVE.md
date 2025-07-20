# BSAVE

## Effect

Saves a specified area of memory to the specified device and/or file name.

## Syntaxes

`BSAVE "<Device>:<Path>\<Filename>",<StartAddress>,<EndAddress>,<ExecutionAddress>`

`BSAVE "<Device>:\<Path>\<Filename>",<StartAddress>,<EndAddress>,S`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.
- Parameters can not end with a comma alone.

## Parameters

`<Device>` is device name to indicate the device to use. Here are the useful devices for BSAVE:

|Device type|Device name|Remark|
|---|---|---|
|Disk drive|A, B, C, D, E, F, G, H|A floppy disk interface can control up to 2 drives.|
|Data recorder|CAS|Not available on MSX turbo R|

By default, the saving will be made to tape on a system without any disk drive, to the current active drive (generally drive A:) in the other cases.

`<Path>` is used to specify the location in folders of file to be used in the copying operation. Each folder name in path are separate by a backslash `\`. This parameter is only available under MSX-DOS 2 / Nextor.

`<Filename>` is the name of binary file to save. When the file is saved on tape the format of file name is case sensitive and limited to 6 characters without extension. If another device is used, then the format is 8 characters followed by a point and an extension with 3 characters. (Not case sensitive).

`<StartAddress>` and `<EndAddress>` are used to specify the area of the computer RAM (or VRAM).

`<ExecutionAddress>` is the address at which the saved code should start, when loaded with `BLOAD` `,R`. By default the start address is set.

The parameter `S` is used to save the contents of VRAM (only to disk) - This can be done in any screen mode but only the active pages are valid when the screen mode is higher than 4.

## Examples

```basic
BSAVE "CAS:test",&amp;HC000,&amp;HD0FF,&amp;HC020
```
```basic
BSAVE "A:TEST.BIN",&amp;HC000,&amp;HD0FF,&amp;HC020
```
```basic
BSAVE "PICTURE.SC2",&amp;H0,&amp;H3FFF,S
```

## Related to

`BLOAD`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/BSAVE"
