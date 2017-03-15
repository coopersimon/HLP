namespace Common

module Error =
    
    type Error<'a> =
        | Ok of 'a
        | Err of string

    let wrapErr f x =
        match x with
        | Ok(arg) -> f arg
        | Err(s) -> Err(s)