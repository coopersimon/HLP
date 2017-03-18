(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var fableGlobal = function () {
    var globalObj = typeof window !== "undefined" ? window
        : (typeof global !== "undefined" ? global
            : (typeof self !== "undefined" ? self : {}));
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

function FableArray(t, isTypedArray) {
    if (isTypedArray === void 0) { isTypedArray = false; }
    var def = null, genArg = null;
    if (isTypedArray) {
        def = t;
    }
    else {
        genArg = t;
    }
    return new NonDeclaredType("Array", def, genArg);
}



function makeGeneric(typeDef, genArgs) {
    return new NonDeclaredType("GenericType", typeDef, genArgs);
}




function getPropertyNames(obj) {
    if (obj == null) {
        return [];
    }
    var propertyMap = typeof obj[_Symbol.reflection] === "function" ? obj[_Symbol.reflection]().properties || [] : obj;
    return Object.getOwnPropertyNames(propertyMap);
}

function getRestParams(args, idx) {
    for (var _len = args.length, restArgs = Array(_len > idx ? _len - idx : 0), _key = idx; _key < _len; _key++)
        restArgs[_key - idx] = args[_key];
    return restArgs;
}
function toString(o) {
    return o != null && typeof o.ToString == "function" ? o.ToString() : String(o);
}

function equals(x, y) {
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
    if (x === y)
        return 0;
    if (x == null)
        return y == null ? 0 : -1;
    else if (y == null)
        return 1;
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
    if (x === y) {
        return true;
    }
    else {
        var keys = getPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            if (!equals(x[keys[i]], y[keys[i]]))
                return false;
        }
        return true;
    }
}

function equalsUnions(x, y) {
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
    List.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpList",
            interfaces: ["System.IEquatable", "System.IComparable"]
        };
    };
    return List;
}());

var Enumerator = (function () {
    function Enumerator(iter) {
        this.iter = iter;
    }
    Enumerator.prototype.MoveNext = function () {
        var cur = this.iter.next();
        this.current = cur.value;
        return !cur.done;
    };
    Object.defineProperty(Enumerator.prototype, "Current", {
        get: function () {
            return this.current;
        },
        enumerable: true,
        configurable: true
    });
    Enumerator.prototype.Reset = function () {
        throw new Error("JS iterators cannot be reset");
    };
    Enumerator.prototype.Dispose = function () { };
    return Enumerator;
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










function rangeStep(first, step, last) {
    if (step === 0)
        throw new Error("Step cannot be 0");
    return delay(function () { return unfold(function (x) { return step > 0 && x <= last || step < 0 && x >= last ? [x, x + step] : null; }, first); });
}

function range(first, last) {
    return rangeStep(first, 1, last);
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
                    S: [FableArray(Int32Array, true), "boolean", "boolean", "boolean", "boolean"]
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
        return r === i ? v : x;
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4]]);
}
function readPC(_arg1) {
    return _arg1.Fields[0][15];
}

function incPC(_arg1) {
    var newRegs = Int32Array.from(mapIndexed(function (i, x) {
        return i === 15 ? 4 : x;
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
    if (m.Case === "MapOne") {
        return comparer.Compare(k, m.Fields[0]) === 0;
    }
    else if (m.Case === "MapNode") {
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
    }
    else {
        return false;
    }
}
function tree_mkFromEnumerator(comparer, acc, e) {
    var cur = e.next();
    while (!cur.done) {
        acc = tree_add(comparer, cur.value[0], cur.value[1], acc);
        cur = e.next();
    }
    return acc;
}
function tree_ofSeq(comparer, c) {
    var ie = c[Symbol.iterator]();
    return tree_mkFromEnumerator(comparer, tree_empty(), ie);
}
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
var FableMap = (function () {
    function FableMap() {
    }
    FableMap.prototype.ToString = function () {
        return "map [" + Array.from(this).map(toString).join("; ") + "]";
    };
    FableMap.prototype.Equals = function (m2) {
        return this.CompareTo(m2) === 0;
    };
    FableMap.prototype.CompareTo = function (m2) {
        var _this = this;
        return this === m2 ? 0 : compareWith(function (kvp1, kvp2) {
            var c = _this.comparer.Compare(kvp1[0], kvp2[0]);
            return c !== 0 ? c : compare(kvp1[1], kvp2[1]);
        }, this, m2);
    };
    FableMap.prototype[Symbol.iterator] = function () {
        var i = tree_mkIterator(this.tree);
        return {
            next: function () { return tree_moveNext(i); }
        };
    };
    FableMap.prototype.entries = function () {
        return this[Symbol.iterator]();
    };
    FableMap.prototype.keys = function () {
        return map(function (kv) { return kv[0]; }, this);
    };
    FableMap.prototype.values = function () {
        return map(function (kv) { return kv[1]; }, this);
    };
    FableMap.prototype.get = function (k) {
        return tree_find(this.comparer, k, this.tree);
    };
    FableMap.prototype.has = function (k) {
        return tree_mem(this.comparer, k, this.tree);
    };
    FableMap.prototype.set = function (k, v) {
        throw new Error("not supported");
    };
    FableMap.prototype.delete = function (k) {
        throw new Error("not supported");
    };
    FableMap.prototype.clear = function () {
        throw new Error("not supported");
    };
    Object.defineProperty(FableMap.prototype, "size", {
        get: function () {
            return tree_size(this.tree);
        },
        enumerable: true,
        configurable: true
    });
    FableMap.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpMap",
            interfaces: ["System.IEquatable", "System.IComparable", "System.Collections.Generic.IDictionary"]
        };
    };
    return FableMap;
}());
function from(comparer, tree) {
    var map$$1 = new FableMap();
    map$$1.tree = tree;
    map$$1.comparer = comparer || new GenericComparer();
    return map$$1;
}
function create(ie, comparer) {
    comparer = comparer || new GenericComparer();
    return from(comparer, ie ? tree_ofSeq(comparer, ie) : tree_empty());
}






function tryFind$1(k, map$$1) {
    return tree_tryFind(map$$1.comparer, k, map$$1.tree);
}

function interpret(state, instr) {
    interpret: while (true) {
        var matchValue = tryFind$1(readPC(state), instr);

        if (matchValue == null) {
            return state;
        } else {
            state = matchValue(incPC(state));
            instr = instr;
            continue interpret;
        }
    }
}

function filter$2(f, xs) {
    return reverse$1(fold(function (acc, x) { return f(x) ? new List(x, acc) : acc; }, new List(), xs));
}


function map$2(f, xs) {
    return reverse$1(fold(function (acc, x) { return new List(f(x), acc); }, new List(), xs));
}

function partition$2(f, xs) {
    return fold(function (acc, x) {
        var lacc = acc[0], racc = acc[1];
        return f(x) ? [new List(x, lacc), racc] : [lacc, new List(x, racc)];
    }, [new List(), new List()], reverse$1(xs));
}

function reverse$1(xs) {
    return fold(function (acc, x) { return new List(x, acc); }, new List(), xs);
}

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

function create$1(pattern, options) {
    var flags = "g";
    flags += options & 1 ? "i" : "";
    flags += options & 2 ? "m" : "";
    return new RegExp(pattern, flags);
}
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
        throw new Error("Non-global RegExp");
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

var Long = (function () {
    function Long(low, high, unsigned) {
        this.eq = this.equals;
        this.neq = this.notEquals;
        this.lt = this.lessThan;
        this.lte = this.lessThanOrEqual;
        this.gt = this.greaterThan;
        this.gte = this.greaterThanOrEqual;
        this.comp = this.compare;
        this.neg = this.negate;
        this.abs = this.absolute;
        this.sub = this.subtract;
        this.mul = this.multiply;
        this.div = this.divide;
        this.mod = this.modulo;
        this.shl = this.shiftLeft;
        this.shr = this.shiftRight;
        this.shru = this.shiftRightUnsigned;
        this.Equals = this.equals;
        this.CompareTo = this.compare;
        this.ToString = this.toString;
        this.low = low | 0;
        this.high = high | 0;
        this.unsigned = !!unsigned;
    }
    Long.prototype.toInt = function () {
        return this.unsigned ? this.low >>> 0 : this.low;
    };
    Long.prototype.toNumber = function () {
        if (this.unsigned)
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };
    Long.prototype.toString = function (radix) {
        if (radix === void 0) { radix = 10; }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) {
            if (this.eq(MIN_VALUE)) {
                var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            }
            else
                return '-' + this.neg().toString(radix);
        }
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
    Long.prototype.getHighBits = function () {
        return this.high;
    };
    Long.prototype.getHighBitsUnsigned = function () {
        return this.high >>> 0;
    };
    Long.prototype.getLowBits = function () {
        return this.low;
    };
    Long.prototype.getLowBitsUnsigned = function () {
        return this.low >>> 0;
    };
    Long.prototype.getNumBitsAbs = function () {
        if (this.isNegative())
            return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    };
    Long.prototype.isZero = function () {
        return this.high === 0 && this.low === 0;
    };
    Long.prototype.isNegative = function () {
        return !this.unsigned && this.high < 0;
    };
    Long.prototype.isPositive = function () {
        return this.unsigned || this.high >= 0;
    };
    Long.prototype.isOdd = function () {
        return (this.low & 1) === 1;
    };
    Long.prototype.isEven = function () {
        return (this.low & 1) === 0;
    };
    Long.prototype.equals = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };
    Long.prototype.notEquals = function (other) {
        return !this.eq(other);
    };
    Long.prototype.lessThan = function (other) {
        return this.comp(other) < 0;
    };
    Long.prototype.lessThanOrEqual = function (other) {
        return this.comp(other) <= 0;
    };
    Long.prototype.greaterThan = function (other) {
        return this.comp(other) > 0;
    };
    Long.prototype.greaterThanOrEqual = function (other) {
        return this.comp(other) >= 0;
    };
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
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    };
    Long.prototype.negate = function () {
        if (!this.unsigned && this.eq(MIN_VALUE))
            return MIN_VALUE;
        return this.not().add(ONE);
    };
    Long.prototype.absolute = function () {
        if (!this.unsigned && this.isNegative())
            return this.negate();
        else
            return this;
    };
    Long.prototype.add = function (addend) {
        if (!isLong(addend))
            addend = fromValue(addend);
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
    Long.prototype.subtract = function (subtrahend) {
        if (!isLong(subtrahend))
            subtrahend = fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };
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
        if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
            return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
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
    Long.prototype.divide = function (divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        if (divisor.isZero())
            throw Error('division by zero');
        if (this.isZero())
            return this.unsigned ? UZERO : ZERO;
        var approx = 0, rem = ZERO, res = ZERO;
        if (!this.unsigned) {
            if (this.eq(MIN_VALUE)) {
                if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                    return MIN_VALUE;
                else if (divisor.eq(MIN_VALUE))
                    return ONE;
                else {
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
            if (!divisor.unsigned)
                divisor = divisor.toUnsigned();
            if (divisor.gt(this))
                return UZERO;
            if (divisor.gt(this.shru(1)))
                return UONE;
            res = UZERO;
        }
        rem = this;
        while (rem.gte(divisor)) {
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
            var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }
            if (approxRes.isZero())
                approxRes = ONE;
            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };
    Long.prototype.modulo = function (divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        return this.sub(this.div(divisor).mul(divisor));
    };
    
    Long.prototype.not = function () {
        return fromBits(~this.low, ~this.high, this.unsigned);
    };
    
    Long.prototype.and = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };
    Long.prototype.or = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };
    Long.prototype.xor = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
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
    Long.prototype.toSigned = function () {
        if (!this.unsigned)
            return this;
        return fromBits(this.low, this.high, false);
    };
    Long.prototype.toUnsigned = function () {
        if (this.unsigned)
            return this;
        return fromBits(this.low, this.high, true);
    };
    Long.prototype.toBytes = function (le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    };
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
    Long.prototype[_Symbol.reflection] = function () {
        return {
            type: "System.Int64",
            interfaces: ["FSharpRecord", "System.IComparable"],
            properties: {
                low: "number",
                high: "number",
                unsigned: "boolean"
            }
        };
    };
    return Long;
}());
var INT_CACHE = {};
var UINT_CACHE = {};
function isLong(obj) {
    return (obj && obj instanceof Long);
}
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
function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
}
var pow_dbl = Math.pow;
function fromString(str, unsigned, radix) {
    if (unsigned === void 0) { unsigned = false; }
    if (radix === void 0) { radix = 10; }
    if (str.length === 0)
        throw Error('empty string');
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
        return ZERO;
    if (typeof unsigned === 'number') {
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
function fromValue(val) {
    if (val instanceof Long)
        return val;
    if (typeof val === 'number')
        return fromNumber(val);
    if (typeof val === 'string')
        return fromString(val);
    return fromBits(val.low, val.high, val.unsigned);
}
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
var ZERO = fromInt(0);
var UZERO = fromInt(0, true);
var ONE = fromInt(1);
var UONE = fromInt(1, true);
var NEG_ONE = fromInt(-1);
var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);

var fsFormatRegExp = /(^|[^%])%([0+ ]*)(-?\d+)?(?:\.(\d+))?(\w)/;



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


function initialize$2(n, f) {
    if (n < 0)
        throw new Error("String length must be non-negative");
    var xs = new Array(n);
    for (var i = 0; i < n; i++)
        xs[i] = f(i);
    return xs.join("");
}



function join(delimiter, xs) {
    xs = typeof xs == "string" ? getRestParams(arguments, 1) : xs;
    return (Array.isArray(xs) ? xs : Array.from(xs)).join(delimiter);
}

function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    str = String(str);
    len = len - str.length;
    for (var i = -1; ++i < len;)
        str = isRight ? str + ch : ch + str;
    return str;
}



function replicate$2(n, x) {
    return initialize$2(n, function () { return x; });
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

function parser(tokLst) {
    var parseRec = function parseRec(ml) {
        return function (_arg1) {
            var $var11 = _arg1.tail == null ? [2] : _arg1.head.Case === "T_MOV" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_INT" ? [0, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_REG" ? [1, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [3] : [3] : [3] : [3] : [3] : [3] : [3];

            switch ($var11[0]) {
                case 0:
                    return new List([ml, function (state) {
                        return movI($var11[1], $var11[3], $var11[2], state);
                    }], parseRec(ml + 4)($var11[4]));

                case 1:
                    return new List([ml, function (state_1) {
                        return movR($var11[1], $var11[2], $var11[3], state_1);
                    }], parseRec(ml + 4)($var11[4]));

                case 2:
                    return new List();

                case 3:
                    return fsFormat("unhandled parse error!")(function (x) {
                        throw new Error(x);
                    });
            }
        };
    };

    return create(parseRec(0)(tokLst), new GenericComparer(compare));
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
    switch (_arg1) {
        case "EQ":
            return function (state) {
                return checkEQ(state);
            };

        case "NE":
            return function (state_1) {
                return checkNE(state_1);
            };

        case "CS":
            return function (state_2) {
                return checkCS(state_2);
            };

        case "HS":
            return function (state_3) {
                return checkCS(state_3);
            };

        case "CC":
            return function (state_4) {
                return checkCC(state_4);
            };

        case "LO":
            return function (state_5) {
                return checkCC(state_5);
            };

        case "MI":
            return function (state_6) {
                return checkMI(state_6);
            };

        case "PL":
            return function (state_7) {
                return checkPL(state_7);
            };

        case "VS":
            return function (state_8) {
                return checkVS(state_8);
            };

        case "VC":
            return function (state_9) {
                return checkVC(state_9);
            };

        case "HI":
            return function (state_10) {
                return checkHI(state_10);
            };

        case "GE":
            return function (state_11) {
                return checkGE(state_11);
            };

        case "LT":
            return function (state_12) {
                return checkLT(state_12);
            };

        case "GT":
            return function (state_13) {
                return checkGT(state_13);
            };

        case "LE":
            return function (state_14) {
                return checkLE(state_14);
            };

        case "AL":
            return function (state_15) {
                return checkAL(state_15);
            };

        case "":
            return function (state_16) {
                return checkAL(state_16);
            };

        default:
            return function (state_17) {
                return checkAL(state_17);
            };
    }
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
                var matchValue = [this, yobj];
                var $var10 = matchValue[0].Case === "T_REG" ? matchValue[1].Case === "T_REG" ? [0, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_INT" ? matchValue[1].Case === "T_INT" ? [1, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_COMMA" ? matchValue[1].Case === "T_COMMA" ? [2] : [8] : matchValue[0].Case === "T_ERROR" ? matchValue[1].Case === "T_ERROR" ? [3] : [8] : matchValue[0].Case === "T_MOV" ? matchValue[1].Case === "T_MOV" ? [4, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_MVN" ? matchValue[1].Case === "T_MVN" ? [5, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_MRS" ? matchValue[1].Case === "T_MRS" ? [6, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_MSR" ? matchValue[1].Case === "T_MSR" ? [7, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : [8];

                switch ($var10[0]) {
                    case 0:
                        return $var10[1] === $var10[2];

                    case 1:
                        return $var10[1] === $var10[2];

                    case 2:
                        return true;

                    case 3:
                        return true;

                    case 4:
                        return $var10[1](state) === $var10[2](state);

                    case 5:
                        return $var10[1](state) === $var10[2](state);

                    case 6:
                        return $var10[1](state) === $var10[2](state);

                    case 7:
                        return $var10[1](state) === $var10[2](state);

                    case 8:
                        return false;
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
    } else {
        return null;
    }
}

function _REG_MATCH___(str) {
    var m = match(str, "^R([0-9]|1[0-5])$");

    if (m != null) {
        return Number.parseInt(m[1]);
    } else {
        return null;
    }
}

function _COMMA_MATCH___(str) {
    var m = match(str, "^,$");

    if (m != null) {
        return {};
    } else {
        return null;
    }
}

function _LABEL_MATCH___(str) {
    var m = match(str, "^([a-zA-Z][a-zA-Z0-9]*):$");

    if (m != null) {
        return m[1];
    } else {
        return null;
    }
}

function _DEC_LIT_MATCH___(str) {
    var m = match(str, "^#?([0-9]+)$");

    if (m != null) {
        return Number.parseInt(m[1]);
    } else {
        return null;
    }
}

function _HEX_LIT_MATCH___(str) {
    var m = match(str, "^#?(0x[0-9a-fA-F]+)$");

    if (m != null) {
        return Number.parseInt(m[1], 16);
    } else {
        return null;
    }
}

function stringToToken(_arg1) {
    var activePatternResult172 = _REG_MATCH___(_arg1);

    if (activePatternResult172 != null) {
        return new Token("T_REG", [activePatternResult172]);
    } else {
        var activePatternResult171 = _COMMA_MATCH___(_arg1);

        if (activePatternResult171 != null) {
            return new Token("T_COMMA", []);
        } else {
            var activePatternResult170 = _LABEL_MATCH___(_arg1);

            if (activePatternResult170 != null) {
                return new Token("T_LABEL", [activePatternResult170]);
            } else {
                var activePatternResult169 = _DEC_LIT_MATCH___(_arg1);

                if (activePatternResult169 != null) {
                    return new Token("T_INT", [activePatternResult169]);
                } else {
                    var activePatternResult168 = _HEX_LIT_MATCH___(_arg1);

                    if (activePatternResult168 != null) {
                        return new Token("T_INT", [activePatternResult168]);
                    } else {
                        var activePatternResult167 = _INSTR_MATCH___("^MOV", _arg1);

                        if (activePatternResult167 != null) {
                            return new Token("T_MOV", [activePatternResult167]);
                        } else {
                            var activePatternResult165 = _INSTR_MATCH___("^MVN", _arg1);

                            if (activePatternResult165 != null) {
                                return new Token("T_MVN", [activePatternResult165]);
                            } else {
                                var activePatternResult163 = _INSTR_MATCH___("^MRS", _arg1);

                                if (activePatternResult163 != null) {
                                    return new Token("T_MRS", [activePatternResult163]);
                                } else {
                                    var activePatternResult161 = _INSTR_MATCH___("^MSR", _arg1);

                                    if (activePatternResult161 != null) {
                                        return new Token("T_MSR", [activePatternResult161]);
                                    } else {
                                        var activePatternResult159 = _INSTR_MATCH___("^ADD", _arg1);

                                        if (activePatternResult159 != null) {
                                            return new Token("T_ADD", [activePatternResult159]);
                                        } else {
                                            var activePatternResult157 = _INSTR_MATCH___("^ADC", _arg1);

                                            if (activePatternResult157 != null) {
                                                return new Token("T_ADC", [activePatternResult157]);
                                            } else {
                                                var activePatternResult155 = _INSTR_MATCH___("^SUB", _arg1);

                                                if (activePatternResult155 != null) {
                                                    return new Token("T_SUB", [activePatternResult155]);
                                                } else {
                                                    var activePatternResult153 = _INSTR_MATCH___("^SBC", _arg1);

                                                    if (activePatternResult153 != null) {
                                                        return new Token("T_SBC", [activePatternResult153]);
                                                    } else {
                                                        var activePatternResult151 = _INSTR_MATCH___("^RSB", _arg1);

                                                        if (activePatternResult151 != null) {
                                                            return new Token("T_RSB", [activePatternResult151]);
                                                        } else {
                                                            var activePatternResult149 = _INSTR_MATCH___("^RSC", _arg1);

                                                            if (activePatternResult149 != null) {
                                                                return new Token("T_RSC", [activePatternResult149]);
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

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Html = function () {
   function Html(caseName, fields) {
      _classCallCheck$2(this, Html);

      this.Case = caseName;
      this.Fields = fields;
   }

   _createClass$2(Html, [{
      key: _Symbol.reflection,
      value: function () {
         return {
            type: "FsHtml.Html",
            interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
            cases: {
               Attr: ["string", "string"],
               Elem: ["string", makeGeneric(List, {
                  T: Html
               })],
               Text: ["string"]
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
   }, {
      key: "ToString",
      value: function () {
         return Html.toString(this);
      }
   }], [{
      key: "toString",
      value: function (elem) {
         var toString$$1 = function toString$$1(indent) {
            return function (elem_1) {
               var spaces = replicate$2(indent, " ");
               var $var12 = elem_1.Case === "Elem" ? elem_1.Fields[1].tail != null ? elem_1.Fields[1].head.Case === "Text" ? elem_1.Fields[1].tail.tail == null ? [1, elem_1.Fields[1].head.Fields[0], elem_1.Fields[0]] : [2, elem_1.Fields[1], elem_1.Fields[0]] : [2, elem_1.Fields[1], elem_1.Fields[0]] : [2, elem_1.Fields[1], elem_1.Fields[0]] : elem_1.Case === "Text" ? [3, elem_1.Fields[0]] : [0, elem_1.Fields[0], elem_1.Fields[1]];

               switch ($var12[0]) {
                  case 0:
                     return $var12[1] + "=\"" + $var12[2] + "\"";

                  case 1:
                     return spaces + "<" + $var12[2] + ">" + $var12[1] + "</" + $var12[2] + ">\r\n";

                  case 2:
                     var isAttr = function isAttr(_arg1) {
                        if (_arg1.Case === "Attr") {
                           return true;
                        } else {
                           return false;
                        }
                     };

                     var patternInput = function (list) {
                        return partition$2(isAttr, list);
                     }($var12[1]);

                     var attrs = patternInput[0].Equals(new List()) ? "" : " " + join(" ", toList(delay(function () {
                        return map(function (attr) {
                           return toString$$1(0)(attr);
                        }, patternInput[0]);
                     })));

                     if (patternInput[1].tail == null) {
                        return spaces + "<" + $var12[2] + attrs + "/>\r\n";
                     } else {
                        return spaces + "<" + $var12[2] + attrs + ">\r\n" + join("", toList(delay(function () {
                           return map(function (e) {
                              return toString$$1(indent + 1)(e);
                           }, patternInput[1]);
                        }))) + spaces + "</" + $var12[2] + ">\r\n";
                     }

                  case 3:
                     return spaces + $var12[1] + "\r\n";
               }
            };
         };

         return toString$$1(0)(elem);
      }
   }]);

   return Html;
}();
setType("FsHtml.Html", Html);
function elem(tag, content) {
   return new Html("Elem", [tag, content]);
}









var table = function () {
   var tag = "table";
   return function (content) {
      return elem(tag, content);
   };
}();
var thead = function () {
   var tag = "thead";
   return function (content) {
      return elem(tag, content);
   };
}();
var tbody = function () {
   var tag = "tbody";
   return function (content) {
      return elem(tag, content);
   };
}();






var tr = function () {
   var tag = "tr";
   return function (content) {
      return elem(tag, content);
   };
}();

var th = function () {
   var tag = "th";
   return function (content) {
      return elem(tag, content);
   };
}();







function op_Splice(s) {
   return ofArray$1([new Html("Text", [toString(s)])]);
}
function op_PercentEquals(name, value) {
   return new Html("Attr", [name, value]);
}

(function (args) {
  var state = initState;
  var inString = "MOV R5, #2";

  var newState = function (instr) {
    return interpret(state, instr);
  }(parser(tokenise(inString)));

  var regs = document.getElementById("regs");
  var registerString = table(ofArray$1([op_PercentEquals("class", "table table-striped"), thead(ofArray$1([tr(ofArray$1([th(op_Splice("Register")), th(op_Splice("Value"))]))])), tbody(toList(delay(function () {
    return map(function (i) {
      return tr(ofArray$1([th(op_Splice(fsFormat("R%A")(function (x) {
        return x;
      })(i))), th(op_Splice(fsFormat("%A")(function (x) {
        return x;
      })(readReg(newState, i))))]));
    }, range(1, 15));
  })))]));
  regs.innerHTML = Html.toString(registerString);
  return 0;
})(process.argv.slice(2));

})));

//# sourceMappingURL=main_fable.js.map