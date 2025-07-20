# VARPTR()

## Effect

Returns a pointer to either:
- the beginning of file work area.
- or the actual memory address of the first byte of the variable passed (in page 2 or 3 of the RAM, starting at &H8000).

In case of file number, the first byte of file work area contains information about how the file was opened. (1= input, 2=output, 4=random) In Disk BASIC 1.x the file work area offsets +1 & +2 point to FCB (File Control Block) associated with the specified file number. In Disk BASIC 2.x offset +1 contains number of the opened file handle.

In case of variable, the pointed variable is stored on 2, 3, 4 or 8 bytes depending on the variable  type: the numbers are coded on 2 bytes for integer, 4 for simple precision or 8 for double precision. In case the variable is string the address of string pointer is returned, this string pointer contains length & address of the string (3 bytes).

See [Math-pack routines](https://www.msx.org/wiki/BASIC_Routines_In_Main-ROM#Math-pack_routines) for more info about the format of each type.

## Syntaxes

`VARPTR(<VariableName>)`

`VARPTR(#<FileNumber>)`

## Parameters

`<VariableName>` can be any variable in use.

`<FileNumber>` is the number of opened file: 1 up to 15 depending on `MAXFILES` or 0 for the tempory file FCB.

## Example

```basic
10 X=5
20 V=VARPTR(X)
30 PRINT V
40 PRINT "&H"+HEX$(V)
 
RUN
-32735
&H802B
```

## Related to

`CLOSE`, `MAXFILES`, `OPEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/VARPTR()"
