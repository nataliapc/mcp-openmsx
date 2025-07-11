# Z80 / R800 instruction set  

This is an overview of the Z80 instruction set, including undocumented instructions and the R800 `MULUB` and `MULUW` instructions. Refer to the Z80 user manual for a detailed explanation of the instruction set. For more information on undocument instructions, refer to Sean Young’s extensive [The Undocumented Z80 Documented](msxdocs://processors/z80-undocumented).

For Z80 timing calculations on MSX, refer to the Z80+M1 column which includes the M1 waits. For more information, see the [wait cycles](#wait-cycles) section.

- [Instruction set](#instruction-set)
- [Legend](#legend)
- [Wait cycles](#wait-cycles)

## Instruction set

| Instruction | Timing Z80 | Timing Z80+M1 | Timing R800 | Timing R800 + wait [¹](#note-1) | Opcode | Size |
|---|---|---|---|---|---|---|
|ADC A,(HL)|7|8|2|4|8E|1|
|ADC A,(IX+o)|19|21|5|7|DD 8E o|3|
|ADC A,(IY+o)|19|21|5|7|FD 8E o|3|
|ADC A,n|7|8|2|2|CE n|2|
|ADC A,r|4|5|1|1|88+r|1|
|ADC A,IXp|8|10|2|2|DD 88+p|2|
|ADC A,IYq|8|10|2|2|FD 88+q|2|
|ADC HL,BC|15|17|2|2|ED 4A|2|
|ADC HL,DE|15|17|2|2|ED 5A|2|
|ADC HL,HL|15|17|2|2|ED 6A|2|
|ADC HL,SP|15|17|2|2|ED 7A|2|
|ADD A,(HL)|7|8|2|4|86|1|
|ADD A,(IX+o)|19|21|5|7|DD 86 o|3|
|ADD A,(IY+o)|19|21|5|7|FD 86 o|3|
|ADD A,n|7|8|2|2|C6 n|2|
|ADD A,r|4|5|1|1|80+r|1|
|ADD A,IXp|8|10|2|2|DD 80+p|2|
|ADD A,IYq|8|10|2|2|FD 80+q|2|
|ADD HL,BC|11|12|1|1|09|1|
|ADD HL,DE|11|12|1|1|19|1|
|ADD HL,HL|11|12|1|1|29|1|
|ADD HL,SP|11|12|1|1|39|1|
|ADD IX,BC|15|17|2|2|DD 09|2|
|ADD IX,DE|15|17|2|2|DD 19|2|
|ADD IX,IX|15|17|2|2|DD 29|2|
|ADD IX,SP|15|17|2|2|DD 39|2|
|ADD IY,BC|15|17|2|2|FD 09|2|
|ADD IY,DE|15|17|2|2|FD 19|2|
|ADD IY,IY|15|17|2|2|FD 29|2|
|ADD IY,SP|15|17|2|2|FD 39|2|
|AND (HL)|7|8|2|4|A6|1|
|AND (IX+o)|19|21|5|7|DD A6 o|3|
|AND (IY+o)|19|21|5|7|FD A6 o|3|
|AND n|7|8|2|2|E6 n|2|
|AND r|4|5|1|1|A0+r|1|
|AND IXp|8|10|2|2|DD A0+p|2|
|AND IYq|8|10|2|2|FD A0+q|2|
|BIT b,(HL)|12|14|3|5|CB 46+8\*b|2|
|BIT b,(IX+o)|20|22|5|7|DD CB o 46+8\*b|4|
|BIT b,(IY+o)|20|22|5|7|FD CB o 46+8\*b|4|
|BIT b,r|8|10|2|2|CB 40+8\*b+r|2|
|CALL nn|17|18|5|8/7 [²](#note-2)|CD nn nn|3|
|CALL C,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|DC nn nn|3|
|CALL M,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|FC nn nn|3|
|CALL NC,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|D4 nn nn|3|
|CALL NZ,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|C4 nn nn|3|
|CALL P,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|F4 nn nn|3|
|CALL PE,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|EC nn nn|3|
|CALL PO,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|E4 nn nn|3|
|CALL Z,nn|17/10|18/11|5/3|8/7/3 [²](#note-2)|CC nn nn|3|
|CCF|4|5|1|1|3F|1|
|CP (HL)|7|8|2|4|BE|1|
|CP (IX+o)|19|21|5|7|DD BE o|3|
|CP (IY+o)|19|21|5|7|FD BE o|3|
|CP n|7|8|2|2|FE n|2|
|CP r|4|5|1|1|B8+r|1|
|CP IXp|8|10|2|2|DD B8+p|2|
|CP IYq|8|10|2|2|FD B8+q|2|
|CPD|16|18|4|6|ED A9|2|
|CPDR|21/16|23/18|5|?/8|ED B9|2|
|CPI|16|18|4|6|ED A1|2|
|CPIR|21/16|23/18|5|?/8|ED B1|2|
|CPL|4|5|1|1|2F|1|
|DAA|4|5|1|1|27|1|
|DEC (HL)|11|12|4|7|35|1|
|DEC (IX+o)|23|25|7|10|DD 35 o|3|
|DEC (IY+o)|23|25|7|10|FD 35 o|3|
|DEC A|4|5|1|1|3D|1|
|DEC B|4|5|1|1|05|1|
|DEC BC|6|7|1|1|0B|1|
|DEC C|4|5|1|1|0D|1|
|DEC D|4|5|1|1|15|1|
|DEC DE|6|7|1|1|1B|1|
|DEC E|4|5|1|1|1D|1|
|DEC H|4|5|1|1|25|1|
|DEC HL|6|7|1|1|2B|1|
|DEC IX|10|12|2|2|DD 2B|2|
|DEC IY|10|12|2|2|FD 2B|2|
|DEC IXp|8|10|2|2|DD 05+8\*p|2|
|DEC IYq|8|10|2|2|FD 05+8\*q|2|
|DEC L|4|5|1|1|2D|1|
|DEC SP|6|7|1|1|3B|1|
|DI|4|5|2|2|F3|1|
|DJNZ o|13/8|14/9|3/2|3/2|10 o|2|
|EI|4|5|1|1|FB|1|
|EX (SP),HL|19|20|5|7|E3|1|
|EX (SP),IX|23|25|6|8|DD E3|2|
|EX (SP),IY|23|25|6|8|FD E3|2|
|EX AF,AF'|4|5|1|1|08|1|
|EX DE,HL|4|5|1|1|EB|1|
|EXX|4|5|1|1|D9|1|
|HALT|4|5|2|2|76|1|
|IM 0|8|10|3|3|ED 46|2|
|IM 1|8|10|3|3|ED 56|2|
|IM 2|8|10|3|3|ED 5E|2|
|IN A,(C)|12|14|3|10/9 [³](#note-3)|ED 78|2|
|IN A,(n)|11|12|3|10/9 [³](#note-3)|DB n|2|
|IN B,(C)|12|14|3|10/9 [³](#note-3)|ED 40|2|
|IN C,(C)|12|14|3|10/9 [³](#note-3)|ED 48|2|
|IN D,(C)|12|14|3|10/9 [³](#note-3)|ED 50|2|
|IN E,(C)|12|14|3|10/9 [³](#note-3)|ED 58|2|
|IN H,(C)|12|14|3|10/9 [³](#note-3)|ED 60|2|
|IN L,(C)|12|14|3|10/9 [³](#note-3)|ED 68|2|
|IN F,(C)|12|14|3|10/9 [³](#note-3)|ED 70|2|
|INC (HL)|11|12|4|7|34|1|
|INC (IX+o)|23|25|7|10|DD 34 o|3|
|INC (IY+o)|23|25|7|10|FD 34 o|3|
|INC A|4|5|1|1|3C|1|
|INC B|4|5|1|1|04|1|
|INC BC|6|7|1|1|03|1|
|INC C|4|5|1|1|0C|1|
|INC D|4|5|1|1|14|1|
|INC DE|6|7|1|1|13|1|
|INC E|4|5|1|1|1C|1|
|INC H|4|5|1|1|24|1|
|INC HL|6|7|1|1|23|1|
|INC IX|10|12|2|2|DD 23|2|
|INC IY|10|12|2|2|FD 23|2|
|INC IXp|8|10|2|2|DD 04+8\*p|2|
|INC IYq|8|10|2|2|FD 04+8\*q|2|
|INC L|4|5|1|1|2C|1|
|INC SP|6|7|1|1|33|1|
|IND|16|18|4|12/11 [³](#note-3)|ED AA|2|
|INDR|21/16|23/18|4/3|?/12/11 [³](#note-3)|ED BA|2|
|INI|16|18|4|12/11 [³](#note-3)|ED A2|2|
|INIR|21/16|23/18|4/3|?/12/11 [³](#note-3)|ED B2|2|
|JP nn|10|11|3|5|C3 nn nn|3|
|JP (HL)|4|5|1|3|E9|1|
|JP (IX)|8|10|2|4|DD E9|2|
|JP (IY)|8|10|2|4|FD E9|2|
|JP C,nn|10|11|3|5/3|DA nn nn|3|
|JP M,nn|10|11|3|5/3|FA nn nn|3|
|JP NC,nn|10|11|3|5/3|D2 nn nn|3|
|JP NZ,nn|10|11|3|5/3|C2 nn nn|3|
|JP P,nn|10|11|3|5/3|F2 nn nn|3|
|JP PE,nn|10|11|3|5/3|EA nn nn|3|
|JP PO,nn|10|11|3|5/3|E2 nn nn|3|
|JP Z,nn|10|11|3|5/3|CA nn nn|3|
|JR o|12|13|3|3|18 o|2|
|JR C,o|12/7|13/8|3/2|3/2|38 o|2|
|JR NC,o|12/7|13/8|3/2|3/2|30 o|2|
|JR NZ,o|12/7|13/8|3/2|3/2|20 o|2|
|JR Z,o|12/7|13/8|3/2|3/2|28 o|2|
|LD (BC),A|7|8|2|4|02|1|
|LD (DE),A|7|8|2|4|12|1|
|LD (HL),n|10|11|3|5|36 n|2|
|LD (HL),r|7|8|2|4|70+r|1|
|LD (IX+o),n|19|21|5|7|DD 36 o n|4|
|LD (IX+o),r|19|21|5|7|DD 70+r o|3|
|LD (IY+o),n|19|21|5|7|FD 36 o n|4|
|LD (IY+o),r|19|21|5|7|FD 70+r o|3|
|LD (nn),A|13|14|4|6|32 nn nn|3|
|LD (nn),BC|20|22|6|8|ED 43 nn nn|4|
|LD (nn),DE|20|22|6|8|ED 53 nn nn|4|
|LD (nn),HL|16|17|5|7|22 nn nn|3|
|LD (nn),IX|20|22|6|8|DD 22 nn nn|4|
|LD (nn),IY|20|22|6|8|FD 22 nn nn|4|
|LD (nn),SP|20|22|6|8|ED 73 nn nn|4|
|LD A,(BC)|7|8|2|4|0A|1|
|LD A,(DE)|7|8|2|4|1A|1|
|LD A,(HL)|7|8|2|4|7E|1|
|LD A,(IX+o)|19|21|5|7|DD 7E o|3|
|LD A,(IY+o)|19|21|5|7|FD 7E o|3|
|LD A,(nn)|13|14|4|6|3A nn nn|3|
|LD A,r|4|5|1|1|78+r|1|
|LD A,IXp|8|10|2|2|DD 78+p|2|
|LD A,IYq|8|10|2|2|FD 78+q|2|
|LD A,I|9|11|2|2|ED 57|2|
|LD A,R|9|11|2|2|ED 5F|2|
|LD B,(HL)|7|8|2|4|46|1|
|LD B,(IX+o)|19|21|5|7|DD 46 o|3|
|LD B,(IY+o)|19|21|5|7|FD 46 o|3|
|LD B,n|7|8|2|2|06 n|2|
|LD B,r|4|5|1|1|40+r|1|
|LD B,IXp|8|10|2|2|DD 40+p|2|
|LD B,IYq|8|10|2|2|FD 40+q|2|
|LD BC,(nn)|20|22|6|8|ED 4B nn nn|4|
|LD BC,nn|10|11|3|3|01 nn nn|3|
|LD C,(HL)|7|8|2|4|4E|1|
|LD C,(IX+o)|19|21|5|7|DD 4E o|3|
|LD C,(IY+o)|19|21|5|7|FD 4E o|3|
|LD C,n|7|8|2|2|0E n|2|
|LD C,r|4|5|1|1|48+r|1|
|LD C,IXp|8|10|2|2|DD 48+p|2|
|LD C,IYq|8|10|2|2|FD 48+q|2|
|LD D,(HL)|7|8|2|4|56|1|
|LD D,(IX+o)|19|21|5|7|DD 56 o|3|
|LD D,(IY+o)|19|21|5|7|FD 56 o|3|
|LD D,n|7|8|2|2|16 n|2|
|LD D,r|4|5|1|1|50+r|1|
|LD D,IXp|8|10|2|2|DD 50+p|2|
|LD D,IYq|8|10|2|2|FD 50+q|2|
|LD DE,(nn)|20|22|6|8|ED 5B nn nn|4|
|LD DE,nn|10|11|3|3|11 nn nn|3|
|LD E,(HL)|7|8|2|4|5E|1|
|LD E,(IX+o)|19|21|5|7|DD 5E o|3|
|LD E,(IY+o)|19|21|5|7|FD 5E o|3|
|LD E,n|7|8|2|2|1E n|2|
|LD E,r|4|5|1|1|58+r|1|
|LD E,IXp|8|10|2|2|DD 58+p|2|
|LD E,IYq|8|10|2|2|FD 58+q|2|
|LD H,(HL)|7|8|2|4|66|1|
|LD H,(IX+o)|19|21|5|7|DD 66 o|3|
|LD H,(IY+o)|19|21|5|7|FD 66 o|3|
|LD H,n|7|8|2|2|26 n|2|
|LD H,r|4|5|1|1|60+r|1|
|LD HL,(nn)|16|17|5|7|2A nn nn|3|
|LD HL,nn|10|11|3|3|21 nn nn|3|
|LD I,A|9|11|2|2|ED 47|2|
|LD IX,(nn)|20|22|6|8|DD 2A nn nn|4|
|LD IX,nn|14|16|4|4|DD 21 nn nn|4|
|LD IXh,n|11|13|3|3|DD 26 n|3|
|LD IXh,p|8|10|2|2|DD 60+p|2|
|LD IXl,n|11|13|3|3|DD 2E n|3|
|LD IXl,p|8|10|2|2|DD 68+p|2|
|LD IY,(nn)|20|22|6|8|FD 2A nn nn|4|
|LD IY,nn|14|16|4|4|FD 21 nn nn|4|
|LD IYh,n|11|13|3|3|FD 26 n|3|
|LD IYh,q|8|10|2|2|FD 60+q|2|
|LD IYl,n|11|13|3|3|FD 2E n|3|
|LD IYl,q|8|10|2|2|FD 68+q|2|
|LD L,(HL)|7|8|2|4|6E|1|
|LD L,(IX+o)|19|21|5|7|DD 6E o|3|
|LD L,(IY+o)|19|21|5|7|FD 6E o|3|
|LD L,n|7|8|2|2|2E n|2|
|LD L,r|4|5|1|1|68+r|1|
|LD R,A|9|11|2|2|ED 4F|2|
|LD SP,(nn)|20|22|6|8|ED 7B nn nn|4|
|LD SP,HL|6|7|1|1|F9|1|
|LD SP,IX|10|12|2|2|DD F9|2|
|LD SP,IY|10|12|2|2|FD F9|2|
|LD SP,nn|10|11|3|3|31 nn nn|3|
|LDD|16|18|4|7|ED A8|2|
|LDDR|21/16|23/18|4|?/7|ED B8|2|
|LDI|16|18|4|7|ED A0|2|
|LDIR|21/16|23/18|4|?/7|ED B0|2|
|MULUB A,r|||14|14|ED C1+8\*r|2|
|MULUW HL,BC|||36|36|ED C3|2|
|MULUW HL,SP|||36|36|ED F3|2|
|NEG|8|10|2|2|ED 44|2|
|NOP|4|5|1|1|00|1|
|OR (HL)|7|8|2|4|B6|1|
|OR (IX+o)|19|21|5|7|DD B6 o|3|
|OR (IY+o)|19|21|5|7|FD B6 o|3|
|OR n|7|8|2|2|F6 n|2|
|OR r|4|5|1|1|B0+r|1|
|OR IXp|8|10|2|2|DD B0+p|2|
|OR IYq|8|10|2|2|FD B0+q|2|
|OTDR|21/16|23/18|4/3|?/12/11 [³](#note-3)|ED BB|2|
|OTIR|21/16|23/18|4/3|?/12/11 [³](#note-3)|ED B3|2|
|OUT (C),A|12|14|3|10/9 [³](#note-3)|ED 79|2|
|OUT (C),B|12|14|3|10/9 [³](#note-3)|ED 41|2|
|OUT (C),C|12|14|3|10/9 [³](#note-3)|ED 49|2|
|OUT (C),D|12|14|3|10/9 [³](#note-3)|ED 51|2|
|OUT (C),E|12|14|3|10/9 [³](#note-3)|ED 59|2|
|OUT (C),H|12|14|3|10/9 [³](#note-3)|ED 61|2|
|OUT (C),L|12|14|3|10/9 [³](#note-3)|ED 69|2|
|OUT (n),A|11|12|3|10/9 [³](#note-3)|D3 n|2|
|OUTD|16|18|4|12/11 [³](#note-3)|ED AB|2|
|OUTI|16|18|4|12/11 [³](#note-3)|ED A3|2|
|POP AF|10|11|3|5|F1|1|
|POP BC|10|11|3|5|C1|1|
|POP DE|10|11|3|5|D1|1|
|POP HL|10|11|3|5|E1|1|
|POP IX|14|16|4|6|DD E1|2|
|POP IY|14|16|4|6|FD E1|2|
|PUSH AF|11|12|4|6|F5|1|
|PUSH BC|11|12|4|6|C5|1|
|PUSH DE|11|12|4|6|D5|1|
|PUSH HL|11|12|4|6|E5|1|
|PUSH IX|15|17|5|7|DD E5|2|
|PUSH IY|15|17|5|7|FD E5|2|
|RES b,(HL)|15|17|5|8|CB 86+8\*b|2|
|RES b,(IX+o)|23|25|7|10|DD CB o 86+8\*b|4|
|RES b,(IY+o)|23|25|7|10|FD CB o 86+8\*b|4|
|RES b,r|8|10|2|2|CB 80+8\*b+r|2|
|RET|10|11|3|5|C9|1|
|RET C|11/5|12/6|3/1|5/1|D8|1|
|RET M|11/5|12/6|3/1|5/1|F8|1|
|RET NC|11/5|12/6|3/1|5/1|D0|1|
|RET NZ|11/5|12/6|3/1|5/1|C0|1|
|RET P|11/5|12/6|3/1|5/1|F0|1|
|RET PE|11/5|12/6|3/1|5/1|E8|1|
|RET PO|11/5|12/6|3/1|5/1|E0|1|
|RET Z|11/5|12/6|3/1|5/1|C8|1|
|RETI|14|16|5|7|ED 4D|2|
|RETN|14|16|5|7|ED 45|2|
|RL (HL)|15|17|5|8|CB 16|2|
|RL (IX+o)|23|25|7|10|DD CB o 16|4|
|RL (IY+o)|23|25|7|10|FD CB o 16|4|
|RL r|8|10|2|2|CB 10+r|2|
|RLA|4|5|1|1|17|1|
|RLC (HL)|15|17|5|8|CB 06|2|
|RLC (IX+o)|23|25|7|10|DD CB o 06|4|
|RLC (IY+o)|23|25|7|10|FD CB o 06|4|
|RLC r|8|10|2|2|CB 00+r|2|
|RLCA|4|5|1|1|07|1|
|RLD|18|20|5|8|ED 6F|2|
|RR (HL)|15|17|5|8|CB 1E|2|
|RR (IX+o)|23|25|7|10|DD CB o 1E|4|
|RR (IY+o)|23|25|7|10|FD CB o 1E|4|
|RR r|8|10|2|2|CB 18+r|2|
|RRA|4|5|1|1|1F|1|
|RRC (HL)|15|17|5|8|CB 0E|2|
|RRC (IX+o)|23|25|7|10|DD CB o 0E|4|
|RRC (IY+o)|23|25|7|10|FD CB o 0E|4|
|RRC r|8|10|2|2|CB 08+r|2|
|RRCA|4|5|1|1|0F|1|
|RRD|18|20|5|8|ED 67|2|
|RST 0|11|12|4|6/7 [²](#note-2)|C7|1|
|RST 8H|11|12|4|6/7 [²](#note-2)|CF|1|
|RST 10H|11|12|4|6/7 [²](#note-2)|D7|1|
|RST 18H|11|12|4|6/7 [²](#note-2)|DF|1|
|RST 20H|11|12|4|6/7 [²](#note-2)|E7|1|
|RST 28H|11|12|4|6/7 [²](#note-2)|EF|1|
|RST 30H|11|12|4|6/7 [²](#note-2)|F7|1|
|RST 38H|11|12|4|6/7 [²](#note-2)|FF|1|
|SBC A,(HL)|7|8|2|4|9E|1|
|SBC A,(IX+o)|19|21|5|7|DD 9E o|3|
|SBC A,(IY+o)|19|21|5|7|FD 9E o|3|
|SBC A,n|7|8|2|2|DE n|2|
|SBC A,r|4|5|1|1|98+r|1|
|SBC A,IXp|8|10|2|2|DD 98+p|2|
|SBC A,IYq|8|10|2|2|FD 98+q|2|
|SBC HL,BC|15|17|2|2|ED 42|2|
|SBC HL,DE|15|17|2|2|ED 52|2|
|SBC HL,HL|15|17|2|2|ED 62|2|
|SBC HL,SP|15|17|2|2|ED 72|2|
|SCF|4|5|1|1|37|1|
|SET b,(HL)|15|17|5|8|CB C6+8\*b|2|
|SET b,(IX+o)|23|25|7|10|DD CB o C6+8\*b|4|
|SET b,(IY+o)|23|25|7|10|FD CB o C6+8\*b|4|
|SET b,r|8|10|2|2|CB C0+8\*b+r|2|
|SLA (HL)|15|17|5|8|CB 26|2|
|SLA (IX+o)|23|25|7|10|DD CB o 26|4|
|SLA (IY+o)|23|25|7|10|FD CB o 26|4|
|SLA r|8|10|2|2|CB 20+r|2|
|SRA (HL)|15|17|5|8|CB 2E|2|
|SRA (IX+o)|23|25|7|10|DD CB o 2E|4|
|SRA (IY+o)|23|25|7|10|FD CB o 2E|4|
|SRA r|8|10|2|2|CB 28+r|2|
|SRL (HL)|15|17|5|8|CB 3E|2|
|SRL (IX+o)|23|25|7|10|DD CB o 3E|4|
|SRL (IY+o)|23|25|7|10|FD CB o 3E|4|
|SRL r|8|10|2|2|CB 38+r|2|
|SUB (HL)|7|8|2|4|96|1|
|SUB (IX+o)|19|21|5|7|DD 96 o|3|
|SUB (IY+o)|19|21|5|7|FD 96 o|3|
|SUB n|7|8|2|2|D6 n|2|
|SUB r|4|5|1|1|90+r|1|
|SUB IXp|8|10|2|2|DD 90+p|2|
|SUB IYq|8|10|2|2|FD 90+q|2|
|XOR (HL)|7|8|2|4|AE|1|
|XOR (IX+o)|19|21|5|7|DD AE o|3|
|XOR (IY+o)|19|21|5|7|FD AE o|3|
|XOR n|7|8|2|2|EE n|2|
|XOR r|4|5|1|1|A8+r|1|
|XOR IXp|8|10|2|2|DD A8+p|2|
|XOR IYq|8|10|2|2|FD A8+q|2|

#### Note 1
R800 timing including waits is based on access to the internal RAM. Note that an additional wait is inserted if the instruction fetch or a 16-bit memory access crosses a 256-byte memory boundary. For more information, see the [R800 waits section](#wait-cycles).

#### Note 2
Testing showed that a `call` followed by a series of `nop`s takes 8 cycles, whereas if it’s followed by a `ret` or `pop af`, combined they take 12 cycles (7 for `call` + 5 for `ret` / `pop af`). This also applies to `rst`. I have no theory about the underlying logic yet.

#### Note 3
As described below, I/O instructions get aligned to the bus clock, so an extra wait is inserted depending on the alignment. This means that between two `out`, you can have a 1-cycle instruction for free.

## Legend

### b
3-bit value.

### n
8-bit value.

### nn
16-bit value, little-endian. E.g. the `JP 1234H` opcode is `C3 34 12.`

### o
8-bit offset, 2’s complement.

### r
Register. This can be `A`, `B`, `C`, `D`, `E`, `H` or `L`. Add the following value to the last byte of the opcode:

|Register|Register bits value|
|---|---|
|A|7|
|B|0|
|C|1|
|D|2|
|E|3|
|H|4|
|L|5|

### IXp
Denotes the high or low part of the IX register: IXh or IXl. Add the following value to the last byte of the opcode:

|Register|Register bits value|
|---|---|
|IXh|4|
|IXl|5|

### IYq
Denotes the high or low part of the IY register: IYh or IYl. Add the following value to the last byte of the opcode:

|Register|Register bits value|
|---|---|
|IYh|4|
|IYl|5|

### p
Register where H and L have been replaced by IXh and IXl. Add the following value to the last byte of the opcode:

|Register|Register bits value|
|---|---|
|A|7|
|B|0|
|C|1|
|D|2|
|E|3|
|IXh|4|
|IXl|5|

### q
Register where H and L have been replaced by IYh and IYl. Add the following value to the last byte of the opcode:

|Register|Register bits value|
|---|---|
|A|7|
|B|0|
|C|1|
|D|2|
|E|3|
|IYh|4|
|IYl|5|

## Wait cycles

The MSX standard requires so-called M1 wait cycles, meaning that the system adds one additional wait state to every M1 cycle (the first or first two cycles of an instruction). This is an important trait to know about if you want to do speed calculations. The M1 waits are inserted like this:

- Every instruction has 1 additional M1 wait
- Instructions starting with a `CB`, `DD`, `ED`, `FD`, `DD CB` or `DD FD` opcode have 2 additional M1 waits

Examples:

- `XOR A` has opcode `AF` and is documented as taking 4 T-states. On MSX, it takes 5 (one more).
- `BIT 0,A` has opcode `CB 47` and is documented as taking 8 T-states. On MSX, it takes 10 (two more).
- `SRL (IX+0)` has opcode `DD CB 00 3E` and is documented as taking 23 T-states. On MSX, it takes 25 (two more).

The instruction timing including M1 wait is listed in the Z80+M1 column.

For the R800, it is an even more complex story:

- In internal RAM, 0 waits are inserted, or 1 wait if the instruction fetch crosses a 256-byte memory page boundary (“page break”).
- In internal RAM, 2 waits are inserted for every memory read/write, or 3 if it does both, regardless of whether it is in the same page or not.
- In internal RAM, 2 waits are inserted for every `jp`.
- In internal ROM, 3 waits are inserted.
- In external memory, 4-5 waits are inserted depending on bus clock alignment.
- For I/O, 6-7 waits are inserted depending on bus clock alignment.
- For I/O to ports 98H-9BH, ± 54 extra waits are inserted if not enough time has passed since the last access to these ports.

Note that the R800 timing is complex and not officially documented, so there may be deviations or errors in the above description. The above findings and values in the R800+wait column of the table are based on research by the openMSX team and verified by Grauw using a different, cycle-accurate measuring method. For more details see the documents in the [openMSX repository](https://github.com/openMSX/openMSX/tree/master/doc/internal).

~Grauw

© 2025 MSX Assembly Page. MSX is a trademark of MSX Licensing Corporation.