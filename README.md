
####  Next Meeting - AFTER LECTURE, TUESDAY 14th 

Need to confirm time  
Want to fully parse and interpret MOV commands by then  
Last Meeting (Friday 10th) notes in ```Documentation/Meetings_10_02.md```  
Currently on ```dev_10_02``` branch

#### Git and Branching

Master Branch  
Dev branches, title ```dev_10_02``` or similar, indicating date the branch was made  
Each person, for each sprint, branches off dev, with title ```ravi_dev_10_02``` or similar  
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

#### Testing
* Create a separate file for your individual tests
* Each source file should have its own test file, in namespace Test.
* Simple tests consist of a (function * expectedValue) List. The framework then compares these with compareList.
Final outputs should be:  
	1. name.fs  
	2. name_test.fs
	3. name_outputs.txt  
	4. name_log.md  

