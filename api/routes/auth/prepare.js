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

const secondAddress = 'zNKqftHB7ibZkHrz6Gu37xJXHLKqH5TJYEgd';

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

    return {
      type: 'AcquireAssetV3Tx',
      description: 'Acquire asset from application using multiple inputs',
      partialTx: {
        from: userDid,
        pk: userPk,
        itx: {
          factory: inputFactories[input],
          address: preMint.address,
          inputs: [],
          owner: userDid,
          variables: Object.entries(preMint.variables).map(([key, value]) => ({ name: key, value })),
          issuer: preMint.issuer,
        },
      },
      requirement: {
        tokens: [{ address: env.localTokenId, value: state.input.value }]
          .concat(state.input.tokens)
          .filter(x => !!x.value),
      },
    };
  },

  // To complete this transaction, please claim tokens on faucet.abtnetwork.io
  TransferV3Tx: async () => {
    const token = await getTokenInfo();
    const amountPrimary = 11.1;
    const amountForeign = 22.2;
    const valuePrimary = fromTokenToUnit(amountPrimary, token.local.decimal).toString();
    const valueForeign = fromTokenToUnit(amountForeign, token.foreign.decimal).toString();
    const tokens = [
      { address: env.localTokenId, value: valuePrimary },
      { address: env.foreignTokenId, value: valueForeign },
    ];

    return {
      type: 'TransferV3Tx',
      partialTx: {
        itx: {
          inputs: [],
          outputs: [
            {
              // ?????? app
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

  TransferV3TxAsset: async () => {
    const token = await getTokenInfo();
    const amountPrimary = 11.1;
    const amountForeign = 22.2;
    const valuePrimary = fromTokenToUnit(amountPrimary, token.local.decimal).toString();
    const valueForeign = fromTokenToUnit(amountForeign, token.foreign.decimal).toString();
    const tokens = [
      { address: env.localTokenId, value: valuePrimary },
      { address: env.foreignTokenId, value: valueForeign },
    ];

    return {
      type: 'TransferV3Tx',
      partialTx: {
        itx: {
          inputs: [],
          outputs: [
            {
              // ?????? app
              owner: wallet.address,
              tokens,
            },
          ],
        },
      },
      requirement: {
        tokens,
        assets: {
          parent: [wallet.address],
          amount: 2,
        },
      },
      description: 'Complete this transaction using multiple tx inputs feature',
    };
  },

  TransferV3TxOutput: async () => {
    const token = await getTokenInfo();
    const valuePrimary = fromTokenToUnit(11.1, token.local.decimal).toString();
    const valueForeign = fromTokenToUnit(22.2, token.foreign.decimal).toString();
    const valueOnePrimary = fromTokenToUnit(1.04, token.local.decimal).toString();
    const valueOneForeign = fromTokenToUnit(20.1, token.foreign.decimal).toString();
    const valueTwoPrimary = fromTokenToUnit(10.06, token.local.decimal).toString();
    const valueTwoForeign = fromTokenToUnit(2.1, token.foreign.decimal).toString();

    const tokens = [
      { address: env.localTokenId, value: valuePrimary },
      { address: env.foreignTokenId, value: valueForeign },
    ];
    const outputOne = [
      { address: env.localTokenId, value: valueOnePrimary },
      { address: env.foreignTokenId, value: valueOneForeign },
    ];
    const outputTwo = [
      { address: env.localTokenId, value: valueTwoPrimary },
      { address: env.foreignTokenId, value: valueTwoForeign },
    ];

    return {
      type: 'TransferV3Tx',
      partialTx: {
        itx: {
          inputs: [],
          outputs: [
            {
              // ?????? app
              owner: wallet.address,
              tokens: outputOne,
            },
            {
              // ?????? Faucet
              owner: secondAddress,
              tokens: outputTwo,
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

    if (type === 'AcquireAssetV3Tx') {
      const hash = await SDK.sendAcquireAssetV3Tx({ tx, wallet: fromAddress(userDid) });
      return { hash, tx: claim.finalTx };
    }

    if (type.startsWith('TransferV3Tx')) {
      const hash = await SDK.sendTransferV3Tx({ tx, wallet: fromAddress(userDid) });
      return { hash, tx: claim.finalTx };
    }

    throw new Error(`${type} is not supported`);
  },
};
