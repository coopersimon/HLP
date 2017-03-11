# ARMv4
This contains the functions that represent the ARM v4 instruction set.

## Dependencies
Exists in namespace **Interpret**.

This module depends on **Common.State** and **Parse.Tokeniser**.

## General Interface
All instructions should take in multiple arguments. It varies by instruction. The **final** argument should always be a *StateHandle*. **The output type is always a *StateHandle*.**

Most instructions have 2 versions one that takes a literal as operand 2 (function ends with I) and another that takes a register (can be shifted or rotated) as operand 2 (function ends with R).

The remaining arguments should include a condition, of type *(StateHandle -> bool)*. Many instructions contain some of the following arguments:

* **register**: *int* - registers inside **state** to access or modify.
* **int literal**: *int* - integer literals used to modify registers in **state**.
* **extra conditions**: *bool* - such as 'S', these do extra side-effects like modify flags in **state**.

### Flexible Operand 2

#### shift[I|R]

inst:*Token* -> r:*int* -> [(n:*int*)|(rn:*int*)] -> state:*StateHandle* -> output:*int*

Evaluates final value of operand 2 after *n* or value in register *rn* is shifted or rotated depending on *inst*. 

#### shiftSetC[I|R]

s:*bool* -> inst:*Token* -> r:*int* -> (n:*int*) OR (rn:*int*) -> state:*StateHandle* -> output:*StateHandle*

Modifies flag C when evaluating operand 2 (depends on *inst*). 

### Updating Flags

#### setNZ

result:*int* -> state:*StateHandle* -> output:*StateHandle*

Modifies flags N and Z depending on *result*. 

#### set[C|V]

in1:*int64* -> in2:*int64* -> state:*StateHandle* -> output:*StateHandle*

Modifies flag [C|V] depending on *in1* and *in2*. Used for arithmetic ADD, ADC, SUB, SBC, RSB and RSC instructions. 

### Instructions

*Operand2* is literal *i* or value in register *rm* after shift or rotate.

#### MOV and MVN

**I version** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> i:*int* -> state:*StateHandle* -> output:*StateHandle*

**R version** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rm:*int* -> rsinst:*Token* -> nORrn:*int* -> rstype:*char* -> state:*StateHandle* -> output:*StateHandle*

**mov[I|R]** - 
Copies the value of *Operand2* into *rd*

**mvn[I|R]** - 
Takes the value of *Operand2*, performs a bitwise logical NOT operation on the value, and places the result into *rd*.

**Condition flags** - 
If *s* is true, these functions update the N and Z flags according to the result, can update the C flag during the calculation of *Operand2* and do not affect the V flag.

#### ADD, ADC, SUB, SBC, RSB and RSC

**I version** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rn:*int* -> i:*int* -> state:*StateHandle* -> output:*StateHandle*

**R version** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rn:*int* -> rm:*int* -> rsinst:*Token* -> nORrn:*int* -> rstype:*char* -> state:*StateHandle* -> output:*StateHandle*

**add[I|R]** - 
Adds the values in *rn* and *Operand2*.

**sub[I|R]** - 
Subtracts the value of *Operand2* from the value in *rn*.

**rsb[I|R]** - 
Subtracts the value in *rn* from the value of *Operand2*. 

**adc[I|R]** - 
Adds the values in *rn* and *Operand2*, together with the carry flag.

**sbc[I|R]** - 
Subtracts the value of *Operand2* from the value in *rn*. If the carry flag is clear, the result is reduced by one.

**rsc[I|R]** - Subtracts the value in *rn* from the value of *Operand2*. If the carry flag is clear, the result is reduced by one.

**Condition flags** - 
If *s* is true, these functions update the N, Z, C and V flags according to the result.

#### CMP and CMN

**I version** - 
c:*StateHandle->bool* -> rn:*int* -> i:*int* -> state:*StateHandle* -> output:*StateHandle*

**R version** - 
c:*StateHandle->bool* -> rn:*int* -> rm:*int* -> rsinst:*Token* -> nORrn:*int* -> rstype:*char* -> state:*StateHandle* -> output:*StateHandle*

**cmp[I|R]** - 
Subtracts the value of *Operand2* from the value in *rn*. This is the same as a SUBS instruction, except that the result is discarded.

**cmn[I|R]** - 
Adds the value of *Operand2* to the value in *rn*. This is the same as an ADDS instruction, except that the result is discarded.

**Condition flags** - 
These functions update the N, Z, C and V flags according to the result.

#### MUL and MLA

**mulR** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rm:*int* -> rs:*int* -> state:*StateHandle* -> output:*StateHandle*

**mulR** - 
Multiplies the values from *rm* and *rs*, and places the least significant 32 bits of the result in *rd*.

**mlaR** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rm:*int* -> rs:*int* -> rm:*int* -> state:*StateHandle* -> output:*StateHandle*

**mlaR** - 
Multiplies the values from *rm* and *rs*, adds the value from *rn*, and places the least significant 32 bits of the result in *rd*.

**Condition flags** - 
If *s* is true, these functions update the N and Z flags according to the result, and do not affect the C and V flags.

#### AND, ORR, EOR and BIC

**I version** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rn:*int* -> i:*int* -> state:*StateHandle* -> output:*StateHandle*

**R version** - 
c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rn:*int* -> rm:*int* -> rsinst:*Token* -> nORrn:*int* -> rstype:*char* -> state:*StateHandle* -> output:*StateHandle*

**and[I|R]** - 
Performs bitwise AND on the values in *rn* and *Operand2*

**orr[I|R]** - 
Performs bitwise OR on the values in *rn* and *Operand2*

**eor[I|R]** - 
Performs bitwise XOR on the values in *rn* and *Operand2*

**bic[I|R]** - 
Performs an AND operation on the bits in *rn* with the complements of the corresponding bits in the value of *Operand2*.

**Condition flags** - 
If *s* is true, these functions update the N and Z flags according to the result, can update the C flag during the calculation of *Operand2* and do not affect the V flag.

#### TST and TEQ

**I version** - 
c:*StateHandle->bool* -> rn:*int* -> i:*int* -> state:*StateHandle* -> output:*StateHandle*

**R version** - 
c:*StateHandle->bool* -> rn:*int* -> rm:*int* -> rsinst:*Token* -> nORrn:*int* -> rstype:*char* -> state:*StateHandle* -> output:*StateHandle*

**tst[I|R]** - 
Performs a bitwise AND operation on the value in *rn* and the value of *Operand2*. This is the same as a ANDS instruction, except that the result is discarded.

**teq[I|R]** - 
Performs a bitwise Exclusive OR operation on the value in *rn* and the value of *Operand2*. This is the same as a EORS instruction, except that the result is discarded.

**Condition flags** - 
These functions update the N and Z flags according to the result, can update the C flag during the calculation of *Operand2* and do not affect the V flag.

#### CLZ

c:*StateHandle->bool* -> rd:*int* -> rm:*int* -> state:*StateHandle* -> output:*StateHandle*

**clzR** - 
Counts the number of leading zeroes in the value in *rm* and returns the result in *rd*. 

**Condition flags** - 
This instruction does not affect the flags.

#### LSL, LSR, ASR, ROR and RRX

c:*StateHandle->bool* -> s:*bool* -> rd:*int* -> rm:*int* -> rn:*int* -> state:*StateHandle* -> output:*StateHandle*

Where n is value in *rn*:

**lslR** - Logical shift left by n bits multiplies the value contained in *rm* by 2n, if the contents are regarded as an unsigned integer. Overflow may occur without warning. The right-hand n bits of the register are set to 0.

**lsrR** - Logical shift right by n bits divides the value contained in *rm* by 2^n, if the contents are regarded as an unsigned integer. The left-hand n bits of the register are set to 0.

**asrR** - Arithmetic shift right by n bits divides the value contained in *rm* by 2^n, if the contents are regarded as a two’s complement signed integer. The original bit[31] is copied into the left-hand n bits of the register.

**rorR** - Rotate right by n bits moves the right-hand n bits of the register into the left-hand n bits of the result. At the same time, all other bits are moved right by n bits.

**rrxR** - Rotate right with extend shifts the contents of *rm* right by one bit. The carry flag is copied into bit[31] of Rm.

**Condition flags** - 
If *s* is true, these functions update the N, Z and C flags according to the result and do not affect the V flag.
The carry flag is updated to the last bit shifted out of *rm*.

#### B, BL, BX, BLX

**[I|R]** - 

**[I|R]** - 

**[I|R]** - 

**[I|R]** - 

#### ADR, LDR and STR

#### LDM and STM

#### DCD, EQU and FILL

#### end

If condition is true, stop emulation (by modifying PC). Output type is *StateHandle*.

