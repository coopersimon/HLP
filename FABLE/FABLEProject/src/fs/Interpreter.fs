// The interpreter, this reads instructions and calls the appropriate function.

namespace Interpret
module Interpreter =
    
    open Common.State
    open Common.Error
    open Common.Types

    /// Calls functions on map of (memloc * instructions).
    let rec interpret state instr =
        match Map.tryFind (readPC state) instr with
        | Some(Instr(l,f)) -> interpret (incPC (f state)) instr
        | Some(Terminate(l)) -> Ok(l,state)
        | Some(LabelRef(_)) -> Err(0,"Unresolved label (branch/adr) - this should have been resolved in the parser.")
        | Some(EndRef(_)) -> Err(0,"Unresolved termination - this should have been resolved in the parser.")
        | None -> Err(0,sprintf "Instruction does not exist at address %A." (readPC state))

    /// Runs ONLY the instruction pointed to by the PC in state.
    let interpretLine state instr =
        match Map.tryFind (readPC state) instr with
        | Some(Instr(l,f)) -> Ok(l, incPC (f state))
        | Some(Terminate(l)) -> Ok(l,state)
        | Some(LabelRef(_)) -> Err(0,"Unresolved label (branch/adr) - this should have been resolved in the parser.")
        | Some(EndRef(_)) -> Err(0,"Unresolved termination - this should have been resolved in the parser.")
        | None -> Err(0,sprintf "Instruction does not exist at address %A." (readPC state))