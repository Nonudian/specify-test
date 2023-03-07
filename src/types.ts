/**
 * Different handled token type from DTCG format.
 */
export type TokenType = 'color' | 'dimension';

/**
 * Token definition from DTCG format.
 */
export type Token = {
  $type: TokenType;
  $value: string;
};

/**
 * Recursive DTCG object where value could be a deep DTCG object or a DTCG token.
 */
export type TokenTree = { [key: string]: TokenTree | Token };

/**
 * Shortcut type for DTCG value `TokenTree | Token`.
 */
export type TokenTreeValue = TokenTree[number];

type AnalyzedBase = {
  $name: Array<string>;
};

/**
 * Token output data after DTCG analysis.
 */
export type AnalyzedToken = AnalyzedBase & {
  $kind: 'token';
  $type: TokenType;
  $value: string;
  $aliased: boolean;
};

/**
 * Group output data after DTCG analysis.
 */
export type AnalyzedGroup = AnalyzedBase & {
  $kind: 'group';
};

type WithMetadata = {
  $kind: AnalyzedToken['$kind'] | AnalyzedGroup['$kind'] | 'alias';
  $name: string;
};

/**
 * Final parsed DTCG token tree.
 * It could be the same type as initially, or a more complex object with metadata, according to specifying options.
 */
export type ParsedTokenTree =
  | TokenTree
  | {
      [key: string]: (TokenTree & WithMetadata) | (Token & WithMetadata);
    };
