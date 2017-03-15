(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.Main = global.Main || {})));
}(this, (function (exports) { 'use strict';

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

function __failIfNone(res) {
    if (res == null)
        throw new Error("Seq did not contain any matching element");
    return res;
}
function toList(xs) {
    return foldBack(function (x, acc) {
        return new List(x, acc);
    }, xs, new List());
}
function ofList(xs) {
    return delay(function () { return unfold(function (x) { return x.tail != null ? [x.head, x.tail] : null; }, xs); });
}






function choose(f, xs) {
    var trySkipToNext = function (iter) {
        var cur = iter.next();
        if (!cur.done) {
            var y = f(cur.value);
            return y != null ? [y, iter] : trySkipToNext(iter);
        }
        return void 0;
    };
    return delay(function () {
        return unfold(function (iter) {
            return trySkipToNext(iter);
        }, xs[Symbol.iterator]());
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






function exists(f, xs) {
    function aux(iter) {
        var cur = iter.next();
        return !cur.done && (f(cur.value) || aux(iter));
    }
    return aux(xs[Symbol.iterator]());
}

function filter(f, xs) {
    function trySkipToNext(iter) {
        var cur = iter.next();
        while (!cur.done) {
            if (f(cur.value)) {
                return [cur.value, iter];
            }
            cur = iter.next();
        }
        return void 0;
    }
    return delay(function () { return unfold(trySkipToNext, xs[Symbol.iterator]()); });
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


function forAll(f, xs) {
    return fold(function (acc, x) { return acc && f(x); }, true, xs);
}





function tryItem(i, xs) {
    if (i < 0)
        return null;
    if (Array.isArray(xs) || ArrayBuffer.isView(xs))
        return i < xs.length ? xs[i] : null;
    for (var j = 0, iter = xs[Symbol.iterator]();; j++) {
        var cur = iter.next();
        if (cur.done)
            return null;
        if (j === i)
            return cur.value;
    }
}
function item(i, xs) {
    return __failIfNone(tryItem(i, xs));
}
function iterate(f, xs) {
    fold(function (_, x) { return f(x); }, null, xs);
}




function tryLast(xs) {
    try {
        return reduce(function (_, x) { return x; }, xs);
    }
    catch (err) {
        return null;
    }
}
function last(xs) {
    return __failIfNone(tryLast(xs));
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











function rangeChar(first, last) {
    return delay(function () { return unfold(function (x) { return x <= last ? [x, String.fromCharCode(x.charCodeAt(0) + 1)] : null; }, first); });
}


function reduce(f, xs) {
    if (Array.isArray(xs) || ArrayBuffer.isView(xs))
        return xs.reduce(f);
    var iter = xs[Symbol.iterator]();
    var cur = iter.next();
    if (cur.done)
        throw new Error("Seq was empty");
    var acc = cur.value;
    for (;;) {
        cur = iter.next();
        if (cur.done)
            break;
        acc = f(acc, cur.value);
    }
    return acc;
}



function scan(f, seed, xs) {
    return delay(function () {
        var iter = xs[Symbol.iterator]();
        return unfold(function (acc) {
            if (acc == null)
                return [seed, seed];
            var cur = iter.next();
            if (!cur.done) {
                acc = f(acc, cur.value);
                return [acc, acc];
            }
            return void 0;
        }, null);
    });
}


function skip(n, xs) {
    return _a = {},
        _a[Symbol.iterator] = function () {
            var iter = xs[Symbol.iterator]();
            for (var i = 1; i <= n; i++)
                if (iter.next().done)
                    throw new Error("Seq has not enough elements");
            return iter;
        },
        _a;
    var _a;
}
function skipWhile(f, xs) {
    return delay(function () {
        var hasPassed = false;
        return filter(function (x) { return hasPassed || (hasPassed = !f(x)); }, xs);
    });
}




function take(n, xs, truncate) {
    if (truncate === void 0) { truncate = false; }
    return delay(function () {
        var iter = xs[Symbol.iterator]();
        return unfold(function (i) {
            if (i < n) {
                var cur = iter.next();
                if (!cur.done)
                    return [cur.value, i + 1];
                if (!truncate)
                    throw new Error("Seq has not enough elements");
            }
            return void 0;
        }, 0);
    });
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
function find(f, xs) {
    return __failIfNone(tryFind(f, xs));
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

function append$1(xs, ys) {
    return fold(function (acc, x) { return new List(x, acc); }, ys, reverse$1(xs));
}


// TODO: should be xs: Iterable<List<T>>




function map$1(f, xs) {
    return reverse$1(fold(function (acc, x) { return new List(f(x), acc); }, new List(), xs));
}



function reverse$1(xs) {
    return fold(function (acc, x) { return new List(x, acc); }, new List(), xs);
}

function slice(lower, upper, xs) {
    var noLower = (lower == null);
    var noUpper = (upper == null);
    return reverse$1(fold(function (acc, x, i) { return (noLower || lower <= i) && (noUpper || i <= upper) ? new List(x, acc) : acc; }, new List(), xs));
}
/* ToDo: instance unzip() */

/* ToDo: instance unzip3() */

// ----------------------------------------------
// These functions belong to Seq.ts but are
// implemented here to prevent cyclic dependencies
function distinctBy(f, xs) {
    return choose(function (tup) { return tup[0]; }, scan(function (tup, x) {
        var acc = tup[1];
        var k = f(x);
        return acc.has(k) ? [null, acc] : [x, add$1(k, acc)];
    }, [null, create$1()], xs));
}
function distinct(xs) {
    return distinctBy(function (x) { return x; }, xs);
}
var SetTree = (function () {
    function SetTree(caseName, fields) {
        this.Case = caseName;
        this.Fields = fields;
    }
    return SetTree;
}());
var tree_tolerance = 2;
function tree_countAux(s, acc) {
    return s.Case === "SetOne" ? acc + 1 : s.Case === "SetEmpty" ? acc : tree_countAux(s.Fields[1], tree_countAux(s.Fields[2], acc + 1));
}
function tree_count(s) {
    return tree_countAux(s, 0);
}
function tree_SetOne(n) {
    return new SetTree("SetOne", [n]);
}
function tree_SetNode(x, l, r, h) {
    return new SetTree("SetNode", [x, l, r, h]);
}
function tree_height$1(t) {
    return t.Case === "SetOne" ? 1 : t.Case === "SetNode" ? t.Fields[3] : 0;
}
function tree_mk$1(l, k, r) {
    var matchValue = [l, r];
    var $target1 = function () {
        var hl = tree_height$1(l);
        var hr = tree_height$1(r);
        var m = hl < hr ? hr : hl;
        return tree_SetNode(k, l, r, m + 1);
    };
    if (matchValue[0].Case === "SetEmpty") {
        if (matchValue[1].Case === "SetEmpty") {
            return tree_SetOne(k);
        }
        else {
            return $target1();
        }
    }
    else {
        return $target1();
    }
}
function tree_rebalance$1(t1, k, t2) {
    var t1h = tree_height$1(t1);
    var t2h = tree_height$1(t2);
    if (t2h > t1h + tree_tolerance) {
        if (t2.Case === "SetNode") {
            if (tree_height$1(t2.Fields[1]) > t1h + 1) {
                if (t2.Fields[1].Case === "SetNode") {
                    return tree_mk$1(tree_mk$1(t1, k, t2.Fields[1].Fields[1]), t2.Fields[1].Fields[0], tree_mk$1(t2.Fields[1].Fields[2], t2.Fields[0], t2.Fields[2]));
                }
                else {
                    throw new Error("rebalance");
                }
            }
            else {
                return tree_mk$1(tree_mk$1(t1, k, t2.Fields[1]), t2.Fields[0], t2.Fields[2]);
            }
        }
        else {
            throw new Error("rebalance");
        }
    }
    else {
        if (t1h > t2h + tree_tolerance) {
            if (t1.Case === "SetNode") {
                if (tree_height$1(t1.Fields[2]) > t2h + 1) {
                    if (t1.Fields[2].Case === "SetNode") {
                        return tree_mk$1(tree_mk$1(t1.Fields[1], t1.Fields[0], t1.Fields[2].Fields[1]), t1.Fields[2].Fields[0], tree_mk$1(t1.Fields[2].Fields[2], k, t2));
                    }
                    else {
                        throw new Error("rebalance");
                    }
                }
                else {
                    return tree_mk$1(t1.Fields[1], t1.Fields[0], tree_mk$1(t1.Fields[2], k, t2));
                }
            }
            else {
                throw new Error("rebalance");
            }
        }
        else {
            return tree_mk$1(t1, k, t2);
        }
    }
}
function tree_add$1(comparer, k, t) {
    return t.Case === "SetOne" ? (function () {
        var c = comparer.Compare(k, t.Fields[0]);
        if (c < 0) {
            return tree_SetNode(k, new SetTree("SetEmpty", []), t, 2);
        }
        else {
            if (c === 0) {
                return t;
            }
            else {
                return tree_SetNode(k, t, new SetTree("SetEmpty", []), 2);
            }
        }
    })() : t.Case === "SetEmpty" ? tree_SetOne(k) : (function () {
        var c = comparer.Compare(k, t.Fields[0]);
        if (c < 0) {
            return tree_rebalance$1(tree_add$1(comparer, k, t.Fields[1]), t.Fields[0], t.Fields[2]);
        }
        else {
            if (c === 0) {
                return t;
            }
            else {
                return tree_rebalance$1(t.Fields[1], t.Fields[0], tree_add$1(comparer, k, t.Fields[2]));
            }
        }
    })();
}
function tree_mem$1(comparer, k, t) {
    return t.Case === "SetOne" ? comparer.Compare(k, t.Fields[0]) === 0 : t.Case === "SetEmpty" ? false : (function () {
        var c = comparer.Compare(k, t.Fields[0]);
        if (c < 0) {
            return tree_mem$1(comparer, k, t.Fields[1]);
        }
        else {
            if (c === 0) {
                return true;
            }
            else {
                return tree_mem$1(comparer, k, t.Fields[2]);
            }
        }
    })();
}
function tree_forall$1(f, m) {
    return m.Case === "SetOne" ? f(m.Fields[0]) : m.Case === "SetEmpty" ? true : (f(m.Fields[0]) ? tree_forall$1(f, m.Fields[1]) : false) ? tree_forall$1(f, m.Fields[2]) : false;
}
function tree_exists$1(f, m) {
    return m.Case === "SetOne" ? f(m.Fields[0]) : m.Case === "SetEmpty" ? false : (f(m.Fields[0]) ? true : tree_exists$1(f, m.Fields[1])) ? true : tree_exists$1(f, m.Fields[2]);
}
function tree_subset(comparer, a, b) {
    return tree_forall$1(function (x) { return tree_mem$1(comparer, x, b); }, a);
}
function tree_psubset(comparer, a, b) {
    return tree_forall$1(function (x) { return tree_mem$1(comparer, x, b); }, a) ? tree_exists$1(function (x) { return !tree_mem$1(comparer, x, a); }, b) : false;
}
function tree_collapseLHS$1(stack) {
    return stack.tail != null
        ? stack.head.Case === "SetOne"
            ? stack
            : stack.head.Case === "SetNode"
                ? tree_collapseLHS$1(ofArray$1([
                    stack.head.Fields[1],
                    tree_SetOne(stack.head.Fields[0]),
                    stack.head.Fields[2]
                ], stack.tail))
                : tree_collapseLHS$1(stack.tail)
        : new List();
}
function tree_mkIterator$1(s) {
    return { stack: tree_collapseLHS$1(new List(s, new List())), started: false };
}

// function tree_notStarted() {
//   throw new Error("Enumeration not started");
// };
// var alreadyFinished = $exports.alreadyFinished = function () {
//   throw new Error("Enumeration already started");
// };
function tree_moveNext$1(i) {
    function current(i) {
        if (i.stack.tail == null) {
            return null;
        }
        else if (i.stack.head.Case === "SetOne") {
            return i.stack.head.Fields[0];
        }
        throw new Error("Please report error: Set iterator, unexpected stack for current");
    }
    if (i.started) {
        if (i.stack.tail == null) {
            return { done: true, value: null };
        }
        else {
            if (i.stack.head.Case === "SetOne") {
                i.stack = tree_collapseLHS$1(i.stack.tail);
                return {
                    done: i.stack.tail == null,
                    value: current(i)
                };
            }
            else {
                throw new Error("Please report error: Set iterator, unexpected stack for moveNext");
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
function tree_compareStacks(comparer, l1, l2) {
    var $target8 = function (n1k, t1) { return tree_compareStacks(comparer, ofArray$1([new SetTree("SetEmpty", []), tree_SetOne(n1k)], t1), l2); };
    var $target9 = function (n1k, n1l, n1r, t1) { return tree_compareStacks(comparer, ofArray$1([n1l, tree_SetNode(n1k, new SetTree("SetEmpty", []), n1r, 0)], t1), l2); };
    var $target11 = function (n2k, n2l, n2r, t2) { return tree_compareStacks(comparer, l1, ofArray$1([n2l, tree_SetNode(n2k, new SetTree("SetEmpty", []), n2r, 0)], t2)); };
    if (l1.tail != null) {
        if (l2.tail != null) {
            if (l2.head.Case === "SetOne") {
                if (l1.head.Case === "SetOne") {
                    var n1k = l1.head.Fields[0], n2k = l2.head.Fields[0], t1 = l1.tail, t2 = l2.tail, c = comparer.Compare(n1k, n2k);
                    if (c !== 0) {
                        return c;
                    }
                    else {
                        return tree_compareStacks(comparer, t1, t2);
                    }
                }
                else {
                    if (l1.head.Case === "SetNode") {
                        if (l1.head.Fields[1].Case === "SetEmpty") {
                            var emp = l1.head.Fields[1], n1k = l1.head.Fields[0], n1r = l1.head.Fields[2], n2k = l2.head.Fields[0], t1 = l1.tail, t2 = l2.tail, c = comparer.Compare(n1k, n2k);
                            if (c !== 0) {
                                return c;
                            }
                            else {
                                return tree_compareStacks(comparer, ofArray$1([n1r], t1), ofArray$1([emp], t2));
                            }
                        }
                        else {
                            return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                        }
                    }
                    else {
                        var n2k = l2.head.Fields[0], t2 = l2.tail;
                        return tree_compareStacks(comparer, l1, ofArray$1([new SetTree("SetEmpty", []), tree_SetOne(n2k)], t2));
                    }
                }
            }
            else {
                if (l2.head.Case === "SetNode") {
                    if (l2.head.Fields[1].Case === "SetEmpty") {
                        if (l1.head.Case === "SetOne") {
                            var n1k = l1.head.Fields[0], n2k = l2.head.Fields[0], n2r = l2.head.Fields[2], t1 = l1.tail, t2 = l2.tail, c = comparer.Compare(n1k, n2k);
                            if (c !== 0) {
                                return c;
                            }
                            else {
                                return tree_compareStacks(comparer, ofArray$1([new SetTree("SetEmpty", [])], t1), ofArray$1([n2r], t2));
                            }
                        }
                        else {
                            if (l1.head.Case === "SetNode") {
                                if (l1.head.Fields[1].Case === "SetEmpty") {
                                    var n1k = l1.head.Fields[0], n1r = l1.head.Fields[2], n2k = l2.head.Fields[0], n2r = l2.head.Fields[2], t1 = l1.tail, t2 = l2.tail, c = comparer.Compare(n1k, n2k);
                                    if (c !== 0) {
                                        return c;
                                    }
                                    else {
                                        return tree_compareStacks(comparer, ofArray$1([n1r], t1), ofArray$1([n2r], t2));
                                    }
                                }
                                else {
                                    return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                                }
                            }
                            else {
                                return $target11(l2.head.Fields[0], l2.head.Fields[1], l2.head.Fields[2], l2.tail);
                            }
                        }
                    }
                    else {
                        if (l1.head.Case === "SetOne") {
                            return $target8(l1.head.Fields[0], l1.tail);
                        }
                        else {
                            if (l1.head.Case === "SetNode") {
                                return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                            }
                            else {
                                return $target11(l2.head.Fields[0], l2.head.Fields[1], l2.head.Fields[2], l2.tail);
                            }
                        }
                    }
                }
                else {
                    if (l1.head.Case === "SetOne") {
                        return $target8(l1.head.Fields[0], l1.tail);
                    }
                    else {
                        if (l1.head.Case === "SetNode") {
                            return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                        }
                        else {
                            return tree_compareStacks(comparer, l1.tail, l2.tail);
                        }
                    }
                }
            }
        }
        else {
            return 1;
        }
    }
    else {
        if (l2.tail != null) {
            return -1;
        }
        else {
            return 0;
        }
    }
}
function tree_compare(comparer, s1, s2) {
    if (s1.Case === "SetEmpty") {
        if (s2.Case === "SetEmpty") {
            return 0;
        }
        else {
            return -1;
        }
    }
    else {
        if (s2.Case === "SetEmpty") {
            return 1;
        }
        else {
            return tree_compareStacks(comparer, ofArray$1([s1]), ofArray$1([s2]));
        }
    }
}
function tree_mkFromEnumerator$1(comparer, acc, e) {
    var cur = e.next();
    while (!cur.done) {
        acc = tree_add$1(comparer, cur.value, acc);
        cur = e.next();
    }
    return acc;
}
function tree_ofSeq$1(comparer, c) {
    var ie = c[Symbol.iterator]();
    return tree_mkFromEnumerator$1(comparer, new SetTree("SetEmpty", []), ie);
}
var FSet = (function () {
    /** Do not call, use Set.create instead. */
    function FSet() {
    }
    FSet.prototype.ToString = function () {
        return "set [" + Array.from(this).map(toString).join("; ") + "]";
    };
    FSet.prototype.Equals = function (s2) {
        return this.CompareTo(s2) === 0;
    };
    FSet.prototype.CompareTo = function (s2) {
        return this === s2 ? 0 : tree_compare(this.comparer, this.tree, s2.tree);
    };
    FSet.prototype[Symbol.iterator] = function () {
        var i = tree_mkIterator$1(this.tree);
        return {
            next: function () { return tree_moveNext$1(i); }
        };
    };
    FSet.prototype.values = function () {
        return this[Symbol.iterator]();
    };
    FSet.prototype.has = function (v) {
        return tree_mem$1(this.comparer, v, this.tree);
    };
    /** Not supported */
    FSet.prototype.add = function (v) {
        throw new Error("not supported");
    };
    /** Not supported */
    FSet.prototype.delete = function (v) {
        throw new Error("not supported");
    };
    /** Not supported */
    FSet.prototype.clear = function () {
        throw new Error("not supported");
    };
    Object.defineProperty(FSet.prototype, "size", {
        get: function () {
            return tree_count(this.tree);
        },
        enumerable: true,
        configurable: true
    });
    FSet.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpSet",
            interfaces: ["System.IEquatable", "System.IComparable"]
        };
    };
    return FSet;
}());
function from$1(comparer, tree) {
    var s = new FSet();
    s.tree = tree;
    s.comparer = comparer || new GenericComparer();
    return s;
}
function create$1(ie, comparer) {
    comparer = comparer || new GenericComparer();
    return from$1(comparer, ie ? tree_ofSeq$1(comparer, ie) : new SetTree("SetEmpty", []));
}

function add$1(item$$1, s) {
    return from$1(s.comparer, tree_add$1(s.comparer, item$$1, s.tree));
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = function () {
    function Token(caseName, fields) {
        _classCallCheck(this, Token);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass(Token, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "App.Common.Token",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    TokIntLit: ["number"],
                    TokName: ["string"],
                    TokNull: [],
                    TokStrLit: ["string"]
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

    return Token;
}();
setType("App.Common.Token", Token);
var Exp = function () {
    function Exp(caseName, fields) {
        _classCallCheck(this, Exp);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass(Exp, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "App.Common.Exp",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    Apply: [makeGeneric(List, {
                        T: Exp
                    })],
                    FNames: [makeGeneric(List, {
                        T: Exp
                    })],
                    Lambda: [Exp, makeGeneric(List, {
                        T: Exp
                    }), Exp, Exp],
                    Literal: [Token],
                    Name: ["string"],
                    NullExp: []
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

    return Exp;
}();
setType("App.Common.Exp", Exp);
var endOps = ofArray$1(["END", "THEN", "ELSE", "FI", ")", "IN"]);
var startOps = ofArray$1(["BEGIN", "(", "IF", "LET"]);
var unaryOps = ofArray$1(["ISPAIR", "NOT", "-"]);
var binaryOpPriority = create(ofArray$1([["+", 40], ["-", 40], ["*", 50], ["/", 50], ["%", 50], [">", 30], ["<", 30], ["=", 20], ["::", 10]]), new GenericComparer(function (x, y) {
    return x < y ? -1 : x > y ? 1 : 0;
}));
var binaryOps = map$1(function (tuple) {
    return tuple[0];
}, toList(binaryOpPriority));
var allOps = toList(distinct(ofList(append$1(binaryOps, append$1(unaryOps, append$1(endOps, startOps))))));
function isWhiteSpace(c) {
    return exists(function (x) {
        return equals(c, x);
    }, ofArray$1([" ", "\n", "\t", "\r", "\f"]));
}
function isNewLine(c) {
    return exists(function (x) {
        return equals(c, x);
    }, ofArray$1(["\n", "\f", "\r"]));
}
function isAlpha(c) {
    return exists(function (x) {
        return equals(c, x);
    }, append$1(toList(rangeChar("a", "z")), toList(rangeChar("A", "Z"))));
}
function isDigit(c) {
    return exists(function (x) {
        return equals(c, x);
    }, toList(rangeChar("0", "9")));
}
function isAlphaNum(c) {
    if (isAlpha(c)) {
        return true;
    } else {
        return isDigit(c);
    }
}

function create$2(pattern, options) {
    var flags = "g";
    flags += options & 1 ? "i" : "";
    flags += options & 2 ? "m" : "";
    return new RegExp(pattern, flags);
}
// From http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escape(str) {
    return str.replace(/[\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}



function matches(str, pattern, options) {
    if (options === void 0) { options = 0; }
    var reg = str instanceof RegExp
        ? (reg = str, str = pattern, reg.lastIndex = options, reg)
        : reg = create$2(pattern, options);
    if (!reg.global)
        throw new Error("Non-global RegExp"); // Prevent infinite loop
    var m;
    var matches = [];
    while ((m = reg.exec(str)) !== null)
        matches.push(m);
    return matches;
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

function create$3(year, month, day, h, m, s, ms, kind) {
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

function explode(str) {
    return toList(str);
}
function implode(x) {
    var s = "";
    iterate(function (c) {
        s = s + c;
    }, x);
    return s;
}
function charListStartsWith(x, str) {
    var clsw1 = function clsw1(x_1) {
        return function (y) {
            var matchValue = [x_1, y];

            var _target2 = function _target2() {
                return false;
            };

            if (matchValue[1].tail != null) {
                if (matchValue[0].tail != null) {
                    if (function () {
                        var yc = matchValue[1].head;
                        var y1 = matchValue[1].tail;
                        var xc = matchValue[0].head;
                        var x1 = matchValue[0].tail;
                        return equals(xc, yc);
                    }()) {
                        var x1 = matchValue[0].tail;
                        var xc = matchValue[0].head;
                        var y1 = matchValue[1].tail;
                        var yc = matchValue[1].head;
                        return clsw1(x1)(y1);
                    } else {
                        return _target2();
                    }
                } else {
                    return _target2();
                }
            } else {
                return true;
            }
        };
    };

    return clsw1(x)(explode(str));
}
function tokMatch(start, notEnd, tokType, lst) {
    var tContent = function tContent(tChars) {
        return function (_arg1) {
            var _target1 = function _target1() {
                return [tokType(implode(reverse$1(tChars))), _arg1];
            };

            if (_arg1.tail != null) {
                if (notEnd(_arg1.head)) {
                    var c = _arg1.head;
                    var r = _arg1.tail;
                    return tContent(new List(c, tChars))(r);
                } else {
                    return _target1();
                }
            } else {
                return _target1();
            }
        };
    };

    var _target1 = function _target1() {
        return null;
    };

    if (lst.tail != null) {
        if (start(lst.head)) {
            var c = lst.head;
            var cl = lst;
            return tContent(new List())(cl);
        } else {
            return _target1();
        }
    } else {
        return _target1();
    }
}

var _IntMatch___ = function () {
    var tokType = function tokType($var1) {
        return new Token("TokIntLit", [$var1]);
    };

    return function (lst) {
        return tokMatch(function (c) {
            return isDigit(c);
        }, function (c) {
            return isDigit(c);
        }, tokType, lst);
    };
}();

var _NameMatch___ = function () {
    var tokType = function tokType(arg0) {
        return new Token("TokName", [arg0]);
    };

    return function (lst) {
        return tokMatch(function (c) {
            return isAlpha(c);
        }, function (c) {
            return isAlphaNum(c);
        }, tokType, lst);
    };
}();

function _StringMatch___(cLst) {
    var doEsc = function doEsc(_arg1) {
        if (_arg1 === "n") {
            return "\n";
        } else if (_arg1 === "r") {
            return "\r";
        } else if (_arg1 === "t") {
            return "\t";
        } else {
            return _arg1;
        }
    };

    var sContent = function sContent(sChars) {
        return function (_arg2) {
            var _target2 = function _target2(c, r) {
                return sContent(new List(c, sChars))(r);
            };

            if (_arg2.tail == null) {
                return fsFormat("Unterminated string\n")(function (x) {
                    throw new Error(x);
                });
            } else if (_arg2.head === "\"") {
                var r = _arg2.tail;
                return [new Token("TokStrLit", [implode(reverse$1(sChars))]), r];
            } else if (_arg2.head === "\\") {
                if (_arg2.tail.tail != null) {
                    var c2 = _arg2.tail.head;
                    var _r = _arg2.tail.tail;
                    return sContent(new List(doEsc(c2), sChars))(_r);
                } else {
                    return _target2(_arg2.head, _arg2.tail);
                }
            } else {
                return _target2(_arg2.head, _arg2.tail);
            }
        };
    };

    var _target1 = function _target1() {
        return null;
    };

    if (cLst.tail != null) {
        if (cLst.head === "\"") {
            var x = cLst.tail;
            return sContent(new List())(x);
        } else {
            return _target1();
        }
    } else {
        return _target1();
    }
}

function _OpMatch___(cLst) {
    var x = tryFind(function (str) {
        return charListStartsWith(cLst, str);
    }, allOps);

    var x1 = function () {
        var $var2 = x;

        if ($var2 != null) {
            return function (op) {
                return [new Token("TokName", [op]), toList(skip(op.length, cLst))];
            }($var2);
        } else {
            return $var2;
        }
    }();

    return x1;
}


function tokeniseList(src) {
    var tokenise1 = function tokenise1(lst) {
        var _target1 = function _target1(r, t) {
            return new List(t, tokenise1(r));
        };

        var _target2 = function _target2() {
            var _target1_1 = function _target1_1() {
                if (lst.tail == null) {
                    return new List();
                } else {
                    return fsFormat("Error: unrecognised character '%A' found in tokenize input%A")(function (x) {
                        throw new Error(x);
                    })(lst.head)(lst);
                }
            };

            if (lst.tail != null) {
                if (isWhiteSpace(lst.head)) {
                    var ch = lst.head;
                    var r = lst.tail;
                    return tokenise1(r);
                } else {
                    return _target1_1();
                }
            } else {
                return _target1_1();
            }
        };

        if (lst.tail != null) {
            if (lst.head === "/") {
                if (lst.tail.tail != null) {
                    if (lst.tail.head === "/") {
                        return tokenise1(toList(skipWhile(function ($var5) {
                            return !isNewLine($var5);
                        }, lst)));
                    } else {
                        var activePatternResult143 = _IntMatch___(lst);

                        if (activePatternResult143 != null) {
                            return _target1(activePatternResult143[1], activePatternResult143[0]);
                        } else {
                            var activePatternResult144 = _OpMatch___(lst);

                            if (activePatternResult144 != null) {
                                return _target1(activePatternResult144[1], activePatternResult144[0]);
                            } else {
                                var activePatternResult145 = _StringMatch___(lst);

                                if (activePatternResult145 != null) {
                                    return _target1(activePatternResult145[1], activePatternResult145[0]);
                                } else {
                                    var activePatternResult146 = _NameMatch___(lst);

                                    if (activePatternResult146 != null) {
                                        return _target1(activePatternResult146[1], activePatternResult146[0]);
                                    } else {
                                        return _target2();
                                    }
                                }
                            }
                        }
                    }
                } else {
                    var activePatternResult147 = _IntMatch___(lst);

                    if (activePatternResult147 != null) {
                        return _target1(activePatternResult147[1], activePatternResult147[0]);
                    } else {
                        var activePatternResult148 = _OpMatch___(lst);

                        if (activePatternResult148 != null) {
                            return _target1(activePatternResult148[1], activePatternResult148[0]);
                        } else {
                            var activePatternResult149 = _StringMatch___(lst);

                            if (activePatternResult149 != null) {
                                return _target1(activePatternResult149[1], activePatternResult149[0]);
                            } else {
                                var activePatternResult150 = _NameMatch___(lst);

                                if (activePatternResult150 != null) {
                                    return _target1(activePatternResult150[1], activePatternResult150[0]);
                                } else {
                                    return _target2();
                                }
                            }
                        }
                    }
                }
            } else {
                var activePatternResult151 = _IntMatch___(lst);

                if (activePatternResult151 != null) {
                    return _target1(activePatternResult151[1], activePatternResult151[0]);
                } else {
                    var activePatternResult152 = _OpMatch___(lst);

                    if (activePatternResult152 != null) {
                        return _target1(activePatternResult152[1], activePatternResult152[0]);
                    } else {
                        var activePatternResult153 = _StringMatch___(lst);

                        if (activePatternResult153 != null) {
                            return _target1(activePatternResult153[1], activePatternResult153[0]);
                        } else {
                            var activePatternResult154 = _NameMatch___(lst);

                            if (activePatternResult154 != null) {
                                return _target1(activePatternResult154[1], activePatternResult154[0]);
                            } else {
                                return _target2();
                            }
                        }
                    }
                }
            }
        } else {
            var activePatternResult155 = _IntMatch___(lst);

            if (activePatternResult155 != null) {
                return _target1(activePatternResult155[1], activePatternResult155[0]);
            } else {
                var activePatternResult156 = _OpMatch___(lst);

                if (activePatternResult156 != null) {
                    return _target1(activePatternResult156[1], activePatternResult156[0]);
                } else {
                    var activePatternResult157 = _StringMatch___(lst);

                    if (activePatternResult157 != null) {
                        return _target1(activePatternResult157[1], activePatternResult157[0]);
                    } else {
                        var activePatternResult158 = _NameMatch___(lst);

                        if (activePatternResult158 != null) {
                            return _target1(activePatternResult158[1], activePatternResult158[0]);
                        } else {
                            return _target2();
                        }
                    }
                }
            }
        }
    };

    return tokenise1(explode(src));
}

function isTokInList(lst, _arg1) {
    if (_arg1.Case === "TokName") {
        return exists(function (x) {
            return equals(_arg1.Fields[0], x);
        }, lst);
    } else {
        return false;
    }
}
function isLitTok(t) {
    var _target0 = function _target0() {
        return true;
    };

    if (t.Case === "TokIntLit") {
        return _target0();
    } else if (t.Case === "TokStrLit") {
        return _target0();
    } else {
        return false;
    }
}
var isBinaryTok = function isBinaryTok(_arg1) {
    return isTokInList(binaryOps, _arg1);
};
var isUnaryTok = function isUnaryTok(_arg1) {
    return isTokInList(unaryOps, _arg1);
};
var isEndTok = function isEndTok(_arg1) {
    return isTokInList(endOps, _arg1);
};
var isStartTok = function isStartTok(_arg1) {
    return isTokInList(startOps, _arg1);
};
function makePP(tPred, tok) {
    if (tPred(tok)) {
        return tok;
    }
}

var _IsLiteral___ = function _IsLiteral___(tok) {
    return makePP(function (t) {
        return isLitTok(t);
    }, tok);
};

var _IsBinary___ = function _IsBinary___(tok) {
    return makePP(isBinaryTok, tok);
};

var _IsUnary___ = function _IsUnary___(tok) {
    return makePP(isUnaryTok, tok);
};

var _IsEnd___ = function _IsEnd___(tok) {
    return makePP(isEndTok, tok);
};

var _IsStart___ = function _IsStart___(tok) {
    return makePP(isStartTok, tok);
};

function _IsSymbol___(_arg1) {
    var _target0 = function _target0() {
        return null;
    };

    {
        var activePatternResult167 = _IsLiteral___(_arg1);

        if (activePatternResult167 != null) {
            return _target0();
        } else {
            var activePatternResult168 = _IsBinary___(_arg1);

            if (activePatternResult168 != null) {
                return _target0();
            } else {
                var activePatternResult169 = _IsUnary___(_arg1);

                if (activePatternResult169 != null) {
                    return _target0();
                } else {
                    var activePatternResult170 = _IsStart___(_arg1);

                    if (activePatternResult170 != null) {
                        return _target0();
                    } else {
                        var activePatternResult171 = _IsEnd___(_arg1);

                        if (activePatternResult171 != null) {
                            return _target0();
                        } else if (_arg1.Case === "TokNull") {
                            return _target0();
                        } else {
                            return _arg1;
                        }
                    }
                }
            }
        }
    }
}

function toExp(tok) {
    var _target0 = function _target0(s) {
        return new Exp("Name", [s]);
    };

    var _target1 = function _target1() {
        var activePatternResult173 = _IsLiteral___(tok);

        if (activePatternResult173 != null) {
            return new Exp("Literal", [tok]);
        } else if (tok.Case === "TokNull") {
            return new Exp("NullExp", []);
        } else {
            return fsFormat("No valid translation for token %A as an Exp")(function (x) {
                throw new Error(x);
            })(tok);
        }
    };

    {
        var activePatternResult174 = _IsSymbol___(tok);

        if (activePatternResult174 != null) {
            if (activePatternResult174.Case === "TokName") {
                return _target0(activePatternResult174.Fields[0]);
            } else {
                var activePatternResult175 = _IsUnary___(tok);

                if (activePatternResult175 != null) {
                    if (activePatternResult175.Case === "TokName") {
                        return _target0(activePatternResult175.Fields[0]);
                    } else {
                        var activePatternResult176 = _IsBinary___(tok);

                        if (activePatternResult176 != null) {
                            if (activePatternResult176.Case === "TokName") {
                                return _target0(activePatternResult176.Fields[0]);
                            } else {
                                return _target1();
                            }
                        } else {
                            return _target1();
                        }
                    }
                } else {
                    var activePatternResult177 = _IsBinary___(tok);

                    if (activePatternResult177 != null) {
                        if (activePatternResult177.Case === "TokName") {
                            return _target0(activePatternResult177.Fields[0]);
                        } else {
                            return _target1();
                        }
                    } else {
                        return _target1();
                    }
                }
            }
        } else {
            var activePatternResult178 = _IsUnary___(tok);

            if (activePatternResult178 != null) {
                if (activePatternResult178.Case === "TokName") {
                    return _target0(activePatternResult178.Fields[0]);
                } else {
                    var activePatternResult179 = _IsBinary___(tok);

                    if (activePatternResult179 != null) {
                        if (activePatternResult179.Case === "TokName") {
                            return _target0(activePatternResult179.Fields[0]);
                        } else {
                            return _target1();
                        }
                    } else {
                        return _target1();
                    }
                }
            } else {
                var activePatternResult180 = _IsBinary___(tok);

                if (activePatternResult180 != null) {
                    if (activePatternResult180.Case === "TokName") {
                        return _target0(activePatternResult180.Fields[0]);
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            }
        }
    }
}
var applyBinding = 100;
function unaryBinding(op) {
    if (isUnaryTok(op)) {
        return 100;
    } else {
        return 110;
    }
}
function LBinding(tok) {
    var _target1 = function _target1() {
        var activePatternResult185 = _IsEnd___(tok);

        if (activePatternResult185 != null) {
            return -10;
        } else {
            var _target0 = function _target0() {
                return applyBinding;
            };

            {
                var activePatternResult183 = _IsSymbol___(tok);

                if (activePatternResult183 != null) {
                    return _target0();
                } else {
                    var activePatternResult184 = _IsLiteral___(tok);

                    if (activePatternResult184 != null) {
                        return _target0();
                    } else {
                        return 1000;
                    }
                }
            }
        }
    };

    {
        var activePatternResult186 = _IsBinary___(tok);

        if (activePatternResult186 != null) {
            if (activePatternResult186.Case === "TokName") {
                var op = activePatternResult186.Fields[0];
                return binaryOpPriority.get(op);
            } else {
                return _target1();
            }
        } else {
            return _target1();
        }
    }
}
function RBinding(tok) {
    var activePatternResult188 = _IsEnd___(tok);

    if (activePatternResult188 != null) {
        return 1000;
    } else {
        return LBinding(tok);
    }
}
function ParseExpression(rbPrio, toks) {
    var expLoop = function expLoop(left) {
        return function (toks_1) {
            if (!toks_1.Equals(new List()) ? rbPrio < LBinding(toks_1.head) : false) {
                var patternInput = LeftD(left, toks_1);
                return expLoop(patternInput[0])(patternInput[1]);
            } else {
                return [left, toks_1];
            }
        };
    };

    var activePatternResult192 = _PNullD___(toks);

    if (activePatternResult192 != null) {
        var left = activePatternResult192[0];
        var r = activePatternResult192[1];
        return r.tail == null ? [left, new List()] : expLoop(left)(r);
    }
}
function LeftD(left, toks) {
    var _target1 = function _target1() {
        var activePatternResult197 = _PNullD___(toks);

        if (activePatternResult197 != null) {
            var e2 = activePatternResult197[0];
            var r2 = activePatternResult197[1];
            return [new Exp("Apply", [ofArray$1([left, e2])]), r2];
        } else if (toks.tail == null) {
            return fsFormat("Missing tokens: LeftD context expected")(function (x) {
                throw new Error(x);
            });
        } else {
            return fsFormat("Unexpected token %A found in LeftD context")(function (x) {
                throw new Error(x);
            })(toks.head);
        }
    };

    if (toks.tail != null) {
        var activePatternResult198 = _IsBinary___(toks.head);

        if (activePatternResult198 != null) {
            var r = toks.tail;
            var t = activePatternResult198;
            {
                var activePatternResult196 = _PEXP___(RBinding(t))(r);

                if (activePatternResult196 != null) {
                    var r1 = activePatternResult196[1];
                    var right = activePatternResult196[0];
                    return [new Exp("Apply", [ofArray$1([toExp(t), left, right])]), r1];
                } else {
                    return fsFormat("RH operand for op %A not found at %A in LeftD context")(function (x) {
                        throw new Error(x);
                    })(t)(toList(take(5, toks)));
                }
            }
        } else {
            return _target1();
        }
    } else {
        return _target1();
    }
}
function NullD(toks) {
    var _target1 = function _target1() {
        var _target1 = function _target1() {
            var _target1 = function _target1() {
                var _target1 = function _target1() {
                    fsFormat("Nullary context value expected but not found at: %A")(function (x) {
                        console.log(x);
                    })(toks);
                    return null;
                };

                if (toks.tail != null) {
                    var activePatternResult202 = _IsUnary___(toks.head);

                    if (activePatternResult202 != null) {
                        var r = toks.tail;
                        var tok = activePatternResult202;
                        return ParseExpression(unaryBinding(tok), r);
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            };

            if (toks.tail != null) {
                var activePatternResult203 = _IsSymbol___(toks.head);

                if (activePatternResult203 != null) {
                    if (activePatternResult203.Case === "TokName") {
                        var r = toks.tail;
                        var s = activePatternResult203.Fields[0];
                        return [new Exp("Name", [s]), r];
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            } else {
                return _target1();
            }
        };

        if (toks.tail != null) {
            var activePatternResult204 = _IsLiteral___(toks.head);

            if (activePatternResult204 != null) {
                var r = toks.tail;
                var t = activePatternResult204;
                return [new Exp("Literal", [t]), r];
            } else {
                return _target1();
            }
        } else {
            return _target1();
        }
    };

    if (toks.tail != null) {
        var activePatternResult205 = _IsStart___(toks.head);

        if (activePatternResult205 != null) {
            var activePatternResult201 = _PREC___(toks);

            if (activePatternResult201 != null) {
                var e1 = activePatternResult201[0];
                var r = activePatternResult201[1];
                return [e1, r];
            } else {
                fsFormat("Recursive parse failed after start token: %A")(function (x) {
                    console.log(x);
                })(toks);
                return null;
            }
        } else {
            return _target1();
        }
    } else {
        return _target1();
    }
}

function _PNullD___(toks) {
    return NullD(toks);
}

var _PEXP___ = function _PEXP___(rbPrio) {
    return function (toks) {
        return ParseExpression(rbPrio, toks);
    };
};

function _PREC___(tokens) {
    var _KW___ = function _KW___(kw) {
        return function (toks) {
            var _target1 = function _target1() {
                return null;
            };

            if (toks.tail != null) {
                if (toks.head.Case === "TokName") {
                    if (function () {
                        var s = toks.head.Fields[0];
                        return s === kw;
                    }()) {
                        var r = toks.tail;
                        var s = toks.head.Fields[0];
                        return r;
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            } else {
                return _target1();
            }
        };
    };

    var _NAMES___ = function _NAMES___(nms) {
        return function (toks) {
            var _target1 = function _target1() {
                var _target1 = function _target1() {
                    return fsFormat("<fName> ... = (after LET) expected but not found in: %A")(function (x) {
                        throw new Error(x);
                    })(toks);
                };

                if (toks.tail != null) {
                    if (toks.head.Case === "TokName") {
                        if (toks.head.Fields[0] === "=") {
                            if (nms.length >= 1) {
                                return [new Exp("FNames", [reverse$1(nms)]), toks];
                            } else {
                                return _target1();
                            }
                        } else {
                            return _target1();
                        }
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            };

            if (toks.tail != null) {
                var activePatternResult211 = _IsSymbol___(toks.head);

                if (activePatternResult211 != null) {
                    if (activePatternResult211.Case === "TokName") {
                        var nm = activePatternResult211.Fields[0];
                        var r = toks.tail;
                        return _NAMES___(new List(new Exp("Name", [nm]), nms))(r);
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            } else {
                return _target1();
            }
        };
    };

    var _target1 = function _target1() {
        var _target1 = function _target1() {
            var _target1 = function _target1() {
                if (tokens.tail == null) {
                    return null;
                } else {
                    return ParseExpression(0, tokens);
                }
            };

            {
                var activePatternResult217 = _KW___("IF")(tokens);

                if (activePatternResult217 != null) {
                    var activePatternResult218 = _PREC___(activePatternResult217);

                    if (activePatternResult218 != null) {
                        var activePatternResult220 = _KW___("THEN")(activePatternResult218[1]);

                        if (activePatternResult220 != null) {
                            var activePatternResult221 = _PREC___(activePatternResult220);

                            if (activePatternResult221 != null) {
                                var activePatternResult223 = _KW___("ELSE")(activePatternResult221[1]);

                                if (activePatternResult223 != null) {
                                    var activePatternResult224 = _PREC___(activePatternResult223);

                                    if (activePatternResult224 != null) {
                                        var activePatternResult226 = _KW___("FI")(activePatternResult224[1]);

                                        if (activePatternResult226 != null) {
                                            var cond = activePatternResult218[0];
                                            var elseP = activePatternResult224[0];
                                            var r = activePatternResult226;
                                            var thenP = activePatternResult221[0];
                                            return [new Exp("Apply", [ofArray$1([new Exp("Name", ["ITE"]), cond, thenP, elseP])]), r];
                                        } else {
                                            return _target1();
                                        }
                                    } else {
                                        return _target1();
                                    }
                                } else {
                                    return _target1();
                                }
                            } else {
                                return _target1();
                            }
                        } else {
                            return _target1();
                        }
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            }
        };

        {
            var activePatternResult228 = _KW___("(")(tokens);

            if (activePatternResult228 != null) {
                var activePatternResult229 = _PREC___(activePatternResult228);

                if (activePatternResult229 != null) {
                    var activePatternResult231 = _KW___(")")(activePatternResult229[1]);

                    if (activePatternResult231 != null) {
                        var exp = activePatternResult229[0];
                        var r = activePatternResult231;
                        return [exp, r];
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            } else {
                return _target1();
            }
        }
    };

    {
        var activePatternResult233 = _KW___("LET")(tokens);

        if (activePatternResult233 != null) {
            var activePatternResult235 = _NAMES___(new List())(activePatternResult233);

            if (activePatternResult235 != null) {
                if (activePatternResult235[0].Case === "FNames") {
                    if (activePatternResult235[0].Fields[0].tail != null) {
                        var activePatternResult237 = _KW___("=")(activePatternResult235[1]);

                        if (activePatternResult237 != null) {
                            var activePatternResult238 = _PREC___(activePatternResult237);

                            if (activePatternResult238 != null) {
                                var activePatternResult240 = _KW___("IN")(activePatternResult238[1]);

                                if (activePatternResult240 != null) {
                                    var activePatternResult241 = _PREC___(activePatternResult240);

                                    if (activePatternResult241 != null) {
                                        var args = activePatternResult235[0].Fields[0].tail;
                                        var eBody = activePatternResult238[0];
                                        var eIn = activePatternResult241[0];
                                        var f = activePatternResult235[0].Fields[0].head;
                                        var r = activePatternResult241[1];
                                        return [new Exp("Lambda", [f, args, eBody, eIn]), r];
                                    } else {
                                        return _target1();
                                    }
                                } else {
                                    return _target1();
                                }
                            } else {
                                return _target1();
                            }
                        } else {
                            return _target1();
                        }
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            } else {
                return _target1();
            }
        } else {
            return _target1();
        }
    }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Data = function () {
    function Data(caseName, fields) {
        _classCallCheck$1(this, Data);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$1(Data, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "App.Reducer.Data",
                interfaces: ["FSharpUnion"],
                cases: {
                    DCell: [Any, Any],
                    DImpl: ["string", RRule, "number"],
                    DInt: ["number"],
                    DName: ["string", Any],
                    DNull: [],
                    DStr: ["string"]
                }
            };
        }
    }]);

    return Data;
}();
setType("App.Reducer.Data", Data);
var RRule = function () {
    function RRule(caseName, fields) {
        _classCallCheck$1(this, RRule);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$1(RRule, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "App.Reducer.RRule",
                interfaces: ["FSharpUnion"],
                cases: {
                    Binary: ["function"],
                    Custom: ["function"]
                }
            };
        }
    }]);

    return RRule;
}();
setType("App.Reducer.RRule", RRule);
function ppL(x) {
    var ppL1 = function ppL1(trail) {
        return function (x_1) {
            var matchValue = x_1.contents;

            if (matchValue.Case === "DInt") {
                var n = matchValue.Fields[0];
                return String(n);
            } else if (matchValue.Case === "DStr") {
                var s = matchValue.Fields[0];
                return "\"" + s + "\"";
            } else if (matchValue.Case === "DImpl") {
                var _s = matchValue.Fields[0];
                return _s;
            } else if (matchValue.Case === "DNull") {
                return "Null";
            } else if (matchValue.Case === "DCell") {
                if (exists(function (y) {
                    return x_1 === y;
                }, trail)) {
                    return fsFormat("...loop...")(function (x) {
                        return x;
                    });
                } else if (matchValue.Case === "DCell") {
                    return fsFormat("(%s,%s)")(function (x) {
                        return x;
                    })(ppL1(new List(x_1, trail))(matchValue.Fields[0]))(ppL1(new List(x_1, trail))(matchValue.Fields[1]));
                } else if (matchValue.Case === "DImpl") {
                    return fsFormat("%s*")(function (x) {
                        return x;
                    })(matchValue.Fields[0]);
                } else {
                    throw new Error("D:\\Users\\raviwoods\\Documents\\HLP\\FABLE\\working-tiny-fable-test\\src/fs/Reducer.fs", 31, 14);
                }
            } else {
                var _s2 = matchValue.Fields[0];
                var x_2 = matchValue.Fields[1];
                return fsFormat("<%s:%A>")(function (x) {
                    return x;
                })(_s2)(x_2.contents);
            }
        };
    };

    return ppL1(new List())(x);
}

function DTail(x) {
    var matchValue = x.contents;

    if (matchValue.Case === "DCell") {
        return matchValue.Fields[1];
    } else {
        return fsFormat("In Tail x: x= %A")(function (x) {
            throw new Error(x);
        })(ppL(x));
    }
}

function DApply(x, y) {
    return {
        contents: new Data("DCell", [x, y])
    };
}
function DEquals(a, b) {
    var matchValue = [a, b];

    var _target1 = function _target1() {
        var _target3 = function _target3() {
            return false;
        };

        if (matchValue[0].Case === "DInt") {
            if (matchValue[1].Case === "DInt") {
                var n1 = matchValue[0].Fields[0];
                var n2 = matchValue[1].Fields[0];
                return n1 === n2;
            } else {
                return _target3();
            }
        } else if (matchValue[0].Case === "DStr") {
            if (matchValue[1].Case === "DStr") {
                var s1 = matchValue[0].Fields[0];
                var s2 = matchValue[1].Fields[0];
                return s1 === s2;
            } else {
                return _target3();
            }
        } else if (matchValue[0].Case === "DNull") {
            if (matchValue[1].Case === "DNull") {
                return true;
            } else {
                return _target3();
            }
        } else {
            return _target3();
        }
    };

    if (matchValue[0].Case === "DName") {
        if (matchValue[1].Case === "DName") {
            if (function () {
                var s2 = matchValue[1].Fields[0];
                var s1 = matchValue[0].Fields[0];
                return s1 === s2;
            }()) {
                var s1 = matchValue[0].Fields[0];
                var s2 = matchValue[1].Fields[0];
                return true;
            } else {
                return _target1();
            }
        } else {
            return _target1();
        }
    } else {
        return _target1();
    }
}

function _REFCELL___(_arg1) {
    if (_arg1.Case === "DCell") {
        return [_arg1.Fields[0].contents, _arg1.Fields[1].contents];
    }
}

function DIsPair(x) {
    var matchValue = x.contents;

    var _target1 = function _target1() {
        return false;
    };

    {
        var activePatternResult255 = _REFCELL___(matchValue);

        if (activePatternResult255 != null) {
            var activePatternResult256 = _REFCELL___(activePatternResult255[0]);

            if (activePatternResult256 != null) {
                if (activePatternResult256[0].Case === "DImpl") {
                    if (activePatternResult256[0].Fields[0] === "P") {
                        return true;
                    } else {
                        return _target1();
                    }
                } else {
                    return _target1();
                }
            } else {
                return _target1();
            }
        } else {
            return _target1();
        }
    }
}
function getInt(x) {
    if (x.Case === "DInt") {
        return x.Fields[0];
    } else {
        return fsFormat("%A found when integer expected")(function (x) {
            throw new Error(x);
        })(x);
    }
}
function getArg(stack, n) {
    return DTail(item(n, stack));
}
function getStack(stack, n) {
    return item(n, stack);
}
function changeStack(stack, n, newValue) {
    item(n, stack).contents = newValue;
}
function isApp(l) {
    var matchValue = l.contents;

    if (matchValue.Case === "DCell") {
        return true;
    } else {
        return false;
    }
}
function bracketAbstract(v, exp) {
    var _target1 = function _target1(lst) {
        var n = lst.length;
        return new Exp("Apply", [ofArray$1([new Exp("Name", ["S"]), bracketAbstract(v, new Exp("Apply", [slice(0, n - 2, lst)])), bracketAbstract(v, item(n - 1, lst))])]);
    };

    var _target2 = function _target2() {
        if (exp.Equals(v)) {
            return new Exp("Name", ["I"]);
        } else {
            return new Exp("Apply", [ofArray$1([new Exp("Name", ["K"]), exp])]);
        }
    };

    if (exp.Case === "Apply") {
        if (exp.Fields[0].tail != null) {
            if (exp.Fields[0].tail.tail == null) {
                var x = exp.Fields[0].head;
                return bracketAbstract(v, x);
            } else if (exp.Fields[0].length >= 2) {
                return _target1(exp.Fields[0]);
            } else {
                return _target2();
            }
        } else if (exp.Fields[0].length >= 2) {
            return _target1(exp.Fields[0]);
        } else {
            return _target2();
        }
    } else {
        return _target2();
    }
}
function listBracketAbstract(vl, exp) {
    return fold(function (e, v) {
        return bracketAbstract(v, e);
    }, exp, vl);
}
function makeHeap(envt, exp) {
    var lookUpValue = function lookUpValue(evt) {
        return function (s) {
            return find(function (tupledArg) {
                return equals(s, tupledArg[0]);
            }, evt)[1];
        };
    };

    var makeH = function makeH(e) {
        return function (_arg1) {
            var _target9 = function _target9() {
                return fsFormat("Exp case %A not implemented in makeHeap")(function (x) {
                    throw new Error(x);
                })(exp);
            };

            if (_arg1.Case === "Literal") {
                if (_arg1.Fields[0].Case === "TokIntLit") {
                    var n = _arg1.Fields[0].Fields[0];
                    return {
                        contents: new Data("DInt", [n])
                    };
                } else if (_arg1.Fields[0].Case === "TokStrLit") {
                    var _n = _arg1.Fields[0].Fields[0];
                    return {
                        contents: new Data("DStr", [_n])
                    };
                } else {
                    var x = _arg1;
                    return fsFormat("Unrecognised literal %A")(function (x) {
                        throw new Error(x);
                    })(x);
                }
            } else if (_arg1.Case === "Name") {
                var s = _arg1.Fields[0];
                return lookUpValue(e)(s);
            } else if (_arg1.Case === "NullExp") {
                return {
                    contents: new Data("DNull", [])
                };
            } else if (_arg1.Case === "Apply") {
                if (_arg1.Fields[0].tail != null) {
                    if (_arg1.Fields[0].tail.tail == null) {
                        var _x = _arg1.Fields[0].head;
                        return makeH(e)(_x);
                    } else {
                        var lst = _arg1.Fields[0];
                        return DApply(makeH(e)(new Exp("Apply", [slice(0, lst.length - 2, lst)])), makeH(e)(last(lst)));
                    }
                } else {
                    return {
                        contents: new Data("DNull", [])
                    };
                }
            } else if (_arg1.Case === "Lambda") {
                if (_arg1.Fields[0].Case === "Name") {
                    var args = _arg1.Fields[1];
                    var expIn = _arg1.Fields[3];
                    var f = _arg1.Fields[0].Fields[0];
                    var fBody = _arg1.Fields[2];
                    {
                        var fRef = {
                            contents: new Data("DNull", [])
                        };
                        var envtWithF = new List([f, fRef], e);
                        var fDef = listBracketAbstract(reverse$1(args), fBody);
                        var af = makeHeap(envtWithF, fDef);
                        fRef.contents = af.contents;
                        return makeH(envtWithF)(expIn);
                    }
                } else {
                    return _target9();
                }
            } else {
                return _target9();
            }
        };
    };

    return makeH(envt)(exp);
}
function reduce$1(n, root) {
    var indent = function indent(_arg1) {
        if (_arg1 === 0) {
            return "";
        } else {
            return " " + indent(_arg1 - 1);
        }
    };

    var getSpine = function getSpine(sp) {
        return function (root_1) {
            var matchValue = root_1.contents;

            if (matchValue.Case === "DCell") {
                return getSpine(new List(matchValue.Fields[0], sp))(matchValue.Fields[0]);
            } else {
                return sp;
            }
        };
    };

    fsFormat("%sReducing: %s")(function (x) {
        console.log(x);
    })(indent(n))(ppL(root));

    var reduceLoop = function reduceLoop() {
        var stack = getSpine(ofArray$1([root]))(root);

        if (!isApp(root)) {
            return root;
        } else {
            var _ret = function () {
                var top = stack.head;
                var matchValue = top.contents;

                var _target2 = function _target2() {
                    if (matchValue.Case === "DImpl") {
                        if (matchValue.Fields[0] === "P") {
                            reduce$1(n + 1, getArg(stack, 1));
                            return root;
                        } else if (matchValue.Fields[1].Case === "Binary") {
                            var func = matchValue.Fields[1].Fields[0];
                            var a = reduce$1(n + 1, getArg(stack, 1));
                            var b = reduce$1(n + 1, getArg(stack, 2));
                            var ret = func(a.contents)(b.contents);
                            getStack(stack, 2).contents = ret;
                            return reduceLoop();
                        } else {
                            var _func = matchValue.Fields[1].Fields[0];

                            _func(stack)(n);

                            return reduceLoop();
                        }
                    } else if (matchValue.Case === "DName") {
                        var body = matchValue.Fields[1];
                        var s = matchValue.Fields[0];
                        {
                            fsFormat("%sEntering function %s...")(function (x) {
                                console.log(x);
                            })(indent(n))(s);
                            top.contents = body.contents;
                            return reduceLoop();
                        }
                    } else {
                        return top;
                    }
                };

                if (matchValue.Case === "DCell") {
                    return {
                        v: fsFormat("Should never happen!")(function (x) {
                            throw new Error(x);
                        })
                    };
                } else if (matchValue.Case === "DImpl") {
                    if (matchValue.Fields[2] > stack.length) {
                        var n_1 = matchValue.Fields[2];
                        return {
                            v: root
                        };
                    } else {
                        return {
                            v: _target2()
                        };
                    }
                } else {
                    return {
                        v: _target2()
                    };
                }
            }();

            if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
        }
    };

    var retVal = reduceLoop();
    fsFormat("%svalue is: %s")(function (x) {
        console.log(x);
    })(indent(n))(ppL(retVal));
    return retVal;
}
function IReduce(stack, n) {
    var x = getArg(stack, 1);
    changeStack(stack, 1, x.contents);
}
function KReduce(stack, n) {
    var y = getArg(stack, 1);
    changeStack(stack, 2, y.contents);
}
function SReduce(stack, n) {
    var ga = function ga(n_1) {
        return getArg(stack, n_1);
    };

    var patternInput = [ga(1), ga(2), ga(3)];
    changeStack(stack, 3, DApply(DApply(patternInput[0], patternInput[2]), DApply(patternInput[1], patternInput[2])).contents);
}
function FReduce(stack, n) {
    var y = getArg(stack, 2);
    changeStack(stack, 2, y.contents);
}
function ISPAIRReduce(dBool, stack, n) {
    var b = function () {
        var matchValue = getArg(stack, 1).contents;

        var _target1 = function _target1() {
            return false;
        };

        if (matchValue.Case === "DImpl") {
            if (matchValue.Fields[0] === "ISPAIR") {
                return DIsPair(reduce$1(n + 1, getArg(stack, 1)));
            } else {
                return _target1();
            }
        } else {
            return _target1();
        }
    }();

    changeStack(stack, 1, dBool(b));
}
var BuiltInFuncs = function () {
    var comb = function comb(cName) {
        return function (cFun) {
            return function (arity) {
                return [cName, {
                    contents: new Data("DImpl", [cName, new RRule("Custom", [cFun]), arity])
                }];
            };
        };
    };

    var binop = function binop(bName) {
        return function (bFun) {
            return [bName, {
                contents: new Data("DImpl", [bName, new RRule("Binary", [bFun]), 2])
            }];
        };
    };

    var dBool = function dBool(b) {
        if (b) {
            return comb("K")(function (stack) {
                return function (n) {
                    KReduce(stack, n);
                };
            })(2)[1].contents;
        } else {
            return comb("F")(function (stack) {
                return function (n) {
                    FReduce(stack, n);
                };
            })(2)[1].contents;
        }
    };

    return ofArray$1([comb("P")(function (_arg2) {
        return function (_arg1) {};
    })(2), function (tupledArg) {
        return ["::", tupledArg[1]];
    }(comb("P")(function (_arg4) {
        return function (_arg3) {};
    })(2)), comb("I")(function (stack) {
        return function (n) {
            IReduce(stack, n);
        };
    })(1), comb("K")(function (stack) {
        return function (n) {
            KReduce(stack, n);
        };
    })(2), comb("F")(function (stack) {
        return function (n) {
            FReduce(stack, n);
        };
    })(2), comb("S")(function (stack) {
        return function (n) {
            SReduce(stack, n);
        };
    })(3), comb("ISPAIR")(function (stack) {
        return function (n) {
            ISPAIRReduce(dBool, stack, n);
        };
    })(1), comb("ITE")(function (stack) {
        return function (n) {
            IReduce(stack, n);
        };
    })(1), binop("+")(function (a) {
        return function (b) {
            return new Data("DInt", [getInt(a) + getInt(b)]);
        };
    }), binop("-")(function (a) {
        return function (b) {
            return new Data("DInt", [getInt(a) - getInt(b)]);
        };
    }), binop("/")(function (a) {
        return function (b) {
            return new Data("DInt", [~~(getInt(a) / getInt(b))]);
        };
    }), binop("%")(function (a) {
        return function (b) {
            return new Data("DInt", [getInt(a) % getInt(b)]);
        };
    }), binop("*")(function (a) {
        return function (b) {
            return new Data("DInt", [getInt(a) * getInt(b)]);
        };
    }), binop("<")(function (a) {
        return function (b) {
            return dBool(getInt(a) < getInt(b));
        };
    }), binop(">")(function (a) {
        return function (b) {
            return dBool(getInt(a) > getInt(b));
        };
    }), binop("=")(function (a) {
        return function (b) {
            return dBool(DEquals(a, b));
        };
    })]);
}();

var src = "IF x THEN a b ( y+z ) ELSE (123) FI";
var src1 = "2+3";
var src3 = "LET fib n = IF n < 2 THEN 1 ELSE fib(n-1) + fib(n-2) FI IN fib 8";
var src2 = "LET f x = x + 11 IN LET g x = x+1 IN f 20 + f 30 + g 7";
var src4 = "LET f n = IF n > 0 THEN 101 ELSE 2 + f (n-1) FI IN f 2";
var src5 = "LET fpp n = P 1 (fpp (n+1)) IN fpp 1";
var tokens = function tokens($var6) {
    return toList(tokeniseList($var6));
};
var parse = function () {
    var rbPrio = 0;
    return function (toks) {
        return ParseExpression(rbPrio, toks);
    };
}();
var make = function make(exp) {
    return makeHeap(BuiltInFuncs, exp);
};
var pp = function pp(x) {
    return ppL(x);
};
function testProgram(src_1) {
    fsFormat("Input = %A\n\n")(function (x) {
        console.log(x);
    })(src_1);
    fsFormat("Tokens = %A\n\n")(function (x) {
        console.log(x);
    })(tokens(src_1));
    var pTree = parse(tokens(src_1));
    fsFormat("Parse Tree = %A\n\n")(function (x) {
        console.log(x);
    })(pTree);
    var heap = pTree != null ? function () {
        var exp = pTree[0];
        return make(exp);
    }() : fsFormat("Unexpected parse tree, expected 'Some(exp,_)'\nfound: %A")(function (x) {
        throw new Error(x);
    })(pTree);
    fsFormat("Memory Graph = %s\n\n")(function (x) {
        console.log(x);
    })(pp(heap));
    return reduce$1(0, heap);
}
function enterProgram() {
    return testProgram(src1);
}
enterProgram();

exports.src = src;
exports.src1 = src1;
exports.src3 = src3;
exports.src2 = src2;
exports.src4 = src4;
exports.src5 = src5;
exports.tokens = tokens;
exports.parse = parse;
exports.make = make;
exports.pp = pp;
exports.testProgram = testProgram;
exports.enterProgram = enterProgram;

Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=Main.js.map