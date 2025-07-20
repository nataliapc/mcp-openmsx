# PRINT

## Effect

Displays and formats text and numbers on the screen or sends formatted data to different devices through file handling.

_Note: `PRINT` can be replaced by the `?` character. This will be expanded to `PRINT` when listing a MSX-BASIC program._

## Syntax

`PRINT #<FileNumber>, USING <ItemFormat>; <Item>;<Item>...`

## Parameters

`<Item>` can be a character string, an expression, a variable or a value to display or send. All four items types can be mixed freely.

Items must be separated by `;`. If the last item does not end to `;` then `CR`+`LF` combination is displayed or sent.

A comma can replace a `;` to separate the items. In case of `,` they are separated by tabulator instead of a space.

`<Item>` can be omitted to display or send an empty line.

`#<FileNumber>`, is optional. `<FileNumber>` is a number between 0 and 15 that points to opened file name. Please see `OPEN` instruction.

`USING <ItemFormat>;` is optional. `<ItemFormat>` is a string that defines how the next items to be displayed or sent must be formatted. When `USING` is used the type of following usable items depends on the specified format.

The format string can contain following definitions:

_**Editor's note: Following table and comments are inaccurate and need revisiting.**_

<table>
<tr><th>Format definition</th><th>Data type</th><th>Description</th></tr>
<tr><td>!</td><td>String</td><td>Prints only first character of current item. Example:

```basic
PRINT USING "!";"United","Nations"
UN
```
</td></tr>
<tr><td>\[n spaces]\</td><td>String</td><td>Prints n+2 characters. When the length of the data is less than n+2 characters, the rest is padded with spaces. Example:

```basic
PRINT USING "\  \";"ABCDEF","GHI","JKLMN"
ABCDGHI JKLM
```
</td></tr>
<tr><td>&</td><td>String</td><td>Displays the whole string. Example:

```basic
A$="North";B$="South":PRINT USING "& Pole ";A$,B$
North Pole South Pole
```
</td></tr>
<tr><td>#</td><td>Number</td><td><li>Reserves a space (up to 24) for number. Decimal point can be specified with the full stop ".". Example:

```basic
PRINT USING "POINT:###.#";123.4
POINT:123.4
```
<li>When the amount of digits is smaller than the amount of specified `#`, the number is displayed with equal amounts of margins at both sides and when the number of digits is larger, a `%` is output. Example:

```basic
10 PRINT USING "####";12
20 PRINT USING "####";12345
RUN
  12
%12345
```
<li>When the number of digits behind the decimal separator is smaller than the amount of the input, it is padded with a "0" and when it is larger, it is rounded to the nearest integer number. Example:

```basic
10 PRINT USING "##.##";25.3
20 PRINT USING "##.##";25.345
RUN
25.30
25.35
```
<li>When displaying numeric data, the "+" sign is ignored and the character is counted as a number. Example:

```basic
10 PRINT USING "###";+123
20 PRINT USING "###";-123
RUN
123
%-123
```
</td></tr>
<tr><td>+</td><td>Number</td><td>Positive numbers will be output with "+"-sign and negative numbers with a "-"-sign. Either in front or behind the number. Example:

```basic
10 PRINT USING "+####";123,-123
20 PRINT USING "####+";123,-123
RUN
 +123 -123
 123+ 123-
```
</td></tr>
<tr><td>-</td><td>Number</td><td>Can be used to mark "-" to end of number when the number is negative. Example:

```basic
PRINT USING "###-";123,-123
RUN
123 123-
```
</td></tr>
<tr><td>**</td><td>Number</td><td>The space for numerical data will be filled with "*" characters. A single "*" represents a single digit. Example:

```basic
10 PRINT USING "**######";123
20 PRINT USING "**######";-234
RUN
*****123
****-234
```
</td></tr>
<tr><td>££</td><td>Number</td><td>Displays "£" in front of number. One "£" layout symbol counts as digit. Example:

```basic
10 PRINT USING "££###";1234
20 PRINT USING "+££###";-1234
RUN
£1234
-£1234
```
</td></tr>
<tr><td>**£</td><td>Number</td><td>Displays "£" in front of number and fills up heading spaces with "*". Example:

```basic
PRINT USING "**£###.##";12.34
***£12.34
```
</td></tr>
<tr><td>,</td><td>Number</td><td>Numbers will be printed in groups of 3 separated by "," if a comma is used somewhere before the decimal point. Example:

```basic
PRINT USING "#,######.##";12345.67
  12,345.67
```
</td></tr>
<tr><td>^^^^</td><td>Number</td><td>Displays the number in scientific format. The ^^^^ part represents the numbers of the exponent part. Example:

```basic
PRINT USING "##.##^^^^";234.56
  2.35E+02
```
</td></tr>
</table>

_Please note: Format string should be used with caution. Pound signs should be avoided since this causes compatibility problems. On some machines this is "$" depending on local currency. "&" has been replaced with "\" on european and Brazilian machines causing easily _"Type missmatch"_ error in localized machines. In Japanese machines "\" is printed as "¥"._

## Examples

```basic
10 FM$="The print documentation on & & has ##.#% relative accuracy"
20 PRINT USING FM$;"MRC",5
 
RUN
The print documentation on MRC has  5.0% relative accuracy
Ok
```

```basic
PRINT USING "!!!";"Alpha";"Beta";"Charlie"
ABC
Ok
```

## Related to

`CSRLIN`, `LOCATE`, `LPRINT`, `MAXFILES`, `OPEN`, `POS()`, `SCREEN`, `SPC()`, `TAB()`
, `WIDTH`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/PRINT"
