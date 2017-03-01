module App.Main
open Fable.Import
open App.CodeMirrorInterface
open App.Renderer




let main () =
    printfn "Starting..."
    let editId = getById<Fable.Import.Browser.HTMLTextAreaElement> "code"
    printfn "Creating editor"
    let cmEditor = App.CodeMirrorImports.CodeMirror.fromTextArea(editId, initOptions)
    printfn "Setting editor value"
    cmEditor.setValue " abc def *** //comment"
    printfn "Line tokens: %A" (cmEditor.getLineTokens 0)
    render()
    printfn "Main code finished"
    
main()

