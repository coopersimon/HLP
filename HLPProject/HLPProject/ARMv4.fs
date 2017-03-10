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

    //set C for arithmetic ADD, ADC, SUB, SBC, RSB and RSC cases (Note: in1 and in2 are int64)
    let setC in1 in2 state = 
        writeCFlag (((in1+in2)>>>32)%2L<>0L) state

    //set V for arithmetic ADD, ADC, SUB, SBC, RSB and RSC cases (Note: in1 and in2 are int64)
    let setV in1 in2 state =   
        let cin = (((in1*2L)+(in2*2L)) >>> 32)%2L
        let cout = ((in1+in2)>>>32)%2L
        writeVFlag not(cin=cout) state
     
     //this function converts an int32 to an int64 without signed extension.
     let conv64 i = int64 (uint32 i)

//MOV and MVN (DONE)

    //write op2 to r
    let movI c s rd i state = //if s: sets N and Z flags
        match (c state, s) with
        | (true, true) -> writeReg rd i state
                          setNZ i state
        | (true, false) -> writeReg rd i state
        | _ -> state

    let movR c s rd rm rsinst nORrn rstype state = //if s: sets N, Z and C flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s&&((rsinst=T_ROR)||(rsinst=T_RRX)) 
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state
             |'r' -> shiftSetCR s rsinst rm nORrn state
             | _ -> state
        else state
        movI c s rd op2 state 

    //write bitwise not of op2 to r
    let mvnI c s r i state = //if s: sets N and Z flags
        movI c s r -i state 

    let mvnR c s rd rm rsinst nORrn rstype state = //if s: sets N, Z and C flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s&&((rsinst=T_ROR)||(rsinst=T_RRX)) 
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state
             |'r' -> shiftSetCR s rsinst rm nORrn state
             | _ -> state
        else state      
        mvnI c s rd op2 state 

//ADD, ADC, SUB, SBC, RSB and RSC (DONE)

    //write rn+op2 to rd
    let addI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> writeReg rd ((readReg rn state)+i) state
                          setNZ ((readReg rn state)+i) state
                          setC (conv64 (readReg rn state)) (conv64 i) state
                          setV (conv64 (readReg rn state)) (conv64 i) state
        | (true, false) -> writeReg rd ((readReg rn state)+i) state
        | _ -> state
    
    let addR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        addI c s rd rn op2 state

    //write rn+op2+carry to rd
    let adcI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, false) -> writeReg rd ((readReg rn state)+i) state
                                 setNZ ((readReg rn state)+i) state
                                 setC (conv64 (readReg rn state)) (conv64 i) state
                                 setV (conv64 (readReg rn state)) (conv64 i) state
        | (true, true, true) ->  writeReg rd ((readReg rn state)+i+1) state
                                 setNZ ((readReg rn state)+i+1) state
                                 setC (conv64 (readReg rn state)) ((conv64 i)+1L) state 
                                 setV (conv64 (readReg rn state)) ((conv64 i)+1L) state
        | (true, false, false) -> writeReg rd ((readReg rn state)+i) state
        | (true, false, true) -> writeReg rd ((readReg rn state)+i+1) state
        | _ -> state
    
    let adcR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        adcI c s rd rn op2 state
    
    //write rn-op2 to rd
    let subI c s rd rn i state = //if s: sets N, Z, C, V flags
        addI c s rd rn -i state
    
    let subR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        subI c s rd rn op2 state

    //write rn-op2-!carry to rd
    let sbcI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, true) -> writeReg rd ((readReg rn state)-i) state
                                 setNZ ((readReg rn state)-i) state
                                 setC (conv64 (readReg rn state)) (conv64 -i) state
                                 setV (conv64 (readReg rn state)) (conv64 -i) state
        | (true, true, false) -> writeReg rd ((readReg rn state)-i-1) state
                                setNZ ((readReg rn state)-i-1) state
                                setC (conv64 (readReg rn state)) ((conv64 -i)-1L) state
                                setV (conv64 (readReg rn state)) ((conv64 -i)-1L) state
        | (true, false, true) -> writeReg rd ((readReg rn state)-i) state
        | (true, false, false) -> writeReg rd ((readReg rn state)-i-1) state
        | _ -> state
    
    let sbcR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        sbcI c s rd rn op2 state

    //write op2-rn to rd
    let rsbI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> writeReg rd (i-(readReg rn state)) state
                          setNZ (i-(readReg rn state)) state
                          setC (conv64 -(readReg rn state)) (conv64 i) state
                          setV (conv64 -(readReg rn state)) (conv64 i) state
        | (true, false) -> writeReg rd (i-(readReg rn state)) state
        | _ -> state
    
    let rsbR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        rsbI c s rd rn op2 state

    //write op2-rn-!carry to rd
    let rscI c s  rn i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, true) -> writeReg rd (i-(readReg rn state)) state
                                 setNZ (i-(readReg rn state)) state
                                 setC (conv64 -(readReg rn state)) (conv64 i) state
                                 setV (conv64 -(readReg rn state)) (conv64 i) state
        | (true, true, false) -> writeReg rd (i-(readReg rn state)-1) state
                                setNZ (i-(readReg rn state)-1) state
                                setC (conv64 -(readReg rn state)) ((conv64 i)-1L) state
                                setV (conv64 -(readReg rn state)) ((conv64 i)-1L) state
        | (true, false, true) -> writeReg rd (i-(readReg rn state)) state
        | (true, false, false) -> writeReg rd (i-(readReg rn state)-1) state
        | _ -> state
    
    let rscR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        rscI c s rd rn op2 state

//MUL and MLA (need to account for setting flags)
    
    //write rn*rm to rd
    let mulR c rd rn rm state =
        if c state
        then writeReg rd ((readReg rn state)*(readReg rm state)) state
        else state
    
    //write rn*r3+r4 to rd
    let mulRA c rd rn r3 r4 state =
        if c state
        then writeReg rd ((readReg rn state)*(readReg r3 state)+(readReg r4 state)) state
        else state

//AND, ORR, EOR, and BIC (need to account for setting flags)
    //write bitwise AND of rn and op2 to rd
    let andI c rd rn i state =
        if c state
        then writeReg rd ((readReg rn state)&&&i) state
        else state
    
    let andR c rd rn rm state =
        if c state
        then writeReg rd ((readReg rn state)&&&(readReg rm state)) state
        else state

    //write bitwise OR of rn and op2 to rd
    let orrI c rd rn i state =
        if c state
        then writeReg rd ((readReg rn state)|||i) state
        else state
    
    let orrR c rd rn rm state =
        if c state
        then writeReg rd ((readReg rn state)|||(readReg rm state)) state
        else state

    //write bitwise XOR of rn and op2 to rd
    let eorI c rd rn i state =
        if c state
        then writeReg rd ((readReg rn state)^^^i) state
        else state
    
    let eorR c rd rn rm state =
        if c state
        then writeReg rd ((readReg rn state)^^^(readReg rm state)) state
        else state

    //write bitwise AND of rn and NOT(op2) to rd
    let bicI c rd rn i state =
        if c state
        then writeReg rd ((readReg rn state)&&&(~~~i)) state
        else state
    
    let bicR c rd rn rm state =
        if c state
        then writeReg rd ((readReg rn state)&&&(~~~(readReg rm state))) state
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
    let cmpI c r1 i state =
        if c state
        then state // placeholder so it compiles
        else state

    let cmpR c r1 r2 state =
        if c state
        then state // placeholder so it compiles
        else state

//TST and TEQ (need to account for shift and rotate)
