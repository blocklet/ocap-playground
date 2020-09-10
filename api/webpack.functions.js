// const nodeExternals = require('webpack-node-externals');

module.exports = {
  optimization: { minimize: process.env.NODE_ENV === 'production' },
  // externals: [nodeExternals()],
  resolve: {
    alias: {
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
