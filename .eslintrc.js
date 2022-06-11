module.exports = {
  root: true,
  extends: '@arcblock/eslint-config',
  globals: {
    logger: true,
  },
  rules: {
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          kebabCase: true,
        },
        ignore: ['setupProxy.js', 'App.test.js'],
      },
    ],
  },
};
