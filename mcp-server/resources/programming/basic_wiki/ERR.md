# ERR

## Effect

Returns the code number of the error that occured.

Can vary between 1 and 255.

As MSX-BASIC uses values 1 to 25 and Disk BASIC values 50 to 82, you can use the non-defined values to generate specific error messages in your programs. Variables are not usable.

## Syntax

`ERR`

## Example

```basic
10 ON ERROR GOTO 50
20 MSX ' Generates an error, as "MSX" is not a valid MSX-BASIC command
30 END
50 PRINT "Error code ";ERR
60 RESUME 30
70 ON ERROR GOTO 0

run
Error code  2
```

## Defined Errors

### MSX-BASIC and Disk BASIC

Errors 72 to 75 have been added by version 2 of Disk BASIC, 76 to 82 by version 3 provided by the Nextor operating system.

|MSX-BASIC|Message|
|:-:|---|
|1|NEXT without FOR|
|2|Syntax error|
|3|RETURN without GOSUB|
|4|Out of DATA|
|5|Illegal function call|
|6|Overflow|
|7|Out of memory|
|8|Undefined line number|
|9|Subscript out of range|
|10|Redimensioned array|
|11|Division by zero|
|12|Illegal direct|
|13|Type mismatch|
|14|Out of string space|
|15|String too long|
|16|String formula too complex|
|17|Can't CONTINUE|
|18|Undefined user function|
|19|Device I/O error|
|20|Verify error|
|21|No RESUME|
|22|RESUME without error|
|23|Unprintable error|
|24|Missing operand|
|25|Line buffer overflow|

|Disk BASIC|Message|
|:-:|---|
|50|FIELD overflow|
|51|Internal error|
|52|Bad file number|
|53|File not found|
|54|File already open|
|55|Input past end|
|56|Bad file name|
|57|Direct statement in file|
|58|Sequential I/O only|
|59|File not OPEN|
|60|Bad FAT|
|61|Bad file mode|
|62|Bad drive name|
|63|Bad sector number|
|64|File still open|
|65|File already exists|
|66|Disk full|
|67|Too many files|
|68|Disk write protected|
|69|Disk I/O error|
|70|Disk offline|
|71|Rename across disk|
|72|File write protected|
|73|Directory already exists|
|74|Directory not found|
|75|RAM disk already exists|
|76|Invalid device driver|
|77|Invalid device or LUN|
|78|Invalid partition number|
|79|Partition already in use|
|80|File is mounted|
|81|Bad file size|
|82|Invalid cluster sequence|

### HI-GRAPhics

HI-GRAPHics is an utility written by Arjen Schrijvers (see Interlacing Demo).

Note that the error messages can be in conflict with Disk BASIC versions 2 and 3.

|HI-GRAPHics|Message|
|:-:|---|
|72|Bad display page|
|73|Bad screen mode|
|74|Bad display mode|

### Delta BASIC

|Delta BASIC|Message|
|:-:|---|
|200|ENDPROC without PROC|
|201|DEFPROC not found|
|202|ENDPROC not found|
|203|MODE error|
|204|UNNEW without NEW|
|205|Program recovered|
|206|TOO MUCH varspace|
|207|NO ROOM for vars|
|208|INVALID definition windows|
|209|INVALID window|
|210|MISSING definition window|
|211|LOCATE out of window|
|212|MEMDISC initialised|
|213|LINE number too big|
|214|MOVLIN error|
|215|COPLIN error|
|216|STATE size|

## Related to

`ERL`, `ERROR`, `ON ERROR GOTO`, `RESUME`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/ERR"
