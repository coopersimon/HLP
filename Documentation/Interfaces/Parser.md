# Parser
The parser converts an input list of tokens to an output map. The map's keys are memory locations and the values are "Instructions" (a DU).

## Instruction
The Instruction DU is a wrapper for the output of the parser. There are a few types of instruction:

* **Instr**: *(StateHandle -> StateHandle)* - this contains a partially-applied function representing an instruction. It transforms a state using parameters that are set in the parser.
* **Terminate** - this indicates that the interpreter should stop running through code and exit.

The following DU member should not be used externally.
* **Branch**: *(Map<string,int> -> Instruction)* - this is a placeholder for a branch instruction, which is resolved inside the parser function. It appears when the parser doesn't yet know *where* to branch to.


## Interface
**parser** = input_tokens: *Token list* -> instructions: *Map<int, Instruction>*

This reads in an input token list (from the tokeniser) and outputs a map which the interpreter can use. The keys of the map are memory locations that the instructions are stored in.

Each instruction is stored in a multiple of 4. Branches directly point to memory locations represented by the map. These are resolved by the parser - labels get "eaten" by the parser.