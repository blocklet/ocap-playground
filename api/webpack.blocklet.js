
module.exports = {
  optimization: {
    nodeEnv: process.env.NODE_ENV || false, // @link https://github.com/webpack/webpack/issues/7470#issuecomment-394259698
  },
  resolve: {
    alias: {
      axios: require.resolve('axios'),
      debug: require.resolve('debug'),
      require_optional: require.resolve('./require-optional.mock.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.txt$/i,
        use: 'raw-loader',
      },
    ],
  },
};
