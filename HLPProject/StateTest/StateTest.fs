// Test code for State.

namespace Test
module State =

    open Common.State

    // test states
    let stateA = S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty)
    let stateB = S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.empty)
    

    let test_initState =
        [(initState, stateA);
        (initState, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty))]

    let test_initStateVisual =
        [(initStateVisual, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0xFF000000;0;0|],false,false,false,false,Map.empty))]

    let test_writeReg =
        [(writeReg 0 15 stateA, S([|15;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 0 -34 stateA, S([|-34;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 1 516 stateA, S([|0;516;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 10 12345 stateA, S([|0;0;0;0;0;0;0;0;0;0;12345;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 15 1000 stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1000|],false,false,false,false,Map.empty));
        (writeReg 0 555 stateB, S([|555;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.empty));
        (writeReg 8 -123456 stateB, S([|0;1;2;3;400;5000;60000;700000;-123456;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.empty))]

    let test_readReg =
        [(readReg 3 stateA, 0);
        (readReg 0 stateB, 0);
        (readReg 2 stateB, 2);
        (readReg 4 stateB, 400);
        (readReg 7 stateB, 700000);
        (readReg 9 stateB, -9);
        (readReg 13 stateB, -1300)]

    let test_readPC =
        [(readPC stateA, 0);
        (readPC stateB, -1234)]

    let test_writePC =
        [(writePC -1357 stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;-1357|],false,false,false,false,Map.empty));
        (writePC 9001 stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;9001|],false,true,false,true,Map.empty))]

    let test_incPC =
        [(incPC stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;4|],false,false,false,false,Map.empty));
        (incPC stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1230|],false,true,false,true,Map.empty))]

    let test_readNFlag =
        [(readNFlag stateA, false);
        (readNFlag stateB, false)]
        
    let test_readZFlag =
        [(readZFlag stateA, false);
        (readZFlag stateB, true)]
        
    let test_readCFlag =
        [(readCFlag stateA, false);
        (readCFlag stateB, false)]
        
    let test_readVFlag =
        [(readVFlag stateA, false);
        (readVFlag stateB, true)]

    let test_writeNFlag =
        [(writeNFlag true stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],true,false,false,false,Map.empty));
        (writeNFlag true stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],true,true,false,true,Map.empty));
        (writeNFlag false stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.empty))]
        
    let test_writeZFlag =
        [(writeZFlag true stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,true,false,false,Map.empty));
        (writeZFlag true stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.empty));
        (writeZFlag false stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,false,false,true,Map.empty))]
        
    let test_writeCFlag =
        [(writeCFlag true stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,true,false,Map.empty));
        (writeCFlag true stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,true,true,Map.empty));
        (writeCFlag false stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.empty))]
        
    let test_writeVFlag =
        [(writeVFlag true stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,true,Map.empty));
        (writeVFlag true stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.empty));
        (writeVFlag false stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,false,Map.empty))]

    let test_readMem =
        [(readMem 0 stateA, 0);
        (readMem 20 stateB, 0)]

    let test_writeMem =
        [(writeMem 8 255 stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.ofList[(8,255)]));
        (writeMem 128 12345 stateB, S([|0;1;2;3;400;5000;60000;700000;-8;-9;-10;-11;-120;-1300;-14000;-1234|],false,true,false,true,Map.ofList[(128,12345)]))]