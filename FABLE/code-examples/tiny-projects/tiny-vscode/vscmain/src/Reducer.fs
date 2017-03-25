module App.Reducer

open App.Common

//
// Types representing a program as a mutable graph structure
//
// A graph node
type Data = 
    | DName of string * Loc
    | DInt of int
    | DStr of string
    | DImpl of CName : string * ReductionRule : RRule * Arity : int
    | DNull
    | DCell of Hd : Loc * Tl : Loc

// a mutable cell used so that graphs can be mutated during beta reduction
and Loc = Data ref

and RRule = // type of reduction rule that implements combinators and other operations
    | Binary of (Data -> Data -> Data) // strict binary operation on two operands
    | Custom of (Loc list -> int -> Unit) // custom operation which mutates stack
                  
//
// Graph functions
//

/// pretty-print function for possibly cyclic graphs
let ppL x = 
    let rec ppL1 trail (x : Loc) = 
        match !x with
        | DName(s, x) -> sprintf "<%s:%A>" s (!x)
        | DInt n -> string n
        | DStr s -> "\"" + s + "\""
        | DImpl(s, _, _) -> s
        | DNull -> "Null"
        | DCell _ when List.exists (fun y -> System.Object.ReferenceEquals(x, y)) trail -> sprintf "...loop..."
        | DCell(h, t) -> sprintf "(%s,%s)" (ppL1 (x :: trail) h) (ppL1 (x :: trail) t)
        | DImpl(s, _, _) -> sprintf "%s*" s
    ppL1 [] x

let ppS stack = (stack |> List.map ppL)

// Tail of a graph binary  cell
let DTail x = 
    match !x with
    | DCell(_, t) -> t
    | _ -> failwithf "In Tail x: x= %A" (ppL x)

// head of a graph binary cell
let DHead x = 
    match !x with
    | DCell(h, _) -> h
    | _ -> failwithf "In Head x: x=%A" (ppL x)

/// a binary cell in the graph representing a (possibly Curried) function application.
let DApply x y = DCell(x, y) |> ref

/// Equality on graphs - all combinators and trees are treated as non-equal
/// Immediate (not-tree) data is correctly compared
/// DNull is not equal to any pair (which is a P function application), but equal to DNull
/// function applications are always not equal
let DEquals a b = 
    match a, b with
    | DName(s1, _), DName(s2, _) when s1 = s2 -> true
    | DInt n1, DInt n2 -> n1 = n2
    | DStr s1, DStr s2 -> s1 = s2
    | DNull, DNull -> true
    | _ -> false

let (|REFCELL|_|) = function | DCell(h,t) -> Some(!h,!t) | _ -> None

let DIsPair x = 
    match !x with
    | REFCELL(REFCELL(DImpl("P",_,_),_),_) -> true
    | _ -> false

let getInt x = 
    match x with
    | DInt n -> n
    | _ -> failwithf "%A found when integer expected" x

let getArg (stack : Loc list) n = DTail(List.item n stack)
let getStack (stack : Loc list) n = List.item n stack
let changeStack (stack : Loc list) n newValue = List.item n stack := newValue

let isApp l = 
    match !l with
    | DCell(_) -> true
    | _ -> false

//
// ----------------------Functions to Load expression as Graph-----------------------------------
/// Bracket abstraction
/// [v] exp: abstract name v from expression exp, using combinators
/// ([v] exp) v = exp
let rec bracketAbstract v exp = 
    match exp with
    | Apply([ x ]) -> bracketAbstract v x
    | Apply(lst) when List.length lst >= 2 -> 
        let n = List.length lst
        Apply [ Name "S"
                bracketAbstract v (Apply lst.[0..n - 2])
                bracketAbstract v (lst.[n - 1]) ]
    | x when x = v -> Name "I"
    | y -> 
        Apply [ Name "K"
                y ]

/// Abstract each element of vl from exp in list order
let listBracketAbstract vl exp = List.fold (fun e v -> bracketAbstract v e) exp vl

/// Convert an expression into a graph suitable for reduction
/// Note how Apply lst gets transformed into a list of binary DApply cells
/// Names are looked up in envt and turned into ref cells of implementations
/// In the case of recursive functions these cells are over-written by the 
/// correct implementation after the graph as been created.
/// Normal call: makeHeap BuiltinFuncs
let rec makeHeap (envt : (string * Loc) list) (exp : Exp) : Data Ref = 
    let lookUpValue evt s = snd (List.find (fun (nm, _) -> s = nm) evt)
    
    let rec makeH e = 
        function 
        | Literal(TokIntLit n) -> DInt n |> ref
        | Literal(TokStrLit n) -> DStr n |> ref
        | Name s -> (lookUpValue e s)
        | Literal _ as x -> failwithf "Unrecognised literal %A" x
        | NullExp -> DNull |> ref
        | Apply [] -> DNull |> ref
        | Apply [ x ] -> makeH e x
        | Apply(lst) -> DApply (Apply lst.[0..lst.Length - 2] |> makeH e) (List.last lst |> makeH e)
        | Lambda(Name f, args, fBody, expIn) -> 
            let fRef = ref DNull // Loc for function definition - initially null
            let envtWithF = (f, fRef) :: e // add Loc to envt
            let fDef = listBracketAbstract (List.rev args) fBody // get function defn using combinators
            let af = makeHeap envtWithF fDef // load function defn to heap replacing names by envt Locs
            fRef := (!af) // update the Loc corresponding to the function just loaded
            makeH envtWithF expIn // load the IN expression to heap using the envt with f added
        | _ -> failwithf "Exp case %A not implemented in makeHeap" exp
    makeH envt exp

//
// Combinator Graph Reduction
//
/// Perform normal order combinator beta reduction on root until top-level tree is irreducible
/// n: level of recursive calls to reduce (controls print indentation)
/// root:
let rec reduce n root = 
    let rec indent = 
        function 
        | 0 -> ""
        | n -> " " + indent (n - 1)
    
    let rec getSpine sp root = 
        match !root with
        | DCell(h, _) -> getSpine (h :: sp) h
        | _ -> sp
    
    printfn "%sReducing: %s" (indent n) (ppL root)
    let rec reduceLoop() = 
        let stack = getSpine [ root ] root
        if not (isApp root) then root
        else 
            let top = List.head stack
            match !top with
            | DCell _ -> failwithf "Should never happen!"
            | DImpl(_, _, n) when n > stack.Length -> root
            | DImpl("P", _, _) -> // To evaluate a P we must evaluate its Head which is the 1st element
                // in any list made of pairs
                reduce (n + 1) (getArg stack 1) |> ignore // recursively reduce the pair Head
                root // return with tail in its unreduced form
            | DImpl(_, Custom func, _) -> 
                func stack n
                reduceLoop()
            | DImpl(_, Binary func, _) -> 
                let a = reduce (n + 1) (getArg stack 1)
                let b = reduce (n + 1) (getArg stack 2)
                let ret = func !a !b
                (getStack stack 2) := ret
                reduceLoop()
            | DName(s, body) -> 
                printfn "%sEntering function %s..." (indent n) s
                top := !body
                reduceLoop()
            | _ -> top
    
    let retVal = reduceLoop()
    printfn "%svalue is: %s" (indent n) (ppL retVal)
    retVal

//
// Reduction Rules for individual built-in functions
//
/// I combinator
let IReduce(stack : Loc list) n = 
    let x = getArg stack 1
    changeStack stack 1 !x

/// K combinator
let KReduce(stack : Loc list) n = 
    let y = getArg stack 1
    changeStack stack 2 !y

/// S combinator
let SReduce(stack : Loc list) n = 
    let ga = getArg stack
    let f, g, x = ga 1, ga 2, ga 3
    changeStack stack 3 !(DApply (DApply f x) (DApply g x))

/// F combinator used for "false" in ITE
let FReduce(stack : Loc list) n = 
    let y = getArg stack 2
    changeStack stack 2 !y

/// ISPAIR returns true only for its single parameter a pair
let ISPAIRReduce dBool (stack : Loc list) n = 
    let b = match !(getArg stack 1) with 
            | DImpl("ISPAIR",_,_) ->
              reduce (n + 1) (getArg stack 1) |> DIsPair // recursively reduce the parameter and test it
            | _ -> false
    changeStack stack 1 (dBool b)



/// combinators and other functions that are built in
let BuiltInFuncs = 
    /// generate a custom function from the table
    let comb cName cFun arity = cName, ref (DImpl(cName, ReductionRule = Custom cFun, Arity = arity))
    
    /// generate a strict binary function from the table
    let binop bName bFun = bName, ref (DImpl(bName, ReductionRule = Binary bFun, Arity = 2))
    
    // map boolean into equivalent combinator
    let dBool b = 
        match b with
        | true -> !(snd (comb "K" KReduce 2))
        | false -> !(snd (comb "F" FReduce 2))
    
    [ comb "P" (fun _ _ -> ()) 2 // "P" is special case implemented in reduce loop
      comb "P" (fun _ _ -> ()) 2 |> (fun (_, impl) -> "::", impl) // make "::" the same as "P"
      comb "I" IReduce 1
      comb "K" KReduce 2
      comb "F" FReduce 2
      comb "S" SReduce 3
      comb "ISPAIR" (ISPAIRReduce dBool) 1
      comb "ITE" IReduce 1 // ITE is the same as I
      binop "+" (fun a b -> DInt(getInt a + getInt b))
      binop "-" (fun a b -> DInt(getInt a - getInt b))
      binop "/" (fun a b -> DInt(getInt a / getInt b))
      binop "%" (fun a b -> DInt(getInt a % getInt b))
      binop "*" (fun a b -> DInt(getInt a * getInt b))
      binop "<" (fun a b -> dBool (getInt a < getInt b))
      binop ">" (fun a b -> dBool (getInt a > getInt b))
      binop "=" (fun a b -> dBool (DEquals a b)) ]
