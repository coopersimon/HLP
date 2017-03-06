import { readReg, initState } from "./State";
import { interpret } from "./Interpreter";
import { parser } from "./Parser";
import { tokenise } from "./Tokeniser";
import { fsFormat } from "fable-core/String";

(function (args) {
  var state = initState;
  var inString = "MOV R5, #2";

  var newState = function (instr) {
    return interpret(state, instr);
  }(parser(tokenise(inString)));

  fsFormat("%A")(function (x) {
    console.log(x);
  })(readReg(5, state));
  fsFormat("%A")(function (x) {
    console.log(x);
  })(readReg(5, newState));
  return 0;
})(process.argv.slice(2));