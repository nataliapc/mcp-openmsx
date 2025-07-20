# PLAY()

## Effect

Checks if music is being played via PSG channels.

The function returns -1 (true) if the selected channel is playing. If playing has ended the function returns 0 (false) again.

If the function is called immediately after the `PLAY` statement the value -1 is persistent.

## Syntax

`PLAY(<Channel>)`

## Parameter

`<Channel>` allows to specify the PSG channel(s) to check: 
- 0 = all channels
- 1 = channel 1 
- 2 = channel 2 
- 3 = channel 3

## Examples

```basic
10 PLAY "CDE"
20 IF PLAY(0) THEN 20 ' Wait for playing to end on all channels
```
```basic
10 A$="":BEEP
20 FOR I=1 TO 6
30 READ AA$:A$=A$+AA$
40 NEXT I
50 PLAY "XA$;"
60 SCREEN 0:CLS
70 IF PLAY(0)=-1 THEN PRINT "The music is playing":GOTO 70
80 PRINT "The music has ended"
90 END
100 DATA CCGGAAGR
110 DATA FFEEDDCR
120 DATA GGFFEEDR
130 DATA GGFFEEDR
140 DATA CCGGAAGR
150 DATA FFEEDDCR
```

##  Related to

`BEEP`, `CALL PLAY`, `PLAY`

## Compatibility

MSX-BASIC 1.0 or higher


## Source

Retrieved from "https://www.msx.org/wiki/PLAY()"
