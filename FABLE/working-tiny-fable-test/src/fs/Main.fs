namespace App
module Main =
    let src = "IF x THEN a b ( y+z ) ELSE (123) FI"
    let src1 = "2+3"
    let src3 = "LET fib n = IF n < 2 THEN 1 ELSE fib(n-1) + fib(n-2) FI IN fib 8"
    let src2 = "LET f x = x + 11 IN LET g x = x+1 IN f 20 + f 30 + g 7" 
    let src4 = "LET f n = IF n > 0 THEN 101 ELSE 2 + f (n-1) FI IN f 2"   
    let src5 = "LET fpp n = P 1 (fpp (n+1)) IN fpp 1"
    let tokens = 
        Tokeniser.tokeniseList
        >> List.ofSeq

    let parse = Parser.ParseExpression 0

    let make = Reducer.makeHeap Reducer.BuiltInFuncs

    let pp = Reducer.ppL


    let testProgram src = 
        printfn "Input = %A\n\n" src
        printfn "Tokens = %A\n\n" (tokens src)
        let pTree = (src |> tokens |> parse)
        printfn "Parse Tree = %A\n\n" pTree
        let heap = 
            match pTree with
            | Some (exp,_)-> make exp
            | _ -> failwithf "Unexpected parse tree, expected 'Some(exp,_)'\nfound: %A" pTree
        printfn "Memory Graph = %s\n\n" (pp heap)
#if FABLE_COMPILER
#else
        printfn "Memory Graph as F# structure =%A" heap
#endif
        Reducer.reduce 0 heap

    let enterProgram() =
        testProgram src1

#if FABLE_COMPILER
#else
    open Expecto

    [<EntryPoint>]
    let main argv =
        Tests.runTestsInAssembly defaultConfig argv
#endif

#if FABLE_COMPILER
    enterProgram() |> ignore
#endif