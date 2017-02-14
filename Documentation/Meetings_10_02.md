# 10th Feb 2017 - Meeting

## Meeting with Dr Clarke

---

##  Initial Meeting 
**Plan to get just MOV working in system, before adding further instructions**

Array of instructions, and on each new instruction, get the PC value and run the instruction at that PC value

Not necessarily worrying about memory so far, but probably will be a map, possibly mutable

#### Steps
1. Parse instruction, throwing ParseError if match not found
		
	* This could be split into a Tokeniser, and Creating the tree
	* Interface:
					    
			Parser: Code:String -> Instructions:Array<Instruction>
2. Interpreter takes in Code (string array), and State, outputting a new State
		
	* Interface:
				
			Interpreter: Code:String -> InputState:State -> Instructions:Array<Instruction> -> OutputState:State

#### State
* Both memory (or address to memory), and registers
* **immutable**

#### Dev strategy
1. Agile Style
2. Weekly twice a week - one 3pm Tuesday
3. Meeting defines what we want to get done, and stubs/interfaces of the code we need to write
2.	MD file for each meeting
3. MD file for each code module
4. **Comment your code**
5. TODO.md - with todo list 
	* Old Todos commented out?
	* Todos of current sprint shown
6. Top README.md - most important project information 

#### Testing
Have a name for each code module (e.g: name.fs)
Final outputs should be:
	1. name.fs
	2. name_inputs.txt
	3. name_outputs.txt
	4. name_log.md

#### Branching  
Master Branch
Dev branches, title ```dev_10_02``` or similar, indicating date the branch was made
Each person, for each sprint, branches off dev, with title ```ravi_dev_10_02``` or similar

