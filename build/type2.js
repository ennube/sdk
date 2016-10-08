"use strict";
exports.Type = Function;
function typeOf(value) {
    if (value === undefined || value === null)
        return undefined;
    return Object.getPrototypeOf(value).constructor;
}
exports.typeOf = typeOf;
function baseTypeOf(type) {
    if (type === undefined || type === null)
        throw new Error("base type of " + type);
    return Object.getPrototypeOf(type.prototype).constructor;
}
exports.baseTypeOf = baseTypeOf;
function isDerivedType(type, base) {
    //export function isDerivedType(type: Type<any>, base: Type<any>): boolean {
    if (base === undefined || base === null)
        throw new Error("derived type of " + base);
    if (type === undefined || type === null)
        return false;
    return type.prototype instanceof base;
}
exports.isDerivedType = isDerivedType;
function isInstanceOf(value, type) {
    //export function isInstanceOf(value, type: Type<any> ): boolean {
    if (type === undefined || type === null)
        throw new Error("instance of type can not be " + type);
    if (value === undefined || value === null)
        return false;
    var valueType = Object.getPrototypeOf(value).constructor;
    return valueType === type || valueType.prototype instanceof type;
}
exports.isInstanceOf = isInstanceOf;
//# sourceMappingURL=type2.js.map