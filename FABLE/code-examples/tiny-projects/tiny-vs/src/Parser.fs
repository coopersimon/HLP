module App.Parser

open App.Common

//
//
// TINY Parser
//
//
//--------------------------Predicates on Tokens--------------------------------------
//            
/// token is TokName s where s is in list lst
let isTokInList (lst : string list) = 
    function 
    | TokName op -> List.contains op lst
    | _ -> false

/// token is a literal value
let isLitTok t = 
    match t with
    | TokIntLit _ | TokStrLit _ -> true
    | _ -> false

/// token is a binay operator
let isBinaryTok = isTokInList binaryOps

/// token is a unary operator   
let isUnaryTok = isTokInList unaryOps

/// token is a recursive parse construct end marker
let isEndTok = isTokInList endOps

let isStartTok = isTokInList startOps

/// convert predicate into a partial pattern function which returns its input unchanged
let makePP tPred tok = if tPred tok then Some tok else None

let (|IsLiteral|_|) = makePP isLitTok 
let (|IsBinary|_|) = makePP isBinaryTok
let (|IsUnary|_|) = makePP isUnaryTok
let (|IsEnd|_|) = makePP isEndTok
let (|IsStart|_|) = makePP isStartTok
let (|IsSymbol|_|) = function 
    | IsLiteral _ | IsBinary _ | IsUnary _ | IsStart _ | IsEnd _ | TokNull -> None
    | tok -> Some tok

/// for a token representing a value, convert it into the equivalent Exp
let toExp tok = 
    match tok with
    | IsSymbol (TokName s) | IsUnary (TokName s) | IsBinary (TokName s)-> Name s
    | IsLiteral _ -> Literal tok
    | TokNull -> NullExp
    | _ -> failwithf "No valid translation for token %A as an Exp" tok

/// binding precedence for functional application
let applyBinding = 100

/// binding precedence for unary operators
let unaryBinding op = 
    if isUnaryTok op then 100
    else 110

/// left binding of a token determining operator precedence
let LBinding tok = 
    match tok with
    | IsBinary (TokName op) -> binaryOpPriority.[op]
    | IsEnd _ -> -10
    | IsSymbol _ | IsLiteral _ -> applyBinding
    | _ -> 1000

/// right binding of a token determining operator precedence
let RBinding tok = 
    match tok with
    | IsEnd _ -> 1000
    | _ -> LBinding tok

//
//-----------------------------------Parser----------------------------------------/
//

/// Parse toks as an expression until binding drops below rbPrio
/// Return parse result * unparsed tokens
/// Uses Pratt parsing algorithm
let rec ParseExpression rbPrio toks = 
    let rec expLoop left toks = 
        if toks <> [] && rbPrio < LBinding(List.head toks) then 
            let (left1, r) = LeftD left toks
            expLoop left1 r
        else left, toks
    match toks with
    | PNullD(left, r) -> 
        Some(if List.isEmpty r then left, []
             else expLoop left r)
    | _ -> None

/// Interpret next token as an operator in left denotation context.
/// Parse the RH operand, if operator is binary.
/// Return the parse result * unparsed tokens
and LeftD left toks = 
    match toks with
    | IsBinary t :: r -> 
        match r with
        | PEXP (RBinding t) (right, r1) -> 
            Apply [ toExp t
                    left
                    right ], r1
        | _ -> failwithf "RH operand for op %A not found at %A in LeftD context" t (List.take 5 toks)
    | PNullD(e2, r2) -> Apply [ left; e2 ], r2
    | t :: _ -> failwithf "Unexpected token %A found in LeftD context" t
    | [] -> failwithf "Missing tokens: LeftD context expected"

/// Parse a single token from toks as an expression.
/// If the token starts a recursive construct parse the whole construct
/// Return parse result * unparsed tokens
and NullD toks = 
    match toks with
    | IsStart _ :: _ -> 
        match toks with
        | PREC(e1, r) -> Some(e1, r)
        | _ -> 
            printfn "Recursive parse failed after start token: %A" toks
            None
    | IsLiteral t :: r -> Some(Literal t, r)
    | IsSymbol (TokName s) :: r -> Some(Name s, r)
    | IsUnary tok :: r -> ParseExpression (unaryBinding tok) r
    | _ -> 
        printfn "Nullary context value expected but not found at: %A" toks
        None

/// Partial Active Pattern equivalent to NullD
and (|PNullD|_|) toks = NullD toks

/// Partial Active Pattern equivalent to ParseExpression
and (|PEXP|_|) = ParseExpression

/// Partial Active Pattern to parse a recursive construct bracketed by keywords or brackets
/// This handles all recursive parsing, with input token list toks and return exp,restOfToks
/// Sub-patterns here parse parts of a construct with input toks and output exp,restOfToks
/// Chained sub-patterns can match different subexpressions in e.g. IF THEN ELSE FI construct.
and (|PREC|_|) (tokens : Token list) = 
    /// Match a keyword and remove it from input.
    let (|KW|_|) kw toks = 
        match toks with
        | TokName s :: r when s = kw -> Some r
        | _ -> None
        
    /// match a sequence of symbol tokens from a let definition
    let rec (|NAMES|_|) nms toks = 
        match toks with
        | IsSymbol (TokName nm) :: r -> (|NAMES|_|) (Name nm :: nms) r
        | TokName "=" :: _ when List.length nms >= 1 -> (FNames(List.rev nms), toks) |> Some
        | _ -> failwithf "<fName> ... = (after LET) expected but not found in: %A" toks
    
    match tokens with
    | KW "LET" (NAMES [] (FNames(f::args), KW "=" (PREC(eBody, KW "IN" (PREC( eIn, r)))))) -> 
        (Lambda(Func = f, Args = args, Body = eBody, InExp = eIn), r) |> Some
    | KW "(" (PREC( exp, KW ")" r)) -> (exp, r) |> Some
    | KW "IF" (PREC(cond, KW "THEN" (PREC( thenP, KW "ELSE" (PREC(elseP, KW "FI" r)))))) -> 
        Some(Apply [ Name "ITE"
                     cond
                     thenP
                     elseP ], r)
    | [] -> None
    | _ -> ParseExpression 0 tokens
