// Test code for the tokeniser.

namespace Test
module Tokeniser =
    
    open Parse.Tokeniser

    let test_stringToToken =
        [(stringToToken "MOV", T_REG 6);
        (stringToToken "R3", T_REG 3);
        (stringToToken "R10", T_REG 10);
        (stringToToken "R13", T_REG 13);
        (stringToToken "R25", T_ERROR);
        (stringToToken "mov", T_ERROR);
        (stringToToken "32", T_INT 32);
        (stringToToken "#150", T_INT 150);
        (stringToToken "#0x3f", T_INT 63);
        (stringToToken "0xf0", T_INT 240)]

    let test_tokenise =
        [(tokenise "MOV   R5 #2", [T_MOV; T_REG 5; T_INT 2])]