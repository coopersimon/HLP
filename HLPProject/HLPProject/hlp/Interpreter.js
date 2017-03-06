import { tryFind } from "fable-core/Map";
import { incPC, readPC } from "./State";
import { fsFormat } from "fable-core/String";
export function interpret(state, instr) {
  interpret: while (true) {
    var matchValue = tryFind(readPC(state), instr);
    var $var163 = matchValue != null ? matchValue.Case === "Instr" ? [0, matchValue.Fields[0]] : matchValue.Case === "Terminate" ? [1] : [2] : [2];

    switch ($var163[0]) {
      case 0:
        state = $var163[1](incPC(state));
        instr = instr;
        continue interpret;

      case 1:
        return state;

      case 2:
        return fsFormat("Undefined interpreting error")(function (x) {
          throw new Error(x);
        });
    }
  }
}