// This module contains functions to run the ARMv4 instruction set.

namespace Interpret
module ARMv4 =
    open Common.State
    open Parse.Tokeniser

    let shiftI inst r n state =
        match inst with 
        |T_LSL -> if (n>=0)&&(n<=31) then (readReg r state)<<<n
                                     else failwith "Invalid n."
        |T_LSR -> if (n>=1)&&(n<=32) then (if n=32 then 0 else int((uint32 (readReg r state))/(uint32 (2.0**(float n))))) 
                                     else failwith "Invalid n."
        |T_ASR -> if (n>=1)&&(n<=32) then (readReg r state)/(int (2.0**(float n))) 
                                     else failwith "Invalid n."
        |T_ROR -> if (n>=1)&&(n<=31) then (readReg r state)>>>n 
                                     else failwith "Invalid n."
        |T_RRX -> match (readCFlag state) with
                    |true -> (readReg r state)/2 + 1<<<31
                    |false -> (readReg r state)/2
        |T_NIL -> readReg r state

    let shiftR inst r rn state =
        shiftI inst r (readReg rn state) state

    let shiftSetCI s inst r n state =
        match inst with
        |T_LSL -> if s then writeCFlag (((readReg r state)>>>(32-n))%2<>0) state else state 
        |T_LSR -> if s then writeCFlag (((readReg r state)>>>(n-1))%2<>0) state else state 
        |T_ASR -> if s then writeCFlag (((readReg r state)>>>(n-1))%2<>0) state else state 
        |T_ROR -> if s then writeCFlag (((readReg r state)>>>(n-1))%2<>0) state else state 
        |T_RRX -> if s then writeCFlag ((readReg r state)%2<>0) state else state
        |T_NIL -> state

    let shiftSetCR s inst r rn state = 
        shiftSetCI s inst r (readReg rn state) state

//functions to set flags
    //set N and Z flags for all cases
    let setNZ result state =
        state |> writeNFlag (result<0) |> writeZFlag (result=0)

    //set C for arithmetic ADD, ADC, SUB, SBC, RSB and RSC cases (Note: in1 and in2 are int64)
    let setC in1 in2 state = 
        writeCFlag (((in1+in2)>>>32)%2L<>0L) state

    //set V for arithmetic ADD, ADC, SUB, SBC, RSB and RSC cases (Note: in1 and in2 are int64)
    let setV in1 in2 state =   
        let cin = (((in1*2L)+(in2*2L)) >>> 32)%2L
        let cout = ((in1+in2)>>>32)%2L
        writeVFlag (cin<>cout) state
     
     //this function converts an int32 to an int64 without signed extension.
    let conv64 i = int64 (uint32 i)

//MOV and MVN (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHCDBCA.html

    //write op2 to r
    let movI c s rd i state = //if s: sets N and Z flags only
        match (c state, s) with
        | (true, true) -> state |> writeReg rd i |> setNZ i
        | (true, false) -> writeReg rd i state
        | _ -> state

    let movR c s rd rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> movI c s rd op2
             |'r' -> shiftSetCR s rsinst rm nORrn state |> movI c s rd op2
             | _ -> movI c s rd op2 state 
        else movI c s rd op2 state 
        

    //write bitwise not of op2 to r
    let mvnI c s rd i state = //if s: sets N and Z flags only
        movI c s rd ~~~i state 

    let mvnR c s rd rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> mvnI c s rd op2 
             |'r' -> shiftSetCR s rsinst rm nORrn state |> mvnI c s rd op2 
             | _ -> mvnI c s rd op2 state 
        else mvnI c s rd op2 state       

//ADD, ADC, SUB, SBC, RSB and RSC (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHCJFJG.html

    //write rn+op2 to rd
    let addI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> writeReg rd ((readReg rn state)+i) state
                          |> setNZ ((readReg rn state)+i) 
                          |> setC (conv64 (readReg rn state)) (conv64 i)
                          |> setV (conv64 (readReg rn state)) (conv64 i) 
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
                                 |> setNZ ((readReg rn state)+i) 
                                 |> setC (conv64 (readReg rn state)) (conv64 i)
                                 |> setV (conv64 (readReg rn state)) (conv64 i) 
        | (true, true, true) ->  writeReg rd ((readReg rn state)+i+1) state
                                 |> setNZ ((readReg rn state)+i+1) 
                                 |> setC (conv64 (readReg rn state)) ((conv64 i)+1L)
                                 |> setV (conv64 (readReg rn state)) ((conv64 i)+1L) 
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
                                |> setNZ ((readReg rn state)-i)
                                |> setC (conv64 (readReg rn state)) (conv64 -i) 
                                |> setV (conv64 (readReg rn state)) (conv64 -i)
        | (true, true, false) -> writeReg rd ((readReg rn state)-i-1) state
                                |> setNZ ((readReg rn state)-i-1) 
                                |> setC (conv64 (readReg rn state)) ((conv64 -i)-1L) 
                                |> setV (conv64 (readReg rn state)) ((conv64 -i)-1L) 
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
                          |> setNZ (i-(readReg rn state))
                          |> setC (conv64 -(readReg rn state)) (conv64 i) 
                          |> setV (conv64 -(readReg rn state)) (conv64 i) 
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
                                |> setNZ (i-(readReg rn state)) 
                                |> setC (conv64 -(readReg rn state)) (conv64 i) 
                                |> setV (conv64 -(readReg rn state)) (conv64 i) 
        | (true, true, false) -> writeReg rd (i-(readReg rn state)-1) state
                                |> setNZ (i-(readReg rn state)-1) 
                                |> setC (conv64 -(readReg rn state)) ((conv64 i)-1L) 
                                |> setV (conv64 -(readReg rn state)) ((conv64 i)-1L)
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

//CMP and CMN (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHIDDID.html

    //same as SUBS but discards results
    let cmpI c rn i state = //sets N, Z, C, V flags
        match c state with 
        | true -> setNZ ((readReg rn state)-i) state
                  |> setC (conv64 (readReg rn state)) (conv64 -i) 
                  |> setV (conv64 (readReg rn state)) (conv64 -i) 
        | false -> state

    let cmpR c rn rm rsinst nORrn rstype state = //sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        cmpI c rn op2 state
        
    //same as ADDS but discards results
    let cmnI c rn i state = //sets N, Z, C, V flags
        match c state with 
        | true -> setNZ ((readReg rn state)+i) state
                  |> setC (conv64 (readReg rn state)) (conv64 i)
                  |> setV (conv64 (readReg rn state)) (conv64 i)
        | false -> state

    let cmnR c rn rm rsinst nORrn rstype state = //sets N, Z, C, V flags
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        cmnI c rn op2 state        

//MUL and MLA (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHIHGGJ.html
    
    //write rm*rs to rd
    let mulR c s rd rm rs state = //if s: sets N and Z flags only
        let res = (readReg rm state)*(readReg rs state)
        match (c state, s) with 
        | (true, true) -> writeReg rd res state
                          |> setNZ res 
        | (true, false) -> writeReg rd res state
        | _ -> state    
    
    //write rm*rs+rn to rd
    let mlaR c rd rm rs rn state = //if s: sets N and Z flags only
        let res = (readReg rm state)*(readReg rs state)+(readReg rn state)
        match (c state, s) with 
        | (true, true) -> writeReg rd res state
                          |> setNZ res 
        | (true, false) -> writeReg rd res state
        | _ -> state        

//AND, ORR, EOR, and BIC (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHDAFAI.html

    //write bitwise AND of rn and op2 to rd
    let andI c s rd rn i state = //if s: sets N and Z flags only
        match (c state, s) with 
        | (true, true) -> writeReg rd ((readReg rn state)&&&i) state
                          |> setNZ ((readReg rn state)&&&i) 
        | (true, false) -> writeReg rd ((readReg rn state)&&&i) state
        | _ -> state
    
    let andR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> andI c s rd rn op2
             |'r' -> shiftSetCR s rsinst rm nORrn state |> andI c s rd rn op2
             | _ -> andI c s rd rn op2 state
        else andI c s rd rn op2 state

    //write bitwise OR of rn and op2 to rd
    let orrI c s rd rn i state = //if s: sets N and Z flags only
        match (c state, s) with 
        | (true, true) -> writeReg rd ((readReg rn state)|||i) state
                          |> setNZ ((readReg rn state)|||i) 
        | (true, false) -> writeReg rd ((readReg rn state)|||i) state
        | _ -> state

    let orrR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> orrI c s rd rn op2
             |'r' -> shiftSetCR s rsinst rm nORrn state |> orrI c s rd rn op2
             | _ -> orrI c s rd rn op2 state
        else orrI c s rd rn op2 state

    //write bitwise XOR of rn and op2 to rd
    let eorI c s rd rn i state = //if s: sets N and Z flags only
        match (c state, s) with 
        | (true, true) -> writeReg rd ((readReg rn state)^^^i) state
                          |> setNZ ((readReg rn state)^^^i)
        | (true, false) -> writeReg rd ((readReg rn state)^^^i) state
        | _ -> state
    
    let eorR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> eorI c s rd rn op2
             |'r' -> shiftSetCR s rsinst rm nORrn state |> eorI c s rd rn op2
             | _ -> eorI c s rd rn op2 state
        else eorI c s rd rn op2 state

    //write bitwise AND of rn and NOT(op2) to rd
    let bicI c s rd rn i state = //if s: sets N and Z flags only
        andI c s rd rn (~~~i) state
    
    let bicR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> bicI c s rd rn op2
             |'r' -> shiftSetCR s rsinst rm nORrn state |> bicI c s rd rn op2
             | _ -> bicI c s rd rn op2 state
        else bicI c s rd rn op2 state

//TST and TEQ (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHCDEHH.html

    //same as ANDS but discards results
    let tstI c rn i state = //sets N and Z flags only
        match c state with 
        | true -> setNZ ((readReg rn state)&&&i) state
        | false -> state

    let tstR c rn rm rsinst nORrn rstype state = //sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> tstI c rn op2
             |'r' -> shiftSetCR s rsinst rm nORrn state |> tstI c rn op2
             | _ -> tstI c rn op2 state
        else tstI c rn op2 state
        
    //same as EORS but discards results
    let teqI c rn i state = //sets N and Z flags only
        match c state with 
        | true -> setNZ ((readReg rn state)^^^i) state
        | false -> state

    let teqR c rn rm rsinst nORrn rstype state = //sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |'i' -> shiftI rsinst rm nORrn state
            |'r' -> shiftR rsinst rm nORrn state
            | _ -> readReg rm state
        if s
        then match rstype with
             |'i' -> shiftSetCI s rsinst rm nORrn state |> teqI c rn op2
             |'r' -> shiftSetCR s rsinst rm nORrn state |> teqI c rn op2
             | _ -> teqI c rn op2 state
        else teqI c rn op2 state  

//CLZ (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHJGJED.html

    //counts the number of leading zeroes in the value in Rm and returns the result in Rd
    let clzR c rd rm state = 
        let rec loop m c = match m with
                           | 0  -> 32
                           | m when m < 0 -> c
                           | _  -> loop (m <<< 1) (c + 1)
        writeReg rd (loop (readReg rm state) 0) state
        
//LSL, LSR, ASR, ROR, RRX (DONE)

    //logical shift left rm by rn, write into rd
    let lslR c s rd rm rn state = //if s: set N and Z only
        let op2 = shiftR (T_LSL) rm rn state
        match (c state, s) with
        | (true, true) -> writeReg rd op2 state
                          |> setNZ op2
                          |> shiftSetCR s (T_LSL) rm rn 
        | (true, false) -> writeReg rd op2 state
        | _ -> state        

    //logical shift right rm by rn, write into rd
    let lsrR c s rd rm rn state = //if s: set N and Z only
        let op2 = shiftR (T_LSR) rm rn state
        match (c state, s) with
        | (true, true) -> writeReg rd op2 state
                          |> setNZ op2
                          |> shiftSetCR s (T_LSR) rm rn 
        | (true, false) -> writeReg rd op2 state
        | _ -> state       
        
     //arithmetic shift right rm by rn, write into rd
    let asrR c s rd rm rn state = //if s: set N and Z only
        let op2 = shiftR (T_ASR) rm rn state
        match (c state, s) with
        | (true, true) -> writeReg rd op2 state
                         |> setNZ op2
                         |> shiftSetCR s (T_ASR) rm rn 
        | (true, false) -> writeReg rd op2 state
        | _ -> state        
     
     //rotate right rm by rn, write into rd
    let rorR c s rd rm rn state = //if s: set N, Z and (C) only
        let op2 = shiftR (T_ROR) rm rn state
        match (c state, s) with
        | (true, true) -> writeReg rd op2 state
                          |> setNZ op2 
                          |> shiftSetCR s (T_ROR) rm rn 
        | (true, false) -> writeReg rd op2 state
        | _ -> state             
        
     //rotate right (and extend) rm by 1, write into rd
    let rrxR c s rd rm state = //if s: set N, Z (and C) only
        let op2 = shiftR (T_RRX) rm (1) state
        match (c state, s) with
        | (true, true) -> writeReg rd op2 state
                          |> setNZ op2 
                          |> shiftSetCR s (T_RRX) rm (1) 
        | (true, false) -> writeReg rd op2 state
        | _ -> state              

//B, BL, BX, BLX (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHFDDAF.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHDGEAI.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHFJFDG.html

    //branch to address corresponding to label
    let b c label state =
        if c state
        then writePC label state
        else state

    //store address of next instruction in r14, branch to address corresponding to label
    let bl c label state =
        if c state
        then writeReg 14 ((readPC state)+4) state
             |> writePC label 
        else state

    //branch to address stored in rm
    let bx c rm state =
        if c state
        then writePC ((readReg rm state)/2) state //Bit 0 of Rm is not used as part of the address?
        else state

    //store address of next instruction in r14, branch to address indicated by op2
    let blxR c rm state = 
        if c state
        then writeReg 14 ((readPC state)+4) state
             |> writePC ((readReg rm state)/2) //Bit 0 of Rm is not used as part of the address?
        else state

    let blxL label state = //only if no condition follows
        writeReg 14 ((readPC state)+4) state
        |> writePC label 

//ADR, LDR and STR
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0041c/Babcjaii.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/Bcfihdhj.html (in progress)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/Chdbifed.html (in progress)

    //writes the address corresponding to label into rd
    let adr c rd label =
        if c state
        then writeReg rd label state  
        else state

//LDM and STM
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHCADDA.html

//DCD, EQU and FILL
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0041c/Babbfcga.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0489h/Caccddic.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0489f/Babchded.html

//END (DONE)
    //stop emulation
    let end c finalInstAdd state = 
        if c state
        then writePC (finalInstAdd+4) state 
        else state
