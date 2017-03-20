namespace Execute
open Common.State
open Parse
open Interpret
open Common.Error

module GetStates =

    let newState oldState inString = inString |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpret oldState)