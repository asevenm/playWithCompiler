import { TokenType } from './tokenType';
export interface Token {
  getType: () => TokenType | null;
  getText: () => string | null;
};