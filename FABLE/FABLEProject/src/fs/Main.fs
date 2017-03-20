module Main
open Common.State
open Common.Error
open Execute.GetStates
open Parse
open Interpret
open Fable.Core
open Fable.Import
open FsHtml

[<EntryPoint>]
    
let main args =  
    let state = initState
    let inString = "MOV R, #2"
    let nState = newState state inString
    
    let getRegisterTable valid regState = 
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
                    for i in 1..15 ->
                        tr [
                            th %(sprintf "R%A" i)
                            th ( match valid with
                                    | false -> %(sprintf "X")
                                    | true -> %(sprintf "%A" (readReg i regState))) 
                        ]

                    ]
                ]
                
            ]

    let registerString = 
        match nState with
        | Ok(s) -> (getRegisterTable true s) |> Html.toString
        | Err(msg) -> (getRegisterTable false initState) |> Html.toString

    let errorString = 
        match nState with
        | Ok(s) -> sprintf ""
        | Err(msg) -> sprintf "%s" msg

    let regs = Browser.document.getElementById "regs"
    regs.innerHTML <- registerString 

    let errorBox = Browser.document.getElementById "errorBox"
    errorBox.innerHTML <- errorString
    0
 (*

<table class="table table-striped">
    <thead>
      <tr>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John</td>
        <td>Doe</td>
        <td>john@example.com</td>
      </tr>
      <tr>
        <td>Mary</td>
        <td>Moe</td>
        <td>mary@example.com</td>
      </tr>
      <tr>
        <td>July</td>
        <td>Dooley</td>
        <td>july@example.com</td>
      </tr>
    </tbody>
  </table>
 *)