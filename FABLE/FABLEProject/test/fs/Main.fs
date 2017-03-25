module Main
open Common.State
open Parse
open Interpret
open Fable.Core
open Fable.Import

[<EntryPoint>]
let main args =  
    let state = initState
    let inString = "MOV R5, #2"
    let newState = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret state
    let regs = Browser.document.getElementById "regs"
    regs.innerHTML <- (sprintf "%A" (readReg newState 5))
    0