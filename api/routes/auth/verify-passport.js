const { verifyPresentation } = require('@arcblock/vc');

const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'verify-passport',
  claims: {
    verifiableCredential: () => {
      const item = ['PlaygroundFakePassport', 'NFTPassport'];
      const trustedIssuers = [wallet.address];

      return {
        description: 'Please provide your blocklet or node NFT',
        item,
        trustedIssuers,
        filters: [
          {
            type: item,
            trustedIssuers,
          },
        ],
      };
    },
  },
  onAuth: async ({ claims, challenge }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });

    let vc = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential[0]
      : presentation.verifiableCredential;

    vc = JSON.parse(vc);

    logger.info('verify passport', JSON.stringify(vc, null, 2));
  },
};
