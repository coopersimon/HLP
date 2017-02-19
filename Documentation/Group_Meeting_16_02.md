## Where we're at
* Interpreter is done - Runs all functions and branches, ending when there's no 
* Testing currently just plain text - needs to be moved to FSCheck
* Interface of Tokeniser
					    
			```Tokeniser: String -> List<Token>```
2. Interface of Parser
			```List<Token> -> Map<Int, (StateHandle->StateHandle)>```

This ```Map<Int, (StateHandle->StateHandle)>``` has an int - the instruction memory location, and the second half is a partially complete instruction function, which takes in a state, executes the instruction on that state and outputs the new state

3. Interface of Interpreter (Transform of a State Handle)
			``` StateHandle->Map<Int, (StateHandle->StateHandle)> -> StateHandle ```
			
This inputs a state and the instruction memory/map, and iterates over every instruction (based on PC values, thus allowed branches), changing the state each time. When no instruction is left, the output state is outputted.

* Currently the infrastructure for branching exists, and all condition codes run correctly.
* Rough roles for now
	* Simon - Tokeniser
	* Ravi - FsCheck testing and Front end
	* Piotr - Parser
	* Yumeng - Instructions

**Leaving memory (ie LDR/STR) for now**

			


