# State
The StateHandle is an abstract object that is used as input and output to the interpreter & instructions.

DO NOT MODIFY THE STATEHANDLE MANUALLY. Only interface with using the following API:

## Interface
Note that of all the following instructions that take in a StateHandle as input, the input state is the LAST input argument. This allows for pipelining of state through the functions (for example, in a branch and link instruction).

#### initState
val: StateHandle

Returns a default device state.

### Registers

#### readReg
reg_number: int -> in_state: StateHandle -> reg_data: int

This reads a single register in the state. Returns the data inside the register.

#### writeReg
reg_number: int -> reg_in_data: int -> in_state: StateHandle -> out_state: StateHandle

This writes a value to a single register in the state. Returns a new state with the reg value modified.

#### readPC
in_state: StateHandle -> PC_data: int

This just returns the value in the PC. Mostly used in the interpreter.

#### writePC
PC_in_data: int -> in_state: StateHandle -> out_state: StateHandle

This writes a new value to the PC. Returns a new state with the PC value modified.

#### incPC
in_state: StateHandle -> out_state: StateHandle

Like writePC, but using a constant value of 4. This is used by the interpreter.

### Flags

#### read[n|z|c|v]flag
in_state: StateHandle -> flag_value: bool

Reads the value in the flag.

#### write[n|z|c|v]flag
in_data: bool -> in_state: StateHandle -> out_state: StateHandle

Writes a new value to the flag.

### Data Memory
Note that instruction memory is not respresented in the state.

#### readMem
address: int -> in_state: StateHandle -> out_state: StateHandle

Reads the value in the inputted memory address. If nothing has been written yet it returns 0.

#### writeMem
address: int -> data: int -> in_state: StateHandle -> out_state: StateHandle

Writes a new value to a memory address.