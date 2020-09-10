/* eslint-disable no-console */
require('dotenv').config();

const ForgeSDK = require('@arcblock/forge-sdk');
const { WalletType } = require('@arcblock/forge-wallet');
const { types } = require('@arcblock/mcrypto');

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
  const moderator = ForgeSDK.Wallet.fromSecretKey(sk, type);
  // console.log('moderator', moderator.toJSON());

  // Transfer to application
  const hash = await ForgeSDK.transfer(
    {
      to: env.appId,
      token: 10000,
      wallet: moderator,
    },
    { conn: env.assetChainId }
  );

  console.log(`application funded: ${hash}`);
})();
