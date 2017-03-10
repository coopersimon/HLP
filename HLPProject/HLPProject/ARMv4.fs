// This module contains functions to run the ARMv4 instruction set.

namespace Interpret
module ARMv4 =
    open Common.State

//flexible second operand
    //http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHBEAGE.html
    //still need to account for when op2 is shifted*** (in progress)
    //need to account for flag writing*** {S} only applies to move (DONE), arithmetic (DONE) and logical instructions
//note that instructions work with int32

//Rotate and shift function for flexible 2nd operand see parser.fs

//functions to set flags
    //set N and Z flags for all cases
    let setNZ result state =
        writeNFlag (result<0) state
        writeZFlag (result=0) state

    //set C for arithmetic ADD, SUB etc cases
    let setC in1 in2 state = 
        writeCFlag ((((int64 in1)+(int64 in2)) >>> 32)%2L<>0L) state

    //set V for arithmetic ADD, SUB etc cases
    let setV in1 in2 state =    //incomplete default clear flag
        let cin = (((int64 in1*2)+(int64 in2*2)) >>> 32)%2L
        let cout = (((int64 in1)+(int64 in2)) >>> 32)%2L
        writeVFlag not(cin=cout) state

//MOV and MVN (DONE)

    //write op2 to r
    let movI c s r i state = //if s: sets N and Z flags
        match (c state, s) with
        | (true, true) -> state |> writeReg r i
                                |> setNZ i 
        | (true, false) -> writeReg r i state
        | _ -> state

    let movR c s r1 r2 rsinst nORrn rstype state = //if s: sets N, Z and C flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r2 nORrn state
        |'r' -> let op2 = sinftR rsinst r2 nORrn state
        | _ -> let op2 = readReg r2 state
        if s&&((rsinst=T_ROR)||(rsinst=T_RRX)) 
        then match rstype with
             |'i' -> shiftSetCI s rsinst r2 nORrn state
             |'r' -> shiftSetCR s rsinst r2 nORrn state
             | _ -> state
        movI c s r1 op2 state 

    //write bitwise not of op2 to r
    let mvnI c s r i state = //if s: sets N and Z flags
        movI c s r -i state 

    let mvnR c s r1 r2 rsinst nORrn rstype state = //if s: sets N, Z and C flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r2 nORrn state
        |'r' -> let op2 = sinftR rsinst r2 nORrn state
        | _ -> let op2 = readReg r2 state
        if s&&((rsinst=T_ROR)||(rsinst=T_RRX)) 
        then match rstype with
             |'i' -> shiftSetCI s rsinst r2 nORrn state
             |'r' -> shiftSetCR s rsinst r2 nORrn state
             | _ -> state        
        mvnI c s r1 op2 state 

//ADD, ADC, SUB, SBC, RSB and RSC (DONE)

    //write r2+op2 to r1
    let addI c s r1 r2 i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> state |> writeReg r1 ((readReg r2 state)+i)
                                |> setNZ ((readReg r2 state)+i)
                                |> setC (readReg r2 state) i
                                |> setV (readReg r2 state) i
        | (true, false) -> writeReg r1 ((readReg r2 state)+i) state
        | _ -> state
    
    let addR c s r1 r2 r3 rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r3 nORrn state
        |'r' -> let op2 = sinftR rsinst r3 nORrn state
        | _ -> let op2 = readReg r3 state
        addI c s r1 r2 op2 state

    //write r2+op2+carry to r1
    let adcI c s r1 r2 i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, false) -> state |> writeReg r1 ((readReg r2 state)+i)
                                |> setNZ ((readReg r2 state)+i)
                                |> setC (readReg r2 state) i
                                |> setV (readReg r2 state) i
        | (true, true, true) -> state |> writeReg r1 ((readReg r2 state)+i+1)
                                |> setNZ ((readReg r2 state)+i+1)
                                |> setC (readReg r2 state) i+1
                                |> setV (readReg r2 state) i+1
        | (true, false, false) -> writeReg r1 ((readReg r2 state)+i) state
        | (true, false, true) -> writeReg r1 ((readReg r2 state)+i+1) state
        | _ -> state
    
    let adcR c s r1 r2 r3 rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r3 nORrn state
        |'r' -> let op2 = sinftR rsinst r3 nORrn state
        | _ -> let op2 = readReg r3 state
        adcI c s r1 r2 op2 state
    
    //write r2-op2 to r1
    let subI c s r1 r2 i state = //if s: sets N, Z, C, V flags
        addI c s r1 r2 -i state
    
    let subR c s r1 r2 r3 rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r3 nORrn state
        |'r' -> let op2 = sinftR rsinst r3 nORrn state
        | _ -> let op2 = readReg r3 state
        subI c s r1 r2 op2 state

    //write r2-op2-!carry to r1
    let sbcI c s r1 r2 i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, false) -> state |> writeReg r1 ((readReg r2 state)-i)
                                |> setNZ ((readReg r2 state)-i)
                                |> setC (readReg r2 state) -i
                                |> setV (readReg r2 state) -i
        | (true, true, true) -> state |> writeReg r1 ((readReg r2 state)-i-1)
                                |> setNZ ((readReg r2 state)-i-1)
                                |> setC (readReg r2 state) -i-1
                                |> setV (readReg r2 state) -i-1
        | (true, false, false) -> writeReg r1 ((readReg r2 state)-i) state
        | (true, false, true) -> writeReg r1 ((readReg r2 state)-i-1) state
        | _ -> state
    
    let sbcR c s r1 r2 r3 rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r3 nORrn state
        |'r' -> let op2 = sinftR rsinst r3 nORrn state
        | _ -> let op2 = readReg r3 state
        sbcI c s r1 r2 op2 state

    //write op2-r2 to r1
    let rsbI c s r1 r2 i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> state |> writeReg r1 (i-(readReg r2 state))
                                |> setNZ (i-(readReg r2 state))
                                |> setC -(readReg r2 state) i
                                |> setV -(readReg r2 state) i
        | (true, false) -> writeReg r1 (i-(readReg r2 state)) state
        | _ -> state
    
    let rsbR c s r1 r2 r3 rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r3 nORrn state
        |'r' -> let op2 = sinftR rsinst r3 nORrn state
        | _ -> let op2 = readReg r3 state
        rsbI c s r1 r2 op2 state

    //write op2-r2-!carry to r1
    let rscI c s  r2 i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, false) -> state |> writeReg r1 (i-(readReg r2 state))
                                |> setNZ (i-(readReg r2 state))
                                |> setC -(readReg r2 state) i
                                |> setV -(readReg r2 state) i
        | (true, true, true) -> state |> writeReg r1 (i-(readReg r2 state)-1)
                                |> setNZ (i-(readReg r2 state)-1)
                                |> setC -(readReg r2 state) i-1
                                |> setV -(readReg r2 state) i-1
        | (true, false, false) -> writeReg r1 (i-(readReg r2 state)) state
        | (true, false, true) -> writeReg r1 (i-(readReg r2 state)-1) state
        | _ -> state
    
    let rscR c s r1 r2 r3 rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        match rstype with
        |'i' -> let op2 = sinftI rsinst r3 nORrn state
        |'r' -> let op2 = sinftR rsinst r3 nORrn state
        | _ -> let op2 = readReg r3 state
        rscI c s r1 r2 op2 state

//MUL and MLA (need to account for setting flags)
    
    //write r2*r3 to r1
    let mulR c r1 r2 r3 state =
        if c state
        then writeReg r1 ((readReg r2 state)*(readReg r3 state)) state
        else state
    
    //write r2*r3+r4 to r1
    let mulRA c r1 r2 r3 r4 state =
        if c state
        then writeReg r1 ((readReg r2 state)*(readReg r3 state)+(readReg r4 state)) state
        else state

//AND, ORR, EOR, and BIC (need to account for setting flags)
    //write bitwise AND of r2 and op2 to r1
    let andI c r1 r2 i state =
        if c state
        then writeReg r1 ((readReg r2 state)&&&i) state
        else state
    
    let andR c r1 r2 r3 state =
        if c state
        then writeReg r1 ((readReg r2 state)&&&(readReg r3 state)) state
        else state

    //write bitwise OR of r2 and op2 to r1
    let orrI c r1 r2 i state =
        if c state
        then writeReg r1 ((readReg r2 state)|||i) state
        else state
    
    let orrR c r1 r2 r3 state =
        if c state
        then writeReg r1 ((readReg r2 state)|||(readReg r3 state)) state
        else state

    //write bitwise XOR of r2 and op2 to r1
    let eorI c r1 r2 i state =
        if c state
        then writeReg r1 ((readReg r2 state)^^^i) state
        else state
    
    let eorR c r1 r2 r3 state =
        if c state
        then writeReg r1 ((readReg r2 state)^^^(readReg r3 state)) state
        else state

    //write bitwise AND of r2 and NOT(op2) to r1
    let bicI c r1 r2 i state =
        if c state
        then writeReg r1 ((readReg r2 state)&&&(~~~i)) state
        else state
    
    let bicR c r1 r2 r3 state =
        if c state
        then writeReg r1 ((readReg r2 state)&&&(~~~(readReg r3 state))) state
        else state

//B, BL and BX

    //branch to label
    let b c label state =
        if c state
        then writePC label state
        else state

    //store next instruction in r14, branch to label
    let bl c label state =
        if c state
        then 
            state |>
            writeReg 14 ((readPC state)+4) |>
            writePC label
        else state

    //branch to r
    let bx c r state =
        if c state
        then writePC (readReg r state) state
        else state

    //store next instruction in r14, branch to op2 (some link with thumb here...?)
    let blxR c r state = //only if condition follows
        if c state
        then 
            state |>
            writeReg 14 ((readPC state)+4) |>
            writePC (readReg r state)
        else state

    let blxL c label state = //only if no condition follows
        if c state
        then 
            state |>
            writeReg 14 ((readPC state)+4) |>
            writePC label
        else state

//CMP and CMN (need to account for shift and rotate)
    //update the N, Z, C and V flags according to the result

    //same as SUBS but discards results
    let cmpI c r i state =
        if c state
        then state // placeholder so it compiles
        else state

    let cmpR c r1 r2 state =
        if c state
        then state // placeholder so it compiles
        else state

//TST and TEQ (need to account for shift and rotate)
