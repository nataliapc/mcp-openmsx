# DIM

## Effect

Reserves memory for the specified variables and initializes the array(s).

_Note: If if an array is referred to when not first created with a `DIM` instruction, a maximum index of 10 is assumed._

## Syntax

`DIM <ArrayName>(<Size1>,<Size2>),<ArrayName>(<Size1>,<Size2>),...`

## Parameters

`<ArrayName>` is an alphanumeric variable or a string. Several array names can be specified in the `DIM` instruction, they need to be separated by a comma.

`<Size1>` is a number that specifies the maximum index of the array. The first index is always 0.

`<Size2>` is optional, it is required only for two-dimensional arrays and specifies the maximum index for the second dimension of the array.

## Examples

```basic
10 DIM M(25)
20 FOR A=0 TO 25:M(A)=3*A:NEXT
30 FOR A=0 TO 25
40 PRINT "3 times ";A;" is ";M(A)
50 NEXT A
```
```basic
10 DIM A$(26)
20 FOR I=0 TO 26
30 A$(I)=CHR$(64+I)
40 NEXT I
50 PRINT A$(22)
 
RUN
V
```
```basic
10 DIM A(20,5)
20 A(20,5)=2
30 PRINT "In row 20, column 5 of array A I stored the value ";A(20,5)
 
RUN
In row 20, column 5 of array A I stored the value 2
```

## Related to

`CLEAR`, `COPY`, `ERASE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DIM"
