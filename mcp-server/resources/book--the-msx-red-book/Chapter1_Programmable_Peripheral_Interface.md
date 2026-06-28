# 1. Programmable Peripheral Interface

The 8255 PPI is a general purpose parallel interface device configured as three eight bit data ports, called A, B and C, and a mode port. It appears to the Z80 as four I/O ports through which the keyboard, the memory switching hardware, the cassette motor, the cassette output, the Caps Lock LED and the Key Click audio output can be controlled. Once the PPI has been initialized access to a particular piece of hardware just involves writing to or reading the relevant I/O port.

## PPI Port A (I/O Port A8H)

|7 + 6|5 + 4|3 + 2|1 + 0|
|:-:|:-:|:-:|:-:|
| Page 3<br/>PSLOT#<br/>C000-FFFF | Page 1<br/>PSLOT#<br/>8000-BFFF | Page 2<br/>PSLOT#<br/>4000-7FFF | Page 0<br/>PSLOT#<br/>0000-3FFF |


**Figure 1:** Primary Slot Register

This output port, known as the Primary Slot Register in MSX terminology, is used to control the memory switching hardware. The Z80 Microprocessor can only access 64 KB of memory directly. This limitation is currently regarded as too restrictive and several of the newer personal computers employ methods to overcome it.

MSX machines can have multiple memory devices at the same address and the Z80 may switch in any one of them as required. The processor address space is regarded as being duplicated "sideways" into four separate 64 KB areas, called Primary Slots 0 to 3, each of which receives its own slot select signal alongside the normal Z80 bus signals. The contents of the Primary Slot Register determine which slot select signal is active and therefore which Primary Slot is selected.

To increase flexibility each 16 KB "page" of the Z80 address space may be selected from a different Primary Slot. As shown in [Figure 1](#figure1) two bits of the Primary Slot Register are required to define the Primary Slot number for each page.

The first operation performed by the MSX ROM at power-up is to search through each slot for RAM in pages 2 and 3 (8000H to FFFFH). The Primary Slot Register is then set so that the relevant slots are selected thus making the RAM permanently available. The memory configuration of any MSX machine can be determined by displaying the Primary Slot Register setting with the BASIC statement:

`PRINT RIGHT$("0000000"+BIN$(INP(&HA8)),8)`

As an example "10100000" would be produced on a Toshiba HX10 where pages 3 and 2 (the RAM) both come from Primary Slot 2 and pages 1 and 0 (the MSX ROM) from Primary Slot 0. The MSX ROM must always be placed in Primary Slot 0 by a manufacturer as this is the slot selected by the hardware at power-up. Other memory devices, RAM and any additional ROM, may be placed in any slot by a manufacturer.

A typical UK machine will have one Primary Slot containing the MSX ROM, one containing 64 KB of RAM and two slots brought out to external connectors. Most Japanese machines have a cartridge type connector on each of these external slots but UK machines usually have one cartridge connector and one IDC connector.

## Expanders

System memory can be increased to a theoretical maximum of sixteen 64 KB areas by using expander interfaces. An expander plugs into any Primary Slot to provide four 64 KB Secondary Slots, numbered 0 to 3, instead of one primary one. Each expander has its own local hardware, called a Secondary Slot Register, to select which of the Secondary Slots should appear in the Primary Slot. As before pages can be selected from different Secondary Slots.

|7 + 6|5 + 4|3 + 2|1 + 0|
|:-:|:-:|:-:|:-:|
| Page 3<br/>SSLOT# | Page 1<br/>SSLOT# | Page 2<br/>SSLOT# | Page 0<br/>SSLOT# |

**Figure 2:** Secondary Slot Register

Each Secondary Slot Register, while actually being an eight bit read/write latch, is made to appear as memory location FFFFH of its Primary Slot by the expander hardware. In order to gain access to this location on a particular expander it will usually be necessary to first switch page 3 (C000H to FFFFH) of that Primary Slot into the processor address space. The Secondary Slot Register can then be modified and, if necessary, page 3 restored to its original Primary Slot setting. Accessing memory in expanders can become rather a convoluted process.

It is apparent that there must be some way of determining whether a Primary Slot contains ordinary RAM or an expander in order to access it properly. To achieve this the Secondary Slot Registers are designed to invert their contents when read back. During the power-up RAM search memory location FFFFH of each Primary Slot is examined to determine whether it behaves normally or whether the slot contains an expander. The results of these tests are stored in the Workspace Area system resource map [EXPTBL](#exptbl) for later use. This is done at power-up because of the difficulty in performing tests when the Secondary Slot Registers actually contain live settings.

Memory switching is obviously an area demanding extra caution, particularly with the hierarchical mechanisms needed to control expanders. Care must be taken to avoid switching out the page in which a program is running or, if it is being used, the page containing the stack. There are a number of standard routines available to the machine code programmer in the BIOS section of the MSX ROM to simplify the process.

The BASIC Interpreter itself has four methods of accessing extension ROMs. The first three of these are for use with machine code ROMs placed in page 1 (4000H to 7FFFH), they are:

1. Hooks ([Chapter 6](chapter_6)).
2. The "`CALL`" statement ([Chapter 5](#chapter_5)).
3. Additional device names ([Chapter 5](#chapter_5)).

The BASIC Interpreter can also execute a BASIC program ROM detected in page 2 (8000H to BFFFH) during the power-up ROM search. What the BASIC Interpreter cannot do is use any RAM hidden behind other memory devices. This limitation is a reflection of the difficulty in converting an established program to take advantage of newer, more complex machines. A similar situation exists with the version of Microsoft BASIC available on the IBM PC. Out of a 1 MB memory space only 64 KB can be used for program storage.

## PPI Port B (I/O Port A9H)

|7 + 6 + 5 + 4 + 3 + 2 + 1 + 0|
|:-:|
| Keyboard Column Select |

**Figure 3**

This input port is used to read the eight bits of column data from the currently selected row of the keyboard. The MSX keyboard is a software scanned eleven row by eight column matrix of normally open switches. Current machines usually only have keys in rows zero to eight. Conversion of key depressions into character codes is performed by the MSX ROM interrupt handler, this process is described in [Chapter 4](chapter_4).

## PPI Port C (I/O Port AAH)

|7|6|5|4|3 + 2 + 1 + 0|
|:-:|:-:|:-:|:-:|:-:|
| Key Click | Cap LED | Cas Out | Cas Motor | Keyboard Row Select |

**Figure 4**

This output port controls a variety of functions. The four Keyboard Row Select bits select which of the eleven keyboard rows, numbered from 0 to 10, is to be read in by PPI Port B.

The Cas Motor bit determines the state of the cassette motor relay: 0=On, 1=Off.

The Cas Out bit is filtered and attenuated before being taken to the cassette DIN socket as the MIC signal. All cassette tone generation is performed by software.

The Cap LED bit determines the state of the Caps Lock LED: 0=On, 1=Off.

The Key Click output is attenuated and mixed with the audio output from the Programmable Sound Generator. To actually generate a sound this bit should be flipped on and off.

Note that there are standard routines in the ROM BIOS to access all of the functions available with this port. These should be used in preference to direct manipulation of the hardware if at all possible.

## PPI Mode Port (I/O Port ABH)

|7|6 + 5|4|3|2|1|0|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | A&C Mode | A Dir | C Dir | B&C Mode | B Dir | C Dir |

**Figure 5:** PPI Mode Selection

This port is used to set the operating mode of the PPI. As the MSX hardware is designed to work in one particular configuration only this port should not be modified under any circumstances. Details are given for completeness only.

Bit 7 must be 1 in order to alter the PPI mode, when it is 0 the PPI performs the single bit set/reset function shown in [Figure 6](#figure6).

The A&C Mode bits determine the operating mode of Port A and the upper four bits only of Port C: 00=Normal Mode (MSX), 01=Strobed Mode, 10=Bidirectional Mode

The A Dir mode determines the direction of Port A: 0=Output (MSX), 1=Input.

The C Dir bit determines the direction of the upper four bits only of Port C: 0=Output (MSX), 1=Input.

The B&C Mode bits determine the operating mode of Port B and the lower four bits only of Port C: 0=Normal Mode (MSX), 1=Strobed Mode.

The B Dir bit determines the direction of Port B: 0=Output, 1=Input (MSX).

The C Dir bit determines the direction of the lower four bits only of Port C: 0=Output (MSX), 1=Input

|7|6 + 5 + 4|3 + 2 + 1|0|
|:-:|:-:|:-:|:-:|
| 0 | Not used | Not used  | Set |

**Figure 6:** PPI Bit Set/Reset

The PPI Mode Port can be used to directly set or reset any bit of Port C when bit 7 is 0. The Bit Number, from 0 to 7, determines which bit is to be affected. Its new value is determined by the Set/Reset bit: 0=Reset, 1=Set. The advantage of this mode is that a single output can be easily modified. As an example the Caps Lock LED may be turned on with the BASIC statement `OUT &HAB,12` and off with the statement `OUT &HAB,13`.
