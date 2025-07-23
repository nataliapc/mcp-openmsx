# MSX-DOS 2 Environment Variables

## Index

- [Description](#description)
- [Creation, modification and deletion](#creation-modification-and-deletion)
- [Usage with COMMAND2.COM 2.31 and higher](#usage-with-command2com-231-and-higher)
- [List of Environment Variables](#list-of-environment-variables)
- [Internal Variables](#internal-variables)
- [Internal Variable Functions](#internal-variable-functions)

## Description

MSX-DOS 2 works with environment variables or big parameters defining its work environment. Several environment variables are provided with the system, and you can modify their values, but you can also create your own environment variables.

_Note: Character backslash `\` is used in MSX-DOS 2 / Nextor. It is replaced by the character yen `¥` on Japanese MSX or the character won `₩` on Korean MSX._

## Creation, modification and deletion
To create a new environment variable or modify / delete an existing environment variable, you need to use the `SET` command. It can be done on the command line, but also in batch files, and using of aliases is possible since _COMMAND2.COM 2.40_.

An environment variable can have any name chosen by the user, and can consist of the same characters that are valid in a file name. The maximum length of an environment variable name is 255 characters.

You need also to specify or modify the value corresponding to the environment variable. The value of an environment variable is simply a string of arbitrary characters up to a maximum length of 255. No processing is performed on the characters and so the casing of characters is preserved.

Since COMMAND2.COM 2.40, [internal variables](#internal-variables) and [internal variable functions](#internal-variable-functions) can be part of the value corresponding to an environment variable. You can also read a single keystroke or a string from the keyboard and place it in an environment variable with the INKEY and INPUT commands.

## Usage with COMMAND2.COM 2.31 and higher

- The contents of any environment variable, placed between two `%` characters, can be examined from the command line with a command like this: `A:\>ECHO %Variable%`.
- If you embed a variable in the `PROMPT` environment variable, it must be enclosed in either single `'` or double quotes `"`.
- If you use the `INKEY` and `INPUT` commands (with _COMMAND2.COM 2.40_ and higher), check the mentioned pages for the appropriates syntaxes.
- If the value of an _environment variable_ includes _internal variables_ and/or _internal variable functions_ (when you use _COMMAND2.COM 2.40_ and higher), you must respect the syntax that needs to be applied for these internal variables and variable functions.

## List of Environment Variables

MSX-DOS 2 provides several environment variables, most of them have a default value, that can be modified at the launching by appropriate commands in the `AUTOEXEC.BAT` and `REBOOT.BAT` files.

At any moment, you can use the `SET` command without parameter to get the list of the currently defined environment variables with their values.

Version = COMMAND2.COM version that introduces or improves this variable.

|Variable|Version|Default value|Related Commands|Internal Variables|Variable Functions|
|---|---|---|---|---|---|
|[ALIAS](#alias)|2.40|ON|ALIAS||@ALIAS|
|[APPEND](#append)|2.20|Not defined||| |
|[CDPATH](#cdpath)|2.40| ; |CDD, CDPATH, CHDIR|||
|[DATE](#date)|2.20|Appropriate format<br>depending from country|DATE|_DATE, _DATEF|@FILEDATE|
|[ECHO](#echo)|2.20|OFF|Batch files|||
|[EXPAND](#expand)|2.40|ON||||
|[EXPERT](#expert)|2.30 - 2.40|Not defined in 2.3x<br>ON since 2.40||| |
|[HELP](#help)|2.20|A:\HELP|HELP|||
|[KHELP](#khelp)|2.20<br>Removed in 2.4x|A:\KHELP|HELP|||
|[LOWER](#lower)|2.40|OFF||_BOOT, _CWD,<br>_CWDS, _CWP,<br>_CWPS, _DISK<br>and _DIRBUFFER||
|[PARAMETERS](#parameters)|2.20|Not defined||| |
|[PATH](#path)|2.20| ; |PATH|||
|[PROGRAM](#program)|2.20|Not defined||| |
|[PROMPT](#prompt)|2.20 - 2.40|OFF in 2.2x and 2.3x<br>ON or %_CWD% in 2.4x||_CWD,_DISK||
|[PUSHD](#pushd)|2.40|Not defined|POPD, PUSHD|||
|[REDIR](#redir)|2.20|ON||
|[SEPAR](#separ)|2.40|ON|||
|[SHELL](#shell)|2.20|Not defined|COMMAND2, EXIT|_SHELL||
|[TABORDER](#taborder)|2.41|BOTH|||
|[TEMP](#temp)|2.20|A:\||||
|[TIME](#time)|2.20 - 2.40|12 in 2.2x and 2.3x<br>24 since 2.40|TIME|_TIME|
|[UPPER](#upper)|2.20|OFF||@LOWER, @UPPER|

### ALIAS

`ALIAS` controls the interpretation of aliases (see the ALIAS command). Any value except `OFF` is interpreted as `ON`:
- When `ALIAS` is `ON` (default value), alias commands are replaced by their associated values.
- When ALIAS is `OFF`, alias commands are treated as normal commands.

### APPEND

The `APPEND` is actually not defined by default, as it needs to be used only with standard _CP/M_ programs.

_CP/M_ programs do not know how to use sub-directories because _CP/M_ does not have sub-directories. When they try to open a file, they will only search for the filename in the current directory of the appropriate drive. If the file is not found, then the `APPEND` environment is looked at. When this variable is set up, then it is assumed to be a path name, and specifies a single alternative directory in which the search for the file continues.

This will only be of use if the _CP/M_ program opens a file and then reads or writes to it. If it attempts to, for example, delete or create a file, then `APPEND` will not be used. Indeed, it may have undesirable effects and for this reason it is recommended that `APPEND` is used normally only in a batch file which sets it up, executes the _CP/M_ program, and then unsets it again.

### CDPATH

`CDPATH` specifies the current search path used by _COMMAND2.COM_ to find a directory when a `CD`, `CDD` or `CHDIR` command is used.

_Notes:_
- The path can also be manipulated with the `CDPATH` command to specify more than one search path.
- The root directory is mentioned by `;` when you use `SET CDPATH` without other parameters, but you can't use `SET CDPATH=;` because it will remove `CDPATH` from the environment variable list.

### DATE

`DATE` specifies the format the date is displayed and input by MSX-DOS 2.

It defaults to a format appropriate for the country of origin of the MSX machine.

It takes the form of three letters or three letter pairs separated by date/time separators (see the `DATE` command).

Example:
```
A:>SET DATE=DD/MM/YY
A:>SET DATE
DD/MM/YY
```

### ECHO

`ECHO` controls the echoing of lines read from a batch file. Any value except `ON` (lowercase also allowed) is interpreted as `OFF`:
- When `ECHO` is `ON`, then these lines are displayed on screen.
- When `ECHO` is `OFF`, as it is by default, then the lines read from a batch file are not displayed on screen.

### EXPAND

`EXPAND` controls the use of editing facilities provided either by MSX-DOS or by _COMMAND2.COM_. Any value except `OFF` interpreted as `ON`:
- When `EXPAND` is `ON` (default value), the new editing facilities provided by _COMMAND2.COM_ can be used in addition to the standard MSX-DOS editing facilities. For an optimal using of the new facilities, the `SEPAR` environment variable needs to be `ON`.
- When `EXPAND` is `OFF`, only the standard MSX-DOS editing facilities can be used.

### EXPERT

`EXPERT` controls the possibility to use MSX-DOS 1 compatible disks. This variable is actually not defined by default in _COMMAND2.COM 2.3x_. It needs to be used when you get the _"Wrong version of MSX-DOS"_ error message.

This message is displayed when MSX-DOS 2 does not detect the volume ID on a disk and assumes therefore that the disk is not a MSX-DOS 2 disk. It's a security because features like undelete and cache won't work properly with a MSX-DOS 1 disk.

- When `EXPERT` is `ON`, then MSX-DOS 2 will not display the error message because `SET EXPERT = ON` means that you confirm you know what you're doing. Both MSX-DOS 1 and MSX-DOS 2 formatted disks can be used. Since _COMMAND2.COM 2.40_, `EXPERT` is `ON` by default.
- When `EXPERT` is `OFF`, then MSX-DOS 2 will again display the error message in the mentioned circumstances, as only MSX-DOS 2 formatted disks can be used.

### HELP

`HELP` specifies the directory that will be used by the `HELP` command to give English on-line help for an MSX-DOS 2 feature.

It defaults to a directory called `HELP` in the root directory of the drive that MSX-DOS 2 was booted from.

### KHELP

`KHELP` specifies the directory that will be used by the `HELP` command to give Japanese on-line help on a Kanji screen for an MSX-DOS feature.

It defaults to a directory called `KHELP` in the root directory of the drive that MSX-DOS 2 was booted from.

### LOWER

`LOWER` controls the upper-casing of the internal variables `_BOOT`, `_CWD`, `_CWDS`, `_CWP`, `_CWPS`, `_DIRBUFFER` and `_DISK`. Any value except `ON` is interpreted as `OFF`:
- When `LOWER` is `ON`, the internal variables return their value in lower case.
- When `LOWER` is `OFF` (default), the value is returned in upper case.

### PARAMETERS

`PARAMETERS` is set up by _COMMAND2.COM_ when a transient command (tool) is executed, it contains the whole of the command line, without including the actual command name.

This variable is removed when the tool finishes, and should thus be avoided for general use. A specific use of this variable allows some tools to load other transient programs.

### PATH

`PATH` specifies the current search path used by _COMMAND2.COM_ to find a `.BAT` or `.COM` file.

It can be useful to change this environment variable for example before launching one of the tools located in the `UTIL` sub-directory on the MSX-DOS 2 disk.

_Notes:_
- The path can also be manipulated with the `PATH` command to specify more than one search path.
- The root directory is mentioned by `;` when you use `SET PATH` without other parameters, but you can't use `SET PATH=;` because it will remove PATH from the environment variable list.

Example:
```
A:>SET PATH=A:\UTIL
A:>XDIR
```

### PROGRAM

`PROGRAM` is set up by _COMMAND2.COM_ when a transient program (tool) is executed, it contains the whole path used to locate the program on disk.

This variable is removed when the tool finishes, and should thus be avoided for general use. The main use of the `PROGRAM` variable is that a program can use it to load overlay files from the same directory as it was loaded from.

### PROMPT

`PROMPT` controls the displaying of the prompt at command level. Any value except `ON` is interpreted as `OFF`:
- When `PROMPT` is `ON`, as it by default since version 2.40, then the prompt consists of the current drive and the current directory of that drive followed by `>` (Example: `A:\COM>`).
- When `PROMPT` is `OFF`, as it is by default in versions 2.20, 2.30 and 2.31, then the prompt consists of the current drive followed by `>` (Example: `A>`).
- With _COMMAND2.COM_ 2.40 and higher, `SET PROMPT` can refer to the used internal variable:
  - `SET PROMPT ON` can be replaced by `SET PROMPT "%_CWD%>"`.
  - `SET PROMPT OFF` can be replaced by `SET PROMPT "%_DISK%>"`.
  - When referring to the used internal variable, you can also extend the prompt to make display more info by using an internal variable function, for example to also show the amount of free disk space.

Example with COMMAND2.COM 2.40 and higher:
```
A:\>SET PROMPT "(%@DISKFREE[@:,k]%K) %_CWD%>"
(309K) A:\>SET PROMPT
(%@DISKFREE[@:,k]%K) %_CWD%>
(309K) A:\>
```

### PUSHD

`PUSHD` allows to display and extend the list of all the paths to the directories stored with the `PUSHD` command.

The maximum number of directories that can be stored is limited only by the maximum length of an environment variable, being 255 characters.

_Notes:_
- The root directory is mentioned by `;` when you use `SET PUSHD` without other parameters after having used `PUSHD` in the root directory, but you can't use `SET PUSHD=;` because it will remove `PUSHD` from the environment variable list.

### REDIR

`REDIR` controls whether the redirection or piping characters in the command line need to be processed by _COMMAND2.COM_ when you use a transient program (tool). Any value except `ON` is interpreted as `OFF`:
- When `REDIR` is `ON` (default), the redirection or piping characters will be interpreted and executed by _COMMAND2.COM_, so they will not be passed to the transient program.
- When `REDIR` is `OFF`, the redirection or piping characters will be passed to the transient program as they are typed, and the transient program may process them. The compatibility to _MSX-DOS 1_ or _CP/M_ can be achieved this way.

### SEPAR

`SEPAR` controls the interpretation of command separating characters on the command line. Any value except `OFF` is interpreted as `ON`:
- When `SEPAR` is `ON` (default value), the separating characters can be interpreted differently from the standard using when they are used with the new editing facilities provided by _COMMAND2.COM_ if these facilities are enabled (see the `EXPAND` environment variable).
- When `SEPAR` is `OFF`, only the standard interpretation of the separating characters is possible.

### SHELL

`SHELL` indicates where the command interpreter (_COMMAND2.COM_) exists, and is set up by default to where it was loaded from.

When the command interpreter needs to re-load itself from disk (after running a transient progam or tool) it looks at the `SHELL` environment variable and attempts to load itself from the file that it specifies. If this gives an error then it attempts to load itself from the root directory of the drive that it was originally loaded from.

To cause the command interpreter to re-load itself from another drive or directory, _COMMAND2.COM_ can be copied there and `SHELL` set to refer to it. For example, it might be copied to the RAMDISK with the command `COPY COMMAND2.COM H:\` and then `SHELL` set with the command `SET SHELL=H:\COMMAND2.COM`.

Example:
```
A:>RAMDISK 1024
A:>COPY COMMAND2.COM H:\
A:>SET SHELL=H:\COMMAND2.COM
A:>SET SHELL
H:\COMMAND2.COM
```

### TABORDER

`TABORDER` determines whether directories or files are found and in which order when TAB is pressed on the command line, when the new editing facilities provided by _COMMAND2.COM_ are enabled (see the `EXPAND` environment variable).

The possible values for TABORDER are as follows:

|TABORDER value|Meaning|
|---|---|
|BOTH|Both directories and files are found in order of appearance|
|DIR|Only directories are found in order of appearance|
|DIR,FILE|First directories are foud, then files in order of appearance|
|FILE,DIR|First files are found , then directories in order of appearance|
|FILES|Only files are found in order of appearance|

The default value is BOTH.

### TEMP

`TEMP` indicates the drive and directory in which temporary files are to be created when piping is performed.

By default, it refers to the root directory of the boot drive, and typically may be changed to refer to a RAM disk since this increases the speed of piping.

Although the standard MSX-DOS 2 system only uses `TEMP` for piping, any other programs and utilities that need to create temporary files may also use the `TEMP` environment variable.

### TIME

`TIME` specifies the format the time is displayed by MSX-DOS 2.

The default value in _COMMAND2.COM_ 2.20, 2.30 and 2.31 is `12`, which indicates that it is displayed as a 12-hour time with an am. or pm. indication.

You can change to `24`, which indicates that it is displayed as a 24-hour time. Since _COMMAND2.COM_ 2.40, the default value is `24`.

The `TIME` environment variable does not apply when the time is input because it can be input in either format unambiguously (see the `TIME` command).

Example:
```
A:>SET TIME=24
A:>SET TIME
24
```

### UPPER

`UPPER` controls whether the alphabetic characters of the command line to be passed to a transient program (tool) need to be converted to uppercase. Any value except `ON` is interpreted as `OFF`:
- When `UPPER` is `OFF` (default), no conversion will be done and the values will be passed to the transient program as they are typed.
- When `UPPER` is `ON`, each character in the command line will be converted to its associated uppercase character and then passed to the transient program. This is compatible to _CP/M_ environment.

## Internal Variables

Since _COMMAND2.COM_ version 2.40, you can directly access many internal variables of the MSX-DOS 2 system.

These variables are not actually stored in the environment, but can be used in commands, aliases, and batch files just like any other environment variable. They are often used in batch files and aliases to examine system resources and adjust to the current computer settings.

The values of these variables are stored internally and cannot be changed with the `SET` command.

- The contents of any internal variable, placed between two `%` characters, can be examined from the command line with a command like this: `A:\>ECHO %Variable%`.
- If you embed a variable in the `PROMPT` environment variable, it must be enclosed in either single `'` or double quotes `"`.
- These variables can also be used as parameter with the MSX-DOS 2 Internal Variable Functions. In this case, they must be enclosed between square brackets with the other arguments. For example: `A:\>ECHO %@DISKFREE[%_DISK%:,K]%` it will return the free amount of disk space on the current active drive.

Version = COMMAND2.COM version that introduces or improves this variable.

|Variable|Version|Related Commands|Environment Variables|Variable Functions|
|---|---|---|---|---|
|[_BG](#_bg)|2.40|COLOR|||
|[_BOOT](#_boot)|2.40|BOOT, SET|LOWER||
|[_COLUMN](#_column)|2.40|MODE|||
|[_COLUMNS](#_columns)|2.40|MODE|||
|[_CPU](#_cpu)|2.40|CPU|||
|[_CWD](#_cwd)|2.40|CDD, CHDIR, DIR, SET|LOWER, PROMPT||
|[_CWDS](#_cwds)|2.40|CDD, CHDIR, DIR, SET|LOWER||
|[_CWP](#_cwp)|2.40|CDD, CHDIR, DIR, SET|LOWER||
|[_CWPS](#_cwps)|2.40|CDD, CHDIR, DIR, SET|LOWER||
|[_DATE](#_date)|2.40|DATE, SET|DATE||
|[_DATEF](#_datef)|2.40|DATE, SET|DATE||
|[_DIRBUFFER](#_dirbuffer)|2.40|CDD, CHDIR, DIR, SET|LOWER||
|[_DISK](#_disk)|2.40|BOOT, SET|LOWER, PROMPT||
|[_DOSVER](#_dosver)|2.40|VER|||
|[_DOW](#_dow)|2.40|DATE|||
|[_DRIVEMAP](#_drivemap)|2.41||||
|[_ERROR](#_error)|2.40|EXIT|||
|[_FG](#_fg)|2.40|COLOR|||
|[_FILECOUNT](#_filecount)|2.40|||@FFIRST, @FILETOTAL|
|[_FNEXT](#_fnext)|2.40|||@FFIRST, @FILETOTAL|
|[_MSXVER](#_msxver)|2.40<br>2.44||||
|[_ROW](#_row)|2.40|MODE|||
|[_ROWS](#_rows)|2.40|MODE|||
|[_SHELL](#_shell)|2.41|COMMAND2, SET|SHELL||
|[_TIME](#_time)|2.40|SET, TIME|TIME||

### _BG

Returns the current screen background color (it's a value between 0 and 15).

Example:
```
A>COLOR 7 12
A>ECHO %_BG%
12
```

### _BOOT

Returns the current boot drive letter, without colon. It is given in upper or lower case depending on the value of the LOWER environment variable.

Example:
```
A>ECHO %_BOOT%
A
A>BOOT B:
A>ECHO %_BOOT%
B
```

### _COLUMN

Returns the current cursor column (it's a value between 1 and 80).

Example:
```
A>ECHO %_COLUMN%
1
```

### _COLUMNS

Returns the current width of the screen (it's a value between 1 and 80).

Example:
```
A>MODE 80
A>ECHO %_COLUMNS%
80
```

### _CPU

Returns the current CPU type (`Z80` or `R800`).

Example:
```
A>CPU 1
A>ECHO %_CPU%
R800
```

### _CWD

Returns the current directory in the `<Device>:\<Path>` format.

It is given in upper or lower case depending on the value of the `LOWER` environment variable.

`SET PROMPT "%_CWD%>"` is equivalent to `SET PROMPT ON`

Example:
```
A:\UTILS>ECHO %_CWD%
A:\UTILS
```

### _CWDS

Returns the current directory in the `<Device>:\<Path>\` format.

It is given in upper or lower case depending on the value of the `LOWER` environment variable.

Example:
```
A:\UTILS>ECHO %_CWDS%
A:\UTILS\
```

### _CWP

Returns the current directory in the `\<Path>` format.

It is given in upper or lower case depending on the value of the `LOWER` environment variable.

Example:
```
A:\UTILS>ECHO %_CWP%
\UTILS
```

### _CWPS

Returns the current directory in the `\<Path>\` format.

It is given in upper or lower case depending on the value of the `LOWER` environment variable.

Example:
```
A:\UTILS>ECHO %_CWPS%
\UTILS\
```

### _DATE

Returns the current system date, with the year in the `YY` format.

The date is made of three elements: the day `DD`, the month `MM` and the year `YY`. It can be displayed in 3 different formats, the used format depends from the country for which the computer was released:

|Date format|Countries|
|---|---|
|DD/MM/YY|Brazil, Egypt, France, Germany and Kuwait|
|MM/DD/YY|Argentina, Saudi Arabia, Soviet countries, USA and Spain|
|YY/MM/DD|Japan and Korea|

The date format can be changed with the `SET DATE` command.

Example:
```
A>ECHO %_DATE%
05-28-20
```

### _DATEF

Returns the current system date, with the year in the `YYYY` format.

The date is made of three elements: the day `DD`, the month `MMpp and the year `YYYY`. It can be displayed in 3 different formats, the used format depends from the country for which the computer was released (see [_DATE](#_date) table).

Example:
```
A>ECHO %_DATEF%
05-28-2020
```

### _DIRBUFFER

Returns the current directory stored in buffer.

It is given in upper or lower case depending on the value of the `LOWER` environment variable.

Example:
```
A:\UTILS>CD ..
A:\>ECHO %_DIRBUFFER%
A:\UTILS
```

### _DISK

Returns the current active drive letter, without colon.

It is given in upper or lower case depending on the value of the `LOWER` environment variable.

`SET PROMPT "%_DISK%>"` is equivalent to `SET PROMPT OFF`

Example:
```
A>ECHO %_DISK%
A
A>B:
B>ECHO %_DISK%
B
```

### _DOSVER

Returns the current COMMAND2.COM version.

Example:
```
A>ECHO %_DOSVER%
2.44
```

### _DOW

Returns the current day of the week (`Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`). The first letter of the result is in in upper case and the rest in lower case.

Example:
```
A>ECHO %_DOW%
Thursday
```

### _DRIVEMAP

Returns the current available drives under the 8 bits format `HGFEDCBA` with `0` = drive does not exist and `1` = drive exists.

Example:
```
A>ECHO %_DRIVEMAP%
00000011
```

### _ERROR

Returns the error code of previous command (it's a value between 0 and 255, 0 means _No error_).

Some errors are transferred to an appropriate routine. In these cases, you can't get the real error code, but the error code 1 (_User error_) will be returned.

Examples:
```
A>NOFILE
*** Unrecognized command
A>ECHO %_ERROR%
142
```
```
A>COPY TEST.BAT
TEST.BAT -- File cannot be copied onto iself
A>ECHO %_ERROR%
1
```

### _FG

Returns the current screen foreground color (it's a value between 0 and 15).

Example:
```
A>COLOR 7 12
A>ECHO %_FG%
7
```

### _FILECOUNT

Returns the total number of files returned by the variable function `@FFIRST` and the internal variable `_FNEXT`.

Example:
```
A>ECHO %@FFIRST[\UTILS\*.COM]%
CHKDSK.COM
A>ECHO %_FNEXT%
DISKCOPY.COM
A>ECHO %_FILECOUNT%
2
```

### _FNEXT

Returns the filename and extension of next file that matches the conditions specified with the variable function `@FFIRST`, always used before `_FNEXT`.

The information required to find the next filename is corrupted if you have by used the `COPY` command or any transient command (external tool) between `@FFIRST` and `_FNEXT`.

Example:
```
A>ECHO %@FFIRST[\UTILS\*.COM]%
CHKDSK.COM
A>ECHO %_FNEXT%
DISKCOPY.COM
```

### _MSXVER

Returns the MSX type (`MSX`, `MSX-2`, `MSX-2+` or `Turbo-R`).

The first MSX generation is only supported since _COMMAND2.COM_ 2.44 (to be used with the Nextor operating system).

Example:
```
A>ECHO %_MSXVER%
Turbo-R
```

### _ROW

Returns the current cursor row (it's a value between 1 and 26).

Example:
```
A>ECHO %_ROW%
10
```

### _ROWS

Returns the current number of screen lines (it's a value between 1 and 26).

Example:
```
A>MODE 80 26
A>ECHO %_ROWS%
26
```

### _SHELL

Returns the current shell of _COMMAND2.COM_ (0=original incarnation, 1=1st shell, etc...).

This function is linked to the `SHELL` environment variable that keeps the location of the command interpreter.

Example:
```
A>ECHO %_SHELL%
0
A>COMMAND2
A>ECHO %_SHELL%
1
```

### _TIME

Returns the current time, in `12` or `24` format according the setting in the `TIME` environment variable.

Example:
```
A>ECHO %_TIME%
13:24:05
```

## Internal Variable Functions

Since _COMMAND2.COM_ version 2.40, you can directly access many internal variable functions of the MSX-DOS 2 system.

Variable functions are similar to MSX-DOS 2 Internal Variables, but they take one or more arguments, and they return a value. The variable functions are useful in aliases and batch files to check on available system resources, manipulate strings and numbers, and work with filenames.

- Like all environment variables, these variable functions must be enclosed in percent signs in normal use (`%@ALIAS%`,  `%@ASCII%`, etc.). All variable functions must have square brackets enclosing their argument(s).
- If you embed a variable function in the `PROMPT` environment variable, it must be enclosed in either single `'` or double quotes `"`.
- Instead of a parameter, a variable function can also include another variable function, or internal variable, whose value serves as a parameter for the previous variable function. For example: `A:\>ECHO %@DISKFREE[%_DISK%:,K]%`, it will return the free amount of disk space on the current active drive.
- The depth of the recursive use of variable functions is unlimited, as long as it fits on the command line, which has a maximum length of 127 characters.
- When an error occurs either in the given parameters, or during disk access, then a null string is returned.

Version = COMMAND2.COM version that introduces or improves this variable function.

|Function|Version|Related Commands|Environment Variables|Internal Variables|
|---|---|---|---|---|
|[@ALIAS](#alias-1)|2.40|ALIAS, SET|ALIAS||
|[@ASCII](#ascii)|2.40||||
|[@ATTRIB](#attrib)|2.40|ATDIR, ATTRIB, DIR|||
|[@CHAR](#char)|2.40||||
|[@DISKFREE](#diskfree)|2.40|FREE|||
|[@DISKTOTAL](#disktotal)|2.40|FREE|||
|[@DISKUSED](#diskused)|2.40|FREE|||
|[@DRIVE](#drive)|2.40||||
|[@EXT](#ext)|2.40||||
|[@FFIRST](#ffirst)|2.40|||_FILECOUNT, _FNEXT|
|[@FILE](#file)|2.40||||
|[@FILEATTR](#fileattr)|2.40|ATDIR, ATTRIB, DIR, VOL|||
|[@FILEDATE](#filedate)|2.40|DATE, DIR, SET|DATE||
|[@FILESIZE](#filesize)|2.40|DIR|||
|[@FILETIME](#filetime)|2.40|DIR, SET, TIME|TIME||
|[@FILETOTAL](#filetotal)|2.40|||_FILECOUNT, _FNEXT|
|[@FULL](#full)|2.40||||
|[@HEX](#hex)|2.40||||
|[@INSTR](#instr)|2.40||||
|[@LABEL](#label)|2.40|DIR, VOL|||
|[@LEFT](#left)|2.40||||
|[@LEN](#len)|2.40||||
|[@LOWER](#lower-1)|2.40||UPPER||
|[@MID](#mid)|2.40||||
|[@NAME](#name)|2.40||||
|[@NEWFILE](#newfile)|2.40|RENAME|||
|[@PARSE](#parse)|2.40||||
|[@PATH](#path-1)|2.40||||
|[@READY](#ready)|2.41|||_DRIVEMAP|
|[@RIGHT](#right)|2.40||||
|[@STRING](#string)|2.44||||
|[@UPPER](#upper-1)|2.40||UPPER||

### @ALIAS

Returns the contents of the specified alias as a string, or a null string if the alias doesn't exist.

`%@ALIAS[<AliasName>]%`

`<AliasName>` is the name of the alias whose you want to know or use the contents.

### @ASCII

Returns the ASCII value of a character. It will always return the value 1 for the characters 0 to 31 without giving the second value associated to these characters.

`%@ASCII[<Character>]%`

`<Character>` is a character between square brackets.

Example:
```
A>ECHO %@ASCII[A]%
65
```

### @ATTRIB

Checks the attribute bits of a specified file or folder. Returns a `1` if the specified file or folder has the matching attribute(s); otherwise returns a `0`.

`%@ATTRIB[<<Device>:\<Path>\<ItemName>,<Attribute(s)>]%`

- Character backslash `\` serves as a separator between the folders and the file name in MSX-DOS2. You don't have to put it after the colon of the device name.

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will work with the currently active drive (by default, it's drive `A:`)

|Device type|Device name|Remark|
|---|---|---|
|Disk drive|A, B, C, D, E, F, G, H|A floppy disk interface can control until 2 drives.|

`<Path>` is used to specify the location in folders of file or folder to check. Each folder name in path are separate by a backslash `\`.

`<ItemName>` is the name of the file or folder to check.

`<Attribute(s)>` is used to specify the attribute(s) you want to check for the specified file or folder. You need to use these letters:
- `A` = Archive
- `D` = Directory
- `S` = System
- `H` = Hidden
- `R` = Read-only
- `N` = Normal (no attributes bit set)

The attributes (other than `N`) can be combined; `@ATTRIB` will only return a `1` if all the attributes match (both set and reset). If implies that you need to specify all the existing attributes of a file (and only these attributes) to get a `1` as answer.

Examples with a TEST.BAT file whose attributes are `AR`:
```
A>ECHO %@ATTRIB[TEST.BAT,R]%
0
A>ECHO %@ATTRIB[TEST.BAT,AR]%
1
```

### @CHAR

Returns the character corresponding to a specified ASCII numeric value.

`%@CHAR[<CodeNumber>]%`

`<CodeNumber>` is the code number of a character between 0 and 255. (See control codes about codes description).

According the localisation of the used MSX computer or the used mode on Arabic machines, the results can vary.

In Kanji modes, this instruction is limited to the characters 33 to 128, 161 to 223, 253 and 254, and the character displayed for `CHR$(128)`, `CHR$(253)` and `CHR$(254)` is not correct in Kanji modes 0 and 2 (bug in Kanji BASIC?)

Example:
```
A>ECHO %@CHAR[65]% 
A
```

### @DISKFREE

Returns the amount of free disk space on the specified drive.

`%@DISKFREE[<Device>:, B|K|M]%`

`<Device>` is the name for used device. It can only be a disk drive and needs to be preceded by `@`.

If you don't specify the drive, the computer will work with the currently active drive (by default, it's drive `A:`). However, you must use `@:` in this case.

`B` is used to get the amount of free disk space in number of bytes.

`K` is used to get the amount of free disk space in number of kilobytes (bytes / 1,024).

`M` is used to get the amount of free disk space in number of megabytes (bytes / 1,048,576).

Examples:
```
A>ECHO %@DISKFREE[A:,B]%
316416
A>ECHO %@DISKFREE[A:,K]%
309
A>ECHO %@DISKFREE[A:,M]%
0
```

### @DISKTOTAL

Returns the total disk space on the specified drive.

`%@DISKTOTAL[<Device>:, B|K|M]%`

`<Device>` is the name for used device. It can only be a disk drive and needs to be preceded by `@`.

If you don't specify the drive, the computer will work with the currently active drive (by default, it's drive `A:`).However, you must use `@:` in this case.

`B` is used to get the total disk space in number of bytes.

`K` is used to get the total disk space in number of kilobytes (bytes / 1,024).

`M` is used to get the total disk space in number of megabytes (bytes / 1,048,576).

Examples:
```
A>ECHO %@DISKTOTAL[A:,B]%
730112
A>ECHO %@DISKTOTAL[A:,K]%
713
A>ECHO %@DISKTOTAL[A:,M]%
0
```

### @DISKUSED

Returns the amount of disk space in use by files and directories on the specified drive.

`%@DISKUSED[<Device>:, B|K|M]%`

`<Device>` is the name for used device. It can only be a disk drive and needs to be preceded by `@`.

If you don't specify the drive, the computer will work with the currently active drive (by default, it's drive `A:`). However, you must use `@:` in this case.

`B` is used to get the amount of used disk space in number of bytes.

`K` is used to get the amount of used disk space in number of kilobytes (bytes / 1,024).

`M` is used to get the amount of used disk space in number of megabytes (bytes / 1,048,576).

Examples:
```
A>ECHO %@DISKUSED[A:,B]%
413696
A>ECHO %@DISKUSED[A:,K]%
404
A>ECHO %@DISKUSED[A:,M]%
0
```

### @DRIVE

Returns the drive letter (including a colon) from a specified file or folder.

`%@DRIVE[<Device>:\<Path>\<ItemName>]%`

Without any parameter, this function will return a blank line.

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file or folder to check. Each folder name in path are separate by a backslash `\`.

`<ItemName>` is the name of the file or folder to check.

Examples:
```
A>ECHO %@DRIVE[B:]%
B:
A>ECHO %@DRIVE[\HELP]%
A:
A>ECHO %@DRIVE[REBOOT.BAT]%
A:
A>ECHO %@DRIVE[\HELP\ENV.HLP]%
A:
```

### @EXT

Returns the extension (three characters) from a filename in upper case, without a leading period. If no extension was found, then a null string is returned.

`%@EXT[<Device>:\<Path>\<Filename>]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file to check. Each folder name in path are separate by a backslash `\`.

`<Filename>` is the name of the file to check.

Example:
```
A>ECHO %@EXT[\HELP\env.hlp]%
HLP
```

### @FFIRST

Returns the filename and extension of the first file that matches specified conditions. It is done in uppercase.

`%@FFIRST[<Device>:\<Path>\<Filename>]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file to find. Each folder name in path are separate by a backslash `\`.

`<Filename>` is the file name to find. Wildcards can replace some characters in filename to get several files. The asterisk `*` and question mark `?` are used as wildcard characters. The asterisk matches any sequence of characters, whereas the question mark matches any single character.

Example:
```
A>ECHO %@FFIRST[\UTILS\*.COM]%
CHKDSK.COM
```

### @FILE

Returns the filename without the path, but including the extension.

`%@FILE[<Device>:\<Path>\<Filename>]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file to check. Each folder name in path are separate by a backslash `\`.

`<Filename>` is the name of the file to check.

Example:
```
A>ECHO %@FILE[\HELP\ENV.HLP]%
ENV.HLP
```

### @FILEATTR

Returns the attributes of a file or directory. The attributes are (from left to right):
- `A` = Archive
- `D` = Directory
- `V` = Volume name
- `S` = System
- `H` = Hidden
- `R` = Read-only

`%@FILEATTR[<Device>:\<Path>\<ItemName>]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file or folder to check. Each folder name in path are separate by a backslash `\`.

`<ItemName>` is the name of the file or folder to check.

Example with a TEST.BAT file whose attributes are `AR`:
```
A>ECHO %@FILEATTR[TEST.BAT]%
AR
```

### @FILEDATE

Returns the date a file or folder was last modified, in the format specified by the `DATE` environment variable.

`%@FILEDATE[<Device>:\<Path>\<ItemName>]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file or folder to check. Each folder name in path are separate by a backslash `\`.

`<ItemName>` is the name of the file or folder to check.

Example:
```
A>ECHO %@FILEDATE[\UTILS\XDIR.COM]%
08-26-90
```

### @FILESIZE

Returns the size of a file on the specified drive.

`%@FILESIZE[<Device>:\<Path>\<Filename>, B|K|M]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will work with the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file to check. Each folder name in path are separate by a backslash `\`.

`<Filename>` is the name of the file to check.

`B` is used to get the size in number of bytes.

`K` is used to get the size in number of kilobytes (bytes / 1,024).

`M` is used to get the size in number of megabytes (bytes / 1,048,576).

Examples:
```
A>ECHO %@FILESIZE[\UTILS\XDIR.COM,B]%
7062
A>ECHO %@FILESIZE[\UTILS\XDIR.COM,K]%
6
A>ECHO %@FILESIZE[\UTILS\XDIR.COM,M]%
0
```

### @FILETIME

Returns the time a file was last modified, in hh:mm:ss format. Depending on the `TIME` environment variable, the time will be in the 12-hour or 24-hour format.

`%@FILETIME[<Device>:\<Path>\<ItemName>]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file or folder to check. Each folder name in path are separate by a backslash `\`.

`<ItemName>` is the name of the file or folder to check.

Example:
```
A>ECHO %@FILETIME[\UTILS\XDIR.COM]%
 5:13:38
```

### @FILETOTAL

Returns the total amount of bytes in the files returned by the variable function `@FFIRST` and the internal variable `_FNEXT`.

`%@FILETOTAL[B|K|M]%`

`B` is used to get the total in number of bytes.

`K` is used to get the total in number of kilobytes (bytes / 1,024).

`M` is used to get the total in number of megabytes (bytes / 1,048,576).

Examples:
```
A>ECHO %@FFIRST[\UTILS\*.COM]%
CHKDSK.COM
A>ECHO %_FNEXT%
DISKCOPY.COM
A>ECHO %@FILETOTAL[B]
14960
```
```
A>ECHO %@FFIRST[\UTILS\*.COM]%
CHKDSK.COM
A>ECHO %_FNEXT%
DISKCOPY.COM
A>ECHO %@FILETOTAL[K]
14
```
```
A>ECHO %@FFIRST[\UTILS\*.COM]%
CHKDSK.COM
A>ECHO %_FNEXT%
DISKCOPY.COM
A>ECHO %@FILETOTAL[M]
0
```

### @FULL

Returns the full pathname, including a drive letter, for a specified file.

`%@FULL[<Device>:\<Path>\<Filename>]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will use the currently active drive (by default, it's drive `A:`).

`<Path>` is used to specify the location in folders of file to check. Each folder name in path are separate by a backslash `\`.

`<Filename>` is the name of the file to check.

Example:
```
A>ECHO %@FULL[\HELP\ENV.HLP]%
A:\HELP\ENV.HLP
```

### @HEX

Returns a string with the hexadecimal representation of a value. It is always a four digit representation.

`%@HEX[<Value>]%`

`<Value>` must be between 1 and 65535.

Example:
```
A>ECHO %@HEX[21450]
53CA
```

### @INSTR

Returns the position of the first occurrence of a substring in a specified string, this from a specified position.

Special values:
- `0` if the specified string is empty OR the substring is not found in the string OR the starting position is higher than the length of the string.
- value of starting position if the required substring is empty AND the specified string is not empty AND the starting position is not higher than the length of the string.

_Note: For strings with Japanese or Korean characters, you need to use CALL KINSTR in MSX-BASIC._

`%@INSTR[<Start>,<String1>,<String2>]%`

`<Start>` is the starting position in the string to find the substring. The first character in the string is numbered 1. The highest possible position is 255. When omitted, the search will start from the first character.

`<String1>` and `<String2>` are strings of characters generally without double quotes `"`. They can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

If `<String1>` includes commas, it must be quoted with double quotes `"` or single quotes `'`. The qoutes do not count in calculating the position of the substring to be extracted.

`<String2>` is the substring to be found in `<String1>`, it does not have to be quoted, unless the quotes are really part of the string.

Examples:
```
A>ECHO %@LEFT[This IS a test,4]%
This
A>ECHO %@INSTR[,This IS a test,test]%
11
```

### @LABEL

Returns the volume label of the specified disk drive.

`%@LABEL[<Device>:]%`

`<Device>` is the name for used device. It can only be a disk drive.

If you don't specify the drive, the computer will work with the currently active drive (by default, it's drive `A:`). However, the double colon can't be omitted in this case.

Example:
```
A>ECHO %@LABEL[A:]%
MYLABEL
```

### @LEFT

Returns a string corresponding to a specified number of the leftmost characters from an original string or to this string less a specified number of the rightmost characters. For strings with Japanese or Korean characters, you need to use CALL KMID in MSX-BASIC.

`%@LEFT[<String>,<Length>]%`

`<String>` is a string of characters generally without double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

If the string includes commas, it must be quoted with double quotes `"` or single quotes `'`. The quotes do not count in calculating the position of the substring to be extracted.

`<Length>` is a number between -255 and + 255. When negative, then it is relative to the end of the string and will be without effect if the number exceeds the length of the string (see the `@LEN` function).

Examples:
```
A>ECHO %@LEFT[This IS a test,4]%
This
A>ECHO %@LEFT[This IS a test,-4]%
This IS a
```

### @LEN

Returns the length of a string, including all non-printable characters. For strings with Japanese or Korean characters, you need to use CALL KLEN in MSX-BASIC.

`%@LEN[<String>]%`

`<String>` is a string of characters generally without double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

If the string includes commas, it must be quoted with double quotes `"` or single quotes `'`. The qoutes do not count in calculating the position of the substring to be extracted.

Examples:
```
A>ECHO %@LEN[This IS a test]%
14
A>SET A=This IS a test
A>ECHO %@LEN[%A%]%
14
```

### @LOWER

Returns the specified string converted to lower case.

`%@LOWER[<String>]%`

`<String>` is a string of characters generally without double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

If the string includes commas, it must be quoted with double quotes `"` or single quotes `'`.

Examples:
```
A>ECHO %@LOWER[TEST]%
test
A>SET A=TEST
A>ECHO %@LOWER[%A%]%
test
```

### @MID

Returns a string corresponding to a specified number of characters from an original string, this from a specified position.

`%@MID[<String>,<Start>,<Length>]%`

`<String>` is a string of characters generally without double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

`<Start>` is the starting position in the string to extract the substring. The first character in the string is numbered 1.

When `<Start>` = 1, `@MID` function replaces `@LEFT`, example: `%@MID[A$,1,3]%` is equivalent to `%@LEFT[A$,3]%`.

When `<Start>` = `%@LEN[A$]%-<Length>+1`, `@MID` replaces `@RIGHT`, example: If `%@LEN[A$]%=5` then `%@MID[A$,4,2]%` is equivalent to `%@RIGHT[A$,2]%`.

`<Length>` is a number between 0 and 255. When is omitted, it will default to the remainder of the string.

Example:
```
A>ECHO %@MID[This IS a test,6,4]%
IS a
```

### @NAME

Returns the base name of a file (eight characters) in upper case, without the path or extension. If no base name was found, then a null string is returned.

`%@NAME[<Device>:\<Path>\<Filename>]%`

`<Device>` is the name for used device. It can only be a disk drive.

`<Path>` is used to specify the location in folders of file to check. Each folder name in path are separate by a backslash `\`.

`<Filename>` is the name of the file to check.

Example:
```
A>ECHO %@NAME[\HELP\env.hlp]%
ENV
```

### @NEWFILE

Returns the modified name of a specified file name in upper case, by comparison with another specified file name, while keeping the original characters for the positions corresponding to a wildcard in the second file name.

`%@NEWFILE[<Filename1>,<Filename2>]%`

`<Filename1>` and `<Filename2>` are two file names in the 8.3 format.

The asterisk `*` and question mark `?` are used as wildcard characters in `<Filename2>`. The asterisk matches any sequence of characters, whereas the question mark matches any single character.

Example:
```
A>ECHO %@NEWFILE[12345678.123,file*.SC?]%
FILE5678.SC3
```

### @PARSE

Returns a binary string set up by parsing a specified path to a file or a folder. A set bit is represented by a `1` and a reset bit is represented by a `0`.

The bit assignments are as follows, from left to right:
- bit 7 - set if last item is "..".
- bit 6 - set if last item is "." or "..".
- bit 5 - set if last item is ambiguous.
- bit 4 - set if filename extension specified in last item.
- bit 3 - set if main filename specified in last item.
- bit 2 - set if any drive name specified.
- bit 1 - set if any directory path specified.
- bit 0 - set if any characters parsed other than drive name.

`%@PARSE[<Device>:\<Path>\<ItemName>]%`

`<Device>` is the name for used device. It can only be a disk drive.

`<Path>` is used to specify the location in folders of file or folder to check. Each folder name in path are separate by a backslash `\`.

`<ItemName>` is the name of the file or folder to check.

Example:
```
A>ECHO %@PARSE[\UTILS\XDIR.COM]%
00011011
```

### @PATH

Returns the path from a filename, including optionally the drive letter and a trailing backslash but not including the base name or extension.

`%@PATH[<Device>:\<Path>\<Filename>]%`

`<Device>` is the name for used device. It can only be a disk drive.

`<Path>` is used to specify the location in folders of file to check. Each folder name in path are separate by a backslash `\`.

`<Filename>` is the name of the file to check.

Examples:
```
A>ECHO %@PATH[\HELP\ENV.HLP]%
\HELP\
A>ECHO %@PATH[A:\HELP\ENV.HLP]%
A:\HELP\
```

### @READY

Checks if the specified drive is ready. Returns `0` when the drive is not ready, `1` when the drive is ready.

`%@READY(<Device>:)%`

`<Device>` is the name for used device. It can only be a disk drive. The device must always be specified. However, the double colon can be omitted.

Example:
```
A>ECHO %@READY[A:]%
1
```

### @RIGHT

Returns a string corresponding to a specified number of the rightmost characters from an original string.

`%@RIGHT[<String>,<Length>]%`

`<String>` is a string of characters generally without double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

`<Length>` is a number between 0 and 255.

Example:
```
A>ECHO %@RIGHT[This IS a test,4]%
test
```

### @STRING

Returns a string with a variable length, all containing the same character corresponding to the first character of a specified string.

`%@STRING[<Length>,<String>]%`

`<Length>` It is the length of the string and must be an integer in range between 0 and 122.

`<String>` is a string of characters generally without double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

Examples:
```
A>ECHO %@STRING[5,test]%
ttttt
A>SET A=test
A>ECHO %@STRING[5,%A%]%
ttttt
```

### @UPPER

Returns the specified string converted to upper case.

`%@UPPER[<String>]%`

`<String>` is a string of characters generally without double quotes `"`. It can include non-printable characters and be replaced by a numeric or string variable (also named as alphanumeric variable).

Examples:
```
A>ECHO %@UPPER[test]%
TEST
A>SET A=test
A>ECHO %@UPPER[%A%]%
TEST
```

## Sources

https://www.msx.org/wiki/MSX-DOS_2_Environment_Variables  
https://www.msx.org/wiki/MSX-DOS_2_Internal_Variables  
https://www.msx.org/wiki/MSX-DOS_2_Internal_Variable_Functions  