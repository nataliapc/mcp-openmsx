# FOR...NEXT

## Effect

Sets up a loop in order to repeat a block of instructions until the counter variable has exceeded the end value.

## Syntax

`FOR <Variable1>=<StartValue> TO <EndValue> STEP <Increment>`  
...  
`NEXT <Variable1>,<Variable2>,...`

_Notes:_
- Several `FOR...NEXT` loops are possible.
- "..." can be several program lines
- `NEXT` can be applied on several loops,

For example:  
`NEXT <Variable1>,<Variable2>`  
has the same effect as  
`NEXT <Variable1> : NEXT <Variable2>`  
 (see also examples below).

## Parameters

`<Variable1>` is the numeric variable used for the loop. After the instruction `NEXT`, the variables are optional. They are used only to indicate to which loop it corresponds.

`<Variable2>`,etc are variables from preceding outer loops.

`<StartValue>` is the variable value on which the loop begins.

`<EndValue>` is the limit value of the loop.

`STEP` is an optional part that can be only used with `<Increment>` together.

`<Increment>` is the value to add at each back to begin. By default the value is 1.

_Note: if `<EndValue>` is inferior to `<StartValue>` then `<Increment>` must be negative._

`NEXT` is an instruction that causes the increment and then go back to the line just after that of the `FOR` instruction as long as the result does not exceed `<EndValue>`.

_Note: Each variable behind `NEXT` is optional except the last specified. Do not put a comma after this variable._

Within a loop another loop can be implemented, so loops can be nested. To avoid confusion, it's better to specify the corresponding variable(s) after `NEXT`. Every loop will be executed at least once because the termination condition is checked in the `NEXT` instruction(s).

## Examples

```basic
10 FOR x=1 TO 25 STEP 5
20 PRINT x
30 NEXT

RUN
 1
 6
11
16
21
```
```basic
10 FOR I=1 TO 4
20 PRINT I;
30 NEXT:PRINT
40 FOR I=0 TO 5 STEP 5
50 FOR J=0 TO I+2
60 PRINT J;
70 NEXT J,I:PRINT

RUN
 1 2 3 4
 0 1 2 0 1 2 3 4 5 6 7
```

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/FOR...NEXT"
