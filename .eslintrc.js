module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jsdoc',
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    "@typescript-eslint/no-unused-vars": 0,
    "import/prefer-default-export": 0,
    "import/no-cycle": 0,
    "react/jsx-filename-extension": 0,
    "class-methods-use-this": 0,
    "max-len": [
      "error", {
        "code": 150,
        "ignoreComments": true,
        "ignoreTrailingComments": true,
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignoreRegExpLiterals": true
      }
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  }
};
