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
    let readNFlag (S(_,n,_,_,_): StateHandle) = n

    /// Retrieve zero flag.
    let readZFlag (S(_,_,z,_,_): StateHandle) = z

    /// Retrieve carry flag.
    let readCFlag (S(_,_,_,c,_): StateHandle) = c
    
    /// Retrieve overflow flag.
    let readVFlag (S(_,_,_,_,v): StateHandle) = v
    
    /// Write negative flag.
    let writeNFlag (S(reg,_,z,c,v): StateHandle) n =
        S(reg,n,z,c,v)

    /// Write zero flag.
    let writeZFlag (S(reg,n,_,c,v): StateHandle) z =
        S(reg,n,z,c,v)

    /// Write carry flag.
    let writeCFlag (S(reg,n,z,_,v): StateHandle) c =
        S(reg,n,z,c,v)
    
    /// Write overflow flag.
    let writeVFlag (S(reg,n,z,c,_): StateHandle) v =
        S(reg,n,z,c,v)

