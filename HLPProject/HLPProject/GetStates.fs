namespace Execute
open Common.State
open Parse
open Interpret

module GetStates =
    let oldState = initState
    let newState inString = 
    match inString |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpret state) with
    	| Ok(newState) -> printfn "%A = %A" (readReg 3 newState) (readReg 4 newState)
    	| Err(msg) -> printfn "%s" msg
