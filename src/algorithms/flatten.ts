import type {
  AnalyzedGroup,
  AnalyzedToken,
  Token,
  TokenTreeValue,
} from '../types';

/**
 * Check whether a value from a DTCG token tree level is a final token, by verifying presence of the `$type` required property.
 */
const isToken = (value: TokenTreeValue): value is Token => {
  return '$type' in value;
};

/**
 * Recursive algorithm for flattening each token tree level, with base case as `token` and recursive case as `group`.
 * @returns one array of flattened DTCG token tree.
 */
export const flattenTokenTree = ([name, value]: [
  string,
  TokenTreeValue
]): Array<AnalyzedToken | AnalyzedGroup> => {
  //base case: a token
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

  //recursive case: a group
  return [
    {
      $kind: 'group',
      $name: [name],
    },
    ...Object.entries(value)
      .flatMap(flattenTokenTree)
      .map(({ $name, ...properties }) => ({
        $name: [name, ...$name],
        ...properties,
      })),
  ];
};
