namespace Test

open Common.State
open Common.Error
open Execute.GetStates
open Parse
open Interpret
open Fable.Core
open Fable.Import
open FsHtml
open Fable.Core.JsInterop

module Tester = 
    type Test = 
        {Input:string; Output:int[]}
            
    type Tests = 
        Tests of Test[]

    let mutable state = initStateVisual
    let nState code = newStateAll state code
    let boolString b = 
        match b with
        | true -> sprintf "%i" 1
        | false -> sprintf "%i" 0
    
    let boolInt b = 
        match b with
        | true -> 1
        | false -> 0
    
    let stateArray state = 
        let getReg state i = 
            match i with
            | a when a <= 15 -> (readReg i state)
            | 16 -> boolInt (readNFlag state)
            | 17 -> boolInt (readZFlag state)
            | 18 -> boolInt (readCFlag state)
            | 19 -> boolInt (readVFlag state)
            | _ -> -1

        let testArray:int[] = Array.map (getReg state) [|0..19|]
        testArray

    let outputString code = 
        match (nState code) with
            | Ok(i,s) -> (stateArray s)
            | Err(i,msg) -> [|0|]

    let runTest test = 
        match test with
        | {Input=i;Output=o} -> (=) o (outputString i)

    let printTest json = 
        let getString test = match test with
                                | {Input=i;Output=o} -> (sprintf "Correct: %A; Incorrect: %A" (outputString i) o)

        match json with
        |  Tests test -> test |> Array.map(fun test -> getString test)

    let runTests json = 
        let correct = match json with
                        | Tests test -> 
                            test 
                            |> Array.map(fun test -> runTest test) 
                            |> Array.reduce (fun acc elem -> acc && elem)
        
        if correct 
        then "PASSED FRONT END TEST" 
        else (sprintf "FAILED// %A" (printTest json))