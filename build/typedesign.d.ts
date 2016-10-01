import './polyfill';
import { Type } from './type';
export declare abstract class Design {
    type: Type;
    protected constructor(type: Type);
    static for<T>(exp: T & Type): TypeDesign<T>;
    static for<E>(exp: [E]): ArrayDesign;
    static for(exp: {}): MappingDesign;
    static for(exp: "Object"): TypeDesign<Object>;
    static for(exp: "Boolean"): TypeDesign<Boolean>;
    static for(exp: "String"): TypeDesign<String>;
    static for(exp: "RegExp"): TypeDesign<RegExp>;
    static for(exp: "Date"): TypeDesign<Date>;
    static for(exp: "Function"): TypeDesign<Function>;
    static class(...arg: any[]): (target: Type) => void;
    static type(type: Type, ...args: any[]): void;
    static member(exp?: any, ...arg: any[]): (target: any, memberName: string, descriptor?: any) => void;
}
export declare class TypeDesign<T> extends Design {
    type: Type;
    base: TypeDesign<any>;
    derived: Map<Type, TypeDesign<any>>;
    arrayDesigns: Map<Design, ArrayDesign>;
    mappingDesigns: Map<Design, MappingDesign>;
    members: {};
    private constructor(type);
    static of<T>(type: Type): TypeDesign<T>;
    static type<T>(type: T & Type): TypeDesign<T>;
    array(element: Design): ArrayDesign;
    mapping(key: Design, value: Design): MappingDesign;
}
export declare const anyDesign: TypeDesign<ObjectConstructor>;
export declare const booleanDesign: TypeDesign<BooleanConstructor>;
export declare const numberDesign: TypeDesign<NumberConstructor>;
export declare const stringDesign: TypeDesign<StringConstructor>;
export declare const regExpDesign: TypeDesign<RegExpConstructor>;
export declare const dateDesign: TypeDesign<DateConstructor>;
export declare const arrayDesign: TypeDesign<ArrayConstructor>;
export declare const functionDesign: TypeDesign<FunctionConstructor>;
export declare class ArrayDesign extends Design {
    array: TypeDesign<any>;
    element: Design;
    constructor(array: TypeDesign<any>, element: Design);
}
export declare class TupleDesign extends Design {
    array: TypeDesign<any>;
    elements: Design[];
    constructor(array: TypeDesign<any>, elements: Design[]);
}
export declare class MappingDesign extends Design {
    mapping: TypeDesign<any>;
    key: Design;
    value: Design;
    constructor(mapping: TypeDesign<any>, key: Design, value: Design);
}
export declare class ClassMember {
    target: TypeDesign<any>;
    name: string;
    constructor(target: TypeDesign<any>, name: string, descriptor: PropertyDescriptor);
}
