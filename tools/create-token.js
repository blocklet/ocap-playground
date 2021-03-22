/* eslint-disable no-console */
require('dotenv').config();

const SDK = require('@ocap/sdk');

const { wallet } = require('../api/libs/auth');
const itx = require('../api/libs/token');

(async () => {
  const app = SDK.Wallet.fromJSON(wallet);

  const totalSupply = 1000000000; // 1 billion
  const faucetSupply = 100000000; // 0.1 billion

  console.log({ totalSupply, faucetSupply });

  // Transfer to application
  const hash = await SDK.sendCreateTokenTx({
    tx: { itx },
    wallet: app,
  });

  console.log('token created', { hash, itx });
})();
