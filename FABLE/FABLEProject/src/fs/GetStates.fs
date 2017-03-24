namespace Execute
open Common.State
open Parse
open Interpret
open Common.Error

module GetStates =

    let newStateAll oldState inString = inString |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpret oldState)
    let newStateSingle oldState inString = inString |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpretLine oldState)