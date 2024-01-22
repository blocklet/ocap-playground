const { fromPublicKey } = require('@ocap/wallet');
const { toAddress, fromBase58, toBuffer } = require('@ocap/util');
const { toTypeInfo } = require('@arcblock/did');
const { verifyAssetClaim } = require('../../libs/util');
const { wallet } = require('../../libs/auth');

const validateAgentProof = claim => {
  const ownerDid = toAddress(claim.ownerDid);
  const ownerPk = fromBase58(claim.ownerPk);
  if (!claim.agentProof) {
    throw new Error('agent proof is empty');
  }

  if (typeof claim.agentProof === 'string') {
    claim.agentProof = JSON.parse(claim.agentProof);
  }

  logger.info('claim.agentProof.nonce', claim.agentProof.nonce);
  logger.info('claim.agentProof.signature', claim.agentProof.signature);

  const { nonce } = claim.agentProof;
  if (nonce < Math.ceil(Date.now() / 1000) - 5 * 60) {
    throw new Error('agent proof is expired: ttl is 5 minutes');
  }

  const message = Buffer.concat([toBuffer(nonce.toString()), toBuffer(wallet.address)]);
  const signer = fromPublicKey(ownerPk, toTypeInfo(ownerDid));
  const signature = fromBase58(claim.agentProof.signature);

  if (claim.type === 'asset') {
    if (!signer.verify(message, signature)) {
      throw new Error('agent proof is invalid for asset');
    }
  }

  if (claim.type === 'verifiableCredential') {
    if (!signer.verify(message, signature)) {
      throw new Error('agent proof is invalid for vc');
    }
  }
};

module.exports = {
  action: 'test_nft_or_vc_filter_only_did_spaces',
  claims: {
    assetOrVC: () => {
      return {
        description: "Please provide DID Spaces's NFT or VC to continue",
        optional: false,
        filters: [
          {
            tag: 'did-space-purchase-nft', // 用于筛选 NFT
          },
          {
            type: ['PersonalSpaceVerifiableCredential', 'EnterpriseSpaceVerifiableCredential'], // 用于筛选 VC
          },
        ],
        meta: {
          purpose: 'DidSpace',
        },
      };
    },
  },
  // eslint-disable-next-line consistent-return
  onAuth: async ({ claims, challenge }) => {
    const asset = claims.find(x => x.type === 'asset' && x.meta.purpose === 'DidSpace');
    const vc = claims.find(x => x.type === 'verifiableCredential' && x.meta.purpose === 'DidSpace');

    if (!asset && !vc) {
      throw new Error('Neither NFT nor VC is provided');
    }

    if (asset) {
      logger.info('claim.assetOrVC.onAuth.asset', asset);

      validateAgentProof(asset, challenge);

      const assetState = await verifyAssetClaim({ claim: asset, challenge });
      return { successMessage: `You provided asset: ${assetState.address}` };
    }

    if (vc) {
      logger.info('claim.assetOrVC.onAuth.vc', vc);

      validateAgentProof(vc, challenge);

      const presentation = JSON.parse(vc.presentation);
      if (challenge !== presentation.challenge) {
        throw Error('Verifiable credential presentation does not have correct challenge');
      }

      return { successMessage: 'You provided vc' };
    }
  },
};
