module Main
open Execute.GetStates
open Common.State
open Common.Conditions
open Common.Error

[<EntryPoint>]
let main args =
    
    let inString = "MOV R1, #5"
    let oState = initState
    let nState = newState oState inString
    match nState with
    | Ok(s) -> printfn "Valid = %A" (readReg 0 s)
    | Err(msg) -> printfn "%s" msg
    0