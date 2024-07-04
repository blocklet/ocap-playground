/* eslint-disable no-console */
const { fromAddress } = require('@ocap/wallet');
const { toStakeAddress } = require('@arcblock/did-util');
const { fromTokenToUnit } = require('@ocap/util');

const env = require('../../libs/env');
const { wallet, client } = require('../../libs/auth');
const { getTokenInfo, pickGasPayerHeaders } = require('../../libs/util');

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
          slashers: [wallet.address],
          revokeWaitingPeriod: 30,
          message: 'ocap playground test: local',
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
  StakeRandomTokenWithNonce: async ({ userDid, userPk }) => {
    const token = await getTokenInfo();
    const amount = (Math.random() * 3).toFixed(6);
    const tokens = [{ address: env.localTokenId, value: fromTokenToUnit(amount, token.local.decimal).toString() }];
    const nonce = Math.floor(Math.random() * 1000000).toString();

    return {
      type: 'StakeTx',
      partialTx: {
        from: userDid,
        pk: userPk,
        itx: {
          address: toStakeAddress(userDid, wallet.address, nonce),
          receiver: wallet.address,
          slashers: [wallet.address],
          revokeWaitingPeriod: 30,
          message: 'ocap playground test: local',
          inputs: [],
          nonce,
        },
        signatures: [],
      },
      requirement: {
        tokens,
      },
      description: `Stake ${amount} token with nonce ${nonce}`,
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
          slashers: [wallet.address],
          revokeWaitingPeriod: 30,
          message: 'ocap playground test: foreign',
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
          slashers: [wallet.address],
          revokeWaitingPeriod: 30,
          message: 'ocap playground test: nft',
          inputs: [],
        },
        signatures: [],
      },
      requirement: {
        assets: {
          parent: [
            'z3CtMVWsnBAMmU941LGo5eRokLxfAcNZ3p2p1',
            'z3Ct6eubBZzbK1pETFkVn9DBkE6f9MbBwTPNe',
            'z3CtM4ZCQHrFaD7pToh5eeAnGDZtaX9uHURpn',
            'z3CtFBjdmcBSQYmmVoWDbMh43PmsxJUKtEhKB',
          ],
          amount: 1,
        },
        tokens: [],
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

  onAuth: async ({ req, userDid, claims }) => {
    const claim = claims.find(x => x.type === 'prepareTx');
    logger.info('stake.auth.claim', claim);
    if (!claim.finalTx) {
      throw new Error('claim.finalTx must be set to continue');
    }

    const tx = client.decodeTx(claim.finalTx);

    const hash = await client.sendStakeTx({ tx, wallet: fromAddress(userDid) }, pickGasPayerHeaders(req));
    return { hash, tx: claim.finalTx };
  },
};
