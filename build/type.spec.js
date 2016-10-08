"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var type_1 = require('./type');
describe('type basics', function () {
    var _loop_1 = function(nullOrUndefined) {
        it("of " + nullOrUndefined, function () {
            expect(type_1.typeOf(nullOrUndefined)).toBe(undefined);
            expect(function () { return type_1.baseTypeOf(nullOrUndefined); }).toThrow();
            expect(function () { return type_1.isDerivedType(Object, nullOrUndefined); }).toThrow();
            expect(type_1.isDerivedType(nullOrUndefined, Object)).toBe(false);
            expect(type_1.isDerivedType(nullOrUndefined, type_1.Type)).toBe(false);
            expect(type_1.isInstanceOf(nullOrUndefined, Object)).toBe(false);
            expect(type_1.isInstanceOf(nullOrUndefined, type_1.Type)).toBe(false);
        });
    };
    for (var _i = 0, _a = [null, undefined]; _i < _a.length; _i++) {
        var nullOrUndefined = _a[_i];
        _loop_1(nullOrUndefined);
    }
    [
        { type: Boolean, valueOfType: true },
        { type: Number, valueOfType: 55 },
        { type: String, valueOfType: 'Hello world!' },
        { type: Date, valueOfType: new Date() },
        { type: Array, valueOfType: [] },
        { type: RegExp, valueOfType: /\w/ },
        { type: Object, valueOfType: {} },
        { type: Function, valueOfType: function () { return void 0; } },
    ].map(function (any) {
        it("type of " + any.type.name, function () {
            expect(type_1.typeOf(any.type)).toBe(type_1.Type);
            expect(type_1.typeOf(any.valueOfType)).toBe(any.type);
        });
        it("base type of " + any.type.name, function () {
            if (any.type !== Object)
                expect(type_1.baseTypeOf(any.type)).toBe(Object);
            else
                expect(type_1.baseTypeOf(Object)).toBe(undefined);
        });
        it("is derived type " + any.type.name, function () {
            if (any.type !== Object)
                expect(type_1.isDerivedType(any.type, Object)).toBe(true);
            expect(type_1.isDerivedType(any.type, any.type)).toBe(false);
        });
        it("is instance of " + any.type.name, function () {
            expect(type_1.isInstanceOf(any.valueOfType, any.type)).toBe(true);
            if (any.type !== Object && any.type !== Function)
                expect(type_1.isInstanceOf(any.type, any.type)).toBe(false);
            else
                expect(type_1.isInstanceOf(any.type, any.type)).toBe(true);
        });
    });
});
describe('type tools', function () {
    var Z = (function () {
        function Z() {
        }
        return Z;
    }());
    var A = (function () {
        function A() {
        }
        return A;
    }());
    var AB = (function (_super) {
        __extends(AB, _super);
        function AB() {
            _super.apply(this, arguments);
        }
        AB.ab = function () {
            return 'ab';
        };
        ;
        return AB;
    }(A));
    var ABC = (function (_super) {
        __extends(ABC, _super);
        function ABC() {
            _super.apply(this, arguments);
        }
        return ABC;
    }(AB));
    var CBA = (function () {
        function CBA() {
        }
        return CBA;
    }());
    var z = new Z();
    var a = new A();
    var ab = new AB();
    var abc = new ABC();
    var cba = new CBA();
    // compilation checks
    var abcType;
    abcType = type_1.typeOf(cba); // OK
    //  abcType = typeOf(ab); // ERR
    /*
        let X:any = ABC;
    
        if( isDerivedType(X, AB) ) {
            X.ab();
        }
    */
    it('typeof basics', function () {
    });
});
//# sourceMappingURL=type.spec.js.map