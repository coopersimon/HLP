# Interpreter
The interpreter represents the runtime of the assembler. It executes the functions in the correct order, and modifies state.

## Dependencies
Exists in the namespace **Interpret**.

This module depends on **Parse.Parser** and **Common.State**.

## Interface
**interpret** = input_state: *StateHandle* -> instruction_memory: *Map<int, Instruction>* -> output_state: *StateHandle*

The interpreter reads in an input state (initially a default state), in addition to a *Map* representing instruction memory (probably outputted from parser). It transforms the input state to the output state by executing the instruction at the input state's PC.

If the instruction is executed successfully, the interpreter recursively calls itself, passing in the new state (instruction memory is static at this stage, and so remains unmodified).

The recursion ends when the interpreter finds a "Terminate" instruction. At this stage it returns the final state as the output state.

The interpreter only keeps track of state (*StateHandle*) and therefore expects every instruction to be of type *(StateHandle -> StateHandle)*. These are stored inside the Instruction DU type which the *Map* contains.