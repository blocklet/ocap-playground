const { verifyPresentation } = require('@arcblock/vc');
const joinUrl = require('url-join');

const { wallet } = require('../../libs/auth');
const env = require('../../libs/env');
const { consumeNodePurchaseNFT } = require('../../libs/util');

module.exports = {
  action: 'launch-service',
  claims: {
    acquireAbtnodeVc: [
      'verifiableCredential',
      () => {
        const endpoint = joinUrl(env.appUrl, '/api/did/acquire_asset/token?factory=nodePurchase');
        return {
          description: 'Please provide your node purchase NFT',
          item: ['NodePurchaseCredential', 'NodeOwnershipCredential', 'ABTNodePassport'],
          trustedIssuers: [{ did: wallet.address, endpoint }],
        };
      },
    ],
    acquireBlockletVc: [
      'verifiableCredential',
      () => {
        const endpoint = joinUrl(env.appUrl, '/api/did/acquire_asset/token?factory=blockletPurchase');

        return {
          description: 'Please provide your blocklet purchase NFT',
          item: ['BlockletPurchaseCredential'],
          trustedIssuers: [{ did: wallet.address, endpoint }],
        };
      },
    ],
  },

  onAuth: async ({ userDid, claims, challenge, extraParams: { locale } }) => {
    let credentials = claims.filter(x => x.type === 'verifiableCredential');
    if (claims.length !== 2) {
      throw new Error('Mismatch in number of claims, 2 claims required');
    }

    credentials = credentials.map(x => {
      x.presentation = JSON.parse(x.presentation);
      return x;
    });

    const blockletPurchaseCredential = claims.find(x => {
      const vc = JSON.parse(x.presentation.verifiableCredential[0]);
      return vc.type.includes('BlockletPurchaseCredential');
    });

    if (!blockletPurchaseCredential) {
      throw new Error('Blocklet purchase credential is required');
    }

    if (challenge !== blockletPurchaseCredential.presentation.challenge) {
      throw Error('Blocklet Purchase Verifiable credential presentation does not have correct challenge');
    }

    await verifyPresentation({
      presentation: blockletPurchaseCredential.presentation,
      trustedIssuers: [wallet.address],
      challenge,
    });

    const credential = credentials.find(x => {
      const vc = JSON.parse(x.presentation.verifiableCredential[0]);
      return (
        vc.type.includes('NodePurchaseCredential') ||
        vc.type.includes('NodeOwnershipCredential') ||
        vc.type.includes('ABTNodePassport')
      );
    });

    if (!credential) {
      throw new Error('One of NodePurchaseCredential, NodeOwnershipCredential, ABTNodePassport is required');
    }

    const nodePurchaseCredential = credentials.find(x => {
      const vc = JSON.parse(x.presentation.verifiableCredential[0]);
      return vc.type.includes('NodePurchaseCredential');
    });

    // 这里只对 NodePurchaseNFT 做处理, 忽略 NodeOwnershipCredential ABTNodePassport
    if (nodePurchaseCredential) {
      if (challenge !== nodePurchaseCredential.presentation.challenge) {
        throw Error('Node Purchase Verifiable credential presentation does not have correct challenge');
      }

      verifyPresentation({
        presentation: nodePurchaseCredential.presentation,
        trustedIssuers: [wallet.address],
        challenge,
      });

      await consumeNodePurchaseNFT({
        assetId: nodePurchaseCredential.assetDid,
        vc: JSON.parse(nodePurchaseCredential.presentation.verifiableCredential[0]),
        locale,
        userDid,
      });
    }

    logger.info('Launch abtnode and blocklet done');
  },
};
