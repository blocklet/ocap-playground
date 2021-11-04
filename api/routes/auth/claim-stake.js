/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { toStakeAddress } = require('@arcblock/did-util');

const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'claim-stake',

  claims: {
    signature: async ({ userPk, userDid, extraParams: { hash } }) => {
      return {
        type: 'ClaimStakeTx',
        data: {
          from: userDid,
          pk: userPk,
          itx: {
            address: toStakeAddress(userDid, wallet.address),
            evidence: { hash },
          },
        },
        description: 'Claim revoked stake',
      };
    },
  },

  onAuth: async ({ userDid, claims }) => {
    const claim = claims.find(x => x.type === 'signature');
    logger.info('claim-stake.auth.claim', claim);

    const tx = SDK.decodeTx(claim.origin);
    const user = fromAddress(userDid);

    const hash = await SDK.sendClaimStakeTx({
      tx,
      wallet: user,
      signature: claim.sig,
    });

    return { hash, tx };
  },
};
