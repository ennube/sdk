import {typeOf} from './type';
import {Design} from './design';

describe('design expressions', () => {
    // for clear code
    const exp = Design.exp;

    it('describe the objects that are reflecting', ()=> {
        expect( exp( Number ).type === Number                   ).toBe( true );
        expect( exp( Number ).isArray                           ).toBe( false );
        expect( exp( Number ).isMapping                         ).toBe( false );
    });
    it('have unique instances for each one', ()=> {
        expect( exp( Number ) === exp( Number )                 ).toBe( true );
        expect( exp( String ) === exp( String )                 ).toBe( true );
        expect( exp( Number ) != exp( Object )                  ).toBe( true );
    });
    it('accepts basic type names as string', ()=> {
        expect( exp( 'Date' ) === exp( Date )                   ).toBe( true );
        expect( exp( 'RegExp' ) === exp( RegExp )               ).toBe( true );
    });
    it('some wildcards', ()=> {
        expect( exp( '*' ) === exp( Object )                    ).toBe( true );
        expect( exp( '' ) === exp( String )                     ).toBe( true );
    });
    it('any array', ()=> {
        expect( exp( [] ).isArray                               ).toBe( true );
        expect( exp( [] ).isTuple                               ).toBe( false );
        expect( exp( [] ).isMapping                             ).toBe( false );
        expect( exp( [] ).type === Array                        ).toBe( true );
        expect( exp( [] ).key === exp( Number )                 ).toBe( true );
        expect( exp( [] ).value === exp( '*' )                  ).toBe( true );
    });
    it('any array alias', ()=> {
        expect( exp( [] ) === exp( ['...'] )                    ).toBe( true );
        expect( exp( [] ) === exp( ['*', '...'] )               ).toBe( true );
        expect( exp( [] ) === exp( Array )                      ).toBe( true );
        expect( exp( [] ) === exp( 'Array' )                    ).toBe( true );
    });
    it('custom array', ()=> {
        expect( exp( [String, '...'] ).isArray                  ).toBe( true );
        expect( exp( [String, '...'] ).isMapping                ).toBe( false );
        expect( exp( [String, '...'] ).type === Array           ).toBe( true );
        expect( exp( [String, '...'] ).key === exp( Number )    ).toBe( true );
        expect( exp( [String, '...'] ).value === exp( '' )      ).toBe( true );
    });
    it('custom array alias', ()=> {
        expect( exp( [String, '...'] ) === exp( ['', '...'] )   ).toBe( true );
    });
    it('any mapping', ()=> {
        expect( exp( {} ).isArray                               ).toBe( false );
        expect( exp( {} ).isMapping                             ).toBe( true );
        expect( exp( {} ).type === Object                       ).toBe( true );
        expect( exp( {} ).key === exp( String )                 ).toBe( true );
        expect( exp( {} ).value === exp( '*' )                  ).toBe( true );
    });
    it('any mapping alias', ()=> {
        expect( exp( {} ) === exp( {String:Object} )            ).toBe( true );
        expect( exp( {} ) === exp( {String:'*'} )               ).toBe( true );
        expect( exp( {} ) === exp( {'':'*'} )                   ).toBe( true );
    });
    it('custom mapping', ()=> {
        expect( exp( {Date:'*'} ).isArray                       ).toBe( false );
        expect( exp( {Date:'*'} ).isMapping                     ).toBe( true );
        expect( exp( {Date:'*'} ).type === Object               ).toBe( true );
        expect( exp( {Date:'*'} ).key === exp( Date )           ).toBe( true );
        expect( exp( {Date:'*'} ).value === exp( Object )       ).toBe( true );
    });
    it('custom mapping alias', ()=> {
        expect( exp( {Date:'*'} ) === exp( {Date:Object} )      ).toBe( true );
        expect( exp( {Date:'*'} ) === exp( {'Date':'Object'} )  ).toBe( true );
    });
    // TODO: nesting
    it('a tuple', ()=> {
        let tuple = exp( [Number, '*', String] );

        expect( tuple.isTuple                                   ).toBe( true );
        expect( tuple.length                                    ).toBe( 3 );
        expect( tuple.value[0] === exp( Number )                ).toBe( true );
        expect( tuple.value[1] === exp( '*' )                   ).toBe( true );
        expect( tuple.value[2] === exp( String )                ).toBe( true );
    });

    it('function prototype', ()=> {
        let prototype = exp( [Number, Number, Number], Date );

        expect( prototype.kind == 'function'                    ).toBe( true );
        expect( prototype.type == Function                      ).toBe( true );
        expect( prototype.parameters.length == 3                ).toBe( true );
        expect( prototype.parameters.value[0] === exp( Number ) ).toBe( true );
        expect( prototype.result === exp( Date )                ).toBe( true );
    });

});



describe('Custom type declaration', () => {
    const exp = Design.exp;

    @Design.class()
    class MyBaseType {

        @Design.member( [String, '...'] )
        static staticProperty: string[];

        @Design.member( {} )
        static get staticDescriptor() {
            return {};
        }

        @Design.member( [Number, Number, Number], Date )
        static staticMethod(year:number, month:number, day:number) {
            return new Date();
        }

        @Design.member( Number )
        dynamicProperty: number;

        @Design.member( {String:Number} )
        get dynamicDescriptor() {
            return {"a value": 6};
        }
/*
        @Design.member( [], void 0 )
        dynamicMethod(): void {
            return
        }
*/
    }

    it('members', () => {
        expect( exp( MyBaseType ).members.has('staticProperty') ).toBe( true );
    });
    it('static member', ()=> {
        let member = exp( MyBaseType ).members.get('staticProperty');

        expect( member.isStatic                                 ).toBe( true );
        expect( member.design === exp( [String, '...'] )        ).toBe( true );
    });
    it('static descriptor', ()=> {
        let member = exp( MyBaseType ).members.get('staticDescriptor');

        expect( member.isStatic                                 ).toBe( true );
        expect( member.design === exp( {} )                     ).toBe( true );
    });
    it('static method', ()=> {
        let member = exp( MyBaseType ).members.get('staticMethod');
        let prototype = exp( [Number, Number, Number], Date );

        expect( member.isStatic                                 ).toBe( true );
        expect( member.design === prototype                     ).toBe( true );
    });
    it('dynamic member', ()=> {
        let member = exp( MyBaseType ).members.get('dynamicProperty');

        expect( member.isStatic                                 ).toBe( false );
        expect( member.design === exp( Number )                 ).toBe( true );
    });
    it('dynamic descriptor', ()=> {
        let member = exp( MyBaseType ).members.get('dynamicDescriptor');

        expect( member.isStatic                                 ).toBe( false );
        expect( member.design === exp( {'':Number} )            ).toBe( true );
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
