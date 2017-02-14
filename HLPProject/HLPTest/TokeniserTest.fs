﻿// Test code for the tokeniser.

namespace Test
module Tokeniser =
    
    open Parse.Tokeniser
    open Common.Conditions

    /// Tests for the stringToToken function.
    let test_stringToToken =
        [(stringToToken "MOV", T_MOV AL);
        (stringToToken "R3", T_REG 3);
        (stringToToken "R10", T_REG 10);
        (stringToToken "R13", T_REG 13);
        (stringToToken "R25", T_ERROR);
        (stringToToken "mov", T_ERROR);
        (stringToToken "32", T_INT 32);
        (stringToToken "#150", T_INT 150);
        (stringToToken "#0x3f", T_INT 63);
        (stringToToken "0xf0", T_INT 240);
        (stringToToken ",", T_COMMA);
        (stringToToken "MOVNE", T_MOV NE)]

    /// Tests for the tokenise function.
    let test_tokenise =
        [(tokenise "MOV   R5 #2", [T_MOV AL; T_REG 5; T_INT 2]);
        (tokenise "MOV, , R3 ,R10, ", [T_MOV AL; T_COMMA; T_COMMA; T_REG 3; T_COMMA; T_REG 10; T_COMMA])]