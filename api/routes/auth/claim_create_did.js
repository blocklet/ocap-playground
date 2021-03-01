/* eslint-disable no-console */
const ForgeSDK = require('@arcblock/forge-sdk');
const { toTypeInfo } = require('@arcblock/did');
const { types } = require('@arcblock/mcrypto');

const { wallet } = require('../../libs/auth');
const { getAccountStateOptions, getRandomMessage } = require('../../libs/util');
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
  onAuth: async ({ userDid, userPk, sessionDid, claims }) => {
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

    // 2. we need to ensure that the did is declared onchain
    const { state } = await ForgeSDK.getAccountState({ address: userDid }, getAccountStateOptions);
    if (!state) {
      throw new Error('The created DID is not created on chain as required');
    }
    // Disable this check for now
    // if (state.issuer !== wallet.address) {
    //   throw new Error('The created DID does not belong to expected issuer');
    // }

    // 3. we need to ensure that the did has the same signature
    const w = ForgeSDK.Wallet.fromPublicKey(userPk, type);
    if (w.verify(claim.origin, claim.sig) === false) {
      throw new Error('签名错误');
    }

    // 4. save generated did to user session store
    const user = await User.ensureOne({ did: sessionDid });
    user.extraDid = [userDid].concat(Array.isArray(user.extraDid) ? user.extraDid : []);
    await User.update(user);
  },
};
