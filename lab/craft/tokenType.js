"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Plus"] = 0] = "Plus";
    TokenType[TokenType["Minus"] = 1] = "Minus";
    TokenType[TokenType["Star"] = 2] = "Star";
    TokenType[TokenType["Slash"] = 3] = "Slash";
    TokenType[TokenType["GE"] = 4] = "GE";
    TokenType[TokenType["GT"] = 5] = "GT";
    TokenType[TokenType["EQ"] = 6] = "EQ";
    TokenType[TokenType["LE"] = 7] = "LE";
    TokenType[TokenType["LT"] = 8] = "LT";
    TokenType[TokenType["SemiColon"] = 9] = "SemiColon";
    TokenType[TokenType["LeftParen"] = 10] = "LeftParen";
    TokenType[TokenType["RightParen"] = 11] = "RightParen";
    TokenType[TokenType["Assignment"] = 12] = "Assignment";
    TokenType[TokenType["If"] = 13] = "If";
    TokenType[TokenType["Else"] = 14] = "Else";
    TokenType[TokenType["Int"] = 15] = "Int";
    TokenType[TokenType["Identifier"] = 16] = "Identifier";
    TokenType[TokenType["IntLiteral"] = 17] = "IntLiteral";
    TokenType[TokenType["StringLiteral"] = 18] = "StringLiteral"; //字符串字面量
})(TokenType = exports.TokenType || (exports.TokenType = {}));
;
