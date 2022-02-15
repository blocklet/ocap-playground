const { factories } = require('../../libs/factory');
const { wallet, client } = require('../../libs/auth');
const { verifyAssetClaim } = require('../../libs/util');

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

    await verifyAssetClaim({ claim, challenge, trustedIssuers: [wallet.address], trustedParents: [factories.nftTest] });
  },
};
