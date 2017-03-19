module Main
open Common.State
open Parse
open Interpret
open Fable.Core
open Fable.Import
open FsHtml

[<EntryPoint>]

let getById<'T when 'T :> Browser.HTMLElement> id =
    Browser.document.getElementById(id) :?> 'T
    
let main args =  
    let state = initState
    let inString = "MOV R5, #2"
    let newState = inString |> Tokeniser.tokenise |> Parser.parser |> Interpreter.interpret state
    let regs = Browser.document.getElementById "regs"
    let registerString = 
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
                        th %(sprintf "%A" (readReg newState i))
                    ]

                ]
            ]
    regs.innerHTML <- registerString |> Html.toString

    let editor = getById<Browser.HTMLSelectElement>("editor").value
    printfn "%A" editor
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