"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ASTNodeType;
(function (ASTNodeType) {
    ASTNodeType[ASTNodeType["Programm"] = 0] = "Programm";
    ASTNodeType[ASTNodeType["IntDeclaration"] = 1] = "IntDeclaration";
    ASTNodeType[ASTNodeType["ExpressionStmt"] = 2] = "ExpressionStmt";
    ASTNodeType[ASTNodeType["AssignmentStmt"] = 3] = "AssignmentStmt";
    ASTNodeType[ASTNodeType["Primary"] = 4] = "Primary";
    ASTNodeType[ASTNodeType["Multiplicative"] = 5] = "Multiplicative";
    ASTNodeType[ASTNodeType["Additive"] = 6] = "Additive";
    ASTNodeType[ASTNodeType["Identifier"] = 7] = "Identifier";
    ASTNodeType[ASTNodeType["IntLiteral"] = 8] = "IntLiteral"; //整型字面量
})(ASTNodeType = exports.ASTNodeType || (exports.ASTNodeType = {}));
