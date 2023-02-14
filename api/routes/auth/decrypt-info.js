const AES = require('@ocap/mcrypto/lib/crypter/aes').default;
const assert = require('assert');
const { fromBase58 } = require('@ocap/util');

const { User } = require('../../models');

module.exports = {
  action: 'decrypt-info',
  claims: {
    encryptionKey: async ({ extraParams: { sessionDid } }) => {
      const user = await User.ensureOne({ did: sessionDid });
      const [app] = user.generatedApps;
      assert(app, 'You must generate an application account first');
      assert(app.delegation, 'You must sign delegation before retrieve encryption key');

      return {
        type: 'encryptionKey',
        description: 'Please derive encryptionKey',
        salt: app.address,
        delegation: app.delegation,
      };
    },
  },

  onAuth: async ({ claims, extraParams: { sessionDid } }) => {
    const user = await User.ensureOne({ did: sessionDid });
    const [app] = user.generatedApps;
    assert(app, 'You must generate an application account first');
    assert(app.delegation, 'You must sign delegation before retrieve encryption key');

    const claim = claims.find(x => x.type === 'encryptionKey');
    const password = fromBase58(claim.key);

    const decrypted = AES.decrypt(app.encrypted, password, 'buffer').toString('utf8');
    assert(decrypted === 'playground', 'Failed to decrypt');

    return {
      successMessage: 'Your provided encryption key is correct',
    };
  },
};
