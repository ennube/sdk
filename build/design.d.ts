import 'core-js/es6/map';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import { Type } from './type';
export declare enum DesignKind {
    Type = 0,
    Array = 1,
}
export declare abstract class Design {
    private constructor();
    readonly type: Type<any>;
    readonly derived?: Map<Type<any>, Design>;
    readonly base?: Design;
    readonly members?: Map<string, TypeMember>;
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
    static get(type: Type<any>): TypeDesign;
    static member(value: any, result?: any): (target: any, memberName: string, descriptor?: any) => void;
    static class(): (type: Type<any>) => void;
}
export interface TypeMember {
    isStatic: boolean;
    design: Design;
    name: string;
}
export declare class TypeDesign implements Design {
    type: Type<any>;
    base: TypeDesign;
    readonly kind: string;
    readonly isArray: boolean;
    readonly isMapping: boolean;
    readonly isTuple: boolean;
    derived: Map<Type<any>, TypeDesign>;
    members: Map<string, TypeMember>;
    protected constructor(type: Type<any>, base: TypeDesign);
    static declare(type: Type<any>): TypeDesign;
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
    readonly type: Type<any>;
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
    readonly type: Type<any>;
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
    readonly type: Type<any>;
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
