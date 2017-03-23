//to be copied over to HLPProject Main.fs for testing
module ARMv4Test
//module Main
open Interpret.ARMv4
open Execute.GetStates
open Common.State
open Common.Error
open Common.Types
open Common.Conditions

[<EntryPoint>]
let main args =
    //some sample input parameters
    let c = checkAL
    let s = false
    let rd = 1
    let rm = 2
    let rn = 3
    let rsinst = T_LSL
    let nORrn = 5
    let rstype = T_R
    let i = 354
    
    //initial state
    let state = initState
    match state with
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
        (*  Corresponding Assembly
		    MOV	    	R0, #5
		    MVNS		R1, R0, LSL #5    
        *)
        |1 -> writeReg 13 0xFF000000 state
              |> movI c s 0 5 
              |> mvnR c true 1 0 T_LSL 5 T_I 
              |> writePC 8  
        (*  Corresponding Assembly
            MOV R1, #1
            MOVS R2, R1, LSL #3  
        *)
        |2 -> writeReg 13 0xFF000000 state
              |> movI c s 1 1 
              |> movR c true 2 1 T_LSL 3 T_I 
              |> writePC 8  
        (*  Corresponding Assembly
		    MOV		R1, #4 	
            MOV		R0, #67 		
            RSBS	R2, R0, R1, ROR R1 	  
        *)
        |3 -> writeReg 13 0xFF000000 state
              |> movI c s 1 4 
              |> movI c s 0 67
              |> rsbR c true 2 0 1 T_ROR 1 T_R 
              |> writePC 12  
        (*  Corresponding Assembly
		    MOV		R1, #77
		    MOV		R0, #67
		    ORRS	R2, R0, R1, RRX 	  
        *)
        |4 -> writeReg 13 0xFF000000 state
              |> movI c s 1 77 
              |> movI c s 0 67
              |> orrR c true 2 0 1 T_RRX 1 T_R 
              |> writePC 12  
        |_ -> state

    //function to test (can pipeline for multiple instructions)
    let nState = testfn 4 state
        
    //resulting state
    match nState with
    | s ->          printfn " Resulting values:"
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
    | _          -> printfn "Error" 

    0