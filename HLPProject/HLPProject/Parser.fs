// This module contains the parser:

namespace Parse
module Parser =
    
    open Tokeniser
    open Interpret.ARMv4
    open Common.State

    type Instruction = 
        | Branch of (Map<string,int> -> Instruction)
        | Instr of (Common.State.StateHandle -> Common.State.StateHandle)
        | Terminate

    let shiftI inst r n state =
        //let rsfuncI s inst ri i state = //make sure interpretter only gives capped strings for inst
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

    let shiftR inst r rn state =
        shiftI inst r (readReg rn state) state

    let shiftSetCI s inst r n state =
        |T_ROR -> if s then writeCFlag (((readReg r state)>>>(n-1))%2<>0) state else state 
        |T_RRX -> if s then writeCFlag ((readReg r state)%2<>0) state else state

    let shiftSetCR s inst r rn state = 
        shiftSetCI s inst r (readReg rn state) state

    let parser tokLst =
        /// Function that resolves branch.
        let branchTo c s (labels:Map<string,int>) =
            match Map.tryFind s labels with
            | Some(memLoc) -> Instr(b c memLoc)
            | None -> failwithf "branch label doesn't exist!"
        /// Replaces placeholder branch instructions with correct instructions.
        let rec resolveLabels labels = function
            | (m, Branch(x))::t -> (m, x labels) :: resolveLabels labels t
            | h::t -> h :: resolveLabels labels t
            | [] -> []
        /// Construct a list of instructions.
        let rec parseRec mem labels outLst = function
            | T_MOV (c,s) :: T_REG r :: T_COMMA :: T_INT i :: t -> 
                parseRec (mem+4) labels (outLst@[(mem, Instr(movI c s r i))]) t
            | T_MOV (c,s) :: T_REG r1 :: T_COMMA :: T_REG r2 :: T_COMMA :: T_SHIFT z :: T_INT i :: t -> 
                parseRec (mem+4) labels (outLst@[(mem, Instr(movR c s r1 r2))]) t
            | T_B c :: T_LABEL s :: t -> parseRec (mem+4) labels (outLst@[(mem, Branch(branchTo c s))]) t
            | T_LABEL s :: t -> parseRec mem (Map.add s mem labels) outLst t
            | [] -> resolveLabels labels (outLst@[(mem, Terminate)])
            | _ -> failwithf "unhandled parse error"
        Map.ofList (parseRec 0 Map.empty [] tokLst)
