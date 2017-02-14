// This module details the instruction condition codes.

namespace Common
module Conditions =
    
    open State

    /// Conditions for instructions.
    type Cond =
        | EQ | NE | CS | CC | MI | PL | VS | VC | HI | LS | GE | LT | GT | LE | AL

    /// Checks condition, returns true or false.
    let checkCond state = function
        | AL -> true
        | EQ -> zFlag state
        | NE -> not (zFlag state)
        | CS -> cFlag state
        | CC -> not (cFlag state)
        | MI -> nFlag state
        | PL -> not (nFlag state)
        | VS -> vFlag state
        | VC -> not (vFlag state)
        | HI -> (cFlag state) && (not (zFlag state))
        | LS -> (not (cFlag state)) || (zFlag state)
        | GE -> (nFlag state) = (vFlag state)
        | LT -> (nFlag state) <> (vFlag state)
        | GT -> (not (zFlag state)) && ((nFlag state) = (vFlag state))
        | LE -> (zFlag state) && ((nFlag state) <> (vFlag state))