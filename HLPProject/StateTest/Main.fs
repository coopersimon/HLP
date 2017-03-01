module Main
open Test.TestFramework
open Test.State

[<EntryPoint>]
let main argv = 
    printfn "initState = %s" (testList test_initState)
    printfn "writeReg = %s" (testList test_writeReg)
    printfn "readReg = %s" (testList test_readReg)
    0