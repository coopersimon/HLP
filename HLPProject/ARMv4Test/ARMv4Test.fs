//to be copied over to HLPProject Main.fs for testing
module Main
open Execute.GetStates
open Common.State
open Common.Error

[<EntryPoint>]
let main args =
    //input assembly code to be tested
    let inStringSetZ = "MOVS R1, #0" 
    let inStringSetN = "MOV R1, #3 
                         SUBS R2, R1, #5" 
    let inStringSetC = "MVN		R1, #0
	                	ADDS	R1, R1, #7"
    let inStringSetCV = "		MOV		R0, #1
		                        MVN		R1, #3
		                        MOV		R2, R0, LSL #31
		                        ADDS	R3, R1, R2
                                " 
    let inStringLSL = "MOV R1, #1
                       MOV R2, R1, LSL #3" 
    let inStringCT2tick = "	;Par		{ R2 := 11 - R0 ; R1 := 3*R0 - 4*R1 ; R0 := R1 }
		
                    		MOV		R2, R0 		;R2 := R0
                    		MOV		R0, R1 		;R0 := R1 [DONE]
                    		ADD		R1, R1, R1 	;R1 := 2*R1
                    		SUB		R1, R2, R1 	;R1 := R0 - 2*R1
                    		ADD		R1, R1, R1 	;R1 := 2*R0 - 4*R1
                    		ADD		R1, R1, R2 	;R1 := 3*R0 - 4*R1 [DONE]
                    		RSB		R2, R2, #11 	;R2 := 11 - R0 [DONE]"
    let inStringCT3fig3 = "	MOV		R2, #0 ; for testing
                           		MOV		R1, #7 ; for testing
                        		MOV		R0, #0
                    LOOP		CMP		R2, #0
                        		BEQ		stop
                        		ADD		R0, R0, R1
                        		SUB		R2, R2, #1
                        		B		LOOP
                    stop" //PC counts 4 lesser because of ending with label
    let inStringCT4ticksb = "	MOV		R2, #0
                        		AND		R4, R1, #0x80000000
                        		AND		R5, R1, #0x40000000
                        		CMP		R5, R4, lsr #1
                        		MOVNE	R2, #1
		
                        		MOV		R0, R1, lsl #30
                        		MOV		R3, R1, asr #2
                        		MOV		R1, R1, lsl #1
                        		ADDS	R1, R1, R3
            		
                        		MOVVS	R2, #1"
    let inStringCT5tick = "		MOV		R0, #16
		
                           		ADR		R1, BLC_TABLE
                        		CMP		R0, #15
                        		MOVHI	R1, #0 ; error output for when input is out of range
                        		LDRLS	R1, [R1, R0, LSL #2]
		
                                BLC_TABLE	DCD		85, 86, 89, 90, 101, 102, 105, 106, 149, 150, 153, 154, 165, 166, 169, 170 
                                ;constant word table stored in memory"
                                //DCD does not work with multiple words yet
    let inStringLong =     "LDR     R1, =INPUT_1
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
    
    //initial state
    let oState = initState
    match oState with
    | s ->          printfn " Initial values:"
                    printfn " R0 = %A" (readReg 0 s)
                    printfn " R1 = %A" (readReg 1 s)
                    printfn " R2 = %A" (readReg 2 s)
                    printfn " R3 = %A" (readReg 3 s)
                    printfn " R4 = %A" (readReg 4 s)
                    printfn " R5 = %A" (readReg 5 s)
                    printfn " R6 = %A" (readReg 6 s)
                    printfn " R7 = %A" (readReg 7 s)
                    printfn " R8 = %A" (readReg 8 s)
                    printfn " R9 = %A" (readReg 9 s)
                    printfn " R10 = %A" (readReg 10 s)
                    printfn " R11 = %A" (readReg 11 s)
                    printfn " R12 = %A" (readReg 12 s)
                    printfn " R13(SP) = %A" (readReg 13 s)
                    printfn " R14(LR) = %A" (readReg 14 s)
                    printfn " R15(PC) = %A" (readReg 15 s)
                    printfn " N = %A" (readNFlag s)
                    printfn " Z = %A" (readZFlag s)
                    printfn " C = %A" (readCFlag s)
                    printfn " V = %A" (readVFlag s)
    | _          -> printfn "Error"

    //new state after code execution
    let nState = newState inStringCT5tick
    match nState with
    | Ok(_,s) ->    printfn " Resulting values:"
                    printfn " R0 = %A" (readReg 0 s)
                    printfn " R1 = %A" (readReg 1 s)
                    printfn " R2 = %A" (readReg 2 s)
                    printfn " R3 = %A" (readReg 3 s)
                    printfn " R4 = %A" (readReg 4 s)
                    printfn " R5 = %A" (readReg 5 s)
                    printfn " R6 = %A" (readReg 6 s)
                    printfn " R7 = %A" (readReg 7 s)
                    printfn " R8 = %A" (readReg 8 s)
                    printfn " R9 = %A" (readReg 9 s)
                    printfn " R10 = %A" (readReg 10 s)
                    printfn " R11 = %A" (readReg 11 s)
                    printfn " R12 = %A" (readReg 12 s)
                    printfn " R13(SP) = %A" (readReg 13 s)
                    printfn " R14(LR) = %A" (readReg 14 s)
                    printfn " R15(PC) = %A" ((readReg 15 s)+4) 
                    printfn " N = %A" (readNFlag s)
                    printfn " Z = %A" (readZFlag s)
                    printfn " C = %A" (readCFlag s)
                    printfn " V = %A" (readVFlag s)
    | Err(l,msg) -> printfn "Line %d: %s" l msg

    0