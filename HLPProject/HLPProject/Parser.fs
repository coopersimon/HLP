﻿// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    open Interpret.ARMv4
    open Common.State
    open Common.Error
    open Common.Types

    /// Wrapper for instructions, including unresolved references.
    type Instruction = 
        | LabelRef of (Map<string,int> -> Error<Instruction>)
        | EndRef of (int -> Instruction)
        //| MemRef of ()
        | Instr of (Common.State.StateHandle -> Common.State.StateHandle)
        | Terminate


    let private resolveRefs labels endMem instrLst =
        /// Replaces placeholder branch and end references with correct instructions.
        let rec resolveRec labels endMem outLst = function
            | (m, LabelRef(f))::t -> match f labels with
                                     | Ok(h) -> resolveRec labels endMem (outLst@[(m, h)]) t
                                     | Err(s) -> Err(s)
            | (m, EndRef(f))::t -> resolveRec labels endMem (outLst@[(m, f endMem)]) t
            | h::t -> resolveRec labels endMem (outLst@[h]) t
            | [] -> Ok(outLst)
        resolveRec labels endMem [] instrLst


    /// Make a list of registers for LDM/STM, from token list.
    let private regList tokLst =
        /// Gets register range {Rx-Ry}
        let rec regRange r1 r2 outLst =
            match r1 < r2 with
            | true -> regRange (r1+1) r2 (outLst@[r1])
            | false when r1=r2 -> Ok(outLst@[r1])
            | false -> Err("Register range invalid.")

        /// Gets register list from {}, for LDM/STM
        let rec regRec outLst = function
            | T_REG r :: T_COMMA :: t -> regRec (outLst@[r]) t
            | T_REG r1 :: T_DASH :: T_REG r2 :: T_COMMA :: t ->
                match regRange r1 r2 [] with
                | Ok(lst) -> regRec (outLst@lst) t
                | Err(s) -> Err(s)
            | T_REG r :: T_R_CBR :: t -> Ok(outLst@[r], t)
            | T_REG r1 :: T_DASH :: T_REG r2 :: T_R_CBR :: t ->
                match regRange r1 r2 [] with
                | Ok(lst) -> Ok(outLst@lst, t)
                | Err(s) -> Err(s)
            | T_ERROR s :: t -> Err(sprintf "Invalid input string: %s." s)
            | tok :: t -> Err(sprintf "Unexpected token: %A. Followed by: %s." tok (errorList t))
            | [] -> Err(sprintf "Incomplete register range.")
        regRec [] tokLst


    /// Parses a list of tokens into a memory map of instructions.
    let parser tokLst =
        /// Function that resolves branch.
        let branchRef c s bInst (labels:Map<string,int>) =
            match Map.tryFind s labels with
            | Some(memLoc) -> Ok(Instr(bInst c (memLoc-4)))
            | None -> Err(sprintf "Label undefined: %s." s)

        /// Function that resolves ldr =label.
        let lsaRef c rd s inst (labels:Map<string,int>) =
            match Map.tryFind s labels with
            | Some(memLoc) -> Ok(Instr(inst c rd memLoc))
            | None -> Err(sprintf "Label undefined: %s." s)

        /// Function that resolves end.
        let endRef c endMem =
            Instr(endI c (endMem-4))

        /// Construct a list of instructions.
        let rec parseRec mem labels outLst = function
            // ARITHMETIC

            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movI c s rd i))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movR c s rd rm z i T_I))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movR c s rd rm z rs T_R))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movR c s rd rm T_LSL 0 T_I))]) t

            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnI c s rd i))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnR c s rd rm z i T_I))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnR c s rd rm z rs T_R))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnR c s rd rm T_LSL 0 T_I))]) t

            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addI c s rd rn i))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addR c s rd rn rm z i T_I))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addR c s rd rn rm z rs T_R))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addR c s rd rn rm T_LSL 0 T_I))]) t

            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcI c s rd rn i))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcR c s rd rn rm z i T_I))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcR c s rd rn rm z rs T_R))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcR c s rd rn rm T_LSL 0 T_I))]) t

            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subI c s rd rn i))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm z i T_I))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm z rs T_R))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm T_LSL 0 T_I))]) t

            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcI c s rd rn i))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcR c s rd rn rm z i T_I))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcR c s rd rn rm z rs T_R))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcR c s rd rn rm T_LSL 0 T_I))]) t

            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbI c s rd rn i))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbR c s rd rn rm z i T_I))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbR c s rd rn rm z rs T_R))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbR c s rd rn rm T_LSL 0 T_I))]) t

            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscI c s rd rn i))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscR c s rd rn rm z i T_I))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscR c s rd rn rm z rs T_R))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscR c s rd rn rm T_LSL 0 T_I))]) t

            | T_MUL (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mulR c s rd rm rs))]) t

            | T_MLA (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rs :: T_COMMA :: T_REG rn :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mlaR c s rd rm rs rn))]) t

            // LOGIC
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andI c s rd rn i))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andR c s rd rn rm z i T_I))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andR c s rd rn rm z rs T_R))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andR c s rd rn rm T_LSL 0 T_I))]) t

            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrI c s rd rn i))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrR c s rd rn rm z i T_I))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrR c s rd rn rm z rs T_R))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrR c s rd rn rm T_LSL 0 T_I))]) t

            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorI c s rd rn i))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorR c s rd rn rm z i T_I))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorR c s rd rn rm z rs T_R))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorR c s rd rn rm T_LSL 0 T_I))]) t

            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicI c s rd rn i))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicR c s rd rn rm z i T_I))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicR c s rd rn rm z rs T_R))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicR c s rd rn rm T_LSL 0 T_I))]) t

            // COMPARISON
            | T_CMP c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpI c rn i))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpR c rn rm z i T_I))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpR c rn rm z rs T_R))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpR c rn rm T_LSL 0 T_I))]) t

            | T_CMN c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnI c rn i))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnR c rn rm z i T_I))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnR c rn rm z rs T_R))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnR c rn rm T_LSL 0 T_I))]) t

            | T_TST c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstI c rn i))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z i T_I))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z rs T_R))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm T_LSL 0 T_I))]) t

            | T_TEQ c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqI c rn i))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqR c rn rm z i T_I))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqR c rn rm z rs T_R))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqR c rn rm T_LSL 0 T_I))]) t

            // BITWISE
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstI c rn i))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z i T_I))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z rs T_R))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm T_LSL 0 T_I))]) t

            | T_SHIFT (T_LSL,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(lslR c s rd rm rn))]) t

            | T_SHIFT (T_LSR,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(lsrR c s rd rm rn))]) t

            | T_SHIFT (T_ASR,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(asrR c s rd rm rn))]) t

            | T_SHIFT (T_ROR,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rorR c s rd rm rn))]) t

            | T_SHIFT (T_RRX,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rrxR c s rd rm))]) t

            // BRANCHING
            | T_B c :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, LabelRef(branchRef c s b))]) t
            | T_BL c :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, LabelRef(branchRef c s bl))]) t
            | T_BX c :: T_REG r :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bx c r))]) t

            // MEMORY
            | T_ADR c :: T_REG rd :: T_COMMA :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, LabelRef(lsaRef c rd s adr))]) t

            // LOAD SINGLE
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWaR c rd rn rm z i T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWaR c rd rn rm z rs T_R))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWaI c rd rn i))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWaR c rd rn rm T_LSL 0 T_I))]) t

            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBaR c rd rn rm z i T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBaR c rd rn rm z rs T_R))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBaI c rd rn i))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBaR c rd rn rm T_LSL 0 T_I))]) t

            | T_LDR c :: T_REG rd :: T_COMMA :: T_EQUAL :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, LabelRef(lsaRef c rd s ldrWL))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbI c false rd rn 0))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbI c true rd rn i))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbI c false rd rn i))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbR c true rd rn rm z i T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbR c false rd rn rm z i T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbR c true rd rn rm z rs T_R))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrWbR c false rd rn rm z rs T_R))]) t

            | T_LDRB c :: T_REG rd :: T_COMMA :: T_EQUAL :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, LabelRef(lsaRef c rd s ldrBL))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbI c false rd rn 0))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbI c true rd rn i))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbI c false rd rn i))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbR c true rd rn rm z i T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbR c false rd rn rm z i T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbR c true rd rn rm z rs T_R))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(ldrBbR c false rd rn rm z rs T_R))]) t

            // STORE SINGLE
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWaR c rd rn rm z i T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWaR c rd rn rm z rs T_R))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWaI c rd rn i))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWaR c rd rn rm T_LSL 0 T_I))]) t

            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBaR c rd rn rm z i T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBaR c rd rn rm z rs T_R))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBaI c rd rn i))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBaR c rd rn rm T_LSL 0 T_I))]) t

            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbI c false rd rn 0))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbI c true rd rn i))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbI c false rd rn i))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbR c true rd rn rm z i T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbR c false rd rn rm z i T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbR c true rd rn rm z rs T_R))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strWbR c false rd rn rm z rs T_R))]) t

            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbI c false rd rn 0))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbI c true rd rn i))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbI c false rd rn i))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbR c true rd rn rm z i T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbR c false rd rn rm z i T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbR c true rd rn rm z rs T_R))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(strBbR c false rd rn rm z rs T_R))]) t

            // LOAD MULTIPLE
            | T_LDM (c,S_IA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmIA c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_LDM (c,S_IA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmIA c true rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_LDM (c,S_IB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmIB c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_LDM (c,S_IB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmIB c true rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_LDM (c,S_DA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmDA c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_LDM (c,S_DA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmDA c true rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_LDM (c,S_DB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmDB c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_LDM (c,S_DB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(ldmDB c true rn rl))]) tokLst
                | Err(s) -> Err(s)

            // STORE MULTIPLE
            | T_STM (c,S_IA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmIA c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_STM (c,S_IA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmIA c true rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_STM (c,S_IB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmIB c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_STM (c,S_IB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmIB c true rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_STM (c,S_DA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmDA c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_STM (c,S_DA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmDA c true rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_STM (c,S_DB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmDB c false rn rl))]) tokLst
                | Err(s) -> Err(s)
            | T_STM (c,S_DB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (mem+4) labels (outLst@[(mem, Instr(stmDB c true rn rl))]) tokLst
                | Err(s) -> Err(s)

            // DIRECTIVES
            | T_LABEL s :: T_EQU :: T_INT i :: t ->
                parseRec mem (Map.add s i labels) outLst t
            | T_LABEL s1 :: T_EQU :: T_LABEL s2 :: t ->
                match Map.tryFind s2 labels with
                | Some(n) -> parseRec mem (Map.add s1 n labels) outLst t
                | None -> Err(sprintf "Undefined label: %s." s2)

            //| T_LABEL 

            | T_END c :: t ->
                parseRec (mem+4) labels (outLst@[(mem, EndRef(endRef c))]) t

            | T_LABEL s :: t -> parseRec mem (Map.add s (mem) labels) outLst t

            | [] -> resolveRefs labels mem (outLst@[(mem, Terminate)])

            | T_ERROR s :: t -> Err(sprintf "Invalid input string: %s." s)
            | tok :: t -> Err(sprintf "Unexpected token: %A. Followed by: %s." tok (errorList t))
        // Convert output list to map for interpretation.
        match parseRec 0 Map.empty [] tokLst with
        | Ok(i) -> Ok(Map.ofList i)
        | Err(s) -> Err(s)