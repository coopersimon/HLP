
module Main
open Execute.GetStates
open Common.State
open Common.Conditions
open Common.Error

[<EntryPoint>]
let main args =
    
    let inString = "        MOV     R1, #5 ; setting up the inputs
                            MOV     R2, #3

                    MAIN
                            BL      MULT_A
                            BL      MULT_B
                            CMP     R4, R5
                            MOVEQ   R0, #1
                            ENDEQ
                            MOV     R0, R4
                            END

                    MULT_A
                            SUB     R3, R1, #1
                    LOOP    ; Manual multiplier loop
                            ADD     R4, R4, R2
                            SUBS    R3, R3, #1
                            BPL     LOOP
                            MOV     PC, LR

                    MULT_B
                            MUL     R5, R1, R2 ; instruction mult
                            MOV     PC, LR"
    let oState = oldState
    let nState = newState inString
    match nState with
    | Ok(nState) -> printfn "Valid = %A" (readReg 0 nState)
    | Err(msg) -> printfn "%s" msg
    0