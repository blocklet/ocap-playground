const { verifyPresentation } = require('@arcblock/vc');

const { blockletDid } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'test_vc_claim_filter',
  claims: {
    verifiableCredential: ({ extraParams: { type } }) => {
      if (type === 'old-online') {
        return {
          description: 'Please provide your node Blocklet Purchase NFT',
          item: ['BlockletPurchaseCredential'],
          trustedIssuers: [wallet.address],
          tag: blockletDid,
        };
      }

      if (type === 'old-offline') {
        return {
          description: 'Please provide your node Fake Passport',
          item: ['PlaygroundFakePassport'],
          trustedIssuers: [wallet.address],
        };
      }

      if (type === 'new-online') {
        return {
          description: 'Please provide your node Blocklet Purchase NFT',
          filters: [
            {
              type: ['BlockletPurchaseCredential'],
              trustedIssuers: [wallet.address],
              tag: blockletDid,
            },
          ],
        };
      }

      if (type === 'new-offline') {
        return {
          description: 'Please provide your node Fake Passport',
          filters: [
            {
              type: ['PlaygroundFakePassport'],
              trustedIssuers: [wallet.address],
            },
          ],
        };
      }

      if (type === 'mix-online') {
        return {
          description: 'Please provide your node Blocklet Purchas NFT',
          item: ['BlockletPurchaseCredential'],
          trustedIssuers: [wallet.address],
          tag: blockletDid,
          filters: [
            {
              type: ['BlockletPurchaseCredential'],
              trustedIssuers: [wallet.address],
              tag: blockletDid,
            },
          ],
        };
      }

      if (type === 'new-online-offline') {
        return {
          description: 'Please provide your Blocklet Purchase Credential and node Fake Passport',
          filters: [
            {
              type: ['BlockletPurchaseCredential'],
              trustedIssuers: [wallet.address],
              tag: blockletDid,
            },
            {
              type: ['PlaygroundFakePassport'],
              trustedIssuers: [wallet.address],
            },
          ],
        };
      }

      if (type === 'not-consumed-nft') {
        return {
          description: 'Please provide not consumed Server NFT',
          filters: [
            {
              type: ['NodePurchaseCredential'],
              trustedIssuers: [wallet.address],
              consumed: false,
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
            },
          ],
        };
      }

      throw new Error(`Unknown type ${type}`);
    },
  },
  onAuth: async ({ claims, challenge }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });
  },
};
