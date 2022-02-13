const get = require('lodash/get');
const { verifyPresentation } = require('@arcblock/vc');

const { inputs, blockletDid } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'verify-nft',
  claims: {
    verifiableCredential: ({ extraParams: { type } }) => {
      if (type === 'node') {
        return {
          description: 'Please provide your node ownership NFT',
          item: ['NodeOwnershipCredential'],
          trustedIssuers: [wallet.address],
          tag: inputs.nodeOwner.nodeId,
        };
      }
      if (type === 'blocklet') {
        return {
          description: 'Please provide your blocklet purchase NFT',
          item: ['BlockletPurchaseCredential'],
          trustedIssuers: [wallet.address],
          tag: blockletDid,
        };
      }

      if (type === 'either') {
        return {
          description: 'Please provide your blocklet or node NFT',
          filters: [
            {
              type: ['BlockletPurchaseCredential'],
              trustedIssuers: [wallet.address],
              tag: blockletDid,
            },
            {
              type: ['NodeOwnershipCredential'],
              trustedIssuers: [wallet.address],
              tag: inputs.nodeOwner.nodeId,
            },
          ],
        };
      }

      throw new Error(`Unknown type ${type}`);
    },
  },
  onAuth: async ({ claims, challenge, extraParams: { type } }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];

    verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });

    const vc = JSON.parse(vcArray[0]);

    if (type === 'node') {
      if (get(vc, 'credentialSubject.isOwnerOf.abtnode.id') !== inputs.nodeOwner.nodeId) {
        throw new Error('Invalid node ownership credential');
      }
      return;
    }

    if (type === 'blocklet') {
      if (get(vc, 'credentialSubject.purchased.blocklet.id') !== blockletDid) {
        throw new Error('Invalid node ownership credential');
      }
      return;
    }

    throw new Error(`Unknown type ${type}`);
  },
};
