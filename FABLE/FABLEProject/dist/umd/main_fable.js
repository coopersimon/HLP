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
function Tuple(ts) {
    return new NonDeclaredType("Tuple", null, ts);
}
function GenericParam(definition) {
    return new NonDeclaredType("GenericParam", definition);
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

function ofArray(args, base) {
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

var GenericComparer = (function () {
    function GenericComparer(f) {
        this.Compare = f || compare;
    }
    GenericComparer.prototype[_Symbol.reflection] = function () {
        return { interfaces: ["System.IComparer"] };
    };
    return GenericComparer;
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
    return foldBack$1(function (x, acc) {
        return new List(x, acc);
    }, xs, new List());
}





function concat(xs) {
    return delay(function () {
        var iter = xs[Symbol.iterator]();
        var output = null;
        return unfold(function (innerIter) {
            var hasFinished = false;
            while (!hasFinished) {
                if (innerIter == null) {
                    var cur = iter.next();
                    if (!cur.done) {
                        innerIter = cur.value[Symbol.iterator]();
                    }
                    else {
                        hasFinished = true;
                    }
                }
                else {
                    var cur = innerIter.next();
                    if (!cur.done) {
                        output = cur.value;
                        hasFinished = true;
                    }
                    else {
                        innerIter = null;
                    }
                }
            }
            return innerIter != null && output != null ? [output, innerIter] : null;
        }, null);
    });
}


function compareWith(f, xs, ys) {
    var nonZero = tryFind$1(function (i) { return i != 0; }, map2(function (x, y) { return f(x, y); }, xs, ys));
    return nonZero != null ? nonZero : count(xs) - count(ys);
}
function delay(f) {
    return _a = {},
        _a[Symbol.iterator] = function () { return f()[Symbol.iterator](); },
        _a;
    var _a;
}










function fold$1(f, acc, xs) {
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
function foldBack$1(f, xs, acc) {
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
        : fold$1(function (acc, x) { return acc + 1; }, 0, xs);
}
function map$1(f, xs) {
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













function tryFind$1(f, xs, defaultValue) {
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
            return tree_collapseLHS(ofArray([
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
        return map$1(function (kv) { return kv[0]; }, this);
    };
    FableMap.prototype.values = function () {
        return map$1(function (kv) { return kv[1]; }, this);
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
function add(k, v, map$$1) {
    return from(map$$1.comparer, tree_add(map$$1.comparer, k, v, map$$1.tree));
}





function tryFind$$1(k, map$$1) {
    return tree_tryFind(map$$1.comparer, k, map$$1.tree);
}

function append$1(xs, ys) {
    return fold$1(function (acc, x) { return new List(x, acc); }, ys, reverse$1(xs));
}



function filter$2(f, xs) {
    return reverse$1(fold$1(function (acc, x) { return f(x) ? new List(x, acc) : acc; }, new List(), xs));
}


function map$2(f, xs) {
    return reverse$1(fold$1(function (acc, x) { return new List(f(x), acc); }, new List(), xs));
}



function reverse$1(xs) {
    return fold$1(function (acc, x) { return new List(x, acc); }, new List(), xs);
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
                    S: [FableArray(Int32Array, true), "boolean", "boolean", "boolean", "boolean", makeGeneric(FableMap, {
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
var initState = function () {
    var regs = Int32Array.from(replicate(16, 0));
    return new StateHandle("S", [regs, false, false, false, false, create(null, new GenericComparer(compare))]);
}();
var initStateVisual = function () {
    var regs0to12 = Int32Array.from(replicate(13, 0));
    var regs13to15 = new Int32Array([-16777216, 0, 0]);
    var regs = Int32Array.from(concat(ofArray([regs0to12, regs13to15])));
    return new StateHandle("S", [regs, false, false, false, false, create(null, new GenericComparer(compare))]);
}();
function readReg(r, _arg1) {
    return _arg1.Fields[0][r];
}
function writeReg(r, v, _arg1) {
    var newRegs = Int32Array.from(mapIndexed(function (i, x) {
        return r === i ? v : x;
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
function readPC(_arg1) {
    return _arg1.Fields[0][15];
}
function writePC(v, _arg1) {
    var newRegs = Int32Array.from(mapIndexed(function (i, x) {
        return i === 15 ? v : x;
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
function incPC(_arg1) {
    var newRegs = Int32Array.from(mapIndexed(function (i, x) {
        return i === 15 ? x + 4 : x;
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
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
function writeNFlag(n, _arg1) {
    return new StateHandle("S", [_arg1.Fields[0], n, _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
function writeZFlag(z, _arg1) {
    return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], z, _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
function writeCFlag(c, _arg1) {
    return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], _arg1.Fields[2], c, _arg1.Fields[4], _arg1.Fields[5]]);
}
function writeVFlag(v, _arg1) {
    return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], v, _arg1.Fields[5]]);
}

function create$1(pattern, options) {
    var flags = "g";
    flags += options & 1 ? "i" : "";
    flags += options & 2 ? "m" : "";
    return new RegExp(pattern, flags);
}



function match(str, pattern, options) {
    if (options === void 0) { options = 0; }
    var reg = str instanceof RegExp
        ? (reg = str, str = pattern, reg.lastIndex = options, reg)
        : reg = create$1(pattern, options);
    return reg.exec(str);
}



function split$1(reg, input, limit, offset) {
    if (offset === void 0) { offset = 0; }
    if (typeof reg == "string") {
        var tmp = reg;
        reg = create$1(input, limit);
        input = tmp;
        limit = undefined;
    }
    input = input.substring(offset);
    return input.split(reg, limit);
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








function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    str = String(str);
    len = len - str.length;
    for (var i = -1; ++i < len;)
        str = isRight ? str + ch : ch + str;
    return str;
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Error = function () {
    function _Error(caseName, fields) {
        _classCallCheck$1(this, _Error);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$1(_Error, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Common.Error.Error",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    Err: ["string"],
                    Ok: [GenericParam("a")]
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

    return _Error;
}();

setType("Common.Error.Error", _Error);
function wrapErr(f, x) {
    if (x.Case === "Err") {
        return new _Error("Err", [x.Fields[0]]);
    } else {
        return f(x.Fields[0]);
    }
}
function errorList(lst) {
    var addToStr = function addToStr(lst_1) {
        return function (n) {
            var matchValue = n < 5;

            if (matchValue) {
                if (lst_1.tail == null) {
                    return "";
                } else {
                    return fsFormat("%A")(function (x) {
                        return x;
                    })(lst_1.head) + "; " + addToStr(lst_1.tail)(n + 1);
                }
            } else {
                return "";
            }
        };
    };

    return addToStr(lst)(0);
}

function interpret(state, instr) {
    interpret: while (true) {
        var matchValue = tryFind$$1(readPC(state), instr);

        if (matchValue == null) {
            return new _Error("Err", [fsFormat("Instruction does not exist at address %A.")(function (x) {
                return x;
            })(readPC(state))]);
        } else if (matchValue.Case === "Terminate") {
            return new _Error("Ok", [state]);
        } else if (matchValue.Case === "LabelRef") {
            return new _Error("Err", ["Unresolved label (branch/adr) - this should have been resolved in the parser."]);
        } else if (matchValue.Case === "EndRef") {
            return new _Error("Err", ["Unresolved termination - this should have been resolved in the parser."]);
        } else {
            state = incPC(matchValue.Fields[0](state));
            instr = instr;
            continue interpret;
        }
    }
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

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var shiftOp = function () {
    function shiftOp(caseName, fields) {
        _classCallCheck$3(this, shiftOp);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$3(shiftOp, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Parse.Tokeniser.shiftOp",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    T_ASR: [],
                    T_LSL: [],
                    T_LSR: [],
                    T_NIL: [],
                    T_ROR: [],
                    T_RRX: []
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

    return shiftOp;
}();
setType("Parse.Tokeniser.shiftOp", shiftOp);
var stackOrder = function () {
    function stackOrder(caseName, fields) {
        _classCallCheck$3(this, stackOrder);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$3(stackOrder, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Parse.Tokeniser.stackOrder",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    S_DA: [],
                    S_DB: [],
                    S_IA: [],
                    S_IB: []
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

    return stackOrder;
}();
setType("Parse.Tokeniser.stackOrder", stackOrder);
var opType = function () {
    function opType(caseName, fields) {
        _classCallCheck$3(this, opType);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$3(opType, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Parse.Tokeniser.opType",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    T_I: [],
                    T_R: []
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

    return opType;
}();
setType("Parse.Tokeniser.opType", opType);
var Token = function () {
    function Token(caseName, fields) {
        _classCallCheck$3(this, Token);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$3(Token, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Parse.Tokeniser.Token",
                interfaces: ["FSharpUnion"],
                cases: {
                    T_ADC: ["function", "boolean"],
                    T_ADD: ["function", "boolean"],
                    T_ADR: ["function"],
                    T_AND: ["function", "boolean"],
                    T_B: ["function"],
                    T_BIC: ["function", "boolean"],
                    T_BL: ["function"],
                    T_BX: ["function"],
                    T_CLZ: ["function"],
                    T_CMN: ["function"],
                    T_CMP: ["function"],
                    T_COMMA: [],
                    T_DCD: [],
                    T_END: ["function"],
                    T_EOR: ["function", "boolean"],
                    T_EQU: [],
                    T_ERROR: ["string"],
                    T_EXCL: [],
                    T_FILL: [],
                    T_INT: ["number"],
                    T_LABEL: ["string"],
                    T_LDM: ["function", stackOrder],
                    T_LDR: ["function"],
                    T_LDRB: ["function"],
                    T_LDRH: ["function"],
                    T_L_BRAC: [],
                    T_MLA: ["function", "boolean"],
                    T_MOV: ["function", "boolean"],
                    T_MRS: ["function"],
                    T_MSR: ["function"],
                    T_MUL: ["function", "boolean"],
                    T_MVN: ["function", "boolean"],
                    T_NOP: ["function"],
                    T_ORR: ["function", "boolean"],
                    T_REG: ["number"],
                    T_RSB: ["function", "boolean"],
                    T_RSC: ["function", "boolean"],
                    T_R_BRAC: [],
                    T_SBC: ["function", "boolean"],
                    T_SHIFT: [shiftOp, Tuple(["function", "boolean"])],
                    T_SMLAL: ["function", "boolean"],
                    T_SMULL: ["function", "boolean"],
                    T_STM: ["function", stackOrder],
                    T_STR: ["function"],
                    T_STRB: ["function"],
                    T_STRH: ["function"],
                    T_SUB: ["function", "boolean"],
                    T_SWI: ["function"],
                    T_SWP: ["function"],
                    T_TEQ: ["function"],
                    T_TST: ["function"],
                    T_UMLAL: ["function", "boolean"],
                    T_UMULL: ["function", "boolean"]
                }
            };
        }
    }, {
        key: "Equals",
        value: function (yobj) {
            var state = initState;

            if (yobj instanceof Token) {
                var matchValue = [this, yobj];
                var $var567 = matchValue[0].Case === "T_REG" ? matchValue[1].Case === "T_REG" ? [0, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_INT" ? matchValue[1].Case === "T_INT" ? [1, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_COMMA" ? matchValue[1].Case === "T_COMMA" ? [2] : [8] : matchValue[0].Case === "T_ERROR" ? matchValue[1].Case === "T_ERROR" ? [3, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_MOV" ? matchValue[1].Case === "T_MOV" ? [4, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [8] : matchValue[0].Case === "T_MVN" ? matchValue[1].Case === "T_MVN" ? [5, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [8] : matchValue[0].Case === "T_MRS" ? matchValue[1].Case === "T_MRS" ? [6, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_MSR" ? matchValue[1].Case === "T_MSR" ? [7, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : [8];

                switch ($var567[0]) {
                    case 0:
                        return $var567[1] === $var567[2];

                    case 1:
                        return $var567[1] === $var567[2];

                    case 2:
                        return true;

                    case 3:
                        return $var567[1] === $var567[2];

                    case 4:
                        if ($var567[1](state) === $var567[2](state)) {
                            return $var567[3] === $var567[4];
                        } else {
                            return false;
                        }

                    case 5:
                        if ($var567[1](state) === $var567[2](state)) {
                            return $var567[3] === $var567[4];
                        } else {
                            return false;
                        }

                    case 6:
                        return $var567[1](state) === $var567[2](state);

                    case 7:
                        return $var567[1](state) === $var567[2](state);

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
var cond = "(|EQ|NE|CS|HS|CC|LO|MI|PL|VS|VC|HI|LS|GE|LT|GT|LE|AL)";
var setFlags = "(|S)";
var stackSfx = "(IA|IB|DA|DB|FD|FA|ED|EA)";

function _TOKEN_MATCH___(pattern, str) {
    var m = match(str, pattern, 1);

    if (m != null) {
        return {};
    } else {
        return null;
    }
}

function matchCond(_arg1) {
    var activePatternResult37357 = _TOKEN_MATCH___("EQ", _arg1);

    if (activePatternResult37357 != null) {
        return function (state) {
            return checkEQ(state);
        };
    } else {
        var activePatternResult37355 = _TOKEN_MATCH___("NE", _arg1);

        if (activePatternResult37355 != null) {
            return function (state_1) {
                return checkNE(state_1);
            };
        } else {
            var activePatternResult37353 = _TOKEN_MATCH___("CS", _arg1);

            if (activePatternResult37353 != null) {
                return function (state_2) {
                    return checkCS(state_2);
                };
            } else {
                var activePatternResult37351 = _TOKEN_MATCH___("HS", _arg1);

                if (activePatternResult37351 != null) {
                    return function (state_3) {
                        return checkCS(state_3);
                    };
                } else {
                    var activePatternResult37349 = _TOKEN_MATCH___("CC", _arg1);

                    if (activePatternResult37349 != null) {
                        return function (state_4) {
                            return checkCC(state_4);
                        };
                    } else {
                        var activePatternResult37347 = _TOKEN_MATCH___("LO", _arg1);

                        if (activePatternResult37347 != null) {
                            return function (state_5) {
                                return checkCC(state_5);
                            };
                        } else {
                            var activePatternResult37345 = _TOKEN_MATCH___("MI", _arg1);

                            if (activePatternResult37345 != null) {
                                return function (state_6) {
                                    return checkMI(state_6);
                                };
                            } else {
                                var activePatternResult37343 = _TOKEN_MATCH___("PL", _arg1);

                                if (activePatternResult37343 != null) {
                                    return function (state_7) {
                                        return checkPL(state_7);
                                    };
                                } else {
                                    var activePatternResult37341 = _TOKEN_MATCH___("VS", _arg1);

                                    if (activePatternResult37341 != null) {
                                        return function (state_8) {
                                            return checkVS(state_8);
                                        };
                                    } else {
                                        var activePatternResult37339 = _TOKEN_MATCH___("VC", _arg1);

                                        if (activePatternResult37339 != null) {
                                            return function (state_9) {
                                                return checkVC(state_9);
                                            };
                                        } else {
                                            var activePatternResult37337 = _TOKEN_MATCH___("HI", _arg1);

                                            if (activePatternResult37337 != null) {
                                                return function (state_10) {
                                                    return checkHI(state_10);
                                                };
                                            } else {
                                                var activePatternResult37335 = _TOKEN_MATCH___("GE", _arg1);

                                                if (activePatternResult37335 != null) {
                                                    return function (state_11) {
                                                        return checkGE(state_11);
                                                    };
                                                } else {
                                                    var activePatternResult37333 = _TOKEN_MATCH___("LT", _arg1);

                                                    if (activePatternResult37333 != null) {
                                                        return function (state_12) {
                                                            return checkLT(state_12);
                                                        };
                                                    } else {
                                                        var activePatternResult37331 = _TOKEN_MATCH___("GT", _arg1);

                                                        if (activePatternResult37331 != null) {
                                                            return function (state_13) {
                                                                return checkGT(state_13);
                                                            };
                                                        } else {
                                                            var activePatternResult37329 = _TOKEN_MATCH___("LE", _arg1);

                                                            if (activePatternResult37329 != null) {
                                                                return function (state_14) {
                                                                    return checkLE(state_14);
                                                                };
                                                            } else {
                                                                var activePatternResult37327 = _TOKEN_MATCH___("AL", _arg1);

                                                                if (activePatternResult37327 != null) {
                                                                    return function (state_15) {
                                                                        return checkAL(state_15);
                                                                    };
                                                                } else {
                                                                    return function (state_16) {
                                                                        return checkAL(state_16);
                                                                    };
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
}
function matchS(_arg1) {
    var activePatternResult37360 = _TOKEN_MATCH___("S", _arg1);

    if (activePatternResult37360 != null) {
        return true;
    } else {
        return false;
    }
}
function matchLDM(_arg1) {
    var activePatternResult37377 = _TOKEN_MATCH___("IA", _arg1);

    if (activePatternResult37377 != null) {
        return new stackOrder("S_IA", []);
    } else {
        var activePatternResult37375 = _TOKEN_MATCH___("IB", _arg1);

        if (activePatternResult37375 != null) {
            return new stackOrder("S_IB", []);
        } else {
            var activePatternResult37373 = _TOKEN_MATCH___("DA", _arg1);

            if (activePatternResult37373 != null) {
                return new stackOrder("S_DA", []);
            } else {
                var activePatternResult37371 = _TOKEN_MATCH___("DB", _arg1);

                if (activePatternResult37371 != null) {
                    return new stackOrder("S_DB", []);
                } else {
                    var activePatternResult37369 = _TOKEN_MATCH___("FD", _arg1);

                    if (activePatternResult37369 != null) {
                        return new stackOrder("S_IA", []);
                    } else {
                        var activePatternResult37367 = _TOKEN_MATCH___("ED", _arg1);

                        if (activePatternResult37367 != null) {
                            return new stackOrder("S_IB", []);
                        } else {
                            var activePatternResult37365 = _TOKEN_MATCH___("FA", _arg1);

                            if (activePatternResult37365 != null) {
                                return new stackOrder("S_DA", []);
                            } else {
                                var activePatternResult37363 = _TOKEN_MATCH___("EA", _arg1);

                                if (activePatternResult37363 != null) {
                                    return new stackOrder("S_DB", []);
                                } else {
                                    return new stackOrder("S_IA", []);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function matchSTM(_arg1) {
    var activePatternResult37394 = _TOKEN_MATCH___("IA", _arg1);

    if (activePatternResult37394 != null) {
        return new stackOrder("S_IA", []);
    } else {
        var activePatternResult37392 = _TOKEN_MATCH___("IB", _arg1);

        if (activePatternResult37392 != null) {
            return new stackOrder("S_IB", []);
        } else {
            var activePatternResult37390 = _TOKEN_MATCH___("DA", _arg1);

            if (activePatternResult37390 != null) {
                return new stackOrder("S_DA", []);
            } else {
                var activePatternResult37388 = _TOKEN_MATCH___("DB", _arg1);

                if (activePatternResult37388 != null) {
                    return new stackOrder("S_DB", []);
                } else {
                    var activePatternResult37386 = _TOKEN_MATCH___("EA", _arg1);

                    if (activePatternResult37386 != null) {
                        return new stackOrder("S_IA", []);
                    } else {
                        var activePatternResult37384 = _TOKEN_MATCH___("FA", _arg1);

                        if (activePatternResult37384 != null) {
                            return new stackOrder("S_IB", []);
                        } else {
                            var activePatternResult37382 = _TOKEN_MATCH___("ED", _arg1);

                            if (activePatternResult37382 != null) {
                                return new stackOrder("S_DA", []);
                            } else {
                                var activePatternResult37380 = _TOKEN_MATCH___("FD", _arg1);

                                if (activePatternResult37380 != null) {
                                    return new stackOrder("S_DB", []);
                                } else {
                                    return new stackOrder("S_IA", []);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function _INSTR_MATCH___(pattern, str) {
    var m = match(str, pattern + cond + "$", 1);

    if (m != null) {
        return matchCond(m[1]);
    } else {
        return null;
    }
}

function _INSTR_S_MATCH___(pattern, str) {
    var m = match(str, pattern + cond + setFlags + "$", 1);

    if (m != null) {
        return [matchCond(m[1]), matchS(m[2])];
    } else {
        return null;
    }
}

function _LDM_MATCH___(str) {
    var m = match(str, "^LDM" + cond + stackSfx + "$", 1);

    if (m != null) {
        return [matchCond(m[1]), matchLDM(m[2])];
    } else {
        return null;
    }
}

function _STM_MATCH___(str) {
    var m = match(str, "^STM" + cond + stackSfx + "$", 1);

    if (m != null) {
        return [matchCond(m[1]), matchSTM(m[2])];
    } else {
        return null;
    }
}

function _REG_MATCH___(str) {
    var m = match(str, "^R([0-9]|1[0-5])$", 1);

    if (m != null) {
        return Number.parseInt(m[1]);
    } else {
        return null;
    }
}

function _LABEL_MATCH___(str) {
    var m = match(str, "^([a-zA-Z_][a-zA-Z0-9_]*)$");

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
    var activePatternResult37563 = _REG_MATCH___(_arg1);

    if (activePatternResult37563 != null) {
        return new Token("T_REG", [activePatternResult37563]);
    } else {
        var activePatternResult37562 = _TOKEN_MATCH___("^a1$", _arg1);

        if (activePatternResult37562 != null) {
            return new Token("T_REG", [0]);
        } else {
            var activePatternResult37560 = _TOKEN_MATCH___("^a2$", _arg1);

            if (activePatternResult37560 != null) {
                return new Token("T_REG", [1]);
            } else {
                var activePatternResult37558 = _TOKEN_MATCH___("^a3$", _arg1);

                if (activePatternResult37558 != null) {
                    return new Token("T_REG", [2]);
                } else {
                    var activePatternResult37556 = _TOKEN_MATCH___("^a4$", _arg1);

                    if (activePatternResult37556 != null) {
                        return new Token("T_REG", [3]);
                    } else {
                        var activePatternResult37554 = _TOKEN_MATCH___("^v1$", _arg1);

                        if (activePatternResult37554 != null) {
                            return new Token("T_REG", [4]);
                        } else {
                            var activePatternResult37552 = _TOKEN_MATCH___("^v2$", _arg1);

                            if (activePatternResult37552 != null) {
                                return new Token("T_REG", [5]);
                            } else {
                                var activePatternResult37550 = _TOKEN_MATCH___("^v3$", _arg1);

                                if (activePatternResult37550 != null) {
                                    return new Token("T_REG", [6]);
                                } else {
                                    var activePatternResult37548 = _TOKEN_MATCH___("^v4$", _arg1);

                                    if (activePatternResult37548 != null) {
                                        return new Token("T_REG", [7]);
                                    } else {
                                        var activePatternResult37546 = _TOKEN_MATCH___("^v5$", _arg1);

                                        if (activePatternResult37546 != null) {
                                            return new Token("T_REG", [8]);
                                        } else {
                                            var activePatternResult37544 = _TOKEN_MATCH___("^v6$", _arg1);

                                            if (activePatternResult37544 != null) {
                                                return new Token("T_REG", [9]);
                                            } else {
                                                var activePatternResult37542 = _TOKEN_MATCH___("^v7$", _arg1);

                                                if (activePatternResult37542 != null) {
                                                    return new Token("T_REG", [10]);
                                                } else {
                                                    var activePatternResult37540 = _TOKEN_MATCH___("^v8$", _arg1);

                                                    if (activePatternResult37540 != null) {
                                                        return new Token("T_REG", [11]);
                                                    } else {
                                                        var activePatternResult37538 = _TOKEN_MATCH___("^sb$", _arg1);

                                                        if (activePatternResult37538 != null) {
                                                            return new Token("T_REG", [9]);
                                                        } else {
                                                            var activePatternResult37536 = _TOKEN_MATCH___("^sl$", _arg1);

                                                            if (activePatternResult37536 != null) {
                                                                return new Token("T_REG", [10]);
                                                            } else {
                                                                var activePatternResult37534 = _TOKEN_MATCH___("^fp$", _arg1);

                                                                if (activePatternResult37534 != null) {
                                                                    return new Token("T_REG", [11]);
                                                                } else {
                                                                    var activePatternResult37532 = _TOKEN_MATCH___("^ip$", _arg1);

                                                                    if (activePatternResult37532 != null) {
                                                                        return new Token("T_REG", [12]);
                                                                    } else {
                                                                        var activePatternResult37530 = _TOKEN_MATCH___("^sp$", _arg1);

                                                                        if (activePatternResult37530 != null) {
                                                                            return new Token("T_REG", [13]);
                                                                        } else {
                                                                            var activePatternResult37528 = _TOKEN_MATCH___("^lr$", _arg1);

                                                                            if (activePatternResult37528 != null) {
                                                                                return new Token("T_REG", [14]);
                                                                            } else {
                                                                                var activePatternResult37526 = _TOKEN_MATCH___("^pc$", _arg1);

                                                                                if (activePatternResult37526 != null) {
                                                                                    return new Token("T_REG", [15]);
                                                                                } else if (_arg1 === ",") {
                                                                                    return new Token("T_COMMA", []);
                                                                                } else if (_arg1 === "[") {
                                                                                    return new Token("T_L_BRAC", []);
                                                                                } else if (_arg1 === "]") {
                                                                                    return new Token("T_R_BRAC", []);
                                                                                } else if (_arg1 === "!") {
                                                                                    return new Token("T_EXCL", []);
                                                                                } else {
                                                                                    var activePatternResult37524 = _DEC_LIT_MATCH___(_arg1);

                                                                                    if (activePatternResult37524 != null) {
                                                                                        return new Token("T_INT", [activePatternResult37524]);
                                                                                    } else {
                                                                                        var activePatternResult37523 = _HEX_LIT_MATCH___(_arg1);

                                                                                        if (activePatternResult37523 != null) {
                                                                                            return new Token("T_INT", [activePatternResult37523]);
                                                                                        } else {
                                                                                            var activePatternResult37522 = _INSTR_S_MATCH___("^MOV", _arg1);

                                                                                            if (activePatternResult37522 != null) {
                                                                                                return function (tupledArg) {
                                                                                                    return new Token("T_MOV", [tupledArg[0], tupledArg[1]]);
                                                                                                }(activePatternResult37522);
                                                                                            } else {
                                                                                                var activePatternResult37520 = _INSTR_S_MATCH___("^MVN", _arg1);

                                                                                                if (activePatternResult37520 != null) {
                                                                                                    return function (tupledArg_1) {
                                                                                                        return new Token("T_MVN", [tupledArg_1[0], tupledArg_1[1]]);
                                                                                                    }(activePatternResult37520);
                                                                                                } else {
                                                                                                    var activePatternResult37518 = _INSTR_MATCH___("^MRS", _arg1);

                                                                                                    if (activePatternResult37518 != null) {
                                                                                                        return new Token("T_MRS", [activePatternResult37518]);
                                                                                                    } else {
                                                                                                        var activePatternResult37516 = _INSTR_MATCH___("^MSR", _arg1);

                                                                                                        if (activePatternResult37516 != null) {
                                                                                                            return new Token("T_MSR", [activePatternResult37516]);
                                                                                                        } else {
                                                                                                            var activePatternResult37514 = _INSTR_S_MATCH___("^ADD", _arg1);

                                                                                                            if (activePatternResult37514 != null) {
                                                                                                                return function (tupledArg_2) {
                                                                                                                    return new Token("T_ADD", [tupledArg_2[0], tupledArg_2[1]]);
                                                                                                                }(activePatternResult37514);
                                                                                                            } else {
                                                                                                                var activePatternResult37512 = _INSTR_S_MATCH___("^ADC", _arg1);

                                                                                                                if (activePatternResult37512 != null) {
                                                                                                                    return function (tupledArg_3) {
                                                                                                                        return new Token("T_ADC", [tupledArg_3[0], tupledArg_3[1]]);
                                                                                                                    }(activePatternResult37512);
                                                                                                                } else {
                                                                                                                    var activePatternResult37510 = _INSTR_S_MATCH___("^SUB", _arg1);

                                                                                                                    if (activePatternResult37510 != null) {
                                                                                                                        return function (tupledArg_4) {
                                                                                                                            return new Token("T_SUB", [tupledArg_4[0], tupledArg_4[1]]);
                                                                                                                        }(activePatternResult37510);
                                                                                                                    } else {
                                                                                                                        var activePatternResult37508 = _INSTR_S_MATCH___("^SBC", _arg1);

                                                                                                                        if (activePatternResult37508 != null) {
                                                                                                                            return function (tupledArg_5) {
                                                                                                                                return new Token("T_SBC", [tupledArg_5[0], tupledArg_5[1]]);
                                                                                                                            }(activePatternResult37508);
                                                                                                                        } else {
                                                                                                                            var activePatternResult37506 = _INSTR_S_MATCH___("^RSB", _arg1);

                                                                                                                            if (activePatternResult37506 != null) {
                                                                                                                                return function (tupledArg_6) {
                                                                                                                                    return new Token("T_RSB", [tupledArg_6[0], tupledArg_6[1]]);
                                                                                                                                }(activePatternResult37506);
                                                                                                                            } else {
                                                                                                                                var activePatternResult37504 = _INSTR_S_MATCH___("^RSC", _arg1);

                                                                                                                                if (activePatternResult37504 != null) {
                                                                                                                                    return function (tupledArg_7) {
                                                                                                                                        return new Token("T_RSC", [tupledArg_7[0], tupledArg_7[1]]);
                                                                                                                                    }(activePatternResult37504);
                                                                                                                                } else {
                                                                                                                                    var activePatternResult37502 = _INSTR_S_MATCH___("^MUL", _arg1);

                                                                                                                                    if (activePatternResult37502 != null) {
                                                                                                                                        return function (tupledArg_8) {
                                                                                                                                            return new Token("T_MUL", [tupledArg_8[0], tupledArg_8[1]]);
                                                                                                                                        }(activePatternResult37502);
                                                                                                                                    } else {
                                                                                                                                        var activePatternResult37500 = _INSTR_S_MATCH___("^MLA", _arg1);

                                                                                                                                        if (activePatternResult37500 != null) {
                                                                                                                                            return function (tupledArg_9) {
                                                                                                                                                return new Token("T_MLA", [tupledArg_9[0], tupledArg_9[1]]);
                                                                                                                                            }(activePatternResult37500);
                                                                                                                                        } else {
                                                                                                                                            var activePatternResult37498 = _INSTR_S_MATCH___("^UMULL", _arg1);

                                                                                                                                            if (activePatternResult37498 != null) {
                                                                                                                                                return function (tupledArg_10) {
                                                                                                                                                    return new Token("T_UMULL", [tupledArg_10[0], tupledArg_10[1]]);
                                                                                                                                                }(activePatternResult37498);
                                                                                                                                            } else {
                                                                                                                                                var activePatternResult37496 = _INSTR_S_MATCH___("^UMLAL", _arg1);

                                                                                                                                                if (activePatternResult37496 != null) {
                                                                                                                                                    return function (tupledArg_11) {
                                                                                                                                                        return new Token("T_UMLAL", [tupledArg_11[0], tupledArg_11[1]]);
                                                                                                                                                    }(activePatternResult37496);
                                                                                                                                                } else {
                                                                                                                                                    var activePatternResult37494 = _INSTR_S_MATCH___("^SMULL", _arg1);

                                                                                                                                                    if (activePatternResult37494 != null) {
                                                                                                                                                        return function (tupledArg_12) {
                                                                                                                                                            return new Token("T_SMULL", [tupledArg_12[0], tupledArg_12[1]]);
                                                                                                                                                        }(activePatternResult37494);
                                                                                                                                                    } else {
                                                                                                                                                        var activePatternResult37492 = _INSTR_S_MATCH___("^SMLAL", _arg1);

                                                                                                                                                        if (activePatternResult37492 != null) {
                                                                                                                                                            return function (tupledArg_13) {
                                                                                                                                                                return new Token("T_SMLAL", [tupledArg_13[0], tupledArg_13[1]]);
                                                                                                                                                            }(activePatternResult37492);
                                                                                                                                                        } else {
                                                                                                                                                            var activePatternResult37490 = _INSTR_S_MATCH___("^AND", _arg1);

                                                                                                                                                            if (activePatternResult37490 != null) {
                                                                                                                                                                return function (tupledArg_14) {
                                                                                                                                                                    return new Token("T_AND", [tupledArg_14[0], tupledArg_14[1]]);
                                                                                                                                                                }(activePatternResult37490);
                                                                                                                                                            } else {
                                                                                                                                                                var activePatternResult37488 = _INSTR_S_MATCH___("^ORR", _arg1);

                                                                                                                                                                if (activePatternResult37488 != null) {
                                                                                                                                                                    return function (tupledArg_15) {
                                                                                                                                                                        return new Token("T_ORR", [tupledArg_15[0], tupledArg_15[1]]);
                                                                                                                                                                    }(activePatternResult37488);
                                                                                                                                                                } else {
                                                                                                                                                                    var activePatternResult37486 = _INSTR_S_MATCH___("^EOR", _arg1);

                                                                                                                                                                    if (activePatternResult37486 != null) {
                                                                                                                                                                        return function (tupledArg_16) {
                                                                                                                                                                            return new Token("T_EOR", [tupledArg_16[0], tupledArg_16[1]]);
                                                                                                                                                                        }(activePatternResult37486);
                                                                                                                                                                    } else {
                                                                                                                                                                        var activePatternResult37484 = _INSTR_S_MATCH___("^BIC", _arg1);

                                                                                                                                                                        if (activePatternResult37484 != null) {
                                                                                                                                                                            return function (tupledArg_17) {
                                                                                                                                                                                return new Token("T_BIC", [tupledArg_17[0], tupledArg_17[1]]);
                                                                                                                                                                            }(activePatternResult37484);
                                                                                                                                                                        } else {
                                                                                                                                                                            var activePatternResult37482 = _INSTR_MATCH___("^CMP", _arg1);

                                                                                                                                                                            if (activePatternResult37482 != null) {
                                                                                                                                                                                return new Token("T_CMP", [activePatternResult37482]);
                                                                                                                                                                            } else {
                                                                                                                                                                                var activePatternResult37480 = _INSTR_MATCH___("^CMN", _arg1);

                                                                                                                                                                                if (activePatternResult37480 != null) {
                                                                                                                                                                                    return new Token("T_CMN", [activePatternResult37480]);
                                                                                                                                                                                } else {
                                                                                                                                                                                    var activePatternResult37478 = _INSTR_MATCH___("^TST", _arg1);

                                                                                                                                                                                    if (activePatternResult37478 != null) {
                                                                                                                                                                                        return new Token("T_TST", [activePatternResult37478]);
                                                                                                                                                                                    } else {
                                                                                                                                                                                        var activePatternResult37476 = _INSTR_MATCH___("^TEQ", _arg1);

                                                                                                                                                                                        if (activePatternResult37476 != null) {
                                                                                                                                                                                            return new Token("T_TEQ", [activePatternResult37476]);
                                                                                                                                                                                        } else {
                                                                                                                                                                                            var activePatternResult37474 = _INSTR_MATCH___("^B", _arg1);

                                                                                                                                                                                            if (activePatternResult37474 != null) {
                                                                                                                                                                                                return new Token("T_B", [activePatternResult37474]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                var activePatternResult37472 = _INSTR_MATCH___("^BL", _arg1);

                                                                                                                                                                                                if (activePatternResult37472 != null) {
                                                                                                                                                                                                    return new Token("T_BL", [activePatternResult37472]);
                                                                                                                                                                                                } else {
                                                                                                                                                                                                    var activePatternResult37470 = _INSTR_MATCH___("^BX", _arg1);

                                                                                                                                                                                                    if (activePatternResult37470 != null) {
                                                                                                                                                                                                        return new Token("T_BX", [activePatternResult37470]);
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        var activePatternResult37468 = _INSTR_MATCH___("^LDR", _arg1);

                                                                                                                                                                                                        if (activePatternResult37468 != null) {
                                                                                                                                                                                                            return new Token("T_LDR", [activePatternResult37468]);
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            var activePatternResult37466 = _INSTR_MATCH___("^LDRB", _arg1);

                                                                                                                                                                                                            if (activePatternResult37466 != null) {
                                                                                                                                                                                                                return new Token("T_LDRB", [activePatternResult37466]);
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                var activePatternResult37464 = _INSTR_MATCH___("^LDRH", _arg1);

                                                                                                                                                                                                                if (activePatternResult37464 != null) {
                                                                                                                                                                                                                    return new Token("T_LDRH", [activePatternResult37464]);
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    var activePatternResult37462 = _LDM_MATCH___(_arg1);

                                                                                                                                                                                                                    if (activePatternResult37462 != null) {
                                                                                                                                                                                                                        return function (tupledArg_18) {
                                                                                                                                                                                                                            return new Token("T_LDM", [tupledArg_18[0], tupledArg_18[1]]);
                                                                                                                                                                                                                        }(activePatternResult37462);
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        var activePatternResult37461 = _INSTR_MATCH___("^STR", _arg1);

                                                                                                                                                                                                                        if (activePatternResult37461 != null) {
                                                                                                                                                                                                                            return new Token("T_STR", [activePatternResult37461]);
                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                            var activePatternResult37459 = _INSTR_MATCH___("^STRB", _arg1);

                                                                                                                                                                                                                            if (activePatternResult37459 != null) {
                                                                                                                                                                                                                                return new Token("T_STRB", [activePatternResult37459]);
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                var activePatternResult37457 = _INSTR_MATCH___("^STRH", _arg1);

                                                                                                                                                                                                                                if (activePatternResult37457 != null) {
                                                                                                                                                                                                                                    return new Token("T_STRH", [activePatternResult37457]);
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    var activePatternResult37455 = _STM_MATCH___(_arg1);

                                                                                                                                                                                                                                    if (activePatternResult37455 != null) {
                                                                                                                                                                                                                                        return function (tupledArg_19) {
                                                                                                                                                                                                                                            return new Token("T_STM", [tupledArg_19[0], tupledArg_19[1]]);
                                                                                                                                                                                                                                        }(activePatternResult37455);
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        var activePatternResult37454 = _INSTR_MATCH___("^SWP", _arg1);

                                                                                                                                                                                                                                        if (activePatternResult37454 != null) {
                                                                                                                                                                                                                                            return new Token("T_SWP", [activePatternResult37454]);
                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                            var activePatternResult37452 = _INSTR_MATCH___("^SWI", _arg1);

                                                                                                                                                                                                                                            if (activePatternResult37452 != null) {
                                                                                                                                                                                                                                                return new Token("T_SWI", [activePatternResult37452]);
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                var activePatternResult37450 = _INSTR_MATCH___("^NOP", _arg1);

                                                                                                                                                                                                                                                if (activePatternResult37450 != null) {
                                                                                                                                                                                                                                                    return new Token("T_NOP", [activePatternResult37450]);
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                    var activePatternResult37448 = _INSTR_MATCH___("^ADR", _arg1);

                                                                                                                                                                                                                                                    if (activePatternResult37448 != null) {
                                                                                                                                                                                                                                                        return new Token("T_ADR", [activePatternResult37448]);
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                        var activePatternResult37446 = _INSTR_MATCH___("^END", _arg1);

                                                                                                                                                                                                                                                        if (activePatternResult37446 != null) {
                                                                                                                                                                                                                                                            return new Token("T_END", [activePatternResult37446]);
                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                            var activePatternResult37444 = _INSTR_MATCH___("^CLZ", _arg1);

                                                                                                                                                                                                                                                            if (activePatternResult37444 != null) {
                                                                                                                                                                                                                                                                return new Token("T_CLZ", [activePatternResult37444]);
                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                var activePatternResult37442 = _TOKEN_MATCH___("^DCD$", _arg1);

                                                                                                                                                                                                                                                                if (activePatternResult37442 != null) {
                                                                                                                                                                                                                                                                    return new Token("T_DCD", []);
                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                    var activePatternResult37440 = _TOKEN_MATCH___("^EQU$", _arg1);

                                                                                                                                                                                                                                                                    if (activePatternResult37440 != null) {
                                                                                                                                                                                                                                                                        return new Token("T_EQU", []);
                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                        var activePatternResult37438 = _TOKEN_MATCH___("^FILL$", _arg1);

                                                                                                                                                                                                                                                                        if (activePatternResult37438 != null) {
                                                                                                                                                                                                                                                                            return new Token("T_FILL", []);
                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                            var activePatternResult37436 = _INSTR_S_MATCH___("^ASR", _arg1);

                                                                                                                                                                                                                                                                            if (activePatternResult37436 != null) {
                                                                                                                                                                                                                                                                                return new Token("T_SHIFT", [new shiftOp("T_ASR", []), activePatternResult37436]);
                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                var activePatternResult37434 = _INSTR_S_MATCH___("^LSL", _arg1);

                                                                                                                                                                                                                                                                                if (activePatternResult37434 != null) {
                                                                                                                                                                                                                                                                                    return new Token("T_SHIFT", [new shiftOp("T_LSL", []), activePatternResult37434]);
                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                    var activePatternResult37432 = _INSTR_S_MATCH___("^LSR", _arg1);

                                                                                                                                                                                                                                                                                    if (activePatternResult37432 != null) {
                                                                                                                                                                                                                                                                                        return new Token("T_SHIFT", [new shiftOp("T_LSR", []), activePatternResult37432]);
                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                        var activePatternResult37430 = _INSTR_S_MATCH___("^ROR", _arg1);

                                                                                                                                                                                                                                                                                        if (activePatternResult37430 != null) {
                                                                                                                                                                                                                                                                                            return new Token("T_SHIFT", [new shiftOp("T_ROR", []), activePatternResult37430]);
                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                            var activePatternResult37428 = _INSTR_S_MATCH___("^RRX", _arg1);

                                                                                                                                                                                                                                                                                            if (activePatternResult37428 != null) {
                                                                                                                                                                                                                                                                                                return new Token("T_SHIFT", [new shiftOp("T_RRX", []), activePatternResult37428]);
                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                var activePatternResult37426 = _LABEL_MATCH___(_arg1);

                                                                                                                                                                                                                                                                                                if (activePatternResult37426 != null) {
                                                                                                                                                                                                                                                                                                    return new Token("T_LABEL", [activePatternResult37426]);
                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                    return new Token("T_ERROR", [_arg1]);
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
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function tokenise(source) {
    return function (list) {
        return map$2(function (_arg1) {
            return stringToToken(_arg1);
        }, list);
    }(filter$2(function (s) {
        return s !== "";
    }, toList(split$1(source, "([,\\[\\]!])|[\\ \\t\\n\\r\\f]+|;.*"))));
}

function shiftI(inst, r, n, state) {
    if (inst.Case === "T_LSR") {
        if (n >= 1 ? n <= 32 : false) {
            if (n === 32) {
                return 0;
            } else {
                return ~~~~((readReg(r, state) >>> 0) / (Math.pow(2, n) >>> 0));
            }
        } else {
            throw new Error("Invalid n.");
        }
    } else if (inst.Case === "T_ASR") {
        if (n >= 1 ? n <= 32 : false) {
            return ~~(readReg(r, state) / ~~Math.pow(2, n));
        } else {
            throw new Error("Invalid n.");
        }
    } else if (inst.Case === "T_ROR") {
        if (n >= 1 ? n <= 31 : false) {
            return readReg(r, state) >> n;
        } else {
            throw new Error("Invalid n.");
        }
    } else if (inst.Case === "T_RRX") {
        var matchValue = readCFlag(state);

        if (matchValue) {
            return ~~(readReg(r, state) / 2) + 1 << 31;
        } else {
            return ~~(readReg(r, state) / 2);
        }
    } else if (inst.Case === "T_NIL") {
        return readReg(r, state);
    } else if (n >= 0 ? n <= 31 : false) {
        return readReg(r, state) << n;
    } else {
        throw new Error("Invalid n.");
    }
}
function shiftR(inst, r, rn, state) {
    return shiftI(inst, r, readReg(rn, state), state);
}
function shiftSetCI(s, inst, r, n, state) {
    if (inst.Case === "T_LSR") {
        if (s) {
            return writeCFlag((readReg(r, state) >> n - 1) % 2 !== 0, state);
        } else {
            return state;
        }
    } else if (inst.Case === "T_ASR") {
        if (s) {
            return writeCFlag((readReg(r, state) >> n - 1) % 2 !== 0, state);
        } else {
            return state;
        }
    } else if (inst.Case === "T_ROR") {
        if (s) {
            return writeCFlag((readReg(r, state) >> n - 1) % 2 !== 0, state);
        } else {
            return state;
        }
    } else if (inst.Case === "T_RRX") {
        if (s) {
            return writeCFlag(readReg(r, state) % 2 !== 0, state);
        } else {
            return state;
        }
    } else if (inst.Case === "T_NIL") {
        return state;
    } else if (s) {
        return writeCFlag((readReg(r, state) >> 32 - n) % 2 !== 0, state);
    } else {
        return state;
    }
}
function shiftSetCR(s, inst, r, rn, state) {
    return shiftSetCI(s, inst, r, readReg(rn, state), state);
}
function setNZ(result, state) {
    return writeZFlag(result === 0, writeNFlag(result < 0, state));
}
function setC(in1, in2, state) {
    return writeCFlag(!in1.add(in2).shr(32).mod(fromBits(2, 0, false)).Equals(fromBits(0, 0, false)), state);
}
function conv64(i) {
    return fromNumber(i, false).and(fromBits(4294967295, 0, false));
}
function setV(in1, in2, state) {
    var cin = conv64(in1 * 2).add(conv64(in2 * 2)).shr(32).mod(fromBits(2, 0, false));
    var cout = conv64(in1).add(conv64(in2)).shr(32).mod(fromBits(2, 0, false));
    return writeVFlag(!cin.Equals(cout), state);
}
function movI(c, s, rd, i, state) {
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, i, arg20_);
            }(function (state_1) {
                return setNZ(i, state_1);
            }(state));
        } else {
            return writeReg(rd, i, state);
        }
    } else {
        return state;
    }
}
function movR(c, s, rd, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return movI(c, s, rd, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return movI(c, s, rd, op2, state_2);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return movI(c, s, rd, op2, state);
        }
    } else {
        return state;
    }
}
function mvnI(c, s, rd, i, state) {
    return movI(c, s, rd, ~i, state);
}
function mvnR(c, s, rd, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return mvnI(c, s, rd, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return mvnI(c, s, rd, op2, state_2);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return mvnI(c, s, rd, op2, state);
        }
    } else {
        return state;
    }
}
function addI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function () {
                var v = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(function () {
                var in1 = readReg(rn, state);
                return function (state_1) {
                    return setV(in1, i, state_1);
                };
            }()(setC(conv64(readReg(rn, state)), conv64(i), setNZ(readReg(rn, state) + i, state))));
        } else {
            return writeReg(rd, readReg(rn, state) + i, state);
        }
    } else {
        return state;
    }
}
function addR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return addI(c, s, rd, rn, op2, state);
}
function adcI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s, readCFlag(state)];

    if (matchValue[0]) {
        if (matchValue[1]) {
            if (matchValue[2]) {
                return function () {
                    var v = readReg(rn, state) + i + 1;
                    return function (arg20_) {
                        return writeReg(rd, v, arg20_);
                    };
                }()(setV(readReg(rn, state), i + 1, setC(conv64(readReg(rn, state)), conv64(i).add(fromBits(1, 0, false)), setNZ(readReg(rn, state) + i + 1, state))));
            } else {
                return function () {
                    var v_1 = readReg(rn, state) + i;
                    return function (arg20__1) {
                        return writeReg(rd, v_1, arg20__1);
                    };
                }()(function () {
                    var in1 = readReg(rn, state);
                    return function (state_1) {
                        return setV(in1, i, state_1);
                    };
                }()(setC(conv64(readReg(rn, state)), conv64(i), setNZ(readReg(rn, state) + i, state))));
            }
        } else if (matchValue[2]) {
            return writeReg(rd, readReg(rn, state) + i + 1, state);
        } else {
            return writeReg(rd, readReg(rn, state) + i, state);
        }
    } else {
        return state;
    }
}
function adcR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return adcI(c, s, rd, rn, op2, state);
}
function subI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function () {
                var v = readReg(rn, state) - i;
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(setV(readReg(rn, state), -i, setC(conv64(readReg(rn, state)), conv64(~i).add(fromBits(1, 0, false)), setNZ(readReg(rn, state) - i, state))));
        } else {
            return writeReg(rd, readReg(rn, state) - i, state);
        }
    } else {
        return state;
    }
}
function subR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return subI(c, s, rd, rn, op2, state);
}
function sbcI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s, readCFlag(state)];

    if (matchValue[0]) {
        if (matchValue[1]) {
            if (matchValue[2]) {
                return function () {
                    var v = readReg(rn, state) - i;
                    return function (arg20_) {
                        return writeReg(rd, v, arg20_);
                    };
                }()(setV(readReg(rn, state), -i, setC(conv64(readReg(rn, state)), conv64(~i).add(fromBits(1, 0, false)), setNZ(readReg(rn, state) - i, state))));
            } else {
                return function () {
                    var v_1 = readReg(rn, state) - i - 1;
                    return function (arg20__1) {
                        return writeReg(rd, v_1, arg20__1);
                    };
                }()(setV(readReg(rn, state), -i - 1, setC(conv64(readReg(rn, state)), conv64(~i), setNZ(readReg(rn, state) - i - 1, state))));
            }
        } else if (matchValue[2]) {
            return writeReg(rd, readReg(rn, state) - i, state);
        } else {
            return writeReg(rd, readReg(rn, state) - i - 1, state);
        }
    } else {
        return state;
    }
}
function sbcR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return sbcI(c, s, rd, rn, op2, state);
}
function rsbI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function () {
                var v = i - readReg(rn, state);
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(function () {
                var in1 = -readReg(rn, state);
                return function (state_1) {
                    return setV(in1, i, state_1);
                };
            }()(setC(conv64(~readReg(rn, state)).add(fromBits(1, 0, false)), conv64(i), setNZ(i - readReg(rn, state), state))));
        } else {
            return writeReg(rd, i - readReg(rn, state), state);
        }
    } else {
        return state;
    }
}
function rsbR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return rsbI(c, s, rd, rn, op2, state);
}
function rscI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s, readCFlag(state)];

    if (matchValue[0]) {
        if (matchValue[1]) {
            if (matchValue[2]) {
                return function () {
                    var v = i - readReg(rn, state);
                    return function (arg20_) {
                        return writeReg(rd, v, arg20_);
                    };
                }()(function () {
                    var in1 = -readReg(rn, state);
                    return function (state_1) {
                        return setV(in1, i, state_1);
                    };
                }()(setC(conv64(~readReg(rn, state)).add(fromBits(1, 0, false)), conv64(i), setNZ(i - readReg(rn, state), state))));
            } else {
                return function () {
                    var v_1 = i - readReg(rn, state) - 1;
                    return function (arg20__1) {
                        return writeReg(rd, v_1, arg20__1);
                    };
                }()(function () {
                    var in1_1 = -readReg(rn, state) - 1;
                    return function (state_2) {
                        return setV(in1_1, i, state_2);
                    };
                }()(setC(conv64(~readReg(rn, state)), conv64(i), setNZ(i - readReg(rn, state) - 1, state))));
            }
        } else if (matchValue[2]) {
            return writeReg(rd, i - readReg(rn, state), state);
        } else {
            return writeReg(rd, i - readReg(rn, state) - 1, state);
        }
    } else {
        return state;
    }
}
function rscR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return rscI(c, s, rd, rn, op2, state);
}
function cmpI(c, rn, i, state) {
    var matchValue = c(state);

    if (matchValue) {
        return setV(readReg(rn, state), -i, setC(conv64(readReg(rn, state)), conv64(~i).add(fromBits(1, 0, false)), setNZ(readReg(rn, state) - i, state)));
    } else {
        return state;
    }
}
function cmpR(c, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return cmpI(c, rn, op2, state);
}
function cmnI(c, rn, i, state) {
    var matchValue = c(state);

    if (matchValue) {
        return function () {
            var in1 = readReg(rn, state);
            return function (state_1) {
                return setV(in1, i, state_1);
            };
        }()(setC(conv64(readReg(rn, state)), conv64(i), setNZ(readReg(rn, state) + i, state)));
    } else {
        return state;
    }
}
function cmnR(c, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);
    return cmnI(c, rn, op2, state);
}
function mulR(c, s, rd, rm, rs, state) {
    var res = readReg(rm, state) * readReg(rs, state);
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, res, arg20_);
            }(function (state_1) {
                return setNZ(res, state_1);
            }(state));
        } else {
            return writeReg(rd, res, state);
        }
    } else {
        return state;
    }
}
function mlaR(c, s, rd, rm, rs, rn, state) {
    var res = readReg(rm, state) * readReg(rs, state) + readReg(rn, state);
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, res, arg20_);
            }(function (state_1) {
                return setNZ(res, state_1);
            }(state));
        } else {
            return writeReg(rd, res, state);
        }
    } else {
        return state;
    }
}
function andI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function () {
                var v = readReg(rn, state) & i;
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(setNZ(readReg(rn, state) & i, state));
        } else {
            return writeReg(rd, readReg(rn, state) & i, state);
        }
    } else {
        return state;
    }
}
function andR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return andI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return andI(c, s, rd, rn, op2, state_2);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return andI(c, s, rd, rn, op2, state);
        }
    } else {
        return state;
    }
}
function orrI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function () {
                var v = readReg(rn, state) | i;
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(setNZ(readReg(rn, state) | i, state));
        } else {
            return writeReg(rd, readReg(rn, state) | i, state);
        }
    } else {
        return state;
    }
}
function orrR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return orrI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return orrI(c, s, rd, rn, op2, state_2);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return orrI(c, s, rd, rn, op2, state);
        }
    } else {
        return state;
    }
}
function eorI(c, s, rd, rn, i, state) {
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function () {
                var v = readReg(rn, state) ^ i;
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(setNZ(readReg(rn, state) ^ i, state));
        } else {
            return writeReg(rd, readReg(rn, state) ^ i, state);
        }
    } else {
        return state;
    }
}
function eorR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return eorI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return eorI(c, s, rd, rn, op2, state_2);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return eorI(c, s, rd, rn, op2, state);
        }
    } else {
        return state;
    }
}
function bicI(c, s, rd, rn, i, state) {
    return andI(c, s, rd, rn, ~i, state);
}
function bicR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return bicI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return bicI(c, s, rd, rn, op2, state_2);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return bicI(c, s, rd, rn, op2, state);
        }
    } else {
        return state;
    }
}
function tstI(c, rn, i, state) {
    var matchValue = c(state);

    if (matchValue) {
        return setNZ(readReg(rn, state) & i, state);
    } else {
        return state;
    }
}
function tstR(c, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return tstI(c, rn, op2, state_1);
            }(shiftSetCI(true, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return tstI(c, rn, op2, state_2);
            }(shiftSetCR(true, rsinst, rm, nORrn, state));
        } else {
            return tstI(c, rn, op2, state);
        }
    } else {
        return state;
    }
}
function teqI(c, rn, i, state) {
    var matchValue = c(state);

    if (matchValue) {
        return setNZ(readReg(rn, state) ^ i, state);
    } else {
        return state;
    }
}
function teqR(c, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype === "i" ? shiftI(rsinst, rm, nORrn, state) : rstype === "r" ? shiftR(rsinst, rm, nORrn, state) : readReg(rm, state);

    if (c(state)) {
        if (rstype === "i") {
            return function (state_1) {
                return teqI(c, rn, op2, state_1);
            }(shiftSetCI(true, rsinst, rm, nORrn, state));
        } else if (rstype === "r") {
            return function (state_2) {
                return teqI(c, rn, op2, state_2);
            }(shiftSetCR(true, rsinst, rm, nORrn, state));
        } else {
            return teqI(c, rn, op2, state);
        }
    } else {
        return state;
    }
}

function lslR(c, s, rd, rm, rn, state) {
    var op2 = shiftR(new shiftOp("T_LSL", []), rm, rn, state);
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, op2, arg20_);
            }(function () {
                var inst = new shiftOp("T_LSL", []);
                return function (state_1) {
                    return shiftSetCR(s, inst, rm, rn, state_1);
                };
            }()(function (state_2) {
                return setNZ(op2, state_2);
            }(state)));
        } else {
            return writeReg(rd, op2, state);
        }
    } else {
        return state;
    }
}
function lsrR(c, s, rd, rm, rn, state) {
    var op2 = shiftR(new shiftOp("T_LSR", []), rm, rn, state);
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, op2, arg20_);
            }(function () {
                var inst = new shiftOp("T_LSR", []);
                return function (state_1) {
                    return shiftSetCR(s, inst, rm, rn, state_1);
                };
            }()(function (state_2) {
                return setNZ(op2, state_2);
            }(state)));
        } else {
            return writeReg(rd, op2, state);
        }
    } else {
        return state;
    }
}
function asrR(c, s, rd, rm, rn, state) {
    var op2 = shiftR(new shiftOp("T_ASR", []), rm, rn, state);
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, op2, arg20_);
            }(function () {
                var inst = new shiftOp("T_ASR", []);
                return function (state_1) {
                    return shiftSetCR(s, inst, rm, rn, state_1);
                };
            }()(function (state_2) {
                return setNZ(op2, state_2);
            }(state)));
        } else {
            return writeReg(rd, op2, state);
        }
    } else {
        return state;
    }
}
function rorR(c, s, rd, rm, rn, state) {
    var op2 = shiftR(new shiftOp("T_ROR", []), rm, rn, state);
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, op2, arg20_);
            }(function () {
                var inst = new shiftOp("T_ROR", []);
                return function (state_1) {
                    return shiftSetCR(s, inst, rm, rn, state_1);
                };
            }()(function (state_2) {
                return setNZ(op2, state_2);
            }(state)));
        } else {
            return writeReg(rd, op2, state);
        }
    } else {
        return state;
    }
}
function rrxR(c, s, rd, rm, state) {
    var op2 = shiftR(new shiftOp("T_RRX", []), rm, 1, state);
    var matchValue = [c(state), s];

    if (matchValue[0]) {
        if (matchValue[1]) {
            return function (arg20_) {
                return writeReg(rd, op2, arg20_);
            }(function () {
                var inst = new shiftOp("T_RRX", []);
                var rn = 1;
                return function (state_1) {
                    return shiftSetCR(s, inst, rm, rn, state_1);
                };
            }()(function (state_2) {
                return setNZ(op2, state_2);
            }(state)));
        } else {
            return writeReg(rd, op2, state);
        }
    } else {
        return state;
    }
}
function b(c, label, state) {
    if (c(state)) {
        return writePC(label, state);
    } else {
        return state;
    }
}
function bl(c, label, state) {
    if (c(state)) {
        return function (arg10_) {
            return writePC(label, arg10_);
        }(writeReg(14, readPC(state), state));
    } else {
        return state;
    }
}
function bx(c, rm, state) {
    if (c(state)) {
        return writePC(readReg(rm, state) - 4, state);
    } else {
        return state;
    }
}


function adr(c, rd, label, state) {
    if (c(state)) {
        return writeReg(rd, label, state);
    } else {
        return state;
    }
}





























function endI(c, finalInstAddr, state) {
    if (c(state)) {
        return writePC(finalInstAddr, state);
    } else {
        return state;
    }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instruction = function () {
    function Instruction(caseName, fields) {
        _classCallCheck$2(this, Instruction);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$2(Instruction, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Parse.Parser.Instruction",
                interfaces: ["FSharpUnion"],
                cases: {
                    EndRef: ["function"],
                    Instr: ["function"],
                    LabelRef: ["function"],
                    Terminate: []
                }
            };
        }
    }]);

    return Instruction;
}();
setType("Parse.Parser.Instruction", Instruction);
function parser(tokLst) {
    var branchRef = function branchRef(c) {
        return function (s) {
            return function (bInst) {
                return function (labels) {
                    var matchValue = tryFind$$1(s, labels);

                    if (matchValue == null) {
                        return new _Error("Err", [fsFormat("Label undefined: %s.")(function (x) {
                            return x;
                        })(s)]);
                    } else {
                        return new _Error("Ok", [new Instruction("Instr", [bInst(c)(matchValue - 4)])]);
                    }
                };
            };
        };
    };

    var adrRef = function adrRef(c_1) {
        return function (rd) {
            return function (s_1) {
                return function (labels_1) {
                    var matchValue_1 = tryFind$$1(s_1, labels_1);

                    if (matchValue_1 == null) {
                        return new _Error("Err", [fsFormat("Label undefined: %s.")(function (x) {
                            return x;
                        })(s_1)]);
                    } else {
                        return new _Error("Ok", [new Instruction("Instr", [function (state) {
                            return adr(c_1, rd, matchValue_1, state);
                        }])]);
                    }
                };
            };
        };
    };

    var endRef = function endRef(c_2) {
        return function (endMem) {
            return new Instruction("Instr", [function () {
                var finalInstAddr = endMem - 4;
                return function (state_1) {
                    return endI(c_2, finalInstAddr, state_1);
                };
            }()]);
        };
    };

    var resolveRefs = function resolveRefs(labels_2) {
        return function (endMem_1) {
            return function (outLst) {
                return function (_arg1) {
                    resolveRefs: while (true) {
                        if (_arg1.tail == null) {
                            return new _Error("Ok", [outLst]);
                        } else if (_arg1.head[1].Case === "LabelRef") {
                            var matchValue_2 = _arg1.head[1].Fields[0](labels_2);

                            if (matchValue_2.Case === "Err") {
                                return new _Error("Err", [matchValue_2.Fields[0]]);
                            } else {
                                labels_2 = labels_2;
                                endMem_1 = endMem_1;
                                outLst = append$1(outLst, ofArray([[_arg1.head[0], matchValue_2.Fields[0]]]));
                                _arg1 = _arg1.tail;
                                continue resolveRefs;
                            }
                        } else if (_arg1.head[1].Case === "EndRef") {
                            labels_2 = labels_2;
                            var $var1048 = endMem_1;
                            outLst = append$1(outLst, ofArray([[_arg1.head[0], _arg1.head[1].Fields[0](endMem_1)]]));
                            _arg1 = _arg1.tail;
                            endMem_1 = $var1048;
                            continue resolveRefs;
                        } else {
                            labels_2 = labels_2;
                            endMem_1 = endMem_1;
                            outLst = append$1(outLst, ofArray([_arg1.head]));
                            _arg1 = _arg1.tail;
                            continue resolveRefs;
                        }
                    }
                };
            };
        };
    };

    var parseRec = function parseRec(mem) {
        return function (labels_3) {
            return function (outLst_1) {
                return function (_arg2) {
                    var _loop = function _loop() {
                        var $var1037 = _arg2.tail == null ? [81] : _arg2.head.Case === "T_MOV" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [0, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [1, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [2, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : [3, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [3, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [3, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [3, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [3, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [3, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_MVN" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [4, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [5, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [6, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : [7, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [7, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [7, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [7, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [7, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [7, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_ADD" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [8, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [9, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [10, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [11, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [11, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [11, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [11, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [11, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [11, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_ADC" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [12, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [13, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [14, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [15, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [15, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [15, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [15, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [15, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [15, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_SUB" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [16, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [17, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [18, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [19, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [19, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [19, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [19, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [19, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [19, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_SBC" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [20, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [21, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [22, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [23, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [23, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [23, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [23, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [23, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [23, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_RSB" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [24, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [25, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [26, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [27, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [27, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [27, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [27, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [27, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [27, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_RSC" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [28, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [29, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [30, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [31, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [31, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [31, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [31, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [31, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [31, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_MUL" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [32, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_MLA" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [33, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_AND" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [34, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [35, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [36, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [37, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [37, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [37, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [37, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [37, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [37, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_ORR" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [38, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [39, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [40, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [41, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [41, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [41, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [41, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [41, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [41, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_EOR" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [42, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [43, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [44, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [45, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [45, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [45, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [45, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [45, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [45, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_BIC" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [46, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [47, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [48, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [49, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [49, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [49, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [49, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [49, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [49, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_CMP" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [50, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [51, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [52, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : [53, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [53, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [53, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [53, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [53, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [53, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_CMN" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [54, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [55, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [56, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : [57, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [57, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [57, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [57, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [57, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [57, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_TST" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [58, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [59, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [60, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : [61, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [61, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [61, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [61, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [61, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [61, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_TEQ" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [62, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [63, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [64, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : [65, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [65, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [65, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [65, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [65, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [65, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_CLZ" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_INT" ? [66, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? _arg2.tail.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [67, _arg2.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : _arg2.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [68, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.tail.tail, _arg2.tail.tail.tail.tail.tail.head.Fields[0]] : [69, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [69, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [69, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [69, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [69, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [69, _arg2.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_SHIFT" ? _arg2.head.Fields[0].Case === "T_LSL" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [70, _arg2.head.Fields[1][0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1][1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Fields[0].Case === "T_LSR" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [71, _arg2.head.Fields[1][0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1][1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Fields[0].Case === "T_ASR" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [72, _arg2.head.Fields[1][0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1][1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Fields[0].Case === "T_ROR" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [73, _arg2.head.Fields[1][0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1][1], _arg2.tail.tail.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Fields[0].Case === "T_RRX" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_REG" ? [74, _arg2.head.Fields[1][0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.head.Fields[1][1], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_B" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_LABEL" ? [75, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_BL" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_LABEL" ? [76, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_BX" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? [77, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_ADR" ? _arg2.tail.tail != null ? _arg2.tail.head.Case === "T_REG" ? _arg2.tail.tail.tail != null ? _arg2.tail.tail.head.Case === "T_COMMA" ? _arg2.tail.tail.tail.tail != null ? _arg2.tail.tail.tail.head.Case === "T_LABEL" ? [78, _arg2.head.Fields[0], _arg2.tail.head.Fields[0], _arg2.tail.tail.tail.head.Fields[0], _arg2.tail.tail.tail.tail] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : [83, _arg2.tail, _arg2.head] : _arg2.head.Case === "T_END" ? [79, _arg2.head.Fields[0], _arg2.tail] : _arg2.head.Case === "T_LABEL" ? [80, _arg2.head.Fields[0], _arg2.tail] : _arg2.head.Case === "T_ERROR" ? [82, _arg2.head.Fields[0], _arg2.tail] : [83, _arg2.tail, _arg2.head];

                        switch ($var1037[0]) {
                            case 0:
                                var $var1049 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_2) {
                                    return movI($var1037[1], $var1037[4], $var1037[3], $var1037[2], state_2);
                                }])]]));
                                _arg2 = $var1037[5];
                                mem = $var1049;
                                return "continue|parseRec";

                            case 1:
                                var $var1050 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype = "i";
                                    return function (state_3) {
                                        return movR($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[7], $var1037[2], rstype, state_3);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1050;
                                return "continue|parseRec";

                            case 2:
                                var $var1051 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_1 = "r";
                                    return function (state_4) {
                                        return movR($var1037[1], $var1037[5], $var1037[2], $var1037[3], $var1037[7], $var1037[4], rstype_1, state_4);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1051;
                                return "continue|parseRec";

                            case 3:
                                var $var1052 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst = new shiftOp("T_LSL", []);
                                    var nORrn = 0;
                                    var rstype_2 = "i";
                                    return function (state_5) {
                                        return movR($var1037[1], $var1037[4], $var1037[2], $var1037[3], rsinst, nORrn, rstype_2, state_5);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1052;
                                return "continue|parseRec";

                            case 4:
                                var $var1053 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_6) {
                                    return mvnI($var1037[1], $var1037[4], $var1037[3], $var1037[2], state_6);
                                }])]]));
                                _arg2 = $var1037[5];
                                mem = $var1053;
                                return "continue|parseRec";

                            case 5:
                                var $var1054 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_3 = "i";
                                    return function (state_7) {
                                        return mvnR($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[7], $var1037[2], rstype_3, state_7);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1054;
                                return "continue|parseRec";

                            case 6:
                                var $var1055 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_4 = "r";
                                    return function (state_8) {
                                        return mvnR($var1037[1], $var1037[5], $var1037[2], $var1037[3], $var1037[7], $var1037[4], rstype_4, state_8);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1055;
                                return "continue|parseRec";

                            case 7:
                                var $var1056 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_1 = new shiftOp("T_LSL", []);
                                    var nORrn_1 = 0;
                                    var rstype_5 = "i";
                                    return function (state_9) {
                                        return mvnR($var1037[1], $var1037[4], $var1037[2], $var1037[3], rsinst_1, nORrn_1, rstype_5, state_9);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1056;
                                return "continue|parseRec";

                            case 8:
                                var $var1057 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_10) {
                                    return addI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_10);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1057;
                                return "continue|parseRec";

                            case 9:
                                var $var1058 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_6 = "i";
                                    return function (state_11) {
                                        return addR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_6, state_11);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1058;
                                return "continue|parseRec";

                            case 10:
                                var $var1059 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_7 = "r";
                                    return function (state_12) {
                                        return addR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_7, state_12);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1059;
                                return "continue|parseRec";

                            case 11:
                                var $var1060 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_2 = new shiftOp("T_LSL", []);
                                    var nORrn_2 = 0;
                                    var rstype_8 = "i";
                                    return function (state_13) {
                                        return addR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_2, nORrn_2, rstype_8, state_13);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1060;
                                return "continue|parseRec";

                            case 12:
                                var $var1061 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_14) {
                                    return adcI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_14);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1061;
                                return "continue|parseRec";

                            case 13:
                                var $var1062 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_9 = "i";
                                    return function (state_15) {
                                        return adcR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_9, state_15);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1062;
                                return "continue|parseRec";

                            case 14:
                                var $var1063 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_10 = "r";
                                    return function (state_16) {
                                        return adcR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_10, state_16);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1063;
                                return "continue|parseRec";

                            case 15:
                                var $var1064 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_3 = new shiftOp("T_LSL", []);
                                    var nORrn_3 = 0;
                                    var rstype_11 = "i";
                                    return function (state_17) {
                                        return adcR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_3, nORrn_3, rstype_11, state_17);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1064;
                                return "continue|parseRec";

                            case 16:
                                var $var1065 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_18) {
                                    return subI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_18);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1065;
                                return "continue|parseRec";

                            case 17:
                                var $var1066 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_12 = "i";
                                    return function (state_19) {
                                        return subR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_12, state_19);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1066;
                                return "continue|parseRec";

                            case 18:
                                var $var1067 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_13 = "r";
                                    return function (state_20) {
                                        return subR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_13, state_20);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1067;
                                return "continue|parseRec";

                            case 19:
                                var $var1068 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_4 = new shiftOp("T_LSL", []);
                                    var nORrn_4 = 0;
                                    var rstype_14 = "i";
                                    return function (state_21) {
                                        return subR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_4, nORrn_4, rstype_14, state_21);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1068;
                                return "continue|parseRec";

                            case 20:
                                var $var1069 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_22) {
                                    return sbcI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_22);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1069;
                                return "continue|parseRec";

                            case 21:
                                var $var1070 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_15 = "i";
                                    return function (state_23) {
                                        return sbcR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_15, state_23);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1070;
                                return "continue|parseRec";

                            case 22:
                                var $var1071 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_16 = "r";
                                    return function (state_24) {
                                        return sbcR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_16, state_24);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1071;
                                return "continue|parseRec";

                            case 23:
                                var $var1072 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_5 = new shiftOp("T_LSL", []);
                                    var nORrn_5 = 0;
                                    var rstype_17 = "i";
                                    return function (state_25) {
                                        return sbcR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_5, nORrn_5, rstype_17, state_25);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1072;
                                return "continue|parseRec";

                            case 24:
                                var $var1073 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_26) {
                                    return rsbI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_26);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1073;
                                return "continue|parseRec";

                            case 25:
                                var $var1074 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_18 = "i";
                                    return function (state_27) {
                                        return rsbR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_18, state_27);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1074;
                                return "continue|parseRec";

                            case 26:
                                var $var1075 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_19 = "r";
                                    return function (state_28) {
                                        return rsbR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_19, state_28);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1075;
                                return "continue|parseRec";

                            case 27:
                                var $var1076 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_6 = new shiftOp("T_LSL", []);
                                    var nORrn_6 = 0;
                                    var rstype_20 = "i";
                                    return function (state_29) {
                                        return rsbR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_6, nORrn_6, rstype_20, state_29);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1076;
                                return "continue|parseRec";

                            case 28:
                                var $var1077 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_30) {
                                    return rscI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_30);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1077;
                                return "continue|parseRec";

                            case 29:
                                var $var1078 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_21 = "i";
                                    return function (state_31) {
                                        return rscR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_21, state_31);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1078;
                                return "continue|parseRec";

                            case 30:
                                var $var1079 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_22 = "r";
                                    return function (state_32) {
                                        return rscR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_22, state_32);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1079;
                                return "continue|parseRec";

                            case 31:
                                var $var1080 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_7 = new shiftOp("T_LSL", []);
                                    var nORrn_7 = 0;
                                    var rstype_23 = "i";
                                    return function (state_33) {
                                        return rscR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_7, nORrn_7, rstype_23, state_33);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1080;
                                return "continue|parseRec";

                            case 32:
                                var $var1081 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_34) {
                                    return mulR($var1037[1], $var1037[5], $var1037[2], $var1037[3], $var1037[4], state_34);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1081;
                                return "continue|parseRec";

                            case 33:
                                var $var1082 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_35) {
                                    return mlaR($var1037[1], $var1037[6], $var1037[2], $var1037[3], $var1037[5], $var1037[4], state_35);
                                }])]]));
                                _arg2 = $var1037[7];
                                mem = $var1082;
                                return "continue|parseRec";

                            case 34:
                                var $var1083 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_36) {
                                    return andI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_36);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1083;
                                return "continue|parseRec";

                            case 35:
                                var $var1084 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_24 = "i";
                                    return function (state_37) {
                                        return andR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_24, state_37);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1084;
                                return "continue|parseRec";

                            case 36:
                                var $var1085 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_25 = "r";
                                    return function (state_38) {
                                        return andR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_25, state_38);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1085;
                                return "continue|parseRec";

                            case 37:
                                var $var1086 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_8 = new shiftOp("T_LSL", []);
                                    var nORrn_8 = 0;
                                    var rstype_26 = "i";
                                    return function (state_39) {
                                        return andR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_8, nORrn_8, rstype_26, state_39);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1086;
                                return "continue|parseRec";

                            case 38:
                                var $var1087 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_40) {
                                    return orrI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_40);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1087;
                                return "continue|parseRec";

                            case 39:
                                var $var1088 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_27 = "i";
                                    return function (state_41) {
                                        return orrR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_27, state_41);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1088;
                                return "continue|parseRec";

                            case 40:
                                var $var1089 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_28 = "r";
                                    return function (state_42) {
                                        return orrR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_28, state_42);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1089;
                                return "continue|parseRec";

                            case 41:
                                var $var1090 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_9 = new shiftOp("T_LSL", []);
                                    var nORrn_9 = 0;
                                    var rstype_29 = "i";
                                    return function (state_43) {
                                        return orrR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_9, nORrn_9, rstype_29, state_43);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1090;
                                return "continue|parseRec";

                            case 42:
                                var $var1091 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_44) {
                                    return eorI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_44);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1091;
                                return "continue|parseRec";

                            case 43:
                                var $var1092 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_30 = "i";
                                    return function (state_45) {
                                        return eorR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_30, state_45);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1092;
                                return "continue|parseRec";

                            case 44:
                                var $var1093 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_31 = "r";
                                    return function (state_46) {
                                        return eorR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_31, state_46);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1093;
                                return "continue|parseRec";

                            case 45:
                                var $var1094 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_10 = new shiftOp("T_LSL", []);
                                    var nORrn_10 = 0;
                                    var rstype_32 = "i";
                                    return function (state_47) {
                                        return eorR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_10, nORrn_10, rstype_32, state_47);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1094;
                                return "continue|parseRec";

                            case 46:
                                var $var1095 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_48) {
                                    return bicI($var1037[1], $var1037[5], $var1037[3], $var1037[4], $var1037[2], state_48);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1095;
                                return "continue|parseRec";

                            case 47:
                                var $var1096 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_33 = "i";
                                    return function (state_49) {
                                        return bicR($var1037[1], $var1037[6], $var1037[3], $var1037[5], $var1037[4], $var1037[8], $var1037[2], rstype_33, state_49);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1096;
                                return "continue|parseRec";

                            case 48:
                                var $var1097 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_34 = "r";
                                    return function (state_50) {
                                        return bicR($var1037[1], $var1037[6], $var1037[2], $var1037[4], $var1037[3], $var1037[8], $var1037[5], rstype_34, state_50);
                                    };
                                }()])]]));
                                _arg2 = $var1037[7];
                                mem = $var1097;
                                return "continue|parseRec";

                            case 49:
                                var $var1098 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_11 = new shiftOp("T_LSL", []);
                                    var nORrn_11 = 0;
                                    var rstype_35 = "i";
                                    return function (state_51) {
                                        return bicR($var1037[1], $var1037[5], $var1037[2], $var1037[4], $var1037[3], rsinst_11, nORrn_11, rstype_35, state_51);
                                    };
                                }()])]]));
                                _arg2 = $var1037[6];
                                mem = $var1098;
                                return "continue|parseRec";

                            case 50:
                                var $var1099 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_52) {
                                    return cmpI($var1037[1], $var1037[3], $var1037[2], state_52);
                                }])]]));
                                _arg2 = $var1037[4];
                                mem = $var1099;
                                return "continue|parseRec";

                            case 51:
                                var $var1100 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_36 = "i";
                                    return function (state_53) {
                                        return cmpR($var1037[1], $var1037[4], $var1037[3], $var1037[6], $var1037[2], rstype_36, state_53);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1100;
                                return "continue|parseRec";

                            case 52:
                                var $var1101 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_37 = "r";
                                    return function (state_54) {
                                        return cmpR($var1037[1], $var1037[3], $var1037[2], $var1037[6], $var1037[4], rstype_37, state_54);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1101;
                                return "continue|parseRec";

                            case 53:
                                var $var1102 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_12 = new shiftOp("T_LSL", []);
                                    var nORrn_12 = 0;
                                    var rstype_38 = "i";
                                    return function (state_55) {
                                        return cmpR($var1037[1], $var1037[3], $var1037[2], rsinst_12, nORrn_12, rstype_38, state_55);
                                    };
                                }()])]]));
                                _arg2 = $var1037[4];
                                mem = $var1102;
                                return "continue|parseRec";

                            case 54:
                                var $var1103 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_56) {
                                    return cmnI($var1037[1], $var1037[3], $var1037[2], state_56);
                                }])]]));
                                _arg2 = $var1037[4];
                                mem = $var1103;
                                return "continue|parseRec";

                            case 55:
                                var $var1104 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_39 = "i";
                                    return function (state_57) {
                                        return cmnR($var1037[1], $var1037[4], $var1037[3], $var1037[6], $var1037[2], rstype_39, state_57);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1104;
                                return "continue|parseRec";

                            case 56:
                                var $var1105 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_40 = "r";
                                    return function (state_58) {
                                        return cmnR($var1037[1], $var1037[3], $var1037[2], $var1037[6], $var1037[4], rstype_40, state_58);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1105;
                                return "continue|parseRec";

                            case 57:
                                var $var1106 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_13 = new shiftOp("T_LSL", []);
                                    var nORrn_13 = 0;
                                    var rstype_41 = "i";
                                    return function (state_59) {
                                        return cmnR($var1037[1], $var1037[3], $var1037[2], rsinst_13, nORrn_13, rstype_41, state_59);
                                    };
                                }()])]]));
                                _arg2 = $var1037[4];
                                mem = $var1106;
                                return "continue|parseRec";

                            case 58:
                                var $var1107 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_60) {
                                    return tstI($var1037[1], $var1037[3], $var1037[2], state_60);
                                }])]]));
                                _arg2 = $var1037[4];
                                mem = $var1107;
                                return "continue|parseRec";

                            case 59:
                                var $var1108 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_42 = "i";
                                    return function (state_61) {
                                        return tstR($var1037[1], $var1037[4], $var1037[3], $var1037[6], $var1037[2], rstype_42, state_61);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1108;
                                return "continue|parseRec";

                            case 60:
                                var $var1109 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_43 = "r";
                                    return function (state_62) {
                                        return tstR($var1037[1], $var1037[3], $var1037[2], $var1037[6], $var1037[4], rstype_43, state_62);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1109;
                                return "continue|parseRec";

                            case 61:
                                var $var1110 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_14 = new shiftOp("T_LSL", []);
                                    var nORrn_14 = 0;
                                    var rstype_44 = "i";
                                    return function (state_63) {
                                        return tstR($var1037[1], $var1037[3], $var1037[2], rsinst_14, nORrn_14, rstype_44, state_63);
                                    };
                                }()])]]));
                                _arg2 = $var1037[4];
                                mem = $var1110;
                                return "continue|parseRec";

                            case 62:
                                var $var1111 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_64) {
                                    return teqI($var1037[1], $var1037[3], $var1037[2], state_64);
                                }])]]));
                                _arg2 = $var1037[4];
                                mem = $var1111;
                                return "continue|parseRec";

                            case 63:
                                var $var1112 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_45 = "i";
                                    return function (state_65) {
                                        return teqR($var1037[1], $var1037[4], $var1037[3], $var1037[6], $var1037[2], rstype_45, state_65);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1112;
                                return "continue|parseRec";

                            case 64:
                                var $var1113 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_46 = "r";
                                    return function (state_66) {
                                        return teqR($var1037[1], $var1037[3], $var1037[2], $var1037[6], $var1037[4], rstype_46, state_66);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1113;
                                return "continue|parseRec";

                            case 65:
                                var $var1114 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_15 = new shiftOp("T_LSL", []);
                                    var nORrn_15 = 0;
                                    var rstype_47 = "i";
                                    return function (state_67) {
                                        return teqR($var1037[1], $var1037[3], $var1037[2], rsinst_15, nORrn_15, rstype_47, state_67);
                                    };
                                }()])]]));
                                _arg2 = $var1037[4];
                                mem = $var1114;
                                return "continue|parseRec";

                            case 66:
                                var $var1115 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_68) {
                                    return tstI($var1037[1], $var1037[3], $var1037[2], state_68);
                                }])]]));
                                _arg2 = $var1037[4];
                                mem = $var1115;
                                return "continue|parseRec";

                            case 67:
                                var $var1116 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_48 = "i";
                                    return function (state_69) {
                                        return tstR($var1037[1], $var1037[4], $var1037[3], $var1037[6], $var1037[2], rstype_48, state_69);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1116;
                                return "continue|parseRec";

                            case 68:
                                var $var1117 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rstype_49 = "r";
                                    return function (state_70) {
                                        return tstR($var1037[1], $var1037[3], $var1037[2], $var1037[6], $var1037[4], rstype_49, state_70);
                                    };
                                }()])]]));
                                _arg2 = $var1037[5];
                                mem = $var1117;
                                return "continue|parseRec";

                            case 69:
                                var $var1118 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function () {
                                    var rsinst_16 = new shiftOp("T_LSL", []);
                                    var nORrn_16 = 0;
                                    var rstype_50 = "i";
                                    return function (state_71) {
                                        return tstR($var1037[1], $var1037[3], $var1037[2], rsinst_16, nORrn_16, rstype_50, state_71);
                                    };
                                }()])]]));
                                _arg2 = $var1037[4];
                                mem = $var1118;
                                return "continue|parseRec";

                            case 70:
                                var $var1119 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_72) {
                                    return lslR($var1037[1], $var1037[5], $var1037[2], $var1037[3], $var1037[4], state_72);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1119;
                                return "continue|parseRec";

                            case 71:
                                var $var1120 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_73) {
                                    return lsrR($var1037[1], $var1037[5], $var1037[2], $var1037[3], $var1037[4], state_73);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1120;
                                return "continue|parseRec";

                            case 72:
                                var $var1121 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_74) {
                                    return asrR($var1037[1], $var1037[5], $var1037[2], $var1037[3], $var1037[4], state_74);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1121;
                                return "continue|parseRec";

                            case 73:
                                var $var1122 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_75) {
                                    return rorR($var1037[1], $var1037[5], $var1037[2], $var1037[3], $var1037[4], state_75);
                                }])]]));
                                _arg2 = $var1037[6];
                                mem = $var1122;
                                return "continue|parseRec";

                            case 74:
                                var $var1123 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_76) {
                                    return rrxR($var1037[1], $var1037[4], $var1037[2], $var1037[3], state_76);
                                }])]]));
                                _arg2 = $var1037[5];
                                mem = $var1123;
                                return "continue|parseRec";

                            case 75:
                                var $var1124 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("LabelRef", [branchRef($var1037[1])($var1037[2])(function (c_3) {
                                    return function (label) {
                                        return function (state_77) {
                                            return b(c_3, label, state_77);
                                        };
                                    };
                                })])]]));
                                _arg2 = $var1037[3];
                                mem = $var1124;
                                return "continue|parseRec";

                            case 76:
                                var $var1125 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("LabelRef", [branchRef($var1037[1])($var1037[2])(function (c_4) {
                                    return function (label_1) {
                                        return function (state_78) {
                                            return bl(c_4, label_1, state_78);
                                        };
                                    };
                                })])]]));
                                _arg2 = $var1037[3];
                                mem = $var1125;
                                return "continue|parseRec";

                            case 77:
                                var $var1126 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("Instr", [function (state_79) {
                                    return bx($var1037[1], $var1037[2], state_79);
                                }])]]));
                                _arg2 = $var1037[3];
                                mem = $var1126;
                                return "continue|parseRec";

                            case 78:
                                var $var1127 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("LabelRef", [adrRef($var1037[1])($var1037[2])($var1037[3])])]]));
                                _arg2 = $var1037[4];
                                mem = $var1127;
                                return "continue|parseRec";

                            case 79:
                                var $var1128 = mem + 4;
                                labels_3 = labels_3;
                                outLst_1 = append$1(outLst_1, ofArray([[mem, new Instruction("EndRef", [endRef($var1037[1])])]]));
                                _arg2 = $var1037[2];
                                mem = $var1128;
                                return "continue|parseRec";

                            case 80:
                                var $var1129 = mem;
                                labels_3 = add($var1037[1], mem, labels_3);
                                outLst_1 = outLst_1;
                                _arg2 = $var1037[2];
                                mem = $var1129;
                                return "continue|parseRec";

                            case 81:
                                return {
                                    v: resolveRefs(labels_3)(mem)(new List())(append$1(outLst_1, ofArray([[mem, new Instruction("Terminate", [])]])))
                                };

                            case 82:
                                return {
                                    v: new _Error("Err", [fsFormat("Invalid input string: %s.")(function (x) {
                                        return x;
                                    })($var1037[1])])
                                };

                            case 83:
                                return {
                                    v: new _Error("Err", [fsFormat("Unexpected token: %A. Followed by: %s.")(function (x) {
                                        return x;
                                    })($var1037[2])(errorList($var1037[1]))])
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

    var matchValue_3 = parseRec(0)(create(null, new GenericComparer(compare)))(new List())(tokLst);

    if (matchValue_3.Case === "Err") {
        return new _Error("Err", [matchValue_3.Fields[0]]);
    } else {
        return new _Error("Ok", [create(matchValue_3.Fields[0], new GenericComparer(compare))]);
    }
}

function newState(oldState, inString) {
    return wrapErr(function (instr) {
        return interpret(oldState, instr);
    }, parser(tokenise(inString)));
}

(function (args) {
    var inString = "MOV R1, #5";
    var oState = initState;
    var nState = newState(oState, inString);

    if (nState.Case === "Err") {
        fsFormat("%s")(function (x) {
            console.log(x);
        })(nState.Fields[0]);
    } else {
        fsFormat("Valid = %A")(function (x) {
            console.log(x);
        })(readReg(0, nState.Fields[0]));
    }

    return 0;
})(process.argv.slice(2));

})));

//# sourceMappingURL=main_fable.js.map