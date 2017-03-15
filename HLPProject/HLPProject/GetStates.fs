namespace Execute
open Common.State
open Parse
open Interpret
open Common.Conditions
open Common.Error

module GetStates =
    let oldState = initState
    let newState inString = 
    match inString |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpret oldState) with
    	| Ok(newState) -> printfn "%A = %A" (readReg 3 newState) (readReg 4 newState)
    	| Err(msg) -> printfn "%s" msg
