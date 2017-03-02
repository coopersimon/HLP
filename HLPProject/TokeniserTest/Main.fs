module Main
open Test.TestFramework
open Test.Tokeniser

[<EntryPoint>]
let main args =  
    printfn "stringToToken = %s" (testList test_stringToToken)
    printfn "tokenise = %s" (testList test_tokenise)

    0