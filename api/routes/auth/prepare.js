/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { fromTokenToUnit } = require('@ocap/util');
const { preMintFromFactory } = require('@ocap/asset');

const env = require('../../libs/env');
const { wallet } = require('../../libs/auth');
const { getTokenInfo } = require('../../libs/util');
const { formatFactoryState, factories, inputs } = require('../../libs/factory');

const app = SDK.Wallet.fromJSON(wallet);

const txCreators = {
  AcquireAssetV3Tx: async ({ userDid, userPk, input }) => {
    const inputFactories = {
      local: factories.endpointTest,
      foreign: factories.blockletPurchase,
      both: factories.tokenInputTest,
    };
    const { state } = await SDK.getFactoryState({ address: inputFactories[input] });
    if (!state) {
      throw new Error('Asset factory does not exist on chain');
    }

    const preMint = preMintFromFactory({
      factory: formatFactoryState(state),
      inputs: inputs.blockletPurchase,
      owner: userDid,
      issuer: { wallet: app, name: 'ocap-playground' }, // NOTE: using moniker must be enforced to make mint work
    });

    logger.info('preMint', preMint);

    return {
      type: 'AcquireAssetV3Tx',
      description: 'Acquire asset from application using delegation',
      data: {
        // The tx must from user
        from: userDid,
        pk: userPk,
        itx: {
          factory: inputFactories[input],
          address: preMint.address,
          assets: [],
          variables: Object.entries(preMint.variables).map(([key, value]) => ({ name: key, value })),
          issuer: preMint.issuer,
        },
      },
    };
  },

  // To complete this transaction, please claim tokens on faucet.abtnetwork.io
  TransferV3Tx: async () => {
    const token = await getTokenInfo();
    const amount = (Math.random() * 50 + 1).toFixed(6);
    const value = fromTokenToUnit(amount, token.foreign.decimal).toString();
    const tokens = [
      { address: '', value },
      { address: env.tokenId, value },
    ];

    return {
      type: 'TransferV3Tx',
      partialTx: {
        itx: {
          inputs: [],
          outputs: [
            {
              // 转给 app
              owner: wallet.address,
              tokens,
            },
          ],
        },
      },
      requirement: {
        tokens,
      },
      description: 'Complete this transaction using multiple tx inputs feature',
    };
  },
};

module.exports = {
  action: 'prepare',

  claims: {
    prepareTx: async ({ userPk, userDid, extraParams: { type, locale, input } }) => {
      if (!txCreators[type]) {
        throw new Error(`${type} is not supported`);
      }

      const claim = await txCreators[type]({ userPk, userDid, locale, input });
      return claim;
    },
  },

  onAuth: async ({ userDid, claims, extraParams: { type } }) => {
    const claim = claims.find(x => x.type === 'prepareTx');
    logger.info('prepare.auth.claim', claim);
    if (!claim.finalTx) {
      throw new Error('claim.finalTx must be set to continue');
    }

    const tx = SDK.decodeTx(claim.finalTx);
    logger.info('acquire.auth.tx', tx);

    if (type === 'AcquireAssetV3Tx') {
      const hash = await SDK.sendAcquireAssetV3Tx({ tx, wallet: fromAddress(userDid) });
      return { hash, tx: claim.finalTx };
    }

    if (type === 'TransferV3Tx') {
      const hash = await SDK.sendTransferV3Tx({ tx, wallet: fromAddress(userDid) });
      return { hash, tx: claim.finalTx };
    }

    throw new Error(`${type} is not supported`);
  },
};
