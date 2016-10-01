import {Type, typeOf, instanceOf, baseType, derivedType} from './type';

class A {}
class B extends A {}
class C extends B {}


describe('typeOf', () => {
    it('type of null and undefined', ()=>{
        expect( typeOf(null) ).toBe(undefined);
        expect( typeOf(undefined) ).toBe(undefined);
    });
    it('type of all basic types are Type', ()=>{
        expect( typeOf(Type) ).toBe(Type);
        expect( typeOf(Object) ).toBe(Type);
        expect( typeOf(Boolean) ).toBe(Type);
        expect( typeOf(Number) ).toBe(Type);
        expect( typeOf(String) ).toBe(Type);
        expect( typeOf(RegExp) ).toBe(Type);
    });
    it('type of values', ()=> {
        expect( typeOf(6) ).toBe(Number);
        expect( typeOf('Hello world') ).toBe(String);
        expect( typeOf([6,6]) ).toBe(Array);
        expect( typeOf({value:6}) ).toBe(Object);

    });
    it('type of custom class instance', ()=>{
        expect( typeOf( new A() ) ).toBe(A);
        expect( typeOf( new C() ) ).toBe(C);
    });
});

describe('baseType', () => {
    it('base type of null and undefined', () =>{
        expect( () => baseType(undefined) ).toThrow();
        expect( () => baseType(null) ).toThrow();
    });
    it('base type of basic types', () =>{
        expect( baseType(Object) ).toBe(undefined);
        expect( baseType(Boolean) ).toBe(Object);
        expect( baseType(Number) ).toBe(Object)
        expect( baseType(String) ).toBe(Object)
        expect( baseType(Array) ).toBe(Object)
    });
    it('base type of custom classses', () => {
        expect( baseType(A) ).toBe(Object);
        expect( baseType(B) ).toBe(A);
        expect( baseType(C) ).toBe(B);
    });
});


describe('derivedType', () => {
    it('check a class derived from other', () => {
        expect( derivedType(A, Object) ).toBe(true);
        expect( derivedType(Object, A) ).toBe(false);
        expect( derivedType(B, A) ).toBe(true);
        expect( derivedType(A, B) ).toBe(false);
        expect( derivedType(C, B) ).toBe(true);
        expect( derivedType(C, A) ).toBe(true);
        expect( derivedType(C, Object) ).toBe(true);
    });

    it('a class not derived from itself ', () => {
        expect( derivedType(Object, Object) ).toBe(false);
        expect( derivedType(A, A) ).toBe(false);
        expect( derivedType(C, C) ).toBe(false);
    });

});


describe('instance of', () => {
    it('all instances are objects', ()=> {
        expect( instanceOf(false, Object) ).toBe(true);
        expect( instanceOf(6, Object) ).toBe(true);
        expect( instanceOf("6", Object) ).toBe(true);
        expect( instanceOf([6], Object) ).toBe(true);
        expect( instanceOf({value: 6}, Object) ).toBe(true);
        expect( instanceOf(/\w+/, Object) ).toBe(true);
    });

    it('intance of constant', ()=> {
        expect( instanceOf(false, Boolean) ).toBe(true);
        expect( instanceOf(6, Object) ).toBe(true);
        expect( instanceOf(6, Number) ).toBe(true);
        expect( instanceOf("6", String) ).toBe(true);
        expect( instanceOf("6", Number) ).toBe(false);
        expect( instanceOf([6], Array) ).toBe(true);
        expect( instanceOf([6], Number) ).toBe(false);
        expect( instanceOf({value: 6}, Object) ).toBe(true);
        expect( instanceOf(/\w+/, RegExp) ).toBe(true);
        expect( instanceOf(/\w+/, String) ).toBe(false);
    });

    it('intance of class', ()=> {
        expect( instanceOf(new A(), A) ).toBe(true);
        expect( instanceOf(new A(), Object) ).toBe(true);
        expect( instanceOf(new C(), A) ).toBe(true);
    });

    it('undefined instance cheks', ()=>
        expect( () => instanceOf(6, undefined) ).toThrow()
    );
});
