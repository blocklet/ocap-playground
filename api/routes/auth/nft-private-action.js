const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const { client, wallet } = require('../../libs/auth');

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

    return { successMessage: 'Private action successfully performed, now status/action list will be empty' };
  },
};
