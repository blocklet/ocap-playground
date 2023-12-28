const joinUrl = require('url-join');

const env = require('../../libs/env');
const { verifyAssetClaim } = require('../../libs/util');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'test_nft_claim_filter',
  claims: {
    asset: ({ extraParams: { type } }) => {
      if (type === 'not-consumed-nft') {
        return {
          description: 'Please provide not consumed Server NFT',
          filters: [
            {
              type: ['NodePurchaseCredential'],
              trustedIssuers: [wallet.address],
              consumed: false,
              acquireUrl: joinUrl(env.appUrl, '/acquire/server'),
            },
          ],
        };
      }

      if (type === 'consumed-nft') {
        return {
          description: 'Please provide consumed Server NFT',
          filters: [
            {
              type: ['NodePurchaseCredential'],
              trustedIssuers: [wallet.address],
              consumed: true,
              acquireUrl: joinUrl(env.appUrl, '/acquire/server'),
            },
          ],
        };
      }

      if (type === 'either-nft-or-vc') {
        return {
          description: 'Please provide not consumed Server NFT',
          filters: [
            {
              type: ['NodePurchaseCredential'],
              trustedIssuers: [wallet.address],
              consumed: false,
              acquireUrl: joinUrl(env.appUrl, '/acquire/server'),
            },
          ],
        };
      }

      throw new Error(`Unknown type ${type}`);
    },
  },
  onAuth: async ({ claims, challenge }) => {
    const claim = claims.find(x => x.type === 'asset');
    logger.info('claim.claim-asset.onAuth', claim);
    const assetState = await verifyAssetClaim({ claim, challenge });
    return { successMessage: `You provided asset with tag: ${assetState.tags.join(',')}` };
  },
};
