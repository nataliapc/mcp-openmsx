# 5. ROM BASIC Interpreter

Microsoft BASIC has evolved over the years to its present position as the industry standard. It was originally written for the 8080 Microprocessor and even the MSX version is held in 8080 Assembly Language form. This process of continuous development means that there are less Z80-specific instructions than would be expected in a more modern program. It also means that numerous changes have been made and the result is a rather convoluted program. The structure of the Interpreter makes it unlikely that an application program will be able to use its many facilities. However most programs will need to cooperate with it to some extent so this chapter gives a detailed description of its operation.

There are four readily identifiable areas of importance within the Interpreter, the one most familiar to any user is the Mainloop ([4134H](#4134h)). This collects numbered lines of text from the console and places them in order in the Program Text Area of memory until a direct statement is received.

The Runloop ([4601H](#4601h)) is responsible for the execution of a program. It examines the first token of each program line and calls the appropriate routine to process the remainder of the statement. This continues until no more program text remains, control then returns to the Mainloop.

The analysis of numeric or string operands within a statement is performed by the Expression Evaluator ([4C64H](#4c64h)). Each expression is composed of factors, in turn analyzed by the Factor Evaluator ([4DC7H](#4dc7h)), which are linked together by dyadic infix operators. As there are several types of operand, notably line numbers, which cannot form part of an expression in Microsoft BASIC the term "evaluated" is only used to refer to those that can. Otherwise a term such as "computed" will be used.

One point to note when examining the Interpreter in detail is that it contains a lot of trick code. The writers seem particularly fond of jumping into the middle of instructions to provide multiple entry points to a routine. As an example take the instruction:

    3E D1       Normal: LD   A,0D1H

When encountered in the usual way this will of course load the accumulator with the value D1H. However if it is entered at "Normal" then it will be executed as a `POP DE` instruction. The Interpreter has many similarly obscure sections.

<a name="268ch"></a>

    Address... 268CH

This routine is used by the Expression Evaluator to subtract two double precision operands. The first operand is contained in [DAC](#dac) and the second in [ARG](#arg), the result is returned in [DAC](#dac). The second operand's mantissa sign is inverted and control drops into the addition routine.

<a name="269ah"></a>

    Address... 269AH

This routine is used by the Expression Evaluator to add two double precision operands. The first operand is contained in [DAC](#dac) and the second in [ARG](#arg), the result is returned in [DAC](#dac). If the second operand is zero the routine terminates with no action, if the first operand is zero the second operand is copied to [DAC](#dac) ([2F05H](#2f05h)) and the routine terminates. The two exponents are compared, if they differ by more than 10^15 the routine terminates with the larger operand as the result. Otherwise the difference between the two exponents is used to align the mantissae by shifting the smaller one rightwards ([27A3H](#27a3h)), for example:

```
19.2100 = .1921*10^2 = .192100
+ .7436 = .7436*10^0 = .007436
```

If the two mantissa signs are equal the mantissae are then added ([2759H](#2759h)), if they are different the mantissae are subtracted ([276BH](#276bh)). The exponent of the result is simply the larger of the two original exponents. If an overflow was produced by addition the result mantissa is shifted right one digit (27DBH) and the exponent incremented. If leading zeroes were produced by subtraction the result mantissa is renormalized by shifting left ([2797H](#2797h)). The guard byte is then examined and the result rounded up if the fifteenth digit is equal to or greater than five.

<a name="2759h"></a>

    Address... 2759H

This routine adds the two double precision mantissae contained in [DAC](#dac) and [ARG](#arg) and returns the result in [DAC](#dac). Addition commences at the least significant positions, [DAC](#dac)+7 and [ARG](#arg)+7, and proceeds two digits at a time for the seven bytes.

<a name="276bh"></a>

    Address... 276BH

This routine subtracts the two double precision mantissae contained in [DAC](#dac) and [ARG](#arg) and returns the result in [DAC](#dac). Subtraction commences at the guard bytes, [DAC](#dac)+8 and [ARG](#arg)+8, and proceeds two digits at a time for the eight bytes. If the result underflows it is corrected by subtracting it from zero and inverting the mantissa sign, for example:

    0.17-0.85 = 0.32 = -0.68

</a>

<a name="2797h"></a>

    Address... 2797H

This routine shifts the double precision mantissa contained in [DAC](#dac) one digit left.

<a name="27a3h"></a>

    Address... 27A3H

This routine shifts a double precision mantissa right. The number of digits to shift is supplied in register A, the address of the mantissa's most significant byte is supplied in register pair HL. The digit count is first divided by two to separate the byte and digit counts. The required number of whole bytes are then shifted right and the most significant bytes zeroed. If an odd number of digits was specified the mantissa is then shifted a further one digit right.

<a name="27e6h"></a>

    Address... 27E6H

This routine is used by the Expression Evaluator to multiply two double precision operands. The first operand is contained in [DAC](#dac) and the second in [ARG](#arg), the result is returned in [DAC](#dac). If either operand is zero the routine terminates with a zero result ([2E7DH](#2e7dh)). Otherwise the two exponents are added to produce the result exponent. If this is smaller than 10^-63 the routine terminates with a zero result, if it is greater than 10^63 an "`Overflow error`" is generated ([4067H](#4067h)). The two mantissa signs are then processed to yield the sign of the result, if they are the same the result is positive, if they differ it is negative.

Even though the mantissae are in BCD format they are multiplied using the normal binary add and shift method. To accomplish this the first operand is successively multiplied by two ([288AH](#288ah)) to produce the constants X\*80, X\*40, X\*20, X\*10, X\*8, X\*4, X\*2, and X in the [HOLD8](#hold8) buffer. The second operand remains in [ARG](#arg) and [DAC](#dac) is zeroed to function as the product accumulator. Multiplication proceeds by taking successive pairs of digits from the second operand starting with the least significant pair. For each 1 bit in the digit pair the appropriate multiple of the first operand is added to the product. As an example the single multiplication 1823\*96 would produce:

    1823*10010110=(1823*80)+(1823*10)+(1823*4)+(1823*2)

As each digit pair is completed the product is shifted two digits right. When all seven digit pairs have been processed the routine terminates by renormalizing and rounding up the product (26FAH).

The time required for a multiplication depends largely upon the number of 1 bits in the second operand. The worst case, when all the digits are sevens, can take up to 11 ms compared to the average of approximately 7 ms.

<a name="288ah"></a>

    Address... 288AH

This routine doubles a double precision mantissa three successive times to produce the products X\*2, X\*4 and X\*8. The address of the mantissa's least significant byte is supplied in register pair DE. The products are stored at successively lower addresses commencing immediately below the operand.

<a name="289fh"></a>

    Address... 289FH

This routine is used by the Expression Evaluator to divide two double precision operands. The first operand is contained in [DAC](#dac) and the second in [ARG](#arg), the result is returned in [DAC](#dac). If the first operand is zero the routine terminates with a zero result if the second operand is zero a "`Division by zero`" error is generated ([4058H](#4058h)). Otherwise the two exponents are subtracted to produce the result exponent and the two mantissa signs processed to yield the sign of the result. If they are the same the result is positive, if they differ it is negative.

The mantissae are divided using the normal long division method. The second operand is repeatedly subtracted from the first until underflow to produce a single digit of the result. The second operand is then added back to restore the remainder (2761H), the digit is stored in [HOLD](#hold) and the first operand is shifted one digit left. When the first operand has been completely shifted out the result is copied from [HOLD](#hold) to [DAC](#dac) then renormalized and rounded up (2883H). The time required for a division reaches a maximum of approximately 25 ms when the first operand is composed largely of nines and the second operand of ones. This will require the greatest number of subtractions.

<a name="2993h"></a>

    Address... 2993H

This routine is used by the Factor Evaluator to apply the "`COS`" function to a double precision operand contained in [DAC](#dac). The operand is first multiplied ([2C3BH](#2c3bh)) by 1/(2\*PI) so that unity corresponds to a complete 360 degree cycle. The operand then has 0.25 (90 degrees) subtracted ([2C32H](#2c32h)), its mantissa sign is inverted (2E8DH) and control drops into the "`SIN`" routine.

<a name="29ach"></a>

    Address... 29ACH

This routine is used by the Factor Evaluator to apply the "`SIN`" function to a double precision operand contained in [DAC](#dac). The operand is first multiplied ([2C3BH](#2c3bh)) by 1/(2\*PI) so that unity corresponds to a complete 360 degree cycle. As the function is periodic only the fractional part of the operand is now required. This is extracted by pushing the operand ([2CCCH](#2ccch)) obtaining the integer part ([30CFH](#30cfh)) and copying it to [ARG](#arg) ([2C4DH](#2c4dh)), popping the whole operand to [DAC](#dac) ([2CE1H](#2ce1h)) and then subtracting the integer part ([268CH](#268ch)).

The first digit of the mantissa is then examined to determine the operand's quadrant. If it is in the first quadrant it is unchanged. If it is in the second quadrant it is subtracted from 0.5 (180 degrees) to reflect it about the Y axis. If it is in the third quadrant it is subtracted from 0.5 (180 degrees) to reflect it about the X axis. If it is in the fourth quadrant 1.0 (360 degrees) is subtracted to reflect it about both axes. The function is then computed by polynomial approximation ([2C88H](#2c88h)) using the list of coefficients at 2DEFH. These are the first eight terms in the Taylor series X-(X^3/3!)+(X^5/5!)-(X^7/7!) ... with the coefficients multiplied by successive factors of 2\*PI to compensate for the initial scaling.

<a name="29fbh"></a>

    Address... 29FBH

This routine is used by the Factor Evaluator to apply the "`TAN`" function to a double precision operand contained in [DAC](#dac). The function is computed using the trigonometric identity TAN(X) = SIN(X)/COS(X).

<a name="2a14h"></a>

    Address... 2A14H

This routine is used by the Factor Evaluator to apply the "`ATN`" function to a double precision operand contained in [DAC](#dac). The function is computed by polynomial approximation ([2C88H](#2c88h)) using the list of coefficients at 2E30H. These are the first eight terms in the Taylor series X-(X^3/3)+(X^5/5)-(X^7/7) ... with the coefficients modified slightly to telescope the series.

<a name="2a72h"></a>

    Address... 2A72H

This routine is used by the Factor Evaluator to apply the "`LOG`" function to a double precision operand contained in [DAC](#dac). The function is computed by polynomial approximation using the list of coefficients at 2DA5H.

<a name="2affh"></a>

    Address... 2AFFH

This routine is used by the Factor Evaluator to apply the "`SQR`" function to a double precision operand contained in [DAC](#dac). The function is computed using the Newton-Raphson process, an equivalent BASIC program is:

```
10 INPUT"NUMBER";X
20 GUESS=10
30 FOR N=1 To 7
40 GUESS=(GUESS+X/GUESS)/2
50 NEXT N
60 PRINT GUESS
70 PRINT SQR(X)
```

The above program uses a fixed initial guess. While this is accurate over a limited range maximum accuracy will only be attained if the initial guess is near the root. The method used by the ROM is to halve the exponent, with rounding up, and then to divide the first two digits of the operand by four and increment the first digit.

<a name="2b4ah"></a>

    Address... 2B4AH

This routine is used by the Factor Evaluator to apply the "`EXP`" function to a double precision operand contained in [DAC](#dac). The operand is first multiplied by 0.4342944819, which is LOG(e) to Base 10, so that the problem becomes computing 10^X rather than e^X. This results in considerable simplification as the integer part can be dealt with easily. The function is then computed by polynomial approximation using the list of coefficients at 2D6BH.

<a name="2bdfh"></a>

    Address... 2BDFH

This routine is used by the Factor Evaluator to apply the "`RND`" function to a double precision operand contained in [DAC](#dac). If the operand is zero the current random number is copied to [DAC](#dac) from [RNDX](#rndx) and the routine terminates. If the operand is negative it is copied to [RNDX](#rndx) to set the current random number. The new random number is produced by copying [RNDX](#rndx) to [HOLD](#hold), the constant at 2CF9H to [ARG](#arg), the constant at 2CF1H to [DAC](#dac) and then multiplying (282EH). The fourteen least significant digits of the double length product are copied to [RNDX](#rndx) to form the mantissa of the new random number. The exponent byte in [DAC](#dac) is set to 10^0 to return a value in the range 0 to 1.

<a name="2c24h"></a>

    Address... 2C24H

This routine is used by the "`NEW`", "`CLEAR`" and "`RUN`" statement handlers to initialize [RNDX](#rndx) with the constant at 2D01H.

<a name="2c2ch"></a>

    Address... 2C2CH

This routine adds the constant whose address is supplied in register pair HL to the double precision operand contained in [DAC](#dac).

<a name="2c32h"></a>

    Address... 2C32H

This routine subtracts the constant whose address is supplied in register pair HL from the double precision operand contained in [DAC](#dac).

<a name="2c3bh"></a>

    Address... 2C3BH

This routine multiplies the double precision operand contained in [DAC](#dac) by the constant whose address is supplied in register pair HL.

<a name="2c41h"></a>

    Address... 2C41H

This routine divides the double precision operand contained in [DAC](#dac) by the constant whose address is supplied in register pair HL.

<a name="2c47h"></a>

    Address... 2C47H

This routine performs the relation operation on the double precision operand contained in [DAC](#dac) and the constant whose address is supplied in register pair HL.

<a name="2c4dh"></a>

    Address... 2C4DH
This routine copies an eight byte double precision operand from [DAC](#dac) to [ARG](#arg).

<a name="2c59h"></a>

    Address... 2C59H

This routine copies an eight byte double precision operand from [ARG](#arg) to [DAC](#dac).

<a name="2c6fh"></a>

    Address... 2C6FH

This routine exchanges the eight bytes in [DAC](#dac) with the eight bytes currently on the bottom of the Z80 stack.

<a name="2c80h"></a>

    Address... 2C80H

This routine inverts the mantissa sign of the operand contained in [DAC](#dac) (2E8DH). The same address is then pushed onto the stack to restore the sign when the caller terminates.

<a name="2c88h"></a>

    Address... 2C88H

This routine generates an odd series based on the double precision operand contained in [DAC](#dac). The series is of the form:

    X^1*(Kn)+X^3*(Kn-1)+x^5*(Kn-2)+X^5*(Kn-3) ...

The address of the coefficient list is supplied in register pair HL. The first byte of the list contains the coefficient count, the double precision coefficients follow with K1 first and Kn last. The even series is generated ([2C9AH](#2c9ah)) and multiplied ([27E6H](#27e6h)) by the original operand.

<a name="2c9ah"></a>

    Address... 2C9AH

This routine generates an even series based on the double precision operand contained in [DAC](#dac). The series is of the form:

    X^0*(Kn)+x^2*(Kn-1)+x^4*(Kn-2)+x^6*(Kn-3) ...

The address of the coefficient list is supplied in register pair HL. The first byte of the list contains the coefficient count, the double precision coefficients follow with K1 first and Kn last. The method used to compute the polynomial is known as Horner's method. It only requires one multiplication and one addition per term, the BASIC equivalent is:

```
10 X=X*X
20 PRODUCT=0
30 RESTORE 100
40 READ COUNT
50 FOR N=1 TO COUNT
60 READ K
70 PRODUCT= ( PRODUCT*X ) +K
80 NEXT N
90 END
100 DATA 8
110 DATA Kn-7
120 DATA Kn-6
130 DATA Kn-5
140 DATA Kn-4
150 DATA Kn-3
160 DATA Kn-2
170 DATA Kn-1
180 DATA Kn
```

The polynomial is processed from the final coefficient through to the first coefficient so that the partial product can be used to save unnecessary operations.

<a name="2cc7h"></a>

    Address... 2CC7H

This routine pushes an eight byte double precision operand from [ARG](#arg) onto the Z80 stack.

<a name="2ccch"></a>

    Address... 2CCCH

This routine pushes an eight byte double precision operand from [DAC](#dac) onto the Z80 stack.

<a name="2cdch"></a>

    Address... 2CDCH

This routine pops an eight byte double precision operand from the Z80 stack into [ARG](#arg).

<a name="2ce1h"></a>

    Address... 2CE1H

This routine pops an eight byte double precision operand from the Z80 stack into [DAC](#dac).

<a name="2cf1h"></a>

    Address... 2CF1H

This table contains the double precision constants used by the math routines. The first three constants have zero in the exponent position as they are in a special intermediate form used by the random number generator.

|ADDRESS|CONSTANT           |           |ADDRESS|CONSTANT           |   |
|-------|-------------------|-----------|-------|-------------------|---|
|2CF1H  |.14389820420821    |RND        |2DAEH  |6.2503651127908    |   |
|2CF9H  |.21132486540519    |RND        |2DB6H  |-13.682370241503   |   |
|2D01H  |.40649651372358    |           |2DBEH  |8.5167319872389    |   |
|2D09H  |.43429448190324    |LOG(e)     |2DC6H  |5                  |LOG|
|2D11H  |.50000000000000    |           |2DC7H  |1.0000000000000    |   |
|2D13H  |.00000000000000    |           |2DCFH  |-13.210478350156   |   |
|2D1BH  |1.0000000000000    |           |2DD7H  |47.925256043873    |   |
|2D23H  |.25000000000000    |           |2DDFH  |-64.906682740943   |   |
|2D2BH  |3.1622776601684    |SQR(10)    |2DE7H  |29.415750172323    |   |
|2D33H  |.86858896380650    |2^LOG(e)   |2DEFH  |8                  |SIN|
|2D3BH  |2.3025850929940    |1/LOG(e)   |2DF0H  |-.69215692291809   |   |
|2D43H  |1.5707963267949    |PI/2       |2DF8H  | 3.8172886385771   |   |
|2D4BH  |.26794919243112    |TAN(PI/12) |2E00H  |-15.094499474801   |   |
|2D53H  |1.7320508075689    |TAN(PI/3)  |2E08H  | 42.058689667355   |   |
|2D5BH  |.52359877559830    |PI/6       |2E10H  |-76.705859683291   |   |
|2D63H  |.15915494309190    |1/(2^PI)   |2E18H  | 81.605249275513   |   |
|2D6BH  |4                  |EXP        |2E20H  |-41.341702240398   |   |
|2D6CH  |1.0000000000000    |           |2E28H  | 6.2831853071796   |   |
|2D74H  |159.37415236031    |           |2E30H  |8                  |ATN|
|2D7CH  |2709.3169408516    |           |2E31H  |-.05208693904000   |   |
|2D84H  |4497.6335574058    |           |2E39H  |.07530714913480    |   |
|2D8CH  |3                  |EXP        |2E41H  |-.09081343224705   |   |
|2D8DH  |18.312360159275    |           |2E49H  |.11110794184029    |   |
|2D95H  |831.40672129371    |           |2E51H  |-.14285708554884   |   |
|2D9DH  |5178.0919915162    |           |2E59H  |.19999999948967    |   |
|2DA5H  |4                  |LOG        |2E61H  |-.33333333333160   |   |
|2DA6H  |-.71433382153226   |           |2E69H  |1.0000000000000    |   |

</a>

<a name="2e71h"></a>

    Address... 2E71H

This routine returns the mantissa sign of a Floating Point operand contained in [DAC](#dac). The exponent byte is tested and the result returned in register A and the flags:

```
Zero ....... A=00H, Flag Z,NC
Positive ... A=01H, Flag NZ,NC
Negative ... A=FFH, Flag NZ,C
```

</a>

<a name="2e7dh"></a>

    Address... 2E7DH

This routine simply zeroes the exponent byte in [DAC](#dac).

<a name="2e82h"></a>

    Address... 2E82H

This routine is used by the Factor Evaluator to apply the "`ABS`" function to an operand contained in [DAC](#dac). The operand's sign is first checked ([2EA1H](#2ea1h)), if it is positive the routine simply terminates. The operand's type is then checked via the [GETYPR](#getypr) standard routine. If it is a string a "`Type mismatch`" error is generated ([406DH](#406dh)). If it is an integer it is negated ([322BH](#322bh)). If it is a double precision or single precision operand the mantissa sign bit in [DAC](#dac) is inverted.

<a name="2e97h"></a>

    Address... 2E97H

This routine is used by the Factor Evaluator to apply the "`SGN`" function to an operand contained in [DAC](#dac). The operand's sign is checked ([2EA1H](#2ea1h)), extended into register pair HL and then placed in [DAC](#dac) as an integer:

```
Zero ....... 0000H
Positive ... 0001H
Negative ... FFFFH
```

</a>

<a name="2ea1h"></a>

    Address... 2EA1H

This routine returns the sign of an operand contained in [DAC](#dac). The operands type is first checked via the [GETYPR](#getypr) standard routine. If it is a string a "`Type mismatch`" error is generated ([406DH](#406dh)). If it is a single precision or double precision operand the mantissa sign is examined ([2E71H](#2e71h)). If it is an integer its value is taken from [DAC](#dac)+2 and translated into the flags shown at [2E71H](#2e71h).

<a name="2eb1h"></a>

    Address... 2EB1H

This routine pushes a four byte single precision operand from [DAC](#dac) onto the Z80 stack.

<a name="2ec1h"></a>

    Address... 2EC1H

This routine copies the contents of registers C, B, E and D to [DAC](#dac).

<a name="2ecch"></a>

    Address... 2ECCH

This routine copies the contents of [DAC](#dac) to registers C, B, E and D.

<a name="2ed6h"></a>

    Address... 2ED6H

This routine loads registers C, B, E and D from upwardly sequential locations starting at the address supplied in register pair HL.

<a name="2edfh"></a>

    Address... 2EDFH

This routine loads registers E, D, C and B from upwardly sequential locations starting at the address supplied in register pair HL.

<a name="2ee8h"></a>

    Address... 2EE8H

This routine copies a single precision operand from [DAC](#dac) to the address supplied in register pair HL.

<a name="2eefh"></a>

    Address... 2EEFH

This routine copies any operand from the address supplied in register pair HL to [ARG](#arg). The length of the operand is contained in [VALTYP](#valtyp): 2=Integer, 3=String, 4=Single Precision, 8=Double Precision.

<a name="2f05h"></a>

    Address... 2F05H

This routine copies any operand from [ARG](#arg) to [DAC](#dac). The length of the operand is contained in [VALTYP](#valtyp): 2=Integer, 3=String, 4=Single Precision, 8=Double Precision.

<a name="2f0dh"></a>

    Address... 2F0DH

This routine copies any operand from [DAC](#dac) to [ARG](#arg). The length of the operand is contained in [VALTYP](#valtyp): 2=Integer, 3=String, 4=Single Precision, 8=Double Precision.

<a name="2f21h"></a>

    Address... 2F21H

This routine is used by the Expression Evaluator to find the relation (<>=) between two single precision operands. The first operand is contained in registers C, B, E and D and the second in [DAC](#dac). The result is returned in register A and the flags:

```
Operand 1=Operand 2 ... A=00H, Flag Z,NC
Operand 1<Operand 2 ... A=01H, Flag NZ,NC
Operand 1>Operand 2 ... A=FFH, Flag NZ,C
```

It should be noted that for relational operators the Expression Evaluator regards maximally negative numbers as small and maximally positive numbers as large.

<a name="2f4dh"></a>

    Address... 2F4DH

This routine is used by the Expression Evaluator to find the relation (<>=) between two integer operands. The first operand is contained in register pair DE and the second in register pair HL. The results are as for the single precision version ([2F21H](#2f21h)).

<a name="2f83h"></a>

    Address... 2F83H

This routine is used by the Expression Evaluator to find the relation (<>=) between two double precision operands. The first operand is contained in [DAC](#dac) and the second in [ARG](#arg). The results are as for the single precision version ([2F21H](#2f21h)).

<a name="2f8ah"></a>

    Address... 2F8AH

This routine is used by the Factor Evaluator to apply the "`CINT`" function to an operand contained in [DAC](#dac). The operand type is first checked via the [GETYPR](#getypr) standard routine, if it is already integer the routine simply terminates. If it is a string a "`Type mismatch`" error is generated ([406DH](#406dh)). If it is a single precision or double precision operand it is converted to a signed binary integer in register pair DE ([305DH](#305dh)) and then placed in [DAC](#dac) as an integer. Out of range values result in an "`Overflow`" error ([4067H](#4067h)).

<a name="2fa2h"></a>

    Address... 2FA2H

This routine checks whether [DAC](#dac) contains the single precision operand -32768, if so it replaces it with the integer equivalent 8000H. This step is required during numeric input conversion ([3299H](#3299h)) because of the asymmetric integer number range.

<a name="2fb2h"></a>

    Address... 2FB2H

This routine is used by the Factor Evaluator to apply the "`CSNG`" function to an operand contained in [DAC](#dac). The operand's type is first checked via the [GETYPR](#getypr) standard routine, if it is already single precision the routine simply terminates. If it is a string a "`Type mismatch`" error is generated ([406DH](#406dh)). If it is double precision [VALTYP](#valtyp) is changed (3053H) and the mantissa rounded up from the seventh digit (2741H). If the operand is an integer it is converted from binary to a maximum of five BCD digits by successive divisions using the constants 10000, 1000, 100, 10, 1. These are placed in [DAC](#dac) to form the single precision mantissa. The exponent is equal to the number of significant digits in the mantissa. For example if there are five the exponent would be 10^5.

<a name="3030h"></a>

    Address... 3030H

This table contains the five constants used by the "`CSNG`" routine: -10000, -1000, -100, -10, -1

<a name="303ah"></a>

    Address... 303AH

This routine is used by the Factor Evaluator to apply the "`CDBL`" function to an operand contained in [DAC](#dac). The operand's type is first checked via the [GETYPR](#getypr) standard routine, if it is already double precision the routine simply terminates. If it is a string a "`Type mismatch`" error is generated ([406DH](#406dh)). If it is an integer it is first converted to single precision (2FC8H), the eight least significant digits are then zeroed and [VALTYP](#valtyp) set to 8.

<a name="3058h"></a>

    Address... 3058H

This routine checks that the current operand is a string type, if not a "`Type mismatch`" error is generated ([406DH](#406dh)).

<a name="305dh"></a>

    Address... 305DH

This routine is used by the "`CINT`" routine ([2F8AH](#2f8ah)) to convert a BCD single precision or double precision operand into a signed binary integer in register pair DE, it returns Flag C if an overflow has occurred. Successive digits are taken from the mantissa and added to the product starting with the most significant one. After each addition the product is multiplied by ten. The number of digits to process is determined by the exponent, for example five digits would be taken with an exponent of 10^5. Finally the mantissa sign is checked and the product negated (3221H) if necessary.

<a name="30beh"></a>

    Address... 30BEH

This routine is used by the Factor Evaluator to apply the "`FIX`" function to an operand contained in [DAC](#dac). The operand's type is first checked via the [GETYPR](#getypr) standard routine, if it is an integer the routine simply terminates. The mantissa sign is then checked ([2E71H](#2e71h)), if it is positive control transfers to the "`INT`" routine ([30CFH](#30cfh)). Otherwise the sign is inverted to positive, the "`INT`" function is performed ([30CFH](#30cfh)) and the sign restored to negative.

<a name="30cfh"></a>

    Address... 30CFH

This routine is used by the Factor Evaluator to apply the "`INT`" function to an operand contained in [DAC](#dac). The operand's type is first checked via the [GETYPR](#getypr) standard routine, if it is an integer the routine simply terminates. The number of fractional digits is determined by subtracting the exponent from the type's digit count, 6 for single precision, 14 for double precision.

If the mantissa sign is positive these fractional digits are simply zeroed. If the mantissa sign is negative each fractional digit is examined before it is zeroed. If all the digits were previously zero the routine simply terminates. Otherwise -1.0 is added to the operand by the single precision addition routine ([324EH](#324eh)) or the double precision addition routine ([269AH](#269ah)). It should be noted that an operand's type is not normally changed by the "`CINT`" function.

<a name="314ah"></a>

    Address... 314AH

This routine multiplies the unsigned binary integers in register pairs BC and DE, the result is returned in register pair DE. The standard shift and add method is used, the product is successively multiplied by two and register pair BC added to it for every 1 bit in register pair DE. The routine is used by the Variable search routine ([5EA4H](#5ea4h)) to compute an element's position within an Array, a "`Subscript out of range`" error is generated (601DH) if an overflow occurs.

<a name="3167h"></a>

    Address... 3167H

This routine is used by the Expression Evaluator to subtract two integer operands. The first operand is contained in register pair DE and the second in register pair HL, the result is returned in [DAC](#dac). The second operand is negated (3221H) and control drops into the addition routine.

<a name="3172h"></a>

    Address... 3172H

This routine is used by the Expression Evaluator to add two integer operands. The first operand is contained in register pair DE and the second in register pair HL, the result is returned in [DAC](#dac). The signed binary operands are normally just added and placed in [DAC](#dac). However, if an overflow has occurred both operands are converted to single precision (2FCBH) and control transfers to the single precision adder ([324EH](#324eh)). An overflow has occurred when both operands are of the same sign and the result is of the opposite sign, for example:

    30000+15000=-20536

</a>

<a name="3193h"></a>

    Address... 3193H

This routine is used by the Expression Evaluator to multiply two integer operands. The first operand is contained in register pair DE and the second in register pair HL, the result is returned in [DAC](#dac). The two operand signs are saved temporarily and both operands made positive ([3215H](#3215h)). Multiplication proceeds using the standard binary shift and add method with register pair HL as the product accumulator, register pair BC containing the first operand and register pair DE the second. If the product exceeds 7FFFH at any time during multiplication both operands are converted to single precision (2FCBH) and control transfers to the single precision multiplier ([325CH](#325ch)). Otherwise the initial signs are restored and, if they differ, the product negated before being placed in [DAC](#dac) as an integer (321DH).

<a name="31e6h"></a>

    Address... 31E6H

This routine is used by the Expression Evaluator to integer divide (\) two integer operands. The first operand is contained in register pair DE and the second in register pair HL, the result is returned in [DAC](#dac). If the second operand is zero a "`Division by zero`" error is generated ([4058H](#4058h)), otherwise the two operand signs are saved and both operands made positive ([3215H](#3215h)). Division proceeds using the standard binary shift and subtract method with register pair HL containing the remainder, register pair BC the second operand and register pair DE the first operand and the product. When division is complete the initial signs are restored and, if they differ, the product is negated before being placed in [DAC](#dac) as an integer (321DH).

<a name="3215h"></a>

    Address... 3215H

This routine is used to make two signed binary integers, in register pairs HL and DE, positive. Both the initial operand signs are returned as a flag in bit 7 of register B: 0=Same, 1=Different. Each operand is then examined and, if it is negative, made positive by subtracting it from zero.

<a name="322bh"></a>

    Address... 322BH

This routine is used by the "`ABS`" function to make a negative integer contained in [DAC](#dac) positive. The operand is taken from [DAC](#dac), negated and then placed back in [DAC](#dac) (3221H). If the operand's value is 8000H it is converted to single precision (2FCCH) as there is no integer of value +32768.

<a name="323ah"></a>

    Address... 323AH

This routine is used by the Expression Evaluator to "`MOD`" two integer operands. The first operand is contained in register pair DE and the second in register pair HL, the result is returned in [DAC](#dac). The sign of the first operand is saved and the two operands divided ([31E6H](#31e6h)). As the remainder is returned doubled by the division process register pair DE is shifted one place right to restore it. The sign of the first operand is then restored and, if it is negative, the remainder is negated before being placed in [DAC](#dac) as an integer (321DH).

<a name="324eh"></a>

    Address... 324EH

This routine is used by the Expression Evaluator to add two single precision operands. The first operand is contained in registers C, B, E, D and the second in [DAC](#dac), the result is returned in [DAC](#dac). The first operand is copied to [ARG](#arg) ([3280H](#3280h)), the second operand is converted to double precision (3042H) and control transfers to the double precision adder ([269AH](#269ah)).

<a name="3257h"></a>

    Address... 3257H

This routine is used by the Expression Evaluator to subtract two single precision operands. The first operand is contained in registers C, B, E, D and the second in [DAC](#dac), the result is returned in [DAC](#dac). The second operand is negated (2E8DH) and control transfers to the single precision adder ([324EH](#324eh)).

<a name="325ch"></a>

    Address... 325CH

This routine is used by the Expression Evaluator to multiply two single precision operands. The first operand is contained in registers C, B, E, D and the second in [DAC](#dac), the result is returned in [DAC](#dac). The first operand is copied to [ARG](#arg) ([3280H](#3280h)), the second operand is converted to double precision (3042H) and control transfers to the double precision multiplier ([27E6H](#27e6h)).

<a name="3265h"></a>

    Address... 3265H

This routine is used by the Expression Evaluator to divide two single precision operands. The first operand is contained in registers C, B, E, D and the second in [DAC](#dac), the result is returned in [DAC](#dac). The first and second operands are exchanged so that the first is in [DAC](#dac) and the second in the registers. The second operand is then copied to [ARG](#arg) ([3280H](#3280h)), the first operand is converted to double precision (3042H) and control transfers to the double precision divider ([289FH](#289fh)).

<a name="3280h"></a>

    Address... 3280H

This routine copies the single precision operand contained in registers C, B, E and D to [ARG](#arg) and then zeroes the four least significant bytes.

<a name="3299h"></a>

    Address... 3299H

This routine converts a number in textual form to one of the standard internal numeric types, it is used during tokenization and by the "`VAL`", "`INPUT`" and "`READ`" Statement handlers. On entry register pair HL points to the first character of the text string to be converted. On exit register pair HL points to the character following the string, the numeric operand is in [DAC](#dac) and the type code in [VALTYP](#valtyp). Examples of the three types are:

<a name="figure41"></a>![][CH05F41]

**Figure 41:** Numeric Types in DAC

An integer is a sixteen bit binary number in two's complement form, it is stored LSB first, MSB second at [DAC](#dac)+2. An integer can range from 8000H (-32768) to 7FFFH (+32767).

A floating point number consists of an exponent byte and a three or seven byte mantissa. The exponent is kept in signed binary form and can range from 01H (-63) through 40H (0) up to 7FH (+63), the special value of 00H is used for the number zero. These exponent values are for a normalized mantissa. The Interpreter presents exponent-form numbers to the user with a leading digit, this results in an asymmetric exponent range of E-64 to E+62. Bit 7 of the exponent byte holds the mantissa sign, 0 for positive and 1 for negative, the mantissa itself is kept in packed BCD form with two digits per byte. It should be noted that the Interpreter uses the contents of [VALTYP](#valtyp) to determine a number's type, not the format of the number itself.

Conversion starts by examining the first text character. If this is an "&" control transfers to the special radix conversion routine ([4EB8H](#4eb8h)), if it is a leading sign character it is temporarily saved. Successive numeric characters are then taken and added to the integer product with appropriate multiplications by ten as each new digit is found. If the value of the product exceeds 32767, or a decimal point is found, the product is converted to single precision and any further characters placed directly in [DAC](#dac). If a seventh digit is found the product is changed to double precision, if more than fourteen digits are found the excess digits are read but ignored.

Conversion ceases when a non-numeric character is found. If this a type definition character ("%", "#" or "!") the appropriate conversion routine is called and control transfers to the exit point (331EH). If it is an exponent prefix ("E", "e", "D" or "d") one of the conversion routines will also be used and then the following digits converted to a binary exponent in register E. At the exit point (331EH) the product's type is checked via the [GETYPR](#getypr) standard routine. If it is single precision or double precision the exponent is calculated by first subtracting the fractional digit count, in register B, from the total digit count, in register D, to produce the leading digit count. This is then added to any explicitly stated exponent, in register E, and placed at [DAC](#dac)+0 as the exponent.

The leading sign character is restored and the product negated if required (2E86H), if the product is integer the routine then terminates. If the product is single precision control terminates by checking for the special value of -32768 ([2FA2H](#2fa2h)). If the product is double precision control terminates by rounding up from the fifteenth digit (273CH).

<a name="340ah"></a>

    Address... 340AH

This routine is used by the error handler to display the message " in " ([6678H](#6678h)) followed by the line number supplied in register pair HL ([3412H](#3412h)).

<a name="3412h"></a>

    Address... 3412H

This routine displays the unsigned binary integer supplied in register pair HL. The operand is placed in [DAC](#dac) as an integer (2F99H), converted to text (3441H) and then displayed (6677H).

<a name="3425h"></a>

    Address... 3425H

This routine converts the numeric operand contained in [DAC](#dac) to textual form in [FBUFFR](#fbuffr). The address of the first character of the resulting text is returned in register pair HL, the text is terminated by a zero byte. The operand is first converted to double precision ([375FH](#375fh)). The BCD digits of the mantissa are then unpacked, converted to ASCII and placed in [FBUFFR](#fbuffr) (36B3H). The position of the decimal point is determined by the exponent, for example:

```
.999*10 ^ +2 = 99.9
.999*10 ^ +1 = 9.99
.999*10 ^ +0 = .999
.999*10 ^ -1 = .0999
```

If the exponent is outside the range 10^-1 to 10^14 the number is presented in exponential form. In this case the decimal point is placed after the first digit and the exponent is converted from binary and follows the mantissa.

An alternative entry point to the routine exists at 3426H for the "`PRINT USING`" statement handler. With this entry point the number of characters to prefix the decimal point is supplied in register B, the number of characters to point fix it in register C and a format byte in register A:

<a name="figure42"></a>![][CH05F42]

**Figure 42:** Format Byte

Operation in this mode is fairly similar to the normal mode but with the addition of extra facilities. Once the operand has been converted to double precision the exponential form will be assumed if bit 0 of the format byte is set. The mantissa is shifted to the right in [DAC](#dac) and rounded up to lose unwanted postfix digits ([377BH](#377bh)). As the mantissa is converted to ASCII (36B3H) commas will be inserted at the appropriate points if bit 6 of the format byte is set. During post-conversion formatting (351CH) unused prefix positions will be filled with asterisks if bit 5 is set, a pound prefix may be added by setting bit 4. Bit 3 enables the "+" sign for positive numbers if set, otherwise a space is used. Bit 2 places any sign at the front if reset and at the back if set.

The entry point to the routine at 3441H is used to convert unsigned integers, notably line numbers, to their textual form. For example 9000H, when treated as a normal integer, would be converted to -28672. By using this entry point 36864 would be produced instead. The operand is converted by successive division with the factors 10000, 1000, 100, 10 and 1 and the resulting digits placed in [FBUFFR](#fbuffr) (36DBH).

<a name="3710h"></a>

    Address... 3710H

This table contains the five constants used by the numeric output routine: 10000, 1000, 100, 10, 1.

<a name="371ah"></a>

    Address... 371AH

This routine is used by the "`BIN`$" function to convert a numeric operand contained in [DAC](#dac) to textual form. Register B is loaded with the group size (1) and control transfers to the general conversion routine (3724H).

<a name="371eh"></a>

    Address... 371EH

This routine is used by the "`OCT`$" function to convert a numeric operand contained in [DAC](#dac) to textual form. Register B is loaded with the group size (3) and control transfers to the general conversion routine (3724H).

<a name="3722h"></a>

    Address... 3722H

This routine is used by the "`HEX`$" function to convert a numeric operand contained in [DAC](#dac) to textual form. Register B is loaded with the group size (4) and the operand converted to a binary integer in register pair HL ([5439H](#5439h)). Successive groups of 1, 3 or 4 bits are shifted rightwards out of the operand, converted to ASCII digits and placed in [FBUFFR](#fbuffr). When the operand is all zeroes the routine terminates with the address of the first text character in register pair HL, the string is terminated with a zero byte.

<a name="3752h"></a>

    Address... 3752H

This routine is used during numeric output to return an operand's digit count in register B and the address of its least significant byte in register pair HL. For single precision B=6 and HL=[DAC](#dac)+3, for double precision B=14 and HL=[DAC](#dac)+7.

<a name="375fh"></a>

    Address... 375FH

This routine is used during numeric output to convert the numeric operand in [DAC](#dac) to double precision ([303AH](#303ah)).

<a name="377bh"></a>

    Address... 377BH

This routine is used during numeric output to shift the mantissa in [DAC](#dac) rightwards (27DBH), the inverse of the digit count is supplied in register A. The result is then rounded up from the fifteenth digit (2741H).

<a name="37a2h"></a>

    Address... 37A2H

This routine is used during numeric output to return the inverse of the fractional digit count in a floating point operand. This is computed by subtracting the exponent from the operand's digit count (6 or 14).

<a name="37b4h"></a>

    Address... 37B4H

This routine is used during numeric output to locate the last non-zero digit of the mantissa contained in [DAC](#dac). Its address is returned in register pair HL.

<a name="37c8h"></a>

    Address... 37C8H

This routine is used by the Expression Evaluator to exponentiate (^) two single precision operands. The first operand is contained in registers C, B, E, D and the second in [DAC](#dac), the result is returned in [DAC](#dac). The first operand is copied to [ARG](#arg) ([3280H](#3280h)), pushed onto the stack ([2CC7H](#2cc7h)) and exchanged with [DAC](#dac) ([2C6FH](#2c6fh)). The second operand is then popped into [ARG](#arg) and control drops into the double precision exponentiation routine.

<a name="37d7h"></a>

    Address... 37D7H

This routine is used by the Expression Evaluator to exponentiate (^) two double precision operands. The first operand is contained in [DAC](#dac) and the second in [ARG](#arg), the result is returned in [DAC](#dac). The result is usually computed using:

    X^P=EXP(P*LOG(X))

An alternative, much faster, method is possible if the power operand is an integer. This is tested for by extracting the integer part of the operand and comparing for equality with the original value ([391AH](#391ah)). A positive result to this test means that the faster method can be used, this is described below.

<a name="383fh"></a>

    Address... 383FH

This routine is used by the Expression Evaluator to exponentiate (^) two integer operands. The first operand is contained in register pair DE and the second in register pair HL, the result is returned in [DAC](#dac). The routine operates by breaking the problem down into simple multiplications:

    6^13=6^1101=(6^8)*(6^4)*(6^1)

As the power operand is in binary form a simple right shift is sufficient to determine whether a particular intermediate product needs to be included in the result. The intermediate products themselves are obtained by cumulative multiplication of the operand each time the computation loop is traversed. If the product overflows at any time it is converted to single precision. Upon completion the power operand is checked, if it is negative the product is reciprocated as X^-P=1/X^P.

<a name="390dh"></a>

    Address... 390DH

This routine is used during exponentiation to multiply two integers ([3193H](#3193h)), it returns Flag NZ if the result has overflowed to single precision.

<a name="391ah"></a>

    Address... 391AH

This routine is used during exponentiation to check whether a double precision power operand consists only of an integer part, if so it returns Flag NC.

<a name="392eh"></a>

    Address... 392EH

This table of addresses is used by the Interpreter Runloop to find the handler for a statement token. Although not part of the table the associated keywords are included below:

|TO     |STATEMENT  |TO     |SATEMENT   |TO     |STMT   |
|-------|-----------|-------|-----------|-------|-------|
|63EAH  |END        |00C3H  |CLS        |5B11H  |CIRCLE |
|4524H  |FOR        |51C9H  |WIDTH      |7980H  |COLOR  |
|6527H  |NEXT       |485DH  |ELSE       |5D6EH  |DRAW   |
|485BH  |DATA       |6438H  |TRON       |59C5H  |PAINT  |
|4B6CH  |INPUT      |6439H  |TROFF      |00C0H  |BEEP   |
|5E9FH  |DIM        |643EH  |SWAP       |73E5H  |PLAY   |
|4B9FH  |READ       |6477H  |ERASE      |57EAH  |PSET   |
|4880H  |LET        |49AAH  |ERROR      |57E5H  |PRESET |
|47E8H  |GOTO       |495DH  |RESUME     |73CAH  |SOUND  |
|479EH  |RUN        |53E2H  |DELETE     |79CCH  |SCREEN |
|49E5H  |IF         |49B5H  |AUTO       |7BE2H  |VPOKE  |
|63C9H  |RESTORE    |5468H  |RENUM      |7A48H  |SPRITE |
|47B2H  |GOSUB      |4718H  |DEFSTR     |7B37H  |VDP    |
|4821H  |RETURN     |471BH  |DEFINT     |7B5AH  |BASE   |
|485DH  |REM        |471EH  |DEFSNG     |55A8H  |CALL   |
|63E3H  |STOP       |4721H  |DEFDBL     |7911H  |TIME   |
|4A24H  |PRINT      |4B0EH  |LINE       |786CH  |KEY    |
|64AFH  |CLEAR      |6AB7H  |OPEN       |7E4BH  |MAX    |
|522EH  |LIST       |7C52H  |FIELD      |73B7H  |MOTOR  |
|6286H  |NEW        |775BH  |GET        |6EC6H  |BLOAD  |
|48E4H  |ON         |7758H  |PUT        |6E92H  |BSAVE  |
|401CH  |WAIT       |6C14H  |CLOSE      |7C16H  |DSKO$  |
|501DH  |DEF        |6B5DH  |LOAD       |7C1BH  |SET    |
|5423H  |POKE       |6B5EH  |MERGE      |7C20H  |NAME   |
|6424H  |CONT       |6C2FH  |FILES      |7C25H  |KILL   |
|6FB7H  |CSAVE      |7C48H  |LSET       |7C2AH  |IPL    |
|703FH  |CLOAD      |7C4DH  |RSET       |7C2FH  |COPY   |
|4016H  |OUT        |6BA3H  |SAVE       |7C34H  |CMD    |
|4A1DH  |LPRINT     |6C2AH  |LFILES     |7766H  |LOCATE |
|5229H  |LLIST      |       |           |       |       |

<a name="39deh"></a>

    Address... 39DEH

This table of addresses is used by the Factor Evaluator to find the handler for a function token. Although not part of the table the associated keywords are included with the addresses shown below:

|TO     |FUNCTION   |TO     |FUNCTION   |TO     |FUNCTION   |
|-------|-----------|-------|-----------|-------|-----------|
|6861H  |LEFT$      |4FCCH  |POS        |30BEH  |FIX        |
|6891H  |RIGHT$     |67FFH  |LEN        |7940H  |STICK      |
|689AH  |MID$       |6604H  |TR$        |794CH  |TRIG       |
|2E97H  |SGN        |68BBH  |VAL        |795AH  |PDL        |
|30CFH  |INT        |680BH  |ASC        |7969H  |PAD        |
|2E82H  |ABS        |681BH  |CHR$       |7C39H  |DSKF       |
|2AFFH  |SQR        |541CH  |PEEK       |6D39H  |FPOS       |
|2BDFH  |RND        |7BF5H  |VPEEK      |7C66H  |CVI        |
|29ACH  |SIN        |6848H  |SPACE$     |7C6BH  |CVS        |
|2A72H  |LOG        |7C70H  |OCT$       |7C70H  |CVD        |
|2B4AH  |EXP        |65FAH  |HEX$       |6D25H  |EOF        |
|2993H  |COS        |4FC7H  |LPOS       |6D03H  |LOC        |
|29FBH  |TAN        |6FFFH  |BIN$       |6D14H  |LOF        |
|2A14H  |ATN        |2F8AH  |CINT       |7C57H  |MKI$       |
|69F2H  |FRE        |2FB2H  |CSNG       |7C5CH  |MKS$       |
|4001H  |INP        |303AH  |CDBL       |7C61H  |MKD$       |

<a name="3a3eh"></a>

    Address... 3A3EH

This table of addresses is used during program tokenization as an index into the BASIC keyword table ([3A72H](#3a72h)). Each of the twenty six entries defines the starting address of one of the keyword sub-blocks. The first entry points to the keywords beginning with the letter "A", the second to those beginning with the letter "B" and so on.

```
3A72H ... A   3B9FH ... J    3C8EH ... S
3A88H ... B   3BA0H ... K    3CDBH ... T
3A9FH ... C   3BA8H ... L    3CF6H ... U
3AF3H ... D   3BE8H ... M    3CFFH ... V
3B2EH ... E   3C09H ... N    3D16H ... W
3B4FH ... F   3C18H ... O    3D20H ... X
3B69H ... G   3C2BH ... P    3D24H ... Y
3B7BH ... H   3C5DH ... Q    3D25H ... Z
3B80H ... I   3C5EH ... R
```

<a name="3a72h"></a>

    Address... 3A72H

This table contains the BASIC keywords and tokens. Each of the twenty-six blocks within the table contains all the keywords beginning with a particular letter, it is terminated with a zero byte. Each keyword is stored in plain text with bit 7 set to mark the last character, this is followed immediately by the associated token. The first character of the keyword need not be stored as this is implied by its position in the table' The keywords and tokens are listed below in full, note that the "J", "Q", "Y" and "Z" blocks are empty:

```
AUTO   A9H  DSKF   26H  LIST    93H  REM     8FH
AND    F6H  DRAW   BEH  LFILES  BBH  RESUME  A7H
ABS    06H  ELSE   A1H  LOG     0AH  RSET    B9H
ATN    0EH  END    81H  LOC     2CH  RIGHT$  02H
ASC    15H  ERASE  A5H  LEN     12H  RND     08H
ATTR$  E9H  ERROR  A6H  LEFT$   01H  RENUM   AAH
BASE   C9H  ERL    E1H  LOF     2DH  SCREEN  C5H
BSAVE  D0H  ERR    E2H  MOTOR   CEH  SPRITE  C7H
BLOAD  CFH  EXP    0BH  MERGE   B6H  STOP    90H
BEEP   C0H  EOF    2BH  MOD     FBH  SWAP    A4H
BIN$   1DH  EQV    F9H  MKI$    2EH  SET     D2H
CALL   CAH  FOR    82H  MKS$    2FH  SAVE    BAH
CLOSE  B4H  FIELD  B1H  MKD$    30H  SPC(    DFH
COPY   D6H  FILES  B7H  MID$    03H  STEP    DCH
CONT   99H  FN     DEH  MAX     CDH  SGN     04H
CLEAR  92H  FRE    0FH  NEXT    83H  SQR     07H
CLOAD  9BH  FIX    21H  NAME    D3H  SIN     09H
CSAVE  9AH  FPOS   27H  NEW     94H  STR$    13H
CSRLIN E8H  GOTO   89H  NOT     E0H  STRING$ E3H
CINT   1EH  GO TO  89H  OPEN    B0H  SPACE$  19H
CSNG   1FH  GOSUB  8DH  OUT     9CH  SOUND   C4H
CDBL   20H  GET    B2H  ON      95H  STICK   22H
CVI    28H  HEX$   1BH  OR      F7H  STRIG   23H
CVS    29H  INPUT  85H  OCT$    1AH  THEN    DAH
CVD    2AH  IF     8BH  OFF     EBH  TRON    A2H
COS    0CH  INSTR  E5H  PRINT   91H  TROFF   A3H
CHR$   16H  INT    05H  PUT     B3H  TAB(    DBH
CIRCLE BCH  INP    10H  POKE    98H  TO      D9H
COLOR  BDH  IMP    FAH  POS     11H  TIME    CBH
CLS    9FH  INKEY$ ECH  PEEK    17H  TAN     0DH
CMD    D7H  IPL    D5H  PSET    C2H  USING   E4H
DELETE A8H  KILL   D4H  PRESET  C3H  USR     DDH
DATA   84H  KEY    CCH  POINT   EDH  VAL     14H
DIM    86H  LPRINT 9DH  PAINT   BFH  VARPTR  E7H
DEFSTR ABH  LLIST  9EH  PDL     24H  VDP     C8H
DEFINT ACH  LPOS   1CH  PAD     25H  VPOKE   C6H
DEFSNG ADH  LET    88H  PLAY    C1H  VPEEK   18H
DEFDBL AEH  LOCATE D8H  RETURN  8EH  WIDTH   A0H
DSKO$  D1H  LINE   AFH  READ    87H  WAIT    96H
DEF    97H  LOAD   B5H  RUN     8AH  XOR     F8H
DSKI$  EAH  LSET   B8H  RESTORE 8CH
```

</a>

<a name="3d26h"></a>

    Address... 3D26H

This twenty-one byte table is used by the Interpreter during program tokenization. It contains the ten single character keywords and their tokens:

```
+ ... F1H    * ... F3H   ^ ... F5H    ' ... E6H = ... EFH
- ... F2H    / ... F4H   \ ... FCH    > ... EEH < ... F0H
```

</a>

<a name="3d3bh"></a>

    Address... 3D3BH

This table is used by the Expression Evaluator to determine the precedence level for a given infix operator, the higher the table value the greater the operator's precedence. Not included are the precedences for the relational operators (64H), the "`NOT`" operator (5AH) and the negation operator (7DH), these are defined directly by the Expression and Factor Evaluators.

```
79H ... +       46H ... OR
79H ... -       3CH ... XOR
7CH ... *       32H ... EQV
7CH ... /       28H ... IMP
7FH ... ^       7AH ... MOD
50H ... AND     7BH ... \
```

</a>

<a name="3d47h"></a>

    Address... 3D47H

This table is used to convert the result of a user defined function to the same type as the Variable used in the function definition. It contains the addresses of the type conversion routines:

```
303AH ... CDBL
0000H ... Not used
2F8AH ... CINT
3058H ... Check string type
2FB2H ... CSNG
```

</a>

<a name="3d51h"></a>

    Address... 3D51H

This table of addresses is used by the Expression Evaluator to find the handler for a particular infix math operator when both operands are double precision:

```
269AH ... +
268CH ... -
27E6H ... *
289FH ... /
37D7H ... ^
2F83H ... Relation
```

</a>

<a name="3d5dh"></a>

    Address... 3D5DH

This table of addresses is used by the Expression Evaluator to find the handler for a particular infix math operator when both operands are single precision:

```
324EH ... +
3257H ... -
325CH ... *
3267H ... /
37C8H ... ^
2F21H ... Relation
```

</a>

<a name="3d69h"></a>

    Address... 3D69H

This table of addresses is used by the Expression Evaluator to find the handler for a particular infix math operator when both operands are integer:

```
3172H ... +
3167H ... -
3193H ... *
4DB8H ... /
383FH ... ^
2F4DH ... Relation
```

</a>

<a name="3d75h"></a>

    Address... 3D75H

This table contains the Interpreter error messages, each one is stored in plain text with a zero byte terminator. The associated error codes are shown below for reference only, they do not form part of the table:

```
01 NEXT without FOR             19 Device I/O error
02 Syntax error                 20 Verify error
03 RETURN without GOSUB         21 No RESUME
04 Out of DATA                  22 RESUME without error
05 Illegal function call        23 Unprintable error
06 Overflow                     24 Missing operand
07 Out of memory                25 Line buffer overflow
08 Undefined line number        50 FIELD overflow
09 Subscript out of range       51 Internal error
10 Redimensioned array          52 Bad file number
11 Division by zero             53 File not found
12 Illegal direct               54 File already open
13 Type mismatch                55 Input past end
14 Out of string space          56 Bad file name
15 String too long              57 Direct statement in file
16 String formula too complex   58 Sequential I/O only
17 Can't CONTINUE               59 File not OPEN
18 Undefined user function
```

</a>

<a name="3fd2h"></a>

    Address... 3FD2H

This is the plain text message "` in `" terminated by a zero byte.

<a name="3fd7h"></a>

    Address... 3FD7H

This is the plain text message "`Ok`", CR, LF terminated by a zero byte.

<a name="3fdch"></a>

    Address... 3FDCH

This is the plain text message "`Break`" terminated by a zero byte.

<a name="3fe2h"></a>

    Address... 3FE2H

This routine searches the Z80 stack for the "`FOR`" loop parameter block whose loop Variable address is supplied in register pair DE. The search is started four bytes above the current Z80 SP to allow for the caller's return address and the Runloop return address. If no "`FOR`" token (82H) exists the routine terminates Flag NZ, if one is found the loop Variable address is taken from the parameter block and checked. The routine terminates Flag Z upon a successful match with register pair HL pointing to the type byte of the parameter block. Otherwise the search moves up twenty-two bytes to the start of the next parameter block.

<a name="4001h"></a>

    Address... 4001H

This routine is used by the Factor Evaluator to apply the "`INP`" function to an operand contained in [DAC](#dac). The port number is checked ([5439H](#5439h)), the port read and the result placed in [DAC](#dac) as an integer (4FCFH).

<a name="400bh"></a>

    Address... 400BH

This routine first evaluates an operand in the range -32768 to +65535 ([542FH](#542fh)) and places it in register pair BC. After checking for a comma, via the [SYNCHR](#synchr) standard routine, it evaluates a second operand in the range 0 to 255 (521CH) and places this in register A.

<a name="4016h"></a>

    Address... 4016H

This is the "`OUT`" statement handler. The port number and data byte are evaluated ([400BH](#400bh)) and the data byte written to the relevant Z80 port.

<a name="401ch"></a>

    Address... 401CH

This is the "`WAIT`" statement handler. The port number and "`AND`" operands are first evaluated ([400BH](#400bh)) followed by the optional "`XOR`" operand (521CH). The port is then repeatedly read and the operands applied, XOR then AND, until a non-zero result is obtained. Contrary to the information given in some MSX manuals the loop can be broken by the CTRL-STOP key as the [CKCNTC](#ckcntc) standard routine is called from inside it.

<a name="4039h"></a>

    Address... 4039H

This routine is used by the Runloop when it encounters the end of the program text while in program mode. [ONEFLAG](#oneflag) is checked to see whether it still contains an active error code. If so a "`No RESUME`" error is generated, otherwise program termination continues normally (6401H). The idea behind this routine is to catch any "`ON ERROR`" handlers without a "`RESUME`" statement at the end.

<a name="404fh"></a>

    Address... 404FH

This routine is used by the "`READ`" statement handler when an error is found in a "`DATA`" statement. The line number contained in [DATLIN](#datlin) is copied to [CURLIN](#curlin) so the error handler will flag the "`DATA`" line as the illegal statement rather than the program line. Control then drops into the "`Syntax error`" generator.

<a name="4055h"></a>
<a name="4058h"></a>
<a name="405bh"></a>
<a name="405eh"></a>
<a name="4061h"></a>
<a name="4064h"></a>
<a name="4067h"></a>
<a name="406ah"></a>
<a name="406dh"></a>

    Address... 4055H

This is a group of nine error generators, register E is loaded with the relevant error code and control drops into the error handler:

|ADDRESS|ERROR
|-------|-----------------------
|4055H  |Syntax error
|4058H  |Division by zero
|405BH  |NEXT without FOR
|405EH  |Redimensioned array
|4061H  |Undefined user function
|4064H  |RESUME without error
|4067H  |Overflow error
|406AH  |Missing operand
|406DH  |Type mismatch

</a>

<a name="406fh"></a>

    Address... 406FH

This is the Interpreter error handler, all error generators transfer to here with an error code in register E. [VLZADR](#vlzadr) is first checked to see if the "`VAL`" statement handler has changed the program text, if so the original character is restored from [VLZDAT](#vlzdat). The current line number is then copied from [CURLIN](#curlin) to [ERRLIN](#errlin) and [DOT](#dot) and the Z80 stack is restored from [SAVSTK](#savstk) (62F0H). The error code is placed in [ERRFLG](#errflg), for use by the "`ERR`" function, and the current program text position copied from [SAVTXT](#savtxt) to [ERRTXT](#errtxt) for use by the "`RESUME`" statement handler. The error line number and program text position are also copied to [OLDLIN](#oldlin) and [OLDTXT](#oldtxt) for use by the "`CONT`" statement handler. [ONELIN](#onelin) is then checked to see if a previous "`ON ERROR`" statement has been executed. If so, and providing no error code is already active, control transfers to the Runloop (4620H) to execute the BASIC error recovery statements.

Otherwise the error code is used to count through the error message table at [3D75H](#3d75h) until the required one is reached. A CR,LF is issued ([7323H](#7323h)) and the screen forced back to text mode via the [TOTEXT](#totext) standard routine. A BELL code is then issued and the error message displayed ([6678H](#6678h)). Assuming the Interpreter is in program mode, rather than direct mode, this is followed by the line number ([340AH](#340ah)) and control drops into the "`OK`" point.

<a name="411fh"></a>

    Address... 411FH

This is the re-entry point to the Interpreter Mainloop for a terminating program. The screen is forced to text mode via the [TOTEXT](#totext) standard routine, the printer is cleared ([7304H](#7304h)) and I/O buffer 0 closed (6D7BH). A CR,LF is then issued to the screen ([7323H](#7323h)), the message "`OK`" is displayed ([6678H](#6678h)) and control drops into the Mainloop.

<a name="4134h"></a>

    Address... 4134H

This is the Interpreter Mainloop. [CURLIN](#curlin) is first set to FFFFH to indicate direct mode and [AUTFLG](#autflg) checked to see if "`AUTO`" mode is on. If so the next line number is taken from [AUTLIN](#autlin) and displayed ([3412H](#3412h)). The Program Text Area is then searched to see if this line already exists ([4295H](#4295h)) and either an asterisk or space displayed accordingly.

The [ISFLIO](#isflio) standard routine is then used to determine whether a "`LOAD`" statement is active. If so the program line is collected from the cassette ([7374H](#7374h)), otherwise it is taken from the console via the [PINLIN](#pinlin) standard routine. If the line is empty or the CTRL-STOP key has been pressed control transfers back to the start of the Mainloop ([4134H](#4134h)) with no further action. If the line commences with a line number this is converted to an unsigned integer in register pair DE (4769H). The line is then converted to tokenized form and placed in [KBUF](#kbuf) ([42B2H](#42b2h)). If no line number was found at the start of the line control then transfers to the Runloop ([6D48H](#6d48h)) to execute the statement.

Assuming the line commences with a line number it is tested to see if it is otherwise empty and the result temporarily saved. The line number is copied to [DOT](#dot) and [AUTLIN](#autlin) increased by the contents of [AUTINC](#autinc), if [AUTLIN](#autlin) now exceeds 65530 the "`AUTO`" mode is turned off. The Program Text Area is then searched ([4295H](#4295h)) to find a matching line number or, failing this, the position of the next highest line number. If no matching line number is found and the line is empty and "`AUTO`" mode is off an "`Undefined line number`" error is generated ([481CH](#481ch)). If a matching line number is found and the line is empty and "`AUTO`" mode is on the Mainloop simply skips to the next statement (4237H).

Otherwise any pointers in the Program Text Area are converted back to line numbers (54EAH) and any existing program line deleted (5405H). Assuming the new program line is non-empty the Program Text Area is opened up by the required amount ([6250H](#6250h)) and the tokenized program line copied from [KBUF](#kbuf).

The Program Text Area links are then recalculated (4257H), the Variable Storage Areas are cleared ([629AH](#629ah)) and control transfers back to the start of the Mainloop.

<a name="4253h"></a>

    Address... 4253H

This routine recalculates the Program Text Area links after a program modification. The first two bytes of each program line contain the starting address of the following line, this is called the link. Although the link increases the amount of storage required per program line it greatly reduces the time required by the Interpreter to locate a given line.

An example of a typical program line is shown below, in this case the line "`10 PRINT 9`" situated at the start of the Program Text Area (8001H):

<a name="figure43"></a>![][CH05F43]

**Figure 43:** Program Line

In the above example the link is stored in Z80 word order (LSB,MSB) and is immediately followed by the binary line number, also in word order. The statement itself is composed of a "`PRINT`" token (91H), a single space, the number nine and the end of line character (00H). Further details of the storage format can be found in the tokenizing routine ([42B2H](#42b2h)).

Each link is recalculated simply by scanning through the line until the end of line character is found. The process is complete when the end of the Program Storage Area, marked by the special link of 0000H, is reached.

<a name="4279h"></a>

    Address... 4279H

This routine is used by the "`LIST`" statement handler to collect up to two line number operands from the program text. If the first line number is present it is converted to an unsigned integer in register pair DE ([475FH](#475fh)), if not a default value of 0000H is returned. If the second line number is present it must be preceded by a "-" token (F2H) and is returned on the Z80 stack, if not a default value of 65530 is returned. Control then drops into the program text search routine to find the first referenced program line.

<a name="4295h"></a>

    Address... 4295H

This routine searches the Program Text Area for the program line whose line number is supplied in register pair DE. Starting at the address contained in [TXTTAB](#txttab) each program line is examined for a match. If an equal line number is found the routine terminates with Flag Z,C and register pair BC pointing to the start of the program line. If a higher line number is found the routine terminates Flag NZ,NC and if the end link is reached the routine terminates Flag Z,NC.

<a name="42b2h"></a>

    Address... 42B2H

This routine is used by the Interpreter Mainloop to tokenize a line of text. On entry register pair HL points to the first text character in [BUF](#buf). On exit the tokenized line is in [KBUF](#kbuf), register pair BC holds its length and register pair HL points to its start.

Except after opening quotes or after the "`REM`", "`CALL`" or "`DATA`" keywords any string of characters matching a keyword is replaced by that keyword's token. Lower case alphabetics are changed to upper case for keyword comparison. The character "`?`" is replaced by the "`PRINT`" token (91H) and the character "'" by ":" (3AH), "`REM`" token (8FH), "'" token (E6H). The "`ELSE`" token (A1H) is preceded by a statement separator (3AH). Any other miscellaneous characters in the text are copied without alteration except that lower case alphabetics are converted to upper case. Those tokens smaller than 80H, the function tokens, cannot be stored directly in [KBUF](#kbuf) as they will conflict with ordinary text. Instead the sequence FFH, token+80H is used.

Numeric constants are first converted into one of the standard types in [DAC](#dac) ([3299H](#3299h)). They are then stored in one of several ways depending upon their type and magnitude, the general idea being to minimize memory usage:

```
0BH LSB MSB ................... Octal number
0CH LSB MSB ................... Hex number
11H to 1AH .................... Integer 0 to 9
0FH LSB ....................... Integer 10 to 255
1CH LSB MSB ................... Integer 256 to 32767
1DH EE DD DD DD ............... Single Precision
1FH EE DD DD DD DD DD DD DD ... Double Precision
```

There is no specific token for binary numbers, these are left as character strings. This would appear to be a legacy from earlier versions of Microsoft BASIC. Any sign prefixing a number is regarded as an operator and is stored as a separate token, negative numbers are not produced during tokenization. As double precision numbers occupy so much space a line containing too many, for example PRINT 1#,1#,1# etc. may cause [KBUF](#kbuf) to fill up. If this happens a "`Line buffer overflow`" error is generated.

Any number following one of the keyword tokens in the table at [43B5H](#43b5h) is considered to be a line number operand and is stored with a different token:

```
0DH LSB MSB ................... Pointer
0EH LSB MSB ................... Line number
```

During tokenization only the normal type (0EH) is generated, when a program actually runs these line number operands are converted to the address pointer type (0DH).

<a name="43b5h"></a>

    Address... 43B5H

This table of tokens is used during tokenization to check for the keywords which take line number operands. The keywords themselves are listed below:

```
RESTORE    RUN
AUTO       LIST
RENUM      LLIST
DELETE     GOTO
RESUME     RETURN
ERL        THEN
ELSE       GOSUB
```

</a>

<a name="4524h"></a>

    Address... 4524H

This is the "`FOR`" statement handler. The loop Variable is first located and assigned its initial value by the "`LET`" handler ([4880H](#4880h)), the address of the loop Variable is returned in register pair DE. The end of the statement is found ([485BH](#485bh)) and its address placed in [ENDFOR](#endfor). The Z80 stack is then searched (3FE6H) for any parameter blocks using the same loop Variable. For each one found the current [ENDFOR](#endfor) address is compared with that of the parameter block, if there is a match that section of the stack is discarded. This is done in case there are any incomplete loops as a result of a "`GOTO`" back to the "`FOR`" statement from inside the loop.

The termination operand and optional "`STEP`" operand are then evaluated and converted to the same type as the loop Variable. After checking that stack space is available ([625EH](#625eh)) a twenty-five byte parameter block is pushed onto the Z80 stack. This is made up of the following:

```
2 bytes ... ENDFOR address
2 bytes ... Current line number
8 bytes ... Loop termination value
8 bytes ... STEP value
1 byte  ... Loop type
1 byte  ... STEP direction
2 bytes ... Address of loop Variable
1 byte  ... FOR token (82H)
```

The parameter block remains on the stack for use by the "`NEXT`" statement handler until termination is reached, it is then discarded. The size of the block remains constant even though, for integer and single precision loop Variables, the full eight bytes are not required for the termination and STEP values. In these cases the least significant bytes are packed out with garbage.

It should be noted that the type of arithmetic operation performed by the "`NEXT`" statement handler, and hence the loop execution speed, depends entirely upon the loop Variable type and not the operand types. For the fastest program execution integer type Variables, N% for example, should be used.

<a name="4601h"></a>

    Address... 4601H

This is the Runloop, each statement handler returns here upon completion so the Interpreter can proceed to the next statement. The current Z80 SP is copied to [SAVSTK](#savstk) for error recovery purposes and the CTRL-STOP key checked via the [ISCNTC](#iscntc) standard routine. Any pending interrupts are processed ([6389H](#6389h)) and the current program text position, held in register pair HL throughout the Interpreter, is copied to [SAVTXT](#savtxt).

The current program character is then examined, if this is a statement separator (3AH) control transfers immediately to the execution point ([4640H](#4640h)). If it is anything else but an end of line character (00H) a "`Syntax error`" is generated ([4055H](#4055h)) as there is spurious text at the end of the statement. Register pair HL is advanced to the first character of the new program line and the link examined, if this is zero the program is terminated ([4039H](#4039h)). Otherwise the line number is taken from the new line and placed in [CURLIN](#curlin). If [TRCFLG](#trcflg) is non-zero the line number is displayed ([3412H](#3412h)) enclosed by square brackets, control then drops into the execution point.

<a name="4640h"></a>

    Address... 4640H

This is the Runloop execution point. A return to the start of the Runloop ([4601H](#4601h)) is pushed onto the Z80 stack and the first character taken from the new statement via the [CHRGTR](#chrgtr) standard routine. If it is an underline character (5FH) control transfers to the "`CALL`" statement handler (55A7H). If it is smaller than 81H, the smallest statement token, control transfers to the "`LET`" handler ([4880H](#4880h)). If it is larger than D8H, the largest statement token, it is checked to see if it is one of the function tokens allowed as a statement ([51ADH](#51adh)). Otherwise the handler address is taken from the table at [392EH](#392eh) and pushed onto the stack. Control then drops into the [CHRGTR](#chrgtr) standard routine to fetch the next program character before control transfers to the statement handler.

<a name="4666h"></a><a name="chrgtr"></a>

```
Address... 4666H
Name...... CHRGTR
Entry..... HL points to current program character
Exit...... A=Next program character
Modifies.. AF, HL
```

Standard routine to fetch the next character from the program text. Register pair HL is incremented and the character placed in register A. If it is a space, TAB code (09H) or LF code (0AH) it is skipped over. If it is a statement separator (3AH) or end of line character (00H) the routine terminates with Flag Z,NC. If it is a digit from "0" to "9" the routine terminates with Flag NZ,C. If it is any other character apart from the numeric prefix tokens the routine terminates Flag NZ,NC. If the character is one of the numeric prefix tokens then it is placed in [CONSAV](#consav) and the operand copied to [CONLO](#conlo). The type code is placed in [CONTYP](#contyp) and the address of the trailing program character in [CONTXT](#contxt).

<a name="46e8h"></a>

    Address... 46E8H

This routine is used by the Factor Evaluator and during detokenization to recover a numeric operand when one of the prefix tokens is returned by the [CHRGTR](#chrgtr) standard routine. The prefix token is first taken from [CONSAV](#consav), if it is anything but a line number or pointer token the operand is copied from [CONLO](#conlo) to [DAC](#dac) and the type code copied from [CONTYP](#contyp) to [VALTYP](#valtyp). If it is a line number it is converted to single precision and placed in [DAC](#dac) (3236H). If it is a pointer the original line number is recovered from the referenced program line, converted to single precision and placed in [DAC](#dac) (3236H).

<a name="4718h"></a>

    Address... 4718H

This is the "`DEFSTR`" statement handler. Register E is loaded with the string type code (03H) and control drops into the general type definition routine.

<a name="471bh"></a>

    Address... 471BH

This is the "`DEFINT`" statement handler. Register E is loaded with the integer type code (02H) and control drops into the general type definition routine.

<a name="471eh"></a>

    Address... 471EH

This is the "`DEFSNG`" statement handler. Register E is loaded with the single precision type code (04H) and control drops into the general type definition routine.

<a name="4721h"></a>

    Address... 4721H

This is the "`DEFDBL`" statement handler. Register E is loaded with the double precision type code (08H) and the first range definition character checked ([64A7H](#64a7h)). If this is not upper case alphabetic a "`Syntax error`" is generated ([4055H](#4055h)). If a "-" token (F2H) follows the second range definition character is taken and checked ([64A7H](#64a7h)), the difference between the two determines the number of entries in [DEFTBL](#deftbl) that are filled with the type code.

<a name="4755h"></a>

    Address... 4755H

This routine evaluates an operand and converts it to an integer in register pair DE (520FH). If the operand is negative an "`Illegal function call`" error is generated.

<a name="475fh"></a>

    Address... 475FH

This routine is used by the statement handlers shown in the table at [43B5H](#43b5h) to collect a single line number operand from the program text and convert it to an unsigned integer in register pair DE. If the first character in the text is a "." (2EH) the routine terminates with the contents of [DOT](#dot). If it is one of the line number tokens (0DH or 0EH) the routine terminates with the contents of [CONLO](#conlo). Otherwise successive digits are taken and added to the product, with appropriate multiplications by ten, until a non-numeric character is found.

<a name="479eh"></a>

    Address... 479EH

This is the "`RUN`" statement handler. If no line number operand is present in the program text the system is cleared ([629AH](#629ah)) and control returns to the Runloop with register pair HL pointing to the start of the Program Storage Area. If a line number operand is present the system is cleared (62A1H) and control transfers to the "`GOTO`" statement handler (47E7H). Otherwise a following filename is assumed, for example `RUN "CAS:FILE"`, and control transfers to the "`LOAD`" statement handler ([6B5BH](#6b5bh));

<a name="47b2h"></a>

    Address... 47B2H

This is the "`GOSUB`" statement handler. After checking that stack space is available ([625EH](#625eh)) the line number operand is collected and placed in register pair DE (4769H). The seven byte parameter block is then pushed onto the stack and control transfers to the "`GOTO`" handler (47EBH). The parameter block is made up of the following:

```
2 bytes ... End of statement address
2 bytes ... Current line number
2 bytes ... 0000H
1 byte  ... GOSUB token (8DH)
```

The parameter block remains on the stack until a "`RETURN`" statement is executed. It is then used to determine the original program text position after which it is discarded.

<a name="47cfh"></a>

    Address... 47CFH

This routine is used by the Runloop interrupt processor ([6389H](#6389h)) to create a "`GOSUB`" type parameter block on the Z80 stack. An interrupt block is identical to a normal block except that the two zero bytes shown above are replaced by the address of the device's entry in [TRPTBL](#trptbl). This address will be used by the "`RETURN`" statement handler to update the device's interrupt status once a subroutine has terminated. After pushing the parameter block control transfers to the Runloop to execute the program line whose address is supplied in register pair DE.

<a name="47e8h"></a>

    Address... 47E8H

This is the "`GOTO`" statement handler. The line number operand is collected (4769H) and placed in register pair HL. If it is a pointer control transfers immediately to the Runloop to begin execution at the new program text position. Otherwise the line number is compared with the current line number to determine the starting position for the program text search. If it is greater the search starts from the end of this line (4298H), if it is smaller it starts from the beginning of the Program Text Area ([4295H](#4295h)). If the referenced line cannot be found an "`Undefined line number`" error is generated ([481CH](#481ch)). Otherwise the line number operand is replaced by the referenced program line's address and its token changed to the pointer type (5583H). Control then transfers to the Runloop to execute the referenced program line.

<a name="481ch"></a>

    Address... 481CH

This is the "`Undefined line number`" error generator.

<a name="4821h"></a>

    Address... 4821H

This is the "`RETURN`" statement handler. A dummy loop Variable address is placed in register pair DE and the Z80 stack searched ([3FE2H](#3fe2h)) to find the first parameter block not belonging to a "`FOR`" loop, this section of stack is then discarded. If no "`GOSUB`" token (8DH) is found at this point a "`RETURN without GOSUB`" error is generated.

The next two bytes are then taken from the block, if they are non-zero the block was generated by an interrupt and the temporary "`STOP`" condition is removed ([633EH](#633eh)). The program text is then examined, if anything follows the "`RETURN`" token itself it is assumed to be a line number operand and control transfers to the "`GOTO`" handler ([47E8H](#47e8h)). Otherwise the old line number and program text address are taken from the block and control returns to the Runloop.

<a name="485bh"></a>

    Address... 485BH

This is the "`DATA`" statement handler. The program text is skipped over until a statement separator (3AH) or end of line character (00H) is found. This routine is also the "`REM`" and "`ELSE`" statement handler via the entry point at 485DH, in this case only the end of line character acts as a terminator.

<a name="4880h"></a>

    Address... 4880H

This is the "`LET`" statement handler. The Variable is first located ([5EA4H](#5ea4h)), its address saved in [TEMP](#temp) and the operand evaluated ([4C64H](#4c64h)). If necessary the operand's type is then changed to match that of the Variable (517AH). Assuming the operand is one of the three numeric types it is simply copied from [DAC](#dac) to the Variable in the Variable Storage Area (2EF3H). If the operand is a string type the address of the string body is taken from the descriptor and checked. If it is in [KBUF](#kbuf), as would be the case for an explicit string in a direct statement, the body is first copied to the String Storage Area and a new descriptor created (6611H). The descriptor is then freed from [TEMPST](#tempst) (67EEH) and copied to the Variable in the Variable Storage Area (2EF3H).

<a name="48e4h"></a>

    Address... 48E4H

This is the "`ON ERROR`", "`ON DEVICE GOSUB`" and "`ON EXPRESSION`" statement handler. If the next program text character is not an "`ERROR`" token (A6H) control transfers to the "`ON DEVICE GOSUB`" and "`ON EXPRESSION`" handler ([490DH](#490dh)). The program text is checked to ensure that a "`GOTO`" token (89H) follows and then the line number operand collected (4769H). The program text is searched to obtain the address of the referenced line (4293H) and this is placed in [ONELIN](#onelin). If the line number operand is non-zero the routine then terminates. If the line number operand is zero [ONEFLG](#oneflg) is checked to see if an error situation already exists (implying that the statement is inside a BASIC error recovery routine). If so control transfers to the error handler (4096H) to force an immediate error, otherwise the routine terminates normally.

<a name="490dh"></a>

    Address... 490DH

This is the "`ON DEVICE GOSUB`" and "`ON EXPRESSION`" statement handler. If the next program text character is not a device token ([7810H](#7810h)) control transfers to the "`ON EXPRESSION`" handler ([4943H](#4943h)). After checking the program text for a "`GOSUB`" token (8DH) each of the line number operands required for a particular device is collected in turn (4769H). Assuming a given line number operand is non-zero the program text is searched to find the address of the referenced line (4293H) and this is placed in the device's entry in [TRPTBL](#trptbl) ([785CH](#785ch)). The routine terminates when no more line number operands are found.

<a name="4943h"></a>

    Address... 4943H

This is the "`ON EXPRESSION`" statement handler. The operand is evaluated (521CH) and the following "`GOSUB`" token (8DH) or "`GOTO`" token (89H) placed in register A. The operand is then used to count along the program text until register pair HL points to the required line number operand. Control then transfers back to the Runloop execution point (4646H) to decode the "`GOSUB`" or "`GOTO`" token.

<a name="495dh"></a>

    Address... 495DH

This is the "`RESUME`" statement handler. [ONEFLG](#oneflg) is first checked to make sure that an error condition already exists, if not a "`RESUME without error`" is generated ([4064H](#4064h)). If a non- zero line number operand follows control transfers to the "`GOTO`" handler (47EBH). If a "`NEXT`" token (83H) follows the position of the error is restored from [ERRTXT](#errtxt) and [ERRLIN](#errlin), the start of the next statement is found ([485BH](#485bh)) and the routine terminates. If there is no line number operand or if it is zero the position of the error is found from [ERRTXT](#errtxt) and [ERRLIN](#errlin) and the routine terminates.

<a name="49aah"></a>

    Address... 49AAH

This is the "`ERROR`" statement handler. The operand is evaluated and placed in register E (521CH). If it is zero an "`Illegal function call`" error is generated (475AH), otherwise control transfers to the error handler ([406FH](#406fh)).

<a name="49b5h"></a>

    Address... 49B5H

This is the "`AUTO`" Statement handler. The optional start and increment line number operands, both with a default value of ten, are collected ([475FH](#475fh)) and placed in [AUTLIN](#autlin) and [AUTINC](#autinc). After making [AUTFLG](#autflg) non-zero the Runloop return is destroyed and control transfers directly to the Mainloop ([4134H](#4134h)).

<a name="49e5h"></a>

    Address... 49E5H

This is the "`IF`" statement handler. The operand is evaluated ([4C64H](#4c64h)) and, after checking for a "`GOTO`" token (89H) or "`THEN`" token (DAH), its sign is tested ([2EA1H](#2ea1h)). If the operand is non- zero (true) the following text is executed either by an immediate transfer to the Runloop (4646H) or, for a line number operand, the "`GOTO`" handler ([47E8H](#47e8h)). If the operand is zero (false) the statement text is scanned ([485BH](#485bh)) until an "`ELSE`" token (A1H) is found not balanced by an "`IF`" token (8BH) and execution re-commences.

<a name="4a1dh"></a>

    Address... 4A1DH

This is the "`LPRINT`" statement handler. [PRTFLG](#prtflg) is set to 01H, to direct output to the printer, and control transfers to the "`PRINT`" handler (4A29H).

<a name="4a24h"></a>

    Address... 4A24H

This is the "`PRINT`" statement handler. The program text is first checked for a trailing buffer number and, if necessary, [PTRFIL](#ptrfil) set to direct output to the required I/O buffer ([6D57H](#6d57h)). If no more program text exists a CR,LF is issued (7328H) and the routine terminates ([4AFFH](#4affh)). Otherwise successive characters are taken from the program text and analyzed. If a "`USING`" token (E4H) is found control transfers to the "`PRINT USING`" handler ([60B1H](#60b1h)). If a ";" character is found control just transfers back to the start to fetch the next item (4A2EH). If a comma is found sufficient spaces are issued to bring the current print position, from [TTYPOS](#ttypos), [LPTPOS](#lptpos) or an I/O buffer FCB, to an integral multiple of fourteen. If output is directed to the screen and the print position is equal to or greater than the contents of [CLMLST](#clmlst) or if output is directed to the printer and it is equal to or greater than 238 then a CR,LF is issued instead (7328H). If a "`SPC(`" token (DFH) is found the operand is evaluated ([521BH](#521bh)) and the required number of spaces are output. If a "`TAB(`" token (DBH) is found the operand is evaluated ([521BH](#521bh)) and sufficient spaces issued to bring the current print position, from [TTYPOS](#ttypos), [LPTPOS](#lptpos) or an I/O buffer FCB, to the required point.

If none of these characters is found the program text contains a data item which is then evaluated ([4C64H](#4c64h)). If the operand is a string it is simply displayed (667BH). If it is numeric it is first converted to text in [FBUFFR](#fbuffr) ([3425H](#3425h)) and a string descriptor created (6635H). If output is directed to an I/O buffer the resulting string is then displayed (667BH). If output is directed to the screen or printer the current print position, from [TTYPOS](#ttypos) or [LPTPOS](#lptpos), is compared with the line length and a CR,LF issued (7328H) if the output will not fit on the line. The maximum line length is 255 for the printer and is taken from [LINLEN](#linlen) for the screen. Once the string has been displayed control transfers back to the start of the handler.

<a name="4affh"></a>

    Address... 4AFFH

This routine zeroes [PRTFLG](#prtflg) and [PTRFIL](#ptrfil) to return the Interpreter's output to the screen.

<a name="4b0eh"></a>

    Address... 4B0EH

This is the "`LINE INPUT`", "`LINE INPUT#`" and "`LINE`" statement handler. If the following program text character is anything other than an "`INPUT`" token (85H) control transfers to the "`LINE`" statement handler ([58A7H](#58a7h)). If the following program text character is a "#" (23H) control transfers to the "`LINE INPUT#`" statement handler ([6D8FH](#6d8fh)).

Any following prompt string is evaluated and displayed (4B7BH) and the Variable located ([5EA4H](#5ea4h)) and checked to ensure that it is a string type ([3058H](#3058h)). The line of text is collected from the console via the [INLIN](#inlin) standard routine, if Flag C (CTRL-STOP) is returned control transfers to the "`STOP`" statement handler (63FEH). Otherwise the input string is analyzed and a descriptor created (6638H), control then transfers to the "`LET`" statement handler for assignment (4892H). It should be noted that the screen is not forced to text mode before the input is collected.

<a name="4b3ah"></a>

    Address... 4B3AH

This is the plain text message "`?Redo from start`", CR, LF terminated by a zero byte.

<a name="4b4dh"></a>

    Address... 4B4DH

This routine is used by the "`READ/INPUT`" statement handler if it has failed to convert a data item to numeric form. If in "`READ`" mode ([FLGINP](#flginp) is non-zero) a "`Syntax error`" is generated ([404FH](#404fh)). Otherwise the message "`?Redo from start`" is displayed ([6678H](#6678h)) and control returns to the statement handler.

<a name="4b62h"></a><a name="input#"></a>

    Address... 4B62H

This is the "`INPUT#`" Statement handler. The buffer number is evaluated and [PTRFIL](#ptrfil) set to direct input from the required I/O buffer (6D55H), control then transfers to the combined "`READ/INPUT`" statement handler (4B9BH).

<a name="4b6ch"></a><a name="input"></a>

    Address... 4B6CH

This is the "`INPUT`" statement handler. If the next program text character is a "#" control transfers to the "`INPUT#`" statement handler ([4B62H](#4b62h)). Otherwise the screen is forced to text mode, via the [TOTXT](#totxt) standard routine, and any prompt string analyzed ([6636H](#6636h)) and displayed (667BH). A question mark is then displayed and a line of text collected from the console via the [QINLIN](#qinlin) standard routine. If this returns Flag C (CTRL-STOP) control transfers to the "`STOP`" handler (63FEH). If the first character in [BUF](#buf) is zero (null input) the handler terminates by skipping to the end of the statement (485AH), otherwise control drops into the combined "`READ/INPUT`" handler.

<a name="4b9fh"></a><a name="read"></a>

    Address... 4B9FH

This is the "`READ`" statement handler, a large section is also used by the "`INPUT`" and "`INPUT#`" statements so the structure is rather awkward. Each Variable found in the program text is located in turn ([5EA4H](#5ea4h)), for each one the corresponding data item is obtained and assigned to the Variable by the "`LET`" handler (4893H). When in "`READ`" mode the data items are taken from the program text using the initial contents of [DATPTR](#datptr) ([4C40H](#4c40h)). When in "`INPUT`" or "`INPUT#`" mode the data items are taken from the text buffer [BUF](#buf).

If the data items are exhausted in "`READ`" mode an "`Out of DATA`" error is generated. If they are exhausted in "`INPUT`" mode two question marks are displayed and another line fetched from the console via the [QINLIN](#qinlin) standard routine. If they are exhausted in "`INPUT#`" mode another line of text is copied to [BUF](#buf) from the relevant I/O buffer ([6D83H](#6d83h)). If the Variable list is exhausted while in "`INPUT`" mode the message "`Extra ignored`" is displayed ([6678H](#6678h)) and the handler terminates ([4AFFH](#4affh)). In "`INPUT#`" mode no message is displayed while in "`READ`" mode control terminates by updating [DATPTR](#datptr) (63DEH). If a data item cannot be converted to numeric form ([3299H](#3299h)) to match a numeric Variable control transfers to the "`?Redo from start`" routine ([4B4DH](#4b4dh)).

<a name="4c2fh"></a>

    Address... 4C2FH

The is the plain text message "`?Extra ignored`", CR, LF terminated by a zero byte.

<a name="4c40h"></a>

    Address... 4C40H

This routine is used by the "`READ`" handler to locate the next "`DATA`" statement in the program text, the address to start from is supplied in register pair HL. Each program statement is examined until a "`DATA`" token (84H) is found whereupon the routine terminates (4BD1H). If the end link is reached an "`Out of DATA`" error is generated. As the search proceeds the line number of each program line is placed in [DATLIN](#datlin) for use by the error handler.

<a name="4c5fh"></a>

    Address... 4C5FH

This routine checks that the next character in the program text is the "=" token (EFH) and then drops into the Expression Evaluator. When entered at 4C62H it checks for "(".

<a name="4c64h"></a>

    Address... 4C64H

This is the Expression Evaluator. On entry register pair HL points to the first character of the expression to be evaluated. On exit register pair HL points to the character following the expression, the result is in [DAC](#dac) and the type code in [VALTYP](#valtyp). For a string result the address of the string descriptor is returned at [DAC](#dac)+2. The descriptor itself comprising a single byte for the string length and two bytes for its address, will be in [TEMPST](#tempst) or inside a string Variable.

An expression is a list of factors ([4DC7H](#4dc7h)) linked together by operators with differing precedence levels. To process such an expression correctly the Expression Evaluator must be able to temporarily stack an intermediate result, if the next operator has a higher precedence than the current operator, and start afresh on a new calculation. It therefore has two basic operations, STACK and APPLY. For example:

```
3+250\2^2*3^3+1,

STACK:    3+        (\ follows)
STACK:    250\      (^ follows)
APPLY:    2^2=4     (* follows)
STACK:    4*        (^ follows)
APPLY:    3^3=27    (+ follows)
APPLY:    4*27=108  (+ follows)
APPLY:    250\108=2 (+ follows)
APPLY:    3+2=5     (+ follows)
APPLY:    5+1=6     (, follows)
```

Evaluation terminates when the next operator has a precedence equal to or lower than the initial precedence and the stack is empty. The expression delimiter, shown as a comma in the example, is regarded as having a precedence of zero and so will always halt evaluation. Normally the Expression Evaluator starts off with an initial precedence of zero but the entry point at 4C67H may be used to supply an alternative value in register D. This facility is used by the Factor Evaluator to restrict the range of evaluation when applying the monadic negation and "`NOT`" operators.

<a name="4d22h"></a>

    Address... 4D22H

This routine is used by the Expression Evaluator to apply an infix math operator (+-\*/ ) to a pair of numeric operands. There are separate routines for the relational operators ([4F57H](#4f57h)) and the logical operators ([4F78H](#4f78h)). The first operand, its type code, and the operator token are supplied on the Z80 stack, the second operand and its type code are supplied in [DAC](#dac) and [VALTYP](#valtyp). The types of both operands are first compared, if they differ the lowest precision operand is converted to match the higher. The operands are then moved to the positions required by the math routines. For integers the first operand is placed in register pair DE and the second in register pair HL. For single precision the first operand is placed in registers C, B, E, D and the second in [DAC](#dac). For double precision the first operand is placed in [DAC](#dac) and the second in [ARG](#arg). The operator token is then used to obtain the required address from the table at 3D51H, 3D5DH or 3D69H, depending upon the operand type, and control transfers to the relevant math routine.

<a name="4db8h"></a>

    Address... 4DB8H

This routine is used by the Expression Evaluator to divide two integer operands. The first operand is contained in register pair DE and the second in register pair HL, the result is returned in [DAC](#dac). Both operands are converted to single precision (2FCBH) and control transfers to the single precision division routine ([3265H](#3265h)).

<a name="4dc7h"></a>

    Address... 4DC7H

This is the Factor Evaluator. On entry register pair HL points to the character before the factor to be evaluated. On exit register pair HL points to the character following the factor, the result is in [DAC](#dac) and the type code in [VALTYP](#valtyp). A factor may be one of the following:

1. A numeric or string constant
2. A numeric or string Variable
3. A function
4. A monadic operator (+-NOT)
5. A parenthesized expression

The first character is taken from the program text via the [CHRGTR](#chrgtr) standard routine and examined. If it is an end of Statement character a "`Missing operand`" error is generated ([406AH](#406ah)). If it is an ASCII digit it is converted from textual form to one of the standard numeric types in [DAC](#dac) ([3299H](#3299h)).

If it is upper case alphabetic (64A8H) it is a Variable and its current value is returned ([4E9BH](#4e9bh)). If it is a numeric token the number is copied from [CONLO](#conlo) to [DAC](#dac) (46B8H). If it is one of the FFH prefixed function tokens shown in the table at 39DEH it is decoded to transfer control to the relevant function handler (4ECFH). If it is the monadic "+" operator it is simply skipped over, only the monadic "-" operator ([4E8DH](#4e8dh)) and monadic "`NOT`" operator ([4F63H](#4f63h)) require any action.

If it is an opening quote the following explicit string is analyzed and a descriptor created ([6636H](#6636h)). If it is an "&" it is a non-decimal numeric constant and it is converted to one of the standard numeric types in [DAC](#dac) ([4EB8H](#4eb8h)). If it is not one of the functions shown below then it must be a parenthesized expression (4E87H), otherwise a "`Syntax error`" is generated. The following function tokens are tested for directly and control transferred to the address shown:

```
ERR .... 4DFDH   ATTR$ .... 7C43H
ERL .... 4E0BH   VARPTR ... 4E41H
POINT .. 5803H   USR....... 4FD5H
TIME ... 7900H   INSTR .... 68EBH
SPRITE . 7A84H   INKEY$ ... 7347H
VDP .... 7B47H   STRING$ .. 6829H
BASE ... 7BCBH   INPUT$ ... 6C87H
PLAY ... 791BH   CSRLIN ... 790AH
DSKI$ .. 7C3EH   FN ....... 5040H
```

</a>

<a name="4dfdh"></a>

    Address... 4DFDH

This routine is used by the Factor Evaluator to apply the "`ERR`" function. The contents of [ERRFLG](#errflg) are placed in [DAC](#dac) as an integer (4FCFH).

<a name="4e0bh"></a>

    Address... 4E0BH

This routine is used by the Factor Evaluator to apply the "`ERL`" function. The contents of [ERRLIN](#errlin) are copied to [DAC](#dac) as a single precision number (3236H).

<a name="4e41h"></a>

    Address... 4E41H

This routine is used by the Factor Evaluator to apply the "`VARPTR`" function. If the function token is followed by a "#" the buffer number is evaluated ([521BH](#521bh)), the I/O buffer FCB located ([6A6DH](#6a6dh)) and its address placed in [DAC](#dac) as an integer (2F99H). Otherwise the Variable is located (5F5DH) and its address placed in [DAC](#dac) as an integer (2F99H).

<a name="4e8dh"></a>

    Address... 4E8DH

This routine is used by the Factor Evaluator to apply the monadic "-" operator. Register D is set to a precedence value of 7DH, the factor evaluated (4C67H) and then negated (2E86H).

<a name="4e9bh"></a>

    Address... 4E9BH

This routine is used by the Factor Evaluator to return the current value of a Variable. The Variable is first located ([5EA4H](#5ea4h)). If it is a string Variable its address is placed in [DAC](#dac) to point to the descriptor. Otherwise the contents of the Variable are copied to [DAC](#dac) (2F08).

<a name="4ea9h"></a>

    Address... 4EA9H

This routine returns the single character pointed to by register pair HL in register A, if it is a lower case alphabetic it converts it to upper case.

<a name="4eb8h"></a>

    Address... 4EB8H

This routine is used by the Factor Evaluator and the numeric input routine ([3299H](#3299h)) to convert an ampersand ("&") Prefixed number from textual form to an integer in [DAC](#dac). As each legal character is found the product is multiplied by 2, 8 or 16, depending upon the character which initially followed the ampersand, and the new digit added to it. If the product overflows an "`Overflow`" error is generated ([4067H](#4067h)). The routine terminates when an unacceptable character is found.

<a name="4efch"></a>

    Address... 4EFCH

This routine is used by the Factor Evaluator to process the FFH prefixed function tokens. If the token is either "`LEFT$`", "`RIGHT$`" or "`MID$`" the string operand is evaluated (4C62H), the address of its descriptor pushed onto the Z80 stack and the following numeric operand also evaluated (521CH) and stacked. Otherwise the function's parenthesized operand is evaluated (4E87H) and, for "`SQR`", "`RND`", "`SIN`", "`LOG`", "`EXP`", "`COS`", "`TAN`" or "`ATN`" only, converted to double precision ([303AH](#303ah)). The function token is then used to obtain the required address from the table at 39DEH and control transfers to the function handler.

<a name="4f47h"></a>

    Address... 4F47H

This routine is used by the numeric input conversion routine ([3299H](#3299h)) to test for a "+" or "-" character or token. It returns register D=0 for positive and register D=FFH for negative.

<a name="4f57h"></a>

    Address... 4F57H

This routine is used by the Expression Evaluator to apply a relational operator (<>= or combinations) to a pair of operands. If the operands are numeric the Expression Evaluator first uses the math operator routine ([4D22H](#4d22h)) to apply the general relation operation to the operands. If the operands are strings the string comparison routine ([65C8H](#65c8h)) is used first. When control arrives here the relation result is in register A and the Z80 Flags:

```
Operand 1=Operand 2 ... A=00H, Flag Z,NC
Operand 1<Operand 2 ... A=01H, Flag NZ,NC
Operand 1>Operand 2 ... A=FFH, Flag NZ,C
```

The Expression Evaluator also supplies a bit mask defining the original operators on the Z80 stack. This has a 1 in each position if the associated operation is required: 00000<=>. The mask is applied to the relation result producing zero if none of the conditions is satisfied. This is then placed in [DAC](#dac) as a true (-1) or false (0) integer (2E9AH).

<a name="4f63h"></a>

    Address... 4F63H

This routine is used by the Factor Evaluator to apply the monadic "`NOT`" operator. Register D is set to an initial precedence level of 5AH and the expression evaluated (4C67H) and converted to an integer ([2F8AH](#2f8ah)). It is then inverted and restored to [DAC](#dac).

<a name="4f78h"></a>

    Address... 4F78H

This routine is used by the Expression Evaluator to apply a logical operator ("`OR`", "`AND`", "`XOR`", "`EQV`" and "`IMP`") or the "`MOD`" and "\" operators to a pair of numeric operands. The first operand, which has already been converted to an integer, is supplied on the Z80 stack and the second is supplied in [DAC](#dac). The operator token (actually its precedence level) is supplied in register B. After converting the second operand to an integer ([2F8AH](#2f8ah)) the operator is examined. There are separate routines for "`MOD`" ([323AH](#323ah)) and "\" ([31E6H](#31e6h)) but the logical operators are processed locally using the corresponding Z80 logical instructions on register pairs DE and HL. The result is stored in [DAC](#dac) as an integer (2F99H).

<a name="4fc7h"></a>

    Address... 4FC7H

This routine is used by the Factor Evaluator to apply the "`LPOS`" function to an operand contained in [DAC](#dac). The contents of [LPTPOS](#lptpos) are placed in [DAC](#dac) as an integer (4FCFH).

<a name="4fcch"></a>

    Address... 4FCCH

This routine is used by the Factor Evaluator to apply the "`POS`" function to an operand contained in [DAC](#dac). The contents of [TTYPOS](#ttypos) are placed in [DAC](#dac) as an integer (2F99).

<a name="4fd5h"></a>

    Address... 4FD5H

This routine is used by the Factor Evaluator to apply the "`USR`" function. The user number is collected directly from the program text, it cannot be an expression, and the associated address taken from [USRTAB](#usrtab) (4FF4H). The following parenthesized operand is then evaluated (4E87H) and left in [DAC](#dac) as the passed parameter. If it is a string type its storage is freed (67D3H). The current program text position is pushed onto the Z80 stack followed by a return to 3297H, the routine at this address will restore the program text position after the user function has terminated. Control then transfers to the user address with register pair HL pointing to the first byte of [DAC](#dac) and the type code, from [VALTYP](#valtyp), in register A. Additionally, for a string parameter, the descriptor address is taken from [DAC](#dac) and placed in register pair DE.

The user routine may modify any register except the Z80 SP and should terminate with a RET instruction, interrupts may be left disabled if necessary as the Runloop will re-enable them. Any numeric parameter to be returned to the Interpreter should be placed in [DAC](#dac). Strictly speaking this should be the same numeric type as the passed parameter, however if [VALTYP](#valtyp) is modified the Interpreter will always accept it.

Returning a string type is more difficult. Using the same method as the Factor Evaluator string functions, which involves copying the string to the String Storage Area and pushing a new descriptor onto [TEMPST](#tempst), is complicated and vulnerable to changes in the MSX system. A simpler and more reliable method is to use the passed parameter to create the space for the result. This should not be an explicitly stated string as the program text will have to be modified, instead an implicit parameter should be used. This must be done with care however, it is very easy to gain the impression that the Interpreter has accepted the string when in fact it has not. Take the following example which does nothing but return the passed parameter:

```
10 POKE &H9000,&HC9
20 DEFUSR=&H9000
30 A$=USR(STRING$(12,"!"))
40 PRINT A$
50 B$=STRING$(9,"X")
60 PRINT A$
```

At first it seems that the passed string has been correctly assigned to A$. When line 60 is reached however it becomes apparent that A$ has been corrupted by the subsequent assignment of a string to B$. What has happened is that the temporary storage allocated to the passed parameter was reclaimed from the String Storage Area before control transferred to the user routine. This region was then used to store the string belonging to B$ thus modifying A$.

This situation can be avoided by assigning the parameter to a Variable beforehand and then passing the Variable, for example:

```
10 A$=STRING$(12,"!")
20 A$=USR(A$)
```

Line 10 results in twelve bytes of the String Storage Area being permanently allocated to A$. When the user function is entered the descriptor, which is pointed to by register pair DE, will contain the starting address of the twelve byte region where the result should be placed. If the returned string is shorter than the passed one the length byte of the descriptor may be changed without any side effects. For further details on string storage see the garbage collector ([66B6H](#66b6h)).

A point worth noting is that a "`CLEAR`" operation is not strictly necessary before a machine language program is loaded. The region between the top of the Array Storage Area and the base of the Z80 stack is never used by the Interpreter. A program can exist in this region provided that the two enclosing areas do not overlap it.

<a name="500eh"></a><a name="defusr"></a>

    Address... 500EH

This is the "`DEFUSR`" statement handler. The user number is collected directly from the program text, it cannot be an expression, and the associated entry in [USRTAB](#usrtab) located (4FF4H). The address operand is then evaluated ([542FH](#542fh)) and placed in [USRTAB](#usrtab).

<a name="501dh"></a><a name="def fn"></a>

    Address... 501DH

This is the "`DEF FN`" and "`DEFUSR`" statement handler. If the following character is a "`USR`" token (DDH) control transfers to the "`DEFUSR`" statement handler ([500EH](#500eh)), otherwise the program text is checked for a trailing "`FN`" token (DEH). The function name Variable is located ([51A1H](#51a1h)) and, after checking that the Interpreter is in program mode ([5193H](#5193h)), the current program text position is placed there. Each of the Variables in the formal parameter list is then located in succession ([5EA4H](#5ea4h)), this is simply to ensure that they are created. The routine terminates by skipping over the remainder of the statement ([485BH](#485bh)) as the function body is not required at this time.

<a name="5040h"></a>

    Address... 5040H

This routine is used by the Factor Evaluator to apply the "`FN`" function. The function name Variable is first located ([51A1H](#51a1h)) to obtain the address of the function definition in the program text. Each formal Variable from the function definition is located in turn ([5EA4H](#5ea4h)) and its address pushed onto the Z80 stack. As each one is found the corresponding actual parameter is evaluated ([4C64H](#4c64h)) and pushed onto the stack with it. If necessary the type of the actual parameter is converted to match that of the formal parameter (517AH)'

When both lists are exhausted each formal Variable address and actual parameter are popped from the stack in turn. Each Variable is then copied from the Variable Storage Area to [PARM2](#parm2) with its value replaced by the actual parameter. It should be noted that, because [PARM2](#parm2) is only a hundred bytes long, a maximum of nine double precision parameters is allowed. When all the actual parameters have been copied to [PARM2](#parm2) the entire contents of [PARM1](#parm1) (the current parameter area) are pushed onto the Z80 stack and [PARM2](#parm2) is copied to [PARM1](#parm1) (518EH). Register pair HL is then set to the start of the function body in the program text and the expression is evaluated ([4C5FH](#4c5fh)). The old contents of [PARM1](#parm1) are popped from the stack and restored. Finally the result of the evaluation is type converted if necessary to match the function name type (517AH).

A user defined function differs from a normal expression in only one respect, it has its own set of local Variables. These Variables are created in [PARM1](#parm1) when the function is invoked and disappear when it terminates. When a normal Variable search is initiated by the Expression Evaluator the region examined is the Variable Storage Area. However, if [NOFUNS](#nofuns) is non-zero, indicating at least one active user function, [PARM1](#parm1) will be searched instead, only if this fails will the search move on to the global Variables in the Variable Storage Area. Using a local Variable area specific to each invocation of a function means that the same Variable names can be used throughout without the Variables overwriting each other or the global Variables.

It is worth noting that a user defined function is slower than an inline expression or even a subroutine. The search carried out to find the function name Variable, plus the large amount of stacking and destacking, are significant overheads.

<a name="5189h"></a>

    Address... 5189H

This routine moves a block of memory from the address pointed to by register pair DE to that pointed to by register pair HL, register pair BC defines the length.

<a name="5193h"></a>

    Address... 5193H

This routine generate an "`Illegal direct`" error if [CURLIN](#curlin) shows the Interpreter to be in direct mode.

<a name="51a1h"></a>

    Address... 51A1H

This routine checks the program text for an "`FN`" token (DEH) and then creates the function name Variable (5EA9H). These are distinguished from ordinary Variables by having bit 7 set in the first character of the Variable's name.

<a name="51adh"></a>

    Address... 51ADH

Control transfers to this routine from the Runloop execution point ([4640H](#4640h)) if a token greater than D8H is found at the start of a statement. If the token is not an FFH prefixed function token a "`Syntax error`" is generated ([4055H](#4055h)). If the function token is one of those which double as statements control transfers to the relevant handler, otherwise a "`Syntax error`" is generated. The statements in question are "`MID$`" ([696EH](#696eh)), "`STRIG`" ([77BFH](#77bfh)) and "`INTERVAL`" ([77B1H](#77b1h)). There is actually no separate token for "`INTERVAL`", the "`INT`" token (85H) suffices with the remaining characters being checked by the statement handler.

<a name="51c9h"></a><a name="width"></a>

    Address... 51C9H

This is the "`WIDTH`" statement handler. The operand is evaluated (521CH) and its magnitude checked. If it is zero or greater than thirty-two or forty, depending upon the screen mode held in [OLDSCR](#oldscr) an "`Illegal function call`" error is generated (475AH). If it is the same as the current contents of [LINLEN](#linlen) the routine terminates with no further action. Otherwise the current screen is cleared with a FORMFEED control code (0CH) via the [OUTDO](#outdo) standard routine in case the screen is to be made smaller. The operand is then placed in [LINLEN](#linlen) and either [LINL32](#linl32) or [LINL40](#linl40), depending upon the screen mode held in [OLDSCR](#oldscr), and the screen cleared again in case it has been made larger. Because the line length variable to be changed is selected by [OLDSCR](#oldscr), rather than [SCRMOD](#scrmod), the width can still be changed even if the screen is currently in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode). In this case the change is effective when a return is made to the Interpreter Mainloop or an "`INPUT`" statement is executed.

<a name="520eh"></a>

    Address... 520EH

This routine evaluates the next expression in the program text ([4C64H](#4c64h)), converts it to an integer ([2F8AH](#2f8ah)) and places the result in register pair DE. The magnitude and sign of the MSB are then tested and the routine terminates.

<a name="521bh"></a>

    Address... 521BH

This routine evaluates the next operand in the program text ([4C64H](#4c64h)) and converts it to an integer (5212H). If the operand is greater than 255 an "`Illegal function call`" error is generated (475AH).

<a name="5229h"></a><a name="llist"></a>

    Address... 5229H

This is the "`LLIST`" statement handler. [PRTFLG](#prtflg) is set to 01H, to direct output to the printer, and control drops into the "`LIST`" statement handler.

<a name="522eh"></a><a name="list"></a>

    Address... 522EH

This is the "`LIST`" statement handler. The optional start and termination line number operands are collected and the starting position found in the program text ([4279H](#4279h)). Successive program lines are listed until the end link is found, the CTRL-STOP key is pressed or the termination line number is reached, control then transfers directly to the Mainloop "`OK`" point ([411FH](#411fh)). Each program line is listed by displaying its line number ([3412H](#3412h)), detokenizing ([5284H](#5284h)) and displaying (527BH) the line itself and then issuing a CR,LF (7328H).

<a name="5284h"></a>

    Address... 5284H

This routine is used by the "`LIST`" statement handler to convert a tokenized program line to textual form. On entry register pair HL points to the first character of the tokenized line. On exit the line of text is in [BUF](#buf) and is terminated by a zero byte.

Any normal or FFH prefixed token is converted to the corresponding keyword by a simple linear search of the tokens in the table at 3A72H. Exceptions are made if either an opening quote character, a "`REM`" token, or a "`DATA`" token has previously been found. Normally these tokens will be followed by plain text anyway, the check is made to stop graphics characters being interpreted as tokens. The three byte sequence ":" (3AH), "`REM`" token (8FH), " " token (E6H) is converted to the single " " character (27H) and the statement separator (3AH) preceding an "`ELSE`" token (A1H) is scrubbed out.

If one of the numeric tokens is found its value and type are first copied from [CONLO](#conlo) and [CONTYP](#contyp) to [DAC](#dac) and [VALTYP](#valtyp) ([46E8H](#46e8h)). It is then converted to textual form in [FBUFFR](#fbuffr) by the decimal ([3425H](#3425h)), octal ([371EH](#371eh)) or hex ([3722H](#3722h)) conversion routines. For octal and hex types the number is prefixed by an ampersand and an "`O`" or "`H`" letter. A type suffix, "'" or "#", is added to single precision or double precision numbers only if there is no decimal part and no exponent part ("`E`" or "`D`").

<a name="53e2h"></a><a name="delete"></a>

    Address... 53E2H

This is the "`DELETE`" statement handler. The optional start and termination line number operands are collected and the starting position found in the program text ([4279H](#4279h)). If any pointers exist in the program text they are converted back to line numbers (54EAH). The terminating program line is found by a search of the program text ([4295H](#4295h)), if this address is smaller than that of the starting program line an "`Illegal function call`" error is generated (475AH), otherwise the message "`OK`" is displayed ([6678H](#6678h)). The block of memory from the end of the terminating line to the start of the Variable Storage Area is copied down to the beginning of the starting line and [VARTAB](#vartab), [ARYTAB](#arytab) and [STREND](#strend) are reset to the new (lower) end of the program text. Control then transfers directly to the end of the Mainloop (4237H) to reset the remaining pointers and to relink the Program Text Area. Note that, because control does not return to the normal "`OK`" point, the screen will not be returned to text mode. If the screen is in [Graphics Mode](#graphics_mode) or [Multicolour mode](#multicolour_mode) when a "`DELETE`" is executed, which is admittedly rather unlikely, the system will crash.

<a name="541ch"></a>

    Address... 541CH

This routine is used by the Factor Evaluator to apply the "`PEEK`" function to an operand contained in [DAC](#dac). The address operand is checked ([5439H](#5439h)) then the byte read from memory and placed in [DAC](#dac) as an integer (4FCFH).

<a name="5423h"></a><a name="poke"></a>

    Address... 5423H

This is the "`POKE`" statement handler. The address operand is evaluated ([542FH](#542fh)) then the data operand evaluated (521CH) and written to memory.

<a name="542fh"></a>

    Address... 542FH

This routine evaluates the next operand in the program text ([4C64H](#4c64h)) and places it in register pair DE as an integer ([5439H](#5439h)).

<a name="5439h"></a>

    Address... 5439H

This routine converts the numeric operand contained in [DAC](#dac) into an integer in register pair HL. The operand must be in the range -32768 to +65535 and is normally an address as required by "`POKE`", "`PEEK`", "`BLOAD`", etc. The operand's type is first checked via the [GETYPR](#getypr) standard routine, if it is already an integer it is simply placed in register pair HL ([2F8AH](#2f8ah)). Assuming the operand is single precision or double precision its sign is checked, if it is negative it is converted to integer ([2F8AH](#2f8ah)). Otherwise it is converted to single precision ([2FB2H](#2fb2h)) and its magnitude checked ([2F21H](#2f21h)). If it is greater than 32767 and smaller than 65536 then -65536 is added ([324EH](#324eh)) before it is converted to integer ([2F8AH](#2f8ah)).

<a name="5468h"></a><a name="renum"></a>

    Address... 5468H

This is the "`RENUM`" statement handler. If a new initial line number operand exists it is collected ([475FH](#475fh)), otherwise a default value of ten of taken. If an old initial line number operand exists it is collected ([475FH](#475fh)), otherwise a default value of zero is taken. If an increment line number operand exists it is collected (4769H), otherwise a default value of ten is taken.

The program text is then searched for existing line numbers equal to or greater than the new initial line number ([4295H](#4295h)) and the old initial line number ([4295H](#4295h)), an "`Illegal function call`" error is generated (475AH) if the new address is smaller than the old address. This is to catch any attempt to renumber high program lines down to existing low ones.

A dummy renumbering run of the program text is first carried out to check than no new line number will be generated with a value greater than 65529. This must be done as an error midway through the conversion would leave the program text in a confused state. Assuming all is well any line number operands in the program text are converted to pointers ([54F6H](#54f6h)). This neatly solves the problem of line number references, `GOTO 50` for example, as the program text is not moved during renumbering. Starting at the old initial program text position each existing program line number is replaced with its new value. When the end link is reached any program text pointers are converted back to line number operands (54F1H) and control transfers directly to the Mainloop "`OK`" point (411EH).

<a name="54f6h"></a>

    Address... 54F6H

When entered at 54F6H this routine converts every line number operand in the program text to a pointer. When entered at 54F7H it performs the reverse operation and converts every pointer in the program text back to a line number operand. Starting at the beginning of the Program Text Area each line is examined for a pointer token (0DH) or a line number operand token (0EH) depending upon the mode. In pointer to line number operand mode the pointer is replaced by the line number from the referenced program line and the token changed to 0EH. In line number operand to pointer mode the program text is searched ([4295H](#4295h)) to find the relevant line, its address replaces the line number operand and the token is changed to 0DH. If the search is unsuccessful a message of the form "`Undefined line NNNN in NNNN`" is displayed ([6678H](#6678h)) and the conversion process continues. A special check is made for the "`ON ERROR GOTO 0`" statement, to prevent the generation of a spurious error message, but no check is made for the similar "`RESUME 0`" statement. In this case an error message will be displayed, this should be ignored.

<a name="555ah"></a>

    Address... 555AH

This is the plain text message "`Undefined line `" terminated by a zero byte.

<a name="558ch"></a><a name="synchr"></a>

```
Address... 558CH
Name...... SYNCHR
Entry..... HL points to character to check
Exit...... A=Next program character
Modifies.. AF, HL
```

Standard routine to check the current program text character, whose address is supplied in register pair HL, against a reference character. The reference character is supplied as a single byte immediately following the `CALL` or `RST` instruction, for example:

```
RST 08H
DEFB ","
```

If the characters do not match a "`Syntax error`" is generated ([4055H](#4055h)), otherwise control transfers to the [CHRGTR](#chrgtr) standard routine to fetch the next program character ([4666H](#4666h)).

<a name="5597h"></a><a name="getypr"></a>

```
Address... 5597H
Name...... GETYPR
Entry..... None
Exit...... AF=Type
Modifies.. AF
```

Standard routine to return the type of the current operand, determined by [VALTYP](#valtyp), as follows:

```
Integer..............A=FFH, Flag M,NZ,C
String...............A=00H, Flag P,Z,C
Single Precision ... A=01H, Flag P,NZ,C
Double Precision ... A=05H, Flag P,NZ,NC
```

</a>

<a name="55a8h"></a><a name="call"></a>

    Address... 55A8H

This is the "`CALL`" statement handler. The extended statement name, which is an unquoted string up to fifteen characters long terminated by a "(", ":" or end of line character (00H), is first copied from the program text to [PROCNM](#procnm), any unused bytes are zero filled. Bit 5 of each entry in [SLTATR](#sltatr) is then examined for an extension ROM with a statement handler. If a suitable ROM is found its position in [SLTATR](#sltatr) is converted to a Slot ID in register A and a ROM base address in register H ([7E2AH](#7e2ah)). The statement handler address is read from ROM locations four and five ([7E1AH](#7e1ah)) and placed in register pair IX. The Slot ID is placed in the high byte of register pair IY and the ROM statement handler called via the [CALSLT](#calslt) standard routine.

The ROM will examine the statement name and return Flag C if it does not recognize it, otherwise it performs the required operation. If the ROM call fails the search of [SLTATR](#sltatr) continues until the table is exhausted whereupon a "`Syntax error`" is generated ([4055H](#4055h)). If the ROM call is successful the handler terminates.

<a name="55f8h"></a>

    Address... 55F8H

This routine is used by the device name parser ([6F15H](#6f15h)) when it cannot recognize a device name found in the program text. Upon entry register pair HL points to the first character of the name and register B holds its length. The name is first copied to [PROCNM](#procnm) and terminated by a zero byte. Bit 6 of each entry in [SLTATR](#sltatr) is then examined for an extension ROM with a device handler. If a suitable ROM is found its position in [SLTATR](#sltatr) is converted to a Slot ID in register A and a ROM base address in register H ([7E2AH](#7e2ah)). The device handler address is read from ROM locations six and seven ([7E1AH](#7e1ah)) and placed in register pair IX. The Slot ID is placed in the high byte of register pair IY, the unknown device code (FFH) in register A and the ROM device handler called via the [CALSLT](#calslt) standard routine.

The ROM will examine the device name and return Flag C if it does not recognize it, otherwise it returns its own internal code from zero to three. If the ROM call fails the search of [SLTATR](#sltatr) continues until the table is exhausted whereupon a "`Bad file name`" error is generated ([6E6BH](#6e6bh)). If the ROM call is successful the ROM's internal code is added to its [SLTATR](#sltatr) position, multiplied by a factor of four, to produce a global device code' The base code for each entry in [SLTATR](#sltatr) is shown below in hexadecimal. The "SS" and "PS" markers show the corresponding Secondary and Primary Slot numbers, each slot is composed of four pages:

<a name="figure44"></a>![][CH05F44]

**Figure 44:** Device Codes

The global device code is used by the Interpreter until the time comes for the ROM to perform an actual device operation. It is then converted back into the ROM's Slot ID, base address and internal device code to perform the ROM access. Note that the codes from 0 to 8 are reserved for disk drive identifiers and those from FCH to FFH for the standard devices GRP, CRT, LPT and CAS. With the current MSX hardware structure these codes correspond to physically improbable ROM configurations and are therefore safe to be used for specific purposes by the Interpreter.

<a name="564ah"></a>

    Address... 564AH

This routine is used by the function dispatcher ([6F8FH](#6f8fh)) when it encounters a device code not belonging to one of the standard devices. The device code is first converted to a [SLTATR](#sltatr) position and then to a Slot ID in register A and ROM base address in register H (7E2DH). The ROM device handler address is read from ROM locations six and seven ([7E1AH](#7e1ah)) and placed in register pair IX. The Slot ID is placed in the high byte of register pair IY, the ROM's internal device code in DEVICE and the ROM device handler called via the [CALSLT](#calslt) standard routine.

<a name="566ch"></a>

    Address... 566CH

This entry point to the macro language parser is used by the "`DRAW`" statement handler, a later entry point ([56A2H](#56a2h)) is used by the "`PLAY`" statement handler. The command string is evaluated ([4C64H](#4c64h)) and its storage freed ([67D0H](#67d0h)). After pushing a zero termination block onto the Z80 stack the length and address of the string body are placed in [MCLLEN](#mcllen) and [MCLPTR](#mclptr) and control drops into the parser mainloop.

<a name="56a2h"></a>

    Address... 56A2H

This is the macro language parser mainloop, it is used to process the command string associated with a "`DRAW`" or "`PLAY`" statement' On entry the string length is in [MCLLEN](#mcllen), the string address is in [MCLPTR](#mclptr) and the address of the relevant command table is in [MCLTAB](#mcltab). The command tables contain the legal command letters, together with the associated command handler addresses, for each statement. The "`DRAW`" table is at 5D83H and the "`PLAY`" table at 752EH.

The parser mainloop first fetches the next character from the command string ([56EEH](#56eeh)). If there are no more characters left the next string descriptor is popped from the stack (568CH). If this is zero the parser terminates (5709H) if [MCLFLG](#mclflg) shows a "`DRAW`" statement to be active, otherwise control transfers back to the "`PLAY`" statement handler (7494H).

Assuming a command character exists the current command table is searched to check its legality, if no match is found an "`Illegal function call`" error is generated (475AH). The command table entry is then examined, if bit 7 is set the command takes an optional numeric parameter. If this is present it is collected and placed in register pair DE (571CH), otherwise a default value of one is taken. After pushing a return to the start of the parser mainloop onto the Z80 stack control transfers to the command handler at the address taken from the command table.

<a name="56eeh"></a>

    Address... 56EEH

This routine is used by the macro language parser to fetch the next character from the command string. If [MCLLEN](#mcllen) is zero the routine terminates with Flag Z, there are no characters left. Otherwise the next character is taken from the address contained in [MCLPTR](#mclptr) and returned in register A, if the character is lower case it is converted to upper case. [MCLPTR](#mclptr) is then incremented and [MCLLEN](#mcllen) decrement Ed.

<a name="570bh"></a>

    Address... 570BH

This routine is used by the macro language parser to return an unwanted character to the command string. [MCLLEN](#mcllen) is incremented and [MCLPTR](#mclptr) decremented.

<a name="5719h"></a>

    Address... 5719H

This routine is used by the macro language parser to collect a numeric parameter from the command string. The result is a signed integer and is returned in register pair DE, it cannot be an expression. The first character is taken and examined, if it is a "+" it is ignored and the next character taken ([5719H](#5719h)). If it is a "-" a return is set up to the negation routine (5795H) and the next character taken ([5719H](#5719h)). If it is an "=" the value of the following Variable is returned ([577AH](#577ah)). Otherwise successive characters are taken and a binary product accumulated until a non-numeric character is found.

<a name="575ah"></a>

    Address... 575AH

This routine is used by the macro language parser "=" and "X" handlers. The Variable name is copied to [BUF](#buf) until the ";" delimiter is found, if this takes more than thirty-nine characters to find an "`Illegal function call`" error is generated (475AH). Otherwise control transfers to the Factor Evaluator Variable handler ([4E9BH](#4e9bh)) and the Variable contents are returned in [DAC](#dac).

<a name="577ah"></a>

    Address... 577AH

This routine is used by the macro language parser to process the "=" character in a command parameter. The Variable's value is obtained ([575AH](#575ah)), converted to an integer ([2F8AH](#2f8ah)) and placed in register pair DE.

<a name="5782h"></a>

    Address... 5782H

This routine is used by the macro language parser to process the "X" command. The Variable is processed ([575AH](#575ah)) and, after checking that stack space is available ([625EH](#625eh)), the current contents of [MCLLEN](#mcllen) and [MCLPTR](#mclptr) are stacked. Control then transfers to the parser entry point (5679H) to obtain the Variable's descriptor and process the new command string.

<a name="579ch"></a>

    Address... 579CH

This routine is used by various graphics statements to evaluate a coordinate pair in the program text. The coordinates must be parenthesized with a comma separating the component operands. If the coordinate pair is preceded by a "`STEP`" token (DCH) each component value is added to the corresponding component of the current graphics coordinates in [GRPACX](#grpacx) and [GRPACY](#grpacy), otherwise the absolute values are returned. The X coordinate is returned in [GRPACX](#grpacx), [GXPOS](#gxpos) and register pair BC. The Y coordinate is returned in [GRPACY](#grpacy), [GYPOS](#gypos) and register pair DE.

There are two entry points to the routine, the one which is used depends on whether the caller is expecting more than one coordinate pair. The "`LINE`" statement, for example, expects two coordinate pairs the first of which is the more flexible. The entry point at 579CH is used to collect the first coordinate pair and will accept the characters "-" or "@-" as representing the current graphics coordinates. The entry point at 57ABH is used for the second coordinate pair and requires an explicit operand.

<a name="57e5h"></a><a name="preset"></a>

    Address... 57E5H

This is the "`PRESET`" statement handler. The current background colour is taken from [BAKCLR](#bakclr) and control drops into the "`PSET`" handler.

<a name="57eah"></a><a name="pset"></a>

    Address... 57EAH

This is the "`PSET`" statement handler. After the coordinate pair has been evaluated (57ABH) the current foreground colour is taken from [FORCLR](#forclr) and used as the default when setting the ink colour ([5850H](#5850h)). The current graphics coordinates are converted to a physical address, via the [SCALXY](#scalxy) and [MAPXYC](#mapxyc) standard routines, and the colour of the current pixel set via the [SETC](#setc) standard routine.

<a name="5803h"></a>

    Address... 5803H

This routine is used by the Factor Evaluator to apply the "`POINT`" function. The current contents of [CLOC](#cloc), [CMASK](#cmask), [GYPOS](#gypos), [GXPOS](#gxpos), [GRPACY](#grpacy) and [GRPACX](#grpacx) are stacked and the coordinate pair operand evaluated (57ABH). The colour of the new pixel is read via the [SCALXY](#scalxy), [MAPXYC](#mapxyc) and [READC](#readc) standard routines and placed in [DAC](#dac) as an integer (2F99H), the old coordinate values are then popped and restored. Note that a value of -1 is returned if the point coordinates are outside the screen.

<a name="5850h"></a>

    Address... 5850H

This graphics routine is used to evaluate an optional colour operand in the program text and to make it the current ink colour. After checking the screen mode ([59BCH](#59bch)) the colour operand is evaluated (521CH) and placed in [ATRBYT](#atrbyt). If no operand exists the colour code supplied in register A is placed in [ATRBYT](#atrbyt) instead.

<a name="5871h"></a>

    Address... 5871H

This graphics routine returns the difference between the contents of [GXPOS](#gxpos) and register pair BC in register pair HL. If the result is negative ([GXPOS](#gxpos)\<BC) it is negated to produce the absolute magnitude and Flag C is returned.

<a name="5883h"></a>

    Address... 5883H

This graphics routine returns the difference between the contents of [GYPOS](#gypos) and register pair DE in register pair HL. If the result is negative ([GYPOS](#gypos)\<DE) it is negated to produce the absolute magnitude and Flag C is returned.

<a name="588eh"></a>

    Address... 588EH

This graphics routine swaps the contents of [GYPOS](#gypos) and register pair DE.

<a name="5898h"></a>

    Address... 5898H

This graphics routine first swaps the contents of [GYPOS](#gypos) and register pair DE ([588EH](#588eh)) then swaps the contents of [GXPOS](#gxpos) and register pair BC. When entered at 589BH only the second operation is performed.

<a name="58a7h"></a><a name="line"></a>

    Address... 58A7H

This is the "`LINE`" statement handler. The first coordinate pair (X1,Y1) is evaluated ([579CH](#579ch)) and placed in register pairs BC,DE. After checking for the "-" token (F2H) the second coordinate pair (X2,Y2) is evaluated (57ABH) and left in [GRPACX](#grpacx), [GRPACY](#grpacy) and [GXPOS](#gxpos), [GYPOS](#gypos). After setting the ink colour (584DH) the program text is checked for a following "B" or "BF" option and either the box ([5912H](#5912h)), boxfill ([58BFH](#58bfh)) or linedraw ([58FCH](#58fch)) operation performed. None of these operations affects the current graphics coordinates in [GRPACX](#grpacx) and [GRPACY](#grpacy), these are left at X2,Y2.

<a name="58bfh"></a>

    Address... 58BFH

This routine performs the boxfill operation. Given that the supplied coordinate pairs define diagonally opposed points of the box two quantities must be derived from them. The horizontal size of the box is obtained from the difference between X1 and X2, this gives the number of pixels to set per row. The vertical size is obtained from the difference between Y1 and Y2 giving the number of rows required. Starting at the physical address of X1,Y1, and moving successively lower via the [DOWNC](#downc) standard routine, the required number of pixel rows are filled in by repeated use of the [NSETCX](#nsetcx) standard routine.

<a name="58fch"></a>

    Address... 58FCH

This routine performs the linedraw operation. After drawing the line ([593CH](#593ch)) [GXPOS](#gxpos) and [GYPOS](#gypos) are reset to X2,Y2 from [GRPACX](#grpacx) and [GRPACY](#grpacy).

<a name="5912h"></a>

    Address... 5912H

This routine performs the box operation. The box is produced by drawing a line ([58FCH](#58fch)) between each of the four corner points. The coordinates of each corner are derived from the initial operands by interchanging the relevant component of the pair. The drawing sequence is:

1. X1,Y2 to X2,Y2
2. X1,Y1 to X2,Y1
3. X2,Y1 to X2,Y2
4. X1,Y1 to X1,Y2

</a>

<a name="593ch"></a>

    Address... 593CH

This routine draws a line between the points X1,Y1, supplied in register pairs BC and DE and X2,Y2, supplied in [GXPOS](#gxpos) and [GYPOS](#gypos). The operation of the drawing mainloop (5993H) is best illustrated by an example, say LINE(0,0)-(10,4). To reach the end point of the line from its start ten horizontal steps (X2- X1) and four downward steps (Y2-Y1) must be taken altogether. The best approximation to a straight line therefore requires two and a half horizontal steps for every downward step (X2-X1/Y2-Y1). While this is impossible in practice, as only integral steps can be taken, the correct ratio can be achieved on average.

The method employed is to add the Y difference to a counter each time a rightward step is taken. When the counter exceeds the value of the X difference it is reset and one downward step is taken, this is in effect an integer division of the two difference values. Sometimes downward steps will be produced every two rightward steps and sometimes every three rightward steps. The average, however, will be one downward step every two and a half rightward steps. An equivalent BASIC program is shown below with a slightly offset BASIC line for comparison:

```
10 SCREEN 0
20 INPUT"START X,Y";X1,Y1
30 INPUT"END X,Y",X2,Y2
40 SCREEN 2
50 X=X1:Y=Y1:L=X2-X1:S=Y2-Y1:CTR=L/2
60 PSET(X,Y)
70 CTR=CTR+S:IF CTR<L THEN 90
80 CTR=CTR-L:Y=Y+1
90 X=X+1:IF X<=X2 THEN 60
100 LINE(X1,Y1+5)-(X2,Y2+5)
110 GOTO 110
```

The above example suffers from three limitations. The line must slope downwards, it must slope to the right and the slope cannot exceed forty-five degrees from the horizontal (one downward step for one rightward step).

The routine overcomes the first limitation by examining the Y1 and Y2 coordinates before drawing commences. If Y2 is greater than or equal to Y1, showing the line to slope upwards or to be horizontal, both coordinate pairs are exchanged. The line is now sloping downwards and will be drawn from the end point to the start.

The second limitation is overcome by examining X1 and X2 beforehand to determine which way the line is sloping. If X2 is greater than or equal to X1 the line slopes to the right and a Z80 JP to the [RIGHTC](#rightc) standard routine is placed in [MINUPD](#minupd)/[MAXUPD](#maxupd) (see below) for use by the drawing mainloop, otherwise a JP to the [LEFTC](#leftc) standard routine is placed there.

The third limitation is overcome by comparing the X coordinate difference to the Y coordinate difference before drawing to determine the slope steepness. If X2-X1 is smaller than Y2-Y1 the slope of the line is less than forty-five degrees from the horizontal. The simple method shown above for LINE(0,0)-(10,4) will not work for slopes greater than forty- five degrees as the maximum rate of descent is achieved when one downward step is taken for every horizontal step. It will work however if the step directions are exchanged. Thus LINE(0,0)-(4,10) requires one rightward step for every two and a half downward steps. [MINUPD](#minupd) holds a Z80 JP to the "normal" step direction standard routine for the drawing mainloop and [MAXUPD](#maxupd) holds a JP to the "slope" step direction standard routine. For shallow angles [MINUPD](#minupd) will vector to [DOWNC](#downc) and [MAXUPD](#maxupd) to [LEFTC](#leftc) or [RIGHTC](#rightc). For steep angles [MINUPD](#minupd) will vector to [LEFTC](#leftc) or [RIGHTC](#rightc) and [MAXUPD](#maxupd) to [DOWNC](#downc). For steep angles the counter values must also be exchanged, the X difference must now be added to the counter and the Y difference used as the counter limit. The variables [MINDEL](#mindel) and [MAXDEL](#maxdel) are used by the drawing mainloop to hold these counter values, [MINDEL](#mindel) holds the smaller end point difference and [MAXDEL](#maxdel) the larger.

An interesting point is that the reference counter, held in CTR in the above program and in register pair DE in the ROM, is preloaded with half the largest end point difference rather than being set to zero. This has the effect of splitting the first "stair" in the line into two sections, one at the start of the line and one at its end, and improving the line's appearance.

<a name="59b4h"></a>

    Address... 59B4H

This graphics routine shifts the contents of register pair DE one bit to the right.

<a name="59bch"></a>

    Address... 59BCH

This routine generates an "`Illegal function call`" error (475AH) if the screen is not in [Graphics Mode](#graphics_mode) or [Multicolour Mode](#multicolour_mode).

<a name="59c5h"></a><a name="paint"></a>

    Address... 59C5H

This is the "`PAINT`" statement handler. The starting coordinate pair is evaluated ([579CH](#579ch)), the ink colour set (584DH) and the optional boundary colour operand evaluated (521CH) and placed in [BDRATR](#bdratr). The starting coordinate pair is checked to ensure that it is within the screen ([5E91H](#5e91h)) and is made the current pixel physical address by the [MAPXYC](#mapxyc) standard routine. The distance to the right hand boundary is then measured ([5ADCH](#5adch)) and, if it is zero, the handler terminates. Otherwise the distance to the left hand boundary is measured ([5AEDH](#5aedh)) and the sum of the two placed in register pair DE as the zone width. The current position is then stacked twice (5ACEH), first with a termination flag (00H) and then with a down direction flag (40H). Control then transfers to the paint mainloop ([5A26H](#5a26h)) with an up direction flag (C0H) in register B.

<a name="5a26h"></a>

    Address... 5A26H

This is the paint mainloop. The zone width is held in register pair DE, the paint direction, up or down, in register B and the current pixel physical address is that of the pixel adjacent to the left hand boundary. A vertical step is taken to the next line, via the [TUPC](#tupc) or [TDOWNC](#tdownc) standard routines, and the distance to the right hand boundary measured ([5ADCH](#5adch)). The distance to the left hand boundary is then measured and the line between the boundaries filled in ([5AEDH](#5aedh)). If no change is found in the position of either boundary control transfers to the start of the mainloop to continue painting in the same direction. If a change is found an inflection has occurred and the appropriate action must be taken.

There are four types of inflection, LH or RH incursive, where the relevant boundary moves inward, and LH or RH excursive, where it moves outward. An example of each type is shown below with numbered zones indicating the order of painting during upward movement. A secondary zone is shown within each inflective region for completeness:

<a name="figure45"></a>![][CH05F45]

**Figure 45:** Boundary Inflections

A LH excursion has occurred when the distance to the left hand boundary is non-zero, a RH excursion has occurred when the current zone width is greater than that of the previous line. Unless the excursion is less than two pixels, in which case it will be ignored, the current position (the bottom left of zone 3 in figure 45) is stacked ([5AC2H](#5ac2h)), the paint direction reversed and painting restarts at the top left of the excursive region .

A RH incursion has occurred when the current zone width is smaller than that of the previous line. If the incursion is total, that is the current zone width is zero, a dead end has been reached and the last position and direction are popped (5AIFH) and painting restarts at that point. Otherwise the current position and direction are stacked ([5AC2H](#5ac2h)) and painting restarts at the bottom left of the incursive region.

A LH incursion is dealt with automatically during the search for the right hand boundary and requires no explicit action by the paint mainloop.

<a name="5ac2h"></a>

    Address... 5AC2H

This routine is used by the "`PAINT`" statement handler to save the current paint position and direction on the Z80 stack. The six byte parameter block is made up of the following:

```
2 bytes ... Current contents of CLOC
1 byte  ... Current direction
1 byte  ... Current contents of CMASK
2 bytes ... Current zone width
```

After the parameters have been stacked a check is made that sufficient stack space still exists ([625EH](#625eh)).

<a name="5adch"></a>

    Address... 5ADCH

This routine is used by the "`PAINT`" statement handler to locate the right hand boundary. The zone width of the previous line is passed to the [SCANR](#scanr) standard routine in register pair DE, this determines the maximum number of boundary colour pixels that may initially be skipped over. The returned skip count remainder is placed in [SKPCNT](#skpcnt) and the number of non-boundary colour pixels traversed in [MOVCNT](#movcnt).

<a name="5aedh"></a>

    Address... 5AEDH

This routine is used by the "`PAINT`" statement handler to locate the left hand boundary. The end point of the right hand boundary search is temporarily saved and the starting point taken from [CSAVEA](#csavea) and [CSAVEM](#csavem) and made the current pixel physical address. The left hand boundary is then located via the [SCANL](#scanl) standard routine, which also fills in the entire zone, and the right hand end point recovered and placed in [CSAVEA](#csavea) and [CSAVEM](#csavem).

<a name="5b0bh"></a>

    Address... 5B0BH

This routine is used by the "`CIRCLE`" statement handler to negate the contents of register pair DE.

<a name="5b11h"></a><a name="circle"></a>

    Address... 5B11H

This is the "`CIRCLE`" statement handler. After evaluating the centre coordinate pair ([579CH](#579ch)) the radius is evaluated (520FH), multiplied ([325CH](#325ch)) by SIN(PI/4) and placed in [CNPNTS](#cnpnts). The ink colour is set (584DH), the start angle evaluated ([5D17H](#5d17h)) and placed in [CSTCNT](#cstcnt) and the end angle evaluated ([5D17H](#5d17h)) and placed in [CENCNT](#cencnt). If the end angle is smaller than the start angle the two values are swapped and [CPLOTF](#cplotf) is made non-zero. The aspect ratio is evaluated ([4C64H](#4c64h)) and, if it is greater than one, its reciprocal is taken (3267H) and [CSCLXY](#csclxy) is made non-zero to indicate an X axis squash. The aspect ratio is multiplied ([325CH](#325ch)) by 256, converted to an integer ([2F8AH](#2f8ah)) and placed in [ASPECT](#aspect) as a single byte binary fraction. Register pairs HL and DE are set to the starting position on the circle perimeter (X=RADIUS,Y=0) and control drops into the circle mainloop.

<a name="5bbdh"></a>

    Address... 5BBDH

This is the circle mainloop. Because of the high degree of symmetry in a circle it is only necessary to compute the coordinates of the arc from zero to forty-five degrees. The other seven segments are produced by rotation and reflection of these points. The parametric equation for a unit circle, with T the angle from zero to PI/4, is:

```
X=COS(T)
Y=SIN(T)
```

Direct computation using this equation, or the corresponding functional form X=SQR(1-Y^2), is too slow, instead the first derivative is used:

```
 dx
---- = -Y/X
 dy
```

Given that the starting position is known (X=RADIUS,Y=0), the X coordinate change for each unit Y coordinate change may be computed using the derivative. Furthermore, because graphics resolution is limited to one pixel, it is only necessary to know when the sum of the X coordinate changes reaches unity and then to decrement the X coordinate. Therefore:

```
Decrement X when (Y1/X)+(Y2/X)+(Y3/X)+... => 1
Therefore decrement when (Y1+Y2+Y3+...)/X => 1
Therefore decrement when     Y1+Y2+Y3+... => X
```

All that is required to identify an X coordinate change is to totalize the Y coordinate values from each step until the X coordinate value is exceeded. The circle mainloop holds the X coordinate in register pair HL, the Y coordinate in register pair DE and the running total in [CRCSUM](#crcsum). An equivalent BASIC program for a circle of arbitrary radius 160 pixels is:

```
10 SCREEN 2
20 X=160:Y=0:CRCSUM=0
30 PSET(X,191-Y)
40 CRCSUM=CRCSUM+Y :Y=Y+1
50 IF CRCSUM<X THEN 30
60 CRCSUM=CRCSUM-X:X=X-1
70 IF X>Y THEN 30
80 CIRCLE(0,191),155
90 GOTO 90
```

The coordinate pairs generated by the mainloop are those of a "virtual" circle, such tasks as axial reflection, elliptic squash and centre translation are handled at a lower level ([5C06H](#5c06h)).

<a name="5c06h"></a>

    Address... 5C06H

This routine is used to by the circle mainloop to convert a coordinate pair, in register pairs HL and DE, into eight symmetric points on the screen. The Y coordinate is initially negated ([5B0BH](#5b0bh)), reflecting it about the X axis, and the first four points produced by successive clockwise rotations through ninety degrees (5C48H). The Y coordinate is then negated again ([5B0BH](#5b0bh)) and a further four points produced (5C48H).

Clockwise rotation is performed by exchanging the X and Y coordinates and negating the new Y coordinate, thus a point (40,10) would become (10,-40). Assuming an aspect ratio of 0.5, for example, the complete sequence of eight points would therefore be:

1.  X,-Y\*0.5
2. -Y,-X\*0.5
3. -X, Y\*0.5
4.  Y, X\*0.5
5.  Y,-X\*0.5
6. -X,-Y\*0.5
7. -Y, X\*0.5
8.  X, Y\*0.5

It can be seen from the above that, ignoring the sign of the coordinates for the moment, there are only four terms involved. Therefore, rather than performing the relatively slow aspect ratio multiplication ([5CEBH](#5cebh)) for each point, the terms X\*0.5 and Y\*0.5 can be prepared in advance and the complete sequence generated by interchanging and negating the four terms. With the aspect ratio shown above the initial conditions are set up so that register pair HL=X, register pair DE=-Y\*0.5, CXOFF=Y and CYOFF=X\*0.5 and successive points are produced by the operations:

1. Exchange HL and CXOFF, negate HL.
2. Exchange DE and CYOFF, negate DE.

In parallel with the computation of each circle coordinate the number of points required to reach the start of the segment containing the point is kept in [CPCNT8](#cpcnt8). This will initially be zero and will increase by 2\*RADIUS\*SIN(PI/4) as each ninety degree rotation is made. As each of the eight points is produced its Y coordinate value is added to the contents of [CPCNT8](#cpcnt8) and compared to the start and end angles to determine the appropriate course of action. If the point is between the two angles and [CPLOTF](#cplotf) is zero, or if it is outside the angles and [CPLOTF](#cplotf) is non-zero, the coordinates are added to the circle centre coordinates (5CDCH) and the point set via the [SCALXY](#scalxy), [MAPXYC](#mapxyc) and [SETC](#setc) standard routines. If the point is equal to either of the two angles, and the associated bit is set in [CLINEF](#clinef), the coordinates are added to the circle centre coordinates (5CDCH) and a line drawn to the centre ([593CH](#593ch)). If none of these conditions is applicable no action is taken other than to proceed to the next point.

<a name="5cebh"></a>

    Address... 5CEBH

This routine multiplies the coordinate value supplied in register pair DE by the aspect ratio contained in [ASPECT](#aspect), the result is returned in register pair DE. The standard binary shift and add method is used but the operation is performed as two single byte multiplications to avoid overflow problems.

<a name="5d17h"></a>

    Address... 5D17H

This routine is used by the "`CIRCLE`" statement handler to convert an angle operand to the form required by the circle mainloop, the result is returned in register pair DE. While the method used is basically sound, and eliminates one trigonometric computation per angle, the results produced are inaccurate. This is demonstrated by the following example which draws a line to the true thirty degree point on a circle's perimeter:

```
10 SCREEN 2
20 PI = 4 * ATN(1)
30 CIRCLE(100,100),80,,PI/6
40 LINE(100,100)-(100+80*COS(PI/6),100-80*SIN(PI/6))
50 GOTO 50
```

The result that the routine should produce is the number of points that must be produced by the circle mainloop before the required angle is reached. This can be computed by first noting that there will be INT(ANGLE/(PI/4)) forty-five degree segments prior to the segment containing the required angle. Furthermore each forty-five segment will contain RADIUS\*SIN(PI/4) points as this is the value of the terminating Y coordinate. Therefore the number of points required to reach the start of the segment containing the angle is the product of these two numbers. The total count is produced by adding this figure to the number of points required to cover any remaining angle within the final segment, that is RADIUS\*SIN(REMAINING ANGLE) points.

Unfortunately the routine computes the number of points within a segment by linear approximation from the total segment size on the mistaken assumption that successive points subtend equal angles. Thus in the above example the point count computed for the angle is 30/45\*(80\*0.707107)=37 instead of the correct value of forty. The error produced by the routine is therefore at a maximum at the centre of each forty-five degree segment and reduces to zero at the end points.

<a name="5d6eh"></a><a name="draw"></a>

    Address... 5D6EH

This is the "`DRAW`" statement handler. Register pair DE is set to point to the command table at 5D83H and control transfers to the macro language parser ([566CH](#566ch)).

<a name="5d83h"></a>

    Address... 5D83H

This table contains the valid command letters and associated addresses for the "`DRAW`" statement commands. Those commands which takes a parameter, and consequently have bit 7 set in the table, are shown with an asterisk:

|CMD    |TO
|-------|-------
|U\*    |5DB1H
|D\*    |5DB4H
|L\*    |5DB9H
|R\*    |5DBCH
|M      |5DD8H
|E\*    |5DCAH
|F\*    |5DC6H
|G\*    |5DD1H
|H\*    |5DC3H
|A\*    |5E4EH
|B      |5E46H
|N      |5E42H
|X      |5782H
|C\*    |5E87H
|S\*    |5E59H

</a>

<a name="5db1h"></a>

    Address... 5DB1H

This is the "`DRAW`" statement "`U`" command handler. The operation of the "`D`", "`L`", "`R`", "`E`", "`F`", "`G`" and "`H`" commands is very similar so no separate description of their handlers is given. The optional numeric parameter is supplied by the macro language parser in register pair DE. This initial parameter is modified by a given handler into a horizontal offset in register pair BC and a vertical offset in register pair DE. For example if leftward or upward movement is required the parameter is negated ([5B0BH](#5b0bh)), if diagonal movement is required the parameter is duplicated so that equal horizontal and vertical offsets are produced. Once the offsets have been prepared control transfers to the line drawing routine (5DFFH).

<a name="5dd8h"></a>

    Address... 5DD8H

This is the "`DRAW`" statement "`M`" command handler. The character following the command letter is examined then the two parameters collected from the command string ([5719H](#5719h)). If the initial character is "+" or "-" the parameters are regarded as offsets and are scaled ([5E66H](#5e66h)), rotated through successive ninety degree steps as determined by [DRWANG](#drwang) and then added to the current graphics coordinates (5CDCH) to determine the termination point. If [DRWFLG](#drwflg) shows the "`B`" mode to be inactive a line is then drawn (5CCDH) from the current graphics coordinates to the termination point. If [DRWFLG](#drwflg) shows the "`N`" mode to be inactive the termination coordinates are placed in [GRPACX](#grpacx) and [GRPACY](#grpacy) to become the new current graphics coordinates. Finally [DRWFLG](#drwflg) is zeroed, turning the "`B`" and "`N`" modes off, and the handler terminates.

<a name="5e42h"></a>

    Address... 5E42H

This is the "`DRAW`" statement "`N`" command handler, [DRWFLG](#drwflg) is simply set to 40H.

<a name="5e46h"></a>

    Address... 5E46H

This is the "`DRAW`" statement "`B`" command handler, [DRWFLG](#drwflg) is simply set to 80H.

<a name="5e4eh"></a>

    Address... 5E4EH

This is the "`DRAW`" statement "`A`" command handler. The parameter is checked for magnitude and placed in [DRWANG](#drwang).

<a name="5e59h"></a>

    Address... 5E59H

This is the "`DRAW`" statement "`S`" command handler. The parameter is checked for magnitude and placed in [DRWSCL](#drwscl).

<a name="5e66h"></a>

    Address... 5E66H

This routine is used by the "`DRAW`" statement "`U`", "`D`", "`L`", "`R`", "`E`", "`F`", "`G`", "`H`" and "`M`" (in offset mode) command handlers to scale the offset supplied in register pair DE by the contents of [DRWSCL](#drwscl). Unless [DRWSCL](#drwscl) is zero, in which case the routine simply terminates, the offset is multiplied using repeated addition and then divided by four ([59B4H](#59b4h)). To eliminate scaling an "`S0`" or "`S4`" command should be used.

<a name="5e87h"></a>

    Address... 5E87H

This is the "`DRAW`" statement "`C`" command handler. The parameter is placed in [ATRBYT](#atrbyt) via the [SETATR](#setatr) standard routine. There is no check on the MSB of the parameter so illegal values such as "`C265`" will be accepted without an error message.

<a name="5e91h"></a>

    Address... 5E91H

This routine is used by the "`PAINT`" statement handler to check, via the [SCALXY](#scalxy) standard routine, that the coordinates in register pairs BC and DE are within the screen. If not an "`Illegal function call`" error is generated (475AH).

<a name="5e9fh"></a><a name="dim"></a>

    Address... 5E9FH

This is the "`DIM`" statement handler. A return is set up to 5E9AH, so that multiple Arrays can be processed, [DIMFLG](#dimflg) is made non-zero and control drops into the Variable search routine.

<a name="5ea4h"></a>

    Address... 5EA4H

This is the Variable search routine. On entry register pair HL points to the first character of the Variable name in the program text. On exit register pair HL points to the character following the name and register pair DE to the first byte of the Variable contents in the Variable Storage Area. The first character of the name is taken from the program text, checked to ensure that it is upper case alphabetic ([64A7H](#64a7h)) and placed in register C. The optional second character, with a default value of zero, is placed in register B, this character may be alphabetic or numeric. Any further alphanumeric characters are then simply skipped over. If a type suffix character ("%", "$", "!" or "#") follows the name this is converted to the corresponding type code (2, 3, 4 or 8) and placed in [VALTYP](#valtyp). Otherwise the Variable's default type is taken from [DEFTBL](#deftbl) using the first letter of the name to locate the appropriate entry.

[SUBFLG](#subflg) is then checked to determine how any parenthesized subscript following the name should be treated. This flag is normally zero but is modified by the "`ERASE`" (01H), "`FOR`" (64H), "`FN`" (80H) or "`DEF FN`" (80H) statement handlers to force a particular course of action. In the "`ERASE`" case control transfers straight to the Array search routine (5FE8H), no parenthesized subscript need be present. In the "`FOR`", "`FN`" and "`DEF FN`" cases control transfers straight to the simple Variable search routine ([5F08H](#5f08h)), no check is made for a parenthesized subscript. Assuming that the situation is normal the program text is checked for the characters "(" or "\[". If either is present control transfers to the Array search routine ([5FBAH](#5fbah)), otherwise control drops into the simple Variable search routine.

<a name="5f08h"></a>

    Address... 5F08H

This is the simple Variable search routine. There are four types of simple Variable each composed of a header followed by the Variable contents. The first byte of the header contains the type code and the next two bytes the Variable name. The contents of the Variable will be one of the three standard numeric forms or, for the string type, the length and address of the string. Each of the four types is shown below:

<a name="figure46"></a>![][CH05F46]

**Figure 46:** Simple Variables

[NOFUNS](#nofuns) is first checked to determine whether a user defined function is currently being evaluated. If so the search is carried out on the contents of [PARM1](#parm1) first of all, only if this fails will it move onto the main Variable Storage Area. A linear search method is used, the two name characters and type byte of each Variable in the storage area are compared to the reference characters and type until a match is found or the end of the storage area is reached. If the search is successful the routine terminates with the address of the first byte of the Variable contents in register pair DE. If the search is unsuccessful the Array Storage Area is moved upwards and the new Variable is added to the end of the existing ones and initialized to zero.

There are two exceptions to this automatic creation of a new Variable. If the search is being carried out by the "`VARPTR`" function, and this is determined by examining the return address, no Variable will be created. Instead the routine terminates with register pair DE set to zero (5F61H) causing a subsequent "`Illegal function call`" error. The second exception occurs when the search is being carried out by the Factor Evaluator, that is when the Variable is newly declared inside an expression. In this case [DAC](#dac) is zeroed for numeric types, and loaded with the address of a dummy zero length descriptor for a string type, thus returning a zero result (5FA7H). These actions are designed to prevent the Expression Evaluator creating a new Variable ("`VARPTR`") is the only function to take a Variable argument directly rather than via an expression and so requires separate protection). If this were not so then assignment to an Array, via the "`LET`" statement handler, would fail as any simple Variable created during expression evaluation would change the Array's address.

<a name="5fbah"></a>

    Address... 5FBAH

This is the Array search routine. There are four types of Array each composed of a header plus a number of elements. The first byte of the header contains the type code, the next two bytes the Array name and the next two the offset to the start of the following Array. This is followed by a single byte containing the dimensionality of the Array and the element count list. Each two byte element count contains the maximum number of elements per dimension. These are stored in reverse order with the first one corresponding to the last subscript. The contents of each Array element are identical to the contents of the corresponding simple Variable. The integer Array AB%(3,4) is shown below with each element identified by its subscripts, high memory is towards the top of the page:

<a name="figure47"></a>![][CH05F47]

**Figure 47:** Integer Array

Each subscript is evaluated, converted to an integer ([4755H](#4755h)) and pushed onto the Z80 stack until a closing parenthesis is found, it need not match the opening one. A linear search is then carried out on the Array Storage Area for a match with the two name characters and the type. If the search is successful [DIMFLG](#dimflg) is checked and a "`Redimensioned array`" error generated ([405EH](#405eh)) if it shows a "`DIM`" statement to be active. Unless an "`ERASE`" statement is active, in which case the routine terminates with register pair BC pointing to the start of the Array (3297H), the dimensionality of the Array is then checked against the subscript count and a "`Subscript out of range`" error generated if they fail to match. Assuming these tests are passed control transfers to the element address computation point (607DH).

If the search is unsuccessful and an "`ERASE`" statement is active an "`Illegal function call`" error is generated (475AH), otherwise the new Array is added to the end of the existing Array Storage Area. Initialization of the new Array proceeds by storing the two name characters, the type code and the dimensionality (the subscript count) followed by the element count for each dimension. If [DIMFLG](#dimflg) shows a "`DIM`" statement to be active the element counts are determined by the subscripts. If the Array is being created by default, with a statement such as "`A(1,2,3)=5`" for example, a default value of eleven is used. As each element count is stored the total size of the Array is accumulated in register pair DE by successive multiplications ([314AH](#314ah)) of the element counts and the element size (the Array type). After a check that this amount of memory is available (6267H) [STREND](#strend) is increased the new area is zeroed and the Array size is stored, in slightly modified form, immediately after the two name characters. Unless the Array is being created by default, in which case the element address must be computed, the routine then terminates.

This is the element address computation point of the Array search routine. The location of a particular element within an Array involves the multiplication ([314AH](#314ah)) of subscripts, element counts and element sizes. As there are a variety of ways this could be done the actual method used is best illustrated with an example. The location of element (1,2,3) in a 4\*5\*6 Array would initially be computed as (((3\*5)+2)\*4)+1. This is then multiplied by the element size (type) and added to the Array base address to obtain the address of the required element. The computation method is an optimized form which minimizes the number of steps needed, it is equivalent to evaluating (3\*(4\*5))+(2\*4)+(1). The element address is returned in register pair DE.

<a name="60b1h"></a>

    Address... 60B1H

This is the "`PRINT USING`" statement handler. Control transfers here from the general "`PRINT`" statement handler after the applicable output device has been set up. Upon termination control passes back to the general "`PRINT`" statement exit point ([4AFFH](#4affh)) to restore the normal video output. The format string is evaluated (4C65H) and the address and length of the string body obtained from the descriptor. The program text pointer is then temporarily saved. Each character of the format string is examined until one of the possible template characters is found. If the character does not belong in a template it is simply output via the [OUTDO](#outdo) standard routine. Once the start of a template is found this is scanned along until a non-template character is found. Control then passes to the numeric output routine (6192H) or the string output routine (6211H).

In either case the program text pointer is restored to register pair HL and the next operand evaluated ([4C64H](#4c64h)). For numeric output the information gained from the template scan is passed to the numeric conversion routine (3426H) in registers A, B and C and the resulting string displayed ([6678H](#6678h)). For string output the required character count is passed to the "`LEFT$`" statement handler (6868H) in register C and the resulting string displayed (667BH). For either type of output the program text and format string are then examined to determine whether there are any further characters. If no operands exist the handler terminates. If the format string has been exhausted then it is restarted from the beginning (60BFH), otherwise scanning continues from the current position for the next operand (60f6H).

<a name="6250h"></a>

    Address... 6250H

This routine is used by the Interpreter Mainloop and the Variable search routine to move a block of memory upwards. A check is first made to ensure that sufficient memory exists (6267H) and then the block of memory is moved. The top source address is supplied in register pair BC and the top destination address in register pair HL. Copying stops when the contents of register pair BC equal those of register pair DE.

<a name="625eh"></a>

    Address... 625EH

This routine is used to check that sufficient memory is available between the top of the Array Storage Area and the base of the Z80 stack. On entry register C contains the number of words the caller requires. If this would narrow the gap to less than two hundred bytes an "`Out of memory`" error is generated.

<a name="6286h"></a>

    Address... 6286H

This is the "`NEW`" statement handler. [TRCFLG](#trcflg), [AUTFLG](#autflg) and [PTRFLG](#ptrflg) are zeroed and the zero end link is placed at the start of the Program Text Area. [VARTAB](#vartab) is set to point to the byte following the end link and control drops into the run-clear routine.

<a name="629ah"></a>

    Address... 629AH

This routine is used by the "`NEW`", "`RUN`" and "`CLEAR`" statement handlers to initialize the Interpreter variables. All interrupts are cleared (636EH) and the default Variable types in [DEFTBL](#deftbl) set to double precision. [RNDX](#rndx) is reset ([2C24H](#2c24h)) and [ONEFLG](#oneflg), [ONELIN](#onelin) and [OLDTXT](#oldtxt) are zeroed. [MEMSIZ](#memsiz) is copied to [FRETOP](#fretop) to clear the String Storage Area and [DATPTR](#datptr) set to the start of the Program Text Area ([63C9H](#63c9h)). The contents of [VARTAB](#vartab) are copied into [ARYTAB](#arytab) and [STREND](#strend), to clear any Variables, all the I/O buffers are closed ([6C1CH](#6c1ch)) and [NLONLY](#nlonly) is reset. [SAVSTK](#savstk) and the Z80 SP are reset from [STKTOP](#stktop) and [TEMPPT](#temppt) is reset to the start of [TEMPST](#tempst) to clear any string descriptors. The printer is shut down ([7304H](#7304h)) and output restored to the screen ([4AFFH](#4affh)). Finally [PRMLEN](#prmlen), [NOFUNS](#nofuns), [PRMLN2](#prmln2), [FUNACT](#funact), [PRMSTK](#prmstk) and [SUBFLG](#subflg) are zeroed and the routine terminates.

<a name="631bh"></a>

    Address... 631BH

This routine is used by the "`DEVICE ON`" statement handlers to enable an interrupt source, the address of the relevant device's [TRPTBL](#trptbl). status byte is supplied in register pair HL. Interrupts are enabled by setting bit 0 of the status byte. Bits 1 and 2 are then examined and, if the device has been stopped and an interrupt has occurred, [ONGSBF](#ongsbf) is incremented (634FH) so that the Runloop will process it at the end of the statement. Finally bit 1 of the status byte is reset to release any existing stop condition.

<a name="632eh"></a>

    Address... 632EH

This routine is used by the "`DEVICE OFF`" statement handlers to disable an interrupt source, the address of the relevant device's [TRPTBL](#trptbl) status byte is supplied in register pair HL. Bits 0 and 2 are examined to determine whether an interrupt has occurred since the end of the last statement, if so [ONGSBF](#ongsbf) is decremented (6362H) to prevent the Runloop from picking it up. The status byte is then zeroed.

<a name="6331h"></a>

    Address... 6331H

This routine is used by the "`DEVICE STOP`" statement handlers to suspend processing of interrupts from an interrupt source, the address of the relevant device's [TRPTBL](#trptbl) status byte is supplied in register pair HL. Bits 0 and 2 are examined to determine whether an interrupt has occurred since the end of the last statement, if so [ONGSBF](#ongsbf) is decremented (6362H) to prevent the Runloop from picking it up. Bit 1 of the status byte is then set.

<a name="633eh"></a>

    Address... 633EH

This routine is used by the "`RETURN`" statement handler to release the temporary stop condition imposed during interrupt driven BASIC subroutines, the address of the relevant device's [TRPTBL](#trptbl) status byte is supplied in register pair HL. Bits 0, and 2 are examined to determine whether a stopped interrupt has occurred since the subroutine was first activated. If so [ONGSBF](#ongsbf) is incremented (634FH) so that the Runloop will pick it up at the end of the statement. Bit 1 of the status byte is then reset. It should be noted that any "`DEVICE STOP`" Statement within an interrupt driven subroutine will therefore be ineffective.

<a name="6358h"></a>

    Address... 6358H

This routine is used by the Runloop interrupt processor ([6389H](#6389h)) to clear an interrupt prior to activating the BASIC subroutine, the address of the relevant device's [TRPTBL](#trptbl) status byte is supplied in register pair HL. [ONGSBF](#ongsbf) is decremented and bit 2 of the status byte is reset.

<a name="636eh"></a>

    Address... 636EH

This routine is used by the run-clear routine ([629AH](#629ah)) to clear all interrupts. The seventy-eight bytes of [TRPTBL](#trptbl) and the ten bytes of [FNKFLG](#fnkflg) are zeroed.

<a name="6389h"></a>

    Address... 6389H

This is the Runloop interrupt processor. [ONEFLG](#oneflg) is first examined to determine whether an error condition currently exists. If so the routine terminates, no interrupts will be processed until the error clears. [CURLIN](#curlin) is then examined and, if the Interpreter is in direct mode, the routine terminates. Assuming all is well a search is made of the twenty-six status bytes in [TRPTBL](#trptbl) to find the first active interrupt. Note that devices near the start of the table will consequently have a higher priority than those lower down. When the first active status byte is found, that is one with bits 0 and 2 set, the associated address is taken from [TRPTBL](#trptbl) and placed in register pair DE. The interrupt is then cleared ([6358H](#6358h)) and the device stopped ([6331H](#6331h)) before control transfers to the "`GOSUB`" handler ([47CFH](#47cfh)).

<a name="63c9h"></a>

    Address... 63C9H

This is the "`RESTORE`" statement handler. If no line number operand exists [DATPTR](#datptr) is set to the start of the Program Storage Area. Otherwise the operand is collected (4769H), the program text searched to find the relevant line ([4295H](#4295h)) and its address placed in [DATPTR](#datptr).

<a name="63e3h"></a>

    Address... 63E3H

This is the "`STOP`" statement handler. If further text exists in the statement control transfers to the "`STOP ON/OFF/STOP`" statement handler ([77A5H](#77a5h)). Otherwise register A is set to 01H and control drops into the "`END`" statement handler.

<a name="63eah"></a>

    Address... 63EAH

This is the "`END`" statement handler. It is also used, with differing entry points, by the "`STOP`" statement and for CTRL- STOP and end of text program termination. [ONEFLG](#oneflg) is first zeroed and then, for the "`END`" statement only, all I/O buffers are closed ([6C1CH](#6c1ch)). The current program text position is placed in [SAVTXT](#savtxt) and [OLDTXT](#oldtxt) and the current line number in [OLDLIN](#oldlin) for use by any subsequent "`CONT`" statement. The printer is shut down ([7304H](#7304h)), a CR LF issued to the screen ([7323H](#7323h)) and register pair HL set to point to the "`Break`" message at 3FDCH. For the "`END`" statement and end of text cases control then transfers to the Mainloop "`OK`" point (411EH). For the CTRL-STOP case control transfers to the end of the error handler (40FDH) to display the "`Break`" message.

<a name="6424h"></a>

    Address... 6424H

This is the "`CONT`" statement handler. Unless they are zero, in which case a "`Can't CONTINUE`" error is generated, the contents of [OLDTXT](#oldtxt) are placed in register pair HL and those of [OLDLIN](#oldlin) in [CURLIN](#curlin). Control then returns to the Runloop to execute at the old program text position. A program cannot be continued after CTRL-STOP has been used to break from WITHIN a statement, via the [CKCNTC](#ckcntc) standard routine, rather than from between statements.

<a name="6438h"></a>

    Address... 6438H

This is the "`TRON`" statement handler, [TRCFLG](#trcflg) is simply made non-zero.

<a name="6439h"></a>

    Address... 6439H

This is the "`TROFF`" statement handler, [TRCFLG](#trcflg) is simply made zero.

<a name="643eh"></a>

    Address... 643EH

This is the "`SWAP`" statement handler. The first Variable is located ([5EA4H](#5ea4h)) and its contents copied to [SWPTMP](#swptmp). The location of this Variable and of the end of the Variable Storage Area are temporarily saved. The second Variable is then located ([5EA4H](#5ea4h)) and its type compared with that of the first. If the types fail to match a "`Type mismatch`" error is generated ([406DH](#406dh)). The current end of the Variable Storage Area is then compared with the old end and an "`Illegal function call`" error generated (475AH) if they differ. Finally the contents of the second Variable are copied to the location of the first Variable (2EF3H) and the contents of [SWPTMP](#swptmp) to the location of the second Variable (2EF3H).

The checks performed by the handler mean that the second Variable, if it is simple and not an Array, must always be in existence before a "`SWAP`" Statement is encountered or an error will be generated. The reason for this is that, supposing the first Variable was an Array, then the creation of a second (simple) Variable would move the Array Storage Area upwards invalidating its saved location. Note that the perfectly legal case of a simple first Variable and a newly created simple second Variable is also rejected.

<a name="6477h"></a>

    Address... 6477H

This is the "`ERASE`" statement handler. [SUBFLG](#subflg) is first set to 01H, to control the Variable search routine, and the Array located ([5EA4H](#5ea4h)). All the following Arrays are moved downward and [STREND](#strend) set to its new, lower value. The program text is then checked and, if a comma follows, control transfers back to the start of the handler.

<a name="64a7h"></a>

    Address... 64A7H

This routine checks whether the character whose address is supplied in register pair HL is upper case alphabetic, if so it returns Flag NC.

<a name="64afh"></a>

    Address... 64AFH

This is the "`CLEAR`" statement handler. If no operands are present control transfers to the run-clear routine (62A1H) to remove all current Variables. Otherwise the string space operand is evaluated (4756H) followed by the optional top of memory operand ([542FH](#542fh)). The top of memory value is checked and an "`Illegal function call`" error generated (475AH) if it is less than 8000H or greater than F380H. The space required by the I/O buffers (267 bytes each) and the String Storage Area is subtracted from the top of memory value and an "`Out of memory`" error generated (6275H) if there is less than 160 bytes remaining to the base of the Variable Storage Area. Assuming all is well [HIMEM](#himem), [MEMSIZ](#memsiz) and [STKTOP](#stktop) are set to their new values and the remaining storage pointers reset via the run- clear routine (62A1H). The I/O buffer storage is re-allocated ([7E6BH](#7e6bh)) and the handler terminates.

Unfortunately the computation of [MEMSIZ](#memsiz) and [STKTOP](#stktop), when a new top of memory is specified, is incorrect resulting in the top of the String Storage Area being set one byte too high. This can be seen with the following where an illegal string is accepted:

```
10 CLEAR 200,&HF380
20 A$=STRING$(201,"A")
30 PRINT FRE("")
```

Because there should be an extra DEC HL instruction at 64EBH the new values of [MEMSIZ](#memsiz) and [STKTOP](#stktop) are initially set one byte too high. When the run-clear routine is called [MEMSIZ](#memsiz) is copied into [FRETOP](#fretop), the top of the String Storage Area, which results in this being one byte too high as well. Although [MEMSIZ](#memsiz) and [STKTOP](#stktop) are correctly recomputed when the file pointers are reset, [FRETOP](#fretop) is left with its incorrect value. When the "`FRE`" statement is executed in line thirty, and string garbage collection initiated, [FRETOP](#fretop) is restored to its correct value but, because the string overflows the String Storage Area by one byte, the amount of free space displayed is -1 byte. To correctly set all the system pointers any alteration of the top of memory should be followed immediately by another "`CLEAR`" statement with no operands.

<a name="6520h"></a>

    Address... 6520H

This routine computes the difference between the contents of register pairs HL and DE. It is a duplicate of the short section of code from 64ECH to 64F1H and is completely unused.

<a name="6527h"></a>

    Address... 6527H

This is the "`NEXT`" statement handler. Assuming further text is present in the statement the loop Variable is located ([5EA4H](#5ea4h)), otherwise a default address of zero is taken. The stack is then searched for the corresponding "`FOR`" parameter block ([3FE2H](#3fe2h)). If no parameter block is found, or if a "`GOSUB`" parameter block is found first, a "`NEXT without FOR`" error is generated ([405BH](#405bh)). Assuming the parameter block is found the intervening section of stack, together with any "`FOR`" blocks it may contain, is discarded. The loop Variable type is then taken from the parameter block and examined to determine the precision required during subsequent operations.

The STEP value is taken from the parameter block and added (3172H, 324EH or 2697H) to the current contents of the loop Variable which is then updated. The new value is compared (2F4DH, 2F21H or 2F5CH) with the termination value from the parameter block to determine whether the loop has terminated (65B6H). The loop will terminate for a positive STEP if the new loop value is GREATER than the termination value. The loop will terminate for a negative step if the new loop value is LESS than the termination value. If the loop has not terminated the original program text position and line number are taken from the parameter block and control transfers to the Runloop (45FDH). If the loop has terminated the parameter block is discarded from the stack and, unless further program text is present in which control transfers back to the start of the handler, control transfers to the Runloop to execute the next statement ([4601H](#4601h)).

<a name="65c8h"></a>

    Address... 65C8H

This routine is used by the Expression Evaluator to find the relation (<>=) between two string operands. The address of the first string descriptor is supplied on the Z80 stack and the address of the second in [DAC](#dac). The result is returned in register A and the flags as for the numeric relation routines:

```
String 1=String 2 ... A=00H, Flag Z,NC
String 1<String 2 ... A=01H, Flag NZ,NC
String 1>String 2 ... A=FFH, Flag NZ,C
```

Comparison commences at the first character of each string and continues until the two characters differ or one of the strings is exhausted. Control then returns to the Expression Evaluator ([4F57H](#4f57h)) to place the true or false numeric result in [DAC](#dac).

<a name="65f5h"></a>

    Address... 65F5H

This routine is used by the Factor Evaluator to apply the "`OCT$`" function to an operand contained in [DAC](#dac). The number is first converted to textual form in [FBUFFR](#fbuffr) ([371EH](#371eh)) and then the result string is created (6607H).

<a name="65fah"></a>

    Address... 65FAH

This routine is used by the Factor Evaluator to apply the "`HEX$`" function to an operand contained in [DAC](#dac). The number is first converted to textual form in [FBUFFR](#fbuffr) ([3722H](#3722h)) and then the result string is created (6607H).

<a name="65ffh"></a>

    Address... 65FFH

This routine is used by the Factor Evaluator to apply the "`BIN$`" function to an operand contained in [DAC](#dac). The number is first converted to textual form in [FBUFFR](#fbuffr) ([371AH](#371ah)) and then the result string is created (6607H).

<a name="6604h"></a>

    Address... 6604H

This routine is used by the Factor Evaluator to apply the "`STR$`" function to an operand contained in [DAC](#dac). The number is first converted to textual form in [FBUFFR](#fbuffr) ([3425H](#3425h)) then analyzed to determine its length and address (6635H). After checking that sufficient space is available ([668EH](#668eh)) the string is copied to the String Storage Area (67C7H) and the result descriptor created ([6654H](#6654h)).

<a name="6627h"></a>

    Address... 6627H

This routine first checks that there is sufficient space in the String Storage Area for the string whose length is supplied in register A (668EH). The string length and the address where the string will be placed in the String Storage Area are then copied to [DSCTMP](#dsctmp).

<a name="6636h"></a>

    Address... 6636H

This routine is used by the Factor Evaluator to analyze the character string whose address is supplied in register pair HL. The character string is scanned until a terminating character (00H or ") is found. The length and starting address are then placed in [DSCTMP](#dsctmp) (662AH) and control drops into the descriptor creation routine.

<a name="6654h"></a>

    Address... 6654H

This routine is used by the string functions to create a result descriptor. The descriptor is copied from [DSCTMP](#dsctmp) to the next available position in [TEMPST](#tempst) and its address placed in [DAC](#dac). Unless [TEMPST](#tempst) is full, in which case a "`String formula too complex`" error is generated, [TEMPPT](#temppt) is increased by three bytes and the routine terminates.

<a name="6678h"></a>

    Address... 6678H

This routine displays the message, or string, whose address is supplied in register pair HL. The string is analyzed (6635H) and its storage freed (67D3H). Successive characters are then taken from the string and displayed, via the [OUTDO](#outdo) standard routine, until the string is exhausted.

<a name="668eh"></a>

    Address... 668EH

This routine checks that there is room in the String Storage Area to add the string whose length is supplied in register A. On exit register pair DE points to the starting address in the String Storage Area where the string should be placed. The length of the string is first subtracted from the current free location contained in [FRETOP](#fretop). This is then compared with [STKTOP](#stktop), the lowest allowable location for string storage, to determine whether there is space for the string. If so [FRETOP](#fretop) is updated with the new position and the routine terminates. If there is insufficient space for the string then garbage collection is initiated ([66B6H](#66b6h)) to try and eliminate any dead strings. If, after garbage collection, there is still not enough space an "`Out of string space`" error is generated.

<a name="66b6h"></a>

    Address... 66B6H

This is the string garbage collector, its function is to eliminate any dead strings from the String Storage Area. The basic problem with string Variables, as opposed to numeric ones, is that their lengths vary. If string bodies were stored with their Variables in the Variable Storage Area even such apparently simple statements as A$=A$+"X" would require the movement of thousands of bytes of memory and slow execution speeds dramatically. The method used by the Interpreter to overcome this problem is to keep the string bodies separate from the Variables. Thus strings are kept in the String Storage Area and each Variable holds a three byte descriptor containing the length and address of the associated string. Whenever a string is assigned to a Variable it is simply added to the heap of existing strings in the String Storage Area and the Variable's descriptor changed. No attempt is made to eliminate any previous string belonging to the Variable, by restructuring the heap, as this would wipe out any throughput gains.

If sufficient Variable assignments are made it is inevitable that the String Storage Area will fill up. In a typical program many of these strings will be unused, that is the result of previous assignments. Garbage collection is the process whereby these dead strings are removed. Every string Variable in memory, including Arrays and the local Variables present during evaluation of user defined functions, is examined until the one is found whose string is stored highest in the heap. This string is then moved to the top of the String Storage Area and the Variable contents modified to point to the new location. The owner of the next highest string is then found and the process repeated until every string belonging to a Variable has been compacted.

If a large number of Variables are present garbage collection may take an appreciable time. The process can be seen at work with the following program which repeatedly assigns the string "`AAAA`" to each element of the Array A$. The program will run at full speed for the first two hundred and fifty assignments and then pause to eliminate the fifty dead strings. A further fifty assignments can then be made before a further garbage collection is required:

```
10 CLEAR 1000
20 DIM A$(200)
30 FOR N=0 TO 200
40 A$(N)=STRING$(4,"A")
50 PRINT".";
60 NEXT N
70 GOTO 30
```

The String Storage Area is also used to hold the intermediate strings produced during expression evaluation. Because so many string functions take multiple arguments, "`MID$`" takes three for example, the management of intermediate results is a major problem. To deal with it a standardized approach to string results is taken throughout the Interpreter. A producer of a string simply adds the string body to the heap in the String Storage Area, adds the descriptor to the descriptor heap in [TEMPST](#tempst) and places the address of the descriptor in [DAC](#dac). It is up to the user of the result to free this storage ([67D0H](#67d0h)) once it has processed the string. This rule applies to all parts of the system, from the individual function handlers back through the Expression Evaluator to the statement handlers, with only two exceptions.

The first exception occurs when the Factor Evaluator finds an explicitly stated string, such as "`SOMETHING`" in the program text. In this case it is not necessary to copy the string to the String Storage Area as the original will suffice.

The second exception occurs when the Factor Evaluator finds a reference to a Variable. In this case it is not necessary to place a copy of the descriptor in [TEMPST](#tempst) as one already exists inside the Variable.

<a name="6787h"></a>

    Address... 6787H

This routine is used by the Expression Evaluator to concatenate two string operands. Control transfers here when a "+" token is found following a string operand so the first action taken is to fetch the second string operand via the Factor Evaluator ([4DC7H](#4dc7h)). The lengths are then taken from both string descriptors and added together to check the length of the combined string. If this is greater than two hundred and fifty-five characters a "`String too long`" error is generated. After checking that space is available in the String Storage Area ([6627H](#6627h)) the storage of both operands is freed (67D6H). The first string is then copied to the String Storage Area (67BFH) and followed by the second one (67BFH). The result descriptor is created ([6654H](#6654h)) and control transfers back to the Expression Evaluator (4C73H)'

<a name="67d0h"></a>

    Address... 67D0H

This routine frees any storage occupied by the string whose descriptor address is contained in [DAC](#dac). The address of the descriptor is taken from [DAC](#dac) and examined to determine whether it is that of the last descriptor in [TEMPST](#tempst) (67EEH), if not the routine terminates. Otherwise [TEMPPT](#temppt) is reduced by three bytes clearing this descriptor from [TEMPST](#tempst). The address of the string body is then taken from the descriptor and compared with [FRETOP](#fretop) to see if this is the lowest string in the String Storage Area, if not the routine terminates. Otherwise the length of the string is added to [FRETOP](#fretop), which is then updated with this new value, freeing the storage occupied by the string body.

<a name="67ffh"></a>

    Address... 67FFH

This routine is used by the Factor Evaluator to apply the "`LEN`" function to an operand contained in [DAC](#dac). The operand's storage is freed ([67D0H](#67d0h)) and the string length taken from the descriptor and placed in [DAC](#dac) as an integer (4FCFH).

<a name="680bh"></a>

    Address... 680BH

This routine is used by the Factor Evaluator to apply the "`ASC`" function to an operand contained in [DAC](#dac). The operand's storage is freed and the string length examined (6803H), if it is zero an "`Illegal function call`" error is generated (475AH). Otherwise the first character is. taken from the string and placed in [DAC](#dac) as an integer (4FCFH).

<a name="681bh"></a>

    Address... 681BH

This routine is used by the Factor Evaluator to apply the "`CHR$`" function to an operand contained in [DAC](#dac). After checking that sufficient space is available (6625H) the operand is converted to a single byte integer (521FH). This character is then placed in the String Storage Area and the result descriptor created ([6654H](#6654h)).

<a name="6829h"></a>

    Address... 6829H

This routine is used by the Factor Evaluator to apply the "`STRING$`" function. After checking for the open parenthesis character the length operand is evaluated and placed in register E (521CH). The second operand is then evaluated ([4C64H](#4c64h)). If it is numeric it is converted to a single byte integer (521FH) and placed in register A. If it is a string the first character is taken from it and placed in register A (680FH). Control then drops into the "`SPACE$`" function to create the result string.

<a name="6848h"></a>

    Address... 6848H

This routine is used by the Factor Evaluator to apply the "`SPACE$`" function to an operand contained in [DAC](#dac). The operand is first converted to a single byte integer in register E (521FH). After checking that sufficient space is available ([6627H](#6627h)) the required number of spaces are copied to the String Storage Area and the result descriptor created ([6654H](#6654h)).

<a name="6861h"></a>

    Address... 6861H

This routine is used by the Factor Evaluator to apply the "`LEFT$`" function. The first operand's descriptor address and the integer second operand are supplied on the Z80 stack. The slice size is taken from the stack ([68E3H](#68e3h)) and compared to the source string length. If the source string length is less than the slice size it replaces it as the length to extract. After checking that sufficient space is available ([668EH](#668eh)) the required number of characters are copied from the start of the source string to the String Storage Area (67C7H). The source string's storage is then freed (67D7H) and the result descriptor created ([6654H](#6654h)).

<a name="6891h"></a>

    Address... 6891H

This routine is used by the Factor Evaluator to apply the "`RIGHT$`" function. The first operand's descriptor address and the integer second operand are supplied on the Z80 stack. The slice size is taken from the stack ([68E3H](#68e3h)) and subtracted from the source string length to determine the slice starting position. Control then transfers to the "`LEFT$`" routine to extract the slice (6865H).

<a name="689ah"></a>

    Address... 689AH

This routine is used by the Factor Evaluator to apply the "`MID$`" function. The first operand's descriptor address and the integer second operand are supplied on the Z80 stack. The starting position is taken from the stack (68E6H) and checked, if it is zero an "`Illegal function call`" error is generated (475AH). The optional slice size is then evaluated ([69E4H](#69e4h)) and control transfers to the "`LEFT$`" routine to extract the slice (6869H).

<a name="68bbh"></a>

    Address... 68BBH

This routine is used by the Factor Evaluator to apply the "`VAL`" function to an operand contained in [DAC](#dac). The string length is taken from the descriptor (6803H) and checked, if it is zero it is placed in [DAC](#dac) as an integer (4FCFH). The length is then added to the starting address of the string body to give the location of the character immediately following it. This is temporarily replaced with a zero byte and the string is converted to numeric form in [DAC](#dac) ([3299H](#3299h)). The original character is then restored and the routine terminates. The temporary zero byte delimiter is necessary because strings are packed together in the String Storage Area, without it the numeric converter would run on into succeeding strings.

<a name="68e3h"></a>

    Address... 68E3H

This routine is used by the "`LEFT$`", "`MID$`" and "`RIGHT$`" function handlers to check that the next program text character is ")" and then to pop an operand from the Z80 stack into register pair DE.

<a name="68ebh"></a>

    Address... 68EBH

This routine is used by the Factor Evaluator to apply the "`INSTR`" function. The first operand, which may be the starting position or the source string, is evaluated (4C62H) and its type tested. If it is the source string a default starting position of one is taken. If it is the starting position operand its value is checked and the source string operand evaluated ([4C64H](#4c64h)). The pattern string is then evaluated ([4C64H](#4c64h)) and the storage of both operands freed ([67D0H](#67d0h)). The length of the pattern string is checked and, if zero, the starting position is placed in [DAC](#dac) (4FCFH). The pattern string is then checked against successive characters from the source string, commencing at the starting position, until a match is found or the source string is exhausted. With a successful search the character position of the substring is placed in [DAC](#dac) as an integer (4FCFH), otherwise a zero result is returned.

<a name="696eh"></a>

    Address... 696EH

This is the "`MID$`" statement handler. After checking for the open parenthesis character the destination Variable is located ([5EA4H](#5ea4h)) and checked to ensure that it is a string type ([3058H](#3058h)). The address of the string body is then taken from the Variable and examined to determine whether it is inside the Program Text Area, as would be the case for an explicitly stated string. If this is the case the string body is copied to the String Storage Area (6611H) and a new descriptor copied to the Variable (2EF3H). This is done to avoid modifying the program text. The starting position is then evaluated (521CH) and checked, if it is zero an "`Illegal function call`" error is generated (475AH). The optional slice length operand is evaluated ([69E4H](#69e4h)) followed by the replacement string (4C5FH) whose storage is then freed ([67D0H](#67d0h)). Characters are then copied from the replacement string to the destination string until either the slice length is completed or the replacement string is exhausted.

<a name="69e4h"></a>

    Address... 69E4H

This routine is used by various string functions to evaluate an optional operand (521CH) and return the result in register E. If no operand is present a default value of 255 is returned.

<a name="69f2h"></a>

    Address... 69F2H

This routine is used by the Factor Evaluator to apply the "`FRE`" function to an operand contained in [DAC](#dac). If the operand is numeric the single precision difference between the Z80 Stack Pointer and the contents of [STREND](#strend) is placed in [DAC](#dac) (4FC1H). If the operand is a string type its storage is freed (67D3H) and garbage collection initiated ([66B6H](#66b6h)). The single precision difference between the contents of [FRETOP](#fretop) and those of [STKTOP](#stktop) is then placed in [DAC](#dac) (4FC1H).

<a name="6a0eh"></a>

    Address... 6A0EH

This routine is used by the file I/O handlers to analyze a filespec such as "`A:FILENAME.BAS`". The filespec consists of three parts, the device, the filename and the type extension. On entry register pair HL points to the start of the filespec in the program text. On exit register D holds the device code, the filename is in positions zero to seven of [FILNAM](#filnam) and the type extension in positions eight to ten. Any unused positions are filled with spaces.

The filespec string is evaluated ([4C64H](#4c64h)) and its storage freed ([67D0H](#67d0h)), if the string is of zero length a "`Bad file name`" error is generated ([6E6BH](#6e6bh)). The device name is parsed ([6F15H](#6f15h)) and successive characters taken from the filespec and placed in [FILNAM](#filnam) until the string is exhausted, a "." character is found or [FILNAM](#filnam) is full. A "`Bad file name`" error is generated ([6E6BH](#6e6bh)) if the filespec contains any control characters, that is those whose value is smaller than 20H. If the filespec contains a type extension a "`Bad file name`" error is generated ([6E6BH](#6e6bh)) if it is longer than three characters or if the filename is longer than eight characters. If no type extension is present the filename may be any length, extra characters are simply ignored.

<a name="6a6dh"></a>

    Address... 6A6DH

This routine is used by the file I/O handlers to locate the I/O buffer FCB whose number is supplied in register A. The buffer number is first checked against [MAXFIL](#maxfil) and a "`Bad file number`" error generated ([6E7DH](#6e7dh)) if it is too large. Otherwise the required address is taken from the file pointer block and placed in register pair HL and the buffer's mode taken from byte 0 of the FCB and placed in register A.

<a name="6a9eh"></a>

    Address... 6A9EH

This routine is used by the file I/O handlers to evaluate an I/O buffer number and to locate its FCB. Any "#" character is skipped ([4666H](#4666h)) and the buffer number evaluated (521CH). The FCB is located ([6A6DH](#6a6dh)) and a "`File not open`" error generated ([6E77H](#6e77h)) if the buffer mode byte is zero. Otherwise the FCB address is placed in [PTRFIL](#ptrfil) to redirect the Interpreter's output.

<a name="6ab7h"></a>

    Address... 6AB7H

This is the "`OPEN`" statement handler. The filespec is analyzed ([6A0EH](#6a0eh)) and any following mode converted to the corresponding mode byte, these are: "`FOR INPUT`" (01H), "`FOR OUTPUT`" (02H) and "`FOR APPEND`" (08H). If no mode is explicitly stated random mode (04H) is assumed. The "`AS`" characters are checked and the buffer number evaluated (521CH), if this is zero a "`Bad file number`" error is generated ([6E7DH](#6e7dh)). The FCB is then located ([6A6DH](#6a6dh)) and a "`File already open`" error generated ([6E6EH](#6e6eh)) if the buffer's mode byte is anything other than zero. The device code is placed in byte 4 of the FCB, the open function dispatched ([6F8FH](#6f8fh)) and the Interpreter's output reset to the screen ([4AFFH](#4affh)).

<a name="6b24h"></a>

    Address... 6B24H

This routine is used by the file I/O handlers to close the I/O buffer whose number is supplied in register A. The FCB is located ([6A6DH](#6a6dh)) and, provided the buffer is in use, the close function dispatched ([6F8FH](#6f8fh)) and the buffer filled with zeroes ([6CEAH](#6ceah)). [PTRFIL](#ptrfil) and the FCB mode byte are then zeroed to reset the Interpreter's output to the screen.

<a name="6b5bh"></a>

    Address... 6B5BH

This is the "`LOAD`", "`MERGE`" and "`RUN filespec`" statement handler. The filespec is analyzed ([6A0EH](#6a0eh)) and then, for "`LOAD`" and "`RUN`" only, the program text examined to determine whether the auto-run "`R`" option is specified. I/O buffer 0 is opened for input (6AFAH) and the first byte of [FILNAM](#filnam) set to FFH if auto-run is required. For "`LOAD`" and "`RUN`" only any program text is then cleared via the "`NEW`" statement handler (6287H). As this will reset the Interpreter's output to the screen the buffer FCB is again located and placed in [PTRFIL](#ptrfil) (6AAAH). Control then transfers directly to the Interpreter Mainloop ([4134H](#4134h)) for the program text to be loaded as if typed from the keyboard. Note that no error checking of any sort is carried out on the data read.

<a name="6ba3h"></a>

    Address... 6BA3H

This is the "`SAVE`" statement handler. The filespec is analyzed ([6A0EH](#6a0eh)) and the program text examined to determine whether the ASCII "`A`" suffix is present. This is only relevant under Disk BASIC, it makes no difference on a standard MSX machine. I/O buffer 0 is opened for output (6AFAH) and control transfers to the "`LIST`" statement handler ([522EH](#522eh)) to output the program text. Note that no error checking information of any sort accompanies the text.

<a name="6bdah"></a>

    Address... 6BDAH

This routine is used by the file I/O handlers to return the device code for the currently active I/O buffer. The FCB address is taken from [PTRFIL](#ptrfil) then the device code taken from byte 4 of the FCB and placed in register A.

<a name="6be7h"></a>

    Address... 6BE7H

This routine is used by the file I/O handlers to perform an operation on a number of I/O buffers. The address of the relevant routine is supplied in register pair BC and the buffer count in register A. For example if register pair BC contained 6B24H and register A contained 03H buffers 3, 2, 1 and 0 would be closed. The routine has a slightly different function if it is entered with FLAG NZ. In this case the I/O buffer numbers are taken sequentially from the program text and evaluated (521CH) before the operation is performed, a typical case might be "#1,#2".

<a name="6c14h"></a>

    Address... 6C14H

This is the "`CLOSE`" statement handler. Register pair BC is set to 6B24H, register A is loaded with the contents of [MAXFIL](#maxfil) and the required number of buffers closed ([6BE7H](#6be7h)).

<a name="6c1ch"></a>

    Address... 6C1CH

This routine is used by the file I/O handlers to close every I/O buffer. Register pair BC is set to 6B24H, register A is loaded with the contents of [MAXFIL](#maxfil) and all buffers closed ([6BE7H](#6be7h)).

<a name="6c2ah"></a>

    Address... 6C2AH

This is the "`LFILES`" statement handler. [PRTFLG](#prtflg) is made non- zero, to direct output to the printer, and control drops into the "`FILES`" statement handler.

<a name="6c2fh"></a>

    Address... 6C2FH

This is the "`FILES`" statement handler, an "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="6c35h"></a>

    Address... 6C35H

Control transfers here from the general "`PUT`" and "`GET`" handlers ([7758H](#7758h)) when the program text contains anything other than a "`SPRITE`" token. A "`Sequential I/O only`" error is generated ([6E86H](#6e86h)) on a standard MSX machine.

<a name="6c48h"></a>

    Address... 6C48H

This routine is used by the file I/O handlers to sequentially output the character supplied in register A. The character is placed in register C and the sequential output function dispatched ([6F8FH](#6f8fh)).

<a name="6c71h"></a>

    Address... 6C71H

This routine is used by the file I/O handlers to sequentially input a single character. The sequential input function is dispatched ([6F8FH](#6f8fh)) and the character returned in register A, FLAG C indicates an EOF (End Of File) condition.

<a name="6c87h"></a>

    Address... 6C87H

This routine is used by the Factor Evaluator to apply the "`INPUT$`" function. The program text is checked for the "$" and "(" characters and the length operand evaluated (521CH). If an I/O buffer number is present it is evaluated, the FCB located ([6A9EH](#6a9eh)) and the mode byte examined. An "`Input past end`" error is generated ([6E83H](#6e83h)) if the buffer is not in input or random mode. After checking that sufficient space is available ([6627H](#6627h)) the required number of characters are sequentially input ([6C71H](#6c71h)), or collected via the [CHGET](#chget) standard routine, and copied to the String Storage Area. Finally the result descriptor is created ([6654H](#6654h)).

<a name="6ceah"></a>

    Address... 6CEAH

This routine is used by the file I/O handlers to fill the buffer whose FCB address is contained in [PTRFIL](#ptrfil) with two hundred and fifty-six zeroes.

<a name="6cfbh"></a>

    Address... 6CFBH

This routine is used by the file I/O handlers to return, in register pair HL, the starting address of the buffer whose FCB address is contained in [PTRFIL](#ptrfil). This just involves adding nine to the FCB address.

<a name="6d03h"></a>

    Address... 6D03H

This routine is used by the Factor Evaluator to apply the "`LOC`" function to the I/O buffer whose number is contained in [DAC](#dac). The FCB is located (6A6AH) and the LOC function dispatched ([6F8FH](#6f8fh)). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="6d14h"></a>

    Address... 6D14H

This routine is used by the Factor Evaluator to apply the "`LOF`" function to the I/O buffer whose number is contained in [DAC](#dac). The FCB is located (6A6AH) and the LOF function dispatched ([6F8FH](#6f8fh)). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="6d25h"></a>

    Address... 6D25H

This routine is used by the Factor Evaluator to apply the "`EOF`" function to the I/O buffer whose number is contained in [DAC](#dac). The FCB is located (6A6AH) and the EOF function dispatched ([6F8FH](#6f8fh)).

<a name="6d39h"></a>

    Address... 6D39H

This routine is used by the Factor Evaluator to apply the "`FPOS`" function to the I/O buffer whose number is contained in [DAC](#dac). The FCB is located (6A6AH) and the `FPOS` function dispatched ([6F8FH](#6f8fh)). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="6d48h"></a>

    Address... 6D48H

Control transfers to this routine when the Interpreter Mainloop encounters a direct statement, that is one with no line number. The [ISFLIO](#isflio) standard routine is first used to determine whether a "`LOAD`" statement is active. If input is coming from the keyboard control transfers to the Runloop execution point ([4640H](#4640h)) to execute the statement. If input is coming from the cassette buffer 0 is closed ([6B24H](#6b24h)) and a "`Direct statement in file`" error generated ([6E71H](#6e71h)). This could happen on a standard MSX machine either through a cassette error or by attempting to load a text file with no line numbers.

<a name="6d57h"></a>

    Address... 6D57H

This routine is used by the "`INPUT`", "`LINE INPUT`" and "`PRINT`" statement handlers to check for the presence of a "#" character in the program text. If one is found the I/O buffer number is evaluated ([521BH](#521bh)), the FCB located and its address placed in [PTRFIL](#ptrfil) (6AAAH). The mode byte of the FCB is then compared with the mode number supplied by the statement handler in register C, if they do not match a "`Bad file number`" error is generated ([6E7DH](#6e7dh)). With "`PRINT`" the allowable modes are output, random and append. With "`INPUT`" and "`LINE INPUT`" the allowable modes are input and random. Note that on a standard MSX machine not all these modes are supported at lower levels. Some sort of error will consequently be generated at a later stage for illegal modes.

<a name="6d83h"></a>

    Address... 6D83H

This routine is used by the "`INPUT`" statement handler to input a string from an I/O buffer. A return is first set up to the "`READ/INPUT`" statement handler (4BF1H). The characters which delimit the input string, comma and space for a numeric Variable and comma only for a string Variable, are placed in registers D and E and control transfers to the "`LINE INPUT`" routine (6DA3H).

<a name="6d8fh"></a>

    Address... 6D8FH

This is the "`LINE INPUT`" statement handler when input is from an I/O buffer. The buffer number is evaluated, the FCB located and the mode checked (6D55H). The Variable to assign to is then located ([5EA4H](#5ea4h)) and its type checked to ensure it is a string type ([3058H](#3058h)). A return is set up to the "`LET`" statement handler (487BH) to perform the assignment and the input string collected.

Characters are sequentially input ([6C71H](#6c71h)) and placed in [BUF](#buf) until the correct delimiter is found, EOF is reached or [BUF](#buf) fills up (6E41H). When the terminating condition is reached and assignment is to a numeric Variable the string is converted to numeric form in [DAC](#dac) ([3299H](#3299h)). When assignment is to a string Variable the string is analyzed and the result descriptor created (6638H).

For "`LINE INPUT`" all characters are accepted until a CR code is reached. Note that if this CR code is preceded by a LF code then it will not function as a delimiter but will merely be accepted as part of the string. For "`INPUT`" to a numeric Variable leading spaces are stripped then characters accepted until a CR code, a space or a comma is reached. Note that as for "`LINE INPUT`" a CR code will not function as a delimiter when preceded by a LF code. In this case however the CR code will not be placed in [BUF](#buf) but ignored. For "`INPUT`" to a string Variable leading spaces are stripped then characters accepted until a CR or comma is reached. Note that as for "`LINE INPUT`" a CR code will not function as a delimiter when preceded by a LF code. In this case however neither code will be placed in [BUF](#buf) both are ignored. An alternative mode is entered when the first character read, after any spaces, is a double quote character. In this case all characters will be accepted, and stored in [BUF](#buf), until another double quote delimiter is read.

Once the input string has been accepted the terminating delimiter is examined to see if any special action is required with respect to trailing characters. If the input string was delimited by a double quote character or a space then any succeeding spaces will be read in and ignored until a non-space character is found. If this character is a comma or CR code then it is accepted and ignored. Otherwise a putback function is dispatched ([6F8FH](#6f8fh)) to return the character to the I/O buffer. If the input string was delimited by a CR code then the next character is read in and checked. If this is a LF code it will be accepted but ignored. If it is not a LF code then a putback function is dispatched ([6F8FH](#6f8fh)) to return the character to the I/O buffer.

<a name="6e6bh"></a>
<a name="6e6eh"></a>
<a name="6e71h"></a>
<a name="6e74h"></a>
<a name="6e77h"></a>
<a name="6e7ah"></a>
<a name="6e7dh"></a>
<a name="6e80h"></a>
<a name="6e83h"></a>
<a name="6e86h"></a>

    Address... 6E6BH

This is a group of ten file I/O related error generators. Register E is loaded with the relevant error code and control transfers to the error handler ([406FH](#406fh)):

|ADDRESS|ERROR
|-------|------------------------
|6E6BH  |Bad file name
|6E6EH  |File already open
|6E71H  |Direct statement in file
|6E74H  |File not found
|6E77H  |File not open
|6E7AH  |Field overflow
|6E7DH  |Bad file number
|6E80H  |Internal error
|6E83H  |Input past end
|6E86H  |Sequential I/O only

</a>

<a name="6e92h"></a>

    Address... 6E92H

This is the "`BSAVE`" statement handler. The filespec is analyzed ([6A0EH](#6a0eh)) and the start address evaluated ([6F0BH](#6f0bh)). The stop address is then evaluated ([6F0BH](#6f0bh)) and placed in [SAVEND](#savend) followed by the optional entry address ([6F0BH](#6f0bh)) which is placed in [SAVENT](#savent). If no entry address exists the start address is taken instead. The device code is checked to ensure that it is CAS, if not a "`Bad file name`" error is generated ([6E6BH](#6e6bh)), and the data written to cassette ([6FD7H](#6fd7h)). Note that no buffering is involved, data is written directly to the cassette, and no error checking information accompanies the data.

<a name="6ec6h"></a>

    Address... 6EC6H

This is the "`BLOAD`" statement handler. The filespec is analyzed ([6A0EH](#6a0eh)) and [RUNBNF](#runbnf) made non-zero if the auto-run "`R`" option is present in the program text. The optional load offset, with a default value of zero, is then evaluated ([6F0BH](#6f0bh)) and the device code checked to ensure that it is CAS, if not a "`Bad file name`" error is generated ([6E6BH](#6e6bh)). Data is then read directly from cassette ([7014H](#7014h)), as with "`BSAVE`" no buffering or error checking is involved.

<a name="6ef4h"></a>

    Address... 6EF4H

Control transfers to this routine when the "`BLOAD`" statement handler has completed loading data into memory. If [RUNBNF](#runbnf) is zero buffer 0 is closed ([6B24H](#6b24h)) and control returns to the Runloop. Otherwise buffer 0 is closed ([6B24H](#6b24h)), a return address of 6CF3H is set up (this routine just pops the program text pointer back into register pair HL and returns to the Runloop) and control transfers to the address contained in [SAVENT](#savent).

<a name="6f0bh"></a>

    Address... 6F0BH

This routine is used by the "`BLOAD`" and "`BSAVE`" handlers to evaluate an address operand, the result is returned in register pair DE. The operand is evaluated (4C64H) then converted to an integer ([5439H](#5439h)).

<a name="6f15h"></a>

    Address... 6F15H

This routine is used by the filespec analyzer to parse a device name such as "`CAS:`". On entry register pair HL points to the start of the filespec string and register E contains its length. If no device name is present the default device code (CAS=FFH) is returned in register A with FLAG Z. If a legal device name is present its code is returned in register A with FLAG NZ.

The filespec is examined until a ":" character is found then the name compared with each of the legal device names in the device table at 6F76H. If a match is found the device code is taken from the table and returned in register A. If no match is found control transfers to the external ROM search routine ([55F8H](#55f8h)). Note that any lower case characters are turned to upper case for comparison purposes. Thus crt and CRT, for example, are the same device.

<a name="6f76h"></a>

    Address... 6F76H

This table is used by the device name parser, it contains the four device names and codes available on a standard MSX machine:

    CAS ... FFH  LPT ... FEH  CRT ... FDH  GRP ... FCH

</a>

<a name="6f87h"></a>

    Address... 6F87H

This table is used by the function dispatcher ([6F8FH](#6f8fh)), it contains the address of the function decoding table for each of the four standard MSX devices:

    CAS ... 71C7H  LPT ... 72A6H  CRT ... 71A2H  GRP ... 7182H

</a>

<a name="6f8fh"></a>

    Address... 6F8FH

This is the file I/O function dispatcher. In conjunction with the Interpreter's buffer structure it provides a consistent, device independent method of inputting or outputting data. The required function code is supplied in register A and the address of the buffer FCB in register pair HL.

The device code is taken from byte 4 of the FCB and examined to determine whether it is one of the four standard devices, if not control transfers to the external ROM function dispatcher ([564AH](#564ah)). Otherwise the address of the device's function decoding table is taken from the table at 6F87H, the required function's address taken from it and control transferred to the relevant function handler.

<a name="6fb7h"></a>

    Address... 6FB7H

This is the "`CSAVE`" statement handler. The filename is evaluated (7098H) followed by the optional baud rate operand ([7A2DH](#7a2dh)). The identification block is then written to cassette ([7125H](#7125h)) with a filetype byte of D3H. The contents of the Program Text Area are written directly to cassette as a single data block ([713EH](#713eh)). Note that no error checking information accompanies the data.

<a name="6fd7h"></a>

    Address... 6FD7H

Control transfers to this routine from the "`BSAVE`" statement handler to write a block of memory to cassette. The identification block is first written to cassette ([7125H](#7125h)) with a filetype byte of D0H. The motor is then turned on and a short header written to cassette ([72F8H](#72f8h)) The starting address is popped from the Z80 stack and written to cassette LSB first, MSB second ([7003H](#7003h)). The stop address is taken from [SAVEND](#savend) and written to cassette LSB first, MSB second ([7003H](#7003h)). The entry address is taken from [SAVENT](#savent) and written to cassette LSB first, MSB second ([7003H](#7003h)). The required area of memory is then written to cassette one byte at a time ([72DEH](#72deh)) and the cassette motor turned off via the [TAPOOF](#tapoof) standard routine. Note that no error checking information accompanies the data.

<a name="7003h"></a>

    Address... 7003H

This routine writes the contents of register pair HL to cassette with register L first ([72DEH](#72deh)) and register H second ([72DEH](#72deh)).

<a name="700bh"></a>

    Address... 700BH

This routine reads two bytes from cassette and places the first in register L ([72D4H](#72d4h)), the second in register H ([72D4H](#72d4h)).

<a name="7014h"></a>

    Address... 7014H

Control transfers to this routine from the "`BLOAD`" statement handler to load data from the cassette into memory. The cassette is read until an identification block with a file type of D0H and the correct filename is found ([70B8H](#70b8h)). The data block header is then located on the cassette ([72E9H](#72e9h)). The offset value is popped from the Z80 stack and added to the start address from the cassette ([700BH](#700bh)). The stop address is read from cassette ([700BH](#700bh)) and the offset added to this as well. The entry address is read from cassette ([700BH](#700bh)) and placed in [SAVENT](#savent) in case auto-run is required. Successive data bytes are then read from cassette ([72D4H](#72d4h)) and placed in memory, at the start address initially, until the stop address is reached. Finally the motor is turned off via the [TAPIOF](#tapiof) standard routine and control transfers to the "`BLOAD`" termination point ([6EF4H](#6ef4h)).

<a name="703fh"></a>

    Address... 703FH

This is the "`CLOAD`" and "`CLOAD?`" statement handler. The program text is first checked for a trailing "`PRINT`" token (91H) which is how the "`?`" character is tokenized. The filename is then evaluated ([708CH](#708ch)) and the cassette read until an identification block with a filetype of D3H and the correct filename is found ([70B8H](#70b8h)). For "`CLOAD`" a "`NEW`" operation is then performed (6287H) to erase the current program text. For "`CLOAD?`" all pointers in the Program Text Area are converted to line numbers (54EAH) to match the cassette data.

The data block header is located on the cassette and successive data bytes read from cassette and placed in memory or compared with the current memory contents ([715DH](#715dh)). When the data block has been completely read the message "`OK`" is displayed ([6678H](#6678h)) and control transfers directly to the end of the Interpreter Mainloop (4237H) to reset the Variable storage pointers. For "`CLOAD?`" reading of the data block will terminate if the cassette byte is not the same as the program text byte in memory. If the address where this occurred is above the end of the Program Text Area then the handler terminates with an "`OK`" message as before. Otherwise a "`Verify error`" is generated.

<a name="708ch"></a>

    Address... 708CH

This routine is used by the "`CLOAD`" and "`CSAVE`" statement handlers to evaluate a filename in the program text. The two handlers use different entry points so that a null filename is allowed for "`CLOAD`" but not for "`CSAVE`". The filename string is evaluated ([4C64H](#4c64h)), its storage freed (680FH) and the first six characters copied to [FILNAM](#filnam). If the filename is longer than six characters the excess is ignored. If the filename is shorter than six characters then [FILNAM](#filnam) is padded with spaces.

<a name="70b8h"></a>

    Address... 70B8H

This routine is used by the "`CLOAD`" and "`BLOAD`" statement handlers and for the dispatcher open function (when the device is CAS and the mode is input) to locate an identification block on the cassette. On entry the filename is in [FILNAM](#filnam) and the file type in register C, D3H for a tokenized BASIC (`CLOAD`) file, D0H for a binary (`BLOAD`) file and EAH for an ASCII (`LOAD` or data) file.

The cassette motor is turned on and the cassette read until a header is found ([72E9H](#72e9h)). Each identification block is prefixed by ten file type characters so successive characters are read from cassette ([72D4H](#72d4h)) and compared to the required file type. If the file type characters do not match control transfers back to the start of the routine to find the next header. Otherwise the next six characters are read in ([72D4H](#72d4h)) and placed in [FILNAM](#filnam). If [FILNAM](#filnam) is full of spaces no filename match is attempted and the identification block has been found. Otherwise the contents of [FILNAM](#filnam) and [FILNM2](#filnm2) are compared to determine whether this is the required file. If the match is unsuccessful, and the Interpreter is in direct mode, the message "`Skip:`" is displayed ([710DH](#710dh)) followed by the filename. Control then transfers back to the start of the routine to try the next header. If the match is successful, and the Interpreter is in direct mode, the message "`Found:`" is displayed ([710DH](#710dh)) followed by the filename and the routine terminates.

<a name="70ffh"></a>

    Address... 70FFH

This is the plain text message "`Found:`" terminated by a zero byte.

<a name="7106h"></a>

    Address... 7106H

This is the plain text message "`Skip :`" terminated by a zero byte.

<a name="710dh"></a>

    Address... 710DH

Unless [CURLIN](#curlin) shows the Interpreter to be in program mode this routine first displays ([6678H](#6678h)) the message whose address is supplied in register pair HL, followed by the six characters contained in [FILNM2](#filnm2).

<a name="7125h"></a>

    Address... 7125H

This routine is used by the "`CSAVE`" and "`BSAVE`" statement handlers and for the dispatcher open function (when the device is CAS and the mode is output) to write an identification block to cassette. On entry the filename is in [FILNAM](#filnam) and the filetype in register A, D3H for a tokenized BASIC (`CSAVE`) file, D0H for a binary (`BSAVE`) file and EAH for an ASCII (`SAVE` or data) file. The cassette motor is turned on and a long header written to cassette ([72F8H](#72f8h)) The filetype byte is then written to cassette ([72DEH](#72deh)) ten times followed by the first six characters from [FILNAM](#filnam) ([72DEH](#72deh)). The cassette motor is turned off via the [TAPOOF](#tapoof) standard routine and the routine terminates.

<a name="713eh"></a>

    Address... 713EH

This routine is used by the "`CSAVE`" statement handler to write the Program Text Area to cassette as a single data block. All pointers in the program text are converted back to line numbers (54EAH) to make the text address independent. The cassette motor is turned on and a short header written to cassette ([72F8H](#72f8h)) The entire Program Text Area is then written to cassette a byte at a time ([72DEH](#72deh)) and followed with seven zero bytes ([72DEH](#72deh)) as a terminator. The cassette motor is then turned off via the [TAPOOF](#tapoof) standard routine and the routine terminates.

<a name="715dh"></a>

    Address... 715DH

This routine is used by the "`CLOAD`" and "`CLOAD?`" statement handlers to read a single data block into the Program Text Area or to compare it with the current contents. On entry register A contains a flag to distinguish between the two statements, 00H for "`CLOAD`" and FFH for "`CLOAD?`". The cassette motor is turned on and the first header located ([72E9H](#72e9h)). Successive characters are read from cassette ([72D4H](#72d4h)) and placed in the Program Text Area or compared with the current contents. If the current statement is "`CLOAD?`" the routine will terminate with FLAG NZ if the cassette character is not the same as the memory character. Otherwise data will be read until ten successive zeroes are found. This sequence of zeroes is composed of the last program line end of line character, the end link and the seven terminator zeroes added by "`CSAVE`". Note that the routine will probably terminate during this sequence, when used by "`CLOAD?`", as memory comparison is still in progress. This accounts for the rather peculiar coding of the "`CLOAD?`" handler terminating conditions.

<a name="7182h"></a>

    Address... 7182H

This table is used by the dispatcher when decoding function codes for the GRP device. It contains the address of the handler for each of the function codes, most are in fact error generators:

|TO     |FUNCTION
|-------|---------------------
|71B6H  | 0, open
|71C2H  | 2, close
|6E86H  | 4, random
|7196H  | 6, sequential output
|475AH  | 8, sequential input
|475AH  |10, loc
|475AH  |12, lof
|475AH  |14, eof
|475AH  |16, fpos
|475AH  |18, putback

</a>

<a name="7196h"></a>

    Address... 7196H

This is the dispatcher sequential output routine for the GRP device. [SCRMOD](#scrmod) is first checked and an "`Illegal function call`" error generated (475AH) if the screen is in either text mode. The character to output is taken from register C and control transfers to the [GRPPRT](#grpprt) standard routine.

<a name="71a2h"></a>

    Address... 71A2H

This table is used by the device dispatcher when decoding function codes for the CRT device. It contains the address of the handler for each of the function codes, most are in fact error generators:

|TO     |FUNCTION
|-------|---------------------
|71B6H  | 0, open
|71C2H  | 2, close
|6E86H  | 4, random
|71C3H  | 6, sequential output
|475AH  | 8, sequential input
|475AH  |10, loc
|475AH  |12, lof
|475AH  |14, eof
|475AH  |16, fpos
|475AH  |18, putback

</a>

<a name="71b6h"></a>

    Address... 71B6H

This is the dispatcher open routine for the CRT, LPT and GRP devices. The required mode, in register E, is checked and a "`Bad file name`" error generated ([6E6BH](#6e6bh)) for input or append. The FCB address is then placed in [PTRFIL](#ptrfil), the mode in byte 0 of the FCB and the routine terminates. Note that the Z80 RET instruction at the end of this routine (71C2H) is the dispatcher close routine for the CRT, LPT and GRP devices.

<a name="71c3h"></a>

    Address... 71C3H

This is the dispatcher sequential output routine for the CRT device. The character to output is taken from register C and control transfers to the [CHPUT](#chput) standard routine.

<a name="71c7h"></a>

    Address... 71C7H

This table is used by the dispatcher when decoding function codes for the CAS device. It contains the address of the handler for each of the function codes, several are error generators:

|TO     |FUNCTION
|-------|---------------------
|71DBH  | 0, open
|7205H  | 2, close
|6E86H  | 4, random
|722AH  | 6, sequential output
|723FH  | 8, sequential input
|475AH  |10, loc
|475AH  |12, lof
|726DH  |14, eof
|475AH  |16, fpos
|727CH  |18, putback

</a>

<a name="71dbh"></a>

    Address... 71DBH

This is the dispatcher open routine for the CAS device. The current I/O buffer position, held in byte 6 of the FCB, and [CASPRV](#casprv), which holds any putback character are both zeroed. The required mode, supplied in register E, is examined and a "`Bad file name`" error generated ([6E6BH](#6e6bh)) for append or random modes. For output mode the identification block is then written to cassette ([7125H](#7125h)) while for input mode the correct identification block is located on the cassette ([70B8H](#70b8h)). The FCB address is then placed in [PTRFIL](#ptrfil), the mode in byte 0 of the FCB and the routine terminates.

<a name="7205h"></a>

    Address... 7205H

This is the dispatcher close routine for the CAS device. Byte 0 of the FCB is examined and, if the mode is input, [CASPRV](#casprv) is zeroed and the routine terminates. Otherwise the remainder of the I/O buffer is filled with end of file characters (1AH) and the I/O buffer contents written to cassette (722FH). [CASPRV](#casprv) is then zeroed and the routine terminates.

<a name="722ah"></a>

    Address... 722AH

This is the dispatcher sequential output routine for the CAS device. The character to output is taken from register C and placed in the next free position in the I/O buffer ([728BH](#728bh)). Byte 6 of the FCB, the I/O buffer position, is then incremented. If the I/O buffer position has wrapped round to zero this means that there are two hundred and fifty-six characters in the I/O buffer and it has to be written to cassette. The cassette motor is turned on, a short header is written to cassette ([72F8H](#72f8h)) followed by the I/O buffer contents ([72DEH](#72deh)), and the motor is turned off via the [TAPOOF](#tapoof) standard routine.

<a name="723fh"></a>

    Address... 723FH

This is the dispatcher sequential input routine for the CAS device. [CASPRV](#casprv) is first checked ([72BEH](#72beh)) to determine whether it contains a character which has been putback, in which case its contents will be non-zero. If so the routine terminates with the character in register A. Otherwise the I/O buffer position is checked ([729BH](#729bh)) to determine whether it contains any characters. If the I/O buffer is empty the cassette motor is turned on and the header located ([72E9H](#72e9h)). Two hundred and fifty-six characters are then read in ([72D4H](#72d4h)), the cassette motor turned off via the [TAPION](#tapion) standard routine and the I/O buffer position reset to zero. The character is then taken from the current I/O buffer position and the position incremented. Finally the character is checked to see if it is the end of file character (1AH). If it is not the routine terminates with the character in register A and FLAG NC. Otherwise the end of file character is placed in [CASPRV](#casprv), so that succeeding sequential input requests will always return the end of file condition, and the routine terminates with FLAG C.

<a name="726dh"></a>

    Address... 726DH

This is the dispatcher eof routine for the CAS device. The next character is input ([723FH](#723fh)) and placed in [CASPRV](#casprv). It is then tested for the end of file code (1AH) and the result placed in [DAC](#dac) as an integer, zero for false, FFFFH for true.

<a name="727ch"></a>

    Address... 727CH

This is the dispatcher putback routine for the CAS device. The character is simply placed in [CASPRV](#casprv) to be picked up at the next sequential input request.

<a name="7281h"></a>

    Address... 7281H

This routine is used by the dispatcher close function to check if there are any characters in the I/O buffer and then zero the I/O buffer position byte in the FCB.

<a name="728bh"></a>

    Address... 728BH

This routine is used by the dispatcher sequential output function to place the character in register A in the I/O buffer at the current I/O buffer position, which is then incremented.

<a name="729bh"></a>

    Address... 729BH

This routine is used by the dispatcher sequential input function to collect the character at the current I/O buffer position, which is then incremented.

<a name="72a6h"></a>

    Address... 72A6H

This table is used by the dispatcher when decoding function codes for the LPT device. It contains the address of the handler for each of the function codes, most are in fact error generators:

|TO     |FUNCTION
|-------|---------------------
|71B6H  | 0, open
|71C2H  | 2, close
|6E86H  | 4, random
|72BAH  | 6, sequential output
|475AH  | 8, sequential input
|475AH  |10, loc
|475AH  |12, lof
|475AH  |14, eof
|475AH  |16, fpos
|475AH  |18, putback

</a>

<a name="72bah"></a>

    Address... 72BAH

This is the dispatcher sequential output routine for the LPT device. The character to output is taken from register C and control transfers to the [OUTDLP](#outdlp) standard routine.

<a name="72beh"></a>

    Address... 72BEH

This routine is used by the dispatcher sequential input function to check if a putback character exists in [CASPRV](#casprv), and if not to return Flag Z. Otherwise [CASPRV](#casprv) is zeroed and the character tested to see if it is the end of file character (1AH). If not it returns with the character in register A and FLAG NZ,NC. Otherwise the end of file character is placed back in [CASPRV](#casprv) and the routine returns with FLAG Z,C.

<a name="72cdh"></a>

    Address... 72CDH

This routine is used by various dispatcher functions to check if the mode in register E is append, if so a "`Bad file name`" error is generated ([6E6BH](#6e6bh)).

<a name="72d4h"></a>

    Address... 72D4H

This routine is used by various dispatcher functions to read a character from the cassette. The character is read via the [TAPIN](#tapin) standard routine and a "`Device I/O error`" generated ([73B2H](#73b2h)) if FLAG C is returned.

<a name="72deh"></a>

    Address... 72DEH

This routine is used by various dispatcher functions to write a character to cassette. The character is written via the [TAPOUT](#tapout) standard routine and a "`Device I/O error`" generated ([73B2H](#73b2h)) if FLAG C is returned.

<a name="72e9h"></a>

    Address... 72E9H

This routine is used by various dispatcher functions to turn the cassette motor on for input. The motor is turned on via the [TAPION](#tapion) standard routine and a "`Device I/O error`" generated ([73B2H](#73b2h)) if FLAG C is returned.

<a name="72f8h"></a>

    Address... 72F8H

This routine is used by various dispatcher functions to turn the cassette motor on for output, control simply transfers to the [TAPOON](#tapoon) standard routine.

<a name="7304h"></a>

    Address... 7304H

This routine is used by the Interpreter Mainloop "`OK`" point, the "`END`" statement handler and the run-clear routine to shut down the printer. [PRTFLG](#prtflg) is first zeroed and then [LPTPOS](#lptpos) tested to see if any characters have been output but left hanging in the printer's line buffer. If so a CR,LF sequence is issued to flush the printer and [LPTPOS](#lptpos) zeroed.

<a name="7323h"></a>

    Address... 7323H

This routine issues a CR,LF sequence to the current output device via the [OUTDO](#outdo) standard routine. [LPTPOS](#lptpos) or [TTYPOS](#ttypos) is then zeroed depending upon whether the printer or the screen is active.

<a name="7347h"></a>

    Address... 7347H

This routine is used by the Factor Evaluator to apply the "`INKEY$`" function. The state of the keyboard buffer is examined via the [CHSNS](#chsns) standard routine. If the buffer is empty the address of a dummy null string descriptor is returned in [DAC](#dac). Otherwise the next character is read from the keyboard buffer via the [CHGET](#chget) standard routine. After checking that sufficient space is available (6625H) the character is copied to the String Storage Area and the result descriptor created (6821H).

<a name="7367h"></a>

    Address... 7367H

This routine is used by the "`LIST`" statement handler to output a character to the current output device via the [OUTDO](#outdo) standard routine. If the character is a LF code then a CR code is also issued.

<a name="7374h"></a>

    Address... 7374H

This routine is used by the Interpreter Mainloop to collect a line of text when input is from an I/O buffer rather than the keyboard, that is when a "`LOAD`" statement is active. Characters are sequentially input ([6C71H](#6c71h)) and placed in [BUF](#buf) until [BUF](#buf) fills up, a CR is detected or the end of file is reached. All characters are accepted apart from LF codes which are filtered out. If [BUF](#buf) fills up or a CR is detected the routine simply returns the line to the Mainloop. If the end of file is reached while some characters are in [BUF](#buf) the line is returned to the Mainloop. When end of file is reached with no characters in [BUF](#buf) then I/O buffer 0 is closed (6D7BH) and [FILNAM](#filnam) checked to determine whether auto-run is required. If not control returns to the Interpreter "`OK`" point (411EH). Otherwise the system is cleared ([629AH](#629ah)) and control transfers to the Runloop ([4601H](#4601h)) to execute the program.

<a name="73b2h"></a>

    Address... 73B2H

This is the "`Device I/O error`" generator.

<a name="73b7h"></a><a name="motor"></a>

    Address... 73B7H

This is the "`MOTOR`" statement handler. If no operand is present control transfers to the [STMOTR](#stmotr) standard routine with FFH in register A. If the "`OFF`" token (EBH) follows control transfers with 00H in register A. If the "`ON`" token (95H) follows control transfers with 01H in register A.

<a name="73cah"></a><a name="sound"></a>

    Address... 73CAH

This is the "`SOUND`" statement handler. The register number operand, which must be less than fourteen, is evaluated (521CH) and placed in register A. The data operand is evaluated (521CH) and bit 7 set, bit 6 reset to avoid altering the PSG auxiliary I/O port modes' The data operand is placed in register E and control transfers to the [WRTPSG](#wrtpsg) standard routine.

<a name="73e4h"></a>

    Address... 73E4H

This is a single ASCII space used by the "`PLAY`" statement handler to replace a null string operand with a one character blank string.

<a name="73e5h"></a><a name="play"></a>

    Address... 73E5H

This is the "`PLAY`" statement handler. The address of the "`PLAY`" command table at 752EH is placed in [MCLTAB](#mcltab) for the macro language parser and [PRSCNT](#prscnt) zeroed. The first string operand, which is obligatory, is evaluated ([4C64H](#4c64h)), its storage freed ([67D0H](#67d0h)) and its length and address placed in [VCBA](#vcba) at bytes 2, 3 and 4. The channel's stack pointer is initialized to [VCBA](#vcba)+33 and placed in [VCBA](#vcba) at bytes 5 and 6' If further text is present in the statement this process is repeated for voices B and C until a maximum of three operands have been evaluated, after this a "`Syntax error`" is generated ([4055H](#4055h)). If there are less than three string operands present an end of queue mark (FFH) is placed in the queue ([7507H](#7507h)) of each unused voice. Register A is then zeroed, to select voice A, and control drops into the play mainloop.

<a name="744dh"></a>

    Address... 744DH

This is the play mainloop. The number of free bytes in the current queue is checked ([7521H](#7521h)) and, if less than eight bytes remain, the next voice is selected (74D6H) to avoid waiting for the queue to empty. The remaining length of the operand string is then taken from the current voice buffer and, if zero bytes remain to be parsed, the loop again skips to the next voice (74D6H). Otherwise the current string length and address are taken from the voice buffer and placed in [MCLLEN](#mcllen) and [MCLPTR](#mclptr) for the macro language parser. The old stack contents are copied from the voice buffer to the Z80 stack (6253H), [MCLFLG](#mclflg) is made non-zero and control transfers to the macro language parser ([56A2H](#56a2h)).

The macro language parser will normally scan along the string, using the "`PLAY`" statement command handlers, until the string is exhausted. However, if a music queue fills up during note generation an abnormal termination is forced back to the play mainloop (748EH) so that the next voice can be processed without waiting for the queue to empty. When control returns normally an end of queue mark is placed in the current queue ([7507H](#7507h)) and [PRSCNT](#prscnt) is incremented to show the number of strings completed. If control returns abnormally then anything left on the Z80 stack is copied into the current voice buffer (6253H). Because of the recursive nature of the macro language parser where the "`X`" command is involved there may be a number of four byte string descriptors, marking the point where the original string was suspended, left on the Z80 stack at termination. Saving the stack contents in the voice buffer means they can be restored when the loop gets around to that voice again. Note that as there are only sixteen bytes available in each voice buffer an "`Illegal function call`" error is generated (475AH) if too much data remains on the stack. This will occur when a queue fills up and multiple, nested "X" commands exist, for example:

```
10 A$="XB$;"
20 B$="XC$;"
30 C$="XD$;"
40 D$=STRING$(150,"A")
50 PLAY A$
```

There seems to be a slight bug in this section as only fifteen bytes of stack data are allowed, instead of sixteen, before an error is generated.

When control returns from the macro language parser register A is incremented to select the next voice for processing. When all three voices have been processed [INTFLG](#intflg) is checked and, if CTRL-STOP has been detected by the interrupt handler, control transfers to the [GICINI](#gicini) standard routine to halt all music and terminate. Assuming bit 7 of [PRSCNT](#prscnt) shows this to be the first pass through the mainloop, that is no voice has been temporarily suspended because of a full queue, [PLYCNT](#plycnt) is incremented and interrupt dequeueing started via the [STRTMS](#strtms) standard routine. [PRSCNT](#prscnt) is then checked to determine the number of strings completed by the macro language parser. If all three operand strings have been completed the handler terminates, otherwise control transfers back to the start of the play mainloop to try each voice again.

<a name="7507h"></a>

    Address... 7507H

This routine is used by the "`PLAY`" statement handler to place an end of queue mark (FFH) in the current queue via the [PUTQ](#putq) standard routine. If the queue is full it waits until space becomes available.

<a name="7521h"></a>

    Address... 7521H

This routine is used by the "`PLAY`" statement handler to check how much space remains in the current queue via the [LFTQ](#lftq) standard routine. If less than eight bytes remain (the largest possible music data packet is seven bytes long) FLAG C is returned.

<a name="752eh"></a>

    Address... 752EH

This table contains the valid command letters and associated addresses for the "`PLAY`" statement commands. Those commands which take a parameter, and consequently have bit 7 set in the table, are shown with an asterisk:

|CMD    |TO
|-------|-----
|A      |[763EH](#763eh)
|B      |[763EH](#763eh)
|C      |[763EH](#763eh)
|D      |[763EH](#763eh)
|E      |[763EH](#763eh)
|F      |[763EH](#763eh)
|G      |[763EH](#763eh)
|M\*    |[759EH](#759eh)
|V\*    |[7586H](#7586h)
|S\*    |[75BEH](#75beh)
|N\*    |[7621H](#7621h)
|O\*    |[75EFH](#75efh)
|R\*    |[75FCH](#75fch)
|T\*    |[75E2H](#75e2h)
|L\*    |[75C8H](#75c8h)
|X      |[5782H](#5782h)

</a>

<a name="755fh"></a>

    Address... 755FH

This table is used by the "`PLAY`" statement "`A`" to "`G`" command handler to translate a note number from zero to fourteen to an offset into the tone divider table at 756EH. The note itself, rather than the note number, is shown below with each offset value:

```
16 ... A-
18 ... A
20 ... A+ or B-
22 ... B or C-
00 ... B+
00 ... C
02 ... C+ or D-
04 ... D
06 ... D+ or E-
08 ... E or F-
10 ... E+
10 ... F
12 ... F+ or G-
14 ... G
16 ... G+
```

</a>

<a name="756eh"></a>

    Address... 756EH

This table contains the twelve PSG divider constants required to produce the tones of octave 1. For each constant the corresponding note and frequency are shown:

```
3421 ... C  32.698 Hz
3228 ... C+ 34.653 Hz
3047 ... D  36.712 Hz
2876 ... D+ 38.895 HZ
2715 ... E  41.201 Hz
2562 ... F  43.662 Hz
2419 ... F+ 46.243 Hz
2283 ... G  48.997 Hz
2155 ... G+ 51.908 Hz
2034 ... A  54.995 Hz
1920 ... A+ 58.261 Hz
1812 ... B  61.773 Hz
```

</a>

<a name="7586h"></a>

    Address... 7586H

This is the "`PLAY`" statement "`V`" command handler. The parameter, with a default value of eight, is placed in byte 18 of the current voice buffer without altering bit 6 of the existing contents. No music data is generated.

<a name="759eh"></a>

    Address... 759EH

This is the "`PLAY`" statement "`M`" command handler. The parameter, with a default value of two hundred and fifty-five, is compared with the existing modulation period contained in bytes 19 and 20 of the current voice buffer. If they are the same the routine terminates with no action. Otherwise the new modulation period is placed in the voice buffer and bit 6 set in byte 18 of the voice buffer to indicate that the new value must be incorporated into the next music data packet produced. No music data is generated.

<a name="75beh"></a>

    Address... 75BEH

This is the "`PLAY`" statement "`S`" command handler. The parameter is placed in byte 18 of the current voice buffer and bit 4 of the same byte set to indicate that the new value must be incorporated into the next music data packet produced. No music data is generated. Because of the PSG characteristics the shape and volume parameters are mutually exclusive so the same byte of the voice buffers is used for both.

<a name="75c8h"></a>

    Address... 75C8H

This is the "`PLAY`" statement "`L`" command handler. The parameter, with a default value of four, is placed in byte 16 of the current voice buffer where it is used in the computation of succeeding note durations. No music data is generated.

<a name="75e2h"></a>

    Address... 75E2H

This is the "`PLAY`" statement "`T`" command handler. The parameter, with a default value of one hundred and twenty, is placed in byte 17 of the current voice buffer where it will be used in the computation of succeeding note durations. ho music data is generated.

<a name="75efh"></a>

    Address... 75EFH

This is the "`PLAY`" statement "`O`" command handler. The parameter, with a default value of four, is placed in byte 15 of the current voice buffer where it is used in the computation of succeeding note frequencies. No music data is generated.

<a name="75fch"></a>

    Address... 75FCH

This is the "`PLAY`" statement "`R`" command handler. The length parameter, with a default value of four, is left in register pair DE and a zero tone divider value placed in register pair HL. The existing volume value is taken from byte 18 of the current voice buffer, temporarily replaced with a zero value and control transferred to the note generator (769CH).

<a name="7621h"></a>

    Address... 7621H

This is the "`PLAY`" statement "`N`" command handler. The obligatory parameter is first examined, if it is zero a rest is generated (760BH). If it is greater than ninety-six an "`Illegal function call`" error is generated (475AH). Otherwise twelve is repeatedly subtracted from the note number until underflow to obtain an octave number from one to nine in register E and a note number from zero to eleven in register C. Control then transfers to the note generator (7673H).

<a name="763eh"></a>

    Address... 763EH

This is the "`PLAY`" statement "`A`" to "`G`" command handler. The note letter is first converted into a note number from zero to fourteen, this extended range being necessary because of the redundancy implicit in the notation. The table at 755FH is then used to obtain the offset into the tone divider table and the divider constant for the note placed in register pair DE. The octave value is taken from byte 15 of the current voice buffer and the divider constant halved until the correct octave is reached. The string operand is then examined directly ([56EEH](#56eeh)) to determine whether a trailing note length parameter exists. If so it is converted (572FH) and placed in register C. If no parameter exists the default length is taken from byte 16 of the current voice buffer. The duration of the note is then computed from:

    Duration (Interrupt ticks) = 12,000/(LENGTH*TEMPO)

With the normal length value (4) and tempo value (120) this gives a note duration of twenty-five interrupt ticks of 20 ms each or 0.5 seconds. The string operand is then examined ([56EEH](#56eeh)) for trailing "`.`" characters and, for each one, the duration multiplied by one and a half. Finally the resulting duration is checked and, if it is less than five interrupt ticks, it is replaced with a value of five. Thus the shortest note that can be generated on a UK machine is 0.10 seconds whatever the tempo or note length.

The music data packet, which will be three, five or seven bytes long, is then assembled in bytes 8 to 14 of the current voice buffer prior to placing it in the queue. The duration is placed in bytes 8 and 9 of the voice buffer. The volume and flag byte is taken from byte 18 and placed in byte 10 of the voice buffer with bit 7 set to indicate a volume change to the interrupt dequeuing routine. If bit 6 of the volume byte is set then the modulation period is taken from bytes 19 and 20 and added to the data packet at bytes 11 and 12. If the tone divider value is non-zero then it is added to the data packet at bytes 11 and 12 (without a modulation period) or bytes 13 and 14 (with a modulation period). Finally the byte count is mixed into the three highest bits of byte 8 of the voice buffer to complete the preparation of the music data packet.

If the tone divider value is zero, indicating a rest, the contents of [SAVVOL](#savvol) are restored to byte 18 of the static buffer. The music data packet is then placed in the current queue via the [PUTQ](#putq) standard routine and the number of free bytes remaining checked ([7521H](#7521h)). If less than eight bytes remain control transfers directly to the "`PLAY`" statement handler (748EH), otherwise control returns normally to the macro language parser.

<a name="7754h"></a>

    Address... 7754H

This is the single precision constant 12,000 used in the computation of note duration.

<a name="7758h"></a><a name="put"></a>

    Address... 7758H

This is the "`PUT`" statement handler. Register B is set to 80H and control drops into the "`GET`" statement handler.

<a name="775bh"></a><a name="get"></a>

    Address... 775BH

This is the "`GET`" statement handler. Register B is zeroed, to distinguish "`GET`" from "`PUT`" and the next program token examined. Control then transfers to the "`PUT SPRITE`" statement handler ([7AAFH](#7aafh)) or the Disk BASIC "`GET/PUT`" statement handler ([6C35H](#6c35h)).

<a name="7766h"></a><a name="locate"></a>

    Address... 7766H

This is the "`LOCATE`" statement handler. If a column coordinate is present it is evaluated (521CH) and placed in register D, otherwise the current column is taken from [CSRX](#csrx). If a row coordinate is present it is evaluated (521CH) and placed in register E, otherwise the current row is taken from [CSRY](#csry). If a cursor switch operand exists it is evaluated (521CH) and register A loaded with 78H for a zero operand (OFF) and 79H for any non-zero operand (ON). The cursor is then switched by outputting ESC, 78H/79H, "`5`" via the [OUTDO](#outdo) standard routine. The row and column coordinates are placed in register pair HL and the cursor position set via the [POSIT](#posit) standard routine.

<a name="77a5h"></a>

    Address... 77A5H

This is the "`STOP ON/OFF/STOP`" statement handler. The address of the device's [TRPTBL](#trptbl) status byte is placed in register pair HL and control transfers to the "`ON/OFF/STOP`" routine (77CFH).

<a name="77abh"></a>

    Address... 77ABH

This is the "`SPRITE ON/OFF/STOP`" statement handler. The address of the device's [TRPTBL](#trptbl) status byte is placed in register pair HL and control transfers to the "`ON/OFF/STOP`" routine (77CFH).

<a name="77b1h"></a>

    Address... 77B1H

This is the "`INTERVAL ON/OFF/STOP`" statement handler. As there is no specific "`INTERVAL`" token (control transfers here when an "`INT`" token is found) a check is first made on the program text for the characters "`E`" and "`R`" then the "`VAL`" token (94H). The address of the device's [TRPTBL](#trptbl) status byte is placed in register pair HL and control transfers to the "`ON/OFF/STOP`" routine (77CFH).

<a name="77bfh"></a>

    Address... 77BFH

This is the "`STRIG ON/OFF/STOP`" statement handler. The trigger number, from zero to four, is evaluated ([7C08H](#7c08h)) and the address of the device's [TRPTBL](#trptbl) status byte placed in register pair HL. The "`ON/OFF/STOP`" token is examined and the [TRPTBL](#trptbl) status byte modified accordingly (77FEH). Control then transfers directly to the Runloop (4612H) to avoid testing for pending interrupts until the end of the next statement.

<a name="77d4h"></a>

    Address... 77D4H

This is the "`KEY(n) ON/OFF/STOP`" statement handler. The key number, from one to ten, is evaluated (521CH) and the address of the devices' [TRPTBL](#trptbl) status byte placed in register pair HL. The "`ON/OFF/STOP`" token is examined and the [TRPTBL](#trptbl) status byte modified accordingly (77FEH). Bit 0 of the [TRPTBL](#trptbl) status byte, the ON bit, is then copied into the corresponding entry in [FNKFLG](#fnkflg) for use during the interrupt keyscan and control transfers directly to the Runloop (4612H).

<a name="77feh"></a>

    Address... 77FEH

This routine checks for the presence of one of the interrupt switching tokens and transfers control to the appropriate routine: "`ON`" ([631BH](#631bh)), "`OFF`" (632BH) or "`STOP`" ([6331H](#6331h)). If no token is present a "`Syntax error`" is generated (4055H).

<a name="7810h"></a>

    Address... 7810H

This routine is used by the "`ON DEVICE GOSUB`" statement handler ([490DH](#490dh)) to check the program text for a device token. Unless none of the device tokens is present, in which case Flag C is returned, the device's [TRPTBL](#trptbl) entry number is returned in register B and the maximum allowable line number operand count in register C:

|DEVICE     |TRPTBL#    |LINE NUMBERS
|-----------|-----------|------------
|KEY        |00         |10
|STOP       |10         |01
|SPRITE     |11         |01
|STRIG      |12         |05
|INTERVAL   |17         |01

Additionally, for "`INTERVAL`" only, the interval operand is evaluated ([542FH](#542fh)) and placed in [INTVAL](#intval) and [INTCNT](#intcnt).

<a name="785ch"></a>

    Address... 785CH

This routine is used by the "`ON DEVICE GOSUB`" statement handler ([490DH](#490dh)) to place the address of a program line in [TRPTBL](#trptbl). The [TRPTBL](#trptbl) entry number, supplied in register B, is multiplied by three and added to the table base to point to the relevant entry. The address, supplied in register pair DE, is then placed there LSB first, MSB second.

<a name="786ch"></a><a name="key"></a>

    Address... 786CH

This is the "`KEY`" statement handler. If the following character is anything other than the "`LIST`" token (93H) control transfers to the "`KEY n`" statement handler ([78AEH](#78aeh)). Each of the ten function key strings is then taken from [FNKSTR](#fnkstr) and displayed via the [OUTDO](#outdo) standard routine with a CR,LF (7328H) after each one. The DEL character (7FH) or any control character smaller than 20H is replaced with a space.

<a name="78aeh"></a>

    Address... 78AEH

This is the "`KEY n`", "`KEY(n) ON/OFF/STOP`", "`KEY ON`" and "`KEY OFF`" statement handler. If the next program text character is "(" control transfers to the "`KEY(n) ON/OFF/STOP`" statement handler ([77D4H](#77d4h)). If it is an "`ON`" token (95H) control transfers to the [DSPFNK](#dspfnk) standard routine and if it is an "`OFF`" token (EBH) to the [ERAFNK](#erafnk) standard routine. Otherwise the function key number is evaluated (521CH) and the key's [FNKSTR](#fnkstr) address placed in register pair DE' The string operand is evaluated ([4C64H](#4c64h)) and its storage freed ([67D0H](#67d0h))' Up to fifteen characters are copied from the string to [FNKSTR](#fnkstr) and unused positions padded with zero bytes. If a zero byte is found in the operand string an "`Illegal function call`" error is generated (475AH). Control then transfers to the [FNKSB](#fnksb) standard routine to update the function key display if it is enabled.

<a name="7900h"></a>

    Address... 7900H

This routine is used by the Factor Evaluator to apply the "`TIME`" function. The contents of [JIFFY](#jiffy) are placed in [DAC](#dac) as a single precision number (3236H).

<a name="790ah"></a>

    Address... 790AH

This routine is used by the Factor Evaluator to apply the "`CSRLIN`" function. The contents of [CSRY](#csry) are decremented and placed in [DAC](#dac) as an integer (2E9AH).

<a name="7911h"></a><a name="time"></a>

    Address... 7911H

This is the "`TIME`" statement handler. The operand is evaluated (542FH) and placed in [JIFFY](#jiffy).

<a name="791bh"></a>

    Address... 791BH

This routine is used by the Factor Evaluator to apply the "`PLAY`" function. The numeric channel selection operand is evaluated ([7C08H](#7c08h)). If this is zero the contents of [MUSICF](#musicf) are placed in [DAC](#dac) as an integer of value zero or FFFFH. Otherwise the channel number is used to select the appropriate bit of [MUSICF](#musicf) and this is then converted to an integer as before.

<a name="7940h"></a>

    Address... 7940H

This routine is used by the Factor Evaluator to apply the "`STICK`" function to an operand contained in [DAC](#dac). The stick number is checked (521FH) and passed to the [GTSTCK](#gtstck) standard routine in register A. The result is placed in [DAC](#dac) as an integer (4FCFH ) .

<a name="794ch"></a>

    Address... 794CH

This routine is used by the Factor Evaluator to apply the "`STRIG`" function to an operand contained in [DAC](#dac). The trigger number is checked (521FH) and passed to the [GTTRIG](#gttrig) standard routine in register A. The result is placed in [DAC](#dac) as an integer of value zero or FFFFH.

<a name="795ah"></a>

    Address... 795AH

This routine is used by the Factor Evaluator to apply the "`PDL`" function to an operand contained in [DAC](#dac). The paddle number is checked (521FH) and passed to the [GTPDL](#gtpdl) standard routine in register A. The result is placed in [DAC](#dac) as an integer (4FCFH).

<a name="7969h"></a>

    Address... 7969H

This routine is used by the Factor Evaluator to apply the "`PAD`" function to an operand contained in [DAC](#dac). The pad number is checked (521F) and passed to the [GTPAD](#gtpad) standard routine in register A. The result is placed in [DAC](#dac) as an integer for pads 1, 2, 5 or 6. For pads 0, 3, 4 or 7 the result is placed in [DAC](#dac) as an integer of value zero or FFFFH.

<a name="7980h"></a><a name="color"></a>

    Address... 7980H

This is the "`COLOR`" statement handler. If a foreground colour operand exists it is evaluated (521CH) and placed in register E, otherwise the current foreground colour is taken from [FORCLR](#forclr). If a background colour operand exists it is evaluated (521CH) and placed in register D, otherwise the current background colour is taken from [BAKCLR](#bakclr). If a border colour operand exists it is evaluated (521CH) and placed in [BDRCLR](#bdrclr). The foreground colour is placed in [FORCLR](#forclr) and [ATRBYT](#atrbyt), the background colour in [BAKCLR](#bakclr) and control transfers to the [CHGCLR](#chgclr) standard routine to modify the VDP.

<a name="79cch"></a><a name="screen"></a>

    Address... 79CCH

This is the "`SCREEN`" statement handler. If a mode operand exists it is evaluated (521CH) and passed to the [CHGMOD](#chgmod) standard routine in register A. If a sprite size operand exists it is evaluated (521CH) and placed in bits 0 and 1 of [RG1SAV](#rg1sav), the Workspace Area copy of VDP [Mode Register 1](#mode_register_1). The VDP sprite parameters are then cleared via the [CLRSPR](#clrspr) standard routine. If a key click operand exists it is evaluated (521CH) and placed in [CLIKSW](#cliksw), zero to disable the click and non-zero to enable it. If a baud rate operand exists it is evaluated and the baud rate set ([7A2DH](#7a2dh)). If a printer mode operand exists it is evaluated (521CH) and placed in [NTMSXP](#ntmsxp), zero for an MSX printer and non- zero for a general purpose printer.

<a name="7a2dh"></a>

    Address... 7A2DH

This routine is used to set the cassette baud rate. The operand is evaluated (521CH) and five bytes copied from [CS1200](#cs1200) or [CS2400](#cs2400) to [LOW](#low) as appropriate.

<a name="7a48h"></a><a name="sprite"></a>

    Address... 7A48H

This is the "`SPRITE`" statement handler. If the next character is anything other than a "$" control transfers to the "`SPRITE ON/OFF/STOP`" statement handler ([77ABH](#77abh)). [SCRMOD](#scrmod) is then checked and an "`Illegal function call`" error generated (475AH) if the screen is in [40x24 Text Mode](#40x24_text_mode). The sprite pattern number is evaluated and its location in the VRAM Sprite Pattern Table obtained (7AA0H). The string operand is then evaluated ([4C5FH](#4c5fh)) and its storage freed ([67D0H](#67d0h)). The sprite size, obtained via the [GSPSIZ](#gspsiz) standard routine, is compared with the string length and, if the string is shorter than the sprite, the Sprite Pattern Table entry is first filled with zeroes via the [FILVRM](#filvrm) standard routine. Characters are then copied from the string body to the Sprite Pattern Table via the [LDIRVM](#ldirvm) standard routine until the string is exhausted or the sprite is full. If the string is longer than the sprite size any excess characters are ignored.

    Address... 7A84H

This routine is used by the Factor Evaluator to apply the "`SPRITE$`" function. The sprite pattern number is evaluated and its location in the VRAM Sprite Pattern Table obtained ([7A9FH](#7a9fh)). The sprite size, obtained via the [GSPSIZ](#gspsiz) standard routine, is then placed in register pair BC to control the number of bytes copied. After checking that sufficient space is available in the String Storage Area ([6627H](#6627h)) the sprite pattern is copied from VRAM via the [LDIRMV](#ldirmv) standard routine and the result descriptor created ([6654H](#6654h)). Note that as no check is made on the screen mode during this function some interesting side effects can be found, see below.

<a name="7a9fh"></a>

    Address... 7A9FH

This routine is used by the "`SPRITE$`" statement and function to locate a sprite pattern in the VRAM Sprite Pattern Table. The pattern number operand is evaluated ([7C08H](#7c08h)) and passed to the [CALPAT](#calpat) standard routine in register A. The pattern address is placed in register pair DE and the routine terminates.

Note that no check is made on the pattern number magnitude for differing sprite sizes. Pattern numbers up to two hundred and fifty-five are accepted even in 16x16 sprite mode when the maximum pattern number should be sixty-three. As a result VRAM addresses greater than 3FFFH will be produced which will wrap around into low VRAM. With the "`SPRITE$`" statement this will corrupt the Character Generator Table, for example:

```
10 SCREEN 3,2
20 SPRITE$(0)=STRING$(32,255)
30 PUT SPRITE 0,(0,0), ,0
40 SPRITE$(65)=STRING$(32,255)
50 GOTO 50
```

The above puts a real sprite in the top left of the screen and then uses an illegal statement in line 40 to corrupt the VRAM just to the right of it. The "`SPRITE$`" function can also be manipulated in this way and, as there is no screen mode check, up to thirty-two bytes of the Name Table can be read in [40x24 Text Mode](#40x24_text_mode), for example:

```
10 SCREEN 0,2
20 PRINT"something"
30 A$=SPRITE$(64)
40 PRINT A$
```

</a>

<a name="7aafh"></a><a name="put_sprite"></a>

    Address... 7AAFH

This is the "`GET/PUT SPRITE`" statement handler, control is transferred here from the general "`GET/PUT`" statement handler ([775BH](#775bh)). Register B is first checked to make sure that the statement is "`PUT`" and an "`Illegal function call`" error generated (475AH) if otherwise. [SCRMOD](#scrmod) is then checked and an "`Illegal function call`" error generated (475AH) if the screen is in [40x24 Text Mode](#40x24_text_mode). The sprite number operand, from zero to thirty-one, is evaluated (521CH) and passed to the [CALATR](#calatr) standard routine to locate the four byte attribute block in the Sprite Attribute Table. If a coordinate operand exists it is evaluated and the X coordinate placed in register pair BC, the Y coordinate in register pair DE ([579CH](#579ch)).

The Y coordinate LSB is written to byte 0 of the attribute block in VRAM via the [WRTVRM](#wrtvrm) standard routine. Bit 7 of the X coordinate is then examined to determine whether it is negative, that is off the left hand side of the screen. If so thirty two is added to the X coordinate and register B is set to 80H to set the early clock bit in the attribute block. For example an X coordinate of -1 (FFFFH) would be changed to +31 with an early clock. The X coordinate LSB is then written to byte 1 of the attribute block via the [WRTVRM](#wrtvrm) standard routine. Byte 3 of the attribute block is read in via the [RDVRM](#rdvrm) standard routine, the new early clock bit is mixed in and it is then written back to VRAM via the [WRTVRM](#wrtvrm) standard routine.

If a colour operand is present it is evaluated (521CH), byte 3 of the attribute block is read in via the [RDVRM](#rdvrm) standard routine the new colour code is mixed into the lowest four bits and it is written back to VRAM via the [WRTVRM](#wrtvrm) standard routine. If a pattern number operand exists it is evaluated (521CH) and checked for magnitude against the current sprite size provided by the [GSPSIZ](#gspsiz) standard routine. The maximum allowable pattern number is two hundred and fifty-five for 8x8 sprites and sixty- three for 16x16 sprites. The pattern number is written to byte 2 of the attribute block via the [WRTVRM](#wrtvrm) standard routine and the handler terminates.

<a name="7b37h"></a>

    Address... 7B37H

This is the "`VDP`" statement handler. The register number operand, from zero to seven, is evaluated ([7C08H](#7c08h)) followed by the data operand (521CH). The register number is placed in register C, the data value in register B and control transferred to the [WRTVDP](#wrtvdp) standard routine.

<a name="7b47h"></a>

    Address... 7B47H

This routine is used by the Factor Evaluator to apply the "`VDP`" function. The register number operand, from zero to eight, is evaluated ([7C08H](#7c08h)) and added to [RG0SAV](#rg0sav) to locate the corresponding register image in the Workspace Area. The VDP register image is then read and placed in [DAC](#dac) as an integer (4FCFH).

<a name="7b5ah"></a><a name="base"></a>

    Address... 7B5AH

This is the "`BASE`" statement handler. The VDP table number operand, from zero to nineteen, is evaluated ([7C08H](#7c08h)) followed by the base address operand ([4C64H](#4c64h)). After checking that the base address is less than 4000H ([7BFEH](#7bfeh)) the VDP table number is used to locate the associated entry in the masking table at 7BA3H. The base address is ANDed with the mask and an "`Illegal function call`" error generated (475AH) if any illegal bits are set. The VDP table number is then added to [TXTNAM](#txtnam) to locate the current base address in the Workspace Area and the new base address placed there. The VDP table number is divided by five to determine which of the four screen modes the table belongs to. If this is the same as the current screen mode the new base address is also written to the VDP ([7B99H](#7b99h)).

<a name="7b99h"></a>

    Address... 7B99H

This routine is used by the "`BASE`" statement handler to update the VDP base addresses. The current screen mode, in register A, is examined and control transfers to the [SETTXT](#settxt), [SETT32](#sett32), [SETGRP](#setgrp) or [SETMLT](#setmlt) standard routine as appropriate. Note that this is not a full VDP initialization and that the four current table addresses ([NAMBAS](#nambas), [CGPBAS](#cgpbas), [PATBAS](#patbas) and [ATRBAS](#atrbas)) which are the ones actually used by the screen routines, are not updated. This can be demonstrated with the following, where the Interpreter carries on outputting to the old VRAM Name Table:

```
10 SCREEN 0
20 BASE(0)=&H400
30 PRINT"something"
40 FOR N=1 TO 2000:NEXT
50 BASE(0)=0
```

Note also that this routine contains a bug. While [SETTXT](#settxt) is correctly used for [40x24 Text Mode](#40x24_text_mode), [SETGRP](#setgrp) is used for [32x24 Text Mode](#32x24_text_mode) and [SETMLT](#setmlt) for [Graphics Mode](#graphics_mode) and [Multicolour Mode](#multicolour_mode). Any "`BASE`" statement should therefore be immediately followed by a "`SCREEN`" statement to perform a full initialization.

<a name="7ba3h"></a>

    Address... 7BA3H

This masking table is used by the "`BASE`" statement handler to ensure that only legal VDP base addresses are accepted. The table number and corresponding Workspace Area variable are shown with each mask:

|MASK   |TABLE
|-------|----------
|03FFH  |00, [TXTNAM](#txtnam)
|003FH  |01, [TXTCOL](#txtcol)
|07FFH  |02, [TXTCGP](#txtcgp)
|007FH  |03, [TXTATR](#txtatr)
|07FFH  |04, [TXTPAT](#txtpat)
|03FFH  |05, [T32NAM](#t32nam)
|003FH  |06, [T32COL](#t32col)
|07FFH  |07, [T32CGP](#t32cgp)
|007FH  |08, [T32ATR](#t32atr)
|07FFH  |09, [T32PAT](#t32pat)
|03FFH  |10, [GRPNAM](#grpnam)
|1FFFH  |11, [GRPCOL](#grpcol)
|1FFFH  |12, [GRPCGP](#grpcgp)
|007FH  |13, [GRPATR](#grpatr)
|07FFH  |14, [GRPPAT](#grppat)
|03FFH  |15, [MLTNAM](#mltnam)
|003FH  |16, [MLTCOL](#mltcol)
|07FFH  |17, [MLTCGP](#mltcgp)
|007FH  |18, [MLTATR](#mltatr)
|07FFH  |19, [MLTPAT](#mltpat)

</a>

<a name="7bcbh"></a>

    Address... 7BCBH

This routine is used by the Factor Evaluator to apply the "`BASE`" function. The VDP table number operand, from zero to nineteen, is evaluated ([7C08H](#7c08h)) and added to [TXTNAM](#txtnam) to locate the required Workspace Area base address. This is then placed in [DAC](#dac) as a single precision number (3236H).

<a name="7be2h"></a><a name="vpoke"></a>

    Address... 7BE2H

This is the "`VPOKE`" statement handler. The VRAM address operand is evaluated ([4C64H](#4c64h)) and checked to ensure that it is less than 4000H ([7BFEH](#7bfeh)). The data operand is then evaluated (521CH) and passed to the [WRTVRM](#wrtvrm) standard routine in register A to write to the required address.

<a name="7bf5h"></a>

    Address... 7BF5H

This routine is used by the Factor Evaluator to apply the "`VPEEK`" function to an operand contained in [DAC](#dac). The VRAM address operand is checked to ensure it is less than 4000H ([7BFEH](#7bfeh)). VRAM is then read via the [RDVRM](#rdvrm) standard routine and the result placed in [DAC](#dac) as an integer (4FCFH).

<a name="7bfeh"></a>

    Address... 7BFEH

This routine converts a numeric operand in [DAC](#dac) to an integer ([2F8AH](#2f8ah)) and places it in register pair HL. If the operand is equal to or greater than 4000H, and thus outside the allowable VRAM range, an "`Illegal function call`" error is generated (475AH).

<a name="7c08h"></a>

    Address... 7C08H

This routine evaluates (521CH) a parenthesized numeric operand and returns it as an integer in register A. If the operand is greater than the maximum allowable value initially supplied in register A an "`Illegal function call`" error is generated (475AH).

<a name="7c16h"></a><a name="dsko$"></a>

    Address... 7C16H

This is the "`DSKO$`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c1bh"></a><a name="set"></a>

    Address... 7C1BH

This is the "`SET`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c20h"></a><a name="name"></a>

    Address... 7C20H

This is the "`NAME`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c25h"></a><a name="kill"></a>

    Address... 7C25H

This is the "`KILL`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c2ah"></a><a name="ipl"></a>

    Address... 7C2AH

This is the "`IPL`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c2fh"></a><a name="copy"></a>

    Address... 7C2FH

This is the "`COPY`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c34h"></a><a name="cmd"></a>

    Address... 7C34H

This is the "`CMD`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c39h"></a>

    Address... 7C39H

This routine is used by the Factor Evaluator to apply the "`DSKF`" function to an operand contained in [DAC](#dac). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c3eh"></a>

    Address... 7C3EH

This routine is used by the Factor Evaluator to apply the "`DSKI$`" function. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c43h"></a>

    Address... 7C43H

This routine is used by the Factor Evaluator to apply the "`ATTR$`" function. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c48h"></a><a name="lset"></a>

    Address... 7C48H

This is the "`LSET`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c4dh"></a><a name="rset"></a>

    Address... 7C4DH

This is the "`RSET`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c52h"></a><a name="field"></a>

    Address... 7C52H

This is the "`FIELD`" statement handler. An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c57h"></a>

    Address... 7C57H

This routine is used by the Factor Evaluator to apply the "`MKI$`" function to an operand contained in [DAC](#dac). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c5ch"></a>

    Address... 7C5CH

This routine is used by the Factor Evaluator to apply the "`MKS$`" function to an operand contained in [DAC](#dac). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c61h"></a>

    Address... 7C61H

This routine is used by the Factor Evaluator to apply the "`MKD$`" function to an operand contained in [DAC](#dac). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c66h"></a>

    Address... 7C66H

This routine is used by the Factor Evaluator to apply the "`CVI`" function to an operand contained in [DAC](#dac). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c6bh"></a>

    Address... 7C6BH

This routine is used by the Factor Evaluator to apply the "`CVS`" function to an operand contained in [DAC](#dac). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c70h"></a>

    Address... 7C70H

This routine is used by the Factor Evaluator to apply the "`CVD`" function to an operand contained in [DAC](#dac). An "`Illegal function call`" error is generated (475AH) on a standard MSX machine.

<a name="7c76h"></a>

    Address... 7C76H

This routine completes the power-up initialization. At this point the entire Workspace Area is zeroed and only [EXPTBL](#exptbl) and [SLTTBL](#slttbl) have been initialized. A temporary stack is set at F376H and all one hundred and twelve hooks (560 bytes) filled with Z80 RET opcodes (C9H). [HIMEM](#himem) is set to F380H and the lowest RAM location found ([7D5DH](#7d5dh)) and placed in [BOTTOM](#bottom). The one hundred and forty-four bytes of data commencing at 7F27H are copied to the Workspace Area from F380H to F40FH The function key strings are initialized via the [INIFNK](#inifnk) standard routine, [ENDBUF](#endbuf) and [NLONLY](#nlonly) are zeroed and a comma is placed in [BUFMIN](#bufmin) and a colon in [KBFMIN](#kbfmin). The address of the MSX ROM character set is taken from locations 0004H and 0005H and placed in [CGPNT](#cgpnt)+1 and [PRMPRV](#prmprv) is set to point to [PRMSTK](#prmstk). Dummy values are placed in [STKTOP](#stktop), [MEMSIZ](#memsiz) and [VARTAB](#vartab) (their correct values are not known yet), one I/O buffer is allocated ([7E6BH](#7e6bh)) and the Z80 SP set (62E5H). A zero byte is placed at the base of RAM, [TXTTAB](#txttab) is set to the following location and a "`NEW`" executed (6287H).

The VDP is then initialized via the [INITIO](#initio), [INIT32](#init32) and [CLRSPR](#clrspr) standard routines, the cursor coordinates are set to row 11, column 10 and the sign on message "`MSX system etc.`" is displayed ([6678H](#6678h)). After a three second delay a search is carried out for any extension ROMs ([7D75H](#7d75h)) and a further "`NEW`" executed (6287H) in case a BASIC program has been run from ROM.

Finally the identification message "`MSX BASIC etc.`" is displayed ([7D29H](#7d29h)) and control transfers to the Interpreter Mainloop "`OK`" point 411FH.

<a name="7d29h"></a>

    Address... 7D29H

This routine is used during power-up to enable the function key display, place the screen in [40x24 Text Mode](#40x24_text_mode) via the [INITXT](#initxt) standard routine, and display ([6678H](#6678h)) the identification message "`MSX BASIC etc.`". The amount of free memory is then computed by subtracting the contents of [VARTAB](#vartab) from the contents of [STKTOP](#stktop) and displayed ([3412H](#3412h)) followed by the "`Bytes free`" message.

<a name="7d5dh"></a>

    Address... 7D5DH

This routine is used during power-up to find the lowest RAM location. Starting at EF00H each byte is tested until one is found that cannot be written to or an address of 8000H is reached. The base address, rounded upwards to the nearest 256 byte boundary, is returned in register pair HL.

<a name="7d75h"></a>

    Address... 7D75H

This routine is used during power-up to perform an extension ROM search. Pages 1 and 2 (4000H to BFFFH) of each slot are examined and the results placed in [SLTATR](#sltatr). An extension ROM has the two identification characters "`AB`" in the first two bytes to distinguish it from RAM. Information about its properties is also present in the first sixteen bytes as follows:

<a name="figure48"></a>![][CH05F48]

**Figure 48:** ROM Header

Each page in a given slot is examined by reading the first two bytes ([7E1AH](#7e1ah)) and checking for the "`AB`" characters. If a ROM is present the initialization address is read ([7E1AH](#7e1ah)) and control passed to it via the [CALSLT](#calslt) standard routine. With a games ROM there may be no return to BASIC from this point. The "`CALL`" extended statement handler address is then read ([7E1AH](#7e1ah)) and bit 5 of register B set if it is valid, that is non-zero. The extended device handler address is read ([7E1AH](#7e1ah)) and bit 6 of register B set if it is valid. Finally the BASIC program text address is read ([7E1AH](#7e1ah)) and bit 7 of register B set if it is valid. Register B is then copied to the relevant position in [SLTATR](#sltatr) and the search continued until no more slots remain.

[SLTATR](#sltatr) is then examined for any extension ROM flagged as containing BASIC program text. If one is found its position in [SLTATR](#sltatr) is converted to a Slot ID ([7E2AH](#7e2ah)) and the ROM permanently switched in via the [ENASLT](#enaslt) standard routine. [VARTAB](#vartab) is set to C000H, as it is not known how large the Program Text Area is, [TXTTAB](#txttab) is set to 8008H and [BASROM](#basrom) made non-zero to disable the CTRL-STOP key. The system is cleared ([629AH](#629ah)) and control transfers to the Runloop ([4601H](#4601h)) to execute the BASIC program.

<a name="7e1ah"></a>

    Address... 7E1AH

This routine is used to read two bytes from successive locations in an extension ROM. The initial address is supplied in register pair HL and the Slot ID in register C. The bytes are read via the [RDSLT](#rdslt) standard routine and returned in register pair DE. If both are zero FLAG Z is returned.

<a name="7e2ah"></a>

    Address... 7E2AH

This routine converts the [SLTATR](#sltatr) position supplied in register B into the corresponding Slot ID in register C and ROM base address in register H. The position is first modified so that it runs from 0 to 63 rather than from 64 to 1, so that the required information is present in the form:

<a name="figure49"></a>![][CH05F49]

**Figure 49**

Bits 0 and 1 are shifted into the highest two bits of register H to form the address. Bits 4 and 5 are shifted to bits 0 and 1 of register C to form the Primary Slot number. Bits 2 and 3 are shifted to bits 2 and 3 of register C to form the Secondary Slot number and bit 7 of the corresponding [EXPTBL](#exptbl) entry copied to bit 7 of register C.

<a name="7e4bh"></a><a name="maxfiles"></a>

    Address... 7E4BH

This is the "`MAXFILES`" statement handler. As control transfers here when a "`MAX`" token (CDH) is detected the program text is first checked for a trailing "`FILES`" token (B7H). The buffer count operand, from zero to fifteen, is then evaluated (521CH) and any existing buffers closed ([6C1CH](#6c1ch)). The required number of I/O buffers are allocated ([7E6BH](#7e6bh)), the system is cleared (62A7H) and control transfers directly to the Runloop ([4601H](#4601h)).

<a name="7e6bh"></a>

    Address... 7E6BH

This is the I/O buffer allocation routine. It is used during power-up and by the "`MAXFILES`" and "`CLEAR`" statement handlers to allocate storage for the number of I/O buffers supplied in register A. Two hundred and sixty-seven bytes are subtracted from the contents of [HIMEM](#himem) for every buffer to produce a new [MEMSIZ](#memsiz) value. The size of the existing String Storage Area (initially two hundred bytes) is computed by subtracting the old contents of [STKTOP](#stktop) from the old contents of [MEMSIZ](#memsiz), this is then subtracted from the new [MEMSIZ](#memsiz) value to produce the new [STKTOP](#stktop) value. A further one hundred and forty bytes are subtracted for the Z80 stack and an "`Out of memory`" error generated (6275H) if this address is lower than the start of the Variable Storage Area. Otherwise the buffer count is placed in [MAXFIL](#maxfil) and [MEMSIZ](#memsiz) and [STKTOP](#stktop) set to their new values. The caller's return address is popped, the Z80 SP set to the new position and the return address pushed back onto the stack. [FILTAB](#filtab) is then set to the start of the I/O buffer pointer block and each pointer set to point to the associated FCB. Finally the address of I/O buffer 0, the Interpreter's "`LOAD`" and "`SAVE`" buffer, is placed in [NULBUF](#nulbuf) and the routine terminates.

<a name="7ed8h"></a>

    Address... 7ED8H

This is the plain text message "`MSX system`" terminated by a zero byte

<a name="7ee4h"></a>

    Address... 7EE4H

This is the plain text message "`version 1.0`" CR,LF terminated by a zero byte.

<a name="7ef2h"></a>

    Address... 7EF2H

This is the plain text message "`MSX BASIC`" terminated by a zero byte.

<a name="7efdh"></a>

    Address... 7EFDH

This is the plain text message "`Copyright 1983 by Microsoft`" CR,LF terminated by a zero byte.

<a name="7f1bh"></a>

    Address... 7F1BH

This is the plain text message "`Bytes free`" terminated by a zero byte.

<a name="7f27h"></a>

    Address... 7F27H

This block of one hundred and forty-four data bytes is used to initialize the Workspace Area from F380H to F40FH.

<a name="7fb7h"></a>

    Address... 7FB7H

This seven byte patch fixes a bug in the external device parsing routine ([55F8H](#55f8h)). It checks for a zero length device name in register A and changes it to one if necessary.

<a name="7fbeh"></a>

    Address... 7FBEH

This section of the ROM is unused and filled with zero bytes.
