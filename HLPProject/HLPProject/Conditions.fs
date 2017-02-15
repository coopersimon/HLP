// This module details the instruction condition codes.

namespace Common
module Conditions =
    
    open State

    // Condition functions
    /// Always condition.
    let checkAL state =
        true

    /// Equal condition.
    let checkEQ state =
        zFlag state

    /// Not equal condition.
    let checkNE state =
        not (zFlag state)

    /// Carry set condition.
    let checkCS state =
        cFlag state

    /// Carry clear condition.
    let checkCC state =
        not (cFlag state)

    /// Minus condition.
    let checkMI state =
        nFlag state

    /// Plus condition.
    let checkPL state =
        not (nFlag state)

    /// Overflow set condition
    let checkVS state =
        vFlag state

    /// Overflow clear condition
    let checkVC state =
        not (vFlag state)

    /// HI condition.
    let checkHI state =
        (cFlag state) && (not (zFlag state))

    /// LS condition.
    let checkLS state =
        (not (cFlag state)) || (zFlag state)

    /// Greater than or equal condition.
    let checkGE state =
        (nFlag state) = (vFlag state)

    /// Less than condition.
    let checkLT state =
        (nFlag state) <> (vFlag state)

    /// Greater than condition.
    let checkGT state =
        (not (zFlag state)) && ((nFlag state) = (vFlag state))

    /// Less than or equal condition.
    let checkLE state =
        (zFlag state) && ((nFlag state) <> (vFlag state))