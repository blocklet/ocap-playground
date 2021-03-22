/* eslint-disable no-console */
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const ForgeSDK = require('@ocap/sdk');
const { wallet } = require('../api/libs/auth');
const env = require('../api/libs/env');

const app = ForgeSDK.Wallet.fromJSON(wallet);

(async () => {
  console.log(app.toAddress());
  console.log(ForgeSDK.Util.toBase64(app.publicKey));
  console.log(ForgeSDK.Util.toBase64(app.secretKey));
  try {
    let hash = await ForgeSDK.declare(
      {
        moniker: 'abt_wallet_playground',
        wallet: app,
      },
      { conn: env.chainId }
    );

    console.log(`Application declared on chain ${env.chainId}`, hash);
    process.exit(0);
  } catch (err) {
    console.error(err.errors);
    process.exit(1);
  }
})();
