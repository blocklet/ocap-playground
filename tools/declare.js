/* eslint-disable no-console */
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const { wallet, client } = require('../api/libs/auth');
const env = require('../api/libs/env');

(async () => {
  console.log(wallet.address);
  try {
    const hash = await client.declare({
      moniker: 'abt_wallet_playground',
      wallet,
    });

    console.log(`Application declared on chain ${env.chainId}`, hash);
    process.exit(0);
  } catch (err) {
    console.error(err.errors);
    process.exit(1);
  }
})();
