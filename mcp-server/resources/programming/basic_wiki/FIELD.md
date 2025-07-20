# FIELD

## Effect

Defines random access file record format. The file needs to be opened with `OPEN` before fields can be defined.

The record is separated into single fields. Every data field has a length and a string variable is assigned to access this fixed size space inside the record buffer. The number of fields is not limited but must not exceed the record length as specified with `OPEN` (by default: 256).

The fields inside a record are assigned in same order as they are presented in a program. Presentation can be done with single or multiple `FIELD` instructions. These fields are not separated in any way and their format is not stored, so record format needs to be presented both for reading and writing.

_Notes:_
- Random access of files in BASIC originates from time before disk drives, so it helps to understand the ideology and functionality, if you think the records as virtual stack of punched cards.
- `LET` can't be used to modify the record buffer, because it moves variable back to normal variable storage space. When handling random access files, you need to use `LSET` or `RSET` instead of `LET`.
- The record buffer location in memory can be checked with the `VARPTR` instruction.

## Syntax

`FIELD # <FileNumber>,<CharacterLength> AS <StringVariable>,<CharacterLength> AS <StringVariable> ...`

At least one data field needs to be defined. Parameters can not end with a comma alone.

## Parameters

`<FileNumber>` is the number of the open file, it can vary between 1 and 15, but can't exceed the maximum number of files eventually defined with `MAXFILES`. The `#` in front can be omitted.

`<CharacterLength>` is the length of a data field.

`<StringVariable>` is the variable assigned to this data field.

## Example

```basic
10 OPEN "A:RECORD.DAT" AS #1 
20 FIELD #1, 20 AS A$, 10 AS B$, 15 AS C$
30 CLOSE #1
```

## Related to

`CLOSE`, `GET`, `LSET`, `MAXFILES`, `OPEN`, `PUT`, `RSET`

## Compatibility

Disk BASIC 1.0 or higher / both modes of Nextor OS

## Source

Retrieved from "https://www.msx.org/wiki/FIELD"
