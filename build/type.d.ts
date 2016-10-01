export declare const Type: FunctionConstructor;
export interface Type extends Function {
}
export declare function typeOf<T>(value: T): T & Type;
export declare function baseType(type: Type): Type;
export declare function derivedType(type: Type, base: Type): boolean;
export declare function instanceOf<T>(value: any, type: T & Type): boolean;
