namespace Common

module Error =
    
    /// Error monad. Ok: valid result. Err: error string plus error value (line number).
    type Error<'a> =
        | Ok of 'a
        | Err of int*string

    /// Wrap function in error monad. Function must return error.
    let wrapErr f x =
        match x with
        | Ok(arg) -> f arg
        | Err(i,s) -> Err(i,s)