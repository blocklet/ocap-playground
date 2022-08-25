const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const { override, overrideDevServer, addWebpackPlugin } = require('customize-cra');

const devServerConfig = () => config => {
  return config;
};

const isEnvDevelopment = process.env.NODE_ENV === 'development';

// TODO: maximumFileSizeToCacheInBytes 需要看看如何处理
const swPlugin = new WorkboxWebpackPlugin.InjectManifest({
  swSrc: './src/service-worker.js',
  dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
  exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});

module.exports = {
  webpack: override(isEnvDevelopment && addWebpackPlugin(swPlugin)),
  devServer: overrideDevServer(devServerConfig()),
};
