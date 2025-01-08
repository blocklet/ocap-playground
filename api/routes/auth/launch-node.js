const { verifyPresentation } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');
const { consumeNodePurchaseNFT } = require('../../libs/util');

module.exports = {
  action: 'launch-instance',
  claims: {
    verifiableCredential: () => ({
      description: 'Please provide your node purchase NFT',
      item: ['NodePurchaseCredential'],
      trustedIssuers: [wallet.address],
      tag: '',
    }),
  },

  onAuth: async ({ userDid, claims, challenge, extraParams: { assetId, locale } }) => {
    logger.info('launch-instance claims', { claims });
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];

    await verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });

    return consumeNodePurchaseNFT({ assetId, vc: JSON.parse(vcArray[0]), userDid, locale });
  },
};
