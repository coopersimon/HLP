# Parser
The parser converts an input list of tokens to an output map. The map's keys are memory locations and the values are "Instructions" (a DU).

## Dependencies
Exists in the namespace **Parse**.

This module depends on **Parse.Tokeniser**, **Interpret.ARMv4**, **Common.Error** and **Common.Types**.

## Interface
**parser** = input_tokens: *Token list* -> instructions: *Error<Map<int, Instruction>>*

This reads in an input token list (from the tokeniser) and outputs a map which the interpreter can use. The keys of the map are memory locations that the instructions are stored in.

The Map is wrapped in an Error monad. If an Err() is returned, it contains the line number and a string containing the error message.

Each instruction is stored in a multiple of 4. Branches directly point to memory locations represented by the map. These are resolved by the parser - labels get "eaten" by the parser.