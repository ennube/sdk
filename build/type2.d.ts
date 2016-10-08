export interface Type<T> extends Function {
    new (...args: any[]): T;
}
export declare const Type: FunctionConstructor;
export declare function typeOf<T>(value: T): typeof value & Type<T>;
export declare function baseTypeOf(type: Type<any>): Type<any>;
export declare function isDerivedType<T>(type: Type<any>, base: Type<T>): type is Type<T>;
export declare function isInstanceOf<T>(value: any, type: Type<T>): value is T;
