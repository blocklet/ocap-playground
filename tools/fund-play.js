/* eslint-disable no-console */
require('dotenv').config();

const { fromSecretKey } = require('@ocap/wallet');
const { ensureModeratorSecretKey } = require('./util');
// eslint-disable-next-line no-unused-vars
const auth = require('../api/libs/auth');
const env = require('../api/libs/env');

(async () => {
  const sk = ensureModeratorSecretKey();
  const moderator = fromSecretKey(sk);
  console.log('moderator', moderator.address);

  // Transfer to application
  const hash = await auth.client.transfer({
    to: env.appId,
    token: 100000000,
    wallet: moderator,
  });

  console.log(`application funded: ${hash}`);
})();
