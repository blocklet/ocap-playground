/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { fromAddress } = require('@ocap/wallet');
const { preMintFromFactory } = require('@ocap/asset');

const { formatFactoryState, factories, inputs } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');

const app = SDK.Wallet.fromJSON(wallet);

module.exports = {
  action: 'acquire_asset',
  claims: {
    signature: async ({ userPk, userDid, extraParams: { factory } }) => {
      if (!factories[factory]) {
        throw new Error('Asset factory is not in whitelist');
      }

      const { state } = await SDK.getFactoryState({ address: factories[factory] });
      if (!state) {
        throw new Error('Asset factory does not exist on chain');
      }

      const preMint = preMintFromFactory({
        factory: formatFactoryState(state),
        inputs: inputs[factory],
        owner: userDid,
        issuer: { wallet: app, name: 'ocap-playground' }, // NOTE: using moniker must be enforced to make mint work
      });

      logger.info('preMint', { factory, preMint });

      return {
        type: 'AcquireAssetV2Tx',
        data: {
          // The tx must from user
          from: userDid,
          pk: userPk,
          itx: {
            factory: factories[factory],
            address: preMint.address,
            assets: [],
            variables: Object.entries(preMint.variables).map(([key, value]) => ({ name: key, value })),
            issuer: preMint.issuer,
          },
        },
      };
    },
  },
  onAuth: async ({ claims, userDid }) => {
    const claim = claims.find(x => x.type === 'signature');
    logger.info('acquire.auth.claim', claim);

    const tx = SDK.decodeTx(claim.origin);
    tx.signature = claim.sig;

    logger.info('acquire.auth.tx', tx);
    const hash = await SDK.sendAcquireAssetV2Tx({ tx, wallet: fromAddress(userDid) });
    logger.info('hash:', hash);
    return { hash, tx: claim.origin };
  },
};
