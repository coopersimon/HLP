// Module that defines the instruction types and state

namespace Common
module State =
    
    (*** STATE ***)

    /// Represents the Machine State.
    type StateHandle = S of Regs:int [] * N:bool * Z:bool * C:bool * S:bool

    // Functions to access and modify state.

    /// Creates default state.
    let initState =
        let regs = Array.create 16 0
        S(regs, false, false, false, false)

    /// Read a register in the state.
    let readReg (S(reg,_,_,_,_): StateHandle) r =
        reg.[r]

    /// Write a value to a register in the state.
    let writeReg (S(reg,n,z,c,s): StateHandle) r v =
        let newRegs = Array.mapi (fun i x -> if r = i then v else x) reg
        S(newRegs,n,z,c,s)

    /// Read the value in the Program Counter.
    let readPC (S(reg,_,_,_,_): StateHandle) =
        reg.[15]

    /// Write a value to the Program Counter.
    let writePC (S(reg,n,z,c,s): StateHandle) v =
        let newRegs = Array.mapi (fun i x -> if i = 15 then v else x) reg
        S(newRegs,n,z,c,s)

    /// Increment the Program Counter by 4.
    let incPC (S(reg,n,z,c,s): StateHandle) =
        let newRegs = Array.mapi (fun i x -> if i = 15 then 4 else x) reg
        S(newRegs,n,z,c,s)

    /// Retrieve negative flag.
    let nFlag (S(_,n,_,_,_): StateHandle) = n

    /// Retrieve negative flag.
    let zFlag (S(_,_,z,_,_): StateHandle) = z

    /// Retrieve negative flag.
    let cFlag (S(_,_,_,c,_): StateHandle) = c
    
    /// Retrieve negative flag.
    let sFlag (S(_,_,_,_,s): StateHandle) = s

    


