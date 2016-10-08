var Accesor = (function () {
    function Accesor(root) {
        this.root = root;
    }
    Accesor.prototype.get = function (path) {
    };
    Accesor.prototype.set = function (path, value) {
        //...
        this.refresh();
    };
    Accesor.prototype.refresh = function () {
    };
    /*
        Gets or create a new behaviour subject to observe...
        every object refresh, the subject is updated with the value of observation...
        
     */
    Accesor.prototype.watch = function (path) {
    };
    return Accesor;
}());
//# sourceMappingURL=accesor.js.map