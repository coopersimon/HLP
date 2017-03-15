open Common.State
open Parse
open Interpret

namespace Execute
module GetStates = 
    let oldState = initState
    let newState inString = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret oldState
