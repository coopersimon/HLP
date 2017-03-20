(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

function saveCodeMirror(myEditor) {
	myEditor.save();
	myEditor.addLineClass(3, 'background', 'line-error');
	return document.getElementById("editor").value;
}

function initializeCodeMirror() {
	var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		lineNumbers: true
	});
	return editor;
}

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
function Tuple(ts) {
    return new NonDeclaredType("Tuple", "Tuple", ts);
}
function GenericParam(definition) {
    return new NonDeclaredType("GenericParam", definition);
}

function makeGeneric(typeDef, genArgs) {
    return new NonDeclaredType("GenericType", typeDef, genArgs);
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
function hash(x) {
    var s = JSON.stringify(x);
    var h = 5381, i = 0, len = s.length;
    while (i < len) {
        h = (h * 33) ^ s.charCodeAt(i++);
    }
    return h;
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

function ofArray(args, base) {
    var acc = base || new List$1();
    for (var i = args.length - 1; i >= 0; i--) {
        acc = new List$1(args[i], acc);
    }
    return acc;
}
var List$1 = (function () {
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
        return new List$1(x, acc);
    }, xs, new List$1());
}





function concat$1(xs) {
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






function initialize$1(n, f) {
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
function map$2(f, xs) {
    return delay(function () { return unfold(function (iter) {
        var cur = iter.next();
        return !cur.done ? [f(cur.value), iter] : null;
    }, xs[Symbol.iterator]()); });
}
function mapIndexed$1(f, xs) {
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



function replicate$1(n, x) {
    return initialize$1(n, function () { return x; });
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
        return new List$1();
    }
}
function tree_mkIterator(s) {
    return { stack: tree_collapseLHS(new List$1(s, new List$1())), started: false };
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
        return map$2(function (kv) { return kv[0]; }, this);
    };
    FMap.prototype.values = function () {
        return map$2(function (kv) { return kv[1]; }, this);
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

function append$$1(xs, ys) {
    return fold(function (acc, x) { return new List$1(x, acc); }, ys, reverse$$1(xs));
}


// TODO: should be xs: Iterable<List<T>>

function filter$$1(f, xs) {
    return reverse$$1(fold(function (acc, x) { return f(x) ? new List$1(x, acc) : acc; }, new List$1(), xs));
}


function map$1(f, xs) {
    return reverse$$1(fold(function (acc, x) { return new List$1(f(x), acc); }, new List$1(), xs));
}

function partition$$1(f, xs) {
    return fold(function (acc, x) {
        var lacc = acc[0], racc = acc[1];
        return f(x) ? [new List$1(x, lacc), racc] : [lacc, new List$1(x, racc)];
    }, [new List$1(), new List$1()], reverse$$1(xs));
}

function reverse$$1(xs) {
    return fold(function (acc, x) { return new List$1(x, acc); }, new List$1(), xs);
}


/* ToDo: instance unzip() */

/* ToDo: instance unzip3() */

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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Html = function () {
   function Html(caseName, fields) {
      _classCallCheck(this, Html);

      this.Case = caseName;
      this.Fields = fields;
   }

   _createClass(Html, [{
      key: _Symbol.reflection,
      value: function () {
         return {
            type: "FsHtml.Html",
            interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
            cases: {
               Attr: ["string", "string"],
               Elem: ["string", makeGeneric(List$1, {
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

               var _target2 = function _target2(content, tag) {
                  var isAttr = function isAttr(_arg1) {
                     if (_arg1.Case === "Attr") {
                        return true;
                     } else {
                        return false;
                     }
                  };

                  var patternInput = function (list) {
                     return partition$$1(isAttr, list);
                  }(content);

                  var attrs = patternInput[0].Equals(new List$1()) ? "" : " " + join(" ", toList(delay(function () {
                     return map$2(function (attr) {
                        return toString$$1(0)(attr);
                     }, patternInput[0]);
                  })));

                  if (patternInput[1].tail == null) {
                     return spaces + "<" + tag + attrs + "/>\r\n";
                  } else {
                     return spaces + "<" + tag + attrs + ">\r\n" + join("", toList(delay(function () {
                        return map$2(function (e) {
                           return toString$$1(indent + 1)(e);
                        }, patternInput[1]);
                     }))) + spaces + "</" + tag + ">\r\n";
                  }
               };

               if (elem_1.Case === "Elem") {
                  if (elem_1.Fields[1].tail != null) {
                     if (elem_1.Fields[1].head.Case === "Text") {
                        if (elem_1.Fields[1].tail.tail == null) {
                           var s = elem_1.Fields[1].head.Fields[0];
                           var tag = elem_1.Fields[0];
                           return spaces + "<" + tag + ">" + s + "</" + tag + ">\r\n";
                        } else {
                           return _target2(elem_1.Fields[1], elem_1.Fields[0]);
                        }
                     } else {
                        return _target2(elem_1.Fields[1], elem_1.Fields[0]);
                     }
                  } else {
                     return _target2(elem_1.Fields[1], elem_1.Fields[0]);
                  }
               } else if (elem_1.Case === "Text") {
                  var text = elem_1.Fields[0];
                  return spaces + text + "\r\n";
               } else {
                  var name = elem_1.Fields[0];
                  var value = elem_1.Fields[1];
                  return name + "=\"" + value + "\"";
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





var div = function () {
   var tag = "div";
   return function (content) {
      return elem(tag, content);
   };
}();
var br = function () {
   var tag = "br";
   return function (content) {
      return elem(tag, content);
   };
}();


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
   return ofArray([new Html("Text", [toString(s)])]);
}
function op_PercentEquals(name, value) {
   return new Html("Attr", [name, value]);
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StateHandle = function () {
    function StateHandle(caseName, fields) {
        _classCallCheck$1(this, StateHandle);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$1(StateHandle, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Common.State.StateHandle",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    S: [FArray("number"), "boolean", "boolean", "boolean", "boolean", makeGeneric(FMap, {
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
    var regs = Int32Array.from(replicate$1(16, 0));
    return new StateHandle("S", [regs, false, false, false, false, create(null, new GenericComparer(function (x, y) {
        return x < y ? -1 : x > y ? 1 : 0;
    }))]);
}();
var initStateVisual = function () {
    var regs0to12 = Int32Array.from(replicate$1(13, 0));
    var regs13to15 = new Int32Array([-16777216, 0, 0]);
    var regs = Int32Array.from(concat$1(ofArray([regs0to12, regs13to15])));
    return new StateHandle("S", [regs, false, false, false, false, create(null, new GenericComparer(function (x, y) {
        return x < y ? -1 : x > y ? 1 : 0;
    }))]);
}();
function readReg(r, _arg1) {
    return _arg1.Fields[0][r];
}
function writeReg(r, v, _arg1) {
    var newRegs = Int32Array.from(mapIndexed$1(function (i, x) {
        if (r === i) {
            return v;
        } else {
            return x;
        }
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
function readPC(_arg1) {
    return _arg1.Fields[0][15];
}
function writePC(v, _arg1) {
    var newRegs = Int32Array.from(mapIndexed$1(function (i, x) {
        if (i === 15) {
            return v;
        } else {
            return x;
        }
    }, _arg1.Fields[0]));
    return new StateHandle("S", [newRegs, _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], _arg1.Fields[5]]);
}
function incPC(_arg1) {
    var newRegs = Int32Array.from(mapIndexed$1(function (i, x) {
        if (i === 15) {
            return x + 4;
        } else {
            return x;
        }
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
function readMem(addr, _arg1) {
    var matchValue = tryFind$1(addr, _arg1.Fields[5]);

    if (matchValue == null) {
        return 0;
    } else {
        return matchValue;
    }
}
function writeMem(addr, v, _arg1) {
    var newMem = add(addr, v, _arg1.Fields[5]);
    return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], newMem]);
}

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Error = function () {
    function _Error(caseName, fields) {
        _classCallCheck$2(this, _Error);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$2(_Error, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Common.Error.Error",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    Err: ["number", "string"],
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
        return new _Error("Err", [x.Fields[0], x.Fields[1]]);
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
    var matchValue = tryFind$1(readPC(state), instr);

    if (matchValue == null) {
        return new _Error("Err", [0, fsFormat("Instruction does not exist at address %A.")(function (x) {
            return x;
        })(readPC(state))]);
    } else if (matchValue.Case === "Terminate") {
        var l = matchValue.Fields[0];
        return new _Error("Ok", [[l, state]]);
    } else if (matchValue.Case === "LabelRef") {
        return new _Error("Err", [0, "Unresolved label (branch/adr) - this should have been resolved in the parser."]);
    } else if (matchValue.Case === "EndRef") {
        return new _Error("Err", [0, "Unresolved termination - this should have been resolved in the parser."]);
    } else {
        var f = matchValue.Fields[1];
        var _l = matchValue.Fields[0];
        return interpret(incPC(f(state)), instr);
    }
}

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var shiftOp = function () {
    function shiftOp(caseName, fields) {
        _classCallCheck$4(this, shiftOp);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$4(shiftOp, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Common.Types.shiftOp",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    T_ASR: [],
                    T_LSL: [],
                    T_LSR: [],
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
setType("Common.Types.shiftOp", shiftOp);
var stackOrder = function () {
    function stackOrder(caseName, fields) {
        _classCallCheck$4(this, stackOrder);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$4(stackOrder, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Common.Types.stackOrder",
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
setType("Common.Types.stackOrder", stackOrder);
var opType = function () {
    function opType(caseName, fields) {
        _classCallCheck$4(this, opType);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$4(opType, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Common.Types.opType",
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
setType("Common.Types.opType", opType);

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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return movI(c, s, rd, op2, state_1);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return movI(c, s, rd, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        }
    } else {
        return state;
    }
}
function mvnI(c, s, rd, i, state) {
    return movI(c, s, rd, ~i, state);
}
function mvnR(c, s, rd, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return mvnI(c, s, rd, op2, state_1);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return mvnI(c, s, rd, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
                    var v = readReg(rn, state) - i - 1;
                    return function (arg20_) {
                        return writeReg(rd, v, arg20_);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
                    var v = i - readReg(rn, state) - 1;
                    return function (arg20_) {
                        return writeReg(rd, v, arg20_);
                    };
                }()(function () {
                    var in1 = -readReg(rn, state) - 1;
                    return function (state_1) {
                        return setV(in1, i, state_1);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return andI(c, s, rd, rn, op2, state_1);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return andI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return orrI(c, s, rd, rn, op2, state_1);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return orrI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return eorI(c, s, rd, rn, op2, state_1);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return eorI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
        }
    } else {
        return state;
    }
}
function bicI(c, s, rd, rn, i, state) {
    return andI(c, s, rd, rn, ~i, state);
}
function bicR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return bicI(c, s, rd, rn, op2, state_1);
            }(shiftSetCR(s, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return bicI(c, s, rd, rn, op2, state_1);
            }(shiftSetCI(s, rsinst, rm, nORrn, state));
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return tstI(c, rn, op2, state_1);
            }(shiftSetCR(true, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return tstI(c, rn, op2, state_1);
            }(shiftSetCI(true, rsinst, rm, nORrn, state));
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
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        if (rstype.Case === "T_R") {
            return function (state_1) {
                return teqI(c, rn, op2, state_1);
            }(shiftSetCR(true, rsinst, rm, nORrn, state));
        } else {
            return function (state_1) {
                return teqI(c, rn, op2, state_1);
            }(shiftSetCI(true, rsinst, rm, nORrn, state));
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
            }()(function (state_1) {
                return setNZ(op2, state_1);
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
            }()(function (state_1) {
                return setNZ(op2, state_1);
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
            }()(function (state_1) {
                return setNZ(op2, state_1);
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
            }()(function (state_1) {
                return setNZ(op2, state_1);
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
            }()(function (state_1) {
                return setNZ(op2, state_1);
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
function ldrWL(c, rd, label, state) {
    if (c(state)) {
        return writeReg(rd, readMem(label, state), state);
    } else {
        return state;
    }
}
function ldrBL(c, rd, label, state) {
    if (c(state)) {
        return writeReg(rd, readMem(label, state) & 255, state);
    } else {
        return state;
    }
}
function ldrWbI(c, inc, rd, rn, i, state) {
    if (c(state)) {
        if (inc) {
            return function () {
                var v = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeReg(rn, v, arg20_);
                };
            }()(function () {
                var v = readMem(readReg(rn, state) + i, state);
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(state));
        } else {
            return function () {
                var v = readMem(readReg(rn, state) + i, state);
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(state);
        }
    } else {
        return state;
    }
}
function ldrWbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return ldrWbI(c, inc, rd, rn, op2, state);
    } else {
        return state;
    }
}
function ldrWaI(c, rd, rn, i, state) {
    if (c(state)) {
        return function () {
            var v = readReg(rn, state) + i;
            return function (arg20_) {
                return writeReg(rn, v, arg20_);
            };
        }()(function () {
            var v = readMem(readReg(rn, state), state);
            return function (arg20_) {
                return writeReg(rd, v, arg20_);
            };
        }()(state));
    } else {
        return state;
    }
}
function ldrWaR(c, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return ldrWaI(c, rd, rn, op2, state);
    } else {
        return state;
    }
}
function ldrBbI(c, inc, rd, rn, i, state) {
    if (c(state)) {
        if (inc) {
            return function () {
                var v = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeReg(rn, v, arg20_);
                };
            }()(function () {
                var v = readMem(readReg(rn, state) + i & 255, state);
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(state));
        } else {
            return function () {
                var v = readMem(readReg(rn, state) + i & 255, state);
                return function (arg20_) {
                    return writeReg(rd, v, arg20_);
                };
            }()(state);
        }
    } else {
        return state;
    }
}
function ldrBbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return ldrBbI(c, inc, rd, rn, op2, state);
    } else {
        return state;
    }
}
function ldrBaI(c, rd, rn, i, state) {
    if (c(state)) {
        return function () {
            var v = readReg(rn, state) + i;
            return function (arg20_) {
                return writeReg(rn, v, arg20_);
            };
        }()(function () {
            var v = readMem(readReg(rn, state) & 255, state);
            return function (arg20_) {
                return writeReg(rd, v, arg20_);
            };
        }()(state));
    } else {
        return state;
    }
}
function ldrBaR(c, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return ldrBaI(c, rd, rn, op2, state);
    } else {
        return state;
    }
}
function strWbI(c, inc, rd, rn, i, state) {
    if (c(state)) {
        if (inc) {
            return function () {
                var v = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeReg(rn, v, arg20_);
                };
            }()(writeMem(readReg(rn, state) + i, readReg(rd, state), state));
        } else {
            return writeMem(readReg(rn, state) + i, readReg(rd, state), state);
        }
    } else {
        return state;
    }
}
function strWbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return strWbI(c, inc, rd, rn, op2, state);
    } else {
        return state;
    }
}
function strWaI(c, rd, rn, i, state) {
    if (c(state)) {
        return function () {
            var v = readReg(rn, state) + i;
            return function (arg20_) {
                return writeReg(rn, v, arg20_);
            };
        }()(writeMem(readReg(rn, state), readReg(rd, state), state));
    } else {
        return state;
    }
}
function strWaR(c, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return strWaI(c, rd, rn, op2, state);
    } else {
        return state;
    }
}
function strBbI(c, inc, rd, rn, i, state) {
    var memVal = readMem(readReg(rn, state) + i, state);
    var regVal = readReg(rd, state);
    var writeVal = ~255 & memVal | 255 & regVal;

    if (c(state)) {
        if (inc) {
            return function () {
                var v = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeReg(rn, v, arg20_);
                };
            }()(function () {
                var addr = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeMem(addr, writeVal, arg20_);
                };
            }()(state));
        } else {
            return function () {
                var addr = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeMem(addr, writeVal, arg20_);
                };
            }()(state);
        }
    } else {
        return state;
    }
}
function strBbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return strBbI(c, inc, rd, rn, op2, state);
    } else {
        return state;
    }
}
function strBaI(c, rd, rn, i, state) {
    var memVal = readMem(readReg(rn, state), state);
    var regVal = readReg(rd, state);
    var writeVal = ~255 & memVal | 255 & regVal;

    if (c(state)) {
        return function () {
            var v = readReg(rn, state) + i;
            return function (arg20_) {
                return writeReg(rn, v, arg20_);
            };
        }()(function () {
            var addr = readReg(rn, state);
            return function (arg20_) {
                return writeMem(addr, writeVal, arg20_);
            };
        }()(state));
    } else {
        return state;
    }
}
function strBaR(c, rd, rn, rm, rsinst, nORrn, rstype, state) {
    var op2 = rstype.Case === "T_R" ? shiftR(rsinst, rm, nORrn, state) : shiftI(rsinst, rm, nORrn, state);

    if (c(state)) {
        return strBaI(c, rd, rn, op2, state);
    } else {
        return state;
    }
}
function ldmIA(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem + 4)(reglist_1.tail)(function () {
                        var v = readMem(mem, state_1);
                        return function (arg20_) {
                            return writeReg(reglist_1.head, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem)(reglist)(write ? writeReg(rn, startMem + reglist.length * 4, state) : state);
    } else {
        return state;
    }
}
function ldmIB(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem + 4)(reglist_1.tail)(function () {
                        var v = readMem(mem, state_1);
                        return function (arg20_) {
                            return writeReg(reglist_1.head, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem + 4)(reglist)(write ? writeReg(rn, startMem + (reglist.length + 1) * 4, state) : state);
    } else {
        return state;
    }
}
function ldmDA(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem - 4)(reglist_1.tail)(function () {
                        var v = readMem(mem, state_1);
                        return function (arg20_) {
                            return writeReg(reglist_1.head, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem)(reglist)(write ? writeReg(rn, startMem - reglist.length * 4, state) : state);
    } else {
        return state;
    }
}
function ldmDB(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem - 4)(reglist_1.tail)(function () {
                        var v = readMem(mem, state_1);
                        return function (arg20_) {
                            return writeReg(reglist_1.head, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem - 4)(reglist)(write ? writeReg(rn, startMem - (reglist.length + 1) * 4, state) : state);
    } else {
        return state;
    }
}
function stmIA(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem + 4)(reglist_1.tail)(function () {
                        var v = readReg(reglist_1.head, state_1);
                        return function (arg20_) {
                            return writeMem(mem, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem)(reglist)(write ? writeReg(rn, startMem + reglist.length * 4, state) : state);
    } else {
        return state;
    }
}
function stmIB(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem + 4)(reglist_1.tail)(function () {
                        var v = readReg(reglist_1.head, state_1);
                        return function (arg20_) {
                            return writeMem(mem, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem + 4)(reglist)(write ? writeReg(rn, startMem + (reglist.length + 1) * 4, state) : state);
    } else {
        return state;
    }
}
function stmDA(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem - 4)(reglist_1.tail)(function () {
                        var v = readReg(reglist_1.head, state_1);
                        return function (arg20_) {
                            return writeMem(mem, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem)(reglist)(write ? writeReg(rn, startMem - reglist.length * 4, state) : state);
    } else {
        return state;
    }
}
function stmDB(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                if (reglist_1.tail == null) {
                    return state_1;
                } else {
                    return loop(mem - 4)(reglist_1.tail)(function () {
                        var v = readReg(reglist_1.head, state_1);
                        return function (arg20_) {
                            return writeMem(mem, v, arg20_);
                        };
                    }()(state_1));
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem - 4)(reglist)(write ? writeReg(rn, startMem - (reglist.length + 1) * 4, state) : state);
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

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instruction = function () {
    function Instruction(caseName, fields) {
        _classCallCheck$3(this, Instruction);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$3(Instruction, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Parse.Parser.Instruction",
                interfaces: ["FSharpUnion"],
                cases: {
                    EndRef: ["function"],
                    Instr: ["number", "function"],
                    LabelRef: ["function"],
                    Terminate: ["number"]
                }
            };
        }
    }]);

    return Instruction;
}();
setType("Parse.Parser.Instruction", Instruction);

function resolveRefs(labels, endMem, instrLst) {
    var resolveRec = function resolveRec(labels_1) {
        return function (endMem_1) {
            return function (outLst) {
                return function (_arg1) {
                    if (_arg1.tail == null) {
                        return new _Error("Ok", [outLst]);
                    } else if (_arg1.head[1].Case === "LabelRef") {
                        var f = _arg1.head[1].Fields[0];
                        var m = _arg1.head[0];
                        var t = _arg1.tail;
                        {
                            var matchValue = f(labels_1);

                            if (matchValue.Case === "Err") {
                                return new _Error("Err", [matchValue.Fields[0], matchValue.Fields[1]]);
                            } else {
                                return resolveRec(labels_1)(endMem_1)(append$$1(outLst, ofArray([[m, matchValue.Fields[0]]])))(t);
                            }
                        }
                    } else if (_arg1.head[1].Case === "EndRef") {
                        var _f = _arg1.head[1].Fields[0];
                        var _m = _arg1.head[0];
                        var _t = _arg1.tail;
                        return resolveRec(labels_1)(endMem_1)(append$$1(outLst, ofArray([[_m, _f(endMem_1)]])))(_t);
                    } else {
                        var h = _arg1.head;
                        var _t2 = _arg1.tail;
                        return resolveRec(labels_1)(endMem_1)(append$$1(outLst, ofArray([h])))(_t2);
                    }
                };
            };
        };
    };

    return resolveRec(labels)(endMem)(new List$1())(instrLst);
}

function regList(tokLst) {
    var regRange = function regRange(r1) {
        return function (r2) {
            return function (outLst) {
                var matchValue = r1 < r2;

                if (matchValue) {
                    return regRange(r1 + 1)(r2)(append$$1(outLst, ofArray([r1])));
                } else if (r1 === r2) {
                    return new _Error("Ok", [append$$1(outLst, ofArray([r1]))]);
                } else if (matchValue) {
                    throw new Error("/Users/raviwoods/Google_Drive/ICComp/Uni_Year_3/HLP/HLP/FABLE/FABLEProject/src/fs/Parser.fs", 37, 18);
                } else {
                    return new _Error("Err", [0, "Register range invalid."]);
                }
            };
        };
    };

    var regRec = function regRec(outLst) {
        return function (_arg1) {
            var _target5 = function _target5(t, tok) {
                return new _Error("Err", [0, fsFormat("Unexpected token: %A. Followed by: %s.")(function (x) {
                    return x;
                })(tok)(errorList(t))]);
            };

            if (_arg1.tail == null) {
                return new _Error("Err", [0, fsFormat("Incomplete register range.")(function (x) {
                    return x;
                })]);
            } else if (_arg1.head.Case === "T_REG") {
                if (_arg1.tail.tail != null) {
                    if (_arg1.tail.head.Case === "T_COMMA") {
                        var r = _arg1.head.Fields[0];
                        var t = _arg1.tail.tail;
                        return regRec(append$$1(outLst, ofArray([r])))(t);
                    } else if (_arg1.tail.head.Case === "T_DASH") {
                        if (_arg1.tail.tail.tail != null) {
                            if (_arg1.tail.tail.head.Case === "T_REG") {
                                if (_arg1.tail.tail.tail.tail != null) {
                                    if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                        var r1 = _arg1.head.Fields[0];
                                        var r2 = _arg1.tail.tail.head.Fields[0];
                                        var _t3 = _arg1.tail.tail.tail.tail;
                                        {
                                            var matchValue = regRange(r1)(r2)(new List$1());

                                            if (matchValue.Case === "Err") {
                                                return new _Error("Err", [0, matchValue.Fields[1]]);
                                            } else {
                                                return regRec(append$$1(outLst, matchValue.Fields[0]))(_t3);
                                            }
                                        }
                                    } else if (_arg1.tail.tail.tail.head.Case === "T_R_CBR") {
                                        var _r = _arg1.head.Fields[0];
                                        var _r2 = _arg1.tail.tail.head.Fields[0];
                                        var _t4 = _arg1.tail.tail.tail.tail;
                                        {
                                            var _matchValue = regRange(_r)(_r2)(new List$1());

                                            if (_matchValue.Case === "Err") {
                                                return new _Error("Err", [0, _matchValue.Fields[1]]);
                                            } else {
                                                return new _Error("Ok", [[append$$1(outLst, _matchValue.Fields[0]), _t4]]);
                                            }
                                        }
                                    } else {
                                        return _target5(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target5(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target5(_arg1.tail, _arg1.head);
                            }
                        } else {
                            return _target5(_arg1.tail, _arg1.head);
                        }
                    } else if (_arg1.tail.head.Case === "T_R_CBR") {
                        var _r3 = _arg1.head.Fields[0];
                        var _t5 = _arg1.tail.tail;
                        return new _Error("Ok", [[append$$1(outLst, ofArray([_r3])), _t5]]);
                    } else {
                        return _target5(_arg1.tail, _arg1.head);
                    }
                } else {
                    return _target5(_arg1.tail, _arg1.head);
                }
            } else if (_arg1.head.Case === "T_ERROR") {
                var s = _arg1.head.Fields[0];
                var _t6 = _arg1.tail;
                return new _Error("Err", [0, fsFormat("Invalid input string: %s.")(function (x) {
                    return x;
                })(s)]);
            } else {
                return _target5(_arg1.tail, _arg1.head);
            }
        };
    };

    return regRec(new List$1())(tokLst);
}

function parser(tokLst) {
    var branchRef = function branchRef(l) {
        return function (c) {
            return function (s) {
                return function (bInst) {
                    return function (labels) {
                        var matchValue = tryFind$1(s, labels);

                        if (matchValue == null) {
                            return new _Error("Err", [l, fsFormat("Label undefined: %s.")(function (x) {
                                return x;
                            })(s)]);
                        } else {
                            return new _Error("Ok", [new Instruction("Instr", [l, bInst(c)(matchValue - 4)])]);
                        }
                    };
                };
            };
        };
    };

    var lsaRef = function lsaRef(l) {
        return function (c) {
            return function (rd) {
                return function (s) {
                    return function (inst) {
                        return function (labels) {
                            var matchValue = tryFind$1(s, labels);

                            if (matchValue == null) {
                                return new _Error("Err", [l, fsFormat("Label undefined: %s.")(function (x) {
                                    return x;
                                })(s)]);
                            } else {
                                return new _Error("Ok", [new Instruction("Instr", [l, inst(c)(rd)(matchValue)])]);
                            }
                        };
                    };
                };
            };
        };
    };

    var endRef = function endRef(l) {
        return function (c) {
            return function (endMem) {
                return new Instruction("Instr", [l, function () {
                    var finalInstAddr = endMem - 4;
                    return function (state) {
                        return endI(c, finalInstAddr, state);
                    };
                }()]);
            };
        };
    };

    var parseRec = function parseRec(m) {
        return function (l) {
            return function (labels) {
                return function (outLst) {
                    return function (_arg1) {
                        var _target3 = function _target3(c, rd, rm, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return movR(c, s, rd, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target7 = function _target7(c, rd, rm, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return mvnR(c, s, rd, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target11 = function _target11(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return addR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target15 = function _target15(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return adcR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target19 = function _target19(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return subR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target23 = function _target23(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return sbcR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target27 = function _target27(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return rsbR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target31 = function _target31(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return rscR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target37 = function _target37(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return andR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target41 = function _target41(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return orrR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target45 = function _target45(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return eorR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target49 = function _target49(c, rd, rm, rn, s, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return bicR(c, s, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target53 = function _target53(c, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return cmpR(c, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target57 = function _target57(c, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return cmnR(c, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target61 = function _target61(c, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return tstR(c, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target65 = function _target65(c, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return teqR(c, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target69 = function _target69(c, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return tstR(c, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target82 = function _target82(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return ldrWaR(c, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target86 = function _target86(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return ldrBaR(c, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target88 = function _target88(c, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var i = 0;
                                return function (state) {
                                    return ldrWbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target90 = function _target90(c, i, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                return function (state) {
                                    return ldrWbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target92 = function _target92(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return ldrWbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target94 = function _target94(c, i, rd, rm, rn, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return ldrWbR(c, inc, rd, rn, rm, z, i, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target96 = function _target96(c, rd, rm, rn, rs, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_R", []);
                                return function (state) {
                                    return ldrWbR(c, inc, rd, rn, rm, z, rs, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target98 = function _target98(c, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var i = 0;
                                return function (state) {
                                    return ldrBbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target100 = function _target100(c, i, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                return function (state) {
                                    return ldrBbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target102 = function _target102(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return ldrBbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target104 = function _target104(c, i, rd, rm, rn, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return ldrBbR(c, inc, rd, rn, rm, z, i, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target106 = function _target106(c, rd, rm, rn, rs, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_R", []);
                                return function (state) {
                                    return ldrBbR(c, inc, rd, rn, rm, z, rs, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target110 = function _target110(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return strWaR(c, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target114 = function _target114(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return strBaR(c, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target115 = function _target115(c, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var i = 0;
                                return function (state) {
                                    return strWbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target117 = function _target117(c, i, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                return function (state) {
                                    return strWbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target119 = function _target119(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return strWbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target121 = function _target121(c, i, rd, rm, rn, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return strWbR(c, inc, rd, rn, rm, z, i, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target123 = function _target123(c, rd, rm, rn, rs, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_R", []);
                                return function (state) {
                                    return strWbR(c, inc, rd, rn, rm, z, rs, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target124 = function _target124(c, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var i = 0;
                                return function (state) {
                                    return strBbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target126 = function _target126(c, i, rd, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                return function (state) {
                                    return strBbI(c, inc, rd, rn, i, state);
                                };
                            }()])]])))(t);
                        };

                        var _target128 = function _target128(c, rd, rm, rn, t) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rsinst = new shiftOp("T_LSL", []);
                                var nORrn = 0;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return strBbR(c, inc, rd, rn, rm, rsinst, nORrn, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target130 = function _target130(c, i, rd, rm, rn, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_I", []);
                                return function (state) {
                                    return strBbR(c, inc, rd, rn, rm, z, i, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target132 = function _target132(c, rd, rm, rn, rs, t, z) {
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                var inc = false;
                                var rstype = new opType("T_R", []);
                                return function (state) {
                                    return strBbR(c, inc, rd, rn, rm, z, rs, rstype, state);
                                };
                            }()])]])))(t);
                        };

                        var _target152 = function _target152(s, t) {
                            return parseRec(m)(l)(add(s, m, labels))(outLst)(t);
                        };

                        var _target156 = function _target156(t, tok) {
                            return new _Error("Err", [l, fsFormat("Unexpected token: %A. Followed by: %s.")(function (x) {
                                return x;
                            })(tok)(errorList(t))]);
                        };

                        if (_arg1.tail == null) {
                            return resolveRefs(labels, m, append$$1(outLst, ofArray([[m, new Instruction("Terminate", [l])]])));
                        } else if (_arg1.head.Case === "T_MOV") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                                    var c = _arg1.head.Fields[0];
                                                    var i = _arg1.tail.tail.tail.head.Fields[0];
                                                    var rd = _arg1.tail.head.Fields[0];
                                                    var s = _arg1.head.Fields[1];
                                                    var t = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                        return movI(c, s, rd, i, state);
                                                    }])]])))(t);
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            var _c = _arg1.head.Fields[0];
                                                                            var _i = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _rd = _arg1.tail.head.Fields[0];
                                                                            var rm = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _s = _arg1.head.Fields[1];
                                                                            var _t7 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var z = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_I", []);
                                                                                return function (state) {
                                                                                    return movR(_c, _s, _rd, rm, z, _i, rstype, state);
                                                                                };
                                                                            }()])]])))(_t7);
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            var _c2 = _arg1.head.Fields[0];
                                                                            var _rd2 = _arg1.tail.head.Fields[0];
                                                                            var _rm = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var rs = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _s2 = _arg1.head.Fields[1];
                                                                            var _t8 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_R", []);
                                                                                return function (state) {
                                                                                    return movR(_c2, _s2, _rd2, _rm, _z, rs, rstype, state);
                                                                                };
                                                                            }()])]])))(_t8);
                                                                        } else {
                                                                            return _target3(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target3(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target3(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                                }
                                                            } else {
                                                                return _target3(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                            }
                                                        } else {
                                                            return _target3(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                        }
                                                    } else {
                                                        return _target3(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_MVN") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                                    var _c3 = _arg1.head.Fields[0];
                                                    var _i2 = _arg1.tail.tail.tail.head.Fields[0];
                                                    var _rd3 = _arg1.tail.head.Fields[0];
                                                    var _s3 = _arg1.head.Fields[1];
                                                    var _t9 = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                        return mvnI(_c3, _s3, _rd3, _i2, state);
                                                    }])]])))(_t9);
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            var _c4 = _arg1.head.Fields[0];
                                                                            var _i3 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _rd4 = _arg1.tail.head.Fields[0];
                                                                            var _rm2 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _s4 = _arg1.head.Fields[1];
                                                                            var _t10 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z2 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_I", []);
                                                                                return function (state) {
                                                                                    return mvnR(_c4, _s4, _rd4, _rm2, _z2, _i3, rstype, state);
                                                                                };
                                                                            }()])]])))(_t10);
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            var _c5 = _arg1.head.Fields[0];
                                                                            var _rd5 = _arg1.tail.head.Fields[0];
                                                                            var _rm3 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rs = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _s5 = _arg1.head.Fields[1];
                                                                            var _t11 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z3 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_R", []);
                                                                                return function (state) {
                                                                                    return mvnR(_c5, _s5, _rd5, _rm3, _z3, _rs, rstype, state);
                                                                                };
                                                                            }()])]])))(_t11);
                                                                        } else {
                                                                            return _target7(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target7(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target7(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                                }
                                                            } else {
                                                                return _target7(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                            }
                                                        } else {
                                                            return _target7(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                        }
                                                    } else {
                                                        return _target7(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_ADD") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c6 = _arg1.head.Fields[0];
                                                                    var _i4 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd6 = _arg1.tail.head.Fields[0];
                                                                    var rn = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s6 = _arg1.head.Fields[1];
                                                                    var _t12 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return addI(_c6, _s6, _rd6, rn, _i4, state);
                                                                    }])]])))(_t12);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c7 = _arg1.head.Fields[0];
                                                                                            var _i5 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd7 = _arg1.tail.head.Fields[0];
                                                                                            var _rm4 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s7 = _arg1.head.Fields[1];
                                                                                            var _t13 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z4 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return addR(_c7, _s7, _rd7, _rn, _rm4, _z4, _i5, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t13);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c8 = _arg1.head.Fields[0];
                                                                                            var _rd8 = _arg1.tail.head.Fields[0];
                                                                                            var _rm5 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn2 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs2 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s8 = _arg1.head.Fields[1];
                                                                                            var _t14 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z5 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return addR(_c8, _s8, _rd8, _rn2, _rm5, _z5, _rs2, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t14);
                                                                                        } else {
                                                                                            return _target11(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target11(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target11(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target11(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target11(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target11(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_ADC") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c9 = _arg1.head.Fields[0];
                                                                    var _i6 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd9 = _arg1.tail.head.Fields[0];
                                                                    var _rn3 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s9 = _arg1.head.Fields[1];
                                                                    var _t15 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return adcI(_c9, _s9, _rd9, _rn3, _i6, state);
                                                                    }])]])))(_t15);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c10 = _arg1.head.Fields[0];
                                                                                            var _i7 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd10 = _arg1.tail.head.Fields[0];
                                                                                            var _rm6 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn4 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s10 = _arg1.head.Fields[1];
                                                                                            var _t16 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z6 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return adcR(_c10, _s10, _rd10, _rn4, _rm6, _z6, _i7, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t16);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c11 = _arg1.head.Fields[0];
                                                                                            var _rd11 = _arg1.tail.head.Fields[0];
                                                                                            var _rm7 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn5 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs3 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s11 = _arg1.head.Fields[1];
                                                                                            var _t17 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z7 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return adcR(_c11, _s11, _rd11, _rn5, _rm7, _z7, _rs3, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t17);
                                                                                        } else {
                                                                                            return _target15(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target15(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target15(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target15(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target15(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target15(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_SUB") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c12 = _arg1.head.Fields[0];
                                                                    var _i8 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd12 = _arg1.tail.head.Fields[0];
                                                                    var _rn6 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s12 = _arg1.head.Fields[1];
                                                                    var _t18 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return subI(_c12, _s12, _rd12, _rn6, _i8, state);
                                                                    }])]])))(_t18);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c13 = _arg1.head.Fields[0];
                                                                                            var _i9 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd13 = _arg1.tail.head.Fields[0];
                                                                                            var _rm8 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn7 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s13 = _arg1.head.Fields[1];
                                                                                            var _t19 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z8 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return subR(_c13, _s13, _rd13, _rn7, _rm8, _z8, _i9, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t19);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c14 = _arg1.head.Fields[0];
                                                                                            var _rd14 = _arg1.tail.head.Fields[0];
                                                                                            var _rm9 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn8 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs4 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s14 = _arg1.head.Fields[1];
                                                                                            var _t20 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z9 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return subR(_c14, _s14, _rd14, _rn8, _rm9, _z9, _rs4, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t20);
                                                                                        } else {
                                                                                            return _target19(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target19(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target19(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target19(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target19(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target19(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_SBC") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c15 = _arg1.head.Fields[0];
                                                                    var _i10 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd15 = _arg1.tail.head.Fields[0];
                                                                    var _rn9 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s15 = _arg1.head.Fields[1];
                                                                    var _t21 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return sbcI(_c15, _s15, _rd15, _rn9, _i10, state);
                                                                    }])]])))(_t21);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c16 = _arg1.head.Fields[0];
                                                                                            var _i11 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd16 = _arg1.tail.head.Fields[0];
                                                                                            var _rm10 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn10 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s16 = _arg1.head.Fields[1];
                                                                                            var _t22 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z10 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return sbcR(_c16, _s16, _rd16, _rn10, _rm10, _z10, _i11, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t22);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c17 = _arg1.head.Fields[0];
                                                                                            var _rd17 = _arg1.tail.head.Fields[0];
                                                                                            var _rm11 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn11 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs5 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s17 = _arg1.head.Fields[1];
                                                                                            var _t23 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z11 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return sbcR(_c17, _s17, _rd17, _rn11, _rm11, _z11, _rs5, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t23);
                                                                                        } else {
                                                                                            return _target23(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target23(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target23(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target23(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target23(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target23(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_RSB") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c18 = _arg1.head.Fields[0];
                                                                    var _i12 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd18 = _arg1.tail.head.Fields[0];
                                                                    var _rn12 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s18 = _arg1.head.Fields[1];
                                                                    var _t24 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return rsbI(_c18, _s18, _rd18, _rn12, _i12, state);
                                                                    }])]])))(_t24);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c19 = _arg1.head.Fields[0];
                                                                                            var _i13 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd19 = _arg1.tail.head.Fields[0];
                                                                                            var _rm12 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn13 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s19 = _arg1.head.Fields[1];
                                                                                            var _t25 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z12 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return rsbR(_c19, _s19, _rd19, _rn13, _rm12, _z12, _i13, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t25);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c20 = _arg1.head.Fields[0];
                                                                                            var _rd20 = _arg1.tail.head.Fields[0];
                                                                                            var _rm13 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn14 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs6 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s20 = _arg1.head.Fields[1];
                                                                                            var _t26 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z13 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return rsbR(_c20, _s20, _rd20, _rn14, _rm13, _z13, _rs6, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t26);
                                                                                        } else {
                                                                                            return _target27(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target27(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target27(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target27(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target27(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target27(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_RSC") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c21 = _arg1.head.Fields[0];
                                                                    var _i14 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd21 = _arg1.tail.head.Fields[0];
                                                                    var _rn15 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s21 = _arg1.head.Fields[1];
                                                                    var _t27 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return rscI(_c21, _s21, _rd21, _rn15, _i14, state);
                                                                    }])]])))(_t27);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c22 = _arg1.head.Fields[0];
                                                                                            var _i15 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd22 = _arg1.tail.head.Fields[0];
                                                                                            var _rm14 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn16 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s22 = _arg1.head.Fields[1];
                                                                                            var _t28 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z14 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return rscR(_c22, _s22, _rd22, _rn16, _rm14, _z14, _i15, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t28);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c23 = _arg1.head.Fields[0];
                                                                                            var _rd23 = _arg1.tail.head.Fields[0];
                                                                                            var _rm15 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn17 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs7 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s23 = _arg1.head.Fields[1];
                                                                                            var _t29 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z15 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return rscR(_c23, _s23, _rd23, _rn17, _rm15, _z15, _rs7, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t29);
                                                                                        } else {
                                                                                            return _target31(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target31(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target31(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target31(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target31(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target31(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_MUL") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    var _c24 = _arg1.head.Fields[0];
                                                                    var _rd24 = _arg1.tail.head.Fields[0];
                                                                    var _rm16 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _rs8 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _s24 = _arg1.head.Fields[1];
                                                                    var _t30 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return mulR(_c24, _s24, _rd24, _rm16, _rs8, state);
                                                                    }])]])))(_t30);
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_MLA") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                    var _c25 = _arg1.head.Fields[0];
                                                                                    var _rd25 = _arg1.tail.head.Fields[0];
                                                                                    var _rm17 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                    var _rn18 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _rs9 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _s25 = _arg1.head.Fields[1];
                                                                                    var _t31 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                                        return mlaR(_c25, _s25, _rd25, _rm17, _rs9, _rn18, state);
                                                                                    }])]])))(_t31);
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else {
                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                        }
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_AND") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c26 = _arg1.head.Fields[0];
                                                                    var _i16 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd26 = _arg1.tail.head.Fields[0];
                                                                    var _rn19 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s26 = _arg1.head.Fields[1];
                                                                    var _t32 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return andI(_c26, _s26, _rd26, _rn19, _i16, state);
                                                                    }])]])))(_t32);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c27 = _arg1.head.Fields[0];
                                                                                            var _i17 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd27 = _arg1.tail.head.Fields[0];
                                                                                            var _rm18 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn20 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s27 = _arg1.head.Fields[1];
                                                                                            var _t33 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z16 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return andR(_c27, _s27, _rd27, _rn20, _rm18, _z16, _i17, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t33);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c28 = _arg1.head.Fields[0];
                                                                                            var _rd28 = _arg1.tail.head.Fields[0];
                                                                                            var _rm19 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn21 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs10 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s28 = _arg1.head.Fields[1];
                                                                                            var _t34 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z17 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return andR(_c28, _s28, _rd28, _rn21, _rm19, _z17, _rs10, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t34);
                                                                                        } else {
                                                                                            return _target37(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target37(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target37(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target37(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target37(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target37(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_ORR") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c29 = _arg1.head.Fields[0];
                                                                    var _i18 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd29 = _arg1.tail.head.Fields[0];
                                                                    var _rn22 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s29 = _arg1.head.Fields[1];
                                                                    var _t35 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return orrI(_c29, _s29, _rd29, _rn22, _i18, state);
                                                                    }])]])))(_t35);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c30 = _arg1.head.Fields[0];
                                                                                            var _i19 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd30 = _arg1.tail.head.Fields[0];
                                                                                            var _rm20 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn23 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s30 = _arg1.head.Fields[1];
                                                                                            var _t36 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z18 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return orrR(_c30, _s30, _rd30, _rn23, _rm20, _z18, _i19, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t36);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c31 = _arg1.head.Fields[0];
                                                                                            var _rd31 = _arg1.tail.head.Fields[0];
                                                                                            var _rm21 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn24 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs11 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s31 = _arg1.head.Fields[1];
                                                                                            var _t37 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z19 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return orrR(_c31, _s31, _rd31, _rn24, _rm21, _z19, _rs11, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t37);
                                                                                        } else {
                                                                                            return _target41(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target41(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target41(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target41(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target41(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target41(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_EOR") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c32 = _arg1.head.Fields[0];
                                                                    var _i20 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd32 = _arg1.tail.head.Fields[0];
                                                                    var _rn25 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s32 = _arg1.head.Fields[1];
                                                                    var _t38 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return eorI(_c32, _s32, _rd32, _rn25, _i20, state);
                                                                    }])]])))(_t38);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c33 = _arg1.head.Fields[0];
                                                                                            var _i21 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd33 = _arg1.tail.head.Fields[0];
                                                                                            var _rm22 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn26 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s33 = _arg1.head.Fields[1];
                                                                                            var _t39 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z20 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return eorR(_c33, _s33, _rd33, _rn26, _rm22, _z20, _i21, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t39);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c34 = _arg1.head.Fields[0];
                                                                                            var _rd34 = _arg1.tail.head.Fields[0];
                                                                                            var _rm23 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn27 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs12 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s34 = _arg1.head.Fields[1];
                                                                                            var _t40 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z21 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return eorR(_c34, _s34, _rd34, _rn27, _rm23, _z21, _rs12, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t40);
                                                                                        } else {
                                                                                            return _target45(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target45(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target45(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target45(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target45(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target45(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_BIC") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                    var _c35 = _arg1.head.Fields[0];
                                                                    var _i22 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _rd35 = _arg1.tail.head.Fields[0];
                                                                    var _rn28 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _s35 = _arg1.head.Fields[1];
                                                                    var _t41 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return bicI(_c35, _s35, _rd35, _rn28, _i22, state);
                                                                    }])]])))(_t41);
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                            var _c36 = _arg1.head.Fields[0];
                                                                                            var _i23 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd36 = _arg1.tail.head.Fields[0];
                                                                                            var _rm24 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn29 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _s36 = _arg1.head.Fields[1];
                                                                                            var _t42 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z22 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return bicR(_c36, _s36, _rd36, _rn29, _rm24, _z22, _i23, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t42);
                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                            var _c37 = _arg1.head.Fields[0];
                                                                                            var _rd37 = _arg1.tail.head.Fields[0];
                                                                                            var _rm25 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn30 = _arg1.tail.tail.tail.head.Fields[0];
                                                                                            var _rs13 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _s37 = _arg1.head.Fields[1];
                                                                                            var _t43 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            var _z23 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var rstype = new opType("T_R", []);
                                                                                                return function (state) {
                                                                                                    return bicR(_c37, _s37, _rd37, _rn30, _rm25, _z23, _rs13, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t43);
                                                                                        } else {
                                                                                            return _target49(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target49(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target49(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target49(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target49(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target49(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_CMP") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                                    var _c38 = _arg1.head.Fields[0];
                                                    var _i24 = _arg1.tail.tail.tail.head.Fields[0];
                                                    var _rn31 = _arg1.tail.head.Fields[0];
                                                    var _t44 = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                        return cmpI(_c38, _rn31, _i24, state);
                                                    }])]])))(_t44);
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            var _c39 = _arg1.head.Fields[0];
                                                                            var _i25 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _rm26 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn32 = _arg1.tail.head.Fields[0];
                                                                            var _t45 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z24 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_I", []);
                                                                                return function (state) {
                                                                                    return cmpR(_c39, _rn32, _rm26, _z24, _i25, rstype, state);
                                                                                };
                                                                            }()])]])))(_t45);
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            var _c40 = _arg1.head.Fields[0];
                                                                            var _rm27 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn33 = _arg1.tail.head.Fields[0];
                                                                            var _rs14 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _t46 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z25 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_R", []);
                                                                                return function (state) {
                                                                                    return cmpR(_c40, _rn33, _rm27, _z25, _rs14, rstype, state);
                                                                                };
                                                                            }()])]])))(_t46);
                                                                        } else {
                                                                            return _target53(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target53(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target53(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                }
                                                            } else {
                                                                return _target53(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                            }
                                                        } else {
                                                            return _target53(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                        }
                                                    } else {
                                                        return _target53(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_CMN") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                                    var _c41 = _arg1.head.Fields[0];
                                                    var _i26 = _arg1.tail.tail.tail.head.Fields[0];
                                                    var _rn34 = _arg1.tail.head.Fields[0];
                                                    var _t47 = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                        return cmnI(_c41, _rn34, _i26, state);
                                                    }])]])))(_t47);
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            var _c42 = _arg1.head.Fields[0];
                                                                            var _i27 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _rm28 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn35 = _arg1.tail.head.Fields[0];
                                                                            var _t48 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z26 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_I", []);
                                                                                return function (state) {
                                                                                    return cmnR(_c42, _rn35, _rm28, _z26, _i27, rstype, state);
                                                                                };
                                                                            }()])]])))(_t48);
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            var _c43 = _arg1.head.Fields[0];
                                                                            var _rm29 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn36 = _arg1.tail.head.Fields[0];
                                                                            var _rs15 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _t49 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z27 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_R", []);
                                                                                return function (state) {
                                                                                    return cmnR(_c43, _rn36, _rm29, _z27, _rs15, rstype, state);
                                                                                };
                                                                            }()])]])))(_t49);
                                                                        } else {
                                                                            return _target57(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target57(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target57(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                }
                                                            } else {
                                                                return _target57(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                            }
                                                        } else {
                                                            return _target57(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                        }
                                                    } else {
                                                        return _target57(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_TST") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                                    var _c44 = _arg1.head.Fields[0];
                                                    var _i28 = _arg1.tail.tail.tail.head.Fields[0];
                                                    var _rn37 = _arg1.tail.head.Fields[0];
                                                    var _t50 = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                        return tstI(_c44, _rn37, _i28, state);
                                                    }])]])))(_t50);
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            var _c45 = _arg1.head.Fields[0];
                                                                            var _i29 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _rm30 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn38 = _arg1.tail.head.Fields[0];
                                                                            var _t51 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z28 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_I", []);
                                                                                return function (state) {
                                                                                    return tstR(_c45, _rn38, _rm30, _z28, _i29, rstype, state);
                                                                                };
                                                                            }()])]])))(_t51);
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            var _c46 = _arg1.head.Fields[0];
                                                                            var _rm31 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn39 = _arg1.tail.head.Fields[0];
                                                                            var _rs16 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _t52 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z29 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_R", []);
                                                                                return function (state) {
                                                                                    return tstR(_c46, _rn39, _rm31, _z29, _rs16, rstype, state);
                                                                                };
                                                                            }()])]])))(_t52);
                                                                        } else {
                                                                            return _target61(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target61(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target61(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                }
                                                            } else {
                                                                return _target61(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                            }
                                                        } else {
                                                            return _target61(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                        }
                                                    } else {
                                                        return _target61(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_TEQ") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                                    var _c47 = _arg1.head.Fields[0];
                                                    var _i30 = _arg1.tail.tail.tail.head.Fields[0];
                                                    var _rn40 = _arg1.tail.head.Fields[0];
                                                    var _t53 = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                        return teqI(_c47, _rn40, _i30, state);
                                                    }])]])))(_t53);
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            var _c48 = _arg1.head.Fields[0];
                                                                            var _i31 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _rm32 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn41 = _arg1.tail.head.Fields[0];
                                                                            var _t54 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z30 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_I", []);
                                                                                return function (state) {
                                                                                    return teqR(_c48, _rn41, _rm32, _z30, _i31, rstype, state);
                                                                                };
                                                                            }()])]])))(_t54);
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            var _c49 = _arg1.head.Fields[0];
                                                                            var _rm33 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn42 = _arg1.tail.head.Fields[0];
                                                                            var _rs17 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _t55 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z31 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_R", []);
                                                                                return function (state) {
                                                                                    return teqR(_c49, _rn42, _rm33, _z31, _rs17, rstype, state);
                                                                                };
                                                                            }()])]])))(_t55);
                                                                        } else {
                                                                            return _target65(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target65(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target65(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                }
                                                            } else {
                                                                return _target65(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                            }
                                                        } else {
                                                            return _target65(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                        }
                                                    } else {
                                                        return _target65(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_CLZ") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_INT") {
                                                    var _c50 = _arg1.head.Fields[0];
                                                    var _i32 = _arg1.tail.tail.tail.head.Fields[0];
                                                    var _rn43 = _arg1.tail.head.Fields[0];
                                                    var _t56 = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                        return tstI(_c50, _rn43, _i32, state);
                                                    }])]])))(_t56);
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            var _c51 = _arg1.head.Fields[0];
                                                                            var _i33 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _rm34 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn44 = _arg1.tail.head.Fields[0];
                                                                            var _t57 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z32 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_I", []);
                                                                                return function (state) {
                                                                                    return tstR(_c51, _rn44, _rm34, _z32, _i33, rstype, state);
                                                                                };
                                                                            }()])]])))(_t57);
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            var _c52 = _arg1.head.Fields[0];
                                                                            var _rm35 = _arg1.tail.tail.tail.head.Fields[0];
                                                                            var _rn45 = _arg1.tail.head.Fields[0];
                                                                            var _rs18 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            var _t58 = _arg1.tail.tail.tail.tail.tail.tail.tail;
                                                                            var _z33 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                var rstype = new opType("T_R", []);
                                                                                return function (state) {
                                                                                    return tstR(_c52, _rn45, _rm35, _z33, _rs18, rstype, state);
                                                                                };
                                                                            }()])]])))(_t58);
                                                                        } else {
                                                                            return _target69(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target69(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                    }
                                                                } else {
                                                                    return _target69(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                                }
                                                            } else {
                                                                return _target69(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                            }
                                                        } else {
                                                            return _target69(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                        }
                                                    } else {
                                                        return _target69(_arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_SHIFT") {
                            if (_arg1.head.Fields[0].Case === "T_LSR") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                        if (_arg1.tail.tail.tail.tail.tail != null) {
                                                            if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                    if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                        var _c53 = _arg1.head.Fields[1][0];
                                                                        var _rd38 = _arg1.tail.head.Fields[0];
                                                                        var _rm36 = _arg1.tail.tail.tail.head.Fields[0];
                                                                        var _rn46 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                        var _s38 = _arg1.head.Fields[1][1];
                                                                        var _t59 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                            return lsrR(_c53, _s38, _rd38, _rm36, _rn46, state);
                                                                        }])]])))(_t59);
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.head.Fields[0].Case === "T_ASR") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                        if (_arg1.tail.tail.tail.tail.tail != null) {
                                                            if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                    if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                        var _c54 = _arg1.head.Fields[1][0];
                                                                        var _rd39 = _arg1.tail.head.Fields[0];
                                                                        var _rm37 = _arg1.tail.tail.tail.head.Fields[0];
                                                                        var _rn47 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                        var _s39 = _arg1.head.Fields[1][1];
                                                                        var _t60 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                            return asrR(_c54, _s39, _rd39, _rm37, _rn47, state);
                                                                        }])]])))(_t60);
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.head.Fields[0].Case === "T_ROR") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                        if (_arg1.tail.tail.tail.tail.tail != null) {
                                                            if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                    if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                        var _c55 = _arg1.head.Fields[1][0];
                                                                        var _rd40 = _arg1.tail.head.Fields[0];
                                                                        var _rm38 = _arg1.tail.tail.tail.head.Fields[0];
                                                                        var _rn48 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                        var _s40 = _arg1.head.Fields[1][1];
                                                                        var _t61 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                            return rorR(_c55, _s40, _rd40, _rm38, _rn48, state);
                                                                        }])]])))(_t61);
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.head.Fields[0].Case === "T_RRX") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                        var _c56 = _arg1.head.Fields[1][0];
                                                        var _rd41 = _arg1.tail.head.Fields[0];
                                                        var _rm39 = _arg1.tail.tail.tail.head.Fields[0];
                                                        var _s41 = _arg1.head.Fields[1][1];
                                                        var _t62 = _arg1.tail.tail.tail.tail;
                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                            return rrxR(_c56, _s41, _rd41, _rm39, state);
                                                        }])]])))(_t62);
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_REG") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                    var _c57 = _arg1.head.Fields[1][0];
                                                                    var _rd42 = _arg1.tail.head.Fields[0];
                                                                    var _rm40 = _arg1.tail.tail.tail.head.Fields[0];
                                                                    var _rn49 = _arg1.tail.tail.tail.tail.tail.head.Fields[0];
                                                                    var _s42 = _arg1.head.Fields[1][1];
                                                                    var _t63 = _arg1.tail.tail.tail.tail.tail.tail;
                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                        return lslR(_c57, _s42, _rd42, _rm40, _rn49, state);
                                                                    }])]])))(_t63);
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_B") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_LABEL") {
                                    var _c58 = _arg1.head.Fields[0];
                                    var _s43 = _arg1.tail.head.Fields[0];
                                    var _t64 = _arg1.tail.tail;
                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("LabelRef", [branchRef(l)(_c58)(_s43)(function (c_1) {
                                        return function (label) {
                                            return function (state) {
                                                return b(c_1, label, state);
                                            };
                                        };
                                    })])]])))(_t64);
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_BL") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_LABEL") {
                                    var _c59 = _arg1.head.Fields[0];
                                    var _s44 = _arg1.tail.head.Fields[0];
                                    var _t65 = _arg1.tail.tail;
                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("LabelRef", [branchRef(l)(_c59)(_s44)(function (c_1) {
                                        return function (label) {
                                            return function (state) {
                                                return bl(c_1, label, state);
                                            };
                                        };
                                    })])]])))(_t65);
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_BX") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    var _c60 = _arg1.head.Fields[0];
                                    var r = _arg1.tail.head.Fields[0];
                                    var _t66 = _arg1.tail.tail;
                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                        return bx(_c60, r, state);
                                    }])]])))(_t66);
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_ADR") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_LABEL") {
                                                    var _c61 = _arg1.head.Fields[0];
                                                    var _rd43 = _arg1.tail.head.Fields[0];
                                                    var _s45 = _arg1.tail.tail.tail.head.Fields[0];
                                                    var _t67 = _arg1.tail.tail.tail.tail;
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("LabelRef", [lsaRef(l)(_c61)(_rd43)(_s45)(function (c_1) {
                                                        return function (rd_1) {
                                                            return function (label) {
                                                                return function (state) {
                                                                    return adr(c_1, rd_1, label, state);
                                                                };
                                                            };
                                                        };
                                                    })])]])))(_t67);
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_LDR") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_L_BRAC") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_REG") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                            var _c62 = _arg1.head.Fields[0];
                                                                                                            var _i34 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rd44 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm41 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn50 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t68 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z34 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_I", []);
                                                                                                                return function (state) {
                                                                                                                    return ldrWaR(_c62, _rd44, _rn50, _rm41, _z34, _i34, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t68);
                                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                            var _c63 = _arg1.head.Fields[0];
                                                                                                            var _rd45 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm42 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn51 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rs19 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t69 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z35 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_R", []);
                                                                                                                return function (state) {
                                                                                                                    return ldrWaR(_c63, _rd45, _rn51, _rm42, _z35, _rs19, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t69);
                                                                                                        } else {
                                                                                                            return _target82(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target82(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target82(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                }
                                                                                            } else {
                                                                                                return _target82(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                            }
                                                                                        } else {
                                                                                            return _target82(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target82(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                    var _c64 = _arg1.head.Fields[0];
                                                                                    var _i35 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _rd46 = _arg1.tail.head.Fields[0];
                                                                                    var _rn52 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _t70 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                                        return ldrWaI(_c64, _rd46, _rn52, _i35, state);
                                                                                    }])]])))(_t70);
                                                                                } else {
                                                                                    return _target88(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target88(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target88(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target88(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c65 = _arg1.head.Fields[0];
                                                                                            var _i36 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd47 = _arg1.tail.head.Fields[0];
                                                                                            var _rn53 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t71 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                return function (state) {
                                                                                                    return ldrWbI(_c65, inc, _rd47, _rn53, _i36, state);
                                                                                                };
                                                                                            }()])]])))(_t71);
                                                                                        } else {
                                                                                            return _target90(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target90(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c66 = _arg1.head.Fields[0];
                                                                                            var _rd48 = _arg1.tail.head.Fields[0];
                                                                                            var _rm43 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn54 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t72 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                var rsinst = new shiftOp("T_LSL", []);
                                                                                                var nORrn = 0;
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return ldrWbR(_c66, inc, _rd48, _rn54, _rm43, rsinst, nORrn, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t72);
                                                                                        } else {
                                                                                            return _target92(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target92(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c67 = _arg1.head.Fields[0];
                                                                                                                    var _i37 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rd49 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm44 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn55 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t73 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z36 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_I", []);
                                                                                                                        return function (state) {
                                                                                                                            return ldrWbR(_c67, inc, _rd49, _rn55, _rm44, _z36, _i37, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t73);
                                                                                                                } else {
                                                                                                                    return _target94(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target94(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c68 = _arg1.head.Fields[0];
                                                                                                                    var _rd50 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm45 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn56 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rs20 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t74 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z37 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_R", []);
                                                                                                                        return function (state) {
                                                                                                                            return ldrWbR(_c68, inc, _rd50, _rn56, _rm45, _z37, _rs20, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t74);
                                                                                                                } else {
                                                                                                                    return _target96(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target96(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                                }
                                                                                            } else {
                                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                                            }
                                                                                        } else {
                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                        }
                                                                                    } else {
                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else {
                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                        }
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_EQUAL") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_LABEL") {
                                                            var _c69 = _arg1.head.Fields[0];
                                                            var _rd51 = _arg1.tail.head.Fields[0];
                                                            var _s46 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                            var _t75 = _arg1.tail.tail.tail.tail.tail;
                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("LabelRef", [lsaRef(l)(_c69)(_rd51)(_s46)(function (c_1) {
                                                                return function (rd_1) {
                                                                    return function (label) {
                                                                        return function (state) {
                                                                            return ldrWL(c_1, rd_1, label, state);
                                                                        };
                                                                    };
                                                                };
                                                            })])]])))(_t75);
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_LDRB") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_L_BRAC") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_REG") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                            var _c70 = _arg1.head.Fields[0];
                                                                                                            var _i38 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rd52 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm46 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn57 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t76 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z38 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_I", []);
                                                                                                                return function (state) {
                                                                                                                    return ldrBaR(_c70, _rd52, _rn57, _rm46, _z38, _i38, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t76);
                                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                            var _c71 = _arg1.head.Fields[0];
                                                                                                            var _rd53 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm47 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn58 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rs21 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t77 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z39 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_R", []);
                                                                                                                return function (state) {
                                                                                                                    return ldrBaR(_c71, _rd53, _rn58, _rm47, _z39, _rs21, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t77);
                                                                                                        } else {
                                                                                                            return _target86(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target86(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target86(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                }
                                                                                            } else {
                                                                                                return _target86(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                            }
                                                                                        } else {
                                                                                            return _target86(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target86(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                    var _c72 = _arg1.head.Fields[0];
                                                                                    var _i39 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _rd54 = _arg1.tail.head.Fields[0];
                                                                                    var _rn59 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _t78 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                                        return ldrBaI(_c72, _rd54, _rn59, _i39, state);
                                                                                    }])]])))(_t78);
                                                                                } else {
                                                                                    return _target98(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target98(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target98(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target98(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c73 = _arg1.head.Fields[0];
                                                                                            var _i40 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd55 = _arg1.tail.head.Fields[0];
                                                                                            var _rn60 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t79 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                return function (state) {
                                                                                                    return ldrBbI(_c73, inc, _rd55, _rn60, _i40, state);
                                                                                                };
                                                                                            }()])]])))(_t79);
                                                                                        } else {
                                                                                            return _target100(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target100(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c74 = _arg1.head.Fields[0];
                                                                                            var _rd56 = _arg1.tail.head.Fields[0];
                                                                                            var _rm48 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn61 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t80 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                var rsinst = new shiftOp("T_LSL", []);
                                                                                                var nORrn = 0;
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return ldrBbR(_c74, inc, _rd56, _rn61, _rm48, rsinst, nORrn, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t80);
                                                                                        } else {
                                                                                            return _target102(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target102(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c75 = _arg1.head.Fields[0];
                                                                                                                    var _i41 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rd57 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm49 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn62 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t81 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z40 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_I", []);
                                                                                                                        return function (state) {
                                                                                                                            return ldrBbR(_c75, inc, _rd57, _rn62, _rm49, _z40, _i41, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t81);
                                                                                                                } else {
                                                                                                                    return _target104(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target104(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c76 = _arg1.head.Fields[0];
                                                                                                                    var _rd58 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm50 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn63 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rs22 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t82 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z41 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_R", []);
                                                                                                                        return function (state) {
                                                                                                                            return ldrBbR(_c76, inc, _rd58, _rn63, _rm50, _z41, _rs22, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t82);
                                                                                                                } else {
                                                                                                                    return _target106(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target106(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                                }
                                                                                            } else {
                                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                                            }
                                                                                        } else {
                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                        }
                                                                                    } else {
                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else {
                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                        }
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else if (_arg1.tail.tail.tail.head.Case === "T_EQUAL") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_LABEL") {
                                                            var _c77 = _arg1.head.Fields[0];
                                                            var _rd59 = _arg1.tail.head.Fields[0];
                                                            var _s47 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                            var _t83 = _arg1.tail.tail.tail.tail.tail;
                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("LabelRef", [lsaRef(l)(_c77)(_rd59)(_s47)(function (c_1) {
                                                                return function (rd_1) {
                                                                    return function (label) {
                                                                        return function (state) {
                                                                            return ldrBL(c_1, rd_1, label, state);
                                                                        };
                                                                    };
                                                                };
                                                            })])]])))(_t83);
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_STR") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_L_BRAC") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_REG") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                            var _c78 = _arg1.head.Fields[0];
                                                                                                            var _i42 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rd60 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm51 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn64 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t84 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z42 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_I", []);
                                                                                                                return function (state) {
                                                                                                                    return strWaR(_c78, _rd60, _rn64, _rm51, _z42, _i42, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t84);
                                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                            var _c79 = _arg1.head.Fields[0];
                                                                                                            var _rd61 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm52 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn65 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rs23 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t85 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z43 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_R", []);
                                                                                                                return function (state) {
                                                                                                                    return strWaR(_c79, _rd61, _rn65, _rm52, _z43, _rs23, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t85);
                                                                                                        } else {
                                                                                                            return _target110(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target110(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target110(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                }
                                                                                            } else {
                                                                                                return _target110(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                            }
                                                                                        } else {
                                                                                            return _target110(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target110(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                    var _c80 = _arg1.head.Fields[0];
                                                                                    var _i43 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _rd62 = _arg1.tail.head.Fields[0];
                                                                                    var _rn66 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _t86 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                                        return strWaI(_c80, _rd62, _rn66, _i43, state);
                                                                                    }])]])))(_t86);
                                                                                } else {
                                                                                    return _target115(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target115(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target115(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target115(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c81 = _arg1.head.Fields[0];
                                                                                            var _i44 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd63 = _arg1.tail.head.Fields[0];
                                                                                            var _rn67 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t87 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                return function (state) {
                                                                                                    return strWbI(_c81, inc, _rd63, _rn67, _i44, state);
                                                                                                };
                                                                                            }()])]])))(_t87);
                                                                                        } else {
                                                                                            return _target117(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target117(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c82 = _arg1.head.Fields[0];
                                                                                            var _rd64 = _arg1.tail.head.Fields[0];
                                                                                            var _rm53 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn68 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t88 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                var rsinst = new shiftOp("T_LSL", []);
                                                                                                var nORrn = 0;
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return strWbR(_c82, inc, _rd64, _rn68, _rm53, rsinst, nORrn, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t88);
                                                                                        } else {
                                                                                            return _target119(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target119(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c83 = _arg1.head.Fields[0];
                                                                                                                    var _i45 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rd65 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm54 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn69 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t89 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z44 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_I", []);
                                                                                                                        return function (state) {
                                                                                                                            return strWbR(_c83, inc, _rd65, _rn69, _rm54, _z44, _i45, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t89);
                                                                                                                } else {
                                                                                                                    return _target121(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target121(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c84 = _arg1.head.Fields[0];
                                                                                                                    var _rd66 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm55 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn70 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rs24 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t90 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z45 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_R", []);
                                                                                                                        return function (state) {
                                                                                                                            return strWbR(_c84, inc, _rd66, _rn70, _rm55, _z45, _rs24, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t90);
                                                                                                                } else {
                                                                                                                    return _target123(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target123(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                                }
                                                                                            } else {
                                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                                            }
                                                                                        } else {
                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                        }
                                                                                    } else {
                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else {
                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                        }
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_STRB") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_L_BRAC") {
                                                    if (_arg1.tail.tail.tail.tail.tail != null) {
                                                        if (_arg1.tail.tail.tail.tail.head.Case === "T_REG") {
                                                            if (_arg1.tail.tail.tail.tail.tail.tail != null) {
                                                                if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                            var _c85 = _arg1.head.Fields[0];
                                                                                                            var _i46 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rd67 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm56 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn71 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t91 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z46 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_I", []);
                                                                                                                return function (state) {
                                                                                                                    return strBaR(_c85, _rd67, _rn71, _rm56, _z46, _i46, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t91);
                                                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                            var _c86 = _arg1.head.Fields[0];
                                                                                                            var _rd68 = _arg1.tail.head.Fields[0];
                                                                                                            var _rm57 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rn72 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _rs25 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            var _t92 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                            var _z47 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                var rstype = new opType("T_R", []);
                                                                                                                return function (state) {
                                                                                                                    return strBaR(_c86, _rd68, _rn72, _rm57, _z47, _rs25, rstype, state);
                                                                                                                };
                                                                                                            }()])]])))(_t92);
                                                                                                        } else {
                                                                                                            return _target114(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target114(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target114(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                                }
                                                                                            } else {
                                                                                                return _target114(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                            }
                                                                                        } else {
                                                                                            return _target114(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target114(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                    var _c87 = _arg1.head.Fields[0];
                                                                                    var _i47 = _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _rd69 = _arg1.tail.head.Fields[0];
                                                                                    var _rn73 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                    var _t93 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function (state) {
                                                                                        return strBaI(_c87, _rd69, _rn73, _i47, state);
                                                                                    }])]])))(_t93);
                                                                                } else {
                                                                                    return _target124(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                                }
                                                                            } else {
                                                                                return _target124(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                            }
                                                                        } else {
                                                                            return _target124(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                        }
                                                                    } else {
                                                                        return _target124(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail);
                                                                    }
                                                                } else if (_arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c88 = _arg1.head.Fields[0];
                                                                                            var _i48 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rd70 = _arg1.tail.head.Fields[0];
                                                                                            var _rn74 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t94 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                return function (state) {
                                                                                                    return strBbI(_c88, inc, _rd70, _rn74, _i48, state);
                                                                                                };
                                                                                            }()])]])))(_t94);
                                                                                        } else {
                                                                                            return _target126(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target126(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else if (_arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                            var _c89 = _arg1.head.Fields[0];
                                                                                            var _rd71 = _arg1.tail.head.Fields[0];
                                                                                            var _rm58 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _rn75 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                            var _t95 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                var inc = true;
                                                                                                var rsinst = new shiftOp("T_LSL", []);
                                                                                                var nORrn = 0;
                                                                                                var rstype = new opType("T_I", []);
                                                                                                return function (state) {
                                                                                                    return strBbR(_c89, inc, _rd71, _rn75, _rm58, rsinst, nORrn, rstype, state);
                                                                                                };
                                                                                            }()])]])))(_t95);
                                                                                        } else {
                                                                                            return _target128(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                        }
                                                                                    } else {
                                                                                        return _target128(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail);
                                                                                    }
                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA") {
                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT") {
                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c90 = _arg1.head.Fields[0];
                                                                                                                    var _i49 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rd72 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm59 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn76 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t96 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z48 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_I", []);
                                                                                                                        return function (state) {
                                                                                                                            return strBbR(_c90, inc, _rd72, _rn76, _rm59, _z48, _i49, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t96);
                                                                                                                } else {
                                                                                                                    return _target130(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target130(_arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG") {
                                                                                                    if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                        if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC") {
                                                                                                            if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null) {
                                                                                                                if (_arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL") {
                                                                                                                    var _c91 = _arg1.head.Fields[0];
                                                                                                                    var _rd73 = _arg1.tail.head.Fields[0];
                                                                                                                    var _rm60 = _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rn77 = _arg1.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _rs26 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    var _t97 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail;
                                                                                                                    var _z49 = _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0];
                                                                                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                                                                        var inc = true;
                                                                                                                        var rstype = new opType("T_R", []);
                                                                                                                        return function (state) {
                                                                                                                            return strBbR(_c91, inc, _rd73, _rn77, _rm60, _z49, _rs26, rstype, state);
                                                                                                                        };
                                                                                                                    }()])]])))(_t97);
                                                                                                                } else {
                                                                                                                    return _target132(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                                }
                                                                                                            } else {
                                                                                                                return _target132(_arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]);
                                                                                                            }
                                                                                                        } else {
                                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                                        }
                                                                                                    } else {
                                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                                    }
                                                                                                } else {
                                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                                }
                                                                                            } else {
                                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                                            }
                                                                                        } else {
                                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                                        }
                                                                                    } else {
                                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                                    }
                                                                                } else {
                                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                                }
                                                                            } else {
                                                                                return _target156(_arg1.tail, _arg1.head);
                                                                            }
                                                                        } else {
                                                                            return _target156(_arg1.tail, _arg1.head);
                                                                        }
                                                                    } else {
                                                                        return _target156(_arg1.tail, _arg1.head);
                                                                    }
                                                                } else {
                                                                    return _target156(_arg1.tail, _arg1.head);
                                                                }
                                                            } else {
                                                                return _target156(_arg1.tail, _arg1.head);
                                                            }
                                                        } else {
                                                            return _target156(_arg1.tail, _arg1.head);
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_LDM") {
                            if (_arg1.head.Fields[1].Case === "S_IB") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                var _c92 = _arg1.head.Fields[0];
                                                var _rn78 = _arg1.tail.head.Fields[0];
                                                var _t98 = _arg1.tail.tail.tail;
                                                {
                                                    var _matchValue2 = regList(_t98);

                                                    if (_matchValue2.Case === "Err") {
                                                        return new _Error("Err", [l, _matchValue2.Fields[1]]);
                                                    } else {
                                                        var tokLst_1 = _matchValue2.Fields[0][1];
                                                        var rl = _matchValue2.Fields[0][0];
                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                            var write = false;
                                                            return function (state) {
                                                                return ldmIB(_c92, write, _rn78, rl, state);
                                                            };
                                                        }()])]])))(tokLst_1);
                                                    }
                                                }
                                            } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                        var _c93 = _arg1.head.Fields[0];
                                                        var _rn79 = _arg1.tail.head.Fields[0];
                                                        var _t99 = _arg1.tail.tail.tail.tail;
                                                        {
                                                            var _matchValue3 = regList(_t99);

                                                            if (_matchValue3.Case === "Err") {
                                                                return new _Error("Err", [l, _matchValue3.Fields[1]]);
                                                            } else {
                                                                var _tokLst_ = _matchValue3.Fields[0][1];
                                                                var _rl = _matchValue3.Fields[0][0];
                                                                return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                    var write = true;
                                                                    return function (state) {
                                                                        return ldmIB(_c93, write, _rn79, _rl, state);
                                                                    };
                                                                }()])]])))(_tokLst_);
                                                            }
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.head.Fields[1].Case === "S_DA") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                var _c94 = _arg1.head.Fields[0];
                                                var _rn80 = _arg1.tail.head.Fields[0];
                                                var _t100 = _arg1.tail.tail.tail;
                                                {
                                                    var _matchValue4 = regList(_t100);

                                                    if (_matchValue4.Case === "Err") {
                                                        return new _Error("Err", [l, _matchValue4.Fields[1]]);
                                                    } else {
                                                        var _tokLst_2 = _matchValue4.Fields[0][1];
                                                        var _rl2 = _matchValue4.Fields[0][0];
                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                            var write = false;
                                                            return function (state) {
                                                                return ldmDA(_c94, write, _rn80, _rl2, state);
                                                            };
                                                        }()])]])))(_tokLst_2);
                                                    }
                                                }
                                            } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                        var _c95 = _arg1.head.Fields[0];
                                                        var _rn81 = _arg1.tail.head.Fields[0];
                                                        var _t101 = _arg1.tail.tail.tail.tail;
                                                        {
                                                            var _matchValue5 = regList(_t101);

                                                            if (_matchValue5.Case === "Err") {
                                                                return new _Error("Err", [l, _matchValue5.Fields[1]]);
                                                            } else {
                                                                var _tokLst_3 = _matchValue5.Fields[0][1];
                                                                var _rl3 = _matchValue5.Fields[0][0];
                                                                return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                    var write = true;
                                                                    return function (state) {
                                                                        return ldmDA(_c95, write, _rn81, _rl3, state);
                                                                    };
                                                                }()])]])))(_tokLst_3);
                                                            }
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.head.Fields[1].Case === "S_DB") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                var _c96 = _arg1.head.Fields[0];
                                                var _rn82 = _arg1.tail.head.Fields[0];
                                                var _t102 = _arg1.tail.tail.tail;
                                                {
                                                    var _matchValue6 = regList(_t102);

                                                    if (_matchValue6.Case === "Err") {
                                                        return new _Error("Err", [l, _matchValue6.Fields[1]]);
                                                    } else {
                                                        var _tokLst_4 = _matchValue6.Fields[0][1];
                                                        var _rl4 = _matchValue6.Fields[0][0];
                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                            var write = false;
                                                            return function (state) {
                                                                return ldmDB(_c96, write, _rn82, _rl4, state);
                                                            };
                                                        }()])]])))(_tokLst_4);
                                                    }
                                                }
                                            } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                        var _c97 = _arg1.head.Fields[0];
                                                        var _rn83 = _arg1.tail.head.Fields[0];
                                                        var _t103 = _arg1.tail.tail.tail.tail;
                                                        {
                                                            var _matchValue7 = regList(_t103);

                                                            if (_matchValue7.Case === "Err") {
                                                                return new _Error("Err", [l, _matchValue7.Fields[1]]);
                                                            } else {
                                                                var _tokLst_5 = _matchValue7.Fields[0][1];
                                                                var _rl5 = _matchValue7.Fields[0][0];
                                                                return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                    var write = true;
                                                                    return function (state) {
                                                                        return ldmDB(_c97, write, _rn83, _rl5, state);
                                                                    };
                                                                }()])]])))(_tokLst_5);
                                                            }
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            var _c98 = _arg1.head.Fields[0];
                                            var _rn84 = _arg1.tail.head.Fields[0];
                                            var _t104 = _arg1.tail.tail.tail;
                                            {
                                                var _matchValue8 = regList(_t104);

                                                if (_matchValue8.Case === "Err") {
                                                    return new _Error("Err", [l, _matchValue8.Fields[1]]);
                                                } else {
                                                    var _tokLst_6 = _matchValue8.Fields[0][1];
                                                    var _rl6 = _matchValue8.Fields[0][0];
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                        var write = false;
                                                        return function (state) {
                                                            return ldmIA(_c98, write, _rn84, _rl6, state);
                                                        };
                                                    }()])]])))(_tokLst_6);
                                                }
                                            }
                                        } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                    var _c99 = _arg1.head.Fields[0];
                                                    var _rn85 = _arg1.tail.head.Fields[0];
                                                    var _t105 = _arg1.tail.tail.tail.tail;
                                                    {
                                                        var _matchValue9 = regList(_t105);

                                                        if (_matchValue9.Case === "Err") {
                                                            return new _Error("Err", [l, _matchValue9.Fields[1]]);
                                                        } else {
                                                            var _tokLst_7 = _matchValue9.Fields[0][1];
                                                            var _rl7 = _matchValue9.Fields[0][0];
                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                var write = true;
                                                                return function (state) {
                                                                    return ldmIA(_c99, write, _rn85, _rl7, state);
                                                                };
                                                            }()])]])))(_tokLst_7);
                                                        }
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_STM") {
                            if (_arg1.head.Fields[1].Case === "S_IB") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                var _c100 = _arg1.head.Fields[0];
                                                var _rn86 = _arg1.tail.head.Fields[0];
                                                var _t106 = _arg1.tail.tail.tail;
                                                {
                                                    var _matchValue10 = regList(_t106);

                                                    if (_matchValue10.Case === "Err") {
                                                        return new _Error("Err", [l, _matchValue10.Fields[1]]);
                                                    } else {
                                                        var _tokLst_8 = _matchValue10.Fields[0][1];
                                                        var _rl8 = _matchValue10.Fields[0][0];
                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                            var write = false;
                                                            return function (state) {
                                                                return stmIB(_c100, write, _rn86, _rl8, state);
                                                            };
                                                        }()])]])))(_tokLst_8);
                                                    }
                                                }
                                            } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                        var _c101 = _arg1.head.Fields[0];
                                                        var _rn87 = _arg1.tail.head.Fields[0];
                                                        var _t107 = _arg1.tail.tail.tail.tail;
                                                        {
                                                            var _matchValue11 = regList(_t107);

                                                            if (_matchValue11.Case === "Err") {
                                                                return new _Error("Err", [l, _matchValue11.Fields[1]]);
                                                            } else {
                                                                var _tokLst_9 = _matchValue11.Fields[0][1];
                                                                var _rl9 = _matchValue11.Fields[0][0];
                                                                return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                    var write = true;
                                                                    return function (state) {
                                                                        return stmIB(_c101, write, _rn87, _rl9, state);
                                                                    };
                                                                }()])]])))(_tokLst_9);
                                                            }
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.head.Fields[1].Case === "S_DA") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                var _c102 = _arg1.head.Fields[0];
                                                var _rn88 = _arg1.tail.head.Fields[0];
                                                var _t108 = _arg1.tail.tail.tail;
                                                {
                                                    var _matchValue12 = regList(_t108);

                                                    if (_matchValue12.Case === "Err") {
                                                        return new _Error("Err", [l, _matchValue12.Fields[1]]);
                                                    } else {
                                                        var _tokLst_10 = _matchValue12.Fields[0][1];
                                                        var _rl10 = _matchValue12.Fields[0][0];
                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                            var write = false;
                                                            return function (state) {
                                                                return stmDA(_c102, write, _rn88, _rl10, state);
                                                            };
                                                        }()])]])))(_tokLst_10);
                                                    }
                                                }
                                            } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                        var _c103 = _arg1.head.Fields[0];
                                                        var _rn89 = _arg1.tail.head.Fields[0];
                                                        var _t109 = _arg1.tail.tail.tail.tail;
                                                        {
                                                            var _matchValue13 = regList(_t109);

                                                            if (_matchValue13.Case === "Err") {
                                                                return new _Error("Err", [l, _matchValue13.Fields[1]]);
                                                            } else {
                                                                var _tokLst_11 = _matchValue13.Fields[0][1];
                                                                var _rl11 = _matchValue13.Fields[0][0];
                                                                return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                    var write = true;
                                                                    return function (state) {
                                                                        return stmDA(_c103, write, _rn89, _rl11, state);
                                                                    };
                                                                }()])]])))(_tokLst_11);
                                                            }
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.head.Fields[1].Case === "S_DB") {
                                if (_arg1.tail.tail != null) {
                                    if (_arg1.tail.head.Case === "T_REG") {
                                        if (_arg1.tail.tail.tail != null) {
                                            if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                                var _c104 = _arg1.head.Fields[0];
                                                var _rn90 = _arg1.tail.head.Fields[0];
                                                var _t110 = _arg1.tail.tail.tail;
                                                {
                                                    var _matchValue14 = regList(_t110);

                                                    if (_matchValue14.Case === "Err") {
                                                        return new _Error("Err", [l, _matchValue14.Fields[1]]);
                                                    } else {
                                                        var _tokLst_12 = _matchValue14.Fields[0][1];
                                                        var _rl12 = _matchValue14.Fields[0][0];
                                                        return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                            var write = false;
                                                            return function (state) {
                                                                return stmDB(_c104, write, _rn90, _rl12, state);
                                                            };
                                                        }()])]])))(_tokLst_12);
                                                    }
                                                }
                                            } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                                if (_arg1.tail.tail.tail.tail != null) {
                                                    if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                        var _c105 = _arg1.head.Fields[0];
                                                        var _rn91 = _arg1.tail.head.Fields[0];
                                                        var _t111 = _arg1.tail.tail.tail.tail;
                                                        {
                                                            var _matchValue15 = regList(_t111);

                                                            if (_matchValue15.Case === "Err") {
                                                                return new _Error("Err", [l, _matchValue15.Fields[1]]);
                                                            } else {
                                                                var _tokLst_13 = _matchValue15.Fields[0][1];
                                                                var _rl13 = _matchValue15.Fields[0][0];
                                                                return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                    var write = true;
                                                                    return function (state) {
                                                                        return stmDB(_c105, write, _rn91, _rl13, state);
                                                                    };
                                                                }()])]])))(_tokLst_13);
                                                            }
                                                        }
                                                    } else {
                                                        return _target156(_arg1.tail, _arg1.head);
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_REG") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_COMMA") {
                                            var _c106 = _arg1.head.Fields[0];
                                            var _rn92 = _arg1.tail.head.Fields[0];
                                            var _t112 = _arg1.tail.tail.tail;
                                            {
                                                var _matchValue16 = regList(_t112);

                                                if (_matchValue16.Case === "Err") {
                                                    return new _Error("Err", [l, _matchValue16.Fields[1]]);
                                                } else {
                                                    var _tokLst_14 = _matchValue16.Fields[0][1];
                                                    var _rl14 = _matchValue16.Fields[0][0];
                                                    return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                        var write = false;
                                                        return function (state) {
                                                            return stmIA(_c106, write, _rn92, _rl14, state);
                                                        };
                                                    }()])]])))(_tokLst_14);
                                                }
                                            }
                                        } else if (_arg1.tail.tail.head.Case === "T_EXCL") {
                                            if (_arg1.tail.tail.tail.tail != null) {
                                                if (_arg1.tail.tail.tail.head.Case === "T_COMMA") {
                                                    var _c107 = _arg1.head.Fields[0];
                                                    var _rn93 = _arg1.tail.head.Fields[0];
                                                    var _t113 = _arg1.tail.tail.tail.tail;
                                                    {
                                                        var _matchValue17 = regList(_t113);

                                                        if (_matchValue17.Case === "Err") {
                                                            return new _Error("Err", [l, _matchValue17.Fields[1]]);
                                                        } else {
                                                            var _tokLst_15 = _matchValue17.Fields[0][1];
                                                            var _rl15 = _matchValue17.Fields[0][0];
                                                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("Instr", [l, function () {
                                                                var write = true;
                                                                return function (state) {
                                                                    return stmIA(_c107, write, _rn93, _rl15, state);
                                                                };
                                                            }()])]])))(_tokLst_15);
                                                        }
                                                    }
                                                } else {
                                                    return _target156(_arg1.tail, _arg1.head);
                                                }
                                            } else {
                                                return _target156(_arg1.tail, _arg1.head);
                                            }
                                        } else {
                                            return _target156(_arg1.tail, _arg1.head);
                                        }
                                    } else {
                                        return _target156(_arg1.tail, _arg1.head);
                                    }
                                } else {
                                    return _target156(_arg1.tail, _arg1.head);
                                }
                            } else {
                                return _target156(_arg1.tail, _arg1.head);
                            }
                        } else if (_arg1.head.Case === "T_LABEL") {
                            if (_arg1.tail.tail != null) {
                                if (_arg1.tail.head.Case === "T_EQU") {
                                    if (_arg1.tail.tail.tail != null) {
                                        if (_arg1.tail.tail.head.Case === "T_INT") {
                                            var _i50 = _arg1.tail.tail.head.Fields[0];
                                            var _s48 = _arg1.head.Fields[0];
                                            var _t114 = _arg1.tail.tail.tail;
                                            return parseRec(m)(l)(add(_s48, _i50, labels))(outLst)(_t114);
                                        } else if (_arg1.tail.tail.head.Case === "T_LABEL") {
                                            var s1 = _arg1.head.Fields[0];
                                            var s2 = _arg1.tail.tail.head.Fields[0];
                                            var _t115 = _arg1.tail.tail.tail;
                                            {
                                                var _matchValue18 = tryFind$1(s2, labels);

                                                if (_matchValue18 == null) {
                                                    return new _Error("Err", [l, fsFormat("Undefined label: %s.")(function (x) {
                                                        return x;
                                                    })(s2)]);
                                                } else {
                                                    return parseRec(m)(l)(add(s1, _matchValue18, labels))(outLst)(_t115);
                                                }
                                            }
                                        } else {
                                            return _target152(_arg1.head.Fields[0], _arg1.tail);
                                        }
                                    } else {
                                        return _target152(_arg1.head.Fields[0], _arg1.tail);
                                    }
                                } else {
                                    return _target152(_arg1.head.Fields[0], _arg1.tail);
                                }
                            } else {
                                return _target152(_arg1.head.Fields[0], _arg1.tail);
                            }
                        } else if (_arg1.head.Case === "T_END") {
                            var _c108 = _arg1.head.Fields[0];
                            var _t116 = _arg1.tail;
                            return parseRec(m + 4)(l)(labels)(append$$1(outLst, ofArray([[m, new Instruction("EndRef", [endRef(l)(_c108)])]])))(_t116);
                        } else if (_arg1.head.Case === "T_NEWLINE") {
                            var _t117 = _arg1.tail;
                            return parseRec(m)(l + 1)(labels)(outLst)(_t117);
                        } else if (_arg1.head.Case === "T_ERROR") {
                            var _s49 = _arg1.head.Fields[0];
                            var _t118 = _arg1.tail;
                            return new _Error("Err", [l, fsFormat("Invalid input string: %s.")(function (x) {
                                return x;
                            })(_s49)]);
                        } else {
                            return _target156(_arg1.tail, _arg1.head);
                        }
                    };
                };
            };
        };
    };

    var matchValue = parseRec(0)(1)(create(null, new GenericComparer(function (x, y) {
        return x < y ? -1 : x > y ? 1 : 0;
    })))(new List$1())(tokLst);

    if (matchValue.Case === "Err") {
        return new _Error("Err", [matchValue.Fields[0], matchValue.Fields[1]]);
    } else {
        return new _Error("Ok", [create(matchValue.Fields[0], new GenericComparer(function (x, y) {
            return x < y ? -1 : x > y ? 1 : 0;
        }))]);
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

var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


var Token = function () {
    function Token(caseName, fields) {
        _classCallCheck$5(this, Token);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$5(Token, [{
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
                    T_DASH: [],
                    T_DCD: [],
                    T_END: ["function"],
                    T_EOR: ["function", "boolean"],
                    T_EQU: [],
                    T_EQUAL: [],
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
                    T_L_CBR: [],
                    T_MLA: ["function", "boolean"],
                    T_MOV: ["function", "boolean"],
                    T_MRS: ["function"],
                    T_MSR: ["function"],
                    T_MUL: ["function", "boolean"],
                    T_MVN: ["function", "boolean"],
                    T_NEWLINE: [],
                    T_NOP: ["function"],
                    T_ORR: ["function", "boolean"],
                    T_REG: ["number"],
                    T_RSB: ["function", "boolean"],
                    T_RSC: ["function", "boolean"],
                    T_R_BRAC: [],
                    T_R_CBR: [],
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
                var y = yobj;
                var matchValue = [this, y];

                var _target52 = function _target52() {
                    return false;
                };

                if (matchValue[0].Case === "T_REG") {
                    if (matchValue[1].Case === "T_REG") {
                        var ix = matchValue[0].Fields[0];
                        var iy = matchValue[1].Fields[0];
                        return ix === iy;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_INT") {
                    if (matchValue[1].Case === "T_INT") {
                        var _ix = matchValue[0].Fields[0];
                        var _iy = matchValue[1].Fields[0];
                        return _ix === _iy;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_LABEL") {
                    if (matchValue[1].Case === "T_LABEL") {
                        var sx = matchValue[0].Fields[0];
                        var sy = matchValue[1].Fields[0];
                        return sx === sy;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_COMMA") {
                    if (matchValue[1].Case === "T_COMMA") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_L_BRAC") {
                    if (matchValue[1].Case === "T_L_BRAC") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_R_BRAC") {
                    if (matchValue[1].Case === "T_R_BRAC") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_EXCL") {
                    if (matchValue[1].Case === "T_EXCL") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_L_CBR") {
                    if (matchValue[1].Case === "T_R_CBR") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_DASH") {
                    if (matchValue[1].Case === "T_DASH") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_NEWLINE") {
                    if (matchValue[1].Case === "T_NEWLINE") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_ERROR") {
                    if (matchValue[1].Case === "T_ERROR") {
                        var tx = matchValue[0].Fields[0];
                        var ty = matchValue[1].Fields[0];
                        return tx === ty;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_MOV") {
                    if (matchValue[1].Case === "T_MOV") {
                        var cx = matchValue[0].Fields[0];
                        var cy = matchValue[1].Fields[0];
                        var _sx = matchValue[0].Fields[1];
                        var _sy = matchValue[1].Fields[1];

                        if (cx(state) === cy(state)) {
                            return _sx === _sy;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_MVN") {
                    if (matchValue[1].Case === "T_MVN") {
                        var _cx = matchValue[0].Fields[0];
                        var _cy = matchValue[1].Fields[0];
                        var _sx2 = matchValue[0].Fields[1];
                        var _sy2 = matchValue[1].Fields[1];

                        if (_cx(state) === _cy(state)) {
                            return _sx2 === _sy2;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_MRS") {
                    if (matchValue[1].Case === "T_MRS") {
                        var _cx2 = matchValue[0].Fields[0];
                        var _cy2 = matchValue[1].Fields[0];
                        return _cx2(state) === _cy2(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_MSR") {
                    if (matchValue[1].Case === "T_MSR") {
                        var _cx3 = matchValue[0].Fields[0];
                        var _cy3 = matchValue[1].Fields[0];
                        return _cx3(state) === _cy3(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_ADD") {
                    if (matchValue[1].Case === "T_ADD") {
                        var _cx4 = matchValue[0].Fields[0];
                        var _cy4 = matchValue[1].Fields[0];
                        var _sx3 = matchValue[0].Fields[1];
                        var _sy3 = matchValue[1].Fields[1];

                        if (_cx4(state) === _cy4(state)) {
                            return _sx3 === _sy3;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_ADC") {
                    if (matchValue[1].Case === "T_ADC") {
                        var _cx5 = matchValue[0].Fields[0];
                        var _cy5 = matchValue[1].Fields[0];
                        var _sx4 = matchValue[0].Fields[1];
                        var _sy4 = matchValue[1].Fields[1];

                        if (_cx5(state) === _cy5(state)) {
                            return _sx4 === _sy4;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_SUB") {
                    if (matchValue[1].Case === "T_SUB") {
                        var _cx6 = matchValue[0].Fields[0];
                        var _cy6 = matchValue[1].Fields[0];
                        var _sx5 = matchValue[0].Fields[1];
                        var _sy5 = matchValue[1].Fields[1];

                        if (_cx6(state) === _cy6(state)) {
                            return _sx5 === _sy5;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_SBC") {
                    if (matchValue[1].Case === "T_SBC") {
                        var _cx7 = matchValue[0].Fields[0];
                        var _cy7 = matchValue[1].Fields[0];
                        var _sx6 = matchValue[0].Fields[1];
                        var _sy6 = matchValue[1].Fields[1];

                        if (_cx7(state) === _cy7(state)) {
                            return _sx6 === _sy6;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_RSB") {
                    if (matchValue[1].Case === "T_RSB") {
                        var _cx8 = matchValue[0].Fields[0];
                        var _cy8 = matchValue[1].Fields[0];
                        var _sx7 = matchValue[0].Fields[1];
                        var _sy7 = matchValue[1].Fields[1];

                        if (_cx8(state) === _cy8(state)) {
                            return _sx7 === _sy7;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_RSC") {
                    if (matchValue[1].Case === "T_RSC") {
                        var _cx9 = matchValue[0].Fields[0];
                        var _cy9 = matchValue[1].Fields[0];
                        var _sx8 = matchValue[0].Fields[1];
                        var _sy8 = matchValue[1].Fields[1];

                        if (_cx9(state) === _cy9(state)) {
                            return _sx8 === _sy8;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_MUL") {
                    if (matchValue[1].Case === "T_MUL") {
                        var _cx10 = matchValue[0].Fields[0];
                        var _cy10 = matchValue[1].Fields[0];
                        var _sx9 = matchValue[0].Fields[1];
                        var _sy9 = matchValue[1].Fields[1];

                        if (_cx10(state) === _cy10(state)) {
                            return _sx9 === _sy9;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_MLA") {
                    if (matchValue[1].Case === "T_MLA") {
                        var _cx11 = matchValue[0].Fields[0];
                        var _cy11 = matchValue[1].Fields[0];
                        var _sx10 = matchValue[0].Fields[1];
                        var _sy10 = matchValue[1].Fields[1];

                        if (_cx11(state) === _cy11(state)) {
                            return _sx10 === _sy10;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_AND") {
                    if (matchValue[1].Case === "T_AND") {
                        var _cx12 = matchValue[0].Fields[0];
                        var _cy12 = matchValue[1].Fields[0];
                        var _sx11 = matchValue[0].Fields[1];
                        var _sy11 = matchValue[1].Fields[1];

                        if (_cx12(state) === _cy12(state)) {
                            return _sx11 === _sy11;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_ORR") {
                    if (matchValue[1].Case === "T_ORR") {
                        var _cx13 = matchValue[0].Fields[0];
                        var _cy13 = matchValue[1].Fields[0];
                        var _sx12 = matchValue[0].Fields[1];
                        var _sy12 = matchValue[1].Fields[1];

                        if (_cx13(state) === _cy13(state)) {
                            return _sx12 === _sy12;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_EOR") {
                    if (matchValue[1].Case === "T_EOR") {
                        var _cx14 = matchValue[0].Fields[0];
                        var _cy14 = matchValue[1].Fields[0];
                        var _sx13 = matchValue[0].Fields[1];
                        var _sy13 = matchValue[1].Fields[1];

                        if (_cx14(state) === _cy14(state)) {
                            return _sx13 === _sy13;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_BIC") {
                    if (matchValue[1].Case === "T_BIC") {
                        var _cx15 = matchValue[0].Fields[0];
                        var _cy15 = matchValue[1].Fields[0];
                        var _sx14 = matchValue[0].Fields[1];
                        var _sy14 = matchValue[1].Fields[1];

                        if (_cx15(state) === _cy15(state)) {
                            return _sx14 === _sy14;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_CMP") {
                    if (matchValue[1].Case === "T_CMP") {
                        var _cx16 = matchValue[0].Fields[0];
                        var _cy16 = matchValue[1].Fields[0];
                        return _cx16(state) === _cy16(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_CMN") {
                    if (matchValue[1].Case === "T_CMN") {
                        var _cx17 = matchValue[0].Fields[0];
                        var _cy17 = matchValue[1].Fields[0];
                        return _cx17(state) === _cy17(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_TST") {
                    if (matchValue[1].Case === "T_TST") {
                        var _cx18 = matchValue[0].Fields[0];
                        var _cy18 = matchValue[1].Fields[0];
                        return _cx18(state) === _cy18(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_TEQ") {
                    if (matchValue[1].Case === "T_TEQ") {
                        var _cx19 = matchValue[0].Fields[0];
                        var _cy19 = matchValue[1].Fields[0];
                        return _cx19(state) === _cy19(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_B") {
                    if (matchValue[1].Case === "T_B") {
                        var _cx20 = matchValue[0].Fields[0];
                        var _cy20 = matchValue[1].Fields[0];
                        return _cx20(state) === _cy20(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_BL") {
                    if (matchValue[1].Case === "T_BL") {
                        var _cx21 = matchValue[0].Fields[0];
                        var _cy21 = matchValue[1].Fields[0];
                        return _cx21(state) === _cy21(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_BX") {
                    if (matchValue[1].Case === "T_BX") {
                        var _cx22 = matchValue[0].Fields[0];
                        var _cy22 = matchValue[1].Fields[0];
                        return _cx22(state) === _cy22(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_LDR") {
                    if (matchValue[1].Case === "T_LDR") {
                        var _cx23 = matchValue[0].Fields[0];
                        var _cy23 = matchValue[1].Fields[0];
                        return _cx23(state) === _cy23(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_LDRB") {
                    if (matchValue[1].Case === "T_LDRB") {
                        var _cx24 = matchValue[0].Fields[0];
                        var _cy24 = matchValue[1].Fields[0];
                        return _cx24(state) === _cy24(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_LDRH") {
                    if (matchValue[1].Case === "T_LDRH") {
                        var _cx25 = matchValue[0].Fields[0];
                        var _cy25 = matchValue[1].Fields[0];
                        return _cx25(state) === _cy25(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_LDM") {
                    if (matchValue[1].Case === "T_LDM") {
                        var _cx26 = matchValue[0].Fields[0];
                        var _cy26 = matchValue[1].Fields[0];
                        var _sx15 = matchValue[0].Fields[1];
                        var _sy15 = matchValue[1].Fields[1];

                        if (_cx26(state) === _cy26(state)) {
                            return _sx15.Equals(_sy15);
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_STR") {
                    if (matchValue[1].Case === "T_STR") {
                        var _cx27 = matchValue[0].Fields[0];
                        var _cy27 = matchValue[1].Fields[0];
                        return _cx27(state) === _cy27(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_STRB") {
                    if (matchValue[1].Case === "T_STRB") {
                        var _cx28 = matchValue[0].Fields[0];
                        var _cy28 = matchValue[1].Fields[0];
                        return _cx28(state) === _cy28(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_STRH") {
                    if (matchValue[1].Case === "T_STRH") {
                        var _cx29 = matchValue[0].Fields[0];
                        var _cy29 = matchValue[1].Fields[0];
                        return _cx29(state) === _cy29(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_STM") {
                    if (matchValue[1].Case === "T_STM") {
                        var _cx30 = matchValue[0].Fields[0];
                        var _cy30 = matchValue[1].Fields[0];
                        var _sx16 = matchValue[0].Fields[1];
                        var _sy16 = matchValue[1].Fields[1];

                        if (_cx30(state) === _cy30(state)) {
                            return _sx16.Equals(_sy16);
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_ADR") {
                    if (matchValue[1].Case === "T_ADR") {
                        var _cx31 = matchValue[0].Fields[0];
                        var _cy31 = matchValue[1].Fields[0];
                        return _cx31(state) === _cy31(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_SWP") {
                    if (matchValue[1].Case === "T_SWP") {
                        var _cx32 = matchValue[0].Fields[0];
                        var _cy32 = matchValue[1].Fields[0];
                        return _cx32(state) === _cy32(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_SWI") {
                    if (matchValue[1].Case === "T_SWI") {
                        var _cx33 = matchValue[0].Fields[0];
                        var _cy33 = matchValue[1].Fields[0];
                        return _cx33(state) === _cy33(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_NOP") {
                    if (matchValue[1].Case === "T_NOP") {
                        var _cx34 = matchValue[0].Fields[0];
                        var _cy34 = matchValue[1].Fields[0];
                        return _cx34(state) === _cy34(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_CLZ") {
                    if (matchValue[1].Case === "T_CLZ") {
                        var _cx35 = matchValue[0].Fields[0];
                        var _cy35 = matchValue[1].Fields[0];
                        return _cx35(state) === _cy35(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_DCD") {
                    if (matchValue[1].Case === "T_DCD") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_EQU") {
                    if (matchValue[1].Case === "T_EQU") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_FILL") {
                    if (matchValue[1].Case === "T_FILL") {
                        return true;
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_END") {
                    if (matchValue[1].Case === "T_END") {
                        var _cx36 = matchValue[0].Fields[0];
                        var _cy36 = matchValue[1].Fields[0];
                        return _cx36(state) === _cy36(state);
                    } else {
                        return _target52();
                    }
                } else if (matchValue[0].Case === "T_SHIFT") {
                    if (matchValue[1].Case === "T_SHIFT") {
                        var _cx37 = matchValue[0].Fields[1][0];
                        var _cy37 = matchValue[1].Fields[1][0];
                        var _sx17 = matchValue[0].Fields[1][1];
                        var _sy17 = matchValue[1].Fields[1][1];
                        var _tx = matchValue[0].Fields[0];
                        var _ty = matchValue[1].Fields[0];

                        if (_tx.Equals(_ty) ? _cx37(state) === _cy37(state) : false) {
                            return _sx17 === _sy17;
                        } else {
                            return false;
                        }
                    } else {
                        return _target52();
                    }
                } else {
                    return _target52();
                }
            } else {
                return false;
            }
        }
    }, {
        key: "GetHashCode",
        value: function () {
            return hash(1);
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
    }
}

function matchCond(_arg1) {
    var activePatternResult254 = _TOKEN_MATCH___("EQ", _arg1);

    if (activePatternResult254 != null) {
        return function (state) {
            return checkEQ(state);
        };
    } else {
        var activePatternResult252 = _TOKEN_MATCH___("NE", _arg1);

        if (activePatternResult252 != null) {
            return function (state) {
                return checkNE(state);
            };
        } else {
            var activePatternResult250 = _TOKEN_MATCH___("CS", _arg1);

            if (activePatternResult250 != null) {
                return function (state) {
                    return checkCS(state);
                };
            } else {
                var activePatternResult248 = _TOKEN_MATCH___("HS", _arg1);

                if (activePatternResult248 != null) {
                    return function (state) {
                        return checkCS(state);
                    };
                } else {
                    var activePatternResult246 = _TOKEN_MATCH___("CC", _arg1);

                    if (activePatternResult246 != null) {
                        return function (state) {
                            return checkCC(state);
                        };
                    } else {
                        var activePatternResult244 = _TOKEN_MATCH___("LO", _arg1);

                        if (activePatternResult244 != null) {
                            return function (state) {
                                return checkCC(state);
                            };
                        } else {
                            var activePatternResult242 = _TOKEN_MATCH___("MI", _arg1);

                            if (activePatternResult242 != null) {
                                return function (state) {
                                    return checkMI(state);
                                };
                            } else {
                                var activePatternResult240 = _TOKEN_MATCH___("PL", _arg1);

                                if (activePatternResult240 != null) {
                                    return function (state) {
                                        return checkPL(state);
                                    };
                                } else {
                                    var activePatternResult238 = _TOKEN_MATCH___("VS", _arg1);

                                    if (activePatternResult238 != null) {
                                        return function (state) {
                                            return checkVS(state);
                                        };
                                    } else {
                                        var activePatternResult236 = _TOKEN_MATCH___("VC", _arg1);

                                        if (activePatternResult236 != null) {
                                            return function (state) {
                                                return checkVC(state);
                                            };
                                        } else {
                                            var activePatternResult234 = _TOKEN_MATCH___("HI", _arg1);

                                            if (activePatternResult234 != null) {
                                                return function (state) {
                                                    return checkHI(state);
                                                };
                                            } else {
                                                var activePatternResult232 = _TOKEN_MATCH___("GE", _arg1);

                                                if (activePatternResult232 != null) {
                                                    return function (state) {
                                                        return checkGE(state);
                                                    };
                                                } else {
                                                    var activePatternResult230 = _TOKEN_MATCH___("LT", _arg1);

                                                    if (activePatternResult230 != null) {
                                                        return function (state) {
                                                            return checkLT(state);
                                                        };
                                                    } else {
                                                        var activePatternResult228 = _TOKEN_MATCH___("GT", _arg1);

                                                        if (activePatternResult228 != null) {
                                                            return function (state) {
                                                                return checkGT(state);
                                                            };
                                                        } else {
                                                            var activePatternResult226 = _TOKEN_MATCH___("LE", _arg1);

                                                            if (activePatternResult226 != null) {
                                                                return function (state) {
                                                                    return checkLE(state);
                                                                };
                                                            } else {
                                                                var activePatternResult224 = _TOKEN_MATCH___("AL", _arg1);

                                                                if (activePatternResult224 != null) {
                                                                    return function (state) {
                                                                        return checkAL(state);
                                                                    };
                                                                } else {
                                                                    return function (state) {
                                                                        return checkAL(state);
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
    var activePatternResult257 = _TOKEN_MATCH___("S", _arg1);

    if (activePatternResult257 != null) {
        return true;
    } else {
        return false;
    }
}
function matchLDM(_arg1) {
    var activePatternResult274 = _TOKEN_MATCH___("IA", _arg1);

    if (activePatternResult274 != null) {
        return new stackOrder("S_IA", []);
    } else {
        var activePatternResult272 = _TOKEN_MATCH___("IB", _arg1);

        if (activePatternResult272 != null) {
            return new stackOrder("S_IB", []);
        } else {
            var activePatternResult270 = _TOKEN_MATCH___("DA", _arg1);

            if (activePatternResult270 != null) {
                return new stackOrder("S_DA", []);
            } else {
                var activePatternResult268 = _TOKEN_MATCH___("DB", _arg1);

                if (activePatternResult268 != null) {
                    return new stackOrder("S_DB", []);
                } else {
                    var activePatternResult266 = _TOKEN_MATCH___("FD", _arg1);

                    if (activePatternResult266 != null) {
                        return new stackOrder("S_IA", []);
                    } else {
                        var activePatternResult264 = _TOKEN_MATCH___("ED", _arg1);

                        if (activePatternResult264 != null) {
                            return new stackOrder("S_IB", []);
                        } else {
                            var activePatternResult262 = _TOKEN_MATCH___("FA", _arg1);

                            if (activePatternResult262 != null) {
                                return new stackOrder("S_DA", []);
                            } else {
                                var activePatternResult260 = _TOKEN_MATCH___("EA", _arg1);

                                if (activePatternResult260 != null) {
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
    var activePatternResult291 = _TOKEN_MATCH___("IA", _arg1);

    if (activePatternResult291 != null) {
        return new stackOrder("S_IA", []);
    } else {
        var activePatternResult289 = _TOKEN_MATCH___("IB", _arg1);

        if (activePatternResult289 != null) {
            return new stackOrder("S_IB", []);
        } else {
            var activePatternResult287 = _TOKEN_MATCH___("DA", _arg1);

            if (activePatternResult287 != null) {
                return new stackOrder("S_DA", []);
            } else {
                var activePatternResult285 = _TOKEN_MATCH___("DB", _arg1);

                if (activePatternResult285 != null) {
                    return new stackOrder("S_DB", []);
                } else {
                    var activePatternResult283 = _TOKEN_MATCH___("EA", _arg1);

                    if (activePatternResult283 != null) {
                        return new stackOrder("S_IA", []);
                    } else {
                        var activePatternResult281 = _TOKEN_MATCH___("FA", _arg1);

                        if (activePatternResult281 != null) {
                            return new stackOrder("S_IB", []);
                        } else {
                            var activePatternResult279 = _TOKEN_MATCH___("ED", _arg1);

                            if (activePatternResult279 != null) {
                                return new stackOrder("S_DA", []);
                            } else {
                                var activePatternResult277 = _TOKEN_MATCH___("FD", _arg1);

                                if (activePatternResult277 != null) {
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
    }
}

function _INSTR_S_MATCH___(pattern, str) {
    var m = match(str, pattern + cond + setFlags + "$", 1);

    if (m != null) {
        return [matchCond(m[1]), matchS(m[2])];
    }
}

function _LDM_MATCH___(str) {
    var m = match(str, "^LDM" + stackSfx + cond + "$", 1);

    if (m != null) {
        return [matchCond(m[1]), matchLDM(m[2])];
    }
}

function _STM_MATCH___(str) {
    var m = match(str, "^STM" + stackSfx + cond + "$", 1);

    if (m != null) {
        return [matchCond(m[1]), matchSTM(m[2])];
    }
}

function _REG_MATCH___(str) {
    var m = match(str, "^R([0-9]|1[0-5])$", 1);

    if (m != null) {
        return Number.parseInt(m[1]);
    }
}

function _LABEL_MATCH___(str) {
    var m = match(str, "^([a-zA-Z_][a-zA-Z0-9_]*)$");

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
    var activePatternResult460 = _REG_MATCH___(_arg1);

    if (activePatternResult460 != null) {
        var i = activePatternResult460;
        return new Token("T_REG", [i]);
    } else {
        var activePatternResult459 = _TOKEN_MATCH___("^a1$", _arg1);

        if (activePatternResult459 != null) {
            return new Token("T_REG", [0]);
        } else {
            var activePatternResult457 = _TOKEN_MATCH___("^a2$", _arg1);

            if (activePatternResult457 != null) {
                return new Token("T_REG", [1]);
            } else {
                var activePatternResult455 = _TOKEN_MATCH___("^a3$", _arg1);

                if (activePatternResult455 != null) {
                    return new Token("T_REG", [2]);
                } else {
                    var activePatternResult453 = _TOKEN_MATCH___("^a4$", _arg1);

                    if (activePatternResult453 != null) {
                        return new Token("T_REG", [3]);
                    } else {
                        var activePatternResult451 = _TOKEN_MATCH___("^v1$", _arg1);

                        if (activePatternResult451 != null) {
                            return new Token("T_REG", [4]);
                        } else {
                            var activePatternResult449 = _TOKEN_MATCH___("^v2$", _arg1);

                            if (activePatternResult449 != null) {
                                return new Token("T_REG", [5]);
                            } else {
                                var activePatternResult447 = _TOKEN_MATCH___("^v3$", _arg1);

                                if (activePatternResult447 != null) {
                                    return new Token("T_REG", [6]);
                                } else {
                                    var activePatternResult445 = _TOKEN_MATCH___("^v4$", _arg1);

                                    if (activePatternResult445 != null) {
                                        return new Token("T_REG", [7]);
                                    } else {
                                        var activePatternResult443 = _TOKEN_MATCH___("^v5$", _arg1);

                                        if (activePatternResult443 != null) {
                                            return new Token("T_REG", [8]);
                                        } else {
                                            var activePatternResult441 = _TOKEN_MATCH___("^v6$", _arg1);

                                            if (activePatternResult441 != null) {
                                                return new Token("T_REG", [9]);
                                            } else {
                                                var activePatternResult439 = _TOKEN_MATCH___("^v7$", _arg1);

                                                if (activePatternResult439 != null) {
                                                    return new Token("T_REG", [10]);
                                                } else {
                                                    var activePatternResult437 = _TOKEN_MATCH___("^v8$", _arg1);

                                                    if (activePatternResult437 != null) {
                                                        return new Token("T_REG", [11]);
                                                    } else {
                                                        var activePatternResult435 = _TOKEN_MATCH___("^sb$", _arg1);

                                                        if (activePatternResult435 != null) {
                                                            return new Token("T_REG", [9]);
                                                        } else {
                                                            var activePatternResult433 = _TOKEN_MATCH___("^sl$", _arg1);

                                                            if (activePatternResult433 != null) {
                                                                return new Token("T_REG", [10]);
                                                            } else {
                                                                var activePatternResult431 = _TOKEN_MATCH___("^fp$", _arg1);

                                                                if (activePatternResult431 != null) {
                                                                    return new Token("T_REG", [11]);
                                                                } else {
                                                                    var activePatternResult429 = _TOKEN_MATCH___("^ip$", _arg1);

                                                                    if (activePatternResult429 != null) {
                                                                        return new Token("T_REG", [12]);
                                                                    } else {
                                                                        var activePatternResult427 = _TOKEN_MATCH___("^sp$", _arg1);

                                                                        if (activePatternResult427 != null) {
                                                                            return new Token("T_REG", [13]);
                                                                        } else {
                                                                            var activePatternResult425 = _TOKEN_MATCH___("^lr$", _arg1);

                                                                            if (activePatternResult425 != null) {
                                                                                return new Token("T_REG", [14]);
                                                                            } else {
                                                                                var activePatternResult423 = _TOKEN_MATCH___("^pc$", _arg1);

                                                                                if (activePatternResult423 != null) {
                                                                                    return new Token("T_REG", [15]);
                                                                                } else if (_arg1 === ",") {
                                                                                    return new Token("T_COMMA", []);
                                                                                } else if (_arg1 === "[") {
                                                                                    return new Token("T_L_BRAC", []);
                                                                                } else if (_arg1 === "]") {
                                                                                    return new Token("T_R_BRAC", []);
                                                                                } else if (_arg1 === "!") {
                                                                                    return new Token("T_EXCL", []);
                                                                                } else if (_arg1 === "=") {
                                                                                    return new Token("T_EQUAL", []);
                                                                                } else if (_arg1 === "{") {
                                                                                    return new Token("T_L_CBR", []);
                                                                                } else if (_arg1 === "}") {
                                                                                    return new Token("T_R_CBR", []);
                                                                                } else if (_arg1 === "-") {
                                                                                    return new Token("T_DASH", []);
                                                                                } else if (_arg1 === "\n") {
                                                                                    return new Token("T_NEWLINE", []);
                                                                                } else {
                                                                                    var activePatternResult421 = _DEC_LIT_MATCH___(_arg1);

                                                                                    if (activePatternResult421 != null) {
                                                                                        var _i = activePatternResult421;
                                                                                        return new Token("T_INT", [_i]);
                                                                                    } else {
                                                                                        var activePatternResult420 = _HEX_LIT_MATCH___(_arg1);

                                                                                        if (activePatternResult420 != null) {
                                                                                            var _i2 = activePatternResult420;
                                                                                            return new Token("T_INT", [_i2]);
                                                                                        } else {
                                                                                            var activePatternResult419 = _INSTR_S_MATCH___("^MOV", _arg1);

                                                                                            if (activePatternResult419 != null) {
                                                                                                var cs = activePatternResult419;
                                                                                                return function (tupledArg) {
                                                                                                    return new Token("T_MOV", [tupledArg[0], tupledArg[1]]);
                                                                                                }(cs);
                                                                                            } else {
                                                                                                var activePatternResult417 = _INSTR_S_MATCH___("^MVN", _arg1);

                                                                                                if (activePatternResult417 != null) {
                                                                                                    var _cs = activePatternResult417;
                                                                                                    return function (tupledArg) {
                                                                                                        return new Token("T_MVN", [tupledArg[0], tupledArg[1]]);
                                                                                                    }(_cs);
                                                                                                } else {
                                                                                                    var activePatternResult415 = _INSTR_MATCH___("^MRS", _arg1);

                                                                                                    if (activePatternResult415 != null) {
                                                                                                        var c = activePatternResult415;
                                                                                                        return new Token("T_MRS", [c]);
                                                                                                    } else {
                                                                                                        var activePatternResult413 = _INSTR_MATCH___("^MSR", _arg1);

                                                                                                        if (activePatternResult413 != null) {
                                                                                                            var _c = activePatternResult413;
                                                                                                            return new Token("T_MSR", [_c]);
                                                                                                        } else {
                                                                                                            var activePatternResult411 = _INSTR_S_MATCH___("^ADD", _arg1);

                                                                                                            if (activePatternResult411 != null) {
                                                                                                                var _cs2 = activePatternResult411;
                                                                                                                return function (tupledArg) {
                                                                                                                    return new Token("T_ADD", [tupledArg[0], tupledArg[1]]);
                                                                                                                }(_cs2);
                                                                                                            } else {
                                                                                                                var activePatternResult409 = _INSTR_S_MATCH___("^ADC", _arg1);

                                                                                                                if (activePatternResult409 != null) {
                                                                                                                    var _cs3 = activePatternResult409;
                                                                                                                    return function (tupledArg) {
                                                                                                                        return new Token("T_ADC", [tupledArg[0], tupledArg[1]]);
                                                                                                                    }(_cs3);
                                                                                                                } else {
                                                                                                                    var activePatternResult407 = _INSTR_S_MATCH___("^SUB", _arg1);

                                                                                                                    if (activePatternResult407 != null) {
                                                                                                                        var _cs4 = activePatternResult407;
                                                                                                                        return function (tupledArg) {
                                                                                                                            return new Token("T_SUB", [tupledArg[0], tupledArg[1]]);
                                                                                                                        }(_cs4);
                                                                                                                    } else {
                                                                                                                        var activePatternResult405 = _INSTR_S_MATCH___("^SBC", _arg1);

                                                                                                                        if (activePatternResult405 != null) {
                                                                                                                            var _cs5 = activePatternResult405;
                                                                                                                            return function (tupledArg) {
                                                                                                                                return new Token("T_SBC", [tupledArg[0], tupledArg[1]]);
                                                                                                                            }(_cs5);
                                                                                                                        } else {
                                                                                                                            var activePatternResult403 = _INSTR_S_MATCH___("^RSB", _arg1);

                                                                                                                            if (activePatternResult403 != null) {
                                                                                                                                var _cs6 = activePatternResult403;
                                                                                                                                return function (tupledArg) {
                                                                                                                                    return new Token("T_RSB", [tupledArg[0], tupledArg[1]]);
                                                                                                                                }(_cs6);
                                                                                                                            } else {
                                                                                                                                var activePatternResult401 = _INSTR_S_MATCH___("^RSC", _arg1);

                                                                                                                                if (activePatternResult401 != null) {
                                                                                                                                    var _cs7 = activePatternResult401;
                                                                                                                                    return function (tupledArg) {
                                                                                                                                        return new Token("T_RSC", [tupledArg[0], tupledArg[1]]);
                                                                                                                                    }(_cs7);
                                                                                                                                } else {
                                                                                                                                    var activePatternResult399 = _INSTR_S_MATCH___("^MUL", _arg1);

                                                                                                                                    if (activePatternResult399 != null) {
                                                                                                                                        var _cs8 = activePatternResult399;
                                                                                                                                        return function (tupledArg) {
                                                                                                                                            return new Token("T_MUL", [tupledArg[0], tupledArg[1]]);
                                                                                                                                        }(_cs8);
                                                                                                                                    } else {
                                                                                                                                        var activePatternResult397 = _INSTR_S_MATCH___("^MLA", _arg1);

                                                                                                                                        if (activePatternResult397 != null) {
                                                                                                                                            var _cs9 = activePatternResult397;
                                                                                                                                            return function (tupledArg) {
                                                                                                                                                return new Token("T_MLA", [tupledArg[0], tupledArg[1]]);
                                                                                                                                            }(_cs9);
                                                                                                                                        } else {
                                                                                                                                            var activePatternResult395 = _INSTR_S_MATCH___("^UMULL", _arg1);

                                                                                                                                            if (activePatternResult395 != null) {
                                                                                                                                                var _cs10 = activePatternResult395;
                                                                                                                                                return function (tupledArg) {
                                                                                                                                                    return new Token("T_UMULL", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                }(_cs10);
                                                                                                                                            } else {
                                                                                                                                                var activePatternResult393 = _INSTR_S_MATCH___("^UMLAL", _arg1);

                                                                                                                                                if (activePatternResult393 != null) {
                                                                                                                                                    var _cs11 = activePatternResult393;
                                                                                                                                                    return function (tupledArg) {
                                                                                                                                                        return new Token("T_UMLAL", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                    }(_cs11);
                                                                                                                                                } else {
                                                                                                                                                    var activePatternResult391 = _INSTR_S_MATCH___("^SMULL", _arg1);

                                                                                                                                                    if (activePatternResult391 != null) {
                                                                                                                                                        var _cs12 = activePatternResult391;
                                                                                                                                                        return function (tupledArg) {
                                                                                                                                                            return new Token("T_SMULL", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                        }(_cs12);
                                                                                                                                                    } else {
                                                                                                                                                        var activePatternResult389 = _INSTR_S_MATCH___("^SMLAL", _arg1);

                                                                                                                                                        if (activePatternResult389 != null) {
                                                                                                                                                            var _cs13 = activePatternResult389;
                                                                                                                                                            return function (tupledArg) {
                                                                                                                                                                return new Token("T_SMLAL", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                            }(_cs13);
                                                                                                                                                        } else {
                                                                                                                                                            var activePatternResult387 = _INSTR_S_MATCH___("^AND", _arg1);

                                                                                                                                                            if (activePatternResult387 != null) {
                                                                                                                                                                var _cs14 = activePatternResult387;
                                                                                                                                                                return function (tupledArg) {
                                                                                                                                                                    return new Token("T_AND", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                                }(_cs14);
                                                                                                                                                            } else {
                                                                                                                                                                var activePatternResult385 = _INSTR_S_MATCH___("^ORR", _arg1);

                                                                                                                                                                if (activePatternResult385 != null) {
                                                                                                                                                                    var _cs15 = activePatternResult385;
                                                                                                                                                                    return function (tupledArg) {
                                                                                                                                                                        return new Token("T_ORR", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                                    }(_cs15);
                                                                                                                                                                } else {
                                                                                                                                                                    var activePatternResult383 = _INSTR_S_MATCH___("^EOR", _arg1);

                                                                                                                                                                    if (activePatternResult383 != null) {
                                                                                                                                                                        var _cs16 = activePatternResult383;
                                                                                                                                                                        return function (tupledArg) {
                                                                                                                                                                            return new Token("T_EOR", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                                        }(_cs16);
                                                                                                                                                                    } else {
                                                                                                                                                                        var activePatternResult381 = _INSTR_S_MATCH___("^BIC", _arg1);

                                                                                                                                                                        if (activePatternResult381 != null) {
                                                                                                                                                                            var _cs17 = activePatternResult381;
                                                                                                                                                                            return function (tupledArg) {
                                                                                                                                                                                return new Token("T_BIC", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                                            }(_cs17);
                                                                                                                                                                        } else {
                                                                                                                                                                            var activePatternResult379 = _INSTR_MATCH___("^CMP", _arg1);

                                                                                                                                                                            if (activePatternResult379 != null) {
                                                                                                                                                                                var _c2 = activePatternResult379;
                                                                                                                                                                                return new Token("T_CMP", [_c2]);
                                                                                                                                                                            } else {
                                                                                                                                                                                var activePatternResult377 = _INSTR_MATCH___("^CMN", _arg1);

                                                                                                                                                                                if (activePatternResult377 != null) {
                                                                                                                                                                                    var _c3 = activePatternResult377;
                                                                                                                                                                                    return new Token("T_CMN", [_c3]);
                                                                                                                                                                                } else {
                                                                                                                                                                                    var activePatternResult375 = _INSTR_MATCH___("^TST", _arg1);

                                                                                                                                                                                    if (activePatternResult375 != null) {
                                                                                                                                                                                        var _c4 = activePatternResult375;
                                                                                                                                                                                        return new Token("T_TST", [_c4]);
                                                                                                                                                                                    } else {
                                                                                                                                                                                        var activePatternResult373 = _INSTR_MATCH___("^TEQ", _arg1);

                                                                                                                                                                                        if (activePatternResult373 != null) {
                                                                                                                                                                                            var _c5 = activePatternResult373;
                                                                                                                                                                                            return new Token("T_TEQ", [_c5]);
                                                                                                                                                                                        } else {
                                                                                                                                                                                            var activePatternResult371 = _INSTR_MATCH___("^B", _arg1);

                                                                                                                                                                                            if (activePatternResult371 != null) {
                                                                                                                                                                                                var _c6 = activePatternResult371;
                                                                                                                                                                                                return new Token("T_B", [_c6]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                var activePatternResult369 = _INSTR_MATCH___("^BL", _arg1);

                                                                                                                                                                                                if (activePatternResult369 != null) {
                                                                                                                                                                                                    var _c7 = activePatternResult369;
                                                                                                                                                                                                    return new Token("T_BL", [_c7]);
                                                                                                                                                                                                } else {
                                                                                                                                                                                                    var activePatternResult367 = _INSTR_MATCH___("^BX", _arg1);

                                                                                                                                                                                                    if (activePatternResult367 != null) {
                                                                                                                                                                                                        var _c8 = activePatternResult367;
                                                                                                                                                                                                        return new Token("T_BX", [_c8]);
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        var activePatternResult365 = _INSTR_MATCH___("^LDR", _arg1);

                                                                                                                                                                                                        if (activePatternResult365 != null) {
                                                                                                                                                                                                            var _c9 = activePatternResult365;
                                                                                                                                                                                                            return new Token("T_LDR", [_c9]);
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            var activePatternResult363 = _INSTR_MATCH___("^LDRB", _arg1);

                                                                                                                                                                                                            if (activePatternResult363 != null) {
                                                                                                                                                                                                                var _c10 = activePatternResult363;
                                                                                                                                                                                                                return new Token("T_LDRB", [_c10]);
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                var activePatternResult361 = _INSTR_MATCH___("^LDRH", _arg1);

                                                                                                                                                                                                                if (activePatternResult361 != null) {
                                                                                                                                                                                                                    var _c11 = activePatternResult361;
                                                                                                                                                                                                                    return new Token("T_LDRH", [_c11]);
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    var activePatternResult359 = _LDM_MATCH___(_arg1);

                                                                                                                                                                                                                    if (activePatternResult359 != null) {
                                                                                                                                                                                                                        var _cs18 = activePatternResult359;
                                                                                                                                                                                                                        return function (tupledArg) {
                                                                                                                                                                                                                            return new Token("T_LDM", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                                                                                        }(_cs18);
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        var activePatternResult358 = _INSTR_MATCH___("^STR", _arg1);

                                                                                                                                                                                                                        if (activePatternResult358 != null) {
                                                                                                                                                                                                                            var _c12 = activePatternResult358;
                                                                                                                                                                                                                            return new Token("T_STR", [_c12]);
                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                            var activePatternResult356 = _INSTR_MATCH___("^STRB", _arg1);

                                                                                                                                                                                                                            if (activePatternResult356 != null) {
                                                                                                                                                                                                                                var _c13 = activePatternResult356;
                                                                                                                                                                                                                                return new Token("T_STRB", [_c13]);
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                var activePatternResult354 = _INSTR_MATCH___("^STRH", _arg1);

                                                                                                                                                                                                                                if (activePatternResult354 != null) {
                                                                                                                                                                                                                                    var _c14 = activePatternResult354;
                                                                                                                                                                                                                                    return new Token("T_STRH", [_c14]);
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    var activePatternResult352 = _STM_MATCH___(_arg1);

                                                                                                                                                                                                                                    if (activePatternResult352 != null) {
                                                                                                                                                                                                                                        var _cs19 = activePatternResult352;
                                                                                                                                                                                                                                        return function (tupledArg) {
                                                                                                                                                                                                                                            return new Token("T_STM", [tupledArg[0], tupledArg[1]]);
                                                                                                                                                                                                                                        }(_cs19);
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        var activePatternResult351 = _INSTR_MATCH___("^SWP", _arg1);

                                                                                                                                                                                                                                        if (activePatternResult351 != null) {
                                                                                                                                                                                                                                            var _c15 = activePatternResult351;
                                                                                                                                                                                                                                            return new Token("T_SWP", [_c15]);
                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                            var activePatternResult349 = _INSTR_MATCH___("^SWI", _arg1);

                                                                                                                                                                                                                                            if (activePatternResult349 != null) {
                                                                                                                                                                                                                                                var _c16 = activePatternResult349;
                                                                                                                                                                                                                                                return new Token("T_SWI", [_c16]);
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                var activePatternResult347 = _INSTR_MATCH___("^NOP", _arg1);

                                                                                                                                                                                                                                                if (activePatternResult347 != null) {
                                                                                                                                                                                                                                                    var _c17 = activePatternResult347;
                                                                                                                                                                                                                                                    return new Token("T_NOP", [_c17]);
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                    var activePatternResult345 = _INSTR_MATCH___("^ADR", _arg1);

                                                                                                                                                                                                                                                    if (activePatternResult345 != null) {
                                                                                                                                                                                                                                                        var _c18 = activePatternResult345;
                                                                                                                                                                                                                                                        return new Token("T_ADR", [_c18]);
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                        var activePatternResult343 = _INSTR_MATCH___("^END", _arg1);

                                                                                                                                                                                                                                                        if (activePatternResult343 != null) {
                                                                                                                                                                                                                                                            var _c19 = activePatternResult343;
                                                                                                                                                                                                                                                            return new Token("T_END", [_c19]);
                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                            var activePatternResult341 = _INSTR_MATCH___("^CLZ", _arg1);

                                                                                                                                                                                                                                                            if (activePatternResult341 != null) {
                                                                                                                                                                                                                                                                var _c20 = activePatternResult341;
                                                                                                                                                                                                                                                                return new Token("T_CLZ", [_c20]);
                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                var activePatternResult339 = _TOKEN_MATCH___("^DCD$", _arg1);

                                                                                                                                                                                                                                                                if (activePatternResult339 != null) {
                                                                                                                                                                                                                                                                    return new Token("T_DCD", []);
                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                    var activePatternResult337 = _TOKEN_MATCH___("^EQU$", _arg1);

                                                                                                                                                                                                                                                                    if (activePatternResult337 != null) {
                                                                                                                                                                                                                                                                        return new Token("T_EQU", []);
                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                        var activePatternResult335 = _TOKEN_MATCH___("^FILL$", _arg1);

                                                                                                                                                                                                                                                                        if (activePatternResult335 != null) {
                                                                                                                                                                                                                                                                            return new Token("T_FILL", []);
                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                            var activePatternResult333 = _INSTR_S_MATCH___("^ASR", _arg1);

                                                                                                                                                                                                                                                                            if (activePatternResult333 != null) {
                                                                                                                                                                                                                                                                                var _cs20 = activePatternResult333;
                                                                                                                                                                                                                                                                                return new Token("T_SHIFT", [new shiftOp("T_ASR", []), _cs20]);
                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                var activePatternResult331 = _INSTR_S_MATCH___("^LSL", _arg1);

                                                                                                                                                                                                                                                                                if (activePatternResult331 != null) {
                                                                                                                                                                                                                                                                                    var _cs21 = activePatternResult331;
                                                                                                                                                                                                                                                                                    return new Token("T_SHIFT", [new shiftOp("T_LSL", []), _cs21]);
                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                    var activePatternResult329 = _INSTR_S_MATCH___("^LSR", _arg1);

                                                                                                                                                                                                                                                                                    if (activePatternResult329 != null) {
                                                                                                                                                                                                                                                                                        var _cs22 = activePatternResult329;
                                                                                                                                                                                                                                                                                        return new Token("T_SHIFT", [new shiftOp("T_LSR", []), _cs22]);
                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                        var activePatternResult327 = _INSTR_S_MATCH___("^ROR", _arg1);

                                                                                                                                                                                                                                                                                        if (activePatternResult327 != null) {
                                                                                                                                                                                                                                                                                            var _cs23 = activePatternResult327;
                                                                                                                                                                                                                                                                                            return new Token("T_SHIFT", [new shiftOp("T_ROR", []), _cs23]);
                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                            var activePatternResult325 = _INSTR_S_MATCH___("^RRX", _arg1);

                                                                                                                                                                                                                                                                                            if (activePatternResult325 != null) {
                                                                                                                                                                                                                                                                                                var _cs24 = activePatternResult325;
                                                                                                                                                                                                                                                                                                return new Token("T_SHIFT", [new shiftOp("T_RRX", []), _cs24]);
                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                var activePatternResult323 = _LABEL_MATCH___(_arg1);

                                                                                                                                                                                                                                                                                                if (activePatternResult323 != null) {
                                                                                                                                                                                                                                                                                                    var s = activePatternResult323;
                                                                                                                                                                                                                                                                                                    return new Token("T_LABEL", [s]);
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
        return map$1(function (_arg1) {
            return stringToToken(_arg1);
        }, list);
    }(filter$$1(function (s) {
        return s !== "";
    }, filter$$1(function (s) {
        return s != null;
    }, toList(split$1(source, "([,\\[\\]!\\n])|[\\ \\t\\r\\f]+|;.*")))));
}

function newState(oldState, inString) {
    return wrapErr(function (instr) {
        return interpret(oldState, instr);
    }, parser(tokenise(inString)));
}

(function (args) {
    var regs = document.getElementById("regs");
    var errorBox = document.getElementById("errorBox");
    var compileAllBtn = document.getElementById("compileAllBtn");
    var saveCodeMirror$$1 = saveCodeMirror;
    var initializeCodeMirror$$1 = initializeCodeMirror;
    var cmEditor = initializeCodeMirror$$1();

    var getRegisterTable = function getRegisterTable(valid) {
        return function (regState) {
            return div(ofArray([table(ofArray([op_PercentEquals("class", "table table-striped table-condensed"), thead(ofArray([tr(ofArray([th(op_Splice("Register")), th(op_Splice("Value"))]))])), tbody(ofArray([op_PercentEquals("class", valid ? "black" : "red"), div(toList(delay(function () {
                return map$2(function (i) {
                    return tr(ofArray([th(op_Splice(fsFormat("R%A")(function (x) {
                        return x;
                    })(i))), th(valid ? op_Splice(fsFormat("%A")(function (x) {
                        return x;
                    })(readReg(i, regState))) : op_Splice(fsFormat("X")(function (x) {
                        return x;
                    })))]));
                }, range(0, 15));
            })))]))])), br(new List$1()), table(ofArray([op_PercentEquals("class", "table table-striped table-condensed"), thead(ofArray([tr(ofArray([th(op_Splice("Flag")), th(op_Splice("Value"))]))])), tbody(ofArray([op_PercentEquals("class", valid ? "black" : "red"), div(ofArray([tr(ofArray([th(op_Splice(fsFormat("N")(function (x) {
                return x;
            }))), th(valid ? op_Splice(fsFormat("%A")(function (x) {
                return x;
            })(readNFlag(regState))) : op_Splice(fsFormat("X")(function (x) {
                return x;
            })))])), tr(ofArray([th(op_Splice(fsFormat("Z")(function (x) {
                return x;
            }))), th(valid ? op_Splice(fsFormat("%A")(function (x) {
                return x;
            })(readZFlag(regState))) : op_Splice(fsFormat("X")(function (x) {
                return x;
            })))])), tr(ofArray([th(op_Splice(fsFormat("C")(function (x) {
                return x;
            }))), th(valid ? op_Splice(fsFormat("%A")(function (x) {
                return x;
            })(readCFlag(regState))) : op_Splice(fsFormat("X")(function (x) {
                return x;
            })))])), tr(ofArray([th(op_Splice(fsFormat("V")(function (x) {
                return x;
            }))), th(valid ? op_Splice(fsFormat("%A")(function (x) {
                return x;
            })(readVFlag(regState))) : op_Splice(fsFormat("X")(function (x) {
                return x;
            })))]))]))]))]))]));
        };
    };

    var compileAll = function compileAll() {
        var code = saveCodeMirror$$1(cmEditor);
        var state = initStateVisual;
        var nState = newState(state, code);
        var registerString = nState.Case === "Err" ? Html.toString(getRegisterTable(false)(initState)) : function () {
            var s = nState.Fields[0][1];
            var i = nState.Fields[0][0];
            return Html.toString(getRegisterTable(true)(s));
        }();
        var errorString = nState.Case === "Err" ? fsFormat("ERROR ON LINE %i\t %s")(function (x) {
            return x;
        })(nState.Fields[0])(nState.Fields[1]) : function () {
            var s = nState.Fields[0][1];
            var i = nState.Fields[0][0];
            return fsFormat("Compiled %i lines")(function (x) {
                return x;
            })(i);
        }();
        fsFormat("%A")(function (x) {
            console.log(x);
        })(registerString);
        regs.innerHTML = registerString;
        errorBox.innerHTML = errorString;
    };

    compileAllBtn.addEventListener('click', function (_arg1) {
        compileAll();
        return null;
    });
    return 0;
})(process.argv.slice(2));

})));

//# sourceMappingURL=main_fable.js.map