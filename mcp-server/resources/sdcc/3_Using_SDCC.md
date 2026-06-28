# SDCC Compiler User Guide

## Using SDCC

### Standard-Compliance range none pageformat default Standard-compliance

SDCC aims to be a conforming freestanding implementation of the C programming language. The latest publicly available version of the standard *ISO/IEC 9899 - Programming languages - C* should be available at: https://www.open-std.org/jtc1/sc22/wg14/www/projects#9899.

#### ISO C90 and ANSI C89

Use --std-c90 range none pageformat default --std-c90** to compile in this mode.

Deviations from standard compliance

- initialization of structure arrays must be fully braced.
```c
struct s { char x } a[] = {1, 2}; /* invalid in SDCC */
struct s { char x } a[] = {{1}, {2}}; /* OK */
```

- float range none pageformat default Floating point support is substituted for (long) double range none pageformat default double (not supported) and a warning is emitted.
- K&R style range none pageformat default K R style functions are syntactically supported, but with the semantics of ISO style functions.
Features missing in some ports

- pic14, pic16: structures range none pageformat default struct and unions range none pageformat default union cannot be passed as function parameters
- hc08, s08, mos6502, pic14, pic16: they cannot be a return value range none pageformat default return value from a function, e.g.:
```c
struct s {... };
**struct** s foo1 (**struct** s parms) /* unsupported in these SDCC ports */
{
  struct s rets;
  ...
  return rets; /* unsupported in these SDCC ports */
}
```

- mcs51, ds390, hc08, s08, pdk13, pdk14, pdk15 and mos6502 ports: functions are not reentrant unless explicitly declared as such or --** stack-auto** is specified.

#### ISO C94 (aka ISO C95)

Use --std-c94 range none pageformat default --std-c94** or --std-c95 range none pageformat default --std-c95** to compile in this mode.

Implementation status

Except for the issues mentioned in the section above, this standard is supported.

#### ISO C99

Use --std-c99 range none pageformat default --std-c99** to compile in this mode.

Deviations from standard compliance

In addition to what is mentioned in the section above, the following features of this standard are not supported by SDCC:

- Objects of variably-modified types.
- ptrdiff_t has 16 bits, while the standard requires at least 17 bits.
Features missing in some ports

- pic14: there is no support for 64 bit integer types.

#### ISO C11 and ISO C17

Use --std-c11 range none pageformat default --std-c11** to compile in this mode.

Implementation status

Except for the issues mentioned in the section above, this standard is supported. Note: Variably-modified types became optional in this version.

#### ISO C23

Use --std-c23 range none pageformat default --std-c23** to compile in this mode.

Deviations from standard compliance

- initialization of structure arrays must be fully braced.
```c
struct s { char x } a[] = {1, 2}; /* invalid in SDCC */
struct s { char x } a[] = {{1}, {2}}; /* OK */
```

- float range none pageformat default Floating point support is substituted for (long) double range none pageformat default double (not supported) and a warning is emitted.
- Support for attributes is slightly incomplete.
- Checked integer arithmetic is not supported for (unsigned) long long.
- Qualifier-preserving standard library functions are not implemented.
- constexpr is not implemented.
Features missing in some ports

- pic14, pic16: structures range none pageformat default struct and unions range none pageformat default union cannot be passed as function parameters
- hc08, s08, mos6502, pic14, pic16: they cannot be a return value range none pageformat default return value from a function, e.g.:
struct s {... };
**struct** s foo1 (**struct** s parms) /* unsupported in these SDCC ports */
{
struct s rets;
...
return rets; /* unsupported in these SDCC ports */
}

- mcs51, ds390, hc08, s08, pdk13, pdk14, pdk15 and mos6502 ports: functions are not reentrant unless explicitly declared as such or --** stack-auto** is specified.
- pic14: there is no support for 64 bit integer types.
- pic14, pic16: _BitInt is not supported.

#### ISO C2y preview

Use --std-c2y range none pageformat default --std-c2y** to compile in this mode.

Implementation status

In anticipation of the upcoming version of the language standard, C2y, SDCC supports the following prospective features:

- LatexCommand href name "N3260" target "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3260.pdf" literal "false": _Generic selection expression with a type operand
- LatexCommand href name "N3353" target "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3353.htm" literal "false": Obsolete Octal and Provide New, Proper Escape Sequences
- LatexCommand href name "N3356" target "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3356.htm" literal "false": if Declarations
- LatexCommand href name "N3369" target "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3369.pdf" literal "false": The _Lengthof Operator (Note: renamed to _Countof following LatexCommand href name "N3469" target "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3469.htm" literal "false")
- LatexCommand href name "N3370" target "https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3370.htm" literal "false": Case range expressions

#### Embedded C

SDCC supports objects in named address spaces and to some degree pointers to such objects. The support for fixed-point math in SDCC is inconsistent with the standard. Other parts of the standard are not supported.

#### Implementation-defined behavior

##### Translation

- Diagnostics are output to stderr, in the format <filename>:<line-number>:
- Nonempty sequences of white-space are retained in translation phase 3.

##### Environment

- See SDCC source (and your own code if you use a custom crt0 for a target that supports it) for any information on the environment.

##### Identifiers

- See the compiler and assembler source for information on characters that may appear in identifiers and on the number of significant initial characters.

##### Characters

- There are 8 bits in a byte.
- Values of members of the execution character set: TODO.
- Values of members of the execution character set for escape sequences: TODO.
- Value of char with something weird stored in it: TODO.
- unsigned char has the same range, representation and behavior as" plain" char (unless - -fsigned-char **range none pageformat default --fsigned-char** is used).
- See the SDCC source for further information on character sets.

##### Integers

- There are no extended integer types.

##### Floating point

- See the implementation (soft float library) for any information on floating point.

##### Arrays and Pointers

- For the result of converting between pointers and integers see the SDCC source code.
- For the size of the result of subtracting two pointers to elements of the same array see the SDCC source code.

##### Hints

- The extend to which suggestions made by register are effective depends on the target.
- SDCC will inline functions if and only if they are declared using inline and do not have variable arguments.

##### Structures, unions, enumerations and bit-fields

- A plain int bit-field is treated as an unsigned int bit-field.
- There are no allowed bit-field types other than _Bool, int, signed int, unsigned int and the bit-precise integer types.
- Atomic types are not permitted for bit-fields.
- If a bit-fields does not fit into the same byte as the previous bit-fields, it starts on the next byte.
- bit-fields are allocated in the same order as they appear in the source.
- Non-bit-field members of structures are aligned on byte boundaries (i.e. there are no padding bytes).
- For enumerations, the compatible type is the first from the following list that fits the constants: bool, unsigned char, signed char, unsigned int, signed int, unsigned long int, signed long int, unsigned long long int, signed long long int.

##### Qualifiers

- SDCC shall preserve all volatile reads and writes, but does not guarantee them to be atomic (except for atomic types and volatile sig_atomic_t).

##### Preprocessing directives

- See the preprocessor source for information on preprocessing directives.

##### Library functions

- See the respective library headers for the library functions available.
- See assert.h and library source for the format of the diagnostic printed by the assert macro.
- There is no fegetexceptflag function.
- There is no feraiseexcept function.
- There is no setlocale function.
- There is no FLT_EVAL_METHOD macro.
- There is no DEC_EVAL_METHOD macro.
- There are no non-required domain errors for mathematics functions.
- See library source for the values returned by mathematical functions on domain error and pole error (and anything else on mathematical functions and floating type encodings).
- See library headers for the null-pointer constant to which NULL expands.
- See library headers and source for anything else about the library.

##### Architecture

- See the respective library headers for the values or expressions for macros specified in float.h, limits.h, stdint.h.
- Multithreading is not supported.
- The number of bytes in any object is the minimum allowed (except for some padding bits on bit-fields), byte order depends on the target.
- No extended alignments are supported.
- There are no valid alignments other than those returned by _Alignof.
- sizeof always returns the smallest value allowed assuming an 8-bit char. _Alignof always returns 0.

### Compiling

#### Single Source File Projects

For single source file 8051 projects the process is very simple. Compile your programs with the following command **"sdcc sourcefile.c".** This will compile, assemble and link your source file. Output files are as follows:

- sourcefile.asm range none pageformat default- Assembler source range none pageformat default Assembler source file created by the compiler
- sourcefile.lst range none pageformat default- Assembler listing range none pageformat default Assembler listing file created by the Assembler
- sourcefile.rst range none pageformat default- Assembler listing range none pageformat default Assembler listing file updated with linkedit information, created by linkage editor
- sourcefile.sym range none pageformat default- symbol listing range none pageformat default Symbol listing for the sourcefile, created by the assembler
- sourcefile.rel range none pageformat default- Object file range none pageformat default Object file created by the assembler, input to Linkage editor
- sourcefile.map range none pageformat default- The memory map range none pageformat default Memory map for the load module, created by the Linker
- sourcefile.mem range none pageformat default- A file with a summary of the memory usage
- sourcefile.ihx range none pageformat default- The load module in Intel hex format range none pageformat default Intel hex format (you can select the Motorola S19 format range none pageformat default Motorola S19 format with --out-fmt-s19 range none pageformat default --out-fmt-s19. If you need another format you might want to use *objdump* range none pageformat default objdump (tool) or *srecord* range none pageformat default srecord (bin, hex,... tool) hyperlinks needed- see also section Postprocessing the Intel Hex). Both formats are documented in the documentation of srecord range none pageformat default srecord (bin, hex,... tool)
- sourcefile.adb range none pageformat default- An intermediate file containing debug information needed to create the.cdb file (with --debug range none pageformat default --debug)
- sourcefile.cdb range none pageformat default- An optional file (with --debug) containing debug information. The format is documented in cdbfileformat.pdf
- sourcefile.omf range none pageformat default- An optional AOMF or AOMF51 range none pageformat default AOMF, AOMF51 file containing debug information (generated with option --debug). The (Intel) *a* bsolute *o* bject *m* odule *f* ormat is a subformat of the OMF51 format and is commonly used by third party tools (debuggers range none pageformat default Debugger, simulators, emulators).
- sourcefile.dump*range none pageformat default- Dump file to debug the compiler it self (generated with option --dumpall) (see section Intermediate Dump Options and section The anatomy of the compiler" Anatomy of the compiler").

#### Postprocessing the Intel Hex range none pageformat default Intel hex format file

In most cases this won't be needed but the Intel Hex file range none pageformat default which is generated by SDCC might include lines of varying length and the addresses within the file are not guaranteed to be strictly ascending. If your toolchain or a bootloader does not like this you can use the tool packihx range none pageformat default packihx (tool) which is part of the SDCC distribution:

**packihx sourcefile.ihx >sourcefile.hex**

The separately available *srecord* range none pageformat default srecord (bin, hex,... tool) package additionally allows to set undefined locations to a predefined value, to insert checksums range none pageformat default checksum of various flavours (crc, add, xor) and to perform other manipulations (convert, split, crop, offset,...).

**srec_cat sourcefile.ihx -intel-o sourcefile.hex -intel

** An example for a more complex command line the command backfills range none pageformat default backfill unused memory unused memory with 0x12 and the overall 16 bit sum of the complete 64 kByte block is zero. If the program counter on an mcs51 runs wild the backfill pattern 0x12 will be interpreted as an lcall to address 0x1212 (where an emergency routine could sit). could look like:

**srec_cat sourcefile.ihx -intel-fill 0x12 0x0000 0xfffe-little-endian-checksum-negative 0xfffe 0x02 0x02-o sourcefile.hex -intel

** The srecord package is available at http://sourceforge.net/projects/srecord/.

#### Projects with Multiple Source Files

SDCC can compile only ONE file at a time. Let us for example assume that you have a project containing the following files:

foo1.c (contains some functions)
foo2.c (contains some more functions)
foomain.c (contains more functions and the function main)

The first two files will need to be compiled separately with the commands:

**sdcc-c foo1.c**
**sdcc-c foo2.c**

Then compile the source file containing the *main()* function and link range none pageformat default Linker the files together with the following command:

**sdcc foomain.c foo1.rel foo2.rel** range none pageformat default

Note that in this case, the source file being compiled is always linked in first, regardless of its position in the command line. This can be problematic when a custom CRT is supplied as object file. As an alternative to the above, *foomain.c* can be compiled separately, and the resulting object file can then be linked with the other object files using a separate command: **

`sdcc-c foomain.c`  
`sdcc foomain.rel foo1.rel foo2.rel`

** The file containing the *main()* function must be the first file specified in the command line, since the linkage editor processes object files in the order they are presented to it. The linker is invoked from SDCC using a script file with extension.lnk range none pageformat default. You can view this file to troubleshoot linking problems such as those arising from missing libraries.

#### Projects with Additional Libraries range none pageformat default Libraries

Some reusable routines may be compiled into a library, see the documentation for the assembler and linkage editor (which are in <installdir>/share/sdcc/doc) for how to create a *.lib range none pageformat default* library file. Section Using sdar to Create and Manage Libraries below contains a minimal example. Libraries created in this manner can be included in the command line. Make sure you include the -L <library-path> option to tell the linker where to look for these files if they are not in the current directory. Here is an example, assuming you have the source file *foomain.c* and a library *foolib.lib* in the directory *mylib* (if that is not the same as your current project):

**sdcc foomain.c foolib.lib -L mylib

** Note here that *mylib* must be an absolute path name.

The most efficient way to use libraries is to keep separate modules in separate source files. The lib file now should name all the modules.rel range none pageformat default files. For an example see the standard library file *libsdcc.lib* in the directory <installdir>/share/lib/small.

#### Using sdar to Create and Manage Libraries range none pageformat default sdar

Support for sdar format libraries was introduced in SDCC 2.9.0. **

** Both the GNU and BSD ar format variants are supported by sdld linkers. **

** To create a library containing sdas object files, you should use the following sequence: **

**sdar -rc <library name>.lib <list of.rel files>

### Command Line Options range none pageformat default Command Line Options

#### Processor Selection Options range none pageformat default Options processor selection range none pageformat default Processor selection options

**-mmcs51 range none pageformat default -mmcs51** Generate code for the Intel MCS51 range none pageformat default MCS51 family of processors. This is the default processor target.

**-mds390 range none pageformat default -mds390** Generate code for the Dallas DS80C390 range none pageformat default DS80C390 processor.

**-mds400 range none pageformat default -mds400** Generate code for the Dallas DS80C400 range none pageformat default DS80C400 processor.

**-mhc08 range none pageformat default -mhc08** Generate code for the Freescale/Motorola HC08 (aka 68HC08) range none pageformat default HC08 family of processors.

**-ms08 range none pageformat default -ms08** Generate code for the Freescale/Motorola S08 (aka 68HCS08, HCS08, CS08) range none pageformat default S08 family of processors.

**-mz80 range none pageformat default -mz80** Generate code for the Zilog Z80 range none pageformat default Z80 family of processors.

**-mz180 range none pageformat default -mz180** Generate code for the Zilog Z180 range none pageformat default Z180 family of processors.

**-mr2k range none pageformat default -mr2k** Generate code for the Rabbit 2000 / Rabbit 3000 family of processors.

**-mr3ka range none pageformat default -mr3ka** Generate code for the Rabbit 3000A family of processors.

**-msm83 range none pageformat default -msm83** Generate code for the Sharp SM83 range none pageformat default sm83 (GameBoy Z80) processor.

**-mtlcs90 range none pageformat default -mtlcs90** Generate code for the Toshiba TLCS-90 processor.

**-mez80_z80 range none pageformat default -mez80_z80** Generate code for the Zilog eZ80 processor in Z80 mode.

**-mstm8 range none pageformat default -mstm8** Generate code for the STMicroelectronics STM8 family of processors.

**-mpdk13 range none pageformat default -mpdk13** Generate code for Padauk processors with 13 bit wide program memory.

**-mpdk14 range none pageformat default -mpdk14** Generate code for Padauk processors with 14 bit wide program memory.

**-mpdk15 range none pageformat default -mpdk15** Generate code for Padauk processors with 15 bit wide program memory.

**-mpic14 range none pageformat default -mpic14** Generate code for the Microchip PIC 14 range none pageformat default PIC14-bit processors (p16f84 and variants. In development, not complete).

p16f627 p16f628 p16f84 p16f873 p16f877?

**-mpic16 range none pageformat default -mpic16** Generate code for the Microchip PIC 16 range none pageformat default PIC16-bit processors (p18f452 and variants. In development, not complete).

**-mmos6502 range none pageformat default -mmos6502** Generate code for the original MOS Technology NMOS 6502 processor and compatible derivatives including the 6510 and 8502.

**-mmos65c02 range none pageformat default -mmos65c02** Generate code for the CMOS Rockwell/WDC 65C02.

SDCC inspects the program name it was called with so the processor family can also be selected by renaming the sdcc binary (to f.e. z80-sdcc) or by calling SDCC from a suitable link. Option -m has higher priority than setting from program name.

#### Preprocessor Options range none pageformat default Options preprocessor range none pageformat default Preprocessor!Options range none pageformat default sdcpp (preprocessor)

SDCC uses *sdcpp*, an adapted version of the GNU Compiler Collection range none pageformat default gcc (GNU Compiler Collection) preprocessor *cpp* range none pageformat default cpp|see sdcpp (*gcc* http://gcc.gnu.org/). If you need more dedicated options than those listed below please refer to the GCC CPP Manual at http://www.gnu.org/software/gcc/onlinedocs/.

**-I<path> range none pageformat default -I<path>** The additional location where the preprocessor will look for <..h> or“..h” files.

**-D<macro[=value]> range none pageformat default -D<macro[=value]>** Command line definition of macros. Passed to the preprocessor.

**-M range none pageformat default -M** Tell the preprocessor to output a rule suitable for make describing the dependencies of each object file. For each source file, the preprocessor outputs one make-rule whose target is the object file name for that source file and whose dependencies are all the files `#include'd in it. This rule may be a single line or may be continued with `\ '-newline if it is long. The list of rules is printed on standard output instead of the preprocessed C program. `-M' implies `-E range none pageformat default -E '.

**-C range none pageformat default -C** Tell the preprocessor not to discard comments. Used with the `-E' option.

**-MM range none pageformat default -MM** Like `-M' but the output mentions only the user header files included with `#include“ file"'. System header files included with `#include <file>' are omitted.

**-Aquestion(answer) range none pageformat default -Aquestion(answer)** Assert the answer answer for question, in case it is tested with a preprocessor conditional such as `#if #question(answer)'. `-A-' disables the standard assertions that normally describe the target machine.

**-Umacro range none pageformat default -Umacro** Undefine macro macro. `-U' options are evaluated after all `-D' options, but before any `-include' and `-imacros' options.

**-dM range none pageformat default -dM** Tell the preprocessor to output only a list of the macro definitions that are in effect at the end of preprocessing. Used with the `-E' option.

**-dD range none pageformat default -dD** Tell the preprocessor to pass all macro definitions into the output, in their proper sequence in the rest of the output.

**-dN range none pageformat default -dN** Like `-dD' except that the macro arguments and contents are omitted. Only `#define name' is included in the output.

**-Wp preprocessorOption[,preprocessorOption]** range none pageformat default -Wp preprocessorOption[,preprocessorOption]... Pass the preprocessorOption to the preprocessor sdcpp range none pageformat default sdcpp (preprocessor).

#### Optimization Options range none pageformat default Options optimization range none pageformat default Optimization options

**--nogcse range none pageformat default --nogcse** Will not do global common subexpression elimination, this option may be used when the compiler creates undesirably large stack/data spaces to store compiler temporaries (*s* pill *loc* ations, sloc range none pageformat default sloc (spill location)). A warning message will be generated when this happens and the compiler will indicate the number of extra bytes it allocated. It is recommended that this option NOT be used, #pragma nogcse range none pageformat default pragma nogcse can be used to turn off global subexpression elimination range none pageformat default Subexpression elimination for a given function only.

**--noinvariant range none pageformat default --noinvariant** Will not do loop invariant optimizations, this may be turned off for reasons explained for the previous option. For more details of loop optimizations performed see Loop Invariants in section Loop Optimizations. It is recommended that this option NOT be used, #pragma noinvariant range none pageformat default pragma noinvariant can be used to turn off invariant optimizations for a given function only.

**--noinduction range none pageformat default --noinduction** Will not do loop induction optimizations, see section strength reduction for more details. It is recommended that this option is NOT used, #pragma noinduction range none pageformat default pragma noinduction can be used to turn off induction optimizations for a given function only.

**--noloopreverse range none pageformat default --noloopreverse** Will not do loop reversal range none pageformat default Loop reversing optimization.

-- **nolabelopt** range none pageformat default --nolabelopt Will not optimize labels (makes the dumpfiles more readable).

**--no-xinit-opt range none pageformat default --no-xinit-opt** Will not memcpy initialized data from code space into xdata space. This saves a few bytes in code space if you don't have initialized data range none pageformat default Variable initialization.

**--nooverlay range none pageformat default --nooverlay** The compiler will not overlay parameters and local variables of any function, see section Parameters and local variables for more details.

**--no-peep range none pageformat default --no-peep** Disable peep-hole optimization with built-in rules.

**--peep-file** range none pageformat default --peep-file See section Peephole Optimizer Peep Hole optimizations for details on how to write these rules.

**--peep-asm range none pageformat default --peep-asm** Pass the inline assembler code through the peep hole optimizer. This can cause unexpected changes to inline assembler code, please go through the peephole optimizer range none pageformat default Peephole optimizer rules defined in the source file tree '<target>/peeph.def' before using this option.

**--peep-return range none pageformat default --peep-return** Let the peep hole optimizer do return optimizations. This is the default without **--** debug **range none pageformat default --debug**.

**--no-peep-return range none pageformat default --no-peep-return** Do not let the peep hole optimizer do return optimizations. This is the default with **--** debug **range none pageformat default --debug**.

**--opt-code-speed range none pageformat default --opt-code-speed** The compiler will optimize code generation towards fast code, possibly at the expense of code size.

**--opt-code-size range none pageformat default --opt-code-size** The compiler will optimize code generation towards compact code, possibly at the expense of code speed.

-- **fomit-frame-pointer** range none pageformat default --fomit-frame-pointer Frame pointer will be omitted when the function uses no local variables. On the z80-related ports this option will result in the frame pointer always being omitted.

-- **max-allocs-per-node** range none pageformat default --max-allocs-per-node Setting this to a high value will result in increased compilation time (and increased memory use during compilation) and more optimized code being generated. Setting it to lower values speeds up compilation, but does not optimize as much. The default value is 3000. This option currently does not affect the mcs51, ds390, pic14 and pic16 ports.

-- **nolospre** range none pageformat default --nolospre Disable lospre. lospre is an advanced redundancy elimination technique, essentially an improved variant of global subexpression elimination.

-- **allow-unsafe-read** range none pageformat default --allow-unsafe-read Allow optimizations to generate unsafe reads. This will enable additional optimizations, but can result in spurious reads from undefined memory addresses, which can be harmful if the target system uses certain ways of doing memory-mapped I/O.

-- **nostdlibcall** range none pageformat default --nostdlibcall Disable the optimization of calls to the standard library.

#### Other Options range none pageformat default Options other

**-v--version range none pageformat default --version range none pageformat default -v** displays the sdcc version.

**-c--compile-only range none pageformat default --compile-only range none pageformat default -c** will compile and assemble the source, but will not call the linkage editor.

**--c1mode range none pageformat default --c1mode** reads the preprocessed source from standard input and compiles it. The file name for the assembler output must be specified using the -o option.

**-E range none pageformat default -E** Run only the C preprocessor range none pageformat default Preprocessor. Preprocess all the C source files specified and output the results to standard output.

**--syntax-only range none pageformat default --syntax-only** Parse and verify syntax only, no output files are produced.

**-o range none pageformat default -o <path/file>** The output path where everything will be placed or the file name used for all generated output files. If the parameter is a path, it must have a trailing slash (or backslash for the Windows binaries) to be recognized as a path. Note for Windows users: if the path contains spaces, it should be surrounded by quotes. The trailing backslash should be doubled in order to prevent escaping the final quote, for example: *-o" F:\ Projects\ test3\ output 1\\"* or put after the final quote, for example: *-o" F:\ Projects\ test3\ output 1"\*. The path using slashes for directory delimiters can be used too, for example: *-o" F:/Projects/test3/output 1/"*.

**-x range none pageformat default -x <type>** The specified type overrides the file type that SDCC detected based on the file name extension. The currently supported options are" c"," c-header" and" none". The option" none" restores the default behavior.

**--stack-auto range none pageformat default --stack-auto** All functions in the source file will be compiled as *reentrant* range none pageformat default reentrant, i.e. the parameters and local variables will be allocated on the stack range none pageformat default stack. See section Parameters Parameters and Local Variables for more details. If this option is used all source files in the project should be compiled with this option. It automatically implies - -int-long-reent and - -float-reent.

**--callee-saves range none pageformat default --callee-saves function1[,function2][,function3]....** The compiler by default uses a caller saves convention for register saving across function calls, however this can cause unnecessary register pushing and popping when calling small functions from larger functions. This option can be used to switch the register saving convention for the function names specified. The compiler will not save registers when calling these functions, no extra code will be generated at the entry and exit (function prologue **range none pageformat default function prologue** and epilogue **range none pageformat default function epilogue**) for these functions to save and restore the registers used by these functions, this can SUBSTANTIALLY reduce code and improve run time performance of the generated code. In the future the compiler (with inter procedural analysis) will be able to determine the appropriate scheme to use for each function call. DO NOT use this option for built-in functions such as _mulint..., if this option is used for a library function the appropriate library function needs to be recompiled with the same option. If the project consists of multiple source files then all the source file should be compiled with the same --callee-saves option string. Also see #pragma callee_saves range none pageformat default pragma callee saves Pragmas.

**--all-callee-saves range none pageformat default --all-callee-saves** Function of --callee-saves will be applied to all functions by default.

**--debug range none pageformat default --debug** When this option is used the compiler will generate debug information. By default, the debug information collected in a file with.cdb extension can be used with the SDCDB. For more information see documentation for SDCDB. Another file with a.omf extension contains debug information in AOMF or AOMF51 range none pageformat default AOMF, AOMF51 format which is commonly used by third party tools. When --out-gmt-elf is used, the debug information is in DWARF format instead.

**-S range none pageformat default -S** Stop after the stage of compilation proper; do not assemble. The output is an assembler code file for the input file specified.

**--int-long-reent range none pageformat default --int-long-reent** Integer (16 bit) and long (32 bit) libraries have been compiled as reentrant. Note by default these libraries are compiled as non-reentrant. See section Installation for more details.

**--cyclomatic range none pageformat default --cyclomatic** This option will cause the compiler to generate an information message for each function in the source file. The message contains some *important* information about the function. The number of edges and nodes the compiler detected in the control flow graph of the function, and most importantly the *cyclomatic complexity range none pageformat default Cyclomatic complexity* see section on Cyclomatic Complexity for more details.

**--float-reent range none pageformat default --float-reent** Floating point library is compiled as reentrant range none pageformat default reentrant. See section Installation for more details.

**--fsigned-char range none pageformat default --fsigned-char** By default char is unsigned. To set the signedness for characters to signed, use the option - -fsigned-char. If this option is set and no signedness keyword (unsigned/signed) is given, a char will be unsigned. All other types are unaffected.

**--nostdinc range none pageformat default --nostdinc** This will prevent the compiler from passing on the default include path to the preprocessor.

**--nostdlib range none pageformat default --nostdlib** This will prevent the compiler from passing on the default library range none pageformat default Libraries path to the linker.

**--verbose range none pageformat default --verbose** Shows the various actions the compiler is performing.

**-V range none pageformat default -V** Shows the actual commands the compiler is executing.

**--no-c-code-in-asm range none pageformat default --no-c-code-in-asm** Hides your ugly and inefficient c-code from the asm file, so you can always blame the compiler:)

**--no-peep-comments range none pageformat default --no-peep-comments** Don't include peep-hole comments in the generated asm files even if - -fverbose-asm option is specified.

**--i-code-in-asm range none pageformat default --i-code-in-asm** Include i-codes in the asm file. Sounds like noise but is helpful for debugging the compiler itself.

**--less-pedantic range none pageformat default pedantic range none pageformat default --less-pedantic** Disable some of the more pedantic warnings range none pageformat default Warnings. For more details, see the less_pedantic pragma Pragmas.

**--disable-warning range none pageformat default --disable-warning** Disable specific warning with number <nnnn>.

**--Werror range none pageformat default --Werror** Treat all warnings as errors.

**--print-search-dirs range none pageformat default --print-search-dirs** Display the directories in the compiler's search path

**--vc range none pageformat default --vc** Display errors and warnings using MSVC style, so you can use SDCC with the visual studio IDE range none pageformat default IDE. With SDCC both offering a GCC-like (the default) and a MSVC-like range none pageformat default MSVC output style output style, integration into most programming editors should be straightforward.

**--use-stdout range none pageformat default --use-stdout** Send errors and warnings to stdout instead of stderr.

**-Wa asmOption[,asmOption]** range none pageformat default -Wa asmOption[,asmOption]... Pass the asmOption to the assembler range none pageformat default Options assembler range none pageformat default Assembler options. See file sdcc/sdas/doc/asmlnk.txt for assembler options.cd

**--std-<arg>** Determine the language standard. For enhanced compatibility with other compilers, **--std** can also be used with a single dash (i.e. **-std**) and with **=** or  (whitespace) as delimiter. The language standard, specified via , can be one of the following:

**c90 range none pageformat default --std-c89** Follow the ISO/IEC 9899 First Edition standard (ANSI C89 / ISO C90). Alternative spellings: **c89**, **iso9899:1990

**c94 range none pageformat default --std-sdcc99** Follow the ISO/IEC 9899 First Edition standard as modified in amendment 1. Alternative spelling: **c95, iso9899:199409

**c99 range none pageformat default --std-sdcc99** Follow the ISO/IEC 9899 Second Edition standard (ISO C99). Alternative spelling: **iso9899:1999

**c11 range none pageformat default --std-sdcc11** Follow the ISO/IEC 9899 Third Edition standard (ISO C11). Alternative spelling: **iso9899:2011

**c17 range none pageformat default --std-sdcc17** Follow the ISO/IEC 9899 Fourth Edition standard (ISO C17). Alternative spellings: **iso9899:2017**, **c18**, **iso9899:2018

**c23 range none pageformat default --std-sdcc23** Follow the ISO/IEC 9899 Fifth Edition standard (ISO C23). Alternative spelling: **c2x

**c2y range none pageformat default --std-sdcc2y** Enable features anticipated for the Sixth Edition standard (currently abbreviated ISO C2y).

**sdcc90 range none pageformat default --std-sdcc89** Generally follow ANSI C89 / ISO C90, but allow some SDCC behaviour that conflicts with the standard. Alternative spelling: **sdcc89

**sdcc99 range none pageformat default --std-sdcc99** Generally follow ISO C99, but allow some SDCC behaviour that conflicts with the standard.

**sdcc11 range none pageformat default --std-sdcc11** Generally follow ISO C11, but allow some SDCC behaviour that conflicts with the standard (default).

**sdcc17 range none pageformat default --std-sdcc17** Generally follow ISO C17, but allow some SDCC behaviour that conflicts with the standard. Alternative spelling: **sdcc18

**sdcc23 range none pageformat default --std-sdcc23** Generally follow ISO C23, but allow some SDCC behaviour that conflicts with the standard. Alternative spelling: **sdcc2x

**sdcc2y range none pageformat default --std-sdcc2y** Generally follow ISO C2y, but allow some SDCC behaviour that conflicts with the standard.

**--codeseg** range none pageformat default --codeseg <Value> range none pageformat default code segment, default CSEG. This is useful if you need to tell the compiler to put the code in a special segment so you can later on tell the linker to put this segment in a special place in memory. Can be used for instance when using bank switching to put the code in a bank.

**--constseg** range none pageformat default --constseg <Value> range none pageformat default const segment, default CONST. This is useful if you need to tell the compiler to put the const data in a special segment so you can later on tell the linker to put this segment in a special place in memory. Can be used for instance when using bank switching to put the const data in a bank.

**--fdollars-in-identifiers range none pageformat default --fdollars-in-identifiers** Permit '$' as an identifier character.

**--more-pedantic** range none pageformat default --more-pedantic range none pageformat default pedantic Actually this is *not* a SDCC compiler option but if you want *more* warnings you can use a separate tool dedicated to syntax checking like splint range none pageformat default lint (syntax checking tool) http://www.splint.org. To make your source files parseable by splint you will have to include lint.h range none pageformat default splint (syntax checking tool) in your source file and add brackets around extended keywords (like" __at **(** 0xab **)** " and" __interrupt (2)").
Splint has an excellent on line manual at http://www.splint.org/manual/ and it's capabilities go beyond pure syntax checking. You'll need to tell splint the location of SDCC's include files so a typical command line could look like this:
splint-I /usr/local/share/sdcc/include/mcs51/ myprogram.c

**--use-non-free** range none pageformat default --use-non-free Search / include non-free licensed libraries and header files, located under the non-free directory - see section Search Paths

#### Linker Options range none pageformat default Options linker range none pageformat default Linker options

**--lib-path range none pageformat default --lib-path <path>** range none pageformat default Libraries search path. The path name must be absolute. Additional library files may be specified in the command line. See section Compiling programs for more details.

**-L range none pageformat default -L <path>**

**--xram-loc** range none pageformat default --xram-loc <Value> range none pageformat default xdata (mcs51, ds390 named address space), default value is 0. The value entered can be in Hexadecimal or Decimal format, e.g.:--xram-loc 0x8000 or --xram-loc 32768.

**--code-loc** range none pageformat default --code-loc <Value> range none pageformat default code segment, default value 0. Note when this option is used the interrupt vector table range none pageformat default interrupt vector table is also relocated to the given address. The value entered can be in Hexadecimal or Decimal format, e.g.:--code-loc 0x8000 or --code-loc 32768.

**--stack-loc** range none pageformat default --stack-loc <Value> e.g.--stack-loc 0x20 or --stack-loc 32.

For stm8, by default the stack is placed at the device-specific reset value. By using this option, the stack can be placed anywhere in the lower 16-bits of the stm8 memory space. This is particularly useful for working around the stack roll-over antifeature present in some stm8 devices.

**--xstack-loc** range none pageformat default --xstack-loc <Value> range none pageformat default xstack is placed after the __pdata range none pageformat default pdata (mcs51, ds390 named address space) segment. Using this option the xstack can be placed anywhere in the external memory space of the 8051. The value entered can be in Hexadecimal or Decimal format, e.g.--xstack-loc 0x8000 or --xstack-loc 32768. The provided value should not overlap any other memory areas such as the pdata or xdata segment and with enough space for the current application.

**--data-loc** range none pageformat default --data-loc <Value> range none pageformat default data (mcs51, ds390 named address space) segment. The value entered can be in Hexadecimal or Decimal format, eg.--data-loc 0x20 or --data-loc 32. (By default, the start location of the internal ram data segment is set as low as possible in memory, taking into account the used register banks and the bit segment at address 0x20. For example if register banks 0 and 1 are used without bit variables, the data segment will be set, if --data-loc is not used, to location 0x10.)

**--idata-loc** range none pageformat default --idata-loc <Value> range none pageformat default idata (mcs51, ds390 named address space) of the 8051, default value is 0x80. The value entered can be in Hexadecimal or Decimal format, eg.--idata-loc 0x88 or --idata-loc 136.

**--bit-loc** range none pageformat default bit addressable internal ram of the 8051. This is *not* implemented yet. Instead an option can be passed directly to the linker:-Wl-bBSEG=<Value>.

**--out-fmt-ihx range none pageformat default --out-fmt-ihx** The linker output (final object code) is in Intel Hex format. range none pageformat default Intel hex format This is the default option. The format itself is documented in the documentation of srecord range none pageformat default srecord (bin, hex,... tool).

**--out-fmt-s19 range none pageformat default --out-fmt-s19** The linker output (final object code) is in Motorola S19 format range none pageformat default Motorola S19 format. The format itself is documented in the documentation of srecord.

**--out-fmt-elf range none pageformat default --out-fmt-s19 range none pageformat default HC08!Options!--out-fmt-elf** The linker output (final object code) is in ELF format range none pageformat default ELF format. (Currently only supported for the HC08 range none pageformat default HC08, S08 and STM8 processors). When used with --debug, the debug info is in DWARF format instead of CDB.

**-Wl linkOption[,linkOption]** range none pageformat default -Wl linkOption[,linkOption]... Pass the linkOption to the linker. If a bootloader is used an option like"-Wl-bCSEG=0x1000" would be typical to set the start of the code segment. Either use the double quotes around this option or use no space (e.g.-Wl-bCSEG=0x1000). See also #pragma constseg and #pragma codeseg in section Pragmas. File sdcc/sdas/doc/asmlnk.txt has more on linker options.

#### MCS51 Options range none pageformat default Options MCS51 range none pageformat default MCS51 options

**--model-small range none pageformat default --model-small** Generate code for Small model programs, see section Memory Models for more details. This is the default model.

**--model-medium range none pageformat default --model-medium** Generate code for Medium model programs, see section Memory Models for more details. If this option is used all source files in the project have to be compiled with this option. It must also be used when invoking the linker.

**--model-large range none pageformat default --model-large** Generate code for Large model programs, see section Memory Models for more details. If this option is used all source files in the project have to be compiled with this option. It must also be used when invoking the linker.

**--model-huge range none pageformat default --model-huge** Generate code for Huge model programs, see section Memory Models for more details. If this option is used all source files in the project have to be compiled with this option. It must also be used when invoking the linker.

**--xstack range none pageformat default --xstack** Uses a pseudo stack in the __pdata range none pageformat default pdata (mcs51, ds390 named address space) area (usually the first 256 bytes in the external ram) for allocating variables and passing parameters. See section External Stack External Stack for more details.

**--iram-size** range none pageformat default --iram-size <Value> Causes the linker to check if the internal ram usage is within limits of the given value.

**--xram-size** range none pageformat default --xram-size <Value> Causes the linker to check if the external ram usage is within limits of the given value.

**--code-size** range none pageformat default --code-size <Value> Causes the linker to check if the code memory usage is within limits of the given value.

**--stack-size** range none pageformat default --stack-size <Value> Causes the linker to check if there is at minimum <Value> bytes for stack.

**--acall-ajmp** range none pageformat default --acall-ajmp Replaces the three byte instructions lcall/ljmp with the two byte instructions acall/ajmp. Only use this option if your code is in the same 2k block of memory. You may need to use this option for some 8051 derivatives which lack the lcall/ljmp instructions.

**--no-ret-without-call** range none pageformat default --no-ret-without-call Causes the code generator to insert an extra lcall or acall instruction whenever it needs to use a ret instruction in a context other than a function returning. This option is needed when using the Infineon range none pageformat default Infineon XC800 series microcontrollers to keep its Memory Extension Stack balanced.

#### DS390 / DS400 Options range none pageformat default Options DS390 range none pageformat default DS390

**--model-flat24** range none pageformat default DS390!Options!--model-flat24 Generate 24-bit flat mode code. This is the one and only that the ds390 code generator supports right now and is default when using *-mds390*. See section Memory Models for more details.

**--protect-sp-update range none pageformat default DS390!Options!--protect-sp-update** disable interrupts during ESP:SP updates.

**--stack-8-bit - switches off the 10-bit mode

**--stack-10bit** range none pageformat default DS390!Options!--stack-10bit Generate code for the 10 bit stack mode of the Dallas DS80C390 part. This is the one and only that the ds390 code generator supports right now and is default when using *-mds390*. In this mode, the stack is located in the lower 1K of the internal RAM, which is mapped to 0x400000. Note that the support is incomplete, since it still uses a single byte as the stack pointer. This means that only the lower 256 bytes of the potential 1K stack space will actually be used. However, this does allow you to reclaim the precious 256 bytes of low RAM for use for the DATA and IDATA segments. The compiler will not generate any code to put the processor into 10 bit stack mode. It is important to ensure that the processor is in this mode before calling any re-entrant functions compiled with this option. In principle, this should work with the *--stack-auto range none pageformat default --stack-auto* option, but that has not been tested. It is incompatible with the *--xstack range none pageformat default --xstack* option. It also only makes sense if the processor is in 24 bit contiguous addressing mode (see the *--model-flat24 option*). **

**--stack-probe range none pageformat default DS390!Options!--stack-probe** insert call to function __stack_probe at each function prologue.

**--tini-libid range none pageformat default DS390!Options!--tini-libid**

**--use-accelerator range none pageformat default DS390!Options!--use-accelerator** generate code for DS390 Arithmetic Accelerator.

#### Options common to all z80-related ports (z80, z180, r2k, r3ka, sm83, tlcs90, ez80_z80)

**--no-std-crt0** range none pageformat default Z80!Options!--no-std-crt0 When linking, skip the standard crt0.rel object file. You must provide your own crt0.rel for your system when linking.

**--callee-saves-bc** range none pageformat default Z80!Options!--callee-saves-bc Force a called function to always save BC.

**--codeseg** range none pageformat default Z80!Options!--codeseg <Value> Use <Value> for the code segment name.

**--constseg** range none pageformat default Z80!Options!--constseg <Value> Use <Value> for the const segment name.

#### Z80 Options range none pageformat default Options Z80 range none pageformat default Z80 (apply to z80, z180, r2k, r3ka, tlcs90, ez80_z80)

**--portmode=** range none pageformat default Z80!Options!--portmode=<Value> Determinate PORT I/O mode (<Value> is z80 or z180).

**--asm=** range none pageformat default Z80!Options!--asm=<Value> Define assembler name (<Value> is rgbds, sdasz80, isas or z80asm).

**--reserve-regs-iy** range none pageformat default Z80!Options!--reserve-regs-iy This option tells the compiler that it is not allowed to use register pair iy. The option can be useful for systems where iy is reserved for the OS. This option is incompatible with --fomit-frame-pointer.

**--fno-omit-frame-pointer** range none pageformat default Z80!Options!--fno-omit-frame-pointer Never omit the frame pointer.

#### SM83 Options range none pageformat default Options GBZ80 range none pageformat default SM83

**-bo** range none pageformat default GBZ80!Options!-bo <Num> Use code bank <Num>.

**-ba** range none pageformat default GBZ80!Options!-ba <Num> Use data bank <Num>.

#### STM8 Options range none pageformat default Options STM8 range none pageformat default STM8 options

**--model-medium range none pageformat default --model-medium** Generate code for Medium model programs, see section Memory Models for more details. This is the default model.

**--model-large range none pageformat default --model-large** Generate code for Large model programs, see section Memory Models for more details. If this option is used all source files in the project have to be compiled with this option. It must also be used when invoking the linker.

#### MOS6502 Options range none pageformat default Options MOS6502 range none pageformat default MOS6502 options (apply to mos6502, mos65c02)

**--model-small range none pageformat default --model-small** Generate code for small model programs, see section Memory Models for more details.

**--model-large range none pageformat default --model-large** Generate code for large model programs, see section Memory Models for more details. This is the default memory model.

**--no-zp-spill range none pageformat default --no-zp-spill** Force the compiler to spill registers to 16-bit addressable memory (xdata) instead of Page Zero. When running out of Page Zero space, this option will allow to free many Page Zero locations at the expense of slightly larger and slower code

#### Intermediate Dump Options range none pageformat default Options intermediate dump range none pageformat default Intermediate dump options

The following options are provided for the purpose of retargetting and debugging the compiler. They provide a means to dump the intermediate code (iCode range none pageformat default iCode) generated by the compiler in human readable form at various stages of the compilation process. More on iCodes see chapter The anatomy of the compiler" The anatomy of the compiler".

**--dum-ast range none pageformat default --dump-ast** This option will cause the compiler to dump the abstract syntax tree to the econsole.

**--dump-i-code range none pageformat default --dump-i-code** Will dump iCodes at various stages into files named **.

**--dump-graphs range none pageformat default --dump-graphs** Will dump internal representations as graphviz.dot files. Depending on other options, this can include the control-flow graph at lospre, insertion of bank selection instructions or register allocation and the conflict graph and tree-decomposition at register allocation.

**--fverbose-asm range none pageformat default --no-gen-comments** Include code generator and peep-hole comments in the generated asm files.

#### Redirecting output on Windows Shells

By default SDCC writes its error messages to" standard error". To force all messages to" standard output" use **-* ***-** use-stdout range none pageformat default --use-stdout. Additionally, if you happen to have visual studio installed in your Windows machine, you can use it to compile your sources using a custom build and the SDCC - **-vc range none pageformat default --vc option. Something like this should work:

`c:\ sdcc\ bin\ sdcc.exe -* ***-vc -* ***-model-large -c $(InputPath)`

### Environment variables range none pageformat default Environment variables

SDCC recognizes the following environment variables:

**SDCC_LEAVE_SIGNALS range none pageformat default SDCC!Environment variables!SDCC LEAVE SIGNALS** SDCC installs a signal handler range none pageformat default signal handler to be able to delete temporary files after an user break (^C) or an exception. If this environment variable is set, SDCC won't install the signal handler in order to be able to debug SDCC.

**TMP, TEMP, TMPDIR range none pageformat default SDCC!Environment variables!TMP, TEMP, TMPDIR** Path, where temporary files will be created. The order of the variables is the search order. In a standard *nix environment these variables are not set, and there's no need to set them. On Windows it's recommended to set one of them.

**SDCC_HOME range none pageformat default SDCC!Environment variables!SDCC HOME** Path, see section Install paths" Install Paths".

**SDCC_INCLUDE range none pageformat default SDCC!Environment variables!SDCC INCLUDE** Path, see section Search Paths" Search Paths".

**SDCC_LIB range none pageformat default SDCC!Environment variables!SDCC LIB** Path, see section Search Paths" Search Paths"..

There are some more environment variables recognized by SDCC, but these are mainly used for debugging purposes. They can change or disappear very quickly, and won't be documented if you are curious search in SDCC's sources for" getenv" range none pageformat default SDCC!Environment variables!undocumented.

### SDCC Language Extensions

SDCC supports some language extensions useful for embedded systems. These include named address spaces (see also section 5.1 of the Embedded C standard). SDCC supports both intrinsic named address spaces (which ones are supported depends on the target architecture) and non-intrinsic named address spaces (defined by the user using the keyword __addressmod, they are particularly useful with custom bank-switching hardware). Unlike the Embedded C standard, SDCC allows local variables to have an intrinsic named address space even when not explicitly declared as static or extern. Depending on the target architecture, support can be limited to objects in such address spaces and exclude pointer-based access to those.

#### MCS51/DS390 intrinsic named address spaces

SDCC supports the following MCS51-specific intrinsic address spaces:

![MCS51_named.svg](MCS51_named.svg)

##### __data range none pageformat default data (mcs51, ds390 named address space) / __near range none pageformat default near (named address space)

This is the **default** (generic) address space for the Small Memory model. Variables in this address space will be allocated in the directly addressable portion of the internal RAM of a 8051, e.g.:

__data unsigned char test_data;

Writing 0x01 to this variable generates the assembly code:

75*00 01 mov _test_data,#0x01

##### __xdata range none pageformat default xdata (mcs51, ds390 named address space) / __far range none pageformat default far (named address space)

Variables in this address space will be placed in the external RAM. This is the **default** (generic) address space for the Large Memory model, e.g.:

__xdata unsigned char test_xdata;

Writing 0x01 to this variable generates the assembly code:

90s00r00 mov dptr,#_test_xdata
74 01 mov a,#0x01
F0 movx @dptr,a

##### __idata range none pageformat default idata (mcs51, ds390 named address space)

Variables in this address space will be allocated into the indirectly addressable portion of the internal ram of a 8051, e.g.:

`__idata unsigned char test_idata;`

Writing 0x01 to this variable generates the assembly code:

```
78r00 mov r0,#_test_idata
76 01 mov @r0,#0x01
```

Please note, the first 128 byte of idata physically access the same RAM as the data memory. The original 8051 had 128 byte idata memory, nowadays most devices have 256 byte idata memory. The stack range none pageformat default stack is located in idata memory (unless --xstack is specified).

##### __pdata range none pageformat default pdata (mcs51, ds390 named address space)

Paged xdata access is just as straightforward as using the other addressing modes of a 8051. It is typically located at the start of xdata and has a maximum size of 256 bytes. The following example writes 0x01 to the pdata variable. Please note, pdata access physically accesses xdata memory. The high byte of the address is determined by port P2 range none pageformat default P2 (mcs51 sfr) (or in case of some 8051 variants by a separate Special Function Register, see section MCS51 variants). This is the **default** (generic) address space for the Medium Memory model, e.g.:

`__pdata unsigned char test_pdata;`

Writing 0x01 to this variable generates the assembly code:
```
78r00 mov r0,#_test_pdata
74 01 mov a,#0x01
F2 movx @r0,a
```

If the --xstack range none pageformat default --xstack option is used the pdata memory area is followed by the xstack memory area and the sum of their sizes is limited to 256 bytes.

##### __code range none pageformat default code

'Variables' in this address space will be placed in the code memory:

`__code unsigned char test_code;`

Read access to this variable generates the assembly code:
```
90s00r6F mov dptr,#_test_code
E4 clr a
93 movc a,@a+dptr
```

char indexed arrays of characters in code memory can be accessed efficiently:

`__code char test_array[] = {'c','h','e','a','p'};`

Read access to this array using an 8-bit unsigned index generates the assembly code:
```
E5*00 mov a,_index

90s00r41 mov dptr,#_test_array

93 movc a,@a+dptr
```

##### __bit range none pageformat default bit

This is a data-type and an address space. When a variable is declared as a bit, it is allocated into the bit addressable memory of 8051, e.g.:

`__bit test_bit;`

Writing 1 to this variable generates the assembly code:
```
D2*00 setb _test_bit
```

The bit addressable memory consists of 128 bits which are located from 0x20 to 0x2f in data memory.
Apart from this 8051 specific intrinsic named address space most architectures support ANSI-C bit-fields range none pageformat default bit-fields Not really meant as examples, but nevertheless showing what bit-fields are about: device/include/mc68hc908qy.h and support/regression/tests/bitfields.c. In accordance with ISO/IEC 9899 bits and bitfields without an explicit signed modifier are implemented as unsigned.

##### __sfr range none pageformat default sfr / __sfr16 range none pageformat default sfr16 / __sfr32 range none pageformat default sfr32 / __sbit range none pageformat default sbit

Like the __bit keyword, *__sfr / __sfr16 / __sfr32 / __sbit* signify both a data-type and named address space, they are used to describe the *s* pecial *f* unction *r* egisters and special *__bit* variables of a 8051, eg:
```c
__sfr __at range none pageformat default at (0x80) P0; /* special function register P0 at location 0x80 */

/* 16 bit special function register combination for timer 0
with the high byte at location 0x8C and the low byte at location 0x8A */
__sfr16 __at (0x8C8A) TMR0;

__sbit __at range none pageformat default at (0xd7) CY; /* CY (Carry Flag range none pageformat default Flags range none pageformat default Carry flag) */
```

Special function registers which are located on an address dividable by 8 are bit-addressable, an *__sbit* addresses a specific bit within these sfr.
16 Bit and 32 bit special function register combinations which require a certain access order are better not declared using *__sfr16* or *__sfr32.* Although SDCC usually accesses them Least Significant Byte (LSB) first, this is not guaranteed.

Please note, if you use a header file which was written for another compiler then the __sfr / __sfr16 / __sfr32 / __sbit intrinsic named address spaces will most likely be *not* compatible. Specifically the syntax sfr P0 = 0x80; is compiled *without warning* by SDCC to an assignment of 0x80 to a variable called P0. **Nevertheless with the file compiler.h range none pageformat default compiler.h (include file) it is possible to write header files range none pageformat default Header files range none pageformat default Include files which can be shared among different compilers (see section Porting code from or to other compilers).

##### Pointers range none pageformat default Pointer to MCS51/DS390 intrinsic named address spaces

SDCC allows (via language extensions) pointers to explicitly point to any of the named address spaces range none pageformat default Memory model of the 8051. In addition to the explicit pointers, the compiler uses (by default) generic pointers which can be used to point to any of the memory spaces.

Pointer declaration examples:
```c
/* pointer physically in internal ram pointing to object in external ram */
__xdata unsigned char * __data p;

/* pointer physically in external ram pointing to object in internal ram */
__data unsigned char * __xdata p;

/* pointer physically in code rom pointing to data in xdata space */
__xdata unsigned char * __code p;

/* pointer physically in code space pointing to data in code space */
__code unsigned char * __code p;

/* generic pointer physically located in xdata space */
unsigned char * __xdata p;

/* generic pointer physically located in default memory space */
unsigned char * p;

/* the following is a function pointer range none pageformat default function pointer physically located in data space */
char (* __data fp)(void);
```

Well you get the idea.

All unqualified pointers are treated as 3-byte (4-byte for the ds390) *generic* pointers.

The highest order byte of the *generic* pointers contains the data space information. Assembler support routines are called whenever data is stored or retrieved using *generic* pointers. These are useful for developing reusable library range none pageformat default Libraries routines. Explicitly specifying the pointer range none pageformat default Pointer type will generate the most efficient code.

##### Notes on MCS51 memory range none pageformat default MCS51 memory layout

The 8051 family of microcontrollers have a minimum of 128 bytes of internal RAM memory *`__data`* range none pageformat default data (mcs51, ds390 named address space) which is structured as follows:

- Bytes 00-1F - 32 bytes to hold up to 4 banks of the registers R0 to R7,
- Bytes 20-2F - 16 bytes to hold 128 bit range none pageformat default bit variables and,
- Bytes 30-7F - 80 bytes for general purpose use.

Additionally some members of the MCS-51 family may have up to 128 bytes of additional, indirectly addressable, internal RAM memory (*`__idata`* range none pageformat default idata (mcs51, ds390 named address space)). Furthermore, some chips may have some built in external memory (*`__xdata`* range none pageformat default xdata (mcs51, ds390 named address space)) which should not be confused with the internal, directly addressable RAM memory (*`__data`* range none pageformat default data (mcs51, ds390 named address space)). Sometimes this built in *`__xdata`* memory has to be activated before using it (you can probably find this information on the datasheet of the microcontroller your are using, see also section MCS51/DS390 Startup Code Startup-Code).

Normally SDCC will only use the first bank range none pageformat default register bank (mcs51, ds390) of registers (register bank 0), but it is possible to specify that other banks of registers (keyword *`__usingrange none` pageformat default using (mcs51, ds390 register bank)*) should be used for example in interrupt range none pageformat default interrupt range none pageformat default interrupt routines. By default, the compiler will place the stack after the last byte of allocated memory for variables. For example, if the first 2 banks of registers are used, and only four bytes are used for *`__data`*` variables, it will position the base of the internal stack at address 20 (0x14). This implies that as the stack range none pageformat default stack grows, it will use up the remaining register banks, and the 16 bytes used by the 128 bit variables, and 80 bytes for general purpose use. If any bit variables are used, the *`__data`* variables will be placed in unused register banks and after the byte holding the last `__bit` variable. For example, if register banks 0 and 1 are used, and there are 9 bit variables (two bytes used), *`__data`* variables will be placed starting from address 0x10 to 0x20 and continue at address 0x22. You can also use --data-loc range none pageformat default --data-loc <Value> to specify the start address of the *__data* and --iram-size range none pageformat default --iram-size <Value> to specify the size of the total internal RAM (*__idata*).

By default the 8051 linker will place the stack after the last byte of __(i)data variables. Option --stack-loc range none pageformat default --stack-loc <Value> allows you to specify the start of the stack, i.e. you could start it after any data in the general purpose area. If your microcontroller has additional indirectly addressable internal RAM (*idata*) you can place the stack on it. You may also need to use --xdata-loc range none pageformat default --xdata-loc<Value> to set the start address of the external RAM (*xdata*) and --xram-size range none pageformat default --xram-size <Value> to specify its size. Same goes for the code memory, using --code-loc range none pageformat default --code-loc <Value> and --code-size range none pageformat default --code-size <Value>. If in doubt, don't specify any options and see if the resulting memory layout is appropriate, then you can adjust it.

The linker generates two files with memory allocation information. The first, with extension.map range none pageformat default shows all the variables and segments. The second with extension.mem range none pageformat default shows the final memory layout. The linker will complain either if memory segments overlap, there is not enough memory, or there is not enough space for stack. If you get any linking warnings and/or errors related to stack or segments allocation, take a look at either the.map or.mem files to find out what the problem is. The.mem file may even suggest a solution to the problem.

#### Z80/Z180/eZ80 intrinsic named address spaces

##### __sfr range none pageformat default sfr (in/out to 8-bit addresses)

The Z80 range none pageformat default Z80 family has separate address spaces for memory and *i*nput/*o*utput memory. I/O memory range none pageformat default I/O memory (Z80, Z180) range none pageformat default Z80!I/O memory range none pageformat default Z180!I/O memory is accessed with special instructions, e.g.:
```c
__sfr __at(0x78) IoPort; /* define a var in I/O space at 78h called IoPort */
```

Writing 0x01 to this variable generates the assembly code:
```
3E 01 ld a,#0x01
D3 78 out (_IoPort),a
```

##### __banked __sfr range none pageformat default sfr (in/out to 16-bit addresses)

The keyword *`__banked`* is used to support 16 bit addresses in I/O memory e.g.:
```c
__sfr __banked __at range none pageformat default at (0x123) IoPort;
```
Writing 0x01 to this variable generates the assembly code:
```
01 23 01 ld bc,#_IoPort
3E 01 ld a,#0x01
ED 79 out (c),a
```

##### __sfr range none pageformat default sfr (in0/out0 to 8 bit addresses on Z180 range none pageformat default Z180 /HD64180 range none pageformat default HD64180 (see Z180))

The compiler option --portmode range none pageformat default Z180!Options!--portmode =180 (80) and a compiler #pragma portmode range none pageformat default Z180!Pragmas! pragma portmode z180 (z80) is used to turn on (off) the Z180/HD64180 port addressing instructions in0/out0 instead of in/out. If you include the file z180.h this will be set automatically.

#### SM83 intrinsic named address spaces

##### __sfr range none pageformat default sfr

The keyword *`__sfr`* is an alternative way to access memory locations 0xff00 to 0xffff, which are typically used for memory-mapped I/O e.g.:
```c
__sfr __at range none pageformat default at (0xff01) IoPort;
```

#### HC08/S08 intrinsic named address spaces

##### __data range none pageformat default data (hc08 named address space)

Variables in the address space __data resides in the first 256 bytes of memory (the direct page). The HC08 range none pageformat default HC08 is most efficient at accessing variables (especially pointers) stored here.

##### __xdata range none pageformat default xdata (hc08 named address space)

Variables in the address space__xdata can reside anywhere in memory. This is the default (generic address space).

#### PDK14/PDK15 intrinsic named address spaces

##### __sfr range none pageformat default sfr

The Padauk family has separate address spaces for memory and *i* nput/ *o* utput memory. I/O memory is accessed with special instructions, e.g.:
```c
__sfr __at(0x18) gpcc; /* define a var in I/O space at 18h called gpcc */
```

##### __sfr16 range none pageformat default sfr16

The Padauk family has a 16-bit timer accessed with special instructions.

#### MOS6502 intrinsic named address spaces

##### __zp/__data range none pageformat default data (mos6502 named address space) /__near

Variables in the address space __zp reside in the first 256 bytes of memory (the Page Zero). The MOS6502 range none pageformat default MOS6502 is most efficient at accessing variables stored here. Pointers can only be dereferenced directly if they reside in Page Zero. This is the default for the small memory model.

##### __xdata range none pageformat default xdata (mos6502 named address space) /__far

Variables in the address space __xdata can reside anywhere in the 64K memory space. This is the default (for the large memory model).

#### Non-intrinsic named address spaces range none pageformat default Non-intrinsic named address spaces

SDCC supports user-defined non-intrinsic named address spaces. So far SDCC only supports them for bank-switching. You need to have a function that switches to the desired memory bank and declare a corresponding named address space:
```c
void setb0(void); // The function that sets the currently active memory bank to b0
void setb1(void); // The function that sets the currently active memory bank to b1
__addressmod range none pageformat default addressmod setb0 spaceb0; // Declare a named address space called spaceb0 that uses setb0()
__addressmod setb1 spaceb1; // Declare a named address space called spaceb1 that uses setb1()
spaceb0 int x; // An int in address space spaceb0
spaceb1 int *y; // A pointer to an int in address space spaceb1
spaceb0 int *spaceb1 z; // A pointer in address space spaceb1 that points to an int in address space spaceb0
```
Non-intrinsic named address spaces for data in ROM are declared using the const keyword:
```c
void setb0(void); // The function that sets the currently active memory bank to b0
void setb1(void); // The function that sets the currently active memory bank to b1
__addressmod range none pageformat default addressmod setb0 const spaceb0; // Declare a named address space called spaceb0 that uses setb0() and resides in ROM
__addressmod setb1 spaceb1; // Declare a named address space called spaceb1 that uses setb1() and resides in RAM
const spaceb0 int x = 42; // An int in address space spaceb0
spaceb1 int *y; // A pointer to an int in address space spaceb1
const spaceb0 int *spaceb1 z; // A pointer in address space spaceb1 that points to a constant int in address space spaceb0
```

Variables in non-intrinsic named address spaces will be placed in areas of the same name (this can be used for the placement of named address spaces in memory by the linker).

SDCC will automatically insert calls to the corresponding function before accessing the variable. SDCC inserts the minimum possible number calls to the bank selection functions. See Philipp Klaus Krause," Optimal Placement of Bank Selection Instructions in Polynomial Time" for details on how this works.

#### Absolute Addressing range none pageformat default Absolute addressing

Data items can be assigned an absolute address with the *__at range none pageformat default at* keyword (the address needs to be either a parenthesized constant expression or a constant), which can also be used in addition to a named address space, e.g.:
```c
__xdata unsigned int __at (0x7ffe) chksum;
```

In the above example the variable chksum will be located at 0x7ffe and 0x7fff of the external ram. The compiler does *not* reserve any space for variables declared in this way **! (they are implemented with an equate in the assembler). Thus it is left to the programmer to make sure there are no overlaps with other variables that are declared without the absolute address. The assembler listing file (.lst range none pageformat default) and the linker output files (.rst range none pageformat default) and (.map range none pageformat default) are good places to look for such overlaps.

If however you provide an initializer range none pageformat default Variable initialization actual memory allocation will take place and overlaps will be detected by the linker. E.g.:
```c
__code char __at (0x7ff0) Id[5] =" SDCC";
```
In the above example the variable Id will be located from 0x7ff0 to 0x7ff4 in code memory.

In case of memory mapped I/O devices the keyword *volatile* has to be used to tell the compiler that accesses might not be removed:

volatile range none pageformat default volatile __xdata range none pageformat default xdata (mcs51, ds390 named address space) unsigned char __at range none pageformat default at (0x8000) PORTA_8255;

For some architectures (mcs51) array accesses are more efficient if an (xdata/far) array range none pageformat default Aligned array starts at a block (256 byte) boundary range none pageformat default block boundary (section A Step by Step Introduction has an example).
Absolute addresses can be specified for variables in all named address spaces, e.g.:
```c
__bit range none pageformat default bit __at range none pageformat default at (0x02) bvar;
```
The above example will allocate the variable at offset 0x02 in the bit-addressable space. There is no real advantage to assigning absolute addresses to variables in this manner, unless you want strict control over all the variables allocated. One possible use would be to write hardware portable code. For example, if you have a routine that uses one or more of the microcontroller I/O pins, and such pins are different for two different hardwares, you can declare the I/O pins in your routine using:
```c
extern volatile range none pageformat default volatile __bit MOSI; /* master out, slave in */
extern volatile __bit MISO; /* master in, slave out */
extern volatile __bit MCLK; /* master clock */

/* Input and Output of a byte on a 3-wire serial bus.
If needed adapt polarity of clock, polarity of data and bit order
*/
unsigned char spi_io(unsigned char out_byte)
{
  unsigned char i=8;
  do {
    MOSI = out_byte & 0x80;
    out_byte <<= 1;
    MCLK = 1;
    /* __asm nop __endasm; */ /* for slow peripherals */
    if(MISO)
      out_byte += 1;
    MCLK = 0;
  } while(--i);
  return out_byte;
}
```
Then, someplace in the code for the first hardware you would use
```c
__bit __at range none pageformat default at (0x80) MOSI; /* I/O port 0, bit 0 */
__bit __at (0x81) MISO; /* I/O port 0, bit 1 */
__bit __at (0x82) MCLK; /* I/O port 0, bit 2 */
```
Similarly, for the second hardware you would use
```c
__bit __at (0x83) MOSI; /* I/O port 0, bit 3 */
__bit __at (0x91) MISO; /* I/O port 1, bit 1 */
__bit range none pageformat default bit __at (0x92) MCLK; /* I/O port 1, bit 2 */
```
and you can use the same hardware dependent routine without changes, as for example in a library. This is somehow similar to sbit, but only one absolute address has to be specified in the whole project.

#### __sdcc_external_startup range none pageformat default sdcc external startup

When a function unsigned char __sdcc_external_startup(void) is present, it is executed before both the initialization of static and global variables, as well as main. This allows to implement functionality that needs to be done early. For example: disabling a hardware watchdog that would otherwise bite during the time it takes to initialize global variables; setup or calibration of system/peripheral clocks; or, a memory check that needs to be done before any memory (other than the return address for __sdcc_external_startup itself) is in use.

If this routine returns a non-zero value, the static and global variable initialization will be skipped and the function main will be invoked. Otherwise static and global variables will be initialized before the function main is invoked.

For mos6502, z80, z80n, z180, sm83, ez80_z80, tlcs90, r2k, r2ka, r3ka, when using a custom crt0, support depends on the custom crt0.

#### Preserved register specification

SDCC allows to specify preserved registers in function declarations, to enable further optimizations on calls to functions implemented in assembler. Example for the Z80 architecture specifying that a function will preserve register pairs bc and iy:
```c
void f(void) __preserves_regs(b, c, iyl, iyh);
```
#### Binary constants range none pageformat default Binary constants

SDCC supports the use of C23 binary constants, such as 0b01100010 when the compiler is invoked using --std-sdccxx, even when the corresponding --std-cxx, does not. Note: xx is a placeholder for the desired version of the C standard.

#### Returning void

SDCC allows functions to return expressions of type void. This feature is only enabled when the compiler is invoked using --std-sdccxx. Note: xx is a placeholder for the desired version of the C standard.

#### Omitting promotion on arguments of vararg function (does not apply to pdk13, pdk14, pdk15)

Arguments to vararg functions are not promoted when explicitly cast. This feature is only enabled when the compiler is invoked using --std-sdccxx. This breaks compability with the C standards, so linking code compiled with --std-sdccxx with code compiled using --std-cxx can result in failing programs when arguments to vararg functions are explicitly cast. Note: xx is a placeholder for the desired version of the C standard.

### Parameters range none pageformat default Parameters range none pageformat default function parameter and Local Variables range none pageformat default local variables

Automatic (local) variables and parameters to functions are placed on the stack for most targets. For MCS51/DS390/HC08/S08/MOS6502/PDK13/PDK14/PDK15 they can either be placed on the stack or in data-space. The default action of the compiler is to place these variables in the internal RAM (for small model) or external RAM (for medium or large model). This in fact makes them similar to *static range none pageformat default static* so by default functions are non-reentrant range none pageformat default reentrant.

They can be placed on the stack range none pageformat default stack by using the *--stack-auto range none pageformat default --stack-auto* option, by using *#pragma stackauto* range none pageformat default pragma stackauto or by using the *__reentrant range none pageformat default reentrant* keyword in the function declaration, e.g.:
```c
unsigned char foo(char i) __reentrant
{
   ...
}
```
Since stack space on 8051 and MOS6502 is limited, and accessing the stack is slow for the Padauk, the *__reentrant* keyword or the *--stack-auto* option should be used sparingly. Note that the *__reentrant* keyword just means that the parameters & local variables will be allocated to the stack, it *does not* mean that the function is register bank range none pageformat default register bank (mcs51, ds390) independent.

Local variables range none pageformat default local variables can be assigned intrinsic named address spaces and absolute range none pageformat default Absolute addressing addresses, e.g.:
```c
unsigned char foo(__xdata int parm)
{
  __xdata unsigned char i;
  __bit bvar;
  __data unsigned char __at range none pageformat default at (0x31) j;
  ...
}
```
In the above example the parameter range none pageformat default function parameter *parm* and the variable *i* will be allocated in the external ram, *bvar* in bit addressable space and *j* in internal ram. When compiled with *--stack-auto* or when a function is declared as *reentrant* this should only be done for static variables.

It is however allowed to use bit parameters in reentrant functions and also non-static local bit variables are supported. Efficient use is limited to 8 semi-bitregisters in bit space. They are pushed and popped to stack range none pageformat default stack as a single byte just like the normal registers.

### Overlaying range none pageformat default Overlaying

For non-reentrant range none pageformat default reentrant functions SDCC will try to reduce internal ram space usage by overlaying parameters and local variables of a function (if possible). Parameters and local variables range none pageformat default local variables of a function will be allocated to an overlayable segment if the function has *no other function calls and the function is non-reentrant and the memory model range none pageformat default Memory model is small.* If an explicit intrinsic named address space range none pageformat default intrinsic named address space is specified for a local variable, it will NOT be overlaid.

Note that the compiler (not the linkage editor) makes the decision for overlaying the data items. Functions that are called from an interrupt service routine **! should be preceded by a #pragma nooverlay range none pageformat default pragma nooverlay if they are not reentrant.

Also note that the compiler does not do any processing of inline assembler code, so the compiler might incorrectly assign local variables and parameters of a function into the overlay segment if the inline assembler code calls other c-functions that might use the overlay. In that case the #pragma nooverlay should be used.

Parameters and local variables of functions that contain 16 or 32 bit multiplication range none pageformat default Multiplication or division range none pageformat default Division will NOT be overlaid since these are implemented using external functions, e.g.:
```c
#pragma save
#pragma nooverlay range none pageformat default pragma nooverlay
void set_error(unsigned char errcd)
{
  P3 = errcd;
}
#pragma restore

void some_isr () __interrupt range none pageformat default interrupt (2)
{
  ...
  set_error(10);
  ...
}
```
In the above example the parameter *errcd* for the function *set_error* would be assigned to the overlayable segment if the #pragma nooverlay was not present, this could cause unpredictable runtime behaviour when called from an interrupt service routine. The #pragma nooverlay ensures that the parameters and local variables for the function are NOT overlaid.

### Interrupt Service Routines

#### General Information

SDCC allows *i* nterrupt *s* ervice *r* outines to be coded in C, with some extended keywords.
```c
void timer_isr (void) __interrupt (1) __using (1)
{
  ...
}
```
The optional number following the *__interrupt range none pageformat default interrupt range none pageformat default interrupt* keyword is the interrupt number this routine will service. When present, the compiler will insert a call to this routine in the interrupt vector table range none pageformat default interrupt vector table for the interrupt number specified. If you have multiple source files in your project, interrupt service routines can be present in any of them, but a prototype of the isr MUST be present or included in the file that contains the function *main*. The optional (8051 specific) keyword *__using range none pageformat default using (mcs51, ds390 register bank)* can be used to tell the compiler to use the specified register bank when generating code for this function.
Interrupt service routines open the door for some very interesting bugs:

##### Common interrupt pitfall: variable not declared *volatile

If an interrupt service routine changes variables which are accessed by other functions these variables have to be declared *volatile* range none pageformat default volatile. See http://en.wikipedia.org/wiki/Volatile_variable.

##### Common interrupt pitfall: *non-atomic access

If the access to these variables is not *atomic range none pageformat default atomic* (i.e. the processor needs more than one instruction for the access and could be interrupted while accessing the variable) the interrupt must be disabled during the access to avoid inconsistent data.
Access to 16 or 32 bit variables is obviously not atomic on 8 bit CPUs and should be protected by disabling interrupts. You're not automatically on the safe side if you use 8 bit variables though. We need an example here: f.e. on the 8051 the harmless looking" flags |= 0x80;" is not atomic if flags resides in xdata. Setting" flags |= 0x40;" from within an interrupt routine might get lost if the interrupt occurs at the wrong time." counter += 8;" is not atomic on the 8051 even if counter is located in data memory.
Bugs like these are hard to reproduce and can cause a lot of trouble.

##### Common interrupt pitfall: *stack overflow

The return address and the registers used in the interrupt service routine are saved on the stack range none pageformat default stack so there must be sufficient stack space. If there isn't variables or registers (or even the return address itself) will be corrupted. This *stack overflow* range none pageformat default stack overflow is most likely to happen if the interrupt occurs during the" deepest" subroutine when the stack is already in use for f.e. many return addresses.

##### Common interrupt pitfall: *use of non-reentrant functions

A special note here, integer multiplicative operators and floating-point range none pageformat default Floating point support operations might be implemented using external support routines, depending on the target architecture. If an interrupt service routine needs to do any of these operations on a target where functions are non-reentrant by default, then the support routines (as mentioned in a following section) will have to be recompiled using the *--stack-auto range none pageformat default --stack-auto* option and the source file will need to be compiled using the *--int-long-reent* range none pageformat default --int-long-reent compiler option.
Note, the type promotion range none pageformat default type promotion required by ANSI C can cause 16 bit routines to be used **! without the programmer being aware of it. See f.e. the cast **(unsigned char)(tail-1)within the if clause in section A Step by Step Introduction.

Calling other functions from an interrupt service routine on a target where functions are non-reentrant by default is not recommended, avoid it if possible. Note that when some function is called from an interrupt service routine it should be preceded by a #pragma nooverlay range none pageformat default pragma nooverlay if it is not reentrant. Furthermore non-reentrant functions should not be called from the main program while the interrupt service routine might be active. They also must not be called from low priority interrupt service routines while a high priority interrupt service routine might be active. You could use semaphores or make the function *critical* if all parameters are passed in registers.
Also see section Overlaying about Overlaying and section Functions using private register banks about Functions using private register banks.

#### MCS51/DS390 Interrupt Service Routines

Interrupt range none pageformat default interrupt numbers and the corresponding address & descriptions for the Standard 8051/8052 are listed below. SDCC will automatically adjust the range none pageformat default interrupt vector table to the maximum interrupt number specified.

| Interrupt # | Description | Vector Address |
| --- | --- | --- |
| 0 | External 0 | 0x0003 |
| 1 | Timer 0 | 0x000b |
| 2 | External 1 | 0x0013 |
| 3 | Timer 1 | 0x001b |
| 4 | Serial | 0x0023 |
| 5 | Timer 2 (8052) | 0x002b |
|... | |... |
| n | | 0x0003 + 8*n |
| n | | 0x0003 + 8*n |

If the interrupt service routine is defined without *__using range none pageformat default using (mcs51, ds390 register bank) range none pageformat default using (mcs51, ds390 register bank)* a register bank or with register bank 0 (*__using* (0)), the compiler will save the registers used by itself on the stack upon entry and restore them at exit, however if such an interrupt service routine calls another function then the entire register bank will be saved on the stack. This scheme may be advantageous for small interrupt service routines which have low register usage.

If the interrupt service routine is defined to be using a specific register bank then only *a, b, dptr* & psw are saved and restored, if such an interrupt service routine calls another function (using another register bank) then the entire register bank of the called function will be saved on the stack range none pageformat default stack. This scheme is recommended for larger interrupt service routines.

#### HC08 range none pageformat default HC08 Interrupt Service Routines

Since the number of interrupts range none pageformat default HC08!interrupt available is chip specific and the interrupt vector table always ends at the last byte of memory, the interrupt numbers corresponds to the interrupt vectors in reverse order of address. For example, interrupt 1 will use the interrupt vector at 0xfffc, interrupt 2 will use the interrupt vector at 0xfffa, and so on. However, interrupt 0 (the reset vector at 0xfffe) is not redefinable in this way; instead see section MCS51/DS390 Startup Code for details on customizing startup.

#### Z80, Z180 and eZ80 Interrupt Service Routines

The Z80 range none pageformat default Z80 uses several different methods for determining the correct interrupt range none pageformat default Z80!interrupt vector depending on the hardware implementation. Therefore, SDCC does not attempt to generate an interrupt vector table.

By default, SDCC generates code for a maskable interrupt, which uses a RETI instruction to return from the interrupt. To write an interrupt handler for the non-maskable interrupt, which needs a RETN instruction instead, leave out the interrupt number:
```c
void nmi_isr (void) __critical __interrupt
{
  ...
}
```
Since interrupts on the Z80 and Z180 are level-triggered (except for the NMI), interruptible interrupt handlers should only be used where hardware acknowledge is available.

| Type | Syntax | Behaviour |
| --- | --- | --- |
| Interruptible interrupt handler | void f(void) __interrupt | Interrupt handler can be interrupted by further interrupts |
| Non-interruptible interrupt handler | void f(void) __critical __interrupt(0) | Interrupt handler can be interrupted by NMI only |
| NMI handler | void f(void) __critical __interrupt | Interrupt handler can be interrupted by NMI only |
| NMI handler | void f(void) __critical __interrupt | Interrupt handler can be interrupted by NMI only |

#### Rabbit 2000, 3000 and 3000A Interrupt Service Routines

SDCC does not attempt to generate an interrupt vector table.

| Type | Syntax | Behaviour |
| --- | --- | --- |
| Interruptible interrupt handler | void f(void) __interrupt | Interrupt handler can be interrupted by further interrupts of same priority |
| Non-interruptible interrupt handler | void f(void) __critical __interrupt(0) | Interrupt handler can be interrupted by interrupts of higher priority only |
| Non-interruptible interrupt handler | void f(void) __critical __interrupt(0) | Interrupt handler can be interrupted by interrupts of higher priority only |

#### SM83 and TLCS-90 Interrupt Service Routines

SDCC does not attempt to generate an interrupt vector table.

| Type | Syntax | Behaviour |
| --- | --- | --- |
| Interruptible interrupt handler | void f(void) __interrupt | Interrupt handler can be interrupted by further interrupts |
| Non-interruptible interrupt handler | void f(void) __critical __interrupt(0) | Interrupt handler cannot be interrupted by further interrupts |
| Non-interruptible interrupt handler | void f(void) __critical __interrupt(0) | Interrupt handler cannot be interrupted by further interrupts |

#### STM8 Interrupt Service Routines

The STM8 interrupt table contains 31 entries: Reset (used by SDCC for program startup), trap and user interrupts 0 to 29. Where the keyword *__interrupt range none pageformat default interrupt* is used for normal user interrupts, the *__trap* keyword is used for the trap handler:
```c
void handler (void) __trap
{
  ...
}
```
### Enabling and Disabling Interrupts

#### Critical Functions and Critical Statements

A special keyword may be associated with a block or a function declaring it as *__critical*. SDCC will generate code to disable all interrupts range none pageformat default interrupt upon entry to a critical function and restore the interrupt enable to the previous state before returning (for architectures where there is no efficient way to do so (sm83, tlcs90, stm8), interrupts will be unconditionally enabled instead). Nesting critical functions will need one additional byte on the stack range none pageformat default stack for each call.
```c
int foo () __critical range none pageformat default critical range none pageformat default critical
{
  ...
  ...
}
```
The critical attribute maybe used with other attributes like *reentrant.*
The keyword *__critical* may also be used to disable interrupts more locally:

`__critical{ i++; }`

More than one statement could have been included in the block.

#### Enabling and Disabling Interrupts directly

Interrupts range none pageformat default interrupt can also be disabled and enabled directly (8051):
```
EA = 0; or: EA_SAVE = EA;

... EA = 0;

EA = 1;...

EA = EA_SAVE;
```
On other architectures which have separate opcodes for enabling and disabling interrupts you might want to make use of defines with inline assembly range none pageformat default Assembler routines (HC08 range none pageformat default HC08!interrupt):

#define CLI __asm range none pageformat default asm cli __endasm range none pageformat default endasm;
```c
#define SEI __asm sei __endasm;
```
or for SDCC version 3.2.0 or newer:
```c
#define CLI __asm__ (" cli");

#define SEI __asm__ (" sei");
```
Note: it is sometimes sufficient to disable only a specific interrupt source like f.e. a timer or serial interrupt by manipulating an *interrupt mask range none pageformat default interrupt mask* register.

Usually the time during which interrupts are disabled should be kept as short as possible. This minimizes both *interrupt latency* range none pageformat default interrupt latency (the time between the occurrence of the interrupt and the execution of the first code in the interrupt routine) and *interrupt jitter* range none pageformat default interrupt jitter (the difference between the shortest and the longest interrupt latency). These really are something different, f.e. a serial interrupt has to be served before its buffer overruns so it cares for the maximum interrupt latency, whereas it does not care about jitter. On a loudspeaker driven via a digital to analog converter which is fed by an interrupt a latency of a few milliseconds might be tolerable, whereas a much smaller jitter will be very audible.

You can re-enable interrupts within an interrupt routine and on some architectures you can make use of two (or more) levels of *interrupt priorities* range none pageformat default interrupt priority. On some architectures which don't support interrupt priorities these can be implemented by manipulating the interrupt mask and re-enabling interrupts within the interrupt routine. Check there is sufficient space on the stack range none pageformat default stack and don't add complexity unless you have to.

#### Semaphore range none pageformat default semaphore locking (mcs51/ds390)

Some architectures (mcs51/ds390) have an atomic range none pageformat default atomic bit test and clear instruction. These type of instructions are typically used in preemptive multitasking systems, where a routine f.e. claims the use of a data structure ('acquires a lock range none pageformat default lock on it'), makes some modifications and then releases the lock when the data structure is consistent again. The instruction may also be used if interrupt and non-interrupt code have to compete for a resource. With the atomic bit test and clear instruction interrupts range none pageformat default interrupt don't have to be disabled for the locking operation.

SDCC generates this instruction if the source follows this pattern:
```c
volatile range none pageformat default volatile bit resource_is_free;

if (resource_is_free)
{
  resource_is_free=0;
  ...
  resource_is_free=1;
}
```
Note, mcs51 and ds390 support only an atomic range none pageformat default atomic bit test and *clear* instruction (as opposed to atomic bit test and *set).

### Functions using private register banks (mcs51/ds390)

Some architectures have support for quickly changing register sets. SDCC supports this feature with the *__using range none pageformat default using (mcs51, ds390 register bank) range none pageformat default using (mcs51, ds390 register bank)* attribute (which tells the compiler to use a register bank range none pageformat default register bank (mcs51, ds390) other than the default bank zero). It should only be applied to *interrupt range none pageformat default interrupt* functions (see footnote below). This will in most circumstances make the generated ISR code more efficient since it will not have to save registers on the stack.

The *__using* attribute will have no effect on the generated code for a *non-interrupt* function (but may occasionally be useful anyway possible exception: if a function is called ONLY from 'interrupt' functions using a particular bank, it can be declared with the same 'using' attribute as the calling 'interrupt' functions. For instance, if you have several ISRs using bank one, and all of them call memcpy(), it might make sense to create a specialized version of memcpy() 'using 1', since this would prevent the ISR from having to save bank zero to the stack on entry and switch to bank zero before calling the function).
*(pending: Note, nowadays the* __using *attribute has an effect onthe generated code for a* non-interrupt *function*. *)

An *interrupt* function using a non-zero bank will assume that it can trash that register bank, and will not save it. Since high-priority interrupts range none pageformat default interrupts range none pageformat default interrupt priority can interrupt low-priority ones on the 8051 and friends, this means that if a high-priority ISR *using* a particular bank occurs while processing a low-priority ISR *using* the same bank, terrible and bad things can happen. To prevent this, no single register bank should be *used* by both a high priority and a low priority ISR. This is probably most easily done by having all high priority ISRs use one bank and all low priority ISRs use another. If you have an ISR which can change priority at runtime, you're on your own: I suggest using the default bank zero and taking the small performance hit.

It is most efficient if your ISR calls no other functions. If your ISR must call other functions, it is most efficient if those functions use the same bank as the ISR (see note 1 below); the next best is if the called functions use bank zero. It is very inefficient to call a function using a different, non-zero bank from an ISR.

### Inline Assembler Code range none pageformat default Assembler routines

#### Inline Assembler Code Formats

SDCC supports two formats for inline assembler code definition:

##### Old __asm... __endasm; Format

Most of inline assembler code examples in this manual use the old inline assembler code format, but the new format could be used equivalently.

Example:
```c
__asm
  ; This is a comment
  label:
    nop
__endasm;
```
Note: As of SDCC 4.2.9, assembler comments occurring in this type of inline assembler block are affected by macro expansion.

##### New __asm__ (" inline_assembler_code") Format

The __asm__ inline assembler code format was introduced in SDCC version 3.2.0. Its main advantage is that it is compatible with all standard compliant C preprocessors.

Example:
```c
__asm__ ("; This is a comment\nlabel:\n\tnop");
```
Or for better readability:
```c
__asm__ (
  "; This is a comment\n"
  "label:\n"
  "\tnop"
);
```

#### A Step by Step Introduction

Starting from a small snippet of c-code this example shows for the MCS51 how to use inline assembly, access variables, a function parameter and an array in xdata memory. The example uses an MCS51 here but is easily adapted for other architectures. This is a buffer routine which should be optimized:

unsigned char __far range none pageformat default far (named address space) __at range none pageformat default at (0x7f00) buf[0x100]; range none pageformat default Aligned array
unsigned char head, tail; /* if interrupts range none pageformat default interrupt are involved see
section  about **volatile*/
```c
void to_buffer(unsigned char c)
{
  if(head!= (unsigned char)(tail-1)) /* cast **needed** to avoid promotion range none pageformat default promotion to signed int range none pageformat default type promotion to integer */ **!
  buf[head++] = c; /* access to a 256 byte aligned array */
}
```

If the code snippet (assume it is saved in buffer.c) is compiled with SDCC then a corresponding buffer.asm file is generated. We define a new function to_buffer_asm() in file buffer.c in which we cut and paste the generated code, removing unwanted comments and some ':'. Then add" **__asm** " and" **__endasm;** " Note, that the single underscore form (_asm and _endasm) are not C99 compatible, and for C99 compatibility, the double-underscore form (__asm and __endasm) has to be used. The latter is also used in the library functions. to the beginning and the end of the function body:
```c
/* With a cut and paste from the.asm file, we have something to start with.
The function is not yet OK! (registers aren't saved) */
void to_buffer_asm(unsigned char c)
{
  __asm range none pageformat default asm
    mov r2,dpl
    ;buffer.c if(head!= (unsigned char)(tail-1)) /* cast **needed** to avoid promotion range none pageformat default promotion to signed int range none pageformat default type promotion to integer */
    mov a,_tail
    dec a
    mov r3,a
    mov a,_head
    cjne a,ar3,00106$
    ret
  00106$:
    ;buffer.c buf[head++] = c; /* access to a 256 byte aligned array */ range none pageformat default Aligned array
    mov r3,_head
    inc _head
    mov dpl,r3
    mov dph,#(_buf >> 8)
    mov a,r2
    movx @dptr,a
  00103$:
    ret
  __endasm range none pageformat default endasm;
}
```
The new file buffer.c should compile with only one warning about the unreferenced function argument 'c'. Now we hand-optimize the assembly code and insert an #define USE_ASSEMBLY (1) and finally have:
```c
unsigned char __far __at(0x7f00) buf[0x100];
unsigned char head, tail;
#define USE_ASSEMBLY (1)

#if!USE_ASSEMBLY

void to_buffer(unsigned char c)
{
  if(head!= (unsigned char)(tail-1))
  buf[head++] = c;
}

#else

void to_buffer(unsigned char c)
{
  c; // to avoid warning: unreferenced function argument
  __asm range none pageformat default asm
    ; save used registers here.
    ; If we were still using r2,r3 we would have to push them here.
    ; if(head!= (unsigned char)(tail-1))
    mov a,_tail
    dec a
    xrl a,_head
    ; we could do an ANL a,#0x0f here to use a smaller buffer (see below)
    jz t_b_end$
    ;
    ; buf[head++] = c;
    mov a,dpl; dpl holds lower byte of function argument
    mov dpl,_head; buf is 0x100 byte aligned so head can be used directly
    mov dph,#(_buf>>8)
    movx @dptr,a
    inc _head
    ; we could do an ANL _head,#0x0f here to use a smaller buffer (see above)
  t_b_end$:
    ; restore used registers here
__endasm range none pageformat default endasm;
}
#endif
```

The inline assembler code can contain any valid code understood by the assembler, this includes any assembler directives and comment lines. The assembler does not like some characters like ':' or ''' in comments. You'll find an 100+ pages assembler manual in sdcc/sdas/doc/asmlnk.txt range none pageformat default sdas (sdasgb, sdas6808, sdas8051, sdasz80) range none pageformat default Assembler documentation or online at http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/sdas/doc/asmlnk.txt.

The compiler does not do any validation of the code within the __asm range none pageformat default asm... __endasm range none pageformat default endasm; keyword pair. Specifically it will not know which registers are used and thus register pushing/popping range none pageformat default push/pop has to be done manually.

It is required that each assembly instruction be placed on a separate line. This is also recommended for labels (as the example shows). This is especially important to note when the inline assembler is placed in a C preprocessor macro as the preprocessor will normally put all replacing code on a single line. Only when the macro has each assembly instruction on a single line that ends with a line continuation character will it be placed as separate lines in the resulting.asm file.
```c
#define DELAY\
  __asm\
    nop\
    nop\
  __endasm
```
When the -- *peep-asm range none pageformat default --peep-asm* command line option is used, the inline assembler code will be passed through the peephole optimizer range none pageformat default Peephole optimizer. There are only a few (if any) cases where this option makes sense, it might cause some unexpected changes in the inline assembler code. Please go through the peephole optimizer rules defined in file *peeph.def* before using this option.

#### Naked Functions range none pageformat default Naked functions

A special keyword may be associated with a function declaring it as *__naked range none pageformat default naked range none pageformat default naked.* The *_naked* function modifier attribute prevents the compiler from generating prologue range none pageformat default function prologue and epilogue range none pageformat default function epilogue code for that function. This means that the user is entirely responsible for such things as saving any registers that may need to be preserved, selecting the proper register bank, generating the *return* instruction at the end, etc. Practically, this means that the contents of the function must be written in inline assembler. This is particularly useful for interrupt functions, which can have a large (and often unnecessary) prologue/epilogue. For example, compare the code generated by these two functions:
```c
volatile range none pageformat default volatile __data unsigned char counter;

void simpleInterrupt(void) __interrupt range none pageformat default interrupt range none pageformat default interrupt (1)
{
  counter++;
}

void nakedInterrupt(void) __interrupt (2) __naked
{
  __asm range none pageformat default asm
    inc _counter; does not change flags, no need to save psw
    reti; MUST explicitly include ret or reti in _naked function.
  __endasm range none pageformat default endasm;
}
```
For an 8051 target, the generated simpleInterrupt looks like:

Note, this is an *outdated* example, recent versions of SDCC generate
the *same* code for simpleInterrupt() and nakedInterrupt()!
```asm
  _simpleInterrupt:
    push acc
    push b
    push dpl
    push dph
    push psw
    mov psw,#0x00
    inc _counter
    pop psw
    pop dph
    pop dpl
    pop b
    pop acc
    reti
```
whereas nakedInterrupt looks like:
```asm
  _nakedInterrupt:
    inc _counter; does not change flags, no need to save psw
    reti; MUST explicitly include ret or reti in _naked function
```
The related directive #pragma exclude range none pageformat default pragma exclude allows a more fine grained control over pushing & popping range none pageformat default push/pop the registers.

While there is nothing preventing you from writing C code inside a _naked function, there are many ways to shoot yourself in the foot doing this, and it is recommended that you stick to inline assembler.

#### Use of Labels within Inline Assembler

SDCC allows the use of in-line assembler with a few restrictions regarding labels. All labels defined within inline assembler code have to be of the form *nnnnn$* where nnnnn is a number less than 100 (which implies a limit of utmost 100 inline assembler labels *per function*). This is a slightly more stringent rule than absolutely necessary, but stays always on the safe side. Labels in the form of nnnnn$ are local labels in the assembler, locality of which is confined within two labels of the standard form. The compiler uses the same form for labels within a function (but starting from nnnnn=00100); and places always a standard label at the beginning of a function, thus limiting the locality of labels within the scope of the function. So, if the inline assembler part would be embedded into C-code, an improperly placed non-local label in the assembler would break up the reference space for labels created by the compiler for the C-code, leading to an assembling error. The numeric part of local labels does not need to have 5 digits (although this is the form of labels output by the compiler), any valid integer will do. Please refer to the assemblers documentation for further details.
```c
__asm range none pageformat default asm
    mov b,#10
  00001$:
    djnz b,00001$
__endasm range none pageformat default endasm;
```
Inline assembler code cannot reference any C-labels, however it can reference labels range none pageformat default Labels defined by the inline assembler, e.g.:
```c
foo() {
/* some c code */
  __asm
      ; some assembler code
      ljmp 0003$
  __endasm;
  /* some more c code */
  clabel: /* inline assembler cannot reference this label */ Here, the C-label clabel is translated by the compiler into a local label, so the locality of labels within the function is not broken.
  __asm
    0003$:;label (can be referenced by inline assembler only)
  __endasm range none pageformat default endasm;
  /* some more c code */
}
```
In other words inline assembly code can access labels defined in inline assembly within the scope of the function. The same goes the other way, i.e. labels defines in inline assembly can not be accessed by C statements.

### Support routines for integer multiplicative operators

Depending on the target architecture, some integer multiplicative operators might be implemented by support routines. These support routines exist in portable C versions to facilitate porting to other MCUs, although depending on the target, assembler routines might be used instead. The following files contain some of the described routines, all of them can be found in <installdir>/share/sdcc/lib.

| Function | Description |
| --- | --- |
| _mulint.c | 16 bit multiplication |
| _divsint.c | signed 16 bit division (calls _divuint) |
| _divuint.c | unsigned 16 bit division |
| _modsint.c | signed 16 bit modulus (calls _moduint) |
| _moduint.c | unsigned 16 bit modulus |
| _mullong.c | 32 bit multiplication |
| _divslong.c | signed 32 division (calls _divulong) |
| _divulong.c | unsigned 32 division |
| _modslong.c | signed 32 bit modulus (calls _modulong) |
| _modulong.c | unsigned 32 bit modulus |
| _modulong.c | unsigned 32 bit modulus |

In the mcs51, ds390, hc08, s08, pdk13, pdk14, pdk15, pic14 and pic16 backends they are by default compiled as *non-reentrant* range none pageformat default reentrant; when targeting on of these architectures, interrupt range none pageformat default interrupt service routines should not do any of the above operations. If this is unavoidable then the above routines will need to be compiled with the *--stack-auto range none pageformat default --stack-auto* option, after which the source program will have to be compiled with *--int-long-reent range none pageformat default --int-long-reent* option. Notice that you don't have to call these routines directly. The compiler will use them automatically every time an integer operation is required.

### Floating Point Support range none pageformat default Floating point support

SDCC supports (single precision 4 bytes) floating point numbers; the format is somewhat similar to IEEE, but it is not IEEE; in particular, denormalized floating -point numbers are not supported. The floating point support routines are derived from gcc's floatlib.c and consist of the following routines:

| Function | Description |
| --- | --- |
| _fsadd.c | add floating point numbers |
| _fssub.c | subtract floating point numbers |
| _fsdiv.c | divide floating point numbers |
| _fsmul.c | multiply floating point numbers |
| _fs2uchar.c | convert floating point to unsigned char |
| _fs2schar.c | convert floating point to signed char |
| _fs2uint.c | convert floating point to unsigned int |
| _fs2sint.c | convert floating point to signed int |
| _fs2ulong. c | convert floating point to unsigned long |
| _fs2slong.c | convert floating point to signed long |
| _uchar2fs.c | convert unsigned char to floating point |
| _schar2fs.c | convert signed char to floating point |
| _uint2fs.c | convert unsigned int to floating point |
| _sint2fs.c | convert signed int to floating point |
| _ulong2fs.c | convert unsigned long to floating point |
| _slong2fs.c | convert signed long to floating point |
| _ulonglong2fs.c | convert unsigned long long to floating point |
| _slonglong2fs.c | convert singed long long to floating point |
| _slonglong2fs.c | convert singed long long to floating point |

### Library Routines range none pageformat default Libraries

*this is messy and incomplete - a little more information is at* http://sdcc.sourceforge.net/wiki/index.php/List_of_the_SDCC_library >

#### Compiler support routines (_gptrget, _mulint etc.)

#### Stdclib functions (puts, printf, strcat etc.)

#####

`getchar()`, `putchar()`

range none pageformat default As usual on embedded systems you have to provide your own getchar() range none pageformat default getchar() and putchar() range none pageformat default putchar() range none pageformat default printf()!putchar() routines. SDCC does not know whether the system connects to a serial line with or without handshake, LCD, keyboard or other device. And whether a lf to crlf conversion within putchar() is intended. You'll find examples for serial routines f.e. in sdcc/device/lib. For the mcs51 this minimalistic polling putchar() routine might be a start:
```c
int putchar (int c) {
  while (!TI) /* assumes UART is initialized */
  ;
  TI = 0;
  SBUF = c;

  return c;
}
```

`printf()`

The default printf() range none pageformat default printf() implementation in printf_large.c does not support float range none pageformat default Floating point support (except on ds390), only <NO FLOAT> range none pageformat default range none pageformat default printf()!floating point support will be printed instead of the value. To enable floating point output, recompile it with the option *- DUSE_FLOATS=1 range none pageformat default USE FLOATS* on the command line. Use *--model-large range none pageformat default --model-large* for the mcs51 port, since this uses a lot of memory. To enable float support for the pic16 targets, see Libraries.

If you're short on code memory you might want to use printf_small() range none pageformat default printf()!printf small() *instead* of printf(). For the mcs51 there additionally are assembly versions printf_tiny() range none pageformat default printf()!printf tiny() (mcs51) (subset of printf using less than 270 bytes) and printf_fast() range none pageformat default printf()!printf fast() (mcs51) and printf_fast_f() range none pageformat default printf()!printf fast f() (mcs51) (floating-point aware version of printf_fast) which should fit the requirements of many embedded systems (printf_fast() can be customized by unsetting #defines to *not* support long variables and field widths). Be sure to use only one of these printf options within a project.

Feature matrix of different *printf* options on mcs51.

| mcs51 | printf range none pageformat default status collapsed printf() | printf USE_FLOATS=1 | printf_small | printf_fast | printf_fast_f | printf_tiny |
| --- | --- | --- | --- | --- | --- | --- |
| filename | printf_large.c | printf_large.c | printfl.c | printf_fast.c | printf_fast_f.c | printf_tiny.c |
| Hello World size small / large | 1.7k / 2.4k | 4.3k / 5.6k | 1.2k / 1.8k | 1.3k / 1.3k | 1.9k / 1.9k | 0.44k / 0.44k |
| code size small / large | 1.4k / 2.0k | 2.8k / 3.7k | 0.45k / 0.47k (+ _ltoa) | 1.2k / 1.2k | 1.6k / 1.6k | 0.26k / 0.26k |
| formats | cdi o psux | cd f i o psux | c d o s x | cdsux | cdfsux | cdsux |
| long (32 bit) support | x | x | x | x | x | - |
| byte arguments on stack | b | b | - | - | - | - |
| float format range none pageformat default status collapsed Floating point support | - | %f | - | - | %f status collapsed Range limited to +/- 4294967040, precision limited to 8 digits past decimal | - |
| float formats %e %g | - | - | - | - | - | - |
| field width | x | x | - | x | x | - |
| string speed status collapsed Execution time of printf("%s%c%s%c%c%c", "Hello", ' ', "World", '!', ' r', ' n'); standard 8051 @ 22.1184 MHz, empty putchar(), small / large | 1.52 / 2.59 ms | 1.53 / 2.62 ms | 0.92 / 0.93 ms | 0.45 / 0.45 ms | 0.46 / 0.46 ms | 0.45 / 0.45 ms |
| int speed status collapsed Execution time of printf("%d", -12345); standard 8051 @ 22.1184 MHz, empty putchar(), small / large | 3.01 / 3.61 ms | 3.01 / 3.61 ms | 3.51 / 18.13 ms | 0.22 / 0.22 ms | 0.23 / 0.23 ms | 0.25 / 0.25 ms status collapsed printf_tiny integer speed is data dependent, worst case is 0.33 ms |
| long speed status collapsed Execution time of printf("%ld", -123456789); standard 8051 @ 22.1184 MHz, empty putchar(), small / large | 5.37 / 6.31 ms | 5.37 / 6.31 ms | 8.71 / 40.65 ms | 0.40 / 0.40 ms | 0.40 / 0.40 ms | - |
| float speed status collapsed Execution time of printf("%.3f", -12345.678); standard 8051 @ 22.1184 MHz, empty putchar(), small / large | - | 7.49 / 22.47 ms | - | - | 1.04 / 1.04 ms | - |
| float speed status collapsed Execution time of printf("%.3f", -12345.678); standard 8051 @ 22.1184 MHz, empty putchar(), small / large | - | 7.49 / 22.47 ms | - | - | 1.04 / 1.04 ms | - |

##### range none pageformat default malloc.h

As of SDCC 2.6.2 you no longer need to call an initialization routine before using dynamic memory allocation range none pageformat default dynamic memory allocation (malloc) and a default heap range none pageformat default heap (malloc) space of 1024 bytes is provided for malloc to allocate memory from. If you need a different heap size you need to recompile _heap.c with the required size defined in HEAP_SIZE. It is recommended to make a copy of this file into your project directory and compile it there with:

`sdcc -c _heap.c -D HEAP_SIZE=2048`

And then link it with:

`sdcc main.rel _heap.rel`

#### Math functions (sinf, powf, sqrtf etc.)

#####

See definitions in file <math.h>.

#### Other libraries

Libraries range none pageformat default Libraries included in SDCC should have a license at least as liberal as the GPLv2+LE range none pageformat default GPLv2+LE. Exception are pic device libraries and header files which are derived from Microchip header (.inc) and linker script (.lkr) files. Microchip requires that "The header files should state that they are only to be used with authentic Microchip devices" which makes them incompatible with GPL.

If you have ported some library or want to share experience about some code which f.e. falls into any of these categories Busses (I $^{\textrm{2}}$ C, CAN, Ethernet, Profibus, Modbus, USB, SPI, JTAG...), Media (IDE, Memory cards, eeprom, flash...), En-/Decryption, Remote debugging, Realtime kernel, Keyboard, LCD, RTC, FPGA, PID then the sdcc-user mailing list http://sourceforge.net/p/sdcc/mailman/sdcc-user/ would certainly like to hear about it.

Programmers coding for embedded systems are not especially famous for being enthusiastic, so don't expect a big hurray but as the mailing list is searchable these references are very valuable. Let's help to create a climate where information is shared.

### Memory Models

#### MCS51 Memory Models range none pageformat default Memory model range none pageformat default MCS51 memory model

##### Small, Medium, Large and Huge

SDCC allows four memory models for MCS51 code, small, medium, large* and huge*. Modules compiled with different memory models should *never* be combined together or the results would be unpredictable. The library routines supplied with the compiler are compiled for all models (however, the libraries for --stack-auto are compiled for the small and large models only). The compiled library modules are contained in separate directories as small, medium, large and huge so that you can link to the appropriate set.

When the medium, large or huge model is used all variables declared without specifying an intrinsic named address space will be allocated into the external ram, this includes all parameters and local variables (for non-reentrant range none pageformat default reentrant functions). Medium model uses pdata and large and huge models use xdata. When the small model is used variables without an explicitly specified intrinsic named address space are allocated in the internal ram.

The huge model compiles all functions as *banked Bankswitching* and is otherwise equal to large for now. All other models compile the functions without bankswitching by default.

Judicious usage of the processor specific intrinsic named address spaces range none pageformat default intrinsic named address space and the 'reentrant' function type will yield much more efficient code, than using the large model. Several optimizations are disabled when the program is compiled using the large model, it is therefore recommended that the small model be used unless absolutely required.

##### External Stack range none pageformat default stack range none pageformat default External stack (mcs51)

The external stack (--xstack option range none pageformat default --xstack) is located in pdata range none pageformat default pdata (mcs51, ds390 named address space) memory (usually at the start of the external ram segment) and uses all unused space in pdata (max. 256 bytes). When --xstack option is used to compile the program, the parameters and local variables range none pageformat default local variables of all reentrant functions are allocated in this area. This option is provided for programs with large stack space requirements. When used with the --stack-auto range none pageformat default --stack-auto option, all parameters and local variables are allocated on the external stack (note: support libraries will need to be recompiled with the same options. There is a predefined target in the library makefile).

The compiler outputs the higher order address byte of the external ram segment into port P2 range none pageformat default P2 (mcs51 sfr) (see also section MCS51 variants), therefore when using the External Stack option, this port *may not* be used by the application program.

#### DS390 Memory Model range none pageformat default Memory model range none pageformat default DS390 memory model

The only model supported is Flat 24 range none pageformat default Flat 24 (DS390 memory model). This generates code for the 24 bit contiguous addressing mode of the Dallas DS80C390 part. In this mode, up to four meg of external RAM or code space can be directly addressed. See the data sheets at www.dalsemi.com for further information on this part.

Note that the compiler does not generate any code to place the processor into 24 bit mode (although *tinibios* in the ds390 libraries will do that for you). If you don't use *tinibios* range none pageformat default Tinibios (DS390), the boot loader or similar code must ensure that the processor is in 24 bit contiguous addressing mode before calling the SDCC startup code.

Like the *--model-large* option, variables will by default be placed into the XDATA segment.

Segments may be placed anywhere in the 4 meg address space using the usual --*-loc options. Note that if any segments are located above 64K, the -r flag must be passed to the linker to generate the proper segment relocations, and the Intel HEX output format must be used. The -r flag can be passed to the linker by using the option *-Wl-r* on the SDCC command line. However, currently the linker can not handle code segments > 64k.

#### STM8 Memory Models range none pageformat default Memory model range none pageformat default STM8 memory models

SDCC implements two memory models for the STM8: *medium* (default) and *large*. Modules compiled with different memory models should *never* be combined together. The library routines supplied with the compiler are compiled for all models.

In the medium model the address space is 16 bits for both objects and functions, allowing for a memory space of 64 KB. Since the STM8 typically has Flash starting at 0x8000, this means that only up to 32 KB of Flash can be used (most STM8 devices don't have more than 32 KB of Flash).

In the large memory model, the address space is 16 bits for objects and 24 bits for functions. Since the STM8 typically has flash starting at 0x8000, this means that up to 32 KB of flash can be used for constant data, while the whole Flash can be used for functions. Code generated for the large model is slightly bigger and slower and needs slightly more stack space than code generated for the medium model.

#### MOS6502 Memory Models range none pageformat default Memory model range none pageformat default MOS6502 memory models

SDCC implements two memory models for the MOS6502: *small* and *large* (default). Modules compiled with different memory models should *never* be combined together. The library routines supplied with the compiler are compiled for all models.

In the small model all data objects are placed by default in Page Zero. This is normally only useful in embedded systems.

In the large memory model, data is placed by default in 16-bit addressable memory. Critical data can still be placed in Page Zero using the __ZP or __near storage modifier. Code generated for the large model is slightly bigger and slower than code generated for the small model.

### Pragmas range none pageformat default Pragmas

Pragmas are used to turn on and/or off certain compiler options. Some of them are closely related to corresponding command-line options (see section Command Line Options).
Pragmas should be placed before and/or after a function, placing pragmas inside a function body could have unpredictable results.

SDCC supports the following #pragma directives:

- **save** range none pageformat default pragma save- this will save most current options to the save/restore stack. See #pragma restore.
- **restore** range none pageformat default pragma restore- will restore saved options from the last save. saves & restores can be nested. SDCC uses a save/restore stack: save pushes current options to the stack, restore pulls current options from the stack. See #pragma save.
- **callee_saves** range none pageformat default pragma callee saves range none pageformat default function prologue function1[,function2[,function3...]]- The compiler by default uses a caller saves convention for register saving across function calls, however this can cause unnecessary register pushing and popping range none pageformat default push/pop when calling small functions from larger functions. This option can be used to switch off the register saving convention for the function names specified. The compiler will not save registers when calling these functions, extra code need to be manually inserted at the entry and exit for these functions to save and restore the registers used by these functions, this can SUBSTANTIALLY reduce code and improve run time performance of the generated code. In the future the compiler (with inter procedural analysis) may be able to determine the appropriate scheme to use for each function call. If --callee-saves command line option is used (see page Other Options), the function names specified in #pragma callee_saves range none pageformat default pragma callee saves is appended to the list of functions specified in the command line.
- **exclude** range none pageformat default pragma exclude none | {acc[,b[,dpl[,dph[,bits]]]]} - The exclude pragma disables the generation of pairs of push/pop range none pageformat default push/pop instructions in *I* nterrupt range none pageformat default interrupt *S* ervice *R* outines. The directive should be placed immediately before the ISR function definition and it affects ALL ISR functions following it. To enable the normal register saving for ISR functions use #pragma exclude none range none pageformat default pragma exclude. See also the related keyword *__naked* range none pageformat default naked range none pageformat default naked.
- **less_pedantic** range none pageformat default pedantic range none pageformat default pragma less pedantic- the compiler will not warn you anymore for obvious mistakes, you're on your own now;-(. See also the command line option --less-pedantic Other Options.
More specifically, the following warnings will be disabled: *comparison is always [true/false] due to limited range of data type* (94); *overflow in implicit constant conversion* (158); [the (in)famous] *conditional flow changed by optimizer: so said EVELYN the modified DOG* (110); *function '[function name]' must return value* (59).
Furthermore, warnings of less importance (of PEDANTIC and INFO warning level) are disabled, too, namely: *constant value '[dunno what comes here - this warning appears to be unused altogether]', out of range* (81); *[left/right] shifting more than size of object changed to zero* (116); *unreachable code* (126); *integer overflow in expression* (165); *unmatched #pragma save and #pragma restore* (170); *comparison of 'signed char' with 'unsigned char' requires promotion to int* (185); *ISO C90 does not support flexible array members* (187); *extended stack by [number] bytes for compiler temp(s):in function '[function name]': [appears to be always blank - what was supposed to be here* (114); *function '[function name]', # edges [number], # nodes [number], cyclomatic complexity [number]* (121).
- **disable_warning** range none pageformat default pragma disable warning- the compiler will not warn you anymore about warning number <nnnn>.
- **nogcse** range none pageformat default pragma nogcse- will stop global common subexpression elimination.
- **noinduction** range none pageformat default pragma noinduction- will stop loop induction optimizations.
- **noinvariant** range none pageformat default pragma noinvariant- will not do loop invariant optimizations. For more details see Loop Invariants in section Loop Optimizations.
- **noiv** range none pageformat default pragma noiv- Do not generate interrupt range none pageformat default interrupt vector table range none pageformat default interrupt vector table entries for all ISR functions defined after the pragma. This is useful in cases where the interrupt vector table must be defined manually, or when there is a secondary, manually defined interrupt vector table (e.g. for the autovector feature of the Cypress EZ-USB FX2). More elegantly this can be achieved by omitting the optional interrupt number after the *__interrupt* keyword, see section Interrupt Service Routines about interrupts.
- **noloopreverse** range none pageformat default pragma noloopreverse- Will not do loop reversal optimization
- **nooverlay** range none pageformat default pragma nooverlay- the compiler will not overlay the parameters and local variables of a function.
- **stackauto** range none pageformat default pragma stackauto- See option --stack-auto range none pageformat default --stack-auto and section Parameters Parameters and Local Variables.
- **opt_code_speed** range none pageformat default pragma opt code speed- The compiler will optimize code generation towards fast code, possibly at the expense of code size.
- **opt_code_size** range none pageformat default pragma opt code size- The compiler will optimize code generation towards compact code, possibly at the expense of code speed.
- **opt_code_balanced** range none pageformat default pragma opt code balanced- The compiler will attempt to generate code that is both compact and fast, as long as meeting one goal is not a detriment to the other (this is the default).
- **std_sdcc89** range none pageformat default pragma std sdcc89- Generally follow the C89 standard, but allow SDCC features that conflict with the standard.
- **std_c89** range none pageformat default pragma std c89- Follow the C89 standard and disable SDCC features that conflict with the standard.
- **std_sdcc99** range none pageformat default pragma std sdcc99- Generally follow the C99 standard, but allow SDCC features that conflict with the standard.
- **std_c99** range none pageformat default pragma std c99- Follow the C99 standard and disable SDCC features that conflict with the standard.
- **std_c11** range none pageformat default pragma std c11- Follow the C11 standard and disable SDCC features that conflict with the standard.
- **std_sdcc11** range none pageformat default pragma std sdcc11- Generally follow the C11 standard, but allow SDCC features that conflict with the standard.
- **std_c23** range none pageformat default pragma std c23- Follow the C23 standard and disable SDCC features that conflict with the standard (for backwards compatibility, **std_c2x** still exists as an alias).
- **std_sdcc23** range none pageformat default pragma std sdcc23- Generally follow the C23 standard, but allow SDCC features that conflict with the standard.
- **std_c2** y range none pageformat default pragma std c2y- Follow the C2y standard and disable SDCC features that conflict with the standard.
- **std_sdcc2y** range none pageformat default pragma std sdcc2y- Generally follow the C2y standard, but allow SDCC features that conflict with the standard.
- **codeseg** range none pageformat default pragma codeseg- Use this name (max. 8 characters) for the code segment. See option --codeseg.
- **constseg** range none pageformat default pragma constseg- Use this name (max. 8 characters) for the const segment. See option --constseg.
The preprocessor range none pageformat default Preprocessor SDCPP range none pageformat default sdcpp (preprocessor) supports the following #pragma directives:

- **preproc_asm** range none pageformat default pragma preproc asm (+ | -) - switch the __asm __endasm block preprocessing on / off. Default is on. Below is an example on how to use this pragma.
#pragma preproc_asm - range none pageformat default pragma preproc asm
```c
/* this is a c code nop */
#define NOP;

void foo (void)
{
  ...
  while (--i)
  NOP
  ...
  __asm
    ; this is an assembler nop instruction
    ; it is not preprocessed to ';' since the asm preprocessing is disabled
    NOP
  __endasm;
  ...
}
```
The pragma preproc_asm should not be used to define multilines of assembly code (even if it supports it), since this behavior is only a side effect of sdcpp __asm __endasm implementation in combination with pragma preproc_asm and is not in conformance with the C standard. This behavior might be changed in the future sdcpp versions. To define multilines of assembly code you have to include each assembly line into it's own __asm __endasm block. Below is an example for multiline assembly defines.
```c
#define Nop __asm\
  nop\
__endasm

#define ThreeNops Nop;\
  Nop;\
  Nop

void foo (void)
{
  ...
  ThreeNops;
  ...
}
```
- **sdcc_hash** range none pageformat default pragma sdcc hash (+ | -) - Until SDCC 4.2.8: Allow "naked" hash in macro definition, for example:
```c
#define DIR_LO(x) #(x & 0xff)
//Default is off. Below is an example on how to use this pragma.
#pragma preproc_asm +
#pragma sdcc_hash + range none pageformat default pragma sdcc hash

#define ROMCALL(x)\
  mov R6_B3, #(x & 0xff)\
  mov R7_B3, #((x >> 8) & 0xff)\
  lcall __romcall

...
__asm
  ROMCALL(72)
__endasm;
...
```

Some of the pragmas are intended to be used to turn-on or off certain optimizations which might cause the compiler to generate extra stack and/or data space to store compiler generated temporary variables. This usually happens in large functions. Pragma directives should be used as shown in the following example, they are used to control options and optimizations for a given function.
```c
#pragma save range none pageformat default pragma save /* save the current settings */
#pragma nogcse range none pageformat default pragma nogcse /* turnoff global subexpression elimination */
#pragma noinduction range none pageformat default pragma noinduction /* turn off induction optimizations */
int foo ()
{
  ...
  /* large code */
  ...
}
#pragma restore range none pageformat default pragma restore /* turn the optimizations back on */
``` 
The compiler will generate a warning message when extra space is allocated. It is strongly recommended that the save and restore pragmas be used when changing options for a function.

### Defines Created by the Compiler

Besides defines from the C standards, the compiler creates the following #defines range none pageformat default defines range none pageformat default Defines created by the compiler:

| #define | Description |
| --- | --- |
| __SDCC range none pageformat default status collapsed SDCC!Defines!__SDCC (version macro) range none pageformat default status collapsed version macro | Always defined. Version number string (e.g. SDCC_3_2_0 for sdcc 3.2.0). |
| SDCC | OBSOLETE. WILL BE REMOVED IN THE FUTURE. CURRENTLY Only defined for the mcs51 backend (and only if --std-cXX is not used). This macro has been available since SDCC 2.5.6 and is the version number as an int (ex. 256). PLEASE USE OTHER VERSION MACROS INSTEAD! |
| __SDCC_mcs51 range none pageformat default status collapsed SDCC!Defines!__SDCC mcs51 or __SDCC_ds390 range none pageformat default status collapsed SDCC!Defines!__SDCC ds390 or __SDCC_z80 range none pageformat default status collapsed SDCC!Defines!__SDCC z80, etc. | depending on the model used (e.g.: -mds390). Older versions used SDCC_mcs51, etc instead. |
| __SDCC_STACK_AUTO range none pageformat default status collapsed SDCC!Defines!SDCC STACK AUTO | when - -stack-auto option is used |
| __SDCC_MODEL_SMALL range none pageformat default status collapsed SDCC!Defines!SDCC MODEL SMALL | when - -model-small is used |
| __SDCC_MODEL_MEDIUM range none pageformat default status collapsed SDCC!Defines!SDCC MODEL MEDIUM | when - -model-medium is used |
| __SDCC_MODEL_LARGE range none pageformat default status collapsed SDCC!Defines!SDCC MODEL LARGE | when - -model-large is used |
| __SDCC_MODEL_HUGE range none pageformat default status collapsed SDCC!Defines!SDCC MODEL LARGE | when - -model-huge is used |
| __SDCC_USE_XSTACK range none pageformat default status collapsed SDCC!Defines!SDCC USE XSTACK | when - -xstack option is used |
| __SDCC_STACK_TENBIT range none pageformat default status collapsed SDCC!Defines!SDCC STACK TENBIT (ds390) | when -mds390 is used |
| __SDCC_MODEL_FLAT24 range none pageformat default status collapsed SDCC!Defines!SDCC MODEL FLAT24 (ds390) | when -mds390 is used |
| __SDCC_VERSION_MAJOR | Always defined. SDCC major version number. E.g. 3 for SDCC 3.5.0 |
| __SDCC_VERSION_MINOR | Always defined. SDCC minor version number. E.g. 5 for SDCC 3.5.0 |
| __SDCC_VERSION_PATCH | Always defined. SDCC patchlevel version number. E.g. 0 for SDCC 3.5.0 |
| __SDCC_REVISION range none pageformat default status collapsed SDCC!Defines!SDCC REVISION (svn revision number) | Always defined. SDCC svn revision number. Older versions of sdcc used SDCC_REVISION instead. |
| SDCC_PARMS_IN_BANK1 range none pageformat default status collapsed SDCC!Defines!SDCC PARMS IN BANK1 | when - -parms-in-bank1 is used |
| __SDCC_ALL_CALLEE_SAVES range none pageformat default status collapsed SDCC!Defines!SDCC ALL CALLEE SAVES | when - -all-callee-saves is used |
| __SDCC_FLOAT_REENT range none pageformat default status collapsed SDCC!Defines!SDCC FLOAT REENT | when - -float-reent is used |
| __SDCC_INT_LONG_REENT range none pageformat default status collapsed SDCC!Defines!SDCC INT LONG REENT | when - -int-long-reent is used |
| __SDCC_OPTIMIZE_SPEED range none pageformat default status collapsed SDCC!Defines!SDCC OPTIMIZE SPEED | when - -opt-code-speed is used |
| __SDCC_OPTIMIZE_SIZE range none pageformat default status collapsed SDCC!Defines!SDCC OPTIMIZE SIZE | when - -opt-code-size is used |
| __SDCCCALL range none pageformat default status collapsed SDCC!Defines!SDCCCALL | Default ABI version for calling convention |
| __SDCCCALL range none pageformat default status collapsed SDCC!Defines!SDCCCALL | Default ABI version for calling convention |
