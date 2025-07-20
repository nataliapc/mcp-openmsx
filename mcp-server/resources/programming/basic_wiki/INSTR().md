# INSTR()

## Effect

Returns the position of the first occurrence of a substring in a specified string, this from a specified position.

Special values:
- 0 if the specified string is empty OR the substring is not found in the string OR the starting position is higher than the length of the string.
- value of starting position if the required substring is empty AND the specified string is not empty AND the starting position is not higher than the length of the string.

_Note: For strings with Japanese or Korean characters, you need to use `CALL KINSTR`._

## Syntax

`INSTR(<Start>,"<String1>","<String2>")`

## Parameters

`<Start>` is the starting position in the string to find the substring. The first character in the string is numbered 1. The highest possible position is 255. When omitted, the search will start from the first character.

`<String1>` and `<String2>` are strings of characters between double quotes `"`. They can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

`<String2>` is the substring to be found in `<String1>`.

## Example

```basic
10 PRINT INSTR("I like MSX!","MSX");
 
RUN
8
```

## Related to

`CALL KINSTR`, `LEN`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/INSTR()"
