module Main
open Common.Types
open Parse
open Interpret

[<EntryPoint>]
let main args =  
    printfn "%A" (Test.TestFramework.compareList Test.Tokeniser.test_stringToToken)
    printfn "%A" (Test.TestFramework.compareList Test.Tokeniser.test_tokenise)

    let state = initState
    let inString = "MOV R5 #2"
    let newState = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret state
    printfn "%A" (readReg state 5)
    printfn "%A" (readReg newState 5)

    0