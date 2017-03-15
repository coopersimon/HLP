module Main
open Execute.GetStates
open Common.State

[<EntryPoint>]
let main args =
      
    let oState = oldState
    let nState = newState "MOV R5, #2"
    printfn "%A" (readReg 5 oState)
    printfn "%A" (readReg 5 nState)

    0