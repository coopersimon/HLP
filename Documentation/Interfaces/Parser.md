# Parser
The parser converts an input list of tokens to an output map. The map's keys are memory locations and the values are partially-applied functions, all of which convert an input state to an output state. The interpreter then passes the state through these functions.
