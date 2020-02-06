import { TokenType } from './tokenType';
import { Token } from './token';
import { TokenReader } from './tokenReader';

class SimpleToken implements Token {
  public type: TokenType | null = null;
  public text: string | null = null;

  public getType() {
    return this.type;
  }

  public getText() {
    return this.text;
  }
}

const tokens: SimpleToken[] = []; // 保存解析出来的token
let tokenText: string[] = []; // 临时保存token的文本
let token: SimpleToken = new SimpleToken();  // 当前正在解析的token

const enum DfaState {
  Initial,
  If, Id_if1, Id_if2, Else, Id_else1, Id_else2, Id_else3, Id_else4, 
  Int, Id_int1, Id_int2, Id_int3, 
  Id, 
  GT, 
  GE,
  Assignment,
  Plus, Minus, Star, Slash,
  SemiColon,
  LeftParen,
  RightParen,
  IntLiteral,
};

function testCases() {
  // let script: string = 'int age = 24;';
  // let script: string = 'inta age = 24;';
  // let script: string = 'age >= 24;';
  const script: string = 'age > 24;';
  const tokenReader: SimpleTokenReader = tokenSize(script);
  print(tokenReader);
}

/**
 * 解析字符串形成token
 * 这是一个有限自动机，在不同的状态之间迁移
 * @param code 
 */
export function tokenSize(code: string): SimpleTokenReader {
  let ich: number = 0;
  let ch: string = '';
  
  let state: DfaState = DfaState.Initial;

  while(ich < code.length) {
    ch = code[ich++];
    // console.log('********', ch, state);
    switch (state) {
      case DfaState.Initial: 
        state = initToken(ch);
        break;
      case DfaState.Id:
        if (isAlpha(ch) || isDigit(ch)) {
          tokenText.push(ch);
        } else {
          state = initToken(ch);
        }
        break;
      case DfaState.GT:
        if (ch === '=') {
          token.type = TokenType.GE;
          state = DfaState.GE;
          tokenText.push(ch);
        } else {
          state = initToken(ch);
        }
        break;
      case DfaState.GE:
      case DfaState.Assignment:
      case DfaState.Plus:
      case DfaState.Minus:
      case DfaState.Star:
      case DfaState.Slash:
      case DfaState.SemiColon:
      case DfaState.LeftParen:
      case DfaState.RightParen:
        state = initToken(ch);
        break;
      case DfaState.IntLiteral:
        if(isDigit(ch)) {
          tokenText.push(ch);
        } else {
          state = initToken(ch);
        }
        break;
      case DfaState.Id_int1:
        if (ch === 'n') {
          state = DfaState.Id_int2;
          tokenText.push(ch);
        } else if (isAlpha(ch) || isDigit(ch)) {
          state = DfaState.Id;
          tokenText.push(ch);
        } else {
          state = initToken(ch);
        }
        break;
      case DfaState.Id_int2:
        if(ch === 't') {
          state = DfaState.Id_int3;
          tokenText.push(ch);
        } else if (isDigit(ch) || isAlpha(ch)) {
          state = DfaState.Id;
          tokenText.push(ch);
        } else {
          state = initToken(ch);
        }
        break;
      case DfaState.Id_int3:
        if (isBlank(ch)) {
          token.type = TokenType.Int;
          state = initToken(ch);
        } else {
          state = DfaState.Id;
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
  const tokenReader = new SimpleTokenReader(tokens);
  print(tokenReader);
  tokenReader.setPosition(0);
  console.log('=========================>')
  return tokenReader;
}

/**
 * 有限状态机进入初始状态。
 * 这个初始状态其实并不做停留，它马上进入其他状态。
 * 开始解析的时候，进入初始状态；某个Token解析完毕，也进入初始状态，在这里把Token记下来，然后建立一个新的Token。
 * @param ch
 */
function initToken(ch: string): DfaState {
  if (tokenText.length > 0) {
    token.text = tokenText.join('');
    tokens.push(token);
    tokenText = [];
    token = new SimpleToken();
  }
  let newState: DfaState = DfaState.Initial;

  if(isAlpha(ch)) {
    if (ch === 'i') {
      newState = DfaState.Id_int1;
    } else {
      newState = DfaState.Id;
    }
    token.type = TokenType.Identifier;
    tokenText.push(ch);
  } else if (isDigit(ch)) {
    newState = DfaState.IntLiteral;
    token.type = TokenType.IntLiteral;
    tokenText.push(ch);
  } else if (ch === '>') {
    newState = DfaState.GT;
    token.type = TokenType.GT; 
    tokenText.push(ch);
  } else if (ch === '+') {
    newState = DfaState.Plus;
    token.type = TokenType.Plus;
    tokenText.push(ch);
  } else if (ch === '-') {
    newState = DfaState.Minus;
    token.type = TokenType.Minus;
    tokenText.push(ch);
  } else if (ch === '*') {
    newState = DfaState.Star;
    token.type = TokenType.Star;
    tokenText.push(ch);
  } else if (ch === '/') {
    newState = DfaState.Slash;
    token.type = TokenType.Slash;
    tokenText.push(ch);
  } else if (ch === '=') {
    newState = DfaState.Assignment;
    token.type = TokenType.Assignment;
    tokenText.push(ch);
  } else {
    newState = DfaState.Initial;
  }

  return newState;
}

class SimpleTokenReader implements TokenReader {
  public tokens: Token[] | null = null;
  public pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  read(): Token | null {
    if (this.pos < tokens.length) {
      return tokens[this.pos++];
    }
    return null;
  }

  peek(): Token | null {
    if (this.pos < tokens.length) {
      return tokens[this.pos];
    }
    return null;
  }

  unread(): void {
    if (this.pos > 0) {
      this.pos--;
    }
  }

  getPosition(): number {
    return this.pos;
  }

  setPosition(position: number): void {
    this.pos = position;
  }
}

function isAlpha(ch: string): boolean {
  return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z';
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function isBlank(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n';
}

function print(tokenReader: SimpleTokenReader): void {
  let tempToken: Token | null = null;
  while((tempToken = tokenReader.read()) !== null) {
    console.log(tempToken.getText() + '\t\t' + TokenType[tempToken.getType() || 0]);
  }
}

// testCases();