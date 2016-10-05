import 'core-js/es6/map';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';

import {Type, typeOf, baseType, derivedType, instanceOf} from './type';

export enum DesignKind {
    Type,
    Array,
};
export abstract class Design {
    private constructor() { }

    readonly type: Type;
    readonly derived?: Map<Type, Design>;

    /*
        base design this design extends.
     */

    readonly base?: Design;
    readonly members?: Map<string, TypeMember>;

    readonly kind: string;

    readonly isArray: boolean;
    readonly isTuple: boolean;
    readonly isMapping: boolean;

    /*
        - is array: number design
        - is mapping: mapping key design
    */
    readonly key?: Design;

    /*
        - is mapping: the value Design of the mapping
        - is array: the value design of the array
        - is property: the design of the property type
        - is method: the design of the return type
        - is tuple: an array of the element design
     */
    readonly value?: Design | Design[];

    readonly length?: Number;

    readonly parameters?: Design;
    readonly result?: Design;

/*
    static get any() {
        return anyDesign;
    }*/

    /*
        Parse a design expression
     */
    static exp(exp, result?): Design {
        if( instanceOf(exp, Type) ) {
            if(exp.name == '') {
                throw new Error('function parsing not implemented');
            }
            else {
                return Design.get(exp);
            }
        }

        // parse direct names
        if( instanceOf(exp, String) ) {
            if( exp == 'Object' || exp == '*')
                return anyDesign;
            if( exp == 'Array')
                return anyArrayDesign;
            if( exp == 'Boolean' )
                return booleanDesign;
            if( exp == 'Number' )
                return numberDesign;
            if( exp == 'String' || exp == '' )
                return stringDesign
            if( exp == 'RegExp' )
                return regexpDesign;
            if( exp == 'Date' )
                return dateDesign;
            if( exp == 'Function' || exp == 'Type')
                return functionDesign;
            throw new Error(`Unknow type design expresion ${exp}`);
        }

        let expType = typeOf(exp);
        // array parsing
        if( instanceOf(exp, Array) ) {

            let typeDesign = Design.get(expType)as AnyArrayDesign;
            if( typeDesign === undefined )
                throw new Error(`Unknow type ${exp.name}`);

            if( exp.length == 0 )
                return typeDesign;

            if( exp[exp.length-1] == '...') { // implicit array
                exp.pop();

                if( exp.length == 0 )
                    return typeDesign;
                if( exp.length == 1)
                    return typeDesign.array( Design.exp(exp[0]) );
                else
                    throw new Error(`arrays can only contains one element`);
            }

            let tuple = typeDesign.tuple( exp.map(Design.exp) );

            return result?
                tuple.returns( Design.exp(result) ):
                tuple;
        }

        // mappings
        if( expType === Object ) {
            let keyNames = Object.getOwnPropertyNames(exp);
            if( keyNames.length == 0 )
                return anyDesign.mapping( stringDesign, anyDesign );
            if( keyNames.length == 1 )
                return anyDesign.mapping( Design.exp(keyNames[0]),
                                          Design.exp(exp[keyNames[0]]) );
            else
                throw new Error(`Mappings must have only one key-value pair`);
        }

        throw new Error(`Unknow type design expresion ${exp}`);
    }

    static get(type:Type) {
        if( type === undefined || type === null)
            throw new Error(`Unknow type ${type.name}`);

        let typeDesign = allTypeDesigns.get(type);
        if( typeDesign === undefined )
            throw new Error(`type not declared ${type.name}`);

        return typeDesign;
    }

    static member(value, result?){
        return (target:any, memberName:string,  descriptor?:any) => {

            let isStatic = instanceOf(target, Type);
            let targetType = isStatic? target: target.constructor;
            let targetDesign = TypeDesign.declare(targetType);

            let reflectedType = Reflect.getMetadata('design:type', target, memberName);
            let reflectedDesign: Design = Design.get(reflectedType);
            let design = Design.exp(value, result);

            if( design.type !== reflectedDesign.type &&
                !derivedType(design.type, reflectedDesign.type))
                throw new Error(`especified type design not match with reflected metadata design`+
                                `in ${targetType.name}.${memberName} member. ` +
                                `design: '${design.type.name}', ` +
                                `reflected '${reflectedDesign.type.name}'`);

            targetDesign.members.set(memberName, {
                name: memberName,
                isStatic,
                design,
            });

        };
    }

    static class() {
        // TODO: constructor design...
        return (type:Type) => {
            let typeDesign = TypeDesign.declare(type);
        };
    }


}


export interface TypeMember {
    isStatic: boolean;
    design: Design;
    name: string;
};
/*
export class MemberInfo {
    constructor(public target: TypeDesign,
                public name: string,
                public isStatic: boolean,
                public value: Design
            ) {
    }

}
*/
export class TypeDesign implements Design {
    readonly kind: string = 'type';
    readonly isArray = false;
    readonly isMapping = false;
    readonly isTuple = false;

    derived = new Map<Type, TypeDesign>();
    members = new Map<string, TypeMember>();

    protected constructor(public type: Type, public base: TypeDesign) {
        this.members = new Map<string, TypeMember>(base? base.members.entries(): []);
        for(;base !== undefined; base = base.base)
            base.derived.set(type, this);
        allTypeDesigns.set(type, this);
    }

    static declare(type:Type) {
        if( type === undefined || type === null)
            throw new Error(`Unknow type ${type.name}`);

        let typeDesign = allTypeDesigns.get(type);
        if( typeDesign !== undefined )
            return typeDesign;

        let typeBase = baseType(type);
        let baseDesign = typeBase? Design.get(typeBase): undefined;

        if( type === Object ) // || Mapping type.
            return new AnyTypeDesign(type, baseDesign);
        else if(type === Array || derivedType(type, Array))
            return new AnyArrayDesign(type, baseDesign);
        else
            return new TypeDesign(type, baseDesign);
    }



    toString() {
        return this.type.name;
    }

    derivedFrom(baseDesign: TypeDesign) {
        return this.type === baseDesign.type ||
                derivedType(this.type, baseDesign.type);
    }

}

export class AnyTypeDesign extends TypeDesign implements Design {
    mappingDesigns = new Map<Design, Map<Design, MappingDesign>>();

    mapping(key:Design, value:Design) {
        let valueMap = this.mappingDesigns.get(key);
        if( valueMap === undefined )
            this.mappingDesigns.set(key,
                valueMap = new Map<Design, MappingDesign>());
        let mappingDesign = valueMap.get(value);
        if( mappingDesign === undefined )
            valueMap.set(value,
                mappingDesign = new MappingDesign(this, key, value));
        return mappingDesign;
    }


}


export class MappingDesign implements Design {
    readonly kind: string = 'mapping';
    readonly isTuple = false;
    readonly isArray = false;
    readonly isMapping = true;

    constructor(public typeDesign: AnyTypeDesign,
                public key:Design,
                public value:Design) {
    }

    get type() {
        return this.typeDesign.type;
    }

    toString() {
        return `{${this.key.toString()}: ${this.value.toString()}}`;
    }


}

export class AnyArrayDesign extends TypeDesign implements Design {
    readonly kind: string = 'array';
    readonly isArray = true;
    readonly isTuple = false;
    get key() {
        return numberDesign;
    }
    get value() {
        return anyDesign;
    }

    variadicDesigns = new Map<Design, VariadicDesign>();
    tupleDesigns = new Map<Design, TupleDesign>();

    array(value: Design): Design {
        if( value === anyDesign )
            return this;

        let arrayDesign = this.variadicDesigns.get(value);
        if( arrayDesign === undefined )
            this.variadicDesigns.set(value,
                arrayDesign = new VariadicDesign(this, value));

        return arrayDesign;
    }

    tuple(values: Design[]) {
        let currentMap = this.tupleDesigns;
        let design: TupleDesign = zeroLengthTuple;
        let level = 1;
        for(let value of values) {
            let nextDesign = currentMap.get(value)
            if( nextDesign === undefined )
                currentMap.set(value,
                    nextDesign = new TupleDesign(this, values.slice(0, level)));

            currentMap = nextDesign.tupleDesigns;
            design = nextDesign;
            level += 1;
        }

        return design;
    }

}

export class VariadicDesign implements Design {
    readonly kind: string = 'array';
    readonly isMapping = false;
    readonly isArray= true;
    readonly isTuple = false;
    constructor(public typeDesign: AnyArrayDesign,
                public value:Design) {
    }
    get type(){
        return this.typeDesign.type;
    }

    get key() {
        return numberDesign;
    }
    toString() {
        return `[${this.value.toString()}, '...']`;
    }

}

export class TupleDesign implements Design {
    readonly kind: string = 'tuple';
    readonly isMapping = false;
    readonly isArray = true;
    readonly isTuple = true;

    tupleDesigns = new Map<Design, TupleDesign>();
    functionDesigns = new Map<Design, FunctionDesign>();

    constructor(public typeDesign: AnyArrayDesign,
                public value:Design[]) {
    }
    get type(){
        return this.typeDesign.type;
    }
    get key() {
        return numberDesign;
    }
    get length() {
        return this.value.length;
    }


    toString() {
        return `[${this.value.toString()}, '...']`;
    }


    returns(result:Design) {
        let functionDesign = this.functionDesigns.get(result);
        if( functionDesign === undefined )
            this.functionDesigns.set( result,
                functionDesign = new FunctionDesign(this, result));
        return functionDesign;
    }

}

export class FunctionDesign implements Design {
    readonly kind = 'function';
    readonly isMapping = false;
    readonly isArray = true;
    readonly isTuple = true;
    readonly isFunction = true;

    constructor(public parameters: TupleDesign,
                public result: Design){
    }

    get type() {
        return Function;
    }
};



const allTypeDesigns = new Map<Type, TypeDesign>();

const anyDesign = TypeDesign.declare(Object) as AnyTypeDesign;
const anyArrayDesign = TypeDesign.declare(Array) as AnyArrayDesign;
const zeroLengthTuple = new TupleDesign(anyArrayDesign, []);

const booleanDesign = TypeDesign.declare(Boolean);
const numberDesign = TypeDesign.declare(Number);
const stringDesign = TypeDesign.declare(String);
const regexpDesign = TypeDesign.declare(RegExp);
const dateDesign = TypeDesign.declare(Date);
const functionDesign = TypeDesign.declare(Function);
