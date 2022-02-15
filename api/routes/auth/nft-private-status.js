const { factories } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');
const { getCredentialList } = require('../../libs/nft');
const { verifyAssetClaim } = require('../../libs/util');

module.exports = {
  action: 'nft-private-status',
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

  onAuth: async ({ claims, challenge, extraParams: { assetId, locale } }) => {
    const claim = claims.find(x => x.type === 'asset');
    logger.info('claim.nft-private-status.onAuth', { assetId, claim });

    const assetState = await verifyAssetClaim({
      claim,
      challenge,
      trustedIssuers: [wallet.address],
      trustedParents: [factories.nftTest],
    });

    return getCredentialList(assetState, null, locale);
  },
};
