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
        expect(exp([]).isTuple).toBe(false);
        expect(exp([]).isMapping).toBe(false);
        expect(exp([]).type === Array).toBe(true);
        expect(exp([]).key === exp(Number)).toBe(true);
        expect(exp([]).value === exp('*')).toBe(true);
    });
    it('any array alias', function () {
        expect(exp([]) === exp(['...'])).toBe(true);
        expect(exp([]) === exp(['*', '...'])).toBe(true);
        expect(exp([]) === exp(Array)).toBe(true);
        expect(exp([]) === exp('Array')).toBe(true);
    });
    it('custom array', function () {
        expect(exp([String, '...']).isArray).toBe(true);
        expect(exp([String, '...']).isMapping).toBe(false);
        expect(exp([String, '...']).type === Array).toBe(true);
        expect(exp([String, '...']).key === exp(Number)).toBe(true);
        expect(exp([String, '...']).value === exp('')).toBe(true);
    });
    it('custom array alias', function () {
        expect(exp([String, '...']) === exp(['', '...'])).toBe(true);
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
    it('a tuple', function () {
        var tuple = exp([Number, '*', String]);
        expect(tuple.isTuple).toBe(true);
        expect(tuple.length).toBe(3);
        expect(tuple.value[0] === exp(Number)).toBe(true);
        expect(tuple.value[1] === exp('*')).toBe(true);
        expect(tuple.value[2] === exp(String)).toBe(true);
    });
    it('function prototype', function () {
        var prototype = exp([Number, Number, Number], Date);
        expect(prototype.kind == 'function').toBe(true);
        expect(prototype.type == Function).toBe(true);
        expect(prototype.parameters.length == 3).toBe(true);
        expect(prototype.parameters.value[0] === exp(Number)).toBe(true);
        expect(prototype.result === exp(Date)).toBe(true);
    });
});
describe('Custom type declaration', function () {
    var exp = design_1.Design.exp;
    var MyBaseType = (function () {
        function MyBaseType() {
        }
        Object.defineProperty(MyBaseType, "staticDescriptor", {
            get: function () {
                return {};
            },
            enumerable: true,
            configurable: true
        });
        MyBaseType.staticMethod = function (year, month, day) {
            return new Date();
        };
        Object.defineProperty(MyBaseType.prototype, "dynamicDescriptor", {
            get: function () {
                return { "a value": 6 };
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            design_1.Design.member(Number), 
            __metadata('design:type', Number)
        ], MyBaseType.prototype, "dynamicProperty", void 0);
        __decorate([
            design_1.Design.member({ String: Number }), 
            __metadata('design:type', Object)
        ], MyBaseType.prototype, "dynamicDescriptor", null);
        __decorate([
            design_1.Design.member([String, '...']), 
            __metadata('design:type', Array)
        ], MyBaseType, "staticProperty", void 0);
        __decorate([
            design_1.Design.member({}), 
            __metadata('design:type', Object)
        ], MyBaseType, "staticDescriptor", null);
        __decorate([
            design_1.Design.member([Number, Number, Number], Date), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Number, Number, Number]), 
            __metadata('design:returntype', void 0)
        ], MyBaseType, "staticMethod", null);
        MyBaseType = __decorate([
            design_1.Design.class(), 
            __metadata('design:paramtypes', [])
        ], MyBaseType);
        return MyBaseType;
    }());
    it('members', function () {
        expect(exp(MyBaseType).members.has('staticProperty')).toBe(true);
    });
    it('static member', function () {
        var member = exp(MyBaseType).members.get('staticProperty');
        expect(member.isStatic).toBe(true);
        expect(member.design === exp([String, '...'])).toBe(true);
    });
    it('static descriptor', function () {
        var member = exp(MyBaseType).members.get('staticDescriptor');
        expect(member.isStatic).toBe(true);
        expect(member.design === exp({})).toBe(true);
    });
    it('static method', function () {
        var member = exp(MyBaseType).members.get('staticMethod');
        var prototype = exp([Number, Number, Number], Date);
        expect(member.isStatic).toBe(true);
        expect(member.design === prototype).toBe(true);
    });
    it('dynamic member', function () {
        var member = exp(MyBaseType).members.get('dynamicProperty');
        expect(member.isStatic).toBe(false);
        expect(member.design === exp(Number)).toBe(true);
    });
    it('dynamic descriptor', function () {
        var member = exp(MyBaseType).members.get('dynamicDescriptor');
        expect(member.isStatic).toBe(false);
        expect(member.design === exp({ '': Number })).toBe(true);
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