/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { fromTokenToUnit } = require('@ocap/util');

const { wallet } = require('../../libs/auth');

const txCreators = {
  TransferV2Tx: async ({ amount }) => ({
    type: 'TransferV2Tx',
    data: {
      itx: {
        to: wallet.address, // 设置为收款人的地址，比如发帖人的 did
        value: fromTokenToUnit(amount, 18),
      },
    },
    description: 'Transfer some token to application using delegation',
  }),
};

module.exports = {
  action: 'reward',

  claims: {
    signature: async ({ userPk, userDid, extraParams: { locale, amount } }) => {
      const claim = await txCreators.TransferV2Tx({ userPk, userDid, locale, amount });
      console.log(claim);
      return claim;
    },
  },

  onAuth: async ({ userDid, claims }) => {
    const claim = claims.find(x => x.type === 'signature');

    const tx = SDK.decodeTx(claim.origin);
    logger.info('reward.auth.tx', tx);

    tx.signature = claim.sig;
    if (claim.delegator) {
      tx.delegator = claim.delegator;
      tx.from = claim.from;
    }
    const hash = await SDK.sendTransferV2Tx({ tx, wallet: fromAddress(userDid) });

    // hash 就是交易凭据

    return { hash, tx: claim.origin };
  },
};
