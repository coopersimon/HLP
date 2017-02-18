// This module contains functions to run the ARMv4 instruction set.

namespace Interpret
module ARMv4 =
    open Common.State
    open Common.Conditions

    let movI c r i state =
        if c state then writeReg state r i else state

    let movR c r1 r2 state =
        if c state then writeReg state r1 (readReg state r2) else state