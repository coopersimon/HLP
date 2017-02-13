// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    //open Common.Types
    open Interpret.ARMv4

    /// Parses a list of tokens, to a list of instructions, ready to execute.
    let parser tokLst =
        let rec parseRec pc = function
            //| T_MOV :: T_REG r :: T_INT i :: t -> Inst (T_MOV, r, i, pc) :: parseRec (pc + 4) t
            | T_MOV :: T_REG r :: T_INT i :: t -> mov r i :: parseRec (pc + 4) t
            | [] -> []
            | _ -> failwithf "unhandled parse error!"
        parseRec 0 tokLst