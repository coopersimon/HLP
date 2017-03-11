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

#### MOV and MVN

mov[I|R] - Moves literal *i* or 

#### ADD, ADC, SUB, SBC, RSB and RSC

#### CMP and CMN

#### MUL and MLA

#### AND, ORR, EOR and BIC

#### TST and TEQ

#### CLZ

#### LSL, LSR, ASR, ROR and RRX

#### B, BL, BX, BLX

#### ADR, LDR and STR

#### LDM and STM

#### DCD, EQU and FILL

#### end

If condition is true, stop emulation (by modifying PC). Output type is *StateHandle*.

