// The interpreter, this reads instructions and calls the appropriate function.

namespace Interpret
module Interpreter =
    
    open Common.State
    open Common.Error
    open Parse.Parser

    /// Calls functions on map of (memloc * instructions).
    let rec interpret state instr =
        match Map.tryFind (readPC state) instr with
        | Some(Instr(f)) -> interpret (incPC (f state)) instr
        | Some(Terminate) -> Ok(state)
        | Some(LabelRef(_)) -> Err("Unresolved label (branch/adr) - this should have been resolved in the parser.")
        | Some(EndRef(_)) -> Err("Unresolved termination - this should have been resolved in the parser.")
        | None -> Err(sprintf "Instruction does not exist at address %A." (readPC state))