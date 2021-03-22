/* eslint-disable no-console */
require('dotenv').config();

const SDK = require('@ocap/sdk');

const { ensureModeratorSecretKey } = require('./util');
// eslint-disable-next-line no-unused-vars
const auth = require('../api/libs/auth');
const env = require('../api/libs/env');

(async () => {
  const sk = ensureModeratorSecretKey();
  const moderator = SDK.Wallet.fromSecretKey(sk);
  console.log('moderator', moderator.toAddress());

  // Transfer to application
  const hash = await SDK.transfer({
    to: env.appId,
    token: 100000000,
    wallet: moderator,
  });

  console.log(`application funded: ${hash}`);
})();
