import { parseTokenTree } from './algorithms/parse';

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

const whereWithResolvedAliases = parseTokenTree(givenTokenTree, {
  resolveAliases: true,
});

const whereWithMetadata = parseTokenTree(givenTokenTree, {
  publishMetadata: true,
});

const whereWithResolvedAliasesAndMetadata = parseTokenTree(givenTokenTree, {
  resolveAliases: true,
  publishMetadata: true,
});

console.log(whereWithResolvedAliases);
console.log(whereWithMetadata);
console.log(whereWithResolvedAliasesAndMetadata);
