module Main
open Common.State
open Parse
open Interpret
open Parse.Tokeniser
open Common.Conditions
open Common.Error

[<EntryPoint>]
let main args =  
    let state = initState
    (*let inString = "MOV R5, #2"
    let newState = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret state
    printfn "%A" (readReg 5 state)
    printfn "%A" (readReg 5 newState)*)
    let inString = "        MOV  R0, #5 ; setting up the inputs
                            MOV  R1, #3
                            MOV  R2, R0
                    LOOP    ; Manual multiplier loop
                            ADD  R3, R3, R1
                            SUBS R2, R2, #1
                            BNE  LOOP
                            MUL  R4, R0, R1 ; instruction mult"
    match inString |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpret state) with
    | Ok(newState) -> printfn "%A = %A" (readReg 3 newState) (readReg 4 newState)
    | Err(msg) -> printfn "%s" msg
    0