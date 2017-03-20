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

    /// Return first 5 elements of list.
    let errorList lst =
        let rec addToStr lst n =
            match n < 5 with
            | true -> match lst with
                      | h::t -> (sprintf "%A" h) + "; " + (addToStr t (n+1))
                      | [] -> ""
            | false -> ""
        addToStr lst 0