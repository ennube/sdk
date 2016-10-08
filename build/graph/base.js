"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseGraph = (function () {
    //    root: Node;
    //    nodes = new Map<any, Node>();
    function BaseGraph(value) {
        if (value === void 0) { value = undefined; }
        this.updateValue(value);
    }
    //    updateValueMap = Map<Node, boolean>;
    BaseGraph.prototype.updateValue = function (value) {
        // todo el trabajo ocurre aqui...
        var processCache = new Map();
        var processEdge = function (node, value) {
            // Si existe el nodo en la cache, pero el valor no es identico al almacenado,
            // se produce un split:
            var result = processCache.get(node);
            if (result !== undefined)
                return result;
            //let n = Node;
        };
    };
    return BaseGraph;
}());
var BaseNode = (function () {
    function BaseNode(graph, value) {
        this.graph = graph;
        this.onValue(value, true);
    }
    BaseNode.prototype.onDestroy = function () { };
    BaseNode.prototype.onValue = function (value, changeDetected) {
        return changeDetected;
    };
    return BaseNode;
}());
var Graph = (function (_super) {
    __extends(Graph, _super);
    function Graph() {
        _super.apply(this, arguments);
    }
    Graph.prototype.swap = function (routeA, routeB) {
    };
    Graph.prototype.get = function (route) {
        return null;
    };
    return Graph;
}(BaseGraph));
var Node = (function (_super) {
    __extends(Node, _super);
    function Node() {
        _super.apply(this, arguments);
    }
    return Node;
}(BaseNode));
//# sourceMappingURL=base.js.map