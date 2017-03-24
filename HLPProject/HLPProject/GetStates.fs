namespace Execute
open Common.State
open Parse
open Interpret
open Common.Error

module GetStates =

    let newState inString = match inString |> Tokeniser.tokenise |> Parser.parser with
                            | Ok(state,instr) -> Interpreter.interpret state instr
                            | Err(l,s) -> Err(l,s)