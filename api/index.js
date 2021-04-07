/* eslint-disable no-console */
require('dotenv').config();

const { name, version } = require('../package.json');
const { server } = require('./functions/app');

const port = parseInt(process.env.BLOCKLET_PORT || 3030, 10);
server.listen(port, err => {
  if (err) throw err;
  console.log(`> ${name} v${version} ready on ${port}`);
});
