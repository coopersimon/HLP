// Module that defines the instruction types and state

namespace Common
module State =
    
    (*** STATE ***)

    /// Represents the Machine State.
    type StateHandle = S of Regs:int [] * N:bool * Z:bool * C:bool * S:bool * Mem:Map<int,int>

    // Functions to access and modify state.

    /// Creates default state.
    let initState =
        let regs = Array.create 16 0
        S(regs, false, false, false, false, Map.empty)

    /// Read a register in the state.
    let readReg r (S(reg,_,_,_,_,_): StateHandle) =
        reg.[r]

    /// Write a value to a register in the state.
    let writeReg r v (S(reg,n,z,c,s,mem): StateHandle) =
        let newRegs = Array.mapi (fun i x -> if r = i then v else x) reg
        S(newRegs,n,z,c,s,mem)

    /// Write a value to a register in the state and update status flags.
    (*let writeRegFlags r v r1 r2 (S(reg,n,z,c,s,mem): StateHandle) =
        let newRegs = Array.mapi (fun i x -> if r = i then v else x) reg
        match v with
        | x when (x < r1) && (x < r2) ->  *)

    /// Read the value in the Program Counter.
    let readPC (S(reg,_,_,_,_,_): StateHandle) =
        reg.[15]

    /// Write a value to the Program Counter.
    let writePC v (S(reg,n,z,c,s,mem): StateHandle) =
        let newRegs = Array.mapi (fun i x -> if i = 15 then v else x) reg
        S(newRegs,n,z,c,s,mem)

    /// Increment the Program Counter by 4.
    let incPC (S(reg,n,z,c,s,mem): StateHandle) =
        let newRegs = Array.mapi (fun i x -> if i = 15 then x+4 else x) reg
        S(newRegs,n,z,c,s,mem)

    /// Retrieve negative flag.
    let readNFlag (S(_,n,_,_,_,_): StateHandle) = n

    /// Retrieve zero flag.
    let readZFlag (S(_,_,z,_,_,_): StateHandle) = z

    /// Retrieve carry flag.
    let readCFlag (S(_,_,_,c,_,_): StateHandle) = c
    
    /// Retrieve overflow flag.
    let readVFlag (S(_,_,_,_,v,_): StateHandle) = v
    
    /// Write negative flag.
    let writeNFlag n (S(reg,_,z,c,v,mem): StateHandle) =
        S(reg,n,z,c,v,mem)

    /// Write zero flag.
    let writeZFlag z (S(reg,n,_,c,v,mem): StateHandle) =
        S(reg,n,z,c,v,mem)

    /// Write carry flag.
    let writeCFlag c (S(reg,n,z,_,v,mem): StateHandle) =
        S(reg,n,z,c,v,mem)
    
    /// Write overflow flag.
    let writeVFlag v (S(reg,n,z,c,_,mem): StateHandle) =
        S(reg,n,z,c,v,mem)

    /// Read from a memory address.
    let readMem addr (S(_,_,_,_,_,mem): StateHandle) =
        match Map.tryFind addr mem with
        | Some(v) -> v
        | None -> 0

    /// Write to a memory address.
    let writeMem addr v (S(reg,n,z,c,s,mem): StateHandle) =
        let newMem = Map.add addr v mem
        S(reg,n,z,c,s,newMem)