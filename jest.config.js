module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!node-fetch)"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleNameMapper: {
    '^node-fetch$': require.resolve('node-fetch'),
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      stringifyContentPathRegex: '\\.html$',
    },
  },
  
};