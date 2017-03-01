#r "../node_modules/fable-core/Fable.Core.dll"
#r "../node_modules/fable-import-electron/fable.import.electron.fs"

open Fable.Import.

let body = Browser.document.getElementsByTagName_h1().[0]
body.textContent <- "Hello World!"