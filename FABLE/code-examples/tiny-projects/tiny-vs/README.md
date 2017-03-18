## Visual Studio Project for TINY language

This project illustrates a multi-file F# project which implements a simple functional language compiler and run-time environment in F# using bracket abstraction to compile an abstract syntax tree to combinators followed by combinator reduction. All the code is written in about 600 lines of F#.

This project may run OK as downloaded (in which case you can delete the src subdirectory - which contains a copy of the source files) but if not can be recreated inside visual studio from scratch as follows:

1. New -> Project -> F# -> console application -> tiny-vs (name)
3. Delete the auto-generate program.fs source file (using the project window)
4. Using project windows -> tiny-vs project -> add item -> existing item,  Add the downloaded src directory files, in the order: common,tokeniser,parser,reducer,tests,main. NB Visual Studio by default copies these files into its prohject directory and references them from there.
5. Delete the src subdirectory now no longer needed (it contains copies of the source files and will confuse you if not deleted)
6. Add project dependencies. Tools->nuget package manager -> package manager console
 * install-package expecto
 * install-package expecto.fscheck
 * install-package expecto.benchmarkdotnet (in case you want to do CPU time benchmarking)


## Frequent Problems for Visual Studio Projects

This modules uses the 4.0 version of F#, which has more complete collection functions (e.g. it includes the useful `List.contains`). By default some version of Visual studio will not install this, and may end up having a dependency on the *previous* 3.1 version of F# core. this will result (for the code here0 in `common.fs` failing to compile because `List.contains` does not exist.

Luckily this can simply be mended. 

Tools -> NuGet Package Manager -> Manage packages for solution-> *Installed tab*

Check FSharp.Core package. It should be `FSharp.Core for F# 4.0` . If instead it is `FSharp.Core for F# 3.1`, go to the *Updates tab*. Update FSharp.Core (and all other visible updates) to the latest compatible version v4.0.0.1. When this succeeds FSharp.Core will be for F# 4.0 and your project will compile correctly.


