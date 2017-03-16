var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { create, add, tryFind } from "fable-core/Map";
import { fsFormat } from "fable-core/String";
import { movI, b } from "./ARMv4";
import { ofArray, append } from "fable-core/List";
import List from "fable-core/List";
import GenericComparer from "fable-core/GenericComparer";
import { compare } from "fable-core/Util";
export var Instruction = function () {
  function Instruction(caseName, fields) {
    _classCallCheck(this, Instruction);

    this.Case = caseName;
    this.Fields = fields;
  }

  _createClass(Instruction, [{
    key: _Symbol.reflection,
    value: function () {
      return {
        type: "Parse.Parser.Instruction",
        interfaces: ["FSharpUnion"],
        cases: {
          Branch: ["function"],
          Instr: ["function"],
          Terminate: []
        }
      };
    }
  }]);

  return Instruction;
}();
setType("Parse.Parser.Instruction", Instruction);
export function parser(tokLst) {
  var branchTo = function branchTo(c) {
    return function (s) {
      return function (labels) {
        var matchValue = tryFind(s, labels);

        if (matchValue == null) {
          return fsFormat("branch label doesn't exist!")(function (x) {
            throw new Error(x);
          });
        } else {
          return new Instruction("Instr", [function (state) {
            return b(c, matchValue, state);
          }]);
        }
      };
    };
  };

  var resolveLabels = function resolveLabels(labels_1) {
    return function (_arg1) {
      if (_arg1.tail == null) {
        return new List();
      } else if (_arg1.head[1].Case === "Branch") {
        return new List([_arg1.head[0], _arg1.head[1].Fields[0](labels_1)], resolveLabels(labels_1)(_arg1.tail));
      } else {
        return new List(_arg1.head, resolveLabels(labels_1)(_arg1.tail));
      }
    };
  };

  var parseRec = function parseRec(mem) {
    return function (labels_2) {
      return function (outLst) {
        return function (_arg2) {
          var _loop = function _loop() {
            var $var156 = _arg2.tail == null ? [3] : _arg2.head.Case === "T_MOV" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [0, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [4] : [4] : [4] : [4] : [4] : [4] : _arg2.head.Case === "T_B" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_LABEL" ? [1, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail] : [4] : [4] : _arg2.head.Case === "T_LABEL" ? [2, _arg2.head.Fields[0], _arg2.tail] : [4];

            switch ($var156[0]) {
              case 0:
                var $var160 = mem + 4;
                labels_2 = labels_2;
                outLst = append(outLst, ofArray([[mem, new Instruction("Instr", [function (state_1) {
                  return movI($var156[1], $var156[4], $var156[3], $var156[2], state_1);
                }])]]));
                _arg2 = $var156[5];
                mem = $var160;
                return "continue|parseRec";

              case 1:
                var $var161 = mem + 4;
                labels_2 = labels_2;
                outLst = append(outLst, ofArray([[mem, new Instruction("Branch", [branchTo($var156[1])($var156[2])])]]));
                _arg2 = $var156[3];
                mem = $var161;
                return "continue|parseRec";

              case 2:
                var $var162 = mem;
                labels_2 = add($var156[1], mem, labels_2);
                outLst = outLst;
                _arg2 = $var156[2];
                mem = $var162;
                return "continue|parseRec";

              case 3:
                return {
                  v: resolveLabels(labels_2)(append(outLst, ofArray([[mem, new Instruction("Terminate", [])]])))
                };

              case 4:
                return {
                  v: fsFormat("unhandled parse error")(function (x) {
                    throw new Error(x);
                  })
                };
            }
          };

          parseRec: while (true) {
            var _ret = _loop();

            switch (_ret) {
              case "continue|parseRec":
                continue parseRec;

              default:
                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            }
          }
        };
      };
    };
  };

  return create(parseRec(0)(create(null, new GenericComparer(compare)))(new List())(tokLst), new GenericComparer(compare));
}