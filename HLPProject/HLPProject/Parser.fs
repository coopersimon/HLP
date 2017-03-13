// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    open Interpret.ARMv4
    open Common.State
    open Common.Error

    type Instruction = 
        | Branch of (Map<string,int> -> Error<Instruction>)
        | Instr of (Common.State.StateHandle -> Common.State.StateHandle)
        | Terminate



    let parser tokLst =
        /// Function that resolves branch.
        let branchTo c s bInst (labels:Map<string,int>) =
            match Map.tryFind s labels with
            | Some(memLoc) -> Ok(Instr(bInst c memLoc))
            | None -> Err(sprintf "Label undefined: %s." s)
        /// Replaces placeholder branch instructions with correct instructions.
        let rec resolveLabels labels outLst = function
            | (m, Branch(x))::t -> match x labels with
                                   | Ok(h) -> resolveLabels labels (outLst@[(m, h)]) t
                                   | Err(s) -> Err(s)
            | h::t -> resolveLabels labels (outLst@[h]) t
            | [] -> Ok(outLst)
        (*let secondOperand instr c s rd outLst = function
            | T_REG rn :: T_COMMA :: T_SHIFT z :: T_INT i :: t -> ((outLst@[(mem, Instr(instr c s rd rn z i 'i'))]), t)
            | *)
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

            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subI c s rd rn i))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_INT i :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm z i 'i'))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: T_COMMA :: T_SHIFT z :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm z rs 'r'))]) t
            | T_SUB (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rm :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(subR c s rd rn rm T_NIL 0 'i'))]) t

            | T_MUL (c,s) :: T_REG rd :: T_COMMA :: T_REG rn :: T_COMMA :: T_REG rs :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(mulR c s rd rn rs))]) t

            | T_B c :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Branch(branchTo c s b))]) t
            | T_BL c :: T_LABEL s :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Branch(branchTo c s bl))]) t
            | T_BX c :: T_REG r :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Instr(bx c r))]) t

            | T_END :: t ->
                parseRec (mem+4) labels (outLst@[(mem, Terminate)]) t

            | T_LABEL s :: t -> parseRec mem (Map.add s mem labels) outLst t

            | [] -> resolveLabels labels [] (outLst@[(mem, Terminate)])

            | T_ERROR s :: t -> Err(sprintf "Invalid input string: %A." s)
            | tok :: t -> Err(sprintf "Unexpected token: %A." tok)
        // Convert output list to map for interpretation.
        match parseRec 0 Map.empty [] tokLst with
        | Ok(i) -> Ok(Map.ofList i)
        | Err(s) -> Err(s)