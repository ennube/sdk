"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require('core-js/es6/map');
require('core-js/es6/reflect');
require('core-js/es7/reflect');
var type_1 = require('./type');
/*
TODO:
    Soportar como mappings el tipo Map (clase base Map, key y value en funcion del mapping)
    Soportar como Secuencias el tipo Set
    cambiar variadic por tipo sequence.
    ----
    mas abtracto,    Soportar  tipos paramétricos, como Map<tipo, tipo>,
    un tipo parametrico es un tipo: Map, que declara una serie de parametros,
    los parametros (otros tipos), dichos parametros son definidos por los diseños
    de esa clase base.

    De esta forma, array seria un tipo que declara un parametro: element
    las vistas del array deben entonces definir element.

    Un mapping, ... key value, un Map, key value, un Set, element...

    extrapolar esto a una funcion requiere aun de un analisis mas delicado.
*/
(function (DesignKind) {
    DesignKind[DesignKind["Type"] = 0] = "Type";
    DesignKind[DesignKind["Array"] = 1] = "Array";
})(exports.DesignKind || (exports.DesignKind = {}));
var DesignKind = exports.DesignKind;
;
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
    Design.exp = function (exp, result) {
        if (type_1.isInstanceOf(exp, type_1.Type)) {
            if (exp.name == '') {
                throw new Error('function parsing not implemented');
            }
            else {
                return Design.get(exp);
            }
        }
        // parse direct names
        if (type_1.isInstanceOf(exp, String)) {
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
        if (type_1.isInstanceOf(exp, Array)) {
            var typeDesign = Design.get(expType);
            if (typeDesign === undefined)
                throw new Error("Unknow type " + expType.name);
            if (exp.length == 0)
                return typeDesign;
            if (exp[exp.length - 1] == '...') {
                exp.pop();
                if (exp.length == 0)
                    return typeDesign;
                if (exp.length == 1)
                    return typeDesign.array(Design.exp(exp[0]));
                else
                    throw new Error("arrays can only contains one element");
            }
            var tuple = typeDesign.tuple(exp.map(Design.exp));
            return result ?
                tuple.returns(Design.exp(result)) :
                tuple;
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
    Design.get = function (type) {
        if (type === undefined || type === null)
            throw new Error("Unknow type " + type.name);
        var typeDesign = allTypeDesigns.get(type);
        if (typeDesign === undefined)
            throw new Error("type not declared " + type.name);
        return typeDesign;
    };
    Design.member = function (value, result) {
        return function (target, memberName, descriptor) {
            var isStatic = type_1.isInstanceOf(target, type_1.Type);
            var targetType = isStatic ? target : target.constructor;
            var targetDesign = TypeDesign.declare(targetType);
            var reflectedType = Reflect.getMetadata('design:type', target, memberName);
            var reflectedDesign = Design.get(reflectedType);
            var design = Design.exp(value, result);
            if (design.type !== reflectedDesign.type &&
                !type_1.isDerivedType(design.type, reflectedDesign.type))
                throw new Error("especified type design not match with reflected metadata design" +
                    ("in " + targetType.name + "." + memberName + " member. ") +
                    ("design: '" + design.type.name + "', ") +
                    ("reflected '" + reflectedDesign.type.name + "'"));
            targetDesign.members.set(memberName, {
                name: memberName,
                isStatic: isStatic,
                design: design,
            });
        };
    };
    Design.class = function () {
        // TODO: constructor design...
        return function (type) {
            var typeDesign = TypeDesign.declare(type);
        };
    };
    return Design;
}());
exports.Design = Design;
;
var TypeDesign = (function () {
    function TypeDesign(type, base) {
        this.type = type;
        this.base = base;
        this.kind = 'type';
        this.isArray = false;
        this.isMapping = false;
        this.isTuple = false;
        this.derived = new Map();
        this.members = new Map();
        this.members = new Map(base ? base.members.entries() : []);
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
        var typeBase = type_1.baseTypeOf(type);
        var baseDesign = typeBase ? Design.get(typeBase) : undefined;
        if (type === Object)
            return new AnyTypeDesign(type, baseDesign);
        else if (type === Array || type_1.isDerivedType(type, Array))
            return new AnyArrayDesign(type, baseDesign);
        else
            return new TypeDesign(type, baseDesign);
    };
    TypeDesign.prototype.toString = function () {
        return this.type.name;
    };
    TypeDesign.prototype.derivedFrom = function (baseDesign) {
        return this.type === baseDesign.type ||
            type_1.isDerivedType(this.type, baseDesign.type);
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
var MappingDesign = (function () {
    function MappingDesign(typeDesign, key, value) {
        this.typeDesign = typeDesign;
        this.key = key;
        this.value = value;
        this.kind = 'mapping';
        this.isTuple = false;
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
    MappingDesign.prototype.toString = function () {
        return "{" + this.key.toString() + ": " + this.value.toString() + "}";
    };
    return MappingDesign;
}());
exports.MappingDesign = MappingDesign;
var AnyArrayDesign = (function (_super) {
    __extends(AnyArrayDesign, _super);
    function AnyArrayDesign() {
        _super.apply(this, arguments);
        this.kind = 'array';
        this.isArray = true;
        this.isTuple = false;
        this.variadicDesigns = new Map();
        this.tupleDesigns = new Map();
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
        var arrayDesign = this.variadicDesigns.get(value);
        if (arrayDesign === undefined)
            this.variadicDesigns.set(value, arrayDesign = new VariadicDesign(this, value));
        return arrayDesign;
    };
    AnyArrayDesign.prototype.tuple = function (values) {
        var currentMap = this.tupleDesigns;
        var design = zeroLengthTuple;
        var level = 1;
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            var nextDesign = currentMap.get(value);
            if (nextDesign === undefined)
                currentMap.set(value, nextDesign = new TupleDesign(this, values.slice(0, level)));
            currentMap = nextDesign.tupleDesigns;
            design = nextDesign;
            level += 1;
        }
        return design;
    };
    return AnyArrayDesign;
}(TypeDesign));
exports.AnyArrayDesign = AnyArrayDesign;
var VariadicDesign = (function () {
    function VariadicDesign(typeDesign, value) {
        this.typeDesign = typeDesign;
        this.value = value;
        this.kind = 'array';
        this.isMapping = false;
        this.isArray = true;
        this.isTuple = false;
    }
    Object.defineProperty(VariadicDesign.prototype, "type", {
        get: function () {
            return this.typeDesign.type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VariadicDesign.prototype, "key", {
        get: function () {
            return numberDesign;
        },
        enumerable: true,
        configurable: true
    });
    VariadicDesign.prototype.toString = function () {
        return "[" + this.value.toString() + ", '...']";
    };
    return VariadicDesign;
}());
exports.VariadicDesign = VariadicDesign;
var TupleDesign = (function () {
    function TupleDesign(typeDesign, value) {
        this.typeDesign = typeDesign;
        this.value = value;
        this.kind = 'tuple';
        this.isMapping = false;
        this.isArray = true;
        this.isTuple = true;
        this.tupleDesigns = new Map();
        this.functionDesigns = new Map();
    }
    Object.defineProperty(TupleDesign.prototype, "type", {
        get: function () {
            return this.typeDesign.type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TupleDesign.prototype, "key", {
        get: function () {
            return numberDesign;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TupleDesign.prototype, "length", {
        get: function () {
            return this.value.length;
        },
        enumerable: true,
        configurable: true
    });
    TupleDesign.prototype.toString = function () {
        return "[" + this.value.toString() + ", '...']";
    };
    TupleDesign.prototype.returns = function (result) {
        var functionDesign = this.functionDesigns.get(result);
        if (functionDesign === undefined)
            this.functionDesigns.set(result, functionDesign = new FunctionDesign(this, result));
        return functionDesign;
    };
    return TupleDesign;
}());
exports.TupleDesign = TupleDesign;
var FunctionDesign = (function () {
    function FunctionDesign(parameters, result) {
        this.parameters = parameters;
        this.result = result;
        this.kind = 'function';
        this.isMapping = false;
        this.isArray = true;
        this.isTuple = true;
        this.isFunction = true;
    }
    Object.defineProperty(FunctionDesign.prototype, "type", {
        get: function () {
            return Function;
        },
        enumerable: true,
        configurable: true
    });
    return FunctionDesign;
}());
exports.FunctionDesign = FunctionDesign;
;
var allTypeDesigns = new Map();
var anyDesign = TypeDesign.declare(Object);
var anyArrayDesign = TypeDesign.declare(Array);
var zeroLengthTuple = new TupleDesign(anyArrayDesign, []);
var booleanDesign = TypeDesign.declare(Boolean);
var numberDesign = TypeDesign.declare(Number);
var stringDesign = TypeDesign.declare(String);
var regexpDesign = TypeDesign.declare(RegExp);
var dateDesign = TypeDesign.declare(Date);
var functionDesign = TypeDesign.declare(Function);
//# sourceMappingURL=design.js.map