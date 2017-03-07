# ARMv4
This contains the functions that represent the ARM v4 instruction set.

## Dependencies
Exists in namespace **Interpret**.

This module depends on **Common.State**.

## General Interface
All instructions should take in multiple arguments. It varies by instruction. The **final** argument should always be a *StateHandle*. The output type should also always be a *StateHandle*.

The remaining arguments should include a condition, of type *(StateHandle -> bool)*. Many instructions contain some of the following arguments:

* **register**: *int* - registers inside **state** to access or modify.
* **int literal**: *int* - integer literals used to modify registers in **state**.
* **extra conditions**: *bool* - such as 'S', these do extra side-effects like modify flags in **state**.