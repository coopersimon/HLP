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
        readZFlag state

    /// Not equal condition.
    let checkNE state =
        not (readZFlag state)

    /// Carry set condition.
    let checkCS state =
        readCFlag state

    /// Carry clear condition.
    let checkCC state =
        not (readCFlag state)

    /// Minus condition.
    let checkMI state =
        readNFlag state

    /// Plus condition.
    let checkPL state =
        not (readNFlag state)

    /// Overflow set condition
    let checkVS state =
        readVFlag state

    /// Overflow clear condition
    let checkVC state =
        not (readVFlag state)

    /// HI condition.
    let checkHI state =
        (readCFlag state) && (not (readZFlag state))

    /// LS condition.
    let checkLS state =
        (not (readCFlag state)) || (readZFlag state)

    /// Greater than or equal condition.
    let checkGE state =
        (readNFlag state) = (readVFlag state)

    /// Less than condition.
    let checkLT state =
        (readNFlag state) <> (readVFlag state)

    /// Greater than condition.
    let checkGT state =
        (not (readZFlag state)) && ((readNFlag state) = (readVFlag state))

    /// Less than or equal condition.
    let checkLE state =
        (readZFlag state) && ((readNFlag state) <> (readVFlag state))