module Main
open Test.TestFramework
open Test.State

[<EntryPoint>]
let main argv = 
    printfn "initState = %s" (testList test_initState)
    printfn "initStateVisual = %s" (testList test_initStateVisual)
    printfn "writeReg = %s" (testList test_writeReg)
    printfn "readReg = %s" (testList test_readReg)
    printfn "writePC = %s" (testList test_writePC)
    printfn "readPC = %s" (testList test_readPC)
    printfn "incPC = %s" (testList test_incPC)
    printfn "readNFlag = %s" (testList test_readNFlag)
    printfn "readZFlag = %s" (testList test_readZFlag)
    printfn "readCFlag = %s" (testList test_readCFlag)
    printfn "readVFlag = %s" (testList test_readVFlag)
    printfn "writeNFlag = %s" (testList test_writeNFlag)
    printfn "writeZFlag = %s" (testList test_writeZFlag)
    printfn "writeCFlag = %s" (testList test_writeCFlag)
    printfn "writeVFlag = %s" (testList test_writeVFlag)
    printfn "writeMem = %s" (testList test_writeMem)
    printfn "readMem = %s" (testList test_readMem)
    0