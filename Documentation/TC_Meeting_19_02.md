## Tom Clarke meeting

Having functions to alter the state is a good idea to go about this

Possible other inspirations:

*	Lensing with Functional Programming
*  [Lecture - Structuring F# Programs with ADTs by Bryan Edds](https://www.reddit.com/r/fsharp/comments/36s0zr/structuring_f_programs_with_abstract_data_types/)

Look at the assessment guidelines!

Think about the best way to split the work and interfacing:

* The parser/tokeniser seems simple!
* Maybe split by instructions?
* Make sure you anticipate work sharing
* **Communicate** - especially with regards to the amount of work you can do

With regards to interfacing, add catch alls at all stages, so adding more DUs early on will be caught at later stages

Read his document on testing.

For testing, use his FsCheck module from Tick 4 and modify it.