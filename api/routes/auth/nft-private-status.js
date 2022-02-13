const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const { wallet, client } = require('../../libs/auth');
const { getCredentialList } = require('../../libs/nft');

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

    const { state: asset } = await client.getAssetState({ address: assetId }, { ignoreFields: ['context'] });
    if (asset && asset.data) {
      return getCredentialList(asset, null, locale);
    }

    return { error: 'Invalid endpoint-test-asset state' };
  },
};
