"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var astNodeType_1 = require("./astNodeType");
var tokenType_1 = require("./tokenType");
var simpleLexer_1 = require("./simpleLexer");
/**
 * 执行脚本并打印出AST和求值过程
 * @param code
 */
function evaluateAll(code) {
    try {
        var tree = parse(code);
        printAst(tree, '');
        evaluate(tree, '');
    }
    catch (e) {
        console.log(e);
    }
}
/**
 * 解析脚本并返回根节点
 * @param code
 */
function parse(code) {
    var tokens = simpleLexer_1.tokenSize(code);
    var rootNode = prog(tokens);
    return rootNode;
}
/**
 * 对某个AST节点求值，并打印求值过程
 * @param node
 * @param ident
 */
function evaluate(node, ident) {
    var e_1, _a;
    var result = 0;
    console.log(ident + 'Calculating: ', astNodeType_1.ASTNodeType[node.getType()]);
    switch (node.getType()) {
        case astNodeType_1.ASTNodeType.Programm:
            try {
                for (var _b = __values(node.getChildren()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var child = _c.value;
                    result = evaluate(child, ident + '\t');
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            break;
        case astNodeType_1.ASTNodeType.Additive:
            var child1 = node.getChildren()[0];
            var value1 = evaluate(child1, ident + '\t');
            var child2 = node.getChildren()[1];
            var value2 = evaluate(child2, ident + '\t');
            if (node.getText() === '+') {
                result = value1 + value2;
            }
            else {
                result = value1 - value2;
            }
            break;
        case astNodeType_1.ASTNodeType.Multiplicative:
            var child3 = node.getChildren()[0];
            var value3 = evaluate(child3, ident + '\t');
            var child4 = node.getChildren()[1];
            var value4 = evaluate(child4, ident + '\t');
            if (node.getText() === '*') {
                result = value3 * value4;
            }
            else {
                result = value3 / value4;
            }
            break;
        case astNodeType_1.ASTNodeType.IntLiteral:
            result = Number(node.getText());
            break;
        default:
            break;
    }
    console.log(ident + 'Result: ', result);
    return result;
}
/**
 * 语法解析，获得根节点
 * @param tokens
 */
function prog(tokens) {
    var node = new SimpleASTNode(astNodeType_1.ASTNodeType.Programm, 'Calculator');
    var child = additive(tokens);
    if (child !== null) {
        node.addChild(child);
    }
    return node;
}
/**
 * 整型变量声明语句
 * @param tokens
 */
function IntDeclare(tokens) {
    var _a, _b, _c;
    var node = null;
    var token = tokens.peek();
    if (token !== null && token.getType() === tokenType_1.TokenType.Int) {
        tokens.read();
        token = tokens.read();
        if (((_a = token) === null || _a === void 0 ? void 0 : _a.getType()) === tokenType_1.TokenType.Identifier) {
            tokens.read();
            node = new SimpleASTNode(astNodeType_1.ASTNodeType.IntDeclaration, token.getText() || '');
            token = tokens.peek();
            if (((_b = token) === null || _b === void 0 ? void 0 : _b.getType()) === tokenType_1.TokenType.Assignment) {
                tokens.read();
                var child = additive(tokens);
                if (child === null) {
                    throw new Error("invalide variable initialization, expecting an expression");
                }
            }
        }
        else {
            throw new Error("variable name expected");
        }
        if (node !== null) {
            token = tokens.peek();
            if (((_c = token) === null || _c === void 0 ? void 0 : _c.getType()) === tokenType_1.TokenType.SemiColon) {
                tokens.read();
            }
            else {
                throw new Error("invalid statement, expecting semicolon");
            }
        }
    }
    return node;
}
/**
 * 语法解析，加法表达式
 * additiveExpression -> multiplicativeExpression | multiplicativeExpress + additiveExpression
 * @param tokens
 */
function additive(tokens) {
    var _a;
    var child1 = multiplicative(tokens);
    var node = child1;
    var token = tokens.peek();
    if (token !== null && child1 !== null) {
        if (token.getType() === tokenType_1.TokenType.Plus || token.getType() === tokenType_1.TokenType.Minus) {
            token = tokens.read();
            var child2 = additive(tokens);
            if (child2 !== null) {
                node = new SimpleASTNode(astNodeType_1.ASTNodeType.Additive, ((_a = token) === null || _a === void 0 ? void 0 : _a.getText()) || '+');
                node.children.push(child1);
                node.children.push(child2);
            }
            else {
                throw new Error('invalid additive expression, expecting the right part.');
            }
        }
    }
    return node;
}
/**
 * 语法解析，乘法表达式
 * multipticativeExpression -> primary | multipticativeExpression * primary
 * @param tokens
 */
function multiplicative(tokens) {
    var _a;
    var child1 = primary(tokens);
    var node = child1;
    var token = tokens.peek();
    if (token !== null && child1 !== null) {
        if (token.getType() === tokenType_1.TokenType.Star || token.getType() === tokenType_1.TokenType.Slash) {
            token = tokens.read();
            var child2 = multiplicative(tokens);
            if (child2 !== null) {
                node = new SimpleASTNode(astNodeType_1.ASTNodeType.Multiplicative, ((_a = token) === null || _a === void 0 ? void 0 : _a.getText()) || '*');
                node.children.push(child1);
                node.children.push(child2);
            }
            else {
                throw new Error('invalid multiplicative expression, expecting the right part.');
            }
        }
    }
    return node;
}
/**
 * 语法解析，基础表达式
 * @param tokens
 */
function primary(tokens) {
    var _a, _b, _c;
    var node = null;
    var token = tokens.peek();
    if (token !== null) {
        if (token.getType() === tokenType_1.TokenType.IntLiteral) {
            token = tokens.read();
            node = new SimpleASTNode(astNodeType_1.ASTNodeType.IntLiteral, ((_a = token) === null || _a === void 0 ? void 0 : _a.getText()) || '');
        }
        else if (token.getType() === tokenType_1.TokenType.Identifier) {
            token = tokens.read();
            node = new SimpleASTNode(astNodeType_1.ASTNodeType.Identifier, ((_b = token) === null || _b === void 0 ? void 0 : _b.getText()) || '');
        }
        else if (token.getType() === tokenType_1.TokenType.LeftParen) {
            token = tokens.read();
            node = additive(tokens);
            if (node !== null) {
                token = tokens.peek();
                if (((_c = token) === null || _c === void 0 ? void 0 : _c.getType()) === tokenType_1.TokenType.RightParen) {
                    tokens.read();
                }
                else {
                    throw new Error("expecting right parenthesis");
                }
            }
            else {
                throw new Error("expecting an additive expression inside parenthesis");
            }
        }
    }
    return node;
}
var SimpleASTNode = /** @class */ (function () {
    function SimpleASTNode(nodeType, text) {
        this.parent = null;
        this.children = [];
        this.nodeType = astNodeType_1.ASTNodeType.Programm;
        this.text = '';
        this.nodeType = nodeType;
        this.text = text;
    }
    SimpleASTNode.prototype.getParent = function () {
        return this.parent;
    };
    SimpleASTNode.prototype.getChildren = function () {
        return this.children;
    };
    SimpleASTNode.prototype.getType = function () {
        return this.nodeType;
    };
    SimpleASTNode.prototype.getText = function () {
        return this.text;
    };
    SimpleASTNode.prototype.addChild = function (child) {
        this.children.push(child);
    };
    return SimpleASTNode;
}());
function printAst(node, ident) {
    var e_2, _a;
    console.log(ident + astNodeType_1.ASTNodeType[node.getType()] + ' ' + node.getText());
    try {
        for (var _b = __values(node.getChildren()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            printAst(child, ident + '\t');
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
evaluateAll('2 + 3 * 5');
