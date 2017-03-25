// This module contains the tokeniser

namespace Parse
module Tokeniser =
    
    open System.Text.RegularExpressions
    open Common.Conditions
    open Common.State
    open Common.Types
       
    
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
        | T_LDRB of (StateHandle -> bool)
        | T_LDRH of (StateHandle -> bool)
        | T_LDM of (StateHandle -> bool)*stackOrder

        | T_STR of (StateHandle -> bool)
        | T_STRB of (StateHandle -> bool)
        | T_STRH of (StateHandle -> bool)
        | T_STM of (StateHandle -> bool)*stackOrder

        | T_ADR of (StateHandle -> bool)
        | T_SWP of (StateHandle -> bool)
        | T_SWI of (StateHandle -> bool)
        | T_NOP of (StateHandle -> bool)
        | T_CLZ of (StateHandle -> bool)

        // Directives
        | T_DCD
        | T_EQU
        | T_FILL
        | T_END of (StateHandle -> bool)
        // shift operands
        | T_SHIFT of shiftOp*((StateHandle -> bool)*bool)
        // Values
        | T_REG of int
        | T_INT of int
        | T_LABEL of string
        // Others
        | T_COMMA
        | T_L_BRAC
        | T_R_BRAC
        | T_EXCL
        | T_EQUAL
        | T_L_CBR
        | T_R_CBR
        | T_DASH
        | T_NEWLINE
        | T_ERROR of string

        // Equals for testing.
        override x.Equals yobj =
            let state = initState
            match yobj with
            | :? Token as y -> match x,y with
                               | T_REG ix, T_REG iy -> ix = iy
                               | T_INT ix, T_INT iy -> ix = iy
                               | T_LABEL sx, T_LABEL sy -> sx = sy

                               | T_COMMA, T_COMMA -> true
                               | T_L_BRAC, T_L_BRAC -> true
                               | T_R_BRAC, T_R_BRAC -> true
                               | T_EXCL, T_EXCL -> true
                               | T_L_CBR, T_R_CBR -> true
                               | T_DASH, T_DASH -> true
                               | T_NEWLINE, T_NEWLINE -> true
                               | T_ERROR tx, T_ERROR ty -> tx = ty

                               | T_MOV (cx,sx), T_MOV (cy,sy) -> cx state = cy state && sx = sy
                               | T_MVN (cx,sx), T_MVN (cy,sy) -> cx state = cy state && sx = sy
                               | T_MRS cx, T_MRS cy -> cx state = cy state
                               | T_MSR cx, T_MSR cy -> cx state = cy state
                               | T_ADD (cx,sx), T_ADD (cy,sy) -> cx state = cy state && sx = sy
                               | T_ADC (cx,sx), T_ADC (cy,sy) -> cx state = cy state && sx = sy
                               | T_SUB (cx,sx), T_SUB (cy,sy) -> cx state = cy state && sx = sy
                               | T_SBC (cx,sx), T_SBC (cy,sy) -> cx state = cy state && sx = sy
                               | T_RSB (cx,sx), T_RSB (cy,sy) -> cx state = cy state && sx = sy
                               | T_RSC (cx,sx), T_RSC (cy,sy) -> cx state = cy state && sx = sy
                               | T_MUL (cx,sx), T_MUL (cy,sy) -> cx state = cy state && sx = sy
                               | T_MLA (cx,sx), T_MLA (cy,sy) -> cx state = cy state && sx = sy
                               | T_AND (cx,sx), T_AND (cy,sy) -> cx state = cy state && sx = sy
                               | T_ORR (cx,sx), T_ORR (cy,sy) -> cx state = cy state && sx = sy
                               | T_EOR (cx,sx), T_EOR (cy,sy) -> cx state = cy state && sx = sy
                               | T_BIC (cx,sx), T_BIC (cy,sy) -> cx state = cy state && sx = sy
                               | T_CMP cx, T_CMP cy -> cx state = cy state
                               | T_CMN cx, T_CMN cy -> cx state = cy state
                               | T_TST cx, T_TST cy -> cx state = cy state
                               | T_TEQ cx, T_TEQ cy -> cx state = cy state
                               | T_B cx, T_B cy -> cx state = cy state
                               | T_BL cx, T_BL cy -> cx state = cy state
                               | T_BX cx, T_BX cy -> cx state = cy state
                               | T_LDR cx, T_LDR cy -> cx state = cy state
                               | T_LDRB cx, T_LDRB cy -> cx state = cy state
                               | T_LDRH cx, T_LDRH cy -> cx state = cy state
                               | T_LDM (cx,sx), T_LDM (cy,sy) -> cx state = cy state && sx = sy
                               | T_STR cx, T_STR cy -> cx state = cy state
                               | T_STRB cx, T_STRB cy -> cx state = cy state
                               | T_STRH cx, T_STRH cy -> cx state = cy state
                               | T_STM (cx,sx), T_STM (cy,sy) -> cx state = cy state && sx = sy
                               | T_ADR cx, T_ADR cy -> cx state = cy state
                               | T_SWP cx, T_SWP cy -> cx state = cy state
                               | T_SWI cx, T_SWI cy -> cx state = cy state
                               | T_NOP cx, T_NOP cy -> cx state = cy state
                               | T_CLZ cx, T_CLZ cy -> cx state = cy state
                               | T_DCD, T_DCD -> true
                               | T_EQU, T_EQU -> true
                               | T_FILL, T_FILL -> true
                               | T_END cx, T_END cy -> cx state = cy state
                               | T_SHIFT (tx,(cx,sx)), T_SHIFT (ty,(cy,sy)) -> tx = ty && cx state = cy state && sx = sy
                               | _,_ -> false
            | _ -> false

        override x.GetHashCode() = hash 1 // To avoid warnings! I advise not hashing tokens.

    (***SUFFIXES***)

    /// Instruction condition codes.
    let cond = @"(|EQ|NE|CS|HS|CC|LO|MI|PL|VS|VC|HI|LS|GE|LT|GT|LE|AL)"

    /// S suffix, for setting flags.
    let setFlags = @"(|S)"

    /// Stack suffix, for load/store multiple
    let stackSfx = @"(IA|IB|DA|DB|FD|FA|ED|EA)"

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

    /// Match LDM suffix to stackOrder.
    let matchLDM = function
        | TOKEN_MATCH "IA" -> S_IA
        | TOKEN_MATCH "IB" -> S_IB
        | TOKEN_MATCH "DA" -> S_DA
        | TOKEN_MATCH "DB" -> S_DB
        | TOKEN_MATCH "FD" -> S_IA
        | TOKEN_MATCH "ED" -> S_IB
        | TOKEN_MATCH "FA" -> S_DA
        | TOKEN_MATCH "EA" -> S_DB
        | _ -> S_IA

    /// Match STM suffix to stackOrder.
    let matchSTM = function
        | TOKEN_MATCH "IA" -> S_IA
        | TOKEN_MATCH "IB" -> S_IB
        | TOKEN_MATCH "DA" -> S_DA
        | TOKEN_MATCH "DB" -> S_DB
        | TOKEN_MATCH "EA" -> S_IA
        | TOKEN_MATCH "FA" -> S_IB
        | TOKEN_MATCH "ED" -> S_DA
        | TOKEN_MATCH "FD" -> S_DB
        | _ -> S_IA

    // match an instruction (with condition code)
    let (|INSTR_MATCH|_|) pattern str =
        let m = Regex.Match(str, pattern+cond+"$", RegexOptions.IgnoreCase)
        if m.Success then Some(matchCond m.Groups.[1].Value) else None

    // match an instruction with condition code AND 's' suffix (for setting flags)
    let (|INSTR_S_MATCH|_|) pattern str =
        let m = Regex.Match(str, pattern+cond+setFlags+"$", RegexOptions.IgnoreCase)
        if m.Success then Some(matchCond m.Groups.[1].Value, matchS m.Groups.[2].Value) else None

    // match load multiple instruction with stack suffix.
    let (|LDM_MATCH|_|) str =
        let m = Regex.Match(str, @"^LDM"+stackSfx+cond+"$", RegexOptions.IgnoreCase)
        if m.Success then Some(matchCond m.Groups.[1].Value, matchLDM m.Groups.[2].Value) else None
        
    // match load multiple instruction with stack suffix.
    let (|STM_MATCH|_|) str =
        let m = Regex.Match(str, @"^STM"+stackSfx+cond+"$", RegexOptions.IgnoreCase)
        if m.Success then Some(matchCond m.Groups.[1].Value, matchSTM m.Groups.[2].Value) else None

    // match a valid register
    let (|REG_MATCH|_|) str =
        let m = Regex.Match(str, @"^R([0-9]|1[0-5])$", RegexOptions.IgnoreCase)
        if m.Success then Some(int m.Groups.[1].Value) else None

    let (|LABEL_MATCH|_|) str =
        let m = Regex.Match(str, @"^([a-zA-Z_][a-zA-Z0-9_]*)$")
        if m.Success then Some(m.Groups.[1].Value) else None

    let (|DEC_LIT_MATCH|_|) str =
        let m = Regex.Match(str, @"^#?([0-9]+)$")
        if m.Success then Some(int(uint32 m.Groups.[1].Value)) else None
        
    let (|DEC_S_LIT_MATCH|_|) str =
        let m = Regex.Match(str, @"^#?(-[0-9]+)$")
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
        | "," -> T_COMMA
        | "[" -> T_L_BRAC
        | "]" -> T_R_BRAC
        | "!" -> T_EXCL
        | "=" -> T_EQUAL
        | "{" -> T_L_CBR
        | "}" -> T_R_CBR
        | "-" -> T_DASH
        | "\n" -> T_NEWLINE
        | DEC_LIT_MATCH i -> T_INT i
        | DEC_S_LIT_MATCH i -> T_INT i
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
        | INSTR_S_MATCH @"^MUL" cs -> T_MUL cs
        | INSTR_S_MATCH @"^MLA" cs -> T_MLA cs
        | INSTR_S_MATCH @"^UMULL" cs -> T_UMULL cs
        | INSTR_S_MATCH @"^UMLAL" cs -> T_UMLAL cs
        | INSTR_S_MATCH @"^SMULL" cs -> T_SMULL cs
        | INSTR_S_MATCH @"^SMLAL" cs -> T_SMLAL cs
        | INSTR_S_MATCH @"^AND" cs -> T_AND cs
        | INSTR_S_MATCH @"^ORR" cs -> T_ORR cs
        | INSTR_S_MATCH @"^EOR" cs -> T_EOR cs
        | INSTR_S_MATCH @"^BIC" cs -> T_BIC cs
        | INSTR_MATCH @"^CMP" c -> T_CMP c
        | INSTR_MATCH @"^CMN" c -> T_CMN c
        | INSTR_MATCH @"^TST" c -> T_TST c
        | INSTR_MATCH @"^TEQ" c -> T_TEQ c
        | INSTR_MATCH @"^B" c -> T_B c
        | INSTR_MATCH @"^BL" c -> T_BL c
        | INSTR_MATCH @"^BX" c -> T_BX c
        | INSTR_MATCH @"^LDR" c -> T_LDR c
        | INSTR_MATCH @"^LDRB" c -> T_LDRB c
        | INSTR_MATCH @"^LDRH" c -> T_LDRH c
        | LDM_MATCH cs -> T_LDM cs
        | INSTR_MATCH @"^STR" c -> T_STR c
        | INSTR_MATCH @"^STRB" c -> T_STRB c
        | INSTR_MATCH @"^STRH" c -> T_STRH c
        | STM_MATCH cs -> T_STM cs
        | INSTR_MATCH @"^SWP" c -> T_SWP c
        | INSTR_MATCH @"^SWI" c -> T_SWI c
        | INSTR_MATCH @"^NOP" c -> T_NOP c
        | INSTR_MATCH @"^ADR" c -> T_ADR c
        | INSTR_MATCH @"^END" c -> T_END c
        | INSTR_MATCH @"^CLZ" c -> T_CLZ c
        | TOKEN_MATCH @"^DCD$" -> T_DCD
        | TOKEN_MATCH @"^EQU$" -> T_EQU
        | TOKEN_MATCH @"^FILL$" -> T_FILL
        // shift operands
        | INSTR_S_MATCH @"^ASR" cs -> T_SHIFT (T_ASR, cs)
        | INSTR_S_MATCH @"^LSL" cs -> T_SHIFT (T_LSL, cs)
        | INSTR_S_MATCH @"^LSR" cs -> T_SHIFT (T_LSR, cs)
        | INSTR_S_MATCH @"^ROR" cs -> T_SHIFT (T_ROR, cs)
        | INSTR_S_MATCH @"^RRX" cs -> T_SHIFT (T_RRX, cs)
        // labels
        | LABEL_MATCH s -> T_LABEL s
        //| t -> failwithf "Invalid token %A" t
        | t -> T_ERROR t


    /// Take in string and output list of tokens.
    let tokenise (source: string) =
        Regex.Split(source, @"([,\[\]!\n={}-])|[\ \t\r\f]+|;.*")
        |> Array.toList
        |> List.filter (fun s -> s <> null)
        |> List.filter (fun s -> s <> "")
        |> List.map stringToToken