# Types
This module defines some common DUs that appear in various different modules.

## Dependencies
Exists in the namespace **Common**.

Depends on **Common.Error** and **Common.State**.

## Discriminated Unions
**shiftOp** - Defines the different types of shift operation. Used in the interpreter at runtime to calculate the second operand in some instructions.

**stackOrder** - Defines the load/store multiple stack type. (Increment/Decrement After/Before).

**opType** - Defines the second operand type for certain instructions. Immediate value or register.

**Instruction** - Defines the instruction function wrapper, as well as some instruction references.

* **Instr**: *int\*(StateHandle -> StateHandle)* - A single instruction. *int* is the line number, *StateHandle -> StateHandle* is the function.
* **LabelRef**: *(Map<string,int> -> Error<Instruction>)* - An intermediate reference to a label, to be resolved at a later stage of the parser.
* **EndRef**: *(int -> Instruction)* - An intermediate reference to the **Terminate** at the end of instruction memory. Again, resolved at a later stage of the parser.
* **Terminate**: *int* - Indicates where the interpretation should end. Includes line number.