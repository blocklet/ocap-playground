/* eslint-disable no-console */
const { types, Hasher } = require('@ocap/mcrypto');
const AES = require('@ocap/mcrypto/lib/crypter/aes').default;
const { fromSecretKey } = require('@ocap/wallet');
const { fromBase58, toBase58 } = require('@ocap/util');

const { User } = require('../../models');

module.exports = {
  action: 'derive-key-pair',
  claims: {
    keyPair: () => {
      return {
        mfa: true,
        description: 'Please generate a new key-pair',
        moniker: 'test-application',
        targetType: {
          role: 'application',
          hash: 'sha3',
          key: 'ed25519',
          encoding: 'base58',
        },
      };
    },
  },

  onAuth: async ({ claims, extraParams: { sessionDid } }) => {
    const claim = claims.find(x => x.type === 'keyPair');

    const app = fromSecretKey(fromBase58(claim.secret), {
      role: types.RoleType.ROLE_APPLICATION,
    });

    const password = Hasher.SHA3.hash256(Buffer.concat([claim.secret, app.address].map(fromBase58)));
    const user = await User.ensureOne({ did: sessionDid });

    user.generatedApps = [
      { address: app.address, publicKey: toBase58(app.publicKey), encrypted: AES.encrypt('playground', password) },
    ];
    await User.update(user);

    return {
      successMessage: `You have generated new app did: ${app.address}`,
    };
  },
};
