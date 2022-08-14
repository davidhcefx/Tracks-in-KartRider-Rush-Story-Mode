module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-multi-spaces': [
      'error',
      { ignoreEOLComments: true },  // we need two spaces before comment
    ],
    'quote-props': 'warn',  // quoted object properties is accepted
    'linebreak-style': 'warn',  // CRLF linebreaks are accepted
    'nonblock-statement-body-position': 'warn',  // allow statement below if
    curly: ['error', 'multi-line', 'consistent'],  // enforce curly except single line
    'no-console': 'off',  // node.js project
  },
};
