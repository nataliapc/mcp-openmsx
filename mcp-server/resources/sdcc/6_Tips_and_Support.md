# SDCC Compiler User Guide

## TIPS

Here are a few guidelines that will help the compiler generate more efficient code, some of the tips are specific to this compiler others are generally good programming practice.

- Use the smallest data type to represent your data-value. If it is known in advance that the value is going to be less than 256 then use an 'unsigned char' instead of a 'short' or 'int'. Please note, that ANSI C requires both signed and unsigned chars to be promoted to 'signed int' range none pageformat default promotion to signed int **! before doing any operation. This promotion range none pageformat default type promotion can be omitted, if the result is the same. The effect of the promotion rules together with the sign-extension is often surprising:
unsigned char uc = 0xfe;
if (uc * uc < 0) /* this is true! */
{
....
}

uc * uc is evaluated as (int) uc * (int) uc = (int) 0xfe * (int) 0xfe = (int) 0xfc04 = -1024.
Another one:

(unsigned char) -12 / (signed char) -3 =...

No, the result is not 4:

(int) (unsigned char) -12 / (int) (signed char) -3 =
(int) (unsigned char) 0xf4 / (int) (signed char) 0xfd =
(int) 0x00f4 / (int) 0xfffd =
(int) 0x00f4 / (int) 0xfffd =
(int) 244 / (int) -3 =
(int) -81 = (int) 0xffaf;

Don't complain, that gcc gives you a different result. gcc uses 32 bit ints, while SDCC uses 16 bit ints. Therefore the results are different.
From" comp.lang.c FAQ":

*If well-defined overflow characteristics are important and negative values are not, or if you want to steer clear of sign-extension problems when manipulating bits or bytes, use one of the corresponding unsigned types. (Beware when mixing signed and unsigned values in expressions, though.)
Although character types (especially unsigned char) can be used as "tiny" integers, doing so is sometimes more trouble than it's worth, due to unpredictable sign extension and increased code size.

- Use unsigned when it is known in advance that the value is not going to be negative. This helps especially if you are doing division or multiplication, bit-shifting or are using an array index.
- NEVER jump into a LOOP.
- Declare the variables to be local range none pageformat default local variables whenever possible, especially loop control variables (induction).
- Have a look at the assembly listing to get a" feeling" for the code generation.

### Porting code from or to other compilers

- check whether endianness range none pageformat default Endianness of the compilers differs and adapt where needed.
- check the device specific header files range none pageformat default Header files range none pageformat default Include files for compiler specific syntax. Eventually include the file <compiler.h range none pageformat default compiler.h (include file) > http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/device/include/mcs51/compiler.h to allow using common header files. (see f.e. cc2510fx.h http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/device/include/mcs51/cc2510fx.h).
- check whether the startup code contains the correct initialization (watchdog range none pageformat default watchdog, peripherals).
- check whether the sizes of short, int, long match.
- check if some 16 or 32 bit hardware registers require a specific addressing order (least significant or most significant byte first) and adapt if needed (*first* and *last* relate to time and not to lower/upper memory location here, so this is *not* the same as endianness).
- check whether the keyword *volatile range none pageformat default volatile* is used where needed. The compilers might differ in their optimization characteristics (as different versions of the same compiler might also use more clever optimizations this is good idea anyway). See section .
- check that the compilers are not told to suppress warnings.
- check and convert compiler specific extensions (interrupts, memory areas, pragmas etc.).
- check for differences in type promotion. Especially check for math operations on char or unsigned char variables. For the sake of C99 compatibility SDCC will probably promote these to int more often than other compilers. Eventually insert explicit casts to (char) or (unsigned char). Also check that the ~ operator range none pageformat default ~ Operator is not used on bit range none pageformat default bit variables, use the! operator instead. See sections TIPS and Compatibility.
- check the assembly code generated for interrupt routines (f.e. for calls to possibly non-reentrant library functions).
- check whether timing loops result in proper timing (or preferably consider a rewrite of the code with timer based delays instead).
- check for differences in printf parameters range none pageformat default printf()!parameters (some compilers push (va_arg range none pageformat default vararg, va arg) char variables as int others push them as char. See section Compatibility). Provide a putchar() range none pageformat default printf()!putchar() function if needed.
- check the resulting memory map range none pageformat default Memory map. Usage of different memory spaces: code, stack, data (for mcs51/ds390 additionally idata, pdata, xdata). Eventually check if unexpected library functions are included.

### Tools range none pageformat default Tools included in the distribution

| Name | Purpose | Directory |
| --- | --- | --- |
| as2gbmap.py | sdas map to rrgb map and no$gmb sym file format converter | sdcc/support/scripts |
| cinc2h.pl | gpasm inc to c header file converter | sdcc/support/scripts |
| gen_known_bugs.pl | generate knownbugs.html | sdcc/support/scripts |
| keil2sdcc.pl | Keil header range none pageformat default status collapsed Header files range none pageformat default status collapsed Include files to SDCC header file converter | sdcc/support/scripts |
| makebin | Intel Hex to binary and GameBoy binay format converter | sdcc/bin |
| mcs51-disasm.pl | disassembler to the mcs51 instructions contained hex files | sdcc/support/scripts |
| mh2h.c | header file conversion | sdcc/support/scripts |
| optimize_pic16devices.pl | optimizes or unoptimizes the pic16devices.txt file | sdcc/support/scripts |
| packihx | Intel Hex packer range none pageformat default status collapsed packihx (tool) | sdcc/bin |
| pic14-header-parser.pl | helper to realization of peripheral-handling (PIC14) | sdcc/support/scripts |
| pic16-header-parser.pl | helper to realization of peripheral-handling (PIC16) | sdcc/support/scripts |
| pic16fam-h-gen.pl | helper to realization of peripheral-handling (PIC14) | sdcc/support/scripts |
| pic18fam-h-gen.pl | helper to realization of peripheral-handling (PIC16) | sdcc/support/scripts |
| repack_release.sh | repack sdcc to release package | sdcc/support/scripts |
| sdas390 | assembler | sdcc/bin |
| sdas6808 | assembler | sdcc/bin |
| sdas6500 | assembler | sdcc/bin |
| sdas8051 | assembler | sdcc/bin |
| sdasgb | assembler | sdcc/bin |
| sdasz80 | assembler | sdcc/bin |
| sdcc_cygwin_mingw32 | cross compile the sdcc with mingw32 under Cygwin | sdcc/support/scripts |
| sdcc_mingw32 | cross compile the sdcc with mingw32 | sdcc/support/scripts |
| SDCDB | simulator | sdcc/bin |
| sdld | linker | sdcc/bin |
| sdld6808 | linker | sdcc/bin |
| sdldgb | linker | sdcc/bin |
| sdldz80 | linker | sdcc/bin |
| uCsim range none pageformat default status collapsed uCsim | simulator for various architectures | sdcc/sim/ucsim |
| uCsim range none pageformat default status collapsed uCsim | simulator for various architectures | sdcc/sim/ucsim |

### Documentation range none pageformat default Documentation included in the distribution

| Subject / Title | Filename / Where to get |
| --- | --- |
| SDCC Compiler User Guide | You're reading it right now online at: status collapsed http://sdcc.sourceforge.net/doc/sdccman.pdf |
| Changelog of SDCC | sdcc/Changelog online at: status collapsed http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/ChangeLog |
| ASXXXX range none pageformat default status collapsed sdas (sdasgb, sdas6808, sdas8051, sdasz80) range none pageformat default status collapsed Assembler documentation Assemblers and ASLINK range none pageformat default status collapsed sdld range none pageformat default status collapsed Linker documentation Relocating Linker | sdcc/sdas/doc/asmlnk.txt online at: status collapsed http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/sdas/doc/asmlnk.txt |
| SDCC regression test range none pageformat default status collapsed Regression test | test_suite_spec online at: status collapsed http://sdcc.sourceforge.net/wiki/index.php/Proposed_Test_Suite_Design |
| Various notes | sdcc/doc/* online at: status collapsed http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/doc/ |
| Notes on debugging with SDCDB range none pageformat default status collapsed SDCDB (debugger) | sdcc/debugger/README online at: status collapsed http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/debugger/README |
| uCsim range none pageformat default status collapsed uCsim Software simulator for microcontrollers | sdcc/sim/ucsim/doc /index.html online at: status collapsed http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/sim/ucsim/doc/index.html |
| Temporary notes on the pic16 range none pageformat default status collapsed PIC16 port | sdcc/src/pic16/NOTES online at: status collapsed http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/src/pic16/NOTES |
| SDCC internal documentation (debugging file format) | sdcc/doc/ cdbfileformat.pd f online at: status collapsed http://sdcc.sourceforge.net/wiki/index.php/CDB_File_Format |
| SDCC internal documentation (debugging file format) | sdcc/doc/ cdbfileformat.pd f online at: status collapsed http://sdcc.sourceforge.net/wiki/index.php/CDB_File_Format |

### Communication online at SourceForge

| Subject / Title | Note | Link |
| --- | --- | --- |
| wiki range none pageformat default status collapsed wiki range none pageformat default status collapsed Communication!wiki | | status collapsed http://sdcc.sourceforge.net/wiki/ |
| sdcc-user mailing list range none pageformat default status collapsed mailing list range none pageformat default status collapsed Communication!Mailing lists | around 650 subscribers mid 2009 | status collapsed https://lists.sourceforge.net/mailman/listinfo/sdcc-user |
| sdcc-devel mailing list | | status collapsed https://lists.sourceforge.net/mailman/listinfo/sdcc-devel |
| help forum range none pageformat default status collapsed Communication!Forums | similar scope as sdcc-user mailing list | status collapsed http://sourceforge.net/p/sdcc/discussion/1865 |
| open discussion forum | | status collapsed http://sourceforge.net/p/sdcc/discussion/1864 |
| trackers (bug tracker, feature requests, patches, support requests, webdocs) range none pageformat default status collapsed Communication!Trackers | | status collapsed http://sourceforge.net/p/sdcc/_list/tickets |
| rss feed range none pageformat default status collapsed RSS feed range none pageformat default status collapsed Communication!RSS feed | stay tuned with most (not all) sdcc activities | status collapsed http://sourceforge.net/export/rss2_keepsake.php?group_id=599 |
| rss feed range none pageformat default status collapsed RSS feed range none pageformat default status collapsed Communication!RSS feed | stay tuned with most (not all) sdcc activities | status collapsed http://sourceforge.net/export/rss2_keepsake.php?group_id=599 |

With a sourceforge account you can" monitor" range none pageformat default Communication!Monitor forums and trackers, so that you automatically receive mail on changes. You can digg out earlier communication by using the search function http://sourceforge.net/search/?group_id=599.

### Related open source tools range none pageformat default Related tools

| Name | Purpose | Where to get |
| --- | --- | --- |
| gpsim range none pageformat default status collapsed gpsim (pic simulator) | PIC simulator | status collapsed http://www.dattalo.com/gnupic/gpsim.html |
| gputils range none pageformat default status collapsed gputils (pic tools) | GNU PIC utilities | status collapsed http://sourceforge.net/projects/gputils |
| flP5 | PIC programmer | status collapsed http://freshmeat.net/projects/flp5/ |
| ec2drv/newcdb | Tools for Silicon Laboratories JTAG debug adapter, partly based on SDCDB (Unix only) | status collapsed http://sourceforge.net/projects/ec2drv |
| indent range none pageformat default status collapsed indent (source formatting tool) | Formats C source - Master of the white spaces | status collapsed http://directory.fsf.org/GNU/indent.html |
| srecord range none pageformat default status collapsed srecord (bin, hex,... tool) | Object file conversion, checksumming,... | status collapsed http://sourceforge.net/projects/srecord |
| objdump range none pageformat default status collapsed objdump (tool) | Object file conversion,... | Part of binutils (should be there anyway) |
| cmon51 | 8051 monitor (hex up-/download, single step, disassemble) | status collapsed http://sourceforge.net/projects/cmon51 |
| doxygen range none pageformat default status collapsed doxygen (source documentation tool) | Source code documentation system | status collapsed http://www.doxygen.org |
| kdevelop | IDE (has anyone tried integrating SDCC & SDCDB? Unix only) | status collapsed http://www.kdevelop.org |
| paulmon | 8051 monitor (hex up-/download, single step, disassemble) | status collapsed http://www.pjrc.com/tech/8051/paulmon2.html |
| splint range none pageformat default status collapsed splint (syntax checking tool) | Statically checks c sources (see  reference "lyx:more-pedantic-SPLINT" nolink "false") | status collapsed http://www.splint.org |
| ddd range none pageformat default status collapsed DDD (debugger) | Debugger, serves nicely as GUI to SDCDB range none pageformat default status collapsed SDCDB (debugger) (Unix only) | status collapsed http://www.gnu.org/software/ddd/ |
| d52 range none pageformat default status collapsed d52 range none pageformat default status collapsed d52 (disassembler) | Disassembler, can count instruction cycles range none pageformat default status collapsed instruction cycles (count), use with options -pnd | status collapsed http://www.8052.com/users/disasm/ |
| cmake range none pageformat default status collapsed cmake | Cross platform build system, generates Makefiles range none pageformat default status collapsed Makefile and project workspaces range none pageformat default status collapsed project workspace | status collapsed http://www.cmake.org and a dedicated wiki entry: status collapsed http://www.cmake.org/Wiki/CmakeSdcc |
| cmake range none pageformat default status collapsed cmake | Cross platform build system, generates Makefiles range none pageformat default status collapsed Makefile and project workspaces range none pageformat default status collapsed project workspace | status collapsed http://www.cmake.org and a dedicated wiki entry: status collapsed http://www.cmake.org/Wiki/CmakeSdcc |

### Related documentation / recommended reading

| Name | Subject / Title | Where to get |
| --- | --- | --- |
| c-refcard.pdf | C Reference Card range none pageformat default status collapsed C Reference card, 2 pages | status collapsed http://refcards.com/refcards/c/index.html |
| c-faq | C-FAQ range none pageformat default status collapsed C FAQ | status collapsed http://www.c-faq.com |
| ISO/IEC 9899:TC2 | C-Standard | status collapsed http://www.open-std.org/jtc1/sc22/wg14/www/standards.html#9899 |
| ISO/IEC DTR 18037 | Extensions for Embedded C | status collapsed http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1021.pdf |
| | Latest datasheet of target CPU | vendor |
| | Revision history of datasheet | vendor |
| | Revision history of datasheet | vendor |

### Application notes specifically for SDCC

SDCC makes no claims about the completeness of this list and about up-to-dateness or correctness of the application notes range none pageformat default Application notes.

| Vendor | Subject / Title | Where to get |
| --- | --- | --- |
| Maxim / Dallas | Using the SDCC Compiler for the DS80C400 range none pageformat default status collapsed DS80C400 | status collapsed http://pdfserv.maxim-ic.com/en/an/AN3346.pdf |
| Maxim / Dallas | Using the Free SDCC C Compiler to Develop Firmware for the DS89C420/430/440/450 range none pageformat default status collapsed DS89C4x0 Family of Microcontrollers | status collapsed http://pdfserv.maxim-ic.com/en/an/AN3477.pdf |
| Silicon Laboratories / Cygnal | Integrating SDCC 8051 Tools Into The Silicon Labs IDE range none pageformat default status collapsed IDE | status collapsed http://www.silabs.com/public/documents/tpub_doc/anote/Microcontrollers/en/an198.pdf |
| Ramtron / Goal Semiconductor | Interfacing SDCC to Syn and Textpad | status collapsed http://www.ramtron.com/doc/Products/Microcontroller/Support_Tools.asp |
| Ramtron / Goal Semiconductor | Installing and Configuring SDCC and Crimson Editor | status collapsed http://www.ramtron.com/doc/Products/Microcontroller/Support_Tools.asp |
| Texas Instruments | MSC12xx Programming with SDCC | status collapsed http://focus.ti.com/general/docs/lit/getliterature.tsp?literatureNumber=sbaa109&fileType=pdf |
| Texas Instruments | MSC12xx Programming with SDCC | status collapsed http://focus.ti.com/general/docs/lit/getliterature.tsp?literatureNumber=sbaa109&fileType=pdf |

### Some Questions

Some questions answered, some pointers given - it might be time to in turn ask *you* some questions:

- can you solve your project with the selected microcontroller? Would you find out early or rather late that your target is too small/slow/whatever? Can you switch to a slightly better device if it doesn't fit?
- should you solve the problem with an 8 bit CPU? Or would a 16/32 bit CPU and/or another programming language be more adequate? Would an operating system on the target device help?
- if you solved the problem, will the marketing department be happy?
- if the marketing department is happy, will customers be happy?
- if you're the project manager, marketing department and maybe even the customer in one person, have you tried to see the project from the outside?
- is the project done if you think it is done? Or is just that other interface/protocol/feature/configuration/option missing? How about website, manual(s), internationali(z|s)ation, packaging, labels, 2nd source for components, electromagnetic compatability/interference, documentation for production, production test software, update mechanism, patent issues?
- is your project adequately positioned in that magic triangle: fame, fortune, fun?
Maybe not all answers to these questions are known and some answers may even be *no*, nevertheless knowing these questions may help you to avoid burnout burnout is bad for electronic devices, programmers and motorcycle tyres. Chances are you didn't want to hear some of them...

## Support range none pageformat default Support

SDCC has grown to be a large project. The compiler alone (without the preprocessor, assembler and linker) is well over 150,000 lines of code (blank stripped). The open source nature of this project is a key to its continued growth and support. You gain the benefit and support of many active software developers and end users. Is SDCC perfect? No, that's why we need your help. The developers take pride in fixing reported bugs. You can help by reporting the bugs and helping other SDCC users. There are lots of ways to contribute, and we encourage you to take part in making SDCC a great software package.

The SDCC project is hosted on the SDCC SourceForge site at http://sourceforge.net/projects/sdcc. You'll find the complete set of mailing lists range none pageformat default Mailing list(s), forums, bug reporting system, patch submission range none pageformat default Patch submission system, wiki, rss-feed, download range none pageformat default download area and Subversion code repository range none pageformat default Subversion code repository there.

### Reporting Bugs range none pageformat default Bug reporting range none pageformat default Reporting bugs range none pageformat default Communication!Bug report

The recommended way of reporting bugs is using the infrastructure of the SourceForge site. You can follow the status of bug reports there and have an overview about the known bugs.

Bug reports are automatically forwarded to the developer mailing list and will be fixed ASAP. When reporting a bug, it is very useful to include a small test program (the smaller the better) which reproduces the problem. If you can isolate the problem by looking at the generated assembly code, this can be very helpful. Compiling your program with the --dumpall range none pageformat default --dumpall option can sometimes be useful in locating optimization problems. When reporting a bug please make sure you:

1. Attach the code you are compiling with SDCC.
2. Specify the exact command you use to run SDCC, or attach your Makefile.
3. Specify the SDCC version (type " **sdcc -v** "), your platform, and operating system.
4. Provide an exact copy of any error message or incorrect output.
5. Put something meaningful in the subject of your message.
Please attempt to include these 5 important parts, as applicable, in all requests for support or when reporting any problems or bugs with SDCC. Though this will make your message lengthy, it will greatly improve your chance that SDCC users and developers will be able to help you. Some SDCC developers are frustrated by bug reports without code provided that they can use to reproduce and ultimately fix the problem, so please be sure to provide sample code if you are reporting a bug!

Please have a short check that you are using a recent version of SDCC and the bug is not yet known. This is the link for reporting bugs: http://sourceforge.net/p/sdcc/bugs/. With SDCC on average having more than 200 downloads range none pageformat default download on SourceForge per day 220 daily downloads on average Jan-Sept 2006 and about 150 daily downloads between 2002 and 2005. This does not include other methods of distribution. there must be some users. So it's not exactly easy to find a new bug. If you find one we need it: *reporting bugs is good*.

### Requesting Features range none pageformat default Feature request range none pageformat default Requesting features range none pageformat default Communication!Feature request

Like bug reports feature requests are forwarded to the developer mailing list. This is the link for requesting features: http://sourceforge.net/p/sdcc/feature-requests/.

### Submitting patches range none pageformat default Communication!Patch submission

Like bug reports contributed patches are forwarded to the developer mailing list. This is the link for submitting patches range none pageformat default Patch submission: http://sourceforge.net/p/sdcc/patches/.

You need to specify some parameters to the diff command for the patches to be useful. If you modified more than one file a patch created f.e. with **" diff -Naur unmodified_directory modified_directory >my_changes.patch"** will be fine, otherwise **" diff -u sourcefile.c.orig sourcefile.c >my_changes.patch"** will do.

### Getting Help

These links should take you directly to the Mailing lists http://sourceforge.net/p/sdcc/mailman/sdcc-user/ Traffic on sdcc-devel and sdcc-user is about 100 mails/month each not counting automated messages (mid 2003) and the Forums http://sourceforge.net/p/sdcc/discussion/, lists range none pageformat default Mailing list(s) range none pageformat default Communication!Mailing lists and forums are archived and searchable so if you are lucky someone already had a similar problem. While mails to the lists themselves are delivered promptly their web front end on SourceForge sometimes shows a severe time lag (up to several weeks), if you're seriously using SDCC please consider subscribing to the lists.

### ChangeLog

You can follow the status of the Subversion version range none pageformat default version of SDCC by watching the Changelog range none pageformat default Changelog in the Subversion repository http://svn.code.sf.net/p/sdcc/code/trunk/sdcc/ChangeLog.

### Subversion Source Code Repository

The output of **sdcc --version** or the filenames of the snapshot versions of SDCC include date and its Subversion range none pageformat default Subversion code repository number. Subversion allows to download the source of recent or previous versions http://sourceforge.net/p/sdcc/code/8805/tree/ (by number or by date).

### Release policy range none pageformat default Release policy

Starting with version 2.4.0 SDCC in 2004 uses a time-based release schedule with one official release usually during the first half of the year.

The last digit of an official release is zero. Additionally there are daily snapshots available at http://sdcc.sourceforge.net/snap.php, and you can always build the very last version from the source code available at Sourceforge http://sdcc.sourceforge.net/snap.php#Source. The SDCC Wiki range none pageformat default wiki range none pageformat default SDCC Wiki at http://sdcc.sourceforge.net/wiki/ also holds some information about past and future releases.

### Quality control range none pageformat default Quality control

The compiler is passed through *daily* snapshot build compile and build checks. The so called *regression tests* range none pageformat default Regression test check that SDCC itself compiles flawlessly on several host platforms (i386, Opteron, 64 bit Alpha, ppc64, Mac OS X on ppc and i386, Solaris on Sparc) and checks the quality of the code generated by SDCC by running the code for several target platforms through simulators. The regression test suite comprises about 1000 files which expand to more than 1500 test cases which include about 7000 tests. A large number of tests from the GCC test suite is included in this. The results of these tests are published daily on SDCC's snapshot page (click on the red or green symbols on the right side of http://sdcc.sourceforge.net/snap.php).

You'll find the test code in the directory *sdcc/support/regression*. You can run these tests manually by running make in this directory (or f.e. **" make test-mcs51"** if you don't want to run the complete tests). The test code might also be interesting if you want to look for examples range none pageformat default Examples checking corner cases of SDCC or if you plan to submit patches range none pageformat default Patch submission.

The PIC14 port uses a different set of regression tests range none pageformat default Regression test (PIC14), you'll find them in the directory *sdcc/src/regression*.

### Examples range none pageformat default Examples

You'll find some small examples in the directory *sdcc/device/examples/.* More examples and libraries are available at *The SDCC Open Knowledge Resource http://sdccokr.dl9sec.de/* web site or at http://www.pjrc.com/tech/8051/.

I did insert a reference to Paul's web site here although it seems rather dedicated to a specific 8032 board (I think it's okay because it f.e. shows LCD/Harddisc interface and has a free 8051 monitor. Independent 8032 board vendors face hard competition of heavily subsidized development boards anyway). Maybe we should include some links to real world applications. Preferably pointer to pointers (one for each architecture) so this stays manageable here?

### Use of SDCC in Education

In short: *highly* encouraged the phrase "use in education" might evoke the association " *only* fit for use in education". This connotation is not intended but nevertheless risked as the licensing of SDCC makes it difficult to offer educational discounts. If your rationales are to:

1. give students a chance to understand the *complete* steps of code generation
2. have a curriculum that can be extended for years. Then you could use an FPGA board as target and your curriculum will seamlessly extend from logic synthesis (http://www.opencores.org opencores.org, Oregano http://www.oregano.at/ip/ip01.htm), over assembly programming, to C to FPGA compilers (FPGAC http://sourceforge.net/projects/fpgac/) and to C.
3. be able to insert excursions about skills like using a revision control system, submitting/applying patches, using a type-setting (as opposed to word-processing) engine \SpecialChar LyX /\SpecialChar LaTeX, using SourceForge http://sourceforge.net/, following some netiquette http://en.wikipedia.org/wiki/Netiquette, understanding BSD/LGPL/GPL/Proprietary licensing, growth models of Open Source Software, CPU simulation, compiler regression tests range none pageformat default Regression test.
And if there should be a shortage of ideas then you can always point students to the ever-growing feature request list http://sourceforge.net/p/sdcc/feature-requests/.
4. not tie students to a specific host platform and instead allow them to use a host platform of *their* choice (among them Alpha, i386, i386_64, Mac OS X, Mips, Sparc, Windows and eventually OLPC http://www.laptop.org)
5. not encourage students to use illegal copies of educational software
6. be immune to licensing/availability/price changes of the chosen tool chain
7. be able to change to a new target platform without having to adopt a new tool chain
8. have complete control over and insight into the tool chain
9. make your students aware about the pros and cons of open source software development
10. give back to the public as you are probably at least partially publicly funded
11. give students a chance to publicly prove their skills and to possibly see a world wide impact
then SDCC is probably among the first choices. Well, probably SDCC might be the only choice.
