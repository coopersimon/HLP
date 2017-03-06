# TINY language compiler & run-time system

For worksheet 4 ignore *tiny-fable-start* below and use either the VS Code or the Visual Studio Project. You may also ignore the tests.


You will need, for your project work, to develop code using Visual Studio or VS code. The code you write will then be recompiled under FABLE to make a web page. Note that all your testing will be done under VS of VS code and the normal F# compiler. Thus is there are problems with the transpilation process you can still show you have working code and be safely assessed.

This directory conatins some sample projects to show how this works.

## Projects included

These three projects use identical source code, except that the expecto tests will not run under FABLE, and are omitted. FABLE can run its own (less complex, and not including FsCheck) tests.

### tiny-fable-start

Illustrates how to compile and run F# course files using the FABLE transpiler to Javascript. This generates a Javascript equivalent file which can be run in a browser from ./dist/index.html. In order to see the console printout you will need, inside the browser, to open developer tools by right-click->inspect and then select the console tab to see printout.

### tiny-vs

The same code running, together with Expecto tests, under a Visual Studio project, together with instructions to recreate the project from sources if need be.

### tiny-vscode

The same code running, together with expecto tests, under a VS Code project, together with instructions to recreate the project from sources if need be.
