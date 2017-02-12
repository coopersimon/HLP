// This module contains the tokeniser

namespace Parse
module Tokeniser =
    
    open System.Text.RegularExpressions

    (***TOKENS***)
    // Add tokens here! Format: "T_x"
    type Token =
        | T_MOV
        | T_REG of int
        | T_ERROR

    // Add active patterns here! Format "MT_x"
    let (|MT_MOV|_|) str =
        let m = Regex.Match(str, @"^MOV$")
        if m.Success then Some() else None

    let (|MT_REG|_|) str =
        let m = Regex.Match(str, @"^R([0-9]|1[0-5])$")
        if m.Success then Some(int m.Groups.[1].Value) else None





    (***TOKENISER***)
    // Link the tokens and patterns. Format "MT_x -> T_x"
    let stringToToken = function
        | MT_MOV -> T_MOV
        | MT_REG i -> T_REG i
        | _ -> T_ERROR