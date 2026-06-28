<a name="contents"></a>
# Contents

[Introduction](#introduction)

1. [Programmable Peripheral Interface](#chapter_1)
    + [PPI Port A (I/O Port A8H)](#ppi_port_a)
    + [Expanders](#expanders)
    + [PPI Port B (I/O Port A9H)](#ppi_port_b)
    + [PPI Port C (I/O Port AAH)](#ppi_port_c)
    + [PPI Mode Port (I/O Port ABH)](#ppi_mode_port)
2. [Video Display Processor](#chapter_2)
    + [Data Port (I/O Port 98H)](#data_port)
    + [Command Port (I/O Port 99H)](#command_port)
    + [Address Register](#address_register)
    + [VDP Status Register](#vdp_status_register)
    + [VDP Mode Registers](#vdp_mode_registers)
    + [Mode Register 0](#mode_register_0)
    + [Mode Register 1](#mode_register_1)
    + [Mode Register 2](#mode_register_2)
    + [Mode Register 3](#mode_register_3)
    + [Mode Register 4](#mode_register_4)
    + [Mode Register 5](#mode_register_5)
    + [Mode Register 6](#mode_register_6)
    + [Mode Register 7](#mode_register_7)
    + [Screen Modes](#screen_modes)
    + [40x24 Text Mode](#40x24_text_mode)
    + [32x24 Text Mode](#32x24_text_mode)
    + [Graphics Mode](#graphics_mode)
    + [Multicolour Mode](#multicolour_mode)
    + [Sprites](#sprites)
3. [Programmable Sound Generator](#chapter_3)
    + [Address Port (I/O port A0H)](#address_port)
    + [Data Write Port (I/O port A1H)](#data_write_port)
    + [Data Read Port (I/O port A2H)](#data_read_port)
    + [Registers 0 and 1](#registers_0_and_1)
    + [Registers 2 and 3](#registers_2_and_3)
    + [Registers 4 and 5](#registers_4_and_5)
    + [Register 6](#register_6)
    + [Register 7](#register_7)
    + [Register 8](#register_8)
    + [Register 9](#register_9)
    + [Register 10](#register_10)
    + [Registers 11 and 12](#registers_11_and_12)
    + [Register 13](#register_13)
    + [Register 14](#register_14)
    + [Register 15](#register_15)
4. [ROM BIOS](#chapter_4)
    + [Data Areas](#data_areas)
    + [Terminology](#terminology)
5. [ROM BASIC Interpreter](#chapter_5)
6. [Memory Map](#chapter_6)
    + [Workspace Area](#workspace_area)
    + [The Hooks](#the_hooks)
7. [Machine Code Programs](#chapter_7)
    + [Keyboard Matrix](#keyboard_matrix)
    + [40 Column Graphics Text](#40_column_graphics_text)
    + [String Bubble Sort](#string_bubble_sort)
    + [Graphics Screen Dump](#graphics_screen_dump)
    + [Character Editor](#character_editor)

Contents Copyright 1985 Avalon Software<br>
Iver Lane, Cowley, Middx, UB8 2JD

MSX is a trademark of Microsoft Corp.<br>
Z80 is a trademark of Zilog Corp.<br>
ACADEMY is trademark of Alfred.

<br><br><br>

<a name="introduction"></a>
# Introduction

## <a name="aims"></a>Aims

This book is about MSX computers and how they work. For technical and commercial reasons MSX computer manufacturers only make a limited amount of information available to the end user about the design of their machines. Usually this will be a fairly detailed description of Microsoft MSX BASIC together with a broad outline of the system hardware. While this level of documentation is adequate for the casual user it will inevitably prove limiting to anyone engaged in more sophisticated programming.

The aim of this book is to provide a description of the standard MSX hardware and software at a level of detail sufficient to satisfy that most demanding of users, the machine code programmer. It is not an introductory course on programming and is necessarily of a rather technical nature. It is assumed that you already possess, or intend to acquire by other means, an understanding of the Z80 Microprocessor at the machine code level. As there are so many general purpose books already in existence about the Z80 any description of its characteristics would simply duplicate widely available information.

<a name="organization"></a>
## Organization

The MSX Standard specifies the following as the major functional components in any MSX computer:

1. Zilog Z80 Microprocessor
2. Intel 8255 Programmable Peripheral Interface
3. Texas 9929 Video Display Processor
4. General Instrument 8910 Programmable Sound Generator
5. 32 KB MSX BASIC ROM
6. 8 KB RAM minimum

Although there are obviously a great many additional components involved in the design of an MSX computer they are all small-scale, non-programmable ones and therefore "invisible" to the user. Manufacturers generally have considerable freedom in the selection of these small-scale components. The programmable components cannot be varied and therefore all MSX machines are identical as far as the programmer is concerned.

[Chapters 1](#chapter_1), [2](#chapter_2) and [3](#chapter_3) describe the operation of the Programmable Peripheral Interface, Video Display Processor and Programmable Sound Generator respectively. These three devices provide the interface between the Z80 and the peripheral hardware on a standard MSX machine. All occupy positions on the Z80 I/O (Input/Output) Bus.

[Chapter 4](#chapter_4) covers the software contained in the first part of the MSX ROM. This section of the ROM is concerned with controlling the machine hardware at the fine detail level and is known as the ROM BIOS (Basic Input Output System). It is structured in such a way that most of the functions a machine code programmer requires, such as keyboard and video drivers, are readily available.

[Chapter 5](#chapter_5) describes the software contained in the remainder of the ROM, the Microsoft MSX BASIC Interpreter. Although this is largely a text-driven program, and consequently of less use to the programmer, a close examination reveals many points not documented by manufacturers.

[Chapter 6](#chapter_6) is concerned with the organization of system memory. Particular attention is paid to the Workspace Area, that section of RAM from F380H to FFFFH, as this is used as a scratchpad by the BIOS and the BASIC Interpreter and contains much information of use to any application program.

[Chapter 7](#chapter_7) gives some examples of machine code programs that make use of ROM features to minimize design effort.

It is believed that this book contains zero defects, if you know otherwise the author would be delighted to hear from you. This book is dedicated to the Walking Nightmare.
