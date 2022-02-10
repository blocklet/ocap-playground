const { verifyPresentation } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'nft-private-action',
  claims: {
    verifiableCredential: () => ({
      description: 'Please provide your endpoint test NFT',
      item: ['EndpointTestCredential'],
      trustedIssuers: [wallet.address],
      tag: '',
    }),
  },

  onAuth: async ({ claims, challenge }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });

    return { successMessage: 'Private action successfully performed, now status/action list will be empty' };
  },
};
