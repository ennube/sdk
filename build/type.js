"use strict";
exports.Type = Function;
function typeOf(value) {
    if (value === undefined ||
        value === null)
        return undefined;
    return Object.getPrototypeOf(value).constructor;
}
exports.typeOf = typeOf;
function baseType(type) {
    if (type === undefined ||
        type === null)
        throw new Error("getting base type of " + type);
    var basePrototype = Object.getPrototypeOf(type.prototype);
    if (!basePrototype)
        return undefined;
    return basePrototype.constructor;
}
exports.baseType = baseType;
function derivedType(type, base) {
    if (base === undefined ||
        base === null)
        throw new Error("derived type of " + base);
    if (type === undefined ||
        type === null)
        return false;
    return type.prototype instanceof base;
}
exports.derivedType = derivedType;
function instanceOf(value, type) {
    if (type === undefined ||
        type === null)
        throw new Error("instance of type can not be " + type);
    var valueType = typeOf(value);
    return valueType === type ||
        derivedType(valueType, type);
}
exports.instanceOf = instanceOf;
//# sourceMappingURL=type.js.map