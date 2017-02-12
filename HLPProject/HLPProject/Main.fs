module Main

[<EntryPoint>]
let main args =  
    printfn "%A" (Test.TestFramework.compareList Test.Tokeniser.test_stringToToken)
    0