const { toTypeInfo } = require('@arcblock/did');
const { fromPublicKey } = require('@ocap/wallet');

const { factories } = require('../../libs/factory');
const { wallet, client } = require('../../libs/auth');

module.exports = {
  action: 'claim_asset',
  claims: {
    asset: () => ({
      description: 'Please provide asset and prove ownership',
      trustedFactories: [factories.nftTest],
      trustedIssuers: [wallet.address],
      tag: ['TestNFT'],
    }),
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
