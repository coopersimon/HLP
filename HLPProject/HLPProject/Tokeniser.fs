// This module contains the tokeniser

namespace Parse
module Tokeniser =
    
    open System.Text.RegularExpressions
    open Common.Conditions
    open Common.State

    
    (***TOKENS***)
    // To add token:
        // Add to discriminated union
        // Add to equals override
        // Add to stringToToken function


    /// Add tokens here! Format: "T_x"
    [<CustomEquality; NoComparison>]
    type Token =
        // Instructions:
            // All of these have a condition function, some have 'S' bool
        | T_MOV of (StateHandle -> bool)*bool
        | T_MVN of (StateHandle -> bool)*bool
        | T_MRS of (StateHandle -> bool)
        | T_MSR of (StateHandle -> bool)
        | T_ADD of (StateHandle -> bool)*bool
        | T_ADC of (StateHandle -> bool)*bool
        | T_SUB of (StateHandle -> bool)*bool
        | T_SBC of (StateHandle -> bool)*bool
        | T_RSB of (StateHandle -> bool)*bool
        | T_RSC of (StateHandle -> bool)*bool
        | T_MUL of (StateHandle -> bool)*bool
        | T_MLA of (StateHandle -> bool)*bool
        | T_UMULL of (StateHandle -> bool)*bool
        | T_UMLAL of (StateHandle -> bool)*bool
        | T_SMULL of (StateHandle -> bool)*bool
        | T_SMLAL of (StateHandle -> bool)*bool
        | T_AND of (StateHandle -> bool)*bool
        | T_ORR of (StateHandle -> bool)*bool
        | T_EOR of (StateHandle -> bool)*bool
        | T_BIC of (StateHandle -> bool)*bool
        | T_CMP of (StateHandle -> bool)
        | T_CMN of (StateHandle -> bool)
        | T_TST of (StateHandle -> bool)
        | T_TEQ of (StateHandle -> bool)
        | T_B of (StateHandle -> bool)
        | T_BL of (StateHandle -> bool)
        | T_BX of (StateHandle -> bool)
        | T_LDR of (StateHandle -> bool)
        | T_LDM of (StateHandle -> bool)
        | T_STR of (StateHandle -> bool)
        | T_STM of (StateHandle -> bool)
        | T_ADR of (StateHandle -> bool)
        | T_SWP of (StateHandle -> bool)
        | T_SWI of (StateHandle -> bool)
        | T_NOP of (StateHandle -> bool)
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
                               | T_MOV (cx,sx), T_MOV (cy,sy) -> cx state = cy state && sx = sy
                               | T_MVN (cx,sx), T_MVN (cy,sy) -> cx state = cy state && sx = sy
                               | T_MRS cx, T_MRS cy -> cx state = cy state
                               | T_MSR cx, T_MSR cy -> cx state = cy state
                               | _,_ -> false
            | _ -> false

    (***SUFFIXES***)

    /// Instruction condition codes.
    let cond = @"(|EQ|NE|CS|HS|CC|LO|MI|PL|VS|VC|HI|LS|GE|LT|GT|LE|AL)"

    /// S suffix, for setting flags.
    let setFlags = @"(|S)"

    (***TOKENISER***)

    // active patterns for matching strings

    // match generic token with no output.
    let (|TOKEN_MATCH|_|) pattern str =
        let m = Regex.Match(str, pattern, RegexOptions.IgnoreCase)
        if m.Success then Some() else None

    /// Match input string to condition code.
    let matchCond = function
        | TOKEN_MATCH "EQ" -> checkEQ
        | TOKEN_MATCH "NE" -> checkNE
        | TOKEN_MATCH "CS" -> checkCS
        | TOKEN_MATCH "HS" -> checkCS
        | TOKEN_MATCH "CC" -> checkCC
        | TOKEN_MATCH "LO" -> checkCC
        | TOKEN_MATCH "MI" -> checkMI
        | TOKEN_MATCH "PL" -> checkPL
        | TOKEN_MATCH "VS" -> checkVS
        | TOKEN_MATCH "VC" -> checkVC
        | TOKEN_MATCH "HI" -> checkHI
        | TOKEN_MATCH "GE" -> checkGE
        | TOKEN_MATCH "LT" -> checkLT
        | TOKEN_MATCH "GT" -> checkGT
        | TOKEN_MATCH "LE" -> checkLE
        | TOKEN_MATCH "AL" -> checkAL
        | _ -> checkAL

    /// Match 'S' suffix to bool.
    let matchS = function
        | TOKEN_MATCH "S" -> true
        | _ -> false

    // match an instruction (with condition code)
    let (|INSTR_MATCH|_|) pattern str =
        let m = Regex.Match(str, pattern+cond+"$", RegexOptions.IgnoreCase)
        if m.Success then Some(matchCond m.Groups.[1].Value) else None

    // match an instruction with condition code AND 's' suffix (for setting flags)
    let (|INSTR_S_MATCH|_|) pattern str =
        let m = Regex.Match(str, pattern+cond+setFlags+"$", RegexOptions.IgnoreCase)
        if m.Success then Some(matchCond m.Groups.[1].Value, matchS m.Groups.[2].Value) else None

    // match a valid register
    let (|REG_MATCH|_|) str =
        let m = Regex.Match(str, @"^R([0-9]|1[0-5])$", RegexOptions.IgnoreCase)
        if m.Success then Some(int m.Groups.[1].Value) else None

    let (|COMMA_MATCH|_|) str =
        let m = Regex.Match(str, @"^,$")
        if m.Success then Some() else None

    let (|LABEL_MATCH|_|) str =
        let m = Regex.Match(str, @"^([a-zA-Z]+)$")
        if m.Success then Some(m.Groups.[1].Value) else None

    let (|DEC_LIT_MATCH|_|) str =
        let m = Regex.Match(str, @"^#?([0-9]+)$")
        if m.Success then Some(int m.Groups.[1].Value) else None

    let (|HEX_LIT_MATCH|_|) str =
        let m = Regex.Match(str, @"^#?(0x[0-9a-fA-F]+)$")
        if m.Success then Some(System.Convert.ToInt32 (m.Groups.[1].Value, 16)) else None


    /// Match input string to token.
    let stringToToken = function
        // registers & aliases
        | REG_MATCH i -> T_REG i
        | TOKEN_MATCH @"^a1$" -> T_REG 0
        | TOKEN_MATCH @"^a2$" -> T_REG 1
        | TOKEN_MATCH @"^a3$" -> T_REG 2
        | TOKEN_MATCH @"^a4$" -> T_REG 3
        | TOKEN_MATCH @"^v1$" -> T_REG 4
        | TOKEN_MATCH @"^v2$" -> T_REG 5
        | TOKEN_MATCH @"^v3$" -> T_REG 6
        | TOKEN_MATCH @"^v4$" -> T_REG 7
        | TOKEN_MATCH @"^v5$" -> T_REG 8
        | TOKEN_MATCH @"^v6$" -> T_REG 9
        | TOKEN_MATCH @"^v7$" -> T_REG 10
        | TOKEN_MATCH @"^v8$" -> T_REG 11
        | TOKEN_MATCH @"^sb$" -> T_REG 9
        | TOKEN_MATCH @"^sl$" -> T_REG 10
        | TOKEN_MATCH @"^fp$" -> T_REG 11
        | TOKEN_MATCH @"^ip$" -> T_REG 12
        | TOKEN_MATCH @"^sp$" -> T_REG 13
        | TOKEN_MATCH @"^lr$" -> T_REG 14
        | TOKEN_MATCH @"^pc$" -> T_REG 15
        // other
        | COMMA_MATCH -> T_COMMA
        | DEC_LIT_MATCH i -> T_INT i
        | HEX_LIT_MATCH i -> T_INT i
        // instructions
        | INSTR_S_MATCH @"^MOV" cs -> T_MOV cs
        | INSTR_S_MATCH @"^MVN" cs -> T_MVN cs
        | INSTR_MATCH @"^MRS" c -> T_MRS c
        | INSTR_MATCH @"^MSR" c -> T_MSR c
        | INSTR_S_MATCH @"^ADD" cs -> T_ADD cs
        | INSTR_S_MATCH @"^ADC" cs -> T_ADC cs
        | INSTR_S_MATCH @"^SUB" cs -> T_SUB cs
        | INSTR_S_MATCH @"^SBC" cs -> T_SBC cs
        | INSTR_S_MATCH @"^RSB" cs -> T_RSB cs
        | INSTR_S_MATCH @"^RSC" cs -> T_RSC cs
        // labels
        | LABEL_MATCH s -> T_LABEL s
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