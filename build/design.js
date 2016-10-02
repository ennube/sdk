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
    Design.exp = function (exp, result) {
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
    Design.member = function (value, result) {
        return function (target, memberName, descriptor) {
            var isStatic = type_1.instanceOf(target, type_1.Type);
            var targetType = isStatic ? target : target.constructor;
            var targetDesign = TypeDesign.declare(targetType);
            var reflectedType = Reflect.getMetadata('design:type', target, memberName);
            console.log("decl member " + targetType.name + "." + memberName, isStatic ? 'static' : 'dynamic');
            //console.log(` reflected type ${reflectedType.name}`);
            console.log('descriptor', descriptor);
            if (reflectedType === Function) {
            }
            else {
            }
            var valueDesign = TypeDesign.get(reflectedType);
            //            if(value !== undefined) {
            var exprDesign = Design.exp(value, result);
            // must be type compatible with reflected
            if (exprDesign.type !== valueDesign.type &&
                !type_1.derivedType(exprDesign.type, valueDesign.type))
                throw new Error("especified type design not match with reflected metadata design" +
                    ("in " + targetType.name + "." + memberName + " member: ") +
                    ("user design " + exprDesign.type.name + " ") +
                    ("reflected design " + valueDesign.type.name));
            valueDesign = exprDesign;
            //            }
            targetDesign.members[memberName] = new MemberInfo(targetDesign, memberName, isStatic, valueDesign);
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
;
var MemberInfo = (function () {
    function MemberInfo(target, name, isStatic, value) {
        this.target = target;
        this.name = name;
        this.isStatic = isStatic;
        this.value = value;
    }
    return MemberInfo;
}());
exports.MemberInfo = MemberInfo;
var TypeDesign = (function () {
    // parameters: TupleDesign;
    function TypeDesign(type, base) {
        this.type = type;
        this.base = base;
        this.kind = 'type';
        this.isArray = false;
        this.isMapping = false;
        this.isTuple = false;
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
    TypeDesign.prototype.toString = function () {
        return this.type.name;
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