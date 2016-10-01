"use strict";
var type_1 = require('./type');
var chainedObject = Object.create;
var allSchemas = {};
var Schema = (function () {
    function Schema(name, base) {
        this.name = name;
        this.allTypeDescriptors = {
            //  super descriptor
            'Object': {
                type: Object,
                base: undefined,
                params: {},
                properties: {},
            }
        };
        this.propertySuperDescriptor = {
            format: undefined,
            type: undefined,
            base: undefined,
            params: {},
        };
        this._needValidate = true;
        if (base !== undefined) {
            Object.setPrototypeOf(this.allTypeDescriptors, base.allTypeDescriptors);
            Object.setPrototypeOf(this.propertySuperDescriptor, base.propertySuperDescriptor);
        }
        allSchemas[name] = this;
    }
    Schema.prototype.typeDescriptor = function (type) {
        var typeDescriptor = this.allTypeDescriptors[type.name];
        if (typeDescriptor !== undefined) {
            if (typeDescriptor.type !== type)
                throw new Error(("Type name " + type.name + " conflict ") +
                    ("in the schema " + this.name));
            return typeDescriptor;
        }
        var typeBaseDescriptor = this.typeDescriptor(type_1.baseType(type));
        this._needValidate = true;
        return this.allTypeDescriptors[type.name] = {
            type: type,
            base: typeBaseDescriptor,
            params: Object.create(typeBaseDescriptor.params),
            properties: Object.create(typeBaseDescriptor.properties),
        };
    };
    Schema.prototype.propertyDescriptor = function (type, propertyName) {
        var typeDescriptor = this.typeDescriptor(type);
        //if( Object.hasOwnProperty(typeDescriptor.properties, propertyName) )
        if (Object.hasOwnProperty.bind(typeDescriptor.properties)(propertyName))
            return typeDescriptor.properties[propertyName];
        var propertyBaseDescriptor = typeDescriptor.properties[propertyName];
        if (propertyBaseDescriptor === undefined)
            propertyBaseDescriptor = this.propertySuperDescriptor;
        this._needValidate = true;
        return typeDescriptor.properties[propertyName] = {
            base: propertyBaseDescriptor,
            params: Object.create(propertyBaseDescriptor.params),
        };
    };
    Schema.prototype.type = function (params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        return function (type) {
            var typeDescriptor = _this.typeDescriptor(type);
            Object.assign(typeDescriptor.params, params);
        };
    };
    Schema.prototype.property = function (params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        return function (typePrototype, propertyName) {
            if (typeof typePrototype == 'function')
                throw new Error("static properties are not permitted");
            var type = typePrototype.constructor;
            var propertyDescriptor = _this.propertyDescriptor(type, propertyName);
            Object.assign(propertyDescriptor.params, params);
        };
    };
    Schema.prototype.ensureValidated = function () {
        if (!this._needValidate)
            return;
        for (var typeName in this.allTypeDescriptors) {
            var typeDescriptor = this.allTypeDescriptors[typeName];
            for (var propertyName in typeDescriptor.properties) {
                var propertyDescriptor = typeDescriptor.properties[propertyName];
            }
        }
    };
    Schema.prototype.parseTypeFormat = function (x, at) {
        if (at === void 0) { at = ''; }
        if (type_1.typeOf(x) === Array) {
            if (x.length != 1 || type_1.typeOf(x[0]) !== type_1.Type)
                throw new Error(at + "schematic array must contains one Type element");
            // IDEA: mas de un valor indica un tuple de diferentes datos
            //      Esto es util para la geolocalizacion, [lat, lon]
            return [Array, x[0]];
        }
        if (type_1.typeOf(x) === Object) {
            var k = Object.getOwnPropertyNames(x);
            if (k.length != 1)
                throw new Error(at + "schematic object must contains one key-value pair");
            var keyDescriptor = this.allTypeDescriptors[k[0]];
            if (keyDescriptor === undefined)
                throw new Error(at + "unknow key " + k[0] + " in schematic object");
            var v = x[k[0]];
            if (type_1.typeOf(v) !== type_1.Type)
                throw new Error(at + "schematic object value must be a Type value");
            return [Object, keyDescriptor.type, v];
        }
    };
    return Schema;
}());
exports.Schema = Schema;
//# sourceMappingURL=schema.js.map