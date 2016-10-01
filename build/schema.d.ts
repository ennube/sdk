import { Type } from './type';
export interface TypeInfo {
}
export interface TypeParams {
}
export interface TypeDescriptor {
    type: Type;
    base: TypeDescriptor;
    params: TypeParams;
    properties: {
        [propertyName: string]: PropertyDescriptor;
    };
}
export interface PropertyParams {
}
export interface PropertyDescriptor {
    format: any;
    type: Type;
    base: PropertyDescriptor;
    params: PropertyParams;
}
export declare class Schema {
    name: string;
    allTypeDescriptors: {
        [typeName: string]: TypeDescriptor;
    };
    propertySuperDescriptor: PropertyDescriptor;
    private _needValidate;
    constructor(name: string, base?: Schema);
    typeDescriptor(type: Type): any;
    propertyDescriptor(type: Type, propertyName: string): any;
    type(params?: TypeParams): (type: Type) => void;
    property(params?: PropertyParams): (typePrototype: any, propertyName: string) => void;
    ensureValidated(): void;
    parseTypeFormat(x: any, at?: string): any[];
}
