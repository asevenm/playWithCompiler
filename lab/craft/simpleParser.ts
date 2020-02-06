/**
 * 一个简单的语法解析器。
 * 能够解析简单的表达式、变量声明和初始化语句、赋值语句。
 * 它支持的语法规则为：
 * (扩展巴科斯范式（EBNF))
 * programm -> intDeclare | expressionStatement | assignmentStatement
 * intDeclare -> 'int' Id ( = additive) ';'
 * expressionStatement -> addtive ';'
 * addtive -> multiplicative ( (+ | -) multiplicative)*
 * multiplicative -> primary ( (* | /) primary)*
 * primary -> IntLiteral | Id | (additive)
 */

import { ASTNode } from './astNode';
import { ASTNodeType } from './astNodeType';
import { TokenType } from './tokenType'
import { TokenReader } from './tokenReader';
import { Token } from './token';
import { tokenSize } from './simpleLexer';
 
/**
 * 执行脚本并打印出AST和求值过程
 * @param code 
 */
function evaluateAll(code: string): void {
  try {
    const tree: ASTNode = parse(code);
    console.log(tree);
    printAst(tree, '');
    evaluate(tree, '')
  } catch(e) {
    console.log(e);
  }
}
 
/**
 * 解析脚本并返回根节点
 * @param code 
 */
function parse(code: string): ASTNode {
  const tokens: TokenReader = tokenSize(code);
  const rootNode: ASTNode =  prog(tokens);

  return rootNode;
}
 
/**
 * 对某个AST节点求值，并打印求值过程
 * @param node 
 * @param ident 
 */
function evaluate(node: ASTNode, ident: string): number {
  let result: number = 0;

  console.log(ident + 'Calculating: ', ASTNodeType[node.getType()]);

  switch(node.getType()) {
    case ASTNodeType.Programm:
      for (const child of node.getChildren()) {
        result = evaluate(child, ident + '\t');
      }
      break;
    case ASTNodeType.Additive:
      const child1: ASTNode = node.getChildren()[0];
      const value1: number = evaluate(child1, ident + '\t');
      const child2: ASTNode = node.getChildren()[1];
      const value2: number = evaluate(child2, ident + '\t');
      if (node.getText() === '+') {
        result = value1 + value2;
      } else {
        result = value1 - value2;
      }
      break;
    case ASTNodeType.Multiplicative:
      const child3: ASTNode = node.getChildren()[0];
      const value3: number = evaluate(child3, ident + '\t');
      const child4: ASTNode = node.getChildren()[1];
      const value4: number = evaluate(child4, ident + '\t');
      if (node.getText() === '*') {
        result = value3 * value4;
      } else {
        result = value3 / value4;
      }
      break;
    case ASTNodeType.IntDeclaration:
      result = evaluate(node.getChildren()[0], ident + '\t');
      break;
    case ASTNodeType.IntLiteral:
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
function prog(tokens: TokenReader): SimpleASTNode {
  const node: SimpleASTNode = new SimpleASTNode(ASTNodeType.Programm, 'pwc');

  while (tokens.peek() !== null) {
    let child: SimpleASTNode | null = IntDeclare(tokens);
    if (child === null) {
      child = expressionStatement(tokens);
    }
    if (child === null) {
      child = assignmentStatement(tokens);
    }
    if (child !== null) {
      node.addChild(child);
    } else {
      throw new Error("unknown statement");
    }

  }
  
  return node;
}
 
/**
 * 整型变量声明语句
 * @param tokens 
 */
  function IntDeclare(tokens: TokenReader): SimpleASTNode | null {
   let node: SimpleASTNode | null = null;
   let token: Token | null = tokens.peek();
   if (token !== null && token.getType() === TokenType.Int) {
     tokens.read();
     token = tokens.peek();
     if (token?.getType() === TokenType.Identifier) {
       tokens.read();
       node = new SimpleASTNode(ASTNodeType.IntDeclaration, token.getText() || '');
       token = tokens.peek();
       if (token?.getType() === TokenType.Assignment) {
         tokens.read();
         const child: SimpleASTNode | null = additive(tokens);
         if (child === null) {
           throw new Error("invalide variable initialization, expecting an expression");
         } else {
           node.children.push(child);
         }
       }
     } else {
       throw new Error("variable name expected");
     }
 
     if (node !== null) {
       token = tokens.peek();      
       if (token?.getType() === TokenType.SemiColon) {
         tokens.read();
       } else {
         throw new Error("invalid statement, expecting semicolon");
       }
     }
   }
 
   return node;
 }
 
/**
 * 表达式语句（表达式后面跟分号；）
 * expressionStatement -> additive ';'
 * @param tokens 
 */
function expressionStatement(tokens: TokenReader): SimpleASTNode | null {
  const pos: number = tokens.getPosition();
  let node: SimpleASTNode | null = additive(tokens);
  if (node !== null) {
    const token: Token | null = tokens.peek();
    if (token?.getType() === TokenType.SemiColon) {
      tokens.read();
    } else {
      node = null;
      tokens.setPosition(pos);
    }
  }

  return node;
}

/**
 * 赋值语句
 * assignmentStatement -> Id '=' additive
 * @param tokens 
 */
function assignmentStatement(tokens: TokenReader): SimpleASTNode | null {
  let node: SimpleASTNode | null = null;
  let token: Token | null = tokens.peek();

  if (token?.getType() === TokenType.Identifier) {
    tokens.read();
    node = new SimpleASTNode(ASTNodeType.AssignmentStmt, token?.getText() || '')
    token = tokens.peek();
    if (token?.getType() === TokenType.Assignment) {
      tokens.read();
      const child: SimpleASTNode | null = additive(tokens);
      if (child !== null) {
        node.children.push(child);
        token = tokens.peek();
        if (token?.getType() === TokenType.SemiColon) {
          tokens.read();
        } else {
          throw new Error("invalid statement, expecting semicolon");
        }
      } else {
        throw new Error("invalide assignment statement, expecting an expression");
      }
    } else {
      tokens.unread();
      node = null;
    }
  }

  return node;
}

/**
 * 语法解析，加法表达式
 * addtive -> multiplicative ( (+ | -) multiplicative)*
 * @param tokens 
 */
function additive(tokens: TokenReader): SimpleASTNode | null {
  let child1: SimpleASTNode | null = multiplicative(tokens);
  let node: SimpleASTNode | null = child1;
 
  if (child1 !== null) {
    while (true) {
      let token = tokens.peek();
      if (token?.getType() === TokenType.Plus || token?.getType() === TokenType.Minus) {
        tokens.read();
        const child2: SimpleASTNode | null = multiplicative(tokens); 
        if (child2 !== null) {
          node = new SimpleASTNode(ASTNodeType.Additive, token.getText() || '+');
          node.children.push(child1);
          node.children.push(child2);
          child1 = node;
        } else {
          throw new Error('invalid additive expression, expecting the right part.')
        }
      } else {
        break;
      }
    }
  }
  
  return node;
}
 
/**
 * 语法解析，乘法表达式
 * multiplicative -> primary ( (* | /) primary)*
 * @param tokens 
 */
function multiplicative(tokens: TokenReader): SimpleASTNode | null {
  let child1: SimpleASTNode | null = primary(tokens);
  let node: SimpleASTNode | null = child1;
 
  if (child1 !== null) {
    while(true) {
      let token: Token | null = tokens.peek();
      if (token?.getType() ===  TokenType.Star || token?.getType() === TokenType.Slash) {
        tokens.read();
        node = new SimpleASTNode(ASTNodeType.Multiplicative, token.getText() || '*');
        const child2: SimpleASTNode | null = primary(tokens);
        if (child2 !== null) {
          node.children.push(child1);
          node.children.push(child2);
          child1 = node;
        } else {
          throw new Error('invalid multiplicative expression, expecting the right part.')
        }
      } else {
        break;
      }
    }
  }
  
  return node;
}
 
 /**
  * 语法解析，基础表达式
  * @param tokens 
  */
 function primary(tokens: TokenReader): SimpleASTNode | null {
   let node: SimpleASTNode | null = null;
   let token: Token | null = tokens.peek();
   if (token !== null) {
     if (token.getType() === TokenType.IntLiteral) {
       token = tokens.read();
       node = new SimpleASTNode(ASTNodeType.IntLiteral, token?.getText() || '');
     } else if (token.getType() === TokenType.Identifier) {
       token = tokens.read();
       node = new SimpleASTNode(ASTNodeType.Identifier, token?.getText() || '');
     } else if (token.getType() === TokenType.LeftParen) {
       token = tokens.read();
       node = additive(tokens);
       
       if (node !== null) {
         token = tokens.peek();
         if (token?.getType() === TokenType.RightParen) {
           tokens.read(); 
         } else {
           throw new Error("expecting right parenthesis");
         }
       } else {
         throw new Error("expecting an additive expression inside parenthesis");
       }
     }
   }
 
   return node;
 }
 
 class SimpleASTNode implements ASTNode {
   parent: ASTNode | null = null;
   children: ASTNode[] = [];
   nodeType: ASTNodeType = ASTNodeType.Programm;
   text: string = '';
 
   constructor(nodeType: ASTNodeType, text: string) {
     this.nodeType = nodeType;
     this.text = text;
   }
 
 
   getParent(): ASTNode | null {
     return this.parent; 
   }
 
   getChildren(): ASTNode[] {
     return this.children;
   }
 
   getType(): ASTNodeType {
     return this.nodeType;
   }
 
   getText(): string {
     return this.text;
   }
 
   addChild(child: SimpleASTNode): void {
     this.children.push(child);
   }
 }
 
 function printAst(node: ASTNode, ident: string) {
   console.log(ident + ASTNodeType[node.getType()] + ' ' + node.getText());
   for (const child of node.getChildren()) {
     printAst(child, ident + '\t');
   }
 }
 
 // evaluateAll('2 + 3 * 5');
 evaluateAll('int a = 2 + 3 + 5;');