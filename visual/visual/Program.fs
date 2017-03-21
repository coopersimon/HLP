namespace VisualInterface

open Common.State
open Parse
open Interpret
open Parse.Tokeniser
open Common.Conditions
open Common.Error

module Program=

    open VisualInterface
    open Expecto

    let seqConfig = { Expecto.Tests.defaultConfig with parallel = false}

    let state = initStateVisual

    let getFlags (regArr, flagBool) = 
        let flags = ""

        let rec matchSeq flags flagsList =
            match flagsList with
            | false :: tail -> matchSeq (flags + "0") tail
            | true :: tail -> matchSeq (flags + "1") tail
            | [] -> flags

        matchSeq flags flagBool

    let getRegs (regArr : int[], flagBool) = 
        
        let regList = List.empty
        let rec matchRegs regFormat regNum =
            if (regNum < 15) then
                let newReg =  R regNum, regArr.[regNum]
                matchRegs (newReg :: regFormat) (regNum + 1)
            else
                regFormat
        matchRegs regList 0     

    let testRegs st = (getRegs (readState st))
    let testFlags st = (getFlags (readState st)) 

//    let runTest instr = 
//        match instr |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpret state) with
//        | Ok(_, newState) -> ((testRegs newState), (testFlags newState))
//        | Err(L, msg) -> failwithf "%A%s" L msg   

    let runTest instr = 
        match instr |> Tokeniser.tokenise |> Parser.parser |> wrapErr (Interpreter.interpret state) with
        | Ok(_, newState) -> ((testRegs newState), (testFlags newState))
        | Err(L, msg) -> failwithf "%A%s" L msg   

    /// postlude which sets R1 bits to status bit values
    let NZCVToR12 =
       """
          MOV R1, #0
          ADDMI R1, R1, #8
          ADDEQ R1, R1, #4
          ADDCS R1, R1, #2
          ADDVS R1, R1, #1
       """ 

    let defaultParas = {
            Cached = false                  // true if results are stored in a cache on disk and reused to speed 
                                            // up future repeat simulations
            VisualPath =  @"..\..\..\visualapp\visual\" // the directory in which the downloaded VisUAL.exe can be found
            WorkFileDir = @"..\..\..\VisualWork\"      // the directory in which both temporary files and the persistent cache file are put
            MemDataStart = 0x100            // start of VisUAL data section Memory
            MemLocs = []                    // memory locations to be traced and data returned

        }

    type Flags = 
        {
            FN: bool
            FZ: bool
            FC: bool
            FV: bool
        }
   
    let defParasWithLocs locs = {defaultParas with MemLocs = locs}
    
    /// Adds postlude to assembly code to detect flags values.
    /// Returns registers (before flag detection code) * flags
    let RunVisualWithFlagsOut paras src =
        let asm = src + NZCVToR12
        let trace = VisualInterface.RunVisual defaultParas asm
        if Array.length trace < 5 then failwithf "Error: Trace \n%A\nfrom\n%s\n has length %d < 5." trace asm (Array.length trace)
        let regs = 
            [0..15] 
            |> List.map (fun n -> R n, trace.[5].ResOut.[R n]) // get reg values before postlude
            |> Map.ofList
        let flagsInt = trace.[0].ResOut.[R 1] //Postlude code sets R1(3:0) equal to NZCV
        printfn "flagsint=%x, trace=%A" flagsInt trace.[5]
        let flagBool n = (flagsInt &&& (1 <<< n)) > 0
        { 
          FN = flagBool 3
          FZ = flagBool 2
          FC = flagBool 1
          FV = flagBool 0
        }, regs

    /// Run Visual with specified source code and list of memory locations to trace
    /// src - source code
    /// memLocs - list of memory locations to trace
    let RunVisualWithFlagsOutLocs memLocs src =
        RunVisualWithFlagsOut {defaultParas with MemLocs = memLocs} src

    /// convenience function, convert 4 char string to NZCV status flag record
    let strToFlags s =
        let toBool = function | '0' -> false | '1' -> true | s -> failwithf "Bad character in flag specification '%c'" s
        match s |> Seq.toList |> List.map toBool with
        | [ a ; b ; c ; d] -> { FN=a; FZ=b;FC=c;FV=d}
        | _ -> failwithf "Wrong number of characters (should be 4) in flag specification %s" s
    
    
    /// run an expecto test of VisUAL
    /// name - name of test
    ///
    let VisualUnitTest name src  =
        testCase name <| fun () ->
            let state = initStateVisual
            let ((outExpected: (Out * int) list), (flagsExpected:string)) = 
                (runTest src)
            let mems = outExpected |> List.collect (function | Mem n, x -> [n,x] | _ -> [])
            let memLocs = mems |> List.map fst
            let flags, outs = RunVisualWithFlagsOutLocs memLocs src
            Expecto.Expect.equal flags (flagsExpected |> strToFlags) "Status flags don't match"
            let regs = outExpected |> List.filter (function | R _,_ -> true | _ -> false)
            let getOut (out, v) = 
                try
                    out, outs.[out]
                with
                | _ -> failwithf "Can't find output %A in outs %A" out outs
            Expecto.Expect.sequenceEqual (outExpected |> List.map getOut) outExpected "Reg and Mem outputs don't match"
            
    let randomReg() (rnd : System.Random) = 
        "R" + string(rnd.Next(12))

    let randomImm() (rnd : System.Random) = 
        let rotateRight x r = (x>>>r) ||| (x<<<(32-r))
        let getShift = (rnd.Next(15) <<< 1)
        let retval = uint32(rotateRight (rnd.Next(255)) getShift)      
        "#" + retval.ToString()

    let regConstShift() (rnd : System.Random) = 
         match rnd.Next(9) with
         | 0 | 6 | 7 | 8 | 9 -> randomReg() rnd 
         | 1 -> randomReg() rnd + ", LSL #" + string(rnd.Next(31))
         | 2 -> randomReg() rnd + ", LSR #" + string(rnd.Next(1,32))
         | 3 -> randomReg() rnd + ", ASR #" + string(rnd.Next(1,32))
         | 4 -> randomReg() rnd + ", ROR #" + string(rnd.Next(1,31))
         | 5 -> randomReg() rnd + ", RRX"
         | _ -> ""

    let operand2() (rnd : System.Random) = 
        match rnd.Next(10) with
        | 0 | 7 | 8 | 9 | 10 -> randomImm() rnd
        | 1 -> regConstShift() rnd
        | 2 -> randomReg() rnd + ", LSL " + randomReg() rnd
        | 3 -> randomReg() rnd + ", LSR " + randomReg() rnd
        | 4 -> randomReg() rnd + ", LSR " + randomReg() rnd
        | 5 -> randomReg() rnd + ", ASR " + randomReg() rnd
        | 6 -> randomReg() rnd + ", ROR " + randomReg() rnd
        | _ -> ""

    let allInstr rnd = [

        //ADD, ADDS
        ("ADD " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("ADDS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))

        //ADC, ADCS
        ("ADC " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("ADCS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))

        //SUB, SUBS
        ("SUB " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("SUBS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))

        //SBC, SBCS
        ("SBC " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("SBCS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))

        //RSB, RSBS
        ("RSB " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("RSBS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))

        //RSC, RSCS
        ("RSC " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("RSCS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))

        //CMP, CMN

        ]


    let rec randInstr (instrList : System.Random -> string list )(rnd : System.Random) instrStr n = 
            match n = 0 with 
            | false ->  let instrListInst = (instrList rnd)
                        randInstr instrList rnd (instrStr + instrListInst.[rnd.Next(instrListInst.Length)] + "\n") (n-1)
            | true -> instrStr 

    [<EntryPoint>]
    let main argv = 
        
        let rnd = System.Random()  
            
        let inInstr = (randInstr allInstr rnd "" 10) // generate a load of random instructions
        printf "%A" inInstr

        InitCache defaultParas.WorkFileDir // read the currently cached info from disk to speed things up
        let visualTests = 
            testList "Visual tests" [
                
                VisualUnitTest "Random Instruction Generator test" inInstr
                    
//                VisualUnitTest "ADDS test" "ADDS R0, R0, #1"
//                VisualUnitTest "SUB test" "SUB R0, R0, #1"
//                VisualUnitTest "SUBS test" "SUBS R0, R0, #0"
//                VisualUnitTest "SBCS test" "SUBS R0, R0, #0"
//                VisualUnitTest "RSB test" "RSB R0, R0, #0"
//                VisualUnitTest "RSC test" "RSB R0, R0, #0"
            ]
        

        let rc = runTests seqConfig visualTests
        System.Console.ReadKey() |> ignore                
        rc // return an integer exit code - 0 if all tests pass