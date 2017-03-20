# Tokeniser
The tokeniser converts the initial input string to a list of tokens - abstract elements of a DU which can be fed into the parser.

## Dependencies
This module exists in the namespace **Parse**.

This module depends on **Common.State** and **Common.Conditions** and **Common.Types**.

## Tokens
The tokens are a DU which feature every existing word or punctuator in the assembly language. They contain information about the data they represent.

A few tokens worth mentioning:
* **Instructions**: *(StateHandle->bool)* - these contain their condition function, which indicates whether the instruction will run or not based on state.
* **Instructions with suffix 'S'**: * (StateHandle->bool)\*bool * - these contain their condition function, as well as a bool which indicates whether or not the instruction will set flags.
* **Register**: *int* - these contain the register number to use.
* **Integer literal**: *int* - these contain the actual integer value to use.
* **Error**: *string* - indicates a string that didn't match.

## Interface
**tokenise** = input_code: *string* -> output_tokens: *Token list*

This reads in an input string and converts it to a list of tokens, which contain their relevant data.
