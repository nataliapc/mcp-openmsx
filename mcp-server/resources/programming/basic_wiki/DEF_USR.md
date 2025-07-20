# DEF USR

## Effect

Defines the start address of a machine language routine for later use in MSX-BASIC. Up to 10 different routines can be used.

## Syntax

`DEF USR <Number>=<Address>`

## Parameters

`<Number>` can range from 0 to 9. When omitted, 0 is assumed.

`<Address>` is the start address of the machine language routine.

## Example

```basic
10 DEF USR1=&H156:A=USR1(0) ' To clear keyboard buffer
```

## Related to

`USR()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/DEF_USR"
