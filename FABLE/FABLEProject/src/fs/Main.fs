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
    let regs = Browser.document.getElementById "regs"
    let getRegisterTable regState = 
         table [
                "class"%="table table-striped"                
                thead [                    
                    tr [
                        th %("Register")
                        th %("Value")
                    ]
                ]
                tbody [ 
                for i in 1..15 ->
                    tr [
                        th %(sprintf "R%A" i)
                        th %(sprintf "%A" (readReg i regState))
                    ]

                ]
            ]

    let registerString = 
        match nState with
        | Ok(s) -> (getRegisterTable s) |> Html.toString
        | Err(msg) -> sprintf "%s" msg

    regs.innerHTML <- registerString 
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