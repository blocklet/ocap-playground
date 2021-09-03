/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { toStakeAddress } = require('@arcblock/did-util');
const { fromTokenToUnit } = require('@ocap/util');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');

const txCreators = {
  StakeLocalToken: async ({ userDid, userPk }) => {
    const token = await getTokenInfo();
    const amount = 21.1;
    const tokens = [{ address: env.localTokenId, value: fromTokenToUnit(amount, token.local.decimal).toString() }];

    return {
      type: 'StakeTx',
      partialTx: {
        from: userDid,
        pk: userPk,
        itx: {
          address: toStakeAddress(userDid, wallet.address),
          receiver: wallet.address,
          inputs: [],
        },
        signatures: [],
      },
      requirement: {
        tokens,
      },
      description: `Stake ${amount} token`,
    };
  },
  StakeForeignToken: async ({ userDid, userPk }) => {
    const token = await getTokenInfo();
    const amount = 12.3;
    const tokens = [{ address: env.foreignTokenId, value: fromTokenToUnit(amount, token.foreign.decimal).toString() }];

    return {
      type: 'StakeTx',
      partialTx: {
        from: userDid,
        pk: userPk,
        itx: {
          address: toStakeAddress(userDid, wallet.address),
          receiver: wallet.address,
          inputs: [],
        },
        signatures: [],
      },
      requirement: {
        tokens,
      },
      description: `Stake ${amount} token`,
    };
  },
  StakeNFT: async ({ userDid, userPk }) => {
    return {
      type: 'StakeTx',
      partialTx: {
        from: userDid,
        pk: userPk,
        itx: {
          address: toStakeAddress(userDid, wallet.address),
          receiver: wallet.address,
          inputs: [],
        },
        signatures: [],
      },
      requirement: {
        assets: {
          parent: [
            'z3CtJ9VMsXEYKNiUCJmXXG6d5baVbKoNV26Pm',
            'z3Ct5EzXRzJYyY1z2bEfpSAA3zWbfYtk4cWP1',
            'z3Ct7M59EvbbkXwkpiqdxoGE58C1BQCLKvQZ3',
            'z3Ct9pnuFXyhFn6EKNgj4scxbACTCDSEEfB48',
          ],
          amount: 1,
        },
      },
      description: 'Stake NFT',
    };
  },
};

module.exports = {
  action: 'stake',

  claims: {
    prepareTx: async ({ userPk, userDid, extraParams: { type, locale } }) => {
      const claim = await txCreators[type]({ userPk, userDid, locale });
      return claim;
    },
  },

  onAuth: async ({ userDid, claims }) => {
    const claim = claims.find(x => x.type === 'prepareTx');
    logger.info('stake.auth.claim', claim);
    if (!claim.finalTx) {
      throw new Error('claim.finalTx must be set to continue');
    }

    const tx = SDK.decodeTx(claim.finalTx);

    const hash = await SDK.sendStakeTx({ tx, wallet: fromAddress(userDid) });
    return { hash, tx: claim.finalTx };
  },
};
