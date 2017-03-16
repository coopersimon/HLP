namespace Common

module Error =
    
    /// Error monad. Ok: valid result. Err: error string.
    type Error<'a> =
        | Ok of 'a
        | Err of string

    /// Wrap function in error monad. Function must return error.
    let wrapErr f x =
        match x with
        | Ok(arg) -> f arg
        | Err(s) -> Err(s)

    /// Return first 5 elements of list.
    let errorList lst =
        let rec addToStr lst n =
            match n < 5 with
            | true -> match lst with
                      | h::t -> (sprintf "%A" h) + "; " + (addToStr t (n+1))
                      | [] -> ""
            | false -> ""
        addToStr lst 0