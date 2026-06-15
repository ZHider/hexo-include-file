const hexoConfig = require('eslint-config-hexo/eslint');
const hexoTestConfig = require('eslint-config-hexo/test');

module.exports = [
  ...hexoConfig.map(config => ({
    ...config,
    files: ['lib/**/*.js'],
  })),
  {
    files: ['lib/**/*.js'],
    languageOptions: {
      globals: {
        hexo: 'readonly',
      },
    },
    rules: {
      'n/no-unpublished-require': 'off',
    },
  },
  ...hexoTestConfig.map(config => ({
    ...config,
    files: ['test/**/*.js'],
  })),
  {
    files: ['test/**/*.js'],
    rules: {
      'n/no-unpublished-require': 'off',
    },
    languageOptions: {
      globals: {
        hexo: 'readonly',
        mocha: 'readonly',
      },
    },
  },
];
