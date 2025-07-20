# KEY

## Effect

Lists the contents of the function keys (`KEY LIST`).

Enables (`KEY ON`) or disables (`KEY OFF`) the display of their content
- on line 24 of text modes SCREEN 0, 1, 9.
- on line 13 of Kanji text modes 0 and 1, activated with `CALL KANJI`, `CALL KANJI0` or `CALL KANJI1`.
- on line 24 of Kanji text modes 2 and 3, activated with `CALL KANJI2` or `CALL KANJI3`.

Changes the text displayed at the bottom of the screen.

## Syntaxes

`KEY LIST`

`KEY ON|OFF`

`KEY <Number>,"<String>"`

## Parameters

`ON`/`OFF` enables/disables display of the function key text at the bottom of the screen. It is only displayed in text screen modes.

`LIST` is used to list the contents of the function keys.

`<Number>` is the function key number. (1~10)

`<String>` is a text of up to 15 characters allocated for each function key. This string is executed as a BASIC program line when the corresponding key is pressed.

When pressing the specific function key in direct mode the text is displayed at the location of the cursor. This allows quick entry of text or instructions that are often used. The function key text will also be displayed on the last line of the screen, if this feature is active, which is the default.

If the text contains an instruction and you want to have it automatically executed upon pressing the function key, add `+CHR$(13)` at the end of the string. This corresponds to the RETURN/ENTER key. See MSX Characters & Control Codes for other character codes.

During a program execution pressing a function key will have the same effect as you press each key corresponding at characters in text with in extra the call to the routine defined by `ON KEY GOSUB`. The text will not be displayed except during the execution of `INPUT`.

_Note: To go back completely to the default function keys, you need to use `DEFUSR=&H3E : X=USR(0) : KEY ON`_

## Example

```basic
10 A$="FILES"+CHR$(13)
20 KEY 1,A$+"?DSKF(0)"+CHR$(13)
```

## Standard function keys

By default, the contents of the function keys are as follows (complete display with `KEY LIST`):

### Japanese and Korean machines

Also for Philips VG-8000 and VG-8010 (not the 8010F version), Sanyo PHC-28S.

|Key|Display|String|
|---|---|---|
|F1|color|"color"|
|F2|auto|"auto"|
|F3|goto|"goto"|
|F4|list|"list"|
|F5|run|"run"+CHR$(13)|
|F6|color 15,4,7|"color 15,4,7"+CHR$(13)|
|F7 <sup>(*)</sup>|cload"|"cload"+CHR$(34)|
|F8|cont|"cont"+CHR$(13)|
|F9|list.|"list."+CHR$(13)|
|F10|run|CHR$(12)+"run"+CHR$(13)|

<sup>(*)</sup> `cload"` for `"load"+CHR$(34)` on MSX2+ and MSX turbo R machines.

### European, Argentinian and Russian MSX/MSX2 machines

Also for Sharp HB-8000-11 and HB-8000-12, Arabic versions of Spectravideo SVI-728 and SVI-738, Arabic machines in European mode.

On Yamaha YIS-503IIR, the network needs to be disabled: boot while pressing `DEL` key.
On Arabic machines, the Arabic mode needs to be disabled: boot while presssing `CTRL` key.

|Key|Display|String|
|---|---|---|
|F1|color|"color"|
|F2|auto|"auto"|
|F3|goto|"goto"|
|F4|list|"list"|
|F5|run|"run"+CHR$(13)|
|F6|color 15,4,4|"color 15,4,4"+CHR$(13)|
|F7|cload"|"cload"+CHR$(34)|
|F8|cont|"cont"+CHR$(13)|
|F9|list.|"list."+CHR$(13)|
|F10|run|CHR$(12)+"run"+CHR$(13)|

### Brazilian MSX machines

|Key|Display|String|
|---|---|---|
|F1|color|"color"|
|F6 <sup>(*)</sup>|color 15,1,1|"color 15,1,1"+CHR$(13)|
|F2|auto|"auto"|
|F7|cload"|"cload"+CHR$(34)|
|F3|goto|"goto"|
|F8|cont|"cont"+CHR$(13)|
|F4|list|"list"|
|F9|list.|"list."|
|F5|run|"run"+CHR$(13)|
|F10|run|"run"|

<sup>(*)</sup> `color 15,4,4` for `"color 15,4,4"+CHR$(13)` on Sharp HB-8000-14.

## Non-standard function keys

### Daewoo Zemmix CPC-50, CPC-50A, CPC-50B and CPC-51

These machines are conceived as consoles, not as computers. On the real hardware, it's impossible to use MSX-BASIC. On emulators, you can access to MSX-BASIC but by default, the contents of the function keys are empty.

### Frael Bruc 100

This MSX clone never displays the contents of the function keys, even if you use KEY ON. However, you can list these contents with KEY LIST (or by pressing the F1 key) and use KEY to change them.

|Key|Display|String|
|---|---|---|
|F1 <sup>(*)</sup>|keylist|"keylist"+CHR$(13)|
|F6|color|"color|
|F2|cload"|"cload"+CHR$(34)|
|F7|csave"|"csave"+CHR$(34)|
|F3|auto|"auto"|
|F8|renum|"renum"|
|F4|list .|"list ."+CHR$(13)|
|F9|list|"list"|
|F5|run|"RUN "|
|F10|cont|"cont"+CHR$(13)|

<sup>(*)</sup> displays the contents of all function keys.

### Philips NMS 800 and NMS 801

|Key|Display|String|
|---|---|---|
|F1|run"cas:"|"run"+CHR$(34)+"cas:"+CHR$(13)|
|F2|bload"cas:",r|"bload"+CHR$(34)+"cas:"+CHR$(34)+",r"+CHR$(13)|
|F3|cload|"cload"+CHR$(13)|
|F4|load"cas:",r|"load"+CHR$(34)+"cas:"+CHR$(34)+",r"+CHR$(13)|
|F5|run|"run"+CHR$(13)|
|F6|color 15,4,4|"color 15,4,4"+CHR$(13)|
|F7|cont|"cont"+CHR$(13)|
|F8|cload"|"cload"+CHR$(34)|
|F9|list|"list"|
|F10|run|CHR$(12)+"run"+CHR$(13)|

### Brazilian MSX2 machines with MSX-BASIC 2.2

|Key|Display|String|
|---|---|---|
|F1|copy|"copy"|
|F2|files|"files"+CHR$(13)|
|F3|bload"|"bload"+CHR$(34)|
|F4|list|"list"|
|F5|run|"run"+CHR$(13)|
|F6|color 15,1,1|"color 15,1,1"+CHR$(13)|
|F7|_format|"_format"+CHR$(13)|
|F8|_system|"_system"+CHR$(13)|
|F9|load"|"load"+CHR$(34)|
|F10|save"|"save"+CHR$(34)|

### Brazilian MSX2+ machines with MSX-BASIC 3.1 or 3.2

|Key|Display|String|
|---|---|---|
|F1|files|"files"+CHR$(13)|
|F2|bload"|"bload"+CHR$(34)|
|F3|copy|"copy"|
|F4|list|"list"|
|F5|run|"run"+CHR$(13)|
|F6|color 15,0,0|"color 15,0,0"+CHR$(13)|
|F7|load"|"load"+CHR$(34)|
|F8|_format|"_format"+CHR$(13)|
|F9|_system|"_system"+CHR$(13)|
|F10|run|CHR$(12)+"run"+CHR$(13)|

## Function keys defined by software

### Firmware of Arabic MSX/MSX2 machines

By default, the Arabic mode of these computers (except Arabic versions of Spectravideo SVI-728 and SVI-738) is enabled and the content of the function keys is modified for F2 and F6 to F8 (F9 on Bawareth Perfect machines with 1990 version of Arabic Basic):

|Key|Display|String|
|---|---|---|
|F1|color|"color"|
|F2|_arb1|"_arb1"|
|F3|goto|"goto"|
|F4|list|"list"|
|F5|run|"run"+CHR$(13)|
|F6 <sup>(*)</sup>|_dcolor|"_dcolor"|
|F7 <sup>(**)</sup>|_arb2 or _arb0|"_arb2" or "_arb0"|
|F8 <sup>(***)</sup>|_engl|"_engl"|
|F9 <sup>(****)</sup>|list|"list."+CHR$(13)|
|F10|run|CHR$(12)+"run"+CHR$(13)|

<sup>(\*)</sup> not on Bawareth Perfect computers with a 1987 Arabic BASIC version (3.21 - 3.30).  
<sup>(\*\*)</sup> see below.  
<sup>(\*\*\*)</sup> _latin for "_latin" on Sakhr AX-170F and AX-350IIF.  
<sup>(\*\*\*\*\*)</sup> _arb0 on Bawareth Perfect machines with 1990 version of Arabic Basic

#### Contents of F7 key

- _arb2 on Sakhr MSX1 computers.
- _arb0 on Sakhr MSX2 computers and Bawareth Perfect machines with 1987 version of Arabic Basic.
- _auto for "_auto" on Bawareth Perfect machines with 1990 version of Arabic Basic.
- _trans when using an Arabic Sakhr Basic cartridge or the equivalent option on Sakhr AX-370: Arabic/English toggle for MSX-BASIC programming.

### Firmware of Yamaha YIS-503IIR

By default, the network firmware is enabled and the content of the function keys is modified for F1 and F6 to F10:

|Key|Display|String|
|---|---|---|
|F1|color|"color"|
|F2|auto|"auto"|
|F3|goto|"goto"|
|F4|list|"list"|
|F5|run|"run"+CHR$(13)|
|F6|run"COM:"|"run"+CHR$(34)+"COM:"+CHR$(34)|
|F7|save"COM:"|"save"+CHR$(34)+"COM:"+CHR$(34)|
|F8|load"COM:"|"load"+CHR$(34)+"COM:"+CHR$(34)|
|F9|merge"COM:"|"merge"+CHR$(34)+"COM:"+CHR$(34)|
|F10|_comterm|"_comterm"+CHR$(13)|

### Connection of a Quick Disk Drive

When booting a MSX computer with a Quick Disk Drive connected, you will see that the contents of most function keys have been modified as follows:

|Key|Display|String|
|---|---|---|
|F1|_RUN|"_RUN "|
|F2|_LOAD|"_LOAD "|
|F3|_BLOAD|"_BLOAD"|
|F4 (*)|list|"list "|
|F5 (*)|run|"run"+CHR$(13)|
|F6 (**)|color 15,4,7|"color 15,4,7"+CHR$(13)|
|F7|_QDKEY|"_QDKEY "|
|F8|_SAVE("QD:|"_SAVE("+CHR$(34)+"QD:"|
|F9|_BSAVE("QD:|"_BSAVE("+CHR$(34)+"QD:"|
|F10|_QDFILES|"_QDFILES"|

<sup>(\*)</sup> Generally unchanged.  
<sup>(\*\*)</sup> Same as Japanese machines, Korean machines, Philips VG-8000 and VG-8010 (not the 8010F version), Sanyo PHC-28S.

## Related to

`KEY()`, `ON KEY GOSUB`

## Compatibility

MSX-BASIC 1.0 or higher

## Source
Retrieved from "https://www.msx.org/wiki/KEY"
