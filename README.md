
####  Next Meeting - Tuesday 21st at 3pm
 
Last Meeting (Friday 16th) notes in ```Documentation/Meeting_16_02.md```  
Oxn ```dev_10_02``` branch

#### Git and Branching

Master Branch  
Dev branches, title ```dev_10_02```  
Each person, for experimental changes, branches off dev, with title ```ravi_dev_10_02```   
Added commit.sh, with ```./commit.sh "MESSAGE"``` commits, with message of MESSAGE  

#### Development strategy
1. Weekly meeting twice a week - one 3pm Tuesday
2. Meeting defines what we want to get done, and stubs/interfaces of the code we need to write
3.	MD file for each meeting
4. MD file for each code module
5. **Comment your code**
6. TODO.md - with todo list 
	* Old Todos commented out
	* Todos of current sprint shown
7. Top README.md - most important project information  

#### File Structure

```
| commit.sh
| README.md (Top README)
| TODO.md (Todo List)
> Documentation
	| (Markdown files, with notes from meetings of different dates)
> HLPProject
	> HLPProject
		> bin 
			| (All binaries)
		> obj 
			| (All object files)
		| App.config
		| HLPProject.fsproj
		| App.config
		> src
			| (All source files, names of form name.fs)
		> tests
			| (All test files, names of form name_test.fs)
		> codedocs
			| (Documentation for specific source files where needed, of form name.md)
```

#### Testing Steps

1. Have a name for each code module (e.g: ```name.fs```)  
2. Create a test file (Filename of the form ```name_test.fs```)
3. Add ```namespace Test``` to the first line of ```name_test.fs```
4. Add ```module <name>``` to both ```name.fs``` and to the second line of ```name_test.fs```
5. Create a list of tuples, where the first element of the tuple is a call to the test function, and the second element is the expected output. 
		* NB: The type of both elements of the tuple must be the same
6. In main (See ```Main.fs``` )
7. Printout the test result, of the form
		```printfn "%A" (Test.TestFramework.compareList Test.Tokeniser.<test list name```
	
	This has a more verbose output
		```printfn "%A" (Test.TestFramework.compareList Test.Tokeniser.<test list name```
		



