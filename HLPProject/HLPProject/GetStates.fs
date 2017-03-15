namespace Execute
open Common.State
open Parse
open Interpret

module GetStates =
    let oldState = initState
    let newState inString = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret oldState
