module App.Common

//
// Types of Tokens and expressions
//
type Token = 
    | TokName of string // all symbols and operators.
    | TokStrLit of string // string literal "Hello world"
    | TokIntLit of int // integer literal 1234 (only allow positive literals but unary - can be used to make them negative)
    | TokNull // representation of a Null value used for empty lists: a :: b :: c :: Null (like [] in F#)

type Exp = 
    | Apply of Exp list // Apply[f;a;b;c] -> f a b c
    | Name of string // Built-in Combinator or let-defined function name
    | Literal of Token // 
    | NullExp
    | FNames of Exp list // list of symbols found in LET definition: function + arg names
    | Lambda of Func : Exp * Args: Exp list * Body : Exp * InExp : Exp // Let definition and associated expression

//
// Basic operations using the above data
//

/// end of parse recursive constructs
let endOps = [ "END"; "THEN"; "ELSE"; "FI"; ")" ; "IN"] 

/// start of recursive constructs
let startOps = [ "BEGIN"; "("; "IF" ; "LET"] // keywords that can possibly start a recursive parse

/// prefix unary operators (may also be binary in LeftD context)
let unaryOps = [ "ISPAIR" ; "NOT" ; "-" ] // prefix unary operators

/// // this list defines which operators are binary and establishes operator precedence (binding)
let binaryOpPriority = 
    Map.ofList [ "+", 40
                 "-", 40
                 "*", 50
                 "/", 50
                 "%", 50
                 ">", 30
                 "<", 30
                 "=", 20
                 "::", 10 ]
/// strings used for binary 0perators
let binaryOps = 
    binaryOpPriority
    |> Map.toList
    |> List.map fst

/// any token string with a special meaning
let allOps = (binaryOps @ unaryOps @ endOps @ startOps) |> Seq.ofList |> Seq.distinct |> List.ofSeq

// Useful predicates on characters

/// character is white sppace
let isWhiteSpace (c : char) = List.contains c [ ' '; '\n'; '\t'; '\r'; '\f' ]

/// charater is new line
let isNewLine (c : char) = List.contains c [ '\n'; '\f'; '\r' ]

/// character is alphabetic
let isAlpha (c : char) = List.contains c ([ 'a'..'z' ] @ [ 'A'..'Z' ])

/// character is a decimal digit
let isDigit (c : char) = List.contains c [ '0'..'9' ]

/// character is alphanumeic (allowed in symbol)
let isAlphaNum (c : char) = isAlpha c || isDigit c

/// character op is in list lst
let isOpInList (op: char) lst = List.contains op lst

