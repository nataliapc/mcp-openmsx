# SDCC Compiler User Guide

## Installing SDCC range none pageformat default Installation

For most users it is sufficient to skip to either section Building SDCC on Linux (Unix) or section Windows Install Using the Setup Program (Windows). More detailed instructions follow below.

### Configure Options range none pageformat default Options SDCC configuration

The install paths, search paths and other options are defined when running 'configure'. The defaults can be overridden by:

--prefix see table below

--exec_prefix see table below

--bindir see table below

--datadir see table below

--datarootdir see table below

docdir environment variable, see table below

include_dir_suffix environment variable, see table below

non_free_include_dir_suffix environment variable, see table below

lib_dir_suffix environment variable, see table below

non_free_lib_dir_suffix environment variable, see table below

sdccconf_h_dir_separator environment variable, either / or\\ makes sense here. This character will only be used in sdccconf.h; don't forget it's a C-header, therefore a double-backslash is needed there.

--disable-mcs51-port Excludes the Intel mcs51 port

--disable-z80-port Excludes the z80 port

--disable-z180-port Excludes the z180 port

--disable-ez80_z80-port Excludes the e80_z80 port

--disable-z80n-port Excludes the z80n port

--disable-r800-port Excludes the r800 port

--disable-r2k-port Excludes the r2k port

--disable-r2ka-port Excludes the r2ka port

--disable-r3ka-port Excludes the r3ka port

--disable-sm83-port Excludes the SM83 port

--disable-tlcs90-port Excludes the TLCS-90 port

--disable-ds390-port Excludes the DS390 port

--disable-ds400-port Excludes the DS400 port

--disable-hc08-port Excludes the HC08 port

--disable-s08-port Excludes the S08 port

--disable-stm8-port Excludes the STM8 port

--disable-pdk13-port Excludes the PDK13 port

--disable-pdk14-port Excludes the PDK14 port

--disable-pdk15-port Excludes the PDK15 port

--disable-pic14-port Excludes the PIC14 port

--disable-pic16-port Excludes the PIC16 port

--disable-mos6502-port Excludes the MOS6502

--disable-mos65c02-port Excludes the MOS65C02

--disable-ucsim Disables configuring and building of ucsim

--disable-device-lib Disables automatically building device libraries

--disable-packihx Disables building packihx

--enable-doc Build pdf, html and txt files from the lyx sources

--enable-libgc Use the Bohem memory allocator. Lower runtime footprint.

--without-ccache Do not use ccache even if available

Furthermore the environment variables CC, CFLAGS,... the tools and their arguments can be influenced. Please see `configure --help' and the man/info pages of `configure' for details.

The names of the standard libraries STD_LIB, STD_INT_LIB, STD_LONG_LIB, STD_FP_LIB, STD_DS390_LIB, STD_XA51_LIB and the environment variables SDCC_DIR_NAME, SDCC_INCLUDE_NAME, SDCC_LIB_NAME are defined by `configure' too. At the moment it's not possible to change the default settings (it was simply never required).

These configure options are compiled into the binaries, and can only be changed by rerunning 'configure' and recompiling SDCC. The configure options are written in *italics* to distinguish them from run time environment variables (see section search paths).

The settings for" Win32 builds" are used by the SDCC team to build the official Win32 binaries. The SDCC team uses Mingw32 to build the official Windows binaries, because it's

1. open source,
2. a gcc compiler and last but not least
3. the binaries can be built by cross compiling on SDCC Distributed Compile Farm.
See the examples, how to pass the Win32 settings to 'configure'. The other Win32 builds using VC or whatever don't use 'configure', but a header file sdcc_vc.h.in is the same as sdccconf.h built by 'configure' for Win32.

These defaults are:

| Variable | default | Win32 builds |
| --- | --- | --- |
| PREFIX | /usr/local | sdcc |
| EXEC_PREFIX | $PREFIX | $PREFIX |
| BINDIR | $EXEC_PREFIX /bin | $EXEC_PREFIX bin |
| DATADIR | $DATAROOTDIR | $DATAROOTDIR |
| DATAROOTDIR | $PREFIX /share | $PREFIX |
| DOCDIR | $DATAROOTDIR /sdcc/doc | $DATAROOTDIR doc |
| INCLUDE_DIR_SUFFIX | sdcc/include | include |
| NON_FREE_INCLUDE_DIR_SUFFIX | sdcc/non-free/include | non-free/include |
| LIB_DIR_SUFFIX | sdcc/lib | lib |
| NON_FREE_LIB_DIR_SUFFIX | sdcc/non-free/lib | non-free/lib |
| NON_FREE_LIB_DIR_SUFFIX | sdcc/non-free/lib | non-free/lib |

'configure' also computes relative paths. This is needed for full relocatability of a binary package and to complete search paths (see section search paths below):

| Variable (computed) | default | Win32 builds |
| --- | --- | --- |
| BIN2DATA_DIR |../share |.. |
| PREFIX2BIN_DIR | bin | bin |
| PREFIX2DATA_DIR | share/sdcc | |
| PREFIX2DATA_DIR | share/sdcc | |

Examples:

./configure
./configure --prefix=" /usr/bin"--datarootdir=" /usr/share"
./configure --disable-avr-port --disable-xa51-port

To cross compile on linux for Mingw32 (see also 'sdcc/support/scripts/sdcc_mingw32'):

./configure\
CC=" i586-mingw32msvc-gcc" CXX=" i586-mingw32msvc-g++"\
RANLIB=" i586-mingw32msvc-ranlib"\
STRIP=" i586-mingw32msvc-strip"\
--prefix=" /sdcc"\
--datarootdir=" /sdcc"\
docdir="\ ${datarootdir}/doc"\
include_dir_suffix=" include"\
non_free_include_dir_suffix=" non-free/include"\
lib_dir_suffix=" lib"\
non_free_lib_dir_suffix=" non-free/lib"\
sdccconf_h_dir_separator="\\\\"\
--disable-device-lib\
--host=i586-mingw32msvc\
--build=unknown-unknown-linux-gnu

To" cross" compile on Cygwin for Mingw32 (see also sdcc/support/scripts/sdcc_cygwin_mingw32):

./configure\
--prefix=" /sdcc"\
--datarootdir=" /sdcc"\
docdir="\ ${datarootdir}/doc"\
include_dir_suffix=" include"\
non_free_include_dir_suffix=" non-free/include"\
lib_dir_suffix=" lib"\
non_free_lib_dir_suffix=" non-free/lib"\
sdccconf_h_dir_separator="\\\\"\
CC=" gcc -mno-cygwin"\
CXX=" g++ -mno-cygwin"

### Install paths range none pageformat default Install paths

| Description | Path | Default | Win32 builds |
| --- | --- | --- | --- |
| Binary files* | $EXEC_PREFIX | /usr/local/bin | sdcc bin |
| Include files | $DATADIR/ $INCLUDE_DIR_SUFFIX | /usr/local/share/ sdcc/include | sdcc include |
| Non-free include files | $DATADIR/non-free/ $INCLUDE_DIR_SUFFIX | /usr/local/share/ sdcc/non-free/include | sdcc non-free include |
| Library file** | $DATADIR/ $LIB_DIR_SUFFIX | /usr/local/share/ sdcc/lib | sdcc lib |
| Library file** | $DATADIR/non-free/ $LIB_DIR_SUFFIX | /usr/local/share/ sdcc/non-free/lib | sdcc non-free lib |
| Documentation | $DOCDIR | /usr/local/share/ sdcc/doc | sdcc doc |
| Documentation | $DOCDIR | /usr/local/share/ sdcc/doc | sdcc doc |

*compiler, preprocessor, assembler, and linker
**the *model* is auto-appended by the compiler, e.g. small, large, z80, ds390 etc

The install paths can still be changed during `make install' with e.g.:

make install prefix=$(HOME)/local/sdcc

Of course this doesn't change the search paths compiled into the binaries.

Moreover the install path can be changed by defining DESTDIR range none pageformat default DESTDIR:

make install DESTDIR=$(HOME)/sdcc.rpm/

Please note that DESTDIR must have a trailing slash!

### Search Paths range none pageformat default Search path

Some search paths or parts of them are determined by configure variables (in *italics*, see section above). Further search paths are determined by environment variables during runtime.
The paths searched when running the compiler are as follows (the first catch wins):

1. Binary files (preprocessor, assembler and linker)

| Search path | default | Win32 builds |
| --- | --- | --- |
| $SDCC_HOME/ $PPREFIX2BIN_DIR | $SDCC_HOME/bin | $SDCC_HOME bin |
| Path of argv[0] (if available) | Path of argv[0] | Path of argv[0] |
| $PATH | $PATH | $PATH |
| $PATH | $PATH | $PATH |

2. Include files

| # | Search path | default | Win32 builds |
| --- | --- | --- | --- |
| 1 | - -I dir | - -I dir | - -I dir |
| 2 | $SDCC_INCLUDE | $SDCC_INCLUDE | $SDCC_INCLUDE |
| 3 | $SDCC_HOME/ $PREFIX2DATA_DIR/ $INCLUDE_DIR_SUFFIX | $SDCC_HOME/ share/sdcc/include | $SDCC_HOME include |
| 4 | path(argv[0])/ $BIN2DATADIR/ $INCLUDE_DIR_SUFFIX | path(argv[0])/../ sdcc/include | path(argv[0]).. include |
| 5 | $DATADIR/ $INCLUDE_DIR_SUFFIX | /usr/local/share/ sdcc/include | (not on Win32) |
| 6 | $SDCC_HOME/ $PREFIX2DATA_DIR/ non-free/ $INCLUDE_DIR_SUFFIX | $SDCC_HOME/share/ sdcc/non-free/include | $SDCC_HOME non-free include |
| 7 | path(argv[0])/ $BIN2DATADIR/ non-free/ $INCLUDE_DIR_SUFFIX | path(argv[0])/../ sdcc/non-free/include | path(argv[0]).. non-free include |
| 8 | $DATADIR/ non-free/ $INCLUDE_DIR_SUFFIX | /usr/local/share/ sdcc/non-free/include | (not on Win32) |
| 8 | $DATADIR/ non-free/ $INCLUDE_DIR_SUFFIX | /usr/local/share/ sdcc/non-free/include | (not on Win32) |

The option --nostdinc disables all search paths except #1 and #2.

3. Library files

With the exception of"--L dir" the *model* is auto-appended by the compiler (e.g. small, large, z80, ds390 etc.).

| # | Search path | default | Win32 builds |
| --- | --- | --- | --- |
| 1 | - -L dir | - -L dir | - -L dir |
| 2 | $SDCC_LIB/ | $SDCC_LIB/ | $SDCC_LIB/ |
| 3 | $SDCC_LIB | $SDCC_LIB | $SDCC_LIB |
| 4 | $SDCC_HOME/ $PREFIX2DATA_DIR/ $LIB_DIR_SUFFIX/ | $SDCC_HOME/ share/sdcc/lib/< model> | $SDCC_HOME lib |
| 5 | path(argv[0])/ $BIN2DATADIR/ $LIB_DIR_SUFFIX/ | path(argv[0])/../sdcc/ lib/ | path(argv[0]).. lib |
| 6 | $DATADIR/non-free/ $LIB_DIR_SUFFIX/ | /usr/local/share/sdcc/ lib/ | (not on Win32) |
| 7 | $SDCC_HOME/ $PREFIX2DATA_DIR/ non-free/ $LIB_DIR_SUFFIX/ | $SDCC_HOME/share/sdcc/ non-free/lib/ | $SDCC_HOME lib non-free |
| 8 | path(argv[0])/ $BIN2DATADIR/ non-free/ $LIB_DIR_SUFFIX/ | path(argv[0])/../sdcc/ non-free/lib/ | path(argv[0]).. lib non-free |
| 9 | $DATADIR/non-free/ $LIB_DIR_SUFFIX/ | /usr/local/share/sdcc/ non-free/lib/ | (not on Win32) |
| 9 | $DATADIR/non-free/ $LIB_DIR_SUFFIX/ | /usr/local/share/sdcc/ non-free/lib/ | (not on Win32) |

Don't delete any of the stray spaces in the table above without checking the HTML output (last line)!

The option --nostdlib disables all search paths except #1 and #2.

### Building SDCC range none pageformat default Building SDCC

SDCC can be built for various host platforms using the instructions provided below. Note that the PIC14 and PIC16 library folders in the source distribution contain Autotools-generated files. These are included for convenience and to avoid introducing Autotools as an additional dependency. They have to be regenerated in case of a version mismatch. Alternatively, the PIC backends can be disabled.

#### Building SDCC on Linux

1. ** Download the source package** either from the SDCC Subversion repository or from snapshot builds**, it will be named something like sdcc**-src**-yyyymmdd-rrrr.t** ar.** bz2** http://sdcc.sourceforge.net/snap.php.
2. ** Bring up a command line terminal, such as xterm.
3. ** Unpack the file using a command like:"tar -xvjf sdcc-src-yyyymmdd-rrrr.tar.bz2"**, this will create a sub-directory called sdcc with all of the sources.
4. Change directory into the main SDCC directory, for example type: **"cd sdcc** ".
5. ** Type"./configure** ". This configures the package for compilation on your system. When the treedec library is available, it should be found and used automatically (improving the compilation time / code quality trade-off). As of SDCC 3.7.0, the current develop branch from https://github.com/freetdi/tdlib is a suitable version of treedec.
6. ** Type"make** "**.** All of the source packages will compile, this can take a while.
7. ** Type"make install"** as root**.** This copies the binary executables, the include files, the libraries and the documentation to the install directories. Proceed with section Testing the SDCC Compiler.

#### Building SDCC on Mac OS X

Follow the instruction for Linux.

On Mac OS X 10.2.x it was reported, that the default gcc (version 3.1 20020420 (prerelease)) fails to compile SDCC. Fortunately there's also gcc 2.9.x installed, which works fine. This compiler can be selected by running 'configure' with:

./configure CC=gcc2 CXX=g++2

Universal (ppc and i386) binaries can be produced on Mac OS X 10.4.x with Xcode. Run 'configure' with:

./configure\

LDFLAGS="-Wl,-syslibroot,/Developer/SDKs/MacOSX10.4u.sdk -arch i386 -arch ppc"\

CXXFLAGS = "-O2 -isysroot /Developer/SDKs/MacOSX10.4u.sdk -arch i386 -arch ppc"\

CFLAGS = "-O2 -isysroot /Developer/SDKs/MacOSX10.4u.sdk -arch i386 -arch ppc"

#### Cross compiling SDCC on Linux for Windows

With the MinGW gcc cross compiler SDCC can be cross-compiled for Win32. See section 'Configure Options'. SDCC requires boost, but the header-only parts should be sufficient: Get a current boost tarball from www.boost.org, unpack it, and choose suitable configure options so the headers are found by the C++ compiler.

#### Building SDCC using Cygwin and Mingw32

For building and installing a Cygwin executable follow the instructions for Linux.

On Cygwin a" native" Win32-binary can be built, which will not need the Cygwin-DLL. For the necessary 'configure' options see section 'configure options' or the script 'sdcc/support/scripts/sdcc_cygwin_mingw32'.

In order to install Cygwin on Windows download setup.exe from www.cygwin.com http://www.cygwin.com/. Run it, set the" default text file type" to" unix" and download/install at least the following packages. Some packages are selected by default, others will be automatically selected because of dependencies with the manually selected packages. Never deselect these packages!

- flex
- bison
- gcc; version 3.x is fine, no need to use the old 2.9x
- binutils; selected with gcc
- make
- libboost-dev
- rxvt; a nice console, which makes life much easier under windoze (see below)
- man; not really needed for building SDCC, but you'll miss it sooner or later
- less; not really needed for building SDCC, but you'll miss it sooner or later
- svn; only if you use Subversion access
If you want to develop something you'll need:

- python; for the regression tests
- gdb; the gnu debugger, together with the nice GUI" insight"
- openssh; to access the CF or commit changes
- autoconf and autoconf-devel; if you want to fight with 'configure', don't use autoconf-stable!
rxvt is a nice console with history. Replace in your cygwin.bat the line

bash --login -i

with (one line):

rxvt -sl 1000 -fn "Lucida Console-12" -sr -cr red

-bg black -fg white -geometry 100x65 -e bash --login

Text selected with the mouse is automatically copied to the clipboard, pasting works with shift-insert.

The other good tip is to make sure you have no //c/-style paths anywhere, use /cygdrive/c/ instead. Using // invokes a network lookup which is very slow. If you think" cygdrive" is too long, you can change it with e.g.

mount -s -u -c /mnt

SDCC sources use the unix line ending LF. Life is much easier, if you store the source tree on a drive which is mounted in binary mode. And use an editor which can handle LF-only line endings. Make sure not to commit files with Windows line endings. The tabulator spacing range none pageformat default tabulator spacing (8 columns) used in the project is 8. Although a tabulator spacing of 8 is a sensible choice for programmers (it's a power of 2 and allows to display 8/16 bit signed variables without loosing columns) the plan is to move towards using only spaces in the source.

#### Building SDCC Using Microsoft Visual C++ 2010 (MSVC)

TODO: This section is outdated. Current SDCC requires features noit present in MSVC++ 2010. MSVC++ 2019 or newer is required.

** Download the source package** either from the SDCC Subversion repository or from the snapshot builds http://sdcc.sourceforge.net/snap.php**, it will be named something like sdcc**-src**-yyyymmdd-rrrr.tar.bz2.** SDCC is distributed with all the project, solution and other files you need to build it using Visual C++ 2010 (except for ucSim). The solution name is 'sdcc.sln'. Please note that as it is now, all the executables are created in a folder called sdcc\ bin_vc. Once built you need to copy the executables from sdcc\ bin_vc to sdcc\ bin before running SDCC.

Apart from the SDCC sources you also need to have the BOOST libraries installed for MSVC. Get it here http://www.boost.org/

In order to build SDCC with MSVC you need win32 executables of bison.exe, flex.exe, and gawk.exe. One good place to get them is here http://unxutils.sourceforge.net

If UnxUtils didn't work well, range none pageformat default msys msys (http://www.mingw.org/wiki/msys) or msys2 range none pageformat default msys2 (https://msys2.github.io) can be an alternative.

Download the file UnxUtils range none pageformat default UnxUtils.zip. Now you have to install the utilities and setup MSVC so it can locate the required programs. Here there are two alternatives (choose one!):

1. The easy way:

a) Extract UnxUtils.zip to your C:\ hard disk PRESERVING the original paths, otherwise bison won't work. (If you are using WinZip make certain that 'Use folder names' is selected)

b) Add 'C:\ user\ local\ wbin' to VC++ Directories / Executable Directories.

(As a side effect, you get a bunch of Unix utilities that could be useful, such as diff and patch.)
2. A more compact way:

This one avoids extracting a bunch of files you may not use, but requires some extra work:

a) Create a directory were to put the tools needed, or use a directory already present. Say for example 'C:\ util'.

b) Extract 'bison.exe', 'bison.hairy', 'bison.simple', 'flex.exe', and gawk.exe to such directory WITHOUT preserving the original paths. (If you are using WinZip make certain that 'Use folder names' is not selected)

c) Rename bison.exe to '_bison.exe'.

d) Create a batch file 'bison.bat' in 'C:\ util\ ' and add these lines:
set BISON_SIMPLE=C:\ util\ bison.simple
set BISON_HAIRY=C:\ util\ bison.hairy
_bison %1 %2 %3 %4 %5 %6 %7 %8 %9

Steps 'c' and 'd' are needed because bison requires by default that the files 'bison.simple' and 'bison.hairy' reside in some weird Unix directory, '/usr/local/share/' I think. So it is necessary to tell bison where those files are located if they are not in such directory. That is the function of the environment variables BISON_SIMPLE and BISON_HAIRY.

e) Add 'C:\ util' to VC++ Directories / Executable Directories. Note that you can use any other path instead of 'C:\ util', even the path where the Visual C++ tools are, probably: 'C:\ Program Files\ Microsoft Visual Studio\ Common\ Tools'. So you don't have to execute step 'e':)
That is it. Open 'sdcc.sln' in Visual Studio, click 'build all', when it finishes copy the executables from sdcc\ bin_vc to sdcc\ bin, and you can compile using SDCC.

#### Windows Install Using a ZIP Package

1. Download the binary zip package from http://sdcc.sf.net/snap.php and unpack it using your favorite unpacking tool (gunzip, WinZip, etc). This should unpack to a group of sub-directories. An example directory structure after unpacking the mingw32 package is: C:\ sdcc\ bin for the executables, C:\ sdcc\ include and C:\ sdcc\ lib for the include and libraries.
2. Adjust your environment variable PATH to include the location of the bin directory or start sdcc using the full path.

#### Windows Install Using the Setup Program

Download the setup program *sdcc-x.y.z-setup.exe* for an official release from
 http://sourceforge.net/projects/sdcc/files/ or a setup program for one of the snapshots *sdcc-yyyymmdd-xxxx-setup.exe* from http://sdcc.sourceforge.net/snap.php and execute it. A Windows typical installer will guide you through the installation process.

#### VPATH range none pageformat default VPATH feature

SDCC supports the VPATH feature provided by configure and make. It allows to separate the source and build trees. Here's an example:

cd ~ # cd $HOME

tar -xjf sdcc-src-yyyymmdd-rrrr.tar.bz2 # extract source to directory sdcc

mkdir sdcc.build # put output in sdcc.build

cd sdcc.build

../sdcc/configure # configure is doing all the magic!

make

That's it! **configure** will create the directory tree will all the necessary Makefiles in ~/sdcc.build. It automagically computes the variables srcdir, top_srcdir and top_buildir for each directory. After running **make** the generated files will be in ~/sdcc.build, while the source files stay in ~/sdcc.
This is not only usefull for building different binaries, e.g. when cross compiling. It also gives you a much better overview in the source tree when all the generated files are not scattered between the source files. And the best thing is: if you want to change a file you can leave the original file untouched in the source directory. Simply copy it to the build directory, edit it, enter `make clean', `rm Makefile.dep' and `make'. **make** will do the rest for you!

### Building the Documentation

Add --enable-doc to the configure arguments to build the documentation together with all the other stuff. You will need several tools (\SpecialChar LyX,, 2HTML, pdflatex, dvipdf, dvips and makeindex) to get the job done. Another possibility is to change to the doc directory and to type **" make"** there. You're invited to make changes and additions to this manual (sdcc/doc/sdccman.lyx). Using \SpecialChar LyX http://www.lyx.org as editor is straightforward. Prebuilt documentation is available from http://sdcc.sourceforge.net/snap.php.

### Reading the Documentation range none pageformat default Documentation

Currently, reading the document in PDF format is recommended, as for unknown reason the hyperlinks are working there whereas in the HTML version they are not If you should know why please drop us a note.
You'll find the PDF version range none pageformat default PDF version of this document at http://sdcc.sourceforge.net/doc/sdccman.pdf.
This documentation is in some aspects different from a commercial documentation:

- It tries to document SDCC for several processor architectures in one document (commercially these probably would be separate documents/products). This document range none pageformat default Status of documentation currently matches SDCC for mcs51 and DS390 best and does give too few information about f.e. Z80, PIC14, PIC16 and HC08.
- There are many references pointing away from this documentation. Don't let this distract you. If there f.e. was a reference like http://www.opencores.org together with a statement" some processors which are targeted by SDCC can be implemented in a *f* ield *p* rogrammable *g* ate *a* rray range none pageformat default FPGA (field programmable gate array)" or http://sourceforge.net/projects/fpgac/ range none pageformat default FpgaC ((subset of) C to FPGA compiler)" have you ever heard of an open source compiler that compiles a subset of C for an FPGA?" we expect you to have a quick look there and come back. If you read this you are on the right track.
- Some sections attribute more space to problems, restrictions and warnings than to the solution.
- The installation section and the section about the debugger is intimidating.
- There are still lots of typos and there are more different writing styles than pictures.

### Testing the SDCC Compiler

The first thing you should do after installing your SDCC compiler is to see if it runs. Type **"sdcc --version" range none pageformat default version** at the prompt, and the program should run and output its version like:
SDCC: mcs51/z80/z180/r2k/r2ka/r3ka/sm83/tlcs90/ez80_z80/z80n/r800/ds390/pic16/pic14/TININative/ds400/hc08/s08/stm8/pdk13/pdk14/pdk15/mos6502/mos65c02 4.4.0 #14546 (Linux)

If it doesn't run, or gives a message about not finding sdcc program, then you need to check over your installation. Make sure that the sdcc bin directory is in your executable search path defined by the PATH environment setting (** see** section Install Trouble-shooting** Install trouble-shooting for suggestions**). Make sure that the sdcc program is in the bin folder, if not perhaps something did not install correctly.

** SDCC** is commonly installed as described in section" Install and search paths".

** Make sure the compiler works on a very simple example. Type in the following test.c program using your favorite** ASCII** editor:
```c
char test;

void main(void) {
  test=0;
}
```

** Compile this using the following command:"sdcc -c test.c". If all goes well, the compiler will generate a test.asm and test.rel file. Congratulations, you've just compiled your first program with SDCC. We used the -c option to tell SDCC not to link the generated code, just to keep things simple for this step.**

** The next step is to try it with the linker. Type in"sdcc test.c** "**. If all goes well the compiler will link with the libraries and produce a test.ihx output file. If this step fails (no test.ihx, and the linker generates warnings), then the problem is most likely that** SDCC** cannot find the** /** usr/local/share/sdcc/lib directory (see** section Install Trouble-shooting** Install trouble-shooting for suggestions).**

** The final test is to ensure** SDCC** can use the** standard** header files and libraries. Edit test.c and change it to the following:
```c
#include <string.h>

char str1[10];

void main(void) {
  strcpy(str1, "testing");
}
```

** Compile this by typing"sdcc test.c"**. This should generate a test.ihx output file, and it should give no warnings such as not finding the string.h file. If it cannot find the string.h file, then the problem is that** SDCC** cannot find the /usr/local/share/sdcc/include directory (see the** section Install Trouble-shooting** Install trouble-shooting section for suggestions).** Use option **--print-search-dirs** range none pageformat default --print-search-dirs to find exactly where SDCC is looking for the include and lib files.

### Install Trouble-shooting range none pageformat default Install trouble-shooting

#### If SDCC does not build correctly

A thing to try is starting from scratch by unpacking the.tgz source package again in an empty directory. Configure it like:

**`./configure 2>&1 | tee configure.log`**

and build it like:

**`make 2>&1 | tee make.log`**

If anything goes wrong, you can review the log files to locate the problem. Or a relevant part of this can be attached to an email that could be helpful when requesting help from the mailing list.

#### What the"./configure" does

The"./configure" command is a script that analyzes your system and performs some configuration to ensure the source package compiles on your system. It will take a few minutes to run, and will compile a few tests to determine what compiler features are installed.

#### What the" make" does

This runs the GNU make tool, which automatically compiles all the source packages into the final installed binary executables.

#### What the" make install” command does.

This will install the compiler, other executables libraries and include files into the appropriate directories. See sections Install paths, Search Paths about install and search paths.
On most systems you will need super-user privileges to do this.

### Components of SDCC

SDCC is not just a compiler, but a collection of tools by various developers. These include linkers, assemblers, simulators and other components. Here is a summary of some of the components. Note that the included simulator and assembler have separate documentation which you can find in the source package in their respective directories. As SDCC grows to include support for other processors, other packages from various developers are included and may have their own sets of documentation.

You might want to look at the files which are installed in <installdir>. At the time of this writing, we find the following programs, among others, for gcc-builds:

In <installdir>/bin:

- sdcc - The compiler.
- sdcpp - The C preprocessor.
- sdas8051 - The assembler for 8051 type processors.
- sdas390 - The assembler for DS80C390 processor.
- sdasz80 **,** sdasgb - The Z80 and GameBoy Z80 assemblers.
- sdas6808 - The 6808 assembler.
- sdasstm8 - The STM8 assembler.
- sdld -The linker for 8051 and STM8 type processors.
- sdldz80 **,** sdldgb - The Z80 and GameBoy Z80 linkers.
- sdld6808 - The 6808 linker.
- ucsim_51, s51 - The ucSim 8051 simulator.
- ucsim_m68hc08 - The ucSim 6808 simulator.
- ucsim_stm8 - The ucSim STM8 simulator.
- ucsim_z80 - The ucSim Z80 simulator.
- sdcdb - The source debugger.
- sdar, sdranlib, sdnm, sdobjcopy - The sdcc archive managing and indexing utilites.
- packihx - A tool to pack (compress) Intel hex files.
- makebin - A tool to convert Intel Hex file to a binary and GameBoy binary image file format.
In <installdir>/share/sdcc/include

- the include files
In <installdir>/share/sdcc/non-free/include

- the non-free include files
In <installdir>/share/sdcc/lib

- the src and target subdirectories with the precompiled relocatables.
In <installdir>/share/sdcc/non-free/lib

- the src and target subdirectories with the non-free precompiled relocatables.
In <installdir>/share/sdcc/doc

- the documentation

#### sdcc - The Compiler

This is the actual compiler, it in turn uses the C-preprocessor and invokes the assembler and linkage editor.

#### sdcpp - The C-Preprocessor range none pageformat default Preprocessor

The preprocessor range none pageformat default sdcpp (preprocessor) is a modified version of the GNU cpp range none pageformat default cpp|see sdcpp preprocessor http://gcc.gnu.org/. The C preprocessor is used to pull in #include sources, process #ifdef statements, #defines and so on.

#### sdas, sdld - The Assemblers and Linkage Editors

This is a set of retargettable assemblers and linkage editors, which was developed by Alan Baldwin. John Hartman created the version for 8051, and I (Sandeep) have made some enhancements and bug fixes for it to work properly with SDCC.

SDCC used an about 1998 branch of asxxxx version 2.0 which unfortunately is not compatible with the more advanced (f.e. macros, more targets) ASxxxx Cross Assemblers nowadays available from Alan Baldwin https://shop-pdp.net/. In 2009 Alan made his ASxxxx Cross Assemblers version 5.0 available under the GPL license (GPLv3 or later), so a reunion is now a work in progress. Thanks Alan!

#### ucsim_51, ucsim_z80, ucsim_stm8 etc.- The Simulators

ucsim_51 (or s51) range none pageformat default s51 (simulator), ucsim_z80 range none pageformat default sz80 (simulator) ucsim_m68hc08 range none pageformat default shc08 (simulator) and ucsim_stm8 range none pageformat default sstm8 (simulator), as well as similarly named programs provided with SDCC, are free open source simulators developed by Daniel Drotos. The simulators are built as part of the build process. For more information visit Daniel's web site at: http://mazsola.iit.uni-miskolc.hu/~drdani/embedded/s51. It currently supports the core mcs51, the Dallas DS80C390, the Phillips XA51 family, the Z80, 6808 the STM8 and various others.

#### sdcdb - Source Level Debugger

SDCDB range none pageformat default SDCDB (debugger) is the companion source level debugger. More about SDCDB in section Debugging with SDCDB. The current version of the debugger uses Daniel's Simulator S51 range none pageformat default s51 (simulator), but can be easily changed to use other simulators.
