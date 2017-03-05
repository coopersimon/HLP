// The interpreter, this reads instructions and calls the appropriate function.

namespace Interpret
module Interpreter =
    
    open Common.State
    open Parse.Parser

    /// Calls functions on map of (memloc * instructions).
    let rec interpret state instr =
        match Map.tryFind (readPC state) instr with
        | Some(Instr(f)) -> interpret (f (incPC state)) instr
        | Some(Terminate) -> state
        | _ -> failwithf "Undefined interpreting error"