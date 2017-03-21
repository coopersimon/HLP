module Main
open Execute.GetStates
open Common.State
open Common.Error

[<EntryPoint>]
let main args =
    
    let inString = "        MOV     R1, #5 ; setting up the inputs
                            MOV     R2, #3

                    MAIN
                            BL      MULT_A
                            BL      MULT_B
                            MOV     R9, R2, RRX
                            ADR     R10, RETURN
                            B       FINAL
                    RETURN  END

                    MULT_A
                            SUB     R3, R1, #1
                    LOOP    ; Manual multiplier loop
                            ADD     R4, R4, R2
                            SUBS    R3, R3, #1
                            BPL     LOOP
                            MOV     PC, LR

                    MULT_B
                            MUL     R5, R1, R2 ; instruction mult
                            MOV     PC, LR
                    
                    FINAL
                            CMP     R4, R5
                            MOVEQ   R0, #1
                            MOVNE   R0, R4
                            BX      R10"
    let oState = initState
    let nState = newState oState inString
    match nState with
    | Ok(_,s) -> printfn "Valid = %A" (readReg 0 s)
    | Err(l,msg) -> printfn "Line %d: %s" l msg
    0