import cloneDeep from 'lodash.clonedeep';
import get from 'lodash.get';
import set from 'lodash.set';
import type { AnalyzedGroup, AnalyzedToken, Token, TokenTree } from './types';

export function parseTokenTree(
  tokenTree: TokenTree,
  opts: {
    resolveAliases?: boolean;
    publishMetadata?: boolean;
  }
) /*: ParsedTokenTree */ {
  const clonedTokenTree = cloneDeep(tokenTree);

  const analyzedTokenTree =
    Object.entries(clonedTokenTree).flatMap(analyzeTokenTree);

  if (opts.publishMetadata) {
    analyzedTokenTree.forEach(({ $name, $kind }) => {
      set(clonedTokenTree, [...$name, '$kind'], $kind);
      set(clonedTokenTree, [...$name, '$name'], $name.join('.'));
    });
  }

  if (opts.resolveAliases) {
    analyzedTokenTree
      .filter(isAnalyzedToken)
      .filter((token) => token.$aliased)
      .forEach(({ $name, $value, $type }) => {
        const aliasName = $value.replace('{', '').replace('}', '');

        const absoluteValue = get(clonedTokenTree, aliasName.concat('.$value'));

        set(
          clonedTokenTree,
          [...$name, '$value'],
          opts.publishMetadata
            ? {
                $kind: 'alias',
                $name: aliasName,
                $type: $type,
                $value: absoluteValue,
              }
            : absoluteValue
        );
      });
  }

  return clonedTokenTree;
}

function isToken(value: TokenTree[number]): value is Token {
  return '$type' in value;
}

function isAnalyzedToken(
  value: ReturnType<typeof analyzeTokenTree>[number]
): value is AnalyzedToken {
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
        $aliased: !!value.$value.match(/^\{(.+)\}$/i),
      },
    ];

  return [
    {
      $kind: 'group',
      $name: [name],
    },
    ...Object.entries(value)
      .flatMap(analyzeTokenTree)
      .map(({ $name, ...properties }) => ({
        $name: [name, ...$name],
        ...properties,
      })),
  ];
}
