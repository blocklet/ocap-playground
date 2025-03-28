const { verifyPresentation } = require('@arcblock/vc');

const { wallet, client } = require('../../libs/auth');
const { getCredentialList } = require('../../libs/nft');

module.exports = {
  action: 'vc-private-status',
  claims: {
    verifiableCredential: () => ({
      description: 'Please provide your endpoint test NFT',
      item: ['EndpointTestCredential'],
      trustedIssuers: [wallet.address],
      tag: '',
    }),
  },

  onAuth: async ({ claims, challenge, extraParams: { assetId, locale } }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    await verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });

    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];
    const vc = JSON.parse(vcArray[0]);

    const { state: asset } = await client.getAssetState({ address: assetId }, { ignoreFields: ['context'] });
    if (asset && asset.data && asset.data.typeUrl === 'vc') {
      return getCredentialList(asset, vc, locale);
    }

    return { error: 'Invalid endpoint-test-asset state' };
  },
};
