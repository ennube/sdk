import './polyfill';
import { Type } from './type';
export declare abstract class Design {
    private constructor();
    readonly name?: string;
    readonly type: Type;
    readonly derived?: Map<Type, Design>;
    readonly base?: Design;
    readonly members?: {
        [memberName: string]: MemberInfo;
    };
    readonly kind: string;
    readonly isArray: boolean;
    readonly isTuple: boolean;
    readonly isMapping: boolean;
    readonly key?: Design;
    readonly value?: Design | Design[];
    readonly length?: Number;
    readonly parameters?: Design;
    readonly result?: Design;
    static exp(exp: any, result?: any): Design;
    static member(value: any, result?: any): (target: any, memberName: string, descriptor?: any) => void;
    static class(): (type: Type) => void;
}
export declare class MemberInfo {
    target: TypeDesign;
    name: string;
    isStatic: boolean;
    value: Design;
    constructor(target: TypeDesign, name: string, isStatic: boolean, value: Design);
}
export declare class TypeDesign implements Design {
    type: Type;
    base: TypeDesign;
    readonly kind: string;
    readonly isArray: boolean;
    readonly isMapping: boolean;
    readonly isTuple: boolean;
    derived: Map<Type, TypeDesign>;
    members: {
        [memberName: string]: MemberInfo;
    };
    protected constructor(type: Type, base: TypeDesign);
    static declare(type: Type): TypeDesign;
    static get(type: Type): TypeDesign;
    toString(): string;
    derivedFrom(baseDesign: TypeDesign): boolean;
}
export declare class AnyTypeDesign extends TypeDesign implements Design {
    mappingDesigns: Map<Design, Map<Design, MappingDesign>>;
    mapping(key: Design, value: Design): MappingDesign;
}
export declare class MappingDesign implements Design {
    typeDesign: AnyTypeDesign;
    key: Design;
    value: Design;
    readonly kind: string;
    readonly isTuple: boolean;
    readonly isArray: boolean;
    readonly isMapping: boolean;
    constructor(typeDesign: AnyTypeDesign, key: Design, value: Design);
    readonly type: Type;
    toString(): string;
}
export declare class AnyArrayDesign extends TypeDesign implements Design {
    readonly kind: string;
    readonly isArray: boolean;
    readonly isTuple: boolean;
    readonly key: TypeDesign;
    readonly value: AnyTypeDesign;
    variadicDesigns: Map<Design, VariadicDesign>;
    tupleDesigns: Map<Design, TupleDesign>;
    array(value: Design): Design;
    tuple(values: Design[]): TupleDesign;
}
export declare class VariadicDesign implements Design {
    typeDesign: AnyArrayDesign;
    value: Design;
    readonly kind: string;
    readonly isMapping: boolean;
    readonly isArray: boolean;
    readonly isTuple: boolean;
    constructor(typeDesign: AnyArrayDesign, value: Design);
    readonly type: Type;
    readonly key: TypeDesign;
    toString(): string;
}
export declare class TupleDesign implements Design {
    typeDesign: AnyArrayDesign;
    value: Design[];
    readonly kind: string;
    readonly isMapping: boolean;
    readonly isArray: boolean;
    readonly isTuple: boolean;
    tupleDesigns: Map<Design, TupleDesign>;
    functionDesigns: Map<Design, FunctionDesign>;
    constructor(typeDesign: AnyArrayDesign, value: Design[]);
    readonly type: Type;
    readonly key: TypeDesign;
    readonly length: number;
    toString(): string;
    returns(result: Design): FunctionDesign;
}
export declare class FunctionDesign implements Design {
    parameters: TupleDesign;
    result: Design;
    readonly kind: string;
    readonly isMapping: boolean;
    readonly isArray: boolean;
    readonly isTuple: boolean;
    readonly isFunction: boolean;
    constructor(parameters: TupleDesign, result: Design);
    readonly type: FunctionConstructor;
}
