/* eslint-disable no-restricted-globals */
const proxy = require('http-proxy-middleware');

if (isNaN(process.env.APP_PORT)) {
  throw new Error('Can not start dev server without a valid port');
}

module.exports = app => {
  app.use(proxy('/api', { target: `http://127.0.0.1:${process.env.APP_PORT}` }));
};
