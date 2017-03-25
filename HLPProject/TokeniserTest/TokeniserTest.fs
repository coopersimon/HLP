// Test code for the tokeniser.

namespace Test
module Tokeniser =
    
    open Parse.Tokeniser
    open Common.Conditions
    open Common.State



    /// Tests for the stringToToken function.
    let test_stringToToken =
        [(stringToToken "MOV", T_MOV (checkAL,false));
        (stringToToken "R3", T_REG 3);
        (stringToToken "R10", T_REG 10);
        (stringToToken "R13", T_REG 13);
        (stringToToken "R25", T_LABEL "R25");
        (stringToToken "mov", T_MOV (checkAL,false));
        (stringToToken "32", T_INT 32);
        (stringToToken "#150", T_INT 150);
        (stringToToken "#0x3f", T_INT 63);
        (stringToToken "0xf0", T_INT 240);
        (stringToToken ",", T_COMMA);
        (stringToToken "MOVNE", T_MOV (checkNE,false))]

    /// Tests for the tokenise function.
    let test_tokenise =
        [(tokenise "MOV   R5 #2", [T_MOV (checkAL,false); T_REG 5; T_INT 2]);
        (tokenise "MOV, , R3 ,R10, ", [T_MOV (checkAL,false); T_COMMA; T_COMMA; T_REG 3; T_COMMA; T_REG 10; T_COMMA]);
        (tokenise "R3 R4, R6, ,#20", [T_REG 3; T_REG 4; T_COMMA; T_REG 6; T_COMMA; T_COMMA; T_INT 20])]