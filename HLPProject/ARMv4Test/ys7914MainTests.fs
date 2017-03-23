//to be copied over to HLPProject Main.fs for testing
//module Main
module ys7914MainTests
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
    let inStringCT5changed = "		MOV		R0, #16
		
                            		ADR		R1, BLC_TABLE
                            		CMP		R0, #15
                            		MOVHI	R1, #0 ; error output for when input is out of range
                            		LDRLS	R1, [R1, R0, LSL #2]
		
                                  BLC_TABLE	DCD		85" 
    let inStringCT6_4 = "   INIT	ADR		R0, BUFFIN1
                            		ADR		R1, BUFFIN1+16 
                            		ADR		R2, BUFFIN2
                            		ADR		R3, BUFFIN2+16
                            		ADR		R4, BUFFTMP
                            		ADR		R5, BUFFTMP
                            		;		start of real code
		
                            MLOOP	CMP		R0, R1  ; HS => R0 = R1
                            		LDRHS	R7, [R2] ; load R7 from IN2
                            		BHS		M2SEL ; if IN1 is empty
                            		CMP		R2, R3 ; HS => R2 = R3
                            		LDRHS	R6, [R0] ; load R6 from IN1
                            		BHS		M1SEL ; if IN2 is empty
                             		;		load R6 and R7 from IN1 and IN2 for comparison
                            		LDR		R6, [R0]
                            		LDR		R7, [R2]
                            		CMP		R6, R7 ; LO => select M1, HS => select M2
                            		BLO		M1SEL
                            M2SEL	STR		R7, [R5], #4 ; **** Move item (already in R7) from IN2 to OUT
                            		ADD		R2, R2, #4
                            		;		work out whether we have finished
                            MEND	CMP		R0, R1
                            		CMPEQ	R2, R3
                            		BNE		MLOOP
                            		;		copy merged data back to in2 and in1
                            		;		at end in2 buffer will contain all data
                            CLOOP     ; **** copy data from outs to in2e
                            		CMP		R4, R5
                            		LDR		R7, [R4], #4 ;data in R4 to data in R2 both +4
                            		STR		R7, [R2], #4
                            		BNE		CLOOP
                            		;		this is the end of the code
                            		END
		
		
                            M1SEL	STR		R6, [R5], #4 ; **** move item (already in R6) from IN1 to OUT
                            		ADD		R0, R0, #4
                            		B		MEND
                            		;		data for testing
		
                            BUFFIN1	DCD		3,7,11,20
                            BUFFIN2	DCD		5,6, 12, 21
                            BUFFTMP	FILL	32" //throws error on line 2 (need parser)
    let inStringFILL = "ADR		R5, BUFFTMP
                        STR		R7, [R5], #4 
                BUFFTMP	FILL	32"//throws error on line 3
    let inStringDCD = " MOV		R1, #45
                		ADR		R4, BUF
                		ADR		R5, BUFFTMP
                		STR		R1, [R4]
                		LDR		R7, [R4]
                BUF		DCD		32
                BUFFTMP	EQU		32" //executes but R4 is interpreted differently, EQU cannot accept expressions like 32-4
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
                    INPUT_2 DCD     3" //contains instructions beyond ViSUAL
    
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

    let testfn n state = 
        match n with
        |1 -> newState inStringSetZ
        |2 -> newState inStringSetN
        |3 -> newState inStringSetC
        |4 -> newState inStringSetCV
        |5 -> newState inStringLSL
        |6 -> newState inStringCT2tick
        |7 -> newState inStringCT3fig3
        |8 -> newState inStringCT4ticksb
        |9 -> newState inStringCT5tick
        |10 -> newState inStringCT5changed
        |11 -> newState inStringCT6_4
        |12 -> newState inStringFILL
        |13 -> newState inStringDCD
        |14 -> newState inStringLong
        |_ -> Ok(0,writePC -4 state)

    //new state after code execution
    let nState = testfn 15 oState//choose code to test
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