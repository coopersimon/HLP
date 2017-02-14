module Main
open Common.State
open Parse
open Interpret

[<EntryPoint>]
let main args =  
    let state = initState
    let inString = "MOV R5 #2"
    let newState = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret state
    printfn "%A" (state)
    printfn "%A" (newState)

    0