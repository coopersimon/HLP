// This module contains the tokeniser

namespace Parse
module Tokeniser =
    
    open System.Text.RegularExpressions

    (***TOKENS***)
    /// Add tokens here! Format: "T_x"
    type Token =
        | T_MOV
        | T_REG of int
        | T_INT of int
        | T_ERROR

    // Add active patterns here! Format "MT_x"
    let (|MT_MOV|_|) str =
        let m = Regex.Match(str, @"^MOV$")
        if m.Success then Some() else None

    let (|MT_REG|_|) str =
        let m = Regex.Match(str, @"^R([0-9]|1[0-5])$")
        if m.Success then Some(int m.Groups.[1].Value) else None

    let (|MT_DEC_LIT|_|) str =
        let m = Regex.Match(str, @"^#?([0-9]+)$")
        if m.Success then Some(int m.Groups.[1].Value) else None

    let (|MT_HEX_LIT|_|) str =
        let m = Regex.Match(str, @"^#?(0x[0-9a-fA-F]+)$")
        if m.Success then Some(System.Convert.ToInt32 (m.Groups.[1].Value, 16)) else None


    (***TOKENISER***)
    /// Link the tokens and patterns. Format "MT_x -> T_x"
    let stringToToken = function
        | MT_MOV -> T_MOV
        | MT_REG i -> T_REG i
        | MT_DEC_LIT i -> T_INT i
        | MT_HEX_LIT i -> T_INT i
        | _ -> T_ERROR


    /// Take in string and output list of tokens.
    let tokenise (s: string) =
        // TODO: look into different ways of splitting (regex)
        s.Split([|' '; '\t'; '\n'; '\r'; '\f'|])
        |> Array.toList
        |> List.filter (fun s -> String.length s > 0)
        |> List.map stringToToken