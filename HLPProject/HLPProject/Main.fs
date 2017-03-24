module Main
open Execute.GetStates
open Common.State
open Common.Error

[<EntryPoint>]
let main args =
    
    let inString = "        LDR     R1, =INPUT_1
                            LDR     R2, =INPUT_2

                    MAIN
                            BL      MULT_A
                            BL      MULT_B
                            LDMDB   R13, {R6-R7}
                            ADR     R10, RETURN
                            B       FINAL
                    RETURN  END

                    MULT_A
                            SUB     R3, R1, #1
                    LOOP    ; Manual multiplier loop
                            ADD     R4, R4, R2
                            SUBS    R3, R3, #1
                            BPL     LOOP
                            STR     R13, [R4, #4]!
                            MOV     PC, LR

                    MULT_B
                            MUL     R5, R1, R2 ; instruction mult
                            STR     R13, [R5, #4]!
                            MOV     PC, LR
                    
                    FINAL
                            CMP     R6, R7
                            MOVEQ   R0, #1
                            MOVNE   R0, R4
                            BX      R10
                    INPUT_1 DCD     5
                    INPUT_2 DCD     3"
    //let oState = initState
    let nState = newState inString
    match nState with
    | Ok(_,s) -> printfn "Valid = %A" (readReg 0 s)
    | Err(l,msg) -> printfn "Line %d: %s" l msg
    0