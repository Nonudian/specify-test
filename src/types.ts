export type TokenType = 'color' | 'dimension';

export type Token = {
  $type: TokenType;
  $value: string;
};

export type TokenTree = { [key: string]: TokenTree | Token };

export type AnalyzedToken = {
  $kind: 'token' | 'alias';
  $name: Array<string>;
  $type: TokenType;
  $value: string;
  $aliased: boolean;
};

export type AnalyzedGroup = {
  $kind: 'group';
  $name: Array<string>;
};
