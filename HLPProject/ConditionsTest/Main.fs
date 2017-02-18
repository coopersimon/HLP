module Main
open Test.TestFramework
open Test.Conditions

[<EntryPoint>]
let main argv = 
    printfn "checkAL = %s" (testList test_checkAL)
    printfn "checkEQ = %s" (testList test_checkEQ)
    printfn "checkNE = %s" (testList test_checkNE)
    printfn "checkCS = %s" (testList test_checkCS)
    printfn "checkCC = %s" (testList test_checkCC)
    printfn "checkMI = %s" (testList test_checkMI)
    printfn "checkPL = %s" (testList test_checkPL)
    printfn "checkVS = %s" (testList test_checkVS)
    printfn "checkVC = %s" (testList test_checkVC)
    printfn "checkHI = %s" (testList test_checkHI)
    printfn "checkLS = %s" (testList test_checkLS)
    printfn "checkGE = %s" (testList test_checkGE)
    printfn "checkLT = %s" (testList test_checkLT)
    printfn "checkGT = %s" (testList test_checkGT)
    printfn "checkLE = %s" (testList test_checkLE)
    0