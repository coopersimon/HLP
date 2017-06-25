(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

function saveCodeMirror(myEditor)
{
	myEditor.save();
	return document.getElementById("editor").value;
}

function initializeCodeMirror() {
	var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
			lineNumbers: true,
			theme: 'blackboard'
		});
	return editor
}

function changeCMTheme(cmEditor) {
	//console.log("changeCMTheme")
	//myEditor.refresh();
}

function highlightLine(lineNumber,myEditor,colour) {
	var actualLine = lineNumber - 1;
	if(colour == 1) {
		var actualLine = lineNumber - 1;
		myEditor.addLineClass(actualLine, 'background', 'error');
	}
	if(colour == 2) {
		var actualLine = lineNumber - 1;
		myEditor.addLineClass(actualLine, 'background', 'select');
	}
	myEditor.refresh();
}

function clearAllLines(myEditor) {
	for (var i = 0; i < myEditor.lineCount(); i++) {
		myEditor.removeLineClass(i, 'background', 'error');
		myEditor.removeLineClass(i, 'background', 'select');
	}
	myEditor.refresh();
}

function getJSON() {
	const FS = require('fs');
	var testsString = FS.readFileSync("./tests.json", 'utf8');
	return testsString;
}

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
function compareRecords(x, y) {
    if (x === y) {
        return 0;
    }
    else {
        var keys = getPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            var res = compare(x[keys[i]], y[keys[i]]);
            if (res !== 0)
                return res;
        }
        return 0;
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
        var output = { value: null };
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
                        output = { value: cur.value };
                        hasFinished = true;
                    }
                    else {
                        innerIter = null;
                    }
                }
            }
            return innerIter != null && output != null ? [output.value, innerIter] : null;
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

function partition$2(f, xs) {
    return fold$1(function (acc, x) {
        var lacc = acc[0], racc = acc[1];
        return f(x) ? [new List(x, lacc), racc] : [lacc, new List(x, racc)];
    }, [new List(), new List()], reverse$1(xs));
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
function readMem(addr, _arg1) {
    var matchValue = tryFind$$1(addr, _arg1.Fields[5]);

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
function readMemByte(addr, _arg1) {
    var matchValue = tryFind$$1(addr & -4, _arg1.Fields[5]);

    if (matchValue == null) {
        return 0 & 0xFF;
    } else {
        return matchValue >> 8 * (addr % 4) & 255 & 0xFF;
    }
}
function writeMemByte(addr, b, _arg1) {
    var mask = -1 ^ 255 << addr % 4;
    var newMem = void 0;
    var matchValue = tryFind$$1(addr & -4, _arg1.Fields[5]);

    if (matchValue == null) {
        newMem = add(addr, ~~(b << 8 * (addr % 4)), _arg1.Fields[5]);
    } else {
        newMem = add(addr, mask & matchValue | ~~(b << 8 * (addr % 4)), _arg1.Fields[5]);
    }

    return new StateHandle("S", [_arg1.Fields[0], _arg1.Fields[1], _arg1.Fields[2], _arg1.Fields[3], _arg1.Fields[4], newMem]);
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

function parse(v, kind) {
    if (kind == null) {
        kind = typeof v == "string" && v.slice(-1) == "Z" ? 1 : 2;
    }
    var date = (v == null) ? new Date() : new Date(v);
    if (kind === 2) {
        date.kind = kind;
    }
    if (isNaN(date.getTime())) {
        throw new Error("The string is not a valid Date.");
    }
    return date;
}

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

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Html = function () {
   function Html(caseName, fields) {
      _classCallCheck$1(this, Html);

      this.Case = caseName;
      this.Fields = fields;
   }

   _createClass$1(Html, [{
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
               var $var733 = elem_1.Case === "Elem" ? elem_1.Fields[1].tail != null ? elem_1.Fields[1].head.Case === "Text" ? elem_1.Fields[1].tail.tail == null ? [1, elem_1.Fields[1].head.Fields[0], elem_1.Fields[0]] : [2, elem_1.Fields[1], elem_1.Fields[0]] : [2, elem_1.Fields[1], elem_1.Fields[0]] : [2, elem_1.Fields[1], elem_1.Fields[0]] : elem_1.Case === "Text" ? [3, elem_1.Fields[0]] : [0, elem_1.Fields[0], elem_1.Fields[1]];

               switch ($var733[0]) {
                  case 0:
                     return $var733[1] + "=\"" + $var733[2] + "\"";

                  case 1:
                     return spaces + "<" + $var733[2] + ">" + $var733[1] + "</" + $var733[2] + ">\r\n";

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
                     }($var733[1]);

                     var attrs = patternInput[0].Equals(new List()) ? "" : " " + join(" ", toList(delay(function () {
                        return map$1(function (attr) {
                           return toString$$1(0)(attr);
                        }, patternInput[0]);
                     })));

                     if (patternInput[1].tail == null) {
                        return spaces + "<" + $var733[2] + attrs + "/>\r\n";
                     } else {
                        return spaces + "<" + $var733[2] + attrs + ">\r\n" + join("", toList(delay(function () {
                           return map$1(function (e) {
                              return toString$$1(indent + 1)(e);
                           }, patternInput[1]);
                        }))) + spaces + "</" + $var733[2] + ">\r\n";
                     }

                  case 3:
                     return spaces + $var733[1] + "\r\n";
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

function interpret(state, instr) {
    interpret: while (true) {
        var matchValue = tryFind$$1(readPC(state), instr);

        if (matchValue == null) {
            return new _Error("Err", [0, fsFormat("Instruction does not exist at address %A.")(function (x) {
                return x;
            })(readPC(state))]);
        } else if (matchValue.Case === "Terminate") {
            return new _Error("Ok", [[matchValue.Fields[0], state]]);
        } else if (matchValue.Case === "LabelRef") {
            return new _Error("Err", [0, "Unresolved label (branch/adr) - this should have been resolved in the parser."]);
        } else if (matchValue.Case === "EndRef") {
            return new _Error("Err", [0, "Unresolved termination - this should have been resolved in the parser."]);
        } else {
            state = incPC(matchValue.Fields[1](state));
            instr = instr;
            continue interpret;
        }
    }
}
function interpretLine(state, instr) {
    var matchValue = tryFind$$1(readPC(state), instr);

    if (matchValue == null) {
        return new _Error("Err", [0, fsFormat("Instruction does not exist at address %A.")(function (x) {
            return x;
        })(readPC(state))]);
    } else if (matchValue.Case === "Terminate") {
        return new _Error("Ok", [[matchValue.Fields[0], state]]);
    } else if (matchValue.Case === "LabelRef") {
        return new _Error("Err", [0, "Unresolved label (branch/adr) - this should have been resolved in the parser."]);
    } else if (matchValue.Case === "EndRef") {
        return new _Error("Err", [0, "Unresolved termination - this should have been resolved in the parser."]);
    } else {
        return new _Error("Ok", [[matchValue.Fields[0], incPC(matchValue.Fields[1](state))]]);
    }
}

function errorList(lst) {
    var addToStr = function addToStr(lst_1) {
        return function (n) {
            var matchValue = n < 10;

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
function invalidRegRange(l) {
    return new _Error("Err", [l, "Register range invalid. Must be a continuous sequence of registers. e.g. {R1-R3, R5, R8-R11}"]);
}
function invalidToken(l, s) {
    return new _Error("Err", [l, fsFormat("Invalid input string: %s. This might be a typo, a non-existent register or an invalid label.")(function (x) {
        return x;
    })(s)]);
}
function unexpectedToken(l, t, lst) {
    return new _Error("Err", [l, fsFormat("Unexpected token: %A. Followed by: %s. Check the supported arguments for the instruction.")(function (x) {
        return x;
    })(t)(errorList(lst))]);
}
function undefinedLabel(l, s) {
    return new _Error("Err", [l, fsFormat("Label undefined: %s. It is being referenced but doesn't point anywhere. This might be a typo.")(function (x) {
        return x;
    })(s)]);
}
function invalidImmRange(l, i) {
    return new _Error("Err", [l, fsFormat("12-bit Immediate value out of range: %x. Must be a 8-bit value, rotated by an even 5-bit value.")(function (x) {
        return x;
    })(i)]);
}
function invalidShiftImmRange(l, i, z) {
    var patternInput = z.Case === "T_LSL" ? [0, 31] : z.Case === "T_LSR" ? [1, 32] : z.Case === "T_ROR" ? [1, 31] : z.Case === "T_RRX" ? [1, 1] : [1, 32];
    return new _Error("Err", [l, fsFormat("Shift immediate value out of range: %d. Must be between %d and %d")(function (x) {
        return x;
    })(i)(patternInput[1])(patternInput[0])]);
}
function invalidShiftMatch(l) {
    return new _Error("Err", [l, fsFormat("Shift matches improperly.")(function (x) {
        return x;
    })]);
}
function invalidMemOffsetRange(l, i) {
    return new _Error("Err", [l, fsFormat("12-bit Immediate offset value out of range: %x. Must be between -4095 and +4095.")(function (x) {
        return x;
    })(i)]);
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
        _classCallCheck$3(this, stackOrder);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$3(stackOrder, [{
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
        _classCallCheck$3(this, opType);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$3(opType, [{
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
                type: "Common.Types.Instruction",
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
setType("Common.Types.Instruction", Instruction);

function shiftI(inst, r, n, state) {
    var m = n % 32;

    if (inst.Case === "T_LSR") {
        if (n >= 32) {
            return 0;
        } else {
            return ~~(readReg(r, state) >>> 0 >>> n);
        }
    } else if (inst.Case === "T_ASR") {
        if (n >= 32) {
            if (readReg(r, state) > 0) {
                return 0;
            } else {
                return -1;
            }
        } else {
            return readReg(r, state) >> n;
        }
    } else if (inst.Case === "T_ROR") {
        if (n === 0) {
            return readReg(r, state);
        } else {
            return ~~((readReg(r, state) >>> 0 >>> m) + (readReg(r, state) >>> 0 << 32 - m));
        }
    } else if (inst.Case === "T_RRX") {
        var matchValue = readCFlag(state);

        if (matchValue) {
            return readReg(r, state) >> 1 + 1 << 31;
        } else {
            return readReg(r, state) >> 1;
        }
    } else if (n >= 32) {
        return 0;
    } else {
        return readReg(r, state) << n;
    }
}
function shiftR(inst, r, rn, state) {
    var m = readReg(rn, state) & 255;
    return shiftI(inst, r, m, state);
}
function shiftSetCI(s, inst, r, n, state) {
    if (n === 0) {
        return state;
    } else if (s) {
        if (inst.Case === "T_LSR") {
            if (n <= 32) {
                return writeCFlag((readReg(r, state) >> n - 1) % 2 !== 0, state);
            } else {
                return writeCFlag(false, state);
            }
        } else if (inst.Case === "T_ASR") {
            if (n <= 32) {
                return writeCFlag((readReg(r, state) >> n - 1) % 2 !== 0, state);
            } else if (n > 0) {
                return writeCFlag(false, state);
            } else {
                return writeCFlag(true, state);
            }
        } else if (inst.Case === "T_ROR") {
            return writeCFlag((readReg(r, state) >> n % 32 - 1) % 2 !== 0, state);
        } else if (inst.Case === "T_RRX") {
            return writeCFlag(readReg(r, state) % 2 !== 0, state);
        } else if (n <= 32) {
            return writeCFlag((readReg(r, state) >> 32 - n) % 2 !== 0, state);
        } else {
            return writeCFlag(false, state);
        }
    } else {
        return state;
    }
}
function shiftSetCR(s, inst, r, rn, state) {
    var m = readReg(rn, state) & 255;
    return shiftSetCI(s, inst, r, m, state);
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
            return function (state_2) {
                return movI(c, s, rd, op2, state_2);
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
            return function (state_2) {
                return mvnI(c, s, rd, op2, state_2);
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
            return function (state_2) {
                return andI(c, s, rd, rn, op2, state_2);
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
            return function (state_2) {
                return orrI(c, s, rd, rn, op2, state_2);
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
            return function (state_2) {
                return eorI(c, s, rd, rn, op2, state_2);
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
            return function (state_2) {
                return bicI(c, s, rd, rn, op2, state_2);
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
            return function (state_2) {
                return tstI(c, rn, op2, state_2);
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
            return function (state_2) {
                return teqI(c, rn, op2, state_2);
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
function ldrWL(c, rd, label, state) {
    if (c(state)) {
        return writeReg(rd, readMem(label, state), state);
    } else {
        return state;
    }
}
function ldrBL(c, rd, label, state) {
    if (c(state)) {
        return writeReg(rd, ~~readMemByte(label, state), state);
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
                var v_1 = readMem(readReg(rn, state) + i, state);
                return function (arg20__1) {
                    return writeReg(rd, v_1, arg20__1);
                };
            }()(state));
        } else {
            return function () {
                var v_2 = readMem(readReg(rn, state) + i, state);
                return function (arg20__2) {
                    return writeReg(rd, v_2, arg20__2);
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
            var v_1 = readMem(readReg(rn, state), state);
            return function (arg20__1) {
                return writeReg(rd, v_1, arg20__1);
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
                var v_1 = ~~readMemByte(readReg(rn, state) + i, state);
                return function (arg20__1) {
                    return writeReg(rd, v_1, arg20__1);
                };
            }()(state));
        } else {
            return function () {
                var v_2 = ~~readMemByte(readReg(rn, state) + i, state);
                return function (arg20__2) {
                    return writeReg(rd, v_2, arg20__2);
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
            var v_1 = ~~readMemByte(readReg(rn, state), state);
            return function (arg20__1) {
                return writeReg(rd, v_1, arg20__1);
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
    var writeVal = readReg(rd, state) & 0xFF;

    if (c(state)) {
        if (inc) {
            return function () {
                var v = readReg(rn, state) + i;
                return function (arg20_) {
                    return writeReg(rn, v, arg20_);
                };
            }()(function () {
                var addr = readReg(rn, state) + i;
                return function (arg20__1) {
                    return writeMemByte(addr, writeVal, arg20__1);
                };
            }()(state));
        } else {
            return function () {
                var addr_1 = readReg(rn, state) + i;
                return function (arg20__2) {
                    return writeMemByte(addr_1, writeVal, arg20__2);
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
    var writeVal = readReg(rd, state) & 0xFF;

    if (c(state)) {
        return function () {
            var v = readReg(rn, state) + i;
            return function (arg20_) {
                return writeReg(rn, v, arg20_);
            };
        }()(function () {
            var addr = readReg(rn, state);
            return function (arg20__1) {
                return writeMemByte(addr, writeVal, arg20__1);
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
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var412 = mem + 4;
                        var $var413 = reglist_1.tail;

                        state_1 = function () {
                            var v = readMem(mem, state_1);
                            return function (arg20_) {
                                return writeReg(reglist_1.head, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var412;
                        reglist_1 = $var413;
                        continue loop;
                    }
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
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var419 = mem + 4;
                        var $var420 = reglist_1.tail;

                        state_1 = function () {
                            var v = readMem(mem, state_1);
                            return function (arg20_) {
                                return writeReg(reglist_1.head, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var419;
                        reglist_1 = $var420;
                        continue loop;
                    }
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem + 4)(reglist)(write ? writeReg(rn, startMem + reglist.length * 4, state) : state);
    } else {
        return state;
    }
}
function ldmDA(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var426 = mem - 4;
                        var $var427 = reglist_1.tail;

                        state_1 = function () {
                            var v = readMem(mem, state_1);
                            return function (arg20_) {
                                return writeReg(reglist_1.head, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var426;
                        reglist_1 = $var427;
                        continue loop;
                    }
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
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var433 = mem - 4;
                        var $var434 = reglist_1.tail;

                        state_1 = function () {
                            var v = readMem(mem, state_1);
                            return function (arg20_) {
                                return writeReg(reglist_1.head, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var433;
                        reglist_1 = $var434;
                        continue loop;
                    }
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem - 4)(reglist)(write ? writeReg(rn, startMem - reglist.length * 4, state) : state);
    } else {
        return state;
    }
}
function stmIA(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var440 = mem + 4;
                        var $var441 = reglist_1.tail;

                        state_1 = function () {
                            var v = readReg(reglist_1.head, state_1);
                            return function (arg20_) {
                                return writeMem(mem, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var440;
                        reglist_1 = $var441;
                        continue loop;
                    }
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
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var447 = mem + 4;
                        var $var448 = reglist_1.tail;

                        state_1 = function () {
                            var v = readReg(reglist_1.head, state_1);
                            return function (arg20_) {
                                return writeMem(mem, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var447;
                        reglist_1 = $var448;
                        continue loop;
                    }
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem + 4)(reglist)(write ? writeReg(rn, startMem + reglist.length * 4, state) : state);
    } else {
        return state;
    }
}
function stmDA(c, write, rn, reglist, state) {
    var loop = function loop(mem) {
        return function (reglist_1) {
            return function (state_1) {
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var454 = mem - 4;
                        var $var455 = reglist_1.tail;

                        state_1 = function () {
                            var v = readReg(reglist_1.head, state_1);
                            return function (arg20_) {
                                return writeMem(mem, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var454;
                        reglist_1 = $var455;
                        continue loop;
                    }
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
                loop: while (true) {
                    if (reglist_1.tail == null) {
                        return state_1;
                    } else {
                        var $var461 = mem - 4;
                        var $var462 = reglist_1.tail;

                        state_1 = function () {
                            var v = readReg(reglist_1.head, state_1);
                            return function (arg20_) {
                                return writeMem(mem, v, arg20_);
                            };
                        }()(state_1);

                        mem = $var461;
                        reglist_1 = $var462;
                        continue loop;
                    }
                }
            };
        };
    };

    var startMem = readReg(rn, state);

    if (c(state)) {
        return loop(startMem - 4)(reglist)(write ? writeReg(rn, startMem - reglist.length * 4, state) : state);
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

function resolveRefs(labels, endMem, instrLst) {
    var resolveRec = function resolveRec(labels_1) {
        return function (endMem_1) {
            return function (outLst) {
                return function (_arg1) {
                    resolveRec: while (true) {
                        if (_arg1.tail == null) {
                            return new _Error("Ok", [outLst]);
                        } else if (_arg1.head[1].Case === "LabelRef") {
                            var matchValue = _arg1.head[1].Fields[0](labels_1);

                            if (matchValue.Case === "Err") {
                                return new _Error("Err", [matchValue.Fields[0], matchValue.Fields[1]]);
                            } else {
                                labels_1 = labels_1;
                                endMem_1 = endMem_1;
                                outLst = append$1(outLst, ofArray([[_arg1.head[0], matchValue.Fields[0]]]));
                                _arg1 = _arg1.tail;
                                continue resolveRec;
                            }
                        } else if (_arg1.head[1].Case === "EndRef") {
                            labels_1 = labels_1;
                            var $var480 = endMem_1;
                            outLst = append$1(outLst, ofArray([[_arg1.head[0], _arg1.head[1].Fields[0](endMem_1)]]));
                            _arg1 = _arg1.tail;
                            endMem_1 = $var480;
                            continue resolveRec;
                        } else {
                            labels_1 = labels_1;
                            endMem_1 = endMem_1;
                            outLst = append$1(outLst, ofArray([_arg1.head]));
                            _arg1 = _arg1.tail;
                            continue resolveRec;
                        }
                    }
                };
            };
        };
    };

    return resolveRec(labels)(endMem)(new List())(instrLst);
}

function int12(num) {
    var shift = function shift(n) {
        return function (shamt) {
            shift: while (true) {
                var matchValue = (n & 4294967040) === 0;

                if (matchValue) {
                    return true;
                } else if (shamt < 15) {
                    n = n >>> 2 | n << 30;
                    shamt = shamt + 1;
                    continue shift;
                } else {
                    return false;
                }
            }
        };
    };

    return shift(num >>> 0)(0);
}

function offset(num) {
    if (num >= -4095) {
        return num <= 4095;
    } else {
        return false;
    }
}

function shint(n, shiftType) {
    if (shiftType.Case === "T_LSR") {
        if (n >= 1) {
            return n <= 32;
        } else {
            return false;
        }
    } else if (shiftType.Case === "T_ASR") {
        if (n >= 1) {
            return n <= 32;
        } else {
            return false;
        }
    } else if (shiftType.Case === "T_ROR") {
        if (n >= 1) {
            return n <= 31;
        } else {
            return false;
        }
    } else if (shiftType.Case === "T_RRX") {
        return true;
    } else if (n >= 0) {
        return n <= 31;
    } else {
        return false;
    }
}

function regList(tokLst) {
    var regRange = function regRange(r1) {
        return function (r2) {
            return function (outLst) {
                regRange: while (true) {
                    var matchValue = r1 < r2;

                    if (matchValue) {
                        var $var481 = r1 + 1;
                        r2 = r2;
                        outLst = append$1(outLst, ofArray([r1]));
                        r1 = $var481;
                        continue regRange;
                    } else if (r1 === r2) {
                        return new _Error("Ok", [append$1(outLst, ofArray([r1]))]);
                    } else if (matchValue) {
                        throw new Error("/Users/raviwoods/Google_Drive/ICComp/Uni_Year_3/HLP/HLP/FABLE/FABLEProject/src/fs/Parser.fs", 50, 18);
                    } else {
                        return invalidRegRange(0);
                    }
                }
            };
        };
    };

    var regRec = function regRec(outLst_1) {
        return function (_arg1) {
            regRec: while (true) {
                var $var474 = _arg1.tail == null ? [6] : _arg1.head.Case === "T_REG" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_COMMA" ? [0, _arg1.head.Fields[0], _arg1.tail.tail] : _arg1.tail.head.Case === "T_DASH" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [1, _arg1.head.Fields[0], _arg1.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_R_CBR" ? [3, _arg1.head.Fields[0], _arg1.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [5, _arg1.tail, _arg1.head] : [5, _arg1.tail, _arg1.head] : [5, _arg1.tail, _arg1.head] : [5, _arg1.tail, _arg1.head] : _arg1.tail.head.Case === "T_R_CBR" ? [2, _arg1.head.Fields[0], _arg1.tail.tail] : [5, _arg1.tail, _arg1.head] : [5, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_ERROR" ? [4, _arg1.head.Fields[0], _arg1.tail] : [5, _arg1.tail, _arg1.head];

                switch ($var474[0]) {
                    case 0:
                        outLst_1 = append$1(outLst_1, ofArray([$var474[1]]));
                        _arg1 = $var474[2];
                        continue regRec;

                    case 1:
                        var matchValue_1 = regRange($var474[1])($var474[2])(new List());

                        if (matchValue_1.Case === "Err") {
                            return new _Error("Err", [0, matchValue_1.Fields[1]]);
                        } else {
                            outLst_1 = append$1(outLst_1, matchValue_1.Fields[0]);
                            _arg1 = $var474[3];
                            continue regRec;
                        }

                    case 2:
                        return new _Error("Ok", [[append$1(outLst_1, ofArray([$var474[1]])), $var474[2]]]);

                    case 3:
                        var matchValue_2 = regRange($var474[1])($var474[2])(new List());

                        if (matchValue_2.Case === "Err") {
                            return new _Error("Err", [0, matchValue_2.Fields[1]]);
                        } else {
                            return new _Error("Ok", [[append$1(outLst_1, matchValue_2.Fields[0]), $var474[3]]]);
                        }

                    case 4:
                        return invalidToken(0, $var474[1]);

                    case 5:
                        return unexpectedToken(0, $var474[2], $var474[1]);

                    case 6:
                        return invalidRegRange(0);
                }
            }
        };
    };

    return regRec(new List())(tokLst);
}

function shiftMatch(z, tokLst) {
    var matchValue = [z, tokLst];

    if (matchValue[0].Case === "T_RRX") {
        return new _Error("Ok", [[new opType("T_I", []), 0, matchValue[1]]]);
    } else if (matchValue[1].tail == null) {
        return invalidShiftMatch(0);
    } else if (matchValue[1].head.Case === "T_INT") {
        var matchValue_1 = shint(matchValue[1].head.Fields[0], z);

        if (matchValue_1) {
            return new _Error("Ok", [[new opType("T_I", []), matchValue[1].head.Fields[0], matchValue[1].tail]]);
        } else {
            return invalidShiftImmRange(0, matchValue[1].head.Fields[0], z);
        }
    } else if (matchValue[1].head.Case === "T_REG") {
        return new _Error("Ok", [[new opType("T_R", []), matchValue[1].head.Fields[0], matchValue[1].tail]]);
    } else {
        return unexpectedToken(0, matchValue[1].head, matchValue[1].tail);
    }
}

function parser(tokLst) {
    var branchRef = function branchRef(l) {
        return function (c) {
            return function (s) {
                return function (bInst) {
                    return function (labels) {
                        var matchValue = tryFind$$1(s, labels);

                        if (matchValue == null) {
                            return undefinedLabel(l, s);
                        } else {
                            return new _Error("Ok", [new Instruction("Instr", [l, bInst(c)(matchValue - 4)])]);
                        }
                    };
                };
            };
        };
    };

    var lsaRef = function lsaRef(l_1) {
        return function (c_1) {
            return function (rd) {
                return function (s_1) {
                    return function (inst) {
                        return function (labels_1) {
                            var matchValue_1 = tryFind$$1(s_1, labels_1);

                            if (matchValue_1 == null) {
                                return undefinedLabel(l_1, s_1);
                            } else {
                                return new _Error("Ok", [new Instruction("Instr", [l_1, inst(c_1)(rd)(matchValue_1)])]);
                            }
                        };
                    };
                };
            };
        };
    };

    var endRef = function endRef(l_2) {
        return function (c_2) {
            return function (endMem) {
                return new Instruction("Instr", [l_2, function () {
                    var finalInstAddr = endMem - 4;
                    return function (state) {
                        return endI(c_2, finalInstAddr, state);
                    };
                }()]);
            };
        };
    };

    var parseRec = function parseRec(m) {
        return function (l_3) {
            return function (labels_2) {
                return function (outLst) {
                    return function (_arg1) {
                        var _loop = function _loop() {
                            var $var475 = _arg1.tail == null ? [117] : _arg1.head.Case === "T_MOV" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_INT" ? [0, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [1, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.head.Fields[0]] : [2, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [2, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [2, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [2, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_MVN" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_INT" ? [3, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [4, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.head.Fields[0]] : [5, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [5, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [5, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [5, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_ADD" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [6, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [7, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [8, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [8, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [8, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [8, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_ADC" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [9, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [10, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [11, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [11, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [11, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [11, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_SUB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [12, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [13, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [14, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [14, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [14, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [14, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_SBC" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [15, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [16, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [17, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [17, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [17, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [17, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_RSB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [18, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [19, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [20, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [20, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [20, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [20, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_RSC" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [21, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [22, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [23, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [23, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [23, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [23, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_MUL" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [24, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_MLA" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [25, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_AND" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [26, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [27, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [28, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [28, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [28, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [28, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_ORR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [29, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [30, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [31, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [31, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [31, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [31, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_EOR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [32, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [33, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [34, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [34, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [34, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [34, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_BIC" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [35, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [36, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [37, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [37, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [37, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [37, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_CMP" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_INT" ? [38, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [39, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.head.Fields[0]] : [40, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [40, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [40, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [40, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_CMN" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_INT" ? [41, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [42, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.head.Fields[0]] : [43, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [43, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [43, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [43, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_TST" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_INT" ? [44, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [45, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.head.Fields[0]] : [46, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [46, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [46, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [46, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_TEQ" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_INT" ? [47, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [48, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.head.Fields[0]] : [49, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [49, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [49, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [49, _arg1.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_SHIFT" ? _arg1.head.Fields[0].Case === "T_LSR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [51, _arg1.head.Fields[1][0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1][1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Fields[0].Case === "T_ASR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [52, _arg1.head.Fields[1][0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1][1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Fields[0].Case === "T_ROR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [53, _arg1.head.Fields[1][0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1][1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Fields[0].Case === "T_RRX" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? [54, _arg1.head.Fields[1][0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1][1], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_REG" ? [50, _arg1.head.Fields[1][0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.head.Fields[0], _arg1.head.Fields[1][1], _arg1.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_B" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_LABEL" ? [55, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_BL" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_LABEL" ? [56, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_BX" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? [57, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_ADR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_LABEL" ? [58, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_LDR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_L_BRAC" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [59, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [61, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [61, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [61, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [61, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [60, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [66, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [66, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [66, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [66, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [67, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [68, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [68, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [69, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [70, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [70, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [71, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail.tail.head.Case === "T_EQUAL" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_LABEL" ? [65, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_LDRB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_L_BRAC" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [62, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [64, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [64, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [64, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [64, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [63, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [73, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [73, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [73, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [73, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [74, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [75, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [75, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [76, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [77, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [77, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [78, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail.tail.head.Case === "T_EQUAL" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_LABEL" ? [72, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_STR" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_L_BRAC" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [79, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [81, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [81, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [81, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [81, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [80, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [85, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [85, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [85, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [85, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [86, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [87, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [87, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [88, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [89, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [89, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [90, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_STRB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_L_BRAC" ? _arg1.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [82, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [84, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [84, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [84, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [84, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? [83, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [91, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [91, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [91, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : [91, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_INT" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [92, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [93, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [93, _arg1.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail.tail.tail.tail.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_R_BRAC" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_EXCL" ? [94, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail] : [95, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : [95, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail] : _arg1.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_COMMA" ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Case === "T_SHIFT" ? [96, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.head.Fields[0], _arg1.tail.tail.tail.tail.tail.tail.tail.tail.tail, _arg1.tail.tail.tail.tail.tail.tail.tail.tail.head.Fields[0]] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_LDM" ? _arg1.head.Fields[1].Case === "S_IB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [99, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [100, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Fields[1].Case === "S_DA" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [101, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [102, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Fields[1].Case === "S_DB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [103, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [104, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [97, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [98, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_STM" ? _arg1.head.Fields[1].Case === "S_IB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [107, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [108, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Fields[1].Case === "S_DA" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [109, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [110, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Fields[1].Case === "S_DB" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [111, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [112, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_REG" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_COMMA" ? [105, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_EXCL" ? _arg1.tail.tail.tail.tail != null ? _arg1.tail.tail.tail.head.Case === "T_COMMA" ? [106, _arg1.head.Fields[0], _arg1.tail.head.Fields[0], _arg1.tail.tail.tail.tail] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : [120, _arg1.tail, _arg1.head] : _arg1.head.Case === "T_LABEL" ? _arg1.tail.tail != null ? _arg1.tail.head.Case === "T_EQU" ? _arg1.tail.tail.tail != null ? _arg1.tail.tail.head.Case === "T_INT" ? [113, _arg1.tail.tail.head.Fields[0], _arg1.head.Fields[0], _arg1.tail.tail.tail] : _arg1.tail.tail.head.Case === "T_LABEL" ? [114, _arg1.head.Fields[0], _arg1.tail.tail.head.Fields[0], _arg1.tail.tail.tail] : [116, _arg1.head.Fields[0], _arg1.tail] : [116, _arg1.head.Fields[0], _arg1.tail] : [116, _arg1.head.Fields[0], _arg1.tail] : [116, _arg1.head.Fields[0], _arg1.tail] : _arg1.head.Case === "T_END" ? [115, _arg1.head.Fields[0], _arg1.tail] : _arg1.head.Case === "T_NEWLINE" ? [118, _arg1.tail] : _arg1.head.Case === "T_ERROR" ? [119, _arg1.head.Fields[0], _arg1.tail] : [120, _arg1.tail, _arg1.head];

                            switch ($var475[0]) {
                                case 0:
                                    var matchValue_2 = int12($var475[2]);

                                    if (matchValue_2) {
                                        var $var496 = m + 4;
                                        var $var497 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_1) {
                                            return movI($var475[1], $var475[4], $var475[3], $var475[2], state_1);
                                        }])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var497;
                                        m = $var496;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 1:
                                    var matchValue_3 = shiftMatch($var475[6], $var475[5]);

                                    if (matchValue_3.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_3.Fields[1]])
                                        };
                                    } else {
                                        var v = matchValue_3.Fields[0][1];
                                        var tail = matchValue_3.Fields[0][2];
                                        var ir = matchValue_3.Fields[0][0];
                                        var $var498 = m + 4;
                                        var $var499 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_2) {
                                            return movR($var475[1], $var475[4], $var475[2], $var475[3], $var475[6], v, ir, state_2);
                                        }])]]));
                                        _arg1 = tail;
                                        l_3 = $var499;
                                        m = $var498;
                                        return "continue|parseRec";
                                    }

                                case 2:
                                    var $var500 = m + 4;
                                    var $var501 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst = new shiftOp("T_LSL", []);
                                        var nORrn = 0;
                                        var rstype = new opType("T_I", []);
                                        return function (state_3) {
                                            return movR($var475[1], $var475[4], $var475[2], $var475[3], rsinst, nORrn, rstype, state_3);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var501;
                                    m = $var500;
                                    return "continue|parseRec";

                                case 3:
                                    var matchValue_4 = int12($var475[2]);

                                    if (matchValue_4) {
                                        var $var502 = m + 4;
                                        var $var503 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_4) {
                                            return mvnI($var475[1], $var475[4], $var475[3], $var475[2], state_4);
                                        }])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var503;
                                        m = $var502;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 4:
                                    var matchValue_5 = shiftMatch($var475[6], $var475[5]);

                                    if (matchValue_5.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_5.Fields[1]])
                                        };
                                    } else {
                                        var v_1 = matchValue_5.Fields[0][1];
                                        var tail_1 = matchValue_5.Fields[0][2];
                                        var ir_1 = matchValue_5.Fields[0][0];
                                        var $var504 = m + 4;
                                        var $var505 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_5) {
                                            return mvnR($var475[1], $var475[4], $var475[2], $var475[3], $var475[6], v_1, ir_1, state_5);
                                        }])]]));
                                        _arg1 = tail_1;
                                        l_3 = $var505;
                                        m = $var504;
                                        return "continue|parseRec";
                                    }

                                case 5:
                                    var $var506 = m + 4;
                                    var $var507 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_1 = new shiftOp("T_LSL", []);
                                        var nORrn_1 = 0;
                                        var rstype_1 = new opType("T_I", []);
                                        return function (state_6) {
                                            return mvnR($var475[1], $var475[4], $var475[2], $var475[3], rsinst_1, nORrn_1, rstype_1, state_6);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var507;
                                    m = $var506;
                                    return "continue|parseRec";

                                case 6:
                                    var matchValue_6 = int12($var475[2]);

                                    if (matchValue_6) {
                                        var $var508 = m + 4;
                                        var $var509 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_7) {
                                            return addI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_7);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var509;
                                        m = $var508;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 7:
                                    var matchValue_7 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_7.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_7.Fields[1]])
                                        };
                                    } else {
                                        var v_2 = matchValue_7.Fields[0][1];
                                        var tail_2 = matchValue_7.Fields[0][2];
                                        var ir_2 = matchValue_7.Fields[0][0];
                                        var $var510 = m + 4;
                                        var $var511 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_8) {
                                            return addR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_2, ir_2, state_8);
                                        }])]]));
                                        _arg1 = tail_2;
                                        l_3 = $var511;
                                        m = $var510;
                                        return "continue|parseRec";
                                    }

                                case 8:
                                    var $var512 = m + 4;
                                    var $var513 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_2 = new shiftOp("T_LSL", []);
                                        var nORrn_2 = 0;
                                        var rstype_2 = new opType("T_I", []);
                                        return function (state_9) {
                                            return addR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_2, nORrn_2, rstype_2, state_9);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var513;
                                    m = $var512;
                                    return "continue|parseRec";

                                case 9:
                                    var matchValue_8 = int12($var475[2]);

                                    if (matchValue_8) {
                                        var $var514 = m + 4;
                                        var $var515 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_10) {
                                            return adcI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_10);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var515;
                                        m = $var514;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 10:
                                    var matchValue_9 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_9.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_9.Fields[1]])
                                        };
                                    } else {
                                        var v_3 = matchValue_9.Fields[0][1];
                                        var tail_3 = matchValue_9.Fields[0][2];
                                        var ir_3 = matchValue_9.Fields[0][0];
                                        var $var516 = m + 4;
                                        var $var517 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_11) {
                                            return adcR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_3, ir_3, state_11);
                                        }])]]));
                                        _arg1 = tail_3;
                                        l_3 = $var517;
                                        m = $var516;
                                        return "continue|parseRec";
                                    }

                                case 11:
                                    var $var518 = m + 4;
                                    var $var519 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_3 = new shiftOp("T_LSL", []);
                                        var nORrn_3 = 0;
                                        var rstype_3 = new opType("T_I", []);
                                        return function (state_12) {
                                            return adcR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_3, nORrn_3, rstype_3, state_12);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var519;
                                    m = $var518;
                                    return "continue|parseRec";

                                case 12:
                                    var matchValue_10 = int12($var475[2]);

                                    if (matchValue_10) {
                                        var $var520 = m + 4;
                                        var $var521 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_13) {
                                            return subI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_13);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var521;
                                        m = $var520;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 13:
                                    var matchValue_11 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_11.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_11.Fields[1]])
                                        };
                                    } else {
                                        var v_4 = matchValue_11.Fields[0][1];
                                        var tail_4 = matchValue_11.Fields[0][2];
                                        var ir_4 = matchValue_11.Fields[0][0];
                                        var $var522 = m + 4;
                                        var $var523 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_14) {
                                            return subR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_4, ir_4, state_14);
                                        }])]]));
                                        _arg1 = tail_4;
                                        l_3 = $var523;
                                        m = $var522;
                                        return "continue|parseRec";
                                    }

                                case 14:
                                    var $var524 = m + 4;
                                    var $var525 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_4 = new shiftOp("T_LSL", []);
                                        var nORrn_4 = 0;
                                        var rstype_4 = new opType("T_I", []);
                                        return function (state_15) {
                                            return subR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_4, nORrn_4, rstype_4, state_15);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var525;
                                    m = $var524;
                                    return "continue|parseRec";

                                case 15:
                                    var matchValue_12 = int12($var475[2]);

                                    if (matchValue_12) {
                                        var $var526 = m + 4;
                                        var $var527 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_16) {
                                            return sbcI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_16);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var527;
                                        m = $var526;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 16:
                                    var matchValue_13 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_13.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_13.Fields[1]])
                                        };
                                    } else {
                                        var v_5 = matchValue_13.Fields[0][1];
                                        var tail_5 = matchValue_13.Fields[0][2];
                                        var ir_5 = matchValue_13.Fields[0][0];
                                        var $var528 = m + 4;
                                        var $var529 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_17) {
                                            return sbcR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_5, ir_5, state_17);
                                        }])]]));
                                        _arg1 = tail_5;
                                        l_3 = $var529;
                                        m = $var528;
                                        return "continue|parseRec";
                                    }

                                case 17:
                                    var $var530 = m + 4;
                                    var $var531 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_5 = new shiftOp("T_LSL", []);
                                        var nORrn_5 = 0;
                                        var rstype_5 = new opType("T_I", []);
                                        return function (state_18) {
                                            return sbcR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_5, nORrn_5, rstype_5, state_18);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var531;
                                    m = $var530;
                                    return "continue|parseRec";

                                case 18:
                                    var matchValue_14 = int12($var475[2]);

                                    if (matchValue_14) {
                                        var $var532 = m + 4;
                                        var $var533 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_19) {
                                            return rsbI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_19);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var533;
                                        m = $var532;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 19:
                                    var matchValue_15 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_15.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_15.Fields[1]])
                                        };
                                    } else {
                                        var v_6 = matchValue_15.Fields[0][1];
                                        var tail_6 = matchValue_15.Fields[0][2];
                                        var ir_6 = matchValue_15.Fields[0][0];
                                        var $var534 = m + 4;
                                        var $var535 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_20) {
                                            return rsbR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_6, ir_6, state_20);
                                        }])]]));
                                        _arg1 = tail_6;
                                        l_3 = $var535;
                                        m = $var534;
                                        return "continue|parseRec";
                                    }

                                case 20:
                                    var $var536 = m + 4;
                                    var $var537 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_6 = new shiftOp("T_LSL", []);
                                        var nORrn_6 = 0;
                                        var rstype_6 = new opType("T_I", []);
                                        return function (state_21) {
                                            return rsbR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_6, nORrn_6, rstype_6, state_21);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var537;
                                    m = $var536;
                                    return "continue|parseRec";

                                case 21:
                                    var matchValue_16 = int12($var475[2]);

                                    if (matchValue_16) {
                                        var $var538 = m + 4;
                                        var $var539 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_22) {
                                            return rscI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_22);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var539;
                                        m = $var538;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 22:
                                    var matchValue_17 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_17.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_17.Fields[1]])
                                        };
                                    } else {
                                        var v_7 = matchValue_17.Fields[0][1];
                                        var tail_7 = matchValue_17.Fields[0][2];
                                        var ir_7 = matchValue_17.Fields[0][0];
                                        var $var540 = m + 4;
                                        var $var541 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_23) {
                                            return rscR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_7, ir_7, state_23);
                                        }])]]));
                                        _arg1 = tail_7;
                                        l_3 = $var541;
                                        m = $var540;
                                        return "continue|parseRec";
                                    }

                                case 23:
                                    var $var542 = m + 4;
                                    var $var543 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_7 = new shiftOp("T_LSL", []);
                                        var nORrn_7 = 0;
                                        var rstype_7 = new opType("T_I", []);
                                        return function (state_24) {
                                            return rscR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_7, nORrn_7, rstype_7, state_24);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var543;
                                    m = $var542;
                                    return "continue|parseRec";

                                case 24:
                                    var $var544 = m + 4;
                                    var $var545 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_25) {
                                        return mulR($var475[1], $var475[5], $var475[2], $var475[3], $var475[4], state_25);
                                    }])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var545;
                                    m = $var544;
                                    return "continue|parseRec";

                                case 25:
                                    var $var546 = m + 4;
                                    var $var547 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_26) {
                                        return mlaR($var475[1], $var475[6], $var475[2], $var475[3], $var475[5], $var475[4], state_26);
                                    }])]]));
                                    _arg1 = $var475[7];
                                    l_3 = $var547;
                                    m = $var546;
                                    return "continue|parseRec";

                                case 26:
                                    var matchValue_18 = int12($var475[2]);

                                    if (matchValue_18) {
                                        var $var548 = m + 4;
                                        var $var549 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_27) {
                                            return andI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_27);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var549;
                                        m = $var548;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 27:
                                    var matchValue_19 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_19.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_19.Fields[1]])
                                        };
                                    } else {
                                        var v_8 = matchValue_19.Fields[0][1];
                                        var tail_8 = matchValue_19.Fields[0][2];
                                        var ir_8 = matchValue_19.Fields[0][0];
                                        var $var550 = m + 4;
                                        var $var551 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_28) {
                                            return andR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_8, ir_8, state_28);
                                        }])]]));
                                        _arg1 = tail_8;
                                        l_3 = $var551;
                                        m = $var550;
                                        return "continue|parseRec";
                                    }

                                case 28:
                                    var $var552 = m + 4;
                                    var $var553 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_8 = new shiftOp("T_LSL", []);
                                        var nORrn_8 = 0;
                                        var rstype_8 = new opType("T_I", []);
                                        return function (state_29) {
                                            return andR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_8, nORrn_8, rstype_8, state_29);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var553;
                                    m = $var552;
                                    return "continue|parseRec";

                                case 29:
                                    var matchValue_20 = int12($var475[2]);

                                    if (matchValue_20) {
                                        var $var554 = m + 4;
                                        var $var555 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_30) {
                                            return orrI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_30);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var555;
                                        m = $var554;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 30:
                                    var matchValue_21 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_21.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_21.Fields[1]])
                                        };
                                    } else {
                                        var v_9 = matchValue_21.Fields[0][1];
                                        var tail_9 = matchValue_21.Fields[0][2];
                                        var ir_9 = matchValue_21.Fields[0][0];
                                        var $var556 = m + 4;
                                        var $var557 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_31) {
                                            return orrR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_9, ir_9, state_31);
                                        }])]]));
                                        _arg1 = tail_9;
                                        l_3 = $var557;
                                        m = $var556;
                                        return "continue|parseRec";
                                    }

                                case 31:
                                    var $var558 = m + 4;
                                    var $var559 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_9 = new shiftOp("T_LSL", []);
                                        var nORrn_9 = 0;
                                        var rstype_9 = new opType("T_I", []);
                                        return function (state_32) {
                                            return orrR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_9, nORrn_9, rstype_9, state_32);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var559;
                                    m = $var558;
                                    return "continue|parseRec";

                                case 32:
                                    var matchValue_22 = int12($var475[2]);

                                    if (matchValue_22) {
                                        var $var560 = m + 4;
                                        var $var561 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_33) {
                                            return eorI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_33);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var561;
                                        m = $var560;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 33:
                                    var matchValue_23 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_23.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_23.Fields[1]])
                                        };
                                    } else {
                                        var v_10 = matchValue_23.Fields[0][1];
                                        var tail_10 = matchValue_23.Fields[0][2];
                                        var ir_10 = matchValue_23.Fields[0][0];
                                        var $var562 = m + 4;
                                        var $var563 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_34) {
                                            return eorR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_10, ir_10, state_34);
                                        }])]]));
                                        _arg1 = tail_10;
                                        l_3 = $var563;
                                        m = $var562;
                                        return "continue|parseRec";
                                    }

                                case 34:
                                    var $var564 = m + 4;
                                    var $var565 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_10 = new shiftOp("T_LSL", []);
                                        var nORrn_10 = 0;
                                        var rstype_10 = new opType("T_I", []);
                                        return function (state_35) {
                                            return eorR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_10, nORrn_10, rstype_10, state_35);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var565;
                                    m = $var564;
                                    return "continue|parseRec";

                                case 35:
                                    var matchValue_24 = int12($var475[2]);

                                    if (matchValue_24) {
                                        var $var566 = m + 4;
                                        var $var567 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_36) {
                                            return bicI($var475[1], $var475[5], $var475[3], $var475[4], $var475[2], state_36);
                                        }])]]));
                                        _arg1 = $var475[6];
                                        l_3 = $var567;
                                        m = $var566;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 36:
                                    var matchValue_25 = shiftMatch($var475[7], $var475[6]);

                                    if (matchValue_25.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_25.Fields[1]])
                                        };
                                    } else {
                                        var v_11 = matchValue_25.Fields[0][1];
                                        var tail_11 = matchValue_25.Fields[0][2];
                                        var ir_11 = matchValue_25.Fields[0][0];
                                        var $var568 = m + 4;
                                        var $var569 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_37) {
                                            return bicR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], $var475[7], v_11, ir_11, state_37);
                                        }])]]));
                                        _arg1 = tail_11;
                                        l_3 = $var569;
                                        m = $var568;
                                        return "continue|parseRec";
                                    }

                                case 37:
                                    var $var570 = m + 4;
                                    var $var571 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_11 = new shiftOp("T_LSL", []);
                                        var nORrn_11 = 0;
                                        var rstype_11 = new opType("T_I", []);
                                        return function (state_38) {
                                            return bicR($var475[1], $var475[5], $var475[2], $var475[4], $var475[3], rsinst_11, nORrn_11, rstype_11, state_38);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var571;
                                    m = $var570;
                                    return "continue|parseRec";

                                case 38:
                                    var matchValue_26 = int12($var475[2]);

                                    if (matchValue_26) {
                                        var $var572 = m + 4;
                                        var $var573 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_39) {
                                            return cmpI($var475[1], $var475[3], $var475[2], state_39);
                                        }])]]));
                                        _arg1 = $var475[4];
                                        l_3 = $var573;
                                        m = $var572;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 39:
                                    var matchValue_27 = shiftMatch($var475[5], $var475[4]);

                                    if (matchValue_27.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_27.Fields[1]])
                                        };
                                    } else {
                                        var v_12 = matchValue_27.Fields[0][1];
                                        var tail_12 = matchValue_27.Fields[0][2];
                                        var ir_12 = matchValue_27.Fields[0][0];
                                        var $var574 = m + 4;
                                        var $var575 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_40) {
                                            return cmpR($var475[1], $var475[3], $var475[2], $var475[5], v_12, ir_12, state_40);
                                        }])]]));
                                        _arg1 = tail_12;
                                        l_3 = $var575;
                                        m = $var574;
                                        return "continue|parseRec";
                                    }

                                case 40:
                                    var $var576 = m + 4;
                                    var $var577 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_12 = new shiftOp("T_LSL", []);
                                        var nORrn_12 = 0;
                                        var rstype_12 = new opType("T_I", []);
                                        return function (state_41) {
                                            return cmpR($var475[1], $var475[3], $var475[2], rsinst_12, nORrn_12, rstype_12, state_41);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var577;
                                    m = $var576;
                                    return "continue|parseRec";

                                case 41:
                                    var matchValue_28 = int12($var475[2]);

                                    if (matchValue_28) {
                                        var $var578 = m + 4;
                                        var $var579 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_42) {
                                            return cmnI($var475[1], $var475[3], $var475[2], state_42);
                                        }])]]));
                                        _arg1 = $var475[4];
                                        l_3 = $var579;
                                        m = $var578;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 42:
                                    var matchValue_29 = shiftMatch($var475[5], $var475[4]);

                                    if (matchValue_29.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_29.Fields[1]])
                                        };
                                    } else {
                                        var v_13 = matchValue_29.Fields[0][1];
                                        var tail_13 = matchValue_29.Fields[0][2];
                                        var ir_13 = matchValue_29.Fields[0][0];
                                        var $var580 = m + 4;
                                        var $var581 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_43) {
                                            return cmnR($var475[1], $var475[3], $var475[2], $var475[5], v_13, ir_13, state_43);
                                        }])]]));
                                        _arg1 = tail_13;
                                        l_3 = $var581;
                                        m = $var580;
                                        return "continue|parseRec";
                                    }

                                case 43:
                                    var $var582 = m + 4;
                                    var $var583 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_13 = new shiftOp("T_LSL", []);
                                        var nORrn_13 = 0;
                                        var rstype_13 = new opType("T_I", []);
                                        return function (state_44) {
                                            return cmnR($var475[1], $var475[3], $var475[2], rsinst_13, nORrn_13, rstype_13, state_44);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var583;
                                    m = $var582;
                                    return "continue|parseRec";

                                case 44:
                                    var matchValue_30 = int12($var475[2]);

                                    if (matchValue_30) {
                                        var $var584 = m + 4;
                                        var $var585 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_45) {
                                            return tstI($var475[1], $var475[3], $var475[2], state_45);
                                        }])]]));
                                        _arg1 = $var475[4];
                                        l_3 = $var585;
                                        m = $var584;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 45:
                                    var matchValue_31 = shiftMatch($var475[5], $var475[4]);

                                    if (matchValue_31.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_31.Fields[1]])
                                        };
                                    } else {
                                        var v_14 = matchValue_31.Fields[0][1];
                                        var tail_14 = matchValue_31.Fields[0][2];
                                        var ir_14 = matchValue_31.Fields[0][0];
                                        var $var586 = m + 4;
                                        var $var587 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_46) {
                                            return tstR($var475[1], $var475[3], $var475[2], $var475[5], v_14, ir_14, state_46);
                                        }])]]));
                                        _arg1 = tail_14;
                                        l_3 = $var587;
                                        m = $var586;
                                        return "continue|parseRec";
                                    }

                                case 46:
                                    var $var588 = m + 4;
                                    var $var589 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_14 = new shiftOp("T_LSL", []);
                                        var nORrn_14 = 0;
                                        var rstype_14 = new opType("T_I", []);
                                        return function (state_47) {
                                            return tstR($var475[1], $var475[3], $var475[2], rsinst_14, nORrn_14, rstype_14, state_47);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var589;
                                    m = $var588;
                                    return "continue|parseRec";

                                case 47:
                                    var matchValue_32 = int12($var475[2]);

                                    if (matchValue_32) {
                                        var $var590 = m + 4;
                                        var $var591 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_48) {
                                            return teqI($var475[1], $var475[3], $var475[2], state_48);
                                        }])]]));
                                        _arg1 = $var475[4];
                                        l_3 = $var591;
                                        m = $var590;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidImmRange(l_3, $var475[2])
                                        };
                                    }

                                case 48:
                                    var matchValue_33 = shiftMatch($var475[5], $var475[4]);

                                    if (matchValue_33.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_33.Fields[1]])
                                        };
                                    } else {
                                        var v_15 = matchValue_33.Fields[0][1];
                                        var tail_15 = matchValue_33.Fields[0][2];
                                        var ir_15 = matchValue_33.Fields[0][0];
                                        var $var592 = m + 4;
                                        var $var593 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_49) {
                                            return teqR($var475[1], $var475[3], $var475[2], $var475[5], v_15, ir_15, state_49);
                                        }])]]));
                                        _arg1 = tail_15;
                                        l_3 = $var593;
                                        m = $var592;
                                        return "continue|parseRec";
                                    }

                                case 49:
                                    var $var594 = m + 4;
                                    var $var595 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_15 = new shiftOp("T_LSL", []);
                                        var nORrn_15 = 0;
                                        var rstype_15 = new opType("T_I", []);
                                        return function (state_50) {
                                            return teqR($var475[1], $var475[3], $var475[2], rsinst_15, nORrn_15, rstype_15, state_50);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var595;
                                    m = $var594;
                                    return "continue|parseRec";

                                case 50:
                                    var $var596 = m + 4;
                                    var $var597 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_51) {
                                        return lslR($var475[1], $var475[5], $var475[2], $var475[3], $var475[4], state_51);
                                    }])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var597;
                                    m = $var596;
                                    return "continue|parseRec";

                                case 51:
                                    var $var598 = m + 4;
                                    var $var599 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_52) {
                                        return lsrR($var475[1], $var475[5], $var475[2], $var475[3], $var475[4], state_52);
                                    }])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var599;
                                    m = $var598;
                                    return "continue|parseRec";

                                case 52:
                                    var $var600 = m + 4;
                                    var $var601 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_53) {
                                        return asrR($var475[1], $var475[5], $var475[2], $var475[3], $var475[4], state_53);
                                    }])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var601;
                                    m = $var600;
                                    return "continue|parseRec";

                                case 53:
                                    var $var602 = m + 4;
                                    var $var603 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_54) {
                                        return rorR($var475[1], $var475[5], $var475[2], $var475[3], $var475[4], state_54);
                                    }])]]));
                                    _arg1 = $var475[6];
                                    l_3 = $var603;
                                    m = $var602;
                                    return "continue|parseRec";

                                case 54:
                                    var $var604 = m + 4;
                                    var $var605 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_55) {
                                        return rrxR($var475[1], $var475[4], $var475[2], $var475[3], state_55);
                                    }])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var605;
                                    m = $var604;
                                    return "continue|parseRec";

                                case 55:
                                    var $var606 = m + 4;
                                    var $var607 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("LabelRef", [branchRef(l_3)($var475[1])($var475[2])(function (c_3) {
                                        return function (label) {
                                            return function (state_56) {
                                                return b(c_3, label, state_56);
                                            };
                                        };
                                    })])]]));
                                    _arg1 = $var475[3];
                                    l_3 = $var607;
                                    m = $var606;
                                    return "continue|parseRec";

                                case 56:
                                    var $var608 = m + 4;
                                    var $var609 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("LabelRef", [branchRef(l_3)($var475[1])($var475[2])(function (c_4) {
                                        return function (label_1) {
                                            return function (state_57) {
                                                return bl(c_4, label_1, state_57);
                                            };
                                        };
                                    })])]]));
                                    _arg1 = $var475[3];
                                    l_3 = $var609;
                                    m = $var608;
                                    return "continue|parseRec";

                                case 57:
                                    var $var610 = m + 4;
                                    var $var611 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_58) {
                                        return bx($var475[1], $var475[2], state_58);
                                    }])]]));
                                    _arg1 = $var475[3];
                                    l_3 = $var611;
                                    m = $var610;
                                    return "continue|parseRec";

                                case 58:
                                    var $var612 = m + 4;
                                    var $var613 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("LabelRef", [lsaRef(l_3)($var475[1])($var475[2])($var475[3])(function (c_5) {
                                        return function (rd_1) {
                                            return function (label_2) {
                                                return function (state_59) {
                                                    return adr(c_5, rd_1, label_2, state_59);
                                                };
                                            };
                                        };
                                    })])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var613;
                                    m = $var612;
                                    return "continue|parseRec";

                                case 59:
                                    var matchValue_34 = shiftMatch($var475[6], $var475[5]);

                                    if (matchValue_34.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_34.Fields[1]])
                                        };
                                    } else {
                                        var v_16 = matchValue_34.Fields[0][1];
                                        var tail_16 = matchValue_34.Fields[0][2];
                                        var ir_16 = matchValue_34.Fields[0][0];
                                        var $var614 = m + 4;
                                        var $var615 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_60) {
                                            return ldrWaR($var475[1], $var475[2], $var475[4], $var475[3], $var475[6], v_16, ir_16, state_60);
                                        }])]]));
                                        _arg1 = tail_16;
                                        l_3 = $var615;
                                        m = $var614;
                                        return "continue|parseRec";
                                    }

                                case 60:
                                    var matchValue_35 = offset($var475[2]);

                                    if (matchValue_35) {
                                        var $var616 = m + 4;
                                        var $var617 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_61) {
                                            return ldrWaI($var475[1], $var475[3], $var475[4], $var475[2], state_61);
                                        }])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var617;
                                        m = $var616;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 61:
                                    var $var618 = m + 4;
                                    var $var619 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_16 = new shiftOp("T_LSL", []);
                                        var nORrn_16 = 0;
                                        var rstype_16 = new opType("T_I", []);
                                        return function (state_62) {
                                            return ldrWaR($var475[1], $var475[2], $var475[4], $var475[3], rsinst_16, nORrn_16, rstype_16, state_62);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var619;
                                    m = $var618;
                                    return "continue|parseRec";

                                case 62:
                                    var matchValue_36 = shiftMatch($var475[6], $var475[5]);

                                    if (matchValue_36.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_36.Fields[1]])
                                        };
                                    } else {
                                        var v_17 = matchValue_36.Fields[0][1];
                                        var tail_17 = matchValue_36.Fields[0][2];
                                        var ir_17 = matchValue_36.Fields[0][0];
                                        var $var620 = m + 4;
                                        var $var621 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_63) {
                                            return ldrBaR($var475[1], $var475[2], $var475[4], $var475[3], $var475[6], v_17, ir_17, state_63);
                                        }])]]));
                                        _arg1 = tail_17;
                                        l_3 = $var621;
                                        m = $var620;
                                        return "continue|parseRec";
                                    }

                                case 63:
                                    var matchValue_37 = offset($var475[2]);

                                    if (matchValue_37) {
                                        var $var622 = m + 4;
                                        var $var623 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_64) {
                                            return ldrBaI($var475[1], $var475[3], $var475[4], $var475[2], state_64);
                                        }])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var623;
                                        m = $var622;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 64:
                                    var $var624 = m + 4;
                                    var $var625 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_17 = new shiftOp("T_LSL", []);
                                        var nORrn_17 = 0;
                                        var rstype_17 = new opType("T_I", []);
                                        return function (state_65) {
                                            return ldrBaR($var475[1], $var475[2], $var475[4], $var475[3], rsinst_17, nORrn_17, rstype_17, state_65);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var625;
                                    m = $var624;
                                    return "continue|parseRec";

                                case 65:
                                    var $var626 = m + 4;
                                    var $var627 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("LabelRef", [lsaRef(l_3)($var475[1])($var475[2])($var475[3])(function (c_6) {
                                        return function (rd_2) {
                                            return function (label_3) {
                                                return function (state_66) {
                                                    return ldrWL(c_6, rd_2, label_3, state_66);
                                                };
                                            };
                                        };
                                    })])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var627;
                                    m = $var626;
                                    return "continue|parseRec";

                                case 66:
                                    var $var628 = m + 4;
                                    var $var629 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc = false;
                                        var i = 0;
                                        return function (state_67) {
                                            return ldrWbI($var475[1], inc, $var475[2], $var475[3], i, state_67);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var629;
                                    m = $var628;
                                    return "continue|parseRec";

                                case 67:
                                    var matchValue_38 = offset($var475[2]);

                                    if (matchValue_38) {
                                        var $var630 = m + 4;
                                        var $var631 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_1 = true;
                                            return function (state_68) {
                                                return ldrWbI($var475[1], inc_1, $var475[3], $var475[4], $var475[2], state_68);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var631;
                                        m = $var630;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 68:
                                    var matchValue_39 = offset($var475[2]);

                                    if (matchValue_39) {
                                        var $var632 = m + 4;
                                        var $var633 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_2 = false;
                                            return function (state_69) {
                                                return ldrWbI($var475[1], inc_2, $var475[3], $var475[4], $var475[2], state_69);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var633;
                                        m = $var632;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 69:
                                    var $var634 = m + 4;
                                    var $var635 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_3 = true;
                                        var rsinst_18 = new shiftOp("T_LSL", []);
                                        var nORrn_18 = 0;
                                        var rstype_18 = new opType("T_I", []);
                                        return function (state_70) {
                                            return ldrWbR($var475[1], inc_3, $var475[2], $var475[4], $var475[3], rsinst_18, nORrn_18, rstype_18, state_70);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var635;
                                    m = $var634;
                                    return "continue|parseRec";

                                case 70:
                                    var $var636 = m + 4;
                                    var $var637 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_4 = false;
                                        var rsinst_19 = new shiftOp("T_LSL", []);
                                        var nORrn_19 = 0;
                                        var rstype_19 = new opType("T_I", []);
                                        return function (state_71) {
                                            return ldrWbR($var475[1], inc_4, $var475[2], $var475[4], $var475[3], rsinst_19, nORrn_19, rstype_19, state_71);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var637;
                                    m = $var636;
                                    return "continue|parseRec";

                                case 71:
                                    var matchValue_40 = shiftMatch($var475[6], $var475[5]);
                                    var $var476 = matchValue_40.Case === "Err" ? [4, matchValue_40.Fields[1]] : matchValue_40.Fields[0][2].tail == null ? [3, matchValue_40.Fields[0][0], matchValue_40.Fields[0][1]] : matchValue_40.Fields[0][2].head.Case === "T_R_BRAC" ? matchValue_40.Fields[0][2].tail.tail != null ? matchValue_40.Fields[0][2].tail.head.Case === "T_EXCL" ? [0, matchValue_40.Fields[0][0], matchValue_40.Fields[0][2].tail.tail, matchValue_40.Fields[0][1]] : [1, matchValue_40.Fields[0][0], matchValue_40.Fields[0][2].tail, matchValue_40.Fields[0][1]] : [1, matchValue_40.Fields[0][0], matchValue_40.Fields[0][2].tail, matchValue_40.Fields[0][1]] : [2, matchValue_40.Fields[0][0], matchValue_40.Fields[0][2].tail, matchValue_40.Fields[0][2].head, matchValue_40.Fields[0][1]];

                                    switch ($var476[0]) {
                                        case 0:
                                            var $var638 = m + 4;
                                            var $var639 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_5 = true;
                                                return function (state_72) {
                                                    return ldrWbR($var475[1], inc_5, $var475[2], $var475[4], $var475[3], $var475[6], $var476[3], $var476[1], state_72);
                                                };
                                            }()])]]));
                                            _arg1 = $var476[2];
                                            l_3 = $var639;
                                            m = $var638;
                                            return "continue|parseRec";

                                        case 1:
                                            var $var640 = m + 4;
                                            var $var641 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_6 = false;
                                                return function (state_73) {
                                                    return ldrWbR($var475[1], inc_6, $var475[2], $var475[4], $var475[3], $var475[6], $var476[3], $var476[1], state_73);
                                                };
                                            }()])]]));
                                            _arg1 = $var476[2];
                                            l_3 = $var641;
                                            m = $var640;
                                            return "continue|parseRec";

                                        case 2:
                                            return {
                                                v: unexpectedToken(l_3, $var476[3], $var476[2])
                                            };

                                        case 3:
                                            return {
                                                v: invalidShiftMatch(l_3)
                                            };

                                        case 4:
                                            return {
                                                v: new _Error("Err", [l_3, $var476[1]])
                                            };
                                    }

                                case 72:
                                    var $var642 = m + 4;
                                    var $var643 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("LabelRef", [lsaRef(l_3)($var475[1])($var475[2])($var475[3])(function (c_7) {
                                        return function (rd_3) {
                                            return function (label_4) {
                                                return function (state_74) {
                                                    return ldrBL(c_7, rd_3, label_4, state_74);
                                                };
                                            };
                                        };
                                    })])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var643;
                                    m = $var642;
                                    return "continue|parseRec";

                                case 73:
                                    var $var644 = m + 4;
                                    var $var645 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_7 = false;
                                        var i_1 = 0;
                                        return function (state_75) {
                                            return ldrBbI($var475[1], inc_7, $var475[2], $var475[3], i_1, state_75);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var645;
                                    m = $var644;
                                    return "continue|parseRec";

                                case 74:
                                    var matchValue_41 = offset($var475[2]);

                                    if (matchValue_41) {
                                        var $var646 = m + 4;
                                        var $var647 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_8 = true;
                                            return function (state_76) {
                                                return ldrBbI($var475[1], inc_8, $var475[3], $var475[4], $var475[2], state_76);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var647;
                                        m = $var646;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 75:
                                    var matchValue_42 = offset($var475[2]);

                                    if (matchValue_42) {
                                        var $var648 = m + 4;
                                        var $var649 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_9 = false;
                                            return function (state_77) {
                                                return ldrBbI($var475[1], inc_9, $var475[3], $var475[4], $var475[2], state_77);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var649;
                                        m = $var648;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 76:
                                    var $var650 = m + 4;
                                    var $var651 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_10 = true;
                                        var rsinst_20 = new shiftOp("T_LSL", []);
                                        var nORrn_20 = 0;
                                        var rstype_20 = new opType("T_I", []);
                                        return function (state_78) {
                                            return ldrBbR($var475[1], inc_10, $var475[2], $var475[4], $var475[3], rsinst_20, nORrn_20, rstype_20, state_78);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var651;
                                    m = $var650;
                                    return "continue|parseRec";

                                case 77:
                                    var $var652 = m + 4;
                                    var $var653 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_11 = false;
                                        var rsinst_21 = new shiftOp("T_LSL", []);
                                        var nORrn_21 = 0;
                                        var rstype_21 = new opType("T_I", []);
                                        return function (state_79) {
                                            return ldrBbR($var475[1], inc_11, $var475[2], $var475[4], $var475[3], rsinst_21, nORrn_21, rstype_21, state_79);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var653;
                                    m = $var652;
                                    return "continue|parseRec";

                                case 78:
                                    var matchValue_43 = shiftMatch($var475[6], $var475[5]);
                                    var $var477 = matchValue_43.Case === "Err" ? [4, matchValue_43.Fields[1]] : matchValue_43.Fields[0][2].tail == null ? [3, matchValue_43.Fields[0][0], matchValue_43.Fields[0][1]] : matchValue_43.Fields[0][2].head.Case === "T_R_BRAC" ? matchValue_43.Fields[0][2].tail.tail != null ? matchValue_43.Fields[0][2].tail.head.Case === "T_EXCL" ? [0, matchValue_43.Fields[0][0], matchValue_43.Fields[0][2].tail.tail, matchValue_43.Fields[0][1]] : [1, matchValue_43.Fields[0][0], matchValue_43.Fields[0][2].tail, matchValue_43.Fields[0][1]] : [1, matchValue_43.Fields[0][0], matchValue_43.Fields[0][2].tail, matchValue_43.Fields[0][1]] : [2, matchValue_43.Fields[0][0], matchValue_43.Fields[0][2].tail, matchValue_43.Fields[0][2].head, matchValue_43.Fields[0][1]];

                                    switch ($var477[0]) {
                                        case 0:
                                            var $var654 = m + 4;
                                            var $var655 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_12 = true;
                                                return function (state_80) {
                                                    return ldrBbR($var475[1], inc_12, $var475[2], $var475[4], $var475[3], $var475[6], $var477[3], $var477[1], state_80);
                                                };
                                            }()])]]));
                                            _arg1 = $var477[2];
                                            l_3 = $var655;
                                            m = $var654;
                                            return "continue|parseRec";

                                        case 1:
                                            var $var656 = m + 4;
                                            var $var657 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_13 = false;
                                                return function (state_81) {
                                                    return ldrBbR($var475[1], inc_13, $var475[2], $var475[4], $var475[3], $var475[6], $var477[3], $var477[1], state_81);
                                                };
                                            }()])]]));
                                            _arg1 = $var477[2];
                                            l_3 = $var657;
                                            m = $var656;
                                            return "continue|parseRec";

                                        case 2:
                                            return {
                                                v: unexpectedToken(l_3, $var477[3], $var477[2])
                                            };

                                        case 3:
                                            return {
                                                v: invalidShiftMatch(l_3)
                                            };

                                        case 4:
                                            return {
                                                v: new _Error("Err", [l_3, $var477[1]])
                                            };
                                    }

                                case 79:
                                    var matchValue_44 = shiftMatch($var475[6], $var475[5]);

                                    if (matchValue_44.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_44.Fields[1]])
                                        };
                                    } else {
                                        var v_18 = matchValue_44.Fields[0][1];
                                        var tail_18 = matchValue_44.Fields[0][2];
                                        var ir_18 = matchValue_44.Fields[0][0];
                                        var $var658 = m + 4;
                                        var $var659 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_82) {
                                            return strWaR($var475[1], $var475[2], $var475[4], $var475[3], $var475[6], v_18, ir_18, state_82);
                                        }])]]));
                                        _arg1 = tail_18;
                                        l_3 = $var659;
                                        m = $var658;
                                        return "continue|parseRec";
                                    }

                                case 80:
                                    var matchValue_45 = offset($var475[2]);

                                    if (matchValue_45) {
                                        var $var660 = m + 4;
                                        var $var661 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_83) {
                                            return strWaI($var475[1], $var475[3], $var475[4], $var475[2], state_83);
                                        }])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var661;
                                        m = $var660;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 81:
                                    var $var662 = m + 4;
                                    var $var663 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_22 = new shiftOp("T_LSL", []);
                                        var nORrn_22 = 0;
                                        var rstype_22 = new opType("T_I", []);
                                        return function (state_84) {
                                            return strWaR($var475[1], $var475[2], $var475[4], $var475[3], rsinst_22, nORrn_22, rstype_22, state_84);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var663;
                                    m = $var662;
                                    return "continue|parseRec";

                                case 82:
                                    var matchValue_46 = shiftMatch($var475[6], $var475[5]);

                                    if (matchValue_46.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_46.Fields[1]])
                                        };
                                    } else {
                                        var v_19 = matchValue_46.Fields[0][1];
                                        var tail_19 = matchValue_46.Fields[0][2];
                                        var ir_19 = matchValue_46.Fields[0][0];
                                        var $var664 = m + 4;
                                        var $var665 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_85) {
                                            return strBaR($var475[1], $var475[2], $var475[4], $var475[3], $var475[6], v_19, ir_19, state_85);
                                        }])]]));
                                        _arg1 = tail_19;
                                        l_3 = $var665;
                                        m = $var664;
                                        return "continue|parseRec";
                                    }

                                case 83:
                                    var matchValue_47 = offset($var475[2]);

                                    if (matchValue_47) {
                                        var $var666 = m + 4;
                                        var $var667 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function (state_86) {
                                            return strBaI($var475[1], $var475[3], $var475[4], $var475[2], state_86);
                                        }])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var667;
                                        m = $var666;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 84:
                                    var $var668 = m + 4;
                                    var $var669 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var rsinst_23 = new shiftOp("T_LSL", []);
                                        var nORrn_23 = 0;
                                        var rstype_23 = new opType("T_I", []);
                                        return function (state_87) {
                                            return strBaR($var475[1], $var475[2], $var475[4], $var475[3], rsinst_23, nORrn_23, rstype_23, state_87);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var669;
                                    m = $var668;
                                    return "continue|parseRec";

                                case 85:
                                    var $var670 = m + 4;
                                    var $var671 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_14 = false;
                                        var i_2 = 0;
                                        return function (state_88) {
                                            return strWbI($var475[1], inc_14, $var475[2], $var475[3], i_2, state_88);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var671;
                                    m = $var670;
                                    return "continue|parseRec";

                                case 86:
                                    var matchValue_48 = offset($var475[2]);

                                    if (matchValue_48) {
                                        var $var672 = m + 4;
                                        var $var673 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_15 = true;
                                            return function (state_89) {
                                                return strWbI($var475[1], inc_15, $var475[3], $var475[4], $var475[2], state_89);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var673;
                                        m = $var672;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 87:
                                    var matchValue_49 = offset($var475[2]);

                                    if (matchValue_49) {
                                        var $var674 = m + 4;
                                        var $var675 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_16 = false;
                                            return function (state_90) {
                                                return strWbI($var475[1], inc_16, $var475[3], $var475[4], $var475[2], state_90);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var675;
                                        m = $var674;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 88:
                                    var $var676 = m + 4;
                                    var $var677 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_17 = true;
                                        var rsinst_24 = new shiftOp("T_LSL", []);
                                        var nORrn_24 = 0;
                                        var rstype_24 = new opType("T_I", []);
                                        return function (state_91) {
                                            return strWbR($var475[1], inc_17, $var475[2], $var475[4], $var475[3], rsinst_24, nORrn_24, rstype_24, state_91);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var677;
                                    m = $var676;
                                    return "continue|parseRec";

                                case 89:
                                    var $var678 = m + 4;
                                    var $var679 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_18 = false;
                                        var rsinst_25 = new shiftOp("T_LSL", []);
                                        var nORrn_25 = 0;
                                        var rstype_25 = new opType("T_I", []);
                                        return function (state_92) {
                                            return strWbR($var475[1], inc_18, $var475[2], $var475[4], $var475[3], rsinst_25, nORrn_25, rstype_25, state_92);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var679;
                                    m = $var678;
                                    return "continue|parseRec";

                                case 90:
                                    var matchValue_50 = shiftMatch($var475[6], $var475[5]);
                                    var $var478 = matchValue_50.Case === "Err" ? [4, matchValue_50.Fields[1]] : matchValue_50.Fields[0][2].tail == null ? [3, matchValue_50.Fields[0][0], matchValue_50.Fields[0][1]] : matchValue_50.Fields[0][2].head.Case === "T_R_BRAC" ? matchValue_50.Fields[0][2].tail.tail != null ? matchValue_50.Fields[0][2].tail.head.Case === "T_EXCL" ? [0, matchValue_50.Fields[0][0], matchValue_50.Fields[0][2].tail.tail, matchValue_50.Fields[0][1]] : [1, matchValue_50.Fields[0][0], matchValue_50.Fields[0][2].tail, matchValue_50.Fields[0][1]] : [1, matchValue_50.Fields[0][0], matchValue_50.Fields[0][2].tail, matchValue_50.Fields[0][1]] : [2, matchValue_50.Fields[0][0], matchValue_50.Fields[0][2].tail, matchValue_50.Fields[0][2].head, matchValue_50.Fields[0][1]];

                                    switch ($var478[0]) {
                                        case 0:
                                            var $var680 = m + 4;
                                            var $var681 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_19 = true;
                                                return function (state_93) {
                                                    return strWbR($var475[1], inc_19, $var475[2], $var475[4], $var475[3], $var475[6], $var478[3], $var478[1], state_93);
                                                };
                                            }()])]]));
                                            _arg1 = $var478[2];
                                            l_3 = $var681;
                                            m = $var680;
                                            return "continue|parseRec";

                                        case 1:
                                            var $var682 = m + 4;
                                            var $var683 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_20 = false;
                                                return function (state_94) {
                                                    return strWbR($var475[1], inc_20, $var475[2], $var475[4], $var475[3], $var475[6], $var478[3], $var478[1], state_94);
                                                };
                                            }()])]]));
                                            _arg1 = $var478[2];
                                            l_3 = $var683;
                                            m = $var682;
                                            return "continue|parseRec";

                                        case 2:
                                            return {
                                                v: unexpectedToken(l_3, $var478[3], $var478[2])
                                            };

                                        case 3:
                                            return {
                                                v: invalidShiftMatch(l_3)
                                            };

                                        case 4:
                                            return {
                                                v: new _Error("Err", [l_3, $var478[1]])
                                            };
                                    }

                                case 91:
                                    var $var684 = m + 4;
                                    var $var685 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_21 = false;
                                        var i_3 = 0;
                                        return function (state_95) {
                                            return strBbI($var475[1], inc_21, $var475[2], $var475[3], i_3, state_95);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[4];
                                    l_3 = $var685;
                                    m = $var684;
                                    return "continue|parseRec";

                                case 92:
                                    var matchValue_51 = offset($var475[2]);

                                    if (matchValue_51) {
                                        var $var686 = m + 4;
                                        var $var687 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_22 = true;
                                            return function (state_96) {
                                                return strBbI($var475[1], inc_22, $var475[3], $var475[4], $var475[2], state_96);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var687;
                                        m = $var686;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 93:
                                    var matchValue_52 = offset($var475[2]);

                                    if (matchValue_52) {
                                        var $var688 = m + 4;
                                        var $var689 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var inc_23 = false;
                                            return function (state_97) {
                                                return strBbI($var475[1], inc_23, $var475[3], $var475[4], $var475[2], state_97);
                                            };
                                        }()])]]));
                                        _arg1 = $var475[5];
                                        l_3 = $var689;
                                        m = $var688;
                                        return "continue|parseRec";
                                    } else {
                                        return {
                                            v: invalidMemOffsetRange(l_3, $var475[2])
                                        };
                                    }

                                case 94:
                                    var $var690 = m + 4;
                                    var $var691 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_24 = true;
                                        var rsinst_26 = new shiftOp("T_LSL", []);
                                        var nORrn_26 = 0;
                                        var rstype_26 = new opType("T_I", []);
                                        return function (state_98) {
                                            return strBbR($var475[1], inc_24, $var475[2], $var475[4], $var475[3], rsinst_26, nORrn_26, rstype_26, state_98);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var691;
                                    m = $var690;
                                    return "continue|parseRec";

                                case 95:
                                    var $var692 = m + 4;
                                    var $var693 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                        var inc_25 = false;
                                        var rsinst_27 = new shiftOp("T_LSL", []);
                                        var nORrn_27 = 0;
                                        var rstype_27 = new opType("T_I", []);
                                        return function (state_99) {
                                            return strBbR($var475[1], inc_25, $var475[2], $var475[4], $var475[3], rsinst_27, nORrn_27, rstype_27, state_99);
                                        };
                                    }()])]]));
                                    _arg1 = $var475[5];
                                    l_3 = $var693;
                                    m = $var692;
                                    return "continue|parseRec";

                                case 96:
                                    var matchValue_53 = shiftMatch($var475[6], $var475[5]);
                                    var $var479 = matchValue_53.Case === "Err" ? [4, matchValue_53.Fields[1]] : matchValue_53.Fields[0][2].tail == null ? [3, matchValue_53.Fields[0][0], matchValue_53.Fields[0][1]] : matchValue_53.Fields[0][2].head.Case === "T_R_BRAC" ? matchValue_53.Fields[0][2].tail.tail != null ? matchValue_53.Fields[0][2].tail.head.Case === "T_EXCL" ? [0, matchValue_53.Fields[0][0], matchValue_53.Fields[0][2].tail.tail, matchValue_53.Fields[0][1]] : [1, matchValue_53.Fields[0][0], matchValue_53.Fields[0][2].tail, matchValue_53.Fields[0][1]] : [1, matchValue_53.Fields[0][0], matchValue_53.Fields[0][2].tail, matchValue_53.Fields[0][1]] : [2, matchValue_53.Fields[0][0], matchValue_53.Fields[0][2].tail, matchValue_53.Fields[0][2].head, matchValue_53.Fields[0][1]];

                                    switch ($var479[0]) {
                                        case 0:
                                            var $var694 = m + 4;
                                            var $var695 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_26 = true;
                                                return function (state_100) {
                                                    return strBbR($var475[1], inc_26, $var475[2], $var475[4], $var475[3], $var475[6], $var479[3], $var479[1], state_100);
                                                };
                                            }()])]]));
                                            _arg1 = $var479[2];
                                            l_3 = $var695;
                                            m = $var694;
                                            return "continue|parseRec";

                                        case 1:
                                            var $var696 = m + 4;
                                            var $var697 = l_3;
                                            labels_2 = labels_2;
                                            outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                                var inc_27 = false;
                                                return function (state_101) {
                                                    return strBbR($var475[1], inc_27, $var475[2], $var475[4], $var475[3], $var475[6], $var479[3], $var479[1], state_101);
                                                };
                                            }()])]]));
                                            _arg1 = $var479[2];
                                            l_3 = $var697;
                                            m = $var696;
                                            return "continue|parseRec";

                                        case 2:
                                            return {
                                                v: unexpectedToken(l_3, $var479[3], $var479[2])
                                            };

                                        case 3:
                                            return {
                                                v: invalidShiftMatch(l_3)
                                            };

                                        case 4:
                                            return {
                                                v: new _Error("Err", [l_3, $var479[1]])
                                            };
                                    }

                                case 97:
                                    var matchValue_54 = regList($var475[3]);

                                    if (matchValue_54.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_54.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_1 = matchValue_54.Fields[0][1];
                                        var rl = matchValue_54.Fields[0][0];
                                        var $var698 = m + 4;
                                        var $var699 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write = false;
                                            return function (state_102) {
                                                return ldmIA($var475[1], write, $var475[2], rl, state_102);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_1;
                                        l_3 = $var699;
                                        m = $var698;
                                        return "continue|parseRec";
                                    }

                                case 98:
                                    var matchValue_55 = regList($var475[3]);

                                    if (matchValue_55.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_55.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_2 = matchValue_55.Fields[0][1];
                                        var rl_1 = matchValue_55.Fields[0][0];
                                        var $var700 = m + 4;
                                        var $var701 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_1 = true;
                                            return function (state_103) {
                                                return ldmIA($var475[1], write_1, $var475[2], rl_1, state_103);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_2;
                                        l_3 = $var701;
                                        m = $var700;
                                        return "continue|parseRec";
                                    }

                                case 99:
                                    var matchValue_56 = regList($var475[3]);

                                    if (matchValue_56.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_56.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_3 = matchValue_56.Fields[0][1];
                                        var rl_2 = matchValue_56.Fields[0][0];
                                        var $var702 = m + 4;
                                        var $var703 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_2 = false;
                                            return function (state_104) {
                                                return ldmIB($var475[1], write_2, $var475[2], rl_2, state_104);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_3;
                                        l_3 = $var703;
                                        m = $var702;
                                        return "continue|parseRec";
                                    }

                                case 100:
                                    var matchValue_57 = regList($var475[3]);

                                    if (matchValue_57.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_57.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_4 = matchValue_57.Fields[0][1];
                                        var rl_3 = matchValue_57.Fields[0][0];
                                        var $var704 = m + 4;
                                        var $var705 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_3 = true;
                                            return function (state_105) {
                                                return ldmIB($var475[1], write_3, $var475[2], rl_3, state_105);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_4;
                                        l_3 = $var705;
                                        m = $var704;
                                        return "continue|parseRec";
                                    }

                                case 101:
                                    var matchValue_58 = regList($var475[3]);

                                    if (matchValue_58.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_58.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_5 = matchValue_58.Fields[0][1];
                                        var rl_4 = matchValue_58.Fields[0][0];
                                        var $var706 = m + 4;
                                        var $var707 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_4 = false;
                                            return function (state_106) {
                                                return ldmDA($var475[1], write_4, $var475[2], rl_4, state_106);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_5;
                                        l_3 = $var707;
                                        m = $var706;
                                        return "continue|parseRec";
                                    }

                                case 102:
                                    var matchValue_59 = regList($var475[3]);

                                    if (matchValue_59.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_59.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_6 = matchValue_59.Fields[0][1];
                                        var rl_5 = matchValue_59.Fields[0][0];
                                        var $var708 = m + 4;
                                        var $var709 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_5 = true;
                                            return function (state_107) {
                                                return ldmDA($var475[1], write_5, $var475[2], rl_5, state_107);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_6;
                                        l_3 = $var709;
                                        m = $var708;
                                        return "continue|parseRec";
                                    }

                                case 103:
                                    var matchValue_60 = regList($var475[3]);

                                    if (matchValue_60.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_60.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_7 = matchValue_60.Fields[0][1];
                                        var rl_6 = matchValue_60.Fields[0][0];
                                        var $var710 = m + 4;
                                        var $var711 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_6 = false;
                                            return function (state_108) {
                                                return ldmDB($var475[1], write_6, $var475[2], rl_6, state_108);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_7;
                                        l_3 = $var711;
                                        m = $var710;
                                        return "continue|parseRec";
                                    }

                                case 104:
                                    var matchValue_61 = regList($var475[3]);

                                    if (matchValue_61.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_61.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_8 = matchValue_61.Fields[0][1];
                                        var rl_7 = matchValue_61.Fields[0][0];
                                        var $var712 = m + 4;
                                        var $var713 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_7 = true;
                                            return function (state_109) {
                                                return ldmDB($var475[1], write_7, $var475[2], rl_7, state_109);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_8;
                                        l_3 = $var713;
                                        m = $var712;
                                        return "continue|parseRec";
                                    }

                                case 105:
                                    var matchValue_62 = regList($var475[3]);

                                    if (matchValue_62.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_62.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_9 = matchValue_62.Fields[0][1];
                                        var rl_8 = matchValue_62.Fields[0][0];
                                        var $var714 = m + 4;
                                        var $var715 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_8 = false;
                                            return function (state_110) {
                                                return stmIA($var475[1], write_8, $var475[2], rl_8, state_110);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_9;
                                        l_3 = $var715;
                                        m = $var714;
                                        return "continue|parseRec";
                                    }

                                case 106:
                                    var matchValue_63 = regList($var475[3]);

                                    if (matchValue_63.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_63.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_10 = matchValue_63.Fields[0][1];
                                        var rl_9 = matchValue_63.Fields[0][0];
                                        var $var716 = m + 4;
                                        var $var717 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_9 = true;
                                            return function (state_111) {
                                                return stmIA($var475[1], write_9, $var475[2], rl_9, state_111);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_10;
                                        l_3 = $var717;
                                        m = $var716;
                                        return "continue|parseRec";
                                    }

                                case 107:
                                    var matchValue_64 = regList($var475[3]);

                                    if (matchValue_64.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_64.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_11 = matchValue_64.Fields[0][1];
                                        var rl_10 = matchValue_64.Fields[0][0];
                                        var $var718 = m + 4;
                                        var $var719 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_10 = false;
                                            return function (state_112) {
                                                return stmIB($var475[1], write_10, $var475[2], rl_10, state_112);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_11;
                                        l_3 = $var719;
                                        m = $var718;
                                        return "continue|parseRec";
                                    }

                                case 108:
                                    var matchValue_65 = regList($var475[3]);

                                    if (matchValue_65.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_65.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_12 = matchValue_65.Fields[0][1];
                                        var rl_11 = matchValue_65.Fields[0][0];
                                        var $var720 = m + 4;
                                        var $var721 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_11 = true;
                                            return function (state_113) {
                                                return stmIB($var475[1], write_11, $var475[2], rl_11, state_113);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_12;
                                        l_3 = $var721;
                                        m = $var720;
                                        return "continue|parseRec";
                                    }

                                case 109:
                                    var matchValue_66 = regList($var475[3]);

                                    if (matchValue_66.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_66.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_13 = matchValue_66.Fields[0][1];
                                        var rl_12 = matchValue_66.Fields[0][0];
                                        var $var722 = m + 4;
                                        var $var723 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_12 = false;
                                            return function (state_114) {
                                                return stmDA($var475[1], write_12, $var475[2], rl_12, state_114);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_13;
                                        l_3 = $var723;
                                        m = $var722;
                                        return "continue|parseRec";
                                    }

                                case 110:
                                    var matchValue_67 = regList($var475[3]);

                                    if (matchValue_67.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_67.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_14 = matchValue_67.Fields[0][1];
                                        var rl_13 = matchValue_67.Fields[0][0];
                                        var $var724 = m + 4;
                                        var $var725 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_13 = true;
                                            return function (state_115) {
                                                return stmDA($var475[1], write_13, $var475[2], rl_13, state_115);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_14;
                                        l_3 = $var725;
                                        m = $var724;
                                        return "continue|parseRec";
                                    }

                                case 111:
                                    var matchValue_68 = regList($var475[3]);

                                    if (matchValue_68.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_68.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_15 = matchValue_68.Fields[0][1];
                                        var rl_14 = matchValue_68.Fields[0][0];
                                        var $var726 = m + 4;
                                        var $var727 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_14 = false;
                                            return function (state_116) {
                                                return stmDB($var475[1], write_14, $var475[2], rl_14, state_116);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_15;
                                        l_3 = $var727;
                                        m = $var726;
                                        return "continue|parseRec";
                                    }

                                case 112:
                                    var matchValue_69 = regList($var475[3]);

                                    if (matchValue_69.Case === "Err") {
                                        return {
                                            v: new _Error("Err", [l_3, matchValue_69.Fields[1]])
                                        };
                                    } else {
                                        var tokLst_16 = matchValue_69.Fields[0][1];
                                        var rl_15 = matchValue_69.Fields[0][0];
                                        var $var728 = m + 4;
                                        var $var729 = l_3;
                                        labels_2 = labels_2;
                                        outLst = append$1(outLst, ofArray([[m, new Instruction("Instr", [l_3, function () {
                                            var write_15 = true;
                                            return function (state_117) {
                                                return stmDB($var475[1], write_15, $var475[2], rl_15, state_117);
                                            };
                                        }()])]]));
                                        _arg1 = tokLst_16;
                                        l_3 = $var729;
                                        m = $var728;
                                        return "continue|parseRec";
                                    }

                                case 113:
                                    m = m;
                                    l_3 = l_3;
                                    labels_2 = add($var475[2], $var475[1], labels_2);
                                    outLst = outLst;
                                    _arg1 = $var475[3];
                                    return "continue|parseRec";

                                case 114:
                                    var matchValue_70 = tryFind$$1($var475[2], labels_2);

                                    if (matchValue_70 == null) {
                                        return {
                                            v: undefinedLabel(l_3, $var475[2])
                                        };
                                    } else {
                                        m = m;
                                        l_3 = l_3;
                                        labels_2 = add($var475[1], matchValue_70, labels_2);
                                        outLst = outLst;
                                        _arg1 = $var475[3];
                                        return "continue|parseRec";
                                    }

                                case 115:
                                    var $var730 = m + 4;
                                    var $var731 = l_3;
                                    labels_2 = labels_2;
                                    outLst = append$1(outLst, ofArray([[m, new Instruction("EndRef", [endRef(l_3)($var475[1])])]]));
                                    _arg1 = $var475[2];
                                    l_3 = $var731;
                                    m = $var730;
                                    return "continue|parseRec";

                                case 116:
                                    var $var732 = m;
                                    l_3 = l_3;
                                    labels_2 = add($var475[1], m, labels_2);
                                    outLst = outLst;
                                    _arg1 = $var475[2];
                                    m = $var732;
                                    return "continue|parseRec";

                                case 117:
                                    return {
                                        v: resolveRefs(labels_2, m, append$1(outLst, ofArray([[m, new Instruction("Terminate", [l_3])]])))
                                    };

                                case 118:
                                    m = m;
                                    l_3 = l_3 + 1;
                                    labels_2 = labels_2;
                                    outLst = outLst;
                                    _arg1 = $var475[1];
                                    return "continue|parseRec";

                                case 119:
                                    return {
                                        v: invalidToken(l_3, $var475[1])
                                    };

                                case 120:
                                    return {
                                        v: unexpectedToken(l_3, $var475[2], $var475[1])
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
    };

    var matchValue_71 = parseRec(0)(1)(create(null, new GenericComparer(compare)))(new List())(tokLst);

    if (matchValue_71.Case === "Err") {
        return new _Error("Err", [matchValue_71.Fields[0], matchValue_71.Fields[1]]);
    } else {
        return new _Error("Ok", [create(matchValue_71.Fields[0], new GenericComparer(compare))]);
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

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = function () {
    function Token(caseName, fields) {
        _classCallCheck$4(this, Token);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$4(Token, [{
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
                var matchValue = [this, yobj];
                var $var4 = matchValue[0].Case === "T_REG" ? matchValue[1].Case === "T_REG" ? [0, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_INT" ? matchValue[1].Case === "T_INT" ? [1, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_LABEL" ? matchValue[1].Case === "T_LABEL" ? [2, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_COMMA" ? matchValue[1].Case === "T_COMMA" ? [3] : [52] : matchValue[0].Case === "T_L_BRAC" ? matchValue[1].Case === "T_L_BRAC" ? [4] : [52] : matchValue[0].Case === "T_R_BRAC" ? matchValue[1].Case === "T_R_BRAC" ? [5] : [52] : matchValue[0].Case === "T_EXCL" ? matchValue[1].Case === "T_EXCL" ? [6] : [52] : matchValue[0].Case === "T_L_CBR" ? matchValue[1].Case === "T_R_CBR" ? [7] : [52] : matchValue[0].Case === "T_DASH" ? matchValue[1].Case === "T_DASH" ? [8] : [52] : matchValue[0].Case === "T_NEWLINE" ? matchValue[1].Case === "T_NEWLINE" ? [9] : [52] : matchValue[0].Case === "T_ERROR" ? matchValue[1].Case === "T_ERROR" ? [10, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_MOV" ? matchValue[1].Case === "T_MOV" ? [11, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_MVN" ? matchValue[1].Case === "T_MVN" ? [12, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_MRS" ? matchValue[1].Case === "T_MRS" ? [13, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_MSR" ? matchValue[1].Case === "T_MSR" ? [14, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_ADD" ? matchValue[1].Case === "T_ADD" ? [15, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_ADC" ? matchValue[1].Case === "T_ADC" ? [16, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_SUB" ? matchValue[1].Case === "T_SUB" ? [17, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_SBC" ? matchValue[1].Case === "T_SBC" ? [18, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_RSB" ? matchValue[1].Case === "T_RSB" ? [19, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_RSC" ? matchValue[1].Case === "T_RSC" ? [20, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_MUL" ? matchValue[1].Case === "T_MUL" ? [21, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_MLA" ? matchValue[1].Case === "T_MLA" ? [22, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_AND" ? matchValue[1].Case === "T_AND" ? [23, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_ORR" ? matchValue[1].Case === "T_ORR" ? [24, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_EOR" ? matchValue[1].Case === "T_EOR" ? [25, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_BIC" ? matchValue[1].Case === "T_BIC" ? [26, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_CMP" ? matchValue[1].Case === "T_CMP" ? [27, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_CMN" ? matchValue[1].Case === "T_CMN" ? [28, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_TST" ? matchValue[1].Case === "T_TST" ? [29, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_TEQ" ? matchValue[1].Case === "T_TEQ" ? [30, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_B" ? matchValue[1].Case === "T_B" ? [31, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_BL" ? matchValue[1].Case === "T_BL" ? [32, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_BX" ? matchValue[1].Case === "T_BX" ? [33, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_LDR" ? matchValue[1].Case === "T_LDR" ? [34, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_LDRB" ? matchValue[1].Case === "T_LDRB" ? [35, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_LDRH" ? matchValue[1].Case === "T_LDRH" ? [36, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_LDM" ? matchValue[1].Case === "T_LDM" ? [37, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_STR" ? matchValue[1].Case === "T_STR" ? [38, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_STRB" ? matchValue[1].Case === "T_STRB" ? [39, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_STRH" ? matchValue[1].Case === "T_STRH" ? [40, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_STM" ? matchValue[1].Case === "T_STM" ? [41, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [52] : matchValue[0].Case === "T_ADR" ? matchValue[1].Case === "T_ADR" ? [42, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_SWP" ? matchValue[1].Case === "T_SWP" ? [43, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_SWI" ? matchValue[1].Case === "T_SWI" ? [44, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_NOP" ? matchValue[1].Case === "T_NOP" ? [45, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_CLZ" ? matchValue[1].Case === "T_CLZ" ? [46, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_DCD" ? matchValue[1].Case === "T_DCD" ? [47] : [52] : matchValue[0].Case === "T_EQU" ? matchValue[1].Case === "T_EQU" ? [48] : [52] : matchValue[0].Case === "T_FILL" ? matchValue[1].Case === "T_FILL" ? [49] : [52] : matchValue[0].Case === "T_END" ? matchValue[1].Case === "T_END" ? [50, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : matchValue[0].Case === "T_SHIFT" ? matchValue[1].Case === "T_SHIFT" ? [51, matchValue[0].Fields[1][0], matchValue[1].Fields[1][0], matchValue[0].Fields[1][1], matchValue[1].Fields[1][1], matchValue[0].Fields[0], matchValue[1].Fields[0]] : [52] : [52];

                switch ($var4[0]) {
                    case 0:
                        return $var4[1] === $var4[2];

                    case 1:
                        return $var4[1] === $var4[2];

                    case 2:
                        return $var4[1] === $var4[2];

                    case 3:
                        return true;

                    case 4:
                        return true;

                    case 5:
                        return true;

                    case 6:
                        return true;

                    case 7:
                        return true;

                    case 8:
                        return true;

                    case 9:
                        return true;

                    case 10:
                        return $var4[1] === $var4[2];

                    case 11:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 12:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 13:
                        return $var4[1](state) === $var4[2](state);

                    case 14:
                        return $var4[1](state) === $var4[2](state);

                    case 15:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 16:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 17:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 18:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 19:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 20:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 21:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 22:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 23:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 24:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 25:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 26:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 27:
                        return $var4[1](state) === $var4[2](state);

                    case 28:
                        return $var4[1](state) === $var4[2](state);

                    case 29:
                        return $var4[1](state) === $var4[2](state);

                    case 30:
                        return $var4[1](state) === $var4[2](state);

                    case 31:
                        return $var4[1](state) === $var4[2](state);

                    case 32:
                        return $var4[1](state) === $var4[2](state);

                    case 33:
                        return $var4[1](state) === $var4[2](state);

                    case 34:
                        return $var4[1](state) === $var4[2](state);

                    case 35:
                        return $var4[1](state) === $var4[2](state);

                    case 36:
                        return $var4[1](state) === $var4[2](state);

                    case 37:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3].Equals($var4[4]);
                        } else {
                            return false;
                        }

                    case 38:
                        return $var4[1](state) === $var4[2](state);

                    case 39:
                        return $var4[1](state) === $var4[2](state);

                    case 40:
                        return $var4[1](state) === $var4[2](state);

                    case 41:
                        if ($var4[1](state) === $var4[2](state)) {
                            return $var4[3].Equals($var4[4]);
                        } else {
                            return false;
                        }

                    case 42:
                        return $var4[1](state) === $var4[2](state);

                    case 43:
                        return $var4[1](state) === $var4[2](state);

                    case 44:
                        return $var4[1](state) === $var4[2](state);

                    case 45:
                        return $var4[1](state) === $var4[2](state);

                    case 46:
                        return $var4[1](state) === $var4[2](state);

                    case 47:
                        return true;

                    case 48:
                        return true;

                    case 49:
                        return true;

                    case 50:
                        return $var4[1](state) === $var4[2](state);

                    case 51:
                        if ($var4[5].Equals($var4[6]) ? $var4[1](state) === $var4[2](state) : false) {
                            return $var4[3] === $var4[4];
                        } else {
                            return false;
                        }

                    case 52:
                        return false;
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
    } else {
        return null;
    }
}

function matchCond(_arg1) {
    var activePatternResult252 = _TOKEN_MATCH___("EQ", _arg1);

    if (activePatternResult252 != null) {
        return function (state) {
            return checkEQ(state);
        };
    } else {
        var activePatternResult250 = _TOKEN_MATCH___("NE", _arg1);

        if (activePatternResult250 != null) {
            return function (state_1) {
                return checkNE(state_1);
            };
        } else {
            var activePatternResult248 = _TOKEN_MATCH___("CS", _arg1);

            if (activePatternResult248 != null) {
                return function (state_2) {
                    return checkCS(state_2);
                };
            } else {
                var activePatternResult246 = _TOKEN_MATCH___("HS", _arg1);

                if (activePatternResult246 != null) {
                    return function (state_3) {
                        return checkCS(state_3);
                    };
                } else {
                    var activePatternResult244 = _TOKEN_MATCH___("CC", _arg1);

                    if (activePatternResult244 != null) {
                        return function (state_4) {
                            return checkCC(state_4);
                        };
                    } else {
                        var activePatternResult242 = _TOKEN_MATCH___("LO", _arg1);

                        if (activePatternResult242 != null) {
                            return function (state_5) {
                                return checkCC(state_5);
                            };
                        } else {
                            var activePatternResult240 = _TOKEN_MATCH___("MI", _arg1);

                            if (activePatternResult240 != null) {
                                return function (state_6) {
                                    return checkMI(state_6);
                                };
                            } else {
                                var activePatternResult238 = _TOKEN_MATCH___("PL", _arg1);

                                if (activePatternResult238 != null) {
                                    return function (state_7) {
                                        return checkPL(state_7);
                                    };
                                } else {
                                    var activePatternResult236 = _TOKEN_MATCH___("VS", _arg1);

                                    if (activePatternResult236 != null) {
                                        return function (state_8) {
                                            return checkVS(state_8);
                                        };
                                    } else {
                                        var activePatternResult234 = _TOKEN_MATCH___("VC", _arg1);

                                        if (activePatternResult234 != null) {
                                            return function (state_9) {
                                                return checkVC(state_9);
                                            };
                                        } else {
                                            var activePatternResult232 = _TOKEN_MATCH___("HI", _arg1);

                                            if (activePatternResult232 != null) {
                                                return function (state_10) {
                                                    return checkHI(state_10);
                                                };
                                            } else {
                                                var activePatternResult230 = _TOKEN_MATCH___("GE", _arg1);

                                                if (activePatternResult230 != null) {
                                                    return function (state_11) {
                                                        return checkGE(state_11);
                                                    };
                                                } else {
                                                    var activePatternResult228 = _TOKEN_MATCH___("LT", _arg1);

                                                    if (activePatternResult228 != null) {
                                                        return function (state_12) {
                                                            return checkLT(state_12);
                                                        };
                                                    } else {
                                                        var activePatternResult226 = _TOKEN_MATCH___("GT", _arg1);

                                                        if (activePatternResult226 != null) {
                                                            return function (state_13) {
                                                                return checkGT(state_13);
                                                            };
                                                        } else {
                                                            var activePatternResult224 = _TOKEN_MATCH___("LE", _arg1);

                                                            if (activePatternResult224 != null) {
                                                                return function (state_14) {
                                                                    return checkLE(state_14);
                                                                };
                                                            } else {
                                                                var activePatternResult222 = _TOKEN_MATCH___("AL", _arg1);

                                                                if (activePatternResult222 != null) {
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
    var activePatternResult255 = _TOKEN_MATCH___("S", _arg1);

    if (activePatternResult255 != null) {
        return true;
    } else {
        return false;
    }
}
function matchLDM(_arg1) {
    var activePatternResult272 = _TOKEN_MATCH___("IA", _arg1);

    if (activePatternResult272 != null) {
        return new stackOrder("S_IA", []);
    } else {
        var activePatternResult270 = _TOKEN_MATCH___("IB", _arg1);

        if (activePatternResult270 != null) {
            return new stackOrder("S_IB", []);
        } else {
            var activePatternResult268 = _TOKEN_MATCH___("DA", _arg1);

            if (activePatternResult268 != null) {
                return new stackOrder("S_DA", []);
            } else {
                var activePatternResult266 = _TOKEN_MATCH___("DB", _arg1);

                if (activePatternResult266 != null) {
                    return new stackOrder("S_DB", []);
                } else {
                    var activePatternResult264 = _TOKEN_MATCH___("FD", _arg1);

                    if (activePatternResult264 != null) {
                        return new stackOrder("S_IA", []);
                    } else {
                        var activePatternResult262 = _TOKEN_MATCH___("ED", _arg1);

                        if (activePatternResult262 != null) {
                            return new stackOrder("S_IB", []);
                        } else {
                            var activePatternResult260 = _TOKEN_MATCH___("FA", _arg1);

                            if (activePatternResult260 != null) {
                                return new stackOrder("S_DA", []);
                            } else {
                                var activePatternResult258 = _TOKEN_MATCH___("EA", _arg1);

                                if (activePatternResult258 != null) {
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
    var activePatternResult289 = _TOKEN_MATCH___("IA", _arg1);

    if (activePatternResult289 != null) {
        return new stackOrder("S_IA", []);
    } else {
        var activePatternResult287 = _TOKEN_MATCH___("IB", _arg1);

        if (activePatternResult287 != null) {
            return new stackOrder("S_IB", []);
        } else {
            var activePatternResult285 = _TOKEN_MATCH___("DA", _arg1);

            if (activePatternResult285 != null) {
                return new stackOrder("S_DA", []);
            } else {
                var activePatternResult283 = _TOKEN_MATCH___("DB", _arg1);

                if (activePatternResult283 != null) {
                    return new stackOrder("S_DB", []);
                } else {
                    var activePatternResult281 = _TOKEN_MATCH___("EA", _arg1);

                    if (activePatternResult281 != null) {
                        return new stackOrder("S_IA", []);
                    } else {
                        var activePatternResult279 = _TOKEN_MATCH___("FA", _arg1);

                        if (activePatternResult279 != null) {
                            return new stackOrder("S_IB", []);
                        } else {
                            var activePatternResult277 = _TOKEN_MATCH___("ED", _arg1);

                            if (activePatternResult277 != null) {
                                return new stackOrder("S_DA", []);
                            } else {
                                var activePatternResult275 = _TOKEN_MATCH___("FD", _arg1);

                                if (activePatternResult275 != null) {
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
    var m = match(str, "^LDM" + stackSfx + cond + "$", 1);

    if (m != null) {
        return [matchCond(m[1]), matchLDM(m[2])];
    } else {
        return null;
    }
}

function _STM_MATCH___(str) {
    var m = match(str, "^STM" + stackSfx + cond + "$", 1);

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
        return ~~Number.parseInt(m[1]);
    } else {
        return null;
    }
}

function _DEC_S_LIT_MATCH___(str) {
    var m = match(str, "^#?(-[0-9]+)$");

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
    var activePatternResult460 = _REG_MATCH___(_arg1);

    if (activePatternResult460 != null) {
        return new Token("T_REG", [activePatternResult460]);
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
                                                                                        return new Token("T_INT", [activePatternResult421]);
                                                                                    } else {
                                                                                        var activePatternResult420 = _DEC_S_LIT_MATCH___(_arg1);

                                                                                        if (activePatternResult420 != null) {
                                                                                            return new Token("T_INT", [activePatternResult420]);
                                                                                        } else {
                                                                                            var activePatternResult419 = _HEX_LIT_MATCH___(_arg1);

                                                                                            if (activePatternResult419 != null) {
                                                                                                return new Token("T_INT", [activePatternResult419]);
                                                                                            } else {
                                                                                                var activePatternResult418 = _INSTR_S_MATCH___("^MOV", _arg1);

                                                                                                if (activePatternResult418 != null) {
                                                                                                    return function (tupledArg) {
                                                                                                        return new Token("T_MOV", [tupledArg[0], tupledArg[1]]);
                                                                                                    }(activePatternResult418);
                                                                                                } else {
                                                                                                    var activePatternResult416 = _INSTR_S_MATCH___("^MVN", _arg1);

                                                                                                    if (activePatternResult416 != null) {
                                                                                                        return function (tupledArg_1) {
                                                                                                            return new Token("T_MVN", [tupledArg_1[0], tupledArg_1[1]]);
                                                                                                        }(activePatternResult416);
                                                                                                    } else {
                                                                                                        var activePatternResult414 = _INSTR_MATCH___("^MRS", _arg1);

                                                                                                        if (activePatternResult414 != null) {
                                                                                                            return new Token("T_MRS", [activePatternResult414]);
                                                                                                        } else {
                                                                                                            var activePatternResult412 = _INSTR_MATCH___("^MSR", _arg1);

                                                                                                            if (activePatternResult412 != null) {
                                                                                                                return new Token("T_MSR", [activePatternResult412]);
                                                                                                            } else {
                                                                                                                var activePatternResult410 = _INSTR_S_MATCH___("^ADD", _arg1);

                                                                                                                if (activePatternResult410 != null) {
                                                                                                                    return function (tupledArg_2) {
                                                                                                                        return new Token("T_ADD", [tupledArg_2[0], tupledArg_2[1]]);
                                                                                                                    }(activePatternResult410);
                                                                                                                } else {
                                                                                                                    var activePatternResult408 = _INSTR_S_MATCH___("^ADC", _arg1);

                                                                                                                    if (activePatternResult408 != null) {
                                                                                                                        return function (tupledArg_3) {
                                                                                                                            return new Token("T_ADC", [tupledArg_3[0], tupledArg_3[1]]);
                                                                                                                        }(activePatternResult408);
                                                                                                                    } else {
                                                                                                                        var activePatternResult406 = _INSTR_S_MATCH___("^SUB", _arg1);

                                                                                                                        if (activePatternResult406 != null) {
                                                                                                                            return function (tupledArg_4) {
                                                                                                                                return new Token("T_SUB", [tupledArg_4[0], tupledArg_4[1]]);
                                                                                                                            }(activePatternResult406);
                                                                                                                        } else {
                                                                                                                            var activePatternResult404 = _INSTR_S_MATCH___("^SBC", _arg1);

                                                                                                                            if (activePatternResult404 != null) {
                                                                                                                                return function (tupledArg_5) {
                                                                                                                                    return new Token("T_SBC", [tupledArg_5[0], tupledArg_5[1]]);
                                                                                                                                }(activePatternResult404);
                                                                                                                            } else {
                                                                                                                                var activePatternResult402 = _INSTR_S_MATCH___("^RSB", _arg1);

                                                                                                                                if (activePatternResult402 != null) {
                                                                                                                                    return function (tupledArg_6) {
                                                                                                                                        return new Token("T_RSB", [tupledArg_6[0], tupledArg_6[1]]);
                                                                                                                                    }(activePatternResult402);
                                                                                                                                } else {
                                                                                                                                    var activePatternResult400 = _INSTR_S_MATCH___("^RSC", _arg1);

                                                                                                                                    if (activePatternResult400 != null) {
                                                                                                                                        return function (tupledArg_7) {
                                                                                                                                            return new Token("T_RSC", [tupledArg_7[0], tupledArg_7[1]]);
                                                                                                                                        }(activePatternResult400);
                                                                                                                                    } else {
                                                                                                                                        var activePatternResult398 = _INSTR_S_MATCH___("^MUL", _arg1);

                                                                                                                                        if (activePatternResult398 != null) {
                                                                                                                                            return function (tupledArg_8) {
                                                                                                                                                return new Token("T_MUL", [tupledArg_8[0], tupledArg_8[1]]);
                                                                                                                                            }(activePatternResult398);
                                                                                                                                        } else {
                                                                                                                                            var activePatternResult396 = _INSTR_S_MATCH___("^MLA", _arg1);

                                                                                                                                            if (activePatternResult396 != null) {
                                                                                                                                                return function (tupledArg_9) {
                                                                                                                                                    return new Token("T_MLA", [tupledArg_9[0], tupledArg_9[1]]);
                                                                                                                                                }(activePatternResult396);
                                                                                                                                            } else {
                                                                                                                                                var activePatternResult394 = _INSTR_S_MATCH___("^UMULL", _arg1);

                                                                                                                                                if (activePatternResult394 != null) {
                                                                                                                                                    return function (tupledArg_10) {
                                                                                                                                                        return new Token("T_UMULL", [tupledArg_10[0], tupledArg_10[1]]);
                                                                                                                                                    }(activePatternResult394);
                                                                                                                                                } else {
                                                                                                                                                    var activePatternResult392 = _INSTR_S_MATCH___("^UMLAL", _arg1);

                                                                                                                                                    if (activePatternResult392 != null) {
                                                                                                                                                        return function (tupledArg_11) {
                                                                                                                                                            return new Token("T_UMLAL", [tupledArg_11[0], tupledArg_11[1]]);
                                                                                                                                                        }(activePatternResult392);
                                                                                                                                                    } else {
                                                                                                                                                        var activePatternResult390 = _INSTR_S_MATCH___("^SMULL", _arg1);

                                                                                                                                                        if (activePatternResult390 != null) {
                                                                                                                                                            return function (tupledArg_12) {
                                                                                                                                                                return new Token("T_SMULL", [tupledArg_12[0], tupledArg_12[1]]);
                                                                                                                                                            }(activePatternResult390);
                                                                                                                                                        } else {
                                                                                                                                                            var activePatternResult388 = _INSTR_S_MATCH___("^SMLAL", _arg1);

                                                                                                                                                            if (activePatternResult388 != null) {
                                                                                                                                                                return function (tupledArg_13) {
                                                                                                                                                                    return new Token("T_SMLAL", [tupledArg_13[0], tupledArg_13[1]]);
                                                                                                                                                                }(activePatternResult388);
                                                                                                                                                            } else {
                                                                                                                                                                var activePatternResult386 = _INSTR_S_MATCH___("^AND", _arg1);

                                                                                                                                                                if (activePatternResult386 != null) {
                                                                                                                                                                    return function (tupledArg_14) {
                                                                                                                                                                        return new Token("T_AND", [tupledArg_14[0], tupledArg_14[1]]);
                                                                                                                                                                    }(activePatternResult386);
                                                                                                                                                                } else {
                                                                                                                                                                    var activePatternResult384 = _INSTR_S_MATCH___("^ORR", _arg1);

                                                                                                                                                                    if (activePatternResult384 != null) {
                                                                                                                                                                        return function (tupledArg_15) {
                                                                                                                                                                            return new Token("T_ORR", [tupledArg_15[0], tupledArg_15[1]]);
                                                                                                                                                                        }(activePatternResult384);
                                                                                                                                                                    } else {
                                                                                                                                                                        var activePatternResult382 = _INSTR_S_MATCH___("^EOR", _arg1);

                                                                                                                                                                        if (activePatternResult382 != null) {
                                                                                                                                                                            return function (tupledArg_16) {
                                                                                                                                                                                return new Token("T_EOR", [tupledArg_16[0], tupledArg_16[1]]);
                                                                                                                                                                            }(activePatternResult382);
                                                                                                                                                                        } else {
                                                                                                                                                                            var activePatternResult380 = _INSTR_S_MATCH___("^BIC", _arg1);

                                                                                                                                                                            if (activePatternResult380 != null) {
                                                                                                                                                                                return function (tupledArg_17) {
                                                                                                                                                                                    return new Token("T_BIC", [tupledArg_17[0], tupledArg_17[1]]);
                                                                                                                                                                                }(activePatternResult380);
                                                                                                                                                                            } else {
                                                                                                                                                                                var activePatternResult378 = _INSTR_MATCH___("^CMP", _arg1);

                                                                                                                                                                                if (activePatternResult378 != null) {
                                                                                                                                                                                    return new Token("T_CMP", [activePatternResult378]);
                                                                                                                                                                                } else {
                                                                                                                                                                                    var activePatternResult376 = _INSTR_MATCH___("^CMN", _arg1);

                                                                                                                                                                                    if (activePatternResult376 != null) {
                                                                                                                                                                                        return new Token("T_CMN", [activePatternResult376]);
                                                                                                                                                                                    } else {
                                                                                                                                                                                        var activePatternResult374 = _INSTR_MATCH___("^TST", _arg1);

                                                                                                                                                                                        if (activePatternResult374 != null) {
                                                                                                                                                                                            return new Token("T_TST", [activePatternResult374]);
                                                                                                                                                                                        } else {
                                                                                                                                                                                            var activePatternResult372 = _INSTR_MATCH___("^TEQ", _arg1);

                                                                                                                                                                                            if (activePatternResult372 != null) {
                                                                                                                                                                                                return new Token("T_TEQ", [activePatternResult372]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                var activePatternResult370 = _INSTR_MATCH___("^B", _arg1);

                                                                                                                                                                                                if (activePatternResult370 != null) {
                                                                                                                                                                                                    return new Token("T_B", [activePatternResult370]);
                                                                                                                                                                                                } else {
                                                                                                                                                                                                    var activePatternResult368 = _INSTR_MATCH___("^BL", _arg1);

                                                                                                                                                                                                    if (activePatternResult368 != null) {
                                                                                                                                                                                                        return new Token("T_BL", [activePatternResult368]);
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        var activePatternResult366 = _INSTR_MATCH___("^BX", _arg1);

                                                                                                                                                                                                        if (activePatternResult366 != null) {
                                                                                                                                                                                                            return new Token("T_BX", [activePatternResult366]);
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            var activePatternResult364 = _INSTR_MATCH___("^LDR", _arg1);

                                                                                                                                                                                                            if (activePatternResult364 != null) {
                                                                                                                                                                                                                return new Token("T_LDR", [activePatternResult364]);
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                var activePatternResult362 = _INSTR_MATCH___("^LDRB", _arg1);

                                                                                                                                                                                                                if (activePatternResult362 != null) {
                                                                                                                                                                                                                    return new Token("T_LDRB", [activePatternResult362]);
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    var activePatternResult360 = _INSTR_MATCH___("^LDRH", _arg1);

                                                                                                                                                                                                                    if (activePatternResult360 != null) {
                                                                                                                                                                                                                        return new Token("T_LDRH", [activePatternResult360]);
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        var activePatternResult358 = _LDM_MATCH___(_arg1);

                                                                                                                                                                                                                        if (activePatternResult358 != null) {
                                                                                                                                                                                                                            return function (tupledArg_18) {
                                                                                                                                                                                                                                return new Token("T_LDM", [tupledArg_18[0], tupledArg_18[1]]);
                                                                                                                                                                                                                            }(activePatternResult358);
                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                            var activePatternResult357 = _INSTR_MATCH___("^STR", _arg1);

                                                                                                                                                                                                                            if (activePatternResult357 != null) {
                                                                                                                                                                                                                                return new Token("T_STR", [activePatternResult357]);
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                var activePatternResult355 = _INSTR_MATCH___("^STRB", _arg1);

                                                                                                                                                                                                                                if (activePatternResult355 != null) {
                                                                                                                                                                                                                                    return new Token("T_STRB", [activePatternResult355]);
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    var activePatternResult353 = _INSTR_MATCH___("^STRH", _arg1);

                                                                                                                                                                                                                                    if (activePatternResult353 != null) {
                                                                                                                                                                                                                                        return new Token("T_STRH", [activePatternResult353]);
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        var activePatternResult351 = _STM_MATCH___(_arg1);

                                                                                                                                                                                                                                        if (activePatternResult351 != null) {
                                                                                                                                                                                                                                            return function (tupledArg_19) {
                                                                                                                                                                                                                                                return new Token("T_STM", [tupledArg_19[0], tupledArg_19[1]]);
                                                                                                                                                                                                                                            }(activePatternResult351);
                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                            var activePatternResult350 = _INSTR_MATCH___("^SWP", _arg1);

                                                                                                                                                                                                                                            if (activePatternResult350 != null) {
                                                                                                                                                                                                                                                return new Token("T_SWP", [activePatternResult350]);
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                var activePatternResult348 = _INSTR_MATCH___("^SWI", _arg1);

                                                                                                                                                                                                                                                if (activePatternResult348 != null) {
                                                                                                                                                                                                                                                    return new Token("T_SWI", [activePatternResult348]);
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                    var activePatternResult346 = _INSTR_MATCH___("^NOP", _arg1);

                                                                                                                                                                                                                                                    if (activePatternResult346 != null) {
                                                                                                                                                                                                                                                        return new Token("T_NOP", [activePatternResult346]);
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                        var activePatternResult344 = _INSTR_MATCH___("^ADR", _arg1);

                                                                                                                                                                                                                                                        if (activePatternResult344 != null) {
                                                                                                                                                                                                                                                            return new Token("T_ADR", [activePatternResult344]);
                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                            var activePatternResult342 = _INSTR_MATCH___("^END", _arg1);

                                                                                                                                                                                                                                                            if (activePatternResult342 != null) {
                                                                                                                                                                                                                                                                return new Token("T_END", [activePatternResult342]);
                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                var activePatternResult340 = _INSTR_MATCH___("^CLZ", _arg1);

                                                                                                                                                                                                                                                                if (activePatternResult340 != null) {
                                                                                                                                                                                                                                                                    return new Token("T_CLZ", [activePatternResult340]);
                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                    var activePatternResult338 = _TOKEN_MATCH___("^DCD$", _arg1);

                                                                                                                                                                                                                                                                    if (activePatternResult338 != null) {
                                                                                                                                                                                                                                                                        return new Token("T_DCD", []);
                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                        var activePatternResult336 = _TOKEN_MATCH___("^EQU$", _arg1);

                                                                                                                                                                                                                                                                        if (activePatternResult336 != null) {
                                                                                                                                                                                                                                                                            return new Token("T_EQU", []);
                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                            var activePatternResult334 = _TOKEN_MATCH___("^FILL$", _arg1);

                                                                                                                                                                                                                                                                            if (activePatternResult334 != null) {
                                                                                                                                                                                                                                                                                return new Token("T_FILL", []);
                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                var activePatternResult332 = _INSTR_S_MATCH___("^ASR", _arg1);

                                                                                                                                                                                                                                                                                if (activePatternResult332 != null) {
                                                                                                                                                                                                                                                                                    return new Token("T_SHIFT", [new shiftOp("T_ASR", []), activePatternResult332]);
                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                    var activePatternResult330 = _INSTR_S_MATCH___("^LSL", _arg1);

                                                                                                                                                                                                                                                                                    if (activePatternResult330 != null) {
                                                                                                                                                                                                                                                                                        return new Token("T_SHIFT", [new shiftOp("T_LSL", []), activePatternResult330]);
                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                        var activePatternResult328 = _INSTR_S_MATCH___("^LSR", _arg1);

                                                                                                                                                                                                                                                                                        if (activePatternResult328 != null) {
                                                                                                                                                                                                                                                                                            return new Token("T_SHIFT", [new shiftOp("T_LSR", []), activePatternResult328]);
                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                            var activePatternResult326 = _INSTR_S_MATCH___("^ROR", _arg1);

                                                                                                                                                                                                                                                                                            if (activePatternResult326 != null) {
                                                                                                                                                                                                                                                                                                return new Token("T_SHIFT", [new shiftOp("T_ROR", []), activePatternResult326]);
                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                var activePatternResult324 = _INSTR_S_MATCH___("^RRX", _arg1);

                                                                                                                                                                                                                                                                                                if (activePatternResult324 != null) {
                                                                                                                                                                                                                                                                                                    return new Token("T_SHIFT", [new shiftOp("T_RRX", []), activePatternResult324]);
                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                    var activePatternResult322 = _LABEL_MATCH___(_arg1);

                                                                                                                                                                                                                                                                                                    if (activePatternResult322 != null) {
                                                                                                                                                                                                                                                                                                        return new Token("T_LABEL", [activePatternResult322]);
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
}

function tokenise(source) {
    return function (list) {
        return map$2(function (_arg1) {
            return stringToToken(_arg1);
        }, list);
    }(filter$2(function (s) {
        return s !== "";
    }, filter$2(function (s_1) {
        return s_1 != null;
    }, toList(split$1(source, "([,\\[\\]!\\n])|[\\ \\t\\r\\f]+|;.*")))));
}

function newStateAll(oldState, inString) {
    return wrapErr(function (instr) {
        return interpret(oldState, instr);
    }, parser(tokenise(inString)));
}
function newStateSingle(oldState, inString) {
    return wrapErr(function (instr) {
        return interpretLine(oldState, instr);
    }, parser(tokenise(inString)));
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
    if (t.Case === "SetOne") {
        var c = comparer.Compare(k, t.Fields[0]);
        if (c < 0) {
            return tree_SetNode(k, new SetTree("SetEmpty", []), t, 2);
        }
        else if (c === 0) {
            return t;
        }
        else {
            return tree_SetNode(k, t, new SetTree("SetEmpty", []), 2);
        }
    }
    else if (t.Case === "SetEmpty") {
        return tree_SetOne(k);
    }
    else {
        var c = comparer.Compare(k, t.Fields[0]);
        if (c < 0) {
            return tree_rebalance$1(tree_add$1(comparer, k, t.Fields[1]), t.Fields[0], t.Fields[2]);
        }
        else if (c === 0) {
            return t;
        }
        else {
            return tree_rebalance$1(t.Fields[1], t.Fields[0], tree_add$1(comparer, k, t.Fields[2]));
        }
    }
}
function tree_mem$1(comparer, k, t) {
    if (t.Case === "SetOne") {
        return comparer.Compare(k, t.Fields[0]) === 0;
    }
    else if (t.Case === "SetEmpty") {
        return false;
    }
    else {
        var c = comparer.Compare(k, t.Fields[0]);
        if (c < 0) {
            return tree_mem$1(comparer, k, t.Fields[1]);
        }
        else if (c === 0) {
            return true;
        }
        else {
            return tree_mem$1(comparer, k, t.Fields[2]);
        }
    }
}
function tree_collapseLHS$1(stack) {
    return stack.tail != null
        ? stack.head.Case === "SetOne"
            ? stack
            : stack.head.Case === "SetNode"
                ? tree_collapseLHS$1(ofArray([
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
    var $target8 = function (n1k, t1) { return tree_compareStacks(comparer, ofArray([new SetTree("SetEmpty", []), tree_SetOne(n1k)], t1), l2); };
    var $target9 = function (n1k, n1l, n1r, t1) { return tree_compareStacks(comparer, ofArray([n1l, tree_SetNode(n1k, new SetTree("SetEmpty", []), n1r, 0)], t1), l2); };
    var $target11 = function (n2k, n2l, n2r, t2) { return tree_compareStacks(comparer, l1, ofArray([n2l, tree_SetNode(n2k, new SetTree("SetEmpty", []), n2r, 0)], t2)); };
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
                                return tree_compareStacks(comparer, ofArray([n1r], t1), ofArray([emp], t2));
                            }
                        }
                        else {
                            return $target9(l1.head.Fields[0], l1.head.Fields[1], l1.head.Fields[2], l1.tail);
                        }
                    }
                    else {
                        var n2k = l2.head.Fields[0], t2 = l2.tail;
                        return tree_compareStacks(comparer, l1, ofArray([new SetTree("SetEmpty", []), tree_SetOne(n2k)], t2));
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
                                return tree_compareStacks(comparer, ofArray([new SetTree("SetEmpty", [])], t1), ofArray([n2r], t2));
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
                                        return tree_compareStacks(comparer, ofArray([n1r], t1), ofArray([n2r], t2));
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
            return tree_compareStacks(comparer, ofArray([s1]), ofArray([s2]));
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
var FableSet = (function () {
    function FableSet() {
    }
    FableSet.prototype.ToString = function () {
        return "set [" + Array.from(this).map(toString).join("; ") + "]";
    };
    FableSet.prototype.Equals = function (s2) {
        return this.CompareTo(s2) === 0;
    };
    FableSet.prototype.CompareTo = function (s2) {
        return this === s2 ? 0 : tree_compare(this.comparer, this.tree, s2.tree);
    };
    FableSet.prototype[Symbol.iterator] = function () {
        var i = tree_mkIterator$1(this.tree);
        return {
            next: function () { return tree_moveNext$1(i); }
        };
    };
    FableSet.prototype.values = function () {
        return this[Symbol.iterator]();
    };
    FableSet.prototype.has = function (v) {
        return tree_mem$1(this.comparer, v, this.tree);
    };
    FableSet.prototype.add = function (v) {
        throw new Error("not supported");
    };
    FableSet.prototype.delete = function (v) {
        throw new Error("not supported");
    };
    FableSet.prototype.clear = function () {
        throw new Error("not supported");
    };
    Object.defineProperty(FableSet.prototype, "size", {
        get: function () {
            return tree_count(this.tree);
        },
        enumerable: true,
        configurable: true
    });
    FableSet.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpSet",
            interfaces: ["System.IEquatable", "System.IComparable"]
        };
    };
    return FableSet;
}());
function from$1(comparer, tree) {
    var s = new FableSet();
    s.tree = tree;
    s.comparer = comparer || new GenericComparer();
    return s;
}
function create$4(ie, comparer) {
    comparer = comparer || new GenericComparer();
    return from$1(comparer, ie ? tree_ofSeq$1(comparer, ie) : new SetTree("SetEmpty", []));
}

function resolveGeneric(idx, enclosing) {
    try {
        var t = enclosing.head;
        if (t.generics == null) {
            return resolveGeneric(idx, enclosing.tail);
        }
        else {
            var name_1 = typeof idx === "string"
                ? idx : Object.getOwnPropertyNames(t.generics)[idx];
            var resolved = t.generics[name_1];
            if (resolved == null) {
                return resolveGeneric(idx, enclosing.tail);
            }
            else if (resolved instanceof NonDeclaredType && resolved.kind === "GenericParam") {
                return resolveGeneric(resolved.definition, enclosing.tail);
            }
            else {
                return new List(resolved, enclosing);
            }
        }
    }
    catch (err) {
        throw new Error("Cannot resolve generic argument " + idx + ": " + err);
    }
}

function getTypeFullName(typ, option) {
    function trim(fullName, option) {
        if (typeof fullName !== "string") {
            return "unknown";
        }
        if (option === "name") {
            var i = fullName.lastIndexOf('.');
            return fullName.substr(i + 1);
        }
        if (option === "namespace") {
            var i = fullName.lastIndexOf('.');
            return i > -1 ? fullName.substr(0, i) : "";
        }
        return fullName;
    }
    if (typeof typ === "string") {
        return typ;
    }
    else if (typ instanceof NonDeclaredType) {
        switch (typ.kind) {
            case "Unit":
                return "unit";
            case "Option":
                return getTypeFullName(typ.generics, option) + " option";
            case "Array":
                return getTypeFullName(typ.generics, option) + "[]";
            case "Tuple":
                return typ.generics.map(function (x) { return getTypeFullName(x, option); }).join(" * ");
            case "GenericParam":
            case "Interface":
                return typ.definition;
            case "GenericType":
                return getTypeFullName(typ.definition, option);
            case "Any":
            default:
                return "unknown";
        }
    }
    else {
        var proto = typ.prototype;
        return trim(typeof proto[_Symbol.reflection] === "function"
            ? proto[_Symbol.reflection]().type : null, option);
    }
}

function combine(path1, path2) {
    return typeof path2 === "number"
        ? path1 + "[" + path2 + "]"
        : (path1 ? path1 + "." : "") + path2;
}
function isNullable(typ) {
    if (typeof typ === "string") {
        return typ !== "boolean" && typ !== "number";
    }
    else if (typ instanceof NonDeclaredType) {
        return typ.kind !== "Array" && typ.kind !== "Tuple";
    }
    else {
        var info = typeof typ.prototype[_Symbol.reflection] === "function"
            ? typ.prototype[_Symbol.reflection]() : null;
        return info ? info.nullable : true;
    }
}
function invalidate(val, typ, path) {
    throw new Error(fsFormat("%A", val) + " " + (path ? "(" + path + ")" : "") + " is not of type " + getTypeFullName(typ));
}
function needsInflate(enclosing) {
    var typ = enclosing.head;
    if (typeof typ === "string") {
        return false;
    }
    if (typ instanceof NonDeclaredType) {
        switch (typ.kind) {
            case "Option":
            case "Array":
                return typ.definition != null || needsInflate(new List(typ.generics, enclosing));
            case "Tuple":
                return typ.generics.some(function (x) {
                    return needsInflate(new List(x, enclosing));
                });
            case "GenericParam":
                return needsInflate(resolveGeneric(typ.definition, enclosing.tail));
            case "GenericType":
                return true;
            default:
                return false;
        }
    }
    return true;
}
function inflateArray(arr, enclosing, path) {
    if (!Array.isArray) {
        invalidate(arr, "array", path);
    }
    return needsInflate(enclosing)
        ? arr.map(function (x, i) { return inflate(x, enclosing, combine(path, i)); })
        : arr;
}
function inflateMap(obj, keyEnclosing, valEnclosing, path) {
    var inflateKey = keyEnclosing.head !== "string";
    var inflateVal = needsInflate(valEnclosing);
    return Object
        .getOwnPropertyNames(obj)
        .map(function (k) {
        var key = inflateKey ? inflate(JSON.parse(k), keyEnclosing, combine(path, k)) : k;
        var val = inflateVal ? inflate(obj[k], valEnclosing, combine(path, k)) : obj[k];
        return [key, val];
    });
}
function inflateList(val, enclosing, path) {
    var ar = [], li = new List(), cur = val, inf = needsInflate(enclosing);
    while (cur.tail != null) {
        ar.push(inf ? inflate(cur.head, enclosing, path) : cur.head);
        cur = cur.tail;
    }
    ar.reverse();
    for (var i = 0; i < ar.length; i++) {
        li = new List(ar[i], li);
    }
    return li;
}
function inflate(val, typ, path) {
    var enclosing = null;
    if (typ instanceof List) {
        enclosing = typ;
        typ = typ.head;
    }
    else {
        enclosing = new List(typ, new List());
    }
    if (val == null) {
        if (!isNullable(typ)) {
            invalidate(val, typ, path);
        }
        return val;
    }
    else if (typeof typ === "string") {
        if ((typ === "boolean" || typ === "number" || typ === "string") && (typeof val !== typ)) {
            invalidate(val, typ, path);
        }
        return val;
    }
    else if (typ instanceof NonDeclaredType) {
        switch (typ.kind) {
            case "Unit":
                return null;
            case "Option":
                return inflate(val, new List(typ.generics, enclosing), path);
            case "Array":
                if (typ.definition != null) {
                    return new typ.definition(val);
                }
                else {
                    return inflateArray(val, new List(typ.generics, enclosing), path);
                }
            case "Tuple":
                return typ.generics.map(function (x, i) {
                    return inflate(val[i], new List(x, enclosing), combine(path, i));
                });
            case "GenericParam":
                return inflate(val, resolveGeneric(typ.definition, enclosing.tail), path);
            case "GenericType":
                var def = typ.definition;
                if (def === List) {
                    return Array.isArray(val)
                        ? ofArray(inflateArray(val, resolveGeneric(0, enclosing), path))
                        : inflateList(val, resolveGeneric(0, enclosing), path);
                }
                if (def === FableSet) {
                    return create$4(inflateArray(val, resolveGeneric(0, enclosing), path));
                }
                if (def === Set) {
                    return new Set(inflateArray(val, resolveGeneric(0, enclosing), path));
                }
                if (def === FableMap) {
                    return create(inflateMap(val, resolveGeneric(0, enclosing), resolveGeneric(1, enclosing), path));
                }
                if (def === Map) {
                    return new Map(inflateMap(val, resolveGeneric(0, enclosing), resolveGeneric(1, enclosing), path));
                }
                return inflate(val, new List(typ.definition, enclosing), path);
            default:
                return val;
        }
    }
    else if (typeof typ === "function") {
        if (typ === Date) {
            return parse(val);
        }
        var info = typeof typ.prototype[_Symbol.reflection] === "function" ? typ.prototype[_Symbol.reflection]() : {};
        if (info.cases) {
            var uCase = void 0, uFields = [];
            if (typeof val === "string") {
                uCase = val;
            }
            else if (typeof val.Case === "string" && Array.isArray(val.Fields)) {
                uCase = val.Case;
                uFields = val.Fields;
            }
            else {
                var caseName = Object.getOwnPropertyNames(val)[0];
                var fieldTypes = info.cases[caseName];
                if (Array.isArray(fieldTypes)) {
                    var fields = fieldTypes.length > 1 ? val[caseName] : [val[caseName]];
                    uCase = caseName;
                    path = combine(path, caseName);
                    for (var i = 0; i < fieldTypes.length; i++) {
                        uFields.push(inflate(fields[i], new List(fieldTypes[i], enclosing), combine(path, i)));
                    }
                }
            }
            if (uCase in info.cases === false) {
                invalidate(val, typ, path);
            }
            return new typ(uCase, uFields);
        }
        if (info.properties) {
            var newObj = new typ();
            var properties = info.properties;
            var ks = Object.getOwnPropertyNames(properties);
            for (var i = 0; i < ks.length; i++) {
                var k = ks[i];
                newObj[k] = inflate(val[k], new List(properties[k], enclosing), combine(path, k));
            }
            return newObj;
        }
        return val;
    }
    throw new Error("Unexpected type when deserializing JSON: " + typ);
}
function ofJson(json, genArgs) {
    return inflate(JSON.parse(json), genArgs ? genArgs.T : null, "");
}

var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Test = function () {
    function Test(input, output) {
        _classCallCheck$5(this, Test);

        this.Input = input;
        this.Output = output;
    }

    _createClass$5(Test, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Test.Tester.Test",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    Input: "string",
                    Output: FableArray(Int32Array, true)
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsRecords(this, other);
        }
    }, {
        key: "CompareTo",
        value: function (other) {
            return compareRecords(this, other);
        }
    }]);

    return Test;
}();
setType("Test.Tester.Test", Test);
var Tests = function () {
    function Tests(caseName, fields) {
        _classCallCheck$5(this, Tests);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$5(Tests, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Test.Tester.Tests",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    Tests: [FableArray(Test)]
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

    return Tests;
}();
setType("Test.Tester.Tests", Tests);
var state = initStateVisual;
function nState(code) {
    return newStateAll(state, code);
}

function boolInt(b) {
    if (b) {
        return 1;
    } else {
        return 0;
    }
}
function stateArray(state_1) {
    var getReg = function getReg(state_2) {
        return function (i) {
            if (i <= 15) {
                return readReg(i, state_2);
            } else {
                switch (i) {
                    case 16:
                        return boolInt(readNFlag(state_2));

                    case 17:
                        return boolInt(readZFlag(state_2));

                    case 18:
                        return boolInt(readCFlag(state_2));

                    case 19:
                        return boolInt(readVFlag(state_2));

                    default:
                        return -1;
                }
            }
        };
    };

    var testArray = Int32Array.from(range(0, 19)).map(getReg(state_1));
    return testArray;
}
function outputString(code) {
    var matchValue = nState(code);

    if (matchValue.Case === "Err") {
        return new Int32Array([0]);
    } else {
        var s = matchValue.Fields[0][1];
        var i = matchValue.Fields[0][0];
        return stateArray(s);
    }
}
function runTest(test) {
    return equals(test.Output, outputString(test.Input));
}
function printTest(json) {
    var getString = function getString(test) {
        return fsFormat("Correct: %A; Incorrect: %A")(function (x) {
            return x;
        })(outputString(test.Input))(test.Output);
    };

    return json.Fields[0].map(function (test_1) {
        return getString(test_1);
    });
}
function runTests(json) {
    var correct = json.Fields[0].map(function (test) {
        return runTest(test);
    }).reduce(function (acc, elem) {
        return acc ? elem : false;
    });

    if (correct) {
        return "PASSED FRONT END TEST";
    } else {
        return fsFormat("FAILED// %A")(function (x) {
            return x;
        })(printTest(json));
    }
}

(function (args) {
    var regs = document.getElementById("regs");
    var errorBox = document.getElementById("errorBox");
    var compileAllBtn = document.getElementById("compileAllBtn");
    var compileNextLineBtn = document.getElementById("compileNextLineBtn");
    var resetBtn = document.getElementById("resetBtn");
    var saveCodeMirror$$1 = saveCodeMirror;
    var initializeCodeMirror$$1 = initializeCodeMirror;
    var highlightLine$$1 = highlightLine;
    var changeCMTheme$$1 = changeCMTheme;
    var clearAllLines$$1 = clearAllLines;
    var getJSON$$1 = getJSON;
    var cmEditor = initializeCodeMirror$$1(null);
    var state$$1 = initStateVisual;

    var toBinary = function toBinary(value) {
        if (value < 2) {
            return String(value);
        } else {
            var divisor = ~~(value / 2);
            var remainder = void 0;
            var copyOfStruct = value % 2;
            remainder = String(copyOfStruct);
            return toBinary(divisor) + remainder;
        }
    };

    var getRegisterTable = function getRegisterTable(valid) {
        return function (regState) {
            return div(ofArray([table(ofArray([op_PercentEquals("class", "table table-striped table-condensed"), thead(ofArray([tr(ofArray([th(op_Splice("Register")), th(op_Splice("Hex")), th(op_Splice("Bin")), th(op_Splice("Dec (sig)")), th(op_Splice("Dec (unsig)"))]))])), tbody(ofArray([op_PercentEquals("class", valid ? "black" : "red"), div(toList(delay(function () {
                return map$1(function (i) {
                    return tr(ofArray([th(op_Splice(fsFormat("R%A")(function (x) {
                        return x;
                    })(i))), th(valid ? op_Splice(fsFormat("%08X")(function (x) {
                        return x;
                    })(readReg(i, regState))) : op_Splice(fsFormat("X")(function (x) {
                        return x;
                    }))), th(valid ? op_Splice(toBinary(function (arg10_) {
                        return readReg(i, arg10_);
                    }(regState) >>> 0)) : op_Splice(fsFormat("X")(function (x) {
                        return x;
                    }))), th(valid ? op_Splice(fsFormat("%i")(function (x) {
                        return x;
                    })(readReg(i, regState))) : op_Splice(fsFormat("X")(function (x) {
                        return x;
                    }))), th(valid ? op_Splice(fsFormat("%i")(function (x) {
                        return x;
                    })(function (arg10__1) {
                        return readReg(i, arg10__1);
                    }(regState) >>> 0)) : op_Splice(fsFormat("X")(function (x) {
                        return x;
                    })))]));
                }, range(0, 15));
            })))]))])), br(new List()), table(ofArray([op_PercentEquals("class", "table table-striped table-condensed"), thead(ofArray([tr(ofArray([th(op_Splice("Flag")), th(op_Splice("Value"))]))])), tbody(ofArray([op_PercentEquals("class", valid ? "black" : "red"), div(ofArray([tr(ofArray([th(op_Splice(fsFormat("N")(function (x) {
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
        clearAllLines$$1(cmEditor);
        var code = saveCodeMirror$$1(cmEditor);
        var state_1 = initStateVisual;
        var nState$$1 = newStateAll(state_1, code);
        var registerString = void 0;

        if (nState$$1.Case === "Err") {
            registerString = Html.toString(getRegisterTable(false)(initState));
        } else {
            var s = nState$$1.Fields[0][1];
            var i_1 = nState$$1.Fields[0][0];
            registerString = Html.toString(getRegisterTable(true)(s));
        }

        var errorString = void 0;

        if (nState$$1.Case === "Err") {
            errorString = fsFormat("ERROR ON LINE %i\t %s")(function (x) {
                return x;
            })(nState$$1.Fields[0])(nState$$1.Fields[1]);
        } else {
            var s_1 = nState$$1.Fields[0][1];
            var i_2 = nState$$1.Fields[0][0];
            errorString = fsFormat("Ran %i lines")(function (x) {
                return x;
            })(i_2);
        }

        if (nState$$1.Case === "Err") {
            highlightLine$$1(nState$$1.Fields[0], cmEditor, 1);
        } else {
            var s_2 = nState$$1.Fields[0][1];
            var i_3 = nState$$1.Fields[0][0];
        }

        regs.innerHTML = registerString;
        errorBox.innerHTML = errorString;
    };

    var compileNextLine = function compileNextLine() {
        clearAllLines$$1(cmEditor);
        var code_1 = saveCodeMirror$$1(cmEditor);
        var nState_1 = newStateSingle(state$$1, code_1);
        var registerString_1 = void 0;

        if (nState_1.Case === "Err") {
            registerString_1 = Html.toString(getRegisterTable(false)(initState));
        } else {
            var s_3 = nState_1.Fields[0][1];
            var i_4 = nState_1.Fields[0][0];
            registerString_1 = Html.toString(getRegisterTable(true)(s_3));
        }

        var errorString_1 = void 0;

        if (nState_1.Case === "Err") {
            errorString_1 = fsFormat("ERROR ON LINE %i\t %s")(function (x) {
                return x;
            })(nState_1.Fields[0])(nState_1.Fields[1]);
        } else {
            var s_4 = nState_1.Fields[0][1];
            var i_5 = nState_1.Fields[0][0];
            errorString_1 = fsFormat("Ran line %i")(function (x) {
                return x;
            })(i_5);
        }

        if (nState_1.Case === "Err") {
            state$$1 = initStateVisual;
        } else {
            var s_5 = nState_1.Fields[0][1];
            var i_6 = nState_1.Fields[0][0];
            state$$1 = s_5;
        }

        if (nState_1.Case === "Err") {
            highlightLine$$1(nState_1.Fields[0], cmEditor, 1);
        } else {
            var s_6 = nState_1.Fields[0][1];
            var i_7 = nState_1.Fields[0][0];
            highlightLine$$1(i_7, cmEditor, 2);
        }

        regs.innerHTML = registerString_1;
        errorBox.innerHTML = errorString_1;
    };

    var resetCompiler = function resetCompiler() {
        clearAllLines$$1(cmEditor);
        state$$1 = initStateVisual;
        errorBox.innerHTML = "";
        regs.innerHTML = Html.toString(getRegisterTable(true)(state$$1));
    };

    var jsonString = getJSON$$1(null);
    var json = ofJson(jsonString, {
        T: Tests
    });
    fsFormat("%A")(function (x) {
        console.log(x);
    })(runTests(json));
    compileAllBtn.addEventListener('click', function (_arg1) {
        compileAll(null);
        return null;
    });
    compileNextLineBtn.addEventListener('click', function (_arg2) {
        compileNextLine(null);
        return null;
    });
    resetBtn.addEventListener('click', function (_arg3) {
        resetCompiler(null);
        return null;
    });
    resetCompiler(null);
    return 0;
})(process.argv.slice(2));

})));

//# sourceMappingURL=main_fable.js.map