"use strict";
var type_1 = require('./type');
/*

El exoesqueleto NECESITA de una RAIZ, el propio algoritmo de verificacion de cambios
caerá en bucle infinito cuando se trate de una estructura circular. así mismo, se debe
tener una cache en todo momento sobre las estancias,

Se debe pensar en la estructura como en un grafo, NO un arbol.




    Cambia el valor de un lado a otro, muy util para reordenar arrays,
    se efectua un onChange en cada elemento por debajo de los elementos
    de los paths.

swap(pathA:string, pathB:string) {

}

set(path:string, value:any) {

}
get(path:string): any {

}

delete(path:string) {

}
copy(from:string, to:string) {
    //
}

    child(path:string|string[]) {
        let exo = this;

        if(typeof path == 'string')
            path = path.split('.');

        for(let key of path)
            if( exo !== undefined )
                exo = exo.children[key];
            else
                return undefined;

        return exo;
    }

*/
/*

circular ref: requiere de un root.
value accessors: requiere de un root son en un root.
value listeners: podrian ubicarse en un root, siendo el root un gran observable.

onValue, retorna true si el valor ha cambiado

*/
var Exoskeleton = (function () {
    function Exoskeleton(value) {
        if (value === void 0) { value = undefined; }
        this.updateValue(value);
    }
    Object.defineProperty(Exoskeleton.prototype, "length", {
        get: function () {
            if (this.children instanceof Array)
                return this.children.length;
            else if (this.children instanceof Object)
                return Object.keys(this.children).length;
            else
                return 0;
        },
        enumerable: true,
        configurable: true
    });
    Exoskeleton.prototype.onDestroy = function () { };
    /*
        Give the value of this node..
        returns true for force 'bubble up'..
    */
    Exoskeleton.prototype.onValue = function (value, changeDetected) {
        return changeDetected;
    };
    Exoskeleton.prototype.createChild = function (value) {
        return new (type_1.typeOf(this))(value);
    };
    Exoskeleton.prototype.updateValue = function (nextValue) {
        var _this = this;
        var children = this.children;
        var changeDetected = false;
        // destroys the sub-tree
        if (children instanceof Array) {
            // array -> array
            if (nextValue instanceof Array) {
                if (nextValue.length < children.length) {
                    changeDetected = true;
                    for (var _i = 0, _a = children.splice(nextValue.length); _i < _a.length; _i++) {
                        var child = _a[_i];
                        child.onDestroy();
                    }
                }
            }
            else if (nextValue instanceof Object) {
                for (var _b = 0, children_1 = children; _b < children_1.length; _b++) {
                    var child = children_1[_b];
                    child.onDestroy();
                }
                children = undefined;
                changeDetected = true;
            }
            else {
                for (var _c = 0, children_2 = children; _c < children_2.length; _c++) {
                    var child = children_2[_c];
                    child.onDestroy();
                }
                children = undefined;
                changeDetected = true;
            }
        }
        else if (children instanceof Object) {
            // object -> array
            if (nextValue instanceof Array) {
                for (var key in children) {
                    children[key].onDestroy();
                    delete children[key];
                }
                children = undefined;
                changeDetected = true;
            }
            else if (nextValue instanceof Object) {
                var nextHasProperty = Object.hasOwnProperty.bind(nextValue);
                for (var _d = 0, _e = Object.keys(children); _d < _e.length; _d++) {
                    var key = _e[_d];
                    if (!nextHasProperty(key)) {
                        changeDetected = true;
                        children[key].onDestroy();
                        delete children[key];
                    }
                }
            }
            else {
                for (var key in children) {
                    children[key].onDestroy();
                    delete children[key];
                }
                children = undefined;
                changeDetected = true;
            }
        }
        else {
        }
        // check children
        // puede checkear llamando a valueOf, si ambos valueofs
        if (children)
            for (var key in children)
                if (children[key].updateValue(nextValue[key]))
                    changeDetected = true;
        // rebuilds the sub-tree
        if (children instanceof Array) {
            // array -> array
            if (nextValue instanceof Array) {
                if (nextValue.length > children.length) {
                    changeDetected = true;
                    while (children.length < nextValue.length)
                        children.push(this.createChild(nextValue[children.length]));
                }
            }
            else if (nextValue instanceof Object) {
                changeDetected = true;
                children = {};
                for (var _f = 0, _g = Object.keys(nextValue); _f < _g.length; _f++) {
                    var key = _g[_f];
                    children[key] = this.createChild(nextValue[key]);
                }
            }
            else { }
        }
        else if (children instanceof Object) {
            // object -> array
            if (nextValue instanceof Array) {
                changeDetected = true;
                children = nextValue.map(function (x) { return _this.createChild(x); });
            }
            else if (nextValue instanceof Object) {
                var hasChild = Object.hasOwnProperty.bind(children);
                for (var _h = 0, _j = Object.keys(nextValue); _h < _j.length; _h++) {
                    var key = _j[_h];
                    if (!hasChild(key)) {
                        changeDetected = true;
                        children[key] = this.createChild(nextValue[key]);
                    }
                }
            }
            else { }
        }
        else {
            // basic -> array
            if (nextValue instanceof Array) {
                changeDetected = true;
                children = nextValue.map(this.createChild);
            }
            else if (nextValue instanceof Object) {
                changeDetected = true;
                children = {};
                for (var _k = 0, _l = Object.keys(nextValue); _k < _l.length; _k++) {
                    var key = _l[_k];
                    children[key] = this.createChild(nextValue[key]);
                }
            }
            else { }
        }
        this.children = children;
        return this.onValue(nextValue, changeDetected);
    };
    return Exoskeleton;
}());
exports.Exoskeleton = Exoskeleton;
//# sourceMappingURL=exoskeleton.js.map