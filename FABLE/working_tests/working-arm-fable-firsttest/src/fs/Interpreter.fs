// The interpreter, this reads instructions and calls the appropriate function.

namespace Interpret
module Interpreter =
    
    open Common.State

    /// Calls functions on map of (memloc * instructions).
    let rec interpret state instr =
        match Map.tryFind (readPC state) instr with
        | Some(f) -> interpret (f (incPC state)) instr
        | None -> state