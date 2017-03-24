namespace Execute
open Common.State
open Parse
open Interpret
open Common.Error

module GetStates =

    let newStateAll inString = match inString |> Tokeniser.tokenise |> Parser.parser with
                                | Ok(state,instr) -> Interpreter.interpret state instr
                                | Err(l,s) -> Err(l,s)
    
    let getParsedState inString = match inString |> Tokeniser.tokenise |> Parser.parser
    
    let newStateSingle stateIn = match stateIn with
                                    | Ok(state,instr) -> Interpreter.interpretLine state instr
                                    | Err(l,s) -> Err(l,s)