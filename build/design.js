"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require('./polyfill');
var type_1 = require('./type');
var Design = (function () {
    function Design() {
    }
    /*
        static get any() {
            return anyDesign;
        }*/
    /*
        Parse a design expression
     */
    Design.exp = function (exp) {
        if (type_1.instanceOf(exp, type_1.Type)) {
            if (exp.name == '') {
                throw new Error('function parsing not implemented');
            }
            else {
                return TypeDesign.get(exp);
            }
        }
        // parse direct names
        if (type_1.instanceOf(exp, String)) {
            if (exp == 'Object' || exp == '*')
                return anyDesign;
            if (exp == 'Array')
                return anyArrayDesign;
            if (exp == 'Boolean')
                return booleanDesign;
            if (exp == 'Number')
                return numberDesign;
            if (exp == 'String' || exp == '')
                return stringDesign;
            if (exp == 'RegExp')
                return regexpDesign;
            if (exp == 'Date')
                return dateDesign;
            if (exp == 'Function' || exp == 'Type')
                return functionDesign;
            throw new Error("Unknow type design expresion " + exp);
        }
        var expType = type_1.typeOf(exp);
        // array parsing
        if (type_1.instanceOf(exp, Array)) {
            var typeDesign = TypeDesign.get(expType);
            if (typeDesign === undefined)
                throw new Error("Unknow type " + exp.name);
            if (exp.length == 0)
                return typeDesign;
            if (exp.length == 1)
                return typeDesign.array(Design.exp(exp[0]));
            else
                throw new Error("parsing tuples are not implemented");
        }
        // mappings
        if (expType === Object) {
            var keyNames = Object.getOwnPropertyNames(exp);
            if (keyNames.length == 0)
                return anyDesign.mapping(stringDesign, anyDesign);
            if (keyNames.length == 1)
                return anyDesign.mapping(Design.exp(keyNames[0]), Design.exp(exp[keyNames[0]]));
            else
                throw new Error("Mappings must have only one key-value pair");
        }
        throw new Error("Unknow type design expresion " + exp);
    };
    Design.member = function (value) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return function (target, memberName, descriptor) {
            var isStatic = type_1.instanceOf(target, type_1.Type);
            var targetType = isStatic ? target : target.constructor;
            var targetDesign = TypeDesign.declare(targetType);
            var reflectedType = Reflect.getMetadata('design:type', target, memberName);
            console.log("decl member " + targetType.name + "." + memberName, isStatic ? 'static' : 'dynamic');
            console.log(" reflected type " + reflectedType.name);
            var valueDesign = TypeDesign.get(reflectedType);
            if (value !== undefined) {
                var exprDesign = Design.exp(value);
                // must be type compatible with reflected
                if (exprDesign.type !== valueDesign.type &&
                    !type_1.derivedType(exprDesign.type, valueDesign.type))
                    throw new Error("especified type design not match with reflected metadata design" +
                        ("in " + targetType.name + "." + memberName + " member: ") +
                        ("user design " + exprDesign.type + ", reflected design " + valueDesign.type));
                valueDesign = exprDesign;
            }
            targetDesign.members[memberName] = new MemberDesign(targetDesign, memberName, isStatic, valueDesign);
        };
    };
    Design.class = function () {
        return function (type) {
            var typeDesign = TypeDesign.declare(type);
            console.log("decl type " + type.name);
        };
    };
    return Design;
}());
exports.Design = Design;
var TypeDesign = (function () {
    // parameters: TupleDesign;
    function TypeDesign(type, base) {
        this.type = type;
        this.base = base;
        this.isArray = false;
        this.isMapping = false;
        this.derived = new Map();
        this.members = base ?
            Object.create(base.members) :
            {};
        for (; base !== undefined; base = base.base)
            base.derived.set(type, this);
        allTypeDesigns.set(type, this);
    }
    TypeDesign.declare = function (type) {
        if (type === undefined || type === null)
            throw new Error("Unknow type " + type.name);
        var typeDesign = allTypeDesigns.get(type);
        if (typeDesign !== undefined)
            return typeDesign;
        var typeBase = type_1.baseType(type);
        var baseDesign = typeBase ? TypeDesign.get(typeBase) : undefined;
        if (type === Object)
            return new AnyTypeDesign(type, baseDesign);
        else if (type === Array || type_1.derivedType(type, Array))
            return new AnyArrayDesign(type, baseDesign);
        else
            return new TypeDesign(type, baseDesign);
    };
    TypeDesign.get = function (type) {
        if (type === undefined || type === null)
            throw new Error("Unknow type " + type.name);
        var typeDesign = allTypeDesigns.get(type);
        if (typeDesign === undefined)
            throw new Error("type not declared " + type.name);
        return typeDesign;
    };
    TypeDesign.prototype.derivedFrom = function (baseDesign) {
        return this.type === baseDesign.type ||
            type_1.derivedType(this.type, baseDesign.type);
    };
    return TypeDesign;
}());
exports.TypeDesign = TypeDesign;
var AnyTypeDesign = (function (_super) {
    __extends(AnyTypeDesign, _super);
    function AnyTypeDesign() {
        _super.apply(this, arguments);
        this.mappingDesigns = new Map();
    }
    AnyTypeDesign.prototype.mapping = function (key, value) {
        var valueMap = this.mappingDesigns.get(key);
        if (valueMap === undefined)
            this.mappingDesigns.set(key, valueMap = new Map());
        var mappingDesign = valueMap.get(value);
        if (mappingDesign === undefined)
            valueMap.set(value, mappingDesign = new MappingDesign(this, key, value));
        return mappingDesign;
    };
    return AnyTypeDesign;
}(TypeDesign));
exports.AnyTypeDesign = AnyTypeDesign;
var AnyArrayDesign = (function (_super) {
    __extends(AnyArrayDesign, _super);
    function AnyArrayDesign() {
        _super.apply(this, arguments);
        this.isArray = true;
        this.arrayDesigns = new Map();
    }
    Object.defineProperty(AnyArrayDesign.prototype, "key", {
        get: function () {
            return numberDesign;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnyArrayDesign.prototype, "value", {
        get: function () {
            return anyDesign;
        },
        enumerable: true,
        configurable: true
    });
    AnyArrayDesign.prototype.array = function (value) {
        if (value === anyDesign)
            return this;
        var arrayDesign = this.arrayDesigns.get(value);
        if (arrayDesign === undefined)
            this.arrayDesigns.set(value, arrayDesign = new ArrayDesign(this, value));
        return arrayDesign;
    };
    AnyArrayDesign.prototype.tuple = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i - 0] = arguments[_i];
        }
        /*
        let arrayDesign = this.arrayDesigns.get(value);
        if( arrayDesign === undefined )
            arrayDesign = new ArrayDesign(this, value);
        return arrayDesign;*/
    };
    return AnyArrayDesign;
}(TypeDesign));
exports.AnyArrayDesign = AnyArrayDesign;
var ArrayDesign = (function () {
    //tuples = new Map<Type, TupleDesign>();
    function ArrayDesign(typeDesign, value) {
        this.typeDesign = typeDesign;
        this.value = value;
        this.isArray = true;
        this.isMapping = false;
    }
    Object.defineProperty(ArrayDesign.prototype, "type", {
        get: function () {
            return this.typeDesign.type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayDesign.prototype, "key", {
        get: function () {
            return numberDesign;
        },
        enumerable: true,
        configurable: true
    });
    return ArrayDesign;
}());
exports.ArrayDesign = ArrayDesign;
/*
export class TupleDesign  implements Design {
    tuples = new Map<Type, ArrayDesign>();
    constructor(public typeDesign: AnyArrayDesign,
                public value:Design) {
    }
}
*/
var MappingDesign = (function () {
    function MappingDesign(typeDesign, key, value) {
        this.typeDesign = typeDesign;
        this.key = key;
        this.value = value;
        this.isArray = false;
        this.isMapping = true;
    }
    Object.defineProperty(MappingDesign.prototype, "type", {
        get: function () {
            return this.typeDesign.type;
        },
        enumerable: true,
        configurable: true
    });
    return MappingDesign;
}());
exports.MappingDesign = MappingDesign;
/*
    Member delega sobre su value, sirve como un proxy del tipo
    que representa, puede ser una funcion o un dato.

*/
var MemberDesign = (function () {
    function MemberDesign(target, name, isStatic, value) {
        this.target = target;
        this.name = name;
        this.isStatic = isStatic;
        this.value = value;
    }
    Object.defineProperty(MemberDesign.prototype, "type", {
        // property delega sobre su diseño
        get: function () {
            return this.value.type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MemberDesign.prototype, "isArray", {
        get: function () {
            return this.value.isArray;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MemberDesign.prototype, "isMapping", {
        get: function () {
            return this.value.isMapping;
        },
        enumerable: true,
        configurable: true
    });
    return MemberDesign;
}());
exports.MemberDesign = MemberDesign;
/*
// ...method delega sobre un FunctionDesign...
export class MethodDesign extends MemberDesign implements Design {
    constructor(public target: TypeDesign,
                public name:string,
                public isStatic: boolean,
                public value: Design
            ) {
            super(target, name, isStatic);
    }

    // property delega sobre su diseño
    get type() {
        return this.value.type;
    }
    get isArray() {
        return this.value.isArray;
    }
    get isMapping() {
        return this.value.isMapping;
    }
}

*/
var allTypeDesigns = new Map();
var anyDesign = TypeDesign.declare(Object);
var anyArrayDesign = TypeDesign.declare(Array);
var booleanDesign = TypeDesign.declare(Boolean);
var numberDesign = TypeDesign.declare(Number);
var stringDesign = TypeDesign.declare(String);
var regexpDesign = TypeDesign.declare(RegExp);
var dateDesign = TypeDesign.declare(Date);
var functionDesign = TypeDesign.declare(Function);
//# sourceMappingURL=design.js.map