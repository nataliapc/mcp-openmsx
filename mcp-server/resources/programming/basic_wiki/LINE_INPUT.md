# LINE INPUT

## Effect

Retrieves a complete string from the keyboard or a sequential file, storing the input of maximum 254 characters into a variable.

_Note: Contrary to `INPUT`, this instruction does not go to text screen mode when it is executed in a graphic screen mode but the input is not done correctly._

## Syntaxes

`LINE INPUT["<Prompt>";]<Variable>`

`LINE INPUT#<FileNumber>,<Variable>`

## Parameters

`<Prompt>` is the text displayed to ask what you need to input, but contrary to `INPUT`, it is not followed by a question mark.

`<Variable>` is a string variable that will take the input string.

`<FileNumber>` is the number of file opened by `OPEN`.

_Note: With this parameter and device `"CON"`, only the characters that has been typed will be retrieved, other characters on same input line will not be retrieved._

## Examples

```basic
10 LINE INPUT "What is your favorite computer system ?";A$
20 PRINT A$
 
RUN
What is your favorite computer system ?
MSX
```

```basic
10 OPEN "CAS:DATA" FOR INPUT AS #1
20 IF EOF(1) THEN 40
30 LINE INPUT#1,A$ : PRINT A$ : GOTO 20
40 CLOSE#1 : END
```

```basic
10 COLOR 15,4,4: SCREEN 2
20 OPEN"con" FOR INPUT AS #1
30 LINE INPUT#1,A$: CLOSE#1
40 PSET(124-(LEN(A$)*4),92),4
50 OPEN"grp:" AS #1
60 PRINT#1,A$: CLOSE#1
70 IF NOT STRIG(0)THEN 70 ' Press Space key to exit
```

## Data

### Retrieved from keyboard

The data retrieved from the keyboard are stored in only one value (not several values) and it's always a string (never a number).

`LINE INPUT` accepts all types of characters. Only pressing the `RETURN/ENTER` key will specify the end of the string.

### Read from sequential file

The data read from a sequential file are stored in only one value (not several values) and it's always a string (never a number).

`LINE INPUT` accepts all types of characters. Only a `RETURN` character is viewed as the end of a string.

This instruction is very useful to read a MSX-BASIC program as datafile, if it was saved (by using the `SAVE` instruction) in ASCII text.

## Related to

`INPUT`, `INPUT$`, `OPEN`, `PRINT`, `SAVE`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/LINE_INPUT"
