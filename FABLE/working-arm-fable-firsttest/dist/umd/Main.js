(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

var fableGlobal = function () {
    var globalObj = typeof window !== "undefined" ? window
        : (typeof global !== "undefined" ? global
            : (typeof self !== "undefined" ? self : null));
    if (typeof globalObj.__FABLE_CORE__ === "undefined") {
        globalObj.__FABLE_CORE__ = {
            types: new Map(),
            symbols: {
                reflection: Symbol("reflection"),
            }
        };
    }
    return globalObj.__FABLE_CORE__;
}();
function setType(fullName, cons) {
    fableGlobal.types.set(fullName, cons);
}

var _Symbol = (fableGlobal.symbols);

var NonDeclaredType = (function () {
    function NonDeclaredType(kind, definition, generics) {
        this.kind = kind;
        this.definition = definition;
        this.generics = generics;
    }
    NonDeclaredType.prototype.Equals = function (other) {
        if (this.kind === other.kind && this.definition === other.definition) {
            return typeof this.generics === "object"
                ? equalsRecords(this.generics, other.generics)
                : this.generics === other.generics;
        }
        return false;
    };
    return NonDeclaredType;
}());
var Any = new NonDeclaredType("Any");
var Unit = new NonDeclaredType("Unit");

function FArray(t) {
    return new NonDeclaredType("Array", "Array", t);
}





/**
 * Returns the parent if this is a declared generic type or the argument otherwise.
 * Attention: Unlike .NET this doesn't throw an exception if type is not generic.
*/




function getRestParams(args, idx) {
    for (var _len = args.length, restArgs = Array(_len > idx ? _len - idx : 0), _key = idx; _key < _len; _key++)
        restArgs[_key - idx] = args[_key];
    return restArgs;
}
function toString(o) {
    return o != null && typeof o.ToString == "function" ? o.ToString() : String(o);
}

function equals(x, y) {
    // Optimization if they are referencially equal
    if (x === y)
        return true;
    else if (x == null)
        return y == null;
    else if (y == null)
        return false;
    else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y))
        return false;
    else if (typeof x.Equals === "function")
        return x.Equals(y);
    else if (Array.isArray(x)) {
        if (x.length != y.length)
            return false;
        for (var i = 0; i < x.length; i++)
            if (!equals(x[i], y[i]))
                return false;
        return true;
    }
    else if (ArrayBuffer.isView(x)) {
        if (x.byteLength !== y.byteLength)
            return false;
        var dv1 = new DataView(x.buffer), dv2 = new DataView(y.buffer);
        for (var i = 0; i < x.byteLength; i++)
            if (dv1.getUint8(i) !== dv2.getUint8(i))
                return false;
        return true;
    }
    else if (x instanceof Date)
        return x.getTime() == y.getTime();
    else
        return false;
}
function compare(x, y) {
    // Optimization if they are referencially equal
    if (x === y)
        return 0;
    if (x == null)
        return y == null ? 0 : -1;
    else if (y == null)
        return 1; // everything is bigger than null
    else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y))
        return -1;
    else if (typeof x.CompareTo === "function")
        return x.CompareTo(y);
    else if (Array.isArray(x)) {
        if (x.length != y.length)
            return x.length < y.length ? -1 : 1;
        for (var i = 0, j = 0; i < x.length; i++)
            if ((j = compare(x[i], y[i])) !== 0)
                return j;
        return 0;
    }
    else if (ArrayBuffer.isView(x)) {
        if (x.byteLength != y.byteLength)
            return x.byteLength < y.byteLength ? -1 : 1;
        var dv1 = new DataView(x.buffer), dv2 = new DataView(y.buffer);
        for (var i = 0, b1 = 0, b2 = 0; i < x.byteLength; i++) {
            b1 = dv1.getUint8(i), b2 = dv2.getUint8(i);
            if (b1 < b2)
                return -1;
            if (b1 > b2)
                return 1;
        }
        return 0;
    }
    else if (x instanceof Date)
        return compare(x.getTime(), y.getTime());
    else
        return x < y ? -1 : 1;
}
function equalsRecords(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return true;
    }
    else {
        var keys = Object.getOwnPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            if (!equals(x[keys[i]], y[keys[i]]))
                return false;
        }
        return true;
    }
}

function equalsUnions(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return true;
    }
    else if (x.Case !== y.Case) {
        return false;
    }
    else {
        for (var i = 0; i < x.Fields.length; i++) {
            if (!equals(x.Fields[i], y.Fields[i]))
                return false;
        }
        return true;
    }
}
function compareUnions(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return 0;
    }
    else {
        var res = compare(x.Case, y.Case);
        if (res !== 0)
            return res;
        for (var i = 0; i < x.Fields.length; i++) {
            res = compare(x.Fields[i], y.Fields[i]);
            if (res !== 0)
                return res;
        }
        return 0;
    }
}

// This module is split from List.ts to prevent cyclic dependencies
function ofArray$1(args, base) {
    var acc = base || new List();
    for (var i = args.length - 1; i >= 0; i--) {
        acc = new List(args[i], acc);
    }
    return acc;
}
var List = (function () {
    function List(head, tail) {
        this.head = head;
        this.tail = tail;
    }
    List.prototype.ToString = function () {
        return "[" + Array.from(this).map(toString).join("; ") + "]";
    };
    List.prototype.Equals = function (x) {
        // Optimization if they are referencially equal
        if (this === x) {
            return true;
        }
        else {
            var iter1 = this[Symbol.iterator](), iter2 = x[Symbol.iterator]();
            for (;;) {
                var cur1 = iter1.next(), cur2 = iter2.next();
                if (cur1.done)
                    return cur2.done ? true : false;
                else if (cur2.done)
                    return false;
                else if (!equals(cur1.value, cur2.value))
                    return false;
            }
        }
    };
    List.prototype.CompareTo = function (x) {
        // Optimization if they are referencially equal
        if (this === x) {
            return 0;
        }
        else {
            var acc = 0;
            var iter1 = this[Symbol.iterator](), iter2 = x[Symbol.iterator]();
            for (;;) {
                var cur1 = iter1.next(), cur2 = iter2.next();
                if (cur1.done)
                    return cur2.done ? acc : -1;
                else if (cur2.done)
                    return 1;
                else {
                    acc = compare(cur1.value, cur2.value);
                    if (acc != 0)
                        return acc;
                }
            }
        }
    };
    Object.defineProperty(List.prototype, "length", {
        get: function () {
            var cur = this, acc = 0;
            while (cur.tail != null) {
                cur = cur.tail;
                acc++;
            }
            return acc;
        },
        enumerable: true,
        configurable: true
    });
    List.prototype[Symbol.iterator] = function () {
        var cur = this;
        return {
            next: function () {
                var tmp = cur;
                cur = cur.tail;
                return { done: tmp.tail == null, value: tmp.head };
            }
        };
    };
    //   append(ys: List<T>): List<T> {
    //     return append(this, ys);
    //   }
    //   choose<U>(f: (x: T) => U, xs: List<T>): List<U> {
    //     return choose(f, this);
    //   }
    //   collect<U>(f: (x: T) => List<U>): List<U> {
    //     return collect(f, this);
    //   }
    //   filter(f: (x: T) => boolean): List<T> {
    //     return filter(f, this);
    //   }
    //   where(f: (x: T) => boolean): List<T> {
    //     return filter(f, this);
    //   }
    //   map<U>(f: (x: T) => U): List<U> {
    //     return map(f, this);
    //   }
    //   mapIndexed<U>(f: (i: number, x: T) => U): List<U> {
    //     return mapIndexed(f, this);
    //   }
    //   partition(f: (x: T) => boolean): [List<T>, List<T>] {
    //     return partition(f, this) as [List<T>, List<T>];
    //   }
    //   reverse(): List<T> {
    //     return reverse(this);
    //   }
    //   slice(lower: number, upper: number): List<T> {
    //     return slice(lower, upper, this);
    //   }
    List.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpList",
            interfaces: ["System.IEquatable", "System.IComparable"]
        };
    };
    return List;
}());

function toList(xs) {
    return foldBack(function (x, acc) {
        return new List(x, acc);
    }, xs, new List());
}








function compareWith(f, xs, ys) {
    var nonZero = tryFind(function (i) { return i != 0; }, map2(function (x, y) { return f(x, y); }, xs, ys));
    return nonZero != null ? nonZero : count(xs) - count(ys);
}
function delay(f) {
    return _a = {},
        _a[Symbol.iterator] = function () { return f()[Symbol.iterator](); },
        _a;
    var _a;
}










function fold(f, acc, xs) {
    if (Array.isArray(xs) || ArrayBuffer.isView(xs)) {
        return xs.reduce(f, acc);
    }
    else {
        var cur = void 0;
        for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
            cur = iter.next();
            if (cur.done)
                break;
            acc = f(acc, cur.value, i);
        }
        return acc;
    }
}
function foldBack(f, xs, acc) {
    var arr = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
    for (var i = arr.length - 1; i >= 0; i--) {
        acc = f(arr[i], acc, i);
    }
    return acc;
}






function initialize(n, f) {
    return delay(function () {
        return unfold(function (i) { return i < n ? [f(i), i + 1] : null; }, 0);
    });
}










// A export function 'length' method causes problems in JavaScript -- https://github.com/Microsoft/TypeScript/issues/442
function count(xs) {
    return Array.isArray(xs) || ArrayBuffer.isView(xs)
        ? xs.length
        : fold(function (acc, x) { return acc + 1; }, 0, xs);
}
function map(f, xs) {
    return delay(function () { return unfold(function (iter) {
        var cur = iter.next();
        return !cur.done ? [f(cur.value), iter] : null;
    }, xs[Symbol.iterator]()); });
}
function mapIndexed(f, xs) {
    return delay(function () {
        var i = 0;
        return unfold(function (iter) {
            var cur = iter.next();
            return !cur.done ? [f(i++, cur.value), iter] : null;
        }, xs[Symbol.iterator]());
    });
}
function map2(f, xs, ys) {
    return delay(function () {
        var iter1 = xs[Symbol.iterator]();
        var iter2 = ys[Symbol.iterator]();
        return unfold(function () {
            var cur1 = iter1.next(), cur2 = iter2.next();
            return !cur1.done && !cur2.done ? [f(cur1.value, cur2.value), null] : null;
        });
    });
}
















function replicate(n, x) {
    return initialize(n, function () { return x; });
}













function tryFind(f, xs, defaultValue) {
    for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
        var cur = iter.next();
        if (cur.done)
            return defaultValue === void 0 ? null : defaultValue;
        if (f(cur.value, i))
            return cur.value;
    }
}









function unfold(f, acc) {
    return _a = {},
        _a[Symbol.iterator] = function () {
            return {
                next: function () {
                    var res = f(acc);
                    if (res != null) {
                        acc = res[1];
                        return { done: false, value: res[0] };
                    }
                    return { done: true };
                }
            };
        },
        _a;
    var _a;
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StateHandle = function () {
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
                    S: [FArray("number"), "boolean", "boolean", "boolean", "boolean"]
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
var initState = function () {
    var regs = Int32Array.from(replicate(16, 0));
    return new StateHandle("S", [regs, false, false, false, false]);
}();
function readReg(_arg1, r) {
    return _arg1.Fields[0][r];
}
function writeReg(_arg1, r, v) {
    var newRegs = Int32Array.from(mapIndexed(function (i, x) {
        if (r === i) {
            return v;
        } else {
            return x;
        }
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4]]);
}
function readPC(_arg1) {
    return _arg1.Fields[0][15];
}

function incPC(_arg1) {
    var newRegs = Int32Array.from(mapIndexed(function (i, x) {
        if (i === 15) {
            return 4;
        } else {
            return x;
        }
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4]]);
}
function readNFlag(_arg1) {
    return _arg1.Fields[1];
}
function readZFlag(_arg1) {
    return _arg1.Fields[2];
}
function readCFlag(_arg1) {
    return _arg1.Fields[3];
}
function readVFlag(_arg1) {
    return _arg1.Fields[4];
}

var GenericComparer = (function () {
    function GenericComparer(f) {
        this.Compare = f || compare;
    }
    GenericComparer.prototype[_Symbol.reflection] = function () {
        return { interfaces: ["System.IComparer"] };
    };
    return GenericComparer;
}());

// ----------------------------------------------
// These functions belong to Seq.ts but are
// implemented here to prevent cyclic dependencies


var MapTree = (function () {
    function MapTree(caseName, fields) {
        this.Case = caseName;
        this.Fields = fields;
    }
    return MapTree;
}());
function tree_sizeAux(acc, m) {
    return m.Case === "MapOne"
        ? acc + 1
        : m.Case === "MapNode"
            ? tree_sizeAux(tree_sizeAux(acc + 1, m.Fields[2]), m.Fields[3])
            : acc;
}
function tree_size(x) {
    return tree_sizeAux(0, x);
}
function tree_empty() {
    return new MapTree("MapEmpty", []);
}
function tree_height(_arg1) {
    return _arg1.Case === "MapOne" ? 1 : _arg1.Case === "MapNode" ? _arg1.Fields[4] : 0;
}
function tree_mk(l, k, v, r) {
    var matchValue = [l, r];
    var $target1 = function () {
        var hl = tree_height(l);
        var hr = tree_height(r);
        var m = hl < hr ? hr : hl;
        return new MapTree("MapNode", [k, v, l, r, m + 1]);
    };
    if (matchValue[0].Case === "MapEmpty") {
        if (matchValue[1].Case === "MapEmpty") {
            return new MapTree("MapOne", [k, v]);
        }
        else {
            return $target1();
        }
    }
    else {
        return $target1();
    }
}

function tree_rebalance(t1, k, v, t2) {
    var t1h = tree_height(t1);
    var t2h = tree_height(t2);
    if (t2h > t1h + 2) {
        if (t2.Case === "MapNode") {
            if (tree_height(t2.Fields[2]) > t1h + 1) {
                if (t2.Fields[2].Case === "MapNode") {
                    return tree_mk(tree_mk(t1, k, v, t2.Fields[2].Fields[2]), t2.Fields[2].Fields[0], t2.Fields[2].Fields[1], tree_mk(t2.Fields[2].Fields[3], t2.Fields[0], t2.Fields[1], t2.Fields[3]));
                }
                else {
                    throw new Error("rebalance");
                }
            }
            else {
                return tree_mk(tree_mk(t1, k, v, t2.Fields[2]), t2.Fields[0], t2.Fields[1], t2.Fields[3]);
            }
        }
        else {
            throw new Error("rebalance");
        }
    }
    else {
        if (t1h > t2h + 2) {
            if (t1.Case === "MapNode") {
                if (tree_height(t1.Fields[3]) > t2h + 1) {
                    if (t1.Fields[3].Case === "MapNode") {
                        return tree_mk(tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], t1.Fields[3].Fields[2]), t1.Fields[3].Fields[0], t1.Fields[3].Fields[1], tree_mk(t1.Fields[3].Fields[3], k, v, t2));
                    }
                    else {
                        throw new Error("rebalance");
                    }
                }
                else {
                    return tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], tree_mk(t1.Fields[3], k, v, t2));
                }
            }
            else {
                throw new Error("rebalance");
            }
        }
        else {
            return tree_mk(t1, k, v, t2);
        }
    }
}
function tree_add(comparer, k, v, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return new MapTree("MapNode", [k, v, new MapTree("MapEmpty", []), m, 2]);
        }
        else if (c === 0) {
            return new MapTree("MapOne", [k, v]);
        }
        return new MapTree("MapNode", [k, v, m, new MapTree("MapEmpty", []), 2]);
    }
    else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_rebalance(tree_add(comparer, k, v, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
        }
        else if (c === 0) {
            return new MapTree("MapNode", [k, v, m.Fields[2], m.Fields[3], m.Fields[4]]);
        }
        return tree_rebalance(m.Fields[2], m.Fields[0], m.Fields[1], tree_add(comparer, k, v, m.Fields[3]));
    }
    return new MapTree("MapOne", [k, v]);
}
function tree_find(comparer, k, m) {
    var res = tree_tryFind(comparer, k, m);
    if (res != null)
        return res;
    throw new Error("key not found");
}
function tree_tryFind(comparer, k, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        return c === 0 ? m.Fields[1] : null;
    }
    else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_tryFind(comparer, k, m.Fields[2]);
        }
        else {
            if (c === 0) {
                return m.Fields[1];
            }
            else {
                return tree_tryFind(comparer, k, m.Fields[3]);
            }
        }
    }
    return null;
}
function tree_mem(comparer, k, m) {
    return m.Case === "MapOne" ? comparer.Compare(k, m.Fields[0]) === 0 : m.Case === "MapNode" ? (function () {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_mem(comparer, k, m.Fields[2]);
        }
        else {
            if (c === 0) {
                return true;
            }
            else {
                return tree_mem(comparer, k, m.Fields[3]);
            }
        }
    })() : false;
}
// function tree_foldFromTo(comparer: IComparer<any>, lo: any, hi: any, f: (k:any, v:any, acc: any) => any, m: MapTree, x: any): any {
//   if (m.Case === "MapOne") {
//     var cLoKey = comparer.Compare(lo, m.Fields[0]);
//     var cKeyHi = comparer.Compare(m.Fields[0], hi);
//     var x_1 = (cLoKey <= 0 ? cKeyHi <= 0 : false) ? f(m.Fields[0], m.Fields[1], x) : x;
//     return x_1;
//   }
//   else if (m.Case === "MapNode") {
//     var cLoKey = comparer.Compare(lo, m.Fields[0]);
//     var cKeyHi = comparer.Compare(m.Fields[0], hi);
//     var x_1 = cLoKey < 0 ? tree_foldFromTo(comparer, lo, hi, f, m.Fields[2], x) : x;
//     var x_2 = (cLoKey <= 0 ? cKeyHi <= 0 : false) ? f(m.Fields[0], m.Fields[1], x_1) : x_1;
//     var x_3 = cKeyHi < 0 ? tree_foldFromTo(comparer, lo, hi, f, m.Fields[3], x_2) : x_2;
//     return x_3;
//   }
//   return x;
// }
// function tree_foldSection(comparer: IComparer<any>, lo: any, hi: any, f: (k:any, v:any, acc: any) => any, m: MapTree, x: any) {
//   return comparer.Compare(lo, hi) === 1 ? x : tree_foldFromTo(comparer, lo, hi, f, m, x);
// }
// function tree_loop(m: MapTree, acc: any): List<[any,any]> {
//   return m.Case === "MapOne"
//     ? new List([m.Fields[0], m.Fields[1]], acc)
//     : m.Case === "MapNode"
//       ? tree_loop(m.Fields[2], new List([m.Fields[0], m.Fields[1]], tree_loop(m.Fields[3], acc)))
//       : acc;
// }
// function tree_toList(m: MapTree) {
//   return tree_loop(m, new List());
// }
// function tree_toArray(m: MapTree) {
//   return Array.from(tree_toList(m));
// }
// function tree_ofList(comparer: IComparer<any>, l: List<[any,any]>) {
//   return Seq.fold((acc: MapTree, tupledArg: [any, any]) => {
//     return tree_add(comparer, tupledArg[0], tupledArg[1], acc);
//   }, tree_empty(), l);
// }
function tree_mkFromEnumerator(comparer, acc, e) {
    var cur = e.next();
    while (!cur.done) {
        acc = tree_add(comparer, cur.value[0], cur.value[1], acc);
        cur = e.next();
    }
    return acc;
}
// function tree_ofArray(comparer: IComparer<any>, arr: ArrayLike<[any,any]>) {
//   var res = tree_empty();
//   for (var i = 0; i <= arr.length - 1; i++) {
//     res = tree_add(comparer, arr[i][0], arr[i][1], res);
//   }
//   return res;
// }
function tree_ofSeq(comparer, c) {
    var ie = c[Symbol.iterator]();
    return tree_mkFromEnumerator(comparer, tree_empty(), ie);
}
// function tree_copyToArray(s: MapTree, arr: ArrayLike<any>, i: number) {
//   tree_iter((x, y) => { arr[i++] = [x, y]; }, s);
// }
function tree_collapseLHS(stack) {
    if (stack.tail != null) {
        if (stack.head.Case === "MapOne") {
            return stack;
        }
        else if (stack.head.Case === "MapNode") {
            return tree_collapseLHS(ofArray$1([
                stack.head.Fields[2],
                new MapTree("MapOne", [stack.head.Fields[0], stack.head.Fields[1]]),
                stack.head.Fields[3]
            ], stack.tail));
        }
        else {
            return tree_collapseLHS(stack.tail);
        }
    }
    else {
        return new List();
    }
}
function tree_mkIterator(s) {
    return { stack: tree_collapseLHS(new List(s, new List())), started: false };
}
function tree_moveNext(i) {
    function current(i) {
        if (i.stack.tail == null) {
            return null;
        }
        else if (i.stack.head.Case === "MapOne") {
            return [i.stack.head.Fields[0], i.stack.head.Fields[1]];
        }
        throw new Error("Please report error: Map iterator, unexpected stack for current");
    }
    if (i.started) {
        if (i.stack.tail == null) {
            return { done: true, value: null };
        }
        else {
            if (i.stack.head.Case === "MapOne") {
                i.stack = tree_collapseLHS(i.stack.tail);
                return {
                    done: i.stack.tail == null,
                    value: current(i)
                };
            }
            else {
                throw new Error("Please report error: Map iterator, unexpected stack for moveNext");
            }
        }
    }
    else {
        i.started = true;
        return {
            done: i.stack.tail == null,
            value: current(i)
        };
    }
    
}
var FMap = (function () {
    /** Do not call, use Map.create instead. */
    function FMap() {
    }
    FMap.prototype.ToString = function () {
        return "map [" + Array.from(this).map(toString).join("; ") + "]";
    };
    FMap.prototype.Equals = function (m2) {
        return this.CompareTo(m2) === 0;
    };
    FMap.prototype.CompareTo = function (m2) {
        var _this = this;
        return this === m2 ? 0 : compareWith(function (kvp1, kvp2) {
            var c = _this.comparer.Compare(kvp1[0], kvp2[0]);
            return c !== 0 ? c : compare(kvp1[1], kvp2[1]);
        }, this, m2);
    };
    FMap.prototype[Symbol.iterator] = function () {
        var i = tree_mkIterator(this.tree);
        return {
            next: function () { return tree_moveNext(i); }
        };
    };
    FMap.prototype.entries = function () {
        return this[Symbol.iterator]();
    };
    FMap.prototype.keys = function () {
        return map(function (kv) { return kv[0]; }, this);
    };
    FMap.prototype.values = function () {
        return map(function (kv) { return kv[1]; }, this);
    };
    FMap.prototype.get = function (k) {
        return tree_find(this.comparer, k, this.tree);
    };
    FMap.prototype.has = function (k) {
        return tree_mem(this.comparer, k, this.tree);
    };
    /** Not supported */
    FMap.prototype.set = function (k, v) {
        throw new Error("not supported");
    };
    /** Not supported */
    FMap.prototype.delete = function (k) {
        throw new Error("not supported");
    };
    /** Not supported */
    FMap.prototype.clear = function () {
        throw new Error("not supported");
    };
    Object.defineProperty(FMap.prototype, "size", {
        get: function () {
            return tree_size(this.tree);
        },
        enumerable: true,
        configurable: true
    });
    FMap.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpMap",
            interfaces: ["System.IEquatable", "System.IComparable"]
        };
    };
    return FMap;
}());
function from(comparer, tree) {
    var map$$1 = new FMap();
    map$$1.tree = tree;
    map$$1.comparer = comparer || new GenericComparer();
    return map$$1;
}
function create(ie, comparer) {
    comparer = comparer || new GenericComparer();
    return from(comparer, ie ? tree_ofSeq(comparer, ie) : tree_empty());
}
function add(k, v, map$$1) {
    return from(map$$1.comparer, tree_add(map$$1.comparer, k, v, map$$1.tree));
}





function tryFind$1(k, map$$1) {
    return tree_tryFind(map$$1.comparer, k, map$$1.tree);
}

function interpret(state, instr) {
    var matchValue = tryFind$1(readPC(state), instr);

    if (matchValue == null) {
        return state;
    } else {
        return interpret(matchValue(incPC(state)), instr);
    }
}

function create$1(pattern, options) {
    var flags = "g";
    flags += options & 1 ? "i" : "";
    flags += options & 2 ? "m" : "";
    return new RegExp(pattern, flags);
}
// From http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escape(str) {
    return str.replace(/[\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function match(str, pattern, options) {
    if (options === void 0) { options = 0; }
    var reg = str instanceof RegExp
        ? (reg = str, str = pattern, reg.lastIndex = options, reg)
        : reg = create$1(pattern, options);
    return reg.exec(str);
}
function matches(str, pattern, options) {
    if (options === void 0) { options = 0; }
    var reg = str instanceof RegExp
        ? (reg = str, str = pattern, reg.lastIndex = options, reg)
        : reg = create$1(pattern, options);
    if (!reg.global)
        throw new Error("Non-global RegExp"); // Prevent infinite loop
    var m;
    var matches = [];
    while ((m = reg.exec(str)) !== null)
        matches.push(m);
    return matches;
}

function replace$1(reg, input, replacement, limit, offset) {
    if (offset === void 0) { offset = 0; }
    function replacer() {
        var res = arguments[0];
        if (limit !== 0) {
            limit--;
            var match_1 = [];
            var len = arguments.length;
            for (var i = 0; i < len - 2; i++)
                match_1.push(arguments[i]);
            match_1.index = arguments[len - 2];
            match_1.input = arguments[len - 1];
            res = replacement(match_1);
        }
        return res;
    }
    if (typeof reg == "string") {
        var tmp = reg;
        reg = create$1(input, limit);
        input = tmp;
        limit = undefined;
    }
    if (typeof replacement == "function") {
        limit = limit == null ? -1 : limit;
        return input.substring(0, offset) + input.substring(offset).replace(reg, replacer);
    }
    else {
        if (limit != null) {
            var m = void 0;
            var sub1 = input.substring(offset);
            var _matches = matches(reg, sub1);
            var sub2 = matches.length > limit ? (m = _matches[limit - 1], sub1.substring(0, m.index + m[0].length)) : sub1;
            return input.substring(0, offset) + sub2.replace(reg, replacement) + input.substring(offset + sub2.length);
        }
        else {
            return input.replace(reg, replacement);
        }
    }
}

// Source: https://github.com/dcodeIO/long.js/blob/master/LICENSE
// The internal representation of a long is the two given signed, 32-bit values.
// We use 32-bit pieces because these are the size of integers on which
// Javascript performs bit-operations.  For operations like addition and
// multiplication, we split each number into 16 bit pieces, which can easily be
// multiplied within Javascript's floating-point representation without overflow
// or change in sign.
//
// In the algorithms below, we frequently reduce the negative case to the
// positive case by negating the input(s) and then post-processing the result.
// Note that we must ALWAYS check specially whether those values are MIN_VALUE
// (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
// a positive number, it overflows back into a negative).  Not handling this
// case would often result in infinite recursion.
//
// Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
// methods on which they depend.
/**
 * @class A Long class for representing a 64 bit two's-complement integer value.
 */
var Long = (function () {
    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
     *  See the from* functions below for more convenient ways of constructing Longs.
     * @param {number} low The low (signed) 32 bits of the long
     * @param {number} high The high (signed) 32 bits of the long
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     */
    function Long(low, high, unsigned) {
        /**
         * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
         * @param {!Long|number|string} other Other value
         * @returns {boolean}
         */
        this.eq = this.equals;
        /**
         * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
         * @param {!Long|number|string} other Other value
         * @returns {boolean}
         */
        this.neq = this.notEquals;
        /**
         * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
         * @param {!Long|number|string} other Other value
         * @returns {boolean}
         */
        this.lt = this.lessThan;
        /**
         * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
         * @param {!Long|number|string} other Other value
         * @returns {boolean}
         */
        this.lte = this.lessThanOrEqual;
        /**
         * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
         * @param {!Long|number|string} other Other value
         * @returns {boolean}
         */
        this.gt = this.greaterThan;
        /**
         * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
         * @param {!Long|number|string} other Other value
         * @returns {boolean}
         */
        this.gte = this.greaterThanOrEqual;
        /**
         * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
         * @param {!Long|number|string} other Other value
         * @returns {number} 0 if they are the same, 1 if the this is greater and -1
         *  if the given one is greater
         */
        this.comp = this.compare;
        /**
         * Negates this Long's value. This is an alias of {@link Long#negate}.
         * @returns {!Long} Negated Long
         */
        this.neg = this.negate;
        /**
         * Returns this Long's absolute value. This is an alias of {@link Long#absolute}.
         * @returns {!Long} Absolute Long
         */
        this.abs = this.absolute;
        /**
         * Returns the difference of this and the specified  This is an alias of {@link Long#subtract}.
         * @param {!Long|number|string} subtrahend Subtrahend
         * @returns {!Long} Difference
         */
        this.sub = this.subtract;
        /**
         * Returns the product of this and the specified  This is an alias of {@link Long#multiply}.
         * @param {!Long|number|string} multiplier Multiplier
         * @returns {!Long} Product
         */
        this.mul = this.multiply;
        /**
         * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
         * @param {!Long|number|string} divisor Divisor
         * @returns {!Long} Quotient
         */
        this.div = this.divide;
        /**
         * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
         * @param {!Long|number|string} divisor Divisor
         * @returns {!Long} Remainder
         */
        this.mod = this.modulo;
        /**
         * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
         * @param {number|!Long} numBits Number of bits
         * @returns {!Long} Shifted Long
         */
        this.shl = this.shiftLeft;
        /**
         * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
         * @param {number|!Long} numBits Number of bits
         * @returns {!Long} Shifted Long
         */
        this.shr = this.shiftRight;
        /**
         * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
         * @param {number|!Long} numBits Number of bits
         * @returns {!Long} Shifted Long
         */
        this.shru = this.shiftRightUnsigned;
        // Aliases for compatibility with Fable
        this.Equals = this.equals;
        this.CompareTo = this.compare;
        this.low = low | 0;
        this.high = high | 0;
        this.unsigned = !!unsigned;
    }
    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     */
    Long.prototype.toInt = function () {
        return this.unsigned ? this.low >>> 0 : this.low;
    };
    /**
     * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
     * @returns {number}
     */
    Long.prototype.toNumber = function () {
        if (this.unsigned)
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };
    /**
     * Converts the Long to a string written in the specified radix.
     * @param {number=} radix Radix (2-36), defaults to 10
     * @returns {string}
     * @override
     * @throws {RangeError} If `radix` is out of range
     */
    Long.prototype.toString = function (radix) {
        if (radix === void 0) { radix = 10; }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) {
            if (this.eq(MIN_VALUE)) {
                // We need to change the Long value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            }
            else
                return '-' + this.neg().toString(radix);
        }
        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
        var result = '';
        while (true) {
            var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero())
                return digits + result;
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    };
    /**
     * Gets the high 32 bits as a signed integer.
     * @returns {number} Signed high bits
     */
    Long.prototype.getHighBits = function () {
        return this.high;
    };
    /**
     * Gets the high 32 bits as an unsigned integer.
     * @returns {number} Unsigned high bits
     */
    Long.prototype.getHighBitsUnsigned = function () {
        return this.high >>> 0;
    };
    /**
     * Gets the low 32 bits as a signed integer.
     * @returns {number} Signed low bits
     */
    Long.prototype.getLowBits = function () {
        return this.low;
    };
    /**
     * Gets the low 32 bits as an unsigned integer.
     * @returns {number} Unsigned low bits
     */
    Long.prototype.getLowBitsUnsigned = function () {
        return this.low >>> 0;
    };
    /**
     * Gets the number of bits needed to represent the absolute value of this
     * @returns {number}
     */
    Long.prototype.getNumBitsAbs = function () {
        if (this.isNegative())
            return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    };
    /**
     * Tests if this Long's value equals zero.
     * @returns {boolean}
     */
    Long.prototype.isZero = function () {
        return this.high === 0 && this.low === 0;
    };
    /**
     * Tests if this Long's value is negative.
     * @returns {boolean}
     */
    Long.prototype.isNegative = function () {
        return !this.unsigned && this.high < 0;
    };
    /**
     * Tests if this Long's value is positive.
     * @returns {boolean}
     */
    Long.prototype.isPositive = function () {
        return this.unsigned || this.high >= 0;
    };
    /**
     * Tests if this Long's value is odd.
     * @returns {boolean}
     */
    Long.prototype.isOdd = function () {
        return (this.low & 1) === 1;
    };
    /**
     * Tests if this Long's value is even.
     * @returns {boolean}
     */
    Long.prototype.isEven = function () {
        return (this.low & 1) === 0;
    };
    /**
     * Tests if this Long's value equals the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    Long.prototype.equals = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };
    /**
     * Tests if this Long's value differs from the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    Long.prototype.notEquals = function (other) {
        return !this.eq(/* validates */ other);
    };
    /**
     * Tests if this Long's value is less than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    Long.prototype.lessThan = function (other) {
        return this.comp(/* validates */ other) < 0;
    };
    /**
     * Tests if this Long's value is less than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    Long.prototype.lessThanOrEqual = function (other) {
        return this.comp(/* validates */ other) <= 0;
    };
    /**
     * Tests if this Long's value is greater than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    Long.prototype.greaterThan = function (other) {
        return this.comp(/* validates */ other) > 0;
    };
    /**
     * Tests if this Long's value is greater than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    Long.prototype.greaterThanOrEqual = function (other) {
        return this.comp(/* validates */ other) >= 0;
    };
    /**
     * Compares this Long's value with the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    Long.prototype.compare = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.eq(other))
            return 0;
        var thisNeg = this.isNegative(), otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        // At this point the sign bits are the same
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        // Both are positive if at least one is unsigned
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    };
    /**
     * Negates this Long's value.
     * @returns {!Long} Negated Long
     */
    Long.prototype.negate = function () {
        if (!this.unsigned && this.eq(MIN_VALUE))
            return MIN_VALUE;
        return this.not().add(ONE);
    };
    /**
     * Returns this Long's absolute value.
     * @returns {!Long} Absolute Long
     */
    Long.prototype.absolute = function () {
        if (!this.unsigned && this.isNegative())
            return this.negate();
        else
            return this;
    };
    /**
     * Returns the sum of this and the specified
     * @param {!Long|number|string} addend Addend
     * @returns {!Long} Sum
     */
    Long.prototype.add = function (addend) {
        if (!isLong(addend))
            addend = fromValue(addend);
        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;
        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xFFFF;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xFFFF;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    /**
     * Returns the difference of this and the specified
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    Long.prototype.subtract = function (subtrahend) {
        if (!isLong(subtrahend))
            subtrahend = fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };
    /**
     * Returns the product of this and the specified
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    Long.prototype.multiply = function (multiplier) {
        if (this.isZero())
            return ZERO;
        if (!isLong(multiplier))
            multiplier = fromValue(multiplier);
        if (multiplier.isZero())
            return ZERO;
        if (this.eq(MIN_VALUE))
            return multiplier.isOdd() ? MIN_VALUE : ZERO;
        if (multiplier.eq(MIN_VALUE))
            return this.isOdd() ? MIN_VALUE : ZERO;
        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.neg().mul(multiplier.neg());
            else
                return this.neg().mul(multiplier).neg();
        }
        else if (multiplier.isNegative())
            return this.mul(multiplier.neg()).neg();
        // If both longs are small, use float multiplication
        if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
            return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;
        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xFFFF;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xFFFF;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    /**
     * Returns this Long divided by the specified. The result is signed if this Long is signed or
     *  unsigned if this Long is unsigned.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    Long.prototype.divide = function (divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        if (divisor.isZero())
            throw Error('division by zero');
        if (this.isZero())
            return this.unsigned ? UZERO : ZERO;
        var approx = 0, rem = ZERO, res = ZERO;
        if (!this.unsigned) {
            // This section is only relevant for signed longs and is derived from the
            // closure library as a whole.
            if (this.eq(MIN_VALUE)) {
                if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                    return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
                else if (divisor.eq(MIN_VALUE))
                    return ONE;
                else {
                    // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                    var halfThis = this.shr(1);
                    var approx_1 = halfThis.div(divisor).shl(1);
                    if (approx_1.eq(ZERO)) {
                        return divisor.isNegative() ? ONE : NEG_ONE;
                    }
                    else {
                        rem = this.sub(divisor.mul(approx_1));
                        res = approx_1.add(rem.div(divisor));
                        return res;
                    }
                }
            }
            else if (divisor.eq(MIN_VALUE))
                return this.unsigned ? UZERO : ZERO;
            if (this.isNegative()) {
                if (divisor.isNegative())
                    return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
            }
            else if (divisor.isNegative())
                return this.div(divisor.neg()).neg();
            res = ZERO;
        }
        else {
            // The algorithm below has not been made for unsigned longs. It's therefore
            // required to take special care of the MSB prior to running it.
            if (!divisor.unsigned)
                divisor = divisor.toUnsigned();
            if (divisor.gt(this))
                return UZERO;
            if (divisor.gt(this.shru(1)))
                return UONE;
            res = UZERO;
        }
        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        rem = this;
        while (rem.gte(divisor)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48), 
            // Decrease the approximation until it is smaller than the remainder.  Note
            // that if it is too large, the product overflows and is negative.
            approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }
            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero())
                approxRes = ONE;
            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };
    /**
     * Returns this Long modulo the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    Long.prototype.modulo = function (divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        return this.sub(this.div(divisor).mul(divisor));
    };
    
    /**
     * Returns the bitwise NOT of this
     * @returns {!Long}
     */
    Long.prototype.not = function () {
        return fromBits(~this.low, ~this.high, this.unsigned);
    };
    
    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    Long.prototype.and = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };
    /**
     * Returns the bitwise OR of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    Long.prototype.or = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };
    /**
     * Returns the bitwise XOR of this Long and the given one.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    Long.prototype.xor = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    Long.prototype.shiftLeft = function (numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits = numBits & 63;
        if (numBits === 0)
            return this;
        else if (numBits < 32)
            return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return fromBits(0, this.low << (numBits - 32), this.unsigned);
    };
    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    Long.prototype.shiftRight = function (numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits = numBits & 63;
        if (numBits === 0)
            return this;
        else if (numBits < 32)
            return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };
    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    Long.prototype.shiftRightUnsigned = function (numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits = numBits & 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            }
            else if (numBits === 32)
                return fromBits(high, 0, this.unsigned);
            else
                return fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    };
    /**
     * Converts this Long to signed.
     * @returns {!Long} Signed long
     */
    Long.prototype.toSigned = function () {
        if (!this.unsigned)
            return this;
        return fromBits(this.low, this.high, false);
    };
    /**
     * Converts this Long to unsigned.
     * @returns {!Long} Unsigned long
     */
    Long.prototype.toUnsigned = function () {
        if (this.unsigned)
            return this;
        return fromBits(this.low, this.high, true);
    };
    /**
     * Converts this Long to its byte representation.
     * @param {boolean=} le Whether little or big endian, defaults to big endian
     * @returns {!Array.<number>} Byte representation
     */
    Long.prototype.toBytes = function (le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    };
    /**
     * Converts this Long to its little endian byte representation.
     * @returns {!Array.<number>} Little endian byte representation
     */
    Long.prototype.toBytesLE = function () {
        var hi = this.high, lo = this.low;
        return [
            lo & 0xff,
            (lo >>> 8) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>> 24) & 0xff,
            hi & 0xff,
            (hi >>> 8) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>> 24) & 0xff
        ];
    };
    /**
     * Converts this Long to its big endian byte representation.
     * @returns {!Array.<number>} Big endian byte representation
     */
    Long.prototype.toBytesBE = function () {
        var hi = this.high, lo = this.low;
        return [
            (hi >>> 24) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>> 8) & 0xff,
            hi & 0xff,
            (lo >>> 24) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>> 8) & 0xff,
            lo & 0xff
        ];
    };
    return Long;
}());
// A cache of the Long representations of small integer values.
var INT_CACHE = {};
// A cache of the Long representations of small unsigned integer values.
var UINT_CACHE = {};
/**
 * Tests if the specified object is a
 * @param {*} obj Object
 * @returns {boolean}
 */
function isLong(obj) {
    return (obj && obj instanceof Long);
}
/**
 * Returns a Long representing the given 32 bit integer value.
 * @param {number} value The 32 bit integer in question
 * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
 * @returns {!Long} The corresponding Long value
 */
function fromInt(value, unsigned) {
    if (unsigned === void 0) { unsigned = false; }
    var obj, cachedObj, cache;
    if (unsigned) {
        value >>>= 0;
        if (cache = (0 <= value && value < 256)) {
            cachedObj = UINT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
        if (cache)
            UINT_CACHE[value] = obj;
        return obj;
    }
    else {
        value |= 0;
        if (cache = (-128 <= value && value < 128)) {
            cachedObj = INT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, value < 0 ? -1 : 0, false);
        if (cache)
            INT_CACHE[value] = obj;
        return obj;
    }
}
/**
 * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
 * @param {number} value The number in question
 * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
 * @returns {!Long} The corresponding Long value
 */
function fromNumber(value, unsigned) {
    if (unsigned === void 0) { unsigned = false; }
    if (isNaN(value) || !isFinite(value))
        return unsigned ? UZERO : ZERO;
    if (unsigned) {
        if (value < 0)
            return UZERO;
        if (value >= TWO_PWR_64_DBL)
            return MAX_UNSIGNED_VALUE;
    }
    else {
        if (value <= -TWO_PWR_63_DBL)
            return MIN_VALUE;
        if (value + 1 >= TWO_PWR_63_DBL)
            return MAX_VALUE;
    }
    if (value < 0)
        return fromNumber(-value, unsigned).neg();
    return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
}
/**
 * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
 *  assumed to use 32 bits.
 * @param {number} lowBits The low 32 bits
 * @param {number} highBits The high 32 bits
 * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
 * @returns {!Long} The corresponding Long value
 */
function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
}
/**
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 */
var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
/**
 * Returns a Long representation of the given string, written using the specified radix.
 * @param {string} str The textual representation of the Long
 * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
 * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
 * @returns {!Long} The corresponding Long value
 */
// Used 4 times (4*8 to 15+4)
function fromString(str, unsigned, radix) {
    if (unsigned === void 0) { unsigned = false; }
    if (radix === void 0) { radix = 10; }
    if (str.length === 0)
        throw Error('empty string');
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
        return ZERO;
    if (typeof unsigned === 'number') {
        // For goog.math.long compatibility
        radix = unsigned,
            unsigned = false;
    }
    else {
        unsigned = !!unsigned;
    }
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
        throw RangeError('radix');
    var p = str.indexOf('-');
    if (p > 0)
        throw Error('interior hyphen');
    else if (p === 0) {
        return fromString(str.substring(1), unsigned, radix).neg();
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
    for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
            var power = fromNumber(pow_dbl(radix, size));
            result = result.mul(power).add(fromNumber(value));
        }
        else {
            result = result.mul(radixToPower);
            result = result.add(fromNumber(value));
        }
    }
    result.unsigned = unsigned;
    return result;
}
/**
 * Converts the specified value to a
 * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
 * @returns {!Long}
 */
function fromValue(val) {
    if (val /* is compatible */ instanceof Long)
        return val;
    if (typeof val === 'number')
        return fromNumber(val);
    if (typeof val === 'string')
        return fromString(val);
    // Throws for non-objects, converts non-instanceof Long:
    return fromBits(val.low, val.high, val.unsigned);
}
// NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
// no runtime penalty for these.
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
/**
 * Signed zero.
 * @type {!Long}
 */
var ZERO = fromInt(0);
/**
 * Unsigned zero.
 * @type {!Long}
 */
var UZERO = fromInt(0, true);
/**
 * Signed one.
 * @type {!Long}
 */
var ONE = fromInt(1);
/**
 * Unsigned one.
 * @type {!Long}
 */
var UONE = fromInt(1, true);
/**
 * Signed negative one.
 * @type {!Long}
 */
var NEG_ONE = fromInt(-1);
/**
 * Maximum signed value.
 * @type {!Long}
 */
var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
/**
 * Maximum unsigned value.
 * @type {!Long}
 */
var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
/**
 * Minimum signed value.
 * @type {!Long}
 */
var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);

function fromTicks(ticks) {
    return ticks.div(10000).toNumber();
}

function create$2(year, month, day, h, m, s, ms, kind) {
    if (h === void 0) { h = 0; }
    if (m === void 0) { m = 0; }
    if (s === void 0) { s = 0; }
    if (ms === void 0) { ms = 0; }
    if (kind === void 0) { kind = 2 /* Local */; }
    var date;
    if (kind === 2 /* Local */) {
        date = new Date(year, month - 1, day, h, m, s, ms);
        date.kind = kind;
    }
    else {
        date = new Date(Date.UTC(year, month - 1, day, h, m, s, ms));
    }
    if (isNaN(date.getTime())) {
        throw new Error("The parameters describe an unrepresentable Date.");
    }
    return date;
}



function isLeapYear(year) {
    return year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
}
function daysInMonth(year, month) {
    return month == 2
        ? isLeapYear(year) ? 29 : 28
        : month >= 8 ? month % 2 == 0 ? 31 : 30 : month % 2 == 0 ? 30 : 31;
}





function day(d) {
    return d.kind === 2 /* Local */ ? d.getDate() : d.getUTCDate();
}
function hour(d) {
    return d.kind === 2 /* Local */ ? d.getHours() : d.getUTCHours();
}
function millisecond(d) {
    return d.kind === 2 /* Local */ ? d.getMilliseconds() : d.getUTCMilliseconds();
}
function minute(d) {
    return d.kind === 2 /* Local */ ? d.getMinutes() : d.getUTCMinutes();
}
function month(d) {
    return (d.kind === 2 /* Local */ ? d.getMonth() : d.getUTCMonth()) + 1;
}
function second(d) {
    return d.kind === 2 /* Local */ ? d.getSeconds() : d.getUTCSeconds();
}
function year(d) {
    return d.kind === 2 /* Local */ ? d.getFullYear() : d.getUTCFullYear();
}

var fsFormatRegExp = /(^|[^%])%([0+ ]*)(-?\d+)?(?:\.(\d+))?(\w)/;
var formatRegExp = /\{(\d+)(,-?\d+)?(?:\:(.+?))?\}/g;
var StringComparison = {
    CurrentCulture: 0,
    CurrentCultureIgnoreCase: 1,
    InvariantCulture: 2,
    InvariantCultureIgnoreCase: 3,
    Ordinal: 4,
    OrdinalIgnoreCase: 5,
};



function toHex(value) {
    return value < 0
        ? "ff" + (16777215 - (Math.abs(value) - 1)).toString(16)
        : value.toString(16);
}
function fsFormat(str) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var _cont;
    function isObject(x) {
        return x !== null && typeof x === "object" && !(x instanceof Number) && !(x instanceof String) && !(x instanceof Boolean);
    }
    function formatOnce(str, rep) {
        return str.replace(fsFormatRegExp, function (_, prefix, flags, pad, precision, format) {
            switch (format) {
                case "f":
                case "F":
                    rep = rep.toFixed(precision || 6);
                    break;
                case "g":
                case "G":
                    rep = rep.toPrecision(precision);
                    break;
                case "e":
                case "E":
                    rep = rep.toExponential(precision);
                    break;
                case "O":
                    rep = toString(rep);
                    break;
                case "A":
                    try {
                        rep = JSON.stringify(rep, function (k, v) {
                            return v && v[Symbol.iterator] && !Array.isArray(v) && isObject(v) ? Array.from(v)
                                : v && typeof v.ToString === "function" ? toString(v) : v;
                        });
                    }
                    catch (err) {
                        // Fallback for objects with circular references
                        rep = "{" + Object.getOwnPropertyNames(rep).map(function (k) { return k + ": " + String(rep[k]); }).join(", ") + "}";
                    }
                    break;
                case "x":
                    rep = toHex(Number(rep));
                    break;
                case "X":
                    rep = toHex(Number(rep)).toUpperCase();
                    break;
            }
            var plusPrefix = flags.indexOf("+") >= 0 && parseInt(rep) >= 0;
            if (!isNaN(pad = parseInt(pad))) {
                var ch = pad >= 0 && flags.indexOf("0") >= 0 ? "0" : " ";
                rep = padLeft(rep, Math.abs(pad) - (plusPrefix ? 1 : 0), ch, pad < 0);
            }
            var once = prefix + (plusPrefix ? "+" + rep : rep);
            return once.replace(/%/g, "%%");
        });
    }
    function makeFn(str) {
        return function (rep) {
            var str2 = formatOnce(str, rep);
            return fsFormatRegExp.test(str2)
                ? makeFn(str2) : _cont(str2.replace(/%%/g, "%"));
        };
    }
    if (args.length === 0) {
        return function (cont) {
            _cont = cont;
            return fsFormatRegExp.test(str) ? makeFn(str) : _cont(str);
        };
    }
    else {
        for (var i = 0; i < args.length; i++) {
            str = formatOnce(str, args[i]);
        }
        return str.replace(/%%/g, "%");
    }
}








function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    str = String(str);
    len = len - str.length;
    for (var i = -1; ++i < len;)
        str = isRight ? str + ch : ch + str;
    return str;
}




function split$$1(str, splitters, count, removeEmpty) {
    count = typeof count == "number" ? count : null;
    removeEmpty = typeof removeEmpty == "number" ? removeEmpty : null;
    if (count < 0)
        throw new Error("Count cannot be less than zero");
    if (count === 0)
        return [];
    splitters = Array.isArray(splitters) ? splitters : getRestParams(arguments, 1);
    splitters = splitters.map(function (x) { return escape(x); });
    splitters = splitters.length > 0 ? splitters : [" "];
    var m;
    var i = 0;
    var splits = [];
    var reg = new RegExp(splitters.join("|"), "g");
    while ((count == null || count > 1) && (m = reg.exec(str)) !== null) {
        if (!removeEmpty || (m.index - i) > 0) {
            count = count != null ? count - 1 : count;
            splits.push(str.substring(i, m.index));
        }
        i = reg.lastIndex;
    }
    if (!removeEmpty || (str.length - i) > 0)
        splits.push(str.substring(i));
    return splits;
}

// TODO: should be xs: Iterable<List<T>>

function filter$2(f, xs) {
    return reverse$1(fold(function (acc, x) { return f(x) ? new List(x, acc) : acc; }, new List(), xs));
}


function map$2(f, xs) {
    return reverse$1(fold(function (acc, x) { return new List(f(x), acc); }, new List(), xs));
}



function reverse$1(xs) {
    return fold(function (acc, x) { return new List(x, acc); }, new List(), xs);
}


/* ToDo: instance unzip() */

/* ToDo: instance unzip3() */

function movI(c, r, i, state) {
    if (c(state)) {
        return writeReg(state, r, i);
    } else {
        return state;
    }
}
function movR(c, r1, r2, state) {
    if (c(state)) {
        return writeReg(state, r1, readReg(state, r2));
    } else {
        return state;
    }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function parser(tokLst) {
    var parseRec = function parseRec(ml) {
        return function (_arg1) {
            var _target3 = function _target3() {
                return fsFormat("unhandled parse error!")(function (x) {
                    throw new Error(x);
                });
            };

            if (_arg1.tail == null) {
                return new List();
            } else if (_arg1.head.Case === "T_MOV") {
                if (_arg1.tail.tail != null) {
                    if (_arg1.tail.head.Case === "T_REG") {
                        if (_arg1.tail.tail.tail != null) {
                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                if (_arg1.tail.tail.tail.tail != null) {
                                    if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                        var _ret = function () {
                                            var c = _arg1.head.Fields[0];
                                            var i = _arg1.tail.tail.tail.head.Fields[0];
                                            var r = _arg1.tail.head.Fields[0];
                                            var t = _arg1.tail.tail.tail.tail;
                                            return {
                                                v: new List([ml, function (state) {
                                                    return movI(c, r, i, state);
                                                }], parseRec(ml + 4)(t))
                                            };
                                        }();

                                        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
                                    } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                        var _ret2 = function () {
                                            var c = _arg1.head.Fields[0];
                                            var r1 = _arg1.tail.head.Fields[0];
                                            var r2 = _arg1.tail.tail.tail.head.Fields[0];
                                            var t = _arg1.tail.tail.tail.tail;
                                            return {
                                                v: new List([ml, function (state) {
                                                    return movR(c, r1, r2, state);
                                                }], parseRec(ml + 4)(t))
                                            };
                                        }();

                                        if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
                                    } else {
                                        return _target3();
                                    }
                                } else {
                                    return _target3();
                                }
                            } else {
                                return _target3();
                            }
                        } else {
                            return _target3();
                        }
                    } else {
                        return _target3();
                    }
                } else {
                    return _target3();
                }
            } else {
                return _target3();
            }
        };
    };

    return create(parseRec(0)(tokLst), new GenericComparer(function (x, y) {
        return x < y ? -1 : x > y ? 1 : 0;
    }));
}

function checkAL(state) {
    return true;
}
function checkEQ(state) {
    return readZFlag(state);
}
function checkNE(state) {
    return !readZFlag(state);
}
function checkCS(state) {
    return readCFlag(state);
}
function checkCC(state) {
    return !readCFlag(state);
}
function checkMI(state) {
    return readNFlag(state);
}
function checkPL(state) {
    return !readNFlag(state);
}
function checkVS(state) {
    return readVFlag(state);
}
function checkVC(state) {
    return !readVFlag(state);
}
function checkHI(state) {
    if (readCFlag(state)) {
        return !readZFlag(state);
    } else {
        return false;
    }
}

function checkGE(state) {
    return readNFlag(state) === readVFlag(state);
}
function checkLT(state) {
    return readNFlag(state) !== readVFlag(state);
}
function checkGT(state) {
    if (!readZFlag(state)) {
        return readNFlag(state) === readVFlag(state);
    } else {
        return false;
    }
}
function checkLE(state) {
    if (readZFlag(state)) {
        return readNFlag(state) !== readVFlag(state);
    } else {
        return false;
    }
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cond = "(|EQ|NE|CS|HS|CC|LO|MI|PL|VS|VC|HI|LS|GE|LT|GT|LE|AL)$";
function matchCond(_arg1) {
    var $var1 = null;

    switch (_arg1) {
        case "EQ":
            {
                $var1 = function $var1(state) {
                    return checkEQ(state);
                };

                break;
            }

        case "NE":
            {
                $var1 = function $var1(state) {
                    return checkNE(state);
                };

                break;
            }

        case "CS":
            {
                $var1 = function $var1(state) {
                    return checkCS(state);
                };

                break;
            }

        case "HS":
            {
                $var1 = function $var1(state) {
                    return checkCS(state);
                };

                break;
            }

        case "CC":
            {
                $var1 = function $var1(state) {
                    return checkCC(state);
                };

                break;
            }

        case "LO":
            {
                $var1 = function $var1(state) {
                    return checkCC(state);
                };

                break;
            }

        case "MI":
            {
                $var1 = function $var1(state) {
                    return checkMI(state);
                };

                break;
            }

        case "PL":
            {
                $var1 = function $var1(state) {
                    return checkPL(state);
                };

                break;
            }

        case "VS":
            {
                $var1 = function $var1(state) {
                    return checkVS(state);
                };

                break;
            }

        case "VC":
            {
                $var1 = function $var1(state) {
                    return checkVC(state);
                };

                break;
            }

        case "HI":
            {
                $var1 = function $var1(state) {
                    return checkHI(state);
                };

                break;
            }

        case "GE":
            {
                $var1 = function $var1(state) {
                    return checkGE(state);
                };

                break;
            }

        case "LT":
            {
                $var1 = function $var1(state) {
                    return checkLT(state);
                };

                break;
            }

        case "GT":
            {
                $var1 = function $var1(state) {
                    return checkGT(state);
                };

                break;
            }

        case "LE":
            {
                $var1 = function $var1(state) {
                    return checkLE(state);
                };

                break;
            }

        case "AL":
            {
                $var1 = function $var1(state) {
                    return checkAL(state);
                };

                break;
            }

        case "":
            {
                $var1 = function $var1(state) {
                    return checkAL(state);
                };

                break;
            }

        default:
            {
                $var1 = function $var1(state) {
                    return checkAL(state);
                };
            }
    }

    return $var1;
}
var Token = function () {
    function Token(caseName, fields) {
        _classCallCheck$1(this, Token);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$1(Token, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Parse.Tokeniser.Token",
                interfaces: ["FSharpUnion"],
                cases: {
                    T_ADC: ["function"],
                    T_ADD: ["function"],
                    T_ADR: ["function"],
                    T_AND: ["function"],
                    T_B: ["function"],
                    T_BIC: ["function"],
                    T_BL: ["function"],
                    T_BX: ["function"],
                    T_CMN: ["function"],
                    T_CMP: ["function"],
                    T_COMMA: [],
                    T_EOR: ["function"],
                    T_ERROR: [],
                    T_INT: ["number"],
                    T_LABEL: ["string"],
                    T_LDM: ["function"],
                    T_LDR: ["function"],
                    T_MLA: ["function"],
                    T_MOV: ["function"],
                    T_MRS: ["function"],
                    T_MSR: ["function"],
                    T_MUL: ["function"],
                    T_MVN: ["function"],
                    T_NOP: ["function"],
                    T_ORR: ["function"],
                    T_REG: ["number"],
                    T_RSB: ["function"],
                    T_RSC: ["function"],
                    T_SBC: ["function"],
                    T_SMLAL: ["function"],
                    T_SMULL: ["function"],
                    T_STM: ["function"],
                    T_STR: ["function"],
                    T_SUB: ["function"],
                    T_SWI: ["function"],
                    T_SWP: ["function"],
                    T_TEQ: ["function"],
                    T_TST: ["function"],
                    T_UMLAL: ["function"],
                    T_UMULL: ["function"]
                }
            };
        }
    }, {
        key: "Equals",
        value: function (yobj) {
            var state = initState;

            if (yobj instanceof Token) {
                var y = yobj;
                var matchValue = [this, y];

                var _target8 = function _target8() {
                    return false;
                };

                if (matchValue[0].Case === "T_REG") {
                    if (matchValue[1].Case === "T_REG") {
                        var ix = matchValue[0].Fields[0];
                        var iy = matchValue[1].Fields[0];
                        return ix === iy;
                    } else {
                        return _target8();
                    }
                } else if (matchValue[0].Case === "T_INT") {
                    if (matchValue[1].Case === "T_INT") {
                        var _ix = matchValue[0].Fields[0];
                        var _iy = matchValue[1].Fields[0];
                        return _ix === _iy;
                    } else {
                        return _target8();
                    }
                } else if (matchValue[0].Case === "T_COMMA") {
                    if (matchValue[1].Case === "T_COMMA") {
                        return true;
                    } else {
                        return _target8();
                    }
                } else if (matchValue[0].Case === "T_ERROR") {
                    if (matchValue[1].Case === "T_ERROR") {
                        return true;
                    } else {
                        return _target8();
                    }
                } else if (matchValue[0].Case === "T_MOV") {
                    if (matchValue[1].Case === "T_MOV") {
                        var cx = matchValue[0].Fields[0];
                        var cy = matchValue[1].Fields[0];
                        return cx(state) === cy(state);
                    } else {
                        return _target8();
                    }
                } else if (matchValue[0].Case === "T_MVN") {
                    if (matchValue[1].Case === "T_MVN") {
                        var _cx = matchValue[0].Fields[0];
                        var _cy = matchValue[1].Fields[0];
                        return _cx(state) === _cy(state);
                    } else {
                        return _target8();
                    }
                } else if (matchValue[0].Case === "T_MRS") {
                    if (matchValue[1].Case === "T_MRS") {
                        var _cx2 = matchValue[0].Fields[0];
                        var _cy2 = matchValue[1].Fields[0];
                        return _cx2(state) === _cy2(state);
                    } else {
                        return _target8();
                    }
                } else if (matchValue[0].Case === "T_MSR") {
                    if (matchValue[1].Case === "T_MSR") {
                        var _cx3 = matchValue[0].Fields[0];
                        var _cy3 = matchValue[1].Fields[0];
                        return _cx3(state) === _cy3(state);
                    } else {
                        return _target8();
                    }
                } else {
                    return _target8();
                }
            } else {
                return false;
            }
        }
    }]);

    return Token;
}();
setType("Parse.Tokeniser.Token", Token);

function _INSTR_MATCH___(pattern, str) {
    var m = match(str, pattern + cond);

    if (m != null) {
        return matchCond(m[1]);
    }
}

function _REG_MATCH___(str) {
    var m = match(str, "^R([0-9]|1[0-5])$");

    if (m != null) {
        return Number.parseInt(m[1]);
    }
}

function _COMMA_MATCH___(str) {
    var m = match(str, "^,$");

    if (m != null) {
        return {};
    }
}

function _LABEL_MATCH___(str) {
    var m = match(str, "^([a-zA-Z][a-zA-Z0-9]*):$");

    if (m != null) {
        return m[1];
    }
}

function _DEC_LIT_MATCH___(str) {
    var m = match(str, "^#?([0-9]+)$");

    if (m != null) {
        return Number.parseInt(m[1]);
    }
}

function _HEX_LIT_MATCH___(str) {
    var m = match(str, "^#?(0x[0-9a-fA-F]+)$");

    if (m != null) {
        return Number.parseInt(m[1], 16);
    }
}

function stringToToken(_arg1) {
    var activePatternResult172 = _REG_MATCH___(_arg1);

    if (activePatternResult172 != null) {
        var i = activePatternResult172;
        return new Token("T_REG", [i]);
    } else {
        var activePatternResult171 = _COMMA_MATCH___(_arg1);

        if (activePatternResult171 != null) {
            return new Token("T_COMMA", []);
        } else {
            var activePatternResult170 = _LABEL_MATCH___(_arg1);

            if (activePatternResult170 != null) {
                var s = activePatternResult170;
                return new Token("T_LABEL", [s]);
            } else {
                var activePatternResult169 = _DEC_LIT_MATCH___(_arg1);

                if (activePatternResult169 != null) {
                    var _i = activePatternResult169;
                    return new Token("T_INT", [_i]);
                } else {
                    var activePatternResult168 = _HEX_LIT_MATCH___(_arg1);

                    if (activePatternResult168 != null) {
                        var _i2 = activePatternResult168;
                        return new Token("T_INT", [_i2]);
                    } else {
                        var activePatternResult167 = _INSTR_MATCH___("^MOV", _arg1);

                        if (activePatternResult167 != null) {
                            var c = activePatternResult167;
                            return new Token("T_MOV", [c]);
                        } else {
                            var activePatternResult165 = _INSTR_MATCH___("^MVN", _arg1);

                            if (activePatternResult165 != null) {
                                var _c = activePatternResult165;
                                return new Token("T_MVN", [_c]);
                            } else {
                                var activePatternResult163 = _INSTR_MATCH___("^MRS", _arg1);

                                if (activePatternResult163 != null) {
                                    var _c2 = activePatternResult163;
                                    return new Token("T_MRS", [_c2]);
                                } else {
                                    var activePatternResult161 = _INSTR_MATCH___("^MSR", _arg1);

                                    if (activePatternResult161 != null) {
                                        var _c3 = activePatternResult161;
                                        return new Token("T_MSR", [_c3]);
                                    } else {
                                        var activePatternResult159 = _INSTR_MATCH___("^ADD", _arg1);

                                        if (activePatternResult159 != null) {
                                            var _c4 = activePatternResult159;
                                            return new Token("T_ADD", [_c4]);
                                        } else {
                                            var activePatternResult157 = _INSTR_MATCH___("^ADC", _arg1);

                                            if (activePatternResult157 != null) {
                                                var _c5 = activePatternResult157;
                                                return new Token("T_ADC", [_c5]);
                                            } else {
                                                var activePatternResult155 = _INSTR_MATCH___("^SUB", _arg1);

                                                if (activePatternResult155 != null) {
                                                    var _c6 = activePatternResult155;
                                                    return new Token("T_SUB", [_c6]);
                                                } else {
                                                    var activePatternResult153 = _INSTR_MATCH___("^SBC", _arg1);

                                                    if (activePatternResult153 != null) {
                                                        var _c7 = activePatternResult153;
                                                        return new Token("T_SBC", [_c7]);
                                                    } else {
                                                        var activePatternResult151 = _INSTR_MATCH___("^RSB", _arg1);

                                                        if (activePatternResult151 != null) {
                                                            var _c8 = activePatternResult151;
                                                            return new Token("T_RSB", [_c8]);
                                                        } else {
                                                            var activePatternResult149 = _INSTR_MATCH___("^RSC", _arg1);

                                                            if (activePatternResult149 != null) {
                                                                var _c9 = activePatternResult149;
                                                                return new Token("T_RSC", [_c9]);
                                                            } else {
                                                                return new Token("T_ERROR", []);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function tokenise(s) {
    var rgx = create$1(",");
    var sC = replace$1(rgx, s, " , ");
    return function (list) {
        return map$2(function (_arg1) {
            return stringToToken(_arg1);
        }, list);
    }(filter$2(function (s_1) {
        return s_1 !== "";
    }, toList(split$$1(sC, " ", "\t", "\n", "\r", "\f"))));
}

(function (args) {
    var state = initState;
    var inString = "MOV R5, #2";

    var newState = function (instr) {
        return interpret(state, instr);
    }(parser(tokenise(inString)));

    fsFormat("Start Main.fs")(function (x) {
        console.log(x);
    });
    fsFormat("%A")(function (x) {
        console.log(x);
    })(readReg(state, 5));
    fsFormat("%A")(function (x) {
        console.log(x);
    })(readReg(newState, 5));
    return 0;
})(process.argv.slice(2));

})));

//# sourceMappingURL=Main.js.map