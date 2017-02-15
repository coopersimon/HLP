module Main
open Common.State
open Parse
open Interpret

[<EntryPoint>]
let main args =  
    let state = initState
    let inString = "MOVEQ R5, #2"
    let newState = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret state
    printfn "%A" (readReg state 5)
    printfn "%A" (readReg newState 5)

    0