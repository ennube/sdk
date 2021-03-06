export declare const Type: FunctionConstructor;
export interface Type<T> extends Function {
    new (...args: any[]): T;
}
export declare function typeOf<T>(value: T): typeof value & Type<T>;
export declare function baseTypeOf(type: Type<any>): Type<any>;
export declare function isDerivedType(type: Type<any>, base: Type<any>): boolean;
export declare function isInstanceOf<T>(value: any, type: Type<T>): value is T;
