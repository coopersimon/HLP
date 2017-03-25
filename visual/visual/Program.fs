namespace VisualInterface

open Common.State
open Parse
open Interpret
open Parse.Tokeniser
open Common.Conditions
open Common.Error
open Execute.GetStates


module Program=

    open VisualInterface
    open Expecto

    let seqConfig = { Expecto.Tests.defaultConfig with parallel = false}

    let getFlags (regArr, flagBool) =  // get flags into the format expected by the testbench
        let flags = ""

        let rec matchSeq flags flagsList =
            match flagsList with
            | false :: tail -> matchSeq (flags + "0") tail
            | true :: tail -> matchSeq (flags + "1") tail
            | [] -> flags

        matchSeq flags flagBool

    let getRegs (regArr : int[], flagBool) = 
        
        let regList = List.empty
        let rec matchRegs regFormat regNum = // get all 16 registers into the list
            if (regNum < 15) then
                let newReg =  R regNum, regArr.[regNum]
                matchRegs (newReg :: regFormat) (regNum + 1)
            else
                regFormat // return the correct list
        matchRegs regList 0   
    
    let getMem (regArr : int[], flagBool, mem : Map<int, int>) = //gets a complete register and memory map 
        let outList = List.empty
        let memList = Map.toList mem

        let rec matchMems regFormat mems = // for every key in the memory map, append to list
            match mems with 
            | (addr, value) :: tail ->  let newMem = Mem addr, value 
                                        matchMems (newMem :: regFormat) mems.[1..]
            | [] -> regFormat

        let rec matchRegs regFormat regNum = // get all 16 registers into the list
            if (regNum < 15) then
                let newReg =  R regNum, regArr.[regNum]
                matchRegs (newReg :: regFormat) (regNum + 1)
            else
                matchMems regFormat memList // when registers done, start parsing memory

        matchRegs outList 0   

    let testRegs st = (getRegs (readState st)) // functions to return registers/flags/memory content
    let testFlags st = (getFlags (readState st)) 
    let testRegsWithMem st = (getMem (readStateWithMem st))

    let runTest runInstr = // Handle to run emulator, runInstr containing the string with instruction{s}
        let nState = newState runInstr
        match nState with
            | Ok(_,s) -> ((testRegs s), (testFlags s))
            | Err(l,msg) -> failwithf "Line %d: %s" l msg

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
    let VisualUnitTest name src  = // compare output of VisUAL with output from our program
        testCase name <| fun () ->
            let ((outExpected: (Out * int) list), (flagsExpected:string)) = (runTest src) // runs the instruction{s} on our emulator
            let mems = outExpected |> List.collect (function | Mem n, x -> [n,x] | _ -> [])
            let memLocs = mems |> List.map fst
            let regs = outExpected |> List.filter (function | R _,_ -> true | _ -> false)
            let flags, outs = RunVisualWithFlagsOutLocs memLocs src
            let getOut (out, v) = 
                try
                    out, outs.[out]
                with
                | _ -> failwithf "Can't find output %A in outs %A" out outs
            Expecto.Expect.sequenceEqual (outExpected |> List.map getOut) outExpected "Reg and Mem outputs don't match" //Expecto to compare outputs
            Expecto.Expect.equal flags (flagsExpected |> strToFlags) "Status flags don't match"
           
    let randomReg() (rnd : System.Random) = //Generate a random register in range 0-12 (can be changed to 0-15 if for some reason PC/SP want to be written to)
        "R" + string(rnd.Next(12))

    let randomImm() (rnd : System.Random) = //Generate a random immediate - take an 8-bit integer and rotate it right by a 5-bit even integer
        let rotateRight x r = (x>>>r) ||| (x<<<(32-r))
        let getShift = (rnd.Next(15) <<< 1)
        let retval = uint32(rotateRight (rnd.Next(255)) getShift)      
        "#" + retval.ToString()

    let regConstShift() (rnd : System.Random) = //Generate a register with constant shift - as per ARMv4 spec, probability skewed towards no shift
         match rnd.Next(9) with
         | 0 | 6 | 7 | 8 | 9 -> randomReg() rnd 
         | 1 -> randomReg() rnd + ", LSL #" + string(rnd.Next(31))
         | 2 -> randomReg() rnd + ", LSR #" + string(rnd.Next(1,32))
         | 3 -> randomReg() rnd + ", ASR #" + string(rnd.Next(1,32))
         | 4 -> randomReg() rnd + ", ROR #" + string(rnd.Next(1,31))
         | 5 -> randomReg() rnd + ", RRX"
         | _ -> ""

    let operand2() (rnd : System.Random) = //Generate a flexible 2nd operand - as per ARMv4 spec, probability skewed towards no shift
        match rnd.Next(10) with
        | 0 | 7 | 8 | 9 | 10 -> randomImm() rnd
        | 1 -> regConstShift() rnd
        | 2 -> randomReg() rnd + ", LSL " + randomReg() rnd
        | 3 -> randomReg() rnd + ", LSR " + randomReg() rnd
        | 4 -> randomReg() rnd + ", LSR " + randomReg() rnd
        | 5 -> randomReg() rnd + ", ASR " + randomReg() rnd
        | 6 -> randomReg() rnd + ", ROR " + randomReg() rnd
        | _ -> ""


    // List containing all instructions that can be run by the testbench
    // This is not an exhaustive list of instructions supported by our emulator,
    // but not all of our instructions are implemented in VisUAL, so not all can be model checked
    // Those not supported by VisUAL are just unit tested by their respective owners
    
    // Branches omitted on purpose, adding branches to randomly generated code is a terrible idea
    let allInstr rnd = [ 

        //MOV, MOVS
        ("MOV " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("MOVS " + (randomReg() rnd) + ", " + (operand2() rnd))

        //MVN, MVNS
        ("MVN " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("MVNS " + (randomReg() rnd) + ", " + (operand2() rnd))

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
        ("CMP " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("CMN " + (randomReg() rnd) + ", " + (operand2() rnd))

        //TST, TEQ
        ("TST " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("TEQ " + (randomReg() rnd) + ", " + (operand2() rnd))

        //Bitwise OPS
        ("AND " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("EOR " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("ORR " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("ORN " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
        ("BIC " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
//        ("ANDS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd)) // flag updates on bitwise ops don't work correctly in Visual
//        ("EORS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
//        ("ORRS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
//        ("ORNS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))
//        ("BICS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (operand2() rnd))

        //Shifts
        ("ASR " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("LSL " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("LSR " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("ROR " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("RRX " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("ASRS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("LSLS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("LSRS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("RORS " + (randomReg() rnd) + ", " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ("RRXS " + (randomReg() rnd) + ", " + (randomReg() rnd))
        ]


    let rec randInstr (instrList : System.Random -> string list )(rnd : System.Random) instrStr n = // generate a list of random instructions, containing n instructions
            match n = 0 with 
            | false ->  let instrListInst = (instrList rnd)
                        randInstr instrList rnd (instrStr + instrListInst.[rnd.Next(instrListInst.Length)] + "\n") (n-1)
            | true -> instrStr 

    let oneInstr (instrList : System.Random -> string list )(rnd : System.Random) = // generate a single random instruction
        let instrListInst = instrList rnd
        (instrListInst.[rnd.Next(instrListInst.Length)] + "\n")


    [<EntryPoint>]
    let main argv = 
        
        let rnd = System.Random()  
            
        let listOfInstr = (randInstr allInstr rnd "" 10) // generate a load of random instructions
        let singleRandInstr = (oneInstr allInstr rnd)
        printf "\nRandomly generated instruction set: \n%A" listOfInstr
        printf "\nSingle random instruction: \n%A" singleRandInstr

        InitCache defaultParas.WorkFileDir // read the currently cached info from disk to speed things up
        let visualTests = 
            testList "Visual tests" [
             
                VisualUnitTest "Random Instruction Generator test" listOfInstr // randomly generated set of instructions
                VisualUnitTest "Random single instruction test" singleRandInstr // single instruction


//                VisualUnitTest "MEM test" "MOV R0, #1 // mem tests don't work - visual interface missing
//                                            MOV R1, #0x7F000000
//                                            STR R0, [R1]"
            ]
        
        let rc = runTests seqConfig visualTests
        System.Console.ReadKey() |> ignore                
        rc // return an integer exit code - 0 if all tests pass