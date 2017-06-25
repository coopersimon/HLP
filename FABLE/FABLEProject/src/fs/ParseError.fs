// This module contains the error messages used in the parser.

namespace Parse
module ParseError =

    open Common.Error
    open Common.Types

    /// Return first 5 elements of list.
    let errorList lst =
        let rec addToStr lst n =
            match n < 10 with
            | true -> match lst with
                      | h::t -> (sprintf "%A" h) + "; " + (addToStr t (n+1))
                      | [] -> ""
            | false -> ""
        addToStr lst 0

    /// Register range out of bounds.
    let invalidRegRange l = Err(l,"Register range invalid. Must be a continuous sequence of registers. e.g. {R1-R3, R5, R8-R11}")

    /// Error token - an unrecognised string.
    let invalidToken l s = Err(l,sprintf "Invalid input string: %s. This might be a typo, a non-existent register or an invalid label." s)

    /// Valid token which appears unexpectedly. Prints the following 5 tokens to give context
    let unexpectedToken l t lst = Err(l,sprintf "Unexpected token: %A. Followed by: %s. Check the supported arguments for the instruction." t (errorList lst))

    /// Attempt to access label(symbol) which is undefined.
    let undefinedLabel l s = Err(l,sprintf "Label undefined: %s. It is being referenced but doesn't point anywhere. This might be a typo." s)

    /// 12-bit immediate value incorrect. Must be 8-bit value shifted by 5 bits.
    let invalidImmRange l i = Err(l,sprintf "12-bit Immediate value out of range: %x. Must be a 8-bit value, rotated by an even 5-bit value." i)

    /// 5-bit shift value out of range.
    let invalidShiftImmRange l i z =
        let (hi,lo) = match z with
                      | T_ASR -> (1,32)
                      | T_LSL -> (0,31)
                      | T_LSR -> (1,32)
                      | T_ROR -> (1,31)
                      | T_RRX -> (1,1)
        Err(l,sprintf "Shift immediate value out of range: %d. Must be between %d and %d" i lo hi)

    /// Shift match ends unexpectedly.
    let invalidShiftMatch l = Err(l,sprintf "Shift matches improperly.")

    /// 12-bit immediate value for memory offset incorrect.
    let invalidMemOffsetRange l i = Err(l,sprintf "12-bit Immediate offset value out of range: %x. Must be between -4095 and +4095." i)