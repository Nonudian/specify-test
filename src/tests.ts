import { parseTokenTree } from './algorithm';

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

console.log(
  parseTokenTree(givenTokenTree, {
    resolveAliases: true,
    publishMetadata: true,
  })['derived colors']
);
