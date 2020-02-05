"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokenType_1 = require("./tokenType");
var SimpleToken = /** @class */ (function () {
    function SimpleToken() {
        this.type = null;
        this.text = null;
    }
    SimpleToken.prototype.getType = function () {
        return this.type;
    };
    SimpleToken.prototype.getText = function () {
        return this.text;
    };
    return SimpleToken;
}());
var tokens = []; // 保存解析出来的token
var tokenText = []; // 临时保存token的文本
var token = new SimpleToken(); // 当前正在解析的token
var SimpleTokenReader = /** @class */ (function () {
    function SimpleTokenReader(tokens) {
        this.tokens = null;
        this.pos = 0;
        this.tokens = tokens;
    }
    SimpleTokenReader.prototype.read = function () {
        if (this.pos < tokens.length) {
            return tokens[this.pos++];
        }
        return null;
    };
    SimpleTokenReader.prototype.peek = function () {
        if (this.pos < tokens.length) {
            return tokens[this.pos];
        }
        return null;
    };
    SimpleTokenReader.prototype.unread = function () {
        if (this.pos > 0) {
            this.pos--;
        }
    };
    SimpleTokenReader.prototype.getPosition = function () {
        return this.pos;
    };
    SimpleTokenReader.prototype.setPosition = function (position) {
        this.pos = position;
    };
    return SimpleTokenReader;
}());
;
function testCases() {
    // let script: string = 'int age = 24;';
    // let script: string = 'inta age = 24;';
    // let script: string = 'age >= 24;';
    var script = 'age > 24;';
    var tokenReader = tokenSize(script);
    print(tokenReader);
}
/**
 * 解析字符串形成token
 * 这是一个有限自动机，在不同的状态之间迁移
 * @param code
 */
function tokenSize(code) {
    var ich = 0;
    var ch = '';
    var state = 0 /* Initial */;
    while (ich < code.length) {
        ch = code[ich++];
        console.log('********', ch, state);
        switch (state) {
            case 0 /* Initial */:
                state = initToken(ch);
                break;
            case 13 /* Id */:
                if (isAlpha(ch) || isDigit(ch)) {
                    tokenText.push(ch);
                }
                else {
                    state = initToken(ch);
                }
                break;
            case 14 /* GT */:
                if (ch === '=') {
                    token.type = tokenType_1.TokenType.GE;
                    state = 15 /* GE */;
                    tokenText.push(ch);
                }
                else {
                    state = initToken(ch);
                }
                break;
            case 15 /* GE */:
            case 16 /* Assignment */:
            case 17 /* Plus */:
            case 18 /* Minus */:
            case 19 /* Star */:
            case 20 /* Slash */:
            case 21 /* SemiColon */:
            case 22 /* LeftParen */:
            case 23 /* RightParen */:
                state = initToken(ch);
                break;
            case 24 /* IntLiteral */:
                if (isDigit(ch)) {
                    tokenText.push(ch);
                }
                else {
                    state = initToken(ch);
                }
                break;
            case 10 /* Id_int1 */:
                if (ch === 'n') {
                    state = 11 /* Id_int2 */;
                    tokenText.push(ch);
                }
                else if (isAlpha(ch) || isDigit(ch)) {
                    state = 13 /* Id */;
                    tokenText.push(ch);
                }
                else {
                    state = initToken(ch);
                }
                break;
            case 11 /* Id_int2 */:
                if (ch === 't') {
                    state = 12 /* Id_int3 */;
                    tokenText.push(ch);
                }
                else if (isDigit(ch) || isAlpha(ch)) {
                    state = 13 /* Id */;
                    tokenText.push(ch);
                }
                else {
                    state = initToken(ch);
                }
                break;
            case 12 /* Id_int3 */:
                if (isBlank(ch)) {
                    token.type = tokenType_1.TokenType.Int;
                    state = initToken(ch);
                }
                else {
                    state = 13 /* Id */;
                    tokenText.push(ch);
                }
                break;
            default:
                break;
        }
    }
    if (tokenText.length > 0) {
        initToken(ch);
    }
    return new SimpleTokenReader(tokens);
}
function initToken(ch) {
    if (tokenText.length > 0) {
        token.text = tokenText.join('');
        tokens.push(token);
        tokenText = [];
        token = new SimpleToken();
    }
    var newState = 0 /* Initial */;
    if (isAlpha(ch)) {
        if (ch === 'i') {
            newState = 10 /* Id_int1 */;
        }
        else {
            newState = 13 /* Id */;
        }
        token.type = tokenType_1.TokenType.Identifier;
        tokenText.push(ch);
    }
    else if (isDigit(ch)) {
        newState = 24 /* IntLiteral */;
        token.type = tokenType_1.TokenType.IntLiteral;
        tokenText.push(ch);
    }
    else if (ch === '>') {
        newState = 14 /* GT */;
        token.type = tokenType_1.TokenType.GT;
        tokenText.push(ch);
    }
    else if (ch === '+') {
        newState = 17 /* Plus */;
        token.type = tokenType_1.TokenType.Plus;
        tokenText.push(ch);
    }
    else if (ch === '-') {
        newState = 18 /* Minus */;
        token.type = tokenType_1.TokenType.Minus;
        tokenText.push(ch);
    }
    else if (ch === '*') {
        newState = 19 /* Star */;
        token.type = tokenType_1.TokenType.Star;
        tokenText.push(ch);
    }
    else if (ch === '/') {
        newState = 20 /* Slash */;
        token.type = tokenType_1.TokenType.Slash;
        tokenText.push(ch);
    }
    else if (ch === '=') {
        newState = 16 /* Assignment */;
        token.type = tokenType_1.TokenType.Assignment;
        tokenText.push(ch);
    }
    else {
        newState = 0 /* Initial */;
    }
    return newState;
}
function isAlpha(ch) {
    return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z';
}
function isDigit(ch) {
    return ch >= '0' && ch <= '9';
}
function isBlank(ch) {
    return ch === ' ' || ch === '\t' || ch === '\n';
}
function print(tokenReader) {
    var tempToken = null;
    while ((tempToken = tokenReader.read()) !== null) {
        console.log(tempToken.getText() + '\t\t' + tempToken.getType());
    }
}
testCases();
