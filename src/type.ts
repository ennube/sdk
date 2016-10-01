
export const Type = Function;
export interface Type extends Function { }

export function typeOf<T>(value: T): T&Type {
    if( value === undefined ||
        value === null )
        return undefined;

    return Object.getPrototypeOf(value).constructor;
}

export function baseType(type: Type): Type {
    if( type === undefined ||
        type === null )
        throw new Error(`getting base type of ${type}`);

    let basePrototype = Object.getPrototypeOf(type.prototype)
    if(!basePrototype )
        return undefined;

    return basePrototype.constructor;
}

export function derivedType(type: Type, base: Type) {
    if( base === undefined ||
        base === null )
        throw new Error(`derived type of ${base}`);

    if( type === undefined ||
        type === null )
        return false;

    return type.prototype instanceof base;
}

export function instanceOf<T>(value, type: T & Type) {
    if( type === undefined ||
        type === null)
        throw new Error(`instance of type can not be ${type}`);

    let valueType = typeOf(value);
    return valueType === type ||
        derivedType(valueType, type);
}
