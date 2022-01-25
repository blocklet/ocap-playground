/* eslint-disable no-console */
require('dotenv').config();

const { WalletType, fromSecretKey } = require('@ocap/wallet');
const { types } = require('@ocap/mcrypto');

const { ensureModeratorSecretKey } = require('./util');
// eslint-disable-next-line no-unused-vars
const auth = require('../api/libs/auth');
const env = require('../api/libs/env');

const type = WalletType({
  role: types.RoleType.ROLE_APPLICATION,
  pk: types.KeyType.ED25519,
  hash: types.HashType.SHA3,
});

(async () => {
  const sk = ensureModeratorSecretKey();
  const moderator = fromSecretKey(sk, type);
  // console.log('moderator', moderator.toJSON());

  // Transfer to application
  const hash = await auth.client.transfer({
    to: env.appId,
    token: 10000,
    wallet: moderator,
  });

  console.log(`application funded: ${hash}`);
})();
