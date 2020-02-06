import { ASTNodeType } from './astNodeType';

export interface ASTNode {
  getParent: () => ASTNode | null;

  getChildren: () => ASTNode[];

  getType: () => ASTNodeType;

  getText: () => string | null;
}