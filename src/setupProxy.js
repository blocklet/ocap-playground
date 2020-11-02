const proxy = require('http-proxy-middleware');

module.exports = app => {
  app.use(proxy('/api', { target: `http://127.0.0.1:${process.env.APP_PORT || 3030}` }));
};
