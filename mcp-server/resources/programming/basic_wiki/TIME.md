# TIME

## Effect

This is a timer that is incremented by 1 on each time VDP completes screen draw. Depending of screen refresh rate this happens either 50 or 60 times a second.

This special integer value stored in `JIFFY` (0FC9Eh) can be read or write like a normal integer.

## Syntax

`TIME`

## Examples

```basic
5 ' European machine
10 CLS
20 LOCATE 10,6
30 PRINT "HH:MM:SS START"
40 TIME=0
50 T=TIME
60 H=INT(T/180000)
70 T=T-(H*180000)
80 M=INT(T/3000)
90 T=T-(M*3000)
100 S=INT(T/50)
110 LOCATE 10,8
120 PRINT USING "##:##:##";H;M;S
130 GOTO 50
```

```basic
5 ' Japanese machine
10 CLS
20 LOCATE 10,6
30 PRINT "HH:MM:SS START"
40 TIME=0
50 T=TIME
60 H=INT(T/216000)
70 T=T-(H*216000)
80 M=INT(T/3600)
90 T=T-(M*3600)
100 S=INT(T/60)
110 LOCATE 10,8
120 PRINT USING "##:##:##";H;M;S
130 GOTO 50
```

## Related to

`ON INTERVAL GOSUB`, `RND()`

## Compatibility

MSX-BASIC 1.0 or higher

## Source

Retrieved from "https://www.msx.org/wiki/TIME"
