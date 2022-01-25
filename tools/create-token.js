/* eslint-disable no-console */
require('dotenv').config();

const { wallet, client } = require('../api/libs/auth');
const itx = require('../api/libs/token');

(async () => {
  const totalSupply = 1000000000; // 1 billion
  const faucetSupply = 100000000; // 0.1 billion

  console.log({ totalSupply, faucetSupply });

  // Transfer to application
  const hash = await client.sendCreateTokenTx({
    tx: { itx },
    wallet,
  });

  console.log('token created', { hash, itx });
})();
