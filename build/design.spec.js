"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var design_1 = require('./design');
describe('design expressions', function () {
    // for clear code
    var exp = design_1.Design.exp;
    it('describe the objects that are reflecting', function () {
        expect(exp(Number).type === Number).toBe(true);
        expect(exp(Number).isArray).toBe(false);
        expect(exp(Number).isMapping).toBe(false);
    });
    it('have unique instances for each one', function () {
        expect(exp(Number) === exp(Number)).toBe(true);
        expect(exp(String) === exp(String)).toBe(true);
        expect(exp(Number) != exp(Object)).toBe(true);
    });
    it('accepts basic type names as string', function () {
        expect(exp('Date') === exp(Date)).toBe(true);
        expect(exp('RegExp') === exp(RegExp)).toBe(true);
    });
    it('some wildcards', function () {
        expect(exp('*') === exp(Object)).toBe(true);
        expect(exp('') === exp(String)).toBe(true);
    });
    it('any array', function () {
        expect(exp([]).isArray).toBe(true);
        expect(exp([]).isMapping).toBe(false);
        expect(exp([]).type === Array).toBe(true);
        expect(exp([]).key === exp(Number)).toBe(true);
        expect(exp([]).value === exp('*')).toBe(true);
    });
    it('any array alias', function () {
        expect(exp([]) === exp(['*'])).toBe(true);
        expect(exp([]) === exp(Array)).toBe(true);
        expect(exp([]) === exp('Array')).toBe(true);
    });
    it('custom array', function () {
        expect(exp([String]).isArray).toBe(true);
        expect(exp([String]).isMapping).toBe(false);
        expect(exp([String]).type === Array).toBe(true);
        expect(exp([String]).key === exp(Number)).toBe(true);
        expect(exp([String]).value === exp('')).toBe(true);
    });
    it('a tuple', function () {
        expect(exp([Number, Number]).isTuple).toBe(true);
    });
    it('custom array alias', function () {
        expect(exp([String]) === exp([''])).toBe(true);
        expect(exp([String]) === exp(['String'])).toBe(true);
    });
    it('any mapping', function () {
        expect(exp({}).isArray).toBe(false);
        expect(exp({}).isMapping).toBe(true);
        expect(exp({}).type === Object).toBe(true);
        expect(exp({}).key === exp(String)).toBe(true);
        expect(exp({}).value === exp('*')).toBe(true);
    });
    it('any mapping alias', function () {
        expect(exp({}) === exp({ String: Object })).toBe(true);
        expect(exp({}) === exp({ String: '*' })).toBe(true);
        expect(exp({}) === exp({ '': '*' })).toBe(true);
    });
    it('custom mapping', function () {
        expect(exp({ Date: '*' }).isArray).toBe(false);
        expect(exp({ Date: '*' }).isMapping).toBe(true);
        expect(exp({ Date: '*' }).type === Object).toBe(true);
        expect(exp({ Date: '*' }).key === exp(Date)).toBe(true);
        expect(exp({ Date: '*' }).value === exp(Object)).toBe(true);
    });
    it('custom mapping alias', function () {
        expect(exp({ Date: '*' }) === exp({ Date: Object })).toBe(true);
        expect(exp({ Date: '*' }) === exp({ 'Date': 'Object' })).toBe(true);
    });
    // TODO: nesting
});
describe('Custom type declaration', function () {
    var exp = design_1.Design.exp;
    var MyBaseType = (function () {
        function MyBaseType() {
        }
        MyBaseType.staticProperty = 'static';
        __decorate([
            design_1.Design.member(), 
            __metadata('design:type', String)
        ], MyBaseType, "staticProperty", void 0);
        MyBaseType = __decorate([
            design_1.Design.class(), 
            __metadata('design:paramtypes', [])
        ], MyBaseType);
        return MyBaseType;
    }());
    it('members', function () {
        expect('staticProperty' in exp(MyBaseType).members).toBe(true);
    });
    it('static property', function () {
        var staticProperty = exp(MyBaseType).members['staticProperty'];
        expect(staticProperty.value === exp(String)).toBe(true);
        expect(staticProperty.value === exp(String)).toBe(true);
    });
    /*
        it('inheritance chain', ()=> {
            expect( myBaseDesign.type.name ).toBe( 'MyBaseType' );
            expect( myDerivedDesign.base ).toBe( myBaseDesign );
        });
    
        @Design.class()
        class MyDerivedType extends MyBaseType {
            @Design.member(String)
            get description() {
                return "dynamic description";
            }
        }
    
        let myBaseDesign = exp(MyBaseType);
        let myDerivedDesign = exp(MyDerivedType);
    
        it('inheritance chain', ()=> {
            expect( myBaseDesign.type.name ).toBe( 'MyBaseType' );
            expect( myDerivedDesign.base ).toBe( myBaseDesign );
        });
    
        let titleMember = myDerivedDesign.members['title'];
        let derivedDescription = myDerivedDesign.members['description'];
    
        it('inheritance member chain', ()=> {
            expect( 'title' in myDerivedDesign.members ).toBe( true );
    
            expect( myDerivedDesign.members['description'].value )
                .toBe( exp(String) );
            //expect( 'title' in myDesign.members ).toBe( true );
    
            //let myTypeTitleMember = myDesign.members['title'];
    
            //expect( myTypeTitleMember.isStatic ).toBe( false );
        });
    */
});
//# sourceMappingURL=design.spec.js.map