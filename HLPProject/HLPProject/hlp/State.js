var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { compare, compareUnions, equalsUnions, makeGeneric, Array as _Array } from "fable-core/Util";
import { add, tryFind, create } from "fable-core/Map";
import _Map from "fable-core/Map";
import { mapIndexed, replicate } from "fable-core/Seq";
import GenericComparer from "fable-core/GenericComparer";
export var StateHandle = function () {
  function StateHandle(caseName, fields) {
    _classCallCheck(this, StateHandle);

    this.Case = caseName;
    this.Fields = fields;
  }

  _createClass(StateHandle, [{
    key: _Symbol.reflection,
    value: function () {
      return {
        type: "Common.State.StateHandle",
        interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
        cases: {
          S: [_Array(Int32Array, true), "boolean", "boolean", "boolean", "boolean", makeGeneric(_Map, {
            Key: "number",
            Value: "number"
          })]
        }
      };
    }
  }, {
    key: "Equals",
    value: function (other) {
      return equalsUnions(this, other);
    }
  }, {
    key: "CompareTo",
    value: function (other) {
      return compareUnions(this, other);
    }
  }]);

  return StateHandle;
}();
setType("Common.State.StateHandle", StateHandle);
export var initState = function () {
  var regs = Int32Array.from(replicate(16, 0));
  return new StateHandle("S", [regs, false, false, false, false, create(null, new GenericComparer(compare))]);
}();
export function readReg(r, _arg1) {
  return _arg1.Fields[0][r];
}
export function writeReg(r, v, _arg1) {
  var newRegs = Int32Array.from(mapIndexed(function (i, x) {
    return r === i ? v : x;
  }, _arg1.Fields[0]));
  return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
export function readPC(_arg1) {
  return _arg1.Fields[0][15];
}
export function writePC(v, _arg1) {
  var newRegs = Int32Array.from(mapIndexed(function (i, x) {
    return i === 15 ? v : x;
  }, _arg1.Fields[0]));
  return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
export function incPC(_arg1) {
  var newRegs = Int32Array.from(mapIndexed(function (i, x) {
    return i === 15 ? 4 : x;
  }, _arg1.Fields[0]));
  return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
export function readNFlag(_arg1) {
  return _arg1.Fields[1];
}
export function readZFlag(_arg1) {
  return _arg1.Fields[2];
}
export function readCFlag(_arg1) {
  return _arg1.Fields[3];
}
export function readVFlag(_arg1) {
  return _arg1.Fields[4];
}
export function writeNFlag(n, _arg1) {
  return new StateHandle("S", [_arg1.Fields[0], n, _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
export function writeZFlag(z, _arg1) {
  return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], z, _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
export function writeCFlag(c, _arg1) {
  return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], _arg1.Fields[2], c, _arg1.Fields[4], _arg1.Fields[5]]);
}
export function writeVFlag(v, _arg1) {
  return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], v, _arg1.Fields[5]]);
}
export function readMem(addr, _arg1) {
  var matchValue = tryFind(addr, _arg1.Fields[5]);

  if (matchValue == null) {
    return 0;
  } else {
    return matchValue;
  }
}
export function writeMem(addr, v, _arg1) {
  var newMem = add(addr, v, _arg1.Fields[5]);
  return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], newMem]);
}