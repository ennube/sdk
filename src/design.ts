import './polyfill';
import {Type, typeOf, baseType, derivedType, instanceOf} from './type';


export abstract class Design {
    private constructor(){}


    readonly type: Type;
    readonly derived?: Map<Type, Design>;

    /*
        base design this design extends.
     */

    readonly base?: Design;
    readonly members?: {
        [memberName:string]: MemberInfo
    };


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



/*
    static get any() {
        return anyDesign;
    }*/

    /*
        Parse a design expression
     */
    static exp(exp): Design {
        if( instanceOf(exp, Type) ) {
            if(exp.name == '') {
                throw new Error('function parsing not implemented');
            }
            else {
                return TypeDesign.get(exp);
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

            let typeDesign = TypeDesign.get(expType)as AnyArrayDesign;
            if( typeDesign === undefined )
                throw new Error(`Unknow type ${exp.name}`);

            if( exp.length == 0 )
                return typeDesign;
            if( exp.length == 1)
                return typeDesign.array( Design.exp(exp[0]) );
            else
                return typeDesign.tuple( ...exp.map(Design.exp) )
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


    static member(value?: any, ...params: any[]){
        return (target:any, memberName:string,  descriptor?:any) => {

            let isStatic = instanceOf(target, Type);
            let targetType = isStatic? target: target.constructor;
            let targetDesign = TypeDesign.declare(targetType);
            let reflectedType = Reflect.getMetadata('design:type', target, memberName);

            console.log(`decl member ${targetType.name}.${memberName}`, isStatic? 'static': 'dynamic');
            console.log(` reflected type ${reflectedType.name}`);

            let valueDesign: Design = TypeDesign.get(reflectedType);
            if(value !== undefined) {
                let exprDesign = Design.exp(value);

                // must be type compatible with reflected
                if( exprDesign.type !== valueDesign.type &&
                    !derivedType(exprDesign.type, valueDesign.type))
                    throw new Error(`especified type design not match with reflected metadata design`+
                                    `in ${targetType.name}.${memberName} member: `+
                                    `user design ${exprDesign.type}, reflected design ${valueDesign.type}`);

                valueDesign = exprDesign;
            }

            targetDesign.members[memberName] = new MemberInfo(
                    targetDesign,
                    memberName,
                    isStatic,
                    valueDesign,
            );

        };
    }

    static class() {
        return (type:Type) => {
            let typeDesign = TypeDesign.declare(type);
            console.log(`decl type ${type.name}`);
        };
    }


}


export class TypeDesign implements Design {

    isArray = false;
    isMapping = false;
    isTuple = false;

    derived = new Map<Type, TypeDesign>();
    members: {
        [memberName:string]: MemberInfo
    };

    // parameters: TupleDesign;

    protected constructor(public type: Type, public base: TypeDesign) {
        this.members = base?
            Object.create(base.members):
            {};
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
        let baseDesign = typeBase? TypeDesign.get(typeBase): undefined;

        if( type === Object ) // || Mapping type.
            return new AnyTypeDesign(type, baseDesign);
        else if(type === Array || derivedType(type, Array))
            return new AnyArrayDesign(type, baseDesign);
        else
            return new TypeDesign(type, baseDesign);
    }

    static get(type:Type) {
        if( type === undefined || type === null)
            throw new Error(`Unknow type ${type.name}`);

        let typeDesign = allTypeDesigns.get(type);
        if( typeDesign === undefined )
            throw new Error(`type not declared ${type.name}`);

        return typeDesign;
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
    isTuple = false;
    isArray = false;
    isMapping = true;

    constructor(public typeDesign: AnyTypeDesign,
                public key:Design,
                public value:Design) {
    }

    get type(){
        return this.typeDesign.type;
    }

}

export class AnyArrayDesign extends TypeDesign implements Design {

    isArray = true;
    isTuple = false;
    get key() {
        return numberDesign;
    }
    get value() {
        return anyDesign;
    }

    arrayDesigns = new Map<Design, ArrayDesign>();
    tupleDesigns = new Map<Design, TupleDesign>();

    array(value: Design): Design {
        if( value === anyDesign )
            return this;

        let arrayDesign = this.arrayDesigns.get(value);
        if( arrayDesign === undefined )
            this.arrayDesigns.set(value,
                arrayDesign = new ArrayDesign(this, value));

        return arrayDesign;
    }

    tuple(...values: Design[]) {
        if( values.length < 1 )
            throw new Error(`zero length tuples not supported`);

        let currentMap = this.tupleDesigns;
        let design:Design = this;

        let level = 0;
        for(let value of values) {
            let nextDesign = currentMap.get(value)
            if( nextDesign === undefined )
                currentMap.set(value,
                    nextDesign = new TupleDesign(this, values.slice(0, level)));
            design = nextDesign;
            level += 1;
        }
        return design;
    }

}

export class ArrayDesign implements Design {
    isMapping = false;
    isArray= true;
    isTuple = false;
    constructor(public typeDesign: AnyArrayDesign,
                public value:Design) {
    }
    get type(){
        return this.typeDesign.type;
    }

    get key() {
        return numberDesign;
    }

}

export class TupleDesign implements Design {
    isMapping = false;
    isArray = true;
    isTuple = true;

    tupleDesigns = new Map<Type, TupleDesign>();
    constructor(public typeDesign: AnyArrayDesign,
                public value:Design[]) {
    }
    get type(){
        return this.typeDesign.type;
    }
    get key() {
        return numberDesign;
    }


}



/*
    Member delega sobre su value, sirve como un proxy del tipo
    que representa, puede ser una funcion o un dato.

*/

// Talvez member no deba implementar un diseño
//  es informacion pura acerca de un
export class MemberInfo {
    constructor(public target: TypeDesign,
                public name:string,
                public isStatic: boolean,
                public value: Design
            ) {
    }

}

/*
// ...method delega sobre un FunctionDesign...
export class MethodDesign extends MemberInfo implements Design {
    constructor(public target: TypeDesign,
                public name:string,
                public isStatic: boolean,
                public value: Design
            ) {
            super(target, name, isStatic);
    }

    // property delega sobre su diseño
    get type() {
        return this.value.type;
    }
    get isArray() {
        return this.value.isArray;
    }
    get isMapping() {
        return this.value.isMapping;
    }
}

*/

const allTypeDesigns = new Map<Type, TypeDesign>();

const anyDesign = TypeDesign.declare(Object) as AnyTypeDesign;
const anyArrayDesign = TypeDesign.declare(Array) as AnyArrayDesign;

const booleanDesign = TypeDesign.declare(Boolean);
const numberDesign = TypeDesign.declare(Number);
const stringDesign = TypeDesign.declare(String);
const regexpDesign = TypeDesign.declare(RegExp);
const dateDesign = TypeDesign.declare(Date);
const functionDesign = TypeDesign.declare(Function);
