module App.Tokeniser

open App.Common

// 
//
// Tokeniser
//
//
// Utility Functions to convert between string and char list types
let explode (str : string) = str |> List.ofSeq
let implode (x : char list) = 
    let mutable s = ""
    List.iter (fun c -> s <- s + c.ToString()) x
    s

/// Utility match function characters in str match a starting prefix of x
let rec charListStartsWith (x : char list) (str : string) = 
    let rec clsw1 x y =
        match x,y with
        | _, [] -> true // empty string will match anything
        | xc :: x1, yc :: y1 when xc = yc -> clsw1 x1 y1 // if first char matches check the rest
        | _ -> false // This must be a mismatch
    clsw1 x (explode str)



let tokMatch (start : char -> bool) (notEnd : char -> bool) (tokType : string -> Token) lst = 
    let rec tContent tChars = 
        function 
        | c :: r when notEnd c -> tContent (c :: tChars) r
        | r -> tokType (List.rev tChars |> implode), r
    match lst with
    | c :: _ as cl when start c -> tContent [] cl |> Some
    | _ -> None

let (|IntMatch|_|) = 
    tokMatch isDigit isDigit (int >> TokIntLit)

let (|NameMatch|_|) = 
    tokMatch isAlpha isAlphaNum TokName

let (|StringMatch|_|) cLst = 
    let doEsc = 
        function 
        | 'n' -> '\n'
        | 't' -> '\t'
        | 'r' -> '\r'
        | c -> c
    
    let rec sContent sChars = 
        function 
        | '\\' :: c2 :: r -> sContent (doEsc c2 :: sChars) r
        | '"' :: r -> 
            List.rev sChars
            |> implode
            |> TokStrLit, r
        | c :: r -> sContent (c :: sChars) r
        | [] -> failwithf "Unterminated string\n"
    
    match cLst with
    | '"' :: x -> sContent [] x |> Some
    | _ -> None

let (|OpMatch|_|) cLst = 
    let x = List.tryFind (charListStartsWith cLst) allOps
    let x1 = x |>  Option.map (fun op -> TokName op, List.skip op.Length cLst)
    x1

let tokeniseToSeqFromSeq lineSeq = 
    let rec tokenise1 line = 
        match line with
        | '/' :: '/' :: _ -> tokenise1 (List.skipWhile (isNewLine >> not) line)
        | IntMatch(t, r) | OpMatch(t,r) | StringMatch(t, r) | NameMatch(t, r)  -> 
            seq { 
                yield t
                yield! tokenise1 r
            }
        | ch :: r when isWhiteSpace ch -> tokenise1 r
        | ch :: _ as toks -> failwithf "Error: unrecognised character '%A' found in tokenize input%A" ch toks
        | [] -> seq []
    lineSeq |> Seq.collect (explode >> tokenise1)

let tokeniseList src = 
    let rec tokenise1 lst = 
        match lst with
        | '/' :: '/' :: _ -> tokenise1 (List.skipWhile (isNewLine >> not) lst)
        | IntMatch(t, r) | OpMatch(t, r) | StringMatch(t, r) | NameMatch(t, r) -> t :: tokenise1 r
        | ch :: r when isWhiteSpace ch -> tokenise1 r
        | ch :: _ as toks -> failwithf "Error: unrecognised character '%A' found in tokenize input%A" ch toks
        | [] -> []
    src
    |> explode
    |> tokenise1
