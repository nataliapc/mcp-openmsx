# BLOAD

## Effect

Loads binary code from the specified device and/or filename.

## Syntaxes

`BLOAD "<Device>:<Path>\<Filename>",R,<Offset>`

`BLOAD "<Device>:<Path>\<Filename>",S,<Offset>`

_Notes:_
- Character backslash `\` serves as a separator between the folders and the file name. You don't have to put it after the colon of the device name.
- Character backslash is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX.
- Parameters can not end with a comma alone.

## Parameters

`<Device>` is device name to indicate the device to use. Here are the useful devices for BLOAD:

|Device type|Device name|Remark|
|---|---|---|
|Disk drive|A, B, C, D, E, F, G, H|A floppy disk interface can control up to 2 drives.|
|Data recorder|CAS|Not available on MSX turbo R|

By default, the loading will be made from tape on a system without any disk drive, from the current active drive (generally drive A) in the other cases.

`<Path>` is used to specify the location in folders of file to be used in the copying operation. Each folder name in path are separate by a backslash `\`. This parameter is only available under MSX-DOS 2 / Nextor.

`<Filename>` is the name of the binary file to load. It needs to be specified if the file is on disk or memory disk. If you use a tape and don't indicate the file name, BLOAD will load the first binary file found on tape.

When the file is saved on tape the format of file name is case sensitive and limited to 6 characters without extension. If another device is used, then the format is 8 characters followed by a point and an extension with 3 characters. (Not case sensitive).

`R` parameter is used to run automatically the binary code contained in the loaded file. 

`S` parameter is used to load the contents to VRAM (only from disk) - This can be done in any screen mode but only the active pages are valid when the screen mode is higher than 4.

`<Offset>` indicates the program will be loaded at &lt;StartAddress&gt; + &lt;Offset&gt;. This parameter also affects the execution address.

## Examples

```basic
BLOAD "CAS:test",R,&H20
```
```basic
BLOAD "A:TEST.BIN",R
```
```basic
BLOAD "PICTURE.SC2",S
```

## Related to

`BSAVE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/BLOAD"
