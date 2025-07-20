# INPUT$()

## Effet

Returns a string characters of defined length retrieved from the keyboard or a sequential file. 

## Syntax

`INPUT$(<Number>,#<FileNumber>)`

## Parameters

`<Number>` is the number of characters to retrieve.

`#` precedes file number. It is optional and has no effect.

`<FileNumber>` is the number of file assigned to the sequential file opened with the `OPEN` command.

## Examples

```basic
10 A$=INPUT$(3)
20 PRINT A$
 
RUN
MSX
```

```basic
10 OPEN "CAS:DATA" FOR INPUT AS #1
20 IF EOF(1) THEN 40
30 A$=INPUT$(3,1) : PRINT A$ : GOTO 20
40 CLOSE#1 : END
```

## Data

- The data retrieved from the keyboard or a sequential file are stored in only one value (not several values) and it's always a string (never a number).
- `INPUT$` accepts all characters, especially the control-sequences (with exception for CTRL/C). Therefore `INPUT$` is useful for data transfer from other machines. In such transmissions all characters might be important.

## Related to

`CLOSE`, `EOF`, `INKEY$`, `INPUT`, `LINE INPUT`, `OPEN`, `PRINT`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/INPUT$()"
