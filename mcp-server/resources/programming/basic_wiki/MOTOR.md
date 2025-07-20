# MOTOR

## Effect

Turns the motor of the data tape recorder on or off.

## Syntax

`MOTOR [ON|OFF]`

## Parameters

48Without any parameter, `MOTOR` works as a toggle between both positions of the motor.

With `ON`, you turn the motor on.

With `OFF`, you turn the motor off.

## Examples

This example toggles the motor on and off 10 times, with a delay in between:

```basic
10 FOR I=1 TO 10
20 MOTOR
30 FOR J=1 TO 500:NEXT J
40 NEXT I
```

This example turns the motor on and then loads a program named "DEMO":
```basic
10 MOTOR ON
20 CLOAD "DEMO"
```

## Related to

`CLOAD`, `CLOAD?`, `CSAVE`

## Compatibility

MSX-BASIC versions before 4.0

## Source

Retrieved from "https://www.msx.org/wiki/MOTOR"
