# State
The StateHandle is an abstract object that is used as input and output to the interpreter & instructions.

DO NOT MODIFY THE STATEHANDLE MANUALLY. Only interface with using the following API:

## Interface

### initState
val: StateHandle

Returns a default device state.

### readReg
in_state: StateHandle -> reg_number: int -> reg_data: int

This reads a single register in the state. Returns the data inside the register.

### writeReg
in_state: StateHandle -> reg_number: int -> reg_in_data: int -> out_state: StateHandle

This writes a value to a single register in the state. Returns a new state with the reg value modified.

### readPC
in_state: StateHandle -> PC_data: int

This just returns the value in the PC. Mostly used in the interpreter.

### writePC
in_state: StateHandle -> PC_in_data: int -> out_state: StateHandle

This writes a new value to the PC. Returns a new state with the PC value modified.

### incPC
in_state: StateHandle -> out_state: StateHandle

Like writePC, but using a constant value of 4. This is used by the interpreter.

### read[n|z|c|v]flag
in_state: StateHandle -> flag_value: bool

Reads the value in the flag.

### write[n|z|c|v]flag
in_state: StateHandle -> in_data: bool -> out_state: StateHandle

Writes a new value to the flag.

## Future interfaces

Memory access will be added, as well as more potential PC modifiers.