import { Type, typeOf, baseTypeOf, isDerivedType, isInstanceOf } from './type';

describe('type basics', () => {
    for(let nullOrUndefined of [null, undefined])
        it(`of ${nullOrUndefined}`, () => {
            expect( typeOf(nullOrUndefined) ).toBe( undefined );
            expect( () => baseTypeOf(nullOrUndefined) ).toThrow( );
            expect( () => isDerivedType(Object, nullOrUndefined) ).toThrow( );
            expect( isDerivedType(nullOrUndefined, Object) ).toBe(false);
            expect( isDerivedType(nullOrUndefined, Type) ).toBe(false);
            expect( isInstanceOf(nullOrUndefined, Object) ).toBe(false);
            expect( isInstanceOf(nullOrUndefined, Type) ).toBe(false);
        });

    [
        { type: Boolean, valueOfType: true },
        { type: Number, valueOfType: 55 },
        { type: String, valueOfType: 'Hello world!' },
        { type: Date, valueOfType: new Date() },
        { type: Array, valueOfType: [] },
        { type: RegExp, valueOfType: /\w/ },
        { type: Object, valueOfType: {} },
        { type: Function, valueOfType: () => void 0 },
    ].map( (any:any)=> {
        it(`type of ${any.type.name}`, () => {
            expect( typeOf(any.type) ).toBe( Type );
            expect( typeOf(any.valueOfType) ).toBe( any.type );
        });
        it(`base type of ${any.type.name}`, () => {
            if( any.type !== Object )
                expect( baseTypeOf(any.type) ).toBe( Object );
            else
                expect( baseTypeOf(Object) ).toBe( undefined );
        });
        it(`is derived type ${any.type.name}`, () => {
            if( any.type !== Object )
                expect( isDerivedType(any.type, Object) ).toBe( true );
            expect( isDerivedType(any.type, any.type) ).toBe( false );
        });
        it(`is instance of ${any.type.name}`, () => {
            expect( isInstanceOf(any.valueOfType, any.type) ).toBe( true );

            if( any.type !== Object && any.type !== Function )
                expect( isInstanceOf(any.type, any.type) ).toBe( false );
            else
                expect( isInstanceOf(any.type, any.type) ).toBe( true );
        });
    });
});


describe('type tools', () => {

    class Z {}

    class A {
        a: string;
    }
    class AB extends A {
        b: string;
        static ab() {
            return 'ab';
        };
    }
    class ABC extends AB {
        c: string;
    }

    class CBA {
        c:string;
        b:string;
        a:string;
    }

    let z = new Z();
    let a = new A();
    let ab = new AB();
    let abc = new ABC();
    let cba = new CBA();

    // compilation checks
    let abcType: Type<ABC>;
    abcType = typeOf(cba); // OK
//  abcType = typeOf(ab); // ERR
/*
    let X:any = ABC;

    if( isDerivedType(X, AB) ) {
        X.ab();
    }
*/
    it('typeof basics', () => {

    });

});
