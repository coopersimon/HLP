module Main
open Common.State
open Common.Error
open Execute.GetStates
open Parse
open Interpret
open Fable.Core
open Fable.Import
open FsHtml
open Fable.Core.JsInterop

[<EntryPoint>]    
let main args = 
    let regs = Browser.document.getElementById "regs"
    let errorBox = Browser.document.getElementById "errorBox"
    let compileAllBtn = Browser.document.getElementById "compileAllBtn"
    let compileNextLineBtn = Browser.document.getElementById "compileNextLineBtn"
    let resetBtn = Browser.document.getElementById "resetBtn"
    let toggleThemeBtn = Browser.document.getElementById "toggleThemeBtn"
    let saveCodeMirror: JsFunc1<_,string> = import "saveCodeMirror" "../js/helper_functions.js"
    let initializeCodeMirror: JsFunc0<_> = import "initializeCodeMirror" "../js/helper_functions.js"
    let highlightLine: JsFunc3<int,_,int,_> = import "highlightLine" "../js/helper_functions.js"
    let changeCMTheme: JsFunc0<_> = import "changeCMTheme" "../js/helper_functions.js"
    let clearAllLines: JsFunc1<_,_> = import "clearAllLines" "../js/helper_functions.js"
    let cmEditor = initializeCodeMirror.Invoke()
    printfn "cmEditor = %A" cmEditor
    let mutable state = initStateVisual

    let rec toBinary (value: uint32)=
        if value < 2u then
            value.ToString()
        else
            let divisor = value/2u
            let remainder = (value % 2u).ToString()
            toBinary(divisor) + remainder

    let getRegisterTable valid regState = 
        div [
            table [
                    "class"%="table table-striped table-condensed"                
                    thead [                    
                        tr [
                            th %("Register")
                            th %("Hex")
                            th %("Bin")
                            th %("Dec (sig)")
                            th %("Dec (unsig)")

                        ]
                    ]
                    tbody [ 
                    "class"%= (match valid with
                                | false -> "red"
                                | true -> "black")
                    div [
                        for i in 0..15 ->
                            tr [
                                th %(sprintf "R%A" i)
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(sprintf "%08X" (readReg i regState))) 
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(regState |> readReg i |> uint32 |> toBinary)) 
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(sprintf "%i" (readReg i regState)))
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(sprintf "%i" (regState |> readReg i |> uint32)))  
                            ]

                        ]
                    ]
                ]
            br []
            table [
                    "class"%="table table-striped table-condensed"   
                    thead [                    
                            tr [
                                th %("Flag")
                                th %("Value")
                            ]
                        ]
                    tbody [ 
                    "class"%= (match valid with
                                | false -> "red"
                                | true -> "black")
                    div [
                            tr [
                                th %(sprintf "N")
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(sprintf "%A" (readNFlag regState))) 
                            ]
                            tr [
                                th %(sprintf "Z")
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(sprintf "%A" (readZFlag regState))) 
                            ]
                            tr [
                                th %(sprintf "C")
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(sprintf "%A" (readCFlag regState))) 
                            ]
                            tr [
                                th %(sprintf "V")
                                th ( match valid with
                                        | false -> %(sprintf "X")
                                        | true -> %(sprintf "%A" (readVFlag regState))) 
                            ]
                    ]
                ]
            ]
        ]

            
    let compileAll () = 
        clearAllLines.Invoke(cmEditor)
        let code = saveCodeMirror.Invoke(cmEditor)
        let state = initStateVisual
        let nState = newStateAll state code

        let registerString = 
            match nState with
            | Ok(i,s) -> (getRegisterTable true s) |> Html.toString
            | Err(i,msg) -> (getRegisterTable false initState) |> Html.toString

        let errorString = 
            match nState with
            | Ok(i,s) -> sprintf "Ran %i lines" i
            | Err(i,msg) -> sprintf "ERROR ON LINE %i\t %s" i msg
        
        match nState with
            | Ok(i,s) -> ()
            | Err(i,msg) -> highlightLine.Invoke(i,cmEditor,1)

        printfn "%A" registerString
        regs.innerHTML <- registerString 
        errorBox.innerHTML <- errorString
    
    let compileNextLine () = 
        clearAllLines.Invoke(cmEditor)
        let code = saveCodeMirror.Invoke(cmEditor)
        let nState = newStateSingle state code

        let registerString = 
            match nState with
            | Ok(i,s) -> (getRegisterTable true s) |> Html.toString
            | Err(i,msg) -> (getRegisterTable false initState) |> Html.toString

        let errorString = 
            match nState with
            | Ok(i,s) -> sprintf "Ran line %i" i
            | Err(i,msg) -> sprintf "ERROR ON LINE %i\t %s" i msg
        
        state <- 
            match nState with
            | Ok(i,s) -> s
            | Err(i,msg) -> initStateVisual
        
        match nState with
            | Ok(i,s) -> highlightLine.Invoke(i,cmEditor,2)
            | Err(i,msg) -> highlightLine.Invoke(i,cmEditor,1)

        printfn "%A" registerString
        regs.innerHTML <- registerString 
        errorBox.innerHTML <- errorString
    
    let resetCompiler () =
        printfn "cmEditor = %A" cmEditor
        clearAllLines.Invoke(cmEditor)
        state <- initStateVisual
        errorBox.innerHTML <- ""
        regs.innerHTML <- ((getRegisterTable true state) |> Html.toString)

    let toggle () =
        changeCMTheme.Invoke(cmEditor)
        //10

    compileAllBtn.addEventListener_click(fun _ -> compileAll () ; null)
    compileNextLineBtn.addEventListener_click(fun _ -> compileNextLine () ; null)
    resetBtn.addEventListener_click(fun _ -> resetCompiler () ; null)
    //toggleThemeBtn.addEventListener_click(fun _ -> toggle () ; null)
    resetCompiler ()
    0