# MegaROM Mappers

Source: https://www.msx.org/wiki/MegaROM_Mappers

This page was last modified 15:12, 26 May 2025 by Gdx. Based on work by Slor and Mars2000you and others.

## Contents
1. [Introduction](#Introduction)
2. [Description of known ROM Mappers](#Description_of_known_ROM_Mappers)
   + [2.1 ASCII 8K](#ASCII_8K)
   + [2.2 ASCII 16K](#ASCII_16K)
   + [2.3 Black Box, Deluxe Box and Golden Box (Zemina)](#Black_Box.2C_Deluxe_Box_and_Golden_Box_.28Zemina.29)
   + [2.4 Cross Blaim (db-Soft)](#Cross_Blaim_.28db-Soft.29)
   + [2.5 Dooly The Little Dinosaur](#Dooly_The_Little_Dinosaur) (Daou Infosys) / 아기공룡 둘리 (다우 정보시스템)
   + [2.6 ESE-RAM (aka Mega-SRAM)](#ESE-RAM_.28aka_Mega-SRAM.29)
   + [2.7 Game Master 2 (Konami)](#Game_Master_2_.28Konami.29)
   + [2.8 Generic 8K](#Generic_8K)
   + [2.9 Generic 16K](#Generic_16K)
   + [2.10 Halnote (HAL)](#Halnote_.28HAL.29)
   + [2.11 Harry Fox - The Demonic Snow Beast](#Harry_Fox_-_The_Demonic_Snow_Beast)  (Micro Cabin) / は～りぃふぉっくす雪の魔王編 (マイクロキャビン)
   + [2.12 Holy Quran (Al-Alamiah)](#Holy_Quran_.28Al-Alamiah.29)
   + [2.13 Konami MegaROMs with SCC](#Konami_MegaROMs_with_SCC)
   + [2.14 Konami MegaROMs without SCC](#Konami_MegaROMs_without_SCC)
   + [2.15 Konami Sound Cartridge for Snatcher or SD Snatcher](#Konami_Sound_Cartridge_for_Snatcher_or_SD_Snatcher)
   + [2.16 MegaRam DDX (Digital Design)](#MegaRam_DDX_.28Digital_Design.29)
   + [2.17 MSX-DOS 2 (ASCII)](#MSX-DOS_2_.28ASCII.29)
   + [2.18 Multicart 32 in 1](#Multicart_32_in_1)
   + [2.19 PAC (Panasoft)](#PAC_.28Panasoft.29)
   + [2.20 Play Ball (Sony)](#Play_Ball_.28Sony.29)
   + [2.21 Super Altered Beast](#Super_Altered_Beast) (Clover Soft) / 슈퍼 수왕기 (크로바소프트)
   + [2.22 Super Game 90](#Super_Game_90) (Unknown Publisher)
   + [2.23 Super Game World 30/64/80](#Super_Game_World_30.2F64.2F80) (Screen Software)
   + [2.24 Super Game World 126](#Super_Game_World_126) (Screen Software)
   + [2.25 Super Lode Runner](#Super_Lode_Runner) (Irem)
   + [2.26 Super Pierrot](#Super_Pierrot) (Taito - Nidecom)
   + [2.27 Zemina 8k](#Zemina_8k)
   + [2.28 Zemina 16k](#Zemina_16k)
3. [Links](#Links)

## Introduction

A MegaROM is officially a cartridge that includes ROM of at least 128 kB. This memory is addressable through the same MSX slot by dividing the ROM by segments (commonly 8 or 16 kB), in order to switch them on one or several memory pages. Segments are switched by writing generally at dedicated addresses in the slot where the cartridge is located to access the corresponding registers, but also sometime by using I/O ports. There are other methods to switch the segment but they are almost never used on MSX.

A related term is "ROM mapper". This usually refers to the *mechanism* used to switch segments, as seen from a programmer's point of view (see below). "MegaROM" usually refers to a *cartridge* that includes such a mechanism. Note this mechanism can be also used on ROM less than 128kB.

Very few exceptions aside, ROM cartridges have a power-of-2 size. Common MegaROM sizes are 1 Mbit (128 kB) or 2 Mbit (256 kB). But 4 Mbit (512 kB) and even some bigger MegaROMs exist. MegaROMs usually have a "MegaROM" symbol on the cartridge label and/or box.

There exist several different types of ROM mapper. Some common ones are:

* ASCII 8K
* ASCII 16K
* Konami without SCC
* Konami with SCC

A special type of MegaROM is Konami's Sound Custom Chip SCC. Besides a ROM mapper it also includes a sound chip. The SCC chip produces a characteristic sound, which is liked very much among MSX users.

A few MegaROM cartridges contain some battery-backed SRAM. This RAM may be used to store save-games for example. Hydlide II is an example of this.

## Description of known ROM Mappers

Here is the description of the methods to access the registers of the MegaROM mappers known, and also some specific cartridges that use similar system.

## ASCII 8K

Rom size can be up to 1024kB (chip LZ93A13) or 2048kB (chip M60002 or BS6101). This mapper is called ASCII8. Several makers use this Rom mapper.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh (mirror: C000h~DFFFh) | 6000h (mirrors: 6001h~67FFh) | 0 |
| 6000h~7FFFh (mirror: E000h~FFFFh) | 6800h (mirrors: 6801h~6FFFh) | 0 |
| 8000h~9FFFh (mirror: 0000h~1FFFh) | 7000h (mirrors: 7001h~77FFh) | 0 |
| A000h~BFFFh (mirror: 2000h~3FFFh) | 7800h (mirrors: 7801h~7FFFh) | 0 |

> **Note:** Page mirrors are not present on many cartridges.

**Value format for MegaROMs with an extra SRAM**

ASCII8 mappers with an SRAM are called ASCII8SRAM2, ASCII8SRAM8 or ASCII8SRAM32 depending the SRAM size. They are also called KoeiSRAM2, KoeiSRAM8 or KoeiSRAM32 respectively by mistake. There is a bit to select the SRAM which is among the most significant bits higher than those used to select the segment. It depends on hardware connections to the pins /OE0 to /OE3 of the mapper chip. So the SRAM size can vary theoretically between 1KB and 1024KB.

Here are some examples.

Xanadu (8kB SRAM):
- Bits 0~4 = Segment number (bits 1~6 are ignored in SRAM mode)
- Bit 5 = 1 to select the SRAM (writable on page the page 8000h~BFFFh only)
- Bits 6~7 = Unused

Royal Blood & Wizardry (8kB SRAM):
- Bits 0~6 = Segment number (bits 1~6 are ignored in SRAM mode)
- Bit 7 = 1 to select the SRAM (writable on the page 8000h~BFFFh only)

MSX-Write II (32kB SRAM):
- Bits 0~6 = Segment number (bits 3~6 are ignored in SRAM mode)
- Bit 7 = 1 to select the SRAM (writable on the page 8000h~BFFFh only)

ESE-RAM (DIY cartridge called also Mega-SRAM that only contains SRAM):
- Bits 0~6 = Segment number (bit 6 avalaible with chip M60002 only)
- Bit 7 = 1 to select the SRAM. (writable on the page 8000h~BFFFh only, see also ESE-RAM mapper.

## ASCII 16K

Rom size can be up to 2048kB (chip LZ93A13) or 2048kB (chip M60002 or BS6101). This mapper is called ASCII16. Several makers use this Rom mapper.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh (mirror: C000h~FFFFh) | 6000h (mirrors: 6001h~67FFh) | 0 (0Fh for R-Type) |
| 8000h~BFFFh (mirror: 0000h~3FFFh) | 7000h (mirrors: 7001h~77FFh) | 0 |

> **Notes:** R-Type (384kB) uses same mapper but the segment 0Fh remains fixed on page 4000h~7FFFh. In addition, the segment 0Fh is same as 17h (the last segment). Page mirrors are not present on many cartridges.

**Value format for MegaROMs with an extra SRAM**

ASCII16 mappers with an SRAM are called ASCII16SRAM2 or ASCII16SRAM8 depending the SRAM size. There is a bit to select the SRAM which is among the most significant bits higher than those used to select the segment. It depends on hardware connections to the pins /OE0 to /OE3 of the mapper chip. So the SRAM size can vary theoretically between 1KB and 2048KB.

Here are some examples.

Hydlide 2 (2kB SRAM):
- Bits 0~3 = Segment number (bit 1~3 are ignored in SRAM mode)
- Bit 4 = 1 to select the SRAM (writable on page 8000h~BFFFh only)
- Bits 5~7 = Unused

ESE-RAM (DIY cartridge called also Mega-SRAM that only contains SRAM):
- Bits 0~6 = Segment number
- Bit 7 = Enable writing. (writable on page 8000h~BFFFh only)

## Black Box, Deluxe Box and Golden Box

These Korean cartridges are Megarams of 128kB to 2048kB RAM. The cartridges have two mappers switchable by writing to I/O port 0Fh.

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| Mode 8K | | |  | Mode 16K | | |
| Page (8kB) | Switching address | Initial segment | Page (16kB) | Switching address | Initial segment |
| 4000h~5FFFh | 4000h | 0 |  | 4000h~7FFFh | 4000h | 0 |
| 6000h~7FFFh | 4001h | 0 |
| 8000h~BFFFh | 4002h | 0 | 8000h~9FFFh | 4001h | 0 |
| A000h~BFFFh | 4003h | 0 |

**Format of value to write to the port 0Fh:**
- Bit 0~4 = Unused.
- Bit 4~5 = 01 to enable witting, 10 to write protect (initial status).
- Bit 6~7 = 01 to select 16K mode, 10 to select 8K mode (initial status).

## Cross Blaim

Rom size is only 64kB.

| Page (16kB) | Switching addresses | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | None | Always 0 |
| 8000h~BFFFh | 4045h | 0 |

## Dooly The Little Dinosaur

Rom size is only 32kB. The Rom uses a mapper very specific not to select memory segments but for anti-piracy protection.

| Page | Switching address | Mode |
| --- | --- | --- |
| 4000h~BFFFh | 4000h (mirrors: 4001h~BFFFh) | 0 |

**Description of modes**
* In mode 0, the read value = the value at corresponding address
* In mode 1, the value = (value at address & F8h) or ((value at address x 4) & 4) or ((value at address / 2) & 3)
* In mode 4, the value = (value at address & F8h) or ((value at address / 4) & 1) or ((value at address x 2) & 6)
* In mode 3 and 7, the value = value at address 7
* In mode 2, 5 and 6,
  if (the value at the address) & 7 = 1, 2 or 4 then the value = F8h
  if (the value at address) & 7 = 3, 5 or 6 then if mode = 2 then the value = (value at address & F8h) or ((value at address x 4) & 4) or (((value at address / 2) & 3) xor 7)
  if the mode = 5 then the value = (value at address & 7)
  if the mode = 6 then the value = (value at address & F8h) or ((value at address / 4) & 1) or (((value at address x 2) & 6) xor 7)

## ESE-RAM

There are three types of ESE-RAM, the ESE-RAM SCC, ESE-RAM ASC8 and ESE-RAM ASC16. Each have respectively the KonamiSCC, ASCII8 or ASCII16 mapper (all with mirrors!) and an additional register to enable or disable writing to SRAM.

Write control register is accessible to the address 7FFEh / 7FFFh. Only the bit 4 is used, set it for enable the SRAM writing in 4000H-7FFDH, reset it to disable the writing. (Write protected at initialization).

## Game Master 2

Rom size is 128kB and SRAM is 8kB (2 segments of 4kB).

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh | None | Always 0 |
| 6000h~7FFFh | 6000h (mirrors: 6001h~6FFFh) | 1 |
| 8000h~9FFFh | 8000h (mirrors: 8001h~8FFFh) | 2 |
| A000h~BFFFh | A000h (mirrors: A001h~AFFFh) | 3 |

**Value format**
- Bit 0~3 = Segment number
- Bit 4 = 1 to select the SRAM (writable on page B000h~BFFFh only)
- Bit 5 = SRAM segment select (two segments of 4kB available)
- Bit 6~7 = Unused

## Generic 8K

This mapper is called Generic8. It is based on a mix of Konami's MegaROMs. It is used by some emulators. If you use blueMSX, you need to select the Konami Generic mapper.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh | 4000h (mirrors: 4001h~47FFh, 05000h~077FFh) | 0 |
| 6000h~7FFFh | 6000h (mirrors: 6001h~67FFh, 07000h~077FFh) | 1 |
| 8000h~9FFFh | 8000h (mirrors: 8001h~87FFh, 09000h~097FFh) | 2 |
| A000h~BFFFh | A000h (mirrors: A001h~A7FFh, 0B000h~0B7FFh) | 3 |

## Generic 16K

This mapper is called Generic16. It is similar to Generic8 but with segments of 16kB. It is used by some emulators. If you use blueMSX, you need to select the MSX-DOS 2 mapper, as this emulator, contrary to openMSX, does not have a specific mapper for the real Japanese MSX-DOS 2 cartridge with extra RAM.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | 4000h (mirrors: 4001h~47FFh, 05000h~077FFh,  06000h~067FFh, 07000h~077FFh) | 0 |
| 8000h~BFFFh | 8000h (mirrors: 8001h~87FFh, 09000h~097FFh,  0A000h~0A7FFh, 0B000h~0B7FFh) | 1 |

## Halnote

Rom size is 1024kB (2 x 256kB (LH5321L7 & LH532122) + 512kB (HALOS-14)) + 16kB SRAM (AKM6264A x2)

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh | 4FFFh | 0 |
| 6000h~7FFFh | 6FFFh | 0 |
| 8000h~9FFFh | 8FFFh | 0 |
| A000h~BFFFh | AFFFh | 0 |

**Value format**
- Bits 0~6 are used for the segment number.
- Bits 7 of the address 4FFFh is to enable the SRAM on the page 0000h~3FFFh.
- Bits 7 of the address is 6FFFh to enable MSX-JE mapper

**Segments**
- Segments 0~31 = Hanote ROM (256kB)
- Segments 32~47 = Kanji-ROM Level 1 (128kB)
- Segments 32~63 = Kanji-ROM Level 2 (128kB)
- Segments 63~127 = MSX-JE (512kB)

**Halnote's MSX-JE dictionary (80000h~FFFFFh)**

| Page (2kB) | Switching address | Initial segment |
| --- | --- | --- |
| 7000h~77FFh | 77FFh | 0 |
| 7800h~7FFFh | 7FFFh | 0 |

**Value format**
- Bits 0~7 are used for the segment number. (256 x 2048byte = 512kB)

There is also a register accessible at the address C000h to enable/disable the Kanji-ROM level 1 or 2.
- Bit 0 = Kanji-ROM level 1
- Bit 1 = Kanji-ROM level 2

## Harry Fox - The Demonic Snow Beast

Rom size is only 64kB.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | 6000h (mirrors: 6001h~6FFFh) | 0 |
| 8000h~BFFFh | 7000h (mirrors: 7001h~7FFFh) | 1 |

## Holy Quran

Rom size is 1024kB.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh | 5000h (mirrors: 5001h~53FFh) | 0 |
| 6000h~7FFFh | 5400h (mirrors: 5401h~57FFh) | 0 |
| 8000h~9FFFh | 5800h (mirrors: 5801h~5BFFh) | 0 |
| A000h~BFFFh | 5C00h (mirrors: 5C01h~5FFFh) | 0 |

## Konami MegaROMs with SCC

Konami game cartridges with an extra sound chip called SCC. They are usable by selecting the segment 3Fh on the page 2 (8000h-9FFFh).

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh (mirror: C000h~DFFFh) | 5000h (mirrors: 5001h~57FFh) | 0 |
| 6000h~7FFFh (mirror: E000h~FFFFh) | 7000h (mirrors: 7001h~77FFh) | 1 |
| 8000h~9FFFh (mirror: 0000h~1FFFh) | 9000h (mirrors: 9001h~97FFh) | 2 |
| A000h~BFFFh (mirror: 2000h~3FFFh) | B000h (mirrors: B001h~B7FFh) | 3 |

**Value format**:
- Bit 0~5 = Segment number. Set all of these bits at 9000h to enable the addresses to access to the SCC registers.
- Bit 6~7 = Unused

**Addresses to access to the SCC registers:**
- These addresses are 9800h~98FFh, and are mirrored up to 9FFFh.

| Address(es) | Desciption |
| --- | --- |
| 9800h~981Fh: | 32 bytes signed (value from -128 (80h) to 127 (7Fh)) to define the envelope (waveform) of the channel 1 |
| 9820h~983Fh: | 32 bytes signed to define the envelope of the channel 2 |
| 9840h~985Fh: | 32 bytes signed to define the envelope of the channel 3 |
| 9860h~987Fh: | 32 bytes signed to define the envelope of the channels 4 and 5 |
| 9880h~9881h\*: | Channel 1 frequency on 12bit \ |
| 9882h~9883h\*: | Channel 2 frequency on 12bit | |
| 9884h~9885h\*: | Channel 3 frequency on 12bit > Same format as for the PSG frequency (registers 0~5) |
| 9886h~9887h\*: | Channel 4 frequency on 12bit | |
| 9888h~9889h\*: | Channel 5 frequency on 12bit / |
| 988Ah\*: | Channel 1 volume (bits 4~7 are ignored) |
| 988Bh\*: | Channel 2 volume (bits 4~7 are ignored) |
| 988Ch\*: | Channel 3 volume (bits 4~7 are ignored) |
| 988Dh\*: | Channel 4 volume (bits 4~7 are ignored) |
| 988Eh\*: | Channel 5 volume (bits 4~7 are ignored) |
| 988Fh\*: | ON/OFF switch for each channel from 1 to 5 (bits 0~4 = Channels 1~5) |
| 9890h~989Fh\*: | Same as 9880h to 988Fh (mirrors) |
| 98A0h~98DFh\*: | Channel 5 envelope data (Read only) |
| 98E0h~98FFh\*: | Deformation register. (One byte only, the others are mirrors. Not used by Konami.)   * Bit 0 = Set the frequency divider on 4 bits. Division ratio becomes 1/256 of the division ratio register. * Bit 0 = Set the frequency divider on 8 bits. 8-11 bits are 0. * Bit 2~4 = ? * Bit 5 = When a value is written to the division ratio register, the corresponding waveform data is replayed from the beginning. * Bit 6 = Envelope data of all channels is rotated. As for the direction, the data that was at +0 moves to +1. The rotation time is 3.58 MHz ÷ (division ratio register value + 1). The envelope data memory is write-protected for all channels. * Bit 7 = Only the envelope data of channel 4 is rotated. Only channels 4 and 5 of the envelope data are write-protected. This bit is valid only in Megarom. |

> **(\*) Writing only Note:** You can't write in the registers in RAM mode because registers can only be read in this mode.

Also see the Wiki page about the SCC.

## Konami MegaROMs without SCC

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh (mirror: C000h~DFFFh) | None | Always 0 |
| 6000h~7FFFh (mirror: E000h~FFFFh) | 6000h (mirrors: 6001h~7FFFh) | 1 |
| 8000h~9FFFh (mirror: 0000h~1FFFh) | 8000h (mirrors: 8001h~9FFFh) | Random |
| A000h~BFFFh (mirror: 2000h~3FFFh) | A000h (mirrors: A001h~BFFFh) | Random |

> **Notes:** Hai no Majutsushi (RC-765) has an extra 8bit digital to analog converter. Each value to be sent (8bit unsigned) must be written one by one at 5000h address (with mirrors at 5001h~5FFFh).

> Some MegaflashRom or MegaRAM use this mapper with selectable segments on page 4000h~5FFFh. These are preferable to those with a fixed page. It doesn't prevent Konami games from working.

## Konami Sound Cartridge for Snatcher or SD Snatcher

This Sound Cartridge is a Mega-RAM of 64kB (expandable to 128kB) with a SCC+ (aka 052539 chip) compatible with the SCC. The sound cartridge for Snatcher have the segments 0~7 and the one for SD Snatcher have the segments 8~15.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh (mirror: C000h~DFFFh) | 5000h (mirrors: 5001h~57FFh) | 0 (Snatcher only) |
| 6000h~7FFFh (mirror: E000h~FFFFh) | 7000h (mirrors: 7001h~77FFh) | 1 (Snatcher only) |
| 8000h~9FFFh (mirror: 0000h~1FFFh) | 9000h (mirrors: 9001h~97FFh) | 2 (Snatcher only) |
| A000h~BFFFh (mirror: 2000h~3FFFh) | B000h (mirrors: B001h~B7FFh) | 3 (Snatcher only) |

**Value format**:
- Bit 0~5 = Set all of these bits at 9000h in SCC mode or B000h in SCC+ mode to enable the addresses to access to the sound chip registers.
- Bit 6~7 = Unused

**Addresses to access to the SCC+ registers:**
- These addresses are B800h~B8FFh, and are mirrored up to BFFFh.

| Address(es) | Description |
| --- | --- |
| B800h~B81Fh: | 32 bytes signed (value from -128 (80h) to 127 (7Fh)) to define the envelope form of the channel 1 |
| B820h~B83Fh: | 32 bytes signed to define the envelope form of the channel 2 |
| B840h~B85Fh: | 32 bytes signed to define the envelope form of the channel 3 |
| B860h~B87Fh: | 32 bytes signed to define the envelope form of the channel 4 |
| B880h~B89Fh: | 32 bytes signed to define the envelope form of the channel 5 |
| B8A0h~B8A1h\*: | Channel 1 frequency on 12bit \ |
| B8A2h~B8A3h\*: | Channel 2 frequency on 12bit | |
| B8A4h~B8A5h\*: | Channel 2 frequency on 12bit > Frequency = CPU frequency / (32 x (tempo + 1)) |
| B8A6h~B8A7h\*: | Channel 4 frequency on 12bit | |
| B8A8h~B8A9h\*: | Channel 5 frequency on 12bit / |
| B8AAh\*: | Channel 1 volume (bits 4~7 are ignored) |
| B8ABh\*: | Channel 2 volume (bits 4~7 are ignored) |
| B8ACh\*: | Channel 3 volume (bits 4~7 are ignored) |
| B8ADh\*: | Channel 4 volume (bits 4~7 are ignored) |
| B8AEh\*: | Channel 5 volume (bits 4~7 are ignored) |
| B8AFh\*: | On/Off switch for channels 1 to 5 (bits 0~4 = channels 1~5) |
| B8B0h~B8BFh\*: | Same as B8A0h to B8AFh |
| B8C0h~B8DFh\*: | Deformation register. (One byte only, the others are mirrors. Not used by Konami.)   * Bit 0 = Set the frequency divider on 4 bits. Division ratio becomes 1/256 of the division ratio register. * Bit 0 = Set the frequency divider on 8 bits. 8-11 bits are 0. * Bit 2~4 = ? * Bit 5 = When a value is written to the division ratio register, the corresponding waveform data is replayed from the beginning. * Bit 6 = Envelope data of all channels is rotated. As for the direction, the data that was at +0 moves to +1. The rotation time is 3.58 MHz ÷ (division ratio register value + 1). The envelope data memory is write-protected for all channels. * Bit 7 = Only the envelope data of channel 4 is rotated. Only channels 4 and 5 of the envelope data are write-protected. This bit is valid only in Megarom. |
| B8E0h~B8FFh: | Not used |

**Modes select register:**
- This register is used to select the SCC or SCC+ mode as well as the RAM or ROM mode of the pages. Always accessible at the addresses below.

BFFEh/BFFFh\*:
- Bit 0 = 1 for page 4000h~5FFFh in RAM mode, 0 for ROM mode (no effect if bit 4 is set)
- Bit 1 = 1 for page 6000h~7FFFh in RAM mode, 0 for ROM mode (no effect if bit 4 is set)
- Bit 2 = 1 for page 8000h~9FFFh in RAM mode, 0 for ROM mode (no effect if bit 4 is set)
- Bit 3 = Not used
- Bit 4 = 1 to put all the pages in RAM mode, 0 to put the page A000h~BFFFh in ROM mode and others in mode determined by the bits 0~2.
- Bit 5 = 1 for SCC+ mode, 0 for SCC mode
- Bits 6~7 = Not used

> (\*) Writing only

Note: You can't write in the registers in RAM mode because registers can only be read in this mode.

See too the Wiki pages for the SCC+ and the Sound Cartridge.

## MegaRam DDX

This is a MegaRam from Brazil, created by Ademir Carchano and cloned by several manufacturers, including DDX, and MSX users. Memory size varies from 256kB to 2048kB depending on the model (II-MEGARAM, MegaRam 2 mega, etc). DDX created the MegaRAM Disk, that has a disk Rom and allows the RAM to be used as a RAM disk.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh | 4000h | 0 |
| 6000h~7FFFh | 6000h | 1 |
| 8000h~9FFFh | 8000h | 2 |
| A000h~BFFFh | A000h | 3 |

A writing to I/O port 8Eh enables the Megaram. Ram is write protected, you can select segments. A reading of same port will allow writing to RAM.

## MSX-DOS 2

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | 6000h or 7FFEh (v.2.20), or 7FF0h (v.2.3x of MSX turbo R) | 0 |

> **Note:** Switching addresse 6000h and 7FFEh depends on cartridge.

## Multicart 32 in 1

This mapper is called Multicart32. It is the mapper of the Rom collection cartridges sold by Retrohard. These cartridges contain 31 pirated games stored on a flash Rom. Several cartridges contains custom games.

| Page (32kB) | Switching I/O port | Initial segment |
| --- | --- | --- |
| 4000h~BFFFh | #94 | Always 0 |

**Value format**
- Bit 0 ~ 4 = Segment number
- Bit 5 ~ 7 = Unused

> **Note:** Page 4000h~7FFFh is mirrored to C000h~FFFFh, and page 8000h~BFFFh is mirrored to 0000h~BFFFh.

## PAC

8kB SRAM cartridge. Same device is included in FM-PAC cartridge.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh | 5FFEh & 5FFFh | None |

> **Note:** Write 4Dh to 5FFEh and 69h to 5FFFh to select the SRAM. Write another value than 4Dh to 5FFEh or another value than 69h to 5FFFh to disable the SRAM. (The commonly used value is 0.) These two registers are not readable when SRAM is disabled.

## Play Ball

This 32kB ROM does not use mapper, but some emulators have this Rom in their list of mappers to indicate it uses a DAC accessible by reads/writes to an address of the ROM. A write to BFFFh triggers the playback of subsequent digitized sounds.

| Access address | Effect when writing |
| --- | --- |
| BFFFh | 0 = Say "strike"  1 = Say "ball". 2 = Say "foul". 3 = Say "safe". 4 = Say "out". 5 = Play a sound used at start. 6 = Play the sound when you hit the ball with your bat. 7 = Play the sound when the ball is caught by the man behind the batter. 8 = Say "game set". 9 = Sound when the men can walk freely after the batter gets hit by the ball. 10 = Play the sound when the batter gets hit by the ball. |

> **Note:** Bit 0 is set during digitized sound playback.

## Super Altered Beast

Rom size is only 64kB.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | None | Always 0 |
| 8000h~BFFFh | 8000h | ? |

**Value format**
- Bit 0 = Unused
- Bit 1 ~ 3 = Segment number
- Bit 4 ~ 7 = Unused

## Super Game 90

MegaRom released in Korea. Rom size is 1024kB. It contains several hacked games. Switching segment must be specified to I/O port 77h, Switching address is not used.

| Page (8kB or 16kB) | Switching I/O port | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | 77h | 0 |
| 8000h~BFFFh | 77h | 0 |

**Value format**
- Bit 0 ~ 5 = 16kB segment number
- Bit 6 = If set, the first 8kB of specified segment will be swapped with second part of 8K on page 8000h~BFFFh. This bit is ignored when the bit 7 is set.
- Bit 7 = If reseted, the specified segment will be mirrored on page 8000h~BFFFh otherwise it's the next segment.

> **Note:** This mapper is also called "Zemina 90 in 1" by mistake. This is not Zemina's cartridge.

## Super Game World 30/64/80

This mapper is used for some MegaRoms containing several hacked games. It's same mapper as Golden Box in mode 8k.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh | 4000h | 0 |
| 6000h~7FFFh | 4001h | 0 |
| 8000h~9FFFh | 4002h | 0 |
| A000h~BFFFh | 4003h | 0 |

## Super Game World 126

This mapper is used for a MegaRoms of 2048kB that containing several hacked games. It's same mapper as Golden Box in mode 16k.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | 4000h | 0 |
| 8000h~BFFFh | 4001h | 0 |

## Super Lode Runner

Rom size is 128kB.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 8000h~BFFFh | 0000h (mirrors: 0001h~3FFFh) (no need to select the slot!) | 0 |

> **Note:** Switching address mirrors cause issue on a real MSX turbo R.

## Super Pierrot

Rom size is 128kB.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh | 4000h (mirrors: 4001h~4FFFh, 6000h~6FFFh, 8000h~8FFFh, A000h~AFFFh) | 0 |
| 8000h~BFFFh | 5000h (mirrors: 5001h~5FFFh, 7000h~7FFFh, 9000h~9FFFh, B000h~BFFFh) | 0 |

> **Note:** This is a mapper close to the ASCII16 mapper found in some emulators. However bsittler has confirmed that there are cartridges with the ASCII16 mapper in the thread here (https://www.msx.org/forum/semi-msx-talk/emulation/super-pierrot-mapper).

## Zemina 8k

Used for several MegaRoms released in Korea by Zemina. This mapper is called Zemina8. It is similar to Konami's MegaROMs without SCC.

| Page (8kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~5FFFh (mirror: C000h~DFFFh) | 4000h (mirrors: 4001h~5FFFh) | 0 |
| 6000h~7FFFh (mirror: E000h~FFFFh) | 6000h (mirrors: 6001h~7FFFh) | 1 |
| 8000h~9FFFh (mirror: 0000h~1FFFh) | 8000h (mirrors: 8001h~9FFFh) | 2 |
| A000h~BFFFh (mirror: 2000h~3FFFh) | A000h (mirrors: A001h~BFFFh) | 3 |

## Zemina 16k

Used for some MegaRoms released in Korea by Zemina and a few Korean users. This mapper is called Zemina16.

| Page (16kB) | Switching address | Initial segment |
| --- | --- | --- |
| 4000h~7FFFh (mirror: C000h~FFFFh) | 4000h (mirrors: 4001h~7FFFh) | 0 |
| 8000h~BFFFh (mirror: 0000h~7FFFh) | 8000h (mirrors: 8001h~BFFFh) | 1 |

# Links

* [Programming info by Bifi](http://bifi.msxnet.org/msxnet/tech/megaroms.html).
* [MegaRoms Database by Gigamix](http://gigamix.hatenablog.com/entry/rom/). (MegaRoms list in Japanese with description of the components to make a ESE-RAM or MegaFlashRom).
