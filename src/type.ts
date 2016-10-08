

export const Type = Function; // a Type IS a Function

export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export function typeOf<T>(value: T): typeof value & Type<T> {
    if( value === undefined || value === null )
        return undefined;

    return Object.getPrototypeOf(value).constructor;
}

export function baseTypeOf(type: Type<any>): Type<any> {
    if( type === undefined || type === null )
        throw new Error(`base type of ${type}`);
    if( type === Object )
        return undefined;
    return Object.getPrototypeOf(type.prototype).constructor;
}

//export function isDerivedType<T>(type: Type<any>, base: Type<T>): type is Type<T> {
export function isDerivedType(type: Type<any>, base: Type<any>): boolean {
    if( base === undefined || base === null )
        throw new Error(`derived type of ${base}`);

    if( type === undefined || type === null )
        return false;

    return type.prototype instanceof base;
}

export function isInstanceOf<T>(value, type: Type<T> ): value is T {
//export function isInstanceOf(value, type: Type<any> ): boolean {
    if( type === undefined || type === null)
        throw new Error(`instance of type can not be ${type}`);

    if( value === undefined || value === null)
        return false;

    let valueType = Object.getPrototypeOf(value).constructor;

    return valueType === type || valueType.prototype instanceof type;
}
