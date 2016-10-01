import './polyfill';
import { Type } from './type';
export declare abstract class Design {
    private constructor();
    readonly type: Type;
    readonly derived?: Map<Type, Design>;
    readonly base?: Design;
    readonly members?: {
        [memberName: string]: Design;
    };
    readonly isArray: boolean;
    readonly isMapping: boolean;
    readonly key?: Design;
    readonly value?: Design;
    static exp(exp: any): Design;
    static member(value?: any, ...params: any[]): (target: any, memberName: string, descriptor?: any) => void;
    static class(): (type: Type) => void;
}
export declare class TypeDesign implements Design {
    type: Type;
    base: TypeDesign;
    isArray: boolean;
    isMapping: boolean;
    derived: Map<Type, TypeDesign>;
    members: {
        [memberName: string]: MemberDesign;
    };
    protected constructor(type: Type, base: TypeDesign);
    static declare(type: Type): TypeDesign;
    static get(type: Type): TypeDesign;
    derivedFrom(baseDesign: TypeDesign): boolean;
}
export declare class AnyTypeDesign extends TypeDesign implements Design {
    mappingDesigns: Map<Design, Map<Design, MappingDesign>>;
    mapping(key: Design, value: Design): MappingDesign;
}
export declare class AnyArrayDesign extends TypeDesign implements Design {
    isArray: boolean;
    readonly key: TypeDesign;
    readonly value: AnyTypeDesign;
    arrayDesigns: Map<Design, ArrayDesign>;
    array(value: Design): Design;
    tuple(...values: Design[]): void;
}
export declare class ArrayDesign implements Design {
    typeDesign: AnyArrayDesign;
    value: Design;
    isArray: boolean;
    isMapping: boolean;
    constructor(typeDesign: AnyArrayDesign, value: Design);
    readonly type: Type;
    readonly key: TypeDesign;
}
export declare class MappingDesign implements Design {
    typeDesign: AnyTypeDesign;
    key: Design;
    value: Design;
    isArray: boolean;
    isMapping: boolean;
    constructor(typeDesign: AnyTypeDesign, key: Design, value: Design);
    readonly type: Type;
}
export declare class MemberDesign implements Design {
    target: TypeDesign;
    name: string;
    isStatic: boolean;
    value: Design;
    constructor(target: TypeDesign, name: string, isStatic: boolean, value: Design);
    readonly type: Type;
    readonly isArray: boolean;
    readonly isMapping: boolean;
}
