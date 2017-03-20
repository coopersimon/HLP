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
    let saveCodeMirror: JsFunc1<_,string> = import "saveCodeMirror" "../js/helper_functions.js"
    let initializeCodeMirror: JsFunc0<_> = import "initializeCodeMirror" "../js/helper_functions.js"
    let cmEditor = initializeCodeMirror.Invoke()

    let getRegisterTable valid regState = 
        div [
            table [
                    "class"%="table table-striped table-condensed"                
                    thead [                    
                        tr [
                            th %("Register")
                            th %("Value")
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
                                        | true -> %(sprintf "%A" (readReg i regState))) 
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
        let code = saveCodeMirror.Invoke(cmEditor)
        let state = initStateVisual
        let nState = newState state code

        let registerString = 
            match nState with
            | Ok(s) -> (getRegisterTable true s) |> Html.toString
            | Err(msg) -> (getRegisterTable false initState) |> Html.toString

        let errorString = 
            match nState with
            | Ok(s) -> sprintf ""
            | Err(msg) -> sprintf "%s" msg
        
        printfn "%A" registerString
        regs.innerHTML <- registerString 
        errorBox.innerHTML <- errorString


    compileAllBtn.addEventListener_click(fun _ -> compileAll () ; null)
    
    //let highlightLine: JsFunc2<int,_,_> = import "highlightLine" "../js/helper_functions.js"
    0