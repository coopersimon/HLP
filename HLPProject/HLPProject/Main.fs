module Main
open Execute.GetStates
open Common.State

[<EntryPoint>]
let main args =
    
    let inString = "        MOV  R0, #5 ; setting up the inputs
                            MOV  R1, #3
                            MOV  R2, R0
                    LOOP    ; Manual multiplier loop
                            ADD  R3, R3, R1
                            SUBS R2, R2, #1
                            BNE  LOOP
                            MUL  R4, R0, R1 ; instruction mult"
    let oState = oldState
    let nState = newState inString
    printfn "%A" (readReg 5 oState)
    printfn "%A" (readReg 5 nState)

    0