"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require('./polyfill');
var type_1 = require('./type');
var Design = (function () {
    function Design(type) {
        this.type = type;
    }
    Design.for = function (exp) {
        var expType = type_1.typeOf(exp);
        // Direct types
        if (type_1.instanceOf(exp, type_1.Type))
            return TypeDesign.of(exp);
        // parse direct names
        if (type_1.instanceOf(exp, String)) {
            if (exp === 'Object')
                return exports.anyDesign;
            if (exp === 'Boolean')
                return exports.booleanDesign;
            if (exp === 'Number')
                return exports.numberDesign;
            if (exp === 'String')
                return exports.stringDesign;
            if (exp === 'RegExp')
                return exports.regExpDesign;
            if (exp === 'Date')
                return exports.stringDesign;
            if (exp === 'Function')
                return exports.stringDesign;
        }
        // array parsing
        if (type_1.instanceOf(exp, Array)) {
            var typeDesign = TypeDesign.of(expType);
            if (exp.length == 0)
                return typeDesign.array(exports.anyDesign);
            if (exp.length == 1)
                return typeDesign.array(Design.for(exp[0]));
            else
                throw new Error("parsing tuples are not implemented");
        }
        // mappings
        if (expType === Object) {
            var keyNames = Object.getOwnPropertyNames(exp);
            if (keyNames.length == 0)
                return exports.anyDesign.mapping(exports.stringDesign, exports.anyDesign);
            if (keyNames.length == 1)
                return exports.anyDesign.mapping(Design.for(keyNames[0]), Design.for(exp[keyNames[0]]));
            else
                throw new Error("Mappings must have only one key-value pair");
        }
        throw new Error("Unknow type design expresion " + exp);
    };
    Design.class = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i - 0] = arguments[_i];
        }
        return function (target) {
            var classDesign = TypeDesign.type(target);
            var paramTypes = Reflect.getMetadata('design:paramtypes', target);
            console.log('paramTypes', paramTypes);
        };
    };
    Design.type = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        TypeDesign.type(type);
    };
    // member decorator
    Design.member = function (exp) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        var design = exp ? Design.for(exp) : undefined;
        return function (target, memberName, descriptor) {
            var isStatic = target instanceof type_1.Type;
            var type = target instanceof type_1.Type ? target : target.constructor;
            var prototype = target instanceof type_1.Type ? target.prototype : target;
            console.log(memberName, isStatic ? 'is static' : 'is dynamic');
            if (descriptor)
                console.log('descriptor:', descriptor);
        };
    };
    return Design;
}());
exports.Design = Design;
var allTypeDesigns = new Map();
var TypeDesign = (function (_super) {
    __extends(TypeDesign, _super);
    function TypeDesign(type) {
        _super.call(this, type);
        this.type = type;
        this.derived = new Map();
        if (type === Object) {
            this.mappingDesigns = new Map();
            this.base = undefined;
            this.members = {};
        }
        else {
            var typeBase = type_1.baseType(type);
            this.base = TypeDesign.of(typeBase);
            this.members = Object.create(this.base.members);
            if (type === Array || type_1.derivedType(type, Array)) {
                this.arrayDesigns = new Map();
            }
        }
        for (var base = this.base; base !== undefined; base = base.base)
            base.derived.set(type, this);
        allTypeDesigns.set(type, this);
    }
    TypeDesign.of = function (type) {
        if (type === undefined || type === null)
            type = Object;
        var typeDesign = allTypeDesigns.get(type);
        if (typeDesign === undefined)
            throw new Error("Unknow design for type " + type.name);
        return typeDesign;
    };
    TypeDesign.type = function (type) {
        if (type === undefined || type === null)
            throw new Error(type + " is not a type");
        var typeDesign = allTypeDesigns.get(type);
        if (typeDesign === undefined)
            typeDesign = new TypeDesign(type);
        return typeDesign;
    };
    TypeDesign.prototype.array = function (element) {
        if (this.arrayDesigns === undefined)
            throw new Error(this.type.name + " is not array type");
        var arrayDesign = this.arrayDesigns.get(element);
        if (arrayDesign === undefined)
            this.arrayDesigns.set(element, arrayDesign = new ArrayDesign(this, element));
        return arrayDesign;
    };
    TypeDesign.prototype.mapping = function (key, value) {
        if (this.mappingDesigns === undefined)
            throw new Error(this.type.name + " is not mapping type");
        if (key !== exports.stringDesign)
            throw new Error("only String key mapping suported");
        var mappingDesign = this.mappingDesigns.get(value);
        if (mappingDesign === undefined)
            this.mappingDesigns.set(value, mappingDesign = new MappingDesign(this, key, value));
        return mappingDesign;
    };
    return TypeDesign;
}(Design));
exports.TypeDesign = TypeDesign;
// bootstrap all basic types..
exports.anyDesign = TypeDesign.type(Object);
exports.booleanDesign = TypeDesign.type(Boolean);
exports.numberDesign = TypeDesign.type(Number);
exports.stringDesign = TypeDesign.type(String);
exports.regExpDesign = TypeDesign.type(RegExp);
exports.dateDesign = TypeDesign.type(Date);
exports.arrayDesign = TypeDesign.type(Array);
exports.functionDesign = TypeDesign.type(Function);
var ArrayDesign = (function (_super) {
    __extends(ArrayDesign, _super);
    function ArrayDesign(array, element) {
        _super.call(this, array.type);
        this.array = array;
        this.element = element;
    }
    return ArrayDesign;
}(Design));
exports.ArrayDesign = ArrayDesign;
var TupleDesign = (function (_super) {
    __extends(TupleDesign, _super);
    function TupleDesign(array, elements) {
        _super.call(this, array.type);
        this.array = array;
        this.elements = elements;
    }
    return TupleDesign;
}(Design));
exports.TupleDesign = TupleDesign;
var MappingDesign = (function (_super) {
    __extends(MappingDesign, _super);
    function MappingDesign(mapping, key, value) {
        _super.call(this, mapping.type);
        this.mapping = mapping;
        this.key = key;
        this.value = value;
    }
    return MappingDesign;
}(Design));
exports.MappingDesign = MappingDesign;
var ClassMember = (function () {
    function ClassMember(target, name, descriptor) {
        this.target = target;
        this.name = name;
    }
    return ClassMember;
}());
exports.ClassMember = ClassMember;
//# sourceMappingURL=typedesign.js.map