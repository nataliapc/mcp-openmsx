# Filename extensions used on MSX

|Extension|Description|Environment|
|:-:|:--|:--|
|ACC|Creator accompaniment data files||
|AGL|Sony Auto Graphic Loader files - see Sony HBI-V1 Video Digitizer cartridge||
|ARC|File(s) compressed in ARC format by System Enhancement Associates (SEA). Tools to extract are UNARC.COM (v1.6) and UNP.COM (v1.0 by Pierre Gielen).<br>The Unarchiver can be used to extract from this file. There are macOS and Windows/Linux versions.|MSX-DOS|
|ARC|File(s) compressed in Russian ARC format, incompatible with SEA's ARC format. Tools to extract are XARC.COM (v1.01) and ARCDE.COM (v1.03).|MSX-DOS|
|ARJ|File(s) compressed in ARJ format. Tool to extract are UNARC.COM (v1.10) and UNP.COM (v1.0 by Pierre Gielen).|MSX-DOS|
|APT|Studio FM pattern data file||
|ASC|Plain text (ASCII format) that can contain a BASIC program or data.|BASIC / Text editor|
|ASN|Assignment files for MIDI Blaster||
|BAS|BASIC program listing tokenized. These files can be executed from MSX-DOS with the BASIC name.bas command.|BASIC|
|BAT|Batch files (plain text) interpreted by MSX-DOS.|MSX-DOS|
|BGM|MuSICA binary music file. MuSICA is a software developed by ASCII to create music on 17 voices with PSG, FM and Konami's SCC.<br>We can use also the BGM player by (YMD)A or KINROU5 (by Masarun), an alternative driver to play the BGMs.|MuSICA driver, MSX-MUSIC, SCC, PSG|
|BGM|MSX-FAN music file. Not to be confused with MuSICA files. Songs in this format were contained in all their disk magazines, and later a specific player was released that even supported playback on MIDI.|MSPLAY(OPLL) / MSP(MIDI interface), MSX-DOS2|
|BGM|Bloadable MSX-MUSIC file created by the BIT2BGM.COM utility of Uwe Schröder that converts Synth Saurus musical files.|BGM.BIN driver, BASIC|
|BIN|Binary file created with the BASIC BSAVE instruction. Loads with BLOAD. The header have a length of 7 bytes (FEh + Start address + End address + execution address). It can contain machine language and data.<br>Many of these files can be executed from MSX-DOS with BINLOAD.COM (by MSX-Park) or BINLDR.COM (by gdx).|BASIC|
|BMP|Image file format native to Microsoft Windows. Best viewed with Deca BMP v1.25, aka DBMP.COM|MSX-DOS|
|BOK|MSX-View Picture book.|MSX View|
|BTM|Batch files supported by MSX-DOS 2 v.2.40 or later.|MSX-DOS 2|
|CAS|BIOS level cassette image for emulators, needs a separate tool to run or write to cassette. SofaCas allows to convert software on tape to CAS file and also play it using a homemade cable PC sound output to MSX cassette input. On MSX turbo R, we can use TRCAS (by Martos) to run CAS played by SofaCas.|MSX emulator / SofaCas|
|CH1|File created by Sony Character Editor||
|CMP|Compressed screen 5 image, including palette, created with DD-Graph.|Dot Designer's Graph (aka DD-Graph)|
|CMP|Compressed image, including palette, created with GIOS.|GIOS, aka Graphical Input/Output System|
|COM|Command containing a binary executable under MSX-DOS, CP/M or SymbOS<br>Can be also an executable file compressed with POPCOM.COM (v1.0 by Perpermint-Star).|MSX-DOS, CP/M, SymbOS|
|CPM|.COM file renamed to .CPM, either to be used in some CPM emulators, or to be able to workaround GMail's nanny protection against executable files. Just rename those back to .COM to be able to run them.|MSX-DOS, CP/M|
|DAT|File with data for Sony Animation Editor||
|DAT|Synthesizer configuration file for MIDI Blaster||
|DRM|File for the drums editor of the First Rate Music Hall tracker.||
|DSK|Disk image for emulators, needs a separate tool to run or write to normal disk.<br>Can be launched on real MSX with SofaRunit or using Nextor's EMUFILE command.|MSX-DOS, Nextor|
|DUA|Music-BOX dual data file (melody + sample)||
|EDI|File for the song editor of the First Rate Music Hall tracker.||
|EMx|Disk image for the floppy disk emulator (HDDEMU.COM) for MSX turbo R by Tsuyoshi. Internal structure is same as in DSK-files. Protected disks have additional information stored to files with HED-extension.|MSX-DOS|
|EVA|Video file in EVA format.|Video player|
|EVG|Yamaha SFG-05 event data file||
|EXE|Executable in SymbOS|SymbOS|
|FM|MSX-MUSIC BASIC file.|BASIC|
|FMP|MSX-MUSIC BASIC file.|BASIC|
|FMS|Synth Saurus sound file|Synth Saurus|
|FNT|Font file for the Scroll Power utility.||
|G9B|Library graphic format for GFX-9000.||
|GEx|x=5, 7 or 8. Synonym for .SCx, so check its description.|Image player|
|GEN|Plain text that contain Z80 assembly source code, used with GEN80 compiler|MSX-DOS|
|GIF|Graphics Interchange Format. They can be viewed with GIFI.COM (by Kakami Hiroyuki) and converted in MSX format with ENGIF.COM (v1.2 by Pierre Gielen) - See also SHOWEM.COM (by Steven van Loef) and GIFDUMP.COM (by Francesco Duranti)|MSX-DOS|
|GLx|Graph Saurus shape image file. Synonym to SHx, so check its description.|Graph Saurus, BASIC|
|GR5|Graphic file for Sony Animation Editor||
|GRA|Image file in QLD format. The viewer BLS.COM (v3.0a by SEIGA & FRS) supports it. Requires a complementary .RGB file that contains the palette.|MSX-DOS|
|GRP|Synonym for .SC2. See the .SCx file description.<br>Can also be a compressed image for Graph Saurus.|BASIC / Graph Saurus|
|GZ|File compressed in GZIP format by PC gzipers. Tool to extract is GUNZIP.COM.|MSX-DOS|
|HLP|MSX-DOS 2 help file (plain text)|MSX-DOS 2|
|INS|File for the instruments editor of the First Rate Music Hall tracker.||
|IPS|Patch for file. Needs IPS patcher.|MSX-DOS|
|ISH|Binary-to-text converted file encoded and decodable by Ish available from MSX・FAN disk #1.	|MSX-DOS|
|JPG|Compressed image file in format JPEG. Some viewers can show image up to 1024x1024: JPD.COM (v0.23 by APi), JLD.COM (v1.11 by SEIGA). JPEG file can be produced on MSX from SCREEN 12 images with JSV.COM (v0.1 by SEIGA).|MSX-DOS 2|
|KSS|MSX music file that contains also player code. Use KSSPLAY.COM (by NYYRIKKI) to play it.|MSX-DOS|
|LDR|Tokenized Basic file usually BASIC program LoaDeR used to load and run a program consisting of several BAS files.|BASIC|
|LHA|File(s) compressed in LHA format. Tools to create a LHA archive are LHPACK.COM (v1.03 by H.Saito) or LHA.COM (v1.05a by Kyouju). Tools to extract are PMM.COM (v1.20 by Iita), LHARC.COM and LHEXT.COM (v1.33 by Kyouju).<br>The Unarchiver can be used to extract from this file. There are macOS and Windows/Linux versions.|MSX-DOS|
|LPF|Loop file for the Scroll Power utility.||
|LZH|Synonym for LHA.|MSX-DOS|
|MAG|Maki-chan V2 image file also extensively used on PC-9801 and Sharp X68000. Best viewed with Deca MAG v1.25, aka DMAG.COM. The v1.25a patched to support the MSX2 can be downloaded here.|MSX-DOS|
|MAX|Synonym for MAG.|MSX-DOS|
|MBK|Samplekit file for the music tracker MoonBlaster.||
|MBM|Music file for the music tracker MoonBlaster.||
|MBS|Sample file for the music tracker MoonBlaster.||
|MBV|Voice file for the music tracker MoonBlaster.||
|MBW|Wave song for the music tracker MoonBlaster.|MoonSound|
|MCM|Micro Cabin music file. Played by MCDRV.EXE|MSX-DOS|
|MDT|MSX Music-System music data file||
|MDX|Music file in a format designed for Sharp X68000. These files can be played by MPX2.COM (when driver installed with MXDRV.COM). Optional PDX files are PCM samples. Require the YAMAHA SFG-01/05 cartridge or the MFP PCM cartridge.|MSX-DOS 2, MDX Driver, 256kB~ of RAM|
|MEG|Plain text that contain Z80 assembly MegaAssembler source code. Extension also used for Mega-Rom images.|MSX-DOS|
|MEL|Music-BOX melody data file||
|MFM|FM song for MoonBlaster.|MoonSound|
|MGS|Music file in format developed by AIN. Played by MGSEL.COM (when driver installed with MGSDRV.COM).|MSX-DOS 2, MGS driver, YM-2413/OPLL, SCC|
|MID|Standard MIDI file (can be played using MIDI-interface or MoonSound software)|Various|
|MIF|Compressed image file.|Various|
|MIO|MIODRV Music file. Played by MIODRV Player.||
|MKI|Maki-chan V1 image file maintly used on Sharp X68000. Viewable with BLS.COM (v3.0a by SEIGA & FRS)|MSX-DOS|
|MOD|Amiga MOD file (can be played on MSX turbo R or MoonSound)|MSX-DOS|
|MP3|MPEG Audio Layer III file. MP3s can be played with Sunrise MP3 player, MPX Cartridge r1.1 by Junsoft or SE-ONE by TMT logic.||
|MPK|Music Player K-kaz song. Require WAMPK Player|MSX-DOS|
|MSx|Synth Saurus score file|Synth Saurus|
|MSD|MuSICA source music file (MML). We can also use KINROU4 (by Masarun), an alternative compiler.|MSX-DOS|
|MSQ|File created by Sony Realtime Keyboard Recorder||
|MUE|HAL Music Editor MUE music file. There's a patch to add mouse support here.|Cartridge|
|MUS|FAC Soundtracker music file||
|MUS|MGSDRV source MML file. Needs to be compiled to a MGS file with MGSC.COM. OTOH, MGSCR.COM can decompile MGS files back to the MUS source.|MSX-DOS2|
|MUS|Studio FM music file (not recommended)||
|MWK|MoonSound Wave sample kit||
|MWM|MoonBlaster for MoonSound Wave song||
|OPX|OPLL driver music format||
|OTO|File created by Sony Musical PSG Keyboard||
|PAC|Dump of SRAM contents (save games) of PAC or FM-PAC cartridge.||
|PAT|Studio FM pattern file||
|PCM|Sound sample file for MSX turbo R.||
|PCK|Packaged file for First Rate Music Hall tracker. Includes 4 songs with all instruments and drums data.||
|PCT|Dynamic Publisher page files.|Dynamic Publisher|
|PDT|File created by Sony Raku Raku Animation Editor||
|PDX|Optional PCM sample file used with an MDX file. You can play a PDX with PDXLOAD.COM by AIN. See also MDX extension.|MSX-DOS 2, MDX Driver, 256kB~ of RAM|
|PI|Yanagisawa's PI. A Japanese 16 color image format used on PC-98 and X68000. Viewable on the MSX with PI.COM v0.07|MSX-DOS2|
|PIC|SCREEN8 binary image. Synonym for .SC8, so check the .SCx description.|Philips Video Graph, Matsushita Video Graphics|
|PIC|Yanagisawa's PIC: A Japanese multi-platform image format with support for 16, 256 colors, 32768 or 65536 colors. Used on X68000, PC-98VA, FM-Towns, macOS classic and MSX2. Viewable on the MSX with BLS.COM (v3.0a by SEIGA & FRS)|MSX-DOS|
|PLx|Indexed Palette file in Raw format.<br>The Graph Saurus version (contains 8 sets of palettes with two bytes by color in RG 0B format). It's a companion for the respective .SRx or GLx files, so the respective pair must always be copied together.<br>There's also the single palette version, that is a companion file for .SHx images to customize their colors.<br>In both cases, it's never used for SCREEN8 and SCREEN12 images since these modes have no indexed palette support for the background.|Graph Saurus, BASIC|
|PMA|File(s) compressed in PMARC format. Tools to create an archive are PMARC.COM, PMARC2.COM (v2.0 by Sybex) and UNP.COM (v1.0 by Pierre Gielen). Tools to extract are PMM.COM (v1.20 by Iita), PMEXE.COM (v2.0) and PMEXT.COM (v2.22). PMEXT has been ported on Windows (v1.21 by Yoshihiko Mino).<br>TheUnarchiver can be used to extract from this file. There are macOS and Windows/Linux versions.|CP/M, MSX-DOS|
|PRO|Music file for Pro-Tracker (by Tyfoon Soft).|BASIC|
|PSG|PSG Sampler sample file.|PSG soundchip|
|Q4|XLD4 is an image file for the PC-98. Viewable on the MSX with XLD4.COM by SEIGA.|MSX-DOS2|
|Q4D|Text file with a description for the respective XLD4 image file. Encoded in Shift-JIS.|MSX-DOS2|
|RDT|MSX Music-System rhythm data file||
|RLT|Music Creator real time data files||
|ROM|Raw ROM image dump. Used by ROM loaders or emulators.|MSX-DOS / MSX emulator|
|RTM|Synth Saurus rhythm file|Synth Saurus|
|S1x|Contains the odd lines of an interlace image. For more info, see the SCx file.||
|S3M|See MOD file.||
|SAM|Music-BOX sample data file (used as drumkit file in Music Creator)||
SBM<br>SBK<br>SBP|Music data for SCC and PSG soundchips.|SCC-Blaffer NT, SCC, PSG|
|SBS|Instruments data for SCC and PSG soundchips.|SCC-Blaffer NT, SCC, PSG|
|SCx|Standard MSX-BASIC BLOAD image format, where 'x' is the screen mode, ranging from 0 to 8, A, B or C. It can optionally have a companion .S1x file that will contain the extra interlaced lines to double the vertical resolution.<br>It's the most common image format used on the MSX, used by the BASIC and many image editors. It can be viewed with BLS.COM (v3.0a by SEIGA & FRS).|BASIC|
|SCR|Screen-2 image created with Graphos III. It's an executable file with a loader that produces an effect. Loadable on MSX-BASIC with BLOAD"file",R.|Graphos III, BASIC|
|SCR|Compressed image (screen 5 to 8) created with Graphics Editor Halos from Halnote, Handy scanner software, Graphic Studio Pro, etc. (HAL Laboratory/Sony)||
|SDT|MSX Music-System sound data file (= voice data)||
|SDT|SCMD Music file for MSX made a MML compiler for Windows. The player is SC.COM.|MSX-DOS|
|SEE|Sound Effect data. (Shareware by Fuzzy Logic)|Sound Effect Editor, PSG soundchip|
|SEQ|Music Creator sequence data files||
|SFM|Studio FM music file||
|SHx|Standard MSX-BASIC COPY image format, where 'x' is the screen mode, ranging from 5 to 8, A, B or C. It can optionally have a companion .PLx file containing one or 8 palettes to customize the colors.<br>It's the 2nd most common image format used on the MSX, used by the BASIC and many image editors. It can be viewed with BLS.COM (v3.0a by SEIGA & FRS).|BASIC|
|SMx|FAC Soundtracker sample file||
|SMP|Sample file for Covox/SIMPL or MSX turbo R||
|SNG|Music file for the music editor SCC-Musixx by Tyfoon Soft.|BASIC, SCC soundchip|
|SPx|File created by Sony sprite editors||
|SPT|Music Creator step time data files||
|SPT|Text file for the Scroll Power utility.||
|SRx|Graph Saurus Image file. Requires the respective .PLx file. Can be optionally compressed with run-lenght. Uncompressed files can be loaded on MSX-BASIC with a BLOAD"FILE.SRx",S, but the external palette will have to be loaded with OPEN#1. (length: 0~6A00h/0D400h). Both compressed and uncompressed versions can also be viewed with BLS.COM (v3.0a by SEIGA & FRS).|Graph Saurus|
|STP|Dynamic Publisher stamp files. Contains an image that can be loaded on a page (.STP). Synonym for .GL6, so see the .GLx description.|Dynamic Publisher, BASIC|
|TIx|Graph Saurus tile file.|Graph Saurus|
|TSR|Terminate and Stay Resident programs to be used with MemMan 2.0 and higher.|MemMan|
|TXT|Plain text file generaly coded in ASCII, Ank or Shift-JIS.|Text editor / viewer|
|VCD|Voice file for the MSX Voice Recorder (HAL Laboratory)||
|VCD|MuSICA voice file|MuSICA driver|
|VGM|Music file that supports many sound chips, playable by VGMPLAY.COM (by Laurens Holst)|MSX-DOS|
|VOC|Music Creator voice data files||
|VOC|Studio FM voice data file||
|VOG|Yamaha SFG-05 voice data file||
|WAV|Sound sample file. Can be played with the MPX Cartridge r1.1 by Junsoft.||
|WB|Assembler Project file. For the The WBASS2 Z80 Assembler.||
|XM|See MOD file.||
|XPC|Rom Patch file for EXECROM.COM (A&L Software). EXECROM patches the Rom on the fly.|MSX-DOS|
|ZIP|File(s) compressed in ZIP format by PC zipers. The best tool to extract is SUZ.COM (v1.3 by Loutrax).|MSX-DOS|
|ﾃｷｽ|Japanese transliteration of TXT used in Disc Station.|Text editor / viewer|
|ﾃﾞﾀ|Japanese transliteration of DAT used in Disc Station.||
|ﾄﾞｸ|Japanese transliteration of DOC used with text files in Disc Station.|Text editor / viewer|
|ﾊﾞｽ|Japanese transliteration of BAS used in Disc Station and several other disks. A file with this extension is usually an Easter egg that has to be executed independently.|BASIC|
|ﾊﾞｯ|Japanese transliteration of BAT used in Disc Station.|MSX-DOS|
|ﾋﾞﾝ|Japanese transliteration of BIN used in Disc Station.||
