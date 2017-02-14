// This module contains functions to run the ARMv4 instruction set.

namespace Interpret
module ARMv4 =
    open Common.State
    open Common.Conditions

    let mov c r i state =
        if checkCond state c then writeReg state r i else state