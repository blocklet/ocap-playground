/* eslint-disable no-console */
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const SDK = require('@ocap/sdk');
const { wallet } = require('../api/libs/auth');
const env = require('../api/libs/env');

const app = SDK.Wallet.fromJSON(wallet);

(async () => {
  console.log(app.toAddress());
  console.log(SDK.Util.toBase64(app.publicKey));
  console.log(SDK.Util.toBase64(app.secretKey));
  try {
    const hash = await SDK.declare({
      moniker: 'abt_wallet_playground',
      wallet: app,
    });

    console.log(`Application declared on chain ${env.chainId}`, hash);
    process.exit(0);
  } catch (err) {
    console.error(err.errors);
    process.exit(1);
  }
})();
