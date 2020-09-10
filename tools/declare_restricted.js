/* eslint-disable no-console */
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const ForgeSDK = require('@arcblock/forge-sdk');
const { wallet } = require('../api/libs/auth');
const env = require('../api/libs/env');

const app = ForgeSDK.Wallet.fromJSON(wallet);

(async () => {
  console.log(app.toAddress());
  try {
    // change this to your chain moderator sk before run the script
    const issuerSk = ForgeSDK.Util.fromBase64('');

    const issuer = ForgeSDK.Wallet.fromSecretKey(issuerSk);
    console.log(issuer.toJSON());

    // Sign and then send: sendDeclareTx
    const tx1 = await ForgeSDK.prepareDeclare(
      {
        issuer: issuer.toAddress(),
        moniker: 'user',
        wallet: app,
      },
      { conn: env.chainId }
    );
    const tx2 = await ForgeSDK.finalizeDeclare(
      {
        tx: tx1,
        wallet: issuer,
      },
      { conn: env.chainId }
    );

    let hash = await ForgeSDK.sendDeclareTx({ tx: tx2, wallet: issuer }, { conn: env.chainId });
    console.log(`Application declared on chain ${env.chainId}`, hash);

    if (env.assetChainId) {
      hash = await ForgeSDK.declare(
        {
          moniker: 'abt_wallet_playground',
          wallet: app,
        },
        { conn: env.assetChainId }
      );
      console.log(`Application declared on chain ${env.assetChainId}`, hash);
    }

    process.exit(0);
  } catch (err) {
    console.error(err.errors);
    process.exit(1);
  }
})();
