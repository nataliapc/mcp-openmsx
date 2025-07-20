# FRE()

## Effect

- Returns the amount of bytes in memory which can be used for BASIC programs, variables, etc... if the parameter is a numeric value.
- Returns the amount of bytes in memory which can be used for strings If the parameter is a string.

## Syntaxes

`FRE(<Value>)`

`FRE("<String>")`

## Parameters

`<Value>` can be any value or a numeric variable.

`<String>` can be any string between double quotes `"` or a string variable (also named as alphanumeric variable).

## Examples

Get free memory for your Basic program:

```basic
10 PRINT "First there are ";FRE(0);" bytes free"
20 DIMB(100)
30 PRINT "Now there are ";FRE(0);" bytes free"
 
RUN
First there are 23332 bytes free
Now there are 22516 bytes free
```

Get free memory for strings in your Basic program:

```basic
PRINT FRE("")
 200
Ok

A$="MSX"
PRINT FRE(A$)
 197
Ok
```

## Tips to increase the free RAM in MSX-BASIC

- Use `ELSE` instead of `REM` when you comment out instructions (helps also with `RENUM` problems).
- In other comments (especially in "comment only" lines where `:` is not needed) use `REM` instead of `'` (i.e. `10 ELSEGOTO10` takes up 10 bytes in RAM, `10 REMGOTO10` takes up 12 bytes and `10 'GOTO10` takes up 14 bytes of RAM).
- Don't use `SPACE` characters between instructions (but it will make your code less easy to read).
- Define variables as integers when ever possible.
- Allocate correct amount of space for strings and tables.
- Disable BASIC extensions that you don't need (i.e. hold down `SHIFT` during boot to disable all disk drives or `CTRL` to disable 2nd drive).

## Related to

`CLEAR`, `ELSE`, `ERASE`, `NEW`, `REM`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/FRE()"
