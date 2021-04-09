const SDK = require('@ocap/sdk');
const { fromJSON } = require('@ocap/wallet');
const { verifyPresentation } = require('@arcblock/vc');
const { preMintFromFactory } = require('@ocap/asset');

const { formatFactoryState, factories, inputs } = require('../../libs/factory');
const { wallet } = require('../../libs/auth');

module.exports = {
  action: 'launch-instance',
  claims: {
    verifiableCredential: () => ({
      description: 'Please provide your node purchase NFT',
      item: 'NodePurchaseCredential',
      trustedIssuers: [wallet.address],
      tag: '',
    }),
  },

  onAuth: async ({ userDid, claims, challenge }) => {
    const presentation = JSON.parse(claims.find(x => x.type === 'verifiableCredential').presentation);
    if (challenge !== presentation.challenge) {
      throw Error('Verifiable credential presentation does not have correct challenge');
    }

    const vcArray = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential
      : [presentation.verifiableCredential];

    verifyPresentation({ presentation, trustedIssuers: [wallet.address], challenge });

    const vc = JSON.parse(vcArray[0]);
    const app = fromJSON(wallet);

    const { state } = await SDK.getFactoryState({ address: factories.nodeOwner });
    if (!state) {
      throw new Error('Asset factory does not exist on chain');
    }

    const preMint = preMintFromFactory({
      factory: formatFactoryState(state),
      inputs: { ...inputs.nodeOwner, purchaseId: vc.id, purchaseIssueId: vc.issuer.id },
      owner: userDid,
      issuer: { wallet: app, name: 'ocap-playground' },
    });

    logger.info('preMint', preMint);

    const itx = {
      factory: factories.nodeOwner,
      address: preMint.address,
      assets: [],
      variables: Object.entries(preMint.variables).map(([key, value]) => ({ name: key, value })),
      issuer: preMint.issuer,
      owner: userDid,
    };

    const hash = await SDK.sendMintAssetTx({ tx: { itx }, wallet: app });
    logger.info('minted', hash);

    return { hash };
  },
};
