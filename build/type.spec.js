"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var type_1 = require('./type');
var A = (function () {
    function A() {
    }
    return A;
}());
var B = (function (_super) {
    __extends(B, _super);
    function B() {
        _super.apply(this, arguments);
    }
    return B;
}(A));
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        _super.apply(this, arguments);
    }
    return C;
}(B));
describe('typeOf', function () {
    it('type of null and undefined', function () {
        expect(type_1.typeOf(null)).toBe(undefined);
        expect(type_1.typeOf(undefined)).toBe(undefined);
    });
    it('type of all basic types are Type', function () {
        expect(type_1.typeOf(type_1.Type)).toBe(type_1.Type);
        expect(type_1.typeOf(Object)).toBe(type_1.Type);
        expect(type_1.typeOf(Boolean)).toBe(type_1.Type);
        expect(type_1.typeOf(Number)).toBe(type_1.Type);
        expect(type_1.typeOf(String)).toBe(type_1.Type);
        expect(type_1.typeOf(RegExp)).toBe(type_1.Type);
    });
    it('type of values', function () {
        expect(type_1.typeOf(6)).toBe(Number);
        expect(type_1.typeOf('Hello world')).toBe(String);
        expect(type_1.typeOf([6, 6])).toBe(Array);
        expect(type_1.typeOf({ value: 6 })).toBe(Object);
    });
    it('type of custom class instance', function () {
        expect(type_1.typeOf(new A())).toBe(A);
        expect(type_1.typeOf(new C())).toBe(C);
    });
});
describe('baseType', function () {
    it('base type of null and undefined', function () {
        expect(function () { return type_1.baseType(undefined); }).toThrow();
        expect(function () { return type_1.baseType(null); }).toThrow();
    });
    it('base type of basic types', function () {
        expect(type_1.baseType(Object)).toBe(undefined);
        expect(type_1.baseType(Boolean)).toBe(Object);
        expect(type_1.baseType(Number)).toBe(Object);
        expect(type_1.baseType(String)).toBe(Object);
        expect(type_1.baseType(Array)).toBe(Object);
    });
    it('base type of custom classses', function () {
        expect(type_1.baseType(A)).toBe(Object);
        expect(type_1.baseType(B)).toBe(A);
        expect(type_1.baseType(C)).toBe(B);
    });
});
describe('derivedType', function () {
    it('check a class derived from other', function () {
        expect(type_1.derivedType(A, Object)).toBe(true);
        expect(type_1.derivedType(Object, A)).toBe(false);
        expect(type_1.derivedType(B, A)).toBe(true);
        expect(type_1.derivedType(A, B)).toBe(false);
        expect(type_1.derivedType(C, B)).toBe(true);
        expect(type_1.derivedType(C, A)).toBe(true);
        expect(type_1.derivedType(C, Object)).toBe(true);
    });
    it('a class not derived from itself ', function () {
        expect(type_1.derivedType(Object, Object)).toBe(false);
        expect(type_1.derivedType(A, A)).toBe(false);
        expect(type_1.derivedType(C, C)).toBe(false);
    });
});
describe('instance of', function () {
    it('all instances are objects', function () {
        expect(type_1.instanceOf(false, Object)).toBe(true);
        expect(type_1.instanceOf(6, Object)).toBe(true);
        expect(type_1.instanceOf("6", Object)).toBe(true);
        expect(type_1.instanceOf([6], Object)).toBe(true);
        expect(type_1.instanceOf({ value: 6 }, Object)).toBe(true);
        expect(type_1.instanceOf(/\w+/, Object)).toBe(true);
    });
    it('intance of constant', function () {
        expect(type_1.instanceOf(false, Boolean)).toBe(true);
        expect(type_1.instanceOf(6, Object)).toBe(true);
        expect(type_1.instanceOf(6, Number)).toBe(true);
        expect(type_1.instanceOf("6", String)).toBe(true);
        expect(type_1.instanceOf("6", Number)).toBe(false);
        expect(type_1.instanceOf([6], Array)).toBe(true);
        expect(type_1.instanceOf([6], Number)).toBe(false);
        expect(type_1.instanceOf({ value: 6 }, Object)).toBe(true);
        expect(type_1.instanceOf(/\w+/, RegExp)).toBe(true);
        expect(type_1.instanceOf(/\w+/, String)).toBe(false);
    });
    it('intance of class', function () {
        expect(type_1.instanceOf(new A(), A)).toBe(true);
        expect(type_1.instanceOf(new A(), Object)).toBe(true);
        expect(type_1.instanceOf(new C(), A)).toBe(true);
    });
    it('undefined instance cheks', function () {
        return expect(function () { return type_1.instanceOf(6, undefined); }).toThrow();
    });
});
//# sourceMappingURL=type.spec.js.map