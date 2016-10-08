"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var type2_1 = require('./type2');
describe('type basics', function () {
    var _loop_1 = function(nullOrUndefined) {
        it("of " + nullOrUndefined, function () {
            expect(type2_1.typeOf(nullOrUndefined)).toBe(undefined);
            expect(function () { return type2_1.baseTypeOf(nullOrUndefined); }).toThrow();
            expect(function () { return type2_1.isDerivedType(Object, nullOrUndefined); }).toThrow();
            expect(type2_1.isDerivedType(nullOrUndefined, Object)).toBe(false);
            expect(type2_1.isDerivedType(nullOrUndefined, type2_1.Type)).toBe(false);
            expect(type2_1.isInstanceOf(nullOrUndefined, Object)).toBe(false);
            expect(type2_1.isInstanceOf(nullOrUndefined, type2_1.Type)).toBe(false);
        });
    };
    for (var _i = 0, _a = [null, undefined]; _i < _a.length; _i++) {
        var nullOrUndefined = _a[_i];
        _loop_1(nullOrUndefined);
    }
    [
        { type: Boolean, value: true },
        { type: Number, value: 55 },
        { type: String, value: 'Hello world!' },
        { type: Date, value: new Date() },
        { type: Array, value: [] },
        { type: RegExp, value: /\w/ },
    ].map(function (test) {
        it("type of " + test.type, function () {
            expect(type2_1.typeOf(test.type)).toBe(type2_1.Type);
            expect(type2_1.typeOf(test.value)).toBe(test.type);
        });
        it("base type of " + test.type, function () {
            expect(type2_1.baseTypeOf(test.type)).toBe(Object);
        });
        it("is derived type " + test.type, function () {
            expect(type2_1.isDerivedType(test.type, Object)).toBe(true);
            expect(type2_1.isDerivedType(test.type, test.type)).toBe(false);
        });
        it("is instance of " + test.type, function () {
            expect(type2_1.isInstanceOf(test.value, test.type)).toBe(true);
            expect(type2_1.isInstanceOf(test.type, test.type)).toBe(false);
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
    abcType = type2_1.typeOf(cba); // OK
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
//# sourceMappingURL=type2.spec.js.map