const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const { factories } = require('../../libs/factory');
const { wallet, client } = require('../../libs/auth');

module.exports = {
  action: 'claim_asset',
  claims: {
    asset: async ({ userDid, extraParams: { type } }) => {
      if (type === 'legacy') {
        return {
          description: 'Please provide asset and prove ownership',
          trustedParents: [factories.nftTest],
          trustedIssuers: [wallet.address],
          tag: 'TestNFT',
        };
      }

      if (type === 'either') {
        const {
          transactions: [tx],
        } = await client.listTransactions({
          accountFilter: { accounts: [userDid] },
          typeFilter: { types: ['create_asset'] },
          validityFilter: { validity: 'VALID' },
        });

        return {
          description: 'Please provide asset and prove ownership',
          filters: [
            {
              trustedParents: [factories.nftTest],
              trustedIssuers: [wallet.address],
              tag: 'TestNFT',
            },
            {
              tag: 'NFTCreatedByMe',
            },
            tx
              ? {
                  address: tx.tx.itxJson.address,
                }
              : null,
          ].filter(Boolean),
        };
      }

      throw new Error(`Unknown type ${type}`);
    },
  },

  onAuth: async ({ userDid, userPk, challenge, claims }) => {
    const claim = claims.find(x => x.type === 'asset');
    logger.info('claim.claim-asset.onAuth', { userPk, userDid, claim });

    const { state: assetState } = await client.getAssetState({ address: claim.asset });
    if (!assetState) {
      throw new Error('Asset does not exist on chain');
    }

    const { state: ownerState } = await client.getAccountState({ address: assetState.owner });
    if (!ownerState) {
      throw new Error('Owner does not exist on chain');
    }

    const type = toTypeInfo(ownerState.address);
    const owner = fromPublicKey(ownerState.pk, type);
    if (owner.verify(challenge, claim.proof) === false) {
      throw new Error('Asset owner proof is not valid');
    }
  },
};
