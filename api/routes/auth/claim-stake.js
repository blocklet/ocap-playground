/* eslint-disable no-console */
const { fromAddress } = require('@ocap/wallet');
const { toStakeAddress } = require('@arcblock/did-util');

const { wallet, client } = require('../../libs/auth');
const { pickGasStakeHeaders } = require('../../libs/util');

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

  onAuth: async ({ req, userDid, claims }) => {
    const claim = claims.find(x => x.type === 'signature');
    logger.info('claim-stake.auth.claim', claim);

    const tx = client.decodeTx(claim.origin);
    const user = fromAddress(userDid);

    const hash = await client.sendClaimStakeTx(
      {
        tx,
        wallet: user,
        signature: claim.sig,
      },
      pickGasStakeHeaders(req)
    );

    return { hash, tx };
  },
};
