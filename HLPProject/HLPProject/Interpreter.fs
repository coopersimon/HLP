// The interpreter, this reads instructions and calls the appropriate function.

namespace Interpret
module Interpreter =
    
    open Common.Types

    /// Calls functions on list of instructions.
    let rec interpret state = function
        | (ml, f) :: t -> interpret (f state) t
        | [] -> state