// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    open Interpret.ARMv4
    open Common.State
    open Common.Error
    open Common.Types

    /// Wrapper for instructions, including unresolved references - all with line numbers.
    type Instruction = 
        | LabelRef of (Map<string,int> -> Error<Instruction>)
        | EndRef of (int -> Instruction)
        //| MemRef of ()
        | Instr of int*(Common.State.StateHandle -> Common.State.StateHandle)
        | Terminate of int


    let private resolveRefs labels endMem instrLst =
        /// Replaces placeholder branch and end references with correct instructions.
        let rec resolveRec labels endMem outLst = function
            | (m, LabelRef(f))::t -> match f labels with
                                       | Ok(h) -> resolveRec labels endMem (outLst@[(m, h)]) t
                                       | Err(l,s) -> Err(l,s)
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
            | false -> Err(0,"Register range invalid.")

        /// Gets register list from {}, for LDM/STM
        let rec regRec outLst = function
            | T_REG r :: T_COMMA :: t -> regRec (outLst@[r]) t
            | T_REG r1 :: T_DASH :: T_REG r2 :: T_COMMA :: t ->
                match regRange r1 r2 [] with
                | Ok(lst) -> regRec (outLst@lst) t
                | Err(_,s) -> Err(0,s)
            | T_REG r :: T_R_CBR :: t -> Ok(outLst@[r], t)
            | T_REG r1 :: T_DASH :: T_REG r2 :: T_R_CBR :: t ->
                match regRange r1 r2 [] with
                | Ok(lst) -> Ok(outLst@lst, t)
                | Err(_,s) -> Err(0,s)
            | T_ERROR s :: t -> Err(0,sprintf "Invalid input string: %s." s)
            | tok :: t -> Err(0,sprintf "Unexpected token: %A. Followed by: %s." tok (errorList t))
            | [] -> Err(0,sprintf "Incomplete register range.")
        regRec [] tokLst


    /// Parses a list of tokens into a memory map of instructions.
    let parser tokLst =
        /// Function that resolves branch.
        let branchRef l c s bInst (labels:Map<string,int>) =
            match Map.tryFind s labels with
            | Some(memLoc) -> Ok(Instr(l, bInst c (memLoc-4)))
            | None -> Err(l,sprintf "Label undefined: %s." s)

        /// Function that resolves ldr =label.
        let lsaRef l c rd s inst (labels:Map<string,int>) =
            match Map.tryFind s labels with
            | Some(memLoc) -> Ok(Instr(l, inst c rd memLoc))
            | None -> Err(l,sprintf "Label undefined: %s." s)

        /// Function that resolves end.
        let endRef l c endMem =
            Instr(l, endI c (endMem-4))

        /// Construct a list of instructions.
        let rec parseRec m l labels outLst = function
            // ARITHMETIC

            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, movI c s rd i))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, movR c s rd rm z i T_I))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, movR c s rd rm z rs T_R))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, movR c s rd rm T_LSL 0 T_I))]) t

            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, mvnI c s rd i))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, mvnR c s rd rm z i T_I))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, mvnR c s rd rm z rs T_R))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, mvnR c s rd rm T_LSL 0 T_I))]) t

            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, addI c s rd rn i))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, addR c s rd rn rm z i T_I))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, addR c s rd rn rm z rs T_R))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, addR c s rd rn rm T_LSL 0 T_I))]) t

            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, adcI c s rd rn i))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, adcR c s rd rn rm z i T_I))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, adcR c s rd rn rm z rs T_R))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, adcR c s rd rn rm T_LSL 0 T_I))]) t

            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, subI c s rd rn i))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, subR c s rd rn rm z i T_I))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, subR c s rd rn rm z rs T_R))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, subR c s rd rn rm T_LSL 0 T_I))]) t

            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, sbcI c s rd rn i))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, sbcR c s rd rn rm z i T_I))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, sbcR c s rd rn rm z rs T_R))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, sbcR c s rd rn rm T_LSL 0 T_I))]) t

            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rsbI c s rd rn i))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rsbR c s rd rn rm z i T_I))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rsbR c s rd rn rm z rs T_R))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rsbR c s rd rn rm T_LSL 0 T_I))]) t

            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rscI c s rd rn i))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rscR c s rd rn rm z i T_I))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rscR c s rd rn rm z rs T_R))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rscR c s rd rn rm T_LSL 0 T_I))]) t

            | T_MUL (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, mulR c s rd rm rs))]) t

            | T_MLA (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rs :: T_COMMA :: T_REG rn :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, mlaR c s rd rm rs rn))]) t

            // LOGIC
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, andI c s rd rn i))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, andR c s rd rn rm z i T_I))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, andR c s rd rn rm z rs T_R))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, andR c s rd rn rm T_LSL 0 T_I))]) t

            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, orrI c s rd rn i))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, orrR c s rd rn rm z i T_I))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, orrR c s rd rn rm z rs T_R))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, orrR c s rd rn rm T_LSL 0 T_I))]) t

            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, eorI c s rd rn i))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, eorR c s rd rn rm z i T_I))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, eorR c s rd rn rm z rs T_R))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, eorR c s rd rn rm T_LSL 0 T_I))]) t

            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, bicI c s rd rn i))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, bicR c s rd rn rm z i T_I))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, bicR c s rd rn rm z rs T_R))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, bicR c s rd rn rm T_LSL 0 T_I))]) t

            // COMPARISON
            | T_CMP c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmpI c rn i))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmpR c rn rm z i T_I))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmpR c rn rm z rs T_R))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmpR c rn rm T_LSL 0 T_I))]) t

            | T_CMN c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmnI c rn i))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmnR c rn rm z i T_I))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmnR c rn rm z rs T_R))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, cmnR c rn rm T_LSL 0 T_I))]) t

            | T_TST c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstI c rn i))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstR c rn rm z i T_I))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstR c rn rm z rs T_R))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstR c rn rm T_LSL 0 T_I))]) t

            | T_TEQ c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, teqI c rn i))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, teqR c rn rm z i T_I))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, teqR c rn rm z rs T_R))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, teqR c rn rm T_LSL 0 T_I))]) t

            // BITWISE
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstI c rn i))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstR c rn rm z i T_I))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstR c rn rm z rs T_R))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, tstR c rn rm T_LSL 0 T_I))]) t

            | T_SHIFT (T_LSL,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, lslR c s rd rm rn))]) t

            | T_SHIFT (T_LSR,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, lsrR c s rd rm rn))]) t

            | T_SHIFT (T_ASR,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, asrR c s rd rm rn))]) t

            | T_SHIFT (T_ROR,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rn :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rorR c s rd rm rn))]) t

            | T_SHIFT (T_RRX,(c,s)) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, rrxR c s rd rm))]) t

            // BRANCHING
            | T_B c :: T_LABEL s :: t ->
                parseRec (m+4) l labels (outLst@[(m, LabelRef(branchRef l c s b))]) t
            | T_BL c :: T_LABEL s :: t ->
                parseRec (m+4) l labels (outLst@[(m, LabelRef(branchRef l c s bl))]) t
            | T_BX c :: T_REG r :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, bx c r))]) t

            // MEMORY
            | T_ADR c :: T_REG rd :: T_COMMA :: T_LABEL s :: t ->
                parseRec (m+4) l labels (outLst@[(m, LabelRef(lsaRef l c rd s adr))]) t

            // LOAD SINGLE
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWaR c rd rn rm z i T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWaR c rd rn rm z rs T_R))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWaI c rd rn i))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWaR c rd rn rm T_LSL 0 T_I))]) t

            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBaR c rd rn rm z i T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBaR c rd rn rm z rs T_R))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBaI c rd rn i))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBaR c rd rn rm T_LSL 0 T_I))]) t

            | T_LDR c :: T_REG rd :: T_COMMA :: T_EQUAL :: T_LABEL s :: t ->
                parseRec (m+4) l labels (outLst@[(m, LabelRef(lsaRef l c rd s ldrWL))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbI c false rd rn 0))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbI c true rd rn i))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbI c false rd rn i))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbR c true rd rn rm z i T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbR c false rd rn rm z i T_I))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbR c true rd rn rm z rs T_R))]) t
            | T_LDR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrWbR c false rd rn rm z rs T_R))]) t

            | T_LDRB c :: T_REG rd :: T_COMMA :: T_EQUAL :: T_LABEL s :: t ->
                parseRec (m+4) l labels (outLst@[(m, LabelRef(lsaRef l c rd s ldrBL))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbI c false rd rn 0))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbI c true rd rn i))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbI c false rd rn i))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbR c true rd rn rm z i T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbR c false rd rn rm z i T_I))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbR c true rd rn rm z rs T_R))]) t
            | T_LDRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, ldrBbR c false rd rn rm z rs T_R))]) t

            // STORE SINGLE
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWaR c rd rn rm z i T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWaR c rd rn rm z rs T_R))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWaI c rd rn i))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWaR c rd rn rm T_LSL 0 T_I))]) t

            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBaR c rd rn rm z i T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBaR c rd rn rm z rs T_R))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_INT i :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBaI c rd rn i))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: T_COMMA :: T_REG rm :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBaR c rd rn rm T_LSL 0 T_I))]) t

            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbI c false rd rn 0))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbI c true rd rn i))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbI c false rd rn i))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbR c true rd rn rm z i T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbR c false rd rn rm z i T_I))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbR c true rd rn rm z rs T_R))]) t
            | T_STR c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strWbR c false rd rn rm z rs T_R))]) t

            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbI c false rd rn 0))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbI c true rd rn i))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbI c false rd rn i))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbR c true rd rn rm T_LSL 0 T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbR c false rd rn rm T_LSL 0 T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbR c true rd rn rm z i T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_INT i :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbR c false rd rn rm z i T_I))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: T_EXCL :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbR c true rd rn rm z rs T_R))]) t
            | T_STRB c :: T_REG rd :: T_COMMA :: T_L_BRAC :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT (z,_) :: T_REG rs :: T_R_BRAC :: t ->
                parseRec (m+4) l labels (outLst@[(m, Instr(l, strBbR c false rd rn rm z rs T_R))]) t

            // LOAD MULTIPLE
            | T_LDM (c,S_IA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmIA c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_LDM (c,S_IA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmIA c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_LDM (c,S_IB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmIB c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_LDM (c,S_IB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmIB c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_LDM (c,S_DA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmDA c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_LDM (c,S_DA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmDA c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_LDM (c,S_DB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmDB c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_LDM (c,S_DB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, ldmDB c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)

            // STORE MULTIPLE
            | T_STM (c,S_IA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmIA c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_STM (c,S_IA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmIA c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_STM (c,S_IB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmIB c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_STM (c,S_IB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmIB c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_STM (c,S_DA) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmDA c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_STM (c,S_DA) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmDA c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_STM (c,S_DB) :: T_REG rn :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmDB c false rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)
            | T_STM (c,S_DB) :: T_REG rn :: T_EXCL :: T_COMMA :: t ->
                match regList t with
                | Ok(rl, tokLst) -> parseRec (m+4) l labels (outLst@[(m, Instr(l, stmDB c true rn rl))]) tokLst
                | Err(_,s) -> Err(l,s)

            // DIRECTIVES
            | T_LABEL s :: T_EQU :: T_INT i :: t ->
                parseRec m l (Map.add s i labels) outLst t
            | T_LABEL s1 :: T_EQU :: T_LABEL s2 :: t ->
                match Map.tryFind s2 labels with
                | Some(n) -> parseRec m l (Map.add s1 n labels) outLst t
                | None -> Err(l,sprintf "Undefined label: %s." s2)

            //| T_LABEL 

            | T_END c :: t ->
                parseRec (m+4) l labels (outLst@[(m, EndRef(endRef l c))]) t

            | T_LABEL s :: t -> parseRec m l (Map.add s (m) labels) outLst t

            | [] -> resolveRefs labels m (outLst@[(m, Terminate(l))])

            | T_NEWLINE :: t -> parseRec m (l+1) labels outLst t

            | T_ERROR s :: t -> Err(l,sprintf "Invalid input string: %s." s)
            | tok :: t -> Err(l,sprintf "Unexpected token: %A. Followed by: %s." tok (errorList t))
        // Convert output list to map for interpretation.
        match parseRec 0 1 Map.empty [] tokLst with
        | Ok(i) -> Ok(Map.ofList i)
        | Err(l,s) -> Err(l,s)