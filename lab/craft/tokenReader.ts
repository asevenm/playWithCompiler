import { Token } from './token';

// 一个Token流。由Lexer生成。Parser可以从中获取Token
export interface TokenReader {
  // 返回token流中的下一个token，并从流中取出，如果流已经为空，则返回null; 
  read: () => Token | null;

  // 返回token流中的下一个token，但不从流中取出，如果流已经为空，则返回null; 
  peek: () => Token | null;

  // token流回退一步，恢复原来的token
  unread: () => void;

  // 获取token流当前的读取位置
  getPosition: () => number;

  // 设置当前token流的读取位置
  setPosition: (position: number) => void;
}