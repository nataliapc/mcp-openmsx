# V9958 MSX-VIDEO - Technical Data Book

Based in the V9958 TECHNICAL DATA BOOK.  
CATALOG No.: 249958Y  
1988.12

## PREFACE

This booklet describes those specifications which have been added, modified or deleted on the basis of the specifications of V9938. The ones not found here have remained the same as V9938 but note that some, even the same, may be included here due to the convenience of editing. For specifications of V9938, refer to "V9938 MSX-VIDEO Technical Data Book".

December 1988  
YAMAHA Corporation Semiconductor Division

## TABLE OF CONTENTS

- [GENERAL DESCRIPTION](#general-description)
- [FEATURES](#features)
- [INTERNAL STRUCTURE BLOCK DIAGRAM](#internal-structure-block-diagram)
- [PIN LAYOUT AND FUNCTIONS](#pin-layout-and-functions)
- [REGISTER DESCRIPTION](#register-description)
  - [Added Registers](#added-registers)
    - [Horizontal Scroll Function](#horizontal-scroll-function)
    - [Wait function](#wait-function-to-speed-up-the-writing-time-of-data-from-cpu-to-vram)
    - [Command function](#command-function)
    - [YJK-Type Data Display Function](#yjk-type-data-display-function)
  - [Modified Register](#modified-register)
  - [Deleted Functions](#deleted-functions)
- [MODIFIED TERMINALS DESCRIPTION](#modified-terminals-description)
- [ELECTRICAL CHARACTERISTICS](#electrical-characteristics)
  - [Maximum Ratings](#maximum-ratings)
  - [Recommended Operating Conditions](#recommended-operating-conditions)
  - Electrical Characteristics Under Recommended Operating Conditions
    - External Input Clock Timing
    - DC Characteristics
    - Input/Output Capacity
    - External Output Clock Timing
    - CPU-MSX-VIDEO Interface
    - CPU-MSX-VRAM Interface
    - R.G.B. Output Level
    - Sync Signal Output Level
    - R.G.B. Signal AC Characteristics
    - Synch Signal AC Characteristics
    - Color Bus
    - VDS
- [MSX-VIDEO CIRCUIT DIAGRAM](#msx-video-circuit-diagram)
- [PACKAGE DIMENSIONAL DIAGRAM](#package-dimensional-diagram)

## GENERAL DESCRIPTION

This LSI is a video display processor (VDP) which is applicable to new media. It uses an N-channel silicon gate MOS and has a linear RGB output. It is software compatible with TMS9918A and V9938.

## FEATURES

- 5V power supply.
- Outputs linear RGB.
- Built-in color palette for display in up to 512 colors.
- Capable of simultaneous display of 19,268 colors by using YJK system display.
- Capable of displaying up to 512x424 Pixels and 16 colors.
- Bit mapped graphics.
- Capable of displaying maximum of 256 colors simultaneously.
- 16K byte ~ 128K byte usable for display memory.
- 16Kx1b, 16Kx4b, 64Kx1b and 64Kx4b DRAMs are useable.
- 256 addresses, 4ms auto refresh function of DRAM.
- Expansion video memory can be connected.
- Eight sprites can be displayed for each horizontal line.
- Colors for sprites can be specified for each horizontal line.
- Area move, line, search and other commands.
- Command function usable in every display mode.
- Logical operation function.
- Addresses can be specified by coordinates.
- Capable of external synchronization.
- Capable of superimposition.
- Capable of digitization.
- Multi MSX-VIDEO configurations are possible.
- External color palettes can be added by utilizing color output.
- Vertical and horizontal scroll function.
- Mail function to CPU.

## INTERNAL STRUCTURE BLOCK DIAGRAM
_SECTION NOT INCLUDED FROM THE ORIGINAL DOCUMENT_

## PIN LAYOUT AND FUNCTIONS
_SECTION NOT INCLUDED FROM THE ORIGINAL DOCUMENT_

## REGISTER DESCRIPTION
### Added Registers

Show below are the registers newly added to the existing V9938 registers.

```
     MSB  b7    b6    b5    b4    b3    b2    b1    b0   LSB
        +-----+-----+-----+-----+-----+-----+-----+-----+
R#25    |  0  | CMD | VDS | YAE | YJK | WTE | MSK | SP2 |
        +=====+=====+=====+=====+=====+=====+=====+=====+
R#26    |  0  |  0  | H08 | H07 | H06 | H05 | H04 | H03 | by character units
        +=====+=====+=====+=====+=====+=====+=====+=====+
R#27    |  0  |  0  |  0  |  0  |  0  | H02 | H01 | H00 | by dot units
        +-----+-----+-----+-----+-----+-----+-----+-----+
```

The above three registers are cleared to "0" by the RESET signal and if used in that state, will function compatibly with V9938.

```
#25  b7      \
#26  b6, b7   | Make sure to set "0" for these empty bit positions.
#27  b3 ~ b7 /
```

#### Horizontal Scroll Function

|Values|Description|
|---|---|
|H08 - H00|Used to set the scroll volume of still pictures in the horizontal direction one dot at a time. (In G5 and G6 modes, scrolling is in 2-dot units.)|
|SP2|0: Sets the horizontal screen size to 1 page (Initial value). Scrolling is done within one page and non-displayed left side of the page is displayed on the right hand side of the screen.<br>1: Sets the horizontal screen size to two pages. Scrolling is done within 2 pages and if the first page is displayed first, then the second page will appear at the scroll operation.|
|MSK|0: The left 8 dots are not masked (Initial value).<br>1: The left 8 dots are masked and he border color is output.<br>There is no need to mask if the value in #27 is "0".<br>(In G5/G6 modes, the number of masked dots is 16.)

During scrolling, once the dots disappear to the left of the screen or once the dots 1 to 7 appear on the screen, their data are not controlled by V9958 and there is no guarantee on what will be displayed.

To ensure proper display on the screen, therefore, masking is necessary.

##### Screen display for H08-H03

The screen is shifted _to the left_: as specified in 8-dot units (in G5/G6 modes, the screen is shifted in 16-dot units).

```
When SP2 = 0
                   Display screen
     H07-03  +--+--+-----···-----+--+--+
          0  | 0| 1|             |30|31|  1 Line
          1  | 1| 2|             |31| 0|
             :                         :
         31  |31| 0|             |29|30|
             +--+--+-------------+--+--+

        Note) H08 is ignored
```

```
When SP2 = 1
                   Display screen
     H08-03  +--+--+-----···-----+--+--+
          0  | 0| 1|   |31|32|   |62|63|  1 Line
          1  | 1| 2|   |32|33|   |63| 0|
             :                         :
         31  |31|32|   |62|63|   |29|30|
         32  |32|33|   |63| 0|   |30|31|
             :                         :
         63  |63| 0|   |30|31|   |61|62|
             +--+--+-------------+--+--+

        Note) When SP2=1, bit 5 (A15) of the pattern name table base address
              register (R#2) should be set to "1".
              The base address of each table will be as follows.
              
              Pattern name table (PNT): 0 to 31 (when A15 is set to "0")
                                       32 to 63 (when A15 is set to "1")
              Pattern generator table (PGT): The base address remains unchanged 
                                             even when scroll value is changed.
              Color table (CT): The base address remains unchanged even when scroll
                                value is changed.
```

##### Screen display for H02-H00

The screen is shifted _to the right_ as specified in 1-dot unit (in G5/G6 modes, the screen is shifted in 2-dot units).

```
(Example)

1. When scrolling to the left one dot at a time
        RESET initial
    #26   0      1       1           1         2 (Count up)
                             ·····                ···
    #27   0      7       6           0         7 (Count down)
            ---------+---------+ +----------+----------
            1 dot to |2 dots to| |8 dots to |9 dots to
            the left |the left | |the left  |the left
            
2. When scrolling to the right one dot at a time
        RESET initial
    #26   0      0       0          31        32 (Count up)
                             ·····                ···
    #27   0      1       2           0         1  (Count down)
            ---------+---------+ +----------+----------
            1 dot to |2 dots to| |8 dots to |9 dots to
            the right|the right| |the right |the right
```

#### Wait function (to speed up the writing time of data from CPU to VRAM)

```
     MSB  b7    b6    b5    b4    b3    b2    b1    b0   LSB
        +-----+-----+-----+-----+-----+-----+-----+-----+
R#25    |     |     |     |     |     | WTE |     |     |
        +-----+-----+-----+-----+-----+-----+-----+-----+
```

|WTE|Description|
|---|---|
|0|Disables the WAIT function (Initial value).<br>Works in the same way as V9938.|
|1|Enables the WAIT function.<br>When the CPU accesses the VRAM, accesses to all ports on V9958 is held in the WAIT state until access to the VRAM of V9958 is completed.<br>However, WAIT function is not provided for incomplete access to the register and the color palette or for the data ready status of commands.|

#### Command function

```
     MSB  b7    b6    b5    b4    b3    b2    b1    b0   LSB
        +-----+-----+-----+-----+-----+-----+-----+-----+
R#25    |     | CMD |     |     |     |     |     |     |
        +-----+-----+-----+-----+-----+-----+-----+-----+
```

|CMD|Description|
|---|---|
|0|The command function is not expanded (Initial value).<br>The command function can be used only in G4 to G7 modes as with the conventional type.|
|1|Enables the command function in all display modes.<br>In G4 to G7 modes, it works in the same way as with the conventional type and as G7 mode in any mode.<br>Therefore, it is necessary to set the parameters by using x-y coordinates of G7 mode.|

#### YJK-Type Data Display Function

```
     MSB  b7    b6    b5    b4    b3    b2    b1    b0   LSB
        +-----+-----+-----+-----+-----+-----+-----+-----+
R#25    |     |     |     | YAE | YJK |     |     |     |
        +-----+-----+-----+-----+-----+-----+-----+-----+
```

|Bit|Value|Description|
|---|---|---|
|YJK|0|Handles the data on VRAM as RGB type data (Initial value).<br>(Example : G7 mode = 3,3 and 2 bits each)<br>Displayed colors of the sprites are the same as the conventional type.|
|YJK|1|Handles the data on VRAM as YJK type data, converts them to RGB signals (5 bits each) and outputs them through RGB terminals as analog signals.<br>The color palette is used to display colors of the sprite in G7 mode.|

**YAE=0 (Without attributes)**

Indicates color data for 1 dot and color specification can be made up to 2<sup>17</sup>:
||C7 C6 C5 C4 C3|C2 C1 C0|
|---|:-:|:-:|
|1 dot|Y1|KL|
|1 dot|Y2|KH|
|1 dot|Y3|JL|
|1 dot|Y4|JH|

YJK type data is categorized based on the data on 4 continuous dots as follows:
|||
|---|---|
|Y1 · KL · KH · JL · JH| color data for the 1st dot|
|Y2 · KL · KH · JL · JH| color data for the 2nd dot|
|Y3 · KL · KH · JL · JH| color data for the 3rd dot|
|Y4 · KL · KH · JL · JH| color data for the 4th dot|

**YAE=1 (With attributes)**

||C7 C6 C5 C4 C3|C2|C1 C0|
|---|:-:|:-:|:-:|
|1 dot|Y1|A1|KL|
|1 dot|Y2|A2|KH|
|1 dot|Y3|A3|JL|
|1 dot|Y4|A4|JH|

|||
|---|---|
|When `An` = 0|Just like when YAE="0", `Yn`+`KL`+`KH`+`JL`+`JH` indicates color data for 1 dot and color specifications can be made up to 2<sup>16</sup>. (The `A` bit is ignored.)|
|When `An` = 1|`Yn` become color codes respectively and they are output as RGB signals through the color palette (16 colors).<br>The `KL`, `KH`, `JL` and `JH` data are ignored then for that dot.|

##### Combination of YJK and YAE data

|YJK|YAE|VRAM data|
|:-:|:-:|---|
|0|0|Via the conventional color palette|
|0|1|Via the conventional color palette|
|1|0|Via the YJK -> RGB conversion table|
|1|1|`An`=0: Via the YJK -> RGB conversion table<br>`An`=1 : Via the color palette|

```
             +-------------+  R(3)  +------+
             |             |------->|      |
             | Color       |  G(3)  |      |    +-----+ R
         +-->| palette     |------->|      |--->| DAC |---->
         |   |             |  B(3)  |      |    +-----+
         |   |             |------->|      |
         |   +-------------+        |      |    +-----+ G
C7~C0 ---+                          | SEL  |--->| DAC |---->
         |                          |      |    +-----+
         |   +-------------+  R(5)  |      |
         |   |YJK->RGB     |------->|      |    +-----+ B
         +-->|conversion   |  G(5)  |      |--->| DAC |---->
             |table        |------->|      |    +-----+
             |(in 4 dots   |  B(5)  |      |
             |units)       |------->|      |
             +-------------+        +------+
```
#####  YJK <-> RGB Conversion

The formulas for YJK-RGB conversion are as follows.

|Component|From YJK to RGB|
|:-:|---|
|R|Y + J|
|G|Y + K|
|B|(5/4)Y - J/2 - K/4|

|Component|From RGB to YJK|
|:-:|---|
|Y|B/2 + R/4 + G/8|
|J|R - Y|
|K|G - Y|

### Modified Register

Shown below is the register whose function has been modified from V9938.

```
     MSB  b7    b6    b5    b4    b3    b2    b1    b0   LSB
        +-----+-----+-----+-----+-----+-----+-----+-----+
S#1     | FL  | LPS |  0  |  0  |  0  |  1  |  0  | FH  |  Status Register 1
        +-----+-----+-----+-----+-----+-----+-----+-----+
                          -------------------------
                                     ID#
```

When the power is turned ON, the ID# is returned to b1 to b5 of the status register 1, indicating that V9938 is connected at "0" and V9958 is connected at "2".

### Deleted Functions

1. Composite video output.
2. Mouse/lightpen interface

As a result of these deletions, the following bits of the internal register become meaningless (`IE2`, `MS`, `LP`, `FL`, `LPS`).  
Therefore, set these meaningless bits to "0" when writing into the registers.

```
     MSB  b7    b6    b5    b4    b3    b2    b1    b0   LSB
        +-----+-----+-----+-----+-----+-----+-----+-----+
R#0     |           | IE2 |                             |  Mode Register 0
        +=====+=====+=====+=====+=====+=====+=====+=====+
R#8     | MS  | LP  |                                   |  Mode Register 8
        +=====+=====+=====+=====+=====+=====+=====+=====+
S#1     | FL  | LPS |                                   |  Status Register 1
        +-----+-----+-----+-----+-----+-----+-----+-----+
```

## MODIFIED TERMINALS DESCRIPTION

The following table shows those terminals whose function has been modified and those whose function has been deleted and then newly added.

|Pin No.|V9958<br>Terminal name I/O|V9938<br>Terminal name I/O|Remarks|
|:-:|:-:|:-:|---|
|4|\*VRESET (I)|\*VDS (O)|Added after deleted|
|5|\*HSYNC (O)|\*HSYNC (I/O)|Modified|
|6|\*CSYNC (O)|\*CSYNC (I/O)|Modified|
|8|CPUCLK/\*VDS (O)|CPUCLK (O)|Modified|
|21|VDD/DAC (I)|VIDEO (O)|Added after deleted|
|26|\*WAIT (O)|\*LPS (I)|Added after deleted|
|27|\*HRESET (I)|\*LPD (I)|Added after deleted|

The rest of the terminals remain the same as those of V9958.

- Deleted terminal:
  - VIDEO
  - LPS
  - LPD
  - VDS
- Added terminal function:
  - VDD/DAC --> Analog power source
  - WAIT --> I/O WAIT output
  - HRESET --> Tri-level logic input HSYNC and CSYNC separated.
  - VRESET --> Tri-level logic input HSYNC and CSYNC separated.
- Modified terminal functions:
  - HSYNC --> HSYNC output or burst flag output
  - CSYNC --> CSYNC output
  - CPUCLK/VDS --> CPUCLK output or VDS output

Output selection between CPUCLK and \*VDS

```
     MSB  b7    b6    b5    b4    b3    b2    b1    b0   LSB
        +-----+-----+-----+-----+-----+-----+-----+-----+
R#25    |     |     | VDS |     |     |     |     |     |
        +-----+-----+-----+-----+-----+-----+-----+-----+
                       |
                       +---> 0: The CPUCLK signal is output (Initial value).
                       +---> 1: The VDS signal is output.
```

## ELECTRICAL CHARACTERISTICS

### Maximum Ratings

|Symbol|Item|Rating|Unit|
|:-:|---|:-:|:-:|
|Vdd|Power supply voltage|-0.5 … +7.0|V|
|Vin|Input voltage|-0.5 … +7.0|V|
|Ts|Storage temperature|-50 … +125|°C|
|To|Operating temperature|0 … +70|°C|

### Recommended Operating Conditions

|Symbol|Item|Minimum|Typical|Maximum|Unit|
|:-:|---|:-:|:-:|:-:|:-:|
|Vdd|Power supply voltage|4.75|5.00|5.25|V|
|Vss|Power supply voltage||0||V|
|Ta|Operating ambient temperature|0||70|°C|
|Vil 1|Low level input voltage (group 1)|-0.3||0.8|V|
|Vil 2|Low level input voltage (group 2)|-0.3||0.8|V|
|Vil 3|External clock low level input voltage (group 3)|-0.3||0.8|V|
|Vih 1|High level input voltage (group 1)|2.2||Vdd|V|
|Vih 2|High level input voltage (group 2)|2.2||Vdd|V|
|Vih 3|External clock high level input voltage (group 3)|2.2|Vdd|V|

Note:
- Group 1: \*CSR, RD0-7, C0-7, \*LPS, \*LPD, \*RESET, \*DLCLK, \*VRESET, \*HRESET
- Group 2: CD0-7, MODE 0, MODE 1, \*CSW
- Group 3: XTAL 1, XTAL 2

## MSX-VIDEO CIRCUIT DIAGRAM
_SECTION NOT INCLUDED FROM THE ORIGINAL DOCUMENT_

## PACKAGE DIMENSIONAL DIAGRAM
_SECTION NOT INCLUDED FROM THE ORIGINAL DOCUMENT_
