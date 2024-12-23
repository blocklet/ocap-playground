/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
require('dotenv').config();

global.logger = console;

const { name, version } = require('../package.json');
const { server, app } = require('./functions/app');

const port = parseInt(process.env.BLOCKLET_PORT, 10);
if (isNaN(port)) {
  throw new Error('Can not start api server without a valid port');
}

server.listen(port, err => {
  if (err) throw err;
  console.log(`> ${name} v${version} ready on ${port}`);
});

module.exports = { server, app };
