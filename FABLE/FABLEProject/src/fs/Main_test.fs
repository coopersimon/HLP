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
    let mutable state = initStateVisual
    let code = "MOV R1, 5"
    let readFromConsole: JsFunc0<string> = import "readFromConsole" "../js/helper_functions.js"

    let state = initStateVisual
    let nState = newStateAll state code
    let boolString b = 
        match b with
        | true -> sprintf "%i" 1
        | false -> sprintf "%i" 0
    let stateString state = 
        let getReg state i = 
            match i with
            | a when a <= 15 -> sprintf "%i" (readReg i state)
            | 16 -> boolString (readNFlag state)
            | 17 -> boolString (readZFlag state)
            | 18 -> boolString (readCFlag state)
            | 19 -> boolString (readVFlag state)
            | _ -> "ERROR"

        let testList = List.map (getReg state) [0..19]
        testList.ToString

    let outputString = 
        match nState with
            | Ok(i,s) -> (stateString s)
            | Err(i,msg) -> (fun _ -> "ERROR")
    printfn "%s" (outputString ())
    printfn "%s" (readFromConsole.Invoke())
    0