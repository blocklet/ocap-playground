const { factories } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');
const { verifyAssetClaim } = require('../../libs/util');

module.exports = {
  action: 'nft-private-action',
  claims: {
    asset: ({ extraParams: { assetId } }) => ({
      description: 'Please provide your test NFT',
      filters: [
        {
          address: assetId,
          trustedIssuers: [wallet.address],
          tag: 'TestNFT',
        },
      ],
    }),
  },

  onAuth: async ({ claims, challenge }) => {
    const claim = claims.find(x => x.type === 'asset');
    logger.info('claim.nft-private-action.onAuth', { claim });

    await verifyAssetClaim({
      claim,
      challenge,
      trustedIssuers: [wallet.address],
      trustedParents: [factories.nftTest],
    });

    return { successMessage: 'Private action successfully performed, now status/action list will be empty' };
  },
};
