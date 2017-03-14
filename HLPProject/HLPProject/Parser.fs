﻿// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    open Interpret.ARMv4
    open Common.State
    open Common.Error

    type Instruction = 
        | Branch of (Map<string,int> -> Error<Instruction>)
        | End of (int -> Instruction)
        | Instr of (Common.State.StateHandle -> Common.State.StateHandle)
        | Terminate




    let parser tokLst =
        /// Function that resolves branch.
        let branchRef c s bInst (labels:Map<string,int>) =
            match Map.tryFind s labels with
            | Some(memLoc) -> Ok(Instr(bInst c memLoc))
            | None -> Err(sprintf "Label undefined: %s." s)

        /// Function that resolves end.
        let endRef c endMem =
            Instr(endI c endMem)

        /// Replaces placeholder branch and end references with correct instructions.
        let rec resolveRefs labels endMem outLst = function
            | (m, Branch(f))::t -> match f labels with
                                   | Ok(h) -> resolveRefs labels endMem (outLst@[(m, h)]) t
                                   | Err(s) -> Err(s)
            | (m, End(f))::t -> resolveRefs labels endMem (outLst@[(m, f endMem)]) t
            | h::t -> resolveRefs labels endMem (outLst@[h]) t
            | [] -> Ok(outLst)

        /// Construct a list of instructions.
        let rec parseRec mem labels outLst = function
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movI c s rd i))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movR c s rd rm z i 'i'))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movR c s rd rm z rs 'r'))]) t
            | T_MOV (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(movR c s rd rm T_NIL 0 'i'))]) t

            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnI c s rd i))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnR c s rd rm z i 'i'))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnR c s rd rm z rs 'r'))]) t
            | T_MVN (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mvnR c s rd rm T_NIL 0 'i'))]) t


            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addI c s rd rn i))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addR c s rd rn rm z i 'i'))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addR c s rd rn rm z rs 'r'))]) t
            | T_ADD (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(addR c s rd rn rm T_NIL 0 'i'))]) t

            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcI c s rd rn i))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcR c s rd rn rm z i 'i'))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcR c s rd rn rm z rs 'r'))]) t
            | T_ADC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(adcR c s rd rn rm T_NIL 0 'i'))]) t

            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subI c s rd rn i))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm z i 'i'))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm z rs 'r'))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm T_NIL 0 'i'))]) t

            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcI c s rd rn i))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcR c s rd rn rm z i 'i'))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcR c s rd rn rm z rs 'r'))]) t
            | T_SBC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(sbcR c s rd rn rm T_NIL 0 'i'))]) t

            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbI c s rd rn i))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbR c s rd rn rm z i 'i'))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbR c s rd rn rm z rs 'r'))]) t
            | T_RSB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rsbR c s rd rn rm T_NIL 0 'i'))]) t

            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscI c s rd rn i))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscR c s rd rn rm z i 'i'))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscR c s rd rn rm z rs 'r'))]) t
            | T_RSC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(rscR c s rd rn rm T_NIL 0 'i'))]) t

            | T_MUL (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mulR c s rd rm rs))]) t

            | T_MLA (c,s) :: T_REG rd :: T_COMMA :: T_REG rm :: T_COMMA :: T_REG rs :: T_COMMA :: T_REG rn :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mlaR c s rd rm rs rn))]) t

            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andI c s rd rn i))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andR c s rd rn rm z i 'i'))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andR c s rd rn rm z rs 'r'))]) t
            | T_AND (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(andR c s rd rn rm T_NIL 0 'i'))]) t

            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrI c s rd rn i))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrR c s rd rn rm z i 'i'))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrR c s rd rn rm z rs 'r'))]) t
            | T_ORR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(orrR c s rd rn rm T_NIL 0 'i'))]) t

            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorI c s rd rn i))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorR c s rd rn rm z i 'i'))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorR c s rd rn rm z rs 'r'))]) t
            | T_EOR (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(eorR c s rd rn rm T_NIL 0 'i'))]) t

            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicI c s rd rn i))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicR c s rd rn rm z i 'i'))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicR c s rd rn rm z rs 'r'))]) t
            | T_BIC (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bicR c s rd rn rm T_NIL 0 'i'))]) t

            | T_CMP c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpI c rn i))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpR c rn rm z i 'i'))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpR c rn rm z rs 'r'))]) t
            | T_CMP c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmpR c rn rm T_NIL 0 'i'))]) t

            | T_CMN c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnI c rn i))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnR c rn rm z i 'i'))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnR c rn rm z rs 'r'))]) t
            | T_CMN c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(cmnR c rn rm T_NIL 0 'i'))]) t

            | T_TST c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstI c rn i))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z i 'i'))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z rs 'r'))]) t
            | T_TST c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm T_NIL 0 'i'))]) t

            | T_TEQ c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqI c rn i))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqR c rn rm z i 'i'))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqR c rn rm z rs 'r'))]) t
            | T_TEQ c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(teqR c rn rm T_NIL 0 'i'))]) t

            | T_CLZ c :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstI c rn i))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z i 'i'))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm z rs 'r'))]) t
            | T_CLZ c :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(tstR c rn rm T_NIL 0 'i'))]) t

            | T_B c :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Branch(branchRef c s b))]) t
            | T_BL c :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Branch(branchRef c s bl))]) t
            | T_BX c :: T_REG r :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bx c r))]) t

            | T_END c :: t ->
                parseRec (mem+4) labels (outLst@[(mem, End(endRef c))]) t

            | T_LABEL s :: t -> parseRec mem (Map.add s (mem-4) labels) outLst t

            | [] -> resolveRefs labels mem [] (outLst@[(mem, Terminate)])

            | T_ERROR s :: t -> Err(sprintf "Invalid input string: %A." s)
            | tok :: t -> Err(sprintf "Unexpected token: %A." tok)
        // Convert output list to map for interpretation.
        match parseRec 0 Map.empty [] tokLst with
        | Ok(i) -> Ok(Map.ofList i)
        | Err(s) -> Err(s)