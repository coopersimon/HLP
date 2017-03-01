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
        [(writeReg stateA 0 15, S([|15;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg stateA 0 -34, S([|-34;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg stateA 1 516, S([|0;516;0;0;0;0;0;0;0;0;0;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg stateA 10 12345, S([|0;0;0;0;0;0;0;0;0;0;12345;0;0;0;0;0|],false,false,false,false,Map.empty));
        (writeReg stateA 15 1000, S([|0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1000|],false,false,false,false,Map.empty))]

    let test_readReg =
        [(readReg stateA 3, 0);
        (readReg stateB 0, 0);
        (readReg stateB 2, 2);
        (readReg stateB 4, 400);
        (readReg stateB 7, 700000);
        (readReg stateB 9, -9);
        (readReg stateB 13, -1300)]
