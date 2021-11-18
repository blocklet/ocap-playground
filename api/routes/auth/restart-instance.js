const { verifyPresentation } = require('@arcblock/vc');
const get = require('lodash/get');

const { wallet } = require('../../libs/auth');
const { inputs } = require('../../libs/factory');

module.exports = {
  action: 'restart-instance',
  claims: {
    verifiableCredential: () => ({
      description: 'Please provide your node ownership NFT',
      item: 'NodeOwnershipCredential',
      trustedIssuers: [wallet.address],
      tag: '',
    }),
  },

  onAuth: async ({ claims, challenge }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];

    verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });

    const vc = JSON.parse(vcArray[0]);

    if (get(vc, 'credentialSubject.isOwnerOf.abtnode.id') !== inputs.nodeOwner.nodeId) {
      throw new Error('Invalid node ownership credential');
    }
  },
};
