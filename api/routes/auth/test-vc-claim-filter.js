const { verifyPresentation } = require('@arcblock/vc');

const { blockletDid } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'test_vc_claim_filter',
  claims: {
    verifiableCredential: ({ extraParams: { type } }) => {
      if (type === 'old') {
        return {
          description: 'Please provide your node Blocklet Purchase NFT',
          item: ['BlockletPurchaseCredential'],
          trustedIssuers: [wallet.address],
          tag: blockletDid,
        };
      }

      if (type === 'new') {
        return {
          description: 'Please provide your node Blocklet Purchas NFT',
          filters: [
            {
              type: ['BlockletPurchaseCredential'],
              trustedIssuers: [wallet.address],
              tag: blockletDid,
            },
          ],
        };
      }

      if (type === 'mix') {
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

      if (type === 'off-line') {
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

      if (type === 'mix-online-off-line') {
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
