/* eslint-disable no-console */
const SDK = require('@ocap/sdk');
const { decodeAny } = require('@ocap/message');
const { fromAddress } = require('@ocap/wallet');
const { preMintFromFactory } = require('@ocap/asset');

const { formatFactoryState, factories, inputs } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');
const { create } = require('../../libs/nft/display');

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

      const vc = preMint.asset.data.value;
      const display = {
        type: 'svg',
        content: create(vc, {
          owner: userDid,
          issuer: 'ocap-playground',
          description: state.description,
          date: vc.issuanceDate,
        }),
      };

      return {
        type: 'AcquireAssetV2Tx',
        display: JSON.stringify(display), // Since the asset is not minted yet, we need to tell ABT Wallet how to display it
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

    // return the nft(vc) if exists
    try {
      const { address } = decodeAny(tx.itx).value;
      const { state } = await SDK.getAssetState({ address }, { ignoreFields: ['context'] });
      if (state && state.data && state.data.typeUrl === 'vc') {
        const vc = JSON.parse(state.data.value);
        logger.error('acquire.auth.vc', vc);
        return {
          disposition: 'attachment',
          type: 'VerifiableCredential',
          data: vc,
          tag: address,
          assetId: address,
          hash,
          tx: claim.origin,
        };
      }
    } catch (err) {
      logger.error('acquire.auth.asset.error', err);
    }

    return { hash, tx: claim.origin };
  },
};
