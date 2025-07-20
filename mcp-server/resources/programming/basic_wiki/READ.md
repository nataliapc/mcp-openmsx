# READ

## Effect

Returns next value(s) that has been stored in the program source by using `DATA` instructions.

## Syntax

`READ <Variable>,<Variable>...`

_Note: Parameters can not end with a comma alone._

## Parameter

`<Variable>` is a variable that matches with the datatype stored in `DATA` instruction.

After `READ` instruction is executed the data pointer will automatically move to next item. Data pointer can be moved manually by using `RESTORE` instruction.

## Example

```basic
10 READ A$
20 PRINT A$
30 READ A,B
40 PRINT A
50 PRINT B
60 DATA "TEST",10,20
 
RUN
TEST
 10
 20
```

## Related to

`DATA`, `DIM`, `RESTORE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/READ"
