// This file defines Enums that appear in the tokeniser and are used in interpretation.

namespace Common

module Types =

    open Error
    open State
    
    /// Shift tokens.
    type shiftOp =
        | T_ASR
        | T_LSL
        | T_LSR
        | T_ROR
        | T_RRX

    /// Load/Store Multiple tokens.
    type stackOrder =
        | S_IA
        | S_IB
        | S_DA
        | S_DB

    /// Operand type tokens.
    type opType =
        | T_I
        | T_R

    /// Wrapper for instructions, including unresolved references.
    type Instruction = 
        | LabelRef of (Map<string,int> -> Error<Instruction>)
        | DataRef of (StateHandle -> StateHandle)
        | EndRef of (int -> Instruction)
        // Instruction contains the line number in addition to the function that transforms the state.
        | Instr of int*(StateHandle -> StateHandle)
        | Terminate of int