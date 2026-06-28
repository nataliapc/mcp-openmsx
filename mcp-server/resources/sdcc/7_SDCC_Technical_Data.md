# SDCC Compiler User Guide

## SDCC Technical Data

### Optimizations Optimizations

SDCC performs a host of standard optimizations in addition to some MCU specific optimizations.

#### Sub-expression Elimination Subexpression elimination

The compiler does local and *g* lobal *c* ommon *s* ubexpression *e* limination, e.g.:

i = x + y + 1;
j = x + y;

will be translated to

iTemp = x + y;
i = iTemp + 1;
j = iTemp;

Some subexpressions are not as obvious as the above example, e.g.:

a->b[i].c = 10;
a->b[i].d = 11;

In this case the address arithmetic a->b[i] will be computed only once; the equivalent code in C would be.

iTemp = a->b[i];
iTemp.c = 10;
iTemp.d = 11;

The compiler will try to keep these temporary variables in registers.

#### Dead-Code Elimination Dead-code elimination

int global;

void f () {
int i;
i = 1; /* dead store */
global = 1; /* dead store */
global = 2;
return;
global = 3; /* unreachable */
}

will be changed to

int global;

void f () {
global = 2;
}

#### Copy-Propagation Copy propagation

int f() {
int i, j;
i = 10;
j = i;
return j;
}

will be changed to

int f() {
int i, j;
i = 10;
j = 10;
return 10;
}

Note: the dead stores created by this copy propagation will be eliminated by dead-code elimination.

#### Loop Optimizations Loop optimization

Two types of loop optimizations are done by SDCC *loop invariant* lifting and *strength reduction* of loop induction variables. In addition to the strength reduction the optimizer marks the induction variables and the register allocator tries to keep the induction variables in registers for the duration of the loop. Because of this preference of the register allocator Register allocation, loop induction optimization causes an increase in register pressure, which may cause unwanted spilling of other temporary variables into the stack stack / data space. The compiler will generate a warning message when it is forced to allocate extra space either on the stack or data space. If this extra space allocation is undesirable then induction optimization can be eliminated either for the entire source file (with --noinduction option) or for a given function only using #pragma noinduction pragma noinduction.

Loop Invariant:

for (i = 0; i < 100; i ++)
f += k + l;

changed to

itemp = k + l;
for (i = 0; i < 100; i++)
f += itemp;

As mentioned previously some loop invariants are not as apparent, all static address computations are also moved out of the loop.

Strength Reduction Strength reduction, this optimization substitutes an expression by a cheaper expression:

for (i=0;i < 100; i++)
ar[i*5] = i*3;

changed to

itemp1 = 0;
itemp2 = 0;
for (i=0;i< 100;i++) {
ar[itemp1] = itemp2;
itemp1 += 5;
itemp2 += 3;
}

The more expensive multiplication Multiplication is changed to a less expensive addition.

#### Loop Reversing Loop reversing

This optimization is done to reduce the overhead of checking loop boundaries for every iteration. Some simple loops can be reversed and implemented using a“ decrement and jump if not zero” instruction. SDCC checks for the following criterion to determine if a loop is reversible (note: more sophisticated compilers use data-dependency analysis to make this determination, SDCC uses a more simple minded analysis).

- The 'for' loop is of the form

for(<symbol> = <expression>; [<sym>++ | <sym> += 1])
- The <for body> does not contain“ continue” or 'break”.
- All goto's are contained within the loop.
- No function calls within the loop.
- The loop control variable <sym> is not assigned any value within the loop
- The loop control variable does NOT participate in any arithmetic operation within the loop.
- There are NO switch statements in the loop.

#### Algebraic Simplifications

SDCC does numerous algebraic simplifications, the following is a small sub-set of these optimizations.

i = j + 0; /* changed to: */ i = j;
i /= 2; /* for unsigned i changed to: */ i >>= 1;
i = j - j; /* changed to: */ i = 0;
i = j / 1; /* changed to: */ i = j;

Note the subexpressions Subexpression given above are generally introduced by macro expansions or as a result of copy/constant propagation.

#### 'switch' Statements switch statement

SDCC can optimize switch statements to jump tables jump tables. It makes the decision based on an estimate of the generated code size. SDCC is quite liberal in the requirements for jump table generation:

- The labels need not be in order, and the starting number need not be one or zero, the case labels are in numerical sequence or not too many case labels are missing.
switch(i) { switch (i) {
case 4:... case 0:...
case 5:... case 1:...
case 3:...
case 6:... case 3:...
case 7:... case 4:...
case 8:... case 5:...
case 9:... case 6:...
case 10:... case 7:...
case 11:... case 8:...
} }

Both the above switch statements will be implemented using a jump-table. The example to the right side is slightly more efficient as the check for the lower boundary of the jump-table is not needed.

- The number of case labels is not larger than supported by the target architecture.
- If the case labels are not in numerical sequence ('gaps' between cases) SDCC checks whether a jump table with additionally inserted dummy cases is still attractive.
- If the starting number is not zero and a check for the lower boundary of the jump-table can thus be eliminated SDCC might insert dummy cases 0,....
Switch statements which have large gaps in the numeric sequence or those that have too many case labels can be split into more than one switch statement for efficient code generation, e.g.:

switch (i) {
case 1:...
case 2:...
case 3:...
case 4:...
case 5:...
case 6:...
case 7:...
case 101:...
case 102:...
case 103:...
case 104:...
case 105:...
case 106:...
case 107:...
}

If the above switch statement is broken down into two switch statements

switch (i) {
case 1:...
case 2:...
case 3:...
case 4:...
case 5:...
case 6:...
case 7:...
}

and

switch (i) {
case 101:...
case 102:...
case 103:...
case 104:...
case 105:...
case 106:...
case 107:...
}

then both the switch statements will be implemented using jump-tables whereas the unmodified switch statement will not be.

There might be reasons which SDCC cannot know about to either favour or not favour jump tables. If the target system has to be as quick for the last switch case as for the first (pro jump table), or if the switch argument is known to be zero in the majority of the cases (contra jump table).

#### Bit-shifting Operations Bit shifting.

Bit shifting is one of the most frequently used operation in embedded programming. SDCC tries to implement bit-shift operations in the most efficient way possible, e.g.:

unsigned char i;
...
i >>= 4;
...

generates the following code:

mov a,_i
swap a
anl a,#0x0f
mov _i,a

Typically, SDCC will not setup a loop if the shift count is known. Another example:

unsigned int i;
...
i >>= 9;
...

will generate:

mov a,(_i + 1)
mov (_i + 1),#0x00
clr c
rrc a
mov _i,a

#### Bit-rotation Bit rotation

A special case of the bit-shift operation is bit rotation rotating bits, SDCC recognizes the following expression to be a left bit-rotation:

**unsigned** char i; /* unsigned is needed for rotation */
...
i = ((i << 1) | (i >> 7));
...

will generate the following code:

mov a,_i
rl a
mov _i,a

SDCC uses pattern matching on the parse tree to determine this operation.Variations of this case will also be recognized as bit-rotation, i.e.:

i = ((i >> 7) | (i << 1)); /* left-bit rotation */

#### Nibble and Byte Swapping

Other special cases of the bit-shift operations are nibble or byte swapping swapping nibbles/bytes, SDCC recognizes the following expressions:

**unsigned** char i;
**unsigned** int j;
...
i = ((i << 4) | (i >> 4));
j = ((j << 8) | (j >> 8));

and generates a swap instruction for the nibble swapping Nibble swapping or move instructions for the byte swapping Byte swapping. The" j" example can be used to convert from little to big-endian or vice versa. If you want to change the endianness of a *signed* integer you have to cast to (unsigned int) first.

Note that SDCC stores numbers in little-endian Usually 8-bit processors don't care much about endianness. This is not the case for the standard 8051 which only has an instruction to increment its *dptr* DPTR-datapointer so little-endian is the more efficient byte order. little-endian Endianness format (i.e. lowest order first) for most backends. However, the hc08, s08 and stm8 backends are big-endian.

#### Getting a Bit Any Order Bit

It is frequently required to obtain the highest order bit of an integral type (long, int, short or char types). Also obtaining any other order bit is not uncommon. SDCC recognizes the following expressions to yield the highest order bit and generates optimized code for it, e.g.:

unsigned int gint;

foo () {
unsigned char hob1, aob1;
bit hob2, hob3, aob2, aob3;
...
hob1 = (gint >> 15) & 1;
hob2 = (gint >> 15) & 1;
hob3 = gint & 0x8000;
aob1 = (gint >> 9) & 1;
aob2 = (gint >> 8) & 1;
aob3 = gint & 0x0800;
...
}

will generate the following code:

61; hob.c 7
000A E5*01 62 mov a,(_gint + 1)
000C 23 63 rl a
000D 54 01 64 anl a,#0x01
000F F5*02 65 mov _foo_hob1_1_1,a
66; hob.c 8
0011 E5*01 67 mov a,(_gint + 1)
0013 33 68 rlc a
0014 92*00 69 mov _foo_hob2_1_1,c
66; hob.c 9
0016 E5*01 67 mov a,(_gint + 1)
0018 33 68 rlc a
0019 92*01 69 mov _foo_hob3_1_1,c
70; hob.c 10
001B E5*01 71 mov a,(_gint + 1)
001D 03 72 rr a
001E 54 01 73 anl a,#0x01
0020 F5*03 74 mov _foo_aob1_1_1,a
75; hob.c 11
0022 E5*01 76 mov a,(_gint + 1)
0024 13 77 rrc a
0025 92*02 78 mov _foo_aob2_1_1,c
79; hob.c 12
0027 E5*01 80 mov a,(_gint + 1)
0029 A2 E3 81 mov c,acc[3]
002B 92*03 82 mov _foo_aob3_1_1,c

Other variations of these cases however will *not* be recognized. They are standard C expressions, so I heartily recommend these be the only way to get the highest order bit, (it is portable). Of course it will be recognized even if it is embedded in other expressions, e.g.:

xyz = gint + ((gint >> 15) & 1);

will still be recognized.

#### Higher Order Byte Higher Order Byte / Higher Order Word Higher Order Word

It is also frequently required to obtain a higher order byte or word of a larger integral type (long, int or short types). For mcs51, SDCC recognizes the following expressions to yield the higher order byte or word and generates optimized code for it, e.g.:

unsigned int gint;
unsigned long int glong;

foo () {
unsigned char hob1, hob2;
unsigned int how1, how2;
...
hob1 = (gint >> 8) & 0xFF;
hob2 = glong >> 24;
how1 = (glong >> 16) & 0xFFFF;
how2 = glong >> 8;
...
}

will generate the following code:

91; hob.c 15
0037 85*01*06 92 mov _foo_hob1_1_1,(_gint + 1)
93; hob.c 16
003A 85*05*07 94 mov _foo_hob2_1_1,(_glong + 3)
95; hob.c 17
003D 85*04*08 96 mov _foo_how1_1_1,(_glong + 2)
0040 85*05*09 97 mov (_foo_how1_1_1 + 1),(_glong + 3)
0043 85*03*0A 98 mov _foo_how2_1_1,(_glong + 1)
0046 85*04*0B 99 mov (_foo_how2_1_1 + 1),(_glong + 2)

Again, variations of these cases may *not* be recognized. They are standard C expressions, so I heartily recommend these be the only way to get the higher order byte/word, (it is portable). Of course it will be recognized even if it is embedded in other expressions, e.g.:

xyz = gint + ((gint >> 8) & 0xFF);

will still be recognized.

#### Placement of Bank-Selection Instructions

For non-intrinsic named address spaces, SDCC will place the bank selection instructions optimally. For details see Philipp Klaus Krause," Optimal Placement of Bank Selection Instructions in Polynomial Time", Proceedings of the 16th International Workshop on Software and Compilers for Embedded Systems, M-SCOPES ’13, pp 23-30. Association for Computing Machinery, 2013.

#### Lifetime-Optimal Speculative Partial Redundancy Elimination

SDCC has an implementation of lifetime-optimal speculative partial redundancy elimination based on tree-decompositions.

#### Register Allocation Register-Allocation

SDCC currently has two register allocators. One of them is optimal when optimizing for code size. This register allocator is used by default on all ports except for mcs51, ds390, pic14 and pic16. With the exception of hc08 and s08, it is also the only available register allocator for these ports. Even though it runs in polynomial time, it can be quite slow; therefore the --max-allocs-per-node command line option can be used for a trade-off between compilation speed and quality of the generated code: Lower values result in faster compilation, higher values can result in better code being generated.

It first creates a tree-decomposition of the control-flow graph, and then uses dynamic programming bottom-up along the tree-decomposition. Optimality is achieved through the use of a cost function, which gives cost for instructions under register assignments. The cost function is target-specific and has to be implemented for each port; in all current SDCC ports the cost function is integrated into code generation.

For more details on how this register allocator works, see: Philipp Klaus Krause," Optimal Register Allocation in Polynomial Time", Compiler Construction - 22nd International Conference, CC 2013, Held as Part of the European Joint Conferences on Theory and Practice of Software, ETAPS 2013. Proceedings, Lecture Notes in Computer Science, volume 7791, pp. 1-20. Springer, 2013. Also: Philipp Klaus Krause," Bytewise Register Allocation", Proceedings of the 18th International Workshop on Software and Compilers for Embedded Systems, SCOPES ’15, pp 22-27. Association for Computing Machinery, 2015.

#### Peephole Optimizer Peephole optimizer

The compiler uses a rule based, pattern matching and re-writing mechanism for peep-hole optimization. It is inspired by *copt* a peep-hole optimizer by Christopher W. Fraser (cwfraser @ microsoft.com). A default set of rules are compiled into the compiler, additional rules may be added with the *--peep-file --peep-file* option. The rule language is best illustrated with examples.

replace {
mov %1,a
mov a,%1
} by {
mov %1,a
}

The above rule will change the following assembly Assembler routines sequence:

mov r1,a
mov a,r1

to

mov r1,a

Note: All occurrences of a *%n* (pattern variable) must denote the same string. With the above rule, the assembly sequence:

mov r1,a
mov a,r2

will remain unmodified.

Other special case optimizations may be added by the user (via *--peep-file option*). E.g. some variants of the 8051 MCU MCS51 variants allow only ajmp and acall. The following two rules will change all ljmp and lcall to ajmp and acall

replace { lcall %1 } by { acall %1 }
replace { ljmp %1 } by { ajmp %1 }

(NOTE: from version 2.7.3 on, you can use option - **-acall-ajmp --acall-ajmp, which also takes care of aligning the interrupt vectors properly.)

The *inline-assembler code* is also passed through the peep hole optimizer, thus the peephole optimizer can also be used as an assembly level macro expander. The rules themselves are MCU dependent whereas the rule language infra-structure is MCU independent. Peephole optimization rules for other MCU can be easily programmed using the rule language.

The syntax for a rule is as follows:

rule:= replace [restart] '{' <assembly sequence> '\ n'
'}' by '{' '\ n'
\ n'
'}' [if <functionName>] '\ n'

The optimizer will apply to the rules one by one from the top in the sequence of their appearance, it will terminate when all rules are exhausted. If the 'restart' option is specified, then the optimizer will start matching the rules again from the top, this option for a rule is expensive (performance), it is intended to be used in situations where a transformation will trigger the same rule again. An example of this (not a good one, it has side effects) is the following rule:

replace restart {
pop %1
push %1 } by {
; nop
}

Note that the replace pattern cannot be a blank, but can be a comment line. Without the 'restart' option only the innermost 'pop' 'push' pair would be eliminated, i.e.:

pop ar1
pop ar2
push ar2
push ar1

would result in:

pop ar1
; nop
push ar1

*with* the restart option the rule will be applied again to the resulting code and then all the pop-push pairs will be eliminated to yield:

; nop
; nop

A conditional function can be attached to a rule. Attaching rules are somewhat more involved, let's illustrate this with an example.

replace {
ljmp %5
%2:
} by {
sjmp %5
%2:
} if labelInRange

The optimizer does a look-up of a function name table defined in function *callFuncByName* in the source file SDCCpeeph.c, with the name *labelInRange*. If it finds a corresponding entry the function is called. Note there can be no parameters specified for some of these functions, in this case the use of *%5* is crucial, since the function *labelInRange* expects to find the label in that particular variable (the hash table containing the variable bindings is passed as a parameter). If you want to code more such functions, take a close look at the function labelInRange and the calling mechanism in source file SDCCpeeph.c. Currently implemented are *labelInRange, labelRefCount, labelRefCountChange, labelIsReturnOnly, xramMovcOption, portIsDS390, 24bitMode, notVolatile*. *notUsed, notSame, operandsNotRelated, labelJTInRange, canAssign, optimizeReturn, notUsedFrom, labelIsReturnOnly, operandsLiteral, labelIsUncondJump, deadMove, useAcallAjmp* and *okToRemoveSLOC.

This whole thing is a little kludgy, but maybe some day SDCC will have some better means. If you are looking at the peeph*.def files, you will see the default rules that are compiled into the compiler, you can add your own rules in the default set there if you get tired of specifying the --peep-file option.

### Cyclomatic Complexity Cyclomatic complexity

Cyclomatic complexity of a function is defined as the number of independent paths the program can take during execution of the function. This is an important number since it defines the number test cases you have to generate to validate the function. The accepted industry standard for complexity number is 10, if the cyclomatic complexity reported by SDCC exceeds 10 you should think about simplification of the function logic. Note that the complexity level is not related to the number of lines of code in a function. Large functions can have low complexity, and small functions can have large complexity levels.

SDCC uses the following formula to compute the complexity:

complexity = (number of edges in control flow graph) - (number of nodes in control flow graph) + 2;

Having said that the industry standard is 10, you should be aware that in some cases it be may unavoidable to have a complexity level of less than 10. For example if you have switch statement with more than 10 case labels, each case label adds one to the complexity level. The complexity level is by no means an absolute measure of the algorithmic complexity of the function, it does however provide a good starting point for which functions you might look at for further optimization.

### Retargetting for other Processors

The issues for retargetting the compiler are far too numerous to be covered by this document. What follows is a brief description of each of the phases of the compiler and its MCU dependency.

- Parsing the source and building the annotated parse tree. This phase is largely MCU independent (except for the language extensions). Syntax & semantic checks are also done in this phase, along with some initial optimizations like back patching labels and the pattern matching optimizations like bit-rotation etc.
- The second phase involves generating an intermediate code which can be easy manipulated during the later phases. This phase is entirely MCU independent. The intermediate code generation assumes the target machine has unlimited number of registers, and designates them with the name iTemp. The compiler can be made to dump a human readable form of the code generated by using the --dumpraw option.
- This phase does the bulk of the standard optimizations and is also MCU independent. This phase can be broken down into several sub-phases:

Break down intermediate code (iCode) into basic blocks.
Do control flow & data flow analysis on the basic blocks.
Do local common subexpression elimination, then global subexpression elimination
Dead code elimination
Loop optimizations
If loop optimizations caused any changes then do 'global subexpression elimination' and 'dead code elimination' again.
- This phase determines the live-ranges; by live range I mean those iTemp variables defined by the compiler that still survive after all the optimizations. Live range analysis Live range analysis is essential for register allocation, since these computation determines which of these iTemps will be assigned to registers, and for how long.
- Phase five is register allocation. For new ports register allocator described above in Register Allocation should be used in most cases, since it can result in substantially better code. In the old register allocator, there are two parts to register allocation.

The first part I call 'register packing' (for lack of a better term). In this case several MCU specific expression folding is done to reduce register pressure.

The second part is more MCU independent and deals with allocating registers to the remaining live ranges. A lot of MCU specific code does creep into this phase because of the limited number of index registers available in the 8051.
- The Code generation phase is (unhappily), entirely MCU dependent and very little (if any at all) of this code can be reused for other MCU. However the scheme for allocating a homogenized assembler operand for each iCode operand may be reused.
- As mentioned in the optimization section the peep-hole optimizer is rule based system, which can reprogrammed for other MCUs.
More information is available on SDCC Wiki wiki (preliminary link https://sourceforge.net/p/sdcc/wiki/Adding%20a%20port/) and in the thread http://sourceforge.net/mailarchive/message.php?msg_id=13954144.
