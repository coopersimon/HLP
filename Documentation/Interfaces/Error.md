# Error
This module contains a type Error, as well as a binding function and a function to extract elements from a list and put them in a string.

## Dependencies
Exists in the namespace **Common**.

No dependencies.

## Error type
A DU which wraps any type. The options are as follows:
* **Ok**: *'a* - A valid output. Needs to be unwrapped by the calling function.
* **Err**: *int\*string* - An erroneous output. Contains an error value (e.g. used for line numbers) and a description string.

## Some functions
**wrapErr** = function: *'a -> Error<'b>* -> argument: *Error<'a>* -> output: *Error<'b>*

The above function allows a function that doesn't normally accept an Error to unwrap it and run.

**errorList** = errors_in: *'a list* -> error_string: *string*

The above function takes in a list of erroneous values and composes the first 5 into a string. (Used in the parser to print incorrect tokens).