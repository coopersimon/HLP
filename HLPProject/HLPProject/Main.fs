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
                            LDR     R6, [R13], #-4
                            LDR     R7, [R13], #-4
                            ADR     R10, RETURN
                            B       FINAL
                    RETURN  END

                    MULT_A
                            SUB     R3, R1, #1
                    LOOP    ; Manual multiplier loop
                            ADD     R4, R4, R2
                            SUBS    R3, R3, #1
                            BPL     LOOP
                            STR     R4, [R13, #4]!
                            MOV     PC, LR

                    MULT_B
                            MUL     R5, R1, R2 ; instruction mult
                            STR     R5, [R13, #4]!
                            MOV     PC, LR
                    
                    FINAL
                            CMP     R6, R7
                            MOVEQ   R0, #1
                            MOVNE   R0, R6
                            BX      R10"
    let oState = initState
    let nState = newState oState inString
    match nState with
    | Ok(_,s) -> printfn "Valid = %A" (readReg 0 s)
    | Err(l,msg) -> printfn "Line %d: %s" l msg
    0