## How to create an F# project in VS Code

Starting with F# source files, create all the project files and dependencies needed to compile and run F# code and Expecto tests in a multi-file project.

These instructions will recreate the project here in `tiny-vscode` from an empty initial directory. Without following these instructions the project downloaded should work, and can be built and run without further configuration see *Buildng the project* below.

1. Install VS Code extensions: ionide-fsharp, ionide-fake, ionode-paket
2. Open an empty folder in VS Code which you wish to become the project folder, for example `tiny-vscode`.
3. Create f# project: `Ctrl-Shift-P` -> f# -> Create New Project -> Expecto -> `<ENTER>` -> `vscmain`. The project will be created in `tiny-vscode/vscmain`. The `paket` and `msbuild` scripts will be created one directory higher in `tiny-vscode`.
4. Copy source files into `tiny-vscode/vscmain/src` by copying the downloaded `src` directory.
5. Add source files to project.
 * Open source file
 * `Ctrl-Shift-P` -> f# (in box) -> add file to project
 * Repeat as needed adding all files in compile order
 * Re-order current file with `Ctrl-shift-UP-ARROW` or `Ctrl-Shift-DOWN-ARROW` if you get this wrong.
 * Check, or alternatively add/remove, source files from `tiny-vscode/vscmain/vscmain.fsproj` with a text editor. The source file paths can be found by searching for `compile` in this file and look like:

```
  <ItemGroup>
    <Compile Include="src/Common.fs" />
    <Compile Include="src/Tokeniser.fs" />
    <Compile Include="src/Parser.fs" />
    <Compile Include="src/Reducer.fs" />
    <Compile Include="Tests.fs" />
    <Compile Include="src/Main.fs" />
    <None Include="App.config" />
  </ItemGroup>
```

6. Add any other Nuget dependencies (not needed for this code) using Paket - the open source equivalent of Nuget: `Ctrl-Shift-P` -> pak (in box) -> add nuget package. The project created automatically includes expecto packages for running tests conveniently. you can add other packages
 * Expecto
 * Expecto.BenchmarkDotNet
 * Expecto.FsCheck

## Building the project

7. To build and the project move to the top-level `tiny-vscode directory` in a command window. There are two platform specific initial build commands: `build.cmd` (Windows) and `build.sh` (linux etc). These update the `Paket` tool and then run it to download dependencies and build the project to make `build\vscmain.exe`. After they have been run once you can build again using `build.fsx` which will run under `fsi` and rebuild the project useing `FAKE` - the F# version of make.
8. To run the built file run `build\build.exe` or the equivalent executable under a command window. The top-level file will execute printing a combinator reduction, and then running some dummy [expecto](https://github.com/haf/expecto) tests. expector includes `fscheck` and `fsunit` and so can be used for property-based or unit testing.
