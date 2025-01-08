/* eslint-disable no-console */
const { toTypeInfo } = require('@arcblock/did');
const { types } = require('@ocap/mcrypto');
const { fromPublicKey } = require('@ocap/wallet');

const { wallet } = require('../../libs/auth');
const { getRandomMessage } = require('../../libs/util');
const { User } = require('../../models');

module.exports = {
  action: 'claim_create_did',
  authPrincipal: false, // disable default auth principal

  claims: [
    {
      authPrincipal: {
        description: 'Please generate a new application did',
        declareParams: {
          moniker: 'user_application',
          issuer: wallet.address,
        },
        targetType: {
          role: 'application',
          hash: 'sha3',
          key: 'ed25519',
        },
      },
    },
    {
      signature: () => {
        const params = {
          type: 'mime:text/plain',
          data: getRandomMessage(),
        };

        return Object.assign({ description: 'Please sign the text' }, params);
      },
    },
  ],

  // eslint-disable-next-line object-curly-newline
  onAuth: async ({ userDid, userPk, claims, extraParams: { sessionDid } }) => {
    const claim = claims.find(x => x.type === 'signature');
    logger.info('claim.create_did.onAuth', { userPk, userDid, claim });

    // 1. we need to ensure that the wallet is returning expected did type
    const type = toTypeInfo(userDid);
    if (type.role !== types.RoleType.ROLE_APPLICATION) {
      throw new Error('The created DID must be an application DID');
    }
    if (type.hash !== types.HashType.SHA3) {
      throw new Error('The created DID must use SHA3 256');
    }
    if (type.pk !== types.KeyType.ED25519) {
      throw new Error('The created DID must use ED25519');
    }

    // 3. we need to ensure that the did has the same signature
    const w = fromPublicKey(userPk, type);
    if ((await w.verify(claim.origin, claim.sig)) === false) {
      throw new Error('签名错误');
    }

    // 4. save generated did to user session store
    const user = await User.ensureOne({ did: sessionDid });
    user.extraDid = [userDid].concat(Array.isArray(user.extraDid) ? user.extraDid : []);
    await User.update(user);
  },
};
