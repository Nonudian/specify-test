import cloneDeep from 'lodash.clonedeep';
import get from 'lodash.get';
import set from 'lodash.set';
import type { AnalyzedToken, ParsedTokenTree, TokenTree } from '../types';
import { flattenTokenTree } from './flatten';

/**
 * Check whether a value from {@link flattenTokenTree} analysis result is a token, by verifying presence of the `$type` required property.
 */
const isAnalyzedToken = (
  value: ReturnType<typeof flattenTokenTree>[number]
): value is AnalyzedToken => {
  return '$type' in value;
};

/**
 * Parse a given DTCG token tree into some new object, according to specifying options.
 *
 * Given `resolveAliases` could allow replacing aliases by its absolute found values from DTCG object.
 * @example
 * ```ts
 * const tokenTree = {
 *   'first-color': {
 *     $type: 'color',
 *     $value: '#11A766',
 *   },
 *   'second-color': {
 *     $type: 'color',
 *     $value: '{first-color}', // <-- alias, will be replaced by '#11A766'
 *   }
 * }
 * ```
 *
 * Given `publishMetadata` could allow adding some metadata from DTCG object, like `$kind` and `$name`.
 * @example
 * ```ts
 * const tokenTree = {
 *   colors: {
 *     $kind: 'group',
 *     $name: 'colors',
 *     primary: {
 *       $kind: 'token',
 *       $name: 'colors.primary',
 *       $type: 'color',
 *       $value: '#002233',
 *     },
 *     secondary: {
 *       $kind: 'token',
 *       $name: 'colors.secondary',
 *       $type: 'color',
 *       $value: '#11A766',
 *     },
 *   }
 * }
 * ```
 *
 * Given both could just change the absolute value to more complex value for aliases, like this.
 * @example
 * ```ts
 * 'second-color': {
 *   $kind: 'token',
 *   $name: 'colors.secondary',
 *   $type: 'color',
 *   $value: { // <-- from initial '{first-color}' value
 *      $kind: 'alias',
 *      $name: 'colors.primary',
 *      $type: 'color',
 *      $value: '#002233',
 *   },
 * }
 * ```
 */
export const parseTokenTree = (
  tokenTree: TokenTree,
  opts: {
    resolveAliases?: boolean;
    publishMetadata?: boolean;
  }
): ParsedTokenTree => {
  const clonedTokenTree = cloneDeep(tokenTree);

  const flattenedTokenTree =
    Object.entries(clonedTokenTree).flatMap(flattenTokenTree);

  if (opts.publishMetadata) {
    flattenedTokenTree.forEach(({ $name, $kind }) => {
      set(clonedTokenTree, [...$name, '$kind'], $kind);
      set(clonedTokenTree, [...$name, '$name'], $name.join('.'));
    });
  }

  if (opts.resolveAliases) {
    flattenedTokenTree
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
};
