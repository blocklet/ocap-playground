const { verifyPresentation } = require('@arcblock/vc');
const { fromPublicKey } = require('@ocap/wallet');
const { blockletDid } = require('../../libs/factory');
const { verifyAssetClaim } = require('../../libs/util');
const { wallet } = require('../../libs/auth');

const validateAgentProof = (claim, timestamp, userPk) => {
  if (!claim.agentProof) {
    throw new Error('agent proof is empty');
  }

  if (timestamp < Math.ceil(Date.now() / 1000) - 5 * 60) {
    throw new Error('agent proof is expired: ttl is 5 minutes');
  }

  if (claim.type === 'asset') {
    const signer = fromPublicKey(claim.ownerPk);
    if (!signer.verify([wallet.address, timestamp].join(','), claim.agentProof)) {
      throw new Error('agent proof is invalid for asset');
    }
  }

  if (claim.type === 'verifiableCredential') {
    const signer = fromPublicKey(userPk);
    if (!signer.verify([wallet.address, timestamp].join(','), claim.agentProof)) {
      throw new Error('agent proof is invalid for vc');
    }
  }
};

module.exports = {
  action: 'test_nft_or_vc_filter',
  claims: {
    assetOrVC: () => {
      return {
        description: 'Please provide NFT or VC to continue',
        filters: [
          {
            type: ['NodePurchaseCredential'],
            trustedIssuers: [wallet.address],
            consumed: false,
          },
          {
            type: ['BlockletPurchaseCredential'],
            trustedIssuers: [wallet.address],
            tag: blockletDid,
          },
        ],
      };
    },
  },
  onAuth: async ({ claims, userPk, challenge, timestamp }) => {
    const asset = claims.find(x => x.type === 'asset');
    const vc = claims.find(x => x.type === 'verifiableCredential');

    if (!asset && !vc) {
      throw new Error('Neither NFT nor VC is provided');
    }

    if (asset) {
      logger.info('claim.assetOrVC.onAuth.asset', asset);

      validateAgentProof(asset, timestamp, userPk);

      const assetState = await verifyAssetClaim({ claim: asset, challenge });
      return { successMessage: `You provided asset: ${assetState.address}` };
    }

    if (vc) {
      logger.info('claim.assetOrVC.onAuth.vc', vc);

      validateAgentProof(vc, timestamp, userPk);

      const presentation = JSON.parse(vc.presentation);
      if (challenge !== presentation.challenge) {
        throw Error('Verifiable credential presentation does not have correct challenge');
      }

      verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });
      return { successMessage: 'You provided vc' };
    }
  },
};
