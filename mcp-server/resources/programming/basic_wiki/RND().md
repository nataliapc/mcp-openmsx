# RND()

## Effect

Returns a pseudo-random value between 0 and 1. Each time a program is started with `RUN` the sequence of randomly generated output will be identical.

## Syntax

`RND(<Variable>)`

## Parameter

`<Variable>` must be a numeric variable:
- When this variable is negative, the random number generation is re-seeded.
- When this variable is positive, a new random number will be returned. 
- When this variable is equal to zero, the last generated random number will be repeated.

To generate a real random-number the generator must always select a new sequence after the program has been started. This can be ensured by using the variable `TIME`.

## Examples

```basic
10 X=RND(1)*100
20 PRINT X;" is a pseudo-random number between 0 and 100 ";
 
RUN
59.521943994623 is a pseudo-random number between 0 and 100
```

```basic
10 R=RND(-TIME)
20 FOR I=1 TO 10
30 SCREEN 2:COLOR 15,4,7
40 C=INT(RND(1)*15+1)
50 IF C=4 GOTO 40
60 CIRCLE (80,80),20,C
70 PAINT (80,80),C
90 NEXT I
```

## Related to

`TIME`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/RND()"
