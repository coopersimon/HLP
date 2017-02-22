﻿// This module contains the tokeniser

namespace Parse
module Tokeniser =
    
    open System.Text.RegularExpressions
    open Common.Conditions
    open Common.State

    (***CONDITIONS***)

    /// Instruction condition codes.
    let cond = @"(|EQ|NE|CS|HS|CC|LO|MI|PL|VS|VC|HI|LS|GE|LT|GT|LE|AL)$"

    /// Match input string to condition code.
    let matchCond = function
        | "EQ" -> checkEQ
        | "NE" -> checkNE
        | "CS" -> checkCS
        | "HS" -> checkCS
        | "CC" -> checkCC
        | "LO" -> checkCC
        | "MI" -> checkMI
        | "PL" -> checkPL
        | "VS" -> checkVS
        | "VC" -> checkVC
        | "HI" -> checkHI
        | "GE" -> checkGE
        | "LT" -> checkLT
        | "GT" -> checkGT
        | "LE" -> checkLE
        | "AL" -> checkAL
        | "" -> checkAL
        | _ -> checkAL


    (***TOKENS***)
    // To add token:
        // Add to discriminated union
        // Add to equals override
        // Add to stringToToken function


    /// Add tokens here! Format: "T_x"
    [<CustomEquality; NoComparison>]
    type Token =
        // Instructions
        | T_MOV of (StateHandle -> bool)
        | T_MVN of (StateHandle -> bool)
        | T_MRS of (StateHandle -> bool)
        | T_MSR of (StateHandle -> bool)
        // Values
        | T_REG of int
        | T_INT of int
        | T_LABEL of string
        // Others
        | T_COMMA
        | T_ERROR

        override x.Equals yobj =
            let state = initState
            match yobj with
            | :? Token as y -> match x,y with
                               | T_REG ix, T_REG iy -> ix = iy
                               | T_INT ix, T_INT iy -> ix = iy
                               | T_COMMA, T_COMMA -> true
                               | T_ERROR, T_ERROR -> true
                               | T_MOV cx, T_MOV cy -> cx state = cy state
                               | T_MVN cx, T_MVN cy -> cx state = cy state
                               | T_MRS cx, T_MRS cy -> cx state = cy state
                               | T_MSR cx, T_MSR cy -> cx state = cy state
                               | _,_ -> false
            | _ -> false


    // active patterns for matching strings
    let (|INSTR_MATCH|_|) pattern str =
        let m = Regex.Match(str, pattern+cond)
        if m.Success then Some(matchCond m.Groups.[1].Value) else None

    let (|REG_MATCH|_|) str =
        let m = Regex.Match(str, @"^R([0-9]|1[0-5])$")
        if m.Success then Some(int m.Groups.[1].Value) else None

    let (|COMMA_MATCH|_|) str =
        let m = Regex.Match(str, @"^,$")
        if m.Success then Some() else None

    let (|LABEL_MATCH|_|) str =
        let m = Regex.Match(str, @"^([a-zA-Z][a-zA-Z0-9]*):$")
        if m.Success then Some(m.Groups.[1].Value) else None

    let (|DEC_LIT_MATCH|_|) str =
        let m = Regex.Match(str, @"^#?([0-9]+)$")
        if m.Success then Some(int m.Groups.[1].Value) else None

    let (|HEX_LIT_MATCH|_|) str =
        let m = Regex.Match(str, @"^#?(0x[0-9a-fA-F]+)$")
        if m.Success then Some(System.Convert.ToInt32 (m.Groups.[1].Value, 16)) else None

    let (|TOKEN_MATCH|_|) pattern str =
        let m = Regex.Match(str, pattern)
        if m.Success then Some(m.Groups.[1].Value) else None


    (***TOKENISER***)

    /// Match input string to token.
    let stringToToken = function
        | INSTR_MATCH @"^MOV" c -> T_MOV c
        | INSTR_MATCH @"^MVN" c -> T_MVN c
        | INSTR_MATCH @"^MRS" c -> T_MRS c
        | INSTR_MATCH @"^MSR" c -> T_MSR c
        | REG_MATCH i -> T_REG i
        | COMMA_MATCH -> T_COMMA
        | LABEL_MATCH s -> T_LABEL s
        | DEC_LIT_MATCH i -> T_INT i
        | HEX_LIT_MATCH i -> T_INT i
        | _ -> T_ERROR


    /// Take in string and output list of tokens.
    let tokenise (s: string) =
        // TODO: look into different ways of splitting (regex)
        let rgx = new Regex(",")
        let sC = rgx.Replace(s, " , ")
        sC.Split([|' '; '\t'; '\n'; '\r'; '\f'|])
        |> Array.toList
        |> List.filter (fun s -> s <> "")
        |> List.map stringToToken