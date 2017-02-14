// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    open Interpret.ARMv4

    /// Parses a list of tokens, to a list of instructions, ready to execute.
    let parser tokLst =
        let rec parseRec ml = function
            | T_MOV :: T_REG r :: T_INT i :: t -> (ml, mov r i) :: parseRec (ml + 4) t
            | [] -> []
            | _ -> failwithf "unhandled parse error!"
        Map.ofList (parseRec 0 tokLst)