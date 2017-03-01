// Test file for conditions.

namespace Test
module Conditions =
    
    open Common.Conditions
    open Common.State

    // Note that the following few stages are dependent on Common.State.
    // Meaning if Condition tests fail it may be because of dependencies (i.e. State)
    // Make sure state tests aren't failing!

    // create test states
    let stateA = initState
    let stateB = writeNFlag (writeCFlag initState true) true
    let stateC = writeZFlag (writeCFlag (writeVFlag initState true) true) true
    let stateD = writeVFlag initState true
    let stateE = writeVFlag (writeNFlag initState true) true

    // init test states

    let test_checkAL =
        [(checkAL stateA, true);
        (checkAL stateB, true);
        (checkAL stateC, true);
        (checkAL stateD, true)]

    let test_checkEQ =
        [(checkEQ stateA, false);
        (checkEQ stateB, false);
        (checkEQ stateC, true);
        (checkEQ stateD, false)]

    let test_checkNE =
        [(checkNE stateA, true);
        (checkNE stateB, true);
        (checkNE stateC, false);
        (checkNE stateD, true)]

    let test_checkCS =
        [(checkCS stateA, false);
        (checkCS stateB, true);
        (checkCS stateC, true);
        (checkCS stateD, false)]

    let test_checkCC =
        [(checkCC stateA, true);
        (checkCC stateB, false);
        (checkCC stateC, false);
        (checkCC stateD, true)]

    let test_checkMI =
        [(checkMI stateA, false);
        (checkMI stateB, true);
        (checkMI stateC, false);
        (checkMI stateD, false)]

    let test_checkPL =
        [(checkPL stateA, true);
        (checkPL stateB, false);
        (checkPL stateC, true);
        (checkPL stateD, true)]

    let test_checkVS =
        [(checkVS stateA, false);
        (checkVS stateB, false);
        (checkVS stateC, true);
        (checkVS stateD, true)]

    let test_checkVC =
        [(checkVC stateA, true);
        (checkVC stateB, true);
        (checkVC stateC, false);
        (checkVC stateD, false)]

    let test_checkHI =
        [(checkHI stateA, false);
        (checkHI stateB, true);
        (checkHI stateC, false);
        (checkHI stateD, false)]

    let test_checkLS =
        [(checkLS stateA, true);
        (checkLS stateB, false);
        (checkLS stateC, true);
        (checkLS stateD, true)]

    let test_checkGE =
        [(checkGE stateA, true);
        (checkGE stateB, false);
        (checkGE stateC, false);
        (checkGE stateD, false);
        (checkGE stateE, true)]

    let test_checkLT =
        [(checkLT stateA, false);
        (checkLT stateB, true);
        (checkLT stateC, true);
        (checkLT stateD, true);
        (checkLT stateE, false)]

    let test_checkGT =
        [(checkGT stateA, true);
        (checkGT stateB, false);
        (checkGT stateC, false);
        (checkGT stateD, false);
        (checkGT stateE, true)]

    let test_checkLE =
        [(checkLE stateA, false);
        (checkLE stateB, false);
        (checkLE stateC, true);
        (checkLE stateD, false);
        (checkLE stateE, false)]