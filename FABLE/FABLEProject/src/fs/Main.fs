module Main
open Common.State
open Parse
open Interpret
open Fable.Core
open Fable.Import
open FsHtml

[<EntryPoint>]
let main args =  
    let state = initState
    let inString = "MOV R5, #2"
    let newState = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret state
    let regs = Browser.document.getElementById "regs"
    let registerString = 
        ul [for i in 1..15 ->
            li %(sprintf "R%A = %A" i (readReg newState i)) ]
    regs.innerHTML <- registerString |> Html.toString
    0