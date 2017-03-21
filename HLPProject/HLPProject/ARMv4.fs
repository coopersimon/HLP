// This module contains functions to run the ARMv4 instruction set.
 // Mark down document: https://github.com/coopersimon/HLP/blob/dev_16_03/Documentation/Interfaces/ARMv4.md
 // Not all instructions supported by the following functions are support by VISUAL. 
 // VISUAL supports : https://web.archive.org/web/20160831113526/http://salmanarif.bitbucket.org/visual/supported_instructions.html

namespace Interpret
module ARMv4 =
    open Common.State
    open Common.Types
    open Parse.Tokeniser

(*  //Version with limited n range.
    let shiftI inst r n state =
        match inst with 
        |T_LSL -> if (n>=0)&&(n<=31) then (readReg r state)<<<n
                                     else failwith "Invalid n."
        |T_LSR -> if (n>=1)&&(n<=32) then (if n=32 then 0 else int(uint32(readReg r state))>>>n)
                                     else failwith "Invalid n."
        |T_ASR -> if (n>=1)&&(n<=32) then (if n=32 then (if (readReg r state)>0 then 0 else -1) else (readReg r state)>>>n)
                                     else failwith "Invalid n."
        |T_ROR -> if (n>=1)&&(n<=31) then int(((uint32(readReg r state))>>>n) + ((uint32(readReg r state))<<<(32-n)))
                                     else failwith "Invalid n."
        |T_RRX -> match (readCFlag state) with
                    |true -> (readReg r state)>>>1 + 1<<<31
                    |false -> (readReg r state)>>>1
*)                 
   //Version without limited n
   let shiftI inst r n state =
        let m = n%33
        match inst with 
        |T_LSL -> if n>=32 then 0 else (readReg r state)<<<n
        |T_LSR -> if n>=32 then 0 else int(uint32(readReg r state))>>>n
        |T_ASR -> if n>=32 then (if (readReg r state)>0 then 0 else -1) else (readReg r state)>>>n
        |T_ROR -> int(((uint32(readReg r state))>>>m) + ((uint32(readReg r state))<<<(32-m)))
        |T_RRX -> match (readCFlag state) with
                    |true -> (readReg r state)>>>1 + 1<<<31
                    |false -> (readReg r state)>>>1


    let shiftR inst r rn state =
        shiftI inst r (readReg rn state) state 

    let shiftSetCI s inst r n state =
        match inst with
        |T_LSL -> if s then writeCFlag (((readReg r state)>>>(32-n))%2<>0) state else state 
        |T_LSR -> if s then writeCFlag (((readReg r state)>>>(n-1))%2<>0) state else state 
        |T_ASR -> if s then writeCFlag (((readReg r state)>>>(n-1))%2<>0) state else state 
        |T_ROR -> if s then writeCFlag (((readReg r state)>>>(n-1))%2<>0) state else state 
        |T_RRX -> if s then writeCFlag ((readReg r state)%2<>0) state else state

    let shiftSetCR s inst r rn state = 
        shiftSetCI s inst r (readReg rn state) state

//functions to set flags
    //set N and Z flags for all cases
    let setNZ result state =
        state |> writeNFlag (result<0) |> writeZFlag (result=0)

    //set C for arithmetic ADD, ADC, SUB, SBC, RSB and RSC cases (Note: in1 and in2 are int64)
    let setC in1 in2 state = 
        writeCFlag (((in1+in2)>>>32)%2L<>0L) state

    //this function converts an int32 to an int64 without sign extension.
    let conv64 i = (int64 i)&&&(4294967295L)

    //set V for arithmetic ADD, ADC, SUB, SBC, RSB and RSC cases (Note: in1 and in2 are int)
    let setV in1 in2 state =   
        let cin = ((conv64(in1*2)+conv64(in2*2))>>>32)%2L
        let cout = (((conv64 in1)+(conv64 in2))>>>32)%2L
        writeVFlag (cin<>cout) state
     


//MOV and MVN (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHCDBCA.html

    //write op2 to r
    let movI c s rd i state = //if s: sets N and Z flags only
        match (c state, s) with
        | (true, true) -> state |> setNZ i |> writeReg rd i 
        | (true, false) -> writeReg rd i state
        | _ -> state

    let movR c s rd rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then match rstype with
             |T_I -> shiftSetCI s rsinst rm nORrn state |> movI c s rd op2 
             |T_R -> shiftSetCR s rsinst rm nORrn state |> movI c s rd op2 
        else state
        
    //write bitwise not of op2 to r
    let mvnI c s rd i state = //if s: sets N and Z flags only
        movI c s rd ~~~i state 

    let mvnR c s rd rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state 
        then match rstype with
             |T_I -> shiftSetCI s rsinst rm nORrn state |> mvnI c s rd op2 
             |T_R -> shiftSetCR s rsinst rm nORrn state |> mvnI c s rd op2     
        else state

//ADD, ADC, SUB, SBC, RSB and RSC (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHCJFJG.html

    //write rn+op2 to rd
    let addI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ ((readReg rn state)+i) 
                          |> setC (conv64 (readReg rn state)) (conv64 i)
                          |> setV (readReg rn state) (i) 
                          |> writeReg rd ((readReg rn state)+i)
        | (true, false) -> writeReg rd ((readReg rn state)+i) state
        | _ -> state
    
    let addR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        addI c s rd rn op2 state

    //write rn+op2+carry to rd
    let adcI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, false) -> state
                                 |> setNZ ((readReg rn state)+i) 
                                 |> setC (conv64 (readReg rn state)) (conv64 i)
                                 |> setV (readReg rn state) (i) 
                                 |> writeReg rd ((readReg rn state)+i) 
        | (true, true, true) ->  state
                                 |> setNZ ((readReg rn state)+i+1) 
                                 |> setC (conv64 (readReg rn state)) ((conv64 i)+1L)
                                 |> setV (readReg rn state) (i+1) 
                                 |> writeReg rd ((readReg rn state)+i+1) 
        | (true, false, false) -> writeReg rd ((readReg rn state)+i) state
        | (true, false, true) -> writeReg rd ((readReg rn state)+i+1) state
        | _ -> state
    
    let adcR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        adcI c s rd rn op2 state
    
    //write rn-op2 to rd
    let subI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ ((readReg rn state)-i) 
                          |> setC (conv64 (readReg rn state)) ((conv64 ~~~i)+1L)
                          |> setV (readReg rn state) (-i)
                          |> writeReg rd ((readReg rn state)-i)
        | (true, false) -> writeReg rd ((readReg rn state)-i) state
        | _ -> state
    
    let subR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        subI c s rd rn op2 state

    //write rn-op2-!carry to rd
    let sbcI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, true) -> state
                                |> setNZ ((readReg rn state)-i)
                                |> setC (conv64 (readReg rn state)) ((conv64 ~~~i)+1L) 
                                |> setV (readReg rn state) (-i) 
                                |> writeReg rd ((readReg rn state)-i) 
        | (true, true, false) -> state
                                |> setNZ ((readReg rn state)-i-1) 
                                |> setC (conv64 (readReg rn state)) ((conv64 ~~~i)) 
                                |> setV (readReg rn state) (-i-1) 
                                |> writeReg rd ((readReg rn state)-i-1) 
        | (true, false, true) -> writeReg rd ((readReg rn state)-i) state
        | (true, false, false) -> writeReg rd ((readReg rn state)-i-1) state
        | _ -> state
    
    let sbcR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        sbcI c s rd rn op2 state

    //write op2-rn to rd
    let rsbI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ (i-(readReg rn state))
                          |> setC (conv64 ~~~(readReg rn state)+1L) (conv64 i) 
                          |> setV (-(readReg rn state)) (i) 
                          |> writeReg rd (i-(readReg rn state)) 
        | (true, false) -> writeReg rd (i-(readReg rn state)) state
        | _ -> state
    
    let rsbR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        rsbI c s rd rn op2 state

    //write op2-rn-!carry to rd
    let rscI c s rd rn i state = //if s: sets N, Z, C, V flags
        match (c state, s, readCFlag state) with 
        | (true, true, true) -> state
                                |> setNZ (i-(readReg rn state)) 
                                |> setC (conv64 ~~~(readReg rn state)+1L) (conv64 i) 
                                |> setV (-(readReg rn state)) (i) 
                                |> writeReg rd (i-(readReg rn state)) 
        | (true, true, false) -> state
                                |> setNZ (i-(readReg rn state)-1) 
                                |> setC (conv64 ~~~(readReg rn state)) (conv64 i) 
                                |> setV (-(readReg rn state)-1) (i) 
                                |> writeReg rd (i-(readReg rn state)-1) 
        | (true, false, true) -> writeReg rd (i-(readReg rn state)) state
        | (true, false, false) -> writeReg rd (i-(readReg rn state)-1) state
        | _ -> state
    
    let rscR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        rscI c s rd rn op2 state

//CMP and CMN (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHIDDID.html

    //same as SUBS but discards results
    let cmpI c rn i state = //sets N, Z, C, V flags
        match c state with 
        | true -> setNZ ((readReg rn state)-i) state
                  |> setC (conv64 (readReg rn state)) ((conv64 ~~~i)+1L) 
                  |> setV (readReg rn state) (-i) 
        | false -> state

    let cmpR c rn rm rsinst nORrn rstype state = //sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        cmpI c rn op2 state
        
    //same as ADDS but discards results
    let cmnI c rn i state = //sets N, Z, C, V flags
        match c state with 
        | true -> setNZ ((readReg rn state)+i) state
                  |> setC (conv64 (readReg rn state)) (conv64 i)
                  |> setV (readReg rn state) (i)
        | false -> state

    let cmnR c rn rm rsinst nORrn rstype state = //sets N, Z, C, V flags
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        cmnI c rn op2 state        

//MUL and MLA (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHIHGGJ.html
    
    //write rm*rs to rd
    let mulR c s rd rm rs state = //if s: sets N and Z flags only
        let res = (readReg rm state)*(readReg rs state)
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ res 
                          |> writeReg rd res 
        | (true, false) -> writeReg rd res state
        | _ -> state    
    
    //write rm*rs+rn to rd
    let mlaR c s rd rm rs rn state = //if s: sets N and Z flags only
        let res = (readReg rm state)*(readReg rs state)+(readReg rn state)
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ res 
                          |> writeReg rd res 
        | (true, false) -> writeReg rd res state
        | _ -> state        

//AND, ORR, EOR, and BIC (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHDAFAI.html

    //write bitwise AND of rn and op2 to rd
    let andI c s rd rn i state = //if s: sets N and Z flags only
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ ((readReg rn state)&&&i) 
                          |> writeReg rd ((readReg rn state)&&&i) 
        | (true, false) -> writeReg rd ((readReg rn state)&&&i) state
        | _ -> state
    
    let andR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then match rstype with
             |T_I -> shiftSetCI s rsinst rm nORrn state |> andI c s rd rn op2 
             |T_R -> shiftSetCR s rsinst rm nORrn state |> andI c s rd rn op2 
        else state

    //write bitwise OR of rn and op2 to rd
    let orrI c s rd rn i state = //if s: sets N and Z flags only
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ ((readReg rn state)|||i) 
                          |> writeReg rd ((readReg rn state)|||i) 
        | (true, false) -> writeReg rd ((readReg rn state)|||i) state
        | _ -> state

    let orrR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then match rstype with
             |T_I -> shiftSetCI s rsinst rm nORrn state |> orrI c s rd rn op2 
             |T_R -> shiftSetCR s rsinst rm nORrn state |> orrI c s rd rn op2 
        else state

    //write bitwise XOR of rn and op2 to rd
    let eorI c s rd rn i state = //if s: sets N and Z flags only
        match (c state, s) with 
        | (true, true) -> state
                          |> setNZ ((readReg rn state)^^^i)
                          |> writeReg rd ((readReg rn state)^^^i) 
        | (true, false) -> writeReg rd ((readReg rn state)^^^i) state
        | _ -> state
    
    let eorR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then match rstype with
             |T_I -> shiftSetCI s rsinst rm nORrn state |> eorI c s rd rn op2 
             |T_R -> shiftSetCR s rsinst rm nORrn state |> eorI c s rd rn op2 
        else state

    //write bitwise AND of rn and NOT(op2) to rd
    let bicI c s rd rn i state = //if s: sets N and Z flags only
        andI c s rd rn (~~~i) state
    
    let bicR c s rd rn rm rsinst nORrn rstype state = //if s: sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then match rstype with
             |T_I -> shiftSetCI s rsinst rm nORrn state |> bicI c s rd rn op2 
             |T_R -> shiftSetCR s rsinst rm nORrn state |> bicI c s rd rn op2 
        else state

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
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then match rstype with
             |T_I -> shiftSetCI (true) rsinst rm nORrn state |> tstI c rn op2 
             |T_R -> shiftSetCR (true) rsinst rm nORrn state |> tstI c rn op2 
        else state
        
    //same as EORS but discards results
    let teqI c rn i state = //sets N and Z flags only
        match c state with 
        | true -> setNZ ((readReg rn state)^^^i) state
        | false -> state

    let teqR c rn rm rsinst nORrn rstype state = //sets N, Z (and C) flags only
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then match rstype with
             |T_I -> shiftSetCI (true) rsinst rm nORrn state |> teqI c rn op2 
             |T_R -> shiftSetCR (true) rsinst rm nORrn state |> teqI c rn op2 
        else state

//CLZ (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHJGJED.html

    //counts the number of leading zeroes in the value in Rm and returns the result in Rd
    let clzR c rd rm state = 
        let rec loop m c = match m with
                           | 0  -> 32
                           | m when m < 0 -> c
                           | _  -> loop (m <<< 1) (c + 1)
        if c state
        then writeReg rd (loop (readReg rm state) 0) state
        else state
        
//LSL, LSR, ASR, ROR, RRX (DONE)

    //logical shift left rm by rn, write into rd
    let lslR c s rd rm rn state = //if s: set N and Z only
        let op2 = shiftR (T_LSL) rm rn state
        match (c state, s) with
        | (true, true) -> state
                          |> setNZ op2
                          |> shiftSetCR s (T_LSL) rm rn 
                          |> writeReg rd op2 
        | (true, false) -> writeReg rd op2 state
        | _ -> state        

    //logical shift right rm by rn, write into rd
    let lsrR c s rd rm rn state = //if s: set N and Z only
        let op2 = shiftR (T_LSR) rm rn state
        match (c state, s) with
        | (true, true) -> state
                          |> setNZ op2
                          |> shiftSetCR s (T_LSR) rm rn 
                          |> writeReg rd op2 
        | (true, false) -> writeReg rd op2 state
        | _ -> state       
        
     //arithmetic shift right rm by rn, write into rd
    let asrR c s rd rm rn state = //if s: set N and Z only
        let op2 = shiftR (T_ASR) rm rn state
        match (c state, s) with
        | (true, true) -> state
                         |> setNZ op2
                         |> shiftSetCR s (T_ASR) rm rn 
                         |> writeReg rd op2 
        | (true, false) -> writeReg rd op2 state
        | _ -> state        
     
     //rotate right rm by rn, write into rd
    let rorR c s rd rm rn state = //if s: set N, Z and (C) only
        let op2 = shiftR (T_ROR) rm rn state
        match (c state, s) with
        | (true, true) -> state
                          |> setNZ op2 
                          |> shiftSetCR s (T_ROR) rm rn 
                          |> writeReg rd op2 
        | (true, false) -> writeReg rd op2 state
        | _ -> state             
        
     //rotate right (and extend) rm by 1, write into rd
    let rrxR c s rd rm state = //if s: set N, Z (and C) only
        let op2 = shiftR (T_RRX) rm (1) state
        match (c state, s) with
        | (true, true) -> state
                          |> setNZ op2 
                          |> shiftSetCR s (T_RRX) rm (1) 
                          |> writeReg rd op2 
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
        then writeReg 14 (readPC state) state
             |> writePC label 
        else state

    //branch to address stored in rm
    let bx c rm state =
        if c state
        then writePC ((readReg rm state)-4) state 
        else state

    //store address of next instruction in r14, branch to address indicated by op2
    let blxR c rm state = 
        if c state
        then writeReg 14 (readPC state) state
             |> writePC ((readReg rm state)-4) 
        else state

    let blxL label state = //only if no condition follows
        writeReg 14 (readPC state) state
        |> writePC label 

//ADR, LDR and STR (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0041c/Babcjaii.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/Bcfihdhj.html

    //writes the address corresponding to label into rd
    let adr c rd label state =
        if c state
        then writeReg rd label state  
        else state
        
    //Loads word from label to rd.
    let ldrWL c rd label state = 
        if c state
        then writeReg rd (readMem label state) state  
        else state
    
    //Loads least significant byte from label to rd.
    let ldrBL c rd label state = 
        if c state
        then writeReg rd ((readMem label state)&&&255) state  
        else state
        
    //More LDRs (details see ARMv4.md)
    let ldrWbI c inc rd rn i state = 
        if c state
        then match inc with 
             | true -> state
                       |> writeReg rd (readMem ((readReg rn state)+i) state)  
                       |> writeReg rn ((readReg rn state)+i)
             | false -> state
                        |> writeReg rd (readMem ((readReg rn state)+i) state) 
        else state
    
    let ldrWbR c inc rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then ldrWbI c inc rd rn op2 state
        else state
    
    let ldrWaI c rd rn i state = 
        if c state
        then state
             |> writeReg rd (readMem (readReg rn state) state)  
             |> writeReg rn ((readReg rn state)+i)
        else state
    
    let ldrWaR c rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then ldrWaI c rd rn op2 state
        else state
    
    let ldrBbI c inc rd rn i state = 
        if c state
        then match inc with 
             | true -> state
                       |> writeReg rd (readMem (((readReg rn state)+i)&&&255) state)  
                       |> writeReg rn ((readReg rn state)+i)
             | false -> state
                        |> writeReg rd (readMem (((readReg rn state)+i)&&&255) state)  
        else state
    
    let ldrBbR c inc rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then ldrBbI c inc rd rn op2 state
        else state
    
    let ldrBaI c rd rn i state = 
        if c state
        then state
             |> writeReg rd (readMem ((readReg rn state)&&&255) state)  
             |> writeReg rn ((readReg rn state)+i)
        else state
    
    let ldrBaR c rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then ldrBaI c rd rn op2 state
        else state
    
    //STRs (details see ARMv4.md)
    let strWbI c inc rd rn i state = 
        if c state
        then match inc with 
             | true -> state
                       |> writeMem ((readReg rn state)+i) (readReg rd state) 
                       |> writeReg rn ((readReg rn state)+i) 
             | false -> state
                        |> writeMem ((readReg rn state)+i) (readReg rd state) 
        else state
    
    let strWbR c inc rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then strWbI c inc rd rn op2 state
        else state
    
    let strWaI c rd rn i state = 
        if c state
        then state
             |> writeMem (readReg rn state) (readReg rd state) 
             |> writeReg rn ((readReg rn state)+i) 
        else state
    
    let strWaR c rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then strWaI c rd rn op2 state
        else state
    
    let strBbI c inc rd rn i state = 
        let memVal = (readMem ((readReg rn state)+i) state)  
        let regVal = readReg rd state
        let writeVal = ((~~~255)&&&memVal)|||(255&&&regVal) 
        if c state
        then match inc with 
             | true -> state
                       |> writeMem ((readReg rn state)+i) writeVal
                       |> writeReg rn ((readReg rn state)+i)
             | false -> state
                        |> writeMem ((readReg rn state)+i) writeVal
        else state
    
    let strBbR c inc rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then strBbI c inc rd rn op2 state
        else state
    
    let strBaI c rd rn i state = 
        let memVal = (readMem (readReg rn state) state) 
        let regVal = readReg rd state
        let writeVal = ((~~~255)&&&memVal)|||(255&&&regVal) 
        if c state
        then state
             |> writeMem (readReg rn state) writeVal
             |> writeReg rn ((readReg rn state)+i)
        else state
    
    let strBaR c rd rn rm rsinst nORrn rstype state = 
        let op2 =
            match rstype with
            |T_I -> shiftI rsinst rm nORrn state 
            |T_R -> shiftR rsinst rm nORrn state 
        if c state
        then strBaI c rd rn op2 state
        else state

//LDM and STM
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0068b/CIHCADDA.html
//see http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0473c/Cacbgchh.html for equivalent modes
    
    let rec ldmIA c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeReg hReg (readMem mem state) 
                                 |> loop (mem+4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem+(List.length reglist)*4) state) else state 
             |> loop startMem reglist
        else state
    
    let ldmIB c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeReg hReg (readMem mem state) 
                                 |> loop (mem+4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem+(List.length reglist)*4) state) else state
             |> loop (startMem+4) reglist
        else state
    
    let ldmDA c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeReg hReg (readMem mem state) 
                                 |> loop (mem-4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem-(List.length reglist)*4) state) else state
             |> loop startMem reglist
        else state
    
    let ldmDB c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeReg hReg (readMem mem state) 
                                 |> loop (mem-4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem-(List.length reglist)*4) state) else state
             |> loop (startMem-4) reglist
        else state
    
    let stmIA c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeMem mem (readReg hReg state) 
                                 |> loop (mem+4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem+(List.length reglist)*4) state) else state
             |> loop startMem reglist
        else state
        
    let stmIB c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeMem mem (readReg hReg state) 
                                 |> loop (mem+4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem+(List.length reglist)*4) state) else state
             |> loop (startMem+4) reglist
        else state
    
    let stmDA c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeMem mem (readReg hReg state) 
                                 |> loop (mem-4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem-(List.length reglist)*4) state) else state
             |> loop startMem reglist
        else state
    
    let stmDB c write rn reglist state = 
        let rec loop mem reglist state = 
            match reglist with
            | hReg :: tailReg -> state
                                 |> writeMem mem (readReg hReg state) 
                                 |> loop (mem-4) tailReg
            | [] -> state
        let startMem = readReg rn state
        if c state
        then if write then (writeReg rn (startMem-(List.length reglist)*4) state) else state
             |> loop (startMem-4) reglist
        else state
    
//DCD, EQU and FILL (DONE)
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0041c/Babbfcga.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0489h/Caccddic.html
//http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0489f/Babchded.html

    let dcd label valList state = 
        let rec loop mem vlist state = 
            match vlist with
            | (i,'i') :: tailList -> state
                                    |> writeMem mem i
                                    |> loop (mem+4) tailList

            | (r,'r') :: tailList -> state
                                    |> writeMem mem (readReg r state)
                                    |> loop (mem+4) tailList
            | (m,'m') :: tailList -> state
                                    |> writeMem mem (readMem m state)
                                    |> loop (mem+4) tailList
            | [] -> state
            | _ -> failwith "Invalid data type."
        loop label valList state
    
    let equ name value state = 
        match value with
        | (i,'i') -> writeMem name i state
        | (r,'r') -> writeMem name (readReg r state) state
        | (m,'m') -> writeMem name (readMem m state) state
        | _ -> failwith "Invalid data type."

    let fillW label data value state = 
        let rec loop mem n val2 state = 
            if n=0 then state else (state |> writeMem mem val2 |> loop (mem+4) (n-4) val2)
        loop label data value state
    
//END (DONE)
    //stop emulation
    let endI c finalInstAddr state = 
        if c state
        then writePC finalInstAddr state 
        else state
