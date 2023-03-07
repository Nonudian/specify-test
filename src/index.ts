import set from 'lodash.set';

type TokenType = 'color' | 'dimension';

type Token = {
  $type: TokenType;
  $value: string;
};

type TokenTree = { [key: string]: TokenTree | Token };

function parseTokenTree(
  tokenTree: TokenTree,
  opts: {
    resolveAliases?: boolean;
    publishMetadata?: boolean;
  }
) /*: ParsedTokenTree */ {
  const analyzedTokenTree = Object.entries(tokenTree).flatMap(analyzeTokenTree);

  const newTokenTree = tokenTree;

  if (opts.publishMetadata) {
    analyzedTokenTree.forEach(({ $name, $kind }) => {
      set(newTokenTree, [...$name, '$kind'], $kind);
      set(newTokenTree, [...$name, '$name'], $name.join('.'));
    });
  }

  console.log(analyzedTokenTree);

  console.log(newTokenTree);
}
type AnalyzedToken = {
  $kind: 'token' | 'alias';
  $name: Array<string>;
  $type: TokenType;
  $value: string;
};

type AnalyzedGroup = {
  $kind: 'group';
  $name: Array<string>;
};

function isToken(value: TokenTree[number]): value is Token {
  return '$type' in value;
}

function analyzeTokenTree([name, value]: [string, TokenTree[number]]): Array<
  AnalyzedToken | AnalyzedGroup
> {
  if (isToken(value))
    return [
      {
        $kind: 'token',
        $name: [name],
        $type: value.$type,
        $value: value.$value,
      },
    ];

  return [
    {
      $kind: 'group',
      $name: [name],
    },
    ...Object.entries(value)
      .flatMap(analyzeTokenTree)
      .map(({ $name, ...rest }) => ({
        $name: [name, ...$name],
        ...rest,
      })),
  ];
}

/* --------------------------------------------------------------------------- */

const givenTokenTree = {
  colors: {
    primary: {
      $type: 'color',
      $value: '#002233',
    },
    secondary: {
      $type: 'color',
      $value: '#11A766',
    },
  },
  'derived colors': {
    basis: {
      $type: 'color',
      $value: '{colors.primary}',
    },
  },
} as const;

parseTokenTree(givenTokenTree, { publishMetadata: true });
// parseTokenTree(givenTokenTree, { resolveAliases: true, publishMetadata: true });
