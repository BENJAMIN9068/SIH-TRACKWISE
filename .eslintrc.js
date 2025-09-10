module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'off',
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'eol-last': ['error', 'always'],
    'comma-trailing': 'off',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': ['error', 'always'],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'space-infix-ops': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'public/',
    'views/',
  ],
};
