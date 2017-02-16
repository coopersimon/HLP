module Main
open Test.TestFramework
open Test.Tokeniser

[<EntryPoint>]
let main args =  
    printfn "%A" (compareList test_stringToToken)
    printfn "%A" (compareList test_tokenise)

    0