# Conditions
This module contains all the functions that evaluate conditions for use in instructions.

## Dependencies
Exists in the namespace **Common**.

This module depends on **Common.State**.

## Interface
Each condition checks a different set of flags inside State. All of them have the following interface:

state: *StateHandle* -> condition: *bool*

The condition runs a unique boolean evaluation on the state flags. It returns true or false depending on this. Any instructions that make use of conditions (e.g., all of ARMv4's instructions) are advised to check the condition before any evaluation.