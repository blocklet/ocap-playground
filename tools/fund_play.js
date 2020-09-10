/* eslint-disable no-console */
require('dotenv').config();

const ForgeSDK = require('@arcblock/forge-sdk');

const { ensureModeratorSecretKey } = require('./util');
// eslint-disable-next-line no-unused-vars
const auth = require('../api/libs/auth');
const env = require('../api/libs/env');

(async () => {
  const sk = ensureModeratorSecretKey();
  const moderator = ForgeSDK.Wallet.fromSecretKey(sk);
  console.log('moderator', moderator.toAddress());

  // Transfer to application
  const hash = await ForgeSDK.transfer(
    {
      to: env.appId,
      token: 100000000,
      wallet: moderator,
    },
    { conn: env.chainId }
  );

  console.log(`application funded: ${hash}`);
})();
