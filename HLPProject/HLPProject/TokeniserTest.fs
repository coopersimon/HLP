// Test code for the tokeniser.

namespace Test
module Tokeniser =
    
    open Parse.Tokeniser

    (*let test_stringToToken =
        printfn "%A" (stringToToken "MOV")
        printfn "%A" (stringToToken "R3")
        printfn "%A" (stringToToken "R10")
        printfn "%A" (stringToToken "R13")
        printfn "%A" (stringToToken "R25")
        printfn "%A" (stringToToken "mov")*)

    let test_stringToToken =
        [(stringToToken "MOV", T_MOV);
        (stringToToken "R3", T_REG 3);
        (stringToToken "R10", T_REG 10);
        (stringToToken "R13", T_REG 13);
        (stringToToken "R25", T_ERROR);
        (stringToToken "mov", T_ERROR)]