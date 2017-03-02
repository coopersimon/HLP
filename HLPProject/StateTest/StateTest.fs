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

    // TODO: add some tests on stateB here.
    let test_writeReg =
        [(writeReg 0 15 stateA, S([|15;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 0 -34 stateA, S([|-34;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 1 516 stateA, S([|0;516;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 10 12345 stateA, S([|0;0;0;0;0;0;0;0;0;0;12345;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg 15 1000 stateA, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1000|],false,false,false,false,Map.empty))]

    let test_readReg =
        [(readReg 3 stateA, 0);
        (readReg 0 stateB, 0);
        (readReg 2 stateB, 2);
        (readReg 4 stateB, 400);
        (readReg 7 stateB, 700000);
        (readReg 9 stateB, -9);
        (readReg 13 stateB, -1300)]
