# INPUT

## Effect

Retrieves data from the keyboard or reads data from a sequential file, storing the input (strings or numbers) into variables.

## Syntaxes

`INPUT "<Prompt>"; <Variable>,<Variable>...`

`INPUT#<FileNumber>,<Variable>,<Variable>...`

_Note: Parameters can not end with a comma alone._

## Parameters

`<Prompt>` is the text displayed that will be followed by a question mark to ask what you need to input. String variable is ignored.

`<Variable>` is a numeric/string variable that will take the input value/string. We can add variables to enter a series of values, each separated by a comma.

`<FileNumber>` is the number of file opened by `OPEN`.

_Note: Using this parameter does not go to text screen mode when the instruction is executed in a graphic screen mode, and with device `"CON"` only the characters that has been typed will be retrieved, other characters on same input line will not be retrieved._

## Examples

```basic
10 INPUT "What is your favorite computer system";A$
20 PRINT A$
 
RUN
What is your favorite computer system?
MSX
```

```basic
10 INPUT "What is your preferred number";A
20 PRINT A
 
RUN
What is your preferred number?
13
```

```basic
10 OPEN "CAS:DATA" FOR INPUT AS #1
20 IF EOF(1) THEN 40
30 INPUT#1,X$,Y$,Z$ : PRINT X$,Y$,Z$ : GOTO 20
40 CLOSE#1 : END
```

```basic
10 COLOR 15,4,4:SCREEN 2
20 OPEN"con" FOR INPUT AS #1
30 INPUT#1,A$: CLOSE#1
40 PSET(124-(LEN(A$)*4),92),4
50 OPEN"grp:" AS #1
60 PRINT#1,A$: CLOSE#1
70 IF NOT STRIG(0) THEN 70  ' Press Space key to exit
80 END
```

## Data

### Retrieved from keyboard

You need to enter as many values as in the `INPUT` command and they need to be separated by a comma. Strings are accepted, but if they include a comma they need to be surrounded with `"` (Input format is similar to `DATA` statement).

If there's an error in the entered values, the message _? Redo from start_ is displayed and the `INPUT` command is executed again.

If values are missing `??` is displayed and user is given possibility to enter the missing value(s).

In case of too many values are given a message `? Extra ignored` will be displayed and the program will continue without storing the extra values.

If a string or number already has a value and the new input is empty (only Return/Enter pressed on the keyboard) then the old value remains unchanged.

### Read from sequential file

If the values are read from a sequential file, the variables on this file need to be in the same order than the variables of the `INPUT` command.

In case of strings on a sequential file, the end of the string is determined by a comma, RETURN or Line Feed. However, if the first character of the string is a quotation mark `"` then the second quotation mark is viewed as the end of the string.

## Related to

`CLOSE`, `EOF`, `INPUT$`, `LINE INPUT`, `OPEN`, `PRINT`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/INPUT"
