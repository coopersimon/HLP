// Generic test framework

namespace Test
module TestFramework =
    
    // compares a list of inputs to expected outputs.
    // returns TRUE if all passed, FALSE if ONE failed.
    let compareList lst =
        List.forall (fun (a,b) -> a = b) lst

    
    // compares a list of inputs to expected outputs
    // returns with string list of failures
    let compareListVerbose lst =
        let rec checkElement lst testNum =
            match lst with
            | (a,b) :: t when a=b -> checkElement t (testNum+1)
            | (a,b) :: t -> sprintf "%d: Got %A; Expected %A" testNum a b :: checkElement t (testNum+1)
            | [] -> []
        checkElement lst 0