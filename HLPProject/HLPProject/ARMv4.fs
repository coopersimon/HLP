// This module contains functions to run the ARMv4 instruction set.
// Will need to discuss exactly how we deal with a lot of aspects of this...

namespace Interpret
module ARMv4 =
    open Common.State

    let mov r i state =
        writeReg state r i