// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    open Interpret.ARMv4

    type Instruction = 
        | Branch of (Map<string,int> -> Instruction)
        | Instr of (Common.State.StateHandle -> Common.State.StateHandle)
        | Terminate

    let parser tokLst =
        /// Function that resolves branch.
        let branchTo c s (labels:Map<string,int>) =
            Instr(b c labels.[s])
        /// Replaces placeholder branch instructions with correct instructions.
        let rec resolveLabels labels = function
            | (m, Branch(x))::t -> (m, x labels) :: resolveLabels labels t
            | h::t -> h :: resolveLabels labels t
            | [] -> []
        /// Construct a list of instructions.
        let rec parseRec mem labels outLst = function
            | T_MOV c :: T_REG r :: T_COMMA :: T_INT i :: t -> parseRec (mem+4) labels (outLst@[(mem, Instr(movI c r i))]) t
            | T_B c :: T_LABEL s :: t -> parseRec (mem+4) labels (outLst@[(mem, Branch(branchTo c s))]) t
            | [] -> resolveLabels labels (outLst@[(mem, Terminate)])
            | _ -> failwithf "unhandled parse error"
        Map.ofList (parseRec 0 Map.empty [] tokLst)