/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { toStakeAddress } = require('@arcblock/did-util');
const { fromTokenToUnit } = require('@ocap/util');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');

const txCreators = {
  RevokeLocalToken: async ({ userDid, userPk }) => {
    const token = await getTokenInfo();
    const amount = 5.275;
    const tokens = [{ address: env.localTokenId, value: fromTokenToUnit(amount, token.local.decimal).toString() }];

    return {
      type: 'RevokeStakeTx',
      data: {
        from: userDid,
        pk: userPk,
        itx: {
          address: toStakeAddress(userDid, wallet.address),
          outputs: [
            {
              owner: userDid,
              tokens,
            },
          ],
        },
      },
      description: 'Revoke staked token',
    };
  },
};

module.exports = {
  action: 'revoke-stake',

  claims: {
    signature: async ({ userPk, userDid, extraParams: { type, locale } }) => {
      const claim = await txCreators[type]({ userPk, userDid, locale });
      return claim;
    },
  },

  onAuth: async ({ userDid, claims }) => {
    const claim = claims.find(x => x.type === 'signature');
    logger.info('prepare.auth.claim', claim);
    if (!claim.finalTx) {
      throw new Error('claim.finalTx must be set to continue');
    }

    const tx = SDK.decodeTx(claim.finalTx);

    const hash = await SDK.sendRevokeStakeTx({ tx, wallet: fromAddress(userDid) });
    return { hash, tx: claim.finalTx };
  },
};
